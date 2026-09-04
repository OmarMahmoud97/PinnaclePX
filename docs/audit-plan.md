# Audit and improvement plan

- Date: 4 September 2026
- Scope: the whole repository at commit `62d409d` (main). Analysis only; nothing was changed by the audit itself.
- Progress: items 1 to 12 were done on 4 September 2026 and are recorded in ADR 0017 (items 1 to 5) and ADR 0018 (items 6 to 12); see the Progress section. The findings below are kept as they were written, so the line numbers refer to commit `62d409d`, not to the code after the changes.
- Method: read the manifest, every config file, every file under `lib/`, `app/api/`, `app/preview/`, `app/start/`, `templates/registry.ts`, `templates/render.tsx`, `templates/t01-aurora/`, the Inngest functions, the database layer, the hero loop and the motion code. Ran `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm knip`, `pnpm outdated` and `pnpm audit`. Model-API claims were checked against the Anthropic SDK reference bundled with this session (model list, cache minimums, thinking rules dated June 2026).
- Line numbers are from the files as read on this date.

## Progress (4 September 2026)

| Item | Finding                                  | Status                        | Recorded in          | What happened, where it differs from the suggestion                                                                                                                                                                                                                                                                                                                             |
| ---- | ---------------------------------------- | ----------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | 3.2 timeouts on outbound fetches         | Done                          | ADR 0017, decision 1 | `CONFIG.timeoutMs` (search 10 s, download 30 s, store 30 s) on every fetch and Blob `put`. Resend's `send` takes no signal, so the email is left to its function's retries.                                                                                                                                                                                                     |
| 2    | 2.1 uploads verified, overwrites stopped | Done                          | ADR 0017, decision 2 | `readUpload` checks the SHA-256 on read and refuses a URL that is not one of our uploads; the token route sets `allowOverwrite: false` and answers `GET` with the URL of a taken path. Blob's answer to a taken path (a `BlobError` saying the blob already exists) was verified against the store, and the whole flow through the token route and the real store.              |
| 3    | 3.1 searches and rankings shared         | Done, with a product decision | ADR 0017, decision 3 | One search per query, one ranking per query and purpose, one re-host per picture. The owner chose distinct pictures per design (the best not yet taken), shared only once the ranked candidates run out; a page never repeats one.                                                                                                                                              |
| 4    | 3.4 permanent model errors               | Done                          | ADR 0017, decision 4 | `isPermanentModelError` (400, 401, 403, 404 and 422). The brief skips its remaining attempts; a copy call writes the template's fallback at once rather than a `NonRetriableError`, which would have left the stage to the sweeper. Logged at error level as `stage.permanent` and `copy.permanent`, because it means an outage for every submission.                           |
| 5    | 1.4 and 5.1 one row read per request     | Done                          | ADR 0017, decision 5 | `readPreview` (React `cache`, slug check and answers parse included) for the page, its metadata and its card; `readStageRow` for the poll. `readSubmission` stays uncached for the pipeline, which writes between reads.                                                                                                                                                        |
| 6    | 3.3 Pexels 429                           | Done, differently             | ADR 0018, decision 1 | The Pexels documentation says the quota headers come only with a good answer, not with a 429, and names no `Retry-After`, so no reset time can be read. A 429 throws `PexelsQuotaError`, logged at error level as `pexels.exhausted`; the stage settles the slot and marks itself `fallback` when nothing else is worth another attempt, instead of retrying until the sweeper. |
| 7    | 5.3 the N+1 in the sweeps                | Done                          | ADR 0018, decision 3 | `slugsCreatedBefore` and `slugsOf` select slugs; each per-row step reads its own row through `removeSubmission`, shared by the sweep and the erasure.                                                                                                                                                                                                                           |
| 8    | 1.1, 4.1 and 1.6 docs                    | Done                          | ADR 0011 amendments  | ADR 0011 amended for thinking off and for the cache marker; the marker and the `cached` log field were removed (Sonnet 5 caches nothing under 1,024 tokens; the prompt is about 180). The vitest comment and the pipeline-plan rows for the brief and copy calls corrected.                                                                                                     |
| 9    | 1.5 both image queries                   | Done                          | ADR 0018, decision 2 | A slot carries every non-blank query; the stage tries them in order until one finds candidates.                                                                                                                                                                                                                                                                                 |
| 10   | 3.5 upload route parse order             | Done                          | ADR 0018, decision 5 | The hit is counted first; the body is read inside the `try`, so a non-JSON body is a 400.                                                                                                                                                                                                                                                                                       |
| 11   | 2.5 esbuild override                     | Done                          | ADR 0018, decision 6 | `pnpm.overrides` lifts esbuild under 0.25 to 0.25.12; `pnpm audit` reports nothing; `drizzle-kit --version` runs.                                                                                                                                                                                                                                                               |
| 12   | 2.3 `x-forwarded-for`                    | Verified, nothing to change   | ADR 0018, decision 7 | Vercel's request-headers reference: the header is overwritten and external IPs are not forwarded, to prevent spoofing. The comment in `lib/rate-limit/request.ts` cites it.                                                                                                                                                                                                     |
| 12   | 5.5 font preloads                        | Verified, real, fixed         | ADR 0018, decision 8 | A production build's preview page carried 9 font preload hints (all seven preview faces plus the root layout's two). With `preload: false` on the seven and on the Aurora example route's two faces, which leaked through the shared chunk, it carries 2.                                                                                                                       |
| 13   | 1.2 zod 4 and the other majors           | Not started                   |                      |                                                                                                                                                                                                                                                                                                                                                                                 |
| 14   | 1.7 upload hook out of `Flow`            | Not started                   |                      |                                                                                                                                                                                                                                                                                                                                                                                 |
| 15   | 1.3 rank prompt into `prompts.ts`        | Not started                   |                      |                                                                                                                                                                                                                                                                                                                                                                                 |
| 16   | 4.2 compact JSON in the copy prompt      | Not started                   |                      |                                                                                                                                                                                                                                                                                                                                                                                 |
| 17   | 2.2 SVG hardening                        | Not started                   |                      |                                                                                                                                                                                                                                                                                                                                                                                 |
| 18   | 5.4 blob-reference table                 | Not started                   |                      |                                                                                                                                                                                                                                                                                                                                                                                 |

Changes made alongside, not named in the findings: a stage's work now returns how it ended (`Written`, with `done(patch)` for the common case), so a stage can settle itself with its own fallback; `imageryFor` takes every chosen template at once and returns which slots a retryable failure left empty; `rehostImage` takes bytes; `lib/download.ts`, `lib/blob/read-upload.ts`, `lib/ai/errors.ts`, `lib/preview/read.ts` and `lib/inngest/remove-submission.ts` are new. Checks after both batches: lint, typecheck, knip, prettier, build and bundle budget clean; 38 test files, 362 tests; `pnpm audit` clean.

## Baseline (verified)

| Check                        | Result                                                                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                  | clean                                                                                                                   |
| `pnpm typecheck`             | clean                                                                                                                   |
| `pnpm test`                  | 34 files, 333 tests, all pass                                                                                           |
| `pnpm knip`                  | clean: no unused files, exports or dependencies                                                                         |
| `pnpm audit`                 | 1 moderate (esbuild, dev-only, via drizzle-kit)                                                                         |
| Secrets in source or history | none found (`process.env` is confined to `lib/env.ts` and the tool configs by ESLint; `.env.local` was never committed) |

The codebase is small (about 13,400 lines of TypeScript), consistently written, and its architectural boundaries are enforced by ESLint rather than by convention. Most findings below are latent: they cost nothing today with one ready template and no traffic, and start to matter as templates two to ten land.

## 1. Code quality

### 1.1 The model-call ADR no longer matches the code

- Where: `docs/adr/0011-model-stages-judged-by-code.md:17` (decision 5: "effort is medium and thinking is left to the model's default"), `docs/pipeline-plan.md:148,270-271` (same). Code: `lib/ai/brief.ts:20` and `lib/ai/copy.ts:42` send `thinking: { type: 'disabled' }` and no `output_config.effort`; `lib/config.ts:89-95` explains why (commit `6a67a4d`, PR #16).
- Consequence: the standards doc names the ADRs as the source of truth; a reader following ADR 0011 would reintroduce thinking and the cost PR #16 removed.
- Severity: low.
- Fix: add a dated amendment to ADR 0011 (or ADR 0017) recording that thinking is disabled and effort unset on the brief and copy calls, and update the two rows in `docs/pipeline-plan.md`.
- Effort: minutes.

### 1.2 Two zod dialects in one codebase

- Where: `zod/v4` in `lib/ai/rank.ts:4`, `lib/copy-slots/brief.ts:1`, `lib/copy-slots/contract.ts:1`, `templates/t01-aurora/contract.ts:1`; `zod` (v3 API) in `lib/brief/schema.ts`, `lib/brief/submission.ts`, `lib/env.ts`, `lib/identity/slug.ts`, `lib/images/candidates.ts`, `lib/inngest/events.ts`, `app/start/_components/brief-reducer.ts` (which also uses the v3-only `z.SafeParseReturnType` at line 107).
- Why it is so: the SDK's `zodOutputFormat` helper is typed against v4 (ADR 0011, context), and `docs/standards.md:24` pins zod 3.25.x. This is deliberate, not an accident.
- Consequence: two schema APIs to know, and `pnpm outdated` shows zod 4.5.4 is current, so the split will have to be closed at some point. Nothing is broken.
- Severity: low.
- Fix: fold into the zod 4 upgrade (section 6): move the seven v3 files to the v4 API, change every import to `zod`, and update `docs/standards.md:24`. Until then, leave as is.
- Effort: hours (with the upgrade).

### 1.3 The ranking prompt sits outside `lib/ai/prompts.ts`

- Where: `lib/ai/rank.ts:23` defines its own `SYSTEM` string; `lib/ai/prompts.ts:6-7` says the prompts are built there "so a test can read them and nothing personal is ever added by accident". `lib/ai/rank.ts:59` also throws a bare `Error` where the sibling calls throw `AppError` (`lib/ai/brief.ts:35`).
- Consequence: the rank prompt is the one the tests cannot see, and the one place where the company name plus the model-written positioning reach a model without passing through the file that is meant to guard that (the purpose string is built in `lib/images/plan.ts:38-39`).
- Severity: low.
- Fix: move `SYSTEM` and a `rankPrompt(purpose)` builder into `prompts.ts`; use `AppError` at `rank.ts:59`.
- Effort: minutes.

### 1.4 Each preview render reads the row twice and parses the answers three times

- Where: `app/preview/[slug]/page.tsx:21` (metadata) and `:35` (page) both call `readSubmission`; `app/preview/[slug]/[templateId]/page.tsx:31` and `:48` both call `load(params)`; the same file parses `submissionAnswersSchema` at `:33`, `:51` and `:72`. `app/preview/[slug]/opengraph-image.tsx:20` reads again for the card.
- Consequence: two Neon round trips per page view, three when a link is unfurled. Neon HTTP latency from `lhr1` is small but not free, and the row carries every jsonb column.
- Severity: low.
- Fix: wrap `readSubmission` in React's `cache()` in `lib/db/submissions.ts` so metadata and page share one read per request, and parse the answers once inside `load`.
- Effort: minutes.

### 1.5 The brief asks for two image queries per slot type and uses only the first

- Where: `lib/ai/prompts.ts:36` asks for two hero and two detail queries; `lib/images/plan.ts:28-29` takes `queries.find(q => q.trim() !== '')`, always the first non-empty one; `lib/images/stage.ts:69` returns `null` when that one search is empty.
- Consequence: the model spends output tokens on queries the code discards, and a first query with no Pexels results leaves the slot empty even though a second query was available.
- Severity: low.
- Fix: either ask for one query per slot type, or (better) have `fill` try each query in order until a search returns candidates.
- Effort: under an hour, with a test in `lib/images/plan.test.ts`.

### 1.6 Stale comment in the test config

- Where: `vitest.config.mts:5-7` says the tests under `tests/integration` reach the development database and skip in CI. `tests/integration/registry.test.ts` is pure (it imports the registry and `fallbackBrief` only). No test touches the database.
- Consequence: a reader expects a database dependency that does not exist; the `env: loadEnv(...)` line is still needed because `lib/env` validates on import.
- Severity: low.
- Fix: reword the comment to say the env is loaded because modules under test import `lib/env`.
- Effort: minutes.

### 1.7 `Flow` in `brief-flow.tsx` carries the upload bookkeeping inline

- Where: `app/start/_components/brief-flow.tsx:92-356`. `previews`, `failed`, `held`, `startUpload`, `forget`, `toLocalImage`, `handleLogoFile`, `handlePhotoFiles` and `removePhoto` (lines 104-279) are all about object URLs and upload outcomes; the rest of the component is the question flow.
- Consequence: a 260-line component with two concerns, which is the file most likely to be edited when a question changes.
- Severity: low. The code is correct and well commented.
- Fix: extract a `usePictureUploads(dispatch)` hook returning `{ logo, photos, uploading, handleLogoFile, handlePhotoFiles, removePhoto }`; the reducer and the flow stay as they are.
- Effort: hours, with the existing e2e brief spec as the safety net.

### 1.8 No findings

`app/_components/hero-loop.ts` (485 lines) is long but each act is one function and the file explains every choice; `addBuild` at lines 130-269 is the only function over 100 lines and splitting it would not make it clearer. Types are strict everywhere (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`); the `unknown` copy that flows through `TemplateContract` is erased on purpose and re-validated at the template (`templates/render.tsx:17`). No dead code was found; knip agrees.

## 2. Security

### 2.1 Upload paths are content-addressed by a hash the server never checks

- Where: `app/api/upload/route.ts:35-43` issues a client token for any pathname matching `logos|photos/<64 hex>.<ext>` (`lib/brief/uploads.ts:42,51-57`) with `allowOverwrite: true`. The hash is computed in the browser (`lib/brief/upload-client.ts:7-10,20`) and nothing on the server recomputes it. The comment at `route.ts:12-14` assumes "the path carries the file's own hash".
- The hash is public: the logo stage stores the raster at `logo-rasters/<sha>.png` (`lib/logo/stage.ts:25-26`) and the imagery stage stores a visitor's own photo at `images/own-<sha>.webp` (`lib/images/stage.ts:58`), and both URLs are rendered into the preview page that the visitor is invited to share.
- Consequence: anyone holding a preview link can read the hash from an image URL, then upload arbitrary image bytes to `logos/<sha>.png` or `photos/<sha>.jpg`, overwriting the visitor's original. The pipeline re-fetches those originals on any retry of the logo or imagery stage (`lib/logo/stage.ts:20`, `lib/images/stage.ts:55-61`), the visitor's own `/start` page draws the Blob URL after a refresh (`brief-flow.tsx:265`), and a repeat submission of the same file dedupes by content hash (`lib/identity/payload.ts:7-9`) so the attacker's bytes would be reused. The per-IP upload limit of 100 an hour (`lib/config.ts:26`) does not stop a single targeted overwrite.
- Severity: medium. It needs a shared link and a window of opportunity, and the blast radius is one visitor, but it is a silent integrity break in the one place visitors trust us with their own artwork.
- Fix (two independent halves; do both):
  1. Verify on read. In `lib/logo/stage.ts` after line 22 and in `lib/images/rehost.ts` for the `own-` path, compute `sha256(bytes)` and compare with `uploadShaOf(sourceUrl)`; throw `AppError('Upload bytes do not match their path')` on mismatch. This makes an overwritten file fail closed (wordmark, or an empty slot) instead of being re-hosted.
  2. Stop overwrites. Set `allowOverwrite: false` at `route.ts:42`, and in `lib/brief/upload-client.ts` treat the Blob SDK's "blob already exists" error as `{ ok: true, url }` (the URL is deterministic from the pathname), so re-uploading the same file still works.
- Effort: one to two hours including tests for the mismatch path.

### 2.2 Untrusted SVG is rasterised server-side (uncertain)

- Where: `lib/logo/analyse.ts:43-48,59,111` passes visitor SVGs to sharp with a computed density; `lib/brief/uploads.ts:18` allows `image/svg+xml` for logos.
- What I could not verify: whether the librsvg build inside `sharp@0.35.4` on Vercel resolves external references or `xi:include` from an SVG. Upstream librsvg refuses external resources by default; I have not confirmed the bundled build's flags.
- Consequence if it does: a crafted SVG could read local files into the raster or stall the function. If it does not: none.
- Severity: low, uncertain.
- Fix: confirm the librsvg policy for the bundled binary; if in doubt, reject SVGs that contain `<script`, `xlink:href="http`, `href="http`, `<!ENTITY` or `xi:include` before they reach sharp (a regex over the first megabyte in `analyseSubmissionLogo`).
- Effort: minutes to check, under an hour to guard.

### 2.3 The per-IP limit keys on the first hop of `x-forwarded-for` (uncertain)

- Where: `lib/rate-limit/request.ts:7-9`.
- What I could not verify: whether Vercel overwrites a client-supplied `x-forwarded-for` or prepends the real address to it. If the client's own value survives at the front, one caller can defeat `submissionsPerIp` and `uploadsPerIp` by rotating a fake header.
- Severity: low, uncertain; the per-identity limit still holds.
- Fix: check the Vercel request-headers reference; if `x-real-ip` or `x-vercel-forwarded-for` is documented as platform-set and non-spoofable, prefer it and fall back to `x-forwarded-for` only locally.
- Effort: minutes.

### 2.4 The status poll is unauthenticated and unthrottled

- Where: `app/preview/actions.ts:10-15`, called every three seconds by `app/preview/_components/use-submission-status.ts:18-38`.
- Consequence: only load. Slugs carry 60 bits of entropy (`lib/identity/slug.ts:11-17`), so enumeration is impractical; a caller who already has a slug can only read stage names. Each call selects every column of the row (see 5.1).
- Severity: low.
- Fix: see 5.1 (select only the stage columns). A per-IP limit is not worth a database write per poll.
- Effort: minutes.

### 2.5 Vulnerable dependency (dev only)

- Where: `esbuild <= 0.24.2` reached through `drizzle-kit > @esbuild-kit/esm-loader > @esbuild-kit/core-utils` (GHSA-67mh-4wv8-2f99: any website can request the esbuild dev server). `drizzle-kit` is a dev dependency and only runs `db:generate` / `db:migrate` locally.
- Severity: low.
- Fix: add `"pnpm": { "overrides": { "esbuild@<0.25.0": ">=0.25.0" } }` to `package.json`, re-run `pnpm install` and `pnpm db:generate --help` to prove drizzle-kit still loads; remove the override when drizzle-kit drops `@esbuild-kit`.
- Effort: minutes.

### 2.6 Verified clean

Input validation happens once at each boundary and is re-done on the server (`app/start/_components/actions.ts:40`, `lib/brief/submission.ts:42`, `lib/images/candidates.ts:29`, the structured-output schemas). The honeypot and pace check run before any database write (`actions.ts:36-39`). Email HTML is escaped (`lib/email/preview-link.ts:16-17,43-49`). JSON-LD escapes `<` (`app/_components/json-ld.tsx:35`). Slugs are validated before every read (`slugSchema`). The Inngest route is signature-checked by the SDK with the key from `lib/env.ts`. Identity is an HMAC, never the address (`lib/identity/hmac.ts`). The LIKE pattern in `lib/db/retention.ts:39` is parameterised. The exclusivity insert relies on the composite key and retries on `23505` (`lib/db/exclusivity.ts`). No injection vectors, no `dangerouslySetInnerHTML` outside the escaped JSON-LD, no secrets.

## 3. API usage

### 3.1 The same Pexels search and the same Haiku ranking run once per template

- Where: `lib/images/stage.ts:28` creates the `searches` map inside `imageryFor`, which `lib/inngest/functions/build-concepts.ts:110-117` calls once per chosen template. `lib/images/plan.ts:28-29` gives every template the same first hero query and the same first detail query, and `lib/images/stage.ts:72` ranks the candidates of every search.
- Consequence today: none (one ready template). With three templates chosen: three identical Pexels searches per slot type against a quota of 200 an hour on the free tier, three identical Haiku vision calls (12 images each, `CONFIG.images.perPage`), and up to three re-hosts of the same photograph under the same key `pexels-<id>` (`stage.ts:81`). That is six model calls and six searches where two would do, on every submission.
- Severity: medium (latent; it triples the imagery stage's cost and quota use the day template two is marked ready).
- Fix: create the cache once in the imagery step of `build-concepts.ts` (a `Map<query, Promise<Candidate[]>>` for searches and a `Map<query, Promise<Judged[] | null>>` for verdicts, or one `Map<query, Promise<ordered candidates>>`) and pass it into `imageryFor`; keep `used` per template if the three designs should be allowed to share a photograph, or hoist it too if they should not. Memoise `rehostImage` by `key` in the same context.
- Effort: one to two hours, with `lib/images/stage.ts` gaining a test that counts searches across two contracts.

### 3.2 Outbound fetches have no timeout

- Where: `lib/images/pexels.ts:15`, `lib/images/rehost.ts:22`, `lib/logo/stage.ts:20`. The Anthropic calls do set timeouts (`lib/ai/brief.ts:23`, `copy.ts:45`, `rank.ts:49`); the plain `fetch` calls and the Resend and Blob SDK calls do not.
- Consequence: a stalled Pexels or Blob connection holds the imagery step past its 90-second budget (`lib/config.ts:8`) until Vercel kills the invocation at `maxDuration = 300` (`app/api/inngest/route.ts:11`). By then the sweeper (`sweep-deadline.ts:32-35`, 45 seconds before the 300-second deadline) has already written fallbacks, so one hung socket turns a full page into a partial one and withholds the email.
- Severity: medium.
- Fix: pass `signal: AbortSignal.timeout(ms)` to each `fetch`, with the number in `CONFIG` (for instance `CONFIG.fetchTimeoutMs = { search: 10_000, image: 30_000 }`), and wrap the Blob `put` and Resend `send` in the same pattern where their SDKs accept a signal.
- Effort: minutes.

### 3.3 A Pexels 429 is retried on the stage cadence and re-searches every time

- Where: `lib/images/pexels.ts:20` throws for any non-2xx; `lib/inngest/stages.ts:49-51` turns that into `RetryAfterError` every 20 seconds (`CONFIG.pipeline.retryAfterMs`) up to 14 times.
- Consequence: once the hourly quota is hit, each retry spends another request against the same exhausted quota and the slot ends empty anyway.
- Severity: low today, medium once several templates each search.
- Fix: on 429 read `retry-after` or `x-ratelimit-reset` and throw a `RetryAfterError` with that delay; if the reset is past the submission's deadline, return `[]` so the slot settles as `none` at once instead of burning retries. `pexels.ts:16-19` already logs the remaining quota, which is the right signal to alert on.
- Effort: under an hour.

### 3.4 A permanent Anthropic error is retried for five minutes

- Where: `lib/inngest/functions/build-concepts.ts:172-177` wraps every non-`RetryAfterError` from `writeCopy` in a `RetryAfterError`; `lib/inngest/stages.ts:43-51` does the same for the brief. The SDK already retries 408/409/429/5xx twice.
- Consequence: a 400 (for instance a schema the structured-output API rejects, or an invalid model id after a config change) is retried 14 times at 20-second intervals, each attempt a full request, until the sweeper writes the fallback. The log shows `stage.retry` fourteen times instead of one clear failure.
- Severity: low to medium (cost and diagnosability; the visitor still gets the fallback).
- Fix: export `isPermanentModelError(error)` from `lib/ai/client.ts` (ESLint confines the SDK import to `lib/ai`): `error instanceof Anthropic.BadRequestError || error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError || error instanceof Anthropic.NotFoundError`. In `copyStage` throw `NonRetriableError` for those; in `runStage` for the bounded brief, skip the remaining attempts and go straight to the fallback.
- Effort: minutes.

### 3.5 The upload route parses the body before anything else

- Where: `app/api/upload/route.ts:20` does `await request.json()` outside the `try`.
- Consequence: a non-JSON body is an unhandled exception and a 500 with a stack in the logs, and it happens before the rate-limit write, so the cheapest request to make is also the one that bypasses the counter. Cosmetic rather than dangerous.
- Severity: low.
- Fix: move the parse inside the `try` (return 400 on failure) and let `handleUpload` validate the shape; count the hit first.
- Effort: minutes.

### 3.6 Verified clean

Every model call has a timeout from `CONFIG.stageBudgetMs`; the SDK's built-in retry covers rate limits and 5xx; the copy retry loop is bounded (`CONFIG.copy.retries`); every response's usage is logged without text (`ai.call`). The Resend call throws on `error` and the sender falls back to the test address (`lib/email/send.ts`). Pexels responses are validated with zod at the boundary (`lib/images/candidates.ts`). Idempotency is on the slug for the pipeline and the email, and on `emailSentAt` / `eventSentAt` for the row.

## 4. Token usage

Cost model, per submission, at the rates in the SDK reference of June 2026 (Sonnet 5 $2 in / $10 out per million tokens; Haiku 4.5 $1 / $5):

| Call             | Count per submission                                                      | Rough input                           | Rough output     | Rough cost                |
| ---------------- | ------------------------------------------------------------------------- | ------------------------------------- | ---------------- | ------------------------- |
| brief (Sonnet 5) | 1                                                                         | 500 tokens                            | 800 tokens       | under 1 cent              |
| copy (Sonnet 5)  | 1 per template, up to 2 turns each                                        | 1,000 to 2,500 tokens                 | 1,200 tokens     | 1 to 3 cents per template |
| rank (Haiku 4.5) | 1 per distinct search (2 today, 6 with three templates until 3.1 is done) | about 3,500 tokens (12 medium images) | under 300 tokens | under 1 cent each         |

At three templates the whole pipeline is roughly 10 cents of model spend per submission. There is no oversized prompt and no context resent unnecessarily; the findings are about correctness of intent, not about bill size.

### 4.1 The system-prompt cache marker cannot take effect

- Where: `lib/ai/prompts.ts:10-18` (`SYSTEM_PROMPT`, 744 characters, roughly 180 tokens) carries `cache_control: { type: 'ephemeral' }` at `lib/ai/brief.ts:18` and `lib/ai/copy.ts:40`. ADR 0011 decision 4 and `docs/pipeline-plan.md:270` describe it as cached.
- Fact from the SDK reference: the minimum cacheable prefix on Claude Sonnet 5 is 1,024 tokens; a shorter prefix is silently not cached (`cache_creation_input_tokens: 0`). Haiku 4.5's minimum is 4,096.
- Consequence: the `cached` field logged at `brief.ts:31` and `copy.ts:56` will always be 0, and anyone reading the logs or the ADR will look for a cache problem that is by design. No money is lost; the marker is free.
- Severity: low.
- Fix: remove the `cache_control` and the "cached" wording from the ADR and the plan, or keep the marker and add one line saying it will only bite if the system prompt grows past 1,024 tokens. Moving the Aurora slot guide (`templates/t01-aurora/contract.ts:118-123`, about 2,000 characters, roughly 500 tokens) into the system block would still fall short of the minimum, so restructuring to chase the cache is not worth it at this prompt size.
- Effort: minutes.

### 4.2 The brief is pretty-printed into the copy prompt

- Where: `lib/ai/prompts.ts:42` uses `JSON.stringify(brief, null, 1)`.
- Consequence: newlines and indentation on roughly 40 lines add on the order of 100 tokens to each copy call. Trivial money; it is listed because the fix is a one-character change.
- Severity: low.
- Fix: `JSON.stringify(brief)`.
- Effort: minutes.

### 4.3 Model choice and thinking (no change recommended)

- Sonnet 5 for the brief and the copy, Haiku 4.5 for the picture ranking, thinking disabled on Sonnet 5: all valid combinations per the SDK reference, and `thinking: { type: 'disabled' }` is accepted on Sonnet 5. The copy is judged by code afterwards, so deliberation buys little.
- If copy quality turns out poor on real briefs, the cheaper lever than moving to Opus 5 is `thinking: { type: 'adaptive' }` with `output_config: { effort: 'low' }`, then measure with the `ai.call` usage logs before deciding.
- `max_tokens` of 4,000 and 8,000 are ceilings, not spend; the outputs are far smaller. Streaming is not needed for outputs this size consumed whole.

### 4.4 Related

Finding 1.5 (two queries generated, one used) and 3.1 (identical ranking calls across templates) are the only places output tokens are actually wasted.

## 5. Performance

### 5.1 The status poll selects every column every three seconds

- Where: `app/preview/actions.ts:13` calls `readSubmission`, which is `db.select().from(submission)` (`lib/db/submissions.ts:72-75`), so each poll from `use-submission-status.ts:30` moves the `answers`, `brief`, `tokens`, `copy` and `imagery` jsonb columns over the wire. `statusOf` needs only the stage columns, `templateIds`, `deadlineAt` and `conceptCount` (`lib/preview/status.ts:6-16` already names that shape as `StageRow`).
- Consequence: per open done-page tab, 20 wide reads a minute for up to five minutes. Not a problem for one visitor; the first thing to grow with traffic.
- Severity: low.
- Fix: add `readStageRow(slug): Promise<StageRow | null>` in `lib/db/submissions.ts` selecting those columns, and use it from `getSubmissionStatus` and `ConceptPending`.
- Effort: minutes.

### 5.2 Duplicate reads per preview render

See 1.4: `cache()` around `readSubmission`.

### 5.3 The retention sweep and the erasure re-query the whole set inside every per-row step

- Where: `lib/inngest/functions/retention-sweep.ts:31` runs `submissionsCreatedBefore(before)` again inside each `remove-<slug>` step; `lib/inngest/functions/erase-identity.ts:28` runs `submissionsOf(identityHash)` again inside each. Both then `find` the one row they need.
- Consequence: for N expired rows, N+1 full-set queries with every jsonb column, plus `urlReferencedElsewhere` per URL. At tens of rows a night this is nothing; at thousands it is quadratic. The pattern is also the one Inngest warns about: step results are memoised, so the second query is not for freshness.
- Severity: low.
- Fix: `readSubmission(slug)` inside the step (it is what the code wants), keeping the null check.
- Effort: minutes.

### 5.4 `urlReferencedElsewhere` is a full-table text scan

- Where: `lib/db/retention.ts:32-44` casts `answers`, `imagery` and `logo` to text and runs three `LIKE '%url%'` predicates over every other row, once per URL of every expired submission.
- Consequence: no index can serve it; cost is rows × URLs per sweep. Fine below a few thousand submissions.
- Severity: low (threshold, not a bug).
- Fix when it matters: a `blob_ref(url, slug)` table written by the logo and imagery stages and on submit, so the check is one indexed lookup and deletion is one `DELETE ... RETURNING`. Alternatively a GIN index and jsonb containment on `imagery`, but `answers.photos[].url` still needs a path query.
- Effort: hours (migration, three write sites, a test).

### 5.5 Seven Google font families are declared for every preview (uncertain)

- Where: `app/preview/_components/fonts.ts:16-22` declares seven `next/font/google` faces at module scope; one pair is picked per style at `:32-38`.
- What I could not verify without a build: whether `next/font` emits preload links for all seven on every `/preview/[slug]/[templateId]` response, or only `@font-face` rules. The `next/font` constraint (calls at module scope with literal options) forces this shape, and the comment says so.
- Consequence if all seven are preloaded: five unused font downloads on the visitor's most important page.
- Severity: low, uncertain.
- Fix: inspect the built HTML for `<link rel="preload" as="font">` count; if all seven appear, set `preload: false` on each and let the CSS `@font-face` load the used pair on demand (a small swap, mitigated by `display: 'swap'`).
- Effort: minutes to check.

### 5.6 Verified clean

No N+1 in the pipeline's hot path: the row is read once at `load` and the stages write patches through one conditional update (`markStage`). Client rendering is measured, not guessed: the hero loop pauses off screen and loads GSAP lazily (`hero-stage.tsx:66-120`), `PageMotion` uses two observers and a fail-safe, `QuestionPane` remounts per question on purpose, and the per-keystroke work in `Flow` (`firstInvalidIndex`, `sketchModelFrom`) is five small zod parses and some string work. Bundle budgets and Lighthouse thresholds are enforced in CI.

## 6. Dependencies

- Unused or duplicated: none. `pnpm knip` is clean; `clsx` plus `tailwind-merge` in `lib/cn.ts` is the standard pairing; `client-only` and `server-only` are both used as import guards.
- Vulnerable: esbuild via drizzle-kit, dev only (2.5).
- Outdated, from `pnpm outdated` on 4 September 2026:

| Package            | Current | Latest | Note                                                                                                                                            |
| ------------------ | ------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `zod`              | 3.25.76 | 4.5.4  | Major. Would close the v3/v4 split (1.2). `z.string().url()` and `.email()` and `invalid_type_error` (`lib/brief/schema.ts:32`) change in v4.   |
| `typescript`       | 5.9.3   | 7.0.2  | Major, new compiler. Check `typescript-eslint` 8.69 and `eslint-config-next` 16.3 support before trying; not urgent.                            |
| `eslint`           | 9.39.5  | 10.9.1 | Major. `eslint-config-next@16.3.4` peer range must be confirmed first.                                                                          |
| `vitest`           | 4.1.11  | 5.0.0  | Major. Read the migration notes; the config here is small.                                                                                      |
| `@types/node`      | 24.13.3 | 26.4.1 | `engines.node >= 22` and CI runs Node 22, so the types are already one major ahead of the runtime; pin to `22.x` rather than move further away. |
| `inngest`          | 4.18.1  | 4.19.0 | Minor; Dependabot's weekly group will bring it.                                                                                                 |
| `lucide-react`     | 1.39.0  | 1.41.0 | Minor.                                                                                                                                          |
| `@types/react-dom` | 19.2.5  | 19.2.7 | Patch.                                                                                                                                          |

`@anthropic-ai/sdk@0.123.0`, `next@16.3.4`, `react@19.2.8`, `drizzle-orm@0.45.2`, `tailwindcss@4.3.3` and the rest are current. Dependabot groups minor and patch updates weekly (`.github/dependabot.yml`), so only the majors need a decision.

## Prioritised plan

Ordered by impact for effort. "Latent" means it costs nothing until more templates are ready, which is the next piece of work.

### Do first (done, ADR 0017)

1. **Timeouts on every outbound fetch** (3.2). Minutes. Removes the one way a single hung socket can turn a finished page into a partial one. Done.
2. **Verify upload bytes against their hash, and stop overwrites** (2.1). One to two hours. The only integrity gap found. Done.
3. **Share searches and rankings across templates** (3.1). One to two hours. Latent, but it must land before template two is marked ready or the imagery stage triples in cost and quota that day. Done; each design takes a distinct picture where it can.
4. **Stop retrying permanent model errors** (3.4). Minutes. Turns fourteen retries into one clear log line and a faster fallback. Done; the copy call falls back at once rather than throwing a non-retriable error.
5. **One row read per request** (1.4, 5.1). Minutes. `cache()` around `readSubmission` and a stage-only select for the poll. Done, as `readPreview` and `readStageRow`.

### Do soon (done, ADR 0018)

6. **Back off on Pexels 429** (3.3). Under an hour. Done differently: a 429 carries no reset time, so the stage settles as fallback at once.
7. **Drop the N+1 in the sweeps** (5.3). Minutes. Done.
8. **Bring the docs back in line**: amend ADR 0011 on thinking and effort (1.1), remove or annotate the ineffective cache marker (4.1), fix the vitest comment (1.6). Minutes each. Done; the marker was removed.
9. **Use both image queries or ask for one** (1.5). Under an hour. Done; every query is tried in order.
10. **Upload route: parse inside the try, count first** (3.5). Minutes. Done.
11. **Override esbuild** (2.5). Minutes. Done.
12. **Verify the two uncertain platform facts**: `x-forwarded-for` on Vercel (2.3) and the font preloads (5.5). Minutes each; both may turn out to be nothing. Done: the header is safe; the preloads were real and are off.

### Nice to have (not started)

13. **zod 4 with the other majors** (1.2, section 6). Hours. One PR per major; zod first because it simplifies code, TypeScript 7 last.
14. **Extract the upload hook from `Flow`** (1.7). Hours.
15. **Move the rank prompt into `prompts.ts`** (1.3). Minutes.
16. **Compact JSON in the copy prompt** (4.2). Minutes.
17. **SVG hardening** (2.2), once the librsvg policy is confirmed. Under an hour.
18. **A blob-reference table for retention** (5.4), when submissions reach the thousands. Hours.

## What was not audited

- The ten template designs as designs, `app/_components/` marketing sections beyond the hero loop and motion code, and the e2e suites, were read for structure but not reviewed line by line.
- Inngest's exact semantics for the `attempt` value passed to `copyStage` (`build-concepts.ts:36,107,166`) were not confirmed from the installed package's types; if `attempt` counts function-level retries rather than the current step's, the "ask again on the next attempt" branch at `:166-169` may allow fewer copy re-asks than `CONFIG.copy.attempts` intends. Worth a five-minute check against the Inngest docs. Still open after both batches.
