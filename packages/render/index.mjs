/**
 * @wingravity/render — shared headless-Chrome renderer.
 *
 * Every generator in this repo turns an HTML page into a PNG the same way:
 * through the Chrome already installed on the machine. That keeps the repo
 * at zero npm dependencies and means output matches what a browser would show.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const run = promisify(execFile);
/** The repository root. Scratch pages are written to `.tmp/` under it. */
export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// Brand helpers are re-exported so a generator needs one import, not two.
export { tokens, wordmark, symbol, appIcon, fontFaces, logoPath } from "@wingravity/brand";

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
