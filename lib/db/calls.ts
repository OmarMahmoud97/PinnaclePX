import 'server-only'
import { eq, isNull, lt, type SQL, sql } from 'drizzle-orm'
import type { PgColumn } from 'drizzle-orm/pg-core'
import { db } from '@/lib/db/client'
import { enquiry, lead, unmatchedCall } from '@/lib/db/schema'

// What Cal.com's webhook writes (app/api/cal/route.ts, ADR 0047). The neon-http driver runs no
// transaction, so each is one statement, and a write that must not undo a later fact carries
// that guard in the statement itself.

export type CalBookingRecord = Readonly<{
  uidHash: string
  startsAt: Date
  endsAt: Date
  // When Cal.com sent the event, which stands in for when the booking was made.
  createdAt: Date
}>

// Whether an address Cal.com reported belongs to a lead, so a booking can be filed with the
// person rather than kept as unmatched.
export async function leadExists(identityHash: string): Promise<boolean> {
  const rows = await db
    .select({ identityHash: lead.identityHash })
    .from(lead)
    .where(eq(lead.identityHash, identityHash))
    .limit(1)
  return rows.length > 0
}

// The database's clock, so updated_at agrees with every other stamp it sets.
const NOW = sql`now()`

// The row the insert proposed, as ON CONFLICT DO UPDATE may read it.
const excluded = (column: PgColumn): SQL => sql`excluded.${sql.identifier(column.name)}`

// Records a booking against the person: their enquiry row is made with it, or the call it holds
// is written over, and their stage, quote and note are left alone. The write applies only while
// the event is newer than what the row records (call_at is null, or older than the event's
// createdAt), so a replayed event or one older than the owner's own mark changes nothing, and
// never for a booking the row already holds as cancelled, so a created event that arrives after
// its own cancellation does not book it again. Both tests read null as "no booking yet" rather
// than as unknown: a row the owner made with a stage alone has no uid and no call_at, and takes
// the booking.
export async function recordCalBooking(
  identityHash: string,
  booking: CalBookingRecord,
): Promise<void> {
  await db
    .insert(enquiry)
    .values({
      identityHash,
      callState: 'booked',
      callSource: 'cal',
      callUidHash: booking.uidHash,
      callStartsAt: booking.startsAt,
      callEndsAt: booking.endsAt,
      callAt: booking.createdAt,
    })
    .onConflictDoUpdate({
      target: enquiry.identityHash,
      set: {
        callState: 'booked',
        callSource: 'cal',
        callUidHash: excluded(enquiry.callUidHash),
        callStartsAt: excluded(enquiry.callStartsAt),
        callEndsAt: excluded(enquiry.callEndsAt),
        callAt: excluded(enquiry.callAt),
        updatedAt: NOW,
      },
      setWhere: sql`(${isNull(enquiry.callAt)} or ${lt(enquiry.callAt, excluded(enquiry.callAt))}) and (${enquiry.callUidHash} is distinct from ${excluded(enquiry.callUidHash)} or ${enquiry.callState} is distinct from ${'cancelled'})`,
    })
}

// Records that Cal.com cancelled the booking the row holds, found by its uid, and only while it
// stands as booked: a mark the owner made since (a no-show, a booking of their own) is theirs to
// keep. True when a row changed.
export async function cancelCalBooking(
  identityHash: string,
  uidHash: string,
  createdAt: Date,
): Promise<boolean> {
  // An upsert, not an update: a cancellation that lands before the booking it cancels (Cal.com's
  // deliveries are separate requests with no order) leaves a cancelled row carrying the uid, so
  // the booking that then arrives late finds its own cancellation and is a no-op.
  const rows = await db
    .insert(enquiry)
    .values({
      identityHash,
      callState: 'cancelled',
      callSource: 'cal',
      callUidHash: uidHash,
      callAt: createdAt,
    })
    .onConflictDoUpdate({
      target: enquiry.identityHash,
      set: { callState: 'cancelled', callAt: createdAt, updatedAt: NOW },
      setWhere: sql`(${eq(enquiry.callUidHash, uidHash)} and ${eq(enquiry.callState, 'booked')})`,
    })
    .returning({ identityHash: enquiry.identityHash })
  return rows.length > 0
}

// A booking by an address no lead has: its start alone. The same start reported twice is one row.
export async function addUnmatchedCall(startsAt: Date): Promise<void> {
  await db.insert(unmatchedCall).values({ startsAt }).onConflictDoNothing()
}

// Unmatched calls that started before `moment` have run their course and are of no more use to
// the desk. How many went.
export async function deleteUnmatchedCallsBefore(moment: Date): Promise<number> {
  const rows = await db
    .delete(unmatchedCall)
    .where(lt(unmatchedCall.startsAt, moment))
    .returning({ id: unmatchedCall.id })
  return rows.length
}
