// A liquid edge as two masses in a chain (ADR 0034, amendment of 25 September 2026): the home
// page's pooled curve (lib/motion/pool-curve.ts) and the footer sheet's lip (lib/motion/
// lip-curve.ts) share this physics and differ only in what they draw from it.
//
//   the shoulders   pulled by the scroll's speed, on a stiff, quick spring: they take the pull
//                   almost at once and ripple a few times when it lets go;
//   the belly       pulled by the shoulders, on a loose, slow spring: it lags them while the
//                   page gets going, overshoots them once it stops, and swings back through rest
//                   for a few seconds, which is the wobble the eye follows.
//
// A drawing takes the belly as its depth and the belly's lag behind the shoulders as its shape.
// One rigid stretch at one frequency was tried first and read as a rubber sheet on a spring;
// the chain gives the overlap and follow-through of a hanging drop, and the two frequencies
// together (the shoulders at twice the belly's, a drop's first two symmetric modes) make the
// settle start busy and end clean, which is what reads as jelly rather than a metronome.
//
// Displacements are shares of the drawing's own unit (the pool's resting depth, the sheet's
// corner radius), speeds per second, and the numbers are the drawing's block in
// CONFIG.motion.choreo. The springs are integrated by semi-implicit Euler in fixed sub-steps,
// so a 60 Hz and a 120 Hz display draw the same swing and a long frame after a hidden tab keeps
// its shape.

type SpringNumbers = Readonly<{ frequencyHz: number; dampingRatio: number }>

export type ChainNumbers = Readonly<{
  stretchMax: number
  stretchKnee: number
  stretchCap: number
  fullSpeedPxS: number
  shoulders: SpringNumbers
  belly: SpringNumbers
  pointiness: number
}>

export type ChainState = Readonly<{
  shoulders: number
  shouldersSpeed: number
  belly: number
  bellySpeed: number
}>

export const CHAIN_AT_REST: ChainState = {
  shoulders: 0,
  shouldersSpeed: 0,
  belly: 0,
  bellySpeed: 0,
}

export type Chain = Readonly<{
  // The pull for a scroll speed: stretchMax at full speed, through tanh, so a hard flick
  // saturates instead of tearing the edge into the content beside it, and a wheel notch still
  // stirs it.
  pullAt: (velocityPxS: number) => number
  // `seconds` of the chain under a steady pull.
  step: (state: ChainState, pull: number, seconds: number) => ChainState
  isAtRest: (state: ChainState) => boolean
  // The depth that is drawn: the belly's up to the knee, and past it an ease toward the cap
  // that never arrives (tanh), so a strong flick has no wall to hit. A wall was tried: the
  // spring stopped dead against it on a six-notch flick, which read as a thud, not liquid. The
  // physics runs free; the pull is bounded by stretchMax and the springs by their damping, so
  // the ease is only ever asked for the top of a hard flick.
  drawn: (belly: number) => number
  // The shape that is drawn: the belly's lag behind the shoulders, pointiness of the drawing's
  // room per unit of lag, eased toward the room either way through tanh and never reaching it,
  // because a hard rail held the pool's point still for a tenth of a second at the top of a
  // flick (measured) and a shape that stops is a wall.
  lean: (state: ChainState) => number
}>

// A sub-step of the integration. Omega times the step is 0.05 for a 2 Hz spring, far inside
// the stability limit of 2 and accurate enough that the frame rate does not colour the swing.
const STEP_S = 1 / 240
// Under these, with the page still, the edge is at rest: 0.002 of the unit is under half a
// pixel at the deepest pool and a tenth of one at the sheet's widest corner.
const REST_STRETCH = 0.002
const REST_SPEED = 0.02

type Spring = Readonly<{ stiffness: number; damping: number }>

function springOf({ frequencyHz, dampingRatio }: SpringNumbers): Spring {
  const omega = 2 * Math.PI * frequencyHz
  return { stiffness: omega * omega, damping: 2 * dampingRatio * omega }
}

export function makeChain(numbers: ChainNumbers, room: number): Chain {
  const shoulders = springOf(numbers.shoulders)
  const belly = springOf(numbers.belly)
  return {
    pullAt: (velocityPxS) => numbers.stretchMax * Math.tanh(velocityPxS / numbers.fullSpeedPxS),
    step: (state, pull, seconds) => {
      const steps = Math.max(1, Math.ceil(seconds / STEP_S))
      const dt = seconds / steps
      let { shoulders: s, shouldersSpeed: sv, belly: b, bellySpeed: bv } = state
      for (let i = 0; i < steps; i += 1) {
        sv += (shoulders.stiffness * (pull - s) - shoulders.damping * sv) * dt
        s += sv * dt
        bv += (belly.stiffness * (s - b) - belly.damping * bv) * dt
        b += bv * dt
      }
      return { shoulders: s, shouldersSpeed: sv, belly: b, bellySpeed: bv }
    },
    isAtRest: (state) =>
      Math.abs(state.shoulders) < REST_STRETCH &&
      Math.abs(state.belly) < REST_STRETCH &&
      Math.abs(state.shouldersSpeed) < REST_SPEED &&
      Math.abs(state.bellySpeed) < REST_SPEED,
    drawn: (value) => {
      const size = Math.abs(value)
      if (size <= numbers.stretchKnee) return value
      const span = numbers.stretchCap - numbers.stretchKnee
      return (
        Math.sign(value) *
        (numbers.stretchKnee + span * Math.tanh((size - numbers.stretchKnee) / span))
      )
    },
    lean: (state) =>
      room * Math.tanh((numbers.pointiness * (state.belly - state.shoulders)) / room),
  }
}
