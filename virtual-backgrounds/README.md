# Wingravity virtual backgrounds

Brand backgrounds for Google Meet, Zoom and Microsoft Teams. Five dark,
minimal designs carrying the wordmark and a subtle space motif.

```
npm run generate          # all five, 1920x1080, into ./out
```

That's it. There are no dependencies to install, and rendering goes through the
Chrome already on your machine.

## The designs

| Name        | What it looks like |
| ----------- | ------------------ |
| `aurora`    | Deep charcoal with a soft teal aurora. The quietest option, safe anywhere. |
| `orbit`     | Faint orbital arcs with a single teal body in transit. Space, but restrained. |
| `starfield` | Near-black sky with a drift of stars and a faint teal nebula. |
| `horizon`   | A planet limb across the bottom edge, rim-lit in teal. The most cinematic of the set. |
| `eclipse`   | A dark body against a teal corona, held to one side. Bold, still quiet in the centre. |

Run `npm run list` to see the same table in the terminal.

## Options

```
node generate.mjs [options]

  -d, --design <name>     Render one design (default: all)
  -s, --scale <1|2>       1 = 1920x1080, 2 = 3840x2160 (default: 1)
  -p, --position <where>  Wordmark corner: bottom-right | bottom-left
                          | top-right | top-left (default: bottom-right)
      --logo-width <px>   Wordmark width in the 1920x1080 space (default: 360)
  -o, --out <dir>         Output directory (default: ./out)
      --guides            Overlay subject and platform-UI safe zones
      --list              List available designs
```

Examples:

```
node generate.mjs -d horizon              # one design
node generate.mjs --scale 2               # 4K, for high-DPI cameras
node generate.mjs -p top-left             # move the wordmark
node generate.mjs --guides                # check the layout
```

### Why bottom-right is the default

All three platforms paint the participant's name in the **bottom-left** corner
of the tile, and Meet and Teams put call controls along the bottom centre. The
bottom-right corner is the only one that stays clear on all three. Use
`--guides` to render an overlay showing the subject area, the name chip and
the control bar, so a design can be checked without joining a real call.

Note that Meet and Zoom mirror **your own preview**, so your background will look
flipped to you and correct to everyone else. Don't "fix" it.

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

Designs live in [`src/designs.mjs`](src/designs.mjs). Each one is an entry of
`{ description, css, layers }` authored in a fixed 1920x1080 coordinate space.
Higher resolutions come from the device scale factor, not from different CSS.
Add a key and it shows up in `--list` and in the default run automatically.

Two things to hold to when adding one:

- **Keep the centre quiet.** The person sits in the middle third, and detail there
  fights with the segmentation mask and reads as noise.
- **Pull colour from `brand/tokens.json`**, not from a screenshot. Those values
  come from the site's Tailwind theme.

## How it renders

`generate.mjs` builds a self-contained HTML page per design and screenshots it
with headless Chrome, via the shared renderer in [`lib/chrome.mjs`](../lib/chrome.mjs).
That looks for Chrome, Chromium, Edge and Brave in the usual macOS and Linux
locations; set `CHROME_PATH` to point it elsewhere.

Star positions come from a seeded PRNG, so a given design renders identically
every time and regenerating won't produce a gratuitous diff.
