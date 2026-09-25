# The questionnaire is a lit draft

- Status: accepted. Release 1's decisions (1 to 17) are accepted, built on 24 September 2026;
  Release 2's (18 and 19), built on 24 and 25 September 2026, and Release 3's (20 to 22), built on
  25 September 2026, are accepted in the two amendments of 25 September 2026 below. Decisions 23
  and 24 apply to every release. The third amendment of 25 September 2026 fits the question side
  to every screen after a visual QA of Release 3, the fourth records that polish re-shot and
  gated the same afternoon, the fifth fits the send and done side after a second QA, re-shot and
  gated the same evening, and the sixth records the owner's decisions on everything the build
  had left open, the package that carried them, and the `/start` byte lines moved once by
  decision 24's rule, gated the same night; the seventh, at the owner's call late that night,
  replaces the phone's window onto the draft with the desk's frame whole, zoomed to the screen
  and capped on short screens, gated on a clean copy
- Date: 24 September 2026
- Supersedes: accepted on 24 September 2026, ADR 0035 decision 23's claim that `/start` imports
  nothing from `lib/motion` (decision 17), and the copy freeze of
  `docs/start-page-redesign-plan.md` section 22 for the done page's sentences, the `noscript` line
  and the sketch's closing caption. Accepted on 25 September 2026, ADR 0004's question order and
  section 22's copy freeze for the five questions' own words. Accepted on 25 September 2026 with
  Release 3, ADR 0035 decisions 9 (the chips), 19 (the pool at the colour question only), 20 (the
  static curve), 21 (the ink done state, the call above the countdown), 23 (200 ms motion), 24 (no
  italic) and 25 (the dark style on the scrim), and the rest of section 22's copy freeze
- Amends: accepted on 24 September 2026, ADR 0004 decisions 2, 4 and 5 (the done address carries
  its slug, the guard follows `reached`, the flow moves through the History API, the sketch draws
  no initials); ADR 0014 decisions 3 and 4 (device storage and Cal.com on `/privacy`, the orphan
  sweep); ADR 0015 decision 5 (a partial page is emailed too, and says so); ADR 0035 decision 21
  (the partial lead, the time-up line, the design slots' names and the call in a new tab); the
  constraint map's process convention on specs (decision 1). Accepted on 25 September 2026, ADR
  0035 decisions 1 (fixed titles), 13 (radio groups) and 17 (the `enterKeyHint` chain, Enter on
  question one for fine pointers); ADR 0004 decision 5 (its stages follow the order); ADR 0014
  decision 3 (uploads before the email, the picture links beside the tiles); ADR 0025 decision 2
  and ADR 0036 decisions 3 and 10 (the walkthrough's order). Accepted on 25 September 2026 with
  Release 3, ADR 0035 decisions 1 (the window, the band per OD5), 2, 11, 15 and 16; ADR 0034
  decision 3 (the italic rule); ADR 0004 decision 5 (gated on `reached`, studio light is not an
  answer); ADR 0026 decision 1 (the band takes the visitor's hue); ADR 0034's caps note (the
  pool's exemption covers the `/start` curve)
- Keeps: ADR 0035 decisions 3 to 8, 10, 12, 14, 18 and 22, and no Suspense boundary; ADR 0004's
  URL grammar, per-tab draft and decorative sketch; ADR 0014's honeypot, floor and `noindex`
- Plan: `docs/start-page-journey-plan.md` (the director's decisions D1 to D32, the build order in
  section 11, the owner decisions in section 13)

## Context

The owner, 24 September 2026, of the questionnaire ADR 0035 had rebuilt that morning: "very boring
and has no personality compared to the home page."

The plan's diagnosis, measured on the day's build: the home page has colour, light, a second voice
(the serif italic) and weighty motion, and `/start` had switched all four off. Question one's desk
frame was 0.4 per cent saturated pixels against the hero's 17.2; the sketch was a grey wireframe
that most answers barely changed; an answer earned a 200 ms entrance and nothing else; and the done
state got darker, showed designs as rows of code names, and was lost on a refresh. The same audit
found promises that were not true: the page said an email would come for a build that sends none,
the `noscript` line offered an inbox the studio does not have, and Enter in the colour field sent
the paid brief.

Six audits, five directions scored by four judges, the director's spec, four adversarial reviews
and ten mockup frames produced the plan: direction A, the live draft, set in B's world, the hero's
own light (the plan's sections 1 and 2). It ships in three releases so the new question order can
be measured: Release 1, truth and safety, fixes today's page; Release 2 brings the new order and
words; Release 3 the lit draft, the motion, the send, the wait and the hub.

The owner accepted every recommendation of the plan's section 13.1 on 24 September 2026, with
these readings: no WebGL (OD4); the draft stays in the tab's session storage, never local storage
(OD9d); every release is built now and when each is deployed is the owner's call (OD13); the
`RESEND_FROM` check fails only the Vercel production build (D23); and OD8b's migration is
generated by the build but applied by the owner, before the release that reads it is deployed.

Release 1 was built on 24 September 2026 by four packages: S0 (the harness and the guards), P2 (the
truth, privacy, the email and the status route), P1 (the flow, storage and the done lifeline) and
R1 (these records, the byte line and the final gate).

## Decision

### Accepted: Release 1, built 24 September 2026

1. **Tests first, and no spec ever sends a brief** (plan D28, section 10). `e2e/helpers/start.ts`
   holds what every `/start` spec needs: `refuseSends` aborts every request to `/start` but a GET
   (a Server Action travels as a POST) and every call to `/api/upload` and to the Blob API,
   because a lookup alone writes the production database's rate-limit table; `stubUploads` lets
   an upload land without reaching the server or Blob; `withDraft` writes a draft with `reached`
   into the tab's first document; `interceptStatus` and `openDone` answer the status poll from
   fixtures derived through `statusOf`, so a fixture can never take a shape the server would not
   send; `EDGE_NAMES` holds the long and awkward names. `e2e/brief-harness.spec.ts` proves each.
   Release 1 superseded one existing test, `brief.spec.ts`'s submit test, which pinned `q=done$`
   and the code name "Aurora": S0 marked it `test.fixme`, `brief-truth.spec.ts` replaced it
   without a send, and R1 deleted it. With it went the only use of `E2E_SUBMIT`, so
   `playwright.config.ts` no longer carries `canSubmit` or starts the Inngest dev server, and no
   spec can reach the paid pipeline. This amends the constraint map's process convention that a
   build package never edits an existing spec: S0 marks, the build packages write replacements in
   new prefix-named specs, and the release's R package deletes the marks.
2. **Guards before the build, and a phase between the lines** (plan 9.6, OD11).
   `scripts/bundle-budget.mjs` guards `/start` as it guards `/`: GSAP, Lenis and the ink
   simulation stay lazy; the done view stays a chunk of its own (its marker, the `"brief-done"`
   literal its call reports to analytics); and the draft's display faces, marked by the
   `Fraunces Fallback` family next/font writes beside the face, are reported `unbuilt` until
   Release 3 adds their module, when R3 deletes the entry so the guard cannot pass blind. `/`
   bars zod, because the hero no longer reads the draft (D4). `/start` must stay prerendered.
   Between a release's first package and its R package, `BUDGET_PHASE=build pnpm budget` holds
   `/start` to the owner's ceilings for the whole redesign, 252,000 B of scripts and 23,500 B of
   stylesheets, instead of its line; R3 removes the phase.
3. **Telemetry by question, never by slug** (D24, section 8.5). A slug is the key to someone's
   designs. `app/_components/telemetry.tsx` hands every page view, custom event and web vital
   through `withoutSlug` (`lib/analytics/without-slug.ts`): the query loses `s`, a
   `/preview/{slug}` path becomes `/preview/[slug]` (the route Vercel already reports), and an
   address that cannot be read is dropped. The root layout, a Server Component, cannot hand a
   function to a Client Component, hence the wrapper. `lib/analytics/events.ts` types each event's
   properties, at most two. Wired in Release 1: `brief_view {question, entry}`,
   `brief_step {question}` and `brief_error {question, reason}` (no longer step numbers),
   `sentence_carried {valid}`, `done_view {state}` once per slug per tab, `new_brief`,
   `design_open {template, from: 'done'}` and `brief_complete` as before. Waiting for their
   packages: `upload_failed` (P3), `send_outcome` (P8), `wait_leave` (P7's stages), `design_open`
   from the hub and the email (P7), and `draft_resumed`, which only OD9d's refused alternative
   would fire.
4. **The status poll is a GET route** (D22, section 8.2). `app/api/status/[slug]/route.ts`
   answers 200 with a `SubmissionStatus` and `Cache-Control: no-store`, read from the row every
   time; a malformed slug, or one that names no submission, is `missing`; a failed read is a 500,
   never a status the row did not give. `app/preview/_components/use-submission-status.ts` polls
   it: one poller per slug for the whole tab, every 3 s while visible (`CONFIG.polling.statusMs`)
   and every 15 s while hidden (`CONFIG.start.wait.hiddenPollMs`), at once when the tab shows
   again, until the build settles or nobody watches. `app/preview/actions.ts` is deleted. The body
   keeps today's shape, the concept's code name included for the owner's notice (never shown on
   `/start`); P7 extends it with the stage times.
5. **Done survives a refresh** (D17, sections 7.3 to 7.5). A send replaces its history entry
   with `/start?q=done&s={slug}`. `app/start/_components/done-storage.ts` owns every key the send
   leaves, each record versioned, read through a schema and removed when unreadable or stale:
   `pinnaclepx.done` (the tab: first name, business name, email, palette and style labels);
   `pinnaclepx.submitted` (the browser: slug, deadline and count, nothing personal, until 24 hours
   past the deadline, `CONFIG.start.done.restoreHours`); `pinnaclepx.pending` (the tab: when a
   send started, for two minutes, `CONFIG.start.send.pendingMs`, so a reload during the send says
   the brief may be on its way); `pinnaclepx.sends` (the browser: the distinct slugs sent in the
   server's own window, so a resend that returns the same slug never counts twice, which is why it
   holds slugs where the plan had a count); and `pinnaclepx.viewed` (the tab: the slugs whose
   `done_view` has fired, a key the plan's table did not list). A done address this tab did not
   send renders from the poll alone, with "the address you gave" for the email. A `missing` poll
   forgets the submission and opens question one with a notice: "Those designs have expired, or
   the link is incomplete." when this browser kept the slug, "We could not find that link." when
   it never did, most likely a mistyped link.
6. **The flow follows `reached`, and arrivals follow the entry rules** (D3, D4, section 7.4). The
   draft stores `reached`, the furthest question shown, 0-based like the question index, and a
   visitor resumes at the lower of `reached` and the first question that does not validate, so the
   look and colour questions, whose defaults validate, are never skipped. A draft saved before
   `reached` existed resumes at its first unanswered question, as it always did. `?q=n` shows the
   lowest of n, `reached` and the first invalid question. Bare `/start` resumes this tab's draft;
   without one, it opens the live submission's done view, with "Start a new brief"; else question
   one. The hero writes only `pinnaclepx.carried` and never reads the draft, so a returning
   visitor's answers are never overwritten and `/` never loads zod; `/start` merges the sentence
   into the draft through the validated `readDraft` and forgets the key. A sentence long enough to
   brief from opens `?q=2`, a shorter one `?q=1` filled in, an empty box bare `/start`.
7. **Back is history** (D32, section 7.5). The flow moves by `pushState` and `replaceState`
   rather than the router: Next.js 16 follows both into `useSearchParams` without asking the
   server, and each entry keeps `startDepth`, `startFrom` and `startBefore` beside Next's own
   state (`app/start/_components/start-address.ts`). In-app Back is the browser's Back when the
   entry behind is the question before, and otherwise replaces the entry. At done, a Back onto a
   shallower `/start` question goes on out of `/start` in one press (`history.go(-depth)`); a
   Forward, to the question "Start a new brief" opened, is deeper and is left alone. Checked in
   Chromium; WebKit and Firefox are untested.
8. **The done view is a chunk of its own, with a lifeline** (sections 4.9 and 7.8).
   `app/start/_components/done-boundary.tsx` fetches `brief-done.tsx` once, by a plain `import()`,
   as question five shows, so a visitor who never sends never downloads it, and asks again after a
   failure. While it loads, and if it fails, a stand-in holds the heading, which counts the designs
   as the view does, and the page link to `/preview/{slug}` in a new tab; a failed chunk offers
   "Try again" and its heading takes the focus; an error boundary wraps the view itself. An inline
   script in the skeleton gives `main` the done state's classes and dark scope on a done address
   before the first paint, so a refresh never flashes question one; the project sets no content
   security policy, so it runs. A done link cut short (`?q=done` without its slug) opens question
   one at `?q=1`. The tab's title follows the build ("Building your designs", "Ready: your three
   designs"), held against the head's hydration only while the address is a done one, so a page
   reached by a link or by Back keeps its own. The `data-state="done"` hook waits for P5, since no
   rule reads it before then.
9. **Enter in the colour field never sends** (section 4.7). It checks the code, keeps the focus
   and puts any message in the field's description; the phone's key says Done; an input method's
   Enter is left alone.
10. **Promises ship only when they are true** (D23, OD9a, OD9b). `lib/env.ts` refuses to build
    without `RESEND_FROM` when `VERCEL_ENV` is `production`, the refinement that already keeps
    `ALLOW_REPEAT_TEMPLATES` off production, so local builds, the clean-copy gate and preview
    deployments build without it. A partial build is emailed too, with the line "A few parts were
    set simply, to finish on time." (`SITE.partialNote`), which the done page shows as well (ADR
    0015 decision 5, amended). While the designs build, the lead says "We also email them to
    {email} when they are done."; the time-up line promises no email; failed and exhausted builds
    send none and say none. The `noscript` line offers an inbox and the booking link only once
    `SITE.contactEmail` is set (`noScriptLine`), and until then says only to turn JavaScript on.
    The sketch's closing caption names the 20-minute call, not "an hour".
11. **The email** (section 8.3). The subject drops the business name ("Sam, your homepage designs
    are ready"; "design is" for one); every count follows the build's `conceptCount` in words; the
    link carries `utm_source=email&utm_medium=preview-link&utm_campaign=designs`; a partial build
    adds its line. The rate card (`PRICE`), the call's link and `SITE.callPromise` after it, the
    forwarding line and the sign-off stay as they were.
12. **Designs by their place and a few words, never a code name** (OD12).
    `lib/preview/descriptors.ts` names each design by its place and its layout: Aurora "Glowing
    centre", Monolith "Card-led", Meridian "Colour pool", Atlas "Split layout", Ember "Photo-led",
    Harbor "Type-led", Summit "Quiet and airy", and Vector, ready since ADR 0030, "Bold and
    editorial"; a template without an entry is named by its place alone. A link is announced as
    "Open design one: Glowing centre (opens in a new tab)". The designs and the call open in new
    tabs, so the done page is still there when the visitor comes back, and every such link says so
    to a screen reader (`SITE.newTab`). No code name is shown on `/start`; the hub, the studio bar
    and the pending page still show them until P7.
13. **Names are bounded, and the sketch draws no initials** (D15, section 7.7). The schema takes a
    business name of at most 80 characters and a name of at most 60, measured after trimming
    (`CONFIG.start.names`), so `submitBrief` refuses longer ones too. `possessive()` never doubles
    an apostrophe: a name already ending in 's, ’s or a bare apostrophe stays as it is, a final s
    takes only the apostrophe ("GIBBS'"). `firstNameFrom` skips titles, Mx among them.
    `tabLabelFrom` decomposes the name (NFKD), drops marks and apostrophes, keeps letters and
    digits of any script and ends in an ellipsis at 28 characters. No template draws initials, so
    the sketch and the walkthrough no longer do: a plain point in `--sketch-strong` stands in for
    the mark, on the walkthrough's `mark-initials` wire, which `walkthrough-timeline.ts` needs. The
    home page's two lines follow: "your name stands in" and "we find photos to match if you
    don't".
14. **Pictures that are never sent are deleted** (D14, D30, section 7.2).
    `lib/inngest/functions/orphan-upload-sweep.ts` runs nightly on the retention sweep's cron
    (03:00): it lists `logos/` and `photos/` on Blob, page by page, and deletes every file older
    than `CONFIG.retention.unsentHours` (24) that no submission references. A picture is uploaded
    the moment it is chosen, so without it a visitor who leaves half-way would leave their logo on
    the store for good.
15. **`/privacy` says what the browser keeps** (D30; ADR 0014, amended). A "What this browser
    keeps" section names each key's contents and lifetime in plain words; Cal.com joins the
    processors, since the done page links its booking page; and unsent pictures are said to go
    "within two days", the nightly run's worst case. The lists live in `app/privacy/privacy-copy.ts`
    so the copy tests read them.
16. **`CONFIG.start` begins, and every new sentence is read by the copy tests** (section 6.1, D25).
    Release 1 adds `CONFIG.start.names` (80, 60 and the tab label's 28), `.done.restoreHours` (24),
    `.send.pendingMs` (120,000, a number the plan's block did not list) and `.wait.hiddenPollMs`
    (15,000), and `CONFIG.retention.unsentHours` (24). The flow's own words live in
    `app/start/_components/flow-lines.ts`, the done page's in `done-lines.ts`, the name limits'
    messages in `lib/brief/schema.ts` (`NAME_TOO_LONG`), and `app/_components/copy-corpus.ts`
    registers them with the descriptors, the `noscript` line and the privacy lines, so
    `copy.test.ts` and `reading-level.test.ts` hold every one to the copy rules. The words not
    given by the plan are the not-found notice, "Your answers did not reach us. Check your
    connection and try again.", the stand-in's "Part of this page did not load. Your page link
    still works." and "Try again", and "You can send three briefs a day."
17. **The record is corrected.** ADR 0035 decision 23 says `/start` imports nothing from
    `lib/motion`. It does, and has since 5 September 2026: `use-focus-on-mount.ts` takes
    `scrollToTop` from `lib/motion/lenis.ts`, the loader's facade. The Lenis library itself stays a
    lazy chunk, as the guard shows.

### Releases 2 and 3, accepted 25 September 2026 (the amendments below)

18. **The order is sentence, name, look, colour, send** (Release 2; D2, OD3). The ids are
    `describe`, `brand`, `imagery`, `colours` and `details`; the hero's sentence still lands on
    `?q=2`, which becomes the name. ADR 0004's order is superseded; the draft's stages and the rule
    "nothing blue before q4" read `reached`.
19. **The words and the controls** (Release 2; D6, D7, OD2, OD10, D25, D29, D30). The copy freeze
    lifts: every string of the plan's section 4.6, outcome asks ("Next: your name"), the receipt
    under the H1, the meter in the description, radio groups for the mark, the look and the colour
    with "My own colour" as the fifth, keys 1 to 5, the `enterKeyHint` chain, tab titles, "How we
    use your pictures" beside the tiles, and the home walkthrough's own steps in the new order (ADR
    0025 and ADR 0036 amended). Copy lives in `start-copy.ts`, `draft-copy.ts` and `done-copy.ts`.
20. **The look** (Release 3; D1, D5, D6, D8, D10, D11, D13, D26, OD1, OD5, OD6, OD7). The hero's
    15-stop ramp under both panes; the white card from `sm`; the hero-scale H1 capped at 4.58rem
    with one fixed italic payoff word (ADR 0034 decision 3 amended: on `/start` one display italic
    at a time, plus at most two notes in the draft); the lamp as the only ambient light, at or
    under 0.2 alpha behind text; the dark band re-hued on a colour choice (ADR 0026 decision 1
    amended); the live draft drawn by a CSS colour engine that mirrors `CONFIG.colour`, following
    `schemeFor(style, polarity)`, with four display faces loaded late and never blocking, and mood
    art per style; below `lg` the phone frame restyled as a 358 by 212 window; `/start` rules in
    route sheets, so `/`'s stylesheet line never moves. No WebGL (OD4).
21. **Motion** (Release 3; D9, OD1). CSS with one small spring: a scoped pace of 1.5 (900 ms), a
    200 ms exit that keeps focus, the lead rising 2rem and the controls 0.5rem, the phone curve
    springing under the pool's recorded exemption, nothing looping, no GSAP.
22. **The send, the wait and ready** (Release 3; D16, D18 to D21, OD8a, OD8b, OD9c). The send is a
    held breath (fields inert, the ask keeps focus, the ink holds at 38 per cent, a 20 s timeout);
    the design links are one real list outside any `aria-hidden` subtree; partial reads as ready
    with a note; stage times come from the server or no clock is shown; ready rises to light in
    600 ms; the call is secondary until a design is opened. OD8b's migration (the stage columns) is
    generated with the release and applied by the owner, on a Neon branch first, before the release
    that reads it is deployed.
23. **The records those releases change.** ADR 0035 decisions 9, 19, 20, 21, 23, 24 and 25 are
    superseded, and 1, 2, 11, 13, 15, 16 and 17 amended, as the header says. Of
    `docs/start-page-redesign-plan.md` section 24's owner assumptions, 4, 7, 8 (numerals as tags
    only), 9, 11 and 13 are reversed; 1 (their colour in the region's band, never a room) and 3
    (ink for the wait, light at ready) are amended; 12 is kept.
24. **Bytes** (D27, OD11). Each `/start` line moves once per release, in its R package, from the
    measure of the finished tree; the ceilings are 252,000 B of scripts and 23,500 B of
    stylesheets; `/`'s lines do not move.

## Consequences

- **Bytes** (`pnpm build && pnpm budget` on a clean copy of the finished tree, Windows, 24
  September 2026, against a clean build of 38c7d82, the commit Release 1 starts from). `/start`'s
  scripts measure 248,029 B against 246,220 B, 1,809 B more: the flow's history entries and entry
  rules, the done keys, the status poll and its hidden clock, the title's hold, the notice line
  and the done boundary with its stand-in, less the done view itself, which left the first scripts
  for its own chunk. The line moves from 246,500 to 248,500 B, the measure plus the 70 B margin
  rounded up to the next 500 (248,099 B up to 248,500). `/`'s scripts fall from 217,105 to 216,927
  B, since the hero no longer carries the blank answers, and its line holds at 218,000. Both
  routes' stylesheet is 17,932 B against 17,942 B, under the 19,000 B line, which does not move.
  `/start`'s HTML is 6,116 B against 5,964 B (the pre-paint script) and `/`'s 35,730 B, both far
  under their lines; the fonts are unchanged at 55,480 B. Every guard is `ok` but the faces',
  `unbuilt` as planned.
- **Tests** (the final gate on the same clean copy). Typecheck, lint, `format:check` and knip
  pass, and 645 unit tests in 71 files (554 at ADR 0035). `pnpm e2e` passes in all five projects
  against a dev server started from the clean copy: 157 passed and none skipped (desktop 90,
  mobile 48, tablet 10, reduced motion 5, no script 4), the submit test's skip gone with it. The
  specs Release 1 added:
  `brief-harness.spec.ts` (7), `brief-truth.spec.ts` (7), `brief-restore.spec.ts` (20),
  `mobile-restore.spec.ts` (3), `home-hero-carry.spec.ts` (4) and `no-script-start-line.spec.ts`
  (2). The layout is unchanged, and the specs that hold it pass unchanged: the region at 390 by 844
  (`brief.spec.ts`), the 900 px document at 1440 by 900 and hydration within 1.5 px
  (`brief-shell.spec.ts`), the gaps above the ask (`mobile-start-ask.spec.ts`, which now opens
  question one at `?q=1`, since bare `/start` resumes a saved draft).
- **Accessibility and the states on screen** (R1 on the clean copy, Chromium). axe (`wcag2a`,
  `wcag2aa`, `wcag22aa`) finds no violation in 44 scans, Release 1's eleven states at 320 by 640,
  390 by 844, 768 by 1024 and 1440 by 900, none with a sideways scroll: question one fresh and
  with the not-found notice; question five after Enter on a broken hex, which kept the focus, left
  the address at `?q=5` and marked the field invalid; and the done view building in the tab that
  sent it, building from a pasted link ("the address you gave"), past its deadline, ready, partial,
  failed, exhausted, and the stand-in for a chunk that would not load. The tab reads "Building
  your designs | PinnaclePX" while building and "Ready: your three designs | PinnaclePX" when
  ready. Without JavaScript the page says "The five questions need JavaScript. Turn it on to see
  your three designs." The shots, at 390, 768 and 1440, are in the session's scratchpad
  (`start-audit/shots-release-1/`). A done view this tab did not send draws the blank sketch
  beside it until Release 3 draws the draft from the poll.
- **Privacy.** The keys the browser keeps need no consent under PECR regulation 6(4): each is
  strictly necessary for what the visitor asked for, a refresh or a return that loses nothing, and
  none tracks. `/privacy` names each one and when it goes. None holds personal words beyond the
  tab's own (`pinnaclepx.done`, gone with the tab), and no slug reaches analytics.
- **Owner actions before Release 1 is deployed.** Set `RESEND_FROM`, a sender on a domain
  verified in Resend, on the Vercel production environment, or the production build fails (OD9b).
  Confirm the Vercel plan stores custom events, or the journey events never arrive (OD13). Supply
  `SITE.contactEmail` when there is an address: until then the `noscript` line offers none, and
  `/privacy`'s "Email us at the address on the home page" points at nothing. Read `/privacy`'s new
  wording. Know that the orphan sweep's first nightly run deletes every file in `logos/` and
  `photos/` more than 24 hours old that no submission references, old orphans included.
- **Left for the later packages, as the plan assigns them.** `'expired'` is almost never shown:
  "kept" is read from `pinnaclepx.submitted`, which lapses a day after the deadline while a row is
  swept after 30 days, so a saved link opened later says "We could not find that link.", which is
  true; a list of sent slugs that lapses with `CONFIG.retention.days` would fix it (P8). The
  server's `hitLimit` still counts a resend of the same answers, where the browser counts distinct
  slugs; a resend should return its slug first (P8, `actions.ts`). The restored done copy is
  passed as the email string; `brief-done.tsx` takes it natively with P8. The hub, the studio bar
  and the pending page still name designs by code name (P7). Question tab titles and the notices'
  move into the receipt under the H1 come with P3. The upload route names files by content hash,
  so a picture chosen again more than a day after an unsent first upload reuses a blob the sweep
  may delete before the send; rare, and the pipeline falls back for that picture. The sweep asks
  the database once per old file; a batch query in `lib/db/retention.ts` would be cheaper.
  `pinnaclepx.viewed`, `.carried` and `.pending` are not named on `/privacy`, and the plan's
  storage table does not list the first.

## Amendment, 25 September 2026: Release 2, the order and the words

Release 2 was built on 24 and 25 September 2026 by S0b (the harness), P3 (the order, the words and
the controls) and P4 (the home walkthrough), and recorded by R2. Decisions 18 and 19 are accepted
as built. Where the plan was silent, the build decided as follows.

- **The order** (decision 18). `lib/brief/question-ids.ts` lists `describe`, `brand`, `imagery`,
  `colours` and `details`, and everything that numbers a question reads its place from there: the
  reducer, the address, the tab titles, the copy corpus and the sketch, which now paints the look
  from question three and the colour from question four (ADR 0004 decision 5, amended). The hero's
  sentence lands on `?q=2`, the name. A draft still resumes at the lower of `reached` and its first
  invalid question, so one whose sentence and business name are answered resumes at the look,
  never past it (`brief-reducer.test.ts`); a draft saved before `reached` existed resumes at its
  first invalid question, as D3 allows. The sketch still counts the question showing, as it did;
  the draft that follows `reached` is Release 3's.
- **The words** (decision 19, plan 4.6). Every string for the five questions lives in
  `app/start/_components/start-copy.ts`, which took in Release 1's `flow-lines.ts` and the old
  `brief-questions.ts`, and `app/_components/copy-corpus.ts` reads it through D25's two passes. The
  titles are fixed ("Start with a sentence.", "Put your name on it.", "Pick a look.", "Choose a
  colour.", "Where should we send them?"), each keeping its payoff word for Release 3's italic.
  The asks name the next step, from "Next: your name" to "Next: one last step", and the last is
  still "Show me my three designs". Each question titles its tab ("2 of 5: Put your name on it |
  PinnaclePX"). Three sentences the plan did not give: the short screen's email hint, "We email
  your links here. Nothing else."; the send's refusal when a picture failed after its question,
  "Your logo did not upload. Go back to question two to try it again, or remove it." (and the same
  for a photo, at question three); and "Finishing your uploads.", said once to a screen reader
  while the send waits.
- **The receipts** (D6). A receipt sits under the title in one of four places. The notices and the
  short hero sentence's "Nearly there…" show everywhere, and "Nearly there…" leaves once the
  sentence is long enough. The hero hand-off's echo ("Your sentence is in: “…”", with "Change it")
  shows on a desk of any height; every other receipt only on a desk 47.5rem tall or more; and
  below `lg` the hand-off's short form stands in for the helper. The echo is the first sentence
  that ends on at least three words (`CONFIG.start.names.clauseMinWords`), so "Dr." and "St." are
  read through, cut at a word to 42 characters (`clauseMax`). Release 1's notices moved into the
  receipt, and `notice-line.tsx` went.
- **The controls and the keys** (D7, D31, plan 4.7; ADR 0035 decisions 13 and 17, amended). The
  mark, the look and the colour are radio groups. "Use my logo" reveals "Choose a file"; "My own
  colour", the fifth, reveals the hex field after the group without moving the focus; and "Your
  logo's colour" comes sixth when the logo has a colour of its own (OD12): the band of hues, one of
  twelve, that its most colourful pixels share, once it covers a tenth of the visible artwork
  (`lib/logo/accent.ts`, `CONFIG.logo.accent`). Arrows move each choice, and with a fine pointer
  the digits choose a look or a colour while the group has the focus, never inside a field. The
  first question meters its sentence in the field's description, counting down the last 40
  characters of its room (`CONFIG.start.meter.countdownChars`); with a fine pointer Enter is Next
  there, and Shift and Enter a new line. The phone's keys run next, next, send, and the hex
  field's Done checks the code and keeps the focus. A card's hover style shows only where the
  pointer can hover.
- **The pictures** (D14, D30, plan 7.2, assumption 20). An upload never disables Next. The send
  waits for a picture still on its way, the ask saying "Finishing your uploads", and refuses at
  once when one has failed, naming the question to put it right at, even while another is still
  uploading. `app/start/_components/picture-holds.ts` decides both for a press and for a send
  that resumes, so a brief with a failed picture never reaches the server, which would refuse it
  without saying why. A picture is read and downscaled in the browser before it uploads
  (`logo-sampler.ts`): a logo to 1,024 px on its longer side (`CONFIG.start.uploads.logoMaxPx`),
  photos to 1,920 px wide (`CONFIG.images.maxWidth`), one at a time, each in its own format; an SVG
  goes as it is. The logo's polarity, which sets its thumbnail on the ink or the wash as the
  templates will set it, comes from one pure reader, `lib/logo/polarity.ts`, which the server's
  `lib/logo/analyse.ts` shares. "How we use your pictures" sits beside the logo and the photo tiles
  (ADR 0014 decision 3, amended), and "Start a new brief" clears the pictures with the answers.
- **The home walkthrough follows the order** (D29; ADR 0025 decision 2 and ADR 0036 decisions 3
  and 10, amended). `app/_components/walkthrough-steps.ts` holds its own five steps, sentence,
  name, look, colour and send, apart from `QUESTION_IDS`, and `walkthrough-steps.test.ts` holds
  their titles to `/start`'s. The seven stops stay: the name and the logo land on one, the send
  holds the finished sketch on its first and builds the page on its second, so each step's
  `data-stages`, the dock, and the one "Question n of 5" element are as they were. The bodies are
  the plan's section 8.1. A glide counts each stop's time once (`glideSeconds`), so going back
  across the send's hold plays the build at its own 2.2 s, and the screen reader's sentence names
  "Sentence" as soon as the sentence is on screen.
- **`/start`'s rules left the shared sheet** (D26). `app/start/page.tsx` imports
  `app/_styles/start.css`, and `app/globals.css` no longer does, so `/` never downloads them.
- **Held for Release 3.** The ask's spinner turns on `--motion-reveal`, 600 ms a turn where it was
  a literal second, until P5's paced tokens; the busy ask, its spinner and the status line move to
  the `aria-disabled` "Sending" of plan 4.8 with P5; the logo's polarity and colour, and the
  thumbnail's `data-artwork`, wait for P6's draft to read them.

**Bytes** (`pnpm build && pnpm budget` on a clean copy of the finished tree, Windows, 25 September
2026). `/start`'s scripts measure 251,008 B against Release 1's 248,029 B, 2,979 B more and under
the 252,000 B ceiling (OD11): the words, the receipts and the meter, the radio groups and their
keys, the tab titles, the picture reader and the downscale, and the send's hold, less
`brief-questions.ts`, `flow-lines.ts`, `notice-line.tsx` and `logo-step.tsx`. The line moves from
248,500 to 251,500 B, the measure plus the 70 B margin rounded up to the next 500 (251,078 B up to
251,500), in `scripts/bundle-budget.mjs`. `/start` links two stylesheets now, the shared one and
its own, 18,644 B together against Release 1's single 17,932 B, under the 19,000 B line, which
does not move. `/`'s stylesheet is 17,326 B, 606 B lighter without `start.css`, and its line does
not move. `/`'s scripts measure 217,321 B against 216,927 B, 394 B more for the walkthrough's own
steps and labels and the settings the copy reads, under the unmoved 218,000 B line. The HTML is
6,150 B on `/start` and 35,695 B on `/`; the fonts are unchanged at 55,480 B. Every guard is `ok`
but the faces', still `unbuilt` as planned, and `BUDGET_PHASE=build pnpm budget` passes too.

**Layout** (the same build, Chromium, each question with its answers given). The desk document
stays 900 px tall at 1440 by 900 at every question, the colour question with its hex field open
included; the region is 309 px at 390 by 844, under its 320; and at 390 by 664 each question's
first control starts 42, 73, 99, 99 and 31 px above the ask's top, against the 24 the fence asks.

**Tests** (the final gate on the same clean copy). Typecheck, lint, `format:check` and knip pass,
and 707 unit tests in 75 files. `pnpm e2e` passes in all five projects against a dev server started
from the clean copy: 189 passed and none skipped (desktop 105, mobile 61, tablet 14, reduced motion
5, no script 4). Of three full runs, one failed a single test, `mobile-order.spec.ts`'s "a colour
card reached by the keyboard ends above the ask", with the fifth card 14 px into the ask's 24 px
fade; it passed in the other two and in twelve repeats, alone and among the phone's other order
specs. Those repeats, four of each spec at once, also timed out once in `mobile-names.spec.ts`,
whose done view never settled its animations inside 30 s. Both are flakes to watch. S0b marked
the 34 runs Release 2 superseded (plan 11.4) and R2 deleted them: six tests in `brief.spec.ts`,
one in `brief-shell.spec.ts`, two in `brief-chrome.spec.ts`, seven in `mobile-start-ask.spec.ts`,
five in `mobile-start.spec.ts`, three in `a11y-start.spec.ts` in each of three projects, the
walkthrough and hand-off tests in `home.spec.ts`, and `reduced-motion-start.spec.ts` whole, with
the helpers only they used. Their replacements are the release's new specs:
`brief-order.spec.ts` (18), `mobile-order.spec.ts` (15), `a11y-start-order.spec.ts` (7 in each of
three projects), `mobile-names.spec.ts` (3), `reduced-motion-start-order.spec.ts` (2),
`home-walkthrough-order.spec.ts` (4) and `mobile-walkthrough-order.spec.ts` (3). Section 10's
fence moves with them: `mobile-order.spec.ts` now walks every question at 320 and 390 wide without
a sideways scroll, where the plan's table named `mobile-start.spec.ts`, and
`mobile-start-ask.spec.ts` keeps question one's gap above the ask at 390 by 664 while
`mobile-order.spec.ts` holds the other four. `brief-restore.spec.ts` reads its
question numbers and the first tab title from the order, so it holds through the change.

**Accessibility.** axe (`wcag2a`, `wcag2aa`, `wcag22aa`) finds no violation in 24 scans at 1440 by
900, 390 by 844 and 768 by 1024: question one fresh, and in the new order the hero's short
sentence, the name with its error and with a logo on its way, the look, the colour with a broken
hex and in forced colours, and the send with both its errors. The shots, each question in the new
order, the hero's hand-off, the colour with a code of the visitor's own, the send's errors and the
home walkthrough, at 390, 768 and 1440, are in the session's scratchpad
(`start-audit/shots-release-2/`).

**Measurement** (OD13). Release 2 ships once Release 1 has run 14 days and 100 starts, whichever
is later, and is reverted if start-to-complete falls more than 5 points below Release 1's baseline
at an equal sample. `brief_step` and `brief_error` carry question ids, so the drop-off per question
reads the same across both orders, and `upload_failed {kind}` is wired.

**Owner actions before Release 2 is deployed.** Read the three sentences the plan did not give
(above). Know that pictures are now downscaled in the browser before they upload (assumption 20,
reversed by skipping the resize in `logo-sampler.ts`). Say if the spinner's 600 ms turn should be
slower. Deploy it only after Release 1's window.

**Left for the later packages.** A draft Release 1 saved counts `reached` in the old order, so a
tab that holds one across the deploy can resume a question further on than its visitor reached in
the new order: `reached` 4, saved at the old colour question, lands on the send, past the colour.
Storing the question's id beside `reached`, or an order version that sends a mismatched draft back
to D3's rule, would fix it in `lib/brief/draft.ts` and `lib/brief/read-draft.ts`; it matters only
because Release 1 is deployed first. `walkthrough-brand.ts` still counts `BUILT_STAGE` from the
questionnaire's `FINAL_STAGE`; `walkthrough-steps.test.ts` holds it to the walkthrough's own last
stop, and it could move beside `SKETCHED_STAGE`.

## Amendment, 25 September 2026: Release 3, the lit draft

Release 3 was built on 25 September 2026 by S0c (the harness), P5 (the question side), P6 (the
draft), P7 (the status, the designs page, the studio bar and the email), P8 (the send and done),
and recorded by R3. Decisions 20 to 22 are accepted as built, and with them the records the
header lists: ADR 0035's decisions, ADR 0034 decision 3 and its caps note, ADR 0026 decision 1 and
ADR 0004 decision 5 each carry a dated note. Decision 24's lines have not moved: the release
measures past both ceilings, and the plan leaves that call to the owner (below). Where the plan
was silent, the build decided as follows.

- **The question side** (decision 20; P5). From `lg` the ramp is `main`'s ground as well as the
  region's; the title is set at the hero's size, 73.28 px at most, with its payoff word in the
  serif italic, and the receipt under it; the controls sit in one white card from `sm`, each field
  a well of the wash with a soft inset edge. Palette tiles are filled, a choice draws its check
  and blooms from the tap, and each look carries CSS mood art. The island gains the home page's
  dot. The lamp walks the studio's hues and then the visitor's colour, and keeps the studio's
  under a grey (`data-grey`). Below `lg` Back is a 48 px round button beside the ask. The page's
  tokens and registered properties are declared in `app/_styles/start.css` rather than
  `app/globals.css`, so `/` never downloads them (D26); `globals.css` only lost `question-in`'s
  movement. The questions after the first load as one chunk, not four, because four regrouped
  the home page's chunks and grew its scripts by 463 B; while it loads, a later question shows
  the skeleton's bars under its own name, and if it fails the ask offers "Try again". The exit
  checks the answer again as it ends, so a Next the flow would refuse brings the question back
  with the focus on the field. A card's hover glow only lights an unchosen card, clear of its
  words. "Enter" in the fine-pointer hint is a keycap. Declined: plan 4.2's one-line helper on
  desks under 47.5rem tall. There are no short helpers, a clamp would hide words a sighted
  visitor needs, and the sticky actions row already keeps every control in reach at 1366 by 657.
  (Superseded the same day by the polish amendment below: the row kept the ask in reach but
  covered the description's third line on arrival, so a laptop's desk now sets the question to
  fit.)
- **The draft** (decision 20; P6). `app/start/_components/draft/` draws one page in two frames
  from `draftModelFrom(answers, reached, extras)`; its colour engine's strings are generated
  from `CONFIG.colour`, and `components/sketch/brief-sketch.tsx` is deleted, `Bar` living in
  `phone-frame.tsx`. The faces module asks `document.fonts` only for each face's primary family,
  since asking for next/font's local fallback fails on a device without Arial or Times New Roman,
  and a test holds that. The skeleton paints the draft still (`data-still`) and the flow finishes
  its first entrances before its first paint, so a load or a refresh replays nothing. Without
  `Intl.Segmenter` the whisper counts UTF-16 units, never fewer than the letters. On a desk the
  phone over the browser frame's corner hides its notes, so the draft never shows more than two,
  and the picture's note gives way to the signature. The blank draft stays veiled until the
  sentence reaches 30 characters, the builder's reading of D10, which the owner is asked to judge.
  The chips are gone; `SketchChips` keeps the sentence a screen reader hears.
- **Motion** (decision 21; P5 and P6). The paced tokens in `start.css` equal `CONFIG.start`, and
  `--ease-spring` equals a `linear()` string sampled from `CONFIG.start.spring` (about 9 per cent
  overshoot), both held by `start-tokens.test.ts`. `CONFIG.start.rise` adds `backRem` (1.5) and
  `exitRem` (1). `--lamp-hue` is not registered: the lamp is two registered colours and a
  registered swell. The curve (`lib/motion/start-curve.ts`) springs under the pool's exemption
  (ADR 0034, amended) and skips a kick while it is not drawn.
- **The status, the designs page and the email** (decision 22; P7, OD8b). The migration,
  `db/0007_stage_times.sql`, adds six nullable timestamps to `submission` (one per stage and
  `settled_at`). It is generated and not applied (the owner's action, below). `markStage` writes
  a stage, its time and, when the other four stages are closed, the build's end in one `UPDATE`,
  so a retried step never finds a stage settled whose second write failed. The poll's body,
  `StatusView`, extends `SubmissionStatus` under 2 KB, reads the database's JSON by path, and
  releases a design's headline and photo only once their stage settles. The designs page,
  `/preview/[slug]`, is drawn on the server with small client islands, because a client-drawn
  page pulled `/start`'s copy modules into another chunk and grew `/start` by 1,337 B. It redraws
  when anything the build moves changes (`drawn-key.ts`), and shares through
  `components/ui/share.ts`. The poster's rules live in `app/_styles/design-poster.css`, which
  the done view imports too. `/examples/hub` draws an example build for review, unlinked and
  `noindex` like `/examples/aurora`; `?name=unbroken` or `?name=longest` picks one of two fixed
  business names, so no text from the address reaches the page. The studio bar says "Back to
  your designs", and the email's link reports `design_open` from the email.
- **The send and done** (decision 22; P8). The send holds the ink at 38 per cent until the server
  answers; a sent brief's ink then runs on over the page before the done view shows
  (`data-arriving`), and that half of the bloom lives in the done view's own sheet,
  `start-done-view.css`, which loads with its chunk. Should that sheet not load, the bloom ends at
  once rather than leave the page hidden. The day's limit offers "Book a 20-minute call"
  beside its words (a `SubmitError` carrying the call). The done view is `design-list.tsx`,
  `stage-ring.tsx`, `done-log.tsx` and the posters, all in the lazy chunk;
  `design-slots.tsx`, `countdown-ring.tsx` and `use-countdown.ts` are deleted. Nothing already
  true when the view opens is said, and news is said once, in the order it arrived, a stage that
  lands past the deadline included (`done-progress.ts`). At ready the call takes over the ask only
  once the visitor has left the page after opening a design and comes back, so the first click on
  "Open design one" always opens it. At ready `main`'s colours change with its ground, over the
  ground's 300 ms. "All three built in 1:52." is gone, since the log leaves at ready and the lead
  says "Built in 1:52."; the posters split within 2.46rem, inside the 2.5rem cap. A resend of the same answers
  returns its slug before the day's limit is counted. The draft now stamps the order its `reached`
  counts in, so a draft saved under Release 1's order resumes at its first unanswered question
  (the item left open above). The dark band takes the visitor's hue through `--start-hue`
  (`bandHueOf`); `data-step` is not set, since no rule reads it.
- **Files the plan's fence did not list.** P8 edited `question-pane.tsx` and `brief-reducer.ts`
  for the day's limit's call, `done-by.tsx` and `share-line.tsx` to share their hooks (`usePassed`
  moved to `app/preview/_components/use-passed.ts`, `useCopiedNews` to `share.ts`),
  `copy-corpus.ts`, `lib/brief/draft.ts` and `read-draft.ts` (the order stamp), and
  `e2e/helpers/start.ts` (`answerSend`, which answers the Server Action in the browser so a spec
  can see what follows a send without one). P7 edited `e2e/helpers/start.ts` too (fixtures
  derived from the example build, `stubPhotos`, the edge names read from
  `lib/preview/example.ts`) and `app/preview/[slug]/[templateId]/page.tsx`. R3 deleted two rules
  the draft retired in `start.css` (the old phone's half size and the chips' hiding) and the
  caption only the old sketch used (`SKETCH_CAPTION.yours`).

**Bytes** (`pnpm build && pnpm budget` on a clean copy of the finished tree, Windows, 25 September
2026). `/start`'s scripts measure 253,116 B against Release 2's 251,008 B, 2,108 B more and 1,116
B over the 252,000 B ceiling (OD11). The plan's offsets are all taken: the later questions' steps,
the done view (posters, ring, log, design list and the bloom's second half) and the display faces
are lazy chunks, guarded, and the old sketch left with `brief-sketch.tsx`. `/start`'s two
stylesheets, the shared one (16,721 B) and its own (7,336 B, `start.css`, `start-draft.css` and
`start-done.css` together), measure 24,057 B against 18,644 B, 557 B over the 23,500 B ceiling;
the done view's own rules load with its chunk and are not counted. No planned feature was cut to
fit, so the lines stay at 251,500 and 19,000 B, `BUDGET_PHASE` stays, and `pnpm budget` fails on
`/start` in both modes until the owner decides: (a) raise the ceilings on the record, which by
the plan's rule in 9.6 gives lines of 253,500 and 24,500 B; (b) take the offsets left, about 150
to 250 B for moving the home page's tints out of `lib/brief/sketch.ts`, which `/start` loads,
and about 250 B of scripts and 300 B of stylesheet for loading the whole bloom with the done
chunk (with no ink if it has not arrived), neither enough alone; or (c) OD11's fallback of
248,000 B, which cuts planned features. `/`'s scripts measure 217,390 B, 69 B more than Release
2's, and its stylesheet 16,721 B, 605 B less; neither line moves. The HTML is 5,744 B on `/start`
(the skeleton draws the blank draft) and 35,739 B on `/`, and the fonts are unchanged at 55,480 B.
Every guard is `ok`: the faces' `unbuilt` mark and the mechanism behind it are gone, so its guard
can no longer pass blind, and a sixth `/start` guard, `steps`, holds the later questions' chunk
lazy.

**Layout** (the same build, Chromium, each question answered). The desk document stays 900 px
tall at 1440 by 900 at every question, the colour question with its hex field open included. At
390 by 844 the region is 308 px at every question, under its 320, the window 358 by 212 and the
title's top 387 px down; at 390 by 664 the region is 226 px, the window 358 by 150 and the title
305 px down, and each question's first control starts 43, 74, 100, 100 and 33 px above the ask's
top, against the 24 the fence asks. At 320 by 256 the title is wholly in view.

**Colour** (`pnpm measure:colour` on the shot matrix below). Question one's desk frame is 9.4 per
cent saturated, over the 8 the plan asks. Ready and partial measure 15.1 per cent at 1440 by 900
and 11.5 at 390 by 844, with the fixtures' one-pixel stand-in for each poster's photo. The colour
question measures 6.2 to 6.9 per cent at 1440 (12.3 with `#808080`, which keeps the studio's
light) and 17.3 to 20.4 at 390; the send's hold 2.5 and 5.3; building 9.6 and 10.4; failed 2.5 and
4.9. So the colour question at a desk, the send and the wait miss the 15 per cent the plan asks
of them, and so do the plan's own mockups, measured the same way: the colour question 6.9, the
send 2.0 and the wait 0.7. The three flattest colours cover 29 to 34 per cent of each question's
desk frame, under the 40 allowed, and more on the ink: 51 per cent while sending, 54 while
building. `pnpm measure:ground` on the wait finds the lamp spent 12 px above `main`: L 0.0058,
1.06:1 on the ink, at 390 by 844, and L 0.0071, 1.08:1, at 390 by 664.

**Contrast.** The pairs the plan's 9.3 adds to the fence are rules the page keeps rather than
pairs it shows: brand-ink never on the deep wash (4.20:1), muted text never over the lamp (3.40),
`#9abfdd` never as text on `#175883` (3.94), text on the ink never over the lamp above 0.2 alpha
(2.49 at 0.75), and white never on a custom colour (3.68 on `#339906`), whose tile is white with a
swatch chip. `brief-ground.spec.ts` and `brief-done-ground.spec.ts` sample the ground behind every
text box outside the card at six viewports, at every question and at ready. The field's edge on
white stays at 1.18:1, a judgement by hand that the owner re-signs against the inset edge.

**Tests** (the final gate on the same clean copy). Typecheck, lint, `format:check` and knip pass,
and 817 unit tests in 88 files. `pnpm e2e` passes in all five projects against a dev server
started from the clean copy: 347 passed and none skipped (desktop 195, mobile 101, tablet 33,
reduced motion 14, no script 4). The release's specs are `brief-ground.spec.ts` (8),
`brief-questions-lit.spec.ts` (12), `mobile-questions-lit.spec.ts` (5), `a11y-start-lit.spec.ts`
(4 in each of three projects) and `reduced-motion-start-lit.spec.ts` (2) from P5;
`brief-draft.spec.ts` (9), `mobile-draft.spec.ts` (10), `a11y-draft.spec.ts` (3 in each) and
`reduced-motion-draft.spec.ts` (3) from P6; `brief-hub.spec.ts` (12), `mobile-hub.spec.ts` (3)
and `a11y-hub.spec.ts` (3 in each) from P7; and `brief-done.spec.ts` (24),
`brief-done-ground.spec.ts` (8), `mobile-done.spec.ts` (5), `a11y-done.spec.ts` (9 in each) and
`reduced-motion-done.spec.ts` (4) from P8. S0c marked the five runs the release superseded (plan
11.4) and P8 a sixth; R3 deleted all six: `brief-shell.spec.ts`'s desk height, which
`brief-ground.spec.ts` holds; `brief-order.spec.ts`'s dark scope on the region, the call to
action's words and the photo chip; `brief-truth.spec.ts`'s partial line on the done page; and
`mobile-names.spec.ts`'s ready view. `mobile-names.spec.ts`'s building view went with it, since
`mobile-done.spec.ts` holds the same names at both states, as did the helpers only they used.
Section 10's fence moves with them: the desk height and the scope are `brief-ground.spec.ts`'s,
and the long names at done are `mobile-done.spec.ts`'s. The two flakes Release 2 watched did not
recur in either of two full runs.

**Accessibility.** axe (`wcag2a`, `wcag2aa`, `wcag22aa`) finds no violation in any of the 90
a11y runs, each at 1440 by 900, 390 by 844 and 768 by 1024: every question, the choices made,
the send, each done state and the designs page, with forced colours at the colour question and at
done. The shot matrix of the plan's 11.6 is in the session's scratchpad
(`start-audit/shots-release-3/`): every question empty and filled, each look and palette, `#339906`
and `#808080`, a white logo, the errors, the send's hold, building, ready, partial, failed and
expired, at the eleven viewports from 320 by 640 to 2560 by 1440.

**Owner actions before Release 3 is deployed.** Apply `db/0007_stage_times.sql` to a Neon branch,
then to production, before the deploy: until it is applied the pipeline's `markStage`, every send,
every `/preview` page and the done page's poll fail with `column "stage_select_at" does not
exist`, as a read of a preview page against the live database shows today. Decide the byte
ceilings, and whether the 15 per cent colour target holds for the colour question at a desk, the
send and the wait. Say whether `/examples/hub` should ship. Re-sign the field judgement against
the inset edge, and judge the blank draft's veil and the declined one-line helper, from the shots.
Check the LAN iPhone (the rubber band, the sticky ask, the keyboard and its return key, the ink
running on after a send, and the call taking over after a design's tab), and run the five-second
sibling test with at least eight people. Deploy it after Release 2's window, or with it (OD13).

**Left for later.** The hero's hand-off, whose sentence was to type into the draft's headline
(plan 3.1 and 6.2), is not built, so `CONFIG.start.typing` waits for it; the posters set their
headlines by a wipe rather than by typing. `waitingHeading` in `start-copy.ts` repeats
`done-copy.ts`'s `buildingHeading` for the done stand-in, held equal by a test. The home page's
`send-page.tsx` keeps its own share and copy helpers beside `components/ui/share.ts`. `'expired'`
is still rare, for the reason given above. A failed Next flashes the draft's part only on the
field's first failure. The whisper's 24-letter limit and the headline's steps are named constants
in `draft-model.ts` rather than `CONFIG.start`, and the OKLab arithmetic there repeats
`lib/logo/accent.ts`'s. "Try again" for the later questions' chunk has no sentence beside it yet.
At a desk the name question changes 6.6 per cent of the browser frame against the plan's 10.

## Amendment, 25 September 2026: the question side fitted to every screen

A four-viewer visual QA of Release 3 shot the question side at 24 viewports against the mockups
and plan sections 4.2 and 5.8, and ranked 26 findings (4 high, 9 medium, 13 low; the report is
in the session's scratchpad, `start-audit/visual-qa/report.md`). This amendment records the
polish package that answered them. The plan's rules held: numbers in `CONFIG`, tokens in
`globals.css`, page rules in the `/start` sheets, the caps, the copy tests, the fence. Where the
report left a design judgement, the package decided as follows.

- **A laptop's desk is under 56.25rem tall, not 47.5rem** (finding 1; plan 4.2). The full layout
  is built to fill exactly 900 px, so on every desk screen but the mockup's, once the browser's
  own bars come off it (1440 by 785, 1536 by 864, 1366 by 657, 1280 by 800, 1024 by 768), the
  sticky action row rode up over the card on arrival and hid what the question was about. Under
  56.25rem the question is set to fit (`start.css`): the title 4.5rem down and at
  `--text-display`, one step under the hero's size; the helper at the body size; the card's parts
  1rem apart and the card 1.5rem under the title. The receipts, the whisper and the draft's 0.78
  zoom cap keep their line at 47.5rem. At 1366 by 657 the questions measure 668, 713, 690, 657
  and 692 px, so the row rests at the colour question and rides 11 to 56 px at the others, over
  the card's closing line and never over a control (the privacy link under the fade at the name
  question is reached by a scroll of at most 56 px, as any line under a stuck row is; letting a
  pointer through the fade made it an axe target 3 px from Back). The reassurance stays in the
  row: the report's alternative, hiding it on these desks, would have taken "Free. No sign-up.
  Nobody calls you unless you book." off the send question on the commonest class of screen.
  Under 40rem tall (1024 by 600) no question fits the screen even set to fit, and the row rode
  over the first control at every question, the description's third line included; so there the
  row waits in its place at the end of the question, as the ask does under 30rem tall and below
  22.5rem wide, and the scroll padding goes with it. At 1024 by 640 every first control is whole
  above the stuck row again. The looks sit two up from 1280 (`minmax(12rem, 1fr)`; a look's name
  may take two lines there), and the send question's ask wraps below `xl` inside a
  `minmax(0, 46fr)` column, so a question can no longer widen its column and move the board
  (finding 7).
- **The board holds its own screen** (finding 2). From `lg`, while the visitor answers, the
  frame, the caption and the whisper sit in `.start-board`, stuck to the top of the window and as
  tall as it, its content from the title's own top, so the frame sits level with the title (72 px
  on a laptop, 144 at 1440 by 900, as the mockups draw it), holds still from question to question
  and keeps its caption in view while a long question scrolls. Below `lg` and at done the board is
  `display: contents`, so the region lays its parts out as before and the done view's grid still
  shares one cell between the stage and the designs. The region itself keeps the ramp, which is
  why the region is not the sticky box: two grounds of different heights would break the ramp at
  the split.
- **Each crop has offsets of its own** (findings 3 and 6). `CONFIG.start.window` holds four
  lists: the phone window's full and short crops (`offsetsPx`: 0, 0, 96, 48, 0;
  `shortOffsetsPx`: 12, 4, 96, 56, 60) and the desk page's 300 px and 150 px crops
  (`cropOffsetsPx`: 0, 0, 20, 200, 0; `shortCropOffsetsPx`: 84, 20, 60, 286, 0). The short
  window's screen is 114 px, and the first question's headline takes two lines (72 to 120 on the
  page) whenever the sentence is set small, the name is long or nothing is typed yet, which is
  every new visitor's arrival; so the first offset is 12, which keeps both lines and the box's
  bottom line, at 126, whole in the screen (12 to 126) with the nav still 4 px in, and the
  colour's is 56, so the call to action's box ends 2 px above the foot rather than on it. The
  page sets all four and the sheet picks one by width and height; each screen carries a
  crossfade turn per crop and only the crop whose offset moves crossfades, so a window whose part
  stays put never blinks over nothing. The stacked band takes its short crop under 52rem tall
  rather than 47.5rem, and the same line tightens the region there as a short phone's does (4rem
  over the frame, 0.75rem under it, the pane 0.75rem under the curve), with the card's parts 1rem
  apart and 1.5rem under the title as a laptop's desk sets them: at 640 by 800 the description's
  box is then whole above the ask, 48 px higher than the crop alone left it (finding 4's tail).
  The desk page keeps its 640 px layout in that band and is zoomed in steps, 0.8 from 36rem and
  0.9 from 40rem, on `--draft-zoom`, so the tag keeps its 11 px on screen there (finding 22), and
  the crop's foot fades over its last 24 px so it never ends mid-glyph. The whole-page box sits
  against the browser's page rather than its frame, so a crop cuts the box where it cuts the
  page and its tag clears the chrome; on the phone the tag sits inside the box's bottom-left
  corner, as the mockup draws it (finding 15).
- **Below 22.5rem wide the ask waits in its place** (finding 4). At 320 by 640 a stuck ask's foot
  was 134 px and hid the description's whole box on arrival. The DOM cannot move the line under
  the ask out of the stuck box for one width, and hiding it there was the poorer trade, so the
  ask is static below 22.5rem, as it already is under 30rem tall, and every first control starts
  above it. Under 47.5rem tall a phone's pane sits 0.75rem under the curve rather than 1.5rem.
- **The draft reads at every desk zoom** (finding 8). The mirror over the frame's corner goes
  under 80rem, where it was under 115 px wide with a 4 px headline, and the frame takes its room:
  0.72 at 1024 and 0.8 from 1120 (the plan's 4.2 said 0.62 at 1024), 0.85 from 1280 with the
  mirror back, 1 from 1440, 1.25 from 1760, and never past 0.78 under 47.5rem tall. The desk page
  is 15 px with a 64 px paragraph row, the headline's smallest step 24 px, the desk footer 12 px,
  the phone's 11 px. The tag, the box's line and its handles are sized against the zoom in force
  (`--draft-zoom`), so the tag is 11 px on screen at every width, the stacked band's steps
  included.
- **The words sit at the top of their cell and the box hugs them** (findings 10, 13, 14, 16, 17).
  The headline's selection box is drawn on the words' own box, so it hugs one line, two or three
  and never stands mostly empty over a short note; the blank note breaks after its comma, a
  no-break space holding "set large" together as the mockups draw it; the eyebrow sits 12 px
  above the name. The phone's headline keeps a 24 px line at every size, so a name's lines always
  fill 72 to 96 and 96 to 120 and the look's window opens on a whole one; the look's tag rises
  less, clear of a two-line name's descenders; the phone's wordmark keeps to one line; the
  phone's paragraph clamps at five lines, inside the look's window at every phone width
  (finding 12), and under the full crop the window's foot fades to the page's surface.
- **The fill keeps its hue** (finding 11). `CONFIG.colour.fillMaxC` (0.15) caps the fill band's
  chroma: a browser clips a relative colour channel by channel, so a bright colour pulled down
  into the band changed hue (#ff5a1f to a deep red); capped, every colour of the plan's sweep
  keeps its hue within three degrees, and `draft-model.test.ts` holds that against a clipping
  model of the browser.
- **The mirror's footer fills its screen** (finding 9), as a phone page ends; the second lamp
  falls away on the pool's own curve rather than a two-stop disc (finding 19); the draft's fills
  keep their shapes under forced colours with a border each, the mood art its colours and the
  veil goes (finding 26); the reassurance balances its two lines (finding 23); and a frame the
  width had hidden finishes its entrances again as the screen crosses 36rem or `lg`, so a turned
  tablet watches nothing land twice (finding 24). Under forced colours the board's caption also
  sets `-webkit-text-fill-color: CanvasText`: Chromium forces `color` but leaves the fill at the
  author's, which axe reads first, and inside the board (a box, where the region's ramp becomes
  Canvas) it measured 1.93:1.
- **The logo's reading lives in the draft** (finding 5). The polarity and the accent the browser
  reads in a logo go into the draft's logo entry through the reducer (`logo-read`), validated on
  the way back by `lib/brief/schema.ts` and dropped rather than refused when they do not parse,
  so a refresh keeps a white logo on the ink it needs and the colour question keeps its logo
  tile; the in-memory readings are gone. The server's brief schema strips both, since its logo
  stage samples the file itself. Re-shot on the current tree: a hovered colour retints at once,
  Back keeps the colour, and a white logo puts the draft and the question's thumbnail on the ink
  before and after a refresh.
- **Left to the owner.** Finding 20 (a hairline ring on the frames in the dark scheme) conflicts
  with the no-hairlines rule and is not done; finding 21 (the composition at 2560, a cap of about
  120rem or a larger draft) and finding 25 (the warm look's sun and sky taking a cool colour) are
  the owner's calls the report names. Not in the report and left: at 700 by 500 the stuck ask
  sits over the first control, as it did before.
- **Tests.** `brief-laptop.spec.ts` (thirteen tests at 1366 by 657, 1280 by 800, 1024 by 768,
  1024 by 640, 1024 by 600 and 1440 by 900: the first control whole above the row on arrival,
  the row stuck or, under 40rem, waiting with the scroll padding gone, the board level with the
  title and still across questions, in view while the look question scrolls, the split held at
  the send question, the looks two up) and `mobile-short.spec.ts` (four tests: the ask static
  and every first control clear at 320 by 640; at 390 by 664 the short crop's offsets and each
  part whole with its box, the first question's two-line headline among them, blank, a sentence
  and a name at the clamp; the short crop and every first control whole above the ask at 640 by
  800). Unit tests cover the crossfade lists' shape, the fill's hue under clipping, the reducer's
  `logo-read` and the schema's readings.
- **Bytes** (decision 24). `BUDGET_PHASE=build pnpm budget` on a clean copy of this tree: `/start`
  scripts 253,546 B and stylesheets 24,658 B, against 253,116 B and 24,057 B before this package,
  so the polish adds 430 B of script (the four crop lists and their turns, the logo reading, the
  breakpoint watch, the note's no-break space) and 601 B of styles (the laptop's budget, the
  board, the crops, the short desk's waiting row, the stacked band's short screen, forced
  colours). Both stand past the phase's ceilings (252,000 and 23,500) as the release did, and the
  lines wait on the owner as before. The home page holds every line (217,436 B of scripts,
  16,748 B of stylesheets, 35,736 B of HTML, 55,480 B of fonts) and every lazy guard on both
  routes is ok.

## Amendment, 25 September 2026: the polish re-shot and gated

The release engineer closed the polish package above the same afternoon: the visual QA's
matrix re-shot on the finished tree, the plan's final gate (section 11.6) run on a clean copy,
and the measures taken. The shots are in the session's scratchpad,
`start-audit/visual-qa/after/` (145 states, 299 shots, a JSON of measures beside each state;
one browser context at a time, GET only, every upload leg and every non-GET refused before it
left the browser; nothing sent, nothing stored).

- **The matrix.** The desk draft at 1024 by 768, 1280 by 800, 1366 by 657, 1440 by 900 and
  1920 by 1080; the stacked and landscape screens at 768 by 1024, 1024 by 1366, 700 by 500,
  844 by 390, 640 by 800 and 576 by 800; the phones at 320 by 640, 375 by 667, 390 by 664,
  390 by 844 and 430 by 932, each with the first question blank and with the sentence in, and
  questions two to five with every answer in; at 1440 by 900 and 390 by 844 the four looks, the
  four palettes, `#808080` and `#ff5a1f`, a white PNG logo (as the sampler stores it, with its
  polarity and accent, and again after a reload), an 80-character name, a hovered palette tile,
  Back from the colour to the look, and forced colours; 2560 by 1440; and a turn across `lg`
  and across 36rem. Nothing scrolls sideways and no page errors at any of them.
- **Findings confirmed fixed**, with the measure that shows it. 1: at every laptop the first
  control is whole above the row on arrival (1366 by 657: the description's box ends at 478
  against the row at 528, the name's field at 393 against 544, the first look at 312, the first
  colour at 291 against a resting row, the email at 419 against 544; 1280 by 800 and 1024 by 768
  likewise), and at 1440 by 900 and 1920 by 1080 the document holds one screen at every
  question. 2: the board is stuck at the window's top on every desk and the frame sits on the
  title's line (72 px at 1024 to 1366, 144 at 1440, 152 at 1920 and at 1024 by 1366) and does
  not move from question to question. 3: the short window's page sits at 12, 4, 96, 56 and 60
  on 320 by 640, 375 by 667 and 390 by 664, with each part and its box whole; the 150 px desk
  crop at 700 by 500 opens on the blank note at the first question and on the boxed call to
  action at the colour. 4: at 320 by 640 the ask is static and every first control starts above
  it, the description's whole box in the first screen; at 640 by 800 the description's box ends
  at 680 against the ask at 687. 5: with the reading the sampler stores, a white logo puts the
  draft on the ink at the name, the look and the colour, in both frames, before and after a
  reload, and the name question's thumbnail sits on ink (`data-theme="dark"`); a hovered Plum
  retints the call to action within 500 ms, and Back from the colour keeps Forest. 6: at 768 by
  1024 the 300 px crop opens on the call to action at the colour and the whole-page box's foot
  goes under the crop's fade at the send. 7: the columns measure 471 and 553 px at the colour
  and at the send, the whisper shown at both. 8: the tag is 11 px on screen at every zoom (0.72,
  0.78, 0.85, 1, 1.25), the headline's smallest step 24 px, the body 15, the desk footer 12; the
  mirror is gone at 1024 and 112 px wide at 1366. 9: the mirror's footer is 117 px tall at 1440. 10: the blank note takes two lines and its box is 73 px tall around them. 11:
  `#ff5a1f` fills at `oklch(0.5 0.15 37.7)`, its hue, beside its own eyebrow. 12: the phone
  paragraph's five lines end at 275 in a screen that ends at 284. 13 and 16: the phone
  headline's lines are 24 px at 15 px type, the look's window opens on a whole line of the
  80-character name, and the look's tag sits under the line. 14: the eyebrow is 12 px above the
  headline's cell. 15: on the phone the send tag sits inside the box's bottom-left corner; on
  the desk the box starts 16 px into the page and the tag clears the chrome. 17: the phone
  wordmark keeps one line with an ellipsis. 18: the footer is 11 px on the phone and 12 on the
  desk. 19: the second lamp is a wash at 1920 with no rim. 22: at 576 the desk page keeps its
  640 px layout at 0.8, the tag 11 px on screen. 23: the reassurance balances into two lines
  of 164 and 169 px. 24: after a turn from 768 by 1024 to 1024 by 768, and back, nothing on the
  region animates at 30, 60, 150 or 400 ms; across 36rem only the crop's own 225 ms translate
  runs. 26: under forced colours the fills keep their shapes with a border each and the art its
  colours, in both frames.
- **Left by decision**, unchanged: 20 (the dark window's foot dissolves into the ink at 390 by
  844), 21 (two islands at 2560 by 1440), 25 (the warm look's green sun over a pink sky under
  Forest), and the stuck ask over the first control at 700 by 500.
- **Seen on the way, not in the report, for the owner.** At 1024 by 768 the look question's
  "Add your own photos" sits under the stuck row on arrival (the first look clears the row by
  355 px, which is the plan's rule); at 1366 by 657 the tails of the pictures and details links
  sit 4 to 6 px under the row's fade at the look and the send, beside the name question's
  privacy link already on the record; at 1440 by 900 the name question with a logo chosen runs
  to 1,024 px (the thumbnail's row and its status line), so the row rides 124 px and covers the
  status line on arrival; and on the short phones the first control at the first and the last
  question starts 27 to 40 px above the ask, within the plan's 24 px, with its lower part under
  the ask (375 by 667: the email's field 503 to 551 against the ask at 530).
- **The gate.** A git worktree cannot hold uncommitted work, so the gate ran on a copy of the
  tree without `node_modules`, `.next` and `.git`, installed with `pnpm install
--frozen-lockfile --ignore-scripts`, at a short path in the scratchpad: at a first copy whose
  files' paths passed Windows' 260 characters, `lib/db/submissions.test.ts` alone failed with
  vitest loading drizzle-orm's `operations.js` through `require` inside a cycle, and passed once
  the same copy sat 34 characters shorter; a clean copy on Windows goes under a short path.
  Typecheck, lint, `format:check`, knip and the unit tests (88 files, 821 tests) pass. `pnpm
e2e` in all five projects against the copy's own dev server on port 3111: 364 of 365 passed
  in 2.9 minutes, and the one that did not, the ground scan at 1280 by 800, hit the 30 s test
  timeout under eleven workers on a cold server (it takes 22 to 25 s when it passes, seven tabs
  and a pixel scan each) and passed with the other seven ground tests when run alone against
  the same server. `pnpm build` passes; `pnpm budget` holds every home-page line and every lazy
  guard on both routes. The copies were removed and `.git/hooks/pre-commit` still names the
  main repository's `node_modules`.
- **Bytes** (decision 24). Release 3 left `/start` at 253,116 B of scripts and 24,057 B of
  stylesheets; the finished polish measures 253,546 B and 24,658 B on the clean copy, so the
  polish's own delta is 430 B of scripts and 601 B of styles. It cannot be brought to nothing
  without dropping a fix: the four crop lists and their turns, the logo's stored reading and the
  breakpoint watch are the scripts, and the board, the crops, the laptop and short-desk rules
  and the forced-colours borders are the styles. Both lines still pass the phase's ceilings
  (252,000 and 23,500), so `BUDGET_PHASE=build pnpm budget` fails on those two lines as it did
  before the polish, and the lines wait on the owner. The home page measures 217,436 B of
  scripts, 16,748 B of stylesheets, 35,740 B of HTML and 55,480 B of fonts; `/start`'s HTML is
  5,795 B.

## Amendment, 25 September 2026: the send and done side fitted to every screen

A second visual QA of Release 3, by three viewers, shot the send and done side of `/start`, the
designs page's example (`/examples/hub`) and the home walkthrough against the mockups and plan
sections 4.4, 4.8 and 4.9, and ranked 23 findings (2 high, 7 medium, 14 low; the report is in
the session's scratchpad, `start-audit/visual-qa-done/report.md`). This amendment records the
polish package that answered them, its review, and the release engineer's close the same
evening: the matrix re-shot on the finished tree, the plan's final gate (section 11.6) on a
clean copy, and the measures. The plan's rules held: numbers in `CONFIG`, tokens in
`globals.css`, page rules in the `/start` sheets, the caps, the copy tests, the fence. Where the
report left a design judgement, the package and the close decided as follows.

- **The page card is drawn twice and shown once** (findings 4 and 15; plan 4.1's desk-wait
  frame). From `lg` the card sits in the region under the posters, at the posters' width, and
  main's column keeps the heading, the lead, the ring and the log; below `lg` it stays in the
  column. The lead keeps its three sentences: the card's move alone puts the ring and five log
  lines in the first screen at 1024 by 768 (the progress block at 441 to 798), 1366 by 657 (453
  to 810) and 1440 by 900 (534 to 849). The slot takes main's dark scope while the page is not
  lit, so the card reads the ink tokens and mixes to light with the flip. Plan 9.1's tab order
  at `lg` is therefore the ask, the call, the three posters, then the page link and Share (below
  `lg`: the ask, the page link, Share, the rows, the call), which `a11y-done.spec.ts` now holds
  at three widths.
- **The board keeps its screen at done** (finding 5). The board stays stuck to the window and as
  tall as it, a one-column grid whose first cell the stage and the designs share, so the posters
  sit level with the heading (y 144 at 1440 by 900, 72 at 1366 by 657 and 1024 by 768) and the
  caption follows the card 24 px under it (y 591 at 1440, where it had sunk to 894), whatever the
  column's height. From `lg` the stage is absolutely placed in that cell only once the slot holds
  the designs (`.start-region:has(.done-slot:not(:empty)) .start-stage`): the review found that
  placing it at every done state left it 0 px tall over an empty slot, so the lamp vanished
  through every arrival, over a stopped build and under the stopped caption. While the slot is
  empty the stage stays in flow at the draft's height, 572 px at 1440.
- **A restored view carries the build's colour and never draws the blank draft** (finding 3).
  The done boundary reports the poll's `palette.hex` with its status; the flow hands the region
  the build's hex, `data-restored` and the stopped flag, so the lamp and the band take the
  posters' fill (`--draft-hex #2f6f4e`; the pixel between the posters rgb(74, 138, 108) at 1440
  and rgb(88, 163, 125) at 390, where it had been the studio's cyan) and the draft is hidden
  from the first paint: the skeleton's pre-paint script, moved after the region in the DOM,
  marks a done address's region restored before the flow mounts. Until the tokens stage has set
  a colour the lamp is the studio's cyan and the posters grey, which is the build's own state.
- **A stopped build keeps a draft only when this tab sent it** (finding 7). Opened from a link,
  a failed or exhausted build draws no draft and no caption; below `lg` the region collapses to
  the island's clearance (76 px at 320 and 390, the heading at y 120). This tab's own stopped
  send keeps its sealed, signed draft under "Your draft is kept. The call starts from it." (the
  done caption had said "Five answers made these"), the caption under the frame (y 740 at 1440,
  543 at 1366, 480 at 1024). The lamp dims to 0.45 in both, as plan 4.9 says, which at a desk
  leaves a restored stopped build with a dimmed lamp in an otherwise empty region: the owner
  judges from `failed-1440x900.png` whether that stays or the region goes blank there.
- **The posters' captions keep the site's own words** (finding 1). The name never shrinks or
  breaks (`overflow-wrap: anywhere` is gone from it), the state takes a row of its own under
  the name, and each item is a grid that fills the row, so the three captions end at one height
  (83 px while building, 59 at ready) with no word broken at 1024 by 768, 1280 by 800, 1366 by
  657, 1440 by 900 or 1920 by 1080.
- **The send hold leaves only the ask on the ink** (finding 2). The sending fade covers the
  title, the receipt, the helper and the controls beside Back and the ask's line, and the card
  drops its ground and shadow, so "Off it goes." and the focused "Sending" are all that stand on
  the ink at every desk (each at opacity 0, the card's ground `rgba(0, 0, 0, 0)`); under forced
  colours the question stays in sight, since the ink is not drawn there. The hold spec installs
  `page.clock` before `goto`, runs it past `CONFIG.form.minMs` so the held POST is issued inside
  the test (exactly one), and never unroutes it; the same rule is on plan 10's "Never submit a
  brief" line.
- **The arrival waits for the draft, whole** (finding 13). On this tab's own send the posters
  split only once the draft has faded (`--split-after`, `--draft-each`); a restored view draws no
  draft and waits for nothing. The close found the wait on the poster art alone: the three
  caption bars, the page card and the board's caption appeared at once over the fading draft,
  the bars waiting 450 ms for their posters to land on them. From `lg` the item now splits as
  one card, poster and caption (the item carries the poster's turn), and the card and the
  board's caption rise on the same wait; `--split-after` is set on the region so every part
  inherits it. Under reduced motion all of it is opacity alone, which
  `reduced-motion-done.spec.ts` now reads on the items, the card and the strip.
- **The log holds one text edge** (findings 6 and 11). The mark sits on the line's first row,
  level with its stamp and first word on wrapped lines too (1 px under the stamp at 1024, 1366,
  1440 and 390). The close found the running line's words still 40 px left of the rest: the
  builder had deleted the rule that spanned them across the stamp column, but a running line
  has no stamp, so a grid per line still placed its words in that column. The log is now one
  grid whose lines lay their parts on its columns (a subgrid), so the stamp column is the widest
  stamp's on every line and the words keep the third: one edge at 135.8 px at 1440 and 87.8 at
  390, the settled lines unmoved. `brief-done-polish.spec.ts` and `mobile-done-polish.spec.ts`
  hold it.
- **Smaller fits.** The time-up line is "Taking a little longer." with "Keep this page open, or
  save its link." a small muted line under it, in the done view, the hub and a design opened
  early (finding 10). The done heading sets without `text-balance` and its payoff phrase keeps
  to one line, so building and ready break at the same words (finding 12). A poster shows its
  headline down to 8.5rem at `max(8cqi, 11px)` and hides only its name under 10rem, so the
  136 px posters at 1024 read (finding 14). A tablet's strip has 164 px posters with a 1.5rem
  gap, their words readable (finding 16). Under 30rem tall the done region's padding-top is
  5rem, so the landscape strip sits 24 px under the island (finding 17). The colour question's
  tag takes the phone art's rise in both frames, on the button's top edge and clear of the
  paragraph (finding 23: at 1024 by 768 the tag at y 307 to 323 against the paragraph's last
  line ending at 307).
- **The designs page's example.** The logo's name gives way below `sm` as the studio bar's
  does, so the call fits at 320 (x 126 to 304, where it had run to 357; finding 8); the state
  takes its own row below 22.5rem (finding 20); the partial example leaves design two plain
  (finding 21, `example.test.ts`); the failed lead is "The next step is a call: we go through
  your brief together.", the exhausted lead keeps "what you have seen" (finding 22,
  `HUB_STOPPED` in the corpus).
- **Left.** Finding 9, the posters' silhouettes keyed by `templateId`, is the owner's scope
  decision (about a day). Finding 18, the phone's order below `lg` (the ring at y 672 on a
  664-tall screen), is plan 9.1's and the owner's call. Finding 19, the full stop that wraps
  alone after the 60-character unbroken name: measured to move nowhere with a word joiner under
  `overflow-wrap: anywhere`, and seen at 1366 too, where the name fills the line exactly; an
  edge of the edge name.
- **The re-shoot.** GET only, one context at a time, on the owner's dev server (the session's
  scratchpad, `start-audit/visual-qa-done/after/`, with `measures.json` beside the shots): the
  status route answered from the repo's own `exampleView`, `/preview/**` blank, every upload
  leg and every other non-GET refused before it left the browser; the send hold only by holding
  the POST in the browser, never answered, continued or aborted; an own send by answering its
  POST in the browser as the harness's `answerSend` does. The ten states of plan 4.9 restored,
  the seven an own send can reach, and the hold at 1024 by 768, 1280 by 800, 1366 by 657, 1440
  by 900, 1920 by 1080, 768 by 1024, 844 by 390, 320 by 640, 390 by 664, 390 by 844 and 430 by
  932 (198 runs with the QA's 60-character name and 20 with a plain one); the example in five
  states at 320 by 640, 390 by 844, 768 by 1024, 1024 by 768 and 1440 by 900; the colour
  question at 1024 by 768. No page errors, one live region and focus on the heading at every
  done state, one design list displayed, nothing scrolling sideways (the hold's `scrollWidth`
  past the viewport is the lamp's bleed under `overflow-x: clip`, which a wheel does not move).
  Two findings the package had marked fixed were still there and are fixed above: 11, the
  running line's edge, and 13, the slot's parts over the fading draft.
- **The gate.** On a copy of the tree without `node_modules`, `.next` and `.git` at `C:/t/px`
  (a short path, after the morning's 261-character one broke a unit suite), installed with
  `pnpm install --frozen-lockfile --ignore-scripts`. Typecheck, lint, `format:check`, knip and
  the unit tests (89 files, 823 tests) pass. `pnpm e2e` in all five projects against the copy's
  own dev server on port 3111: 384 of 384 pass in 3.0 minutes (a first run failed the two new
  log tests on their own fixture, which had asked the imagery stage to run, whose line needs the
  tab's details; the building example's copy line is the running one, and the tests take it).
  `pnpm build` passes; `pnpm budget` holds every home-page line and every lazy guard on both
  routes, and fails `/start`'s two lines as before this polish; `BUDGET_PHASE=build` the same.
  The copy was removed and `.git/hooks/pre-commit` still names the main repository's
  `node_modules`. New fences: `brief-done-polish.spec.ts` (the captions, the hold, the restored
  colour, the card, the marks and the log's edge, the lamp through an arrival and over a stopped
  build, own and restored), `mobile-done-polish.spec.ts` (the strip's colour, the marks and the
  edge, the collapsed region, the landscape strip's air), the order test in
  `a11y-done.spec.ts`, and `reduced-motion-done.spec.ts` reading the items, the card and the
  strip; plan 10's table names them.
- **Bytes** (decision 24). The question side's polish left `/start` at 253,546 B of scripts and
  24,658 B of stylesheets; this polish measures 253,762 B and 24,728 B on the clean copy, so its
  own delta is 216 B of scripts and 70 B of styles: the build's hex reported with its status,
  the restored, stopped and colour props the flow hands the region, the skeleton's pre-paint
  mark, the done heading's style and the two page cards are the scripts; the board stuck at
  done and the sending fade are the styles. The close's own changes (the item's split, the
  card's and the caption's wait, the log's subgrid) ride the done chunk and its sheet, which the
  lines do not count, so they add nothing (the 2 B against the review's 253,760 B is build
  noise). Neither line moves: both stand past the phase's ceilings (252,000 and 23,500), as they
  did before this polish, so `BUDGET_PHASE=build pnpm budget` fails on those two lines and they
  wait on the owner's decision (a, b or c of the Release 3 record); every home-page line and
  every lazy guard on both routes holds. The home page measures 217,436 B of scripts, 16,748 B
  of stylesheets, 35,737 B of HTML and 55,480 B of fonts; `/start`'s HTML is 5,816 B.

## Amendment, 25 September 2026: the owner's decisions, and the follow-up package

The owner decided every question the build had left open (section 13.1's OD11, the colour
target, `/examples/hub`, the poster silhouettes, the phone's done order, three visual calls, five
judgements by eye and two sentences), on the evidence recorded above and in the two visual QA
reports, and asked for the decisions that change the page to be built. This amendment records
each decision, what the follow-up package built for it, the re-shoot and the gate.

- **The byte lines move once, by the rule** (decision 24, OD11). The finished tree measures
  253,760 B of `/start` scripts and 24,732 B of stylesheets, so by plan 9.6's rule (the
  measure plus 70 B, rounded up to the next 500) the lines are 254,000 and 25,000 B,
  and `BUDGET_PHASE` and its ceilings are gone from `scripts/bundle-budget.mjs`. The owner
  weighed the alternatives the Release 3 amendment lists: the offsets left were worth about 500 B
  of script against an overage of 1,762, and the 248,000 B fallback would have cut built
  features for a saving no visitor could feel (1.7 KB gzipped is under 0.7 per cent of the route
  and tens of milliseconds on slow 3G). The extra bytes bought the four P6 majors, the "too many
  today" call link and two polish rounds. The Lighthouse script line (230,000 B), which `/start`
  failed before this work, is a separate matter for a measured breakdown of the route's chunks.
- **The 15 per cent colour target holds for light grounds only.** `imgstats.py` counts pixels
  above chroma 0.35; ready and partial measure 15.1 per cent and question one 9.4, while the
  wait with a real Forest lamp measures 0.1, the send 2.5 and the colour question at a desk 6.2
  to 6.9 (17 to 20 on a phone), and the plan's own mockups of those states 0.7, 2.0 and 6.9. The
  dark states are lit by one lamp on the ink by design, as the home page's dark bands are (1.7
  per cent on the same tool), so the target for them is `pool.mjs` (the lamp lit and spent above
  the text) and the eye against the mockups; plan 11.6 says so.
- **`/examples/hub` ships**, unlinked and unindexed like the eight template examples: its page
  carries `robots: { index: false, follow: false }`, draws a static example view with no
  database read, and takes no words from its address (`?name` picks one of two fixed names,
  `?state` one of five states). It is the one address that shows the designs page in production
  without a real slug, and a stable page to show a prospect.
- **The poster silhouettes are one per template** (finding 9 of the second QA). A template's
  entry in `lib/preview/descriptors.ts` now holds its words and its layout, one of eight keys
  (`centred`, `cards`, `pool`, `split`, `photo`, `type`, `airy`, `editorial`), and `layoutOf`
  gives the poster its `data-layout` from the moment the select stage names the template, so
  "Three layouts chosen" is three different shapes at 0:06 rather than at 0:58 when the
  headlines land. The layout is decided at select, so drawing it then keeps the truth rule; the
  headline and the photo land inside the same layout at ready. Each silhouette is the template's
  own first screen in the poster's few shapes, verified against its sections: Aurora's centred
  words over the product frame at the foot with its horizon glow; Monolith's four cards two by
  two; Meridian's floating pill bar and the pool of the fill behind the picture's top; Atlas's
  words beside a tall picture; Ember's picture under everything with the words centred on it;
  Harbor's three heavy uppercase rows, the second in the fill, over the picture at 0.4; Summit's
  thin left-aligned words on its picture with a square-cornered button; Vector's dark glass bar,
  tall light rows, the diagonal band that stands for its waves and the wide 3:1 picture of its
  first slot. Nothing is drawn before select, and no words or picture before their stage. The
  split gives the words three fifths of the poster rather than the template's half, because at
  196 px a true half is 77 px and "Physiotherapy" (83.5 px at the split's 11.76 px headline, 78.1
  px at the 11 px floor, measured in the site's face) broke in two; under 11rem the split shows
  the lines instead of the headline, as every layout does under 8.5rem. `descriptors.test.ts`
  holds every ready template to a layout, all distinct; `brief-done-layouts.spec.ts` walks
  unchosen, chosen and ready for every ready template and the designs page, and checks no poster
  overflows; the strip is held in `mobile-done-polish.spec.ts`.
- **Below `lg` the progress block comes before the page card** (finding 18; plan 9.1, amended).
  The column reads heading, lead, the ring and the log, the page card, the rows and the call at
  every width; from `lg` the column's card is hidden and the region's shows, so the desk is
  unchanged. At 390 by 664 while building the ring's top is 543.6 px (it was 672, under the
  fold), the progress block 543.6 to 785.6 and the card 809.6 to 913.6. The block holds nothing
  focusable, so the tab order `a11y-done.spec.ts` holds (the ask, the page link, Share, the
  rows, the call) is unchanged; the order is held in `mobile-done-polish.spec.ts`.
- **The page is capped at 120rem** (finding 21). From 120rem the grid holds at 120rem and
  centres (`start.css`), so a 2560 px screen shows the composition verified at 1920 in the
  middle (the grid at x 320, 1920 wide; the island over it at x 1001); the desk's canvas is
  white left of the viewport's centre and the ink right of it, so each margin continues the
  ramp's own end, and the done sheet paints the canvas ink from the first frame of a done
  address at every width. Two things the cap uncovered were fixed with it: the region's
  sideways clip, which had cut the lamp in a line down the grid's edge (the region now clips up
  and down only from 120rem, and the light fades over the canvas), and the 32 px of sideways
  scroll that the lamp's reach then opened (the root takes the clip from 120rem, so the body's
  cuts the light at the screen's edge; `scrollWidth` is 2560). `brief-wide.spec.ts` holds the
  grid, both margins, the fit and the scroll at 2560 by 1440 and the full grid at 1920. The
  faint seams the cap leaves, each between near-identical colours (the ramp's 20 to 30 per cent
  stops against the white margin at the foot; the band's re-hued ink against the canvas's ink;
  at ready the grid's top-right corner a stop short of the ink), are recorded, not hidden.
- **The dark look's window is lifted by light, not a line** (finding 20; ADR 0034 decision 2
  kept). In the dark scheme the window below 36rem gets a halo in the page's own glow beside the
  panel's shadow (`start-draft.css`), and no ring. Measured at 390 by 844 on the dark look at
  question three: the luminance step across the window's foot (a 1 px band 3 px outside against
  one 3 px inside, on a 0 to 255 scale) is 37.6 with the halo and 17.0 without.
- **The mood art keeps its look's colours** (finding 25). The `[data-coloured]` overrides that
  tinted the art's land, sun, sky and field with the brand are gone from `start-draft.css`, so
  the warm look keeps its sunset under Forest, the bold look its primaries under Plum and the
  dark look its bloom. The art stands in for the photos the pipeline finds for the look, and a
  photo does not take the brand colour: the pipeline puts that colour into the buttons, the
  headline and the glow, which the pour paints. Shot at 1440 by 900 and 390 by 844 for all three
  looks.
- **The page card shows its address without the scheme.** The link's words are the host, then
  `/preview/` and the slug (`brief-done.tsx`, and the stand-in in `done-boundary.tsx`, so the
  words do not change when the view replaces it); its `href` and what Share hands on stay the
  full URL. The slug is the visitor's key to come back, so it is never elided as the mockup drew
  it; the shots used `localhost:3000`, shorter than the production host, so the 1024 wrap is
  re-checked on the deployed page rather than claimed here.
- **Judged by eye and kept as built:** the compact desk under 56.25rem tall (the title one step
  down at the home page's section size, still with its italic word, which is what most laptops
  see; the full layout returns on a 900 px viewport); the blank draft pale until the sentence
  reaches 30 characters (question one still measures 9.4 per cent, and without the veil the
  first answer would barely change the frame); the dimmed lamp on a failed or exhausted build
  opened from a link (plan 4.9; the rarest state, whose column does its work). **The field-edge
  judgement is re-signed** on the grounds of ADR 0035 decision 11: a well is 1.18:1 against its
  ground and is known by the label above it, the placeholder inside it (7.58:1), its inset edge,
  the white card around it and the 2 px focus outline; the only route to 3:1 is a visible edge,
  which the no-hairline rule refuses, and the owner keeps the rule. **Two sentences are
  confirmed** as written: "The next step is a call: we go through your brief together." and
  "Taking a little longer." over "Keep this page open, or save its link."

**Shot and measured** (GET only, the status route stubbed, nothing sent, uploaded or written):
the posters at 1440 by 900 and 1024 by 768 in the unchosen, chosen and ready states for every
ready template, the strip at 390 and 320 and the designs page's example at 1440 and 390
(`scratchpad/followup/posters/`); the page at 2560 by 1440 on questions one and three and at
1920 by 1080, and the wait at 390 by 664 (`followup/layout/`); the colour question with the
warm, bold and dark looks at 1440 by 900 and 390 by 844, and the dark look's window at question
three, its halo measured by `followup/halo-ab.mjs` (`followup/draft/`). The word that set the
split's threshold was measured in the site's own face on the page (`followup/word-width.mjs`).

**The gate** (plan 11.6, on a clean copy at `C:/t/px`, a frozen install with no scripts, 25
September 2026, evening): typecheck, lint, format:check, knip and the unit tests (89 files, 826
tests) pass; `pnpm e2e` in all five projects against the copy's own dev server on port 3111
passes 394 of 395 (desktop 230, mobile 112, tablet 34, reduced motion 14, no script 4), the one
miss `brief-ground.spec.ts`'s 1280 by 800 case timing out under the full parallel run and
passing alone in 12 s, the flake the earlier amendments record; the dev server's log holds no
POST. `pnpm build` passes with both routes prerendered. `pnpm budget` measures `/start` at
253,760 B of scripts and 24,732 B across its two sheets (the shared sheet 16,748 B and its own
7,984 B), 644 and 675 B over the fifth amendment's measures, and passes on the same build once
the lines are 254,000 and 25,000 B, with every lazy guard on both routes ok; the home page
measures 217,436 B of scripts, 16,748 B of stylesheets, 35,737 B of HTML and 55,480 B of fonts,
every line held; `/start`'s HTML is 5,817 B. The main repository's hooks are untouched and the
copy is removed. Seen on the way and not this package's: three React hydration warnings on `/`
in the axe runs, where `data-inview` and the FAQ's `open` land before hydration finishes;
pre-existing, for a later look. Nothing is committed.

## Amendment, 25 September 2026: the phone shows the desk's frame whole

Late on 25 September 2026, after committing the package above as e5436be on
`feat/start-lit-draft`, the owner sent a screenshot of the questionnaire on an Android phone: the
"Live draft" window at question one, the phone page cut off at its foot with the "01 Sentence"
box sliced through, and asked that the drawing be the desktop one, "exactly like the one on a
desktop screen size but smaller so it fits within the screen", without guessing. This amendment
records what that withdrew, what replaced it, the numbers it was built to, and its gate.

**Withdrawn.** Plan D8 (the phone frame restyled as a 358 by 212 window onto the phone page, its
crop offsets per question and its 450 ms crossfade, the stacked band's 300 and 150 px crops of the
desk page) and the polish amendment's four offset lists. With them: `CONFIG.start.window`, the
window's tokens in `start-draft.css`, the `draft-turn` keyframes, the `data-turn` hooks and the
`at` prop of `Draft`, the "Live draft" bar and `DRAFT_CHROME.windowBar`, the phone frame's own
signature and whole-page box (never shown at any width the phone frame has), and the unit test
that held the window's numbers to the sheet. The plan's D8 line, its 4.2 rows for 768 by 1024,
the split views, 390 by 844, 390 by 664, 320 by 640 and the short screens, its 6.2 window row,
its 9.6 region row and its fence row for the frames are amended in place.

**Built.** Below `lg` the region shows the browser frame at its 640 px layout, the whole draft
zoomed to the region's content width and never past 1: `--draft-zoom-wide: min(calc((100cqi -
2rem) / 640px), 1)`, the gutter 4rem from 40rem, so the frame is 358 px across at 390 wide, 380 at
412, 398 at 430, 614 at 678 and 640 from 44rem, centred; the region measures 396 px at 390 by 844
(the island's 72 px above, 24 below) and 628 at 768 by 1024. `--draft-zoom` stays the zoom in
force, so the tag reads 11 px on screen and the box's line 1.5 px at every width (the tag's box
measures 15.4 px at every size shot). The phone frame waits for 80rem, where it sits over the
corner as before; `sketch-pane.tsx` now watches `lg` and 80rem, the widths at which a part of the
region first shows. A dark page below `lg` sits on the ink where the desk's ramp is lighter, so
the owner's halo for the dark window moves to the frame there: its foot's luminance step was 13
without it against the desk's 41, and is 29 with it. The whole-page box sits against the page
inside the frame, 16 px under its chrome, as the desk draws it. The frame's own edge, its panel
shadow and the chrome bar's transparent rule now apply at every width.

**Engines.** A length over a length is CSS typed arithmetic: Chromium and WebKit compute the
fit (358 px at 390), Firefox does not and would draw 640 (`fit-support.mjs`, 25 September), nor
does any Safari before 26. Under `@supports not (zoom: calc(1px / 1px))` the fit is stepped by
width, each step the fit of the width it opens at, 2.5rem apart (0.4, then 0.45 from 20rem, 0.51,
0.57, 0.63, 0.7, 0.76, 0.82, 0.88 from 37.5rem, 0.9 from 40rem where the gutter widens, 0.95
from 42rem, 1 from 44rem), so the frame is never more than 40 px short of the gutters: Firefox at
390 by 844 shows 326 px in a 370 px region, at 390 by 664 the same 192 as the others, at 768 the
same 640.

**Short screens.** The whole frame at the width's zoom would carry the first control under the
ask riding at the foot, or the title off the first screen, so the zoom is capped there, the
frame smaller and still whole. The caps were measured (`scratchpad/fit/caps.mjs`, every cap from
0.3 to 0.9 at every question) as the largest round steps that keep the plan's arrival rule (4.2;
`mobile-start-ask.spec.ts` and `mobile-order.spec.ts`: the title in the first screen and every
question's first control at least 24 px, the fade's own depth, above the ask on arrival):

| Screen                                                   | Cap  | Frame      | Region | First control above the ask, q1 to q5                            |
| -------------------------------------------------------- | ---- | ---------- | ------ | ---------------------------------------------------------------- |
| 390 by 844 (52rem or taller: the width's zoom, as asked) | none | 358 by 300 | 396    | 17 (its box 33), 74, 100, 100, 23                                |
| 375 by 812; 390 by 800; 360 by 780 (under 52rem)         | 0.4  | 256 by 216 | 312    | 72 and 54; 57 and 63; 1 (its box 17) and 24                      |
| 360 by 740                                               | 0.4  | 256 by 216 | 292    | 33, 101, 127, 127, 36                                            |
| 390 by 664; 375 by 667 (under 43.75rem)                  | 0.3  | 192 by 163 | 239    | 26 (its box 42), 73, 99, 99, 32                                  |
| 320 by 640 (the ask in its place)                        | 0.3  | 192 by 163 | 239    | in flow; the description's whole box in the first screen         |
| 640 by 800 (the band under 52rem)                        | 0.4  | 256 by 216 | 292    | 39, then whole above the ask: 101, 154, 154, 102                 |
| 700 by 500                                               | 0.4  | 256 by 216 | 292    | the title in the first screen at every question, two lines at q5 |
| 768 by 1024                                              | none | 640 by 532 | 628    |                                                                  |

The rule holds at every screen the plan names. It is bent at two it does not: at 390 by 844 the
description's field starts 17 px above the ask's box (its well 33, the label and hint whole) and
the email field 23, since the owner asked for the whole drawing at the width there; and at 360 by
780 the description's field meets the ask's top with its box 17 px clear, where the plan's own
212 px window left it 4 px lower. A cap of 0.45 under 52rem, the first tried, left 375 by 812 at
45 and 360 by 780 at minus 25; 0.35 under 43.75rem left the email field 6 px clear at 390 by 664
and put the description's box under the ask at 320 by 640. The band's cap could not be higher:
at 0.5, 640 by 800's second and fifth questions end under the ask, and 700 by 500's two-line
title leaves the first screen. Under 30rem tall the draft and the curve give way as before.

**Fences moved.** The region's line at 390 by 844 moves from 320 to 400 px (`mobile-questions-lit`,
`brief.spec`, `mobile-start`: the desk's frame at the width's zoom is 300 px where the window was
212). `mobile-draft.spec.ts` is rewritten for the frame: whole at 358 with nothing clipped at
every question, the phone hidden, the tag 15.4 px on screen, the caps at 320 by 640, 390 by 664,
360 by 740, 375 by 812, 768 by 1024 and 700 by 500, the curve as before. Its measure of a draft
that answers back keeps a tenth of the frame for the sentence, the look and the send and takes
the desk frame's own share for the two answers that are type and tint: the name 0.087 and the
colour 0.058 at 390 (0.072 and 0.049 at 1440), held above 0.07 and 0.045. `mobile-short.spec.ts`
holds the caps and, at 390 by 664, the field's edge and label clear of the ask; its window-offset
tests are gone. Its 12 px floor is gone with the window: the frame is the desk's picture, whose
15 px type the desk already shows at 10.8 px at 1024.

**Forced colours.** Once the frame showed below `lg`, axe found the footer's line at 1.14:1: the
desk had filed the same node as inconclusive behind a pseudo-element, so the fault was never
seen. Chromium forces `color` and leaves `-webkit-text-fill-color` at the author's, as
`start.css` notes for the caption; the draft's type now takes `CanvasText` as its fill under
forced colours, and the four axe tests on the mobile and tablet projects pass.

**Shot** (GET only, `scratchpad/fit/shots/`): 320 by 640, 360 by 740, 375 by 667, 390 by 664,
390 by 844, 412 by 915, 430 by 932, 640 by 800, 700 by 500, 768 by 1024 and 1024 by 768 in
Chromium at the blank first question, the warm look's colour question and the dark look's last;
390 by 664, 390 by 844 and 768 by 1024 in WebKit and Firefox; the dark look's frame with and
without its halo.

**The gate** (plan 11.6, on a clean copy at `C:/t/px`, a frozen install with no scripts, 25
September 2026, night): typecheck (after the copy's build, which writes the route types), lint,
format:check, knip and the unit tests (92 files, 839 tests) pass; `pnpm build` passes with both
routes prerendered; `pnpm budget` measures `/start` at 253,367 B of scripts (393 B under the
sixth amendment's measure, the window's code gone) and 24,582 B across its two sheets (150 B
under), both lines held, every lazy guard ok. Against the main tree's own dev server, every
questionnaire spec in the five projects passes, 343 of 343 (desktop 202, mobile 94, tablet 33,
reduced motion 11, no script 3), no retries; the unit tests pass there too, and typecheck, lint,
format:check and knip. The main repository's hooks are untouched and the copy is removed. Nothing
is committed or submitted.
