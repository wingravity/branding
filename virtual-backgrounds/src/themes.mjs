/**
 * Background themes.
 *
 * A design is authored once and painted twice. Everything a design could want
 * a colour for lives here, so `designs.mjs` never restates a hex and swapping
 * the ground from charcoal to paper needs no change to a design.
 *
 * The ramp is named by *depth*, not by lightness: `raised` is the surface
 * nearest the viewer and `deepest` the one furthest away. In the dark theme
 * that runs from a lifted charcoal down toward black; in the light theme from
 * white down through the gray tokens. A design that reaches for `deepest`
 * therefore gets "furthest back" in both, which is what it meant.
 *
 * Every value is derived from `brand/tokens.json` by mixing two tokens, so the
 * themes follow the site theme rather than drifting from it.
 */

import { tokens } from "../../lib/chrome.mjs";

const C = tokens().colors;

const parse = (hex) => {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};

const format = (rgb) =>
  "#" + rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

/** Blend two brand hexes. `t` is how far to travel from `a` toward `b`. */
export function mix(a, b, t) {
  const [x, y] = [parse(a), parse(b)];
  return format(x.map((v, i) => v + (y[i] - v) * t));
}

/** `#rrggbb` + alpha -> `rgba(...)`. Alpha is clamped, since themes scale it. */
export function rgba(hex, alpha) {
  const [r, g, b] = parse(hex);
  const a = Math.min(1, Math.max(0, alpha));
  return `rgba(${r},${g},${b},${Number(a.toFixed(3))})`;
}

const dark = {
  name: "dark",
  /** Which wordmark file, and what sits behind the stage. */
  wordmark: "dark",
  page: mix(C.gray["900"], C.black, 0.75),

  // Ground: lifted charcoal down toward black. Not black — see brand/README.
  raised: mix(C.gray["900"], C.gray["700"], 0.22),
  raisedSoft: mix(C.gray["900"], C.gray["700"], 0.13),
  base: C.gray["900"],
  sunken: mix(C.gray["900"], C.black, 0.12),
  deep: mix(C.gray["900"], C.black, 0.33),
  deeper: mix(C.gray["900"], C.black, 0.6),
  deepest: mix(C.gray["900"], C.black, 0.75),


  // Accent. On charcoal the brand teal carries at full strength.
  accent: C.primary,
  accentLine: C.primary,
  glowScale: 1,
  lineScale: 1,

  star: C.white,
  starAccent: C.primary,
  starScale: 1,

  liftColor: C.gray["700"],
  shadeColor: C.black,
  shadeScale: 1,

  grainBlend: "overlay",
  grainOpacity: 0.05,
  logoShadow: `drop-shadow(0 2px 18px ${rgba(C.black, 0.55)})`,
};

const light = {
  name: "light",
  wordmark: "light",
  page: C.gray["300"],

  // Ground: paper, not white. gray.200 is the ground and gray.400 supplies the
  // depth — mixing toward gray.400 rather than gray.300 keeps a usable range
  // between the brightest highlight and the furthest surface, and gray.400 is
  // cool, so the light ramp leans the same direction the charcoal one does.
  raised: mix(C.gray["200"], C.white, 0.85),
  raisedSoft: mix(C.gray["200"], C.white, 0.62),
  base: mix(C.gray["200"], C.white, 0.35),
  sunken: C.gray["200"],
  deep: mix(C.gray["200"], C.gray["400"], 0.3),
  deeper: mix(C.gray["200"], C.gray["400"], 0.58),
  deepest: mix(C.gray["200"], C.gray["400"], 0.85),


  // Accent. #64dbca is a dark-surface colour and disappears on paper. Washes
  // use the deeper teal at a boosted alpha; anything with an edge (a hairline,
  // a solid dot) uses primaryInk, the teal the palette declares for light
  // grounds — 5.17:1 on white, so it reads instead of tinting.
  accent: C.primaryDeep,
  accentLine: C.primaryInk,
  glowScale: 1.3,
  lineScale: 3,

  star: C.gray["700"],
  starAccent: C.primaryInk,
  starScale: 1,
  // A running light is white on either ground: `star` inverts to ink so specks
  // read against the sky, but a lamp on a hull is a light source, not a mark.

  // Shade and grain both mix gray into the teal on a light ground, which turns
  // it sage. Both stay light here; depth comes from the ramp instead.
  liftColor: C.white,
  shadeColor: C.gray["700"],
  shadeScale: 0.35,

  grainBlend: "multiply",
  grainOpacity: 0.022,
  logoShadow: `drop-shadow(0 1px 6px ${rgba(C.gray["700"], 0.14)})`,
};

/**
 * Attach the colour functions a design calls.
 *
 * `glow` is atmosphere — washes, halos, rim light. `line` is anything with an
 * edge. `shade` pushes back, `lift` brings forward. Each carries the theme's
 * scale factor, so a design states one alpha and both themes land right.
 */
function build(t) {
  return {
    ...t,
    glow: (a) => rgba(t.accent, a * t.glowScale),
    line: (a) => rgba(t.accentLine, a * t.lineScale),
    shade: (a) => rgba(t.shadeColor, a * t.shadeScale),
    lift: (a) => rgba(t.liftColor, a),
  };
}

export const themes = { dark: build(dark), light: build(light) };
export const themeNames = Object.keys(themes);
