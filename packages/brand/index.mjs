/**
 * @wingravity/brand — the source of truth, as a module.
 *
 * Everything that renders brand material reads from here: tokens, the logo
 * files and the vendored typefaces. Nothing downstream declares a hex or a
 * path of its own.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export const BRAND_DIR = dirname(fileURLToPath(import.meta.url));

/** Brand tokens, read fresh so a regenerate after an edit picks it up. */
export function tokens() {
  return JSON.parse(readFileSync(join(BRAND_DIR, "tokens.json"), "utf8"));
}

/**
 * Absolute path to a logo file, e.g. `logoPath("wordmark", "dark")`.
 * `padded` picks the symbol's square variant with a margin; `bleed` picks the
 * app icon without one.
 */
export function logoPath(kind, theme = "dark", { padded = false, bleed = false } = {}) {
  const file = kind === "app-icon"
    ? `app-icon${bleed ? "-bleed" : ""}`
    : `${kind}-on-${theme}${padded ? "-padded" : ""}`;
  return join(BRAND_DIR, "logo", `${file}.svg`);
}

export function wordmark(theme = "dark") {
  return readFileSync(logoPath("wordmark", theme), "utf8");
}

/** The w and g of the wordmark. For square and small contexts. */
export function symbol(theme = "dark", opts) {
  return readFileSync(logoPath("symbol", theme, opts), "utf8");
}

/** The symbol on gray.800 with a margin. `{ bleed: true }` for edge to edge. */
export function appIcon(opts) {
  return readFileSync(logoPath("app-icon", "dark", opts), "utf8");
}

export const FONT_FILES = [
  ["Kanit", 300, "kanit-latin-300-normal.woff2"],
  ["Kanit", 400, "kanit-latin-400-normal.woff2"],
  ["Kanit", 500, "kanit-latin-500-normal.woff2"],
  ["Kanit", 700, "kanit-latin-700-normal.woff2"],
  ["Space Mono", 400, "space-mono-latin-400-normal.woff2"],
  ["Space Mono", 700, "space-mono-latin-700-normal.woff2"],
];

/**
 * The brand faces as @font-face rules with the woff2 inlined.
 *
 * Embedding rather than linking sidesteps Chrome's cross-origin font rules for
 * file:// pages, and keeps a rendered page reproducible on its own.
 */
export function fontFaces() {
  return FONT_FILES.map(([family, weight, file]) => {
    const b64 = readFileSync(join(BRAND_DIR, "fonts", file)).toString("base64");
    return `@font-face{font-family:"${family}";font-style:normal;font-weight:${weight};` +
      `src:url(data:font/woff2;base64,${b64}) format("woff2")}`;
  }).join("\n");
}
