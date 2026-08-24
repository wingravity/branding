/**
 * Shared headless-Chrome renderer.
 *
 * Every generator in this repo turns an HTML page into a PNG the same way:
 * through the Chrome already installed on the machine. That keeps the repo at
 * zero npm dependencies and means output matches what a browser would show.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync, mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const run = promisify(execFile);
export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const CANDIDATES = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
];

export function findChrome() {
  const override = process.env.CHROME_PATH;
  if (override) {
    if (!existsSync(override)) {
      throw new Error(`CHROME_PATH is set to "${override}" but nothing is there.`);
    }
    return override;
  }
  const found = CANDIDATES.find((p) => existsSync(p));
  if (!found) {
    throw new Error(
      "No Chrome-family browser found. Install Google Chrome, or set CHROME_PATH " +
        "to a Chromium-based binary."
    );
  }
  return found;
}

/** Brand tokens, read from the single source of truth. */
export function tokens() {
  return JSON.parse(readFileSync(join(ROOT, "brand", "tokens.json"), "utf8"));
}

export function wordmark(theme = "dark") {
  return readFileSync(join(ROOT, "brand", "logo", `wordmark-on-${theme}.svg`), "utf8");
}

/**
 * The brand faces as @font-face rules with the woff2 inlined.
 *
 * Embedding rather than linking sidesteps Chrome's cross-origin font rules for
 * file:// pages, and keeps a rendered page reproducible on its own.
 */
export function fontFaces() {
  const faces = [
    ["Kanit", 300, "kanit-latin-300-normal.woff2"],
    ["Kanit", 400, "kanit-latin-400-normal.woff2"],
    ["Kanit", 500, "kanit-latin-500-normal.woff2"],
    ["Space Mono", 400, "space-mono-latin-400-normal.woff2"],
    ["Space Mono", 700, "space-mono-latin-700-normal.woff2"],
  ];
  return faces
    .map(([family, weight, file]) => {
      const b64 = readFileSync(join(ROOT, "brand", "fonts", file)).toString("base64");
      return `@font-face{font-family:"${family}";font-style:normal;font-weight:${weight};` +
        `src:url(data:font/woff2;base64,${b64}) format("woff2")}`;
    })
    .join("\n");
}

/**
 * Screenshot `html` at `width`x`height` into `outPath`.
 *
 * `scale` is Chrome's device scale factor, so a design authored once at CSS
 * pixel dimensions can render at 2x without touching its CSS.
 */
export async function screenshot({ html, width, height, outPath, scale = 1 }) {
  const chrome = findChrome();
  const tmpDir = join(ROOT, ".tmp");
  mkdirSync(tmpDir, { recursive: true });
  const htmlPath = join(tmpDir, `page-${process.pid}-${width}x${height}.html`);
  mkdirSync(dirname(outPath), { recursive: true });

  try {
    writeFileSync(htmlPath, html);
    await run(chrome, [
      "--headless",
      "--disable-gpu",
      "--hide-scrollbars",
      "--no-first-run",
      "--no-default-browser-check",
      "--force-color-profile=srgb",
      `--force-device-scale-factor=${scale}`,
      `--window-size=${width},${height}`,
      "--virtual-time-budget=3000",
      `--screenshot=${outPath}`,
      `file://${htmlPath}`,
    ]);
    if (!existsSync(outPath)) throw new Error(`Chrome did not produce ${outPath}`);
    return outPath;
  } finally {
    rmSync(htmlPath, { force: true });
  }
}
