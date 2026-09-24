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
  // The studio's rate card, as the page prints it (docs/copy-review.md section 11): `from` is
  // the fixed quote for a site of `pages` pages with a contact form, wording, a content system
  // and the launch included; `perPage` is what each page beyond that adds. The owner set the
  // starting price at £679 on 21 September 2026, over the pass's £4,750, so the scope it buys is
  // one page: the evidence puts a five-page build with a designer and ads at about £4,140 to
  // deliver, and a printed price must be one the studio genuinely sells at (CAP 3.22; CMA209
  // 4.19). To price the five-page scope at the starting figure instead, set `pages` to 5. Every
  // build quoted goes in the quote log the same section describes. While the studio is not VAT
  // registered the number is the whole number and VAT is never mentioned; once it registers,
  // `vatRegistered` turns every printed price into the VAT-inclusive figure with equal
  // prominence (CAP 3.18), never "plus VAT", and quotes already issued are honoured as written.
  price: { from: 679, perPage: 250, pages: 1, vatRegistered: false as boolean, vatRate: 0.2 },
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
  // The ink over the hero and the closing section (ADR 0031, ADR 0032, lib/motion/fluid.ts):
  // the simulation grid as a share of the canvas; the splat radius factor (splat / height,
  // about 2 * sqrt(height) pixels across); how hard pointer movement pushes the fluid; the
  // pressure passes a frame (more is tighter and more liquid, each is one pass); the fixed time
  // step, per frame, so the look follows the display's refresh rate; and where the ink wanders
  // while nobody is moving the pointer — from the start, and again once the pointer has been
  // still for `after` milliseconds — per axis a sum of sines around the centre, each
  // [amplitude, frequency per ms, phase], with unrelated frequencies so the path never visibly
  // repeats. Two more constants live in the shaders, which cannot read this file: the fade
  // (0.96 a frame) and the divergence scale.
  ink: {
    resolution: 0.25,
    splat: 4,
    gain: 5,
    pressureIterations: 4,
    dt: 1 / 60,
    idle: {
      after: 5_000,
      x: [
        [0.25, 0.0017, 0],
        [0.12, 0.0031, 1.3],
        [0.08, 0.0053, 2.7 + Math.PI / 2],
        [0.05, 0.0079, 4.1],
      ],
      y: [
        [0.18, 0.0023, 0.5],
        [0.12, 0.0041, 1.8 + Math.PI / 2],
        [0.08, 0.0067, 3.2],
        [0.05, 0.0089, 5 + Math.PI / 2],
      ],
    },
  },
  // The sketch's typing, which the walkthrough's sentence beat plays (lib/brief/typing.ts): a
  // steady pace, a breath after a comma, a longer one after a full stop, and a fixed wobble of
  // up to this much either way per character. The rest of what lived here drove the hero's
  // sketch loop, removed by ADR 0031.
  demo: {
    typing: {
      msPerChar: 16,
      pauseAfterCommaMs: 120,
      pauseAfterStopMs: 240,
      jitterMs: 4,
    },
  },
  // The How it works walkthrough (docs/walkthrough-plan.md, ADR 0025): one phone frame that paints
  // an example brand's five answers as the visitor scrolls, then builds them into a finished page.
  // The scroll picks a stop; the timeline glides to it at the speeds below.
  walkthrough: {
    // The reading line a beat's stage triggers on: this far below the sticky frame's bottom edge,
    // but never lower than this share of the viewport, since on a wide screen the frame sits
    // beside the beats and is only stuck once the section has scrolled up to it.
    anchorGapPx: 16,
    anchorShare: 0.75,
    // GSAP and the finished page are fetched once the section is this many viewports away.
    loadAheadViewports: 1,
    // A window resize rebuilds the timeline once it has been still for this long.
    resizeSettleMs: 150,
    // The dock on a phone (ADR 0036, app/_components/how-it-works-track.tsx), where the steps run
    // under the phone rather than beside it. zooms: what the fit tries for the phone, largest
    // first; 1.5 is the desktop's own phone, and 0.5 still docks a 320 by 568 screen. airPx: the
    // air left under the longest step, the size of the words' rise (0.75rem in
    // app/_styles/how-it-works.css), so a rising body never dips under the fold. leadMs: the
    // phone answers the docked words this long after the stop, so a flick moves it only once the
    // stops have been still this long. arrivalSlackPx: how far a fragment the visitor arrived on
    // may have drifted from its line (a font landing above it moved it 25 px in Firefox) and
    // still be put back when the dock grows the section; further than that, the visitor has
    // scrolled.
    dock: { zooms: [1.5, 1.25, 1, 0.8, 0.65, 0.5], airPx: 12, leadMs: 150, arrivalSlackPx: 48 },
    // The transitions, in ms. Nothing here is a hard cap: a stop the visitor reaches on its own
    // plays at these speeds; a jump over several plays faster (catchUp).
    beats: {
      // The sentence types at CONFIG.demo.typing's rhythm, so its length follows the brief; this
      // is the wait before the first character and the rest after the last.
      sentence: { lead: 200, tail: 500 },
      // The name lands: each part arrives this long after the one before, and the sentence,
      // which carried the page alone in full ink, steps back to this opacity.
      name: { for: 900, step: 70, arrive: 450, mutedOpacity: 0.72 },
      logo: { for: 700, arrive: 500 },
      // The look: the photograph settles in, the style's chip rises, the cards take theirs.
      look: { for: 1100, photo: 800, chipAt: 500, cardsAt: 350, step: 70, arrive: 450 },
      // The colour pours through its parts top to bottom, and the glow breathes in.
      colour: { for: 900, each: 450, step: 70, glow: 900 },
      // The build's beats (app/_components/sketch-build.ts), scaled to one frame.
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
        photoFilter: { from: 'sepia(0.3) saturate(1.25)', to: 'sepia(0) saturate(1)' },
        rise: { underPx: 8, byPx: 4 },
        words: { step: 40, risePx: 6 },
        labelShare: 0.25,
        card: { after: 80, for: 350, risePx: 4 },
      },
    },
    // A glide to the next stop plays at the beats' own speed. A jump over several stops is
    // capped: this long for the first, plus this much for each further stop, up to the maximum,
    // so a flick to the bottom watches the page assemble in one pass rather than nine seconds.
    catchUp: { firstMs: 1600, perStageMs: 400, maxMs: 2600 },
  },
  motion: {
    staggerMax: 4, // items that wait their turn in a list reveal; the rest arrive with the fourth
    headerScrolledAtPx: 24, // scroll depth at which the header takes its scrolled state
    // How long the header's blend waits, once the island has gone, before it flips back
    // (app/_components/header-chrome.tsx). The glass and the mark fade over --motion-enter and
    // the row unwinds over --motion-settle; this is --motion-settle's value (app/globals.css), so
    // the flip lands on a wide row with nothing left in the header to invert. Keep the two equal.
    headerStepMs: 300,
    // The phone menu's pace: its open and close run on the page's clocks stretched by this, so the
    // ink blooms over 900 ms (the owner, 24 September 2026). This is --menu-pace's value
    // (app/globals.css); keep the two equal. The drain is the header's step at this pace, 450 ms,
    // and the close waits twice that at most for the sheet's own transitions to report their end
    // (app/_components/mobile-nav.tsx).
    menuPace: 1.5,
    // The header goes dark once this share of the hero, or less, is still below the bar.
    heroDarkFootShare: 0.35,
    // Lenis (ADR 0021): the share of the distance still to go that each frame covers, on the wheel
    // and on a link to a section. Lower drifts further after the wheel stops; 0.1 is its default,
    // and 0.075 is the weightier glide the owner asked for, still short of the chase that sets in
    // around 0.05. scrubLag is how far, in seconds, a scrubbed tween (the rail fill, the footer
    // wordmark) trails the scroll; it rises with the glide so those tweens keep trailing the page
    // rather than leading it, which is what reads as weight. focusFrames is how many frames a
    // glide to a section waits for the open phone menu to let the page go before it gives up
    // moving focus to the section (app/_components/smooth-scroll.tsx); the menu lets go in the
    // click's own effect flush, so one frame is enough and three is the margin.
    scroll: { lerp: 0.075, scrubLag: 0.8, focusFrames: 3 },
    // The scroll choreography below the hero (ADR 0034). Entrances are batch tweens on lists the
    // choreography owns; the numbers sit inside `caps`, which the ADR records and a reviewer can check.
    choreo: {
      enterStart: 'top 94%', // where an owned group's entrance fires, a few pixels above PageMotion's line
      railStart: 'top 60%', // where the real-build rail fills and each numeral is reached
      railEnd: 'bottom 60%', // where the rail's fill completes
      tweenS: 0.8, // one entrance tween
      staggerS: 0.08, // between the items of an owned group
      riseRem: 2.5, // how far an item rises into place
      scaleFrom: 0.96, // where an item's scale starts
      tiltDeg: 1, // the straight-answer cards' one-degree lean, uprighting as they land
      drawS: 0.9, // the included glyphs' draw-on
      glyphStaggerS: 0.05, // between the paths of one glyph
      parallaxRem: 2.5, // the footer wordmark's scrubbed rise
      // The fail-safe clock, ticking from mount in PageMotion and from arming in the
      // choreography: every tick shows what the viewport has reached (its top inside the
      // viewport) and nothing has shown yet, so a list can never stay hidden where the visitor is
      // looking, and never runs ahead of them: a group below the fold keeps its entrance.
      settleFailSafeMs: 4000,
      // A resize refreshes every ScrollTrigger once the window has been still for this long, the
      // same settle the walkthrough uses for its rebuild.
      resizeSettleMs: 150,
      // The pooled curve under the ink stretch (app/_components/motion/ink-pool.ts): a mass on a
      // spring. The scroll's speed pulls it, deeper on the way down and flatter on the way up,
      // and the spring carries it back with a wobble once the page stops. stretchMax is the pull
      // at full speed, as a share of the resting depth; fullSpeedPxS is the speed at which the
      // pull is three quarters of that (a wheel notch under Lenis peaks near 500, a hard flick
      // near 2500), so lower makes a gentle scroll stir the curve too. frequencyHz is how fast
      // it wobbles and dampingRatio how soon the wobble dies: under 1 it overshoots. Lenis lets
      // the page down gently, so a spring that follows closely barely bounces (1.3 Hz at 0.35
      // swung back 4 px on a six-notch flick, measured; 1.1 Hz at 0.2 swung back 18 px and the
      // owner asked for more). 1 Hz at 0.1 lags the glide enough to swing back about half its
      // stretch and ring through five or six visible swings over three seconds, which is the
      // jiggle asked for; the loop then sleeps. Up to stretchKnee the curve is drawn as the
      // spring has it; past the knee what is drawn eases toward stretchCap and never reaches
      // it, so the top of a hard flick (the spring can swing to about 0.5) rounds off instead
      // of hitting a wall, and the apex stays under the band over the walkthrough's heading:
      // --spacing-band over --spacing-pool is 0.47 at its tightest, from 1943 px up, where both
      // tokens are at their caps.
      pool: {
        stretchMax: 0.3,
        stretchKnee: 0.25,
        stretchCap: 0.42,
        fullSpeedPxS: 1500,
        frequencyHz: 1,
        dampingRatio: 0.1,
      },
    },
    // The caps (ADR 0034, D12) every choreography number stays inside: translate, scale, one tween,
    // one stagger and the parallax layers at md+. Never width, padding, margin, inset, font axes,
    // letter-spacing, box-shadow, filter, the H1, an .over-ink wrapper, or an ancestor of the
    // walkthrough stage or of a sticky column. The pool's scaleY is decoration, like the rail's,
    // and is bounded by choreo.pool.stretchCap rather than by scaleFrom.
    caps: { translateRem: 2.5, scaleFrom: 0.94, tweenMs: 900, staggerMs: 80, parallaxRem: 6 },
  },
} as const
