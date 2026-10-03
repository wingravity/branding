import { wordmark } from "../../lib/chrome.mjs";

export const WIDTH = 1920;
export const HEIGHT = 1080;

export const positions = {
  "bottom-right": "right:120px;bottom:104px",
  "bottom-left": "left:120px;bottom:104px",
  "top-right": "right:120px;top:96px",
  "top-left": "left:120px;top:96px",
};

/**
 * Overlay showing where the person sits and where each platform paints its own
 * chrome, so a design can be checked without joining a real call.
 *
 * Guides sit outside the mirror, in file coordinates: platform chrome is drawn
 * on top of the tile and is never mirrored, so these mark where it lands on the
 * frame as it is transmitted.
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

export function buildPage({ design, theme, logoWidth, position, guides, mirror }) {
  const place = positions[position];
  const { css, layers } = design.build(theme);
  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:${theme.page}}
.stage{position:relative;width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;background:${theme.base}}
.sky{position:absolute;inset:0${mirror ? ";transform:scaleX(-1)" : ""}}
.logo{position:absolute;${place};width:${logoWidth}px;line-height:0;
  filter:${theme.logoShadow}}
.logo svg{width:100%;height:auto;display:block}
${css}
${guides ? GUIDES : ""}
</style></head>
<body><div class="stage">
<div class="sky">
${layers}
<div class="logo">${wordmark(theme.wordmark)}</div>
</div>
${guides ? GUIDE_HTML : ""}
</div></body></html>`;
}
