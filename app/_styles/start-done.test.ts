import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { CONFIG } from '@/lib/config'

// app/_styles/start-done.css mirrors the numbers the send and ready read from CONFIG.start, and
// the two must never drift (docs/start-page-journey-plan.md, 6.1 and section 10): how far the ink
// blooms before it holds, and ready's flip, its words' fades and its posters' veils.

const CSS = readFileSync(new URL('start-done.css', import.meta.url), 'utf8')

// The custom properties the sheet's first :root block declares, by name, as written.
function rootTokens(): ReadonlyMap<string, string> {
  const open = CSS.indexOf(':root {')
  const block = CSS.slice(CSS.indexOf('{', open) + 1, CSS.indexOf('}', open))
  const found = new Map<string, string>()
  for (const [, name, value] of block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    if (name !== undefined && value !== undefined) found.set(name, value.trim())
  }
  return found
}

const ROOT = rootTokens()

describe('start-done.css', () => {
  it('holds the ink where CONFIG.start.send does', () => {
    expect(ROOT.get('--send-hold')).toBe(String(CONFIG.start.send.holdShare))
  })

  it('flips to ready on CONFIG.start.ready’s clock, the ground rising between the fades', () => {
    const { flipMs, textFadeMs, veilMs } = CONFIG.start.ready
    expect(ROOT.get('--done-flip')).toBe(`${String(flipMs)}ms`)
    expect(ROOT.get('--done-fade')).toBe(`${String(textFadeMs)}ms`)
    expect(ROOT.get('--done-veil')).toBe(`${String(veilMs)}ms`)
    expect(ROOT.get('--done-rise')).toBe('calc(var(--done-flip) - 2 * var(--done-fade))')
  })

  it('keeps every duration inside the motion caps (plan 6.3)', () => {
    const { flipMs, textFadeMs, veilMs } = CONFIG.start.ready
    for (const ms of [flipMs, textFadeMs, veilMs]) expect(ms).toBeLessThanOrEqual(900)
    expect(CONFIG.start.send.holdShare).toBeGreaterThan(0)
    expect(CONFIG.start.send.holdShare).toBeLessThan(1)
  })
})
