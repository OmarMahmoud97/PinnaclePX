import { describe, expect, it } from 'vitest'
import { calLinkFrom } from '@/lib/booking/cal-link'
import { AppError } from '@/lib/errors'
import { SITE } from '@/lib/site'

describe('calLinkFrom', () => {
  it('reads the studio’s booking page as the embed’s link', () => {
    expect(calLinkFrom(SITE.bookingUrl)).toBe('pinnaclepx/quick-chat')
  })

  it('drops a trailing slash, and the query and fragment with it', () => {
    expect(calLinkFrom('https://cal.com/pinnaclepx/quick-chat/')).toBe('pinnaclepx/quick-chat')
    expect(calLinkFrom('https://cal.com/pinnaclepx/quick-chat?month=2026-10#top')).toBe(
      'pinnaclepx/quick-chat',
    )
  })

  it('takes a page on Cal.com’s app host too', () => {
    expect(calLinkFrom('https://app.cal.com/pinnaclepx/quick-chat')).toBe('pinnaclepx/quick-chat')
  })

  it('refuses a page anywhere else, or no page at all', () => {
    expect(() => calLinkFrom('https://example.com/pinnaclepx/quick-chat')).toThrow(AppError)
    expect(() => calLinkFrom('https://cal.com.example.com/pinnaclepx')).toThrow(AppError)
    expect(() => calLinkFrom('https://cal.com/')).toThrow(AppError)
    expect(() => calLinkFrom('cal.com/pinnaclepx/quick-chat')).toThrow(AppError)
  })
})
