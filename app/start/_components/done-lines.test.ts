import { describe, expect, it } from 'vitest'
import { SLOT_LINES } from '@/app/start/_components/done-lines'

describe('SLOT_LINES', () => {
  it('keeps the time-up line short, asks the visitor to keep the page under it, and promises no email', () => {
    expect(SLOT_LINES.timeUp.split(' ').length).toBeLessThanOrEqual(4)
    expect(SLOT_LINES.timeUpKeep).toContain('Keep this page open')
    expect(SLOT_LINES.timeUp).not.toMatch(/email/i)
    expect(SLOT_LINES.timeUpKeep).not.toMatch(/email/i)
  })
})
