# brand

The source of truth. Everything else in this repo reads from here.

```
tokens.json    Palette and typefaces
logo/          Wordmark, two cuts
fonts/         Vendored OFL typefaces
```

## Tokens

[`tokens.json`](tokens.json) is machine-readable and is the only place these
values are declared. Tools load it through [`lib/chrome.mjs`](../lib/chrome.mjs).

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
landing config: `primaryDeep` mixed 45% toward `gray.900`, which is the
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

The two cuts do not share the teal. `#66DBC9` is 1.38:1 on `gray.200` — on a
light ground the second half of the name simply stops being readable, so the
light cut takes `primaryInk`. Same hue, enough weight to hold.

**Do**

- Set a width and let the height follow. The viewBox is `0 0 157 27`.
- Clear space on every side: at least the wordmark's height, ~17% of its width.
- Minimum size: 120px wide on screen, 25mm in print. Below that the "i" dot and
  letter spacing collapse.

**Don't**

- Recolour the teal half. Two cuts exist and they are the only two: `#66DBC9`
  on dark, `primaryInk` on light. Do not sample a third for some in-between
  ground, and do not carry the dark cut's teal onto a light one.
- Scale non-uniformly, rotate, outline, add effects, or put it in a box.
- Retype it in another face, or use it as a repeating pattern.

No standalone mark exists, only the wordmark. See the
[roadmap](../README.md#roadmap).

The wordmark is a trademark, not an open asset. Third-party use, modification
and naming rules are in [`TRADEMARK.md`](../TRADEMARK.md).

## Fonts

| Role | Family | Weights |
| :--- | :--- | :--- |
| Headings and body | **Kanit** | 300 (default), 400, 500 |
| Code, labels, metadata | **Space Mono** | 400, 700 |

Both are OFL-licensed and vendored here as woff2, so this repo renders without a
network call. Production self-hosts them via `@fontsource/kanit` and
`@fontsource/space-mono`. Never hotlink `fonts.googleapis.com`.

Kanit 300 is the default. 400 for small text that would go thin, 500 for rare
emphasis. No Kanit above 500. Space Mono labels things: timestamps, tags, code,
eyebrow text.

## Keeping this current

`tokens.json` and the wordmarks are derived from `wingravity-landing`
(`tailwind.config.cjs` and `src/components/images/LogoImage.astro`), so this repo
is currently a downstream copy and can drift.

Until that flips and the landing site consumes a package published from here,
treat the landing config as authoritative. Re-derive; do not hand-edit.
