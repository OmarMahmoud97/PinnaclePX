import 'server-only'
import { asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { modelCall } from '@/lib/db/schema'

export type ModelCallRow = typeof modelCall.$inferSelect
export type NewModelCall = typeof modelCall.$inferInsert

// One row per call to the model, appended as the call returns. Steps that run in parallel each
// append their own rows, so nothing is summed until the owner's notice reads them.
export async function recordModelCall(row: NewModelCall): Promise<void> {
  await db.insert(modelCall).values(row)
}

// Every call a submission made, oldest first.
export async function readModelCalls(slug: string): Promise<ModelCallRow[]> {
  return db.select().from(modelCall).where(eq(modelCall.slug, slug)).orderBy(asc(modelCall.id))
}
