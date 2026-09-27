import { describe, expect, it } from 'vitest'
import { WORK_MORPH } from '@/lib/motion/work-tuning'
import {
  advance,
  apply,
  beatLive,
  bloomAt,
  type Carry,
  carryAt,
  deviceStill,
  ease,
  type Ends,
  type Flying,
  frame,
  frontPaths,
  type Geometry,
  glintAt,
  headFor,
  leaving,
  type MorphState,
  type Moving,
  type Pill,
  pillClip,
  rowAt,
  rowCurve,
  rowRaw,
  sampleAt,
  springsFor,
  startState,
  STEP_MS,
  uncovered,
  type View,
} from '@/lib/motion/work-morph'

// The Work switch's numbers (lib/motion/work-morph.ts, ADR 0039): both rest states are drawn
// exactly, no moment of any flight leaves the screen empty and the leaving page tucks under the
// pouring one, the geometry leaves and lands flat, the chain keeps the prototype's clock at pace
// 1 and stretches it by the pace, the frame rate never colours it and each frame is drawn at its
// own time, a change of mind turns with the device's momentum and nothing jumps, a row's height
// is never shorter than a tile in it and turns no corner in a frame, the landing beat fires once,
// and the pill and the meniscus stay inside their bounds.

const N = WORK_MORPH

// The prototype's measured lg tile (three columns at 1300 wide), and the phone rail at 390.
const WIDE: Geometry = {
  d: { W: 330.672, H: 242.406, T: 552.391, chromeH: 35, tabW: 72.5, tabH: 18 },
  p: { W: 224, H: 486.656, T: 759.641, chromeH: 16, tabW: 32, tabH: 4 },
  border: 1,
  tabTop: 8,
  dots: [
    { x: 16, y: 17 },
    { x: 30, y: 17 },
    { x: 44, y: 17 },
  ],
  aspectD: 280 / 448,
  aspectP: 912 / 432,
  focus: 0.5,
}
const RAIL: Geometry = {
  ...WIDE,
  d: { ...WIDE.d, W: 262, H: 199.5, T: 538.5 },
  p: { ...WIDE.p, W: 192, H: 419.109, T: 721.1 },
}

// Two labels on a 4 px padded track: Phone 56 px wide, Desktop 66.
const PILL: Pill = { pad: 4, width: 130, phone: [4, 60], desktop: [60, 126] }

// A flight from `from` with its gate open at 0, sampled every sub-step until `untilMs`, with an
// optional change of mind at `turnMs`.
function fly(
  from: View,
  untilMs: number,
  pace = 1,
  turnMs?: number,
): { states: MorphState[]; turned: MorphState | undefined } {
  const k = springsFor(pace)
  const goal: View = from === 1 ? 0 : 1
  let s = apply(apply(startState(0, from, PILL), { kind: 'change', goal }), { kind: 'open', goal })
  const states: MorphState[] = [s]
  let turned: MorphState | undefined
  for (let t = STEP_MS; t <= untilMs; t += STEP_MS) {
    if (turnMs !== undefined && turned === undefined && t >= turnMs) {
      s = advance(s, turnMs, PILL, k, pace)
      turned = s
      s = apply(s, { kind: 'change', goal: from })
    }
    s = advance(s, t, PILL, k, pace)
    states.push(s)
  }
  return { states, turned }
}

// The first time p crosses a share on the way to phone, in ms.
const crossing = (states: MorphState[], share: number): number =>
  states.find((s) => s.p >= share)?.tMs ?? Infinity
const stillAt = (states: MorphState[]): number => states.find(deviceStill)?.tMs ?? Infinity
const sagOf = (c1: number, c2: number): number => (3 * (c1 + c2)) / 8

describe('the rest states', () => {
  it('are the desktop and the phone exactly', () => {
    for (const g of [WIDE, RAIL]) {
      for (const lean of [-1, 1]) {
        const desk = frame(0, 0, lean, g)
        expect([desk.W, desk.H]).toEqual([g.d.W, g.d.H])
        for (const dot of desk.dots) expect(dot).toEqual({ x: 0, y: 0, scale: 1, opacity: 1 })
        expect(desk.labelOpacity).toBe(1)
        expect([desk.readout, desk.lit, desk.shade]).toEqual([0, 0, 0])
        expect(desk.oldTop).toBe(desk.chromeH)
        const phone = frame(1, 0, lean, g)
        expect(phone.W).toBeCloseTo(g.p.W, 9)
        expect(phone.H).toBeCloseTo(g.p.H, 9)
        expect(phone.newY).toBeCloseTo(16, 9)
        expect(phone.scale).toBeCloseTo(1, 12)
      }
      // The tile alone in its row stands at its own height in each.
      const alone = (p: number) => rowCurve(0, [{ g, ends: { d: 0, p: 0 }, p, speed: 0 }]).T
      expect(alone(0)).toBe(g.d.T)
      expect(alone(1)).toBeCloseTo(g.p.T, 9)
    }
  })
})

describe('the screen', () => {
  it('is never empty, at any moment, speed or lean', () => {
    const cases: Geometry[] = [
      WIDE,
      RAIL,
      // A taller row-mate lends the tile room it does not fill.
      { ...WIDE, d: { ...WIDE.d, T: 700 } },
      { ...WIDE, focus: 0 },
      { ...WIDE, focus: 1 },
    ]
    for (const g of cases) {
      for (let i = 0; i <= 400; i += 1) {
        for (const speed of [-2.6, -1.3, 0, 1.3, 2.6]) {
          for (const lean of [-1, 0, 1]) {
            expect(uncovered(frame(i / 400, speed, lean, g))).toBe(0)
          }
        }
      }
    }
  })

  it('tucks the leaving page under the pouring one, as far as its foot allows', () => {
    for (const g of [WIDE, RAIL]) {
      for (let i = 0; i <= 1000; i += 1) {
        for (const speed of [-2.6, -1.3, 0, 1.3, 2.6]) {
          for (const lean of [-1, 0, 1]) {
            const f = frame(i / 1000, speed, lean, g)
            const high = f.F + 0.75 * Math.min(0, f.c1, f.c2)
            const lift = high - g.d.chromeH
            if (lift <= 0 || f.F >= f.ih) continue
            // Its foot holds it to about half the front's lift for the first two pixels, then
            // it tucks the whole way.
            const tuck = high - f.oldTop
            expect(tuck).toBeLessThanOrEqual(N.tuckPx + 1e-9)
            expect(tuck).toBeGreaterThanOrEqual(Math.min(N.tuckPx, 0.45 * lift))
          }
        }
      }
    }
  })

  it('draws the clip and the edge as one curve', () => {
    const f = frame(0.6, 2, 1, WIDE)
    const { clip, edge } = frontPaths(f)
    expect(clip).toMatch(/^path\('M0 0H[\d.]+V[\d.]+C/)
    // The edge runs left to right; the clip closes the same curve right to left.
    const points = (d: string) => (d.match(/[\d.]+/g) ?? []).map(Number)
    const [x0, y0, ...curve] = points(edge)
    expect([x0, y0]).toEqual([0, Number(f.F.toFixed(2))])
    const back = points(clip).slice(4)
    expect(back).toEqual([curve[2], curve[3], curve[0], curve[1], 0, y0])
  })
})

describe('the geometry', () => {
  it('is monotonic, and flat where it leaves and where it lands', () => {
    for (const g of [WIDE, RAIL]) {
      let before = frame(0, 0, 0, g)
      for (let i = 1; i <= 1000; i += 1) {
        const now = frame(i / 1000, 0, 0, g)
        expect(now.W).toBeLessThanOrEqual(before.W)
        expect(now.H).toBeGreaterThanOrEqual(before.H)
        before = now
      }
      // A millionth of p at either end moves the device, the island and the address by under a
      // thousandth of what the same share moves them mid-beat, so nothing lands at speed and is
      // stopped by the hand-back.
      const step = 1e-6
      type Key = 'W' | 'H' | 'tabW' | 'labelOpacity'
      const slope = (p: number, key: Key) =>
        Math.abs(frame(p + step, 0, 0, g)[key] - frame(p, 0, 0, g)[key]) / step
      const mids = [
        ['W', 0.17],
        ['H', 0.65],
        ['tabW', 0.1],
        ['labelOpacity', 0.05],
      ] as const
      for (const [key, mid] of mids) {
        expect(slope(0, key)).toBeLessThan(slope(mid, key) / 1000)
        expect(slope(1 - step, key)).toBeLessThan(slope(mid, key) / 1000)
      }
    }
  })
})

describe('the chain', () => {
  it('keeps the prototype clock at pace 1', () => {
    const { states } = fly(0, 1600)
    expect(crossing(states, 0.5)).toBeGreaterThan(380)
    expect(crossing(states, 0.5)).toBeLessThan(420)
    const at400 = states.find((s) => s.tMs >= 400)?.p ?? 0
    expect(at400).toBeGreaterThan(0.45)
    expect(at400).toBeLessThan(0.55)
    expect(states.find((s) => s.tMs >= 900)?.p ?? 0).toBeGreaterThan(0.98)
    expect(stillAt(states)).toBeLessThan(1100)
    expect(Math.max(...states.map((s) => s.p))).toBeLessThan(1.003)
  })

  it('stretches every time by the pace, the default among them', () => {
    const one = fly(0, 2000).states
    for (const pace of [N.pace, 1.3]) {
      const slow = fly(0, 2400, pace).states
      for (const share of [0.3, 0.5, 0.98]) {
        const ratio = crossing(slow, share) / crossing(one, share)
        expect(ratio).toBeGreaterThan(pace * 0.95)
        expect(ratio).toBeLessThan(pace * 1.05)
      }
      const ratio = stillAt(slow) / stillAt(one)
      expect(ratio).toBeGreaterThan(pace * 0.95)
      expect(ratio).toBeLessThan(pace * 1.05)
    }
  })

  it('draws the same flight whatever the frame rate', () => {
    const k = springsFor(N.pace)
    const open = apply(apply(startState(0, 0, PILL), { kind: 'change', goal: 1 }), {
      kind: 'open',
      goal: 1,
    })
    let at60 = open
    let at120 = open
    for (let t = 1000 / 60; t <= 1000; t += 1000 / 60) at60 = advance(at60, t, PILL, k, N.pace)
    for (let t = 1000 / 120; t <= 1000; t += 1000 / 120) at120 = advance(at120, t, PILL, k, N.pace)
    at60 = advance(at60, 1000, PILL, k, N.pace)
    at120 = advance(at120, 1000, PILL, k, N.pace)
    expect(at120).toEqual(at60)
  })

  it('draws each frame at its own time, so no display rate stutters the front', () => {
    const k = springsFor(N.pace)
    // The pour front's worst change of step from one frame to the next, drawn at `hz` with each
    // frame's time jittered by up to `jitterMs`, over every phase of the sub-step clock.
    const worst = (hz: number, jitterMs: number): number => {
      let top = 0
      for (let phase = 0; phase < STEP_MS; phase += STEP_MS / 8) {
        let s = apply(apply(startState(phase, 0, PILL), { kind: 'change', goal: 1 }), {
          kind: 'open',
          goal: 1,
        })
        let seed = 7
        const fronts: number[] = []
        for (let i = 1; i < hz * 1.4; i += 1) {
          seed = (seed * 16807) % 2147483647
          const now = (i * 1000) / hz + (2 * (seed / 2147483647) - 1) * jitterMs
          s = advance(s, now, PILL, k, N.pace)
          const at = sampleAt(s, now, PILL, k, N.pace)
          fronts.push(frame(at.p, at.v, at.lean, WIDE).F)
        }
        for (let i = 2; i < fronts.length; i += 1) {
          const [a = 0, b = 0, c = 0] = fronts.slice(i - 2, i + 1)
          top = Math.max(top, Math.abs(c - 2 * b + a))
        }
      }
      return top
    }
    // 90, 144 and 165 Hz are not a whole number of sub-steps a frame, and a jittered 60 Hz is
    // not either: drawn from the whole sub-steps alone, the front stepped 1 and 2 sub-steps in
    // turn all through the pour (7.2 and 14.6 px/frame² measured). At 60 Hz the pour's own
    // gathering speed is about 5.5 px/frame², which no timing takes away.
    expect(worst(144, 0)).toBeLessThanOrEqual(1.5)
    expect(worst(90, 0)).toBeLessThanOrEqual(3)
    expect(worst(60, 0.2)).toBeLessThanOrEqual(6)
  })

  it('never keeps a sample', () => {
    const k = springsFor(N.pace)
    const s = advance(
      apply(apply(startState(0, 0, PILL), { kind: 'change', goal: 1 }), { kind: 'open', goal: 1 }),
      400,
      PILL,
      k,
      N.pace,
    )
    // At a whole sub-step the sample is the stored flight; between two it lies between them.
    expect(sampleAt(s, s.tMs, PILL, k, N.pace)).toBe(s)
    const next = advance(s, s.tMs + STEP_MS, PILL, k, N.pace)
    const half = sampleAt(s, s.tMs + STEP_MS / 2, PILL, k, N.pace)
    expect(half.tMs).toBe(s.tMs + STEP_MS / 2)
    expect(half.p).toBeGreaterThan(s.p)
    expect(half.p).toBeLessThan(next.p)
    expect(half.beatMs).toBe(s.beatMs)
  })

  it('turns on a change of mind with the device’s own momentum, then retraces', () => {
    const { states, turned } = fly(0, 2000, 1, 330)
    if (turned === undefined) throw new Error('no turn')
    // The re-grip moves the motor only: the device keeps its place and its speed.
    const regripped = apply(turned, { kind: 'change', goal: 0 })
    expect([regripped.p, regripped.v]).toEqual([turned.p, turned.v])
    expect([regripped.m, regripped.mv]).toEqual([turned.p, 0])
    const after = states.filter((s) => s.tMs > turned.tMs)
    const first = after[0]
    if (first === undefined) throw new Error('nothing after the turn')
    const peak = after.reduce((top, s) => (s.p > top.p ? s : top), first)
    expect(peak.tMs - turned.tMs).toBeLessThanOrEqual(150)
    expect(peak.p - turned.p).toBeLessThanOrEqual(0.15)
    // Down from the peak without a wobble until it is within rest of desktop, and no further
    // below it than a hair.
    const falling = after.filter((s) => s.tMs >= peak.tMs)
    const home = falling.findIndex((s) => s.p < N.rest.share)
    for (let i = 1; i <= home; i += 1) {
      expect(falling[i]?.p ?? 0).toBeLessThanOrEqual(falling[i - 1]?.p ?? 0)
    }
    expect(Math.min(...after.map((s) => s.p))).toBeGreaterThan(-0.003)
    expect(stillAt(after)).toBeLessThan(1600)
    expect(after.at(-1)?.goal).toBe(0)
  })
})

describe('the row’s height', () => {
  // The first row at 1440, each tile's own heights read top-aligned: Go Wild, VetPres and the
  // third, whose desktop state is the tallest.
  const ROW = (
    [
      [546.39, 790.64],
      [525.39, 769.64],
      [562.39, 806.64],
    ] as const
  ).map(([d, p]): Geometry => ({ ...WIDE, d: { ...WIDE.d, T: d }, p: { ...WIDE.p, T: p } }))
  type Click = Readonly<{ i: number; at: number }>
  type Held = { s: MorphState; ends: Ends }
  // Every frame's height, and the row as it stood at each click.
  type Drawn = Readonly<{ rows: number[]; stood: Moving[] }>

  // The row drawn at 60 Hz by the rules the controller follows: a click at `at` ms turns tile `i`
  // (its capture ready at once), a flight holds its own height until its device is still, a new
  // flight's leaving end keeps the row as it stood (leaving), and whenever a tile starts or stops
  // holding its height, or a flight changes its mind, every flight heads for the room as it then
  // stands and the row carries its place and speed on from where it stood before its floor
  // (rowRaw). Unlike the controller, it lets a flight go the moment its device is still, with no
  // landing beat, so a click on a tile that has landed starts a fresh flight from its view where
  // the controller re-grips the flight still in its beat. The row as it stood then is its tiles
  // at rest with the clicked one on the view it showed, read before that view turns: the height
  // the controller takes from the landed flight, since its radio has flipped by the time it reads
  // (reading the tile there leapt the row 228 px in one frame). Every frame is checked never to
  // be below the room or a flying tile's own height.
  function rowOf(start: readonly View[], clicks: readonly Click[]): Drawn {
    const k = springsFor(N.pace)
    const views = [...start]
    const held = new Map<number, Held>()
    let carry: Carry | null = null
    let room = 0
    const rest = (i: number) => (views[i] === 1 ? ROW[i]?.p.T : ROW[i]?.d.T) ?? 0
    // The room the row's resting tiles keep, without tile `but`.
    const roomOf = (but?: number) =>
      Math.max(0, ...[0, 1, 2].filter((i) => i !== but && !held.has(i)).map(rest))
    const flying = (t: number): Flying[] =>
      [...held.entries()]
        .sort(([a], [b]) => a - b)
        .map(([i, { s, ends }]) => {
          const at = sampleAt(s, t, PILL, k, N.pace)
          return { g: ROW[i] ?? WIDE, ends, p: at.p, speed: at.v }
        })
    const rowNow = (t: number) => rowAt(room, flying(t), carryAt(carry, t, N.pace))
    const rawNow = (t: number) => rowRaw(room, flying(t), carryAt(carry, t, N.pace))
    const shift = (t: number, raw: Moving) => {
      room = roomOf()
      for (const [i, h] of held) h.ends = headFor(h.ends, views[i] === 1 ? 1 : 0, room)
      const { T, v } = rowCurve(room, flying(t))
      carry = { T: raw.T - T, v: raw.v - v, tMs: t }
    }
    const pending = [...clicks]
    const rows: number[] = []
    const stood: Moving[] = []
    for (let frame = 0; frame <= 180; frame += 1) {
      const now = (frame * 1000) / 60
      for (let c = pending[0]; c !== undefined && c.at <= now; c = pending[0]) {
        pending.shift()
        const flight = held.get(c.i)
        const from: View = views[c.i] === 1 ? 1 : 0
        const goal: View = from === 1 ? 0 : 1
        // The row as it stands, drawn and before its floor: its flights' height, or its tiles at
        // rest, the clicked one on the view it showed.
        const flown = held.size > 0
        const before = flown ? rowNow(c.at) : { T: roomOf(), v: 0 }
        const raw = flown ? rawNow(c.at) : before
        stood.push(before)
        views[c.i] = goal
        const change = { kind: 'change', goal } as const
        if (flight === undefined) {
          const s = apply(apply(startState(c.at, from, PILL), change), { kind: 'open', goal })
          // The end it leaves keeps the row as it stands; the other, the room without it.
          held.set(c.i, { s, ends: leaving(from, roomOf(c.i), before) })
        } else flight.s = apply(advance(flight.s, c.at, PILL, k, N.pace), change)
        shift(c.at, raw)
      }
      for (const [i, h] of [...held.entries()].sort(([a], [b]) => a - b)) {
        h.s = advance(h.s, now, PILL, k, N.pace)
        if (!deviceStill(h.s)) continue
        const raw = rawNow(now)
        held.delete(i)
        if (held.size > 0) shift(now, raw)
      }
      const T = held.size > 0 ? rowNow(now).T : roomOf()
      const own = flying(now).map(({ g, p }) => g.d.T + (g.p.T - g.d.T) * ease(p, N.beats.height))
      expect(T).toBeGreaterThanOrEqual(Math.max(roomOf(), ...own) - 1e-9)
      rows.push(T)
    }
    return { rows, stood }
  }
  const bend = (rows: readonly number[]): number => {
    let top = 0
    for (let i = 2; i < rows.length; i += 1) {
      const [a = 0, b = 0, c = 0] = rows.slice(i - 2, i + 1)
      top = Math.max(top, Math.abs(c - 2 * b + a))
    }
    return top
  }

  it('is the room or the tallest curve, and never below a tile’s own height', () => {
    expect(rowAt(562.39, [])).toEqual({ T: 562.39, v: 0 })
    const [goWild = WIDE] = ROW
    const resting = { g: goWild, ends: { d: 562.39, p: 562.39 }, p: 0, speed: 0 }
    // At rest on the desktop, a shorter tile keeps the room; carried below it, the row stops there.
    expect(rowAt(562.39, [resting]).T).toBe(562.39)
    expect(rowAt(525.39, [{ ...resting, ends: { d: 525.39, p: 525.39 } }]).T).toBe(546.39)
    expect(rowAt(562.39, [resting], { T: -40, v: 0 }).T).toBeGreaterThanOrEqual(562.39)
  })

  it('carries the row’s place and speed through a change, then lets go', () => {
    expect(carryAt(null, 0, N.pace)).toEqual({ T: 0, v: 0 })
    const c = { T: 18, v: -300, tMs: 1000 }
    expect(carryAt(c, 1000, N.pace)).toEqual({ T: 18, v: -300 })
    const span = N.carryMs * N.pace
    expect(carryAt(c, 1000 + span, N.pace)).toEqual({ T: 0, v: 0 })
    expect(Math.abs(carryAt(c, 1000 + span - 0.01, N.pace).T)).toBeLessThan(1e-3)
  })

  it('keeps the row as it stands at the end a flight leaves, less the turn its speed needs', () => {
    // Still, the end it leaves keeps the row; moving, less the width of the corner that turns the
    // row's speed onto it at rowTurnPxS2; never below the room. The end it heads for takes the room.
    expect(leaving(0, 562.39, { T: 790.64, v: 0 })).toEqual({ d: 790.64, p: 562.39 })
    expect(leaving(1, 562.39, { T: 790.64, v: 0 })).toEqual({ d: 562.39, p: 790.64 })
    const moving = leaving(0, 562.39, { T: 740, v: -600 })
    expect(moving.d).toBeCloseTo(740 - 600 ** 2 / N.rowTurnPxS2, 9)
    expect(leaving(0, 562.39, { T: 600, v: -900 }).d).toBe(562.39)
  })

  it('carries on from the row before its floor', () => {
    const [goWild = WIDE] = ROW
    const flying = [{ g: goWild, ends: { d: 562.39, p: 562.39 }, p: 0, speed: 0 }]
    // Carried under the floor, the row as drawn stops there, and the row a change carries on from
    // keeps the carry whole, so the floor rounds it once.
    const carried = { T: -40, v: -200 }
    expect(rowRaw(562.39, flying, carried)).toEqual({ T: 522.39, v: -200 })
    expect(rowAt(562.39, flying, carried).T).toBeGreaterThanOrEqual(562.39)
  })

  it('moves a lone flight as its curve does', () => {
    for (const i of [0, 1, 2]) {
      const up = rowOf([0, 0, 0], [{ i, at: 0 }]).rows
      const back = rowOf([1, 1, 1].map((v, j) => (j === i ? v : 0)) as View[], [{ i, at: 0 }]).rows
      expect(bend(up)).toBeLessThanOrEqual(2.6)
      expect(bend(back)).toBeLessThanOrEqual(1.9)
      expect([up.at(-1), back.at(-1)]).toEqual([ROW[i]?.p.T, 562.39])
    }
  })

  it('turns no corner in a frame when two row-mates are switched the same way', () => {
    // Go Wild and VetPres both phones, switched back to desktop 250 ms apart, was the review's
    // case: re-based curves under a plain maximum jolted the row 19 px in three frames and stopped
    // it dead on VetPres's phone height (7.6 to 8.8 px/frame² on the real page).
    for (const gap of [0, 100, 250, 450]) {
      for (const [start, first] of [
        [[1, 1, 0], 0],
        [[1, 1, 0], 1],
        [[0, 0, 0], 0],
        [[0, 0, 0], 1],
      ] as const) {
        const { rows } = rowOf(start, [
          { i: first, at: 0 },
          { i: 1 - first, at: gap },
        ])
        expect(bend(rows)).toBeLessThanOrEqual(3)
        // It leaves the row as it stood and rests on the row both landings make.
        expect(rows[0]).toBe(start[0] === 1 ? 790.64 : 562.39)
        expect(rows.at(-1)).toBe(start[0] === 1 ? 562.39 : 790.64)
      }
    }
  })

  it('rounds the turn when two row-mates cross opposite ways, and never jumps', () => {
    for (const gap of [0, 100, 200]) {
      for (const start of [
        [1, 0, 0],
        [0, 1, 0],
      ] as const) {
        const clicks = [
          { i: 0, at: 0 },
          { i: 1, at: gap },
        ]
        expect(bend(rowOf(start, clicks).rows)).toBeLessThanOrEqual(4)
      }
    }
    // Seeded sequences of two to four clicks on the row: every frame above every tile, and none
    // turning the row as the re-based curves did (150 px/frame² at worst over 400 sequences).
    let seed = 7
    const next = () => {
      seed = (seed * 16807) % 2147483647
      return seed / 2147483647
    }
    for (let run = 0; run < 60; run += 1) {
      const start = [0, 1, 2].map(() => (next() < 0.5 ? 0 : 1)) as View[]
      const clicks: Click[] = []
      for (let c = 0, at = 0, n = 2 + Math.floor(next() * 3); c < n; c += 1) {
        clicks.push({ i: Math.floor(next() * 3), at })
        at += Math.floor(next() * 500)
      }
      expect(bend(rowOf(start, clicks).rows)).toBeLessThanOrEqual(7)
    }
  })

  it('takes no detour when two row-mates cross opposite ways', () => {
    // One tile back to desktop and a row-mate to the phone up to 450 ms later: after the second
    // change the row goes below where it stood only as far as its speed then takes to turn at
    // rowTurnPxS2, or to the row both landings make. With the new flight's leaving end on the room
    // alone, it fell toward the desktop height first, 129 to 220 px under that line from 0 to
    // 300 ms apart (790 to 573 to 770 px at 150 ms). While the row has barely moved, 150 ms apart
    // at most, it goes no further below where it started and where it lands than it had come.
    for (let gap = 0; gap <= 450; gap += 50) {
      for (const [start, a, b] of [
        [[1, 0, 0], 0, 1],
        [[1, 0, 0], 0, 2],
        [[0, 1, 0], 1, 0],
        [[0, 0, 1], 2, 1],
      ] as const) {
        const { rows, stood } = rowOf(start, [
          { i: a, at: 0 },
          { i: b, at: gap },
        ])
        const [first = 0] = rows
        const end = rows.at(-1) ?? 0
        const { T, v } = stood[1] ?? { T: 0, v: 0 }
        const after = Math.min(...rows.slice(Math.ceil((gap * 60) / 1000)))
        expect(after).toBeGreaterThanOrEqual(Math.min(T - (v * v) / N.rowTurnPxS2, end) - 1)
        if (gap <= 150) {
          expect(Math.min(...rows)).toBeGreaterThanOrEqual(
            Math.min(first, end) - Math.abs(T - first) - 1,
          )
        }
      }
    }
  })
})

describe('the landing beat', () => {
  const beatsOf = (states: MorphState[]) =>
    new Set(states.map((s) => s.beatMs).filter((ms) => ms !== null)).size

  it('fires once for a flight that lands, and not before its mark', () => {
    const { states } = fly(0, 2000)
    expect(beatsOf(states)).toBe(1)
    const fired = states.find((s) => s.beatMs !== null)
    expect(fired?.p ?? 0).toBeGreaterThanOrEqual(N.landAt)
    // Back to desktop it fires as the device passes the same share of its way home.
    const back = fly(1, 2000).states
    expect(beatsOf(back)).toBe(1)
    expect(back.find((s) => s.beatMs !== null)?.p ?? 1).toBeLessThanOrEqual(1 - N.landAt)
  })

  it('does not fire for a flight turned back before its mark', () => {
    // Turned at 150 ms, the device never reaches either mark.
    expect(beatsOf(fly(0, 2000, 1, 150).states)).toBe(0)
    // Turned at 330 ms, nothing fires on the way out; the way home lands and fires once.
    const { states, turned } = fly(0, 2000, 1, 330)
    expect(turned?.beatMs).toBeNull()
    expect(beatsOf(states)).toBe(1)
  })

  it('blooms from nothing to full and back, and draws the light inside its span', () => {
    const { states } = fly(0, 2400, N.pace)
    const landed = states.at(-1)
    const beatMs = landed?.beatMs
    if (landed === undefined || beatMs === undefined || beatMs === null) throw new Error('no beat')
    const at = (ms: number): MorphState => ({ ...landed, tMs: ms })
    const rise = N.bloom.riseMs * N.pace
    const span = (N.bloom.riseMs + N.bloom.fallMs) * N.pace
    expect(bloomAt({ ...landed, beatMs: null }, N.pace)).toBe(0)
    expect(bloomAt(at(beatMs - 1), N.pace)).toBe(0)
    expect(bloomAt(at(beatMs + rise), N.pace)).toBeCloseTo(1, 9)
    expect(bloomAt(at(beatMs + span), N.pace)).toBe(0)
    expect(glintAt(at(beatMs - 1), N.pace)).toBeNull()
    expect(glintAt(at(beatMs + N.glintMs * N.pace + 1), N.pace)).toBeNull()
    expect(glintAt(at(beatMs + (N.glintMs * N.pace) / 2), N.pace)).toBeCloseTo(0.5, 9)
    expect(beatLive(at(beatMs + span - 1), N.pace)).toBe(true)
    expect(beatLive(at(beatMs + span), N.pace)).toBe(false)
  })
})

describe('the pill', () => {
  const insetOf = (clip: string) => Number(/^inset\(([\d.]+)px/.exec(clip)?.[1])

  it('lands exactly on the pressed label, unthinned', () => {
    const { states } = fly(0, 2000)
    const landed = states.at(-1)
    if (landed === undefined) throw new Error('no flight')
    expect(landed.pillOn).toBe(false)
    expect([landed.left.x, landed.right.x]).toEqual([...PILL.phone])
    expect(insetOf(pillClip(landed, PILL))).toBe(PILL.pad)
  })

  it('leads with the edge on the pressed side and thins no more than thinPx', () => {
    const { states } = fly(0, 2000)
    const early = states.find((s) => s.tMs >= 60)
    if (early === undefined) throw new Error('no flight')
    const leftMoved = PILL.desktop[0] - early.left.x
    const rightMoved = PILL.desktop[1] - early.right.x
    expect(leftMoved).toBeGreaterThan(rightMoved)
    let thinnest = 0
    for (const s of states) thinnest = Math.max(thinnest, insetOf(pillClip(s, PILL)) - PILL.pad)
    expect(thinnest).toBeGreaterThan(0)
    expect(thinnest).toBeLessThanOrEqual(N.pill.thinPx)
  })
})

describe('the meniscus', () => {
  it('is flat as it leaves and as it lands, sags with the speed, and within sagPx', () => {
    for (const speed of [-2.6, -1, 1, 2.6]) {
      for (const lean of [-1, 0, 1]) {
        for (const p of [0, 0.2, 0.3, 0.95, 1]) {
          const f = frame(p, speed, lean, WIDE)
          expect(Math.abs(sagOf(f.c1, f.c2))).toBeLessThan(1e-9)
        }
        for (let i = 31; i < 95; i += 1) {
          const f = frame(i / 100, speed, lean, WIDE)
          const sag = sagOf(f.c1, f.c2)
          expect(Math.sign(sag)).toBe(Math.sign(speed))
          expect(Math.abs(sag)).toBeLessThanOrEqual(N.meniscus.sagPx)
        }
      }
    }
  })
})
