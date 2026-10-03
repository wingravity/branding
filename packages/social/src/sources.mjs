/**
 * The 2021 artwork the covers are built from.
 *
 * These rasters are not committed: the repo is public and only generated
 * images belong in it. They live in `sources/design/`, which is gitignored.
 * Copy the 2021 social media artwork there.
 *
 * Every original sits on a flat `gray.800` ground, so any rectangle of one can
 * be placed on a new `gray.800` canvas without a visible seam.
 */

import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export const SOURCE_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "sources", "design");

const cache = new Map();

/** A source PNG as `{ uri, width, height }`, read from its IHDR chunk. */
export function source(file) {
  if (cache.has(file)) return cache.get(file);
  const path = join(SOURCE_DIR, file);
  if (!existsSync(path)) {
    throw new Error(
      `Missing source artwork: sources/design/${file}\n` +
        "    The 2021 rasters are kept out of git. Copy the 2021 social media\n" +
        "    artwork into packages/social/sources/design/."
    );
  }
  const buf = readFileSync(path);
  const entry = {
    uri: `data:image/png;base64,${buf.toString("base64")}`,
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
  };
  cache.set(file, entry);
  return entry;
}
