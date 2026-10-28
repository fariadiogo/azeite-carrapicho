"""Contact sheet: puts screenshots side by side, each scaled to the same height and labelled, so a whole set can be
looked at in one image.

    python3 tools/sheet.py <out.jpg> <shot.jpg>... [--height 360] [--width 2400]

Needs Pillow (pip install pillow).
"""
import argparse
import os
from PIL import Image, ImageDraw

ap = argparse.ArgumentParser()
ap.add_argument('out')
ap.add_argument('files', nargs='+')
ap.add_argument('--height', type=int, default=360)
ap.add_argument('--width', type=int, default=2400, help='the sheet wraps onto a new row past this width')
a = ap.parse_args()

pad, label = 10, 16
tiles = []
for f in a.files:
    im = Image.open(f).convert('RGB')
    tiles.append((os.path.basename(f), im.resize((round(im.width * a.height / im.height), a.height))))

rows, row, x = [], [], 0
for name, im in tiles:
    if row and x + im.width > a.width:
        rows.append(row); row, x = [], 0
    row.append((name, im)); x += im.width + pad
rows.append(row)

W = max(sum(im.width + pad for _, im in r) for r in rows)
sheet = Image.new('RGB', (W, len(rows) * (a.height + label + pad)), 'white')
d = ImageDraw.Draw(sheet)
for j, r in enumerate(rows):
    x, y = 0, j * (a.height + label + pad)
    for name, im in r:
        sheet.paste(im, (x, y))
        d.text((x + 4, y + a.height + 2), name, fill='black')
        x += im.width + pad
sheet.save(a.out, quality=85)
print(a.out, sheet.size)
