import 'server-only'
import { sql } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { rateLimit } from '@/lib/db/schema'
import { limitKey, windowKey } from '@/lib/rate-limit/window'

type Limit = Readonly<{ scope: string; subject: string; windowSeconds: number; max: number }>

// Counts one hit and says whether it was within the limit. One atomic upsert: the row for the
// key and window is created or its count raised, and the new count comes back. Never in memory,
// because a serverless function has none to keep.
export async function hitLimit(limit: Limit, now = new Date()): Promise<boolean> {
  const key = limitKey(limit.scope, limit.subject)
  const window = windowKey(now, limit.windowSeconds)
  const rows = await db
    .insert(rateLimit)
    .values({ key, window, count: 1 })
    .onConflictDoUpdate({
      target: [rateLimit.key, rateLimit.window],
      set: { count: sql`${rateLimit.count} + 1` },
    })
    .returning({ count: rateLimit.count })
  const count = rows[0]?.count ?? limit.max + 1
  return count <= limit.max
}
