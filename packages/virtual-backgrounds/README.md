# Wingravity virtual backgrounds

Brand backgrounds for Google Meet, Zoom and Microsoft Teams. Three minimal
designs carrying the wordmark and a subtle space motif, each on a charcoal or a
paper ground, with the wordmark top or bottom.

```
npm run generate          # 3 designs x 2 themes x 2 corners = 12, into ./out
```

That's it. There are no dependencies to install, and rendering goes through the
Chrome already on your machine.

## The designs

| Name        | What it looks like |
| ----------- | ------------------ |
| `aurora`    | A soft teal aurora bleeding in from one corner. The quietest option, safe anywhere. |
| `orbit`     | Faint orbital arcs with a single teal body in transit. Space, but restrained. |
| `starfield` | A quiet drift of stars with a faint teal nebula off to one side. |

Run `npm run list` to see the same table in the terminal.

## Themes

Each design renders on two grounds, and `npm run generate` produces both.

| Theme | Ground | Use it when |
| ----- | ------ | ----------- |
| `dark`  | Charcoal, `gray.900` down toward black. The brand default. | Almost always. |
| `light` | Paper, `gray.200` with `gray.400` for depth. Not white. | Your room is bright and a dark tile makes you a silhouette. |

The two are not the same design with the colours inverted. A light ground
changes what the accent can do: `primary` (`#64dbca`) is a dark-surface colour
and vanishes on paper, so the light theme washes with `primaryDeep` at a
boosted alpha, draws every edge in a teal shaded toward ink, and paints stars in
`gray.700`. Shade and grain are both held back there too — on a light ground
they mix gray into the teal and turn it sage.

The light cut of the wordmark carries `primaryInk` (`#34786f`) rather than the
mark's `#66DBC9`, which was 1.38:1 on `gray.200` and stopped being readable at
tile size. That is a palette-level fix, declared in
[`brand/tokens.json`](../brand/tokens.json) and documented in
[`brand/README.md`](../brand/README.md#logo), so anything else rendering on a
light ground gets it too.

## Mirroring

Meet, Zoom and Teams all mirror **your own preview**, so an unmirrored
background looks flipped to you and correct to everyone else. `--mirror on`
pre-flips the whole frame, wordmark included, so the mirror cancels out.

Choose by whose view matters:

| | You see | Everyone else sees |
| :--- | :--- | :--- |
| default (`--mirror off`) | wordmark flipped, bottom-left | **wordmark correct, bottom-right** |
| `--mirror on` | **wordmark correct, bottom-right** | wordmark flipped, bottom-left, under the name chip |

There is no setting that satisfies both — the mirror is applied to your preview
only, not to what is transmitted. If the wordmark is there for the other
participants, leave mirroring off. If it is there so your own tile looks right,
turn it on and accept that the flipped mark lands near the name chip for
everyone else.

`--mirror both` writes both, suffixed `-mirrored`, so they can be compared side
by side before choosing.

## Where the wordmark sits

Two corners ship by default, and `--position` is a variant axis like the others:
`both` is bottom-right and top-right, `all` is four corners, and a
comma-separated list works too. Files for the default corner are unsuffixed;
any other corner is named in the filename.

| Corner | Clear of | Watch for |
| :--- | :--- | :--- |
| `bottom-right` (default) | the name chip, the control bar | nothing — the safe choice |
| `top-right` | the name chip, the control bar | hover chrome: Meet's pin, Teams' `...` |
| `bottom-left`, `top-left` | — | the name chip sits bottom-left on all three |

## Options

```
node generate.mjs [options]

  -d, --design <name>     Render one design (default: all)
  -t, --theme <name>      dark | light | both (default: both)
  -m, --mirror <state>    off | on | both (default: off)
  -s, --scale <1|2>       1 = 1920x1080, 2 = 3840x2160 (default: 1)
  -p, --position <where>  Wordmark corner: bottom-right | bottom-left
                          | top-right | top-left | both | all | a list
                          (default: both — bottom-right and top-right)
      --logo-width <px>   Wordmark width in the 1920x1080 space (default: 360)
  -o, --out <dir>         Output directory (default: ./out)
      --guides            Overlay subject and platform-UI safe zones
      --list              List available designs
```

Examples:

```
node generate.mjs -d orbit -t dark        # one design, one theme
node generate.mjs -t light                # just the light ground
node generate.mjs -p bottom-right         # only the bottom corner
node generate.mjs -m on                   # pre-flipped for your self-view
npm run generate:all                      # every combination, 24 files
node generate.mjs --scale 2               # 4K, for high-DPI cameras
node generate.mjs --guides                # check the layout
```

Files are named
`wingravity-<design>-<theme>-<w>x<h>[-<corner>][-mirrored][-guides].png`, where
each optional segment appears only when it departs from the default.

### Why the right-hand corners

All three platforms paint the participant's name in the **bottom-left** corner
of the tile, and Meet and Teams put call controls along the bottom centre. That
rules out both left corners outright and the bottom centre for anything wide.
Use `--guides` to render an overlay showing the subject area, the name chip and
the control bar, so a design can be checked without joining a real call.

Guides are drawn in file coordinates and are never mirrored, because platform
chrome is painted on top of the tile and is never mirrored either. So a normal
render with guides doubles as a preview of a *mirrored* file's self-view, and a
mirrored render with guides shows what the other participants get.

### 4K

`--scale 2` renders at 3840x2160. Only worth it if you're on a 4K camera, since
every platform downsamples to 1080p or lower for transmission, so the 1920x1080
files are the right default.

## Installing a background

The exact wording drifts between releases, but the path is stable:

- **Google Meet**: on the green room screen or in-call, open visual effects
  (the sparkle icon), then **Backgrounds → +** to upload a file.
- **Zoom**: Settings → **Background & effects**, then **+ → Add Image**.
- **Microsoft Teams**: on the pre-join screen, **Effects and avatars →
  Background effects → + Add new**.

All three accept 16:9 JPG/PNG; Zoom asks for at least 1280x720. The generated
1920x1080 files satisfy all of them.

## Adding a design

Designs live in [`src/designs.mjs`](src/designs.mjs). Each one is
`{ description, build(theme) }`, where `build` returns `{ css, layers }`
authored in a fixed 1920x1080 coordinate space. Higher resolutions come from the
device scale factor, not from different CSS. Add a key and it shows up in
`--list` and in the default run automatically.

Three things to hold to when adding one:

- **Keep the centre quiet.** The person sits in the middle third, and detail
  there fights with the segmentation mask and reads as noise.
- **Take every colour from the theme**, never from a hex. `build` is handed the
  theme; ask it for `glow()` for atmosphere, `line()` for anything with an edge,
  `shade()` and `lift()` for depth, and the ramp (`raised` … `deepest`) for the
  ground. Each carries the theme's own scale factors, so one stated alpha lands
  correctly on both grounds.
- **Name by depth, not by lightness.** `deepest` means furthest back, which is
  near-black on charcoal and a mid gray on paper. A design that says what it
  means renders on both without branching.

Themes themselves live in [`src/themes.mjs`](src/themes.mjs), and every value in
them is mixed from two `brand/tokens.json` colours — so the grounds follow the
site theme instead of drifting from it.

## How it renders

`generate.mjs` builds a self-contained HTML page per design and screenshots it
with headless Chrome, via the shared renderer in [`lib/chrome.mjs`](../lib/chrome.mjs).
That looks for Chrome, Chromium, Edge and Brave in the usual macOS and Linux
locations; set `CHROME_PATH` to point it elsewhere.

Star positions come from a seeded PRNG, so a given design renders identically
every time and regenerating won't produce a gratuitous diff.
