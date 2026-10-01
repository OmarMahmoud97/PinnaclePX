import 'server-only'
import { and, eq, lt, ne, not, notExists, sql } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { blobRef, enquiry, lead, rateLimit, seen, submission } from '@/lib/db/schema'

// What the retention sweep and erasure read and remove. `seen` is kept by retention, because
// the exclusivity promise outlives the preview; erasure removes it too.

// Whether the person's standing keeps their briefs past the retention window (ADR 0047, the
// owner's decision of 2 October 2026): won, or a call booked, and that standing set after
// `keptAfter`. A brief is kept while this holds and goes the night after it stops holding.
function keptBy(keptAfter: Date) {
  return sql`exists (select 1 from ${enquiry} where ${enquiry.identityHash} = ${submission.identityHash} and ((${enquiry.stage} = 'won' and ${enquiry.stageAt} > ${keptAfter}) or (${enquiry.callState} = 'booked' and ${enquiry.callAt} > ${keptAfter})))`
}

// The slugs to remove, and nothing else: each is read in full in its own step. Older than
// `before`, unless the person's standing keeps them.
export async function expiredSlugs(before: Date, keptAfter: Date): Promise<string[]> {
  const rows = await db
    .select({ slug: submission.slug })
    .from(submission)
    .where(and(lt(submission.createdAt, before), not(keptBy(keptAfter))))
  return rows.map((row) => row.slug)
}

export async function slugsOf(identityHash: string): Promise<string[]> {
  const rows = await db
    .select({ slug: submission.slug })
    .from(submission)
    .where(eq(submission.identityHash, identityHash))
  return rows.map((row) => row.slug)
}

// Whether another submission still points at a URL, so a shared upload is not removed early.
// One read on the blob_ref key.
export async function urlReferencedElsewhere(url: string, slug: string): Promise<boolean> {
  const rows = await db
    .select({ slug: blobRef.slug })
    .from(blobRef)
    .where(and(eq(blobRef.url, url), ne(blobRef.slug, slug)))
    .limit(1)
  return rows.length > 0
}

// The row goes, and its blob_ref rows with it.
export async function deleteSubmission(slug: string): Promise<void> {
  await db.delete(submission).where(eq(submission.slug, slug))
}

// Leads with no submission left, after a sweep.
export async function deleteLeadsWithoutSubmissions(): Promise<number> {
  const rows = await db
    .delete(lead)
    .where(
      notExists(
        db.select().from(submission).where(eq(submission.identityHash, lead.identityHash)),
      ),
    )
    .returning({ identityHash: lead.identityHash })
  return rows.length
}

export async function deleteIdentity(identityHash: string): Promise<void> {
  await db.delete(seen).where(eq(seen.identityHash, identityHash))
  await db.delete(lead).where(eq(lead.identityHash, identityHash))
}

// Rate limit windows that started before a moment are of no use.
export async function deleteRateLimitsBefore(before: Date): Promise<number> {
  const rows = await db
    .delete(rateLimit)
    .where(lt(rateLimit.window, String(Math.floor(before.getTime() / 1000))))
    .returning({ key: rateLimit.key })
  return rows.length
}
