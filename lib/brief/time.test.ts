import { describe, expect, it } from 'vitest'
import { formatCountdown } from '@/lib/brief/time'

describe('formatCountdown', () => {
  it('shows the full budget at the start', () => {
    expect(formatCountdown(300_000)).toBe('5:00')
  })

  it('rounds part seconds up so the clock never skips ahead', () => {
    expect(formatCountdown(299_001)).toBe('5:00')
    expect(formatCountdown(298_500)).toBe('4:59')
  })

  it('pads the seconds', () => {
    expect(formatCountdown(65_000)).toBe('1:05')
  })

  it('stops at zero', () => {
    expect(formatCountdown(0)).toBe('0:00')
    expect(formatCountdown(-5_000)).toBe('0:00')
  })
})
