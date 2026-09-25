import { describe, expect, it } from 'vitest'
import { CONFIG } from '@/lib/config'
import { CHAIN_AT_REST, type ChainState, makeChain } from '@/lib/motion/chain'

// The liquid chain (lib/motion/chain.ts, ADR 0034 amendment of 25 September 2026), with the
// pool's numbers: under a steady pull it settles to the pull, the belly follows the shoulders
// with a lag and an overshoot, it swings back past rest and settles, the drawn depth never
// passes the cap and the drawn lean never passes its room, and the frame rate does not colour
// the swing.

const { pool } = CONFIG.motion.choreo
const ROOM = 0.4
const chain = makeChain(pool, ROOM)
const FRAME_S = 1 / 60

// Plays the chain under a pull, frame by frame, and returns every state it passed through.
function play(state: ChainState, pull: number, seconds: number, frame = FRAME_S): ChainState[] {
  const states: ChainState[] = []
  let current = state
  for (let t = 0; t < seconds; t += frame) {
    current = chain.step(current, pull, frame)
    states.push(current)
  }
  return states
}

const last = (states: ChainState[]): ChainState => states.at(-1) ?? CHAIN_AT_REST

describe('the pull', () => {
  it('saturates at stretchMax and is three quarters of it at full speed', () => {
    expect(chain.pullAt(1e6)).toBeLessThanOrEqual(pool.stretchMax)
    expect(chain.pullAt(1e6)).toBeCloseTo(pool.stretchMax, 6)
    expect(chain.pullAt(-1e6)).toBeCloseTo(-pool.stretchMax, 6)
    expect(chain.pullAt(pool.fullSpeedPxS) / pool.stretchMax).toBeCloseTo(0.76, 2)
    expect(chain.pullAt(0)).toBe(0)
  })
})

describe('the springs', () => {
  it('settle under a steady pull to the pull', () => {
    // The belly's ring dies at exp(-0.63 t): fourteen seconds leaves it under a ten-thousandth.
    const settled = last(play(CHAIN_AT_REST, 0.2, 14))
    expect(settled.shoulders).toBeCloseTo(0.2, 3)
    expect(settled.belly).toBeCloseTo(0.2, 3)
    expect(chain.lean(settled)).toBeCloseTo(0, 3)
  })

  it('have the belly lag the shoulders, then overshoot them', () => {
    const states = play(CHAIN_AT_REST, 0.3, 2)
    const lags = states.map((state) => state.belly - state.shoulders)
    // Early on the shoulders lead; later the belly passes them.
    const firstLead = lags.findIndex((lag) => lag < -0.02)
    const firstOvershoot = lags.findIndex((lag) => lag > 0.02)
    expect(firstLead).toBeGreaterThanOrEqual(0)
    expect(firstOvershoot).toBeGreaterThan(firstLead)
    // The shoulders take the pull well before the belly does.
    const shouldersAt = states.findIndex((state) => state.shoulders > 0.15)
    const bellyAt = states.findIndex((state) => state.belly > 0.15)
    expect(shouldersAt).toBeGreaterThanOrEqual(0)
    expect(bellyAt).toBeGreaterThan(shouldersAt)
  })

  it('swing back past rest once the pull lets go, ring, and come to rest', () => {
    const pulled = last(play(CHAIN_AT_REST, 0.3, 0.4))
    const ring = play(pulled, 0, 12)
    const bellies = ring.map((state) => state.belly)
    // A swing back of a good share of the stretch: a spring, not an ease.
    expect(Math.min(...bellies)).toBeLessThan(-0.08)
    // And more than one swing: it crosses rest at least four times.
    let crossings = 0
    for (let i = 1; i < bellies.length; i += 1) {
      const before = bellies[i - 1] ?? 0
      const after = bellies[i] ?? 0
      if (Math.sign(before) !== Math.sign(after)) crossings += 1
    }
    expect(crossings).toBeGreaterThanOrEqual(4)
    expect(chain.isAtRest(last(ring))).toBe(true)
    expect(chain.isAtRest(pulled)).toBe(false)
  })

  it('draw the same swing at 60 Hz, at 120 Hz and through a 64 ms frame', () => {
    const at60 = last(play(CHAIN_AT_REST, 0.3, 1, 1 / 60))
    const at120 = last(play(CHAIN_AT_REST, 0.3, 1, 1 / 120))
    const stalled = last(play(CHAIN_AT_REST, 0.3, 1, 0.064))
    expect(at120.belly).toBeCloseTo(at60.belly, 2)
    expect(stalled.belly).toBeCloseTo(at60.belly, 2)
    expect(at120.shoulders).toBeCloseTo(at60.shoulders, 2)
  })
})

describe('the drawing', () => {
  it('draws the depth as the belly has it up to the knee, and never past the cap', () => {
    expect(chain.drawn(0.2)).toBe(0.2)
    expect(chain.drawn(-0.2)).toBe(-0.2)
    for (const belly of [0.5, 1, 3, 10]) {
      expect(chain.drawn(belly)).toBeGreaterThan(pool.stretchKnee)
      // The ease reaches the cap only in floating point, at a lag no scroll produces.
      expect(chain.drawn(belly)).toBeLessThanOrEqual(pool.stretchCap)
      expect(chain.drawn(-belly)).toBe(-chain.drawn(belly))
    }
  })

  it('leans with the lag, toward its room and never past it', () => {
    expect(chain.lean(CHAIN_AT_REST)).toBe(0)
    expect(chain.lean({ ...CHAIN_AT_REST, belly: 0.1 })).toBeGreaterThan(0)
    expect(chain.lean({ ...CHAIN_AT_REST, shoulders: 0.1 })).toBeLessThan(0)
    // Small lags lean in proportion: pointiness of the room per unit of lag.
    expect(chain.lean({ ...CHAIN_AT_REST, belly: 0.05 })).toBeCloseTo(0.05 * pool.pointiness, 3)
    for (const lag of [1, 3, 100]) {
      expect(chain.lean({ ...CHAIN_AT_REST, belly: lag })).toBeGreaterThan(0.35)
      expect(chain.lean({ ...CHAIN_AT_REST, belly: lag })).toBeLessThanOrEqual(ROOM)
      expect(chain.lean({ ...CHAIN_AT_REST, shoulders: lag })).toBeGreaterThanOrEqual(-ROOM)
    }
  })
})
