#!/usr/bin/env node
/**
 * Renders the imagery used by README.md: the banner, the palette strip and the
 * type specimen.
 *
 * These are documentation assets, so unlike tool output they are committed —
 * a README has to render for someone browsing GitHub, who is not going to run
 * a build first. Re-run after any change to brand/tokens.json.
 */

import { join } from "node:path";
import { screenshot, tokens, wordmark, fontFaces, ROOT } from "../lib/chrome.mjs";

const T = tokens();
const C = T.colors;
const OUT = join(ROOT, "docs", "assets");

const BASE = `
${fontFaces()}
*{box-sizing:border-box;margin:0;padding:0}
body{background:${C.gray["900"]};font-family:"Kanit",system-ui,sans-serif;
  -webkit-font-smoothing:antialiased}
.mono{font-family:"Space Mono",ui-monospace,monospace}
`;

/* ---------------------------------------------------------------- banner -- */

const BANNER_W = 1280;
const BANNER_H = 420;

const banner = `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}
.stage{position:relative;width:${BANNER_W}px;height:${BANNER_H}px;overflow:hidden;
  background:
    radial-gradient(110% 90% at 8% 0%, rgba(100,219,202,.20), transparent 56%),
    radial-gradient(80% 70% at 96% 100%, rgba(100,219,202,.10), transparent 60%),
    linear-gradient(158deg,#1e2025 0%, ${C.gray["900"]} 48%, #0e0e10 100%);
  display:flex;flex-direction:column;align-items:center;justify-content:center}
.ring{position:absolute;border-radius:50%;border:1px solid rgba(100,219,202,.10);
  left:-420px;top:50%;transform:translateY(-50%)}
.r1{width:900px;height:900px}
.r2{width:1300px;height:1300px;border-color:rgba(100,219,202,.06)}
.r3{width:1750px;height:1750px;border-color:rgba(100,219,202,.04)}
.dot{position:absolute;left:214px;top:104px;width:9px;height:9px;border-radius:50%;
  background:${C.primary};box-shadow:0 0 20px 5px rgba(100,219,202,.5)}
.inner{position:relative;text-align:center}
.eyebrow{font-size:13px;font-weight:400;letter-spacing:.32em;text-transform:uppercase;
  color:${C.primary};opacity:.85;margin-bottom:30px}
.logo{width:440px;margin:0 auto}
.logo svg{width:100%;height:auto;display:block}
.tagline{margin-top:34px;font-size:23px;font-weight:300;color:${C.gray["400"]};
  letter-spacing:.005em}
.vignette{position:absolute;inset:0;
  background:radial-gradient(120% 95% at 50% 45%,transparent 42%,rgba(0,0,0,.5) 100%)}
</style></head><body><div class="stage">
  <div class="ring r1"></div><div class="ring r2"></div><div class="ring r3"></div>
  <div class="dot"></div>
  <div class="vignette"></div>
  <div class="inner">
    <div class="eyebrow mono">Brand system</div>
    <div class="logo">${wordmark("dark")}</div>
    <div class="tagline">Build your MVP. Launch your product. Scale what works.</div>
  </div>
</div></body></html>`;

/* --------------------------------------------------------------- palette -- */

const SWATCHES = [
  [
    { name: "primary", hex: C.primary },
    { name: "primaryLight", hex: C.primaryLight },
    { name: "primaryDeep", hex: C.primaryDeep },
    { name: "yellow", hex: C.yellow },
  ],
  [
    { name: "gray.900", hex: C.gray["900"] },
    { name: "gray.800", hex: C.gray["800"] },
    { name: "gray.700", hex: C.gray["700"] },
    { name: "gray.600", hex: C.gray["600"] },
    { name: "gray.400", hex: C.gray["400"] },
    { name: "gray.200", hex: C.gray["200"] },
  ],
];

const PALETTE_W = 1280;
const PALETTE_H = 380;

const cell = (s) => `
<div class="cell">
  <div class="chip" style="background:${s.hex}"></div>
  <div class="name">${s.name}</div>
  <div class="hex mono">${s.hex.toUpperCase()}</div>
</div>`;

const palette = `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}
.stage{width:${PALETTE_W}px;height:${PALETTE_H}px;background:${C.gray["900"]};
  padding:44px 52px;display:flex;flex-direction:column;justify-content:center;gap:34px}
.row{display:flex;gap:20px}
.cell{flex:1}
.chip{height:96px;border-radius:10px;border:1px solid rgba(255,255,255,.09)}
.name{margin-top:14px;font-size:15px;font-weight:300;color:#fff}
.hex{margin-top:3px;font-size:12px;color:${C.gray["400"]};letter-spacing:.04em}
</style></head><body><div class="stage">
${SWATCHES.map((row) => `<div class="row">${row.map(cell).join("")}</div>`).join("")}
</div></body></html>`;

/* ------------------------------------------------------------------ type -- */

const TYPE_W = 1280;
const TYPE_H = 400;

const type = `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}
.stage{width:${TYPE_W}px;height:${TYPE_H}px;background:${C.gray["900"]};
  padding:46px 56px;display:flex;flex-direction:column;justify-content:center;gap:22px}
.block{display:flex;align-items:baseline;gap:30px}
.label{width:158px;flex:none;font-size:11px;letter-spacing:.18em;text-transform:uppercase;
  color:${C.primary};opacity:.8}
.sample{color:#fff;white-space:nowrap}
.k300{font-weight:300;font-size:42px;letter-spacing:-.01em}
.k400{font-weight:400;font-size:25px}
.k500{font-weight:500;font-size:22px}
.sm{font-family:"Space Mono",monospace;font-size:19px;color:${C.gray["400"]}}
.sm400{font-weight:400}
.sm700{font-weight:700;letter-spacing:.02em}
.rule{height:1px;background:${C.gray["700"]};opacity:.7}
</style></head><body><div class="stage">
  <div class="block"><div class="label mono">Kanit 300</div>
    <div class="sample k300">Build your MVP. Launch your product.</div></div>
  <div class="rule"></div>
  <div class="block"><div class="label mono">Kanit 400</div>
    <div class="sample k400">A senior product team for founders who need to ship.</div></div>
  <div class="block"><div class="label mono">Kanit 500</div>
    <div class="sample k500">Outcomes over effort — since 2017.</div></div>
  <div class="rule"></div>
  <div class="block"><div class="label mono">Space Mono 400</div>
    <div class="sample sm sm400">react · node · typescript · aws</div></div>
  <div class="block"><div class="label mono">Space Mono 700</div>
    <div class="sample sm sm700">MVP · 8\u201316 WEEKS · IAȘI, RO</div></div>
</div></body></html>`;

/* ----------------------------------------------------------------- render -- */

const JOBS = [
  { name: "banner.png", html: banner, width: BANNER_W, height: BANNER_H },
  { name: "palette.png", html: palette, width: PALETTE_W, height: PALETTE_H },
  { name: "type.png", html: type, width: TYPE_W, height: TYPE_H },
];

for (const job of JOBS) {
  await screenshot({
    html: job.html,
    width: job.width,
    height: job.height,
    outPath: join(OUT, job.name),
    scale: 2,
  });
  console.log(`  ✓ docs/assets/${job.name}  ${job.width * 2}x${job.height * 2}`);
}
