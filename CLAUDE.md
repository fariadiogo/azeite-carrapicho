# Azeite Carrapicho: landing page

A one-page, scroll-driven (parallax) landing page for **Azeite Carrapicho**, a family extra-virgin olive oil from Serra de Santo António (Alcanena, Portugal), in the Parque Natural das Serras de Aire e Candeeiros (PNSAC).

**Status (2026-10-28):** this is the first concept. The page is static and works. Its photos are copies taken from the brand's Instagram, and the logo on it is a stand-in. Since 2026-10-31 the repo (github.com/fariadiogo/azeite-carrapicho) is public and the page is live on GitHub Pages at https://fariadiogo.github.io/azeite-carrapicho/. The folder has been under git since 2026-10-28; the first commit is the concept as it stood before the tidy-up.

## Who owns what

- **We don't own the brand, the branding or the copy.** We build a page for an existing brand: Azeite Carrapicho, run by the Carrapicho family. The person directing this work is building it for them.
- **Their words come first.** Sections are built from their own captions, photos and facts: Instagram @azeitecarrapicho_ and their Linktree. Don't invent storytelling sections. An earlier "underground" cross-section and a fact strip were removed for exactly this reason.
- **Say what you wrote.** When you write a label, a line of connective copy or a design flourish, tell the user plainly so they can approve it or cut it. Then add it to the "Written by us" list in [docs/sources.md](docs/sources.md).
- **Match their look** rather than inventing one. Their posts use Playfair Display italic for headlines and tracked Montserrat for the "CARRAPICHO · SÉCULOS DE SABOR" sign-off. The page uses the same pairing.
- **The page is in Portuguese only.** The English toggle and i18n were removed on purpose.

Every image and every line of copy is traced to its source in [docs/sources.md](docs/sources.md). Keep that file current whenever you add or change content.

## The brand, in brief

- **The family:**
  - **Fernanda** founded the brand in 2025. She is the youngest daughter of Mário Carrapicho ("Ti Carrapicho") and created it in his honour.
  - **Abel** looks after the olive grove and the animals.
  - **Júlia** (the eldest daughter) and **Carolina** (the youngest) handle social media, marketing and the brand's look.
  - Photos are by **@mario_ssa**.
- **The place:**
  - A limestone (karst) plateau with olive trees over 100 years old, growing among dry-stone walls.
  - Cows graze in the olive grove.
  - One of their groves is called "Samoucal".
- **The product:**
  - Olives of the Galega variety, made into two oils:
    - **Galega Verde:** early harvest, with notes of cut grass, almond and a light pepperiness.
    - **Galega Madura:** made from olives picked when fully ripe.
  - Sizes: a 500 ml black matte bottle, plus 2 L and 5 L jugs (garrafão).
  - The oil is certified under the collective mark "Olivedos do Carso", and pressed at the partner mill Ingrediente Mourisco.
  - Orders are taken by Instagram DM (https://ig.me/m/azeitecarrapicho_) or by email at azeitecarrapicho@gmail.com.
- **Their taglines:**
  - "Carrapicho · Séculos de sabor"
  - "Ficou o legado."
  - "Porque as árvores sobrevivem às pessoas e retribuem aquilo que recebem."
  - "Pedra sobre pedra, sem pressa…"
- **Their logo** is a hand signature over a thumbprint, on a dotted line. It is artwork, not a font. **The user will supply the logo file, so don't trace or redraw it.**

## Run it

Serve the `site/` folder with a static server:

```bash
python3 -m http.server 4173 --bind 127.0.0.1 --directory site
```

Then open http://localhost:4173. In the Claude desktop app, `preview_start` with `"carrapicho"` (from `.claude/launch.json`) does the same.

**Only `site/` gets published.** Everything else (the docs, the tools, the Instagram download, this file) stays off the hosting. Every push to `main` deploys `site/` to GitHub Pages through `.github/workflows/pages.yml`. The repo itself is public, so anything committed (history included) can be read by anyone.

There is no build step. GSAP 3.12.5 with ScrollTrigger loads from cdnjs, and Lenis 1.1.13 (smooth scrolling) from unpkg. The fonts come from Google Fonts:
- Playfair Display: all the serif text.
- Montserrat: small uppercase labels.
- Caveat: handwritten notes.
- Cedarville Cursive: the stand-in wordmark only.

## Files

| Path | What it is |
| --- | --- |
| `site/index.html` | Every section, in page order (outline below). |
| `site/css/style.css` | One stylesheet, in page order. Colour tokens are on `:root`. The landscape-phone block and the `.no-motion` fallback are at the end. |
| `site/js/main.js` | All the motion (GSAP, ScrollTrigger, Lenis). The `PHONE` and `WIDE` media strings are at the top. Under reduced motion it adds `.no-motion` and stops before any animation. |
| `site/js/scenery.js` | Procedural SVG with a seeded random generator: the hero's dawn landscape and the closing dusk, both in parallax layers, plus the daisies, the dry-stone wall for section 02 (`buildWall`) and the stand-in fingerprint. |
| `site/assets/img/` | Only the photos the page uses. They are copies of Instagram images; each one's source post is in docs/sources.md. They are WebP, sized to how big they're drawn (by `tools/photos.py`), plus `share.jpg`, the 1200×630 link-preview image. |
| `.github/workflows/pages.yml` | Deploys `site/` to GitHub Pages on every push to `main`. |
| `site/favicon.svg`, `favicon.ico`, `apple-touch-icon.png` | A temporary icon of ours (an olive and a leaf), until the logo arrives. |
| `source/instagram/` | The raw download of their Instagram (2026-10-27): `CODE_N.jpg`, plus `index.json` (post code, date, the first 90 characters of the caption, image sizes) and `media_urls.json` (CDN links that have since expired). |
| `docs/sources.md` | Where every image and line of copy comes from, and the copy we wrote ourselves. |
| `tools/` | Screenshot and check scripts. Use them through the `check-layout` skill. |
| `tools/photos.py` | Resizes photos and re-encodes them as WebP for `site/assets/img/`. Its caps are the measured size each photo is drawn at; run new photos (the @mario_ssa originals) through it. Needs Pillow. |
| `tools/olive_qr.py` | An olive-branch QR code generator. It predates the page and the page doesn't use it; it's kept to make a QR code of the site's URL once it's live. Setup and usage are in its docstring. `--url` and `--out` are required. It writes the SVG and PNG where you run it, so not inside `site/` unless they're meant to be published. |

## Page outline

1. **Hero:** the serra at dawn, drawn as SVG layers. The section is pinned. The scene starts empty, then as you scroll a sun rises behind the name. The aerial photo then opens out of the sun, through a radial mask driven by `--r`.
2. **01 Território:** a sticky aerial photo with a glass card over it.
3. **Cycle, pasture and documentary:** the cycle quote, the animals text with three photos, and a card for the "Rostos da Aldeia" documentary, which opens a YouTube modal.
4. **02 Pedra sobre pedra:** a pinned section. The dry-stone wall builds stone by stone while the quote lights up word by word. The wall has 6 courses on wide screens and 4 on phones. Below it, the stone-maze aerial photo.
5. **03 Legado:**
   - A "1987" drawn in outline, on the right.
   - The archive harvest photo.
   - The 1987 ledger pages, with handwritten notes.
   - The mechanisation quote.
   - "Ficou o legado." over a full-bleed photo.
6. **04 Família (Quem somos):** four people. Each has a photo, with their Instagram captions as page text below it.
7. **05 Um ano no olival:** six months of the year.
   - On wide screens, scrolling moves the months sideways (pinned).
   - On phones, it's a native swipe row; landscape phones get landscape cards.
8. **06 Os azeites:** Galega Verde and Galega Madura, then the sizes and how to order.
9. **Closing:** the same serra at dusk, with "Porque as árvores sobrevivem às pessoas…", then the footer.

## Decisions already made (ask before undoing any)

- **Section order stays** Território → Pedra → Legado → Família → O Ano → Azeites. Moving O Ano earlier was considered and rejected: Legado belongs next to Família.
- **Hero:**
  - It starts empty, the sun rises as you scroll, and the photo opens out of the sun.
  - There's no stone wall in the foreground.
  - The only flowers are tall daisies. **No fennel or weeds**: the user dislikes them.
- **Cut on purpose:**
  - the Samoucal panel (its photo is `source/instagram/Decs7J4jiO9_0.jpg`);
  - the underground section;
  - the fact strip;
  - the English version.
- **Fonts:** Playfair Display for all serif text (it replaced Fraunces), and Montserrat for labels.
- **Stone wall:** the top three courses were removed, and phones get 4 courses.
- **1987:** it sits on the right at 28vw, with a small drift so it never slides behind the archive photo.
- **Família:** the captions were moved out of the photos into page text, each with a small drawn arrow. The arrows are our touch, echoing the hand-drawn arrows on their posts.
- **O Ano on phones:** a native swipe row, not scroll-driven sideways movement, because a pinned scroll-jacked section jumps when a phone's address bar appears and disappears.
- **Phones held sideways** get their own rule set, `@media (orientation: landscape) and (max-height: 500px)`: photos are capped by the screen height, and two-column layouts come back.

## Things that bite

- **The hero must stay light on GPU layers.** The "Carrapicho" letters and the top bar once flickered in the user's preview pane (Chromium 152). What fixed it:
  - no `will-change` on the elements that grow far past the screen: the sun and the photo. The screen-sized parallax `.layer`s, the branch and O Ano's `.year__track` do keep `will-change: transform`. That is the state that was checked free of flicker in the pane, so test there before removing it from them;
  - the sun scaled to 2.6× at most;
  - the photo hidden (`autoAlpha`) until it starts to open;
  - the letters (`.ch`) using `force3D` only during the intro and then `clearProps`.

  Headless Chrome 156 never showed the flicker, so a clean test there proves nothing.
- **The user views the page in the Claude desktop app's built-in browser pane**, at about 345×811. Ask them to check visual and animation changes there.
- **Breakpoints:**
  - ≤900px: tablets and phones in portrait. The nav links hide.
  - ≤560px and ≤520px: phones.
  - `(orientation: landscape) and (max-height: 500px)`: phones on their side.

  In JS, `PHONE` and `WIDE` mirror these for the wall. O Ano switches at 900px.
- **Where media-query overrides go:** put them after the base rule they override (same specificity, so the later rule wins). One fix already failed because its override sat above the base rule.
- **`.year__seasons` is `display: contents` on wide screens**, so the months still ride in the scroll track. On phones it is the swipe row.
- **`og:url` and the link-preview image (`og:image`) are absolute URLs** on the GitHub Pages address, because most apps (WhatsApp, Facebook) need them absolute. If the page moves to its own domain, change both, and check the preview by sending yourself the link.

## Waiting on the client

- **The logo file**, to replace the `.wordmark` text and the code-drawn `.fp` fingerprint in the nav and footer, and the temporary olive favicon. It could replace the hero name too.
- **Original photos from @mario_ssa**, to replace `site/assets/img/` (through `tools/photos.py`). The family photos still have Instagram text printed on them, and that text now lives in the page.
- **Confirmations needed:**
  - **The polyphenol unit:** their post only says "superior a 360", and the "mg/kg" is ours.
  - **The archive photo:** who is in the black-and-white harvest photo.
  - **Our own copy:** the lines listed under "Written by us" in docs/sources.md.
  - **Ages:** the ages in the family captions will go out of date.

## Checking your work

Use the `check-layout` skill (`.claude/skills/check-layout/`). It screenshots the page at the standard sizes (desktop, the user's pane, portrait phone, three landscape phones) and runs the reduced-motion check.
