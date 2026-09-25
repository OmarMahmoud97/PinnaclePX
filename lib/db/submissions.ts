import 'server-only'
import { and, eq, inArray, isNull, notInArray, type SQL, sql } from 'drizzle-orm'
import { blobUrlsIn } from '@/lib/blob/urls'
import type { SlotImage } from '@/lib/copy-slots/assets'
import { db } from '@/lib/db/client'
import { blobRef, lead, type StageState, submission } from '@/lib/db/schema'
import { AppError } from '@/lib/errors'
import type { PosterSlots, ViewRow } from '@/lib/preview/status'

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

// When each stage settled.
const SETTLED_AT = {
  select: 'stageSelectAt',
  tokens: 'stageTokensAt',
  brief: 'stageBriefAt',
  copy: 'stageCopyAt',
  imagery: 'stageImageryAt',
} as const

// A stage still open: the pipeline or the sweeper may still write it.
const OPEN: readonly StageState[] = ['pending', 'running']

// The database's clock, which also sets createdAt, so a stage's time from the brief's arrival
// never carries the difference between a function's clock and the database's.
const NOW = sql`now()`

// What a submit learns of its submission, created now or found by its payload hash.
const FOUND = {
  slug: submission.slug,
  deadlineAt: submission.deadlineAt,
  conceptCount: submission.conceptCount,
  eventSentAt: submission.eventSentAt,
}

type Existing = Readonly<{
  slug: string
  deadlineAt: Date
  conceptCount: number
  eventSentAt: Date | null
}>

type Found = Existing &
  Readonly<{
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
    .returning(FOUND)
  const found = await findRow(inserted[0], input.payloadHash)
  await recordBlobRefs(found.slug, blobUrlsIn({ answers: input.answers }))
  return found
}

async function findRow(inserted: Existing | undefined, payloadHash: string): Promise<Found> {
  if (inserted !== undefined) return { ...inserted, created: true }
  const existing = await findSubmission(payloadHash)
  if (existing === null) throw new AppError('Submission neither inserted nor found')
  return { ...existing, created: false }
}

// The submission these exact answers from this person already made, if any, so the submit action
// can answer a resend of the same brief with it before counting it against the day's limit, and
// sending twice never uses up a send (docs/start-page-journey-plan.md, 4.8 and package P8).
export async function findSubmission(payloadHash: string): Promise<Existing | null> {
  const rows = await db.select(FOUND).from(submission).where(eq(submission.payloadHash, payloadHash))
  return rows[0] ?? null
}

export async function readSubmission(slug: string): Promise<SubmissionRow | null> {
  const rows = await db.select().from(submission).where(eq(submission.slug, slug))
  return rows[0] ?? null
}

// The path to the picture each template's poster shows, as jsonb_build_object's arguments: the
// template's id, then its picture.
function posterPhotos(slots: PosterSlots): SQL {
  return sql.join(
    slots.map(
      ([id, slot]) => sql`${id}::text, ${submission.imagery} -> ${id}::text -> ${slot}::text`,
    ),
    sql`, `,
  )
}

// What the status poll asks for every few seconds (lib/preview/status.ts, viewOf): the stage
// columns and their times, and from the jsonb columns only what a view draws. The palette's id
// but none of the rest of the answers, the one fill of the tokens, the copy (empty until its
// stage settles, and read then only for each headline) and one picture per design, from the slot
// each template's poster shows. The caller names the slots, since only it may read the template
// registry. The brief, the logo and every other picture stay in the database.
export async function readViewRow(slug: string, slots: PosterSlots): Promise<ViewRow | null> {
  const rows = await db
    .select({
      slug: submission.slug,
      createdAt: submission.createdAt,
      deadlineAt: submission.deadlineAt,
      conceptCount: submission.conceptCount,
      templateIds: submission.templateIds,
      stageSelect: submission.stageSelect,
      stageTokens: submission.stageTokens,
      stageBrief: submission.stageBrief,
      stageCopy: submission.stageCopy,
      stageImagery: submission.stageImagery,
      stageSelectAt: submission.stageSelectAt,
      stageTokensAt: submission.stageTokensAt,
      stageBriefAt: submission.stageBriefAt,
      stageCopyAt: submission.stageCopyAt,
      stageImageryAt: submission.stageImageryAt,
      settledAt: submission.settledAt,
      paletteId: sql<string | null>`${submission.answers} -> 'colours' ->> 'paletteId'`,
      fill: sql<string | null>`${submission.tokens} ->> 'brand-deeper'`,
      copy: submission.copy,
      posterPhotos: sql<
        Record<string, SlotImage | null>
      >`jsonb_build_object(${posterPhotos(slots)})`,
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

// The settle path: the build's end, for the stage settling now to write beside its own time. It is
// the time when every other stage has already settled and no end is recorded, and the end as it
// stands otherwise. Postgres reads the row as it stood before the write, and a writer that waited
// on the row's lock reads the version the first one wrote, so when copy and imagery settle side by
// side exactly one of them stamps it.
function buildEnd(stage: Stage): SQL {
  const othersClosed = STAGES.filter((other) => other !== stage).map((other) =>
    notInArray(COLUMN[other], [...OPEN]),
  )
  return sql`case when ${isNull(submission.settledAt)} and ${sql.join(othersClosed, sql` and `)} then ${NOW} else ${submission.settledAt} end`
}

// Moves a stage on and writes its results, but only while the stage is still open. The
// pipeline and the sweeper both write through this, so whichever lands first wins and the
// page then renders the same on every visit. Returns false when the stage was already settled.
// The files the results point at are recorded first: a reference to a file the row ends up not
// showing costs nothing, while a file the row shows without a reference could be swept early.
// A stage that settles is stamped with the time, and with the build's end if it is the last, in
// the same statement: a stage write that had committed before a second one failed would read as
// settled to the retry, which would then skip the work it had never finished.
export async function markStage(
  slug: string,
  stage: Stage,
  to: Exclude<StageState, 'pending'>,
  patch: StagePatch = {},
): Promise<boolean> {
  await recordBlobRefs(slug, blobUrlsIn({ logo: patch.logo, imagery: patch.imagery }))
  const stamps = to === 'running' ? {} : { [SETTLED_AT[stage]]: NOW, settledAt: buildEnd(stage) }
  const rows = await db
    .update(submission)
    .set({ [PROPERTY[stage]]: to, ...stamps, ...patch })
    .where(and(eq(submission.slug, slug), inArray(COLUMN[stage], [...OPEN])))
    .returning({ slug: submission.slug })
  return rows.length > 0
}
