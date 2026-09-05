# The owner is told of every build, with what it cost in tokens

- Status: accepted
- Date: 4 September 2026
- Amends: ADR 0013 (decision 1)

## Context

The owner asked to be emailed every time a set of designs is built: the links, the details the client filled into the form, and how many Claude tokens the build used. Until now the product sent one email, to the visitor, and the token counts of each model call went only to the log, where they are hard to add up per submission and are gone with the log's retention.

## Decision

1. **Every model call leaves a row.** `lib/ai/usage.ts` replaces the three `ai.call` log blocks: it writes the same log line and appends a `model_call` row (slug, stage, template, model, input, output, cache read and cache write tokens). Rows are appended, never summed in place, because the copy and imagery steps run in parallel and each retried step spends its call again; the rows are the truth about what was spent. A row that cannot be written is logged as `ai.call.unrecorded` and let go, since failing the stage there would spend the call again. The table goes with the submission on delete, so retention and erasure need no change.
2. **The notice is the second step of the email function.** `send-preview-link` keeps its id and its idempotency on the slug, and gains a `notify-owner` step after `send`. Each step reads the row itself and each is memoised by Inngest, so a failure in one retries that one alone. The row's `owner_notified_at` refuses a second notice as `email_sent_at` refuses a second link.
3. **The owner hears of every page, the visitor only of a finished one.** The visitor's email is still withheld when a stage settled with its fallback (ADR 0015). The owner's notice goes out for a ready or a partial page, says which it is and which stages fell back, because the owner wants to know of every build and what it cost. Nothing is sent for an exhausted or failed submission: nothing was built.
4. **The address is `OWNER_EMAIL`**, required, validated as an address in `lib/env.ts`, so the repository never carries it. Until a sending domain is verified and `RESEND_FROM` is set, Resend's test sender reaches the account owner's own address, which is this one.
5. **The notice is plain and complete.** `lib/email/owner-notice.ts` (pure, tested) builds four sections: the links (the hub and each design), the client (name, email, company, description, logo, colours, look, photos, with uploads linked), the build (when, outcome, slug), and the tokens (total over the calls, input with the cache share when any, output, and a line per stage and model). It is sent to the owner alone, so the client's details may appear in full; the log still never carries them.

## Consequences

- Migration `0006_model_calls`: the `model_call` table and `submission.owner_notified_at`. Applied to the London database on 4 September 2026.
- `lib/db/model-calls.ts`, `markOwnerNotified`, `lib/email/message.ts` (the shared email shape and `escapeHtml`, moved out of `preview-link.ts`).
- `OWNER_EMAIL` must be set on Vercel with the other variables before a deployment builds; the CI workflow uses a placeholder.
- A cost in money is not shown: prices change and the tokens are the record. It can be added to the notice from the rows if wanted.
