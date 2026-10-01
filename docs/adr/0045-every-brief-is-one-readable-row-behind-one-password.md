# Every brief is one readable row, behind one password

- Status: accepted, built on 1 October 2026, pending the owner's check. The page opens on
  production only once OD1 is done
- Date: 1 October 2026
- Amends: ADR 0014 (decision 5: the owner's one admin control was an Inngest event; there is now
  also a page, with a door of its own); ADR 0020 (the notice stays as it is; the page is the second
  place the owner reads a brief, and the only one that lists them)

## Context

The owner, 1 October 2026: "add the functionality where the users details are stored on an easy
to view database so I can see everything they filled on the 5 step form as well as the 3 links that
were generated for them."

Everything asked for was already stored, and none of it was easy to see. The lead's name, email
and company sit on `lead`; the five answers sit on `submission.answers` as one jsonb column, keyed
by an HMAC of the email rather than the email; the three links are stored nowhere, since a design's
address is its submission's slug and its template's id, joined when a page is read. The one
readable copy of a brief was the owner's notice (ADR 0020): one email per build, which lists
nothing and is gone from the inbox the moment it is deleted. What was missing was a readable shape
and a place to read it, not storage.

## Decision

1. **The record is a view, `brief_overview`, not a table.** It joins `submission` to `lead` and
   gives one row per brief: when it came, the slug, the lead's name and email, every answer
   flattened out of the jsonb (the company, the description, the logo's file name and address or
   nulls for a wordmark, the look, the photo addresses as a jsonb array, the palette's id or their
   own hex), the template ids, the path of each design in the build's order
   (`/preview/<slug>/<template>` as `text[]`: null until the select stage lands, empty when the
   address had already seen every template), and the two stamps that say how it ended
   (`email_sent_at`, `settled_at`). A table would have meant a write at submit and another at
   select, a backfill, a second retention path and a copy that could drift from the first. The
   view costs nothing on any write, is always what the two tables say, and keeps the retention
   promise by itself: a swept submission leaves it, so what `/privacy` says about thirty days stays
   true with no new code. The Neon console and Drizzle Studio show it as a table, which answers "an
   easy to view database" on its own. Migration `0008_brief_overview`, generated from `pgView` in
   `lib/db/schema.ts`. The name and the email are the lead's latest, since a submission never holds
   them (ADR 0014); the company is this brief's.

2. **The page is `/admin`, a server component drawn at request time.** It reads the view through
   `lib/db/briefs.ts` (newest first, at most `CONFIG.admin.briefs`), shapes each row in a pure
   module (`app/admin/_components/brief-view.ts`, tested) that words every answer (the palette's
   label beside its hex, the look's label, "None uploaded; the name is set as a wordmark") and
   makes every address absolute from `NEXT_PUBLIC_APP_URL`, and lays each brief out as a card of
   labelled rows with its designs as links, "All designs" last. No script and no client component:
   one column on a phone, the label beside its value from `sm`. The outcome line reads the two
   stamps and nothing else, so it is never wrong: "Link sent <when>", "Finished, no link sent", or
   "No link sent yet". The page is `noindex`, and `robots.txt` disallows `/admin`.

3. **The door is HTTP Basic authentication in `proxy.ts`, against `ADMIN_PASSWORD`.** The matcher
   is `/admin/:path*` and nothing else; no other route passes through the proxy. Unset, every
   request under `/admin` is a 404, so a deployment that never chose a password shows nothing. A
   request without credentials gets the 401 that makes the browser ask, and the browser then sends
   the password with every request for the session. Any name is accepted; the password is compared
   as SHA-256 digests in constant time (`lib/admin/basic-auth.ts`, tested), so neither a wrong
   password nor a wrong length is told from a near miss by the clock. Nothing of the credentials
   reaches the log: a refused request that carried credentials is counted as `admin.refused` with
   its path; the browser's first request, which carries none, is not. The page checks the same
   header again before it reads a row and answers not-found when it fails, so the matcher is not
   the only line, as the framework's own guide asks. Why not a login form and a session cookie: one
   owner, one secret, HTTPS everywhere, and the browser already has the form; a cookie would add a
   signing key, an expiry and a page for no gain.

4. **The privacy notice does not change.** The page shows the owner what the notice already says
   is collected, and what the owner's notice already emails them, for the same thirty days, to the
   same person; no new processor touches it.

5. **Dates read as London.** `formatLondon` (`lib/brief/time.ts`) is the one formatter for the
   owner's notice and the page, so both stamp a brief with the same words.

## Owner decisions

- OD1: Set `ADMIN_PASSWORD` on Vercel for Production (and for Preview, if the page is wanted on
  preview deployments too): at least 16 characters and used for nothing else. Until then `/admin`
  is a 404 there. Nothing chooses or rotates it; the owner does, in Vercel.
- OD2: The page shows what the sweep still holds and no more. A list that outlived the thirty days,
  a client book, would need the notice to say so and a table of its own; not built.
- OD3: What each build cost in tokens stays in the notice (ADR 0020) and off the page.
- OD4: One page of at most 200 briefs, no search, no filter, no export. The view answers any of
  those from the console today; the page can grow when the volume says so.

## Consequences

- New: `proxy.ts` (+ test), `lib/admin/basic-auth.ts` (+ test), `lib/db/briefs.ts`,
  `app/admin/page.tsx`, `app/admin/_components/brief-view.ts` (+ test) and `brief-card.tsx`,
  migration `0008_brief_overview`. Changed: `lib/db/schema.ts` (the view), `lib/env.ts`
  (`ADMIN_PASSWORD`, optional), `lib/config.ts` (`admin.briefs`), `app/robots.ts`,
  `lib/brief/time.ts` (`formatLondon`, which `lib/email/owner-notice.ts` now uses), `.env.example`,
  `README.md`, `PRODUCT.md`.
- Migrations `0007_stage_times` and `0008_brief_overview` were applied to the database in
  `.env.local` on 1 October 2026; 0007 had been waiting since 25 September, and the pipeline on
  `main` writes the columns it adds.
- The project has a proxy for the first time. It runs for requests under `/admin` only; every other
  route is untouched. A page that moved out from under `/admin` would leave the matcher, which is
  why the page checks the header itself.
- The view is a second place that spells out the shape of `answers`. A change to
  `submissionAnswersSchema` (`lib/brief/submission.ts`) that renames or moves a field needs a new
  migration that recreates the view, or the column goes null.
- Verified on 1 October 2026, on a dev server with a test password: `/admin` without credentials
  answered 401 with the Basic challenge, with a wrong password 401, with the right one 200 and
  `noindex`; the home page was untouched; `robots.txt` disallows `/admin`. The page listed the
  database's 17 briefs with 78 design and hub links, with no horizontal overflow at 390 or 1440
  wide. The view's `design_paths` matched `template_ids` on every row and no answer column was
  null. Typecheck, lint, 1,127 unit tests, knip, Prettier, the production build and the byte budget
  all pass; the proxy and `/admin` are in the build's route table.
