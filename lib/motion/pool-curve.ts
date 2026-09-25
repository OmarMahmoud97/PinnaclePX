import { CONFIG } from '@/lib/config'
import { type ChainState, makeChain } from '@/lib/motion/chain'

// The home page's pooled curve as liquid (app/_components/motion/ink-pool.ts drives this from
// the scroll; the physics is lib/motion/chain.ts; ADR 0034, amendment of 25 September 2026).
// What is drawn: the apex's depth is the belly's, and the curve's shape is the belly's lag
// behind the shoulders. While the shoulders lead (a scroll just begun, or the swing back up)
// the curve is a flat-bottomed dish, its ends dropped and its middle not yet moved; while the
// belly hangs below them (the overshoot, the pendant at the bottom of each swing) it is a drop,
// its handles drawn toward the centre; where they agree it is the resting segment, stretched.
// Displacements are shares of the resting depth; the numbers are CONFIG.motion.choreo.pool.

// The curve's box (app/page.tsx): 1000 wide, 140 deep at the apex, a circle segment of radius
// (500² + 140²) / 280 = 962.857. Drawn as one cubic instead of the arc so it can change shape: a
// cubic hugs an arc of half-angle a (asin(500 / r) here) with handles (4/3) tan(a/2) r long along
// the end tangents, which puts them 307.19 in from each end at a depth of 186.66. A symmetric
// cubic's depth along its length is 3 t (1 - t) times the handles' depth whatever their inset,
// so the apex is 0.75 of that, 139.99 against the arc's 140, and the curve stays within 0.03 of
// the true arc; the inset alone decides the shape, from a dish (handles toward the ends) to a
// drop (handles toward the centre), and the apex's depth never depends on it.
const WIDTH = 1000
const DEPTH = 140
const RADIUS = ((WIDTH * WIDTH) / 4 + DEPTH * DEPTH) / (2 * DEPTH)
const HALF_ANGLE = Math.asin(WIDTH / 2 / RADIUS)
const HANDLE = (4 / 3) * Math.tan(HALF_ANGLE / 2) * RADIUS
const HANDLE_INSET = HANDLE * Math.cos(HALF_ANGLE)
const HANDLE_DEPTH = HANDLE * Math.sin(HALF_ANGLE)
// How far the handles may go from their resting inset, as a share of it, and never reached:
// 0.4 either way is a dish whose ends fall at about 45°, or a drop whose handles sit 140 apart
// at the centre and still round off (past 500 they would cross and the curve would loop). This
// is the geometry's own room, not a number to tune; pointiness is.
const INSET_ROOM = 0.4

export const POOL = makeChain(CONFIG.motion.choreo.pool, INSET_ROOM)

const fixed = (value: number): string => value.toFixed(2)

// The path for a state, in the box's units. The strip above y=0 is the overlap with the stretch
// (app/page.tsx explains); the belly's lag behind the shoulders moves the handles, and the
// belly's depth alone moves the apex, so the clearance under the walkthrough's heading holds
// whatever shape the curve takes.
export function poolPath(state: ChainState): string {
  const depth = HANDLE_DEPTH * (1 + POOL.drawn(state.belly))
  const inset = HANDLE_INSET * (1 + POOL.lean(state))
  return `M0 -2H${String(WIDTH)}V0C${fixed(WIDTH - inset)} ${fixed(depth)} ${fixed(inset)} ${fixed(depth)} 0 0Z`
}
