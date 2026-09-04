# One zod, a guarded SVG, uploads in a hook, references for retention, and the majors that fit

- Status: accepted
- Date: 4 September 2026
- Plan: `docs/audit-plan.md`, "Nice to have"
- Amends: ADR 0002 (the zod pin in `docs/standards.md`), ADR 0011 (decision 4, the ranking prompt), ADR 0014 (decision 4, the reference check)

## Context

The third batch of the audit of 4 September 2026. Two zod dialects were in use because the SDK's structured-output helper is typed against `zod/v4`. The ranking prompt sat outside `lib/ai/prompts.ts`, the one file meant to be read by tests and to guard what reaches a model. The copy prompt pretty-printed the brief. A visitor's SVG reached librsvg unchecked, and the sharp documentation says nothing about the bundled build's policy on external references. The upload bookkeeping made `Flow` a 260-line component with two concerns. The retention sweep answered "does anything else point at this file" with a text scan of every row. Four majors were behind.

## Decision

1. **zod 4, one dialect.** `zod@4.5.4`; every import is `zod`; `z.string().url()` and `.email()` became `z.url()` and `z.email()`, the one `invalid_type_error` became `error`, the refine `message` became `error`, and the reducer's `SafeParseReturnType` became `ZodSafeParseResult`. The email field is `z.string().trim().pipe(z.email(...))`, so the trim still runs before the check. `docs/standards.md` now pins zod 4.x. The SDK helper's `zod/v4` import resolves to the same package. Every import is the namespace form, `import * as z from 'zod'`, which zod 4 recommends: with `import { z }` the bundler kept all 253 locales on the `z` object and the start page's zod chunk was 86 KB gzipped; with the namespace form it is 28 KB. Even so zod 4's core is about 13 KB gzipped heavier on the start page than zod 3 was, and that page's script budget was raised from 230 KB to 245 KB to hold it (measured 238.6 KB). `zod/mini` on the client would recover most of it at the cost of a second dialect, which is the trade this decision declines.
2. **The ranking prompt lives in `prompts.ts`** as `RANK_SYSTEM_PROMPT` and `rankPrompt(purpose)`, and `rank.ts` throws `AppError` like its siblings.
3. **The brief is compact JSON in the copy prompt.** About a hundred tokens a call, for nothing lost.
4. **An SVG that could reach outside itself is refused before sharp sees it.** `lib/logo/svg.ts` recognises an SVG by its first tag and refuses one carrying a script, an `href` to a network or file URL, a `javascript:` URL, an entity declaration, an external document type or an XInclude, scanning the first megabyte. The sharp documentation does not state the bundled librsvg's policy, so the guard does not rely on it. A refused logo means the wordmark, with the reason in `logo.fallback`.
5. **The upload bookkeeping is `usePictureUploads(answers, dispatch)`** in `app/start/_components/use-picture-uploads.ts`: the object URLs, the upload outcomes and the three handlers. `Flow` keeps the question flow and computes `uploading` from what the hook returns. The reducer is unchanged.
6. **A `blob_ref` table records which files each submission points at.** `(url, slug)` keyed, with the slug cascading from the submission row. `lib/blob/urls.ts` (pure) collects the URLs from the answers, the logo result and the imagery result; `createOrFindSubmission` records the uploads on every call, and `markStage` records a patch's files before it writes the row, so a retried step never leaves a file unrecorded. `urlReferencedElsewhere` is one read on the key. Migration `0005_flippant_medusa` creates the table and backfills it from the existing rows in SQL; applied to the development database on 4 September 2026 and checked row by row against the collector: 17 submissions, 45 references, no mismatches.
7. **vitest 5 and Node 22 types; not ESLint 10, not TypeScript 7.** vitest 5.0.0 runs the suite unchanged (it needs Node 22.12, so `engines.node` is `>=22.12`; CI runs Node 22). `@types/node` is pinned to 22.x to match the runtime. ESLint 10 is within `eslint-config-next`'s own peer range, but its `eslint-plugin-react` 7.37.5 declares support up to 9.7 and crashed inside `componentRule` on the first run, so ESLint stays at 9.39.5 until that plugin supports 10. TypeScript 7 is outside `typescript-eslint` 8.69's supported range (`<6.1.0`), so TypeScript stays at 5.9.3.

## Consequences

- `lib/logo/svg.ts`, `app/start/_components/use-picture-uploads.ts`, `lib/blob/urls.ts` and migration `0005` are new; `lib/db/retention.ts` no longer reads jsonb as text.
- A file shared by two submissions is now found by one indexed read however many rows there are; the sweep's cost is rows to remove times their files, not times every row.
- Tests: `lib/logo/svg.test.ts` (fifteen cases), `lib/blob/urls.test.ts`; the desktop brief e2e spec covers the hook end to end.
- Watch for `eslint-plugin-react` declaring ESLint 10 and `typescript-eslint` declaring TypeScript 7; each is then one PR.
