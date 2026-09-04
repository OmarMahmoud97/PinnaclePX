# Quota settles the imagery stage, every query is tried, the sweeps read one row at a time

- Status: accepted
- Date: 4 September 2026
- Plan: `docs/audit-plan.md`, "Do soon"
- Amends: ADR 0011 (decisions 4 and 5, see its amendments), ADR 0012 (decisions 1, 2 and 4), ADR 0014 (decisions 4 and 5), ADR 0015 (decision 4)

## Context

The second batch of the audit of 4 September 2026. A Pexels 429 was retried on the stage cadence, each retry a search against a quota that had not returned. The brief asked for two image queries per slot kind and the code used only the first, so a first query with no results left the slot empty with a second query in hand. The retention sweep and the erasure re-read every row inside every per-row step. Three documents said things the code no longer did: ADR 0011 described thinking and a cache marker that PR #16 and Sonnet 5's cache minimum had made untrue, and the vitest config described integration tests that reach a database. The upload route read its body before counting the hit. `drizzle-kit` pulled an esbuild with a known advisory. Two platform facts were unverified: whether a caller can forge `x-forwarded-for` on Vercel, and whether `next/font` preloads every declared face on a preview page.

## Decision

1. **A spent Pexels quota settles the imagery stage at once.** The Pexels documentation says the quota headers are sent only with a good answer, "not included with other responses, including 429 Too Many Requests", and names no `Retry-After`; so a 429 says nothing about when a search will work again, and reading a reset time, as the audit suggested, is not possible. `searchPhotos` throws `PexelsQuotaError` and logs `pexels.exhausted` at error level, because every submission goes without stock photographs until the quota returns. The stage leaves the slot empty, and when no other slot is worth another attempt it marks itself `fallback` rather than retry until the sweeper: the page opens as `partial` and the email waits, the same as if the sweeper had settled it, only minutes sooner and without a search every twenty seconds. `imageryFor` now reports which slots a retryable failure left empty and whether the quota was met; a stage's work returns how it ended (`Written`), so a stage can settle itself with its own fallback.
2. **Every query the brief gives a slot is tried in order.** `planImagery` keeps every non-blank query, with the style's words added, and the stage searches them in turn until one finds candidates. The ranking is keyed by the queries and the purpose, and each search is still shared across templates.
3. **The sweeps read one row at a time.** `slugsCreatedBefore` and `slugsOf` select only slugs; each per-row step reads its own row through `removeSubmission`, which the retention sweep and the erasure share.
4. **The documents say what the code does.** ADR 0011 carries dated amendments for thinking (off, no effort) and for the cache marker, which was removed with the `cached` log field: Sonnet 5 caches no prefix under 1,024 tokens and the system prompt is about 180. The vitest comment says why the env is loaded. `docs/pipeline-plan.md` rows for the brief and copy calls match.
5. **The upload route counts the hit before reading the body**, and a body that is not JSON is refused as a bad request rather than thrown.
6. **`esbuild` below 0.25 is overridden** in `package.json` (`pnpm.overrides`), so `drizzle-kit`'s `@esbuild-kit` loader takes 0.25.12; `pnpm audit` reports nothing and `drizzle-kit --version` runs. Drop the override when `drizzle-kit` drops `@esbuild-kit`.
7. **Verified, no change: `x-forwarded-for` on Vercel.** The Vercel request-headers reference says Vercel overwrites the header and does "not forward external IPs", "to prevent IP spoofing"; a custom value needs the Enterprise trusted-proxy feature. The first hop is the caller's, so `callerAddress` stands and its comment cites the reference.
8. **Verified, changed: font preloads.** A production build's preview page carried nine font preload hints in its React payload: all seven preview families, plus Geist and Geist Mono from the root layout; a preview uses two of the seven. With `preload: false` on the seven and on the Aurora example route's two faces (which reached the preview page through the shared Aurora chunk), a preview page preloads only the root layout's two. The `@font-face` rules stay and the chosen pair loads on demand with a swap.

## Consequences

- `lib/images/pexels.ts` gains `PexelsQuotaError`; `lib/images/plan.ts` `SlotPlan` search steps carry `queries`; `lib/images/stage.ts` returns an `ImageryOutcome`; `lib/inngest/stages.ts` work returns `Written` (`done(patch)` for the common case); `lib/inngest/remove-submission.ts` is new; `lib/db/retention.ts` selects slugs.
- With the quota spent, a submission's page lands within the imagery stage's own time as `partial` with no stock photographs, and the log shows one `pexels.exhausted` error per search rather than fourteen retries.
- Tests: `lib/images/stage.test.ts` covers the next query, the quota settling a slot, and the unfilled report; `lib/images/plan.test.ts` the ordered queries with blanks dropped; `lib/inngest/stages.test.ts` a stage settling with its own fallback.
