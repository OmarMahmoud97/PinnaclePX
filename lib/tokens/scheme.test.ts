import { tokenStyle } from '@/lib/tokens/css'
import { deriveTokens } from '@/lib/tokens/derive'
import { schemeFor } from '@/lib/tokens/scheme'

describe('schemeFor', () => {
  it('follows the dark style whatever the logo', () => {
    expect(schemeFor('dark', 'dark-artwork')).toBe('dark')
    expect(schemeFor('dark', 'mixed')).toBe('dark')
  })

  it('puts light artwork on a dark surface and everything else on a light one', () => {
    expect(schemeFor('minimal', 'light-artwork')).toBe('dark')
    expect(schemeFor('warm', 'dark-artwork')).toBe('light')
    expect(schemeFor('bold', 'mixed')).toBe('light')
  })
})

describe('tokenStyle', () => {
  it('writes one CSS variable per token', () => {
    const style = tokenStyle(deriveTokens('#2f6f4e', 'light', []))
    expect(Object.keys(style)).toHaveLength(14)
    expect(style).toHaveProperty('--surface')
    expect(style).toHaveProperty('--on-scrim')
  })
})
