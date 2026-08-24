<div align="center">

<br>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="brand/logo/wordmark-on-dark.svg">
  <img src="brand/logo/wordmark-on-light.svg" alt="Wingravity" width="320">
</picture>

<br><br>

**Brand system.** Tokens, logo, and the generators that use them.

<a href="https://wingravity.com">Website</a> &nbsp;·&nbsp;
<a href="https://docs.wingravity.com">Handbook</a> &nbsp;·&nbsp;
<a href="#aesthetic">Aesthetic</a> &nbsp;·&nbsp;
<a href="#colour">Colour</a> &nbsp;·&nbsp;
<a href="#type">Type</a> &nbsp;·&nbsp;
<a href="#contents">Contents</a> &nbsp;·&nbsp;
<a href="#voice">Voice</a>

</div>

<br>

---

## Aesthetic

Dark, technical, one accent colour.

| | |
| :--- | :--- |
| **Ground** | Charcoal `#18181b` to `#27282f`. Not black. |
| **Accent** | Teal, sparingly. Never a large fill. |
| **Type** | Kanit 300 for body. Emphasis by hierarchy, not weight. |
| **Motifs** | Orbits and horizons, kept subtle. Atmosphere, not clip art. |
| **Imagery** | Real product screenshots over abstract art. |

Not: startup gradients, neon-on-black, enterprise blue, stock photography,
clip-art rockets.

<br>

---

## Colour

<img src="docs/assets/palette.png" alt="Wingravity colour palette" width="100%">

Tokens in [`brand/tokens.json`](brand/tokens.json). Full table and contrast
matrix in [`brand/README.md`](brand/README.md).

> [!WARNING]
> Teal on white is **1.68:1** and fails contrast. It is a dark-surface colour.
> On light grounds use `gray.900` for text.

<br>

## Type

<img src="docs/assets/type.png" alt="Kanit and Space Mono type specimen" width="100%">

| Family | Weights | Use |
| :--- | :--- | :--- |
| **Kanit** | 300, 400, 500 | Headings and body. 300 is the default. |
| **Space Mono** | 400, 700 | Code, labels, metadata. Not a body face. |

No Kanit above 500. Both are vendored in [`brand/fonts/`](brand/fonts/) and
self-hosted in production. Do not hotlink Google Fonts.

<br>

---

## Contents

| | |
| :--- | :--- |
| [`brand/`](brand/) | Tokens, logo, typefaces. Source of truth. |
| [`virtual-backgrounds/`](virtual-backgrounds/) | Backgrounds for Meet, Zoom and Teams. |
| [`lib/`](lib/) | Shared renderer and token loader. |
| [`scripts/`](scripts/) | Repo-level generators, including this page's imagery. |
| [`docs/assets/`](docs/assets/) | Committed documentation imagery. |
| [`TRADEMARK.md`](TRADEMARK.md) | What may be done with the name and the mark. |

Each folder has its own README. No install step; rendering uses the Chrome
already on your machine.

<br>

---

## Voice

- Outcomes, not effort.
- Numbers over adjectives. 2017. 8 to 16 weeks. 9+ products.
- Name the awkward part: fixed scope, named price, no handoffs to juniors.
- Sentence case in headings and UI.
- "Wingravity" is one word, capital W. Lowercase only inside the wordmark.
- Mark the first prominent use in marketing as Wingravity&trade;. Never &reg; —
  the mark is not registered. Rules in [`TRADEMARK.md`](TRADEMARK.md).
- Avoid: revolutionary, cutting-edge, world-class, synergy, unlock, supercharge.

<br>

---

## Conventions

- Assets are generated from tokens, not exported by hand.
- No hard-coded hex. Tools read `brand/tokens.json`.
- `out/` is gitignored. `docs/assets/` is committed so GitHub can render this page.
- Generators are deterministic. Re-running produces identical bytes.

<br>

---

## Roadmap

- [x] `TRADEMARK.md`. Name and logo reserved.
- [ ] `LICENSE` for the code and tokens, with a trademark carve-out clause
      pointing at [`TRADEMARK.md`](TRADEMARK.md).
- [ ] **Standalone mark.** No vector symbol exists, only the wordmark, and the
      app icon is a raster PNG wrapped in an SVG. Every square context (avatars,
      favicons, Slack) is unserved. Biggest gap in the system.
- [ ] Publish `brand/` as a package so the landing site consumes these tokens.
- [ ] Social templates: OG card, square avatar, LinkedIn banner, X header.
- [ ] Document templates: letterhead, invoice, one-pager.
- [ ] Email signature, slide template, illustration and photography direction.
- [ ] Logo misuse examples, shown rather than described.

<br>

---

<div align="center">
<sub>

Typefaces licensed under the SIL Open Font License. Wingravity&trade; and the
Wingravity wordmark are trademarks, not covered by any code license in this
repository. See <a href="TRADEMARK.md">TRADEMARK.md</a>.

</sub>
</div>
