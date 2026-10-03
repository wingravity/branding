# Wingravity social images

Covers, link previews, posts, highlights, avatars and icons for every account,
each at its platform's exact size. They're committed in [`dist/`](dist/), ready
to upload.

| Account | Cover | Avatar |
| :--- | :--- | :--- |
| [LinkedIn company](https://www.linkedin.com/company/wingravity/) | `linkedin-company-cover` | `avatar` |
| LinkedIn personal | `linkedin-personal-cover` | your photo |
| [X](https://x.com/wingravity) | `x-cover` | `avatar` |
| [Facebook](https://www.facebook.com/wingravity) | `facebook-cover` (or `-telescope`, `-shuttle`) | `avatar` |
| [Instagram](https://www.instagram.com/wingravity/) | `highlight-*` for highlight covers | `avatar` |

## What's here

| Name | Size | Use |
| :--- | :--- | :--- |
| `x-cover` | 1500x500 @2x | X header. Astronaut. |
| `facebook-cover` | 1640x624 | Facebook cover. Astronaut; `-telescope` and `-shuttle` are the alternates. |
| `linkedin-company-cover` | 1128x191 @2x | LinkedIn company page. Shuttle, headline on one line. |
| `linkedin-personal-cover` | 1584x396 @2x | LinkedIn profile. The X composition, right of the profile photo. |
| `og-card` | 1200x630 @2x | Link previews: `og:image`, `twitter:image`. Moon, waves, wordmark. |
| `highlight-*` | 1500x1500 | Instagram highlight covers: astronaut, telescope, shuttle. |
| `post-*` | 2000x1500 | Posts, 4:3: `launch` (headline), `url` (address), `telescope` and `astronaut` (illustration and wordmark). |
| `post-*-square` | 1080x1080 | The same posts, reflowed for a square feed. |
| `avatar` | 800x800 | Profile picture everywhere. The wordmark at 72% width, circle-safe. |
| `app-icon`, `icon`, `apple-touch-icon`, `favicon` | 512, 192, 180, 32 | From [`app-icon.svg`](../brand/logo/app-icon.svg), with its margin. `-bleed` files are edge to edge. |

"@2x" images are rendered at twice the stated size, which is what the platform
wants uploaded for sharp display.

## How the covers are made

Each image is built from the 2021 artwork:
- the astronaut, telescope and shuttle collages
- the moon and wave lines
- the "Innovation from the ground up." headline

The original rasters sit on a flat `gray.800`, so the illustration is placed as
drawn, pixel for pixel. The headline is painted out and set again as live text
at the original coordinates:
- Kanit 700
- line height 1.255em
- word spacing +0.08em
- "up." in the wordmark teal, lifted 0.365em

Every text block lands within a few pixels of the original. The numbers and
the reasoning are in [`src/artwork.mjs`](src/artwork.mjs).


## Regenerating

```
npm run generate:social-images   # everything, into ./dist
node generate-social-images.mjs -o x-cover
node generate-social-images.mjs --guides # outline where each platform covers the image
node generate-social-images.mjs --list
```

The covers, posts and highlights need the 2021 rasters, which aren't committed.
Copy the 2021 social media artwork to `sources/design/`. That folder is gitignored, as is `sources/live/`, which keeps
a copy of the files that were live on each account before this refresh. The
avatar and icons need nothing but the repo.

Rendering uses the Chrome already on your machine, via
[`@wingravity/render`](../render/). There is nothing to install.
