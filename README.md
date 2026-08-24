# Wingravity brand

Shared brand assets and the tools that generate branded artefacts from them.

```
brand/                    Source of truth — colours, type, logo
  tokens.json
  logo/
    wordmark-on-dark.svg
    wordmark-on-light.svg

virtual-backgrounds/      Meeting backgrounds for Meet, Zoom and Teams
```

Each tool folder is self-contained and has its own README. Anything that
needs a brand colour or the logo reads it from `brand/` rather than
hard-coding a hex value.

## brand/

`tokens.json` holds the palette and typefaces, extracted from
`wingravity-landing/tailwind.config.cjs`. The key values:

| Token           | Value     | Use |
| --------------- | --------- | --- |
| `primary`       | `#64dbca` | The teal. Accents, never large fills. |
| `gray.900`      | `#18181b` | Darkest surface. |
| `gray.800`      | `#27282f` | Raised dark surface. |
| `gray.700`      | `#363a45` | Borders, dividers on dark. |
| `gray.400`      | `#9d9fa4` | Muted text on dark. |
| `yellow`        | `#FABB05` | Rare highlight. |

Type is **Kanit** for headings and body, **Space Mono** for code and labels.

The logo comes in two cuts. `wordmark-on-dark.svg` has a white "win"; 
`wordmark-on-light.svg` has it in `#18181b`. The "gravity" half stays
`#66DBC9` in both — that teal is part of the mark, not a theme colour.

If the site theme changes, re-derive `tokens.json` from the Tailwind config
rather than editing it by hand.

## Adding a tool

New brand-related generators go in their own top-level folder next to
`virtual-backgrounds/`, with a README and a `package.json` of their own.
Slide templates, social cards, email signatures and one-pagers all fit here.
