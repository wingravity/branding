/**
 * Background designs.
 *
 * Every design is authored in a fixed 1920x1080 coordinate space; higher
 * resolutions come from Chrome's device scale factor, not from different CSS.
 *
 * A design returns { css, layers } where `layers` is HTML painted behind the
 * logo. Keep the centre of the frame quiet: that is where the person sits.
 */

import { tokens } from "../../lib/chrome.mjs";

const C = tokens().colors;

const T = {
  primary: C.primary,
  ink900: C.gray["900"],
  ink800: C.gray["800"],
  ink700: C.gray["700"],
};

/** `#rrggbb` + alpha -> `rgba(...)`, so designs never restate a brand hex. */
function rgba(hex, alpha) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return `rgba(${r},${g},${b},${alpha})`;
}

/** The brand teal at a given alpha — by far the most common colour here. */
const A = (alpha) => rgba(C.primary, alpha);

/** Deterministic PRNG so a given design always renders identically. */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

/**
 * Stars. The central subject area is dimmed rather than emptied — cutting a
 * hole there leaves a visible column once the frame is this dark.
 */
function starfield({ seed, count, dimCentre = true }) {
  const rand = rng(seed);
  const stars = [];
  while (stars.length < count) {
    const x = rand() * 100;
    const y = rand() * 100;
    const central = dimCentre && x > 30 && x < 70;
    const r = rand();
    const size = r > 0.95 ? 3 : r > 0.72 ? 2 : 1;
    let opacity = 0.3 + rand() * 0.55;
    if (central) opacity *= 0.4;
    const teal = rand() > 0.86;
    stars.push(
      `<i style="left:${x.toFixed(3)}%;top:${y.toFixed(3)}%;width:${size}px;height:${size}px;` +
        `opacity:${opacity.toFixed(3)};background:${teal ? T.primary : "#fff"}"></i>`
    );
  }
  return `<div class="stars">${stars.join("")}</div>`;
}

const STAR_CSS = `
.stars{position:absolute;inset:0}
.stars i{position:absolute;border-radius:50%;display:block}
`;

/** Subtle film grain — kills gradient banding on projector-grade compression. */
const GRAIN = `
.grain{position:absolute;inset:0;opacity:.05;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E")}
`;

const VIGNETTE = `
.vignette{position:absolute;inset:0;
  background:radial-gradient(120% 95% at 50% 45%,transparent 40%,rgba(0,0,0,.55) 100%)}
`;

export const designs = {
  /** Deep charcoal with a slow teal aurora bleeding in from the top-left. */
  aurora: {
    description: "Deep charcoal with a soft teal aurora. The quietest option — safe anywhere.",
    css: `
${GRAIN}${VIGNETTE}
.stage{background:
  radial-gradient(115% 85% at 10% 4%, ${A(.20)}, transparent 55%),
  radial-gradient(85% 75% at 92% 98%, ${A(.10)}, transparent 60%),
  radial-gradient(60% 60% at 50% 40%, rgba(54,58,69,.55), transparent 70%),
  linear-gradient(158deg,#1e2025 0%, ${T.ink900} 48%, #0e0e10 100%)}
.veil{position:absolute;inset:0;
  background:linear-gradient(180deg,transparent 55%,rgba(0,0,0,.35) 100%)}
`,
    layers: `<div class="veil"></div><div class="vignette"></div><div class="grain"></div>`,
  },

  /** Faint orbital arcs sweeping out of the left edge, one teal body in transit. */
  orbit: {
    description: "Faint orbital arcs with a single teal body in transit. Space, but restrained.",
    css: `
${GRAIN}${VIGNETTE}
.stage{background:
  radial-gradient(90% 80% at 8% 50%, ${A(.13)}, transparent 58%),
  linear-gradient(150deg,#1c1d22 0%, ${T.ink900} 55%, #101012 100%)}
.ring{position:absolute;left:-560px;top:50%;border-radius:50%;
  border:1px solid ${A(.13)};transform:translateY(-50%)}
.ring.r1{width:1500px;height:1500px}
.ring.r2{width:2200px;height:2200px;border-color:${A(.09)}}
.ring.r3{width:2950px;height:2950px;border-color:${A(.055)}}
.ring.r4{width:3750px;height:3750px;border-color:${A(.035)}}
.body{position:absolute;border-radius:50%;background:${T.primary}}
.body.b1{left:186px;top:236px;width:14px;height:14px;
  box-shadow:0 0 26px 6px ${A(.55)},0 0 70px 18px ${A(.18)}}
.body.b2{left:96px;top:806px;width:7px;height:7px;opacity:.6;
  box-shadow:0 0 16px 4px ${A(.35)}}
`,
    layers:
      `<div class="ring r1"></div><div class="ring r2"></div>` +
      `<div class="ring r3"></div><div class="ring r4"></div>` +
      `<div class="body b1"></div><div class="body b2"></div>` +
      `<div class="vignette"></div><div class="grain"></div>`,
  },

  /** Near-black sky, a drift of stars, a teal nebula wash off to one side. */
  starfield: {
    description: "Near-black sky with a drift of stars and a faint teal nebula.",
    css: `
${STAR_CSS}${GRAIN}${VIGNETTE}
.stage{background:
  radial-gradient(70% 60% at 84% 16%, ${A(.15)}, transparent 62%),
  radial-gradient(60% 55% at 14% 88%, ${A(.07)}, transparent 65%),
  linear-gradient(165deg,#16171b 0%, #101013 60%, #0a0a0c 100%)}
`,
    layers: starfield({ seed: 20260824, count: 300 }) +
      `<div class="vignette"></div><div class="grain"></div>`,
  },

  /** Planet limb across the bottom edge with a teal rim light. */
  horizon: {
    description: "A planet limb across the bottom edge, rim-lit in teal. The most cinematic of the set.",
    css: `
${STAR_CSS}${GRAIN}
.stage{background:
  radial-gradient(80% 70% at 50% 6%, ${A(.10)}, transparent 60%),
  linear-gradient(180deg,#101115 0%, #0b0b0e 55%, #08080a 100%)}
.planet{position:absolute;left:50%;top:960px;width:4600px;height:4600px;
  margin-left:-2300px;border-radius:50%;background:#0a0a0c;
  box-shadow:0 -1px 0 1px ${A(.42)},
             0 -22px 90px 8px ${A(.22)},
             0 -70px 220px 30px ${A(.10)}}
.limb{position:absolute;left:0;right:0;top:846px;height:180px;
  background:radial-gradient(60% 100% at 50% 100%, ${A(.20)}, transparent 72%)}
.topfade{position:absolute;inset:0;
  background:linear-gradient(180deg,rgba(0,0,0,.42) 0%,transparent 34%)}
`,
    layers:
      starfield({ seed: 991177, count: 240 }) +
      `<div class="limb"></div><div class="planet"></div>` +
      `<div class="topfade"></div><div class="grain"></div>`,
  },

  /** A dark body eclipsing a teal corona, held off to the right. */
  eclipse: {
    description: "A dark body against a teal corona, held to one side. Bold but still quiet in the centre.",
    css: `
${STAR_CSS}${GRAIN}${VIGNETTE}
.stage{background:linear-gradient(160deg,#141519 0%, #0d0d10 60%, #08080a 100%)}
.corona{position:absolute;left:1274px;top:176px;width:600px;height:600px;border-radius:50%;
  background:radial-gradient(closest-side, ${A(.85)}, ${A(.20)} 60%, transparent 76%);
  filter:blur(3px)}
.disc{position:absolute;left:1300px;top:202px;width:548px;height:548px;border-radius:50%;
  background:radial-gradient(120% 120% at 26% 22%, #15161a 0%, #0a0a0c 60%, #060607 100%);
  box-shadow:inset 0 0 90px 12px rgba(0,0,0,.9),
             0 0 0 1px ${A(.30)},
             0 0 60px 6px ${A(.16)}}
.glowfloor{position:absolute;inset:0;
  background:radial-gradient(80% 58% at 82% 30%, ${A(.15)}, transparent 62%)}
`,
    layers:
      starfield({ seed: 5150, count: 220 }) +
      `<div class="glowfloor"></div><div class="corona"></div><div class="disc"></div>` +
      `<div class="vignette"></div><div class="grain"></div>`,
  },
};

export const designNames = Object.keys(designs);
