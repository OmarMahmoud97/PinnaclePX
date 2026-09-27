import { CONFIG } from '@/lib/config'

// The Work tile's view switch (ADR 0039): one device that reshapes between a browser window
// and a phone. This file is numbers only; app/_components/work-morph-controller.ts writes them.
//
// p runs from 0 (desktop) to 1 (phone), driven by a two-spring chain: a motor pulled by the
// checked radio and the device pulled by the motor, so the device leaves with no jolt and lands
// soft, and a change of mind re-grips the motor where the device is, so only the device's own
// momentum carries on before it turns. Every drawn value but the tile's height is a pure
// function of p, the device's speed and the meniscus's lean, and every geometric beat is eased
// flat at both ends, so a landing or a reversal never kinks and a reversal retraces the same
// path; the tile's height is its row's (rowAt, below). The springs are integrated by
// semi-implicit Euler in fixed sub-steps, as in lib/motion/chain.ts, so a 60 Hz and a 120 Hz
// display draw the same flight, and each frame is drawn from a sample at its own time, one
// partial step past the last whole one (sampleAt), so a frame is never up to a sub-step stale.

const N = CONFIG.motion.work

type Range = readonly [number, number]
export type View = 0 | 1 // desktop, phone

const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x)
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

// Smoothstep of p through a range: flat at both ends.
export function ease(p: number, [a, b]: Range): number {
  const u = clamp01((p - a) / (b - a))
  return u * u * (3 - 2 * u)
}

// Out of the gate early and flat at both ends: the light first beats (the address, the island),
// so the device answers in its first frames while the window takes a beat, and they land as
// softly as the rest. A plain ease-out came back to desktop at speed, and the address, still
// scaling and so drawn soft, snapped crisp at the hand-back.
function easeEarly(p: number, [a, b]: Range): number {
  const u = clamp01((p - a) / (b - a))
  return ease(1 - (1 - u) * (1 - u), [0, 1])
}

// The smoothstep's slope in p, for the front's speed.
function easeSlope(p: number, [a, b]: Range): number {
  const u = (p - a) / (b - a)
  return u <= 0 || u >= 1 ? 0 : (6 * u * (1 - u)) / (b - a)
}

// One rest state, measured from CSS (border-box pixels).
export type RestGeometry = Readonly<{
  W: number // the device's width
  H: number // the device's height
  T: number // the tile's own height, read top-aligned, so no row-mate's stretch is in it
  chromeH: number
  tabW: number
  tabH: number
}>

export type Geometry = Readonly<{
  d: RestGeometry
  p: RestGeometry
  border: number // the device's border width
  tabTop: number // the tab's top inside the chrome
  dots: readonly Readonly<{ x: number; y: number }>[] // the dots' centres in the chrome, at rest
  aspectD: number // the captures' own ratios, height over width, from their attributes
  aspectP: number
  focus: number // where the desktop capture is anchored as the bezels close in, 0 to 1
}>

export type Frame = Readonly<{
  p: number
  breath: number
  W: number
  H: number
  iw: number
  ih: number
  radius: number
  ring: number
  chromeH: number
  fold: number
  tabW: number
  tabH: number
  tabRadius: number
  island: number
  speaker: number
  labelOpacity: number
  labelScale: number
  dots: readonly Readonly<{ x: number; y: number; scale: number; opacity: number }>[]
  rf: number
  F: number
  c1: number
  c2: number
  lit: number
  dW: number
  dH: number
  oldTop: number
  oldX: number
  shade: number
  pW: number
  pH: number
  scale: number
  newX: number
  newY: number
  readout: number
  readoutPx: number
}>

// The share of its height change the device has made at p: the height beat, which the tile's own
// height rides too.
const heightShare = (p: number): number => ease(p, N.beats.height)

// Every number the controller writes for one moment of the flight but the tile's height, which
// is its row's (rowAt). `speed` is the device's dp/dt in 1/s; `lean` runs from -1 (toward
// Desktop) to 1 (toward Phone).
export function frame(pRaw: number, speed: number, lean: number, g: Geometry): Frame {
  const B = N.beats
  const p = clamp01(pRaw)
  const sw = ease(p, B.width)
  const W = lerp(g.d.W, g.p.W, sw)
  const H = lerp(g.d.H, g.p.H, heightShare(p))
  const iw = W - 2 * g.border
  const fold = ease(p, B.chrome)
  const chromeH = lerp(g.d.chromeH, g.p.chromeH, fold)
  const island = easeEarly(p, B.island)
  const speaker = ease(p, B.speaker)
  const tabH = lerp(lerp(g.d.tabH, N.island.heightPx, island), g.p.tabH, speaker)
  const tabW = lerp(lerp(g.d.tabW, N.island.widthPx, island), g.p.tabW, speaker)
  const label = easeEarly(p, B.label)
  // The dots slide into the island, the nearest first, shrinking as they pass under it.
  const cx = iw / 2
  const cy = g.tabTop + tabH / 2
  const last = g.dots.length - 1
  const dots = g.dots.map((dot, i) => {
    const lag = N.dots.staggerShare * (last - i)
    const d = ease(p, [B.dots[0] + lag, B.dots[1] + lag])
    return {
      x: (cx - dot.x) * d,
      y: (cy - dot.y) * d,
      scale: 1 - (1 - N.dots.endScale) * d,
      opacity: 1 - ease(d, N.dots.fade),
    }
  })
  // The front: edges at depth F, the middle leading them in the direction of travel by a sag
  // that follows the front's speed (a meniscus in flow), flat as it leaves the bar and as it
  // lands, leaning toward the pill that was pressed.
  const rf = ease(p, B.front)
  const F0 = g.d.chromeH
  const F1 = g.p.H
  const F = lerp(F0, F1, rf)
  const lit = Math.sin(Math.PI * rf)
  const frontSpeed = (F1 - F0) * easeSlope(p, B.front) * speed
  const sag = N.meniscus.sagPx * lit * Math.tanh(frontSpeed / N.meniscus.fullSpeedPxS)
  const c1 = (4 / 3) * sag * (1 + N.meniscus.leanShare * lean)
  const c2 = (4 / 3) * sag * (1 - N.meniscus.leanShare * lean)
  // The old page keeps its desktop width, cropped by both bezels about its focus, and is pushed
  // down on contact by the curve's highest point (a cubic stays inside its control hull). It
  // tucks up to tuckPx under the pouring page, never so far that its foot leaves the screen's:
  // edge to edge, the two anti-aliased edges shared a device pixel as a flat front drained, and
  // the device's dark ground showed through as a hairline.
  const ih = H - 2 * g.border
  const dW = g.d.W - 2 * g.border
  const dH = dW * g.aspectD
  const high = F + 0.75 * Math.min(0, c1, c2)
  const oldTop = Math.max(chromeH, ih - dH, high - N.tuckPx)
  // The new page at its own width, stretched only while the screen is still a hair wider, and
  // trailing the front so it settles in rather than being uncovered.
  const pW = g.p.W - 2 * g.border
  const scale = Math.max(1, iw / pW)
  const { desktopPx, phonePx } = N.readout
  return {
    p,
    breath: Math.sin(Math.PI * p),
    W,
    H,
    iw,
    ih,
    radius: lerp(N.radiusPx[0], N.radiusPx[1], ease(p, B.radius)),
    ring: ease(p, B.ring),
    chromeH,
    fold,
    tabW,
    tabH,
    tabRadius: lerp(N.tabRadiusPx, tabH / 2, island),
    island,
    speaker,
    labelOpacity: 1 - label,
    labelScale: lerp(1, N.labelEndScale, label),
    dots,
    rf,
    F,
    c1,
    c2,
    lit,
    dW,
    dH,
    oldTop,
    oldX: (iw - dW) * g.focus,
    shade: N.shade.max * ease(rf, [0, N.shade.byFront]),
    pW,
    pH: pW * g.aspectP,
    scale,
    newX: (iw - pW * scale) / 2,
    newY: chromeH - N.parallaxPx * (1 - rf),
    readout: ease(p, B.readoutIn) * (1 - ease(p, B.readoutOut)),
    readoutPx: Math.round(lerp(desktopPx, phonePx, sw)),
  }
}

// The clip for the pouring page and the stroke for the lit edge: one curve.
export function frontPaths(f: Frame): Readonly<{ clip: string; edge: string }> {
  const w = f.iw.toFixed(2)
  const y = f.F.toFixed(2)
  const y1 = (f.F + f.c1).toFixed(2)
  const y2 = (f.F + f.c2).toFixed(2)
  const x1 = (f.iw / 3).toFixed(2)
  const x2 = ((2 * f.iw) / 3).toFixed(2)
  return {
    clip: `path('M0 0H${w}V${y}C${x2} ${y2} ${x1} ${y1} 0 ${y}Z')`,
    edge: `M0 ${y}C${x1} ${y1} ${x2} ${y2} ${w} ${y}`,
  }
}

// Empty screen anywhere, in pixels: what the front, the pushed page and the bar leave
// uncovered. The unit test sweeps it to zero.
export function uncovered(f: Frame): number {
  const curveLow = f.F + 0.75 * Math.max(0, f.c1, f.c2)
  const curveHigh = f.F + 0.75 * Math.min(0, f.c1, f.c2)
  const onScreen = f.F < f.ih
  const aboveOld = onScreen ? f.oldTop - Math.max(f.chromeH, curveHigh) : 0
  const underOld = onScreen ? f.ih - Math.max(f.oldTop + f.dH, curveHigh) : 0
  const underNew = Math.min(curveLow, f.ih) - (f.newY + f.pH * f.scale)
  const aboveNew = f.newY - f.chromeH
  const sides = Math.max(f.oldX > 0 ? f.oldX : 0, f.iw - (f.oldX + f.dW))
  return Math.max(0, aboveOld, underOld, underNew, aboveNew, sides)
}

// ---- the row's height --------------------------------------------------------------------------

export type Moving = Readonly<{ T: number; v: number }> // a height, and its speed in px/s

// The room a flight's curve keeps at each of its ends: the end it left keeps the row as it stood
// as it left (leaving), and the end it heads for takes the room as it now stands (headFor), so a
// change of room moves the curve only as far as the flight has gone toward that end.
export type Ends = Readonly<{ d: number; p: number }>

// A flying tile as its row's height reads it: its rest heights, the room at each end, and its
// device's place and speed (dp/dt).
export type Flying = Readonly<{ g: Geometry; ends: Ends; p: number; speed: number }>

const STILL: Moving = { T: 0, v: 0 }

// A flight's ends as it heads for `goal` with the room as it now stands.
export const headFor = (ends: Ends, goal: View, room: number): Ends =>
  goal === 1 ? { d: ends.d, p: room } : { d: room, p: ends.p }

// A flight's ends as it leaves `from` with the row at `row`: the end it heads for takes the room,
// and the end it leaves keeps the row as it stands, which a row-mate in flight may hold above the
// room, less the width of the corner (roundedMax) that turns the row's speed onto a still height,
// so a moving row reaches that height with nothing added and turns onto it at rowTurnPxS2 while
// its speed holds; never below the room. From the room alone, a flight to the phone started
// under a row-mate flying back to desktop let the row fall toward the desktop height before its
// own rose, 790 to 573 to 770 px for a 21 px change (two tiles 150 ms apart); held at the row
// itself, a row already falling fast undershot it, climbed back and stalled there before rising
// (613 to 581 to 613 px, 450 ms apart).
export function leaving(from: View, room: number, row: Moving): Ends {
  const held = Math.max(room, row.T - (row.v * row.v) / N.rowTurnPxS2)
  return from === 1 ? { d: room, p: held } : { d: held, p: room }
}

// A flying tile's curve: its row's height with the tile at each rest state (its own, read
// top-aligned, or what that end keeps, whichever is taller) on the device's own height beat, so
// the row, its footers and the page below move on one curve, with no kink where the device
// outgrows room a taller row-mate lent it, and land flat on that room. With no room, the tile's
// own height.
function curveOf({ g, ends, p, speed }: Flying, own = false): Moving {
  const d = own ? g.d.T : Math.max(g.d.T, ends.d)
  const rise = (own ? g.p.T : Math.max(g.p.T, ends.p)) - d
  return { T: d + rise * heightShare(p), v: rise * easeSlope(p, N.beats.height) * speed }
}

// A smooth maximum, taken in turn, whose corner turns the speed at rowTurnPxS2 where two heights
// cross (it is as wide as their closing speed takes to spend at that rate): never below either,
// and two that meet at one speed, as a curve meets the room at its end, meet with nothing added.
// The width follows the closing speed at each moment, and the speed given assumes it holds, so
// a corner that a flight's changing speed narrows inside it turns the row faster than that.
function roundedMax(first: Moving, rest: readonly Moving[]): Moving {
  let { T, v } = first
  for (const h of rest) {
    const dv = h.v - v
    const k = (dv * dv) / N.rowTurnPxS2
    const gap = T - h.T
    if (Math.abs(gap) >= k) {
      if (gap < 0) {
        T = h.T
        v = h.v
      }
      continue
    }
    // Over the higher by k/6 at most, where they meet, and eased flat (a cubic) into and out of
    // the corner; its speed is the higher's with up to half the lower's.
    const q = 1 - Math.abs(gap) / k
    const lower = (q * q) / 2
    T = Math.max(T, h.T) + (k * q * q * q) / 6
    v = gap >= 0 ? lerp(v, h.v, lower) : lerp(h.v, v, lower)
  }
  return { T, v }
}

// The curves of a row's flying tiles, in its order, and the room its resting tiles keep, taken by
// the rounded maximum: the row with nothing carried.
export const rowCurve = (room: number, flying: readonly Flying[]): Moving =>
  roundedMax(
    { T: room, v: 0 },
    flying.map((tile) => curveOf(tile)),
  )

// The row before its floor: its curve and what it still carries from its last change (carryAt).
// A change carries on from this rather than from the row as drawn, so the floor rounds it once:
// carried on from the floored row, a hand-back rounded it against the floor a second time, and
// the tiles drawn after it in that frame stood up to 0.67 px off those drawn before.
export function rowRaw(room: number, flying: readonly Flying[], carried: Moving = STILL): Moving {
  const { T, v } = rowCurve(room, flying)
  return { T: T + carried.T, v: v + carried.v }
}

// The row's height, which every flying tile of a row writes: rowRaw, never below the room or any
// flying tile's own height, which a carried speed could take it under. A plain maximum turned the
// row in one frame where two curves crossed: two row-mates switched back to desktop 250 ms apart
// jolted it about 19 px in three frames and stopped it dead on the second tile's height, which
// had not yet left.
export function rowAt(room: number, flying: readonly Flying[], carried: Moving = STILL): Moving {
  const floor = [{ T: room, v: 0 }, ...flying.map((tile) => curveOf(tile, true))]
  return roundedMax(rowRaw(room, flying, carried), floor)
}

// What a row carries from the moment a tile of it started or stopped holding its own height, or
// one of its flights changed its mind (the room, and so the curves, changed there): the row as it
// stood before its floor (rowRaw) less its curve as it now is, in place and in speed, fading out
// over carryMs at the pace, so the row keeps its place and its speed through the change and then
// settles on its curve.
// Faded out in each flight's share instead, as the curves were first re-based, the room falling
// away under a flight near its goal made its curve plunge 150 px in a few frames.
export type Carry = Readonly<{ T: number; v: number; tMs: number }>

export function carryAt(c: Carry | null, tMs: number, pace: number): Moving {
  const span = (N.carryMs * pace) / 1000
  const s = c === null ? span : Math.max(0, tMs - c.tMs) / 1000
  if (c === null || s >= span) return STILL
  const u = s / span
  const held = c.T + c.v * s
  const fade = 1 - ease(u, [0, 1])
  return { T: held * fade, v: c.v * fade - (held * 6 * u * (1 - u)) / span }
}

// ---- the physics -----------------------------------------------------------------------------

type SpringNumbers = Readonly<{ frequencyHz: number; dampingRatio: number }>
type Spring = Readonly<{ stiffness: number; damping: number }>

export type Springs = Readonly<{
  motor: Spring
  device: Spring
  lean: Spring
  lead: Spring
  trail: Spring
}>

function springOf({ frequencyHz, dampingRatio }: SpringNumbers, pace: number): Spring {
  const omega = (2 * Math.PI * frequencyHz) / pace
  return { stiffness: omega * omega, damping: 2 * dampingRatio * omega }
}

// The springs at a pace (--work-morph-pace): 1.15 is 15 per cent slower and heavier throughout.
export function springsFor(pace: number): Springs {
  return {
    motor: springOf(N.motor, pace),
    device: springOf(N.device, pace),
    lean: springOf(N.lean, pace),
    lead: springOf(N.pill.lead, pace),
    trail: springOf(N.pill.trail, pace),
  }
}

// The pill's two rest positions, in the fieldset's own pixels.
export type Pill = Readonly<{ pad: number; width: number; phone: Range; desktop: Range }>

type Edge = Readonly<{ x: number; v: number }>

export type MorphState = Readonly<{
  tMs: number
  open: boolean // the decode gate has opened; until then the device holds where it started
  goal: View
  p: number
  v: number
  m: number
  mv: number
  dir: 1 | -1 // toward Phone or toward Desktop: what the meniscus leans to
  lean: number
  leanV: number
  beatMs: number | null // when the landing beat fired
  beatDir: 1 | -1
  pillOn: boolean
  pillGoal: View
  left: Edge
  right: Edge
}>

export type MorphEvent = Readonly<{ kind: 'change' | 'open'; goal: View }>

// A sub-step, as in chain.ts: omega times the step is about 0.08 for the stiffest spring (the
// lean, at 3 Hz) at pace 1 and 0.07 at 1.15, far inside the stability limit of 2, so the frame
// rate never colours the motion and a flight replays exactly from its events.
export const STEP_MS = 1000 / 240

const sideOf = (view: View): 1 | -1 => (view === 1 ? 1 : -1)
const edgesOf = (pill: Pill, view: View): Range => (view === 1 ? pill.phone : pill.desktop)

// How long a landing beat lives: its light or its bloom, whichever is longer, at the pace.
const beatSpan = (pace: number): number =>
  pace * Math.max(N.glintMs, N.bloom.riseMs + N.bloom.fallMs)

// A flight at rest in the view it leaves, the pill on that view's label.
export function startState(tMs: number, from: View, pill: Pill): MorphState {
  const [l, r] = edgesOf(pill, from)
  const toward = sideOf(from === 1 ? 0 : 1)
  return {
    tMs,
    open: false,
    goal: from,
    p: from,
    v: 0,
    m: from,
    mv: 0,
    dir: toward,
    lean: toward,
    leanV: 0,
    beatMs: null,
    beatDir: toward,
    pillOn: false,
    pillGoal: from,
    left: { x: l, v: 0 },
    right: { x: r, v: 0 },
  }
}

// The springs over dt seconds: the continuous values only, never an event or the clock.
function integrate(s: MorphState, dt: number, pill: Pill, k: Springs): MorphState {
  let { p, v, m, mv, left, right } = s
  if (s.open) {
    mv += (k.motor.stiffness * (s.goal - m) - k.motor.damping * mv) * dt
    m += mv * dt
    v += (k.device.stiffness * (m - p) - k.device.damping * v) * dt
    p += v * dt
  }
  const leanV = s.leanV + (k.lean.stiffness * (s.dir - s.lean) - k.lean.damping * s.leanV) * dt
  const lean = s.lean + leanV * dt
  if (s.pillOn) {
    const [tl, tr] = edgesOf(pill, s.pillGoal)
    // Toward Phone (left) the left edge leads; toward Desktop the right edge does.
    const [kl, kr] = s.pillGoal === 1 ? [k.lead, k.trail] : [k.trail, k.lead]
    const lv = left.v + (kl.stiffness * (tl - left.x) - kl.damping * left.v) * dt
    const rv = right.v + (kr.stiffness * (tr - right.x) - kr.damping * right.v) * dt
    left = { x: left.x + lv * dt, v: lv }
    right = { x: right.x + rv * dt, v: rv }
  }
  return { ...s, p, v, m, mv, lean, leanV, left, right }
}

function stepOnce(s: MorphState, pill: Pill, k: Springs, pace: number): MorphState {
  const next = integrate(s, STEP_MS / 1000, pill, k)
  let { beatMs, beatDir, pillOn, left, right } = next
  if (s.open) {
    // The landing beat: once, as the device passes landAt of the way toward its goal.
    const mark = s.goal === 1 ? N.landAt : 1 - N.landAt
    const crossed = s.goal === 1 ? s.p < mark && next.p >= mark : s.p > mark && next.p <= mark
    if (crossed && (beatMs === null || s.tMs - beatMs > beatSpan(pace))) {
      beatMs = s.tMs + STEP_MS
      beatDir = sideOf(s.goal)
    }
  }
  if (pillOn) {
    const [tl, tr] = edgesOf(pill, s.pillGoal)
    const R = N.pill.rest
    if (
      Math.abs(tl - left.x) < R.px &&
      Math.abs(tr - right.x) < R.px &&
      Math.abs(left.v) < R.speedPxS &&
      Math.abs(right.v) < R.speedPxS
    ) {
      pillOn = false
      left = { x: tl, v: 0 }
      right = { x: tr, v: 0 }
    }
  }
  return { ...next, tMs: s.tMs + STEP_MS, beatMs, beatDir, pillOn, left, right }
}

// The flight at `tMs`, in whole sub-steps from where it was.
export function advance(
  s: MorphState,
  tMs: number,
  pill: Pill,
  k: Springs,
  pace: number,
): MorphState {
  let state = s
  while (state.tMs + STEP_MS <= tMs) state = stepOnce(state, pill, k, pace)
  return state
}

// The flight as drawn at `tMs` itself: whole sub-steps, then one partial step on a copy. A frame
// drawn from the whole steps alone would be up to a sub-step old, by a different amount each
// frame, and on a display whose frame is not a whole number of sub-steps (90, 144 or 165 Hz) the
// front would stutter all through the pour. The sample is never kept: the stored flight stays on
// whole sub-steps, so it replays exactly from its events, and the landing beat and every
// hand-back are decided there.
export function sampleAt(
  s: MorphState,
  tMs: number,
  pill: Pill,
  k: Springs,
  pace: number,
): MorphState {
  const whole = advance(s, tMs, pill, k, pace)
  const rest = tMs - whole.tMs
  return rest > 0 ? { ...integrate(whole, rest / 1000, pill, k), tMs } : whole
}

export function apply(s: MorphState, e: MorphEvent): MorphState {
  if (e.kind === 'open') {
    return { ...s, open: true, m: s.p, mv: 0, goal: e.goal, dir: sideOf(e.goal) }
  }
  // A change of mind re-grips the motor where the device is, with no speed of its own.
  const regrip = s.open && e.goal !== s.goal
  return {
    ...s,
    pillOn: true,
    pillGoal: e.goal,
    dir: sideOf(e.goal),
    ...(regrip ? { m: s.p, mv: 0, goal: e.goal } : {}),
  }
}

// The device is still: its geometry hands back to CSS here, whatever the landing beat is doing.
export function deviceStill(s: MorphState): boolean {
  const R = N.rest
  return (
    s.open &&
    Math.abs(s.p - s.goal) < R.share &&
    Math.abs(s.v) < R.speed &&
    Math.abs(s.m - s.goal) < R.share &&
    Math.abs(s.mv) < R.speed
  )
}

export function beatLive(s: MorphState, pace: number): boolean {
  return s.beatMs !== null && s.tMs - s.beatMs < beatSpan(pace)
}

// The glint's progress, 0 to 1, or null when it is not drawn.
export function glintAt(s: MorphState, pace: number): number | null {
  if (s.beatMs === null) return null
  const u = (s.tMs - s.beatMs) / (pace * N.glintMs)
  return u >= 0 && u <= 1 ? u : null
}

// The pool's bloom, 0 to 1: a smooth rise, then a cosine fall.
export function bloomAt(s: MorphState, pace: number): number {
  if (s.beatMs === null) return 0
  const dt = (s.tMs - s.beatMs) / pace
  const { riseMs, fallMs } = N.bloom
  if (dt < 0 || dt >= riseMs + fallMs) return 0
  if (dt < riseMs) return ease(dt / riseMs, [0, 1])
  return 0.5 * (1 + Math.cos((Math.PI * (dt - riseMs)) / fallMs))
}

// The thumb's clip: its two edges, thinner while stretched like a drop drawn out (the stretch
// is the width beyond what a label at the thumb's centre would have).
export function pillClip(s: MorphState, pill: Pill): string {
  const L = s.left.x
  const R = s.right.x
  const [pl, pr] = pill.phone
  const [dl, dr] = pill.desktop
  const along = clamp01(((L + R) / 2 - (pl + pr) / 2) / ((dl + dr) / 2 - (pl + pr) / 2))
  const expected = lerp(pr - pl, dr - dl, along)
  const thin = N.pill.thinPx * Math.tanh(Math.max(0, R - L - expected) / N.pill.thinStretchPx)
  const inset = (pill.pad + thin).toFixed(2)
  const right = (pill.width - R).toFixed(2)
  return `inset(${inset}px ${right}px ${inset}px ${L.toFixed(2)}px round 9999px)`
}
