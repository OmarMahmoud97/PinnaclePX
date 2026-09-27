// These numbers live beside the switch rather than in CONFIG. CONFIG is one object that rides
// every route's initial bundle, where this block pushed /contact's scripts over their line (27
// September 2026); here they ride only the switch's lazy chunk (the pure module and the
// controller) and its tests, so no page downloads them before a visitor reaches for a switch.
// The two names the scroll choreography reads of a flight are in lib/motion/work-flight.ts, so
// its chunk never carries these.
//
// The Work tile's view switch (ADR 0039; lib/motion/work-morph.ts, driven by
// app/_components/work-morph-controller.ts): one device reshapes between a browser window and
// a phone. p runs from 0 (desktop) to 1 (phone) on a two-spring chain: the motor is pulled by
// the checked radio and the device by the motor, so it leaves with no jolt and lands soft,
// and a change of mind re-grips the motor where the device is (the turntable prototype, 27
// September 2026). At pace 1 the device is at p 0.5 by 400 ms, within a pixel by about 900 ms
// and at rest at 1,054 ms, and the landing beat's light and bloom run to about 1.46 s; pace
// stretches every spring and both beat clocks by itself, so the default 1.15 (the owner reads
// weight as premium) is at rest at 1.2 s and ends the beat at about 1.68 s. pace is
// --work-morph-pace (app/_styles/work.css); keep the two equal, and raise it rather than the
// --motion-* clocks. Each beat is a range of p, eased flat at both ends; the address and the
// island leave early in theirs, so the light things answer the click first. The dots
// slide into the island a staggerShare of p apart, the nearest first; the meniscus sags up
// to sagPx at fullSpeedPxS of the front and leans leanShare of that toward the pressed pill;
// the new page trails the front by up to parallaxPx; the leaving page tucks up to tuckPx
// under the pouring one, as far as its foot allows, so their edges never meet over the
// device's dark ground, and sinks under the ink shade to shade.max by shade.byFront of the
// pour. The size readout is gone by 0.88 on the way to the phone, before the page it sits on
// settles. Where two flying tiles' curves cross in one row, a rounded corner as wide as their
// closing speed takes to spend at rowTurnPxS2 (2.5 px/frame² at 60 Hz) turns the row at that
// rate only while that closing speed holds; a new flight's leaving end keeps the row as it
// stands, less that corner; and whenever a tile of a row starts or stops holding its own
// height, or a flight in it changes its mind, the row carries its place and speed on for
// carryMs at the pace. The landing beat fires once, as the device passes landAt of its way.
// decodeMs is the longest a capture may hold the flight back while it decodes, and warmShare
// how much of a tile must be on screen before its captures are fetched and decoded on idle,
// for a touch screen's first tap.
export const WORK_MORPH = {
  pace: 1.15,
  motor: { frequencyHz: 1.5, dampingRatio: 1 },
  device: { frequencyHz: 1.2, dampingRatio: 0.8 },
  lean: { frequencyHz: 3, dampingRatio: 1 },
  rest: { share: 0.002, speed: 0.03 },
  rowTurnPxS2: 9000,
  carryMs: 240,
  decodeMs: 180,
  warmShare: 0.6,
  beats: {
    width: [0, 0.34],
    height: [0.3, 1],
    radius: [0.1, 0.6],
    label: [0, 0.14],
    island: [0, 0.3],
    speaker: [0.46, 0.82],
    chrome: [0.36, 0.8],
    dots: [0.02, 0.26],
    front: [0.3, 0.95],
    ring: [0.55, 1],
    readoutIn: [0, 0.06],
    readoutOut: [0.78, 0.88],
  },
  radiusPx: [12, 20],
  tabRadiusPx: 6,
  labelEndScale: 0.8,
  island: { widthPx: 42, heightPx: 13 },
  dots: { staggerShare: 0.035, endScale: 0.4, fade: [0.55, 0.95] },
  meniscus: { sagPx: 20, fullSpeedPxS: 1400, leanShare: 0.45 },
  parallaxPx: 36,
  tuckPx: 1,
  shade: { max: 0.36, byFront: 0.45 },
  landAt: 0.8,
  glintMs: 640,
  bloom: { riseMs: 160, fallMs: 720, alpha: 0.16 },
  breath: { alpha: 0.08, scaleX: 0.04, scaleY: 0.1 },
  // The capture viewports (scripts/capture-work.mjs), counted by the size readout, which
  // rides gapPx under the bar.
  readout: { desktopPx: 1440, phonePx: 390, gapPx: 7 },
  // The pill's thumb: its leading edge on a stiff spring and its trailing edge on a soft one,
  // so it stretches across both words, thinning by up to thinPx (thinStretchPx of stretch is
  // three quarters of that), and gathers on the pressed one. It hands back to the label's own
  // paint once both edges are within rest.px of it and slower than rest.speedPxS, so the
  // hand-back moves no edge by more than a twentieth of a pixel (0.3 px showed as a ring).
  pill: {
    lead: { frequencyHz: 2.4, dampingRatio: 0.8 },
    trail: { frequencyHz: 1.8, dampingRatio: 0.84 },
    rest: { px: 0.05, speedPxS: 1 },
    thinPx: 1.75,
    thinStretchPx: 30,
  },
  // Under reduced motion or forced colours there is no flight: the device rises from this
  // opacity once the new capture has decoded (opacity only, WCAG 2.3.3).
  reducedFade: { fromOpacity: 0.25, ms: 240 },
} as const
