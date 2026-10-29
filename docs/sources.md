# Sources

This file records where every image and every line of copy on the page comes from. Keep it current: when you add content, add its source here, and when you write something yourself, add it to "Written by us".

Instagram post links take the form `https://www.instagram.com/p/<code>/`.

## Where the material comes from

- **Instagram, [@azeitecarrapicho_](https://www.instagram.com/azeitecarrapicho_/).** This is the main source. It has 32 posts, from October 2025 to October 2026, all downloaded on 2026-10-27 into `source/instagram/`. Most photos are by [@mario_ssa](https://www.instagram.com/mario_ssa/), as their captions credit with "📸 @mario_ssa". The profile:
  - bio: "Azeite Virgem Extra, produzido no Parque Natural da Serra D'Aire e Candeeiros · 📍Serra de Santo António - Portugal";
  - story highlights: "Quem somos?", "Campanha 26", "Olival", "Eventos", "Carrapicho", "SSA", "Campanha 2025".
- **Linktree, [linktr.ee/azeitecarrapicho](https://linktr.ee/azeitecarrapicho).** It has:
  - links to Instagram, WhatsApp, Facebook (profile 61582397438105), the SAGAL Expo (13–15 April 2026), email (azeitecarrapicho@gmail.com) and "O nosso terroir" (the documentary below);
  - the location line "Serra de Santo António, Alcanena - Parque Natural da Serra D'Aire e Candeeiros";
  - the "O Azeite Carrapicho" text, copied in full below.
- **Third party: the documentary.** "Rostos da Aldeia - Serra de Santo António" ([YouTube 2U4gZFDnmQ8](https://www.youtube.com/watch?v=2U4gZFDnmQ8)) is by Tiago Cerveira for the Rostos da Aldeia project, 9:58 long, published in July 2024. Their Linktree links to it as "O nosso terroir". The page shows its YouTube thumbnail and plays it through youtube-nocookie.
- **Third party: background reading.** [rostosdaaldeia.pt: Serra de Santo António](https://www.rostosdaaldeia.pt/santarem/serra-de-santo-antonio/) gave us background facts (about 700 inhabitants, the maze of stone walls). Nothing from it is on the page any more.

### The Linktree "O Azeite Carrapicho" text (as captured on 2026-10-27)

> Criado em 2025, o Azeite Carrapicho é um azeite virgem extra certificado pela marca coletiva Olivedos do Carso.
>
> Produzido na Serra de Santo António, em pleno coração do Parque Natural da Serra D'Aire e Candeeiros, surge a marca Carrapicho. Há séculos que o olival faz parte da nossa história. O Azeite Carrapicho surge como o culminar de algo que há muito tempo existe, em honra de quem o fez nascer. Cada garrafa que produzimos leva consigo a memória da serra, a resiliência da nossa família e a essência de um saber antigo que continua a inspirar-nos.
>
> Cuidamos do solo como quem guarda um tesouro antigo, permitindo que a vida floresça em cada raiz. Queremos levar à mesa um azeite puro, que nutre o corpo e honra a natureza, celebrando a harmonia entre o sabor e a saúde.

## Images

Every photo in `site/assets/img/` is a copy of an Instagram image (the matching file in `source/instagram/` is `<code>_<n>.jpg`). These are placeholders until the originals arrive from @mario_ssa.

Since 2026-10-29 the photos are WebP, resized to the size they're drawn at and re-encoded by `tools/photos.py`. The JPEG copies they were made from are in git history (commit 6a4841b).

| File | Where it's used | Post | Date | Notes |
| --- | --- | --- | --- | --- |
| `aerial-ridge.webp` | Hero photo reveal; Território background | Decs7J4jiO9 #2 | 2026-10-13 | The "Samoucal" post |
| `aerial-terraces.webp` | Stone-maze photo, after 02 | Decs7J4jiO9 #1 | 2026-10-13 | |
| `cows-wall.webp` | Pasture, first photo | DbWWSMiDg3T #4 | 2026-07-28 | |
| `tree-wall-evening.webp` | Pasture, second photo | Daqu31rjmCr #0 | 2026-07-11 | |
| `leaves-evening.webp` | Pasture, third photo | Daqu31rjmCr #3 | 2026-07-11 | |
| `archive-harvest.webp` | Legado, archive photo | DbJTBxHDmMs #1 | 2026-07-23 | Who is in it is unconfirmed |
| `ledger-1987.webp`, `ledger-b.webp`, `ledger-c.webp` | Legado, the 1987 ledger pages | DdcGF4UjuwA #0, #1, #2 | 2026-09-18 | |
| `legacy-hands.webp` | "Ficou o legado." full-bleed photo | DQAIUyrivw0 #0 | 2025-10-19 | Cropped to remove the headline printed on it |
| `family-fernanda.webp`, `family-abel.webp`, `family-julia.webp`, `family-carolina.webp` | Família | DeATM-eDuiT #1, #2, #3, #4 | 2026-10-02 | Instagram text is printed on these; the text is now also in the page |
| `year-buds.webp` | O Ano, Abril | DXjfe-PCnba #2 | 2026-04-25 | |
| `year-flower.webp` | O Ano, Maio | DX-DiS5jj4l #0 | 2026-05-05 | |
| `year-fruit.webp` | O Ano, Julho | Db_vh3jjpyA #0 | 2026-08-13 | |
| `harvest-net.webp` | O Ano, Setembro | DeulXX1jtlg #1 | 2026-10-20 | |
| `year-mill.webp` | O Ano, Outubro | Da2gmflDq_G #0 | 2026-07-16 | |
| `cow-grazing.webp` | O Ano, Inverno | DbWWSMiDg3T #5 | 2026-07-28 | |
| `bottle-verde.webp` | Azeites, Galega Verde | DUY3-ApDrCu #0 | 2026-02-05 | |
| `bottle-maduro.webp` | Azeites, Galega Madura | DUf87NrirJJ #0 | 2026-02-08 | |
| `formats.webp` | Azeites, the sizes | DbtNehcu0pG #0 | 2026-08-06 | |
| `share.jpg` | Link preview (`og:image`), 1200×630 | Decs7J4jiO9 #2 | 2026-10-13 | Cropped from the full-size original; the same photo as `aerial-ridge` |

**Copied but not used.** These copies were deleted from the project on 2026-10-28. The originals are still in `source/instagram/` under the post codes below, and the copies are in the first git commit:
- `aerial-samoucal.jpg` (Decs7J4jiO9 #0): its panel was cut.
- `bottles-olives.jpg` (De6kym5O-8_ #0).
- `harvest-hands.jpg`, `harvest-tractor.jpg` and `harvest-net-2.jpg` (DeulXX1jtlg #0, #2, #3).
- `year-harvest.jpg` (Da2gmflDq_G #4).
- `pour-glass.jpg` and `tasting-view.jpg` (DVO6xK4Dnao #0, #1).
- `stone-wall-bw.jpg` (DUfrPJnilmb #0).
- `label-closeup.jpg` (DbJTBxHDmMs #0): the sharpest shot of their logo, useful as a reference.

The documentary thumbnail is loaded from YouTube (`i.ytimg.com/vi/2U4gZFDnmQ8/hqdefault.jpg`). The illustrations (both landscapes, the daisies, the stone wall) and the fingerprint are drawn in code by `site/js/scenery.js`. They're ours.

## Copy

How to read the "Kind" column:
- **Theirs:** word for word.
- **Adapted:** their words, trimmed or rejoined.
- **Ours:** we wrote it, and it needs their approval.

| Section | Text on the page | Source | Kind |
| --- | --- | --- | --- |
| Page head | Title and link-preview title: "Azeite Carrapicho · Séculos de sabor" | Their tagline | Adapted |
| Page head | Description and link-preview text: "Azeite virgem extra de azeitona Galega, produzido na Serra de Santo António, no coração do Parque Natural das Serras de Aire e Candeeiros." | Instagram bio, Linktree and the product posts | Adapted |
| Hero | "Azeite Virgem Extra · Serra de Santo António" | Instagram bio and Linktree | Adapted |
| Hero | "Carrapicho", "Séculos de sabor" | Their tagline (DQAIUyrivw0 and others) | Theirs |
| 01 | "Um tesouro escondido, numa paisagem cársica." | DQAHGVwDJN7 | Theirs |
| 01 | "No coração do Parque Natural… planalto de calcário… e desafiam o terreno agreste." | DQAHGVwDJN7 combined with DQuWr44CCHO | Adapted ("planalto de calcário" is ours) |
| Cycle | "No olival, tudo faz parte do mesmo ciclo. Nada se perde." | DVmUQxXiu8s | Theirs |
| Pasture | "Desde sempre, os animais fazem parte da paisagem." and the paragraph below it | DbWWSMiDg3T | Heading adapted, paragraph theirs |
| Pasture | Documentary card title and "Documentário de Tiago Cerveira · 10 min" | The YouTube video's details | Adapted |
| 02 | "Pedra sobre pedra, sem pressa, guardando a memória de quem trabalhou a terra." | DUfrPJnilmb | Theirs |
| Maze | "Nas raízes de cada oliveira guardam-se memórias antigas…" | DRhDR-8Ci1v | Theirs |
| 03 | "O avô, o menino, um sobrenome e o amor pela terra." | DQAIUyrivw0 | Theirs |
| 03 | "Há séculos que o olival faz parte da nossa história… Mário Carrapicho." | Linktree "O Azeite Carrapicho" | Adapted |
| 03 | "Em 2025, Fernanda, a filha mais nova, pegou no seu conhecimento e experiência e criou a marca Carrapicho, em honra do pai." | Fernanda's photo (DeATM-eDuiT #1) and Linktree ("Criado em 2025") | Adapted |
| 03 | "Fomos ao baú e descobrimos os registos do Ti Carrapicho na campanha de 1987!", "Passados 40 anos, a história repete-se." | DdcGF4UjuwA | Theirs (their caption has a lowercase "ti") |
| 03 | "A mecanização veio facilitar o processo, mas sem pessoas, nada se fazia." | Their Instagram, probably DbJTBxHDmMs (the brand-history post). The exact post wasn't recorded | Theirs, but check the source |
| 03 | "Ficou o legado.", "Carrapicho · Séculos de sabor" | DQAIUyrivw0 | Theirs |
| 04 | "Quem somos" | Their "Quem somos?" story highlight | Theirs |
| 04 | "Mais do que uma família, somos quem dá vida à marca Carrapicho." | DeATM-eDuiT | Theirs |
| 04 | Names, roles and every caption (ages, "O homem da casa", "pão com azeite"…) | Text printed on DeATM-eDuiT #1–4 | Theirs |
| 04 | "Há trabalhos que se aprendem… E entretanto somos nós a mostrar aos mais novos como fazer." | DeulXX1jtlg | Adapted: their caption reads "Entretanto estamos nós a mostrar…" |
| 04 | "Por aqui tem sido assim, de geração em geração." | DeulXX1jtlg | Theirs |
| 05 | "Nunca será só uma garrafa de azeite." and "É o resultado de um ano…" | De6kym5O-8_ | Theirs (trimmed) |
| 05 | Abril: "O candeio", "Pequenas «bolinhas»…" | DXjfe-PCnba | Theirs (trimmed) |
| 05 | Maio: "A flor", "O olival está em flor…" | DX-DiS5jj4l and DXjfe-PCnba | Adapted |
| 05 | Julho: "O fruto", "Surgem as primeiras azeitonas… a brisa da Serra de Santo António…" | Daqu31rjmCr | Adapted |
| 05 | Setembro: "A apanha", "Colhemos a Galega ainda verde. Antigamente… frio e chuva…" | DUY3-ApDrCu and Da2gmflDq_G | Adapted |
| 05 | Outubro: "O lagar", "Da rede para a caixa, da caixa para o lagar." and "O nosso lagar parceiro: Ingrediente Mourisco." | DemjigTuqii ("Lagar parceiro: Ingrediente Mourisco") | The first sentence is ours; the second is adapted |
| 05 | Inverno: "A poda", "Os dias de sol permitem… trevos e gramíneas…" | DVmUQxXiu8s | Adapted |
| 06 | "Verde frutado · colheita precoce", "Maduro frutado · plena maturação" | The product cards (DUY3-ApDrCu #1, DUf87NrirJJ #1) | Theirs |
| 06 | "Galega Verde", "Galega Madura" | DeMMOZ1ue1L | Theirs |
| 06 | The Verde description ("Antes do tempo apressar o fruto, escolhemos a calma…") | DUY3-ApDrCu, caption and product card | Adapted |
| 06 | The Madura description ("…frutado e harmonioso, de perfil macio e envolvente. Feito com calma, respeito e saber.") | DUf87NrirJJ, caption and product card | Adapted |
| 06 | Tasting notes: "Erva cortada", "Amêndoa", "Final levemente picante" | DQuWr44CCHO and DQAHGVwDJN7 | Theirs |
| 06 | Tasting notes: "Fruta madura", "Macio", "Equilibrado" | The Madura product card | Adapted |
| 06 | "Polifenóis acima de 360 mg/kg" | The Verde product card says "teor de polifenóis superior a 360" | Adapted. **The "mg/kg" is ours: confirm it** |
| 06 | "500 ml", "Garrafa · Verde ou Madura", "2 L", "5 L", "Garrafão" | DbtNehcu0pG | Theirs |
| 06 | "Certificado pela marca coletiva Olivedos do Carso." | Linktree | Theirs |
| 06 | "Encomendar por mensagem" | DbtNehcu0pG ("envie-nos mensagem privada") | Adapted |
| Closing | "Porque as árvores sobrevivem às pessoas / e retribuem aquilo que recebem." | Text printed on DQAHAUxDLcb | Theirs |
| Footer | The address, email, social links and "Família Carrapicho e @mario_ssa" | The Instagram bio, Linktree and their photo credits | Theirs |

## Written by us (needs the client's approval)

- **Navigation and section labels:** "Território", "Legado", "Família", "O ano", "Azeites", "O território", "No olival", "O legado", "Um ano no olival", "Os azeites", plus the "01"–"06" numbering.
- **Buttons and prompts:** "Encomendar", "Enviar email", "Desça à serra", "Continue a descer →" (wide screens) and "Deslize para o lado →" (phones).
- **Headings:** "Galega, de duas maneiras." and "Da serra para a sua mesa."
- **Captions:** the archive photo's "A apanha, como sempre se fez."
- **Parts of other lines:** "Da rede para a caixa, da caixa para o lagar." (Outubro); "planalto de calcário" (01); the "mg/kg" unit.
- **Month names** on the O Ano cards. Each comes from when its post went up, or from what the post says: Setembro is the harvest month, per Db_vh3jjpyA.
- **Footer labels:** "Onde", "Fale connosco", "Fotografia" and the "© 2026" line.
- **All image alt texts.** The link preview reuses the Território one.

## Designed by us (no source of theirs)

- The illustrated serra at dawn and at dusk, the daisies, the sunrise and the photo opening out of the sun.
- The dry-stone wall that builds itself, and the quote lighting up word by word.
- The outlined "1987".
- The drawn arrows beside the family captions. They echo the hand-drawn arrows on their posts.
- **The temporary favicon:** an olive and a leaf in the page's colours (`site/favicon.svg`, `favicon.ico`, `apple-touch-icon.png`). It goes when the logo arrives.
- **The stand-ins for their logo:** the wordmark set in Cedarville Cursive and the fingerprint drawn in code. Neither is their logo, and both must be replaced by the real logo file.
