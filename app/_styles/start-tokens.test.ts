import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { CONFIG } from '@/lib/config'

// app/_styles/start.css mirrors the numbers CSS reads from CONFIG.start, and the two must never
// drift (docs/start-page-journey-plan.md, 6.1 and section 10): the pace, the exit, the rise, the
// lamp, the draft's pour and the spring's linear() curve, which is sampled here again from its
// spring and compared. Every number also stays inside the motion caps (plan 6.3).

const CSS = readFileSync(new URL('start.css', import.meta.url), 'utf8')
const GLOBALS = readFileSync(new URL('../globals.css', import.meta.url), 'utf8')

// The custom properties a rule block declares, by name, with their values as written.
function declarations(block: string): ReadonlyMap<string, string> {
  const found = new Map<string, string>()
  for (const match of block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    const [, name, value] = match
    if (name !== undefined && value !== undefined)
      found.set(name, value.replace(/\s+/g, ' ').trim())
  }
  return found
}

// The body of the first rule that opens with `selector {` after `from`, braces balanced.
function blockAfter(selector: string, from = 0): string {
  const open = CSS.indexOf(`${selector} {`, from)
  if (open < 0) throw new Error(`start.css has no ${selector} block`)
  let depth = 0
  for (let at = CSS.indexOf('{', open); at < CSS.length; at += 1) {
    if (CSS[at] === '{') depth += 1
    if (CSS[at] === '}') depth -= 1
    if (depth === 0) return CSS.slice(CSS.indexOf('{', open) + 1, at)
  }
  throw new Error(`start.css's ${selector} block never closes`)
}

const ROOT = declarations(blockAfter(':root'))
const REDUCED = declarations(
  blockAfter(':root', CSS.indexOf('@media (prefers-reduced-motion: reduce)')),
)

function token(name: string): string {
  const value = ROOT.get(name)
  if (value === undefined) throw new Error(`start.css declares no ${name}`)
  return value
}

// The step response of a damped spring, from rest at 0 to rest at 1, t in seconds.
function springAt(t: number, frequencyHz: number, dampingRatio: number): number {
  const omega = 2 * Math.PI * frequencyHz
  const damped = omega * Math.sqrt(1 - dampingRatio ** 2)
  const decay = Math.exp(-dampingRatio * omega * t)
  return (
    1 - decay * (Math.cos(damped * t) + ((dampingRatio * omega) / damped) * Math.sin(damped * t))
  )
}

// The spring as a linear() easing: evenly spaced samples over its duration, to three places, the
// last pinned to 1 so the curve ends where the property rests. Twenty steps of 45 ms keep its
// overshoot's peak within a thousandth.
const SPRING_STEPS = 20

function springEasing({ frequencyHz, dampingRatio, durationMs }: typeof CONFIG.start.spring) {
  const samples = Array.from({ length: SPRING_STEPS + 1 }, (_, step) =>
    step === SPRING_STEPS
      ? 1
      : Math.round(
          springAt((step / SPRING_STEPS) * (durationMs / 1000), frequencyHz, dampingRatio) * 1000,
        ) / 1000,
  )
  return `linear(${samples.join(',')})`
}

describe('the questionnaire’s tokens', () => {
  const { start, walkthrough } = CONFIG

  it('pace the questions as CONFIG.start does, and slower under reduced motion', () => {
    expect(Number(token('--start-pace'))).toBe(start.pace)
    expect(Number(REDUCED.get('--start-pace'))).toBe(start.reducedPace)
    expect(token('--start-exit')).toBe(`${String(start.exitMs)}ms`)
  })

  it('rise, fall in and leave by CONFIG.start.rise', () => {
    expect(token('--start-rise-lead')).toBe(`${String(start.rise.leadRem)}rem`)
    expect(token('--start-rise-back')).toBe(`${String(start.rise.backRem)}rem`)
    expect(token('--start-rise-controls')).toBe(`${String(start.rise.controlsRem)}rem`)
    expect(token('--start-rise-exit')).toBe(`${String(start.rise.exitRem)}rem`)
    expect(Number(token('--start-rise-scale'))).toBe(start.rise.scaleFrom)
    expect(token('--start-stagger')).toBe(`${String(start.rise.staggerMs)}ms`)
    // The lead, then the helper, then the controls: no more items rise than the stagger allows.
    const places = [...CSS.matchAll(/--rise-at:\s*(\d+)/g)].map((match) => Number(match[1]))
    expect(Math.max(0, ...places)).toBeLessThan(start.rise.items)
  })

  it('light the lamp at each question as CONFIG.start.lamp does', () => {
    start.lamp.lit.forEach((lit, index) => {
      expect(Number(token(`--start-lamp-${String(index + 1)}`))).toBe(lit)
    })
    expect(Number(token('--start-lamp-done'))).toBe(start.lamp.doneLit)
    expect(Number(token('--start-swell'))).toBe(start.lamp.swell)
  })

  it('pour the draft on the walkthrough’s colour beat', () => {
    expect(token('--draft-each')).toBe(`${String(walkthrough.beats.colour.each)}ms`)
    expect(token('--draft-step')).toBe(`${String(walkthrough.beats.colour.step)}ms`)
    expect(token('--draft-glow')).toBe(`${String(walkthrough.beats.colour.glow)}ms`)
  })

  it('spring along the curve sampled from CONFIG.start.spring', () => {
    expect(token('--ease-spring').replace(/\s+/g, '')).toBe(springEasing(start.spring))
  })
})

describe('the questionnaire’s motion', () => {
  const { start, motion } = CONFIG
  // The page's slowest clock, which the pace stretches (app/globals.css).
  const revealMs = Number(/--motion-reveal:\s*(\d+)ms/.exec(GLOBALS)?.[1])

  it('stays inside the caps', () => {
    expect(start.rise.leadRem).toBeLessThanOrEqual(motion.caps.translateRem)
    expect(start.rise.scaleFrom).toBeGreaterThanOrEqual(motion.caps.scaleFrom)
    expect(start.rise.staggerMs).toBeLessThanOrEqual(motion.caps.staggerMs)
    expect(revealMs * start.pace).toBeLessThanOrEqual(motion.caps.tweenMs)
    expect(start.spring.durationMs).toBeLessThanOrEqual(motion.caps.tweenMs)
    expect(start.exitMs).toBeLessThanOrEqual(motion.caps.tweenMs)
  })

  it('overshoots by about nine per cent, and no further than the caps allow', () => {
    const peak = Math.max(
      ...Array.from({ length: 1000 }, (_, step) =>
        springAt(step / 1000, start.spring.frequencyHz, start.spring.dampingRatio),
      ),
    )
    expect(peak).toBeGreaterThan(1.08)
    expect(peak).toBeLessThan(1.1)
    expect(start.rise.leadRem * peak).toBeLessThanOrEqual(motion.caps.translateRem)
  })
})
