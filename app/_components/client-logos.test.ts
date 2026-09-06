import { describe, expect, it } from 'vitest'
import { CLIENT_LOGOS, LOGO_ROW_HEIGHT, sizeFor } from '@/app/_components/client-logos'

const ratioOf = (logo: { width: number; height: number }) => logo.width / logo.height

describe('the client logo strip', () => {
  it('has a file for every logo', () => {
    for (const logo of CLIENT_LOGOS) expect(logo.src).toBe(`/logos/${logo.slug}.svg`)
  })

  // The drawn box is whole pixels, so it can sit a rounding step off the file's own shape; the
  // image is fitted inside it and never stretched, and a step this small cannot be seen.
  it('keeps every logo within a rounding step of its own shape', () => {
    for (const logo of CLIENT_LOGOS) {
      const drawn = sizeFor(logo)
      expect(Math.abs(ratioOf(drawn) / ratioOf(logo) - 1)).toBeLessThan(0.02)
    }
  })

  // The point of the sizing rule: a stacked mark is drawn taller than a long wordmark, so the two
  // read as the same size. The hand tweak is set aside here because it is allowed to break the
  // order; the row still reserves the tallest as drawn.
  it('draws a tall mark taller than a wide one, and none taller than the row', () => {
    const sorted = [...CLIENT_LOGOS].sort((a, b) => ratioOf(a) - ratioOf(b))
    const heights = sorted.map((logo) => sizeFor({ ...logo, scale: 1 }).height)
    expect(heights).toEqual([...heights].sort((a, b) => b - a))
    expect(Math.max(...CLIENT_LOGOS.map((logo) => sizeFor(logo).height))).toBe(LOGO_ROW_HEIGHT)
  })

  // A hand tweak is for a nudge, never for hiding a mark or blowing it up.
  it('keeps any hand tweak within a fifth either way', () => {
    for (const logo of CLIENT_LOGOS)
      expect(Math.abs((logo.scale ?? 1) - 1)).toBeLessThanOrEqual(0.2)
  })

  it('never draws a logo wider than the strip can hold', () => {
    for (const logo of CLIENT_LOGOS) expect(sizeFor(logo).width).toBeLessThanOrEqual(168)
  })
})
