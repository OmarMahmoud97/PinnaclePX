import { createHmac } from 'node:crypto'
import { POST } from '@/app/api/cal/route'
import { uidDigest } from '@/lib/cal/webhook'
import { CONFIG } from '@/lib/config'
import {
  addUnmatchedCall,
  cancelCalBooking,
  deleteUnmatchedCallsBefore,
  leadExists,
  recordCalBooking,
} from '@/lib/db/calls'
import { identityHashFrom } from '@/lib/identity/hmac'

type Line = { level: string; event: string; fields: Record<string, unknown> | undefined }

const state = vi.hoisted(() => ({
  secret: undefined as string | undefined,
  hmac: 'an-hmac-secret-of-at-least-thirty-two-characters',
  logged: [] as Line[],
}))

vi.mock('server-only', () => ({}))

vi.mock('@/lib/env', () => ({
  get env() {
    return { CAL_WEBHOOK_SECRET: state.secret, HMAC_SECRET: state.hmac }
  },
}))

vi.mock('@/lib/log', () => {
  const at = (level: string) => (event: string, fields?: Record<string, unknown>) => {
    state.logged.push({ level, event, fields })
  }
  return { log: { info: at('info'), warn: at('warn'), error: at('error') } }
})

vi.mock('@/lib/db/calls', () => ({
  leadExists: vi.fn(),
  recordCalBooking: vi.fn(),
  cancelCalBooking: vi.fn(),
  addUnmatchedCall: vi.fn(),
  deleteUnmatchedCallsBefore: vi.fn(),
}))

const SECRET = 'the-secret-set-on-the-webhook-at-cal-com'
const UID = 'qQ8hPDyu7HKzjP5PbQ6WtJ'
const EMAIL = 'Dana@Example.com'
const PHONE = '+447700900123'
const NOTE = 'A note the person left'
const NOW = new Date('2026-10-02T09:16:00.000Z')
const SENT_AT = new Date('2026-10-02T09:15:30.123Z')
const STARTS_AT = new Date('2026-10-06T10:00:00Z')
const ENDS_AT = new Date('2026-10-06T10:20:00Z')
const IDENTITY = identityHashFrom(EMAIL, state.hmac)

// A delivery as Cal.com sends it, with the fields the route must never keep or repeat.
function delivery(trigger: string, payload: Record<string, unknown> = {}): string {
  return JSON.stringify({
    triggerEvent: trigger,
    createdAt: SENT_AT.toISOString(),
    payload: {
      uid: UID,
      status: trigger === 'BOOKING_CANCELLED' ? 'CANCELLED' : 'ACCEPTED',
      startTime: '2026-10-06T10:00:00Z',
      endTime: '2026-10-06T10:20:00Z',
      attendees: [
        { email: EMAIL, name: 'Dana Field', timeZone: 'Europe/London', phoneNumber: PHONE },
      ],
      responses: { notes: { label: 'additional_notes', value: NOTE } },
      metadata: { videoCallUrl: 'https://meetco.daily.co/abc' },
      ...payload,
    },
  })
}

const sign = (body: string, secret = SECRET) =>
  createHmac('sha256', secret).update(body).digest('hex')

// A POST as Cal.com makes it: signed with the secret unless a header is given, with none when
// the header is null.
function deliver(body: string, signature: string | null = sign(body)): Promise<Response> {
  const headers = new Headers({ 'content-type': 'application/json' })
  if (signature !== null) headers.set('x-cal-signature-256', signature)
  return POST(new Request('http://localhost/api/cal', { method: 'POST', headers, body }))
}

const reasons = () => state.logged.map((line) => line.fields?.reason)

beforeEach(() => {
  state.secret = SECRET
  state.logged = []
  vi.mocked(leadExists).mockReset().mockResolvedValue(true)
  vi.mocked(recordCalBooking).mockReset().mockResolvedValue(undefined)
  vi.mocked(cancelCalBooking).mockReset().mockResolvedValue(true)
  vi.mocked(addUnmatchedCall).mockReset().mockResolvedValue(undefined)
  vi.mocked(deleteUnmatchedCallsBefore).mockReset().mockResolvedValue(0)
  vi.setSystemTime(NOW)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('POST /api/cal', () => {
  it('does not exist while the webhook secret is unset, whatever arrives', async () => {
    state.secret = undefined
    const response = await deliver(delivery('BOOKING_CREATED'))
    expect(response.status).toBe(404)
    expect(await response.text()).toBe('')
    expect(leadExists).not.toHaveBeenCalled()
    expect(deleteUnmatchedCallsBefore).not.toHaveBeenCalled()
    expect(state.logged).toEqual([])
  })

  it('refuses a body over the limit before looking at its signature', async () => {
    const response = await deliver('x'.repeat(CONFIG.admin.webhookBodyBytes + 1), null)
    expect(response.status).toBe(413)
    expect(await response.text()).toBe('')
    expect(state.logged).toEqual([
      { level: 'warn', event: 'cal.refused', fields: { reason: 'size' } },
    ])
  })

  it('refuses a delivery whose signature is missing, is the no-secret marker, was made with another secret, or signs another body', async () => {
    const body = delivery('BOOKING_CREATED')
    expect((await deliver(body, null)).status).toBe(401)
    expect((await deliver(body, 'no-secret-provided')).status).toBe(401)
    expect((await deliver(body, sign(body, 'another-secret-entirely'))).status).toBe(401)
    expect((await deliver(body, sign(`${body} `))).status).toBe(401)
    expect(reasons()).toEqual(['signature', 'signature', 'signature', 'signature'])
    expect(leadExists).not.toHaveBeenCalled()
    expect(recordCalBooking).not.toHaveBeenCalled()
  })

  it('refuses a signed body that is not JSON, or not a booking event', async () => {
    expect((await deliver('not json')).status).toBe(400)
    expect((await deliver(JSON.stringify({ triggerEvent: 'BOOKING_CREATED' }))).status).toBe(400)
    expect((await deliver(delivery('BOOKING_CREATED', { attendees: [] }))).status).toBe(400)
    expect((await deliver(delivery('BOOKING_CREATED', { startTime: 'soon' }))).status).toBe(400)
    expect(reasons()).toEqual(['shape', 'shape', 'shape', 'shape'])
    expect(leadExists).not.toHaveBeenCalled()
    expect(recordCalBooking).not.toHaveBeenCalled()
  })

  it('ignores an event outside the three, and an unconfirmed booking, reading and writing nothing', async () => {
    const ended = await deliver(
      JSON.stringify({ triggerEvent: 'MEETING_ENDED', createdAt: SENT_AT.toISOString(), uid: UID }),
    )
    expect(ended.status).toBe(200)
    expect(await ended.json()).toEqual({ ignored: true, reason: 'trigger' })
    const pending = await deliver(delivery('BOOKING_CREATED', { status: 'PENDING' }))
    expect(pending.status).toBe(200)
    expect(await pending.json()).toEqual({ ignored: true, reason: 'status' })
    expect(leadExists).not.toHaveBeenCalled()
    expect(deleteUnmatchedCallsBefore).not.toHaveBeenCalled()
    expect(state.logged).toEqual([])
  })

  it('records a booking against the lead whose address it carries, by the digest of its uid', async () => {
    const response = await deliver(delivery('BOOKING_CREATED'))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ matched: true })
    expect(leadExists).toHaveBeenCalledExactlyOnceWith(IDENTITY)
    expect(recordCalBooking).toHaveBeenCalledExactlyOnceWith(IDENTITY, {
      uidHash: uidDigest(UID),
      startsAt: STARTS_AT,
      endsAt: ENDS_AT,
      createdAt: SENT_AT,
    })
    expect(JSON.stringify(vi.mocked(recordCalBooking).mock.calls)).not.toContain(UID)
    expect(cancelCalBooking).not.toHaveBeenCalled()
    expect(addUnmatchedCall).not.toHaveBeenCalled()
    expect(state.logged).toEqual([
      { level: 'info', event: 'cal.booked', fields: { trigger: 'created' } },
    ])
  })

  it('records a reschedule the same way', async () => {
    const response = await deliver(delivery('BOOKING_RESCHEDULED'))
    expect(await response.json()).toEqual({ matched: true })
    expect(recordCalBooking).toHaveBeenCalledExactlyOnceWith(IDENTITY, {
      uidHash: uidDigest(UID),
      startsAt: STARTS_AT,
      endsAt: ENDS_AT,
      createdAt: SENT_AT,
    })
    expect(state.logged).toEqual([
      { level: 'info', event: 'cal.booked', fields: { trigger: 'rescheduled' } },
    ])
  })

  it('cancels the booking by the digest of its uid', async () => {
    const response = await deliver(delivery('BOOKING_CANCELLED'))
    expect(await response.json()).toEqual({ matched: true })
    expect(cancelCalBooking).toHaveBeenCalledExactlyOnceWith(IDENTITY, uidDigest(UID), SENT_AT)
    expect(JSON.stringify(vi.mocked(cancelCalBooking).mock.calls)).not.toContain(UID)
    expect(recordCalBooking).not.toHaveBeenCalled()
    expect(addUnmatchedCall).not.toHaveBeenCalled()
    expect(state.logged).toEqual([
      { level: 'info', event: 'cal.booked', fields: { trigger: 'cancelled' } },
    ])
  })

  it('sweeps the unmatched calls that have passed before it looks for the lead', async () => {
    await deliver(delivery('BOOKING_CREATED'))
    expect(deleteUnmatchedCallsBefore).toHaveBeenCalledExactlyOnceWith(
      new Date(NOW.getTime() - CONFIG.call.minutes * 60_000),
    )
    const sweep = vi.mocked(deleteUnmatchedCallsBefore).mock.invocationCallOrder[0] ?? Infinity
    const lookup = vi.mocked(leadExists).mock.invocationCallOrder[0] ?? 0
    expect(sweep).toBeLessThan(lookup)
  })

  it('keeps the start of a booking by an address no lead has, and says it matched nothing', async () => {
    vi.mocked(leadExists).mockResolvedValue(false)
    const response = await deliver(delivery('BOOKING_RESCHEDULED'))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ matched: false })
    expect(addUnmatchedCall).toHaveBeenCalledExactlyOnceWith(STARTS_AT)
    expect(recordCalBooking).not.toHaveBeenCalled()
    expect(cancelCalBooking).not.toHaveBeenCalled()
    expect(state.logged).toEqual([
      { level: 'info', event: 'cal.unmatched', fields: { trigger: 'rescheduled' } },
    ])
  })

  it('writes nothing for the cancellation of a booking no lead has', async () => {
    vi.mocked(leadExists).mockResolvedValue(false)
    const response = await deliver(delivery('BOOKING_CANCELLED'))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ matched: false })
    expect(addUnmatchedCall).not.toHaveBeenCalled()
    expect(cancelCalBooking).not.toHaveBeenCalled()
    expect(recordCalBooking).not.toHaveBeenCalled()
  })

  it('answers a failed write with a server error that names only the error', async () => {
    const failure = Object.assign(new Error('connection refused'), { name: 'NeonDbError' })
    vi.mocked(recordCalBooking).mockRejectedValue(failure)
    const response = await deliver(delivery('BOOKING_CREATED'))
    expect(response.status).toBe(500)
    expect(await response.text()).toBe('')
    expect(state.logged).toEqual([
      { level: 'error', event: 'cal.failed', fields: { reason: 'NeonDbError' } },
    ])
    vi.mocked(cancelCalBooking).mockRejectedValue(failure)
    expect((await deliver(delivery('BOOKING_CANCELLED'))).status).toBe(500)
  })

  it('makes the same write twice for two identical deliveries, and leaves the guard to the statement', async () => {
    const body = delivery('BOOKING_CREATED')
    expect(await (await deliver(body)).json()).toEqual({ matched: true })
    expect(await (await deliver(body)).json()).toEqual({ matched: true })
    expect(recordCalBooking).toHaveBeenCalledTimes(2)
    const [first, second] = vi.mocked(recordCalBooking).mock.calls
    expect(second).toEqual(first)
  })

  it('never lets the address, the uid, the body or the identity into a log line or an answer', async () => {
    const answers: string[] = []
    for (const trigger of ['BOOKING_CREATED', 'BOOKING_RESCHEDULED', 'BOOKING_CANCELLED']) {
      answers.push(await (await deliver(delivery(trigger))).text())
    }
    vi.mocked(leadExists).mockResolvedValue(false)
    answers.push(await (await deliver(delivery('BOOKING_CREATED'))).text())
    vi.mocked(leadExists).mockResolvedValue(true)
    vi.mocked(recordCalBooking).mockRejectedValue(new Error(`uid ${UID} for ${EMAIL}`))
    answers.push(await (await deliver(delivery('BOOKING_CREATED'))).text())
    answers.push(await (await deliver(delivery('BOOKING_CREATED', { attendees: [] }))).text())
    answers.push(await (await deliver(delivery('BOOKING_CREATED'), null)).text())
    const everything = JSON.stringify([state.logged, answers])
    for (const kept of [EMAIL, EMAIL.toLowerCase(), UID, IDENTITY, PHONE, NOTE]) {
      expect(everything).not.toContain(kept)
    }
  })
})
