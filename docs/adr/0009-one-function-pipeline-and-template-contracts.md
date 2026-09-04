# The pipeline: one function, lock-free exclusivity, per-template contracts

- Status: accepted
- Date: 4 September 2026
- Plan: `docs/pipeline-plan.md`

## Context

The build guide (`docs/brand-concept-generator-build-guide.md`) describes a five-route form that starts a pipeline stage after each step, an exclusivity transaction over the Neon WebSocket driver, one copy call for all three templates, and a `/api/status` route polled by the client. ADR 0004 replaced the five routes with one page and one submit, ADR 0008 gave each template its own content object, and only Aurora is ready. The plan reconciles the guide with the code as it stands; this record fixes the decisions that change the guide.

## Decision

1. **One event, one function.** `submitBrief` sends `pipeline/submission.created` once, with every answer. One Inngest function runs the stages as steps in dependency order, copy and imagery in parallel, and a second function sleeps until 45 seconds before the deadline and writes the deterministic fallback into any stage still open. The five stage columns stay, because the done page reveals per stage. Stage writes are conditional (`WHERE stage IN ('pending','running')`), so the two functions never overwrite each other and a page renders identically on every visit.
2. **Exclusivity without a lock.** `seen` keeps its composite primary key `(identity_hash, template_id)` and gains `slug`. The reveal is one multi-row `INSERT`; a unique violation aborts the whole statement, the loser re-reads `seen` and re-selects, and after a bounded number of attempts throws. The guarantee is the key, as the guide itself says; the `SELECT FOR UPDATE` transaction and the second driver are not needed to hold it. The slug lets a retried step recognise its own rows.
3. **A contract per template, read through the registry.** Every ready template exports a `TemplateContract` (`lib/copy-slots/contract.ts`): its meta, contrast pairs, image slots, a zod schema of its text slots, a deterministic `fallbackCopy(brief)` that always passes its own `copyViolations`, and the violations check. Links are never copy: each template fixes its own link plan. `templates/registry.ts` holds the metas and the contracts and is the one file under `templates/` that `lib/select`, `lib/inngest`, `lib/ai` and `lib/preview` may import; a lint rule keeps React and sections out of the registry and the contracts. Components are reached only from `templates/render.tsx` by the preview pages.
4. **Copy is one call per template.** Each call is validated, retried once and fallen back independently, so one bad output cannot sink the others. The cost of three smaller calls is within the guide's estimate.
5. **The concept count is `min(conceptsShown, ready templates)`** while fewer than three templates are ready, recorded on the submission row, computed in one place in `lib/select`. When ten are ready the `min` is a no-op and is removed. Three Aurora concepts would break the primary key and the exclusivity promise.
6. **Uploads happen at pick time, to content-addressed paths** (`logos/<sha256>.<ext>`, `photos/<sha256>.<ext>`), so uploads are idempotent, identical files dedupe, and a refresh keeps the visitor's logo. Blobs no submission references are removed by the retention job.
7. **Status polling stays a Server Action**, every three seconds, to the server's `deadline_at`. A GET route replaces it only if the POST cost shows in the logs.
8. **Models are the guide's**: `claude-sonnet-5` for brief and copy, `claude-haiku-4-5` for image ranking. Verified against the SDK reference of 4 September 2026: structured outputs via `messages.parse` with `zodOutputFormat`, adaptive thinking with `output_config.effort`.
9. **`TemplateMeta` gains `ready`, `polarity` and `tones`**, so the selector never picks a placeholder, can honour the guide's logo affinity rule, and can pick concepts that feel different.

## Consequences

- Migrations `0001_drop_briefs` and `0002_pipeline_tables` replace the scaffold `briefs` table with `lead`, `seen` and `submission`. They were generated as two steps because drizzle-kit prompts for renames when a drop and additions land together.
- `lib/copy-slots/fit.ts` (`fitToSlot`) and `lib/copy-slots/brief.ts` (`BrandBrief`, `fallbackBrief`) exist for every template's fallback. A company name longer than a template's wordmark slot is shortened at a word boundary; the legal name and an image logo are unaffected.
- `templates/t01-aurora/contract.ts` is the shape the nine templates to come follow: `copySchema`, `fallbackCopy`, `assemble`, and the contract, with a test over a corpus of briefs at the edges of what the form accepts.
- ESLint: `lib/select`, `lib/inngest`, `lib/ai` and `lib/preview` may import `@/templates/registry`; the registry and `templates/*/contract.ts` may not import `react`, `next`, `index` or `sections`.
- `vercel.json` pins functions to `lhr1`, beside the database.
- The guide's stage table (section 4) and step 4 should be read with this record; the plan's section 3 lists every difference.
