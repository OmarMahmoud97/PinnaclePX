import 'server-only'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { briefOverview, submission } from '@/lib/db/schema'

export type BriefOverviewRow = typeof briefOverview.$inferSelect

// The newest briefs first, as brief_overview flattens them (lib/db/schema.ts), and no more than
// `limit`: the page that lists them has no second page (CONFIG.admin.briefs).
export async function readBriefOverview(limit: number): Promise<BriefOverviewRow[]> {
  return db.select().from(briefOverview).orderBy(desc(briefOverview.createdAt)).limit(limit)
}

export type Brief = Readonly<{
  row: BriefOverviewRow
  // How many briefs this person has sent, since the standing on the row is theirs, shared.
  briefsOfPerson: number
}>

// One brief with the person's standing joined on, and how many briefs of theirs there are. Null
// when the slug names nothing, which a swept brief does.
export async function readBrief(slug: string): Promise<Brief | null> {
  const rows = await db.select().from(briefOverview).where(eq(briefOverview.slug, slug))
  const row = rows[0]
  if (row === undefined) return null
  const own = await db
    .select({ slug: submission.slug })
    .from(submission)
    .where(eq(submission.identityHash, row.identityHash))
  return { row, briefsOfPerson: own.length }
}
