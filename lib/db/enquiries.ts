import 'server-only'
import { and, asc, eq, gt, type SQL, sql } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { enquiry, submission, unmatchedCall } from '@/lib/db/schema'

// The owner's own marks (ADR 0047): that a brief was opened, where a person's enquiry stands, a
// call booked by hand or marked cancelled or missed, a note. The pipeline never writes any of
// these. Each function is one statement, because neon-http has no transactions: an upsert's
// guard lives in the statement itself, and a toggle is decided against the row as the database
// holds it, never against what the page showed. Every word a mark writes records what the
// visitor or the system did, never anything the studio did to reach them.

// The database's clock, which also stamps the pipeline's stages (lib/db/submissions.ts), so a
// mark's time never carries the difference between a function's clock and the database's.
const NOW = sql`now()`

const MINUTE_MS = 60_000

// Records that the owner opened the brief, which stops marking it new on the list. True when the
// slug named a row.
export async function markOpened(slug: string): Promise<boolean> {
  const rows = await db
    .update(submission)
    .set({ ownerOpenedAt: NOW })
    .where(eq(submission.slug, slug))
    .returning({ slug: submission.slug })
  return rows.length > 0
}

// "Mark as new": the brief reads as never opened again.
export async function unopen(slug: string): Promise<boolean> {
  const rows = await db
    .update(submission)
    .set({ ownerOpenedAt: null })
    .where(eq(submission.slug, slug))
    .returning({ slug: submission.slug })
  return rows.length > 0
}

// The person a brief belongs to, so a mark made from the brief's page lands on their enquiry
// row. Null when the slug names nothing, which a swept brief does.
export async function identityOfSlug(slug: string): Promise<string | null> {
  const rows = await db
    .select({ identityHash: submission.identityHash })
    .from(submission)
    .where(eq(submission.slug, slug))
  return rows[0]?.identityHash ?? null
}

// The stage the owner tapped. Open is never tapped: it is where a second tap on the current
// stage lands.
export type StageIntent = 'quoted' | 'won' | 'lost'

// Moves the person's enquiry to the stage the owner tapped, or back to open when they tapped the
// stage it already had. The toggle is decided against the stored stage, never the page's, so a
// tap from a tab that had not seen the last change still does what the row calls for. Quoted
// and Won write the figure given; the tap back to open clears it; Lost never writes one, so the
// figure that was quoted stays, as a fact of what was offered.
export async function setStage(
  identityHash: string,
  intent: StageIntent,
  quotePounds: number | null,
): Promise<void> {
  const quote = intent === 'lost' ? null : quotePounds
  await db
    .insert(enquiry)
    .values({ identityHash, stage: intent, quotePounds: quote, stageAt: NOW })
    .onConflictDoUpdate({
      target: enquiry.identityHash,
      set: {
        stage: sql`case when ${enquiry.stage} = ${intent} then 'open' else ${intent} end`,
        stageAt: NOW,
        quotePounds: sql`case when ${enquiry.stage} = ${intent} then null when ${intent} in ('quoted', 'won') then ${quote} else ${enquiry.quotePounds} end`,
        updatedAt: NOW,
      },
    })
}

// The owner's own mark that a call is booked, at a time when they know it. It replaces whatever
// booking the row held, Cal.com's included, and drops that booking's uid digest, so a later
// Cal.com cancellation of it finds nothing to undo. The end is the start plus the call's length
// (CONFIG.call.minutes, passed in), computed here; a booking with no time yet has neither. The
// stage columns are left as they are. The caller removes any unmatched call for the same start.
export async function setOwnerBooking(
  identityHash: string,
  startsAt: Date | null,
  minutes: number,
): Promise<void> {
  const endsAt = startsAt === null ? null : new Date(startsAt.getTime() + minutes * MINUTE_MS)
  const booking = {
    callState: 'booked',
    callSource: 'owner',
    callUidHash: null,
    callStartsAt: startsAt,
    callEndsAt: endsAt,
    callAt: NOW,
    updatedAt: NOW,
  } as const
  await db
    .insert(enquiry)
    .values({ identityHash, ...booking })
    .onConflictDoUpdate({ target: enquiry.identityHash, set: booking })
}

// Only a booked call can be cancelled or missed. The guard is in the statement, so a second tap,
// or one from a tab that had not seen the change, changes nothing.
function bookedCall(identityHash: string): SQL | undefined {
  return and(eq(enquiry.identityHash, identityHash), eq(enquiry.callState, 'booked'))
}

// The owner says the call is off. The uid digest stays, so Cal.com's own cancellation of the
// same booking, arriving later, still finds it.
export async function unbook(identityHash: string): Promise<void> {
  await db
    .update(enquiry)
    .set({ callState: 'cancelled', callSource: 'owner', callAt: NOW, updatedAt: NOW })
    .where(bookedCall(identityHash))
}

// The visitor did not turn up.
export async function setNoShow(identityHash: string): Promise<void> {
  await db
    .update(enquiry)
    .set({ callState: 'no_show', callAt: NOW, updatedAt: NOW })
    .where(bookedCall(identityHash))
}

// The owner's note, whole: the page sends the full text each time. Its time moves only when the
// words changed, so a save that changed nothing leaves it alone. The length is held by the
// action (CONFIG.admin.noteMaxChars).
export async function saveNote(identityHash: string, note: string): Promise<void> {
  await db
    .insert(enquiry)
    // A first row with no note yet carries no time: the stamp means the words were written.
    .values({ identityHash, note, noteAt: note === '' ? null : NOW })
    .onConflictDoUpdate({
      target: enquiry.identityHash,
      set: {
        note: sql`excluded.note`,
        noteAt: sql`case when ${enquiry.note} is distinct from excluded.note then ${NOW} else ${enquiry.noteAt} end`,
        updatedAt: NOW,
      },
    })
}

// A Cal.com booking that matched no lead is no longer waiting for the owner: they attached it to
// a brief by hand (setOwnerBooking), or its time has passed.
export async function deleteUnmatchedCall(startsAt: Date): Promise<void> {
  await db.delete(unmatchedCall).where(eq(unmatchedCall.startsAt, startsAt))
}

// The starts of the unmatched bookings still to come, soonest first: those after `from`, the
// page's now, so a booking whose time has passed is no longer offered.
export async function listUnmatchedCalls(from: Date): Promise<Date[]> {
  const rows = await db
    .select({ startsAt: unmatchedCall.startsAt })
    .from(unmatchedCall)
    .where(gt(unmatchedCall.startsAt, from))
    .orderBy(asc(unmatchedCall.startsAt))
  return rows.map((row) => row.startsAt)
}
