import { describe, expect, it } from 'vitest'
import { CONFIG } from '@/lib/config'
import { CHAIN_AT_REST } from '@/lib/motion/chain'
import { poolPath } from '@/lib/motion/pool-curve'

// The home page's pooled curve as drawn (lib/motion/pool-curve.ts, ADR 0034 amendment of 25
// September 2026): at rest it is the server's arc, the apex is the belly's alone and the shape
// the lag's alone, and the apex never draws past the cap whatever the springs do. The chain
// itself is tested in lib/motion/chain.test.ts.

const { pool } = CONFIG.motion.choreo

// The handles of a drawn path: their inset from the ends and their depth, in the box's units.
function handles(path: string): { inset: number; depth: number } {
  const match = /C([\d.]+) ([\d.]+) ([\d.]+) \2 0 0Z$/.exec(path)
  if (match === null) throw new Error(`not a pool path: ${path}`)
  return { inset: Number(match[3]), depth: Number(match[2]) }
}

// The apex's depth as a share of the resting 140: a symmetric cubic is 0.75 of its handles deep.
const apexStretch = (path: string): number => (0.75 * handles(path).depth) / 140 - 1

describe('the drawing', () => {
  it('at rest is the arc in app/page.tsx, within a hair', () => {
    const path = poolPath(CHAIN_AT_REST)
    expect(path).toMatch(/^M0 -2H1000V0C/)
    const { inset, depth } = handles(path)
    expect(inset).toBeCloseTo(307.19, 1)
    expect(depth).toBeCloseTo(186.66, 1)
    expect(Math.abs(apexStretch(path))).toBeLessThan(0.001)
  })

  it('draws the apex from the belly alone and the shape from its lag, inside the room', () => {
    // A belly below the shoulders is a drop: handles toward the centre. Above them, a dish.
    const drop = handles(poolPath({ ...CHAIN_AT_REST, belly: 0.2, shoulders: 0 }))
    const dish = handles(poolPath({ ...CHAIN_AT_REST, belly: 0, shoulders: 0.2 }))
    const rest = handles(poolPath(CHAIN_AT_REST))
    expect(drop.inset).toBeGreaterThan(rest.inset)
    expect(dish.inset).toBeLessThan(rest.inset)
    // The same lag draws the same shape whatever the depth, and the depth ignores the lag.
    expect(handles(poolPath({ ...CHAIN_AT_REST, belly: 0.4, shoulders: 0.2 })).inset).toBeCloseTo(
      drop.inset,
      5,
    )
    expect(handles(poolPath({ ...CHAIN_AT_REST, belly: 0.2, shoulders: -1 })).depth).toBe(
      drop.depth,
    )
    // The handles ease toward their room, 0.4 of the inset either way, and stay inside it (to
    // the path's two decimals) whatever the lag; a lag of one resting depth gets most of it.
    for (const lag of [-3, -1, -0.5, 0.5, 1, 3]) {
      const { inset } = handles(poolPath({ ...CHAIN_AT_REST, belly: lag }))
      expect(inset).toBeGreaterThanOrEqual(rest.inset * 0.6 - 0.01)
      expect(inset).toBeLessThanOrEqual(rest.inset * 1.4 + 0.01)
    }
    const one = handles(poolPath({ ...CHAIN_AT_REST, belly: 1 })).inset / rest.inset - 1
    expect(one).toBeGreaterThan(0.35)
    expect(one).toBeLessThan(0.4)
  })

  it('never draws the apex past the cap, and draws it as the belly has it up to the knee', () => {
    expect(apexStretch(poolPath({ ...CHAIN_AT_REST, belly: 0.2 }))).toBeCloseTo(0.2, 3)
    for (const belly of [0.5, 1, 3, 10]) {
      const stretch = apexStretch(poolPath({ ...CHAIN_AT_REST, belly }))
      expect(stretch).toBeGreaterThan(pool.stretchKnee)
      // Under the cap, to the path's two decimals (a fifty-thousandth of the depth).
      expect(stretch).toBeLessThan(pool.stretchCap + 0.0001)
      // Mirrored, to the path's two decimals.
      expect(apexStretch(poolPath({ ...CHAIN_AT_REST, belly: -belly }))).toBeCloseTo(-stretch, 4)
    }
  })
})
