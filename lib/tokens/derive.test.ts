import { oklch, parse } from 'culori'
import { CONFIG } from '@/lib/config'
import { AppError } from '@/lib/errors'
import { contrastOf } from '@/lib/tokens/contrast'
import { deriveTokens, parseBrand } from '@/lib/tokens/derive'
import { type ContrastPair, type Scheme, TOKEN_NAMES } from '@/lib/tokens/types'

// The adversarial corpus from the build guide, plus the palettes and the example brands: pure
// primaries at the edge of the gamut, greys with no hue, black and white, and near-black and
// near-white where a ramp has nowhere to go.
const CORPUS = [
  '#FFFF00',
  '#808080',
  '#00FF00',
  '#FF00FF',
  '#0000FF',
  '#FF0000',
  '#000000',
  '#FFFFFF',
  '#FEFEFE',
  '#010101',
  '#2f6f4e',
  '#1e3a8a',
  '#9a3d1e',
  '#6b2d5b',
  '#2e8c9c',
  '#f59e4a',
  '#0ea5e9',
] as const

const SCHEMES: readonly Scheme[] = ['light', 'dark']

// Every pair a template could declare (Aurora's list and the accent panel), so the engine is
// held to more than one template's needs. A lib test may not import a template, so the list is
// written out; the registry test checks each template's own pairs.
const EVERY_PAIR: readonly ContrastPair[] = [
  { text: 'on-surface', background: 'surface' },
  { text: 'on-surface-muted', background: 'surface' },
  { text: 'on-surface', background: 'surface-muted' },
  { text: 'on-surface-muted', background: 'surface-muted' },
  { text: 'on-surface', background: 'accent' },
  { text: 'on-surface-muted', background: 'accent' },
  { text: 'brand-deeper', background: 'surface' },
  { text: 'brand-deeper', background: 'surface-muted' },
  { text: 'on-brand', background: 'brand-deeper' },
  { text: 'on-brand', background: 'brand-deepest' },
  { text: 'on-scrim', background: 'scrim' },
]

function hueOf(hex: string): number {
  const colour = oklch(parse(hex) ?? { mode: 'rgb', r: 0, g: 0, b: 0 })
  return colour.h ?? 0
}

function chromaOf(hex: string): number {
  const colour = oklch(parse(hex) ?? { mode: 'rgb', r: 0, g: 0, b: 0 })
  return colour.c
}

// The shortest way round the hue circle, in degrees.
function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360
  return Math.min(d, 360 - d)
}

describe('deriveTokens', () => {
  describe.each(SCHEMES)('%s scheme', (scheme) => {
    it.each(CORPUS)('brings every pair to AA for %s', (hex) => {
      const tokens = deriveTokens(hex, scheme, EVERY_PAIR)
      for (const pair of EVERY_PAIR) {
        const ratio = contrastOf(tokens[pair.text], tokens[pair.background])
        expect(ratio, `${pair.text} on ${pair.background}`).toBeGreaterThanOrEqual(
          CONFIG.contrast.minRatio,
        )
      }
    })

    it.each(CORPUS)('keeps the brand hue for %s', (hex) => {
      const tokens = deriveTokens(hex, scheme, EVERY_PAIR)
      const brandHue = parseBrand(hex).h ?? 0
      for (const name of ['brand', 'brand-deeper', 'brand-deepest', 'glow'] as const) {
        // A colour clamped to grey has no hue to keep.
        if (chromaOf(tokens[name]) < CONFIG.colour.greyChroma) continue
        expect(hueDistance(hueOf(tokens[name]), brandHue), name).toBeLessThan(3)
      }
    })

    it.each(CORPUS)('produces fourteen six-digit hex values for %s', (hex) => {
      const tokens = deriveTokens(hex, scheme, EVERY_PAIR)
      expect(Object.keys(tokens).sort()).toEqual([...TOKEN_NAMES].sort())
      for (const value of Object.values(tokens)) expect(value).toMatch(/^#[0-9a-f]{6}$/)
    })
  })

  it('keeps a grey brand grey', () => {
    const tokens = deriveTokens('#808080', 'light', EVERY_PAIR)
    for (const name of TOKEN_NAMES) expect(chromaOf(tokens[name]), name).toBeLessThan(0.005)
  })

  it('puts the page on a light surface in the light scheme and a dark one in the dark scheme', () => {
    const light = deriveTokens('#2f6f4e', 'light', EVERY_PAIR)
    const dark = deriveTokens('#2f6f4e', 'dark', EVERY_PAIR)
    expect(contrastOf('#ffffff', light.surface)).toBeLessThan(1.15)
    expect(contrastOf('#000000', dark.surface)).toBeLessThan(1.6)
  })

  it('is deterministic', () => {
    expect(deriveTokens('#f59e4a', 'dark', EVERY_PAIR)).toEqual(
      deriveTokens('#f59e4a', 'dark', EVERY_PAIR),
    )
  })

  it('accepts three-digit hex and surrounding whitespace', () => {
    expect(deriveTokens(' #2f4 ', 'light', EVERY_PAIR).brand).toMatch(/^#[0-9a-f]{6}$/)
  })

  it('throws for something that is not a colour', () => {
    expect(() => deriveTokens('teal-ish', 'light', EVERY_PAIR)).toThrow(AppError)
  })
})
