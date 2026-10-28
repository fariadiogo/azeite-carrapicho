#!/usr/bin/env python3
"""
Olive-branch QR code generator.

Makes a monochrome QR code with round dots, rounded-square corner markers and an
olive branch in the centre. Dots that would touch the branch are removed; the
code's highest error-correction level (H, ~30%) rebuilds them when scanned.

Setup (Python 3.9+):
    pip install segno cairosvg numpy scipy pillow
    # optional, for --check:
    pip install zxing-cpp

Usage (--url and --out are required):
    python olive_qr.py --url HTTPS://EXAMPLE.COM --out example_qr
    python olive_qr.py --url HTTPS://EXAMPLE.COM --out example_qr --branch 11 --ink "#2F4A1E" --bg "#F7F2E3" --check

Outputs <out>.svg (vector, for print) and <out>.png.

Tips:
  * Write the URL in CAPITALS: QR's compact alphanumeric mode gives a smaller grid
    with bigger dots. Domains are case-insensitive; paths after the domain may not be.
  * Keep --branch at or below ~12.5 for a 29x29 code. Bigger risks scan failures.
  * Always test-scan the final file with a few real phones at the printed size.
"""
import argparse
import io
import math

import cairosvg
import numpy as np
import segno
from PIL import Image
from scipy.ndimage import distance_transform_edt

S = 20      # SVG units per module (one QR square)
QUIET = 4   # blank border, in modules (QR standard minimum)
DOT = 0.46  # dot radius, in modules


def rrect(x, y, w, h, r):
    """SVG path for a rounded rectangle."""
    return (f"M{x+r:.1f},{y:.1f}h{w-2*r:.1f}a{r:.1f},{r:.1f} 0 0 1 {r:.1f},{r:.1f}v{h-2*r:.1f}"
            f"a{r:.1f},{r:.1f} 0 0 1 {-r:.1f},{r:.1f}h{-(w-2*r):.1f}a{r:.1f},{r:.1f} 0 0 1 {-r:.1f},{-r:.1f}"
            f"v{-(h-2*r):.1f}a{r:.1f},{r:.1f} 0 0 1 {r:.1f},{-r:.1f}Z")


def build_branch(ink, bg):
    """Olive branch in its own local units. Returns (svg elements, outline points)."""
    def leaf(cx, cy, L, Wd, ang):
        d = (f"M{-L/2:.3f},0 C{-L/4:.3f},{-Wd*0.66:.3f} {L/4:.3f},{-Wd*0.66:.3f} {L/2:.3f},0 "
             f"C{L/4:.3f},{Wd*0.66:.3f} {-L/4:.3f},{Wd*0.66:.3f} {-L/2:.3f},0Z")
        return (f'<g transform="translate({cx:.3f},{cy:.3f}) rotate({ang:.2f})"><path d="{d}" fill="{ink}"/>'
                f'<path d="M{-L*0.42:.3f},0 Q0,{-Wd*0.05:.3f} {L*0.38:.3f},0" stroke="{bg}" stroke-width="0.07" '
                f'fill="none" stroke-linecap="round"/></g>')

    def leaf_pts(cx, cy, L, Wd, ang):
        a = math.radians(ang)
        return [(cx + L/2*math.cos(t)*math.cos(a) - Wd/2*math.sin(t)*math.sin(a),
                 cy + L/2*math.cos(t)*math.sin(a) + Wd/2*math.sin(t)*math.cos(a))
                for t in (k/16*2*math.pi for k in range(16))]

    def olive(cx, cy, rx, ry, ang):
        hx, hy = -rx * 0.36, -ry * 0.42
        return (f'<g transform="translate({cx:.3f},{cy:.3f}) rotate({ang:.2f})">'
                f'<ellipse rx="{rx:.3f}" ry="{ry:.3f}" fill="{ink}"/>'
                f'<ellipse cx="{hx:.3f}" cy="{hy:.3f}" rx="{rx*0.24:.3f}" ry="{ry*0.13:.3f}" '
                f'transform="rotate(-35 {hx:.3f} {hy:.3f})" fill="{bg}"/></g>')

    def olive_pts(cx, cy, rx, ry, ang):
        a = math.radians(ang)
        return [(cx + rx*math.cos(t)*math.cos(a) - ry*math.sin(t)*math.sin(a),
                 cy + rx*math.cos(t)*math.sin(a) + ry*math.sin(t)*math.cos(a))
                for t in (k/12*2*math.pi for k in range(12))]

    # stem: a quadratic curve from lower-left to upper-right
    p0, p1, p2 = (-4.0, 2.9), (-0.6, -0.1), (4.0, -3.1)

    def bez(t):
        x = (1-t)**2*p0[0] + 2*(1-t)*t*p1[0] + t*t*p2[0]
        y = (1-t)**2*p0[1] + 2*(1-t)*t*p1[1] + t*t*p2[1]
        dx = 2*(1-t)*(p1[0]-p0[0]) + 2*t*(p2[0]-p1[0])
        dy = 2*(1-t)*(p1[1]-p0[1]) + 2*t*(p2[1]-p1[1])
        return x, y, math.degrees(math.atan2(dy, dx))

    els = [f'<path d="M{p0[0]},{p0[1]} Q{p1[0]},{p1[1]} {p2[0]},{p2[1]}" stroke="{ink}" '
           f'stroke-width="0.28" fill="none" stroke-linecap="round"/>']
    pts = [p0, p2]

    # leaves alternate sides along the stem: (position on stem 0..1, side)
    LL, LW = 2.5, 0.72
    for t, side in [(0.06, -1), (0.15, 1), (0.26, -1), (0.37, 1), (0.49, -1),
                    (0.61, 1), (0.72, -1), (0.83, 1), (0.92, -1)]:
        x, y, a = bez(t)
        la = a + side * 40
        bx = x + math.cos(math.radians(la)) * LL / 2
        by = y + math.sin(math.radians(la)) * LL / 2
        els.append(leaf(bx, by, LL, LW, la))
        pts += leaf_pts(bx, by, LL, LW, la)
    x, y, a = bez(1.0)  # tip leaf
    els.append(leaf(x + 0.75, y - 0.5, 1.9, 0.55, a - 5))
    pts += leaf_pts(x + 0.75, y - 0.5, 1.9, 0.55, a - 5)

    # olives on little stalks: (position on stem, offset x, offset y, radius x, radius y, tilt)
    for t, dx, dy, rx, ry, ang in [(0.30, -0.5, 1.45, 0.72, 0.95, -26),
                                   (0.44, 0.35, 1.6, 0.82, 1.08, -14),
                                   (0.58, 1.2, 1.7, 0.76, 1.0, 14)]:
        x, y, _ = bez(t)
        ox, oy = x + dx, y + dy
        els.append(f'<path d="M{x:.2f},{y:.2f} Q{(x+ox)/2+0.15:.2f},{(y+oy)/2-0.4:.2f} {ox:.2f},{oy-ry*0.9:.2f}" '
                   f'stroke="{ink}" stroke-width="0.11" fill="none" stroke-linecap="round"/>')
        els.append(olive(ox, oy, rx, ry, ang))
        pts += olive_pts(ox, oy, rx, ry, ang)
    return els, pts


def make(url, out, branch_size, gap, ink, bg, png_px):
    qr = segno.make(url, error="h", boost_error=False, micro=False)
    M = [list(r) for r in qr.matrix]
    n = len(M)
    W = (n + 2 * QUIET) * S
    P = lambda v: (v + QUIET) * S

    # corner markers (plus their 1-module separators) are drawn separately
    corners = [(0, 0), (0, n - 7), (n - 7, 0)]
    skip = [[False] * n for _ in range(n)]
    for r0, c0 in corners:
        for r in range(max(0, r0 - 1), min(n, r0 + 8)):
            for c in range(max(0, c0 - 1), min(n, c0 + 8)):
                skip[r][c] = True

    body = []
    for r0, c0 in corners:
        x, y = P(c0), P(r0)
        body.append(f'<path d="{rrect(x, y, 7*S, 7*S, 2.0*S)}{rrect(x+S, y+S, 5*S, 5*S, 1.15*S)}" '
                    f'fill="{ink}" fill-rule="evenodd"/>')
        body.append(f'<path d="{rrect(x+2*S, y+2*S, 3*S, 3*S, 0.85*S)}" fill="{ink}"/>')

    # place the branch in the centre, scaled so its longest side spans `branch_size` modules
    els, pts = build_branch(ink, bg)
    bx0, bx1 = min(p[0] for p in pts), max(p[0] for p in pts)
    by0, by1 = min(p[1] for p in pts), max(p[1] for p in pts)
    k = branch_size / max(bx1 - bx0, by1 - by0)
    mx = my = P(n / 2)
    branch = (f'<g transform="translate({mx},{my}) scale({S*k:.4f}) '
              f'translate({-(bx0+bx1)/2:.3f},{-(by0+by1)/2:.3f})">' + "".join(els) + "</g>")

    # knockout: render the branch as a solid silhouette, then drop every dot within `gap` of it
    RES = 4
    mask_svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {W}" width="{W*RES}" height="{W*RES}">'
                + branch.replace(f'fill="{bg}"', f'fill="{ink}"').replace(f'stroke="{bg}"', f'stroke="{ink}"')
                + "</svg>")
    alpha = np.array(Image.open(io.BytesIO(cairosvg.svg2png(bytestring=mask_svg.encode())))
                     .convert("RGBA"))[:, :, 3] > 40
    dist = distance_transform_edt(~alpha) / (RES * S)   # distance to branch, in modules
    removed = 0
    for r in range(n):
        for c in range(n):
            if skip[r][c]:
                continue
            if dist[int(P(r + .5) * RES), int(P(c + .5) * RES)] < DOT + gap:
                skip[r][c] = True
                removed += M[r][c]

    dots = "".join(f'<circle cx="{P(c + .5):.1f}" cy="{P(r + .5):.1f}" r="{S*DOT:.1f}"/>'
                   for r in range(n) for c in range(n) if M[r][c] and not skip[r][c])
    body.insert(0, f'<g fill="{ink}">{dots}</g>')
    body.append(branch)

    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {W}" width="{W}" height="{W}">'
           f'<rect width="{W}" height="{W}" rx="{S*1.5}" fill="{bg}"/>' + "".join(body) + "</svg>")
    with open(out + ".svg", "w") as f:
        f.write(svg)
    cairosvg.svg2png(bytestring=svg.encode(), write_to=out + ".png", output_width=png_px, output_height=png_px)
    print(f"{out}.svg / {out}.png  |  grid {n}x{n} (version {qr.version}, {qr.mode} mode)  |  "
          f"dots removed for branch: {removed}")
    return out + ".png"


def check(png, url):
    try:
        import zxingcpp
    except ImportError:
        print("check skipped: pip install zxing-cpp")
        return
    img = Image.open(png).convert("RGB")
    results = []
    for size in (1400, 600, 300, 200):
        res = zxingcpp.read_barcodes(np.array(img.resize((size, size), Image.LANCZOS)))
        ok = bool(res) and res[0].text == url
        results.append(ok)
        print(f"  scan at {size}px: {'OK' if ok else 'FAILED'}")
    print("check passed" if all(results) else "check FAILED at some sizes: try a smaller --branch")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Olive-branch QR code generator")
    ap.add_argument("--url", required=True, help="address to encode, ideally in capitals")
    ap.add_argument("--out", required=True, help="output path without extension")
    ap.add_argument("--branch", type=float, default=12.5, help="branch size in QR squares (default 12.5)")
    ap.add_argument("--gap", type=float, default=0.28, help="clear space around branch, in squares")
    ap.add_argument("--ink", default="#000000", help="dot / branch colour")
    ap.add_argument("--bg", default="#FFFFFF", help="background colour")
    ap.add_argument("--png", type=int, default=1400, help="PNG width/height in pixels")
    ap.add_argument("--check", action="store_true", help="test-decode the PNG (needs zxing-cpp)")
    a = ap.parse_args()
    png = make(a.url, a.out, a.branch, a.gap, a.ink, a.bg, a.png)
    if a.check:
        check(png, a.url)
