#!/usr/bin/env node
/**
 * Wingravity virtual background generator.
 *
 * Renders each design to PNG through the Chrome already installed on this
 * machine — no npm dependencies, nothing to download.
 *
 *   node generate.mjs                        # all designs, 1920x1080
 *   node generate.mjs --design horizon       # just one
 *   node generate.mjs --scale 2              # 3840x2160
 *   node generate.mjs --position top-left    # move the wordmark
 *   node generate.mjs --guides               # overlay safe-zone guides
 */

import { mkdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { screenshot } from "../lib/chrome.mjs";
import { designs, designNames } from "./src/designs.mjs";
import { buildPage, positions, WIDTH, HEIGHT } from "./src/page.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const opts = {
    design: null,
    scale: 1,
    position: "bottom-right",
    logoWidth: 360,
    outDir: join(HERE, "out"),
    guides: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const value = () => {
      const v = argv[++i];
      if (v === undefined) throw new Error(`${arg} needs a value.`);
      return v;
    };
    switch (arg) {
      case "--design": case "-d": opts.design = value(); break;
      case "--scale": case "-s": opts.scale = Number(value()); break;
      case "--position": case "-p": opts.position = value(); break;
      case "--logo-width": opts.logoWidth = Number(value()); break;
      case "--out": case "-o": opts.outDir = value(); break;
      case "--guides": opts.guides = true; break;
      case "--list": opts.list = true; break;
      case "--help": case "-h": opts.help = true; break;
      default: throw new Error(`Unknown option: ${arg}`);
    }
  }
  return opts;
}

const HELP = `
Wingravity virtual background generator

  node generate.mjs [options]

  -d, --design <name>     Render one design (default: all)
  -s, --scale <1|2>       1 = 1920x1080, 2 = 3840x2160 (default: 1)
  -p, --position <where>  Wordmark corner: ${Object.keys(positions).join(" | ")}
                          (default: bottom-right — the other corners collide
                          with the name chip on Meet, Zoom and Teams)
      --logo-width <px>   Wordmark width in the 1920x1080 space (default: 360)
  -o, --out <dir>         Output directory (default: ./out)
      --guides            Overlay subject and platform-UI safe zones
      --list              List available designs
  -h, --help              Show this help
`;

async function render({ design, name, opts }) {
  const html = buildPage({
    design,
    logoWidth: opts.logoWidth,
    position: opts.position,
    guides: opts.guides,
  });

  const suffix = opts.guides ? "-guides" : "";
  const w = WIDTH * opts.scale;
  const h = HEIGHT * opts.scale;
  const outPath = join(opts.outDir, `wingravity-${name}-${w}x${h}${suffix}.png`);

  await screenshot({ html, width: WIDTH, height: HEIGHT, outPath, scale: opts.scale });
  return { outPath, bytes: statSync(outPath).size, w, h };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help) return console.log(HELP);
  if (opts.list) {
    for (const n of designNames) console.log(`  ${n.padEnd(11)} ${designs[n].description}`);
    return;
  }
  if (!Object.hasOwn(positions, opts.position)) {
    throw new Error(`Unknown position "${opts.position}". Use one of: ${Object.keys(positions).join(", ")}`);
  }
  if (![1, 2].includes(opts.scale)) {
    throw new Error(`--scale must be 1 or 2, got "${opts.scale}".`);
  }
  const selected = opts.design ? [opts.design] : designNames;
  for (const name of selected) {
    if (!Object.hasOwn(designs, name)) {
      throw new Error(`Unknown design "${name}". Available: ${designNames.join(", ")}`);
    }
  }

  mkdirSync(opts.outDir, { recursive: true });

  for (const name of selected) {
    const { outPath, bytes, w, h } = await render({ design: designs[name], name, opts });
    const kb = (bytes / 1024).toFixed(0);
    console.log(`  ✓ ${w}x${h}  ${String(kb).padStart(5)} KB  ${outPath}`);
  }
  console.log(`\n${selected.length} background${selected.length === 1 ? "" : "s"} in ${opts.outDir}`);
}

main().catch((err) => {
  console.error(`\nerror: ${err.message}\n`);
  process.exit(1);
});
