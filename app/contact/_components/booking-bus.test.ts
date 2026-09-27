// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import {
  announceBooked,
  type BookingRequest,
  onBooked,
  onBookingRequest,
  requestBooking,
} from '@/app/contact/_components/booking-bus'

const request = (): BookingRequest => ({
  at: '120px 480px',
  trigger: document.createElement('button'),
})

describe('the booking bus', () => {
  it('refuses a request when no sheet is listening, so the control opens the page', () => {
    expect(requestBooking(request())).toBe(false)
  })

  it('hands a request to the sheet, as it was made', () => {
    const sheet = vi.fn()
    const stop = onBookingRequest(sheet)
    const made = request()
    expect(requestBooking(made)).toBe(true)
    expect(sheet).toHaveBeenCalledExactlyOnceWith(made)
    stop()
  })

  it('stops handing requests to a sheet that has gone', () => {
    const sheet = vi.fn()
    onBookingRequest(sheet)()
    expect(requestBooking(request())).toBe(false)
    expect(sheet).not.toHaveBeenCalled()
  })

  it('tells everyone listening that a call was booked, until they stop', () => {
    const card = vi.fn()
    const other = vi.fn()
    const stopCard = onBooked(card)
    const stopOther = onBooked(other)
    announceBooked()
    expect(card).toHaveBeenCalledOnce()
    expect(other).toHaveBeenCalledOnce()
    stopCard()
    announceBooked()
    expect(card).toHaveBeenCalledOnce()
    expect(other).toHaveBeenCalledTimes(2)
    stopOther()
  })
})
