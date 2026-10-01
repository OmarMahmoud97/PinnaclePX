import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import * as z from 'zod'

// What Cal.com tells the site about a booking (app/api/cal/route.ts, ADR 0047), cut down to the
// facts the desk keeps. Pure: the route reads the env and writes the rows.

// The header Cal.com sends while its webhook has no secret, which is never a signature.
const NO_SECRET = 'no-secret-provided'

const digest = (text: string) => createHash('sha256').update(text).digest()

// Whether the header is the hex HMAC-SHA256 of the raw body under the secret. Cal.com signs the
// bytes it sends, so the body is checked before anything parses it. The two hex strings are
// compared as digests of one length, in the same time whatever they hold, so a header of the
// wrong length fails the way a wrong one does (as lib/admin/basic-auth.ts compares a password).
export function signatureMatches(rawBody: string, header: string | null, secret: string): boolean {
  if (header === null || header === '' || header === NO_SECRET) return false
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  return timingSafeEqual(digest(header), digest(expected))
}

type Trigger = 'created' | 'rescheduled' | 'cancelled'

// The three events that change a booking, by Cal.com's name for each. Everything else it can
// send (a booking awaiting confirmation, a form response, a meeting's start and end, a payment)
// is ignored.
const TRIGGERS: ReadonlyMap<string, Trigger> = new Map<string, Trigger>([
  ['BOOKING_CREATED', 'created'],
  ['BOOKING_RESCHEDULED', 'rescheduled'],
  ['BOOKING_CANCELLED', 'cancelled'],
])

export type CalBooking = Readonly<{
  trigger: Trigger
  // When Cal.com sent the event: what orders the events of one booking against each other and
  // against the owner's own marks (lib/db/calls.ts).
  createdAt: Date
  uid: string
  startsAt: Date
  endsAt: Date
  email: string
}>

export type CalEvent =
  | Readonly<{ kind: 'booking'; booking: CalBooking }>
  | Readonly<{ kind: 'ignored'; reason: 'trigger' | 'status' }>

// A moment as Cal.com writes it, an ISO string; anything a Date cannot read fails.
const moment = z.string().pipe(z.coerce.date())

// The event's name alone, read first: an event with no payload (MEETING_STARTED and its kin are
// flat) is then ignored by name rather than refused for its shape.
const envelope = z.object({ triggerEvent: z.string() })

// Exactly what the desk keeps of a booking. zod drops every other key, so the person's phone,
// notes, answers and the meeting's metadata never leave this function.
const bookingBody = z.object({
  createdAt: moment,
  payload: z.object({
    uid: z.string().min(1),
    status: z.string().optional(),
    startTime: moment,
    endTime: moment,
    // The person who booked is the first attendee; any after them are their guests.
    attendees: z.tuple([z.object({ email: z.email() })], z.unknown()),
  }),
})

// Reads a delivery's body. Null for a body without a booking event's shape, which the route
// refuses. Ignored for an event the desk has no use for: a trigger outside the three, or a
// booking created or rescheduled but not accepted (awaiting the host's confirmation, or
// rejected). A cancellation counts whatever its status says, since Cal.com marks the booking
// cancelled in that same event.
export function parseCalEvent(body: unknown): CalEvent | null {
  const head = envelope.safeParse(body)
  if (!head.success) return null
  const trigger = TRIGGERS.get(head.data.triggerEvent)
  if (trigger === undefined) return { kind: 'ignored', reason: 'trigger' }
  const parsed = bookingBody.safeParse(body)
  if (!parsed.success) return null
  const { createdAt, payload } = parsed.data
  if (trigger !== 'cancelled' && payload.status !== undefined && payload.status !== 'ACCEPTED') {
    return { kind: 'ignored', reason: 'status' }
  }
  const [{ email }] = payload.attendees
  return {
    kind: 'booking',
    booking: {
      trigger,
      createdAt,
      uid: payload.uid,
      startsAt: payload.startTime,
      endsAt: payload.endTime,
      email,
    },
  }
}

// The only form a booking's uid is ever kept in: enough for its cancellation to find the booking,
// and nothing that opens the booking on Cal.com.
export function uidDigest(uid: string): string {
  return createHash('sha256').update(uid).digest('hex')
}
