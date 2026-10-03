#!/usr/bin/env node
/**
 * Wingravity virtual background generator.
 *
 * Renders each design to PNG through the Chrome already installed on this
 * machine — no npm dependencies, nothing to download.
 *
 *   node generate.mjs                        # every design, both themes
 *   node generate.mjs --design horizon       # just one
 *   node generate.mjs --theme light          # just the light ground
 *   node generate.mjs --mirror on            # pre-flipped for your self-view
 *   node generate.mjs --scale 2              # 3840x2160
 *   node generate.mjs --position top-left    # move the wordmark
 *   node generate.mjs --guides               # overlay safe-zone guides
 */

import { mkdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { screenshot } from "../lib/chrome.mjs";
import { designs, designNames } from "./src/designs.mjs";
import { themes, themeNames } from "./src/themes.mjs";
import { buildPage, positions, WIDTH, HEIGHT } from "./src/page.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));

/** `both` on a variant axis means "render every value of it". */
const VARIANTS = { off: [false], on: [true], both: [false, true] };

/**
 * The corner the wordmark sits in is a variant axis too. `both` is the two
 * corners that clear the name chip and the control bar; `all` is every corner,
 * and a comma-separated list works as well.
 */
const POSITION_SETS = {
  both: ["bottom-right", "top-right"],
  all: Object.keys(positions),
};

function resolvePositions(spec) {
  const wanted = POSITION_SETS[spec] ?? spec.split(",").map((p) => p.trim());
  for (const p of wanted) {
    if (!Object.hasOwn(positions, p)) {
      throw new Error(
        `Unknown position "${p}". Use one of: ${Object.keys(positions).join(", ")}, ` +
          `${Object.keys(POSITION_SETS).join(", ")}, or a comma-separated list.`
      );
    }
  }
  return wanted;
}

function parseArgs(argv) {
  const opts = {
    design: null,
    theme: "both",
    mirror: "off",
    scale: 1,
    position: "both",
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
      case "--theme": case "-t": opts.theme = value(); break;
      case "--mirror": case "-m": opts.mirror = value(); break;
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
  -t, --theme <name>      ${themeNames.join(" | ")} | both (default: both)
  -m, --mirror <state>    off | on | both (default: off)
                          "on" pre-flips the frame, so it reads correctly in
                          your own mirrored self-view and flipped to everyone
                          else. See the README before choosing it.
  -s, --scale <1|2>       1 = 1920x1080, 2 = 3840x2160 (default: 1)
  -p, --position <where>  Wordmark corner: ${Object.keys(positions).join(" | ")}
                          | both | all | a comma-separated list
                          (default: both — bottom-right and top-right, the two
                          that clear the name chip and the control bar)
      --logo-width <px>   Wordmark width in the 1920x1080 space (default: 360)
  -o, --out <dir>         Output directory (default: ./out)
      --guides            Overlay subject and platform-UI safe zones
      --list              List available designs
  -h, --help              Show this help
`;

const DEFAULT_POSITION = "bottom-right";

async function render({ name, themeName, position, mirror, opts }) {
  const html = buildPage({
    design: designs[name],
    theme: themes[themeName],
    logoWidth: opts.logoWidth,
    position,
    guides: opts.guides,
    mirror,
  });

  const w = WIDTH * opts.scale;
  const h = HEIGHT * opts.scale;
  const suffix =
    `${position === DEFAULT_POSITION ? "" : `-${position}`}` +
    `${mirror ? "-mirrored" : ""}${opts.guides ? "-guides" : ""}`;
  const file = `wingravity-${name}-${themeName}-${w}x${h}${suffix}.png`;
  const outPath = join(opts.outDir, file);

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
  const selectedPositions = resolvePositions(opts.position);
  if (![1, 2].includes(opts.scale)) {
    throw new Error(`--scale must be 1 or 2, got "${opts.scale}".`);
  }
  if (!Object.hasOwn(VARIANTS, opts.mirror)) {
    throw new Error(`--mirror must be ${Object.keys(VARIANTS).join(", ")}; got "${opts.mirror}".`);
  }
  if (opts.theme !== "both" && !Object.hasOwn(themes, opts.theme)) {
    throw new Error(`Unknown theme "${opts.theme}". Use one of: ${themeNames.join(", ")}, both`);
  }
  const selected = opts.design ? [opts.design] : designNames;
  for (const name of selected) {
    if (!Object.hasOwn(designs, name)) {
      throw new Error(`Unknown design "${name}". Available: ${designNames.join(", ")}`);
    }
  }
  const selectedThemes = opts.theme === "both" ? themeNames : [opts.theme];
  const mirrors = VARIANTS[opts.mirror];

  mkdirSync(opts.outDir, { recursive: true });

  let count = 0;
  for (const themeName of selectedThemes) {
    for (const position of selectedPositions) {
      for (const mirror of mirrors) {
        for (const name of selected) {
          const { outPath, bytes, w, h } = await render({ name, themeName, position, mirror, opts });
          const kb = (bytes / 1024).toFixed(0);
          console.log(`  ✓ ${w}x${h}  ${String(kb).padStart(5)} KB  ${outPath}`);
          count++;
        }
      }
    }
  }
  console.log(`\n${count} background${count === 1 ? "" : "s"} in ${opts.outDir}`);
}

main().catch((err) => {
  console.error(`\nerror: ${err.message}\n`);
  process.exit(1);
});
