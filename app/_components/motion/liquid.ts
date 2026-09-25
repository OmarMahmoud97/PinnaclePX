import { type Chain, CHAIN_AT_REST, type ChainState } from '@/lib/motion/chain'
import type { Gsap, ScrollTriggerStatic } from '@/lib/motion/gsap'

// A frame lost to a hidden tab or a stall integrates as one long frame at most, so the chain
// keeps its shape on the way back rather than being kicked by the whole gap at once.
const MAX_FRAME_S = 0.064

export type Liquid = Readonly<{
  gsap: Gsap
  ScrollTrigger: ScrollTriggerStatic
  // The element whose time on screen the loop follows.
  trigger: Element
  chain: Chain
  draw: (state: ChainState) => void
  // Draws the resting shape; the loop calls it when it sleeps and after a refresh.
  rest: () => void
  // Re-measures whatever the drawing needs, on every ScrollTrigger refresh (a settled resize).
  onRefresh?: () => void
}>

// Drives a liquid edge from the scroll (ADR 0034, amendments of 23 and 25 September 2026): the
// pooled curve (ink-pool.ts) and the footer sheet's lip (sheet-lip.ts) share this loop. The
// chain is stepped on GSAP's ticker from each frame's own length: a tween restarted on every
// wheel tick would ring from its start each time rather than carry its momentum. The loop runs
// only while the edge is on screen and something is moving: the trigger's onUpdate fires on
// every scroll while the element is in the viewport and wakes it, and it puts itself to sleep
// once the chain has come to rest, drawing the resting shape, so a still page costs nothing.
// The caller runs this inside its matchMedia condition, so the trigger is the context's to
// kill; what comes back stops the loop for the condition's own cleanup.
export function drive({
  gsap,
  ScrollTrigger,
  trigger,
  chain,
  draw,
  rest: drawRest,
  onRefresh,
}: Liquid): () => void {
  let state: ChainState = CHAIN_AT_REST
  let lastY = window.scrollY
  let ticking = false

  const sleep = () => {
    if (!ticking) return
    ticking = false
    gsap.ticker.remove(step)
  }
  const rest = () => {
    sleep()
    state = CHAIN_AT_REST
    lastY = window.scrollY
    drawRest()
  }
  const wake = () => {
    if (ticking) return
    ticking = true
    gsap.ticker.add(step)
  }
  const step = (_time: number, deltaMs: number) => {
    if (deltaMs <= 0) return
    const dt = Math.min(deltaMs / 1000, MAX_FRAME_S)
    const y = window.scrollY
    const velocity = (y - lastY) / dt
    lastY = y
    state = chain.step(state, chain.pullAt(velocity), dt)
    if (!Number.isFinite(state.belly) || !Number.isFinite(state.shoulders)) {
      rest()
      return
    }
    if (velocity === 0 && chain.isAtRest(state)) {
      rest()
      return
    }
    draw(state)
  }

  ScrollTrigger.create({
    trigger,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: wake,
    onToggle: (self) => {
      if (!self.isActive) rest()
    },
    onRefresh: () => {
      onRefresh?.()
      if (!ticking) drawRest()
    },
  })
  return rest
}
