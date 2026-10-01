import { eq, sql } from 'drizzle-orm'
import {
  index,
  integer,
  jsonb,
  pgTable,
  pgView,
  primaryKey,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import type { SubmissionAnswers } from '@/lib/brief/submission'
import type { SlotImage } from '@/lib/copy-slots/assets'
import type { BrandBrief } from '@/lib/copy-slots/brief'
import type { LogoAnalysis } from '@/lib/logo/types'
import type { TokenSet } from '@/lib/tokens/types'

// Where a pipeline stage stands. `failed` is only for the two stages with no fallback, select
// and tokens, and should never be seen; it exists so a failure is visible rather than silent.
const STAGE_STATES = ['pending', 'running', 'done', 'fallback', 'failed'] as const

export type StageState = (typeof STAGE_STATES)[number]

const stage = (name: string) =>
  text(name, { enum: STAGE_STATES }).notNull().default('pending').$type<StageState>()

const settledAt = (name: string) => timestamp(name, { withTimezone: true })

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
// tell its own rows from another submission's. The hash is deliberately not a foreign key: `seen`
// outlives the lead (ADR 0014 keeps it after the sweep, and the notice calls it a code that
// cannot be turned back into the address), and a key to `lead` stopped the sweep deleting any
// lead that had ever been shown a design (ADR 0046).
export const seen = pgTable(
  'seen',
  {
    identityHash: text('identity_hash').notNull(),
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
  // When each stage settled (done, fallback or failed), by the database's clock like createdAt,
  // so the done page and the hub can stamp each line of the build with the server's own time
  // (docs/start-page-journey-plan.md, 8.2). Null while the stage is open, and on rows written
  // before these columns existed, which then show no times at all.
  stageSelectAt: settledAt('stage_select_at'),
  stageTokensAt: settledAt('stage_tokens_at'),
  stageBriefAt: settledAt('stage_brief_at'),
  stageCopyAt: settledAt('stage_copy_at'),
  stageImageryAt: settledAt('stage_imagery_at'),
  // When the last stage settled: how long the build took, read against createdAt.
  settledAt: settledAt('settled_at'),
  deadlineAt: timestamp('deadline_at', { withTimezone: true }).notNull(),
  // When the pipeline event was sent. Null means the send failed and the next submit resends.
  eventSentAt: timestamp('event_sent_at', { withTimezone: true }),
  // When the email with the link went out. Null until then; never sent twice.
  emailSentAt: timestamp('email_sent_at', { withTimezone: true }),
  // When the owner was told of the build (lib/email/owner-notice.ts). Null until then; once.
  ownerNotifiedAt: timestamp('owner_notified_at', { withTimezone: true }),
  // When the owner last opened this brief on /admin (ADR 0047); null until then, which is what
  // marks it new on the list. Set by the brief page before it renders, cleared by "Mark as new".
  ownerOpenedAt: timestamp('owner_opened_at', { withTimezone: true }),
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

// Where a person's enquiry stands, for the owner (ADR 0047): one row per lead, made the first time
// the owner marks anything or Cal.com reports a booking, and gone with the lead. A call and a
// quote happen to a person, and Cal.com only ever knows the person, so the row is theirs rather
// than a brief's; the view joins it onto every brief of theirs, and the page sets a fact older
// than a brief aside as "earlier". Every word records what the visitor or the system did, never
// anything the studio did to reach them.
const ENQUIRY_STAGES = ['open', 'quoted', 'won', 'lost'] as const
export type EnquiryStage = (typeof ENQUIRY_STAGES)[number]
const CALL_STATES = ['booked', 'cancelled', 'no_show'] as const
export type CallState = (typeof CALL_STATES)[number]
const CALL_SOURCES = ['cal', 'owner'] as const
export type CallSource = (typeof CALL_SOURCES)[number]

export const enquiry = pgTable('enquiry', {
  identityHash: text('identity_hash')
    .primaryKey()
    .references(() => lead.identityHash, { onDelete: 'cascade' }),
  stage: text('stage', { enum: ENQUIRY_STAGES }).notNull().default('open').$type<EnquiryStage>(),
  // Whole pounds, written by Quoted and Won only; Lost keeps what was quoted, as a fact.
  quotePounds: integer('quote_pounds'),
  stageAt: timestamp('stage_at', { withTimezone: true }),
  // The owner's own words about the enquiry, at most CONFIG.admin.noteMaxChars (held by the
  // action), deleted with the row.
  note: text('note').notNull().default(''),
  noteAt: timestamp('note_at', { withTimezone: true }),
  // The one live booking: Cal.com's, or the owner's own mark. Cal.com's uid is kept only as a
  // digest, enough for its cancellation to find the booking and nothing that opens it there.
  callState: text('call_state', { enum: CALL_STATES }).$type<CallState>(),
  callSource: text('call_source', { enum: CALL_SOURCES }).$type<CallSource>(),
  callUidHash: text('call_uid_hash'),
  callStartsAt: timestamp('call_starts_at', { withTimezone: true }),
  callEndsAt: timestamp('call_ends_at', { withTimezone: true }),
  // When the booking was recorded: Cal.com's own createdAt, or the owner's clock. The newer wins,
  // so a late or replayed event never undoes a later mark.
  callAt: timestamp('call_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// A Cal.com booking whose address matched no lead: its start alone, nothing that names anyone, so
// the owner is told a booking arrived and can attach it to the right brief with one tap. Removed
// once the call has passed, and by the sweep.
export const unmatchedCall = pgTable('unmatched_call', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull().unique(),
})

// One readable row per brief, for the owner (ADR 0045): who sent it, every answer from the five
// questions flattened out of the jsonb, and the path of each design the build chose. A view, not
// a table: it is always what `lead` and `submission` say, costs the pipeline no write, and keeps
// the retention promise by itself, since a swept submission leaves it. The Neon console and
// Drizzle Studio show it as a table; /admin renders it (lib/db/briefs.ts). The name and the email
// are the lead's latest, since a submission never holds them; the company is this brief's. The
// person's standing rides along from `enquiry` (ADR 0047), one row per lead, so the join never
// fans out.
export const briefOverview = pgView('brief_overview').as((qb) => {
  const answers = submission.answers
  const colours = sql`${answers} -> 'colours'`
  return qb
    .select({
      createdAt: submission.createdAt,
      slug: submission.slug,
      // The person, so the page can group a returning visitor's briefs; never rendered or linked.
      identityHash: submission.identityHash,
      name: lead.name,
      email: lead.email,
      company: sql<string>`${answers} ->> 'company'`.as('company'),
      description: sql<string>`${answers} ->> 'description'`.as('description'),
      // Both null when the name stands in as a wordmark.
      logoFile: sql<string | null>`${answers} -> 'logo' ->> 'fileName'`.as('logo_file'),
      logoUrl: sql<string | null>`${answers} -> 'logo' ->> 'url'`.as('logo_url'),
      look: sql<string>`${answers} -> 'imagery' ->> 'style'`.as('look'),
      photoUrls: sql<string[]>`jsonb_path_query_array(${answers}, '$.imagery.photos[*].url')`.as(
        'photo_urls',
      ),
      // A palette's id, or the six hex digits of a colour of their own.
      colour: sql<string>`coalesce(${colours} ->> 'paletteId', ${colours} ->> 'hex')`.as('colour'),
      templateIds: submission.templateIds,
      // The path of each design, in the build's order: null until the select stage lands, empty
      // when the address had already seen every template.
      designPaths: sql<
        string[] | null
      >`case when ${submission.templateIds} is null then null else array(select '/preview/' || ${submission.slug} || '/' || u.id from unnest(${submission.templateIds}) with ordinality as u(id, ord) order by u.ord) end`.as(
        'design_paths',
      ),
      emailSentAt: submission.emailSentAt,
      settledAt: submission.settledAt,
      // The build's stages and its deadline, so the page can say how a build stands the way the
      // status poll does (lib/preview/status.ts, statusOf); when the owner last opened the brief.
      conceptCount: submission.conceptCount,
      deadlineAt: submission.deadlineAt,
      stageSelect: submission.stageSelect,
      stageTokens: submission.stageTokens,
      stageBrief: submission.stageBrief,
      stageCopy: submission.stageCopy,
      stageImagery: submission.stageImagery,
      ownerOpenedAt: submission.ownerOpenedAt,
      // The person's standing (ADR 0047), with its empty values while they have no enquiry row.
      // The uid digest stays out: the page has no use for it.
      enquiryStage: sql<EnquiryStage>`coalesce(${enquiry.stage}, 'open')`.as('enquiry_stage'),
      quotePounds: enquiry.quotePounds,
      stageAt: enquiry.stageAt,
      note: sql<string>`coalesce(${enquiry.note}, '')`.as('note'),
      noteAt: enquiry.noteAt,
      callState: enquiry.callState,
      callSource: enquiry.callSource,
      callStartsAt: enquiry.callStartsAt,
      callEndsAt: enquiry.callEndsAt,
      callAt: enquiry.callAt,
    })
    .from(submission)
    .innerJoin(lead, eq(lead.identityHash, submission.identityHash))
    .leftJoin(enquiry, eq(enquiry.identityHash, submission.identityHash))
})
