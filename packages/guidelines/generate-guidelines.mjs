#!/usr/bin/env node
/**
 * Renders the brand guidelines: one self-contained HTML document, plus the
 * logo sheet and the misuse grid that README.md and the document both show.
 *
 * Every value comes from @wingravity/brand. Contrast ratios are computed here
 * with the WCAG formula rather than copied, so a token change cannot leave a
 * stale number behind. Like generate-readme-images.mjs, the output is committed and the
 * run is deterministic: no dates, no randomness.
 */

import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  screenshot, tokens, wordmark, symbol, appIcon, fontFaces, ROOT,
} from "@wingravity/render";

const T = tokens();
const C = T.colors;
const G = C.gray;
const DOCS = join(ROOT, "docs");
const ASSETS = join(DOCS, "assets");

/* ---------------------------------------------------------------- helpers -- */

/** Inline SVG with its fixed size removed, so CSS decides the width. */
const fluid = (svg) =>
  svg.replace(/<\?xml[^>]*>\s*/, "")
    .replace(/<svg[^>]*>/, (tag) => tag.replace(/ (width|height)="[\d.]+"/g, ""));

const WM = { dark: fluid(wordmark("dark")), light: fluid(wordmark("light")) };
const SY = { dark: fluid(symbol("dark")), light: fluid(symbol("light")) };
const ICON = fluid(appIcon());

function luminance(hex) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const BASE = `
${fontFaces()}
*{box-sizing:border-box;margin:0;padding:0}
body{background:${G["900"]};color:${C.white};font-family:"Kanit",system-ui,sans-serif;
  font-weight:300;-webkit-font-smoothing:antialiased}
.mono{font-family:"Space Mono",ui-monospace,monospace}
svg{display:block}
`;

/* ------------------------------------------------------------- logo sheet -- */

const LOGO_W = 1280;
const LOGO_H = 560;

/**
 * Clear space is drawn as a dashed box one wordmark-height out from the mark.
 * The wordmark's viewBox is 1102.46x188.02, so at 314px wide it is 54px tall.
 */
const logoPanel = (theme) => {
  const ground = theme === "dark" ? G["900"] : G["200"];
  const ink = theme === "dark" ? G["400"] : G["600"];
  const guide = theme === "dark" ? C.primary : C.primaryInk;
  return `
<div class="panel" style="background:${ground}">
  <div class="slot">
    <div class="clear" style="border-color:${guide};padding:54px">
      <div style="width:314px">${WM[theme]}</div>
    </div>
    <div class="cap mono" style="color:${ink}">wordmark-on-${theme}.svg</div>
  </div>
  <div class="slot">
    <div class="clear" style="border-color:${guide};padding:42px">
      <div style="width:118px">${SY[theme]}</div>
    </div>
    <div class="cap mono" style="color:${ink}">symbol-on-${theme}.svg</div>
  </div>
  ${theme === "dark" ? `<div class="slot">
    <div class="icon">${ICON}</div>
    <div class="cap mono" style="color:${ink}">app-icon.svg</div>
  </div>` : `<div class="slot">
    <div class="icon round">${ICON}</div>
    <div class="cap mono" style="color:${ink}">masked by the platform</div>
  </div>`}
</div>`;
};

const logoSheet = `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}
.stage{width:${LOGO_W}px;height:${LOGO_H}px;display:flex;flex-direction:column}
.panel{flex:1;display:flex;align-items:center;justify-content:space-around;padding:0 40px}
.slot{display:flex;flex-direction:column;align-items:center;gap:16px}
.clear{border:1px dashed;border-radius:2px}
.clear,.clear *{border-color:inherit}
.cap{font-size:12px;letter-spacing:.06em}
.icon{width:150px;height:150px;overflow:hidden}
.icon svg{width:100%;height:100%}
.round{border-radius:34px}
</style></head><body><div class="stage">
${logoPanel("dark")}
${logoPanel("light")}
</div></body></html>`;

/* ------------------------------------------------------------ misuse grid -- */

/**
 * Each entry is a real rendering of the mistake, not a description of it.
 * `ground` is the tile background, `art` the offending markup.
 */
/**
 * The wordmark with "gravity" dropped onto the baseline of "win". In the real
 * mark "gravity" sits 38.98 units higher: the n's foot lines up with the
 * bottom of the g, not with the bottom of the r. Elements 4 onward are
 * "gravity"; element 1 (the teal dot over the i) belongs to "win".
 */
function oneBaseline(svg) {
  let n = 0;
  return svg
    .replace(/viewBox="0 0 1102\.46 188\.02"/, 'viewBox="0 0 1102.46 227"')
    .replace(/<(polygon|path) [^>]*\/>/g, (el) => (n++ >= 4 ? `<g transform="translate(0 38.98)">${el}</g>` : el));
}

const MISUSE = [
  {
    label: "Recoloured teal half",
    ground: G["900"],
    art: `<div style="width:240px">${WM.dark.replaceAll(C.logoAccent, C.yellow)}</div>`,
  },
  {
    label: "Stretched",
    ground: G["900"],
    art: `<div style="width:300px;height:30px">${WM.dark.replace("<svg ", '<svg preserveAspectRatio="none" style="width:100%;height:100%" ')}</div>`,
  },
  {
    label: "Rotated",
    ground: G["900"],
    art: `<div style="width:240px;transform:rotate(-14deg)">${WM.dark}</div>`,
  },
  {
    label: "Outlined",
    ground: G["900"],
    art: `<div style="width:240px">${WM.dark
      .replaceAll(`fill="#FFFFFF"`, `fill="none" stroke="${C.white}" stroke-width="3.5"`)
      .replaceAll(`fill="${C.logoAccent}"`, `fill="none" stroke="${C.logoAccent}" stroke-width="3.5"`)}</div>`,
  },
  {
    label: "Effects: glow, shadow",
    ground: G["900"],
    art: `<div style="width:240px;filter:drop-shadow(0 0 10px ${C.primary}) drop-shadow(4px 6px 0 ${G["700"]})">${WM.dark}</div>`,
  },
  {
    label: "Put in a box",
    ground: G["900"],
    art: `<div style="width:280px;padding:18px 20px;background:${G["700"]};border:2px solid ${C.primary};border-radius:12px">${WM.dark}</div>`,
  },
  {
    label: "Dark cut on a light ground",
    ground: G["200"],
    art: `<div style="width:240px">${WM.dark}</div>`,
  },
  {
    label: "Retyped in a font",
    ground: G["900"],
    art: `<div style="font-family:Kanit;font-weight:500;font-size:38px;letter-spacing:-.01em">
      <span style="color:${C.white}">win</span><span style="color:${C.primary}">gravity</span></div>`,
  },
  {
    label: "All one colour",
    ground: G["900"],
    art: `<div style="width:240px">${WM.dark.replaceAll('fill="#FFFFFF"', `fill="${C.logoAccent}"`)}</div>`,
  },
  {
    label: "win and gravity on one baseline",
    ground: G["900"],
    art: `<div style="width:240px">${oneBaseline(WM.dark)}</div>`,
  },
  {
    label: "Symbol beside the wordmark",
    ground: G["900"],
    art: `<div style="display:flex;align-items:center;gap:16px"><div style="width:62px">${SY.dark}</div>
      <div style="width:200px">${WM.dark}</div></div>`,
  },
  {
    label: "Teal text on white",
    ground: C.white,
    art: `<div style="font-family:Kanit;font-weight:400;font-size:28px;color:${C.primary}">Book a call</div>`,
  },
];

const MIS_W = 1280;
const MIS_H = 1000;

const misuseTile = (m) => `
<div class="tile">
  <div class="art" style="background:${m.ground}">${m.art}</div>
  <div class="lab mono"><span class="x">✕</span>${esc(m.label)}</div>
</div>`;

const misuseSheet = `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}
.stage{width:${MIS_W}px;height:${MIS_H}px;padding:40px 48px;display:grid;
  grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(4,1fr);gap:24px 20px}
.tile{display:flex;flex-direction:column;gap:10px;min-height:0}
.art{flex:1;border-radius:10px;border:1px solid ${G["700"]};display:flex;
  align-items:center;justify-content:center;overflow:hidden}
.lab{font-size:12px;color:${G["400"]};letter-spacing:.04em;display:flex;gap:10px;align-items:center}
.x{color:${C.yellow};font-weight:700}
</style></head><body><div class="stage">
${MISUSE.map(misuseTile).join("")}
</div></body></html>`;

/* --------------------------------------------------------- guidelines page -- */

const SWATCHES = [
  ["primary", C.primary, "The teal. Accents only, on dark surfaces only."],
  ["primaryLight", C.primaryLight, "Hover or raised state of the teal."],
  ["primaryDeep", C.primaryDeep, "Pressed state; the teal on lighter dark surfaces."],
  ["primaryInk", C.primaryInk, "The teal on light grounds, where the others fail contrast."],
  ["gray.900", G["900"], "Darkest surface. Page ground."],
  ["gray.800", G["800"], "Raised dark surface. Cards. App icon ground."],
  ["gray.700", G["700"], "Borders and dividers on dark."],
  ["gray.600", G["600"], "Muted text on light surfaces."],
  ["gray.400", G["400"], "Muted text on dark surfaces."],
  ["gray.300", G["300"], "Dividers on light."],
  ["gray.200", G["200"], "Light surface tint."],
  ["yellow", C.yellow, "Rare highlight. Once per page, or not at all."],
  ["white", C.white, "Primary text on dark."],
];

/** Foregrounds down the side, grounds across the top. */
const FGS = [
  ["white", C.white], ["primary", C.primary], ["primaryDeep", C.primaryDeep],
  ["primaryInk", C.primaryInk], ["yellow", C.yellow], ["gray.400", G["400"]],
  ["gray.600", G["600"]], ["gray.900", G["900"]],
];
const BGS = [
  ["gray.900", G["900"]], ["gray.800", G["800"]], ["gray.200", G["200"]], ["white", C.white],
];

const grade = (r) => (r >= 7 ? "AAA" : r >= 4.5 ? "AA" : r >= 3 ? "Large" : "Fail");

const matrix = `
<table class="matrix">
  <thead><tr><th></th>${BGS.map(([n]) => `<th class="mono">on ${n}</th>`).join("")}</tr></thead>
  <tbody>${FGS.map(([fn, fg]) => `<tr><th class="mono">${fn}</th>${BGS.map(([, bg]) => {
    const r = contrast(fg, bg);
    if (fg === bg) return `<td class="na">·</td>`;
    return `<td><span class="chip" style="background:${bg};color:${fg}">Aa</span>
      <span class="mono ratio">${r.toFixed(2)}</span><span class="grade g-${grade(r).toLowerCase()}">${grade(r)}</span></td>`;
  }).join("")}</tr>`).join("")}</tbody>
</table>`;

const swatchTable = `
<table class="swatches">
  <thead><tr><th></th><th>Token</th><th>Hex</th><th>Role</th></tr></thead>
  <tbody>${SWATCHES.map(([n, hex, role]) => `<tr>
    <td><span class="sw" style="background:${hex}"></span></td>
    <td class="mono">${n}</td><td class="mono">${hex.toUpperCase()}</td><td>${role}</td></tr>`).join("")}</tbody>
</table>`;

/** Both cuts are inlined; CSS shows the dark one on screen and the light one in print. */
const cut = (kind, width) => {
  const art = kind === "wordmark" ? WM : SY;
  return `<div class="cut" style="width:${width}px"><div class="on-dark">${art.dark}</div><div class="on-light">${art.light}</div></div>`;
};

const PACKAGES = [
  ["@wingravity/brand", "packages/brand", "Tokens, logo, typefaces. The source of truth. Published for the landing site."],
  ["@wingravity/virtual-backgrounds", "packages/virtual-backgrounds", "Backgrounds for Meet, Zoom and Teams."],
  ["@wingravity/social", "packages/social", "Covers, link preview, posts, highlights, avatar, icons."],
  ["@wingravity/email-signature", "packages/email-signature", "Gmail signature HTML and its hosted images."],
  ["@wingravity/guidelines", "packages/guidelines", "This document and the README imagery."],
];

const NAV = [
  ["overview", "Overview"], ["logo", "Logo"], ["misuse", "Misuse"], ["colour", "Colour"],
  ["type", "Type"], ["voice", "Voice"], ["imagery", "Imagery"], ["templates", "Templates"],
  ["trademark", "Trademark"],
];

/** The sheets are inlined so the page stands alone, wherever it is opened or hosted. */
const inline = (name) =>
  `data:image/png;base64,${readFileSync(join(ASSETS, name)).toString("base64")}`;

const page = () => `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Wingravity brand guidelines</title>
<meta name="description" content="Logo, colour, type and voice for Wingravity.">
<style>${BASE}
:root{color-scheme:dark}
body{font-size:17px;line-height:1.6}
a{color:${C.primary};text-decoration:none;border-bottom:1px solid ${G["700"]}}
a:hover{color:${C.primaryLight}}
.wrap{max-width:1040px;margin:0 auto;padding:0 32px}
header.top{border-bottom:1px solid ${G["700"]};position:sticky;top:0;background:${G["900"]};z-index:2}
header.top .wrap{display:flex;align-items:center;gap:28px;height:64px}
header.top .brand{width:112px;flex:none}
nav{display:flex;gap:18px;overflow-x:auto;white-space:nowrap;font-size:13px}
nav a{border:0;color:${G["400"]}}
nav a:hover{color:${C.white}}
.print-mark{display:none}
.hero{padding:120px 0 96px;border-bottom:1px solid ${G["700"]};position:relative;overflow:hidden}
.hero .orbit{position:absolute;right:-220px;top:-160px;width:720px;height:720px;border-radius:50%;
  border:1px solid ${G["700"]}}
.hero .orbit::after{content:"";position:absolute;inset:110px;border-radius:50%;border:1px solid ${G["800"]}}
.hero .body{position:absolute;right:236px;top:330px;width:10px;height:10px;border-radius:50%;
  background:${C.primary};box-shadow:0 0 24px ${C.primary}}
.eyebrow{font-family:"Space Mono",monospace;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:${C.primary}}
h1{font-weight:300;font-size:64px;line-height:1.05;letter-spacing:-.02em;margin:20px 0 22px;max-width:14ch}
.lede{color:${G["400"]};font-size:20px;max-width:52ch}
section{padding:88px 0;border-bottom:1px solid ${G["700"]}}
h2{font-weight:300;font-size:38px;letter-spacing:-.01em;margin:10px 0 18px}
h3{font-weight:400;font-size:20px;margin:40px 0 10px}
p{max-width:64ch;color:${G["400"]}}
p strong,li strong{color:${C.white};font-weight:400}
ul.rules{list-style:none;margin-top:14px;display:grid;gap:8px;max-width:70ch}
ul.rules li{padding-left:22px;position:relative;color:${G["400"]}}
ul.rules li::before{content:"·";position:absolute;left:0;color:${G["700"]}}
ul.dont li::before{content:"✕";color:${C.yellow};font-size:12px;top:3px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:28px}
.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:28px}
.card{border:1px solid ${G["700"]};border-radius:12px;padding:24px;background:${G["800"]}}
.card .k{font-family:"Space Mono",monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:${G["400"]}}
.card .v{margin-top:6px;color:${C.white}}
.card p{font-size:15px;margin-top:6px}
.stage{border:1px solid ${G["700"]};border-radius:12px;display:flex;align-items:center;
  justify-content:center;gap:56px;padding:64px 32px;margin-top:28px}
.stage.dark{background:${G["900"]}}
.stage.light{background:${G["200"]}}
.stage .on-light{display:none}
.stage.light .on-dark{display:none}
.stage.light .on-light{display:block}
.cut svg{width:100%;height:auto}
.icon{width:96px;height:96px;border-radius:22px;overflow:hidden;flex:none}
.icon svg{width:100%;height:100%}
.spec{display:grid;grid-template-columns:1fr 1fr;gap:8px 32px;margin-top:18px;font-size:14px;color:${G["400"]}}
.spec b{margin-right:10px}
.spec b{font-family:"Space Mono",monospace;font-weight:400;color:${C.white};font-size:13px}
img.sheet{width:100%;border-radius:12px;border:1px solid ${G["700"]};margin-top:28px;display:block}
table{border-collapse:collapse;width:100%;margin-top:28px;font-size:15px}
th{text-align:left;font-weight:400;color:${G["400"]};font-size:12px;letter-spacing:.06em;
  padding:10px 12px;border-bottom:1px solid ${G["700"]}}
td{padding:10px 12px;border-bottom:1px solid ${G["800"]};color:${G["400"]};vertical-align:middle}
td.mono{color:${C.white};font-size:13px;white-space:nowrap}
.sw{display:block;width:44px;height:28px;border-radius:6px;border:1px solid rgba(255,255,255,.1)}
.matrix th.mono{font-size:12px;color:${C.white};letter-spacing:0}
.matrix td{white-space:nowrap}
.chip{display:inline-block;width:42px;text-align:center;border-radius:6px;padding:2px 0;font-weight:400;
  margin-right:10px;border:1px solid ${G["700"]}}
.ratio{font-size:12px;color:${C.white};margin-right:8px}
.grade{font-family:"Space Mono",monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase}
.g-aaa,.g-aa{color:${C.primary}}
.g-large{color:${G["400"]}}
.g-fail{color:${C.yellow}}
.na{color:${G["700"]}}
.callout{border-left:2px solid ${C.yellow};padding:14px 20px;margin-top:28px;background:${G["800"]};
  border-radius:0 10px 10px 0;max-width:70ch}
.callout p{color:${C.white};max-width:none}
.specimen{border:1px solid ${G["700"]};border-radius:12px;padding:36px 32px;margin-top:28px;display:grid;gap:22px}
.row{display:grid;grid-template-columns:160px 1fr;align-items:baseline;gap:24px}
.row .label{font-family:"Space Mono",monospace;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:${C.primary};opacity:.8}
.row .s{color:${C.white};overflow-wrap:anywhere}
.voice{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:28px}
.say,.avoid{border:1px solid ${G["700"]};border-radius:12px;padding:22px 24px}
.say .k,.avoid .k{font-family:"Space Mono",monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase}
.say .k{color:${C.primary}}
.avoid .k{color:${C.yellow}}
.say p,.avoid p{margin-top:10px;color:${C.white}}
.avoid p{text-decoration:line-through;text-decoration-color:${G["600"]};color:${G["400"]}}
code{font-family:"Space Mono",monospace;font-size:.82em;color:${C.white};background:${G["800"]};
  padding:1px 6px;border-radius:4px}
footer{padding:48px 0 64px;color:${G["400"]};font-size:13px}
footer .wrap{display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap}

@media (max-width:760px){
  .wrap{padding:0 16px}
  h1{font-size:42px}
  .grid2,.grid3,.voice,.spec{grid-template-columns:1fr}
  .row{grid-template-columns:1fr;gap:4px}
  .stage{flex-direction:column;gap:36px}
  .hero .orbit,.hero .body{display:none}
  table{display:block;overflow-x:auto}
}

/* Print: a light document. Teal that has to be read becomes primaryInk. */
@media print{
  :root{color-scheme:light}
  @page{size:A4;margin:16mm 14mm}
  body{background:${C.white};color:${G["900"]};font-size:11pt}
  header.top,.hero .orbit,.hero .body{display:none}
  .print-mark{display:block;width:150px;margin-bottom:28px}
  .grid3{grid-template-columns:repeat(3,1fr)}
  .grid2,.voice,.spec{grid-template-columns:1fr 1fr}
  .row{grid-template-columns:140px 1fr;gap:20px}
  .stage{flex-direction:row;gap:40px}
  table{display:table}
  .hero{padding:0 0 24px}
  h1{font-size:34pt}
  section{padding:28px 0;break-inside:auto}
  h2{break-after:avoid}
  .stage,.card,.specimen,table,img.sheet,.voice{break-inside:avoid}
  p,ul.rules li,td,.lede,footer,.spec,.card p,th{color:${G["600"]}}
  p strong,li strong,.card .v,td.mono,.matrix th.mono,.ratio,.row .s,.spec b,.say p{color:${G["900"]}}
  a{color:${C.primaryInk};border-color:${G["300"]}}
  .eyebrow,.row .label,.say .k,.g-aaa,.g-aa{color:${C.primaryInk}}
  section,.hero,th,td{border-color:${G["300"]}}
  .card,.callout,code{background:${G["200"]};border-color:${G["300"]}}
  code{color:${G["900"]}}
  .say,.avoid,.specimen,img.sheet{border-color:${G["300"]}}
  .stage.dark{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .sw,.chip,.icon{-webkit-print-color-adjust:exact;print-color-adjust:exact}
}
</style>
</head>
<body>

<header class="top"><div class="wrap">
  <div class="brand">${WM.dark}</div>
  <nav>${NAV.map(([id, n]) => `<a href="#${id}">${n}</a>`).join("")}</nav>
</div></header>

<div class="hero" id="overview"><div class="orbit"></div><div class="body"></div><div class="wrap">
  <div class="print-mark">${WM.light}</div>
  <div class="eyebrow">Brand guidelines</div>
  <h1>Dark, technical, one accent colour.</h1>
  <p class="lede">How Wingravity looks and sounds: the mark, the palette, the type and the voice.
  Everything here is generated from <code>packages/brand/tokens.json</code>, so if this page and
  the tokens ever disagree, the tokens win.</p>

  <div class="grid3">
    <div class="card"><div class="k">Ground</div><div class="v">Charcoal</div>
      <p><code>gray.900</code> to <code>gray.800</code>. Light grounds are the exception.</p></div>
    <div class="card"><div class="k">Accent</div><div class="v">Teal, sparingly</div>
      <p>Lines, dots, one word. Never a large fill.</p></div>
    <div class="card"><div class="k">Type</div><div class="v">Kanit 300</div>
      <p>Emphasis comes from size and order. Space Mono labels things.</p></div>
    <div class="card"><div class="k">Motifs</div><div class="v">Orbits and horizons</div>
      <p>Kept subtle, in the background.</p></div>
    <div class="card"><div class="k">Imagery</div><div class="v">Real product</div>
      <p>Screenshots of shipped work over abstract art.</p></div>
    <div class="card"><div class="k">Avoid</div><div class="v">Off-brand looks</div>
      <p>Startup gradients, neon-on-black, enterprise blue, stock photos, new space clip art.</p></div>
  </div>
</div></div>

<main>

<section id="logo"><div class="wrap">
  <div class="eyebrow">01 · Logo</div>
  <h2>Wordmark, symbol, app icon</h2>
  <p>Three marks, and these files are the only versions. The <strong>wordmark</strong> is the logo,
  in a dark and a light cut. The <strong>symbol</strong> is its <em>w</em> and <em>g</em>, taken from
  the same outlines, for places too small or too square for the full name. The <strong>app icon</strong>
  is the symbol with a margin on <code>gray.800</code>.</p>

  <div class="stage dark">${cut("wordmark", 300)}${cut("symbol", 110)}<div class="icon">${ICON}</div></div>
  <div class="stage light">${cut("wordmark", 300)}${cut("symbol", 110)}</div>

  <h3>Which one to use</h3>
  <table>
    <thead><tr><th>Context</th><th>Use</th><th>Why</th></tr></thead>
    <tbody>
      <tr><td>Headers, covers, signatures, backgrounds, social avatars</td><td class="mono">wordmark</td><td>The default. Wherever there is room for 120px of width.</td></tr>
      <tr><td>Favicon, Slack, small UI</td><td class="mono">symbol</td><td>Square or tiny contexts where the wordmark drops below its minimum.</td></tr>
      <tr><td>Home screen, PWA, app stores</td><td class="mono">app-icon</td><td>The symbol with a margin on <code>gray.800</code>. Survives every platform mask.</td></tr>
    </tbody>
  </table>

  <h3>Clear space and size</h3>
  <img class="sheet" src="${inline("logo.png")}" alt="Wordmark, symbol and app icon with clear space marked, on dark and light grounds">
  <div class="spec">
    <span><b>Wordmark clear space</b> its own height, every side</span>
    <span><b>Wordmark minimum</b> 120px · 25mm</span>
    <span><b>Symbol clear space</b> the height of its w</span>
    <span><b>Symbol minimum</b> 16px · 6mm</span>
  </div>

  <h3>Rules</h3>
  <ul class="rules">
    <li>Set a width and let the height follow. Wordmark viewBox <code>0 0 1102.46 188.02</code>.</li>
    <li><strong>Dark cut on dark grounds, light cut on light grounds.</strong> The dark cut's teal is <code>${C.logoAccent}</code>; the light cut uses <code>primaryInk</code>. There is no third.</li>
    <li>Do not set the symbol next to the wordmark. It repeats the <em>w</em> and <em>g</em>; use one or the other.</li>
    <li>The app icon carries its own margin. Platforms crop it to their own shape; nothing important sits near the edge.</li>
  </ul>
</div></section>

<section id="misuse"><div class="wrap">
  <div class="eyebrow">02 · Misuse</div>
  <h2>Twelve ways to break the mark</h2>
  <p>Every tile below is the real wordmark with the mistake applied. If something you are making looks
  like one of these, use the file from <code>packages/brand/logo/</code> as it is.</p>
  <img class="sheet" src="${inline("misuse.png")}" alt="Twelve incorrect uses of the wordmark">
  <ul class="rules dont">
    <li>Recolour the teal half, or sample a third teal for an in-between ground.</li>
    <li>Scale non-uniformly, rotate, outline, or add glows, shadows or gradients.</li>
    <li>Put it in a box, a pill or a badge.</li>
    <li>Carry the dark cut onto a light ground.</li>
    <li>Retype it in Kanit or any other face, or use it as a repeating pattern.</li>
  </ul>
</div></section>

<section id="colour"><div class="wrap">
  <div class="eyebrow">03 · Colour</div>
  <h2>Charcoal ground, one teal</h2>
  <p>Teal is a dark-surface colour. On light grounds, text is <code>gray.900</code> and anything teal
  that has to be read is <code>primaryInk</code>.</p>
  ${swatchTable}

  <div class="callout"><p>Teal on white is <strong>${contrast(C.primary, C.white).toFixed(2)}:1</strong>.
  It fails every text standard. Use <code>primaryInk</code>
  (${contrast(C.primaryInk, C.white).toFixed(2)}:1 on white) instead.</p></div>

  <h3>Contrast</h3>
  <p>Computed from the tokens with the WCAG 2 formula. AA needs 4.5:1 for body text, 3:1 for large
  text (24px, or 19px at 500).</p>
  ${matrix}
</div></section>

<section id="type"><div class="wrap">
  <div class="eyebrow">04 · Type</div>
  <h2>Kanit and Space Mono</h2>
  <p>Kanit 300 is the default for headings and body. 400 for small text that would go thin, 500 for
  rare emphasis. 700 only for a short display line (a banner headline, a slide title) at 40px or larger.
  <strong>Never 600, nothing above 700.</strong> Space Mono labels things: timestamps, tags, code,
  eyebrows. Keep it out of body text.</p>
  <div class="specimen">
    <div class="row"><div class="label">Kanit 300</div><div class="s" style="font-size:40px;letter-spacing:-.01em;line-height:1.15">Build your MVP. Launch your product.</div></div>
    <div class="row"><div class="label">Kanit 400</div><div class="s" style="font-weight:400;font-size:22px">A senior product team for founders who need to ship.</div></div>
    <div class="row"><div class="label">Kanit 500</div><div class="s" style="font-weight:500;font-size:19px">Shipping products since 2017.</div></div>
    <div class="row"><div class="label">Kanit 700 · display</div><div class="s" style="font-weight:700;font-size:40px;letter-spacing:-.01em">Innovation from the ground up.</div></div>
    <div class="row"><div class="label">Space Mono 400</div><div class="s mono" style="font-size:16px;color:inherit">react · node · typescript · aws</div></div>
    <div class="row"><div class="label">Space Mono 700</div><div class="s mono" style="font-weight:700;font-size:16px">MVP · 8–16 WEEKS · IAȘI, RO</div></div>
  </div>
  <ul class="rules">
    <li>Both faces are vendored in <code>packages/brand/fonts/</code> and self-hosted. Never hotlink Google Fonts.</li>
    <li>Sentence case for headings and UI. Uppercase only for Space Mono eyebrows, tracked out.</li>
    <li>Fallbacks: <code>system-ui</code> for Kanit, <code>ui-monospace</code> for Space Mono. In email, Arial.</li>
  </ul>
</div></section>

<section id="voice"><div class="wrap">
  <div class="eyebrow">05 · Voice</div>
  <h2>Lead with outcomes</h2>
  <ul class="rules">
    <li><strong>Lead with outcomes.</strong> Say what the client gets.</li>
    <li><strong>Numbers over adjectives.</strong> 2017. 8 to 16 weeks. 9+ products.</li>
    <li><strong>Name the awkward part:</strong> fixed scope, named price, no handoffs to juniors.</li>
    <li><strong>Sentence case</strong> in headings and UI.</li>
    <li>"Wingravity" is one word, capital W. Lowercase only inside the wordmark.</li>
    <li>Mark the first prominent use in marketing as Wingravity®. It is a registered EU trade mark.</li>
  </ul>
  <div class="voice">
    <div class="say"><div class="k">Say</div>
      <p>We ship your MVP in 8 to 16 weeks, for a fixed price you see before we start.</p></div>
    <div class="avoid"><div class="k">Avoid</div>
      <p>We supercharge your vision with cutting-edge, world-class solutions.</p></div>
  </div>
  <p style="margin-top:20px">Words to avoid: revolutionary, cutting-edge, world-class, synergy, unlock, supercharge.</p>
</div></section>

<section id="imagery"><div class="wrap">
  <div class="eyebrow">06 · Imagery</div>
  <h2>Real product, quiet space</h2>
  <div class="grid2">
    <div class="card"><div class="k">Use</div><div class="v">Screenshots of shipped work</div>
      <p>Real UI, in its real state, on a charcoal ground. Crop tight; don't fake devices around it.</p></div>
    <div class="card"><div class="k">Use</div><div class="v">Orbits and horizons</div>
      <p>Thin arcs in <code>gray.700</code>, one small teal body, a faint horizon glow. One motif per surface.</p></div>
    <div class="card"><div class="k">Use</div><div class="v">People, when they are ours</div>
      <p>The team and clients, photographed plainly. Never stock.</p></div>
    <div class="card"><div class="k">Key visual</div><div class="v">The collage, as supplied</div>
      <p>Moon, astronaut and laptop on a teal ring, with “Innovation from the ground up.” The one illustration. Don’t redraw it or add to it.</p></div>
    <div class="card"><div class="k">Avoid</div><div class="v">More space, gradients, neon</div>
      <p>New clip-art space beyond the key visual, purple-to-blue gradients, glowing grids, abstract 3D blobs.</p></div>
  </div>
</div></section>

<section id="templates"><div class="wrap">
  <div class="eyebrow">07 · Templates</div>
  <h2>Generated from the tokens</h2>
  <p>Every asset is rendered from the tokens by a package in this repo, through the Chrome already on
  your machine. Re-running produces identical bytes. Run <code>npm run generate:all</code> from the root.</p>
  <table>
    <thead><tr><th>Package</th><th>Path</th><th>Makes</th></tr></thead>
    <tbody>${PACKAGES.map(([n, p, d]) => `<tr><td class="mono">${n}</td><td class="mono">${p}</td><td>${d}</td></tr>`).join("")}</tbody>
  </table>
</div></section>

<section id="trademark"><div class="wrap">
  <div class="eyebrow">08 · Trademark</div>
  <h2>The name and the mark are reserved</h2>
  <p>Wingravity® is a registered EU trade mark. The code and tokens
  in this repository are licensed separately; that licence grants no trademark rights.</p>
  <div class="grid2">
    <div class="card"><div class="k">Fine without asking</div>
      <p>Naming Wingravity in prose. Using the unmodified files in an article, deck or "built with" list.
      Linking to wingravity.com.</p></div>
    <div class="card"><div class="k">Needs written permission</div>
      <p>Wingravity in a product, company, domain or handle. Modified marks. Merchandise. Anything
      implying endorsement.</p></div>
  </div>
  <p style="margin-top:20px">Full policy: <code>TRADEMARK.md</code> at the repository root.</p>
</div></section>

</main>

<footer><div class="wrap">
  <span>Wingravity® is a registered trade mark.</span>
  <span>Kanit and Space Mono: SIL Open Font License.</span>
</div></footer>

</body></html>
`;

/* ----------------------------------------------------------------- render -- */

mkdirSync(ASSETS, { recursive: true });

const JOBS = [
  { name: "logo.png", html: logoSheet, width: LOGO_W, height: LOGO_H },
  { name: "misuse.png", html: misuseSheet, width: MIS_W, height: MIS_H },
];

for (const job of JOBS) {
  await screenshot({ html: job.html, width: job.width, height: job.height, outPath: join(ASSETS, job.name), scale: 2 });
  console.log(`  ✓ docs/assets/${job.name}  ${job.width * 2}x${job.height * 2}`);
}

// index.html, so GitHub Pages serves it at the site root from docs/.
writeFileSync(join(DOCS, "index.html"), page());
writeFileSync(join(DOCS, ".nojekyll"), "");
console.log(`  ✓ docs/index.html`);
