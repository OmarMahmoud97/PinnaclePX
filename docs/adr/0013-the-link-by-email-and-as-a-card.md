# The link: on screen, by email once, and as a card when shared

- Status: accepted
- Date: 4 September 2026
- Plan: `docs/pipeline-plan.md`, section 18, slice 6

## Context

The build guide's step 13 asks for a shareable page, an Open Graph image from the tokens, and the preview link sent by email through Resend; `docs/home-page-plan.md` adds that the link is shown on screen as well, so a mistyped email does not lose the lead. The Resend key in the project is send-only, and no sending domain is verified yet.

## Decision

1. **The email is one Inngest function, signalled twice, sent once.** The pipeline sends `pipeline/submission.ready` when its last stage settles, and the sweeper sends it after it sweeps, so the signal arrives whichever settled the row. `send-preview-link` is idempotent on the slug, and the row's `email_sent_at` refuses a second send anyway. Nothing is sent for an exhausted or failed submission: there is no page to link to, and the done page has already said so.
2. **The sender is configurable, and honest until then.** `RESEND_FROM` names the sender on a verified domain. Unset, Resend's own test sender is used, which reaches only the account owner's address, so every other visitor's email fails visibly in Inngest rather than silently. The email is plain: a greeting by first name, the link, how long it lasts, the call, no images, no tracking.
3. **The address is on screen.** The done page prints the absolute address of the visitor's page as a link, above the countdown, from the moment the submission exists.
4. **The card is rendered from the row.** `app/preview/[slug]/opengraph-image.tsx` paints the company name and the first design's headline in the submission's own tokens, with the studio's name, through `next/og`. Each template's contract now exposes `headlineOf`, so the card never reaches into a template's copy shape.

## Consequences

- `lib/email/preview-link.ts` (pure, tested) and `send.ts`; `lib/inngest/functions/send-preview-link.ts`; migration `0003_email_sent_at`; `readSubmissionWithLead` and `markEmailSent`; the hub's `generateMetadata`.
- Verified on 4 September 2026 on a production build with the Inngest dev server and the owner's own address: the email arrived through the test sender with the link, the row recorded the send, the done page showed the address, and the hub served a 1200 by 630 card in the brand's colours.
- Before launch: verify a sending domain in Resend and set `RESEND_FROM`; until then the email reaches only the owner.
