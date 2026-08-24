import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const BRAND = join(HERE, "..", "..", "brand");

export const WIDTH = 1920;
export const HEIGHT = 1080;

export const positions = {
  "bottom-right": "right:120px;bottom:104px",
  "bottom-left": "left:120px;bottom:104px",
  "top-right": "right:120px;top:96px",
  "top-left": "left:120px;top:96px",
};

export function loadWordmark() {
  return readFileSync(join(BRAND, "logo", "wordmark-on-dark.svg"), "utf8");
}

/**
 * Overlay showing where the person sits and where each platform paints its own
 * chrome, so a design can be checked without joining a real call.
 */
const GUIDES = `
.guide{position:absolute;border:2px dashed rgba(255,80,80,.85);
  font:600 20px/1 system-ui,sans-serif;color:rgba(255,120,120,.95)}
.guide span{position:absolute;left:0;top:-28px;white-space:nowrap}
.guide.subject{left:576px;top:0;width:768px;height:1080px;border-color:rgba(255,200,80,.8);color:rgba(255,200,80,.95)}
.guide.subject span{top:16px;left:16px}
.guide.nameplate{left:32px;bottom:24px;width:420px;height:64px}
.guide.controls{left:660px;bottom:0;width:600px;height:120px}
`;

const GUIDE_HTML = `
<div class="guide subject"><span>subject / person</span></div>
<div class="guide nameplate"><span>name chip (Meet / Zoom / Teams)</span></div>
<div class="guide controls"><span>call controls</span></div>
`;

export function buildPage({ design, logoWidth, position, guides }) {
  const place = positions[position];
  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:#000}
.stage{position:relative;width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;background:#18181b}
.logo{position:absolute;${place};width:${logoWidth}px;line-height:0;
  filter:drop-shadow(0 2px 18px rgba(0,0,0,.55))}
.logo svg{width:100%;height:auto;display:block}
${design.css}
${guides ? GUIDES : ""}
</style></head>
<body><div class="stage">
${design.layers}
<div class="logo">${loadWordmark()}</div>
${guides ? GUIDE_HTML : ""}
</div></body></html>`;
}
