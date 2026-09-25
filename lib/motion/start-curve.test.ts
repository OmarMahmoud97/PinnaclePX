import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CONFIG } from '@/lib/config'
import {
  type CurveState,
  drawnStretch,
  kickCurve,
  startCurve,
  stepCurve,
} from '@/lib/motion/start-curve'

// /start's pooled curve (lib/motion/start-curve.ts, docs/start-page-journey-plan.md 6.2): a kick
// rings and settles inside the cap, the loop sleeps and lets go of its transform, a curve that is
// not drawn is never kicked, and reduced motion keeps it at rest, read on every kick and on every
// change.

const { curve } = CONFIG.start
const FRAME_S = 1 / 60

function ring(state: CurveState, seconds: number): number[] {
  const drawn: number[] = []
  let current = state
  for (let t = 0; t < seconds; t += FRAME_S) {
    current = stepCurve(current, FRAME_S)
    drawn.push(current.stretch)
  }
  return drawn
}

describe('the spring', () => {
  it('rings after a kick, peaks under the cap and dies away before it sleeps', () => {
    const drawn = ring(kickCurve({ stretch: 0, speed: 0 }, 1), curve.sleepMs / 1000)
    const peak = Math.max(...drawn)
    expect(peak).toBeGreaterThan(0.15)
    expect(peak).toBeLessThan(curve.stretchCap)
    // It swings back past rest at least once: a spring, not an ease.
    expect(Math.min(...drawn)).toBeLessThan(0)
    expect(Math.abs(drawn.at(-1) ?? 1)).toBeLessThan(0.02)
  })

  it('kicks up for a Back, and never draws past the cap', () => {
    expect(Math.min(...ring(kickCurve({ stretch: 0, speed: 0 }, -1), 0.5))).toBeLessThan(-0.15)
    expect(drawnStretch(1)).toBe(curve.stretchCap)
    expect(drawnStretch(-1)).toBe(-curve.stretchCap)
  })
})

describe('the loop', () => {
  let now = 0
  let frames: ((time: number) => void)[] = []
  let reduced = false
  const listeners = new Set<() => void>()

  beforeEach(() => {
    now = 0
    frames = []
    reduced = false
    listeners.clear()
    vi.spyOn(performance, 'now').mockImplementation(() => now)
    vi.stubGlobal('requestAnimationFrame', (callback: (time: number) => void) => {
      frames.push(callback)
      return frames.length
    })
    vi.stubGlobal('cancelAnimationFrame', () => {
      frames = []
    })
    vi.stubGlobal('matchMedia', () => ({
      get matches() {
        return reduced
      },
      addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
    }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  // Runs the queued frames for `ms` of page time.
  function play(ms: number) {
    const end = now + ms
    while (now < end && frames.length > 0) {
      now += 1000 * FRAME_S
      const due = frames
      frames = []
      for (const frame of due) frame(now)
    }
  }

  // The curve's svg, drawn (one box) or hidden (none), as from lg.
  function element(boxes = 1) {
    return {
      style: { transform: '' },
      getClientRects: () => ({ length: boxes }),
    } as unknown as SVGElement
  }

  it('draws the kick as scaleY and lets go of the transform once it sleeps', () => {
    const svg = element()
    const { kick } = startCurve(svg)
    kick(1)
    play(200)
    expect(svg.style.transform).toMatch(/^scaleY\(1\.\d+\)$/)
    play(curve.sleepMs)
    expect(svg.style.transform).toBe('')
    expect(frames).toEqual([])
  })

  it('never kicks a curve that is not drawn', () => {
    const svg = element(0)
    startCurve(svg).kick(1)
    expect(frames).toEqual([])
    expect(svg.style.transform).toBe('')
  })

  it('never kicks under reduced motion, and comes to rest when it is turned on', () => {
    const svg = element()
    const { kick, stop } = startCurve(svg)
    reduced = true
    kick(1)
    expect(frames).toEqual([])
    reduced = false
    kick(-1)
    play(100)
    expect(svg.style.transform).not.toBe('')
    reduced = true
    for (const listener of listeners) listener()
    expect(svg.style.transform).toBe('')
    stop()
    expect(listeners.size).toBe(0)
  })
})
