import { describe, expect, it } from 'vitest'
import { CONFIG } from '@/lib/config'
import { CHAIN_AT_REST } from '@/lib/motion/chain'
import { LIP_ROOM, type LipGeometry, lipPath, restLipPath } from '@/lib/motion/lip-curve'

// The footer sheet's lip as drawn (lib/motion/lip-curve.ts, ADR 0034 amendment of 25 September
// 2026): at rest it is the sheet's CSS corners, a quarter circle each, in the sheet's own
// pixels; a sag and a swell move the flat top's apex and nothing else, the corners stay pinned
// to the sides and their landings turn with the top so the join never kinks; the lag moves the
// handles between the corners; and a trough never reaches the sheet's own paint.

const { sheet } = CONFIG.motion.choreo
const WIDE: LipGeometry = { width: 1440, radius: 80 }
const NARROW: LipGeometry = { width: 768, radius: 46 }
const KAPPA = 0.5522847498

// The numbers of a drawn path, in order: M0 foot, V r, the left corner's C (0 wall, landing x
// y, r 0), the top's C (handle x lift, handle x lift, W-r 0), the right corner's C (landing x
// y, W wall, W r), V foot.
function numbers(path: string): number[] {
  const found = path.match(/-?[\d.]+/g)
  if (found?.length !== 22) throw new Error(`not a lip path: ${path}`)
  return found.map(Number)
}

type Lip = Readonly<{
  foot: number
  wall: number
  landing: { x: number; y: number }
  inset: number
  lift: number
  ends: [number, number, number, number]
}>

function lip(path: string, { radius }: LipGeometry): Lip {
  const n = numbers(path)
  return {
    foot: n[1] ?? NaN,
    wall: n[4] ?? NaN,
    landing: { x: n[5] ?? NaN, y: n[6] ?? NaN },
    inset: (n[9] ?? NaN) - radius,
    lift: n[10] ?? NaN,
    ends: [n[2] ?? NaN, n[7] ?? NaN, n[13] ?? NaN, n[20] ?? NaN],
  }
}

// The apex's displacement from the flat line, down positive: 0.75 of the handles' lift.
const apexOf = (path: string, geometry: LipGeometry): number => 0.75 * lip(path, geometry).lift

describe('at rest', () => {
  it('is the sheet with its CSS corners, in its own pixels', () => {
    for (const geometry of [WIDE, NARROW]) {
      const { width, radius } = geometry
      const path = restLipPath(geometry)
      expect(path).toBe(lipPath(CHAIN_AT_REST, geometry))
      expect(path).toMatch(/^M0 /)
      expect(path).toMatch(/Z$/)
      const drawn = lip(path, geometry)
      expect(drawn.ends).toEqual([radius, radius, width - radius, radius])
      expect(drawn.foot).toBeCloseTo(radius * LIP_ROOM + 2, 2)
      expect(drawn.wall).toBeCloseTo(radius - KAPPA * radius, 2)
      expect(drawn.landing.x).toBeCloseTo(radius - KAPPA * radius, 2)
      expect(drawn.landing.y).toBe(0)
      expect(drawn.lift).toBe(0)
      expect(drawn.inset).toBeCloseTo((width / 2 - radius) * sheet.dome, 2)
    }
  })
})

describe('moving', () => {
  it('sags while the belly is down and swells while it is up, the corners pinned', () => {
    const sag = lipPath({ ...CHAIN_AT_REST, belly: 0.5 }, WIDE)
    const swell = lipPath({ ...CHAIN_AT_REST, belly: -0.5 }, WIDE)
    expect(apexOf(sag, WIDE)).toBeCloseTo(0.5 * WIDE.radius, 1)
    expect(apexOf(swell, WIDE)).toBeCloseTo(-0.5 * WIDE.radius, 1)
    const rest = lip(restLipPath(WIDE), WIDE)
    for (const path of [sag, swell]) {
      const drawn = lip(path, WIDE)
      expect(drawn.ends).toEqual(rest.ends)
      expect(drawn.foot).toBe(rest.foot)
      expect(drawn.wall).toBe(rest.wall)
    }
  })

  it('turns each corner landing with the top, so the join never kinks', () => {
    for (const belly of [-0.8, -0.2, 0.2, 0.8]) {
      const drawn = lip(lipPath({ ...CHAIN_AT_REST, belly }, WIDE), WIDE)
      // The landing's tangent into the corner's end runs from the landing handle to (r, 0);
      // the top's tangent out of it runs to its first handle. Parallel: their cross is nil.
      const into = { x: WIDE.radius - drawn.landing.x, y: -drawn.landing.y }
      const out = { x: drawn.inset, y: drawn.lift }
      const sine =
        Math.abs(into.x * out.y - into.y * out.x) /
        (Math.hypot(into.x, into.y) * Math.hypot(out.x, out.y))
      expect(sine).toBeLessThan(0.001)
      // The rim tips the other way as the middle moves.
      expect(Math.sign(drawn.landing.y)).toBe(-Math.sign(belly))
    }
  })

  it('moves the handles with the lag, between the corners', () => {
    const rest = lip(restLipPath(WIDE), WIDE).inset
    const peaked = lip(lipPath({ ...CHAIN_AT_REST, belly: 0.3 }, WIDE), WIDE).inset
    const flat = lip(lipPath({ ...CHAIN_AT_REST, shoulders: 0.3 }, WIDE), WIDE).inset
    expect(peaked).toBeGreaterThan(rest)
    expect(flat).toBeLessThan(rest)
    const half = WIDE.width / 2 - WIDE.radius
    for (const lag of [-5, 5]) {
      const { inset } = lip(lipPath({ ...CHAIN_AT_REST, belly: lag }, WIDE), WIDE)
      expect(inset).toBeGreaterThan(0.1 * half)
      expect(inset).toBeLessThan(0.99 * half)
    }
  })

  it('never lets a trough reach the sheet, nor a swell the closing', () => {
    for (const geometry of [WIDE, NARROW]) {
      const trough = apexOf(lipPath({ ...CHAIN_AT_REST, belly: 10 }, geometry), geometry)
      expect(trough).toBeGreaterThan(sheet.stretchKnee * geometry.radius)
      expect(trough).toBeLessThan(sheet.stretchCap * geometry.radius + 0.01)
      expect(trough).toBeLessThan(LIP_ROOM * geometry.radius)
      const swell = -apexOf(lipPath({ ...CHAIN_AT_REST, belly: -10 }, geometry), geometry)
      // --spacing-band is never under 1.5 radii from md, and the cap is under that.
      expect(swell).toBeLessThan(1.5 * geometry.radius)
      expect(sheet.stretchCap).toBeLessThan(LIP_ROOM)
      expect(sheet.stretchCap).toBeLessThan(1.5)
    }
  })
})
