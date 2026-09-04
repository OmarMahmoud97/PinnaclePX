# Brand Concept Generator

Build guide for an agency lead generation tool. Next.js, Vercel, Neon, Inngest, Anthropic.

Prepared 1 September 2026.

---

## 1. What you are building

A lead generation tool on your agency website. A visitor answers five questions and, within five minutes, sees three homepage concepts for their business carrying their logo, colours and copy written for them. Each result lives at a shareable URL. The goal is to turn a cold visitor into a booked discovery call.

### Fixed constraints

- No accounts and no login.
- Layout is never generated. Ten fixed React templates. Only copy, imagery, colour tokens and type scale change.
- No manual work per submission.
- You are the only maintainer, so every choice favours the simplest mechanism that holds the guarantees below.

---

## 2. What the end product does

### The visitor journey

| Step   | The visitor does                                            | The system does                                                                                                                    |
| ------ | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 1      | Enters name, company, email                                 | Creates the lead record. Identity is an HMAC of the email.                                                                         |
| 2      | Writes one or two sentences about the company               | Starts the brief stage in the background (positioning, headline candidates, value props, image search queries).                    |
| 3      | Uploads a logo, or chooses a wordmark from the company name | Classifies the logo as light or dark artwork, selects three templates, starts the copy stage.                                      |
| 4      | Uploads imagery or picks a visual style                     | Starts the imagery stage: Pexels search, vision ranking, re-hosting.                                                               |
| 5      | Enters brand hex codes or picks a palette                   | Derives the colour tokens. Starts the five minute countdown.                                                                       |
| Result | Watches concepts appear as each is ready                    | Serves `/preview/[slug]` with three concepts and a book-a-call button. The countdown never reaches zero without a complete result. |

### Guarantees the system must hold

- A returning email never sees a template it has already seen. When fewer than three unseen templates remain, the visitor gets a book-a-call page, not a degraded result.
- An identical resubmission returns the same result and consumes nothing new.
- Every text and background pair in every template passes WCAG 2.2 AA. Brand hue is preserved; only lightness and chroma move.
- Logo polarity decides which templates are eligible. Eight or nine of the ten templates must accept either polarity.
- AI writes copy and image search queries only. It never picks templates, colours, layout or image URLs.
- Images come from Pexels, are re-hosted on your own storage, and are credited in the page footer.
- Every AI stage has a deterministic fallback, so a prospect never sees a broken or empty section.

---

## 3. The stack

| Layer            | Choice                                | Version | Notes                                                                                                               |
| ---------------- | ------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------- |
| Framework        | Next.js App Router, React, TypeScript | 16.3.x  | Turbopack is default. Server Actions for form steps.                                                                |
| Styling          | Tailwind CSS                          | 4.x     | Semantic tokens declared in `@theme`, values set at runtime as CSS variables.                                       |
| Hosting          | Vercel Pro, Fluid Compute             |         | Pro is required for commercial use. 800s max function duration. 4.5 MB request body limit.                          |
| Database         | Neon Postgres                         |         | Scales to zero. Free tier: 100 compute hours, 0.5 GB.                                                               |
| ORM              | Drizzle ORM, drizzle-kit              | 0.45.2  | Use `drizzle-orm/neon-serverless` (WebSocket) for the exclusivity transaction. HTTP driver cannot run transactions. |
| Pipeline         | Inngest                               | 4.x     | Durable steps, per-step retries, `sleepUntil` for the deadline sweeper, idempotency keys.                           |
| File storage     | Vercel Blob                           | latest  | Browser-direct upload via a token route.                                                                            |
| Image processing | sharp                                 | 0.35.4  | SVG input supported. HEIC input not supported.                                                                      |
| Colour           | culori                                | 4.0.2   | OKLCH, `wcagContrast`, `wcagLuminance`, `clampChroma`, `toGamut`.                                                   |
| Validation       | zod                                   | 3.25.x  | Stay on 3.25.x, not v4, for AI and Drizzle compatibility.                                                           |
| AI               | @anthropic-ai/sdk                     | 0.122.0 | `claude-sonnet-5` for brief and copy. `claude-haiku-4-5` for vision ranking. Native structured outputs.             |
| Stock photos     | Pexels API                            |         | 200 requests per hour, 20,000 per month by default. Lifted for free with attribution.                               |
| Rate limiting    | @upstash/ratelimit, @upstash/redis    | latest  | Sliding window on IP and identity hash.                                                                             |
| Email            | Resend                                | latest  | Send the preview link.                                                                                              |
| Booking          | Cal.com inline embed                  |         | Primary call to action.                                                                                             |
| Testing          | Vitest, Playwright                    | latest  | Unit, integration, five-step smoke.                                                                                 |
| Package manager  | pnpm                                  |         |                                                                                                                     |

Versions marked latest were not pinned at research time. Read them off npm when you install.

---

## 4. How it works

### Data model (three tables)

| Table        | Columns                                                                                                                                                                                                          | Purpose                                                                                                                                      |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `lead`       | `id`, `identity_hash` (unique), `email`, `name`, `company`, `created_at`                                                                                                                                         | One row per email address.                                                                                                                   |
| `seen`       | `identity_hash`, `template_id`. Composite primary key on both.                                                                                                                                                   | The exclusivity guarantee. A duplicate reveal is physically impossible.                                                                      |
| `submission` | `slug` (PK), `identity_hash`, `payload_hash` (unique), `template_ids`, `tokens`, `logo_analysis`, `copy`, `imagery`, `stage_brief`, `stage_select`, `stage_copy`, `stage_imagery`, `stage_tokens`, `deadline_at` | One row per distinct submission. The preview page renders from this row only. Stage columns hold `pending`, `running`, `done` or `fallback`. |

### Pipeline stages (Inngest functions)

| Stage   | Trigger                                       | Budget   | AI call                                     | Fallback                                               |
| ------- | --------------------------------------------- | -------- | ------------------------------------------- | ------------------------------------------------------ |
| brief   | Step 2 submitted                              | 20s      | Sonnet 5, JSON output                       | Built from company name and the visitor's own sentence |
| select  | Step 3 submitted                              | 5s       | None                                        | None. Throws.                                          |
| copy    | After select                                  | 60s      | Sonnet 5, one call for all three templates  | Brief fields mapped into slots and truncated           |
| imagery | Step 4 submitted                              | 90s      | Haiku 4.5 ranks 8 to 12 thumbnails per slot | Pexels relevance order                                 |
| tokens  | Step 5 submitted                              | under 1s | None                                        | None. Throws.                                          |
| sweeper | Step 5 submitted, fires at deadline minus 45s |          | None                                        | Forces any unfinished stage to fallback                |

### Rules that keep it safe

- Templates import only from `lib/tokens` and `lib/copy-slots`. A CI grep fails the build if a hex literal or a Tailwind palette class appears anywhere inside `/templates`.
- Copy character limits are enforced in code. The model does not honour length constraints. Validate, retry once, then fall back.
- The exclusivity transaction runs over the Neon WebSocket driver: `BEGIN`, `SELECT` the lead row `FOR UPDATE`, count unseen eligible templates, return the book-a-call state if under three, `INSERT` into `seen`, `COMMIT`.
- The client polls the five stage columns every 2.5 seconds and reveals each concept as its stage lands. No server-sent events.
- HEIC files are converted to JPEG in the browser before upload. sharp cannot decode HEIC on Vercel.
- Uploads go from the browser straight to Blob. Never post a file through a function.
- The model never returns image URLs. Code calls Pexels with the model's queries, downloads, and re-hosts.
- Every stage is idempotent on submission id plus stage name. A retry never double-charges an AI call.

### Environment variables

`HMAC_SECRET`, `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `ANTHROPIC_API_KEY`, `PEXELS_API_KEY`, `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `RESEND_API_KEY`

### Repository layout

| Path                  | Responsibility                                        |
| --------------------- | ----------------------------------------------------- |
| `app/(form)/`         | Five step form and reducer                            |
| `app/preview/[slug]/` | Shareable page, renders from the submission row       |
| `app/api/inngest/`    | Inngest serve handler                                 |
| `app/api/upload/`     | Blob token route                                      |
| `app/api/status/`     | Poll endpoint                                         |
| `lib/identity/`       | HMAC and payload hash                                 |
| `lib/select/`         | `selectTemplates` (pure)                              |
| `lib/tokens/`         | `deriveTokens`, contrast solver, types                |
| `lib/copy-slots/`     | Slot types and validators                             |
| `lib/logo/`           | `analyseLogo` (sharp)                                 |
| `lib/ai/`             | brief, copy, rank (Anthropic)                         |
| `lib/images/`         | Pexels client, variants, re-host                      |
| `lib/db/`             | Schema, queries, exclusivity transaction              |
| `templates/`          | Ten templates. Import tokens and copy-slot types only |
| `db/`                 | drizzle-kit migrations                                |
| `tests/`              | Unit, integration, Playwright                         |
| `scripts/`            | Adversarial corpus runner                             |

---

## 5. Step by step

Work in this order. Each step leaves a working, deployable slice. Do not skip a gate.

### Step 1. Walking skeleton

**Goal:** Step 1 of the form writes a lead to Neon on a Vercel preview deployment.

```bash
pnpm create next-app@latest   # App Router, TypeScript, Tailwind, ESLint
pnpm add drizzle-orm @neondatabase/serverless
pnpm add -D drizzle-kit
pnpm drizzle-kit generate && pnpm drizzle-kit migrate
vercel link && vercel
```

- Create a Neon project and copy `DATABASE_URL` into `.env.local` and the Vercel project.
- Write `lib/db/schema.ts` with the `lead` table. Generate and run the first migration.
- Write `lib/identity/hmac.ts` (HMAC-SHA256 of lowercased, trimmed email with `HMAC_SECRET`).
- Build the step 1 page with a Server Action that inserts the lead.
- Link the repo to Vercel and deploy a preview.

**Done when:** Submitting step 1 on the preview URL creates a row you can see in the Neon console.

### Step 2. Pexels access

**Goal:** Unblock imagery before you need it. The default limit is small and approval takes time.

- Register at pexels.com/api and store the key as `PEXELS_API_KEY`.
- Email Pexels requesting the lifted limit. Include screenshots of a footer showing a prominent Photos provided by Pexels link and photographer credits.
- Read pexels.com/license and record the exact wording on identifiable people and endorsement.

**Done when:** The key returns results and the request has been sent.

### Step 3. Identity and idempotency

**Goal:** The same submission always produces the same result and never consumes new templates.

- `payload_hash = sha256(identity_hash + normalised step 1 and 2 answers + logo sha256)`.
- Add the `submission` table with a unique index on `payload_hash`.
- On submit, look up `payload_hash` first. On a hit, return the stored slug and stop.

**Done when:** A unit test proves an identical resubmission returns the stored record.

### Step 4. Exclusivity transaction

**Goal:** A returning email never sees a repeated template.

- Add the `seen` table with the composite primary key `(identity_hash, template_id)`.
- Write `lib/db/exclusivity.ts` using a neon-serverless Pool. Inside one transaction: lock the lead row with `SELECT FOR UPDATE`, read `seen`, filter eligible templates, return the book-a-call state if fewer than three remain, otherwise insert the three chosen ids into `seen` and commit.
- Write an integration test that fires parallel submissions for the same email against a real Neon branch.

**Done when:** The concurrency test never yields a duplicate, and the under-three case returns the end state.

### Step 5. Colour engine and adversarial corpus (gate)

**Goal:** Prove the token pipeline is safe before a single template exists.

```bash
pnpm add culori
pnpm add -D @types/culori vitest
```

- `lib/tokens/derive.ts`: parse hex, convert to OKLCH, lock hue, build a fixed lightness ramp, clamp chroma into sRGB, produce accent and accent-readable, tint surfaces with the brand hue at low chroma.
- Solve every contract pair to AA with `wcagContrast` by shifting lightness in 0.02 steps. Allow polarity flip for text-on-accent. Throw if a pair fails at lightness 0 and 1.
- Corpus: `#FFFF00`, `#808080`, `#00FF00`, `#FF00FF`, `#000000`, `#FFFFFF`, near-white, near-black, out-of-gamut values.
- Run the corpus against placeholder contracts in Vitest.

**Done when:** Every corpus entry either passes AA or throws deliberately. Do not begin templates until this is green.

### Step 6. Token contract and first template

**Goal:** One template that consumes semantic classes only, with the lint gates live.

- Define `TemplateMeta`, `ContrastPair`, `CopySlot` and `TokenSet` in `lib/tokens/types.ts`.
- Declare the tokens in Tailwind `@theme` so `bg-surface-base`, `text-accent-readable`, `bg-accent` and friends exist. Set their values from CSS variables on the preview root.
- Build `templates/t01` with a header surface token so it works with light and dark logos.
- Add the CI grep that fails on hex literals or palette classes under `/templates`, and an ESLint `no-restricted-imports` rule so templates cannot import `lib/ai`, `lib/images` or `lib/db`.

**Done when:** t01 renders both logo polarities, declares all its contrast pairs, passes the grep, and has a checked mobile layout.

### Step 7. Uploads

**Goal:** Reliable logo and imagery upload from any device.

```bash
pnpm add @vercel/blob
```

- `app/api/upload/route.ts` with `handleUpload`. In `onBeforeGenerateToken` set `allowedContentTypes` to image types and set `maximumSizeInBytes`.
- The client calls `upload` from `@vercel/blob/client` with `handleUploadUrl` pointing at that route.
- Detect HEIC by extension and MIME, convert to JPEG in the browser before upload, cap dimensions. Test on a real iPhone.
- Offer the wordmark option so the logo step can be skipped.

**Done when:** A 6 MB PNG and an iPhone HEIC both upload and re-host.

### Step 8. Logo analysis

**Goal:** Correct light or dark classification for real-world logos.

```bash
pnpm add sharp
```

- Add `serverExternalPackages: ['sharp']` to `next.config`.
- `lib/logo/analyse.ts`: rasterise to 128px, `ensureAlpha`, read a raw buffer, compute alpha-weighted mean relative luminance ignoring alpha under 16. Under 0.35 is dark artwork, over 0.65 is light, otherwise mixed.
- Sample the border ring to detect an opaque backdrop such as a white box.
- Strip scripts and external references from uploaded SVGs before rasterising. Treat a failed rasterisation as mixed.

**Done when:** Fixtures for dark, light, mixed, transparent and white-box logos classify correctly.

### Step 9. Brief stage

**Goal:** The first durable AI stage.

```bash
pnpm add inngest @anthropic-ai/sdk
npx inngest-cli@latest dev
```

- `app/api/inngest/route.ts` exports GET, POST and PUT from `serve`, with `export const maxDuration = 300` and streaming enabled.
- `lib/ai/brief.ts` calls `claude-sonnet-5` with JSON structured output producing the `BrandBrief`. Prompt it to paraphrase the visitor's sentence only and to invent no numbers, awards, clients or claims.
- Trigger on `form/q2.submitted`. Idempotency key `submissionId:brief`. Retry once, then the deterministic fallback.
- Run the Inngest dev server locally while building.

**Done when:** Submitting step 2 produces a `BrandBrief` or the fallback, and re-sending the event does nothing.

### Step 10. Select and copy stages

**Goal:** Deterministic template choice and validated copy.

- `lib/select/select.ts`: filter by `seen` and logo affinity, sort by id, seed a PRNG from the hash, Fisher-Yates shuffle, then greedy pick for tone-tag diversity. Pure function.
- `lib/ai/copy.ts`: one structured call that fills every slot for all three templates.
- `lib/copy-slots/validate.ts`: enforce min and max characters, reject numerals, superlatives, awards and client names. Retry once, then build fallback copy from the visitor's sentence and company name.
- Trigger select on `form/q3.submitted` and copy immediately after.

**Done when:** Unit tests prove the same hash gives the same templates, and every slot is filled or falls back.

### Step 11. Imagery stage

**Goal:** Ranked, re-hosted, credited images.

- `lib/images/pexels.ts`: search with query, orientation and `per_page`. Cache normalised queries for 24 hours. Watch `X-Ratelimit-Remaining`.
- `lib/images/rehost.ts`: download, generate responsive variants with sharp, upload to Blob, record dominant OKLCH, photographer and photo URL.
- `lib/ai/rank.ts`: one `claude-haiku-4-5` call scoring 8 to 12 small thumbnails per slot. Reject watermarks, embedded text, busy compositions and identifiable single-subject portraits.
- Use the dominant OKLCH to solve scrim opacity for any text-over-image slot.
- Footer credit with a prominent Pexels link.

**Done when:** Three concepts render with re-hosted imagery, and relevance order is used when the vision call fails.

### Step 12. Tokens, sweeper and status polling

**Goal:** The countdown never hits zero without a result.

- Wire `deriveTokens` as the tokens stage on `form/q5.submitted` and set `deadline_at`.
- Sweeper function: `step.sleepUntil(deadline minus 45 seconds)`, then force any stage not done to fallback.
- `app/api/status/route.ts` returns the five stage columns for a slug.
- Client countdown polls every 2.5 seconds and reveals each concept as it lands.

**Done when:** Forcing a stage to hang still produces a complete result before the timer reaches zero.

### Step 13. Preview page, OG image and call to action

**Goal:** A shareable page that books calls.

```bash
pnpm add resend
```

- `app/preview/[slug]/page.tsx` renders only from the stored submission row.
- OG image with `next/og` using hex-converted tokens: logo, brand colours, headline.
- Cal.com inline embed as the primary button. Secondary: email me these concepts via Resend.
- Book-a-call end state for exhausted pools.
- Mobile: static thumbnails in the gallery, one live render on tap. Desktop: scaled real DOM previews.

**Done when:** The URL renders identically on every visit and a test booking completes.

### Step 14. Build the ten templates

**Goal:** The full library, each one against the same contract.

- Per template: both logo polarities via the header surface token, every contrast pair declared, every copy slot with min and max, no hex or palette classes, mobile layout.
- Eight or nine of the ten must accept either logo polarity.
- Give each template tone tags so the selector can pick three that feel different.

**Done when:** All ten pass the grep, the import boundary rule and the corpus test.

### Step 15. Security and privacy

**Goal:** Production controls for an unauthenticated public tool.

```bash
pnpm add @upstash/ratelimit @upstash/redis
```

- Upstash sliding window: 5 submissions per hour per IP, 3 per day per identity. Tune from real traffic.
- Honeypot field. Reject completions under 3 seconds.
- Privacy notice at step 1: who you are, purposes, lawful basis (legitimate interests for the preview; consent or soft opt-in with a clear opt-out for follow-up email), retention period, rights including the right to object, how to complain to the ICO, processors (Anthropic, Pexels, Vercel, Neon, Inngest, Resend).
- Retention job: delete lead, submission and blobs after 90 days unless a call was booked. Keep `seen`.
- Erasure and access by identity hash.

**Done when:** Limits block, the notice is live, erasure works.

### Step 16. CI, launch and monitoring

**Goal:** Gates on every change and a clean launch.

```bash
pnpm add -D @playwright/test && pnpm exec playwright install
```

- Every PR: lint, typecheck, unit tests, template grep, import boundary rule.
- Nightly: Playwright five-step smoke, corpus test, a small live smoke against Pexels and Anthropic.

**Done when:** The checklists below are complete.

---

## Pre-launch checklist

- [ ] Vercel Pro. All environment variables set in Production.
- [ ] Pexels attribution live. Lifted limit request resolved.
- [ ] Sweeper verified end to end on a real deployment.
- [ ] Retention job scheduled.
- [ ] Privacy notice reviewed.
- [ ] sharp verified on a real Vercel deployment with a PNG, an SVG and a JPEG.
- [ ] OG image colours verified.
- [ ] Test booking completed through the live CTA.

## First week after launch, check daily

- Pexels `X-Ratelimit-Remaining`.
- Anthropic spend and error rate.
- Inngest failed runs.
- Neon compute hours and storage.
- Sweeper fallback frequency. A rising number means a stage is unreliable.
- Upload failure rate, especially HEIC.
- Booked discovery calls.

## Running cost

AI cost is roughly $0.04 to $0.06 per submission. Expect about $5 per month at 100 submissions, $25 at 500 and $100 at 2,000, plus Vercel Pro at $20 per month. Neon, Inngest, Upstash and Blob stay within free or near-free tiers at these volumes if the retention job runs.

## Verify when you install

Exact versions for `@vercel/blob`, `@upstash` packages, `resend`, `vitest`, `playwright` and the Tailwind patch. Whether the Cal.com inline embed is still free. HEIC conversion behaviour on current iOS Safari.
