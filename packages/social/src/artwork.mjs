/**
 * The 2021 covers and posts, as reusable artwork.
 *
 * Each entry is one original raster, the rectangles where its type was
 * flattened in, and that type re-specified as live text. Rendering paints the
 * old type out with the ground colour and sets the same words in Kanit at the
 * same place, so the illustration is untouched and the type is sharp at any
 * scale.
 *
 * All numbers are in the artwork's own pixels (for @2x sources, `k: 0.5`
 * brings the raster into 1x space). Text positions are the glyph origin (x)
 * and baseline (y), worked back from the originals' ink boxes with Kanit's own
 * metrics. The headline keeps the same proportions everywhere:
 *
 *   Kanit 700, line height 1.255em, word spacing +0.08em
 *   "up." the same size, tracked -0.03em, in the wordmark's teal, lifted
 *         0.365em above the last line's baseline (0.205em on one line)
 *   first line indented ~0.07em, an optical correction kept as drawn
 */

import { tokens, wordmark } from "@wingravity/render";
import { source } from "./sources.mjs";

const C = tokens().colors;
export const GROUND = C.gray["800"];

/* ------------------------------------------------------------------ type -- */

const HEADLINE = { weight: 700, wordSpacing: ".08em" };

/** "Innovation / from the ground up." on two lines. */
const headline = (size, l1, l2, up) => [
  { ...HEADLINE, size, text: "Innovation", x: l1[0], y: l1[1] },
  { ...HEADLINE, size, text: "from the ground", x: l2[0], y: l2[1] },
  { ...HEADLINE, size, text: "up.", x: up[0], y: up[1], fill: C.logoAccent, letterSpacing: "-.03em" },
];

/* --------------------------------------------------------------- artwork -- */

export const artwork = {
  /** Astronaut, laptop and moon. Live on X. */
  "astronaut-wide": {
    file: "TW_Cover1.png",
    erase: [[465, 375, 1025, 240]],
    text: headline(107.5, [482.2, 459.3], [474.9, 594.2], [1329.7, 555.0]),
  },
  /** The same, as live on Facebook, with its two alternates. */
  "astronaut-fb": {
    file: "FB_Cover1.png",
    erase: [[240, 235, 560, 145]],
    text: headline(56.5, [258.5, 291.0], [254.4, 362.0], [702.7, 341.3]),
  },
  "telescope-fb": {
    file: "FB_Cover2.png",
    erase: [[800, 240, 560, 140]],
    text: headline(56.5, [822.5, 291.0], [819.4, 362.0], [1266.7, 341.3]),
  },
  "shuttle-fb": {
    file: "FB_Cover3.png",
    erase: [[800, 240, 560, 140]],
    text: headline(56.5, [822.5, 291.0], [819.4, 362.0], [1266.7, 341.3]),
  },
  /** Shuttle, laptop and moon, headline on one line. Live on LinkedIn. */
  "shuttle-strip": {
    file: "LI_Cover1.png",
    erase: [[405, 150, 895, 75]],
    text: [
      { ...HEADLINE, size: 59, text: "Innovation from the ground", x: 421.3, y: 206.7 },
      { ...HEADLINE, size: 59, text: "up.", x: 1209.6, y: 194.6, fill: C.logoAccent, letterSpacing: "-.03em" },
    ],
  },
  /** Moon and wave lines with the wordmark, for link previews. */
  "moon-share": {
    file: "LinkShare.png",
    erase: [[115, 990, 720, 150]],
    marks: [{ x: 131, y: 1006, width: 686 }],
  },

  /** The three visuals alone, square. Instagram highlight covers. */
  "astronaut-square": { file: "Highlights1.png" },
  "telescope-square": { file: "Highlights2.png" },
  "shuttle-square": { file: "Highlights3.png" },

  /** Post: shuttle on the lunar surface, with the headline. */
  "post-launch": {
    file: "PostImage1@2x.png", k: 0.5,
    erase: [[140, 150, 1290, 320]],
    text: headline(130.3, [166.1, 258.7], [157.7, 421.9], [1194.8, 374.1]),
  },
  /** Post: wave lines and the address. */
  "post-url": {
    file: "PostImage2@2x.png", k: 0.5,
    erase: [[150, 720, 970, 120]],
    text: [{
      weight: 500, size: 98.5, x: 170, y: 803.5,
      spans: [["www.", C.logoAccent], ["wingravity", C.white], [".com", C.logoAccent]],
    }],
  },
  /** Post: the telescope and the wordmark. The 2021 copy is painted out. */
  "post-telescope": {
    file: "PostImage3@2x.png", k: 0.5,
    erase: [[120, 150, 1000, 470], [110, 1270, 450, 110]],
    marks: [{ x: 139, y: 1289, width: 388 }],
  },
  /** Post: the astronaut and the wordmark. The 2021 copy is painted out. */
  "post-astronaut": {
    file: "PostImage4@2x.png", k: 0.5,
    erase: [[1120, 150, 800, 330], [1450, 1270, 480, 110]],
    marks: [{ x: 1491, y: 1289, width: 387 }],
  },
};

/* ------------------------------------------------------------- rendering -- */

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const svgInner = (svg) => svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
const viewBox = (svg) => svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);

function textEl(t) {
  const style = [
    "font-family:Kanit",
    `font-weight:${t.weight}`,
    `font-size:${t.size}px`,
    t.wordSpacing && `word-spacing:${t.wordSpacing}`,
    t.letterSpacing && `letter-spacing:${t.letterSpacing}`,
  ].filter(Boolean).join(";");
  const anchor = t.anchor ? ` text-anchor="${t.anchor}"` : "";
  const body = t.spans
    ? t.spans.map(([s, fill]) => `<tspan fill="${fill}">${esc(s)}</tspan>`).join("")
    : esc(t.text);
  return `<text x="${t.x}" y="${t.y}" fill="${t.fill ?? C.white}"${anchor} style="${style}">${body}</text>`;
}

function markEl({ x, y, width }) {
  const svg = wordmark("dark");
  const k = width / viewBox(svg)[2];
  return `<g transform="translate(${x} ${y}) scale(${k})">${svgInner(svg)}</g>`;
}

/**
 * One artwork as two SVG layers in its own pixel space: `art` (the raster
 * with its old type painted out) and `type` (live text and wordmarks). They
 * can be placed separately when a format reflows the type around the art.
 */
export function artworkLayers(name) {
  const a = artwork[name];
  const src = source(a.file);
  const k = a.k ?? 1;
  const width = src.width * k;
  const height = src.height * k;
  const art = [`<image href="${src.uri}" x="0" y="0" width="${width}" height="${height}"/>`];
  for (const [x, y, w, h] of a.erase ?? []) {
    art.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${GROUND}"/>`);
  }
  const type = [...(a.text ?? []).map(textEl), ...(a.marks ?? []).map(markEl)];
  return { art: art.join("\n"), type: type.join("\n"), width, height };
}

/** Both layers together, for placing an artwork as drawn. */
export function artworkSvg(name) {
  const { art, type, width, height } = artworkLayers(name);
  return { svg: `${art}\n${type}`, width, height };
}
