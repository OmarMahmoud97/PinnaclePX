import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { CONFIG } from '@/lib/config'

// app/_styles/contact.css copies what it may not share (ADR 0040): the page's pace and the send's
// hold from CONFIG.contact, the hero's ramp from app/globals.css, and the dark scope's tokens as
// a class. Each copy is held to its source here, and every motion number to the caps, so a change
// on either side fails this test until the other follows.

const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '')
const CSS = strip(readFileSync(new URL('contact.css', import.meta.url), 'utf8'))
const GLOBALS = strip(readFileSync(new URL('../globals.css', import.meta.url), 'utf8'))

// The body of the first block that opens with `head` after `from`, braces balanced.
function blockAfter(css: string, head: string, from = 0): string {
  const at = css.indexOf(head, from)
  if (at < 0) throw new Error(`no block opens with ${head}`)
  const open = css.indexOf('{', at)
  let depth = 0
  for (let index = open; index < css.length; index += 1) {
    if (css[index] === '{') depth += 1
    if (css[index] === '}') depth -= 1
    if (depth === 0) return css.slice(open + 1, index)
  }
  throw new Error(`the block after ${head} never closes`)
}

// Every block that opens with `head`, in order.
function blocksOf(css: string, head: string): string[] {
  const found: string[] = []
  for (let at = css.indexOf(head); at >= 0; at = css.indexOf(head, at + head.length)) {
    found.push(blockAfter(css, head, at))
  }
  return found
}

// A block's own declarations, by name, with their values as written.
function declarations(block: string): ReadonlyMap<string, string> {
  const found = new Map<string, string>()
  for (const [, name, value] of block.matchAll(/([\w-]+)\s*:\s*([^;{}]+);/g)) {
    if (name !== undefined && value !== undefined)
      found.set(name, value.replace(/\s+/g, ' ').trim())
  }
  return found
}

// A ramp's stops, colour and place, in order.
const stopsOf = (block: string) =>
  [...block.matchAll(/#[0-9a-f]{6}\s+[\d.]+%/gi)].map(([stop]) => stop)

const keyframeNames = (css: string) =>
  [...css.matchAll(/@keyframes\s+([\w-]+)/g)].map(([, name]) => name)

const MOTION = blocksOf(CSS, '@media (prefers-reduced-motion: no-preference)').join('\n')
const REDUCED = blocksOf(CSS, '@media (prefers-reduced-motion: reduce)').join('\n')
const CLOCKS = declarations(blockAfter(CSS, '.contact {'))

describe('the contact page’s copies', () => {
  it('paces the page and holds the send as CONFIG.contact does', () => {
    expect(Number(CLOCKS.get('--contact-pace'))).toBe(CONFIG.contact.pace)
    expect(Number(CLOCKS.get('--contact-hold'))).toBe(CONFIG.contact.send.holdShare)
    const reduced = declarations(blockAfter(REDUCED, '.contact {'))
    expect(Number(reduced.get('--contact-pace'))).toBe(1)
  })

  it('draws the hero’s ramp, stop for stop', () => {
    const hero = stopsOf(blockAfter(GLOBALS, '.hero-ground {'))
    expect(hero).toHaveLength(15)
    expect(stopsOf(blockAfter(CSS, '.contact-ground {'))).toEqual(hero)
  })

  it('takes the dark scope’s tokens as a class, and only those', () => {
    const scope = declarations(blockAfter(GLOBALS, "[data-theme='dark'],"))
    expect(scope.size).toBeGreaterThan(0)
    expect(declarations(blockAfter(CSS, '.contact-ink {'))).toEqual(scope)
  })
})

describe('the contact page’s motion', () => {
  const { caps } = CONFIG.motion
  const revealMs = Number(/--motion-reveal:\s*(\d+)ms/.exec(GLOBALS)?.[1])

  it('times everything by the page’s clocks, which stay inside the caps', () => {
    const timed = [...CSS.matchAll(/(?:animation|transition)(?:-duration|-delay)?\s*:\s*([^;]+);/g)]
    expect(timed.length).toBeGreaterThan(0)
    expect(
      timed.map(([, value]) => value).filter((value) => /\d(?:ms|s)\b/.test(value ?? '')),
    ).toEqual([])
    expect(revealMs * CONFIG.contact.pace).toBeLessThanOrEqual(caps.tweenMs)
    const stagger = /min\(.*,\s*(\d+)ms\)/.exec(CLOCKS.get('--contact-stagger') ?? '')?.[1]
    expect(Number(stagger)).toBeLessThanOrEqual(caps.staggerMs)
  })

  it('moves no further and scales no smaller than the caps allow', () => {
    const rems = [...CSS.matchAll(/translate:\s*([^;]+);/g)].flatMap(([, value]) =>
      [...(value ?? '').matchAll(/(-?[\d.]+)rem/g)].map(([, rem]) => Math.abs(Number(rem))),
    )
    expect(rems.length).toBeGreaterThan(0)
    expect(Math.max(...rems)).toBeLessThanOrEqual(caps.translateRem)
    const scales = [...CSS.matchAll(/\bscale:\s*([\d.]+)/g)].map(([, value]) => Number(value))
    expect(Math.min(...scales)).toBeGreaterThanOrEqual(caps.scaleFrom)
  })

  it('leaves nothing moved at rest after an entrance', () => {
    const entrances = [...CSS.matchAll(/animation:\s*(contact-(?:rise|settle-in)[^;]+);/g)]
    expect(entrances.length).toBeGreaterThan(0)
    for (const [, value] of entrances) expect(value).toMatch(/\bbackwards$/)
  })

  // The spinner holds still, and the phone's form card, whose lead is the largest paint there and
  // which never fades, has nothing to fade instead, so it appears at once.
  it('gives every movement a twin under reduced motion, except the spinner and the lift', () => {
    const still = ['contact-spin', 'contact-lift']
    const moving = keyframeNames(MOTION).filter(
      (name) => name !== undefined && !still.includes(name),
    )
    expect(moving.length).toBeGreaterThan(0)
    expect(keyframeNames(REDUCED)).toEqual(expect.arrayContaining(moving))
    for (const name of still) expect(keyframeNames(REDUCED)).not.toContain(name)
  })

  it('never fades the card that holds the phone’s largest paint', () => {
    const lift = blockAfter(MOTION, '@keyframes contact-lift')
    expect(lift).toContain('translate')
    expect(lift).not.toContain('opacity')
  })
})
