"""Resizes and re-encodes photos for the page as WebP, so they're no bigger than they're drawn.

    python3 tools/photos.py <src_dir> <out_dir> [--quality 75]

Every .jpg/.jpeg/.png in src_dir becomes <name>.webp in out_dir. Name the sources after the page's files
(aerial-ridge.jpg -> aerial-ridge.webp) so the caps below apply; a photo with no cap keeps its size.
Needs Pillow (pip install pillow).
"""
import argparse
import os
from PIL import Image, ImageOps

# Long-edge caps in px: twice the largest size each photo is drawn at on a 1440px desktop (measured 2026-10-29),
# rounded up and never below 1000. The two full-bleed photos (the hero aerial and the "Ficou o legado." hands) would
# need over 3800 by that rule; they stop at 2400 to keep the first load light.
CAP = {
    'aerial-ridge': 2400, 'aerial-terraces': 1800, 'archive-harvest': 1600, 'bottle-maduro': 1100,
    'bottle-verde': 1100, 'cow-grazing': 1500, 'cows-wall': 1200, 'family-abel': 1000, 'family-carolina': 1000,
    'family-fernanda': 1000, 'family-julia': 1000, 'formats': 1500, 'harvest-net': 1500, 'leaves-evening': 1000,
    'ledger-1987': 1200, 'ledger-b': 1000, 'ledger-c': 1100, 'legacy-hands': 2400, 'tree-wall-evening': 1000,
    'year-buds': 1500, 'year-flower': 1500, 'year-fruit': 1500, 'year-mill': 1500,
}

ap = argparse.ArgumentParser()
ap.add_argument('src')
ap.add_argument('out')
ap.add_argument('--quality', type=int, default=75)
a = ap.parse_args()

before = after = 0
for f in sorted(os.listdir(a.src)):
    name, ext = os.path.splitext(f)
    if ext.lower() not in ('.jpg', '.jpeg', '.png'):
        continue
    src = os.path.join(a.src, f)
    im = ImageOps.exif_transpose(Image.open(src))
    icc = im.info.get('icc_profile')
    cap = CAP.get(name)
    if cap and max(im.size) > cap:
        s = cap / max(im.size)
        im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    out = os.path.join(a.out, name + '.webp')
    im.convert('RGB').save(out, 'WEBP', quality=a.quality, method=6, icc_profile=icc)
    before += os.path.getsize(src)
    after += os.path.getsize(out)
    print(f'{f:28} {im.width}x{im.height:<5} {os.path.getsize(out) // 1024:5}K')
print(f'total {before / 1e6:.2f} MB -> {after / 1e6:.2f} MB')
