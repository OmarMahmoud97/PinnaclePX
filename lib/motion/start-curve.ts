import { CONFIG } from '@/lib/config'

const { curve } = CONFIG.start

// The phone's pooled curve under /start's region (docs/start-page-journey-plan.md, 6.2): a mass on
// a spring, like the home page's (app/_components/motion/ink-pool.ts) but kicked rather than
// pulled. Each question change gives it a push, down for a Next and up for a Back, and it rings
// about two seconds (1 Hz, damping 0.2) before it sleeps and lets go of its transform. What is
// drawn is capped at stretchCap, so kicks in quick succession never tear it past the pool's
// recorded exemption from the motion caps. Only scaleY moves, about the curve's flat top edge.
// Reduced motion is read on every kick, and a change to it mid-ring puts the curve to rest. A
// curve that is not drawn, from lg or on a screen under 30rem tall, is never kicked.

const OMEGA = 2 * Math.PI * curve.frequencyHz
// A frame lost to a hidden tab integrates as one long frame at most.
const MAX_FRAME_S = 0.064
const REDUCE = '(prefers-reduced-motion: reduce)'

export type CurveState = Readonly<{ stretch: number; speed: number }>

// One frame of the spring back to rest, by semi-implicit Euler: stable while omega times the
// frame stays under 2, which 1 Hz at 64 ms clears by a wide margin.
export function stepCurve({ stretch, speed }: CurveState, seconds: number): CurveState {
  const next = speed - (OMEGA * OMEGA * stretch + 2 * curve.dampingRatio * OMEGA * speed) * seconds
  return { stretch: stretch + next * seconds, speed: next }
}

// A kick: a push of `kick` resting depths per radian, which peaks near 0.19 of the depth.
export function kickCurve(state: CurveState, direction: 1 | -1): CurveState {
  return { stretch: state.stretch, speed: state.speed + direction * curve.kick * OMEGA }
}

// What is drawn: the stretch, held inside the cap.
export function drawnStretch(stretch: number): number {
  return Math.max(-curve.stretchCap, Math.min(curve.stretchCap, stretch))
}

type Curve = Readonly<{ kick: (direction: 1 | -1) => void; stop: () => void }>

export function startCurve(element: SVGElement): Curve {
  const media = matchMedia(REDUCE)
  let state: CurveState = { stretch: 0, speed: 0 }
  let frame = 0
  let last = 0
  let sleepAt = 0

  const rest = () => {
    cancelAnimationFrame(frame)
    frame = 0
    state = { stretch: 0, speed: 0 }
    element.style.transform = ''
  }
  const tick = (now: number) => {
    if (now >= sleepAt) {
      rest()
      return
    }
    state = stepCurve(state, Math.min(Math.max(now - last, 0) / 1000, MAX_FRAME_S))
    last = now
    element.style.transform = `scaleY(${String(1 + drawnStretch(state.stretch))})`
    frame = requestAnimationFrame(tick)
  }
  media.addEventListener('change', rest)

  return {
    kick(direction) {
      if (media.matches || element.getClientRects().length === 0) return
      state = kickCurve(state, direction)
      sleepAt = performance.now() + curve.sleepMs
      if (frame !== 0) return
      last = performance.now()
      frame = requestAnimationFrame(tick)
    },
    stop() {
      media.removeEventListener('change', rest)
      rest()
    },
  }
}
