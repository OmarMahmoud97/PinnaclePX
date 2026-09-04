import { limitKey, windowKey } from '@/lib/rate-limit/window'

describe('windowKey', () => {
  it('is the same inside one window and changes at its edge', () => {
    const hour = 3600
    const start = new Date('2026-09-04T10:00:00Z')
    expect(windowKey(start, hour)).toBe(windowKey(new Date('2026-09-04T10:59:59Z'), hour))
    expect(windowKey(start, hour)).not.toBe(windowKey(new Date('2026-09-04T11:00:00Z'), hour))
    expect(windowKey(start, hour)).toBe(String(Math.floor(start.getTime() / 1000)))
  })
})

describe('limitKey', () => {
  it('joins the scope and the subject', () => {
    expect(limitKey('submit-ip', '203.0.113.7')).toBe('submit-ip:203.0.113.7')
  })
})
