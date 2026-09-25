import { describe, expect, it } from 'vitest'
import { CONFIG } from '@/lib/config'
import { accentOf } from '@/lib/logo/accent'

type Rgba = readonly [number, number, number, number]

// A logo as pixels: `count` pixels of each colour, in order.
function pixels(...runs: readonly (readonly [Rgba, number])[]) {
  const data = runs.flatMap(([rgba, count]) => Array.from({ length: count }, () => rgba).flat())
  return { data, width: data.length / 4, height: 1 }
}

const FOREST: Rgba = [47, 111, 78, 255]
const BLACK: Rgba = [10, 10, 10, 255]
const WHITE: Rgba = [250, 250, 250, 255]
const CLEAR: Rgba = [0, 0, 0, 0]

describe('accentOf', () => {
  it('finds the colour a logo is drawn in', () => {
    expect(accentOf(pixels([FOREST, 40], [CLEAR, 60]))).toBe('#2f6f4e')
  })

  it('keeps the colour beside black lettering', () => {
    expect(accentOf(pixels([FOREST, 30], [BLACK, 70]))).toBe('#2f6f4e')
  })

  it('offers nothing for black, white or grey artwork', () => {
    expect(accentOf(pixels([BLACK, 50], [WHITE, 50]))).toBeNull()
    expect(accentOf(pixels([[128, 128, 128, 255], 100]))).toBeNull()
  })

  it('offers nothing when the colour is only a sliver of the artwork', () => {
    const sliver = Math.floor(100 * CONFIG.logo.accent.minShare) - 1
    expect(accentOf(pixels([FOREST, sliver], [BLACK, 100 - sliver]))).toBeNull()
  })

  it('offers nothing when nothing is visible', () => {
    expect(accentOf(pixels([CLEAR, 10]))).toBeNull()
  })
})
