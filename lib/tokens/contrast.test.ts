import type { Oklch } from 'culori'
import { CONFIG } from '@/lib/config'
import { AppError } from '@/lib/errors'
import { contrastOf, type OklchSet, solvePairs, solveText } from '@/lib/tokens/contrast'
import { TOKEN_NAMES } from '@/lib/tokens/types'

const OPTIONS = CONFIG.contrast

const colour = (l: number, c = 0, h = 0): Oklch => ({ mode: 'oklch', l, c, h })

describe('solveText', () => {
  it('returns the text unchanged when the pair already passes', () => {
    const text = colour(0.2)
    expect(solveText(text, colour(0.98), OPTIONS)).toBe(text)
  })

  it('moves the text away from the background until the pair passes', () => {
    const solved = solveText(colour(0.6), colour(0.98), OPTIONS)
    expect(solved.l).toBeLessThan(0.6)
    expect(contrastOf(solved, colour(0.98))).toBeGreaterThanOrEqual(OPTIONS.minRatio)
  })

  it('flips to the other side when the near side cannot reach the ratio', () => {
    // White text on a mid yellow fill: white cannot pass, dark text can.
    const fill = colour(0.8, 0.17, 95)
    const solved = solveText(colour(1), fill, OPTIONS)
    expect(solved.l).toBeLessThan(0.5)
    expect(contrastOf(solved, fill)).toBeGreaterThanOrEqual(OPTIONS.minRatio)
  })

  it('keeps the hue of the text it moves', () => {
    const solved = solveText(colour(0.7, 0.15, 250), colour(0.98), OPTIONS)
    expect(solved.h).toBe(250)
  })
})

describe('solvePairs', () => {
  const base = Object.fromEntries(TOKEN_NAMES.map((name) => [name, colour(0.5)])) as Record<
    (typeof TOKEN_NAMES)[number],
    Oklch
  >

  it('solves a chain where one pair moves the background of the next', () => {
    const tokens: OklchSet = {
      ...base,
      surface: colour(0.98),
      'brand-deeper': colour(0.7, 0.1, 30),
      'on-brand': colour(0.85),
    }
    const solved = solvePairs(
      tokens,
      [
        { text: 'brand-deeper', background: 'surface' },
        { text: 'on-brand', background: 'brand-deeper' },
      ],
      OPTIONS,
    )
    expect(contrastOf(solved['brand-deeper'], solved.surface)).toBeGreaterThanOrEqual(4.5)
    expect(contrastOf(solved['on-brand'], solved['brand-deeper'])).toBeGreaterThanOrEqual(4.5)
  })

  it('leaves tokens not in any pair alone', () => {
    const solved = solvePairs(base, [{ text: 'on-surface', background: 'surface' }], OPTIONS)
    expect(solved.glow).toBe(base.glow)
  })

  it('throws when the passes run out', () => {
    expect(() =>
      solvePairs(base, [{ text: 'on-surface', background: 'surface' }], {
        ...OPTIONS,
        maxPasses: 0,
      }),
    ).toThrow(AppError)
  })
})
