import { index, integer, jsonb, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core'
import type { SubmissionAnswers } from '@/lib/brief/submission'
import type { SlotImage } from '@/lib/copy-slots/assets'
import type { BrandBrief } from '@/lib/copy-slots/brief'
import type { LogoAnalysis } from '@/lib/logo/types'
import type { TokenSet } from '@/lib/tokens/types'

// Where a pipeline stage stands. `failed` is only for the two stages with no fallback, select
// and tokens, and should never be seen; it exists so a failure is visible rather than silent.
export const STAGE_STATES = ['pending', 'running', 'done', 'fallback', 'failed'] as const

export type StageState = (typeof STAGE_STATES)[number]

const stage = (name: string) =>
  text(name, { enum: STAGE_STATES }).notNull().default('pending').$type<StageState>()

// Hits under a key within a fixed window (lib/db/rate-limit.ts). Rows for old windows are
// removed by the retention sweep.
export const rateLimit = pgTable(
  'rate_limit',
  {
    key: text('key').notNull(),
    window: text('window').notNull(),
    count: integer('count').notNull(),
  },
  (table) => [primaryKey({ columns: [table.key, table.window] })],
)

// One row per email address. The identity is an HMAC of the email, so the exclusivity table
// never holds an address.
export const lead = pgTable('lead', {
  identityHash: text('identity_hash').primaryKey(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  company: text('company').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// The exclusivity guarantee: a template an identity has been shown. The composite key makes a
// duplicate reveal impossible; the slug says which submission revealed it, so a retried step can
// tell its own rows from another submission's.
export const seen = pgTable(
  'seen',
  {
    identityHash: text('identity_hash')
      .notNull()
      .references(() => lead.identityHash),
    templateId: text('template_id').notNull(),
    slug: text('slug').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.identityHash, table.templateId] })],
)

// One row per distinct submission. The preview page renders from this row and nothing else.
export const submission = pgTable('submission', {
  slug: text('slug').primaryKey(),
  identityHash: text('identity_hash')
    .notNull()
    .references(() => lead.identityHash),
  payloadHash: text('payload_hash').notNull().unique(),
  answers: jsonb('answers').notNull().$type<SubmissionAnswers>(),
  // How many concepts this submission builds: the configured count, or fewer while fewer
  // templates are ready.
  conceptCount: integer('concept_count').notNull(),
  // Null until select lands; an empty array means the identity has exhausted the pool.
  templateIds: text('template_ids').array().$type<string[]>(),
  logo: jsonb('logo').$type<LogoAnalysis>(),
  brief: jsonb('brief').$type<BrandBrief>(),
  tokens: jsonb('tokens').$type<TokenSet>(),
  // Per template id: the copy in that template's own shape, validated by its contract on read.
  copy: jsonb('copy').notNull().default({}).$type<Record<string, unknown>>(),
  // Per template id, per image slot: the hosted image or null.
  imagery: jsonb('imagery')
    .notNull()
    .default({})
    .$type<Record<string, Record<string, SlotImage | null>>>(),
  stageSelect: stage('stage_select'),
  stageTokens: stage('stage_tokens'),
  stageBrief: stage('stage_brief'),
  stageCopy: stage('stage_copy'),
  stageImagery: stage('stage_imagery'),
  deadlineAt: timestamp('deadline_at', { withTimezone: true }).notNull(),
  // When the pipeline event was sent. Null means the send failed and the next submit resends.
  eventSentAt: timestamp('event_sent_at', { withTimezone: true }),
  // When the email with the link went out. Null until then; never sent twice.
  emailSentAt: timestamp('email_sent_at', { withTimezone: true }),
  // When the owner was told of the build (lib/email/owner-notice.ts). Null until then; once.
  ownerNotifiedAt: timestamp('owner_notified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// One call to the model and what it cost, appended as each call returns (lib/ai/usage.ts). The
// owner's notice sums a submission's rows; nothing else reads them. Goes with the row.
export const modelCall = pgTable(
  'model_call',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    slug: text('slug')
      .notNull()
      .references(() => submission.slug, { onDelete: 'cascade' }),
    // brief, copy or rank; the template for a copy call, null for the rest.
    stage: text('stage').notNull(),
    templateId: text('template_id'),
    model: text('model').notNull(),
    inputTokens: integer('input_tokens').notNull(),
    outputTokens: integer('output_tokens').notNull(),
    cacheReadTokens: integer('cache_read_tokens').notNull().default(0),
    cacheWriteTokens: integer('cache_write_tokens').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('model_call_slug_idx').on(table.slug)],
)

// A file on Blob a submission points at: an upload in its answers, its logo raster, a re-hosted
// picture. Written beside the row and the stage results (lib/db/submissions.ts), so the
// retention sweep can ask whether anything else points at a file with one indexed read rather
// than a text scan of every row. Goes with the row.
export const blobRef = pgTable(
  'blob_ref',
  {
    url: text('url').notNull(),
    slug: text('slug')
      .notNull()
      .references(() => submission.slug, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.url, table.slug] }),
    index('blob_ref_slug_idx').on(table.slug),
  ],
)
