import 'server-only'
import { and, eq, lt, notExists, sql } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { lead, rateLimit, seen, submission } from '@/lib/db/schema'
import type { SubmissionRow } from '@/lib/db/submissions'

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

// Every URL a submission's row points at on Blob: the raster, the pictures, the uploads.
export function blobUrlsOf(row: SubmissionRow): string[] {
  const urls: string[] = []
  if (row.logo?.image) urls.push(row.logo.image.src)
  for (const slots of Object.values(row.imagery)) {
    for (const image of Object.values(slots)) if (image !== null) urls.push(image.src)
  }
  const answers = row.answers
  if (answers.logo.kind === 'file') urls.push(answers.logo.url)
  for (const photo of answers.imagery.photos) urls.push(photo.url)
  return [...new Set(urls)]
}

// Whether another submission still points at a URL, so a shared upload is not removed early.
export async function urlReferencedElsewhere(url: string, slug: string): Promise<boolean> {
  const rows = await db
    .select({ slug: submission.slug })
    .from(submission)
    .where(
      and(
        sql`${submission.slug} <> ${slug}`,
        sql`(${submission.answers}::text like ${`%${url}%`} or ${submission.imagery}::text like ${`%${url}%`} or ${submission.logo}::text like ${`%${url}%`})`,
      ),
    )
    .limit(1)
  return rows.length > 0
}

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
