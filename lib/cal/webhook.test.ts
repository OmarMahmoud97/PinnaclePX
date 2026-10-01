import { createHmac } from 'node:crypto'
import { parseCalEvent, signatureMatches, uidDigest } from '@/lib/cal/webhook'

const SECRET = 'the-secret-set-on-the-webhook-at-cal-com'
const UID = 'qQ8hPDyu7HKzjP5PbQ6WtJ'
const EMAIL = 'Dana@Example.com'
const PHONE = '+447700900123'
const NOTE = 'A note the person left'

const sign = (body: string, secret = SECRET) =>
  createHmac('sha256', secret).update(body).digest('hex')

// A delivery as Cal.com sends it, with the fields that must never leave the parser: the person's
// phone and notes, their answers to the booking form, and the meeting's metadata.
const DELIVERY = {
  triggerEvent: 'BOOKING_CREATED',
  createdAt: '2026-10-02T09:15:30.123Z',
  payload: {
    bookerUrl: 'https://cal.com',
    type: 'Quick chat',
    title: 'Quick chat between PinnaclePX and Dana Field',
    description: NOTE,
    additionalNotes: NOTE,
    customInputs: {},
    startTime: '2026-10-06T10:00:00Z',
    endTime: '2026-10-06T10:20:00Z',
    organizer: {
      id: 1,
      name: 'Omar',
      email: 'owner@example.com',
      username: 'pinnaclepx',
      timeZone: 'Europe/London',
      language: { locale: 'en' },
      timeFormat: 'h:mma',
      utcOffset: 60,
    },
    responses: {
      name: { label: 'your_name', value: 'Dana Field', isHidden: false },
      email: { label: 'email_address', value: EMAIL, isHidden: false },
      attendeePhoneNumber: { label: 'phone_number', value: PHONE, isHidden: false },
      notes: { label: 'additional_notes', value: NOTE, isHidden: false },
      guests: { label: 'additional_guests', value: [], isHidden: false },
      location: {
        label: 'location',
        value: { optionValue: '', value: 'integrations:daily' },
        isHidden: false,
      },
    },
    userFieldsResponses: {},
    attendees: [
      {
        email: EMAIL,
        name: 'Dana Field',
        firstName: '',
        lastName: '',
        timeZone: 'Europe/London',
        language: { locale: 'en' },
        utcOffset: 60,
        phoneNumber: PHONE,
      },
    ],
    location: 'integrations:daily',
    destinationCalendar: null,
    hideCalendarNotes: false,
    requiresConfirmation: false,
    eventTypeId: 12345,
    seatsShowAttendees: true,
    seatsPerTimeSlot: null,
    seatsShowAvailabilityCount: true,
    schedulingType: null,
    iCalUID: `${UID}@cal.com`,
    iCalSequence: 0,
    uid: UID,
    conferenceCredentialId: null,
    videoCallData: {
      type: 'daily_video',
      id: 'abc',
      password: 'xyz',
      url: 'https://meetco.daily.co/abc',
    },
    appsStatus: [],
    eventTitle: 'Quick chat',
    eventDescription: null,
    price: 0,
    currency: 'gbp',
    length: 20,
    bookingId: 67890,
    metadata: { videoCallUrl: 'https://meetco.daily.co/abc' },
    status: 'ACCEPTED',
  },
}

const BOOKING = {
  trigger: 'created',
  createdAt: new Date('2026-10-02T09:15:30.123Z'),
  uid: UID,
  startsAt: new Date('2026-10-06T10:00:00Z'),
  endsAt: new Date('2026-10-06T10:20:00Z'),
  email: EMAIL,
}

// The delivery with its event renamed and its payload changed, as JSON hands it over: a key set
// to undefined here is a key the body does not have.
function withEvent(
  trigger: string,
  payload: Record<string, unknown> = {},
): Record<string, unknown> {
  const body = { ...DELIVERY, triggerEvent: trigger, payload: { ...DELIVERY.payload, ...payload } }
  return JSON.parse(JSON.stringify(body)) as Record<string, unknown>
}

describe('signatureMatches', () => {
  const body = JSON.stringify(DELIVERY)

  it('accepts the hex HMAC-SHA256 of the exact body under the secret', () => {
    expect(signatureMatches(body, sign(body), SECRET)).toBe(true)
  })

  it('refuses a signature made with another secret', () => {
    expect(signatureMatches(body, sign(body, 'some-other-secret-cal-com-never-had'), SECRET)).toBe(
      false,
    )
  })

  it('refuses a missing header, an empty one, and the one Cal.com sends without a secret', () => {
    expect(signatureMatches(body, null, SECRET)).toBe(false)
    expect(signatureMatches(body, '', SECRET)).toBe(false)
    expect(signatureMatches(body, 'no-secret-provided', SECRET)).toBe(false)
  })

  it('refuses a body altered after it was signed, by so much as a space', () => {
    expect(signatureMatches(`${body} `, sign(body), SECRET)).toBe(false)
    expect(signatureMatches(body.replace(EMAIL, 'other@example.com'), sign(body), SECRET)).toBe(
      false,
    )
  })

  it('refuses a header of the wrong length the same way as a wrong one', () => {
    const header = sign(body)
    expect(signatureMatches(body, header.slice(0, 10), SECRET)).toBe(false)
    expect(signatureMatches(body, `${header}ab`, SECRET)).toBe(false)
    expect(signatureMatches(body, 'z'.repeat(header.length), SECRET)).toBe(false)
  })
})

describe('parseCalEvent', () => {
  it('keeps the six facts of a created booking and drops everything else', () => {
    const event = parseCalEvent(withEvent('BOOKING_CREATED'))
    expect(event).toEqual({ kind: 'booking', booking: BOOKING })
    if (event?.kind !== 'booking') throw new Error('not a booking')
    expect(Object.keys(event.booking).sort()).toEqual([
      'createdAt',
      'email',
      'endsAt',
      'startsAt',
      'trigger',
      'uid',
    ])
    const kept = JSON.stringify(event)
    for (const dropped of [PHONE, NOTE, 'Dana Field', 'daily.co', 'owner@example.com']) {
      expect(kept).not.toContain(dropped)
    }
  })

  it('reads a reschedule as a booking too', () => {
    expect(parseCalEvent(withEvent('BOOKING_RESCHEDULED'))).toEqual({
      kind: 'booking',
      booking: { ...BOOKING, trigger: 'rescheduled' },
    })
  })

  it('reads a cancellation as a booking whatever its status says', () => {
    expect(parseCalEvent(withEvent('BOOKING_CANCELLED', { status: 'CANCELLED' }))).toEqual({
      kind: 'booking',
      booking: { ...BOOKING, trigger: 'cancelled' },
    })
    expect(parseCalEvent(withEvent('BOOKING_CANCELLED', { status: 'REJECTED' }))?.kind).toBe(
      'booking',
    )
  })

  it('takes a created or rescheduled booking with no status as accepted', () => {
    expect(parseCalEvent(withEvent('BOOKING_CREATED', { status: undefined }))?.kind).toBe('booking')
    expect(parseCalEvent(withEvent('BOOKING_RESCHEDULED', { status: undefined }))?.kind).toBe(
      'booking',
    )
  })

  it('ignores every event outside the three, by name alone', () => {
    const ignored = { kind: 'ignored', reason: 'trigger' }
    expect(parseCalEvent(withEvent('BOOKING_REQUESTED'))).toEqual(ignored)
    expect(parseCalEvent(withEvent('BOOKING_PAID'))).toEqual(ignored)
    expect(parseCalEvent(withEvent('FORM_SUBMITTED'))).toEqual(ignored)
    // A meeting event is flat, with no payload at all.
    expect(
      parseCalEvent({ triggerEvent: 'MEETING_ENDED', createdAt: DELIVERY.createdAt, uid: UID }),
    ).toEqual(ignored)
  })

  it('ignores a created or rescheduled booking that is not accepted', () => {
    const ignored = { kind: 'ignored', reason: 'status' }
    expect(parseCalEvent(withEvent('BOOKING_CREATED', { status: 'PENDING' }))).toEqual(ignored)
    expect(parseCalEvent(withEvent('BOOKING_RESCHEDULED', { status: 'REJECTED' }))).toEqual(ignored)
    expect(parseCalEvent(withEvent('BOOKING_CREATED', { status: 'AWAITING_HOST' }))).toEqual(
      ignored,
    )
  })

  it('refuses a body that is not an object, or names no event', () => {
    expect(parseCalEvent(null)).toBeNull()
    expect(parseCalEvent(undefined)).toBeNull()
    expect(parseCalEvent('BOOKING_CREATED')).toBeNull()
    expect(parseCalEvent(42)).toBeNull()
    expect(parseCalEvent([])).toBeNull()
    expect(parseCalEvent({})).toBeNull()
    expect(parseCalEvent({ triggerEvent: 7, payload: DELIVERY.payload })).toBeNull()
  })

  it('refuses a booking event missing any of what the desk keeps', () => {
    expect(
      parseCalEvent({ triggerEvent: 'BOOKING_CREATED', createdAt: DELIVERY.createdAt }),
    ).toBeNull()
    expect(parseCalEvent({ ...withEvent('BOOKING_CREATED'), createdAt: undefined })).toBeNull()
    expect(parseCalEvent(withEvent('BOOKING_CREATED', { uid: undefined }))).toBeNull()
    expect(parseCalEvent(withEvent('BOOKING_CREATED', { uid: '' }))).toBeNull()
    expect(parseCalEvent(withEvent('BOOKING_CREATED', { startTime: undefined }))).toBeNull()
    expect(parseCalEvent(withEvent('BOOKING_CANCELLED', { endTime: undefined }))).toBeNull()
    expect(parseCalEvent(withEvent('BOOKING_CREATED', { attendees: undefined }))).toBeNull()
    expect(parseCalEvent(withEvent('BOOKING_CREATED', { attendees: [] }))).toBeNull()
    expect(
      parseCalEvent(withEvent('BOOKING_CREATED', { attendees: [{ name: 'Dana' }] })),
    ).toBeNull()
    expect(
      parseCalEvent(withEvent('BOOKING_CREATED', { attendees: [{ email: 'not an address' }] })),
    ).toBeNull()
  })

  it('refuses a date it cannot read', () => {
    expect(parseCalEvent({ ...withEvent('BOOKING_CREATED'), createdAt: 'yesterday' })).toBeNull()
    expect(parseCalEvent({ ...withEvent('BOOKING_CREATED'), createdAt: 1759396530123 })).toBeNull()
    expect(parseCalEvent(withEvent('BOOKING_CREATED', { startTime: 'soon' }))).toBeNull()
    expect(parseCalEvent(withEvent('BOOKING_RESCHEDULED', { endTime: '' }))).toBeNull()
  })
})

describe('uidDigest', () => {
  it('is the sha256 of the uid in hex, the same every time, and never the uid itself', () => {
    expect(uidDigest('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    )
    expect(uidDigest(UID)).toBe(uidDigest(UID))
    expect(uidDigest(UID)).toMatch(/^[0-9a-f]{64}$/)
    expect(uidDigest(UID)).not.toContain(UID)
    expect(uidDigest(UID)).not.toBe(uidDigest(`${UID}x`))
  })
})
