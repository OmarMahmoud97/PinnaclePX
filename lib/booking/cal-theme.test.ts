import { describe, expect, it } from 'vitest'
import { calThemeFrom } from '@/lib/booking/cal-theme'

// The table the calendar is themed by, written out here so a change to it is a change to this
// test too.
const EXPECTED = {
  'cal-border-booker': '--surface',
  'cal-brand': '--brand-deeper',
  'cal-brand-emphasis': '--brand-deepest',
  'cal-brand-text': '--on-brand',
  'cal-text': '--on-surface',
  'cal-text-emphasis': '--on-surface',
  'cal-text-subtle': '--on-surface-muted',
  'cal-text-muted': '--on-surface-muted',
  'cal-bg': '--surface',
  'cal-bg-muted': '--surface-wash',
  'cal-bg-subtle': '--surface-wash',
  'cal-bg-emphasis': '--surface-wash-deep',
  'cal-border-emphasis': '--surface-wash-deep',
  'cal-border': '--border',
  'cal-border-subtle': '--border',
}

describe('calThemeFrom', () => {
  it('gives each of the calendar’s colours its token, and invents none', () => {
    // A read that answers with the token's own name shows which token each colour came from.
    expect(calThemeFrom((token) => token)).toEqual(EXPECTED)
  })

  it('passes on what the page reads, trimmed', () => {
    const theme = calThemeFrom((token) => (token === '--brand-deeper' ? '  rgb(3 105 161)\n' : 'x'))
    expect(theme['cal-brand']).toBe('rgb(3 105 161)')
  })

  it('leaves a colour to Cal.com when its token reads empty', () => {
    const theme = calThemeFrom((token) => (token === '--border' ? '  ' : token))
    expect(theme).not.toHaveProperty('cal-border')
    expect(theme).not.toHaveProperty('cal-border-subtle')
    expect(Object.keys(theme)).toHaveLength(Object.keys(EXPECTED).length - 2)
    expect(calThemeFrom(() => '')).toEqual({})
  })
})
