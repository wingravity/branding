#!/usr/bin/env node
/**
 * Writes tokens.css from tokens.json, so a site can import the palette as
 * custom properties instead of copying hex values. Committed, because a
 * consumer installing the package should not need to run a build.
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { tokens, BRAND_DIR } from "./index.mjs";

const T = tokens();
const kebab = (s) => s.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());

const lines = [];
for (const [name, value] of Object.entries(T.colors)) {
  if (typeof value === "string") lines.push(`  --wg-${kebab(name)}: ${value.toLowerCase()};`);
  else for (const [step, hex] of Object.entries(value)) lines.push(`  --wg-${name}-${step}: ${hex.toLowerCase()};`);
}
lines.push(`  --wg-font-sans: "${T.fonts.sans}", system-ui, sans-serif;`);
lines.push(`  --wg-font-mono: "${T.fonts.mono}", ui-monospace, monospace;`);

const css = `/* Generated from tokens.json by generate-tokens-css.mjs. Do not edit. */\n:root {\n${lines.join("\n")}\n}\n`;
writeFileSync(join(BRAND_DIR, "tokens.css"), css);
console.log("  ✓ tokens.css");
