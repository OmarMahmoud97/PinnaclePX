# The questionnaire continues the ink

- Status: accepted; amended by ADR 0037. Its first release (24 September 2026) amends decision 21
  (the partial lead, the time-up line, the designs' names, the call in a new tab) and corrects
  decision 23's claim about `lib/motion`; its second (25 September 2026) amends decisions 1 (the
  titles are fixed), 13 (the mark, the look and the colour are radio groups) and 17 (the
  `enterKeyHint` chain, and Enter on question one for a fine pointer); its third, also of 25
  September 2026, supersedes decisions 9 (the chips), 19, 20, 21, 23, 24 and 25 and amends 1, 2,
  11, 15 and 16, each noted below
- Date: 24 September 2026
- Supersedes: ADR 0004's decisions on the page's look (the chrome's hairline bar in decision 7 and
  the frames' arrangement below `lg` in decision 8), and the layout sections of
  `docs/start-page-plan.md` (section 3, the look of the controls in section 4, the question change
  and the tints in section 5)
- Amends: ADR 0004 (its consequence on the Suspense boundary, which is gone), ADR 0034 decision 4
  (the last `ring-brand-deeper` on `/start` moves to `brand-ink`)
- Keeps: ADR 0004's flow, URL, draft and accessibility decisions (1 to 6, decision 7's one way out,
  decision 8's one model and decision 9); ADR 0014 whole; ADR 0034 decisions 2 to 7
- Plan: `docs/start-page-redesign-plan.md`, Part 1 (D1 to D30), with the changes the review made the
  same day

## Context

The owner, 24 September 2026: "now with the same great redesign standards lets redesign and rebuild
the questionaire page to match our new amazing site and branding and colour scheme. also ensure it
looks great in mobile aswell". The same message asked for five fixes to the home page on a phone,
which ADR 0034's amendments of that date, ADR 0031's and ADR 0036 record.

`/start` was still the page of ADR 0004 and its plan: a white question pane beside a grey sketch
pane, a hairline bar holding the progress, a browser frame with corner ticks, and on a phone a
clipped strip of the desktop sketch above the question. At 390 wide the actions row at question five
was 411 px, so the page scrolled sideways, and the ask sat below the first screen. "The same great
redesign standards" are ADR 0034's: the hero's ink carried below it, a wash, cards on the shadow
with no hairline, Mona Sans with three italic phrases, the colour grammar (blue is the product,
glows are light, everything else greyscale), the motion caps, and the header as a floating island.

Four directions were written and three judges scored them (the plan's section 2.1). A, the sketch as
the page's event on the hero's ink, and D, phone first, came out one point apart; A was built, the
only direction every judge scored 9 for belonging, with D's phone mechanics and B's whole phone
grafted onto it. Twelve packages built it the same morning, and a review of the built tree the same
day made the changes marked "at review" below; the plan lists every file the review opened outside
the build's fence.

## Decision

1. **Direction A, grafted.** The sketch sits on the hero's ink with a pool of light behind it, the
   question sits on the wash, and every control is a white card. B's rooms in the visitor's own
   colour are refused because they sit outside the colour grammar; C's sticky board on a phone is
   the pinned panel over copy the owner rejected in the walkthrough the same day. Amended 25
   September 2026 (ADR 0037, Release 3): from `lg` the hero's ramp runs under both panes, so the
   question stands in the hero's light and the draft on its dark band; the card is white from
   `sm`, its fields wells of the wash; and from the colour question the visitor's colour re-hues
   the dark band, never a room.
2. **Below `lg` the sketch is the whole phone.** `BriefSketch` shows `PhoneSketch` at every width
   and the browser frame from `lg` only. Below `lg` the phone stands in the flow at CSS zoom 0.7
   (101 by 213 px) beside the brief as a list, and the region is 309 px against the 320 px
   `e2e/brief.spec.ts` allows; no crop, no fade and no growth by stage. At review: on a screen under
   760 px tall, which is Safari's 664 px on the common iPhones with its bars showing, the phone
   drops to half size (72 by 152) and the region to 228 px, so every question's first control shows
   above the ask on arrival (`app/_styles/start.css`). Amended 25 September 2026 (ADR 0037,
   Release 3): `BriefSketch` is deleted. Below 36rem the live draft's phone frame is a window onto
   its page at the page's own size, 212 px tall under a "Live draft" bar; from 36rem to `lg` the
   region shows a 300 px crop of the desk's page; under 47.5rem tall either crop is 150 px.
3. **One region, one sketch, one list.** "Your brief so far" is one section holding one
   `BriefSketch`, with both frames in the DOM at every width, and one `SketchChips`. Two regions of
   one name would put the empty brief's sentence in the DOM twice.
4. **The dark scope sits on the ground layer and the caption block, never on the section.** The
   model's `--sketch-*` variables are declared on the section, and the light style's resolve
   `var(--surface)` where they are declared, so a scope on the section or above it would paint every
   light sketch dark. An `aria-hidden` ground layer carries `data-theme="dark"` and paints the ink;
   the caption and the chips sit in a second scoped block; the board sits between them, outside
   both. The rule is written at the top of `start.css` and beside `style={model.vars}`.
5. **`main` comes first in the DOM and the region second.** Below `lg` the grid's order puts the
   region first on screen; from `lg` `main` is the left pane. A screen reader hears the question,
   its control and the actions before the sketch's sentence. The skeleton keeps the same order.
6. **The skeleton renders the real sketch.** `app/start/_components/sketch-pane.tsx`, a server
   component, draws the region from a model, and the flow and the skeleton both render it, the
   skeleton from the blank answers at stage 1, so a visitor without JavaScript sees the picture and
   the skip link finds `#main` before hydration. At review: the skeleton's placeholder bars are the
   wash's deeper stop, a tint of the ground rather than the white of a control, and are hidden
   without JavaScript, where the `noscript` sentence stands alone; and `app/start/page.tsx` has no
   Suspense boundary, because the flow's server render is the skeleton and nothing suspends, while
   React streamed the finished boundary, larger than 12,800 B, a second time as a hidden copy (ADR
   0004, amended).
7. **The chrome is the shared island, solid and dark from the server.** `HeaderChrome` takes
   `island` and `overDark`, rendered as `data-solid`, `data-island` and `data-over-dark` in the
   server's HTML, so the first paint is the dark island with a normal blend, and the scroll never
   dissolves it. The band observer holds a server `data-over-dark` until its first report, and a
   `MutationObserver` rebuilds it when a `data-theme` changes after load, so the done state's dark
   ground is seen. The bar never blends on `/start`.
8. **From `lg` the island straddles the seam.** The pill is centred and touches both panes, the one
   object on both grounds. A shot of it docked left over the wash was taken for the owner (owner
   assumption 2).
9. **Progress lives in the island only.** "Question N of 5" sits in the island's polite live region
   at every width, heard on a phone for the first time, and the copy inside the form goes.
   `ProgressSteps` gains `segmentsClassName` (the island hides its five bars below `sm`) and stops
   passing `captionStyles` through `cn()`, which had dropped `text-label`. At review: its words are
   one string, so one text node, because WebKit set a lone digit in proportional figures and the
   island, measured once, was too short from question two; and at the done state the island says
   "Brief received" over five lit segments, said once; the done pane carries no eyebrow of its own.
   Superseded in part 25 September 2026 (ADR 0037, Release 3): the chips beside the sketch retire,
   leaving the sentence a screen reader hears, and the draft's tags are the visible progress
   beside the island, which gains the home page's dot sliding along its segments.
10. **One way out.** The exit is one link named "Back to site": below `md` an X in a 40 px ring, the
    hamburger's, and from `md` the words in the header's link style, `headerLink`, which at review
    moved to `app/_components/header-link.ts`, a module with no imports, so `/start` stops shipping
    `SiteHeader` and the phone menu. The exit never shrinks.
11. **Controls are white cards on the wash, focused by an outline.** A field is a 48 px white card
    on `--shadow-card` with no border, its placeholder at full `--on-surface-muted`, a `brand-ink`
    caret, and focus as the site's authored outline, 2 px `brand-ink` at a 2 px offset, because
    forced colours drop a box-shadow ring. Every card control takes a border under forced colours
    only; at review buttons also keep a 2 px outline there (`components/ui/button.tsx`, one token).
    Amended 25 September 2026 (ADR 0037, Release 3): from `sm` the controls sit in one white card
    and each field is a well of the wash with a soft inset edge, no hairline; below `sm` the card
    is flat and the wells are white on the wash. The owner re-signs the judgement below against
    the inset edge.
12. **Errors keep a red mark, not red text.** A message is `--on-surface` text led by a
    `CircleAlert` icon in `--danger`, and the invalid control takes a 2 px `--danger` ring:
    `--danger` is 3.76:1 on white and 3.17:1 on the wash, under 4.5 as text and over 3 as a mark. No
    new token (owner assumption 6). At review: a failed Next moves focus to the first control still
    marked invalid, which reads its message, and scrolls the message clear of the ask; question
    four, with no control that carries `aria-invalid`, speaks its message as an alert.
13. **Choice cards are shorter.** Rounded, white, at least 64 px tall; selected is a 2 px
    `brand-ink` ring plus the check, two cues, never colour alone. At review: question four's cards
    sit two to a row only once the question's column is 30rem wide (a container query), because the
    column, not the screen, decides whether a card's words break; and every card group follows the
    radio group's keyboard pattern, one Tab stop on the chosen card or the first, the arrows moving
    the choice. Amended 25 September 2026 (ADR 0037, Release 2): the mark ("Use my name" or "Use
    my logo"), the look and the colour are radio groups; "My own colour" is the fifth colour card
    and shows the hex field after the group without moving the focus, "Your logo's colour" comes
    sixth when the logo has a colour of its own, and with a fine pointer the digits choose a look
    or a colour.
14. **No rule anywhere in the form.** The two dividers lose their hairlines and become caption lines
    with air; swatches and photo thumbnails lose their borders for a rounded shadow.
15. **Back is a text button.** A native `button type="button"` named "Back", styled as a text link
    with an arrow, at least 40 px tall (48 from `lg`), hidden at question one. Never the ghost
    variant, whose hover draws a hairline. Amended 25 September 2026 (ADR 0037, Release 3): below
    `lg` Back is a 48 px round icon button named "Back", beside the ask and under it below 22.5rem
    wide; from `lg` it keeps the text button.
16. **The ask is in reach.** Below `lg` the ask, Next and its reassurance, rides sticky at the foot
    of the screen over a fade of the wash and settles into its place at the end of the question. At
    review: it rides only on a screen at least 30rem tall, because on a landscape phone or a desktop
    at 400 per cent a stuck ask would leave a slit under the island (WCAG 1.4.10); from `lg`, Back
    and the ask ride the same way at the foot of a desk window shorter than the question, with
    margins matching `main`'s gutter; and while either rides, the pane lifts a control focused from
    the keyboard whole, by the box that draws its ring, because browsers scroll only a text field's
    caret line into view. Amended 25 September 2026 (ADR 0037, Release 3): Back's round button
    rides beside the ask; and at ready the first design's link is the phone's primary, in a well
    fixed to the foot of a screen at least 30rem tall, under the ask's rules.
17. **Question one's field is a card.** The textarea sits in a white card with its counter at the
    foot, the card focused by `focus-within`, three rows at every width. The textarea takes no
    `enterKeyHint`, since Enter is a newline there; the inputs take "next" on name and company and
    "go" on email and the hex field. Amended 25 September 2026 (ADR 0037, Release 2): the counter
    is a meter, its words in the textarea's description; with a fine pointer Enter there is Next,
    and Shift and Enter a new line; the business name and the email take "next", your name "send"
    and the hex field "done", where Enter checks the code and never sends.
18. **Small accessibility repairs in the steps.** The photo thumbnail's "failed" tag is dark text on
    a white band led by a red dot. At review: question three's error and its status line share one
    polite region, so each is heard once, and question five's hex placeholder is the chosen
    palette's code, its picker white rather than black while no colour reads.
19. **The reward at question five is the pool.** Behind the frames a registered colour,
    `--start-pool`, is the cyan `--backlight` at rest, the visitor's colour at 55 per cent once the
    model is coloured and 75 per cent once the brief is sent, following every hover, focus and tap
    on a palette. Its colour keeps its timing under reduced motion by an explicit rule, because the
    global allowlist names only built-in colour properties. At review: it eases over
    `--motion-reveal`, 600 ms, the breath's own clock, and below `lg` it falls away on a smoothstep
    curve from the phone's edge, because a straight fall-off read as the rim of a disc. Superseded
    25 September 2026 (ADR 0037, Release 3): the pool is the lamp, the region's only ambient light
    at every question. It walks the studio's cyan and indigo, then the visitor's colour from the
    colour question, brightens with each answer, swells once per answer, and sits at or under 0.2
    alpha behind any text; a grey colour keeps the studio's light.
20. **The pooled curve on `/start` is the static segment.** Below `lg` the region ends in the home
    page's circle segment, copied from `app/page.tsx` with a comment naming the source, with its own
    `data-theme="dark"`. No GSAP and no spring on `/start`. Superseded 25 September 2026 (ADR
    0037, Release 3): the curve springs on each Next and Back (`lib/motion/start-curve.ts`, a
    0.25 kick at 1 Hz and damping 0.2, capped at 0.3, asleep after 2.5 s) under the pool's recorded
    exemption, and never under reduced motion. Still no GSAP.
21. **The done state turns the page to the ink.** Once the brief is sent, `main` takes
    `data-theme="dark"` and the ink ground over a 300 ms crossfade, so the whole page is the foot at
    every width, and the call, the one filled button, sits above the countdown. At review: below
    `lg` the region drops its curve and `main` its clearance for it, the address breaks before its
    slug, and a polite status line, empty until the status changes, says each change once. At the
    polish the same day: the pane loses its "Brief received" eyebrow and its own "Back to site"
    link at every width, because the island says both and its exit is always in view; from `sm` the
    countdown sits beside the slots at every width, 128 px from `lg` (a `besideSlots` prop, off by
    default, so the preview route keeps the large ring); and the pane is one screen tall from `lg`,
    so the slots end inside the first screen on laptops (680 to 696 px at 1024 by 768, 706 to 722
    at 1280 by 800, 598 to 630 at 1366 by 657, 699 to 741 at 1440 by 900; axe clean in all 56 done
    states). The sentence under the heading follows each result: ready says the designs are built
    and the links are below and in the email; partial says they are built and to keep the page's
    link, because a partial page sends no email. Amended 24 September 2026 (ADR 0037, decisions
    10 and 12): a partial build is emailed too, so partial reads as ready with a note of what was
    set simply; while building, the sentence says the email follows once the designs are done, and
    the time-up line promises no email; the slots name each design by its place and a descriptor,
    never a code name; the call and the designs open in new tabs. Superseded 25 September 2026
    (ADR 0037, Release 3): the send blooms ink from the ask; while the designs build the draft
    splits into three posters that fill as the stages land, beside a stage ring, a log stamped by
    the server and "Usually done by"; ready rises to light in 600 ms; the call is secondary until a
    design has been opened and the visitor comes back. The countdown is gone.
22. **One hue.** The countdown's fill and ready check, the chips' checks
    and the building dot are `brand-ink`; no green on `/start` or on the preview's pending ring.
23. **Motion is CSS only.** Next keeps `question-in` from the right; Back enters from the left
    (`question-back` in `start.css`), the direction read from the change of question, so the
    browser's own Back does the same. Both fade only under reduced motion. `/start` imports nothing
    from `lib/motion` and carries no `data-reveal`, so the four lazy guards and the caps are
    untouched. Corrected 24 September 2026 (ADR 0037, decision 17): `/start` has imported
    `scrollToTop` from `lib/motion/lenis.ts` since 5 September 2026, through
    `use-focus-on-mount.ts`; the Lenis library itself stays a lazy chunk. Superseded 25 September
    2026 (ADR 0037, Release 3): a question moves at a scoped pace of 1.5 (900 ms), its lead rising
    2rem and its controls 0.5rem on a `linear()` spring, after a 200 ms exit that keeps the focus;
    `question-in` is opacity only. Still CSS but for the curve's spring, and nothing loops.
24. **No fourth italic, no numeral, no thread.** ADR 0034 decision 3 stands. Superseded 25
    September 2026 (ADR 0037, Release 3): each question's title carries one fixed italic payoff
    word, and the draft at most two italic notes (ADR 0034 decision 3, amended); numerals appear
    only as the draft's tags; still no thread.
25. **The dark style stays separate on the ink.** Under "Dark and moody" the pool and the frame's
    own edge lift the sketch off the foot; no border is added. Superseded 25 September 2026 (ADR
    0037, Release 3): the draft follows `schemeFor(style, polarity)` as the templates do, so the
    dark style draws its page on the colour engine's hue-tinted dark surface, lit by the lamp;
    still no border.
26. **Tests landed first.** The Playwright projects pick up every spec by its prefix, and the
    `/start` axe scans and the reduced-motion guard landed before any control changed.
27. **Dead parts went with their consumers.** `components/ui/corner-ticks.tsx` is deleted, and
    `BriefSketch` lost its unused props.
28. **The build's fences.** Every rule went into a section sheet, and `app/globals.css` took two
    lines: the `start.css` import, and `@source not '../docs';`, the director's first change, so
    documents no longer feed the stylesheet and the byte credit for a removal is real. The numbers
    went into `lib/config.ts` rather than staying constants in components, the director's second
    change: `CONFIG.motion.headerStepMs` (300) and `CONFIG.walkthrough.dock`. The review then opened
    a few more files outside the fence, each listed in the plan after its section 3.
29. **Bytes moved on the record, once.** The stylesheet line held at 19,000 B; the `/start` scripts
    line moved by the ADR 0034 rule (the consequences below).
30. **The five home fixes were built as decided**, and are recorded in ADR 0034's amendments of 24
    September 2026, ADR 0031's amendment of that date and ADR 0036.

## Consequences

- **A judgement made by hand.** Against the wash a field's boundary is 1.18:1. So the control is
  known by its label, its fill, its shadow and its placeholder (7.58:1 on white), the judgement ADR
  0031's amendment records for the hero's pill; axe tests neither, so this record makes it. In the
  words of `components/ui/field.tsx`: a field is "a white card floating on the wash, the way the
  hero's prompt box floats on the ink: no border, the card's shadow for its edge, and a placeholder
  at the full muted colour", known "by its label, its fill, its shadow and its placeholder".
- **The island's segments are decorative.** The unreached ones are 1.41:1 on the dark glass over the
  wash and 1.29:1 over the foot; the words in the same live region carry the meaning. The reached
  ones are `--brand` at 4.94:1 on the dark glass over the wash and 7.18:1 on the foot, and
  `brand-ink` at 5.78:1 on the light glass.
- **Contrast** (culori, 24 September 2026): the island's words 11.60:1 on the dark glass over the
  wash, 16.88:1 over the foot and 17.40:1 on the light glass, its progress line 7.08:1, 10.31:1 and
  7.38:1; the caption over the pool at its weakest, the done state's share, 8.99:1 under Plum and
  9.07:1 under Clay at 1440; a pending chip's words 9.29:1 on their own faint fill over the foot,
  and at least 7.39:1 over the Plum pool at question five at 390 (the brightest pixel under the
  chip); a given chip's words 14.89:1 on the card, with its `--brand` tick at 6.34:1.
- **Measured on the finished tree** (package R, the dev server, Chromium, 24 September 2026). At 390
  by 844 the region is 309 px and the `h1` at y 387, in the first screen; the call at the done state
  sits at 575 to 623 while building and 627 to 675 when ready. At 390 by 664 the region is 228 px
  and the `h1` at 307, question one's, three's, four's and five's first controls start 48, 46, 83
  and 83 px above the ask's fade and question two's name field wholly above it, and the call sits at
  494 to 542 and 546 to 594. At 320 by 640 and 375 by 553 question one's box still starts under the
  ask, 72 and 61 px down. At 1440 by 900 the document is 900 px tall at every question
  (`e2e/brief-shell.spec.ts`); at 1366 by 657 the ask is on screen at every question, riding at the
  foot where it would have been 19, 117 and 42 px below the fold at questions two, four and five
  (`e2e/brief-ask.spec.ts`). Hydration moves the region, both frames and the island's row by under
  1.5 px at 390 and 1440.
- **Accessibility.** axe (`wcag2a`, `wcag2aa`, `wcag22aa`) finds no violation on `/start` at
  question one, question two with its three errors, question four and question five with a broken
  hex (`e2e/a11y-start.spec.ts`, desktop, mobile and tablet), on the done pane in all seven of its
  states (building, building with names, time up, ready, partial, failed, exhausted) at 320, 390 and
  1440, 21 cases with no sideways scroll (package R on the finished tree), and on the header at 320,
  390, 768 and 1440 at the top, over the wash and in the done state. On the finished tree the full
  Playwright suite passes in all five projects against the dev server (112 passed, and one skipped:
  the submit test, which needs `E2E_SUBMIT=1`), as do the typecheck, lint, prettier, knip and the
  554 unit tests.
- **Bytes** (`pnpm build && pnpm budget` on a clean copy of the finished tree, Windows, 24 September
  2026). The shared stylesheet is 17,298 B against the unmoved 19,000 line: `@source not '../docs'`
  took 3,132 B of utilities only a document named out of 15d7721's sheet, the day's rules added
  1,647 B on the same basis, and next/font's faces now ride the same file (with docs read it would
  be about 20,700 B, over a 20,500 line). `/start`'s scripts are 246,101 B against 15d7721's 243,073
  B (not the 240,946 B ADR 0034 recorded, which predates the header's commit), so the line moves
  from 245,000 to 246,500 B, the measure plus the 70 B margin rounded up to the next 500:
  `HeaderChrome` and its island join the route, with the X icon, the direction flag and the review's
  focus moves, status line and radio-group keys, once `headerLink` stopped pulling the phone menu
  in. `/start`'s HTML is 5,962 B against 25,000, 4,583 B at 15d7721: the skeleton's real sketch and
  the island, once, now the Suspense boundary no longer streams it twice. `/`'s line moves in ADR
  0034's byte paragraph of the same date. The four lazy guards are ok.
- **Owner assumptions**, each reversible where the plan's section 24 says: the ink carried onto
  `/start` rather than a room per question in the visitor's colour; the island straddling the seam
  at `lg`, with the docked-left shot for comparison; the whole page turning to the ink after the
  send, at every width; the call above the countdown; no green, ready being its word, its check and
  its full ring in blue; error messages as dark text beside a red icon with a red ring, a darker red
  token waiting for a pass on the globals file; no italic on `/start`, one phrase on the done
  heading on offer; no step thread and no big numeral; the ask full width at the foot below `lg`;
  question one at three lines; the whole phone at 0.7 below `lg`, half size on a screen under 760
  tall; the pool taking the default palette's colour on arriving at question five; Next from the
  right and Back from the left; the progress line and the walkthrough's caption at the caption's 12
  px; the form's dividers as quiet caption lines; blue ticks; the stylesheet line held by the docs
  exclusion; `/privacy` keeping its old bar for now; Back and the ask riding at the foot of a short
  desk window; and ink showing past both ends of the page on Safari's rubber band, so a pull past a
  question's foot shows ink under the wash, which the owner is to check by hand on an iPhone.
- **Left for a later pass**, as the plan's section 23 lists: `--danger-ink`, the `question-in`
  retune and the other globals items; one pooled-curve component shared with the home page;
  `/privacy`'s island; the logo strip's WCAG 2.2.2 failure, which predates this build and is the
  owner's call; and the home island under text spacing at 320.
