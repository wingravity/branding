# guidelines

The brand guidelines document and the imagery the root README shows.

```
npm run generate:guidelines   # from this folder or the repo root
```

| Script | Writes | |
| :--- | :--- | :--- |
| [`render-docs.mjs`](render-docs.mjs) | `docs/assets/palette.png`, `type.png` | README colour and type strips |
| [`guidelines.mjs`](guidelines.mjs) | `docs/assets/logo.png` | Wordmark, symbol, app icon, both cuts, clear space drawn |
| | `docs/assets/misuse.png` | Nine logo mistakes, actually rendered |
| | `docs/index.html` | The full guidelines, one self-contained file. Served by GitHub Pages at https://wingravity.github.io/branding/ |

## The guidelines page

One file: fonts, logos and both sheets are inlined, so it opens from disk,
attaches to an email, or drops onto any static host as it is. About 550 KB.

| Section | |
| :--- | :--- |
| Overview | Aesthetic in six cards |
| Logo | Wordmark, symbol, app icon; which to use where; clear space and minimums |
| Misuse | `misuse.png` and the rules behind it |
| Colour | Token table, plus a contrast matrix computed with the WCAG formula |
| Type | Specimen and weight rules |
| Voice | The README voice rules, with a say/avoid pair |
| Imagery | What to use, what to avoid |
| Templates | Every generator package in the repo |
| Trademark | Summary of [`TRADEMARK.md`](../../TRADEMARK.md) |

Dark on screen. Printing gives a light A4 document: the light wordmark, grays
for text, and `primaryInk` for anything teal that has to be read.

## Rules

- No hex in either script. Everything comes from `@wingravity/brand`.
- Contrast ratios are computed, never typed, so a token change cannot leave a
  stale number in the document.
- Output is committed. GitHub has to render the README without a build step.
- Deterministic. Re-running produces identical bytes; a diff means something
  actually changed.
