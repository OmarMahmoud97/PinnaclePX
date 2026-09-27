# The contact page continues the closing

- Status: accepted, built and gated on 27 September 2026. Launch waits on three owner decisions:
  OD2 (every message is answered by email), OD6 (the privacy wording and the email provider's
  name) and OD7 (the calendar in the page). OD3 and OD4, the ink on a page with a form, stand on
  the defaults below until the owner's written OK. Every other decision is the build's default,
  listed under "Owner decisions" for the owner to confirm or reverse
- Date: 27 September 2026
- Amends: ADR 0031 (its consequence on WCAG 2.2.2: the autoplaying ink now also runs on
  `/contact`, with the same mitigations and one more); ADR 0032 (decision 1, the one `Ink`
  component now serves a third band, on a second page, and decision 3's flip by difference,
  which `/contact` uses for its H1 alone); ADR 0034 (decision 3, the italic rule: `/contact`
  carries one payoff word in its H1 and "Off it goes." on the send's ink only while the ink
  covers the card); ADR 0037 (decision 20's italic rule on `/start`, whose send words `/contact`
  echoes without importing `/start`'s bloom)
- Keeps: ADR 0034 decision 8 (`header-chrome.tsx` is not edited: the page's dark cards take the
  dark tokens by class, so the observer never counts them); ADR 0037 decision 1 (no spec sends,
  the refusal pattern); ADR 0014's honeypot and the form's floor; ADR 0005's lazy chunks
- Plan: the `/contact` build spec and the tech lead's amendments TL-1 to TL-5, both of 27
  September 2026. They live outside the repository, so this record carries every decision they
  settled, and every place the build departs from them

## Context

The owner, 27 September 2026: "a contact page that matches the branding, lets people fill a form
that is sent to the env var OWNER_EMAIL or book a call with the Cal link; it must look amazing and
be animated while having clean and fast code; unique, and great on desktop, tablet and mobile."

The site had no contact route. `SITE.contactEmail` is null, so there is no address to print; the
call was a link out to Cal.com and nothing else; and the privacy notice's rights paragraph, in its
null branch, told a visitor to write to an address that does not exist.

Three concepts were drawn from six maps of the site (brand, motion, forms, chrome, voice, live
visuals) and judged by three judges: a creative director, a principal engineer, and a judge for
conversion and accessibility. Concept A, "Ink-first: the closing, continued", scored 139 (47, 47,
45), C 132 (44, 41, 47) and B 111. Two judges picked A and the third ranked it a close second;
every case against it was about excess, not direction. So the page is A's, with A's ink tricks cut
(no puffs as fields fill, no send burst through the H1, no edit to `lib/motion/fluid.ts`), B's
safer engineering grafted on (the dark tokens by class, Cal.com in its light theme on a white
card, loading only on a press, backwards fills, the pre-hydration restore, the regex parity test,
`field-sizing`, the email checked on blur) and C's honesty devices (one `subjectLine` shared by
the page and the email, a receipt of subject and address, `method="dialog"`, `minHoldMs`, the
press point taken from Send itself). A critic then checked the spec against the installed
packages, the live Cal.com loader and the vendor documents (amendments CA-1 to CA-35), and the
tech lead's TL-1 to TL-5 overrode it where they disagree.

## Decision

1. **The route.** `app/contact/page.tsx` is a server component, statically prerendered: it reads
   no request, and its Server Action does not stop it being static (the `/start` precedent). It
   renders `SiteHeader` with no props, since its first screen is white, one `main#main`, then
   `SiteFooter` over a white `.before-sheet` band, and `PageMotion` for the answers band's
   reveals. Its rules are a route import, `app/_styles/contact.css`, so the sheet every other
   page shares never carries them (the `/start` pattern, `docs/start-page-journey-plan.md` D26).
   Its canonical is `/contact`; the page restates the social card's objects, which replace the
   layout's. The contact page joins the sitemap, the footer's Studio group and the phone menu's
   foot, never the desktop row: a fifth link there overflows the header between 768 and about
   800 px (`CONTACT` in `nav-links.ts`, `NAV_LINKS` unchanged at four).

2. **The first band is the hero's ground, with its ink** (amends ADR 0031 and 0032). The hero's
   fifteen-stop ramp is copied into `.contact-ground` stop for stop, with `--g` for the hero's
   gradient height, and `contact-tokens.test.ts` keeps it equal to `.hero-ground`. It starts under
   the H1 (`--ramp-top`), so the H1 sits on pure white at every width, and flips by difference
   where the ink passes behind it (`.over-ink`). The H1 is static: nothing between it and the
   section makes a stacking context, and no small text sits on the ink; every other word on the
   band is on an opaque card. `<Ink/>` is the page's only WebGL context. The ink listens: while
   the form has the focus, `:has()` fades the canvas out and the ramp stands still; when the focus
   leaves, the sent card's heading taking it among other ways, it comes back. A browser without
   `:has()` keeps the ink moving. The band hands over to the white answers band through the home
   page's pooled curve, and from md up the curve and the footer sheet's lip spring with the
   scroll exactly as the home page's do (OD9, decided by the owner the same day: the page mounts
   `PageChoreography`, and `ink-pool.ts` finds a page's pool by its class). ADR 0031 records the ink as WCAG 2.2.2's kind of moving content
   with no pause control, mitigated by reduced motion and by stopping off screen; on `/contact` it
   also stops being seen while the visitor writes, and the calendar's sheet covers it (OD3, OD4).
   The spec's two-line base for `--ramp-top` gains a one-line step at 40rem (CA-28), and the H1 is
   held to two lines below 40rem (`max-width: 8em`): it is about 9.4em wide, so on a 390 phone it
   fits one line on Windows and wraps on Linux's wider setting, which would put the ramp's start
   inside it.

3. **Two materials, and the header.** Writing is a white paper card built like the hero's prompt
   card; talking is an ink card with the cyan top light the Work tiles carry. The ink card, the
   sent card and the sheet's head and foot take the dark tokens through `.contact-ink`, a copy of
   the dark scope's declarations (`app/globals.css`) that `contact-tokens.test.ts` keeps equal,
   so no narrow dark surface ever sets `data-over-dark`. `data-theme="dark"` appears only on two
   full-width elements: an empty sentinel where the ramp is already the studio's blue, and the
   pool. Send carries `id="hero-cta"`, so the header's blue ask stays unfilled while Send is on
   screen, and Send is one node for the page's life (the form is hidden once sent, never
   unmounted), because the header reads it once, at mount (OD12). A hidden Send reads as scrolled
   away, so while the sent card shows, the next scroll fills the ask; no blue Send is on screen
   then (CA-17). The dark pill over the lower part of the white card, from about 766 px of scroll
   on a 390 phone and over the card's foot at 1440, is accepted (TL-2): `/start` shows the dark
   pill over a white pane by design, and no sentinel logic is added.

4. **The form.** Three fields, message first, then name and email; no company, phone or budget
   field, since every field costs sends and a phone field would break "Nobody calls you unless
   you book". The privacy answer ("How we use your details", to `/privacy#contact`) comes before
   Send, and an envelope under the fields shows what will land: the subject the studio sees, the
   very string its email carries (`lib/contact/subject.ts`), and the address a reply goes to. The
   form's method is `dialog`, which outside a `<dialog>` does nothing, so before hydration no name
   or message reaches a URL, and without JavaScript the fields and Send are hidden and the card
   offers the call instead: there is never a Send that does nothing. Words typed before
   hydration are read back into the first controlled render. Checks run in the browser as a field
   is left (only when it holds something), while a marked field is edited, and on Send, with the
   first marked field taking the focus; `lib/contact/checks.ts` is zod-free and its email pattern
   is zod's own, byte for byte, so an honest visitor never reaches the server's refusal. The
   message may be one line and at most 2,000 characters, with a meter only in the last 200 (OD11).
   As built, a field's check on leaving is skipped while Send is being pressed: the error line it
   adds pushed Send about 26 px down between the press and the release, and a click on Send's
   upper half missed. The send checks every field a moment later, so nothing is lost. The
   textarea grows with its words (`field-sizing`); where it can, it has no resize handle. A send
   from the keyboard (Enter in the address, whose key says Send, or Ctrl or Cmd+Enter in the
   message) starts in a field the send makes inert, which dropped the focus to the page and
   brought the ink back mid-send; the focus now moves to Send first, so a failure finds it there,
   as it does after a press (found in review, 27 September 2026). The privacy link opens a new
   tab, so it is not prefetched.

5. **The send is the house's bloom, inside the card** (amends ADR 0034 and 0037's italic rule).
   `.contact-bloom` echoes the `/start` bloom in `contact.css`; `SendBloom` is not imported, since
   it brings `/start`'s copy deck with it. The ink opens at Send's centre, measured from Send
   itself, never the pointer or the focus; it holds at `CONFIG.contact.send.holdShare` of its path
   while the message is on its way, "Off it goes." rising over it in the display serif italic,
   and runs on over the card once the server has answered and `minHoldMs` has passed since the
   press, or drains where it stands with the reason and every word kept. The bloom and the
   actions share the card's one stacking context. From 48rem Send holds its resting width
   (14rem) through "Sending", so the caption beside it keeps its lines and the ink opens from the
   middle of the pill it was measured from; as the ink runs on, Send fades out, so the form is
   hidden under nothing still in sight, and a drain leaves it in view. The sent card is the ink
   card's twin: a drawn tick, the heading by the visitor's first name, the receipt, a way back to
   fix the address with every word kept, and "Send another message", which keeps the name and
   address and clears the words. It starts at the form's height; from 64rem it eases to the call
   card's height beside it, so the two cards end level (below 64rem it keeps the form's height,
   its panel at the foot on a phone). Focus moves to the sent heading without scrolling, and the
   tab's title says the message went. The call card's light warms as the message lands. After two
   failures in a row that a second try might clear (`CONFIG.contact.send.stuckAfter`), the
   refusal offers the call.

6. **The server** (TL-1). `submitContact` takes an unknown argument, since the browser is not a
   trust boundary, and reads its parts through a guard, so a crafted request's null, missing or
   array argument is refused as a filled honeypot is rather than thrown as a server error. It
   refuses a filled honeypot or a send faster than the form's floor
   (`CONFIG.form.minMs`), then parses the fields with zod on the server only
   (`lib/contact/schema.ts`), then counts two limits together, `contact-ip` (five an hour) and
   `contact-identity` (five a day, keyed on an HMAC of the address). Both count before the send,
   so a retry counts again: five leaves room for two failed tries and three messages, and a day's
   sends spent offers the call (OD10). It then emails `OWNER_EMAIL` once, with the visitor's
   address as `replyTo` (`lib/email/contact-notice.ts`), synchronously, never in `after()`, so a
   failure reaches the visitor. There is no auto-reply, and nothing is stored but the two
   counters. The logs carry shapes and counts only: never a name, an address or a word, and never
   an error's message, which from Resend can quote an address. **There is no idempotency key.**
   The spec keyed the send on the identity, the name and the message, so a send outliving the
   client's 20 s timeout could not email the owner twice. Resend does not document whether a
   failed request keeps its key, and if it did, a visitor could not send the same words again for
   24 hours. A duplicate email is harmless; a stuck visitor is not. So `ContactRefusal` is
   `'retry' | 'too_many' | 'rejected'`, `sendEmail` keeps its signature and its thrown
   `AppError`, and the only change to it is the conditional `replyTo`. The body stays a pure
   function of its input, with no clock in it. The name is one line wherever the email carries
   it, the subject and the Name row alike (`oneLine` in `lib/contact/subject.ts`): control
   characters, line breaks and the direction overrides and isolates become spaces. **The server
   answers before the page gives up.** The limits and the send race a deadline,
   `CONFIG.contact.send.serverMs` (15 s), shorter than the page's 20 s: a page sends its Server
   Actions one at a time, so a stalled send held the visitor's retry in the browser until it
   settled (reproduced in review: the retry's request left 10 s after it was pressed, once the
   first was released). Past the deadline the action logs `contact.failed` with the reason
   `deadline` and answers `retry`; a count or an email still on its way may yet land, which the
   no-key choice above accepts.

7. **The booking is Cal.com's own calendar, in a sheet, loaded on a press.** A labelled control,
   "Book a 20-minute call", in the call card and, below 48rem, in the form card's first lines,
   opens `dialog#booking` with `showModal()`: a full-screen ink sheet that blooms from the press,
   with a white card holding Cal.com's inline embed in its light theme, themed from the site's
   tokens (`lib/booking/cal-theme.ts`; no colour is written in TypeScript). Cal.com's loader is
   fetched only from a trusted press or Enter on that control, never on load, a scroll, an
   arrival at `#call`, a return through the history, or an arrow key. Before hydration and
   without JavaScript the control is the booking page itself, in a new tab; after hydration a
   plain link to the booking page sits under it, in the sheet's foot at every moment, and in the
   footer. Close controls sit on both sides of the frame, since Escape may never leave Cal.com's
   frame and Tab always does. If the calendar is not ready within 10 s, or its loader fails, the
   card offers "Try again" and the booking page; a calendar ready after all still takes the card.
   A booking made in the sheet is counted, the sheet's status line says "Your call is booked." for
   a screen reader, and the call card says it too. The
   live checks of 27 September 2026 (Chromium, the worktree's dev server, no time chosen, the
   booking endpoints refused) found:
   - Nothing requests any Cal.com host before the press. After it, about 81 requests to
     `app.cal.com` and one to Cal.com's own error reporting (`o574544.ingest.us.sentry.io`).
   - The frame is `https://app.cal.com/pinnaclepx/quick-chat/embed?layout=month_view&theme=light&embedType=inline&ui.color-scheme=light&embed=contact`,
     ready 1.3 to 1.9 s after the press. Its own title is "Book a call" until the sheet replaces
     it with "Book a 20-minute call" (CA-2).
   - The light theme takes the brand on the white card: the chosen day in `#0369a1` with white
     text, open days on the deeper wash, the frame's body transparent over the card.
   - `hideEventTypeDetails` works: no title, host or duration in the frame.
   - At a 944 px frame (1024 px and wider) Cal.com sets its times beside the month; at 800 px and
     on phones it stacks them under it. Its wordmark stays at the foot on the free plan. Its grey
     outline round the booker is dissolved by a fifteenth theme key, `cal-border-booker`, mapped
     to `--surface`; the variable is in the live embed's stylesheet but not in Cal.com's
     documented list, and deleting that one line restores the outline.
   - Opening the calendar sets three cookies on `.cal.com`: `__cf_bm` (Cloudflare's bot
     management, 30 minutes), `__Secure-next-auth.csrf-token` and
     `__Secure-next-auth.callback-url` (both for the session). All are security or sign-in
     plumbing; no analytics or advertising cookie was seen.
   - Escape pressed inside the frame does not reach the page; Tab from the round close button
     enters the frame.
   - Cal.com fires its events on the page's window as `CAL:{namespace}:{event}`, and its message
     listener checks no origin. Only analytics and the booked line depend on them.
   - uBlock Origin was not tested (no extension in the harness). A blocked loader fails at once;
     a frame that never reports ready fails at 10.2 s. Either offers the booking page.

   As built: the bloom's `clip-path` is on an empty ink layer inside the dialog, not on the
   dialog. With the clip on the dialog, Chrome clipped Cal.com's cross-origin frame and the
   sheet's scrolling box only to the clip's bounding box, so a square of calendar or blank showed
   round the disc while it bloomed and drained; a minimal page did not reproduce it, and clipping
   an empty layer removes it by construction. The sheet's column stays 64rem: at an 800 px frame
   Cal.com switches to its stacked layout. A try after the document's first mounts under a fresh
   namespace (`contact-2` and on): a retry in the same sheet, or the first try of a sheet mounted
   again after a client-side return to the page. The count lives in `lib/booking/cal.ts` for the
   document's life, as `window.Cal` does, since Cal.com never removes a namespace's listeners;
   counted per sheet, a return to the page heard one booking twice. A try before the loader has
   run forgets the earlier try's queued commands, or the loader played both and put two
   calendars in the frame. The booking page's links in the call card, the refusals and the sheet
   are one `BookingPageLink`, built on the site's `TrackedLink`. The loader is
   Cal.com's snippet, typed, except that `loadCal` appends the script itself, so the sheet hears
   when it fails.

8. **Motion.** `--contact-pace: 1.5` on `main.contact` derives the page's clocks from the shared
   `--motion-*` tokens, the phone menu's weight (`CONFIG.contact.pace`, test-locked), and nothing
   retunes the shared tokens. Every duration is inside `CONFIG.motion.caps` (900 ms, an 80 ms
   stagger), no translate passes 2.5rem and no scale starts below 0.94, and no time is written as
   a literal: every animation runs on a `--contact-*` clock. Entrances fill backwards, so nothing
   lingers at rest to make a stacking context. The largest paint is never faded: from 48rem it
   is the H1, which is static; below 48rem it is the form's lead, so there the form's card lifts
   without a fade (`contact-lift`) and its heading and lead arrive with it, not after it. Faded,
   the lead painted about 0.5 s after the first paint at 360, 390 and 412 px; now the largest
   paint is the first (measured on the dev server, 27 September 2026). Every keyframe has a
   same-named twin under reduced motion that fades or changes colour, except the spinner, which
   holds still, and the lift, which has none, so the phone's form card simply appears. The
   sheet's parts start at the page's tap (180 ms), a stagger apart, as the phone menu's rows do,
   so no blank ink holds the screen. Under reduced motion `--contact-pace` is 1, the ink never
   starts, and the sheet fades. The page's own motion needs no GSAP. GSAP and ScrollTrigger
   arrive only with the home page's choreography, on the first scroll intent and from md up, for
   the pool, the lip and the footer's wordmark (OD9); the home page's section modules find none
   of their sections here and do nothing, and reduced motion never mounts the choreography.

9. **Copy and claims.** Every visitor string is in `app/contact/_components/contact-copy.ts`, and
   the field errors, which the server words too, in `lib/contact/messages.ts`; both join `COPY`,
   so the corpus rules and the reading-level test read them. Phrases shared with other pages are
   copied, since a client module here may not import `/start`'s deck, and `contact-copy.test.ts`
   keeps each copy equal to its source. Two flags in `lib/site.ts` gate the promises the owner has
   not confirmed: `contactReplies` (OD2: "We only use your email to reply.", the reply line on the
   sent card, the answers band's last line) and `calConfirms` (OD7: "Cal.com emails you the
   details."). Until then each fallback removes the claim rather than rewording it. The claims
   register gains seven rows (OD13).

10. **Privacy.** `/privacy` gains a section, `#contact`, "A message from the contact page": what is
    kept, why (legitimate interests), where it goes (one email; the site stores nothing and
    sends nothing back), how long (while it is needed), that the calendar loads only when
    opened, and what opening it lets Cal.com do: set three cookies of its own for security and
    sign-in, none for tracking, and send its own error reports (the live checks under 7). The
    processors list now says Resend also carries the owner's notices, which it always did,
    Cal.com's row says it shows the calendar as well as taking a booking, and the list gains "Our
    email provider" until the owner names it. The rights paragraph's
    null branch routes to the contact page. The page's canonical, inherited from `/` until now,
    is `/privacy`. The wording stands on OD6's defaults.

11. **Tests, and no spec ever sends** (TL-3, TL-5). `e2e/helpers/contact.ts` refuses every
    request to `/contact` or `/start` but a GET on the context, answers a send in the browser as
    the Server Action replies, holds one for the sending state, drops one for the network
    failure, and stands a loader in for Cal.com's that plays the page's queues and fires the
    window events the real one fires, with every other Cal.com request refused. Six specs:
    `contact.spec.ts` (desktop: the first screen, no Cal.com request before a press, the sheet
    and its three ways out, a booking said in the sheet and the call card, a modified click, the
    checks, the sent card and both ways back, the refusals, a failed send from the keyboard, the
    header's ask filling over the sent card and unfilling after it), `a11y-contact.spec.ts`
    (desktop, phone and tablet: axe on every
    state of the form, the open sheet and the open menu, and every control's focus in forced
    colours), `mobile-contact.spec.ts` (390 x 844, 360 x 640, and the menu's foot at 700 x 900),
    `tablet-contact.spec.ts` (768 x 1024 and 820 x 1180), `reduced-motion-contact.spec.ts` (no
    ink chunk fetched, and no translate, scale, rotate, transform or clip-path in any animation,
    sampled every frame through a send and the sheet) and `no-script-contact.spec.ts`. The spec's
    pixel-contrast screenshots are dropped: every small text sits on an opaque surface, so the
    axe scans cover it. axe compares an element's own colour with the ground under it and does not
    apply the element's blend, so the H1's `#f0f0f0`, which the difference blend paints `#0f0f0f`
    on white, reads 1.13:1 once the ink has withdrawn; with the ink on screen, axe cannot read
    the ground and leaves the H1 for a person, as it does the home page's hero (ADR 0032). The
    scans of states reached with the focus in the form therefore move the focus out first, which
    brings the ink back as a visitor's own click elsewhere does. No axe rule is switched off.

12. **Budgets**, measured after `next build` on 27 September 2026. `/contact`: scripts 207,887 B
    gzipped (the header-and-footer floor of 179,659 B, the page's chunk of 19,377 B, and
    tailwind-merge, 8,654 B, which `buttonStyles` needs on any page with a client button, as `/`
    and `/start` already carry); stylesheets 19,954 B across the shared sheet and its own (3,440
    B); HTML 10,509 B. Each line is the measure plus the 70 B margin, rounded up to the next 500:
    208,000, 20,500 and 11,000 B. `GUARDS['/contact']` keeps GSAP, Lenis, the ink simulation,
    ScrollTrigger and zod out of its initial scripts. Cal.com's loader, about 22.7 KB gzipped,
    is fetched only on a press and is in none of it. `/` measures 217,004 B of scripts (216,767
    before the contact change, under its 218,000 line), 16,514 B of stylesheet (16,517 before:
    3 B smaller, well inside the proof's +100 B, and no new utility, as a scan of the change's
    files against the shared sheet also shows) and 35,718 B of HTML (35,651 before: the footer's
    link and the menu's foot). No `/` line moves. `/start` measures 253,166 B (253,119 before).
    `lighthouserc.json` collects `/contact` too. After the review's fixes the same day, `/contact`
    measures 208,018 B of scripts, so its line moves to 208,500 B by the same rule (208,088 B
    rounded up); its sheets measure 20,053 B and its HTML 10,505 B, inside their lines. `/`
    measures 217,008 B of scripts, 16,514 B of stylesheet and 35,716 B of HTML, and `/start`
    253,170 B, all inside their lines. The lab LCP line in `lighthouserc.json` is unchanged and
    was not re-measured after the fix. On phones the largest paint is now the first paint
    (decision 8); the review's A/B put the rest of the lab figure, about 3.1 s against the 2.0 s
    line, down to Lighthouse's estimate counting the page's lazy chunks, which `/` shows too.
    Once the page mounts the home page's choreography (OD9), its leaf takes `/contact`'s scripts
    to 208,419 B, inside the 208,500 B line (208,489 B with the margin); GSAP and ScrollTrigger
    stay out of the initial scripts, and `/` measures 216,975 B.

## Owner decisions

The build runs on the default in each row until the owner decides.

| #    | Decision                                                                                                                                        | The build's default                                                                                                                                                        |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OD1  | The H1's words                                                                                                                                  | "Ask first, decide _later_."                                                                                                                                               |
| OD2  | Every message is answered by email (unlocks the reply lines, `SITE.contactReplies`)                                                             | Unconfirmed: no reply claim. Gates launch                                                                                                                                  |
| OD3  | The WebGL ink on a page with a form, and the H1's contrast dip where ink passes behind it                                                       | Ink on, withdrawn while writing. Refused, one line goes (`<Ink/>`) and the ramp stands alone                                                                               |
| OD4  | WCAG 2.2.2: the wander while the visitor reads, as ADR 0031 and 0032 accepted for the home page                                                 | Accepted pending the owner's written OK                                                                                                                                    |
| OD5  | The italic placements: "later", and "Off it goes." on the covering ink only                                                                     | Both                                                                                                                                                                       |
| OD6  | Privacy: the lawful basis, the retention wording, the email provider's name, the Cal.com cookie line, and Resend's retention of message content | Legitimate interests; criteria, not a period; "Our email provider"; the calendar and cookie lines as written (the cookie line added in review, for sign-off). Gates launch |
| OD7  | Cal.com in the page; its Appearance colour set to `#0369a1` on Cal.com; its confirmation email (`SITE.calConfirms`)                             | The sheet in the light theme, the note hidden. Gates launch; if refused, the link-out alone (cut C1)                                                                       |
| OD8  | The Contact link in the footer and the phone menu, not the desktop row                                                                          | As built                                                                                                                                                                   |
| OD9  | The footer's liquid lip on `/contact` (it needs the page choreography, about 45 KB on first scroll)                                             | Decided by the owner: on. The pool and the lip spring as on the home page, and the footer's wordmark rises                                                                 |
| OD10 | Five messages an hour per address and five a day per person, retries counting                                                                   | As built                                                                                                                                                                   |
| OD11 | At least one character, at most 2,000; the meter in the last 200                                                                                | As built                                                                                                                                                                   |
| OD12 | Send reuses `id="hero-cta"` so the header's ask waits                                                                                           | As built                                                                                                                                                                   |
| OD13 | The seven claims-register rows                                                                                                                  | Added; the gated rows stay gated                                                                                                                                           |
| OD14 | `OWNER_EMAIL` is the owner's own inbox, read by the owner (backs "the person who runs the studio")                                              | Assumed true                                                                                                                                                               |
| OD15 | The field puffs and a send burst through the H1, which need an edit to `lib/motion/fluid.ts`                                                    | Not built                                                                                                                                                                  |

## Consequences

- A future hero refactor must know three copies: Send's `id="hero-cta"`, the ramp in
  `.contact-ground`, and the dark scope in `.contact-ink`. The last two fail
  `contact-tokens.test.ts` until `contact.css` follows the hero, which is the intent.
- Without `:has()` (Firefox before 121, Safari before 15.4) the ink does not withdraw while the
  visitor writes. The canvas still simulates while hidden, at the hero's GPU cost; a `paused`
  option in `fluid.ts` could stop its frames, and is not in this build (OD15).
- Once opened, Cal.com's loader polls the page's colour scheme every 50 ms for the rest of the
  visit, the sheet closed or not. Harmless, and Cal.com's.
- Without an idempotency key, a send whose email outlives the server's 15 s deadline and lands
  can be followed by the visitor's retry, and the owner gets the message twice. `contact.failed`
  with the reason `deadline` in the logs shows how often the deadline is reached. The page's own
  20 s timeout now catches only an answer lost on the way back. No `maxDuration` is set on the
  route; the deadline answers well inside the platform's default.
- `next.config.ts` sends `Content-Security-Policy: frame-ancestors 'self'` and
  `X-Frame-Options: SAMEORIGIN` on every path, so no other site can frame the contact form, or
  any page, under its own clicks. The site's own pages may still frame each other.
- `send.ts` still builds its thrown `AppError` from Resend's message (TL-1 keeps it). The
  contact action logs only the error's name; the two Inngest callers let it surface wherever
  Inngest records a thrown error, as before this change.
- The phone menu's sheet can be scrolled sideways by 40 px between 640 and 767 px wide (its
  watermark's bleed under `overflow-y: auto`). It predates this page and shows on the home page
  too; `overflow-x: clip` on `.menu-sheet` would likely fix it. Not changed here.
- Measured on Windows only, for Linux CI's wider setting (about 4 per cent) to confirm: the H1
  at 768, 640 and 390, the caption beside Send from 768 to 1024, the call card's caption column
  from 768 to 1023, the sheet's heading beside its close button at 360 to 390, and the menu's
  foot from 640 to 767.
- If a budget bites, the cuts come in this order, each independent: the sheet (the control stays
  the link-out, and the sheet, the bus and `lib/booking` go), the form parts' stagger, the call
  card's warm-up on sent, the booked line, and the answers band's paced reveal. The ramp, the ink,
  the form, the bloom, the path without JavaScript, the pool and the privacy section never go.
