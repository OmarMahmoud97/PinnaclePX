# Production controls: limits in Postgres, a honeypot and a floor, the notice, the sweep, erasure

- Status: accepted
- Date: 4 September 2026
- Plan: `docs/pipeline-plan.md`, section 18, slice 7
- Amended by: ADR 0037 (decisions 3 and 4, 24 September 2026; decision 3 again, 25 September 2026)

## Context

The build guide's step 15 asks for Upstash sliding-window limits (five submissions an hour per address, three a day per identity), a honeypot and a three-second floor, a privacy notice at the question that takes the email, a retention job that deletes after the retention period but keeps `seen`, and erasure by identity. The project has no Upstash account, and every other piece of state already lives in Neon.

## Decision

1. **Limits are fixed windows counted in Postgres.** A `rate_limit` table keyed by scope, subject and window start; one atomic upsert per hit returns the new count (`lib/db/rate-limit.ts`). Fixed rather than sliding, because one query per hit is all a serverless function should spend on it and the limits are generous enough that the window's edge does not matter. No new service, no new secrets. Submissions are limited per caller address and per identity; the upload token route per address. Old windows are removed by the nightly sweep.
2. **The form carries its opening time and a field no person sees.** The pane reads the hidden field from the form on submit; the flow sends how long the form has been open. The action refuses a filled field or a form finished inside `CONFIG.form.minMs`, with the same message a malformed brief gets, and logs it as `brief.honeypot` without the answers.
3. **The notice is a page, linked where the email is asked for.** `/privacy` says what is collected, what it is used for and on what basis, how long it is kept, who processes it, and the visitor's rights including the ICO. Question two links to it beside the email field; the footer and the sitemap carry it. The contact address comes from `SITE.contactEmail` once the owner sets it. Amended 24 September 2026 (ADR 0037, decision 15): the page also says what the browser keeps and for how long, names Cal.com among the processors, and says unsent pictures go within two days. Amended 25 September 2026 (ADR 0037, decision 19): the questions now ask for the logo and the photos before the email, which is question five, so "How we use your pictures" sits beside the logo and photo tiles at questions two and three, since a picture uploads the moment it is chosen, and "How we use your details" beside the email; both open `/privacy` in a new tab.
4. **Retention is a nightly Inngest cron.** `retention-sweep` deletes each submission older than `CONFIG.retention.days` in its own step: its pictures on Blob (unless another submission still points at the same file), then the row; then leads with nothing left, then stale rate limit windows. `seen` stays, because the exclusivity promise outlives the preview. Amended 24 September 2026 (ADR 0037, decision 14): a second nightly function, `orphan-upload-sweep`, deletes uploaded pictures more than 24 hours old that no submission references, since a picture is stored the moment it is chosen, whether or not the brief is ever sent.
5. **Erasure is an admin event.** `admin/identity.erase` with an email, sent from the Inngest dashboard or the dev server's UI, removes every submission and picture for that address, its `seen` rows and its lead. The address never reaches a log. The same function resets a test address.

## Consequences

- Migration `0004_rate_limit`. `lib/rate-limit/window.ts` (pure, tested) and `request.ts`; `lib/db/rate-limit.ts` and `retention.ts`; `lib/blob/delete.ts`; `lib/inngest/functions/retention-sweep.ts` and `erase-identity.ts`; `app/privacy/page.tsx`.
- The e2e submit test waits out the floor before it clicks.
- Verified on 4 September 2026 on a production build with the Inngest dev server: the upload token route answered 429 on the forty-first request in an hour; a form finished in 2,998 ms and one with the hidden field filled were both refused and logged; the privacy page is axe clean and linked from question two; the erase event removed two submissions and the `seen` row for a test address.
- Still open before launch: `SITE.contactEmail` for the notice, and a booked-call signal so retention can keep a submission whose call was booked, which the guide asks for and which needs the Cal.com webhook.
