// Every behaviour-tuning number lives here, nowhere else. Durations that CSS reads are the
// --motion-* variables in app/globals.css (ADR 0005).
export const CONFIG = {
  stageBudgetMs: {
    brief: 20_000,
    select: 5_000,
    copy: 60_000,
    imagery: 90_000,
    rank: 30_000, // one call inside the imagery budget
    tokens: 1_000,
  },
  // Every other outbound call: a Pexels search, a download from Pexels or Blob, a store on Blob.
  // Each gives up after this long, so one stalled socket cannot hold a stage past its budget
  // and leave the sweeper to settle a page the stage would have finished.
  timeoutMs: { search: 10_000, download: 30_000, store: 30_000 },
  // Five minutes end to end. The sweeper wakes this long before the deadline and writes the
  // fallback into any stage still open, so the clock never reaches zero without a result.
  deadline: { totalMs: 300_000, sweeperLeadMs: 45_000 },
  // A stage that fails is tried again this often, this many times: enough to outlast the
  // deadline, so the sweeper, not the first failure, decides when the fallback is used.
  pipeline: { retryAfterMs: 20_000, retries: 14 },
  // The brief is only the raw material for the copy and the searches, so it is tried this many
  // times within its step and then falls back, rather than holding the imagery stage until the
  // deadline. The copy, which the visitor reads, is retried until the deadline.
  brief: { attempts: 3 },
  // Fixed windows, counted in Postgres (lib/db/rate-limit.ts). Tune from real traffic.
  rateLimit: {
    submissionsPerIp: { windowSeconds: 3_600, max: 5 },
    submissionsPerIdentity: { windowSeconds: 86_400, max: 3 },
    uploadsPerIp: { windowSeconds: 3_600, max: 100 },
  },
  // How many times the reveal re-reads `seen` and tries again after another submission for the
  // same identity took a template first (lib/db/exclusivity.ts).
  exclusivity: { attempts: 3 },
  // Logo analysis (lib/logo/analyse.ts): the raster is sampled at samplePx; pixels under
  // alphaFloor are ignored; mean perceptual lightness (CIE L*, 0 to 1) under darkBelow is dark
  // artwork, over lightAbove is light; a border ring this wide that is backdropShare opaque is a
  // box behind the mark. The normalised raster the templates show is at most maxPx on its
  // longer side; an SVG is rasterised at the density that fills it.
  logo: {
    samplePx: 128,
    alphaFloor: 16,
    darkBelow: 0.35,
    lightAbove: 0.65,
    borderRingPx: 4,
    backdropShare: 0.9,
    maxPx: 512,
  },
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
  // The model calls (lib/ai). The guide's models: Sonnet 5 writes, Haiku 4.5 ranks pictures.
  // Thinking is off on every call: the answers are shapes judged by code afterwards, and
  // thinking tokens are billed as output, which on the copy call was most of the bill.
  ai: {
    models: { brief: 'claude-sonnet-5', copy: 'claude-sonnet-5', rank: 'claude-haiku-4-5' },
    maxTokens: { brief: 4_000, copy: 8_000, rank: 1_000 },
  },
  // Stock photographs (lib/images): how many candidates a search brings back for the ranking
  // model to judge, the one stored size (next/image serves every viewport from it), and the
  // words added to every search for the look the visitor chose.
  images: {
    perPage: 12,
    maxWidth: 1920,
    quality: 80,
    styleQuery: { warm: 'natural light', minimal: 'minimal', bold: 'vivid colour', dark: 'moody' },
  },
  // Copy that breaks a limit is sent back this many times with what went wrong within one call;
  // a call whose answer still breaks a limit is made again on this many attempts of the step,
  // then the fallback is used, because the model is not going to do better.
  copy: { retries: 1, attempts: 3 },
  // Resend's own sender, allowed only to the account owner's address, until a domain is verified.
  email: { testSender: 'PinnaclePX <onboarding@resend.dev>' },
  form: {
    minChars: 30, // one short sentence about the business
    maxChars: 400,
    maxUploadBytes: 6_000_000, // per file, logo or photo
    maxPhotos: 6,
    // A form finished faster than this from the moment it was opened is not a person's.
    minMs: 3_000,
  },
  call: { minutes: 20 }, // the Cal.com event length is set by hand to match
  // The real build, as the home page describes it (app/_components/build-items.ts). Every value
  // here is a commitment the studio has measured or confirmed against its contract, so each is
  // null until then and the page renders its minimum line instead (docs/home-page-content-plan.md,
  // decisions 8 and 10). Typed the way SITE.town is, because a bare null would narrow to `null`.
  build: { weeks: null as { min: number; max: number } | null },
  care: null as {
    checkMinutes: number
    replyWorkingDays: number
    backupsPerDay: number
    changesPerMonth: number
  } | null,
  // A submission, its pictures and, once nothing of theirs is left, the lead are deleted this
  // many days after it was sent, by a nightly sweep (lib/inngest/functions/retention-sweep.ts).
  retention: { days: 30, cron: '0 3 * * *' },
  polling: { statusMs: 3_000 }, // how often the done page asks how the designs are coming along
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
    // Lenis (ADR 0021): the share of the distance still to go that each frame covers, on the wheel
    // and on a link to a section. Lower drifts further after the wheel stops; 0.1 is its default.
    scroll: { lerp: 0.1 },
  },
} as const
