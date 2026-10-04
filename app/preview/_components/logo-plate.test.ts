import { logoPlate } from '@/app/preview/_components/logo-plate'
import { deriveTokens } from '@/lib/tokens/derive'
import { schemeFor } from '@/lib/tokens/scheme'

const BRAND = '#2f6f4e'

describe('logoPlate', () => {
  it("sets dark artwork on the dark look on the light scheme's surface", () => {
    const scheme = schemeFor('dark', 'dark-artwork')
    expect(scheme).toBe('dark')
    expect(logoPlate('dark-artwork', scheme, BRAND)).toBe(deriveTokens(BRAND, 'light', []).surface)
  })

  it("would set light artwork on a light page on the dark scheme's surface", () => {
    expect(logoPlate('light-artwork', 'light', BRAND)).toBe(deriveTokens(BRAND, 'dark', []).surface)
  })

  it('gives no plate where the page suits the artwork, nor to mixed artwork', () => {
    for (const style of ['warm', 'minimal', 'bold'] as const) {
      for (const polarity of ['dark-artwork', 'light-artwork'] as const) {
        expect(logoPlate(polarity, schemeFor(style, polarity), BRAND)).toBeUndefined()
      }
    }
    expect(logoPlate('mixed', 'light', BRAND)).toBeUndefined()
    expect(logoPlate('mixed', 'dark', BRAND)).toBeUndefined()
  })
})
