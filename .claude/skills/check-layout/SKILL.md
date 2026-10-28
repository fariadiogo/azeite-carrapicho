---
name: check-layout
description: Screenshot the Carrapicho landing page at the standard desktop, pane, phone and landscape-phone sizes and run the reduced-motion check. Use after any change to the page's HTML, CSS or JS, before telling the user it's done.
---

# Check the layout

This page has to work at very different shapes, and most bugs so far showed up at only one of them: the user's narrow preview pane, a phone on its side, or desktop. Check them all after a change, not just the size you were working on.

## 1. Setup

1. Make sure the site is served on port 4173. Start it if it isn't, with `preview_start` with `"carrapicho"`, or with `python3 -m http.server 4173 --bind 127.0.0.1 --directory site` from the project root in the background. It must serve `site/`, not the project root.
2. If `tools/node_modules` is missing, install it once with `npm install --prefix tools`.
3. Write the screenshots to your scratchpad, not into the project.

## 2. The standard sizes

| Size | What it is | Notes |
| --- | --- | --- |
| 1440×900 | Desktop | |
| 345×811 | The user's preview pane in the Claude desktop app | They look at the page here most |
| 390×844 | Portrait phone | |
| 844×390 | Phone on its side | Run with `MOBILE=1` |
| 667×375 | Small phone on its side | Run with `MOBILE=1` |
| 932×430 | Large phone on its side | Run with `MOBILE=1`. Wider than 900px, so it gets the desktop rules plus the landscape ones |

Shoot the sections you touched, plus their neighbours. For example:

```bash
node tools/shoot.mjs 1440 900 "$OUT/d" "hero=@0" "wall=.stones@160" "fam=.family@40" "year=.year@150"
MOBILE=1 node tools/shoot.mjs 844 390 "$OUT/l" "hero=@0" "wall=.stones@160" "year=.year@25"
```

The shell is zsh, which doesn't split an unquoted variable into words. If you keep the specs in a variable, pass it as `${=SPECS}`, or the script gets them as one argument and shoots only the first.

How the specs work:
- A spec is `label=selector@offset`, where the offset is a % of the viewport height. For pinned sections, it's measured from the pin spacer.
- Handy targets: `.hero`, `.territory`, `.pasture`, `.stones`, `.maze`, `.legacy`, `.ledger`, `.hands`, `.family`, `.year`, `.oils`, `.order`, `.dusk`, `.foot`.
- For pinned sections, shoot several offsets: the hero at 0/60/150, the wall at 40/160, O Ano on desktop at 20/250/500.

The script prints `errors: none` when the page threw nothing. The favicon 404 is known and is filtered out.

To look at many shots at once, make a contact sheet:

```bash
python3 tools/sheet.py "$OUT/sheet.jpg" "$OUT"/d-*.jpg
```

Then Read the sheet image.

## 3. What to look for

- **Text:** cut off, overlapping, or wrapping where it shouldn't. "Carrapicho" and "Séculos de sabor" in the hero must each stay on one line.
- **Photos:** taller than the screen, which happens on landscape phones.
- **The stone wall:** it must not cover the quote. It has 6 courses on wide screens and 4 on phones.
- **1987 in Legado:** fully visible on the right, never behind the archive photo.
- **Família:** rows must not run into each other on phones.
- **O Ano:** on phones the cards show photo plus text, the next card peeks in, and the bar fills. On desktop it scrolls sideways.

To test the O Ano swipe row, set `.year__seasons` `scrollLeft` with `page.evaluate`. Then check that the bar reaches `scaleX(1)` and the background tint changes.

## 4. Reduced motion

```bash
node tools/reduced-motion.mjs
```

It must report `noMotion: true`, `quoteLit: true` and no errors.

## 5. Hand over honestly

- **Headless Chrome isn't the user's browser.** It runs without the GPU and on a newer Chrome. It never reproduced the flicker the user saw in their pane (Chromium 152).
- **For animation and GPU-sensitive changes** (the hero especially), tell the user what you checked and ask them to reload their pane and look.
- **Never claim a phone check you didn't do on a real phone.** Say it was emulated.
