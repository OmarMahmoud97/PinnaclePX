import { describe, expect, it } from 'vitest'
import { toSixDigitHex } from '@/lib/brief/hex'

describe('toSixDigitHex', () => {
  it('keeps a six-digit code, lowercased', () => {
    expect(toSixDigitHex('#2F6F4E')).toBe('#2f6f4e')
  })

  it('expands a three-digit code', () => {
    expect(toSixDigitHex('#abc')).toBe('#aabbcc')
  })

  it('ignores surrounding whitespace', () => {
    expect(toSixDigitHex('  #abc  ')).toBe('#aabbcc')
  })

  it.each(['abc', '#12345', '#gggggg', '', '#'])('returns null for %j', (value) => {
    expect(toSixDigitHex(value)).toBeNull()
  })
})
