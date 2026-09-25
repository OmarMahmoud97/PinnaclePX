import { CONFIG } from '@/lib/config'
import { CHAIN_AT_REST, type ChainState, makeChain } from '@/lib/motion/chain'

const { sheet } = CONFIG.motion.choreo

// The footer sheet's lip as liquid (app/_components/motion/sheet-lip.ts drives this from the
// scroll; the physics is lib/motion/chain.ts; ADR 0034, amendment of 25 September 2026). The
// sheet's rounded top, one path in the page's own pixels: the two corners stay pinned to the
// sheet's sides, a quarter circle each at rest, and the flat top between them is a cubic whose
// apex is the belly's, down while the page glides down (the ink lags the page, as the pool
// does) and up past rest once it stops. Its handles' inset from the corners is the belly's lag
// behind the shoulders: toward the corners while the shoulders lead, a flat lift with steep
// sides; toward the centre while the belly leads, a peaked swell. Each corner's landing tangent
// turns with the top's, so the join never kinks and the rim tips a little the other way as the
// middle moves, the way a meniscus does. Displacements are in corner radii (--seam); the numbers
// are CONFIG.motion.choreo.sheet.

// The sheet's own pixels, measured by the driver: its width and its corners' radius.
export type LipGeometry = Readonly<{ width: number; radius: number }>

// The strip under the flat line the sheet leaves unpainted for the lip, in radii: a trough
// draws down to stretchCap radii and stays inside it. Keep equal to --lip-room (app/globals.css).
export const LIP_ROOM = 1.3
// A cubic hugs a quarter circle with handles this share of the radius along the end tangents.
const KAPPA = 0.5522847498
// How far the handles may go from dome, as a share of the half-length between the corners,
// and never reached: 0.4 either way keeps them between the corners. The geometry's own room,
// not a number to tune; pointiness is.
const INSET_ROOM = 0.4

export const SHEET = makeChain(sheet, INSET_ROOM)

const fixed = (value: number): string => value.toFixed(2)

// The path for a state and a sheet. y runs down from the flat line: the corners' tops are at
// 0, the walls reach the strip's foot at LIP_ROOM radii plus a 2 px overlap with the sheet's
// own paint, so the join never shows a hairline where two layers meet on a fractional pixel.
export function lipPath(state: ChainState, { width, radius }: LipGeometry): string {
  const apex = radius * SHEET.drawn(state.belly)
  const half = width / 2 - radius
  const inset = half * (sheet.dome + SHEET.lean(state))
  // A symmetric cubic's apex is 0.75 of its handles' height.
  const lift = (4 / 3) * apex
  // The top's tangent where it leaves the left corner, which the corner's own landing takes.
  const angle = Math.atan2(lift, inset)
  const along = KAPPA * radius * Math.cos(angle)
  const across = KAPPA * radius * Math.sin(angle)
  const foot = radius * LIP_ROOM + 2
  const left = fixed(radius)
  const right = fixed(width - radius)
  const wall = fixed(radius - KAPPA * radius)
  return (
    `M0 ${fixed(foot)}V${left}` +
    `C0 ${wall} ${fixed(radius - along)} ${fixed(-across)} ${left} 0` +
    `C${fixed(radius + inset)} ${fixed(lift)} ${fixed(width - radius - inset)} ${fixed(lift)} ${right} 0` +
    `C${fixed(width - radius + along)} ${fixed(-across)} ${fixed(width)} ${wall} ${fixed(width)} ${left}` +
    `V${fixed(foot)}Z`
  )
}

export const restLipPath = (geometry: LipGeometry): string => lipPath(CHAIN_AT_REST, geometry)
