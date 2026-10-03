#!/usr/bin/env node
/**
 * Wingravity social image generator.
 *
 * Renders each image to PNG through the Chrome already installed on this
 * machine — no npm dependencies, nothing to download. Covers need the 2021
 * artwork in sources/design/ (gitignored; see src/sources.mjs).
 *
 *   node generate-social-images.mjs                          # everything, into ./dist
 *   node generate-social-images.mjs --only x-cover           # just one
 *   node generate-social-images.mjs --guides                 # overlay platform safe zones
 */

import { mkdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { screenshot, fontFaces } from "@wingravity/render";
import { designs, designNames, icons, iconPage, iconLayout } from "./src/designs.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ONLY_ICONS = "icons";

function parseArgs(argv) {
  const opts = {
    only: null,
    outDir: join(HERE, "dist"),
    guides: false,
    list: false,
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const value = () => {
      const v = argv[++i];
      if (v === undefined) throw new Error(`${arg} needs a value`);
      return v;
    };
    switch (arg) {
      case "--only": case "-o": opts.only = value(); break;
      case "--out": opts.outDir = value(); break;
      case "--guides": opts.guides = true; break;
      case "--list": opts.list = true; break;
      case "--help": case "-h": opts.help = true; break;
      default: throw new Error(`Unknown option: ${arg}`);
    }
  }
  const known = [...designNames, ONLY_ICONS];
  if (opts.only && !known.includes(opts.only)) {
    throw new Error(`Unknown image "${opts.only}". Use one of: ${known.join(", ")}`);
  }
  return opts;
}

const HELP = `node generate-social-images.mjs [options]

  -o, --only <name>      Render one image: ${designNames.join(" | ")} | ${ONLY_ICONS}
      --out <dir>        Output directory (default: ./dist)
      --guides           Overlay the area each platform paints over
      --list             List available images`;

function page(design, opts) {
  const s = design.safe;
  const guide = opts.guides && s
    ? `<div class="guide" style="left:${s.x}px;top:${s.y}px;width:${s.w}px;height:${s.h}px"><span>${s.label}</span></div>`
    : "";
  return `<!doctype html><html><head><meta charset="utf-8"><style>
${fontFaces()}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${design.width}px;height:${design.height}px;overflow:hidden}
body{font-family:"Kanit",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.frame{position:relative;width:${design.width}px;height:${design.height}px;overflow:hidden}
.guide{position:absolute;border:2px dashed #ff3b6b;background:rgba(255,59,107,.12);z-index:9}
.guide span{position:absolute;left:8px;top:6px;font:12px "Space Mono",monospace;color:#ff3b6b}
</style></head><body><div class="frame">${design.build()}${guide}</div></body></html>`;
}

async function renderOne(outPath, html, width, height, scale) {
  await screenshot({ html, width, height, outPath, scale });
  const kb = Math.round(statSync(outPath).size / 1024);
  console.log(`  ✓ ${width}x${height}${scale !== 1 ? ` @${scale}x` : ""}  ${String(kb).padStart(5)} KB  ${outPath}`);
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) return console.log(HELP);
  if (opts.list) {
    for (const name of designNames) {
      const d = designs[name];
      console.log(`  ${name.padEnd(26)} ${`${d.width}x${d.height}`.padEnd(10)} ${d.description}`);
    }
    console.log(`  ${ONLY_ICONS.padEnd(26)} ${"square".padEnd(10)} Favicon, touch and PWA icons, and -bleed variants, from brand/logo/app-icon*.svg.`);
    return;
  }

  mkdirSync(opts.outDir, { recursive: true });
  const suffix = opts.guides ? "-guides" : "";
  let count = 0;

  for (const name of designNames) {
    if (opts.only && opts.only !== name) continue;
    const d = designs[name];
    const file = `wingravity-${name}-${d.width}x${d.height}${suffix}.png`;
    await renderOne(join(opts.outDir, file), page(d, opts), d.width, d.height, d.scale);
    count++;
  }

  if (!opts.only || opts.only === ONLY_ICONS) {
    for (const icon of icons) {
      const { css, scale } = iconLayout(icon.size);
      await renderOne(join(opts.outDir, `${icon.name}.png`), iconPage(icon.size, icon.padded), css, css, scale);
      count++;
    }
  }

  console.log(`\n${count} image${count === 1 ? "" : "s"} in ${opts.outDir}`);
}

main().catch((err) => {
  console.error(`\n  ✗ ${err.message}\n`);
  process.exit(1);
});
