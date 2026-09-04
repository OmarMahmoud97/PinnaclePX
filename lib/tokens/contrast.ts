import { clampChroma, type Color, type Oklch, wcagContrast } from 'culori'
import { AppError } from '@/lib/errors'
import type { ContrastPair, TokenName } from '@/lib/tokens/types'

export type OklchSet = Readonly<Record<TokenName, Oklch>>

type Options = Readonly<{ minRatio: number; stepL: number; maxPasses: number }>

// A colour kept inside sRGB by lowering chroma, never by moving hue.
export function inGamut(colour: Oklch): Oklch {
  return clampChroma(colour, 'oklch')
}

function withLightness(colour: Oklch, l: number): Oklch {
  return inGamut({ ...colour, l: Math.min(1, Math.max(0, l)) })
}

// Moves the text away from the background in lightness, one step at a time, until the pair
// meets the ratio. If the far end of that direction is not enough, the text flips to the other
// side (white text becomes dark, or the reverse) and tries again from there. The hue and, as
// far as the gamut allows, the chroma are kept. Returns the text unchanged when it already passes.
export function solveText(text: Oklch, background: Oklch, options: Options): Oklch {
  if (wcagContrast(text, background) >= options.minRatio) return text
  const away = text.l >= background.l ? 1 : -1
  for (const direction of [away, -away]) {
    let candidate = direction === away ? text : withLightness(text, background.l)
    while (wcagContrast(candidate, background) < options.minRatio) {
      const next = candidate.l + direction * options.stepL
      if (next < 0 || next > 1) break
      candidate = withLightness(candidate, next)
    }
    if (wcagContrast(candidate, background) >= options.minRatio) return candidate
  }
  throw new AppError('A text colour cannot reach the contrast ratio on its background')
}

// Solves every pair, repeating until a whole pass moves nothing, because a token moved for one
// pair can be the background of another. Throws if the passes run out or a pair is unsolvable.
export function solvePairs(
  tokens: OklchSet,
  pairs: readonly ContrastPair[],
  options: Options,
): OklchSet {
  const solved: Record<TokenName, Oklch> = { ...tokens }
  for (let pass = 0; pass < options.maxPasses; pass += 1) {
    let moved = false
    for (const pair of pairs) {
      const next = solveText(solved[pair.text], solved[pair.background], options)
      if (next !== solved[pair.text]) {
        solved[pair.text] = next
        moved = true
      }
    }
    if (!moved) return solved
  }
  const failing = pairs.filter(
    (pair) => wcagContrast(solved[pair.text], solved[pair.background]) < options.minRatio,
  )
  throw new AppError(
    `Contrast did not settle: ${failing.map((p) => `${p.text} on ${p.background}`).join(', ')}`,
  )
}

// The ratio of a pair, as hex or as colours, for tests and for the checks the pipeline logs.
export function contrastOf(text: Color | string, background: Color | string): number {
  return wcagContrast(text, background)
}
