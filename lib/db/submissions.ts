import 'server-only'
import { and, eq, inArray, isNull } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { type StageState, submission } from '@/lib/db/schema'
import { AppError } from '@/lib/errors'

export type SubmissionRow = typeof submission.$inferSelect
type NewSubmission = typeof submission.$inferInsert

// The five stages the done page reveals, in the order the pipeline runs them.
export const STAGES = ['select', 'tokens', 'brief', 'copy', 'imagery'] as const

export type Stage = (typeof STAGES)[number]

const COLUMN = {
  select: submission.stageSelect,
  tokens: submission.stageTokens,
  brief: submission.stageBrief,
  copy: submission.stageCopy,
  imagery: submission.stageImagery,
} as const

const PROPERTY = {
  select: 'stageSelect',
  tokens: 'stageTokens',
  brief: 'stageBrief',
  copy: 'stageCopy',
  imagery: 'stageImagery',
} as const

// A stage still open: the pipeline or the sweeper may still write it.
const OPEN: readonly StageState[] = ['pending', 'running']

type Found = Readonly<{
  slug: string
  deadlineAt: Date
  conceptCount: number
  eventSentAt: Date | null
  // True when this call created the row; false when the payload hash matched an earlier one.
  created: boolean
}>

// Inserts the submission, or returns the one with the same payload hash. The unique index does
// the deciding, so two identical submissions racing each other still end as one row.
export async function createOrFindSubmission(input: NewSubmission): Promise<Found> {
  const inserted = await db
    .insert(submission)
    .values(input)
    .onConflictDoNothing({ target: submission.payloadHash })
    .returning({
      slug: submission.slug,
      deadlineAt: submission.deadlineAt,
      conceptCount: submission.conceptCount,
      eventSentAt: submission.eventSentAt,
    })
  const row = inserted[0]
  if (row !== undefined) return { ...row, created: true }
  const existing = await db
    .select({
      slug: submission.slug,
      deadlineAt: submission.deadlineAt,
      conceptCount: submission.conceptCount,
      eventSentAt: submission.eventSentAt,
    })
    .from(submission)
    .where(eq(submission.payloadHash, input.payloadHash))
  const found = existing[0]
  if (found === undefined) throw new AppError('Submission neither inserted nor found')
  return { ...found, created: false }
}

export async function readSubmission(slug: string): Promise<SubmissionRow | null> {
  const rows = await db.select().from(submission).where(eq(submission.slug, slug))
  return rows[0] ?? null
}

// Records that the pipeline event went out, once. Returns false when it was already recorded.
export async function markEventSent(slug: string): Promise<boolean> {
  const rows = await db
    .update(submission)
    .set({ eventSentAt: new Date() })
    .where(and(eq(submission.slug, slug), isNull(submission.eventSentAt)))
    .returning({ slug: submission.slug })
  return rows.length > 0
}

// The results a stage may write alongside its state.
export type StagePatch = Partial<
  Pick<NewSubmission, 'templateIds' | 'logo' | 'brief' | 'tokens' | 'copy' | 'imagery'>
>

// Moves a stage on and writes its results, but only while the stage is still open. The
// pipeline and the sweeper both write through this, so whichever lands first wins and the
// page then renders the same on every visit. Returns false when the stage was already settled.
export async function markStage(
  slug: string,
  stage: Stage,
  to: Exclude<StageState, 'pending'>,
  patch: StagePatch = {},
): Promise<boolean> {
  const rows = await db
    .update(submission)
    .set({ [PROPERTY[stage]]: to, ...patch })
    .where(and(eq(submission.slug, slug), inArray(COLUMN[stage], [...OPEN])))
    .returning({ slug: submission.slug })
  return rows.length > 0
}
