#!/usr/bin/env node
/**
 * Wingravity email signature generator.
 *
 * Builds a Gmail-safe HTML signature per person from a JSON file of their
 * details and the brand tokens, plus the hosted images it points at and a
 * preview.
 *
 *   node generate-signatures.mjs                          # every data/*.local.json, else the example
 *   node generate-signatures.mjs data/someone.local.json  # one file
 *
 * Layout: round photo | name, title, tagline, social icons | divider | phone,
 * email, website, wordmark. Gmail strips <style>, SVG, webfonts and
 * border-radius, so everything is a table with inline styles, and every image
 * (the photo already cut round, the icons, the wordmark) is a PNG referenced
 * by absolute URL.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { basename, dirname, isAbsolute, join } from "node:path";
import { findChrome, screenshot, tokens, wordmark, fontFaces } from "@wingravity/render";

const run = promisify(execFile);
const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "out");
/**
 * Every image the signatures point at: icons, wordmark and each person's
 * photo. Committed under docs/, which GitHub Pages serves at HOSTED_URL.
 */
const HOSTED = join(HERE, "..", "..", "docs", "email");
const HOSTED_URL = "https://branding.wingravity.com/email";
const C = tokens().colors;

/** Display sizes in CSS pixels. Every image is rendered at 2x. */
const PHOTO = 96;
const SOCIAL = 24;
const CONTACT = 16;
const WORDMARK_W = 120;
const WORDMARK_H = Math.round((WORDMARK_W * 188.02) / 1102.46);

/* ---------------------------------------------------------------- assets -- */

/**
 * Render HTML to a transparent PNG at 2x.
 *
 * The shared renderer paints a white page, which would show as a white slab in
 * dark-mode Gmail, so this calls Chrome directly with a transparent background.
 *
 * Headless Chrome stalls on very small windows, so the page is laid out at
 * least LAYOUT_MIN pixels on its short side (CSS zoom) and brought back down by
 * the device scale factor. Chrome will not scale below 0.5, which caps the zoom
 * at 4. The output is still exactly 2x `width`x`height`.
 */
const LAYOUT_MIN = 64;
async function transparentPng({ body, width, height, outPath }) {
  const f = Math.min(4, Math.max(1, Math.ceil(LAYOUT_MIN / Math.min(width, height))));
  const tmpDir = join(HERE, ".tmp");
  mkdirSync(tmpDir, { recursive: true });
  const htmlPath = join(tmpDir, `${basename(outPath)}.html`);
  writeFileSync(
    htmlPath,
    `<!doctype html><html><head><meta charset="utf-8"><style>
html{margin:0;background:transparent;overflow:hidden}
body{margin:0;width:${width}px;height:${height}px;overflow:hidden;zoom:${f}}
svg,img{display:block}</style></head><body>${body}</body></html>`
  );
  try {
    await run(findChrome(), [
      "--headless",
      "--disable-gpu",
      "--hide-scrollbars",
      "--no-first-run",
      "--no-default-browser-check",
      "--allow-file-access-from-files",
      "--force-color-profile=srgb",
      "--default-background-color=00000000",
      `--force-device-scale-factor=${2 / f}`,
      "--virtual-time-budget=2000",
      `--window-size=${width * f},${height * f}`,
      `--screenshot=${outPath}`,
      pathToFileURL(htmlPath).href,
    ]);
    if (!existsSync(outPath)) throw new Error(`Chrome did not produce ${outPath}`);
  } finally {
    rmSync(htmlPath, { force: true });
  }
}

const sized = (svg, w, h) => svg.replace(/<svg /, `<svg width="${w}" height="${h}" `);

/**
 * Contact icons: a `primaryInk` line glyph on transparent, drawn on a 24-unit
 * grid. Social icons: a filled `primaryInk` disc with a white glyph.
 */
const INK = C.primaryInk;
const line = (paths) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
const disc = (glyph) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="${INK}"/>${glyph}</svg>`;

const CONTACT_ICONS = {
  phone: line(`<path d="M21 16.4v2.8a1.9 1.9 0 0 1-2 1.9 18.6 18.6 0 0 1-8.1-2.9 18.3 18.3 0 0 1-5.6-5.6A18.6 18.6 0 0 1 2.4 4.5 1.9 1.9 0 0 1 4.3 2.5h2.8a1.9 1.9 0 0 1 1.9 1.6c.1.9.4 1.8.7 2.6a1.9 1.9 0 0 1-.4 2L8 9.9a15 15 0 0 0 5.6 5.6l1.2-1.2a1.9 1.9 0 0 1 2-.4c.8.3 1.7.6 2.6.7a1.9 1.9 0 0 1 1.6 1.8z"/>`),
  email: line(`<rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="M3 6.5l9 6.5 9-6.5"/>`),
  website: line(`<path d="M10 13.5a4.5 4.5 0 0 0 6.8.5l2.8-2.8a4.5 4.5 0 0 0-6.4-6.4l-1.6 1.6"/><path d="M14 10.5a4.5 4.5 0 0 0-6.8-.5l-2.8 2.8a4.5 4.5 0 0 0 6.4 6.4l1.6-1.6"/>`),
};

const SOCIAL_ICONS = {
  facebook: disc(`<path fill="#fff" d="M13.4 19v-6.1h2.1l.3-2.5h-2.4V8.9c0-.7.2-1.2 1.2-1.2h1.3V5.5a17 17 0 0 0-1.9-.1c-1.9 0-3.1 1.1-3.1 3.2v1.8H8.8v2.5h2.1V19z"/>`),
  x: disc(`<path fill="#fff" d="M7 6.5h3.1l6.9 11h-3.1z"/><path stroke="#fff" stroke-width="1.5" stroke-linecap="round" d="M16.4 6.8L7.6 17.2"/>`),
  linkedin: disc(`<circle fill="#fff" cx="8.4" cy="7.7" r="1.4"/><rect fill="#fff" x="7.2" y="10" width="2.4" height="7.4"/><path fill="#fff" d="M11.2 10h2.3v1c.4-.7 1.3-1.2 2.5-1.2 2.1 0 2.8 1.4 2.8 3.3v4.3h-2.4v-3.8c0-.9-.2-1.7-1.2-1.7-1.1 0-1.6.8-1.6 1.8v3.7h-2.4z"/>`),
  instagram: disc(`<rect x="6.6" y="6.6" width="10.8" height="10.8" rx="3.2" fill="none" stroke="#fff" stroke-width="1.6"/><circle cx="12" cy="12" r="2.6" fill="none" stroke="#fff" stroke-width="1.6"/><circle cx="15.2" cy="8.8" r=".85" fill="#fff"/>`),
};

const SOCIAL_LABEL = { facebook: "Facebook", x: "X", linkedin: "LinkedIn", instagram: "Instagram" };

async function renderSharedAssets() {
  mkdirSync(HOSTED, { recursive: true });
  await transparentPng({ body: sized(wordmark("light"), WORDMARK_W, WORDMARK_H), width: WORDMARK_W, height: WORDMARK_H, outPath: join(HOSTED, "wordmark-on-light@2x.png") });
  for (const [name, svg] of Object.entries(CONTACT_ICONS)) {
    await transparentPng({ body: sized(svg, CONTACT, CONTACT), width: CONTACT, height: CONTACT, outPath: join(HOSTED, `icon-${name}@2x.png`) });
  }
  for (const [name, svg] of Object.entries(SOCIAL_ICONS)) {
    await transparentPng({ body: sized(svg, SOCIAL, SOCIAL), width: SOCIAL, height: SOCIAL, outPath: join(HOSTED, `icon-${name}@2x.png`) });
  }
  console.log(`  ✓ assets: wordmark, ${Object.keys(CONTACT_ICONS).length} contact icons, ${Object.keys(SOCIAL_ICONS).length} social icons`);
}

const initials = (name) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");

/**
 * Cut the source photo into a circle with transparent corners, so Gmail shows
 * it round without border-radius. No photo: a neutral disc with initials.
 */
async function renderPhoto(s, slug) {
  const outPath = join(HOSTED, `${slug}-photo@2x.png`);
  const src = s.photo && (isAbsolute(s.photo) ? s.photo : join(HERE, s.photo));
  let body;
  if (src && existsSync(src)) {
    body = `<img src="${pathToFileURL(src).href}" width="${PHOTO}" height="${PHOTO}"
  style="width:${PHOTO}px;height:${PHOTO}px;border-radius:50%;object-fit:cover;object-position:${s.photoPosition ?? "50% 50%"}">`;
  } else {
    console.warn(`  ! ${slug}: no photo${s.photo ? ` at ${s.photo}` : ""}; using an initials placeholder.`);
    body = `<style>${fontFaces()}</style><div style="width:${PHOTO}px;height:${PHOTO}px;border-radius:50%;background:${C.gray["200"]};
  display:grid;place-items:center;font:400 32px Kanit,Arial,sans-serif;color:${C.gray["600"]}">${initials(s.name)}</div>`;
  }
  await transparentPng({ body, width: PHOTO, height: PHOTO, outPath });
}

/* ------------------------------------------------------------------ html -- */

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const FONT = `'Kanit', Arial, Helvetica, sans-serif`;
const TEXT = `font-family:${FONT};font-size:13px;line-height:20px;color:${C.gray["900"]}`;
const LINK = `color:${C.gray["900"]};text-decoration:underline`;
const TABLE = `cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse"`;

const bareUrl = (url) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");
const telHref = (phone) => "tel:" + phone.replace(/[^\d+]/g, "");
const img = (src, w, h, alt) =>
  `<img src="${src}" width="${w}" height="${h}" alt="${esc(alt)}" style="display:block;width:${w}px;height:${h}px;border:0">`;

function contactRows(s, base) {
  const rows = [];
  if (s.phone) rows.push(["phone", `<a href="${telHref(s.phone)}" style="${LINK}">${esc(s.phone)}</a>`]);
  rows.push(["email", `<a href="mailto:${esc(s.email)}" style="${LINK}">${esc(s.email)}</a>`]);
  rows.push(["website", `<a href="${esc(s.website)}" style="${LINK}">${esc(bareUrl(s.website))}</a>`]);
  const html = rows
    .map(([icon, html], i) => `<tr>
          <td style="padding:${i ? 7 : 0}px 10px 0 0;vertical-align:middle" valign="middle">${img(`${base}/icon-${icon}@2x.png`, CONTACT, CONTACT, icon)}</td>
          <td style="${TEXT};padding:${i ? 7 : 0}px 0 0 0;vertical-align:middle;white-space:nowrap" valign="middle">${html}</td>
        </tr>`);
  // The wordmark closes the column, where a fourth contact row would sit.
  if (s.showWordmark !== false) {
    html.push(`<tr><td colspan="2" style="padding:12px 0 0 0"><a href="${esc(s.website)}" style="text-decoration:none">${img(`${base}/wordmark-on-light@2x.png`, WORDMARK_W, WORDMARK_H, "Wingravity")}</a></td></tr>`);
  }
  return html.join("\n        ");
}

function socialRow(s, base) {
  const links = (s.socials ?? []).filter((x) => SOCIAL_ICONS[x.network]);
  if (!links.length) return "";
  const cells = links
    .map((x, i) => `<td style="padding:0 ${i < links.length - 1 ? 6 : 0}px 0 0"><a href="${esc(x.url)}" style="text-decoration:none">${img(`${base}/icon-${x.network}@2x.png`, SOCIAL, SOCIAL, SOCIAL_LABEL[x.network])}</a></td>`)
    .join("");
  return `<tr><td style="padding:14px 0 0 0"><table ${TABLE}><tr>${cells}</tr></table></td></tr>`;
}

/** `base` is the hosted URL in the real file and a file:// URL in the preview. */
function buildSignature(s, slug, base) {
  const photoSrc = s.photoUrl ?? `${base}/${slug}-photo@2x.png`;
  const tagline = s.tagline ? `<tr><td style="${TEXT};padding:2px 0 0 0">${esc(s.tagline)}</td></tr>` : "";

  return `<table ${TABLE.replace('style="', `style="font-family:${FONT};`)}>
  <tr>
    <td style="padding:0 20px 0 0;vertical-align:top" valign="top">${img(photoSrc, PHOTO, PHOTO, s.name)}</td>
    <td style="padding:6px 24px 0 0;vertical-align:top" valign="top">
      <table ${TABLE}>
        <tr><td style="font-family:${FONT};font-size:17px;line-height:24px;font-weight:700;color:${C.gray["900"]};white-space:nowrap">${esc(s.name)}${s.nameSuffix ? esc(s.nameSuffix) : ""}</td></tr>
        <tr><td style="${TEXT};padding:2px 0 0 0">${esc(s.title)}</td></tr>
        ${tagline}
        ${socialRow(s, base)}
      </table>
    </td>
    <td style="padding:6px 0 0 24px;border-left:1px solid ${C.gray["300"]};vertical-align:top" valign="top">
      <table ${TABLE}>
        ${contactRows(s, base)}
      </table>
    </td>
  </tr>
</table>`;
}

const page = (title, body) => `<!doctype html>
<html><head><meta charset="utf-8"><title>${esc(title)}</title></head>
<body style="margin:0;padding:24px;background:${C.white}">
${body}
</body></html>
`;

/* ---------------------------------------------------------------- render -- */

function inputs(argv) {
  if (argv.length) return argv.map((p) => (isAbsolute(p) ? p : join(process.cwd(), p)));
  const dir = join(HERE, "data");
  const local = readdirSync(dir).filter((f) => f.endsWith(".local.json")).sort();
  if (local.length) return local.map((f) => join(dir, f));
  console.log("  No data/*.local.json found. Using the example; copy it to make your own.\n");
  return [join(dir, "signature.example.json")];
}

const slugify = (name) =>
  name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

await renderSharedAssets();

for (const file of inputs(process.argv.slice(2))) {
  const s = JSON.parse(readFileSync(file, "utf8"));
  for (const key of ["name", "title", "email", "website"]) {
    if (!s[key]) throw new Error(`${basename(file)} is missing "${key}".`);
  }
  const slug = slugify(s.name);
  const base = (s.assetBaseUrl ?? HOSTED_URL).replace(/\/$/, "");

  if (!s.photoUrl) await renderPhoto(s, slug);
  writeFileSync(join(OUT, `${slug}.html`), page(`${s.name}, signature`, buildSignature(s, slug, base)));

  // The preview swaps hosted URLs for local files, so it renders before the
  // images are deployed.
  const preview = page("preview", buildSignature(s, slug, pathToFileURL(HOSTED).href));
  await screenshot({ html: preview, width: 820, height: 170, outPath: join(OUT, `${slug}-preview.png`), scale: 2 });
  console.log(`  ✓ ${slug}.html, ${slug}-preview.png${s.photoUrl ? "" : `, docs/email/${slug}-photo@2x.png`}`);
}

console.log("\nCommit and push docs/email/ so Pages serves the images before pasting into Gmail. See README.");
