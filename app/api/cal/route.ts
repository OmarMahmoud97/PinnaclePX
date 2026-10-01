import { type CalBooking, parseCalEvent, signatureMatches, uidDigest } from '@/lib/cal/webhook'
import { CONFIG } from '@/lib/config'
import {
  addUnmatchedCall,
  cancelCalBooking,
  deleteUnmatchedCallsBefore,
  leadExists,
  recordCalBooking,
} from '@/lib/db/calls'
import { env } from '@/lib/env'
import { identityHashFrom } from '@/lib/identity/hmac'
import { log } from '@/lib/log'

// Where Cal.com reports a booking, a reschedule or a cancellation (ADR 0047), so the desk at
// /admin shows a call the moment the person books it. It lives outside /admin on purpose: the
// proxy answers everything under /admin with a password challenge, which Cal.com cannot meet, so
// a delivery there would never arrive. The door here is the signature instead: Cal.com signs
// every delivery with the secret set on its webhook, and only a body that carries that signature
// is read. Without CAL_WEBHOOK_SECRET the route answers not found and reads nothing, so a
// deployment with no webhook has no open endpoint, and bookings are marked by hand on /admin.
//
// Cal.com delivers each event once and never retries a failure, so every refusal is final: a
// booking refused here reaches the owner only through Cal.com's own email, and is marked by hand.
// A delivery can arrive late or twice, with no delivery id to tell it apart, so each write decides
// in its own statement whether it still applies (lib/db/calls.ts). Nothing the person wrote (their
// phone, their notes, their answers) is kept, and no answer and no log line carries the address,
// the booking's uid, the body or the identity it resolved to.
export async function POST(request: Request): Promise<Response> {
  const secret = env.CAL_WEBHOOK_SECRET
  if (secret === undefined) return new Response(null, { status: 404 })
  const raw = await request.text()
  if (Buffer.byteLength(raw) > CONFIG.admin.webhookBodyBytes) return refused(413, 'size')
  if (!signatureMatches(raw, request.headers.get('x-cal-signature-256'), secret)) {
    return refused(401, 'signature')
  }
  const event = parseCalEvent(jsonOf(raw))
  if (event === null) return refused(400, 'shape')
  if (event.kind === 'ignored') return Response.json({ ignored: true, reason: event.reason })
  try {
    return Response.json({ matched: await record(event.booking) })
  } catch (error) {
    log.error('cal.failed', { reason: error instanceof Error ? error.name : 'unknown' })
    return new Response(null, { status: 500 })
  }
}

// A refusal is counted with its reason and answers with the status alone, so a probe learns no
// more than that.
function refused(status: number, reason: 'size' | 'signature' | 'shape'): Response {
  log.warn('cal.refused', { reason })
  return new Response(null, { status })
}

// The body as JSON, or undefined, which JSON cannot carry, when it is not JSON at all.
function jsonOf(raw: string): unknown {
  try {
    return JSON.parse(raw)
  } catch {
    return undefined
  }
}

// Files the booking with the person it belongs to, and says whether there was one.
async function record(booking: CalBooking): Promise<boolean> {
  const identity = identityHashFrom(booking.email, env.HMAC_SECRET)
  // Unmatched calls that have run their course go first, so what the desk lists is only ever
  // calls still to come.
  await deleteUnmatchedCallsBefore(new Date(Date.now() - CONFIG.call.minutes * 60_000))
  if (!(await leadExists(identity))) {
    // A booking by someone who never sent a brief: its start is kept, so the desk can say a
    // booking arrived. A cancellation of one leaves nothing worth keeping.
    if (booking.trigger !== 'cancelled') {
      await addUnmatchedCall(booking.startsAt)
      log.info('cal.unmatched', { trigger: booking.trigger })
    }
    return false
  }
  const uidHash = uidDigest(booking.uid)
  if (booking.trigger === 'cancelled') {
    await cancelCalBooking(identity, uidHash, booking.createdAt)
  } else {
    await recordCalBooking(identity, {
      uidHash,
      startsAt: booking.startsAt,
      endsAt: booking.endsAt,
      createdAt: booking.createdAt,
    })
  }
  log.info('cal.booked', { trigger: booking.trigger })
  return true
}
