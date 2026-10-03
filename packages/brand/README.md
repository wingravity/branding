# brand

The source of truth. Everything else in this repo reads from here.

```
tokens.json    Palette and typefaces. The only place values are declared.
tokens.css     The same palette as custom properties. Generated; npm run generate:tokens-css.
index.mjs      tokens(), wordmark(), symbol(), appIcon(), fontFaces()
logo/          Wordmark and symbol, two cuts each, plus the app icon
fonts/         Vendored OFL typefaces
```

Published as `@wingravity/brand`, so a site can consume it directly:

```js
import { tokens, logoPath } from "@wingravity/brand";
import "@wingravity/brand/tokens.css"; // --wg-primary, --wg-gray-900, …
```

## Tokens

[`tokens.json`](tokens.json) is machine-readable and is the only place these
values are declared. Tools load it through [`index.mjs`](index.mjs), and
[`tokens.css`](tokens.css) is generated from it.

| Token | Hex | Role |
| :--- | :--- | :--- |
| `primary` | `#64dbca` | The teal. Accents only, on dark surfaces only. |
| `primaryLight` | `#86ecdc` | Hover or raised state of the teal. |
| `primaryDeep` | `#4bc7b4` | Pressed state, and the teal on lighter surfaces. |
| `primaryInk` | `#34786f` | The teal on light grounds, where the others fail contrast. |
| `gray.900` | `#18181b` | Darkest surface. Page ground. |
| `gray.800` | `#27282f` | Raised dark surface. Cards. Also the PWA theme colour. |
| `gray.700` | `#363a45` | Borders and dividers on dark. |
| `gray.600` | `#585966` | Muted text on **light** surfaces. |
| `gray.400` | `#9d9fa4` | Muted text on **dark** surfaces. |
| `gray.300` | `#d8d8d8` | Dividers on light. |
| `gray.200` | `#e9e9e9` | Light surface tint. |
| `yellow` | `#FABB05` | Rare highlight. Once per page, or not at all. |
| `white` | `#ffffff` | Primary text on dark. |

The teal in "gravity" is `#66DBC9`, not `primary`. It belongs to the mark, not
the palette. Do not "correct" it or sample it for UI.

`primaryInk` is the one token derived here rather than extracted from the
website theme: `primaryDeep` mixed 45% toward `gray.900`, which is the
shallowest mix that clears 4.5:1 on white. It exists because the teal family has
no member that survives a light ground, and the light cut of the wordmark needs
one.

### Contrast

| Pair | Ratio | |
| :--- | ---: | :--- |
| `primary` on `gray.900` | 10.57:1 | ✅ AAA |
| `primary` on `gray.800` | 8.76:1 | ✅ AAA |
| `white` on `gray.900` | 17.72:1 | ✅ AAA |
| `yellow` on `gray.900` | 10.27:1 | ✅ AAA |
| `gray.600` on `white` | 6.92:1 | ✅ AA |
| `gray.400` on `gray.900` | 6.69:1 | ✅ AA |
| `primaryInk` on `white` | 5.17:1 | ✅ AA |
| `primaryInk` on `gray.200` | 4.26:1 | ✅ AA |
| `primaryDeep` on `white` | 2.07:1 | ❌ Large decoration only |
| **`primary` on `white`** | **1.68:1** | ❌ **Never do this** |

Teal is a dark-surface colour. On light grounds use `gray.900` for text and
`primaryInk` for anything teal that has to be read. `primary` and `primaryDeep`
are for dark surfaces; on light they tint rather than mark.

## Logo

| File | "win" | "gravity" | Use on |
| :--- | :--- | :--- | :--- |
| [`wordmark-on-dark.svg`](logo/wordmark-on-dark.svg) | `#FFFFFF` | `#66DBC9` | Dark surfaces |
| [`wordmark-on-light.svg`](logo/wordmark-on-light.svg) | `#18181b` | `#34786f` | Light surfaces |

The two cuts do not share the teal. `#66DBC9` is 1.38:1 on `gray.200`. On a
light ground the second half of the name simply stops being readable, so the
light cut takes `primaryInk`. Same hue, enough weight to hold.

**Do**

- Set a width and let the height follow. The viewBox is `0 0 1102.46 188.02`,
  the 2021 master's own coordinates.
- Clear space on every side: at least the wordmark's height, ~17% of its width.
- Minimum size: 120px wide on screen, 25mm in print. Below that the "i" dot and
  letter spacing collapse.

**Don't**

- Recolour the teal half. Two cuts exist and they are the only two: `#66DBC9`
  on dark, `primaryInk` on light. Do not sample a third for some in-between
  ground, and do not carry the dark cut's teal onto a light one.
- Set it in one colour. "win" and "gravity" are always two colours.
- Realign the halves. "gravity" sits higher than "win": the foot of the n lines
  up with the bottom of the g, not with the baseline of "ravity".
- Scale non-uniformly, rotate, outline, add effects, or put it in a box.
- Retype it in another face, or use it as a repeating pattern.

### Symbol

The **w** and **g** of the wordmark, with "in" and "ravity" taken out. They use
the wordmark's own paths, so the symbol is a cut-down wordmark, not a separate
drawing. The g keeps its lift above the w's baseline.

| File | Use on |
| :--- | :--- |
| [`symbol-on-dark.svg`](logo/symbol-on-dark.svg) | Dark surfaces. Same two colours as the dark wordmark. |
| [`symbol-on-light.svg`](logo/symbol-on-light.svg) | Light surfaces. Same two colours as the light wordmark. |
| [`app-icon.svg`](logo/app-icon.svg) | **The app icon.** Favicons, touch icons, PWA icons. The symbol at 76% width, centred on `gray.800`; survives platform masks. |
| [`app-icon-bleed.svg`](logo/app-icon-bleed.svg) | The symbol edge to edge on `gray.800`, as the old favicon was. Only where something else adds the margin. |
| [`symbol-on-dark-padded.svg`](logo/symbol-on-dark-padded.svg), [`symbol-on-light-padded.svg`](logo/symbol-on-light-padded.svg) | The same padded square, transparent, for placing on your own ground. |

The wordmark and plain symbol files are tight to the artwork, with no margin, so they can be
placed precisely. The padded files carry their margin with them.

Use the symbol where the space is tiny: favicons, app icons, small UI. Wherever
the wordmark fits at 120px or wider, use the wordmark. That includes social
profile pictures, which carry the full wordmark on `gray.800`. Never put the two side by side; the symbol is not a logo
lockup.

- Minimum size: 16px on screen, 6mm in print.
- Clear space: at least the height of the w on every side.
- The app icon bleeds, so it loses its edges in a circular crop. For circles,
  use the avatar from `@wingravity/social`: the wordmark, circle-safe.

The wordmark is a registered EU trade mark. Third-party use, modification
and naming rules are in [`TRADEMARK.md`](../../TRADEMARK.md).

## Fonts

| Role | Family | Weights |
| :--- | :--- | :--- |
| Headings and body | **Kanit** | 300 (default), 400, 500, 700 (display only) |
| Code, labels, metadata | **Space Mono** | 400, 700 |

Both are OFL-licensed and vendored here as woff2, so this repo renders without a
network call. Production self-hosts them via `@fontsource/kanit` and
`@fontsource/space-mono`. Never hotlink `fonts.googleapis.com`.

Kanit 300 is the default. 400 for small text that would go thin, 500 for rare
emphasis. 700 only for a short display line (a banner headline, a slide title,
a cover) at 40px or larger; never for body or UI. Nothing in between, and
nothing above 700. The social covers have always been set in Kanit 700. Space Mono labels things: timestamps, tags, code,
eyebrow text.

## Keeping this current

`tokens.json` is derived from the wingravity.com theme, so for colour this repo
is a downstream copy and can drift. Until the website consumes
`@wingravity/brand`, treat the website's theme as authoritative for colour.
Re-derive; do not hand-edit.

The logo files are the other way round. They are rebuilt from the 2021 master
artwork, and they are the authority. The website carries a simplified copy whose
g has its tail cut off; replace it with these files. After any change
to `tokens.json`, run `npm run generate:tokens-css` at the repo root to regenerate
`tokens.css`.
