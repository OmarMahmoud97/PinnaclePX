import 'server-only'
import { and, eq, lt, ne, notExists } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { blobRef, lead, rateLimit, seen, submission } from '@/lib/db/schema'

// What the retention sweep and erasure read and remove. `seen` is kept by retention, because
// the exclusivity promise outlives the preview; erasure removes it too.

// The slugs to remove, and nothing else: each is read in full in its own step.
export async function slugsCreatedBefore(before: Date): Promise<string[]> {
  const rows = await db
    .select({ slug: submission.slug })
    .from(submission)
    .where(lt(submission.createdAt, before))
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
