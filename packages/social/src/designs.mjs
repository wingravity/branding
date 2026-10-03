/**
 * Every social image, sized for the platform that shows it.
 *
 * Covers, the link preview and the highlights are the 2021 artwork placed on
 * a canvas (see artwork.mjs). Each design gives the canvas in CSS pixels, the
 * device scale it renders at, and where the artwork sits in device pixels.
 *
 * `safe` marks the area a platform paints over (its avatar or page logo), so
 * `--guides` can show it. Coordinates are CSS pixels.
 */

import { wordmark, appIcon } from "@wingravity/render";
import { artworkSvg, artworkLayers, GROUND } from "./artwork.mjs";

/**
 * Place an artwork: scale it by `k` and put its top-left at (x, y), in device
 * pixels of the output. The canvas behind is the artwork's own ground, so
 * where the artwork stops there is no edge.
 */
const place = (name, { x = 0, y = 0, k = 1 } = {}) =>
  `<g transform="translate(${x} ${y}) scale(${k})">${artworkSvg(name).svg}</g>`;

/** A full-bleed SVG stage: `w`x`h` CSS pixels, drawn in device pixels. */
const stage = (w, h, scale, content) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w * scale} ${h * scale}"
  style="display:block"><rect width="100%" height="100%" fill="${GROUND}"/>${content}</svg>`;

const cover = ({ art, at, ...d }) => ({ ...d, build: () => stage(d.width, d.height, d.scale, place(art, at)) });

/**
 * A post reflowed into a square. The art and the type move separately:
 * `artAt` and `typeAt` are `{ x, y, k }` in a 1500x1500 layout (offset, then
 * scale, of the post's own 2000x1500 space), and the layout is then scaled to
 * the output.
 */
const square = ({ art: name, artAt = {}, typeAt = {}, ...d }) => ({
  ...d,
  build: () => {
    const L = artworkLayers(name);
    const k = (d.width * d.scale) / 1500;
    const g = (at, body) =>
      `<g transform="translate(${(at.x ?? 0) * k} ${(at.y ?? 0) * k}) scale(${k * (at.k ?? 1)})">${body}</g>`;
    return stage(d.width, d.height, d.scale, g(artAt, L.art) + g(typeAt, L.type));
  },
});

const post = (name, description) => cover({
  description: `Post, 4:3: ${description}`, width: 2000, height: 1500, scale: 1, art: name,
});

const FB_SAFE = { x: 0, y: 444, w: 330, h: 180, label: "page photo" };

export const designs = {
  "x-cover": cover({
    description: "X header. Astronaut, as live.",
    width: 1500, height: 500, scale: 2,
    safe: { x: 0, y: 330, w: 290, h: 170, label: "avatar" },
    art: "astronaut-wide",
  }),

  "facebook-cover": cover({
    description: "Facebook page cover. Astronaut, as live.",
    width: 1640, height: 624, scale: 1, safe: FB_SAFE,
    art: "astronaut-fb",
  }),
  "facebook-cover-telescope": cover({
    description: "Facebook cover, alternate: phone and telescope.",
    width: 1640, height: 624, scale: 1, safe: FB_SAFE,
    art: "telescope-fb",
  }),
  "facebook-cover-shuttle": cover({
    description: "Facebook cover, alternate: shuttle.",
    width: 1640, height: 624, scale: 1, safe: FB_SAFE,
    art: "shuttle-fb",
  }),

  "linkedin-company-cover": cover({
    description: "LinkedIn company page cover. Shuttle, on one line, as live.",
    width: 1128, height: 191, scale: 2,
    safe: { x: 0, y: 95, w: 210, h: 96, label: "page logo" },
    art: "shuttle-strip",
  }),

  /**
   * LinkedIn personal profile. Wider than the X header, and the profile photo
   * covers the bottom-left, so the X composition is scaled to the height and
   * pushed right; the extra width on the left is plain ground.
   */
  "linkedin-personal-cover": cover({
    description: "LinkedIn personal profile cover. The X composition, right-aligned.",
    width: 1584, height: 396, scale: 2,
    safe: { x: 0, y: 200, w: 420, h: 196, label: "profile photo" },
    art: "astronaut-wide",
    at: { x: 3168 - 3000 * 0.792, k: 0.792 },
  }),

  "og-card": cover({
    description: "Link preview (og:image, twitter:image). Moon, waves and wordmark.",
    width: 1200, height: 630, scale: 2,
    art: "moon-share",
  }),

  // Highlights stay at the source's own 1500px: no resampling, so the bytes
  // are stable, and Instagram downsizes them itself.
  "highlight-astronaut": cover({
    description: "Instagram highlight cover: astronaut.",
    width: 1500, height: 1500, scale: 1,
    art: "astronaut-square",
  }),
  "highlight-telescope": cover({
    description: "Instagram highlight cover: telescope.",
    width: 1500, height: 1500, scale: 1,
    art: "telescope-square",
  }),
  "highlight-shuttle": cover({
    description: "Instagram highlight cover: shuttle.",
    width: 1500, height: 1500, scale: 1,
    art: "shuttle-square",
  }),

  "post-launch": post("post-launch", "headline over the shuttle on the lunar surface."),
  "post-url": post("post-url", "wave lines and the address."),
  "post-telescope": post("post-telescope", "the telescope and the wordmark."),
  "post-astronaut": post("post-astronaut", "the astronaut and the wordmark."),

  "post-launch-square": square({
    description: "Post, 1:1: headline over the shuttle.",
    width: 1080, height: 1080, scale: 1, art: "post-launch", artAt: { x: -400 },
  }),
  "post-url-square": square({
    description: "Post, 1:1: wave lines and the address.",
    width: 1080, height: 1080, scale: 1, art: "post-url",
    artAt: { y: 187.5, k: 0.75 }, typeAt: { y: 187.5, k: 0.75 },
  }),
  "post-telescope-square": square({
    description: "Post, 1:1: the telescope and the wordmark.",
    width: 1080, height: 1080, scale: 1, art: "post-telescope", artAt: { x: -460, y: -150 },
  }),
  "post-astronaut-square": square({
    description: "Post, 1:1: the astronaut and the wordmark.",
    width: 1080, height: 1080, scale: 1, art: "post-astronaut",
    artAt: { y: -145 }, typeAt: { x: -500 },
  }),

  /**
   * The wordmark on charcoal, as every account uses today. Platforms crop
   * avatars to a circle; at 72% of the width the wordmark's corners stay inside
   * it (about 292px from the centre of an 800px square).
   */
  avatar: {
    description: "Profile picture for LinkedIn, X, Facebook, Instagram. Wordmark, circle-safe.",
    width: 800, height: 800, scale: 1,
    build: () => `<div style="width:800px;height:800px;background:${GROUND};display:grid;place-items:center">
  <div style="width:576px">${wordmark("dark").replace("<svg ", '<svg style="display:block;width:100%;height:auto" ')}</div></div>`,
  },
};

/**
 * Square icons from the app icon, in two cuts: padded (the default; favicon,
 * touch and PWA icons want a margin, and platforms mask the corners) and bleed
 * (the symbol edge to edge, as the old favicon was), suffixed `-bleed`.
 *
 * Headless Chrome stalls on a 32px window and will not scale below 0.5x, so
 * anything under ICON_MIN is laid out at ICON_MIN and halved by the device
 * scale factor. The output is still exactly `size` pixels.
 */
export const ICON_MIN = 64;
const ICON_SIZES = [
  { name: "app-icon", size: 512 },
  { name: "icon", size: 192 },
  { name: "apple-touch-icon", size: 180 },
  { name: "favicon", size: 32 },
];
export const icons = [true, false].flatMap((padded) =>
  ICON_SIZES.map(({ name, size }) => ({
    name: `${name}${padded ? "" : "-bleed"}-${size}x${size}`,
    size,
    padded,
  }))
);

export function iconLayout(size) {
  const css = Math.max(size, ICON_MIN);
  return { css, scale: size / css };
}

export function iconPage(size, padded = true) {
  const { css } = iconLayout(size);
  return `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0}html,body{width:${css}px;height:${css}px;overflow:hidden;background:transparent}
svg{display:block;width:${css}px;height:${css}px}
</style></head><body>${appIcon({ bleed: !padded })}</body></html>`;
}

export const designNames = Object.keys(designs);
