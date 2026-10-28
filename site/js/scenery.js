/* Procedural SVG for the serra: ridgelines, olive trees, dry-stone walls and
   the fingerprint mark. Every generator takes a seed, so the landscape is
   drawn the same way on every load. */
(function () {
  const rng = (seed) => () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const f = (n) => Math.round(n * 10) / 10;
  const between = (r, a, b) => a + r() * (b - a);
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];

  // Catmull-Rom spline through the points, written as cubic Béziers.
  function smooth(pts, closed) {
    const n = pts.length;
    const P = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
    let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
    const segs = closed ? n : n - 1;
    for (let i = 0; i < segs; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ` +
        `${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])},${f(p2[1])}`;
    }
    return closed ? d + 'Z' : d;
  }

  function ridgeLine(r, { w, base, amp, step = 40, jag = 0, tilt = 0 }) {
    const ph = [r() * 6.28, r() * 6.28, r() * 6.28];
    const fr = [between(r, 1, 2), between(r, 3, 5), between(r, 7, 11)];
    const pts = [];
    for (let x = -80; x <= w + 80; x += step) {
      const u = x / w;
      const y = base
        - amp * (0.55 * Math.sin(u * fr[0] * Math.PI + ph[0]) + 0.3 * Math.sin(u * fr[1] * Math.PI + ph[1]) + 0.15 * Math.sin(u * fr[2] * Math.PI + ph[2]))
        - tilt * (1 - u) + (r() - 0.5) * jag;
      pts.push([x, y]);
    }
    return pts;
  }

  function yAt(pts, x) {
    for (let i = 1; i < pts.length; i++) {
      if (pts[i][0] >= x) {
        const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
        return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
      }
    }
    return pts[pts.length - 1][1];
  }

  function ridgePath(pts, w, h) {
    return smooth(pts) + `L${w + 80},${h}L-80,${h}Z`;
  }

  const ellipse = (cx, cy, rx, ry, fill, op) =>
    `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" fill="${fill}"${op ? ` opacity="${op}"` : ''}/>`;

  // An old olive tree: a swollen base that splits into one to three twisted
  // stems, limbs reaching out to separate clumps of silvery foliage with sky
  // between them. `s` is roughly the tree's full height; `sun` is +1 when the
  // light comes from the right.
  function oliveTree(r, x, gy, s, c, detail = 2, sun = 1) {
    let out = '';
    const th = s * between(r, 0.3, 0.42);
    const bw = s * between(r, 0.14, 0.2);
    const lean = (r() - 0.5) * s * 0.3;
    const stems = detail === 0 ? 1 : r() < 0.55 ? 2 : r() < 0.8 ? 1 : 3;
    const tips = [];
    for (let k = 0; k < stems; k++) {
      const off = stems === 1 ? 0 : k / (stems - 1) - 0.5;
      const baseX = x + off * bw * 0.45;
      const tipX = x + lean + off * s * between(r, 0.22, 0.42);
      const tipY = gy - th * between(r, 0.85, 1.1);
      const w0 = (bw / Math.sqrt(stems)) * between(r, 0.85, 1.1), w1 = s * 0.035;
      const L = [], R = [];
      const twist = r() * 6;
      for (let i = 0; i <= 6; i++) {
        const t = i / 6;
        const cx = baseX + (tipX - baseX) * t + Math.sin(t * 3.4 + twist) * s * 0.03;
        const cy = gy + (tipY - gy) * t;
        const hw = ((w0 * (1 - t) + w1 * t) / 2) * (1 + (r() - 0.5) * 0.3);
        L.push([cx - hw, cy]);
        R.unshift([cx + hw, cy]);
      }
      L[0][0] -= bw * 0.16;
      R[R.length - 1][0] += bw * 0.16;
      out += `<path d="${smooth(L.concat(R), true)}" fill="${c.trunk}"/>`;
      if (detail > 1) {
        // a lit edge down the sun side of the bark
        const edge = (sun > 0 ? R.slice().reverse() : L).slice(1, 6);
        out += `<path d="${smooth(edge)}" stroke="${c.bark}" stroke-width="${f(s * 0.008)}" stroke-linecap="round" fill="none" opacity=".7"/>`;
      }
      tips.push([tipX, tipY]);
    }

    const cw = s * between(r, 1, 1.3), ch = s * between(r, 0.44, 0.56);
    const ccx = x + lean, ccy = gy - th - ch * 0.32;
    const clumps = detail === 0 ? 1 : detail === 1 ? 2 + Math.floor(r() * 2) : 3 + Math.floor(r() * 3);
    const centers = [];
    for (let i = 0; i < clumps; i++) {
      const u = clumps === 1 ? 0 : (i / (clumps - 1) - 0.5) * 2;
      centers.push([
        ccx + u * cw * 0.36 + (r() - 0.5) * s * 0.08,
        ccy + Math.abs(u) * ch * 0.16 + (r() - 0.5) * ch * 0.35,
        cw * between(r, 0.2, 0.28) * (clumps === 1 ? 1.9 : 1),
        ch * between(r, 0.3, 0.42),
      ]);
    }
    if (detail > 0) {
      for (const [cx, cy] of centers) {
        const [tx, ty] = tips[Math.floor(r() * tips.length)];
        out += `<path d="M${f(tx)},${f(ty)} Q${f((tx + cx) / 2 + (r() - 0.5) * s * 0.12)},${f(ty - s * 0.05)} ${f(cx)},${f(cy + s * 0.03)}" stroke="${c.trunk}" stroke-width="${f(s * between(r, 0.016, 0.028))}" stroke-linecap="round" fill="none"/>`;
      }
    }

    const blobs = [];
    for (const [cx, cy, rx, ry] of centers) {
      const n = detail === 0 ? 4 : detail === 1 ? 7 : Math.round(8 + s / 20);
      for (let i = 0; i < n; i++) {
        let u, v;
        do { u = r() * 2 - 1; v = r() * 2 - 1; } while (u * u + v * v > 1);
        blobs.push([cx + u * rx * 0.8, cy + v * ry * 0.7, Math.min(rx, ry) * between(r, 0.38, 0.62)]);
      }
    }
    blobs.sort((a, b) => a[1] - b[1]);
    if (detail > 0) for (const [bx, by, rad] of blobs) out += ellipse(bx, by + rad * 0.32, rad * 1.25, rad * 0.8, c.shade);
    for (const [bx, by, rad] of blobs) out += ellipse(bx, by, rad * 1.2, rad * 0.76, c.leaf);
    if (detail > 0) {
      for (const [bx, by, rad] of blobs) {
        if (r() < 0.7) out += ellipse(bx + sun * rad * 0.32, by - rad * 0.3, rad * 0.62, rad * 0.32, c.light, '.6');
      }
    }
    if (detail > 1) {
      // loose single leaves, so the edge of each clump breaks up like real foliage
      const count = Math.min(220, Math.round(s * 0.6));
      for (let i = 0; i < count; i++) {
        const [cx, cy, rx, ry] = centers[Math.floor(r() * centers.length)];
        const a = r() * Math.PI * 2, rr = Math.sqrt(r()) * 1.05;
        const lx = cx + Math.cos(a) * rx * rr, ly = cy + Math.sin(a) * ry * rr;
        const ll = s * between(r, 0.014, 0.026);
        const lit = Math.cos(a) * sun > 0.2 && r() < 0.7;
        out += `<ellipse cx="${f(lx)}" cy="${f(ly)}" rx="${f(ll)}" ry="${f(ll * 0.3)}" transform="rotate(${f(between(r, -60, 60))} ${f(lx)} ${f(ly)})" fill="${lit ? c.light : r() < 0.5 ? c.leaf : c.shade}"/>`;
      }
    }
    return out;
  }

  // One limestone block: an angular polygon with chipped (slightly rounded) corners.
  function stonePath(r, x, y, w, h) {
    const n = 5 + Math.floor(r() * 3);
    const e = between(r, 0.55, 0.85);
    const pts = [];
    const a0 = r() * Math.PI * 2;
    for (let i = 0; i < n; i++) {
      const a = a0 + (i / n) * Math.PI * 2 + between(r, -0.25, 0.25);
      const c = Math.cos(a), s = Math.sin(a);
      pts.push([
        x + w / 2 + Math.sign(c) * Math.pow(Math.abs(c), e) * (w / 2) * between(r, 0.9, 1.04),
        y + h / 2 + Math.sign(s) * Math.pow(Math.abs(s), e) * (h / 2) * between(r, 0.86, 1.04),
      ]);
    }
    const cut = between(r, 0.14, 0.24);
    let d = '';
    for (let i = 0; i < n; i++) {
      const p = pts[i], prev = pts[(i - 1 + n) % n], next = pts[(i + 1) % n];
      const a = [p[0] + (prev[0] - p[0]) * cut, p[1] + (prev[1] - p[1]) * cut];
      const b = [p[0] + (next[0] - p[0]) * cut, p[1] + (next[1] - p[1]) * cut];
      d += `${i ? 'L' : 'M'}${f(a[0])},${f(a[1])}Q${f(p[0])},${f(p[1])} ${f(b[0])},${f(b[1])}`;
    }
    return d + 'Z';
  }

  // Courses of stone laid from the bottom up to `top`. Each stone gets a drop
  // shadow, a shared top-lit sheen (one gradient for all of them) and, now and
  // then, lichen or a crack. Returns the stones so callers can print them or
  // animate them one by one.
  function stoneWall(r, { w, h, top, rowH = [30, 60], palette, shadow, id, lichen = ['#b8b08a', '#9c9a86'] }) {
    const stones = [];
    let y = h + 6, row = 0;
    while (y > top) {
      const rh = between(r, rowH[0], rowH[1]);
      let x = -between(r, 10, 70);
      while (x < w + 20) {
        const sw = rh * between(r, 0.9, 2.5);
        const sh = rh * between(r, 0.78, 1.02);
        const sy = y - sh - (rh - sh) * r();
        const d = stonePath(r, x, sy, sw, sh);
        let svg = `<path d="${d}" fill="${shadow}" transform="translate(${f(sw * 0.02)},${f(sh * 0.09)})"/>` +
          `<path d="${d}" fill="${pick(r, palette)}"/><path d="${d}" fill="url(#${id})"/>`;
        if (r() < 0.35) {
          for (let k = 0; k < 3 + Math.floor(r() * 5); k++) {
            svg += `<circle cx="${f(x + sw * between(r, 0.2, 0.8))}" cy="${f(sy + sh * between(r, 0.2, 0.75))}" r="${f(between(r, 1.2, 3.4))}" fill="${pick(r, lichen)}" opacity=".55"/>`;
          }
        }
        if (r() < 0.18) {
          const cx0 = x + sw * between(r, 0.3, 0.7);
          svg += `<path d="M${f(cx0)},${f(sy + sh * 0.12)}l${f(between(r, -6, 6))},${f(sh * 0.3)}l${f(between(r, -5, 5))},${f(sh * 0.32)}" stroke="${shadow}" stroke-width="1.2" fill="none" opacity=".55"/>`;
        }
        stones.push({ svg, row });
        x += sw + between(r, 2, 6);
      }
      y -= rh + between(r, 1, 4);
      row++;
    }
    const defs = `<defs><linearGradient id="${id}" x1="0" y1="0" x2=".25" y2="1">` +
      `<stop offset="0" stop-color="#fff" stop-opacity=".32"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/>` +
      `<stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient></defs>`;
    return { stones, defs, rows: row };
  }

  /* ---------- the hero / closing landscape, as separate parallax layers ---------- */

  const PALETTES = {
    dawn: {
      sun: 1,
      far: '#a9b4ba', mid: '#99a39b', plateau: '#a19a72', near: ['#a8975e', '#7c7244'],
      fields: { earth: '#b5785a', green: '#7e8a5a', wall: '#e8e1d1', wallShadow: '#5d5a45' },
      treesFar: { trunk: '#7a7f68', leaf: '#838c6d', shade: '#778063', light: '#9ba486' },
      treesMid: { trunk: '#5a5440', leaf: '#6b7652', shade: '#5d6847', light: '#939e7b' },
      treesNear: { trunk: '#3d3529', bark: '#8f8066', leaf: '#56633d', shade: '#414c2c', light: '#a6b089' },
      mist: '#efe4cf', treeShadow: '#4e4a2c',
      rock: '#cfc8b8', rockLight: '#eee9de', rockDark: '#8f887a',
      flora: { stalk: '#a68b52', daisy: '#f4f0e6', heart: '#d9a93a' },
      branch: { stem: '#4a3f30', leaf: '#46532f', under: '#a3ab92', rib: '#7f8a66', olives: ['#5d6b2c', '#6b7a33', '#3a2b36'] },
      cloud: '#ffffff', bird: '#55554a',
    },
    // golden hour, sun low on the left
    dusk: {
      sun: -1,
      far: '#c99d8f', mid: '#ad8180', plateau: '#8b6566', near: ['#4a383a', '#3a2c30'],
      fields: { earth: '#9a5a4a', green: '#7a6058', wall: '#e2bba1', wallShadow: '#4a3434' },
      treesFar: { trunk: '#b18a83', leaf: '#b5918a', shade: '#ab877f', light: '#caa397' },
      treesMid: { trunk: '#7b5a5c', leaf: '#806061', shade: '#745557', light: '#a07a72' },
      treesNear: { trunk: '#2c2224', bark: '#8a5e4c', leaf: '#342929', shade: '#2a2122', light: '#8f5f4a' },
      mist: '#f2cba6', treeShadow: '#21181a',
      rock: '#5c4a48', rockLight: '#a37a69', rockDark: '#2f2526',
      cloud: '#fff1df', bird: '#4a3436',
    },
  };

  // The stretch of a line between x0 and x1, with interpolated ends.
  function seg(line, x0, x1) {
    const out = [[x0, yAt(line, x0)]];
    for (const p of line) if (p[0] > x0 && p[0] < x1) out.push(p);
    out.push([x1, yAt(line, x1)]);
    return out;
  }
  const poly = (ps) => ps.map((p, i) => `${i ? 'L' : 'M'}${f(p[0])},${f(p[1])}`).join('');

  // The patchwork that dry-stone walls make across a plateau, seen from afar:
  // courses of wall following the contour, cross walls between them, plots of
  // red earth or greener grass, and olive trees planted along the walls.
  function fields(r, pts, { w, rows, top, spacing, c, trees }) {
    const lines = [];
    let dy = top;
    for (let i = 0; i < rows; i++) {
      const wob = ridgeLine(r, { w, base: 0, amp: 4 + i * 2, step: 90 });
      lines.push(pts.map(([x, y]) => [x, y + dy + yAt(wob, x)]));
      dy += spacing * Math.pow(1.4, i);
    }
    let plots = '', walls = '', shadows = '', grove = '';
    for (let i = 0; i < rows - 1; i++) {
      const a = lines[i], b = lines[i + 1];
      const sw = f(1 + i * 0.55);
      let x = -80;
      while (x < w + 80) {
        const x1 = Math.min(w + 80, x + between(r, 80, 240) * (1 + i * 0.4));
        const t = r();
        if (t < 0.55) plots += `<path d="${poly([...seg(a, x, x1), ...seg(b, x, x1).reverse()])}Z" fill="${t < 0.28 ? c.earth : c.green}" opacity="${f(between(r, 0.22, 0.5))}"/>`;
        const lean = between(r, -14, 14) * (1 + i * 0.3);
        walls += `<path d="M${f(x1)},${f(yAt(a, x1))}L${f(x1 + lean)},${f(yAt(b, x1 + lean))}" stroke-width="${sw}"/>`;
        x = x1;
      }
      walls += `<path d="${smooth(a)}" stroke-width="${sw}"/>`;
      shadows += `<path d="${smooth(a)}" stroke-width="${sw}" transform="translate(0,${f(1 + i * 0.6)})"/>`;
      if (trees) {
        const size = trees.size * (1 + i * 0.45);
        for (let tx = between(r, -40, 0); tx < w + 40; tx += between(r, 26, 48) * (1 + i * 0.35)) {
          if (r() < 0.25) continue;
          const gy = yAt(a, tx) + (yAt(b, tx) - yAt(a, tx)) * between(r, 0.35, 0.9);
          grove += oliveTree(r, tx, gy, size * between(r, 0.8, 1.2), trees.c, i < 2 ? 0 : 1, trees.sun);
        }
      }
    }
    return plots +
      `<g stroke="${c.wallShadow}" fill="none" stroke-linecap="round" opacity=".35">${shadows}</g>` +
      `<g stroke="${c.wall}" fill="none" stroke-linecap="round" opacity=".8">${walls}</g>` + grove;
  }

  // Lapiás: bare limestone breaking through the grass.
  function outcrops(r, pts, { w, count, c, size, drop }) {
    let out = '';
    for (let i = 0; i < count; i++) {
      const x = between(r, -40, w + 40), gy = yAt(pts, x) + between(r, drop[0], drop[1]);
      const ow = between(r, size[0], size[1]), oh = ow * between(r, 0.28, 0.45);
      const d = stonePath(r, x - ow / 2, gy - oh, ow, oh * 1.3);
      out += `<path d="${d}" fill="${c.rockDark}" transform="translate(0,${f(oh * 0.12)})"/><path d="${d}" fill="${c.rock}"/>`;
      out += `<path d="${stonePath(r, x - ow * 0.38, gy - oh * 1.02, ow * 0.7, oh * 0.55)}" fill="${c.rockLight}" opacity=".7"/>`;
      for (let k = 0; k < 2 + Math.floor(r() * 3); k++) {
        const kx = x + between(r, -0.35, 0.35) * ow;
        out += `<path d="M${f(kx)},${f(gy - oh * 0.75)}l${f(between(r, -3, 3))},${f(oh * 0.7)}" stroke="${c.rockDark}" stroke-width="1.4" opacity=".6"/>`;
      }
    }
    return out;
  }

  // A few daisies on tall stalks, standing in the foreground.
  function flora(r, { w, y, c }) {
    const n = 12;
    let stalks = '', heads = '';
    for (let i = 0; i < n; i++) {
      const x = ((i + r()) * w) / n, gy = y + between(r, 4, 40), hh = between(r, 80, 210), bend = between(r, -34, 34);
      const tx = x + bend, ty = gy - hh;
      stalks += `M${f(x)},${f(gy)}q${f(bend * 0.2)},${f(-hh * 0.6)} ${f(bend)},${f(-hh)}`;
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2, px = tx + Math.cos(a) * 5, py = ty + Math.sin(a) * 5;
        heads += ellipse(px, py, 4.2, 2, c.daisy).replace('/>', ` transform="rotate(${f((a * 180) / Math.PI)} ${f(px)} ${f(py)})"/>`);
      }
      heads += ellipse(tx, ty, 3.2, 3.2, c.heart);
    }
    return `<path d="${stalks}" stroke="${c.stalk}" stroke-width="2" stroke-linecap="round" fill="none"/>` + heads;
  }

  // An olive branch hanging into the frame from the top right corner.
  function branch(r, c) {
    const P = [[1720, -60], [1520, 40], [1380, 160], [1150, 250]];
    const B = (t) => {
      const u = 1 - t;
      return [0, 1].map((k) => u * u * u * P[0][k] + 3 * u * u * t * P[1][k] + 3 * u * t * t * P[2][k] + t * t * t * P[3][k]);
    };
    const D = (t) => {
      const u = 1 - t;
      return [0, 1].map((k) => 3 * u * u * (P[1][k] - P[0][k]) + 6 * u * t * (P[2][k] - P[1][k]) + 3 * t * t * (P[3][k] - P[2][k]));
    };
    const L = [], R = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20, [x, y] = B(t), [dx, dy] = D(t), len = Math.hypot(dx, dy);
      const hw = 9 * (1 - t) + 1.6;
      L.push([x - (dy / len) * hw, y + (dx / len) * hw]);
      R.unshift([x + (dy / len) * hw, y - (dx / len) * hw]);
    }
    let out = `<path d="${smooth(L.concat(R), true)}" fill="${c.stem}"/>`;
    const leaf = (x, y, ang, len, under) => {
      const wd = len * 0.15;
      return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(ang)})">` +
        `<path d="M0,0Q${f(len * 0.45)},${f(-wd)} ${f(len)},0Q${f(len * 0.45)},${f(wd)} 0,0Z" fill="${under ? c.under : c.leaf}"/>` +
        (under ? '' : `<path d="M${f(len * 0.06)},0L${f(len * 0.85)},0" stroke="${c.rib}" stroke-width="1.1"/>`) + '</g>';
    };
    let leaves = '', fruit = '';
    let side = 1;
    for (let t = 0.1; t <= 1.001; t += between(r, 0.04, 0.06)) {
      const [x, y] = B(t), [dx, dy] = D(t);
      const base = (Math.atan2(dy, dx) * 180) / Math.PI;
      const len = between(r, 70, 110) * (1 - t * 0.35);
      leaves += leaf(x, y, base + side * between(r, 28, 58), len, r() < 0.3);
      side = -side;
      if (t > 0.3 && t < 0.8 && r() < 0.35) {
        const ox = x + between(r, -14, 14), oy = y + between(r, 18, 34);
        fruit += `<path d="M${f(x)},${f(y)}L${f(ox)},${f(oy - 14)}" stroke="${c.stem}" stroke-width="1.6"/>` +
          ellipse(ox, oy, 11, 15, pick(r, c.olives)) + ellipse(ox - 3.5, oy - 6, 3, 4, '#ffffff', '.35');
      }
    }
    leaves += leaf(...B(1), (Math.atan2(...D(1).reverse()) * 180) / Math.PI, 90, false);
    return out + fruit + leaves;
  }

  function sky(r, p, W) {
    let out = `<defs><filter id="wisp-${p.sun}" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="9"/></filter></defs>`;
    out += `<g filter="url(#wisp-${p.sun})" fill="${p.cloud}">`;
    for (let i = 0; i < 6; i++) {
      out += ellipse(between(r, 0, W), between(r, 90, 340), between(r, 140, 340), between(r, 6, 16), p.cloud, f(between(r, 0.35, 0.6)));
    }
    out += '</g>';
    const bx = p.sun > 0 ? 1120 : 420, by = 250;
    for (let i = 0; i < 4; i++) {
      const x = bx + between(r, -90, 90), y = by + between(r, -50, 50), sz = between(r, 4, 7);
      out += `<path d="M${f(x - sz)},${f(y - sz * 0.3)}q${f(sz * 0.5)},${f(-sz * 0.5)} ${f(sz)},${f(sz * 0.3)}q${f(sz * 0.5)},${f(-sz * 0.8)} ${f(sz)},${f(-sz * 0.3)}" stroke="${p.bird}" stroke-width="1.5" stroke-linecap="round" fill="none"/>`;
    }
    return out;
  }

  function landscape(name, seed) {
    const p = PALETTES[name];
    const r = rng(seed);
    const W = 1600, H = 900;
    const far = ridgeLine(r, { w: W, base: 520, amp: 70, tilt: 90, step: 30, jag: 4 });
    const mid = ridgeLine(r, { w: W, base: 600, amp: 34, step: 30, jag: 3 });
    const plat = ridgeLine(r, { w: W, base: 668, amp: 20, step: 40 });
    const near = ridgeLine(r, { w: W, base: 735, amp: 30, step: 40 });

    const mist = (y, o) => `<rect x="-80" y="${y}" width="${W + 160}" height="${H - y}" fill="url(#mist-${name})" opacity="${o}"/>`;
    const defs = `<defs><linearGradient id="mist-${name}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.mist}" stop-opacity="0"/><stop offset=".35" stop-color="${p.mist}" stop-opacity=".55"/><stop offset="1" stop-color="${p.mist}" stop-opacity="0"/></linearGradient></defs>`;
    // the near ground runs well below the frame, so it still fills the bottom once the layer has risen
    const nearTop = Math.min(...near.map(([, y]) => y));
    const nearDefs = `<defs><linearGradient id="near-${name}" gradientUnits="userSpaceOnUse" x1="0" y1="${f(nearTop)}" x2="0" y2="${H}"><stop offset="0" stop-color="${p.near[0]}"/><stop offset=".6" stop-color="${p.near[1]}"/></linearGradient></defs>`;

    // tree shadows fall away from the sun
    const nearTrees = [];
    for (let i = 0; i < 12; i++) {
      const x = between(r, -40, W + 40);
      if (x > 500 && x < 1100 && r() < 0.85) continue;
      nearTrees.push([x, yAt(near, x) + between(r, 6, 34), between(r, 110, 200)]);
    }
    nearTrees.sort((a, b) => a[1] - b[1]);

    const layers = {
      sky: sky(r, p, W),
      far: defs + `<path d="${ridgePath(far, W, H)}" fill="${p.far}"/>` + mist(470, 0.9),
      mid: `<path d="${ridgePath(mid, W, H)}" fill="${p.mid}"/>` +
        fields(r, mid, { w: W, rows: 4, top: 6, spacing: 7, c: p.fields, trees: { size: 5, c: p.treesFar, sun: p.sun } }) +
        mist(560, 0.75),
      plateau: `<path d="${ridgePath(plat, W, H)}" fill="${p.plateau}"/>` +
        fields(r, plat, { w: W, rows: 6, top: 4, spacing: 11, c: p.fields, trees: { size: 11, c: p.treesMid, sun: p.sun } }) +
        mist(650, 0.3),
      near: nearDefs + `<path d="${ridgePath(near, W, H + 400)}" fill="url(#near-${name})"/>` +
        outcrops(r, near, { w: W, count: 16, c: p, size: [40, 130], drop: [20, 150] }) +
        nearTrees.map(([x, gy, s]) => ellipse(x - p.sun * s * 0.22, gy + 4, s * 0.55, s * 0.07, p.treeShadow, '.35')).join('') +
        nearTrees.map(([x, gy, s]) => oliveTree(r, x, gy, s, p.treesNear, 2, p.sun)).join('') +
        (p.flora ? flora(rng(seed + 13), { w: W, y: 850, c: p.flora }) : ''),
    };
    if (p.branch) layers.branch = branch(rng(seed + 17), p.branch);
    return layers;
  }

  /* ---------- the "pedra sobre pedra" wall, stone by stone ---------- */

  function buildWall(seed, w, h) {
    const wall = stoneWall(rng(seed), {
      w, h, top: 50, rowH: [46, 80],
      palette: ['#d3cdc0', '#c6bfb0', '#bab3a3', '#aca595', '#cbc5b6', '#b9b39c', '#d8d3c8'], shadow: '#3d3a32', id: 'sheen-build',
    });
    // the top three courses are left off, so the wall stays clear of the quote
    const rows = wall.rows - 3;
    const svg = wall.defs + `<rect x="-20" y="${h - 30}" width="${w + 40}" height="50" fill="#3f3b32"/>` + wall.stones
      .filter((s) => s.row < rows)
      .map((s) => `<g class="stone" data-row="${s.row}">${s.svg}</g>`)
      .join('');
    return { svg };
  }

  /* ---------- the fingerprint, as in the label ---------- */

  function fingerprint(seed, { cx = 50, cy = 50, rings = 14, rx = 34, ry = 44 } = {}) {
    const r = rng(seed);
    const paths = [];
    for (let k = 1; k <= rings; k++) {
      const t = k / rings;
      const ex = rx * t, ey = ry * t;
      const ox = cx + (1 - t) * 3, oy = cy + (1 - t) * 5;
      const gaps = k < 3 ? 1 : 1 + Math.floor(r() * 3);
      let a0 = r() * Math.PI * 2;
      const span = (Math.PI * 2) / gaps;
      for (let g = 0; g < gaps; g++) {
        const start = a0 + g * span, end = start + span * between(r, 0.62, 0.9);
        const pts = [];
        for (let a = start; a <= end; a += 0.18) {
          const wob = 1 + Math.sin(a * 3 + k) * 0.025;
          pts.push([ox + Math.cos(a) * ex * wob, oy + Math.sin(a) * ey * wob * (Math.sin(a) > 0 ? 0.92 : 1)]);
        }
        if (pts.length > 2) paths.push(smooth(pts));
      }
    }
    return paths;
  }

  window.Scenery = { landscape, buildWall, fingerprint };
})();
