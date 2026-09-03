import { describe, expect, it } from 'vitest'
import { typingOffsets } from '@/lib/brief/typing'

const STEADY = { msPerChar: 16, pauseAfterCommaMs: 120, pauseAfterStopMs: 240, jitterMs: 0 }

describe('typingOffsets', () => {
  it('gives every character its moment, in order', () => {
    expect(typingOffsets('abc', STEADY)).toEqual([16, 32, 48])
    expect(typingOffsets('', STEADY)).toEqual([])
  })

  it('breathes after a comma and longer after a full stop', () => {
    expect(typingOffsets('a,b', STEADY)).toEqual([16, 32, 168])
    expect(typingOffsets('a.b', STEADY)).toEqual([16, 32, 288])
  })

  it('wobbles the same way every time and never by more than the jitter', () => {
    const timings = { ...STEADY, jitterMs: 4 }
    const once = typingOffsets('The quick brown fox.', timings)
    expect(typingOffsets('The quick brown fox.', timings)).toEqual(once)
    const steps = once.map((at, index) => at - (once[index - 1] ?? 0))
    for (const step of steps) {
      expect(step).toBeGreaterThanOrEqual(STEADY.msPerChar - 4)
      expect(step).toBeLessThanOrEqual(STEADY.msPerChar + 4)
    }
    expect(new Set(steps).size).toBeGreaterThan(1)
  })
})
