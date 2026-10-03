---
name: wingravity-brand
description: Applies Wingravity's brand (charcoal grounds, a single teal accent, Kanit and Space Mono, the wordmark and wg symbol, and the house voice) to anything made for or about Wingravity, such as pages, decks, documents, social images, emails, UI and copy. Use it whenever Wingravity, wingravity.com or Wingravity branding, colours, logo, fonts, tone of voice or style guidelines come up.
---

# Wingravity brand

The source of truth is the `wingravity/branding` repo
(`github.com/wingravity/branding`). Values come from
`packages/brand/tokens.json`. If the repo is available, read tokens from it
instead of copying the values below, and use the generators there before
hand-building an asset.

## Aesthetic

Dark, technical, one accent colour.

- **Ground:** charcoal `#18181b` to `#27282f`. Not black.
- **Accent:** teal, sparingly. Never a large fill.
- **Type:** Kanit 300 for body. Emphasis comes from size and order.
- **Motifs:** orbits and horizons, kept subtle, in the background.
- **Imagery:** real product screenshots over abstract art.
- **Key visual:** the moon, astronaut and laptop collage on the social covers,
  with the headline "Innovation from the ground up." and "up." lifted in teal.
  It is the one illustration. Use it as supplied and never add new space clip
  art around it.

Avoid startup gradients, neon on black, enterprise blue, stock photography, and
space clip art beyond the key visual.

## Colour

| Token | Hex | Role |
| :--- | :--- | :--- |
| `primary` | `#64dbca` | The teal. Accents only, on dark surfaces only. |
| `primaryLight` | `#86ecdc` | Hover or raised state. |
| `primaryDeep` | `#4bc7b4` | Pressed state. |
| `primaryInk` | `#34786f` | Teal on light grounds. The only teal for readable text on white. |
| `gray.900` | `#18181b` | Page ground. Also text on light. |
| `gray.800` | `#27282f` | Cards, raised surfaces. |
| `gray.700` | `#363a45` | Borders on dark. |
| `gray.600` | `#585966` | Muted text on light. |
| `gray.400` | `#9d9fa4` | Muted text on dark. |
| `gray.300` | `#d8d8d8` | Dividers on light. |
| `gray.200` | `#e9e9e9` | Light surface tint. |
| `yellow` | `#FABB05` | Rare highlight. Once per page, or not at all. |
| `white` | `#ffffff` | Text on dark. |

**Hard rule:** never put `primary` teal on white (1.68:1, fails). On light
grounds, use `gray.900` for text and `primaryInk` for anything teal that has to
be read. Print, letters and email bodies are light grounds.

## Type

- **Kanit** 300 (default), 400 for small text, 500 for rare emphasis. Headings
  and body. 700 only for a short display line (a banner headline, a slide
  title) at 40px or larger. Never use 600, and nothing above 700.
- **Space Mono** 400 and 700 for code, labels, metadata, eyebrows and
  timestamps. Never body text.
- Self-host the fonts and never hotlink Google Fonts. Where fonts can't load
  (email), fall back to Arial.

## Logo

- **Wordmark** "wingravity" in lowercase: "win" in white with "gravity" in
  `#66DBC9` on dark, or "win" in `#18181b` with "gravity" in `#34786f` on light.
  Those are the only two cuts. Use the files and never retype the wordmark.
  Minimum width is 120px. Clear space is the wordmark's height on every side.
  Social profile pictures use the full wordmark on `gray.800`.
- **Symbol** "wg", the w and g taken from the wordmark. Use it for tiny
  spaces (favicons, app icons, small UI). Minimum size is 16px. Never place
  it next to the wordmark.
- "win" and "gravity" are always two colours, and "gravity" sits higher: the
  foot of the n lines up with the bottom of the g. Never set the wordmark in
  one colour or put both halves on one baseline.
- Don't recolour, stretch, rotate, outline, add effects, box the logo, or use
  it as a pattern.
- Files are in `packages/brand/logo/`: `wordmark-on-{dark,light}.svg`,
  `symbol-on-{dark,light}.svg` (tight, no margin) with `-padded` square
  variants, and `app-icon.svg`, the app icon with a 12% margin. Use it for
  favicons and touch icons. `app-icon-bleed.svg` is the edge-to-edge
  version.

## Voice

- Lead with outcomes. Say what the client gets.
- Numbers over adjectives: since 2017, 8 to 16 weeks, 9+ products.
- Name the awkward part: fixed scope, named price, no handoffs to juniors.
- Sentence case in headings and UI.
- "Wingravity" is one word with a capital W. It is lowercase only inside the
  wordmark artwork.
- Mark the first prominent use in marketing as Wingravity™. Never use ®,
  because the mark is not registered.
- Banned words: revolutionary, cutting-edge, world-class, synergy, unlock,
  supercharge.

## Generators in the repo

| Need | Command (repo root) |
| :--- | :--- |
| Video-call backgrounds | `npm run generate:backgrounds` |
| Covers, link preview, posts, highlights, avatar, icons | `npm run generate:social-images` |
| Gmail signatures | `npm run generate:signatures` |
| Guidelines page and README imagery | `npm run generate:guidelines` |

Rendering uses the local Chrome and needs no dependencies. Run `npm install`
once to link the workspaces.
