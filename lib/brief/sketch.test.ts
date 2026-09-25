import { describe, expect, it } from 'vitest'
import { brandHexFrom, builtTintsFrom, tabLabelFrom, tintsFrom } from '@/lib/brief/sketch'
import { CONFIG } from '@/lib/config'

describe('tabLabelFrom', () => {
  it('lowercases and hyphenates', () => {
    expect(tabLabelFrom('Go Wild Dog Walking')).toBe('go-wild-dog-walking')
  })

  it('drops accents and apostrophes, strips punctuation and trims stray hyphens', () => {
    expect(tabLabelFrom("  Sam's Café & Bar! ")).toBe('sams-cafe-bar')
    expect(tabLabelFrom('Crème Brûlée Co.')).toBe('creme-brulee-co')
  })

  it('keeps letters and digits of any script', () => {
    expect(tabLabelFrom('Кафе Пушкин 24')).toBe('кафе-пушкин-24')
  })

  it('cuts a long name with an ellipsis, never past the limit', () => {
    const label = tabLabelFrom('Ashgrove Physiotherapy and Sports Injury Clinic')
    expect(label).toBe('ashgrove-physiotherapy-and…')
    expect(Array.from(label)).toHaveLength(CONFIG.start.names.slugMax - 1)
    expect(Array.from(tabLabelFrom('a'.repeat(80)))).toHaveLength(CONFIG.start.names.slugMax)
  })

  it('falls back before a company name exists', () => {
    expect(tabLabelFrom('')).toBe('your-company')
    expect(tabLabelFrom('&&&')).toBe('your-company')
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

describe('builtTintsFrom', () => {
  it('derives every colour of the finished page from the one hex', () => {
    const tints = builtTintsFrom('#2e8c9c')
    for (const tint of Object.values(tints)) expect(tint).toContain('oklch(from #2e8c9c')
  })

  it('turns the hue for the warm accent and keeps it everywhere else', () => {
    const tints = builtTintsFrom('#2e8c9c')
    expect(tints.accent).toContain('calc(h + 180)')
    expect(tints.ink.endsWith(' h)')).toBe(true)
    expect(tints.bg.endsWith(' h)')).toBe(true)
  })
})
