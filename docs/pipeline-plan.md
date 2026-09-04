# The pipeline: from five answers to a rendered Aurora page

Plan for the first working slice of the product: a visitor submits the five questions and, within five minutes, opens a live Aurora page in their own logo, colour and words. Built against `docs/brand-concept-generator-build-guide.md` (the guide) and `docs/standards.md`, on the code as it stands on 4 September 2026.

Aurora (`t01-aurora`) is the only real template, so it is the test template throughout. Everything here is built for N concepts so the nine templates to come slot in without a rewrite.

---

## 1. The idea in one paragraph

The form already collects everything the guide's five steps collect, on one page, with one Server Action at the end. So the pipeline is triggered once, by one event, with every answer in hand. One durable Inngest function runs the stages as steps: analyse the logo, choose the templates and record them as seen, derive the colour tokens, write the brief, then write the copy and find the imagery in parallel. Every step writes its result to the submission row and marks its stage column, the done page polls that row, and a second function wakes 45 seconds before the deadline and fills any gap with the deterministic fallback. The preview page renders only from the row. No AI call ever picks a template, a colour, a layout or an image URL.

---

## 2. What is there today

Read before planning: every file under `app/start/`, `lib/brief/`, `lib/db/`, `lib/inngest/`, `lib/tokens/`, `lib/copy-slots/`, `templates/t01-aurora/`, `templates/registry.ts`, `app/api/inngest/route.ts`, `lib/env.ts`, `lib/config.ts`, `eslint.config.mjs`, `knip.jsonc`, `.github/workflows/ci.yml`, `playwright.config.ts`, `e2e/brief.spec.ts`, ADRs 0002 to 0008, `PRODUCT.md`, `docs/home-page-plan.md` section 8 and `docs/start-page-plan.md`.

| Area                                                               | State                                                                                                                                                                                                                            | What it means for this plan                                                                    |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| The form                                                           | Five questions on `/start`, `useReducer`, URL per question, `sessionStorage` draft, per-question zod, one Server Action `submitBrief` that validates and returns a random id. Files stay in browser memory; only names are sent. | The seam is `app/start/_components/actions.ts`. Uploads do not exist yet.                      |
| The done page                                                      | `BriefDone` with a five-minute ring, three dashed slots, `useDesigns` polling `getDesigns(briefId)` every 10 s, `DesignsStatus` type in `lib/brief/designs.ts`.                                                                  | The shape is right. It needs a slug, a server deadline and real status.                        |
| Database                                                           | Neon (London), `lib/db/client.ts` on the HTTP driver, one scaffold table `briefs` with one applied migration.                                                                                                                    | Replace `briefs` with `lead`, `seen`, `submission`.                                            |
| Inngest                                                            | Client in `lib/inngest/client.ts`, serve route with `functions: []`, `inngest@4.18.1` installed (`eventType`, `step.sleepUntil`, function-level `idempotency` all present).                                                      | Add the functions.                                                                             |
| Env                                                                | All nine variables set in `.env.local`, validated by `lib/env.ts`, placeholders in CI.                                                                                                                                           | Nothing to add for slice 1.                                                                    |
| Template contract                                                  | `lib/tokens/types.ts` (fourteen token names, `ContrastPair`), `lib/copy-slots/validate.ts` (`slotViolation`), `TemplateMeta` (id, name, description), ten-tuple registry.                                                        | Needs readiness, polarity, tone tags, a copy schema, a fallback and an assembler per template. |
| Aurora                                                             | Seven sections, `AuroraContent`, `AURORA_SLOTS`, `AURORA_COUNTS`, `AURORA_CONTRAST_PAIRS`, `auroraViolations`, example content and route, a scoped stylesheet. Accepts either logo polarity.                                     | The renderer is done. The content object is what the pipeline must produce.                    |
| Colour engine, identity, select, ai, images, logo, upload, preview | Do not exist. `culori`, `@anthropic-ai/sdk`, `@vercel/blob` are not installed. `sharp` is.                                                                                                                                       | The bulk of the work.                                                                          |
| Lint                                                               | Templates may import only `@/lib/tokens/*` and `@/lib/copy-slots/*`; `lib` may not import `@/templates`; pure modules may not import IO.                                                                                         | One exception is needed so the pipeline can read the registry (section 9).                     |
| Working tree                                                       | Aurora, ADR 0007, ADR 0008, the tokens and copy-slots modules and the new migration are uncommitted on `feat/home-page`.                                                                                                         | Commit that work first, on its own, before any of this starts.                                 |

---

## 3. Where the guide and the code disagree, and what this plan does

The guide was written for a five-route form that fires a stage after each step. ADR 0004 replaced that with one page and one submit. These are the consequences, decided here so they are not decided ad hoc in code.

| Guide                                                                                           | Code today                                                   | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lead created at step 1, brief stage at step 2, select at 3, imagery at 4, tokens at 5.          | One Server Action with every answer.                         | One event, `pipeline/submission.created`, carrying the slug. One function runs every stage as steps, in dependency order, with copy and imagery in parallel. The five stage columns stay, because the done page reveals per stage.                                                                                                                                                                                                      |
| Step 4 is "upload imagery or pick a style".                                                     | A style is always chosen; up to six own photos are optional. | Own photos replace the Pexels search. The style always shapes the query and the type pairing.                                                                                                                                                                                                                                                                                                                                           |
| Identity first, sentence second.                                                                | Sentence first, identity second (ADR 0004).                  | Keep the code's order. The identity hash is computed at submit.                                                                                                                                                                                                                                                                                                                                                                         |
| Three concepts, always.                                                                         | One ready template.                                          | The concept count is `min(CONFIG.templates.conceptsShown, READY_TEMPLATES.length)`, computed in one place (`lib/select/select.ts`) and recorded on the submission row. When ten templates are ready the `min` is a no-op and is removed. The done page draws that many slots.                                                                                                                                                           |
| Exclusivity by `SELECT ... FOR UPDATE` over the WebSocket driver.                               | HTTP driver only.                                            | Lock-free: one multi-row `INSERT` into `seen`, whose composite primary key makes a duplicate reveal impossible. A unique violation aborts the whole statement, so the loser re-reads `seen`, re-selects, and after `CONFIG.exclusivity.attempts` gives up. No second driver, no lock, same guarantee. `seen` gains a `slug` column so a retried step can tell its own rows from another submission's. Recorded in the ADR (section 20). |
| Copy is one call for all three templates.                                                       | Templates have their own content types (ADR 0008).           | One call per template, in parallel steps, each validated, retried once and fallen back on its own. A bad output for one template cannot sink the others.                                                                                                                                                                                                                                                                                |
| `/api/status` route polled every 2.5 s.                                                         | `getDesigns` Server Action polled every 10 s.                | Keep the Server Action (rename to `getSubmissionStatus`), lower the interval to `CONFIG.polling.statusMs` (3 s). A GET route can replace it later if the POST cost shows in the logs.                                                                                                                                                                                                                                                   |
| Countdown starts when step 5 is submitted.                                                      | Countdown starts when the done component mounts.             | The server sets `deadline_at` at submission time and returns it. The ring counts down to that instant, so a refresh or a shared link shows the truth.                                                                                                                                                                                                                                                                                   |
| Preview: desktop scaled DOM previews, mobile thumbnails, OG image, Resend email, Cal.com embed. | Nothing.                                                     | Slice 3 ships `/preview/[slug]/[templateId]`, one concept full page with a slim studio bar. Slice 6 ships the hub at `/preview/[slug]`, the OG image and the email. Thumbnails wait for more than one template.                                                                                                                                                                                                                         |
| Models: `claude-sonnet-5` for brief and copy, `claude-haiku-4-5` for ranking.                   |                                                              | Keep the guide's choice. Sonnet 5 is $2 per million input tokens and $10 output; Haiku 4.5 is $1 and $5. Opus 5 ($5 and $25) is the SDK's default recommendation and would roughly double the per-submission cost for copy that must then be truncated to slot limits anyway. Owner decision 5.                                                                                                                                         |

---

## 4. The flow, end to end

```
browser                         server (Next)                    Inngest                      Neon / Blob / APIs
-------                         -------------                    -------                      ------------------
pick logo/photo ──── upload() ──► /api/upload token route ─────────────────────────────────► Blob (content-addressed)
answer 5 questions
submit ──────────── submitBrief ─► validate (zod)
                                   identity = HMAC(email)
                                   payload hash
                                   upsert lead ─────────────────────────────────────────────► lead
                                   insert submission or hit ───────────────────────────────► submission (payload_hash unique)
                                   send pipeline/submission.created ─► build-concepts (idempotent on slug)
                                   ◄ { slug, deadlineAt, conceptCount }        ├ logo: fetch blob, sharp, polarity, PNG ──► Blob
done page polls ─── getSubmissionStatus(slug) ◄─ row              ├ select: eligible, unseen, seeded shuffle, INSERT seen
                                                                    ├ tokens: deriveTokens (culori), AA solved
                                                                    ├ brief: Sonnet 5 structured output, or fallback
                                                                    ├ copy ×N: Sonnet 5 per template, validate, retry, fallback
                                                                    └ imagery: own photos, or Pexels → Haiku rank → sharp → Blob
                                                                  sweep-deadline: sleepUntil(deadline − 45 s), force fallbacks
open /preview/[slug]/[templateId] ─► page reads the row only ─► tokens as CSS variables, fonts, template component
```

Every arrow into Neon from the pipeline is a conditional update on a stage column (`WHERE stage_x IN ('pending','running')`), so the main function and the sweeper can never overwrite each other. Whoever lands first wins, and the page renders identically on every later visit.

---

## 5. Data model

Three tables, as the guide, with the columns the single-submit flow needs. Drizzle `text({ enum })` for the small unions (a TypeScript union, no Postgres enum), `jsonb().$type<>()` for the structured columns, every jsonb validated by zod when read into the pipeline or the page.

```ts
// lib/db/schema.ts
lead        identity_hash text PK, email text, name text, company text,
            created_at timestamptz, updated_at timestamptz

seen        identity_hash text, template_id text, slug text, created_at timestamptz
            PRIMARY KEY (identity_hash, template_id)

submission  slug text PK (12 chars, base32 from 9 random bytes, 72 bits)
            identity_hash text (FK lead), payload_hash text UNIQUE
            answers jsonb            SubmissionAnswers: description, company, logo, imagery, colours
            concept_count int        min(conceptsShown, ready) at creation
            template_ids text[]      null until select lands; [] means exhausted
            logo jsonb               LogoAnalysis | null
            brief jsonb              BrandBrief | null
            tokens jsonb             TokenSet | null
            copy jsonb               Record<templateId, unknown>   validated per template at render
            imagery jsonb            Record<templateId, ImagerySet>
            stage_select, stage_tokens, stage_brief, stage_copy, stage_imagery
                                     'pending' | 'running' | 'done' | 'fallback' | 'failed'
            deadline_at timestamptz, event_sent_at timestamptz | null
            created_at timestamptz
```

Notes.

- `failed` exists only for the two stages that have no fallback (select and tokens). The done page then says so honestly and the owner sees the failed run in Inngest. It should never happen; it must not be invisible if it does.
- `event_sent_at` closes the one gap in "insert then send": if the send fails, the action throws, the visitor retries, the payload hash hits, and the action sends again because the column is null. Inngest's function-level `idempotency: 'event.data.slug'` makes a double send harmless for 24 hours.
- Name and email live only on `lead`. The submission holds the answers the pipeline needs, which include the company and the visitor's own sentence. Nothing personal is ever logged (`lib/log.ts` rule).
- Migration `0001`: drop `briefs` (scaffold, never held data), create the three tables. Generated with `pnpm db:generate`, reviewed, applied with `pnpm db:migrate`.

Derived, never stored: a concept is `ready` when `stage_select`, `stage_tokens`, `stage_copy` and `stage_imagery` are each `done` or `fallback` (the brief only feeds copy, so it is not on the visitor's path). The submission is `ready` when every concept is, `exhausted` when `template_ids` is `[]`, `failed` when select or tokens failed, else `building`.

---

## 6. Modules and files

Every new module lands with the code that imports it, so `knip` stays clean without new entries. Entries removed from `knip.jsonc` as they gain consumers: `lib/db/client.ts`, `lib/db/schema.ts`, `templates/*/index.tsx`, and `sharp` from `ignoreDependencies`.

| Path                                                                        | Responsibility                                                                                                                                                                                                                                                                                                                                                                  | Pure or IO    |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `lib/identity/hmac.ts`                                                      | `identityHashFrom(email)`: HMAC-SHA256 of trimmed, lowercased email with `env.HMAC_SECRET`.                                                                                                                                                                                                                                                                                     | IO (env only) |
| `lib/identity/payload.ts`                                                   | `payloadHashFrom(identityHash, answers)`: SHA-256 over a canonical JSON of the normalised answers (description with whitespace collapsed, company trimmed, logo sha, style, sorted photo shas, palette id or six-digit hex). Name excluded: the pipeline never reads it.                                                                                                        | Pure          |
| `lib/identity/slug.ts`                                                      | `newSlug()`: 12 base32 characters from `crypto.randomBytes(9)`.                                                                                                                                                                                                                                                                                                                 | Pure          |
| `lib/brief/submission.ts`                                                   | `SubmissionAnswers` zod schema: the server-side shape of the answers with blob URLs and shas, derived from `briefSchema`.                                                                                                                                                                                                                                                       | Pure          |
| `lib/brief/status.ts`                                                       | `SubmissionStatus` type (replaces `designs.ts`): `building`, `ready`, `exhausted`, `failed`, `missing`, with `deadlineAt`, `conceptCount`, and `concepts: { templateId, name, ready, url }[]`.                                                                                                                                                                                  | Pure          |
| `lib/db/leads.ts`                                                           | `upsertLead(identityHash, { email, name, company })`.                                                                                                                                                                                                                                                                                                                           | IO            |
| `lib/db/submissions.ts`                                                     | `createOrFindSubmission`, `readSubmission(slug)`, `markStage(slug, stage, from, to, patch)` (the conditional update), `markEventSent`.                                                                                                                                                                                                                                          | IO            |
| `lib/db/exclusivity.ts`                                                     | `revealTemplates(identityHash, slug, choose)`: read `seen`, call the pure chooser, `INSERT` the rows, retry on `23505`, return the ids or `exhausted`.                                                                                                                                                                                                                          | IO            |
| `lib/select/select.ts`                                                      | `selectTemplates({ ready, seen, polarity, count, seed })`: filter by readiness, unseen and polarity affinity, sort by id, seed a PRNG from the payload hash, Fisher-Yates, greedy pick for tone-tag diversity. `conceptCountFor(readyCount)`.                                                                                                                                   | Pure          |
| `lib/select/prng.ts`                                                        | A small seeded PRNG (mulberry32) so the same hash always gives the same order.                                                                                                                                                                                                                                                                                                  | Pure          |
| `lib/tokens/derive.ts`                                                      | `deriveTokens(hex, scheme, pairs)`: OKLCH, hue locked, fixed lightness ramp, chroma clamped to sRGB, surfaces tinted with the hue at low chroma, every pair solved to AA. Throws when a pair cannot reach AA at lightness 0 and 1.                                                                                                                                              | Pure          |
| `lib/tokens/contrast.ts`                                                    | `solvePair(text, background, min)`: shift the text's lightness in 0.02 steps, allow a polarity flip for text on brand.                                                                                                                                                                                                                                                          | Pure          |
| `lib/tokens/scheme.ts`                                                      | `schemeFor(style, polarity)`: `dark` style gives a dark surface; light artwork gives a dark surface; otherwise light.                                                                                                                                                                                                                                                           | Pure          |
| `lib/tokens/css.ts`                                                         | `tokenStyle(tokens)`: the `TokenSet` as a `CSSProperties` object of `--surface` and friends, for the preview root.                                                                                                                                                                                                                                                              | Pure          |
| `lib/tokens/types.ts`                                                       | Adds `TokenSet = Readonly<Record<TokenName, string>>`, `Scheme`, `LogoPolarity`.                                                                                                                                                                                                                                                                                                | Pure          |
| `lib/copy-slots/template-meta.ts`                                           | `TemplateMeta` gains `ready`, `polarity: 'either' \| 'dark-artwork' \| 'light-artwork'`, `tones: readonly string[]`.                                                                                                                                                                                                                                                            | Pure          |
| `lib/copy-slots/contract.ts`                                                | `TemplateContract<TCopy, TContent>`: `meta`, `copySchema` (zod), `contrastPairs`, `violations(content)`, `fallbackCopy(brief)`, `assemble(copy, assets)`. The shape every template exports.                                                                                                                                                                                     | Pure          |
| `lib/copy-slots/rules.ts`                                                   | `ruleViolations(text)`: numerals, superlatives, award and client-name patterns, the words the product bans. Shared by every template's validation.                                                                                                                                                                                                                              | Pure          |
| `lib/copy-slots/fit.ts`                                                     | `fitToSlot(text, slot, filler)`: truncate at a word boundary to `max`, extend with the filler to `min`. Used by every fallback.                                                                                                                                                                                                                                                 | Pure          |
| `lib/copy-slots/brief.ts`                                                   | `BrandBrief` zod schema: positioning, audience, tone words, three headline candidates, three value props, three steps, one statement, two image queries per slot kind. `fallbackBrief(company, description)`.                                                                                                                                                                   | Pure          |
| `lib/logo/analyse.ts`                                                       | `analyseLogo(bytes)`: sharp to 128 px, `ensureAlpha`, raw buffer, alpha-weighted mean luminance ignoring alpha under 16, border-ring sample for an opaque backdrop, polarity thresholds from `CONFIG.logo`.                                                                                                                                                                     | IO (sharp)    |
| `lib/logo/normalise.ts`                                                     | `normaliseLogo(bytes)`: any accepted input (SVG included) to a transparent PNG at most `CONFIG.logo.maxPx` tall, with width and height. Failure returns `null` and the template gets the wordmark.                                                                                                                                                                              | IO (sharp)    |
| `lib/ai/client.ts`                                                          | The one Anthropic client, `apiKey` from `env`, `timeout` per call from `CONFIG.stageBudgetMs`.                                                                                                                                                                                                                                                                                  | IO            |
| `lib/ai/brief.ts`                                                           | `writeBrief(answers)`: `messages.parse` with `zodOutputFormat(briefSchema)`, `claude-sonnet-5`, thinking disabled, no effort set (ADR 0011, amended). Paraphrase only; invent no numbers, awards, clients or claims.                                                                                                                                                            | IO            |
| `lib/ai/copy.ts`                                                            | `writeCopy(brief, contract)`: `messages.parse` with the template's `copySchema`, the slot table with limits and purposes in the prompt, one retry carrying the violations, then `Result` err so the caller falls back.                                                                                                                                                          | IO            |
| `lib/ai/rank.ts`                                                            | `rankImages(candidates, purpose)`: `claude-haiku-4-5`, 8 to 12 image URL blocks, structured output of scores and rejections (watermarks, text, busy, single portraits).                                                                                                                                                                                                         | IO            |
| `lib/images/pexels.ts`                                                      | `searchPhotos(query, orientation, perPage)` against `api.pexels.com`, response validated by zod, `X-Ratelimit-Remaining` logged.                                                                                                                                                                                                                                                | IO            |
| `lib/images/rehost.ts`                                                      | `rehostImage(url, credit)`: download, sharp to the `CONFIG.images.variants` widths as WebP, upload to Blob, return `{ src, width, height, dominant, credit }`. Own photos go through the same function from their blob URL.                                                                                                                                                     | IO            |
| `lib/images/types.ts`                                                       | `HostedImage`, `ImagerySet = Record<slotName, HostedImage \| null>`.                                                                                                                                                                                                                                                                                                            | Pure          |
| `lib/inngest/events.ts`                                                     | `submissionCreated = eventType('pipeline/submission.created', { schema: z.object({ slug }) })`.                                                                                                                                                                                                                                                                                 | Pure          |
| `lib/inngest/functions/build-concepts.ts`                                   | The stage function (section 7).                                                                                                                                                                                                                                                                                                                                                 | IO            |
| `lib/inngest/functions/sweep-deadline.ts`                                   | The sweeper (section 7).                                                                                                                                                                                                                                                                                                                                                        | IO            |
| `lib/inngest/stages.ts`                                                     | `runStage(slug, stage, work, fallback)`: mark running, run, mark done with the patch; on error log, run the fallback, mark fallback. One shape for every stage.                                                                                                                                                                                                                 | IO            |
| `lib/preview/concepts.ts`                                                   | `conceptsFrom(row)`: the row into `SubmissionStatus` and, per ready concept, the assembled content. Used by the status action and the preview pages.                                                                                                                                                                                                                            | Pure          |
| `templates/registry.ts`                                                     | Now exports `TEMPLATES` as contracts, `READY_TEMPLATES`, `contractFor(id)`. Metadata and schemas only, never a component. The one template file `lib` may import.                                                                                                                                                                                                               | Pure          |
| `templates/render.tsx`                                                      | `renderTemplate(id, content)`: id to component. Imported only by `app/preview`.                                                                                                                                                                                                                                                                                                 | React         |
| `templates/t01-aurora/contract.ts`                                          | Aurora's `TemplateContract`: `auroraCopySchema` (text slots only), `auroraFallbackCopy(brief)`, `assembleAurora(copy, assets)` with the fixed link plan (nav to section ids, CTA to `#start`).                                                                                                                                                                                  | Pure          |
| `templates/t01-aurora/meta.ts`                                              | `ready: true`, `polarity: 'either'`, `tones: ['luminous', 'saas', 'confident']`.                                                                                                                                                                                                                                                                                                | Pure          |
| `app/api/upload/route.ts`                                                   | `handleUpload` from `@vercel/blob/client`. Token issued only for pathnames matching `^(logos\|photos)/[a-f0-9]{64}\.(png\|jpg\|jpeg\|webp\|svg)$`, allowed content types, `maximumSizeInBytes: CONFIG.form.maxUploadBytes`, `addRandomSuffix: false`, `allowOverwrite: false` (ADR 0017). `onUploadCompleted` is not used: it cannot reach localhost and nothing depends on it. | IO            |
| `app/start/_components/actions.ts`                                          | `submitBrief`: validate, identity, payload hash, upsert lead, create or find submission, send event, return `{ slug, deadlineAt, conceptCount }`. `getSubmissionStatus(slug)`. Validate, delegate, respond.                                                                                                                                                                     | IO            |
| `app/start/_components/use-uploads.ts`                                      | Client: sha-256 with `crypto.subtle`, `upload()` to the token route, per-file `uploading \| done \| failed`.                                                                                                                                                                                                                                                                    | Client        |
| `app/preview/[slug]/[templateId]/page.tsx`                                  | One concept, full page: reads the row, validates the copy with the contract, sets tokens and fonts on the root, renders the template under a slim studio bar. `noindex`. Dynamic, never cached.                                                                                                                                                                                 | Server        |
| `app/preview/[slug]/page.tsx`                                               | Slice 6: the hub with one card per concept and the book-a-call end state.                                                                                                                                                                                                                                                                                                       | Server        |
| `app/preview/_components/studio-bar.tsx`, `fonts.ts`, `concept-pending.tsx` | The bar (all designs, n of N, book a call), the four `next/font/google` pairs keyed by style, and the polling placeholder for a concept opened early.                                                                                                                                                                                                                           | Mixed         |
| `scripts/erase-identity.ts`                                                 | Delete a lead, its submissions and its blobs by email (step 15's erasure). During testing it also resets an exhausted test email.                                                                                                                                                                                                                                               | Script        |
| `vercel.json`                                                               | `{ "regions": ["lhr1"] }` so functions sit beside the database.                                                                                                                                                                                                                                                                                                                 | Config        |

---

## 7. The pipeline

### `build-concepts`

```ts
createFunction(
  { id: 'build-concepts', retries: 1, idempotency: 'event.data.slug', triggers: [submissionCreated] },
  async ({ event, step }) => { ... }
)
```

`retries: 1` applies to each step: one retry, then the stage's fallback, as the guide asks. Each step's result is memoised by Inngest, so a retry of a later step never re-runs an AI call. Every AI call carries the SDK `timeout` from `CONFIG.stageBudgetMs`, because a step has no timeout of its own.

| Step           | Depends on                  | Does                                                                                                                                                                                             | Writes                                          | Fallback                                                                                                              |
| -------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `load`         |                             | Read the submission, validate `answers`. Throw `NonRetriableError` if missing.                                                                                                                   |                                                 | none, throws                                                                                                          |
| `logo`         | load                        | If the logo is a file: fetch the blob, `normaliseLogo`, `analyseLogo`, upload the PNG. If a wordmark: `polarity: 'either'`.                                                                      | `logo`                                          | `null` logo, wordmark, polarity `mixed`, logged                                                                       |
| `select`       | logo                        | `revealTemplates` with the chooser seeded from the payload hash. `[]` means exhausted.                                                                                                           | `template_ids`, `stage_select`                  | none. `failed` after the retry.                                                                                       |
| `tokens`       | logo (parallel with select) | `schemeFor(style, polarity)`, `deriveTokens(hex, scheme, union of the chosen contracts' pairs)`.                                                                                                 | `tokens`, `stage_tokens`                        | none. `failed` after the retry.                                                                                       |
| `brief`        | load (parallel with logo)   | `writeBrief`.                                                                                                                                                                                    | `brief`, `stage_brief`                          | `fallbackBrief(company, description)`                                                                                 |
| `copy:<id>` ×N | select, brief               | `writeCopy(brief, contract)`; validate with `contract.violations` and `ruleViolations`; one retry with the violations; else `Result` err.                                                        | `copy[id]`, `stage_copy` when all N have landed | `contract.fallbackCopy(brief)`                                                                                        |
| `imagery`      | select, brief               | Own photos: `rehostImage` each, assign to slots in order. None: for each slot kind, `searchPhotos` with the brief's query plus the style's modifier, `rankImages`, take the best, `rehostImage`. | `imagery[id]` per template, `stage_imagery`     | own photos in Pexels relevance order without ranking; with no photos and no Pexels, `null` slots (Aurora draws light) |

Parallelism: `Promise.all([logoThenSelectAndTokens, brief])`, then `Promise.all([...copySteps, imageryStep])`. Inngest runs parallel steps as separate invocations, so the wall clock is roughly logo plus the longest of copy and imagery.

Exhausted: `select` writes `template_ids = []`, every other stage is marked `done` with nothing to do, and the function returns. The status is `exhausted` and the done page shows the book-a-call state.

### `sweep-deadline`

Same trigger. `step.sleepUntil('deadline', deadlineAt - CONFIG.deadline.sweeperLeadMs)`, then one step that reads the row and, for each stage still `pending` or `running`, writes the fallback with the same conditional update the main function uses. The copy fallback needs the brief; if the brief has not landed, it uses `fallbackBrief` too. The imagery fallback is `null` slots. Select and tokens have no fallback and are marked `failed`. Every forced stage is logged as `stage.swept` with `slug` and `stage`, because a rising count is the guide's signal that a stage is unreliable.

### Idempotency and retries, stated exactly

- Same visitor, same answers: `payload_hash` hits, the stored slug is returned, no event is sent unless `event_sent_at` is null.
- Same event twice: `idempotency: 'event.data.slug'` drops the second for 24 hours.
- A step retried after it wrote to the database: `markStage` is conditional, `seen` rows carry the slug, the PNG and image uploads overwrite the same content-addressed path. Nothing doubles.
- A step retried before it wrote: it runs again. AI calls are the only cost, capped at two attempts by `retries: 1`.

### Local development

`npx inngest-cli@latest dev -u http://localhost:3000/api/inngest` beside `pnpm dev`, with `INNGEST_DEV=1` in `.env.local` so the SDK talks to the dev server (the SDK reads that variable itself; `lib/env.ts` does not need it). The serve route exports `maxDuration = 300` and passes `streaming: true`. On Vercel the Inngest integration syncs the app on deploy.

---

## 8. The template contract, extended

ADR 0008 made a template a function of one content object. The pipeline needs four more things from every template, all pure and all in files `lib` may reach through the registry:

1. **`copySchema`**: the text slots as a zod object, and nothing else. For Aurora that is `AuroraContent` minus `logo`, every `href`, and both images: brand name and tagline, nav labels, hero headline, subhead, labels, reassurance, frame title and rows, features, steps, statement text, cta, footer groups. Structured output gives back exactly this shape; `auroraViolations` and `ruleViolations` then judge it.
2. **`fallbackCopy(brief)`**: deterministic copy from the brief (which is itself deterministic from the company and the sentence when the AI failed), every slot passed through `fitToSlot` so the result always satisfies `violations`. A test proves it for the fallback brief of a two-word company and a 30-character sentence, and for the longest allowed sentence.
3. **`assemble(copy, assets)`**: the copy plus `{ logo, images }` plus the fixed link plan into the full content object. Hrefs are never generated: nav links go to the section ids, the calls to action to `#start`, footer links to `#top`. The result is what the component receives.
4. **`meta.ready`, `meta.polarity`, `meta.tones`**: readiness so nine placeholders are never chosen, polarity so the selector can honour the guide's affinity rule, tones so three chosen templates feel different.

The registry becomes a tuple of `TemplateContract` values and exports `READY_TEMPLATES`. The compile-time count check and the runtime unique-id check stay. `templates/render.tsx` maps ids to components and is imported only by the preview pages, so the pipeline's bundle never contains React sections.

---

## 9. Boundaries

One lint change, recorded in the ADR: `lib/select/**`, `lib/inngest/**`, `lib/ai/**` and `lib/preview/**` may import `@/templates/registry` and nothing else under `@/templates`. The standards already name the registry as "the only file `lib/select` imports from the template layer"; the current regex bans all of `templates`. In return, `templates/registry.ts` and every `contract.ts` are checked by a second regex: they may not import `./index` or any `sections/` file, so the registry stays free of React.

Everything else stands: templates import only `lib/tokens` and `lib/copy-slots` (plus `zod`, a package); no hex or palette classes in templates; Anthropic only in `lib/ai`; Pexels only in `lib/images`; `process.env` only in `lib/env.ts`.

---

## 10. Uploads

- **When**: at pick time, in the background, so the file is on Blob before the visitor reaches question five and submit is instant. The Next button on questions three and four waits for that question's uploads with "Uploading your logo" beside it; a failed upload shows the existing inline error and the file can be picked again.
- **Where**: content-addressed. The browser hashes the file with `crypto.subtle.digest('SHA-256')` and asks for the token for `logos/<sha>.<ext>` or `photos/<sha>.<ext>`. The token route checks the pattern, the content type and the size. Identical files share one blob, an identical resubmission hashes identically, and a retried upload is idempotent.
- **What the answers carry**: `logo: { kind: 'file', fileName, url }` and `imagery.photos: { fileName, url }[]` (replacing `fileNames`). Blob URLs are durable, so the `hydrate` case in the reducer no longer drops the logo and photos on refresh. The sketch keeps using its object URLs while the file is in memory and falls back to the blob URL after a refresh.
- **Accepted types**: unchanged (PNG, JPEG, SVG, WebP for the logo; PNG, JPEG, WebP for photos). HEIC waits for a real iPhone in hand; iOS Safari converts HEIC to JPEG for a picker that does not accept HEIC, which is to be verified on a device before the launch checklist.
- **SVG**: accepted, never served. The logo step rasterises it to PNG with sharp, which neutralises scripts and gives `next/image` a raster with known dimensions. A failed rasterisation gives the wordmark.
- **Size**: `CONFIG.form.maxUploadBytes` (6 MB) end to end; the Server Action never receives a file, so the 1 MB action body limit is untouched.
- **`next.config.ts`**: `images.remotePatterns` for the project's Blob host.

---

## 11. The colour engine (gate)

The guide's step 5, built before any AI, gated by the corpus.

- Input: the brand hex (a palette's or the visitor's), the scheme, the union of contrast pairs of the chosen templates.
- Ramp: brand at the visitor's lightness clamped into a working band, `brand-deeper` and `brand-deepest` as fixed steps down (light scheme) or up (dark scheme) in OKLCH with hue locked, chroma clamped into sRGB with `clampChroma`. Surfaces are the scheme's near-white or near-black tinted with the brand hue at very low chroma; `border`, `accent`, `surface-muted` are steps from the surface. `glow` is the brand at high lightness and chroma; `glow-secondary` is the hue rotated by `CONFIG.colour.glowHueShift`. `scrim` is a fixed near-black; `on-scrim` white.
- Solving: for each pair, `wcagContrast`; while under `CONFIG.contrast.minRatio`, move the text token's lightness by 0.02 away from the background; for `on-brand` on `brand-deeper` allow the flip from white to near-black. Throw `AppError` if a pair fails at both ends. Brand hue never moves.
- Corpus (`lib/tokens/derive.test.ts`): `#FFFF00`, `#808080`, `#00FF00`, `#FF00FF`, `#000000`, `#FFFFFF`, `#FEFEFE`, `#010101`, the four palettes, `#2e8c9c`, and out-of-gamut OKLCH values, each against `AURORA_CONTRAST_PAIRS` in both schemes. Every entry passes AA or throws deliberately.
- `tokenStyle(tokens)` returns the `CSSProperties` the preview root sets, exactly as `app/examples/aurora/page.tsx` does by hand. The example page switches to `deriveTokens('#f59e4a', 'dark', AURORA_CONTRAST_PAIRS)` so the engine is exercised on the design review route too.
- Type: `TYPE_PAIRS` keyed by style in `app/preview/_components/fonts.ts`, each a display and a body face from `next/font/google` at module scope. Deterministic, not AI, per the guide's rule.

---

## 12. The AI stages

Verified against the Anthropic SDK reference bundled with this session: structured outputs are `client.messages.parse` with `output_config.format: zodOutputFormat(schema)` from `@anthropic-ai/sdk/helpers/zod`; adaptive thinking is `thinking: { type: 'adaptive' }` with `output_config.effort`; Haiku 4.5 takes image URL blocks directly. `zodOutputFormat` with zod 3.25 is to be verified at install (the guide pins 3.25 for this reason).

| Call  | Model              | Input                                                                                                                                                                                   | Output                                                | Budget and effort                |
| ----- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | -------------------------------- |
| brief | `claude-sonnet-5`  | A stable system prompt (too short to cache; ADR 0011, amended), then the company, the sentence and the style.                                                                           | `BrandBrief`                                          | 20 s, thinking off               |
| copy  | `claude-sonnet-5`  | The same system prompt, the brief, the template's slot table (path, min, max, one line on what the slot is for), the rules. Retry message: the first output and the list of violations. | the template's `copySchema`                           | 60 s per attempt, thinking off   |
| rank  | `claude-haiku-4-5` | 8 to 12 `src.small` URLs from Pexels with the slot's purpose and the style.                                                                                                             | `{ scores: { id, score, reject: reason \| null }[] }` | 90 s for the whole imagery stage |

Rules in the prompt, enforced again in code: paraphrase the visitor's sentence only; invent no numbers, awards, clients, locations or claims; British English; second person; sentences under 20 words; no superlatives. `ruleViolations` rejects numerals, "best", "leading", "award", "trusted by", "clients include" and any capitalised word that is not the company name and did not appear in the sentence. The model does not honour lengths, so `violations` is the judge and `fitToSlot` is the last resort.

Cost at these settings is inside the guide's $0.04 to $0.06 per submission for three templates. With one template it is about a third of that.

---

## 13. Imagery

- Own photos: already on Blob. `rehostImage` reads each from its URL, makes the WebP variants, records width, height and dominant OKLCH, and assigns them to the template's slots in the order the visitor added them. No Pexels, no ranking, no credit line.
- No photos: for each slot kind (Aurora has `hero` and `statement`), one Pexels search with the brief's query for that kind plus the style's modifier ("natural light" for warm, "minimal" for minimal, "vivid" for bold, "moody" for dark), landscape, `per_page: CONFIG.images.perPage`. Normalised queries are cached in a `pexels_cache` step result for 24 hours only if the rate limit becomes a problem; the guide's default of 200 per hour is ample for the first weeks.
- Ranking rejects watermarks, embedded text, busy compositions and identifiable single-subject portraits (the product forbids stock people). The fallback is relevance order with the same rejections skipped by nothing, which is acceptable because Aurora's statement scrim keeps the text readable over any photograph.
- Credits: photographer name and profile URL per image; the footer prints them with the Pexels link. Recorded in `HostedImage.credit`.
- Scrim: Aurora's statement uses the `scrim` token in a fixed gradient that is solid under the words. `on-scrim` on `scrim` is a declared pair and always passes. The guide's per-image scrim opacity solver is deferred until a template has text over an unscrimmed photograph.

---

## 14. The client

- `submitBrief` returns `{ slug, deadlineAt, conceptCount }`. The reducer's `done` status holds all three; `hrefFor(DONE)` is unchanged.
- `useCountdown(deadlineAt)` counts to the server's instant, so a refresh shows the true remaining time. The ring's states (building, ready, nearly there) are unchanged.
- `useSubmissionStatus(slug)` replaces `useDesigns`, polling `getSubmissionStatus` every `CONFIG.polling.statusMs`, pausing when hidden, stopping on `ready`, `exhausted`, `failed` or `missing`.
- `DesignSlots` draws `conceptCount` slots. A slot names its template once select lands ("Aurora"), shows "building" until the concept is ready, then becomes the link to `/preview/[slug]/[templateId]`. `exhausted` swaps the slots for the book-a-call state; `failed` for one honest sentence and the same button.
- `BriefDone` keeps its greeting and the email line. The `TrackedLink` to Cal.com stays.
- Analytics: `brief_complete` stays; the server sends `lead_created` and `preview_ready` through `@vercel/analytics/server` from the action and the function.

---

## 15. The preview page

`app/preview/[slug]/[templateId]/page.tsx`:

1. Read the row by slug; `notFound()` if missing or if the template id is not in `template_ids`.
2. If the concept is not ready, render the studio bar and `ConceptPending`, a client leaf that polls the same status action and calls `router.refresh()` when the concept lands.
3. If ready: `contractFor(templateId)`, validate `copy[templateId]` with `copySchema`, `assemble` with the hosted logo and images, `tokenStyle(tokens)` and the style's font pair on the root, `renderTemplate`.
4. Metadata: `robots: noindex`, title "{Company}, design {n} of {N}". The OG image comes in slice 6.

The studio bar is the only PinnaclePX chrome on the page: back to all designs, "Design 1 of 1" (or "of 3"), and Book a call. It sits on the site's own tokens, which the template root does not inherit because the template root sets every variable itself.

The page is dynamic by nature (params plus a database read) and carries no `use cache`, per the standards.

---

## 16. Config and env

Additions to `lib/config.ts`, every one named here and nowhere else:

```ts
stageBudgetMs: { brief: 20_000, select: 5_000, copy: 60_000, imagery: 90_000, tokens: 1_000 }  // the guide's numbers
deadline: { totalMs: 300_000, sweeperLeadMs: 45_000 }
polling: { statusMs: 3_000 }   // replaces designsMs
exclusivity: { attempts: 3 }
logo: { samplePx: 128, alphaFloor: 16, darkBelow: 0.35, lightAbove: 0.65, maxPx: 512, borderRingPx: 4 }
contrast: { minRatio: 4.5, stepL: 0.02 }
colour: { surfaceChroma: 0.01, glowHueShift: 60 }   // tuned on the example page
copy: { retries: 1 }
images: { perPage: 12, candidates: 10, variants: [640, 1280, 1920], format: 'webp' }
ai: { models: { brief: 'claude-sonnet-5', copy: 'claude-sonnet-5', rank: 'claude-haiku-4-5' }, maxTokens: { brief: 4_000, copy: 6_000, rank: 1_000 } }
```

No new environment variables. `INNGEST_DEV=1` goes into `.env.local` and `.env.example` with a comment; it is the SDK's own switch.

---

## 17. Tests

| Kind        | File                                                           | Proves                                                                                                                                                                                                                                                                                                                                               |
| ----------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit        | `lib/identity/hmac.test.ts`, `payload.test.ts`                 | Case and whitespace normalisation; name excluded; photo order irrelevant; a different logo sha changes the hash.                                                                                                                                                                                                                                     |
| Unit        | `lib/select/select.test.ts`                                    | Same seed, same templates; seen ids never chosen; polarity filter; `conceptCountFor`; exhausted when fewer than the count remain; tone diversity when possible.                                                                                                                                                                                      |
| Unit        | `lib/tokens/derive.test.ts`                                    | The corpus, both schemes, every Aurora pair at AA or a deliberate throw; hue preserved within tolerance.                                                                                                                                                                                                                                             |
| Unit        | `lib/tokens/scheme.test.ts`                                    | The style and polarity table.                                                                                                                                                                                                                                                                                                                        |
| Unit        | `lib/copy-slots/rules.test.ts`, `fit.test.ts`, `brief.test.ts` | The banned patterns, the word-boundary truncation and filler, the fallback brief for the shortest and longest sentences.                                                                                                                                                                                                                             |
| Unit        | `templates/t01-aurora/contract.test.ts`                        | `fallbackCopy` of the fallback brief has no violations for the corpus of companies and sentences; `assemble` produces content the example test already accepts; `copySchema` rejects a missing slot.                                                                                                                                                 |
| Unit        | `lib/logo/analyse.test.ts`                                     | Fixtures in `tests/fixtures/logos/`: dark, light, mixed, transparent, white box, SVG, and a corrupt file classified as `null`.                                                                                                                                                                                                                       |
| Unit        | `lib/inngest/stages.test.ts`                                   | `runStage` marks running, done, fallback; the fallback runs when the work throws.                                                                                                                                                                                                                                                                    |
| Integration | `tests/integration/exclusivity.test.ts`                        | Against a Neon branch named in `TEST_DATABASE_URL`: ten parallel reveals for one identity never yield a duplicate; the under-count case returns exhausted; a retried reveal with the same slug is idempotent. Skipped when the variable is absent.                                                                                                   |
| Integration | `tests/integration/submission.test.ts`                         | Create then create again returns the same slug and one row; `markStage` refuses to overwrite `fallback`.                                                                                                                                                                                                                                             |
| e2e         | `e2e/brief.spec.ts`                                            | Extended: the full submit lands on the done page with a slug in the URL, the slot names Aurora within 30 s, and the concept link opens a page whose `h1` contains the fallback headline. Runs with placeholder AI and Pexels keys, so it proves the fallback path end to end. Uses a unique plus-addressed email per run so exclusivity never trips. |
| e2e         | `e2e/preview.spec.ts`                                          | The preview page at 1440 and 390 px: no horizontal overflow, axe clean, credits present when images exist.                                                                                                                                                                                                                                           |

CI: the `verify` job gains `TEST_DATABASE_URL` from a Neon `ci` branch (created once, migrated by the job with `pnpm db:migrate`, reset by the erasure script at the start of the run). The `e2e` job runs `inngest-cli dev` as a second Playwright `webServer` entry and `DATABASE_URL` pointed at the same branch. Playwright's `webServer` accepts an array. The hex and palette grep is unchanged.

---

## 18. Order of work

Each slice is a PR, leaves `main` deployable, and ends at a gate. Do not start the next before the gate is green.

**Slice 0, foundations.** Commit the uncommitted Aurora work first. Then: install `culori`, `@types/culori`, `@anthropic-ai/sdk`, `@vercel/blob` (versions read off npm at install); `CONFIG` additions; schema and migration `0001`; identity module; `TemplateMeta` additions, `TemplateContract`, registry split, `templates/render.tsx`; the lint exception and the registry regex; `vercel.json`; knip entries trimmed. Gate: typecheck, lint, knip, unit tests green; migration applied to Neon; `/examples/aurora` unchanged.

**Slice 1, the colour engine.** `deriveTokens`, `solvePair`, `schemeFor`, `tokenStyle`, the corpus test; the example page switches to the engine. Gate: the corpus is green and the example page passes axe on both schemes.

**Slice 2, uploads.** Token route, `use-uploads`, the answers schema with blob URLs, the reducer and steps, hydrate keeps files. Gate: a 6 MB PNG, an SVG and a WebP upload from the form; the same file twice yields one blob; a refresh on question four keeps the logo and photos.

**Slice 3, the deterministic loop.** `submitBrief` writes the lead and submission and sends the event; `build-concepts` with `load`, `logo`, `select`, `tokens`, `fallbackBrief`, `fallbackCopy`, `null` imagery (no AI, no Pexels yet); the status action; the done page on slug, deadline and concept count; `/preview/[slug]/[templateId]`; the sweeper; the e2e extension; CI with the Neon branch and the Inngest dev server. Gate: on localhost and on a Vercel preview, five answers produce an Aurora page in the visitor's colour, logo and fallback copy inside a minute; the same answers again return the same slug; a second email sees the exhausted state; `pnpm e2e` passes with placeholder keys.

This is the milestone. Everything the visitor sees exists, nothing depends on an external model, and every later slice only improves what is on the page.

**Slice 4, brief and copy.** `lib/ai/client.ts`, `writeBrief`, `writeCopy`, `ruleViolations`, the retry, the stage wiring. Gate: real copy on the preview; a forced timeout (budget set to 1 ms in a test run) still yields a complete page before the ring reaches zero; re-sending the event does nothing; Inngest shows one call per stage.

**Slice 5, imagery.** Own photos re-hosted; Pexels search; ranking; variants; credits in the footer. Gate: a submission with photos shows them; one without shows credited Pexels photographs; with the Pexels key removed the page still completes with light instead of photographs.

**Slice 6, the shareable page.** The hub at `/preview/[slug]` with the book-a-call state, the OG image from tokens, the Resend email with the link on `submission.ready`, the on-screen link on the done page. Gate: a shared link renders identically on every visit; a test booking completes; the email arrives.

**Slice 7, before any traffic.** Rate limits on the action and the token route, the honeypot and the three-second floor, the privacy notice at question two, the retention job, erasure by email, `HMAC_SECRET` rotation note. Gate: the guide's pre-launch checklist.

Slices 4 and 5 can be built in either order once slice 3 is in; imagery is independent of copy.

---

## 19. Decisions for the owner

1. **Concept count while only Aurora is ready.** This plan runs the whole pipeline for `min(3, ready)` concepts, so a test submission gives one design and the done page shows one slot. The alternative, three Aurora concepts with different copy, would break the `seen` primary key and the exclusivity promise. Recommended: the `min`.
2. **Exclusivity without the lock.** The primary key on `seen` plus a retried multi-row insert replaces the guide's `SELECT FOR UPDATE` and the WebSocket driver. Same guarantee, one driver, one fewer moving part. Recommended.
3. **Upload at pick time.** Files reach Blob while the visitor is still answering. Abandoned forms leave blobs behind until the retention job (slice 7) removes any not referenced by a submission. The alternative, upload at submit, would make submit slow on 4G with six photos. Recommended: pick time.
4. **Content-addressed blobs.** Two visitors uploading the same file share one blob, so the retention job deletes a blob only when no submission references it. Recommended, for idempotent uploads and dedupe.
5. **Models.** The guide's Sonnet 5 and Haiku 4.5, or Opus 5 for the brief and copy at roughly double the cost. Recommended: the guide's choice; revisit if the copy reads flat after real submissions.
6. **Testing the exclusivity rule.** With one template, the same email is exhausted after one run. Test with plus-addressed emails (`you+1@`, `you+2@`) or reset with `scripts/erase-identity.ts`. No bypass flag will be added.
7. **Copy per template, not one call.** Three smaller calls that fail independently, against the guide's one call. Recommended: per template.
8. **The preview page is `noindex`.** The link is for the visitor and whoever they forward it to, not for search. Recommended.
9. **Failed logo processing shows the wordmark.** Not the raw file. Recommended.
10. **Polling stays a Server Action.** Every 3 seconds instead of 10. A GET route is a small later change if the logs show the POSTs matter.
11. **Fourth-visit behaviour and the follow-up policy** remain open from `docs/home-page-plan.md` section 9 and do not block slices 0 to 6.

---

## 20. Records

- ADR 0009: one function for the stages, lock-free exclusivity, per-template copy calls, the registry exception to the `lib` boundary, upload at pick time, content-addressed blobs, `min` concept count during the build-out.
- Update `PRODUCT.md` "Capabilities and Constraints" and `README.md` layout when slice 3 lands.
- Update the guide's stage table (section 4) with the single trigger, so the guide and the code say the same thing.
- Memory note: this plan's location and the slice reached.

---

## 21. Verify when you install

- `@vercel/blob`: the exact export names for `upload` and `handleUpload` from `@vercel/blob/client`, and whether `allowOverwrite` with `addRandomSuffix: false` behaves as expected for an identical path.
- `culori@4`: `clampChroma`, `wcagContrast`, `toGamut`, `formatHex`, the OKLCH mode name, and the `@types/culori` version that matches.
- `@anthropic-ai/sdk`: `zodOutputFormat` from `@anthropic-ai/sdk/helpers/zod` against zod 3.25.76; that `claude-sonnet-5` accepts `thinking: { type: 'adaptive' }` alongside `output_config.format`; image URL blocks on `claude-haiku-4-5`.
- Inngest 4.18.1: `serve({ streaming: true })` on Vercel Fluid, and that the Vercel integration syncs a Next 16 route with `maxDuration = 300` on the current plan.
- sharp 0.35.4 on Vercel: PNG, SVG, JPEG and WebP all rasterise on a real deployment (the guide's checklist item).
- iOS Safari: HEIC is converted to JPEG for a picker that excludes HEIC.
- Neon: the `ci` branch and `TEST_DATABASE_URL` as a GitHub Actions secret; whether the free tier's compute hours cover the e2e job's frequency.
