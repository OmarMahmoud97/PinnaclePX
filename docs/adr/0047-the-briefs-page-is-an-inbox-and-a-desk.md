# The briefs page is an inbox and a desk

- Status: accepted, built on 2 October 2026, pending the owner's check. The Cal.com signal waits
  on OD1; the rest is live once the migration and the variables are on Vercel
- Date: 2 October 2026
- Amends: ADR 0045 (decision 1: the view gains the stage columns, `owner_opened_at` and the
  person's standing; decision 2: the page is two routes with one form and one Server Action;
  decision 4: the notice changes by the sentences below; OD2 answered yes by the owner, so
  booked and won briefs are kept past the thirty days; OD3 and OD4 stand); ADR 0014 (decision 4,
  retention: a kept rule in the sweep); ADR 0040 (the Cal.com processor line and the contact
  calendar sentence now say Cal.com tells us when you book); ADR 0020 (the owner's notice gains a
  link to the brief on /admin); ADR 0046 (which this relies on: the enquiry row hangs off `lead`
  with a cascade, which only works once the lead itself can go)

## Context

The owner, 2 October 2026: "make some improvements to the admin page as right now it is very hard
to see what the latest submissions are, what the last submission I looked at was, who has booked a
call and who hasn't etc. lets think from a business perspective and an ease of use perspective."

The first release (ADR 0045) listed every brief newest first as a card, knew of its outcome only
whether the link email had gone, and marked nothing: not which brief was new, not which the owner
had read, not whether the visitor had booked the call every page offers. Cal.com held the
bookings and the owner's inbox held the notices; nothing on the server joined them to a brief.

Four designs were drawn from different angles (business first, ease of use first, minimal and
maintainable, a pipeline CRM) and scored by four judges (business value, ease of use,
engineering fit, privacy and promises); the business-first design won three lenses and the
minimal one the engineering lens. A tech lead's synthesis took the winner and grafted the
minimal design's single form, plain anchors and request-time pages; three critics (an engineer,
the owner's advocate, privacy counsel) then found the blockers recorded below, and the plan was
revised before any code. The verified Cal.com facts (webhook signature, payload, metadata
prefill, delivery rules) are in `docs/adr/0047` 's sources and the project memory.

## Decision

1. **Two routes, one form.** `/admin` is the inbox: a "Needs you" strip (the next call, calls
   needing an outcome, Cal.com bookings that matched no brief, how many briefs are new and how
   many still building), the count with the last brief opened, then every brief the sweep holds,
   newest first, each a plain anchor to `/admin/<slug>` carrying a dot and a heavier name while
   unopened, the person, the standing with its mark, and the person's note on their newest brief.
   `/admin/<slug>` is the desk: the brief as the first release's card, and above it the standing
   panel, one form posting to one Server Action with a discriminated `intent` (quoted, won, lost,
   note, book, unbook, no_show, unopen), so every tap carries the note and the quote with it and a
   typed note is never lost by tapping Won. A `useActionState` leaf prints the action's answer
   ("Saved.", "Not saved. Try again.", "This brief has been deleted.", "Sign in again.", "That was
   not accepted."); a `useFormStatus` leaf dims every button and says "Saving" on the pressed
   one. No optimistic state, no reducer: the page re-rendered by `refresh()` is the truth.
   `error.tsx` offers a reload for a stale action id after a deploy.

2. **Opened is an authenticated render.** The desk checks the Basic header, stamps
   `submission.owner_opened_at = now()` by one statement, and only then reads the row, so the list
   the owner goes back to is already right. A safe method mutates state here by design; the links
   are plain `<a>`, never `next/link`, so a prefetch can never stamp a brief. The browser's
   back/forward cache may show a stale dot until the list next loads: accepted. "Mark as new"
   clears the stamp. The stamp and every owner mark live in Postgres, never a cookie or browser
   storage: phone and desk must agree, Basic auth has no session, the notice lists every browser
   key, and the data is the visitor's and goes with the brief.

3. **Standing is per person.** One row in `enquiry` per lead, made lazily, child of `lead` with
   `ON DELETE cascade`: stage (open, quoted, won, lost) with the quote in whole pounds and when it
   was set; the note; and one live booking (state booked, cancelled or no_show; source cal or
   owner; Cal.com's uid only as a sha256; start, end; and `call_at`, Cal.com's own `createdAt` or
   the owner's clock, so the newer record wins). A call and a quote happen to a person, and Cal.com
   only ever knows the person; one row per lead keeps the view a plain `LEFT JOIN`. A fact
   stamped before a brief was created is set aside on that brief as "earlier: Won" and the brief
   shows its build word, so a returning visitor's new brief reads as new; the desk says when the
   standing is shared across several briefs. Every word records what the visitor or the system did:
   no "contacted", "chased", "held" or "follow-up"; the address is text, never a mailto; nothing
   under `app/admin` or `app/api/cal` can reach `lib/email` or the email provider, which
   `lib/email/no-outreach.test.ts` holds over the import graph.

4. **Any state from any state, decided on the server.** Quoted, Won and Lost toggle: tapping the
   current stage clears it to open and nulls the quote; the toggle is one `INSERT ... ON CONFLICT
DO UPDATE` whose `CASE` compares against the stored stage, so two stale tabs cannot wipe each
   other. Lost never writes a quote and prints the saved one as a fact. The outcome row is never
   hidden, so a quote or a win can be recorded while a call is still ahead. The pill holds Booked
   from the booking through the call; a call needs an outcome from its start plus
   `CONFIG.call.minutes`, or, when the time was not set, from `CONFIG.admin.untimedCallDays` after
   the mark; "Link sent" carries its age past `CONFIG.admin.quietDays`. A hand mark records a call
   the visitor agreed to by whatever route, takes an optional London time (`datetime-local`,
   parsed by `fromLondonLocal`, the ambiguous autumn hour taken as the first instant), prefilled
   with the next whole hour or the soonest unmatched Cal.com booking, which it then consumes.

5. **Cal.com is the source of a cal booking, and the owner may correct the mirror.** "Not
   happening" writes cancelled with source owner and keeps the uid digest, because Cal.com's
   default delivery never retries and an uncorrectable record would teach the owner to write a
   false No-show; BOOKING_CANCELLED changes the row only where the uid digest matches.

6. **The booking signal is `POST /api/cal`, dormant until `CAL_WEBHOOK_SECRET` is set.** Outside
   `/admin`, so the proxy never challenges Cal.com. 404 without the secret; 413 over
   `CONFIG.admin.webhookBodyBytes`; the signature `X-Cal-Signature-256` checked as HMAC-SHA256
   over the raw bytes, compared as digests in constant time; a body zod keeps exactly seven
   fields of (`triggerEvent`, `createdAt`, `uid`, `status`, `startTime`, `endTime`,
   `attendees[0].email`); BOOKING_CREATED and BOOKING_RESCHEDULED with status ACCEPTED, and
   BOOKING_CANCELLED, are handled, everything else is 200 ignored; no response echoes the body;
   the uid is stored only as `sha256(uid)`. The upsert is guarded in one statement by Cal.com's
   `createdAt` and by the cancelled-uid check, so a late CREATED after a CANCELLED, a replayed
   old uid after a reschedule, and an event older than the owner's own mark are no-ops; there is no
   dedupe table. Matching is the HMAC of the booker's email (`attendees[0]` only) to
   `lead.identity_hash`: no slug and no metadata on the booking link, since the slug is the key to
   someone's designs and Cal.com's stated role is to show the calendar and take the booking. A
   booking by an address with no brief keeps only its start time in `unmatched_call`, printed in
   the strip and offered to Mark as booked, and deleted once the call has passed or by the sweep;
   hashing a non-lead's address is transient and nothing about them is written or logged. Stated
   limits: one live booking per person, the newer replacing the older; a lead swept between the
   match and the write is a 500 that Cal.com does not retry.

7. **Booked and won briefs are kept past the thirty days** (the owner, 2 October 2026, reversing
   ADR 0045 OD2's default). The sweep's `expiredSlugs` skips a brief whose person stands at won,
   or at booked, with that standing set within `CONFIG.retention.keptDays` (180); the brief goes
   the night after that stops holding. Lost, cancelled, no-show and quoted keep nothing. Erasure
   on request removes everything regardless. The notice, the FAQ and the claims register say so
   in the same words.

8. **The privacy notice changes by these sentences.** "What we do with it": the basis clause
   names the record ("To look after your enquiry we keep a short record with your answers: when
   we read them, whether you booked a call and for when, what we quoted, what you decided, and any
   note we make about the call. It is deleted when your answers are."). "How long we keep it":
   the record goes with the answers, and "If you book a call or hire us, we keep them while that
   stands and for six months after, so we can look after your enquiry." The Cal.com processor
   line: "It tells us when you book, so we can note the time against your brief." The contact
   calendar sentence says the time is noted against the brief for the same address and kept
   alone, naming nobody, otherwise. The FAQ answer says the same. Kept true unchanged: "Nothing
   else: no cookies for tracking, no phone number, no account" (the webhook's schema drops the
   phone before anything is stored; /admin sets no cookie); "What this browser keeps"; the three
   sentences about the `seen` code; "We send one email, with your link. Nobody rings you unless
   you book a call". Refused: the attendee's name, phone, notes, responses, timezone, metadata,
   video URL and title; the raw uid or body; any outreach word; a mailto; the slug on any Cal.com
   URL.

9. **A legitimate interests assessment, in short.** The purpose is looking after an enquiry the
   visitor opened; the record is the minimum to know what was read, booked, quoted and decided;
   every item is a fact about the visitor's own actions or the owner's reply to them; nothing is
   used to contact anyone who has not booked; it dies with the brief; a person who asks a studio
   for designs and books a call expects the studio to remember both. Access and rectification at
   this scale: the owner reads `/admin/<slug>` and the Neon console; the Not happening, Unmark,
   clear and Mark as new taps correct the record; the note's caption reminds the owner the visitor
   may ask to read it.

10. **Dates read as the owner would say them.** `formatLondonRelative` ("Today 14:05",
    "Yesterday 09:12", "Thu 2 Oct, 15:00", "28 Sept 2025, 10:40") on the list and the desk;
    `formatLondon` stays for the owner's notice.

11. **CI draws the pages from `/examples/admin`**: four visibly invented briefs on reserved
    example addresses, slugs outside the slug alphabet, every button disabled, noindex and
    unlinked, because the runner has no database and the door would block it. The door itself is
    covered by `proxy.test.ts`; the action by `actions.test.ts`; the webhook by its route and
    verifier tests; the rules by `standing.test.ts`; the sweep's kept rule by `retention.test.ts`;
    that nothing here can send an email by `no-outreach.test.ts`.

## Owner decisions

- OD1: Cal.com webhooks. At `/settings/developer/webhooks` in the pinnaclepx account: create one
  scoped to the quick-chat event type, subscriber URL `https://pinnacle-px.vercel.app/api/cal`,
  triggers BOOKING_CREATED, BOOKING_RESCHEDULED and BOOKING_CANCELLED, a secret of at least 16
  random characters set as `CAL_WEBHOOK_SECRET` on Vercel Production. Until then the route answers
  404 and Mark as booked is the signal. The owner had not checked the account on 2 October.
- OD2: The privacy wording in decision 8, accepted as the build's default; the owner may rephrase,
  and the copy tests then take the new words.
- OD3: Keeping booked and won briefs: yes (2 October 2026); the period after the standing was last
  set is `CONFIG.retention.keptDays`, 180 days, the owner's to change.
- OD4: The anonymous monthly quote tally: later (2 October 2026); not built.
- OD5: Confirm the quick-chat event type asks for no phone number, and that Cal.com's terms cover
  it posting booking data to us. Assumed; the schema drops anything but the seven fields anyway.
- OD6: The words: Quoted, Won, Lost; Booked, Needs outcome, Cancelled, No-show; "Not happening"
  for correcting a Cal.com booking; no "Call held". As written.
- OD7: The 500-character note, with its placeholder and caption. Kept.
- OD8: On a phone, add `/admin` to the home screen once (Safari keeps the Basic credentials
  there); the Admin link in the owner's email prompts for the password from a mail app's webview.

## Consequences

- Migration `0010_enquiry`: `enquiry`, `unmatched_call`, `submission.owner_opened_at`, and
  `brief_overview` recreated with `identity_hash`, the stage columns, `concept_count`,
  `deadline_at`, `owner_opened_at` and the enquiry's columns (never `call_uid_hash`). Applied to
  the database in `.env.local` on 2 October 2026 after migration 0009; on production the
  migration lands before the code, since the old code selects named columns the view still carries.
- New: `app/admin/[slug]/page.tsx` and `error.tsx`; under `app/admin/_components/`: `actions.ts`
  (+ test), `standing.ts` (+ test), `standing-form.tsx`, `pending-button.tsx`,
  `standing-panel.tsx`, `brief-row.tsx`, `needs-you.tsx`, `admin-chrome.tsx`;
  `lib/db/enquiries.ts` and `lib/db/calls.ts` (+ tests); `lib/cal/webhook.ts` (+ test);
  `app/api/cal/route.ts` (+ test); `lib/db/retention.test.ts`; `lib/email/no-outreach.test.ts`;
  `app/examples/admin/`; `e2e/a11y-admin.spec.ts`, `e2e/mobile-admin.spec.ts`. Changed:
  `lib/db/schema.ts`, `lib/db/briefs.ts` (`readBrief`), `lib/db/retention.ts` (`expiredSlugs`),
  the sweep, `lib/brief/time.ts` (the London helpers), `lib/config.ts` (`admin`,
  `retention.keptDays`), `lib/env.ts` (`CAL_WEBHOOK_SECRET`), `lib/email/owner-notice.ts` (the
  Admin link), `lib/analytics/without-slug.ts` (`/admin/[slug]`), the privacy notice, the FAQ,
  the claims register, README, PRODUCT.
- Logs carry only an action, intent, trigger or reason (`admin.refused`, `admin.rejected`,
  `admin.failed`, `cal.refused`, `cal.unmatched`, `cal.booked`, `cal.failed`), never an address,
  slug or body.
- Not built: chips, search, filter, export, pagination (ADR 0045 OD4); token costs on the page;
  "Call held"; MEETING_* and BOOKING_NO_SHOW_UPDATED webhooks; a stored address for an unmatched
  booking; a second live booking per person; a person route or identity in a URL; a client beacon
  for "seen"; Mark all as seen; any email, reminder or message to a visitor; editing or erasing a
  brief from the page; the quote tally (OD4).
- Verified on 2 October 2026 on the worktree's dev server against the real database: the inbox
  listed the 17 briefs with a dot on each, the strip said "17 new briefs, 1 still building", and
  nothing overflowed at 390 wide; on a brief, Quoted, Mark as booked (with the next whole hour
  prefilled), Unmark, Quoted again (clearing), Save note and clearing the note each answered
  "Saved." and re-rendered with the new standing, the strip then named the next call and the row
  read "Booked"; Mark as new landed on the inbox with the brief's dot back and
  `owner_opened_at` null; the webhook answered 401 unsigned and with a wrong secret, 200
  `{"matched":true}` for a signed BOOKING_CREATED for a lead's address, after which the brief read
  "via Cal.com", 200 for the matching BOOKING_CANCELLED, after which it read "Cancelled", and
  `{"matched":false}` for an address with no brief, after which the strip said a booking had
  matched no brief. The probe's enquiry and unmatched rows were then removed. Typecheck, lint,
  1,292 unit tests, knip, Prettier, the six admin e2e tests on the example (desktop, phone and
  tablet) and the production build all pass.
