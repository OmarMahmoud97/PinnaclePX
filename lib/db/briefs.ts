import 'server-only'
import { desc } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { briefOverview } from '@/lib/db/schema'

export type BriefOverviewRow = typeof briefOverview.$inferSelect

// The newest briefs first, as brief_overview flattens them (lib/db/schema.ts), and no more than
// `limit`: the page that lists them has no second page (CONFIG.admin.briefs).
export async function readBriefOverview(limit: number): Promise<BriefOverviewRow[]> {
  return db.select().from(briefOverview).orderBy(desc(briefOverview.createdAt)).limit(limit)
}
