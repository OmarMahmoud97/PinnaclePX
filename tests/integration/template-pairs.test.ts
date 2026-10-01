import { wcagContrast } from 'culori'
import type { ContrastPair, Scheme } from '@/lib/tokens/types'
import { CONFIG } from '@/lib/config'
import { deriveTokens } from '@/lib/tokens/derive'
import { contractFor, TEMPLATES } from '@/templates/registry'

// The pipeline solves one token set for a submission over the pairs of every template it chose
// (lib/inngest/functions/build-concepts.ts), so each template's pairs must settle with any other
// template's. A pair that pulls a token one way while another template's pulls it the other (a
// brand colour asked to read on the light page and on the dark scrim alike) makes the solver give
// up, and the whole submission fails. Checked here for every registered template, ready or not,
// over the adversarial corpus of lib/tokens/derive.test.ts, in both schemes: each template alone,
// and all of them together.
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
  '#ff2500',
] as const

const SCHEMES: readonly Scheme[] = ['light', 'dark']

const pairsOf = (id: string): readonly ContrastPair[] => contractFor(id).contrastPairs
const ALL: readonly ContrastPair[] = TEMPLATES.flatMap((t) => pairsOf(t.id))

function expectAA(hex: string, scheme: Scheme, pairs: readonly ContrastPair[]) {
  const tokens = deriveTokens(hex, scheme, pairs)
  for (const pair of pairs) {
    const ratio = wcagContrast(tokens[pair.text], tokens[pair.background])
    expect(
      ratio,
      `${pair.text} on ${pair.background} for ${hex} (${scheme})`,
    ).toBeGreaterThanOrEqual(CONFIG.contrast.minRatio)
  }
}

describe('template contrast pairs', () => {
  describe.each(SCHEMES)('%s scheme', (scheme) => {
    it.each(TEMPLATES.map((t) => t.id))('settle at AA for %s alone', (id) => {
      for (const hex of CORPUS) expectAA(hex, scheme, pairsOf(id))
    })

    it('settle at AA for every template together', () => {
      for (const hex of CORPUS) expectAA(hex, scheme, ALL)
    })
  })
})
