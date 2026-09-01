/**
 * Background designs.
 *
 * Every design is authored in a fixed 1920x1080 coordinate space; higher
 * resolutions come from Chrome's device scale factor, not from different CSS.
 *
 * A design is `{ description, build(theme) }`, where `build` returns
 * `{ css, layers }`: `layers` is HTML painted behind the logo, and `css` styles
 * it. Colour comes only from the theme passed in — see `themes.mjs` — so one
 * composition renders on charcoal and on paper without branching.
 *
 * Keep the centre of the frame quiet: that is where the person sits.
 */

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
 * hole there leaves a visible column once the frame is this quiet.
 */
function starfield({ theme: P, seed, count, dimCentre = true }) {
  const rand = rng(seed);
  const stars = [];
  while (stars.length < count) {
    const x = rand() * 100;
    const y = rand() * 100;
    const central = dimCentre && x > 30 && x < 70;
    const r = rand();
    const size = r > 0.95 ? 3 : r > 0.72 ? 2 : 1;
    let opacity = (0.3 + rand() * 0.55) * P.starScale;
    if (central) opacity *= 0.4;
    const teal = rand() > 0.86;
    stars.push(
      `<i style="left:${x.toFixed(3)}%;top:${y.toFixed(3)}%;width:${size}px;height:${size}px;` +
        `opacity:${opacity.toFixed(3)};background:${teal ? P.starAccent : P.star}"></i>`
    );
  }
  return `<div class="stars">${stars.join("")}</div>`;
}

const STAR_CSS = `
.stars{position:absolute;inset:0}
.stars i{position:absolute;border-radius:50%;display:block}
`;

/** Subtle film grain — kills gradient banding on projector-grade compression. */
const grain = (P) => `
.grain{position:absolute;inset:0;opacity:${P.grainOpacity};mix-blend-mode:${P.grainBlend};
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E")}
`;

const vignette = (P) => `
.vignette{position:absolute;inset:0;
  background:radial-gradient(120% 95% at 50% 45%,transparent 40%,${P.shade(0.55)} 100%)}
`;

export const designs = {
  /** A slow teal aurora bleeding in from the top-left corner. */
  aurora: {
    description: "A soft teal aurora bleeding in from one corner. The quietest option — safe anywhere.",
    build: (P) => ({
      css: `
${grain(P)}${vignette(P)}
.sky{background:
  radial-gradient(115% 85% at 10% 4%, ${P.glow(0.2)}, transparent 55%),
  radial-gradient(85% 75% at 92% 98%, ${P.glow(0.1)}, transparent 60%),
  radial-gradient(60% 60% at 50% 40%, ${P.lift(0.55)}, transparent 70%),
  linear-gradient(158deg,${P.raised} 0%, ${P.base} 48%, ${P.deep} 100%)}
.veil{position:absolute;inset:0;
  background:linear-gradient(180deg,transparent 55%,${P.shade(0.35)} 100%)}
`,
      layers: `<div class="veil"></div><div class="vignette"></div><div class="grain"></div>`,
    }),
  },

  /** Faint orbital arcs sweeping out of the left edge, one teal body in transit. */
  orbit: {
    description: "Faint orbital arcs with a single teal body in transit. Space, but restrained.",
    build: (P) => ({
      css: `
${grain(P)}${vignette(P)}
.sky{background:
  radial-gradient(90% 80% at 8% 50%, ${P.glow(0.13)}, transparent 58%),
  linear-gradient(150deg,${P.raisedSoft} 0%, ${P.base} 55%, ${P.deep} 100%)}
.ring{position:absolute;left:-560px;top:50%;border-radius:50%;
  border:1px solid ${P.line(0.13)};transform:translateY(-50%)}
.ring.r1{width:1500px;height:1500px}
.ring.r2{width:2200px;height:2200px;border-color:${P.line(0.09)}}
.ring.r3{width:2950px;height:2950px;border-color:${P.line(0.055)}}
.ring.r4{width:3750px;height:3750px;border-color:${P.line(0.035)}}
.body{position:absolute;border-radius:50%;background:${P.accentLine}}
.body.b1{left:186px;top:236px;width:14px;height:14px;
  box-shadow:0 0 26px 6px ${P.glow(0.55)},0 0 70px 18px ${P.glow(0.18)}}
.body.b2{left:96px;top:806px;width:7px;height:7px;opacity:.6;
  box-shadow:0 0 16px 4px ${P.glow(0.35)}}
`,
      layers:
        `<div class="ring r1"></div><div class="ring r2"></div>` +
        `<div class="ring r3"></div><div class="ring r4"></div>` +
        `<div class="body b1"></div><div class="body b2"></div>` +
        `<div class="vignette"></div><div class="grain"></div>`,
    }),
  },

  /** A drift of stars with a teal nebula wash off to one side. */
  starfield: {
    description: "A quiet drift of stars with a faint teal nebula off to one side.",
    build: (P) => ({
      css: `
${STAR_CSS}${grain(P)}${vignette(P)}
.sky{background:
  radial-gradient(70% 60% at 84% 16%, ${P.glow(0.15)}, transparent 62%),
  radial-gradient(60% 55% at 14% 88%, ${P.glow(0.07)}, transparent 65%),
  linear-gradient(165deg,${P.sunken} 0%, ${P.deep} 60%, ${P.deeper} 100%)}
`,
      layers:
        starfield({ theme: P, seed: 20260824, count: 300 }) +
        `<div class="vignette"></div><div class="grain"></div>`,
    }),
  },



};

export const designNames = Object.keys(designs);
