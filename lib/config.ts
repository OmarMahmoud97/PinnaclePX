// Every behaviour-tuning number lives here, nowhere else. Durations that CSS reads are the
// --motion-* variables in app/globals.css (ADR 0005).
export const CONFIG = {
  stageBudgetMs: { brief: 15_000, select: 5_000, copy: 60_000, imagery: 45_000, tokens: 5_000 },
  deadline: { totalMs: 300_000 }, // five minutes end to end
  rateLimit: { windowSec: 60, max: 5 },
  logo: { luminanceCutoff: 0.5 },
  // WCAG AA body text. The solver moves a text token's lightness by stepL until its pair passes,
  // and repeats over every pair until nothing moves, up to maxPasses (lib/tokens/contrast.ts).
  contrast: { minRatio: 4.5, stepL: 0.02, maxPasses: 8 },
  // The token recipe (lib/tokens/derive.ts). Every value is OKLCH lightness (0 to 1) or chroma.
  // The brand hue is never moved; surfaces take it at a small share of the brand's chroma, capped.
  colour: {
    tintShare: 0.1,
    light: {
      surface: { l: 0.985, maxC: 0.006 },
      'surface-muted': { l: 0.955, maxC: 0.012 },
      accent: { l: 0.94, maxC: 0.02 },
      border: { l: 0.9, maxC: 0.016 },
      'on-surface': { l: 0.2, maxC: 0.03 },
      'on-surface-muted': { l: 0.45, maxC: 0.04 },
      scrim: { l: 0.12, maxC: 0.03 },
      // Where the visitor's colour may sit as decoration, and as the fill that carries text.
      brandBand: [0.45, 0.85],
      fillBand: [0.32, 0.5],
      glow: { l: 0.8, minC: 0.12 },
      glowSecondary: { l: 0.72, minC: 0.14 },
    },
    dark: {
      surface: { l: 0.16, maxC: 0.012 },
      'surface-muted': { l: 0.21, maxC: 0.015 },
      accent: { l: 0.25, maxC: 0.02 },
      border: { l: 0.3, maxC: 0.02 },
      'on-surface': { l: 0.96, maxC: 0.01 },
      'on-surface-muted': { l: 0.72, maxC: 0.03 },
      scrim: { l: 0.08, maxC: 0.02 },
      brandBand: [0.55, 0.9],
      fillBand: [0.7, 0.85],
      glow: { l: 0.74, minC: 0.18 },
      glowSecondary: { l: 0.66, minC: 0.18 },
    },
    // The hover fill is this much further from the surface than the fill.
    hoverDeltaL: 0.06,
    // The second glow hue, degrees from the brand hue: a near complement, so the light has two
    // colours and depth (amber gets violet, green gets orange, blue gets green). Glows are never
    // behind text, so this is the one place a hue other than the brand's appears.
    glowHueShift: -130,
    // Below this chroma a colour is grey: its hue is not trusted and no colour is added to it.
    greyChroma: 0.02,
  },
  templates: { count: 10, conceptsShown: 3 },
  form: {
    minChars: 30, // one short sentence about the business
    maxChars: 400,
    maxUploadBytes: 6_000_000, // per file, logo or photo
    maxPhotos: 6,
  },
  call: { minutes: 20 }, // the Cal.com event length is set by hand to match
  retention: { days: 30 }, // lead, submission and blobs are deleted after this unless a call was booked
  polling: { designsMs: 10_000 }, // how often the done page asks whether the designs are ready
  analytics: { sectionViewThreshold: 0.2 }, // share of a section on screen before it counts as viewed
  // The hero sketch typing an example brief and then building it into a page, on a loop: the
  // 230-character VetPres brief takes about 4 s and the brief about 8 s, the build 2.4 s, the
  // finished page holds 3.5 s, the reset takes 0.9 s, and the next loop starts 0.4 s later.
  demo: {
    startDelayMs: 400,
    // The typing: a steady pace, a breath after a comma, a longer one after a full stop, and a
    // fixed wobble of up to this much either way per character (lib/brief/typing.ts). A phone
    // shows two lines of the sentence, so below md only this many characters are typed.
    typing: {
      msPerChar: 16,
      pauseAfterCommaMs: 120,
      pauseAfterStopMs: 240,
      jitterMs: 4,
      phoneChars: 80,
    },
    beatMs: 1000,
    holdMs: 900,
    // The share of the sketch's column on screen before the loop starts, and below which it
    // pauses. A quarter, so a phone with the frame's top at the fold sees the typing begin.
    startThreshold: 0.25,
    buildMs: 2400,
    builtHoldMs: 3500,
    resetMs: 900,
    loopDelayMs: 400,
    // The build's beats: when each starts, in ms from the build's start, how long it takes, and
    // the wait between siblings that move one after another. The last must end inside buildMs.
    // `cross` is the share of a travel each half of a crossfade takes: the sketch part fades out
    // over the first share, the finished part fades in over the last, and the stretch between,
    // the fastest, shows neither.
    build: {
      cross: 0.4,
      label: { at: 0, for: 250 },
      bg: { at: 250, for: 1100 },
      nav: { at: 100, for: 600, step: 50 },
      photo: { at: 250, for: 1100 },
      text: { at: 500, for: 800, step: 60 },
      cards: { at: 900, for: 600, step: 60 },
      footer: { at: 900, for: 500 },
      arrows: { at: 1650, for: 350, step: 80 },
      doneAt: 2200,
      // A finished part that barely travels (under `underPx`) rises `byPx` into place instead.
      rise: { underPx: 8, byPx: 4 },
      // The headline's words arrive one after another, each rising, inside its crossfade.
      words: { step: 40, risePx: 6 },
      // A pill's label fades in over only the last share of the travel, once the pill has shape.
      labelShare: 0.25,
      // A card's icon and title resolve this long after the card starts to show, for this long.
      card: { after: 80, for: 350, risePx: 4 },
    },
    // The reset: the finished page fades and lifts for this share of resetMs; at swapShare of
    // that fade, under the hidden sketch layer and with time for React to commit, the frame
    // swaps to empty; at dissolveShare the blank sketch starts fading in, so the two cross.
    reset: { fadeShare: 0.65, swapShare: 0.45, dissolveShare: 0.7, liftPx: 6 },
  },
  motion: {
    staggerMax: 4, // items that wait their turn in a list reveal; the rest arrive with the fourth
    headerScrolledAtPx: 24, // scroll depth at which the header takes its scrolled state
    walkthroughThreshold: 0.6, // share of a How it works beat on screen before it paints its stage
  },
} as const
