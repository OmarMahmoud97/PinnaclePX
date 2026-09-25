# The walkthrough docks its words under the phone on a phone

- Status: accepted
- Date: 24 September 2026
- Amends: ADR 0025 (decision 2, the reading line and the beats below `md`; decision 6, the phone's
  zoom and the stage below `md`), ADR 0034 (decision 9, the panel's chrome on a phone and a CSS
  rise inside `#how-it-works` below `md`)
- Amended by: ADR 0037 (decisions 3 and 10, the steps' order, 25 September 2026)
- Keeps: ADR 0025 decisions 1, 3, 4 and 5 whole; ADR 0034 decisions 5, 8 and 12 and constraint 36
  in `app/_components/motion/index.ts`; the walkthrough from `md` up as it was
- Plan: `docs/start-page-redesign-plan.md`, section 18 (package K1)

## Context

The owner, 24 September 2026: "the section where the user scrolls through to see the steps of
the website build and the mobile screen changes as the user scrolls doesnt make sense on mobile
because the user cant see the screen as it scrolls so think of a better way to implement this".

Measured that morning at 390 wide in Chromium with touch: the stuck panel was a white strip the
width of the screen, 458 px tall, 54 per cent of an 844 screen and 69 per cent of a 664 one (an
iPhone in Safari with its bars showing, where most visitors arrive). The reading line sat 16 px
under the panel, so a step fired its stage at the instant its title slid under the panel: the
title of the step being painted was readable for under 11 per cent of its span at 844 and for
none of it at 664, while the next step's words were wholly readable for 89 to 100 per cent of
it. Under 600 px tall the stage was unpinned, and the frame was above the screen for four of the
six stops. The progress line and the caption changed at the stop and the frame followed 0.3 to 3
seconds later, so on a flick the picture contradicted its own label for up to 2.6 seconds.

Two proposals were judged: the steps as a deck of cards under a smaller phone, and each step
docking under the desktop's own card. The dock won on the owner's complaint (the visitor sees
the phone while it changes, at the desktop's size where the screen allows) and took four things
from the deck: a ladder that reaches 0.5, constants in place of a `CONFIG` change while `lib/`
was closed, a walk test, and reading the small viewport.

## Decision

1. **The panel is the desktop's floating card at every width.** White, `--radius-panel`, the
   still cyan halo of `--shadow-panel`; below `md` with `px-2 py-3 gap-2`, from `md` with the
   same padding, gap, radius and shadow as before. The edge-to-edge strip and its negative
   margin are gone, docked or not.
2. **Below `md` the steps dock under the phone.** The stage and the steps' column sit in one box
   that is `display: contents` from `md`; the button and its bridge line are a grid item of
   their own after it. The fit, in `app/_components/how-it-works-track.tsx`, sets `data-dock` on
   that box, `--walk-zoom` on the stage and `--walk-dock` on the list, and picks the largest zoom
   on the ladder 1.5, 1.25, 1, 0.8, 0.65 and 0.5 at which the stage's top (4.5rem, 16 px under
   the header's island), the panel, the reading line's gap (`CONFIG.walkthrough.anchorGapPx`),
   the longest step and 12 px of air end within `document.documentElement.clientHeight`, the
   small viewport, which a phone's sliding toolbar never changes. The air is the words' rise, so
   a rising body never dips under the fold. Where nothing fits the dock is off.
3. **One step shows at a time, and it moves with the thumb.** `app/_styles/how-it-works.css`:
   the stage is sticky and its bottom padding is the slot; each step is sticky at the dock at
   opacity 0, and the current one (`data-current`, set by the track as before) shows. The
   outgoing step fades over 120 ms (`--motion-tap`) while its words drift 0.75rem up going down,
   or down going back; after a 100 ms breath the incoming step fades in over 300 ms
   (`--motion-settle`, `--ease-enter`) as its words rise 0.75rem from the direction of the
   scroll, the body 70 ms (`--motion-stagger`) behind the title. A step current for under 100 ms
   on a flick never starts to show. With no step current the first one shows, so the words are
   there before the phone starts typing. Every 9rem of scroll (`--walk-rest`, 144 px) is one
   stop; the list's `::after` holds the last step through the colour and the build, and the
   stage and that step let go together, because both boxes end at the slot's foot, so the
   button arrives in the clear. The title's colour change (`app/globals.css`) is restated in the
   docked transitions so it survives them. Amended 25 September 2026 (ADR 0037, Release 2): the
   last step is now the send, which the `::after` holds through the finished sketch and the build.
4. **Docked, the reading line is the dock and the beats come from the list's layout.** A docked
   step's own box sits at the dock, so the last one's second stage would never pass the line;
   `stackedBeats` in `app/_components/walkthrough-stops.ts` lays each step below the ones before
   it and gives it one step's height of scroll per stage it paints, and `stageAt` is unchanged.
   From `md`, and below `md` undocked, the line and the beats are as ADR 0025 decision 2 set them.
5. **The phone answers the words.** `Walkthrough.goTo(stage, leadMs)` passes the lead to
   `tweenTo` as a delay; docked, the track asks for 150 ms, and the desktop passes 0. The next
   call kills a glide still waiting out its lead, so on a flick the phone moves once, after the
   thumb settles, in one capped catch-up (`CONFIG.walkthrough.catchUp`). The timeline still has
   no callbacks (ADR 0025 decision 1).
6. **The undocked stage is in the flow.** Under reduced motion, with JavaScript off, when GSAP
   never arrives (`status` is `unavailable`) or where nothing on the ladder fits (text at 200 per
   cent, a very short screen), the stage is static, the card holds the finished sketch at zoom
   1.1, and all five steps read as a plain list. This replaces the short-viewport unpin, which
   covered the same WCAG 1.4.4 and 1.4.10 ground for screens under 600 px only.
7. **The fit follows the text and the screen.** A `ResizeObserver` on every step's title and body
   refits, which is also the mount call and the fonts call; a resize refits only when the width
   or `clientHeight` has changed. A change of zoom rebuilds the timeline, whose build measures
   are taken inside the frame; the build effect's own resize now rebuilds only on a change of
   width, so a height-only resize never snaps a glide. Where docking changes the section's height
   while it is wholly above the viewport and the browser has no scroll anchoring (Safari), the
   fit scrolls by the difference. Amended at review, the same day: a fragment the visitor arrived
   on below the section (`/#real-build`, `/#faq`) is held on its line through the dock until the
   visitor's first input. If the browser had already seated it, the fit puts it back on its line
   before the frame paints, so long as it has drifted no further than
   `CONFIG.walkthrough.dock.arrivalSlackPx` (48 px; further than that, the visitor has scrolled);
   if the browser's own glide to it is still running, the glide is aimed again at where the
   fragment now is. The Safari fallback reads where the section stood before the dock wrote
   anything, and scrolls by the difference instantly, whatever the root's `scroll-behavior`, so
   the correction is never itself a glide.
8. **The numbers are `CONFIG.walkthrough.dock`.** The ladder (`zooms`), the air (`airPx`, 12)
   and the lead (`leadMs`, 150) were built as constants at the top of `how-it-works-track.tsx`
   while `lib/` was closed to the build, and moved into `lib/config.ts` at integration, the same
   day; the 9rem rest and the 0.75rem rise are the sheet's.
9. **The caption is at its recipe's size.** It is no longer built through `cn()`, whose
   tailwind-merge read `text-label` and the caption's colour as one group and dropped the size,
   so it computes at 12 px on 16.8 px lines at every width, 12 px shorter than before.
10. **The fence holds.** No ScrollTrigger, no trigger and no GSAP tween inside `#how-it-works`
    (ADR 0034 decision 8, constraint 36): the sticky is layout the stage already used, and the
    rise is CSS on the steps' children, which the track never measures (it reads the list's box
    and the steps' `offsetHeight`). Within the caps of ADR 0034 decision 12: a 0.75rem rise
    (cap 2.5rem), 120 and 300 ms (cap 900), a 70 ms stagger (cap 80); no width, padding or margin
    is animated, the zoom is set and never animated, and no ancestor of the stage carries a
    transform. Blue is still only the current title's; no border, no new token, no italic. The
    steps, their copy, their order, the progress line and the one `aria-hidden` frame are
    unchanged, and hidden steps are opacity 0, so a screen reader still reads all five in order.
    Amended 25 September 2026 (ADR 0037, Release 2): the steps' copy and order now follow
    `/start`'s questions; the dock, the stops and the progress line are unchanged.

## Consequences

- **The zoom each phone gets**, measured 24 September 2026 on the dev server in Chromium with
  touch, before the progress line's own `cn()` repair lands with `ProgressSteps` (which only
  shortens the card, so only raises a zoom): 390 by 844, 1.5 (216 by 456, dock at 644); 390 by
  740, 1.25 (180 by 380, 568); 390 by 664, 1 (144 by 304, 492); 390 by 553, 0.65 (94 by 198, 386);
  360 by 640, 0.8 (115 by 243, 431); 360 by 720, 1.25; 360 by 800, 1.5; 320 by 640, 0.8; 320 by
  568, 0.65, where the plan's arithmetic had 0.5 before the caption's repair gave the room. The
  card is 556 px tall at 844. The section is 2,032 px at 844 (1,898 undocked), 1,956 at 740, 1,880
  at 664 and 1,774 at 553.
- **The walk** (20 px steps through the section at all nine sizes above): every stop spans 140
  to 160 px, or its own height where a step is taller than 9rem (164 px at 320 wide); the painted
  step's title and body are wholly on screen and clear of the card in every sample; no other
  step shows; the frame never leaves the screen; the button is never covered; `scrollWidth` is
  the width. At 844 the outgoing step is gone within about 120 ms of the stop, the incoming one
  is at 0.31 opacity 114 ms after it, 0.79 at 165 ms and 0.98 at 265 ms, rising from +12 px going
  down and from -12 px going back; three flicks (2,500 px/s down and up, 1,200 px/s down) showed
  two steps over 0.1 opacity in 0 of 139 frames each. The phone's first change lands 166 ms after
  a single stop and 165 ms after the last stop of a flick. The first step is at full opacity 300,
  120 and 10 px before the lock at 844 and 664, and back above the lock its title returns to ink.
- **Growth and resize.** At 390 by 844 a root font of 125 per cent takes the zoom to 1 (the
  docked body ends at 760 of 844), 150 per cent to 0.65 (757), and 200 per cent undocks. A toolbar
  resize from 844 to 740 during a glide takes the zoom to 1.25 with one rebuild; a resize that
  changes nothing rebuilds nothing. Chromium's scroll anchoring holds a visitor reading the FAQ
  within 1 px when the section changes height; with anchoring off the heading would move 85 px,
  and the fallback holds it to 9 px, which come from content outside the section sized by the
  viewport. Arriving from another page on a fragment below the section (`/#real-build` at 390 by
  844), the fragment's top sat at 262, 262 and 287 px in Chromium, WebKit and Firefox once the
  dock had grown the section, 134 and 159 px under its line; after the review's change to
  decision 7 it sits on its line, 128 px, in all three engines.
- **From `md` nothing moves.** At 768 by 1024 and 1440 by 900, against the same page with the
  markup put back as it was, every measured box (the stage, the frame, the five steps, the
  button, the bridge line), the current step and the page height are identical at 8 of 8 scroll
  positions, with the panel's computed padding, gap, radius and shadow unchanged. The caption's
  repair shortens the desktop card by 12 px and moves nothing else.
- **Accessibility.** axe (`wcag2a`, `wcag2aa`, `wcag22aa`) finds no violation at 390 by 844 at the
  top of the page, at the stop 3 dock and at stop 6, and `e2e/a11y.spec.ts` is clean on the
  desktop, mobile and tablet projects. The three undocked states (reduced motion, JavaScript
  off, GSAP's chunk refused) each show no dock, a static card with its radius and halo, the
  finished sketch at zoom 1.1 and all five steps at full opacity.
- **Tests.** `e2e/mobile-walkthrough.spec.ts` walks the section ("the walkthrough docks each step
  whole under the phone"), checks "the walkthrough hands over to its button in the clear" by the
  boxes as well as the hit test (the stage lets taps through), and holds "under reduced motion,
  the walkthrough is a plain list under a still card". `walkthrough-stops.test.ts` pins
  `stackedBeats`: anchors -1, 0, 144, 719 and 720 give stops 0, 1, 2, 5 and 6. The pinned test in
  `e2e/mobile.spec.ts` keeps every line and passes on the dock (the frame at y 116, its foot at
  572, 456 tall, with step 4 current); only its comment changes, to say the frame stays in view
  in its card while each step docks beneath it. `home.spec.ts`, `reduced-motion.spec.ts`,
  `tablet.spec.ts`, `no-script.spec.ts` and `brief.spec.ts`'s call-to-action test are unchanged
  and pass.
- **Bytes.** The stylesheet grows by 207 B gzipped on the dev sheet, minified by lightningcss at
  gzip level 9 (the dock block 212 B against the rule it replaces, with 5 B back from the
  utilities, the stage's dead `top-16` among them); lightningcss splits the two selector lists
  that hold `:has()` into separate rules, which gzip mostly absorbs. The three script files grow
  by about 690 B gzipped (esbuild, minified, against the previous commit), and the HTML by one
  box and one grid item's classes. No chunk is added and
  the lazy guards are untouched. The production measure, and any move of a line, is written
  with the day's other work.
- **Owner decisions carried.** The stillness between stops: for 144 px of scroll only the phone
  moves; if it feels stuck, the lever is `--walk-rest`, and scroll snapping stays refused (ADR
  0034 decision 12). The dock itself over the deck.
- **Left for a later pass.** A phone in landscape gets the `md` layout, whose pinned panel is
  648 px tall against a 390 or 430 px screen. The first step's body says "the sketch beside you",
  where on a phone the sketch is above it.
