import { describe, expect, it } from 'vitest'
import { brandHexFrom, initialsFrom, tabLabelFrom, tintsFrom } from '@/lib/brief/sketch'

describe('initialsFrom', () => {
  it('takes the first letter of the first two words', () => {
    expect(initialsFrom('Ashgrove Physio Clinic')).toBe('AP')
  })

  it('handles one word and empty input', () => {
    expect(initialsFrom('mvmnt')).toBe('M')
    expect(initialsFrom('')).toBe('')
  })
})

describe('tabLabelFrom', () => {
  it('lowercases and hyphenates', () => {
    expect(tabLabelFrom('Go Wild Dog Walking')).toBe('go-wild-dog-walking')
  })

  it('strips punctuation and trims stray hyphens', () => {
    expect(tabLabelFrom("  Sam's Café & Bar! ")).toBe('sam-s-caf-bar')
  })

  it('falls back before a company name exists', () => {
    expect(tabLabelFrom('')).toBe('your-company')
  })
})

describe('brandHexFrom', () => {
  it('resolves a palette to its hex', () => {
    expect(brandHexFrom({ kind: 'palette', paletteId: 'forest' })).toBe('#2f6f4e')
  })

  it('expands a short custom hex', () => {
    expect(brandHexFrom({ kind: 'custom', hex: '#ABC' })).toBe('#aabbcc')
  })

  it('is null while a custom hex is still being typed', () => {
    expect(brandHexFrom({ kind: 'custom', hex: '#12' })).toBeNull()
  })
})

describe('tintsFrom', () => {
  it('stays grey before a colour is chosen', () => {
    const tints = tintsFrom(null, 'light')
    expect(tints.strong).toContain('var(--')
    expect(tints.glow).toBe('transparent')
  })

  it('keeps the hue and clamps the strong tint dark enough for white text', () => {
    const tints = tintsFrom('#ffff00', 'light')
    expect(tints.strong).toContain('#ffff00')
    expect(tints.strong).toContain('clamp(0.32, l, 0.52)')
    expect(tints.soft).toContain('oklch(from #ffff00')
  })

  it('lifts the strong tint on a dark page so dark text sits on it', () => {
    const tints = tintsFrom('#1e3a8a', 'dark')
    expect(tints.strong).toContain('clamp(0.68, l, 0.8)')
    expect(tints.onStrong).toBe('var(--scrim)')
  })
})
