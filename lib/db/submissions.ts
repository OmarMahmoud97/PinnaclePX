import 'server-only'
import { and, eq, inArray, isNull } from 'drizzle-orm'
import { blobUrlsIn } from '@/lib/blob/urls'
import { db } from '@/lib/db/client'
import { blobRef, lead, type StageState, submission } from '@/lib/db/schema'
import { AppError } from '@/lib/errors'
import type { StageRow } from '@/lib/preview/status'

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

// Records which files on Blob a submission points at (blob_ref in lib/db/schema.ts). Idempotent,
// so a retried step recording the same again changes nothing.
async function recordBlobRefs(slug: string, urls: readonly string[]): Promise<void> {
  if (urls.length === 0) return
  await db
    .insert(blobRef)
    .values(urls.map((url) => ({ url, slug })))
    .onConflictDoNothing()
}

// Inserts the submission, or returns the one with the same payload hash. The unique index does
// the deciding, so two identical submissions racing each other still end as one row. The
// uploads in the answers are recorded either way, so a submit that failed between the two
// writes is made whole by the next.
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
  const found = await findRow(inserted[0], input.payloadHash)
  await recordBlobRefs(found.slug, blobUrlsIn({ answers: input.answers }))
  return found
}

async function findRow(
  inserted: Omit<Found, 'created'> | undefined,
  payloadHash: string,
): Promise<Found> {
  if (inserted !== undefined) return { ...inserted, created: true }
  const existing = await db
    .select({
      slug: submission.slug,
      deadlineAt: submission.deadlineAt,
      conceptCount: submission.conceptCount,
      eventSentAt: submission.eventSentAt,
    })
    .from(submission)
    .where(eq(submission.payloadHash, payloadHash))
  const found = existing[0]
  if (found === undefined) throw new AppError('Submission neither inserted nor found')
  return { ...found, created: false }
}

export async function readSubmission(slug: string): Promise<SubmissionRow | null> {
  const rows = await db.select().from(submission).where(eq(submission.slug, slug))
  return rows[0] ?? null
}

// The stage columns and nothing else: what the status poll asks for every few seconds, without
// the answers, brief, copy and imagery the row also carries.
export async function readStageRow(slug: string): Promise<StageRow | null> {
  const rows = await db
    .select({
      slug: submission.slug,
      deadlineAt: submission.deadlineAt,
      conceptCount: submission.conceptCount,
      templateIds: submission.templateIds,
      stageSelect: submission.stageSelect,
      stageTokens: submission.stageTokens,
      stageBrief: submission.stageBrief,
      stageCopy: submission.stageCopy,
      stageImagery: submission.stageImagery,
    })
    .from(submission)
    .where(eq(submission.slug, slug))
  return rows[0] ?? null
}

// The row with the lead it belongs to, for the email.
export async function readSubmissionWithLead(
  slug: string,
): Promise<{ submission: SubmissionRow; lead: typeof lead.$inferSelect } | null> {
  const rows = await db
    .select({ submission, lead })
    .from(submission)
    .innerJoin(lead, eq(lead.identityHash, submission.identityHash))
    .where(eq(submission.slug, slug))
  return rows[0] ?? null
}

// Records that the email with the link went out, once.
export async function markEmailSent(slug: string): Promise<boolean> {
  const rows = await db
    .update(submission)
    .set({ emailSentAt: new Date() })
    .where(and(eq(submission.slug, slug), isNull(submission.emailSentAt)))
    .returning({ slug: submission.slug })
  return rows.length > 0
}

// Records that the owner was told of the build, once.
export async function markOwnerNotified(slug: string): Promise<boolean> {
  const rows = await db
    .update(submission)
    .set({ ownerNotifiedAt: new Date() })
    .where(and(eq(submission.slug, slug), isNull(submission.ownerNotifiedAt)))
    .returning({ slug: submission.slug })
  return rows.length > 0
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
// The files the results point at are recorded first: a reference to a file the row ends up not
// showing costs nothing, while a file the row shows without a reference could be swept early.
export async function markStage(
  slug: string,
  stage: Stage,
  to: Exclude<StageState, 'pending'>,
  patch: StagePatch = {},
): Promise<boolean> {
  await recordBlobRefs(slug, blobUrlsIn({ logo: patch.logo, imagery: patch.imagery }))
  const rows = await db
    .update(submission)
    .set({ [PROPERTY[stage]]: to, ...patch })
    .where(and(eq(submission.slug, slug), inArray(COLUMN[stage], [...OPEN])))
    .returning({ slug: submission.slug })
  return rows.length > 0
}
