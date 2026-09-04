import 'server-only'
import { eq } from 'drizzle-orm'
import { CONFIG } from '@/lib/config'
import { db } from '@/lib/db/client'
import { seen } from '@/lib/db/schema'
import { AppError } from '@/lib/errors'

// Postgres: unique_violation.
const UNIQUE_VIOLATION = '23505'

function isUniqueViolation(error: unknown): boolean {
  let current: unknown = error
  for (let depth = 0; depth < 4 && current instanceof Error; depth += 1) {
    if ('code' in current && current.code === UNIQUE_VIOLATION) return true
    current = current.cause
  }
  return false
}

// Reveals templates to an identity, exactly once each. The composite primary key on `seen` is
// the guarantee: the chosen ids go in as one INSERT, and if another submission for the same
// identity got there first the whole statement fails, `seen` is read again and the choice
// remade. Rows already carrying this slug are ours from an earlier attempt of the same step,
// so a retry returns them instead of choosing again. An empty choice means the identity has
// exhausted the pool, and nothing is written.
export async function revealTemplates(
  identityHash: string,
  slug: string,
  choose: (alreadySeen: ReadonlySet<string>) => readonly string[],
): Promise<string[]> {
  for (let attempt = 0; attempt < CONFIG.exclusivity.attempts; attempt += 1) {
    const rows = await db
      .select({ templateId: seen.templateId, slug: seen.slug })
      .from(seen)
      .where(eq(seen.identityHash, identityHash))
    const mine = rows.filter((row) => row.slug === slug).map((row) => row.templateId)
    if (mine.length > 0) return mine
    const chosen = choose(new Set(rows.map((row) => row.templateId)))
    if (chosen.length === 0) return []
    try {
      await db.insert(seen).values(chosen.map((templateId) => ({ identityHash, templateId, slug })))
      return [...chosen]
    } catch (error) {
      if (!isUniqueViolation(error)) throw error
    }
  }
  throw new AppError(
    `Could not reveal templates after ${String(CONFIG.exclusivity.attempts)} attempts`,
  )
}
