# The Work switch reshapes one device

- Status: accepted, built 27 September 2026; the six owner decisions at the end hold their
  defaults until the owner has checked them
- Date: 27 September 2026
- Amends: ADR 0034 decision 7 (the caps, the redesign plan's D12: the switch is its own
  component motion, outside them) and its amendment 4 (the rail's height now follows a switch);
  the Work tile's rest layout from `docs/home-page-redesign-plan.md` 7.1 (the device sits under
  the pill in both views, owner decision 1)
- Keeps: ADR 0005 and ADR 0021 (GSAP and Lenis stay in `lib/motion` and lazy; the switch imports
  neither); the switch working with JavaScript off (the owner, 26 September 2026); ADR 0034's byte
  lines, none of which moves; `docs/standards.md`, unchanged
- Plan: none kept. The implementation spec and the prototype it was written from were working
  files of the build session and are not in the repository; this ADR is the record of what was
  built, with the lead's overrides of 27 September 2026 (the HTML budget, the pace) and the
  review's fixes of the same day

## Context

Each Work tile has a Phone and Desktop switch: two native radios on a segmented track, read by
`:has()`, so it works without script (commit 33af0b6 opened every tile on the desktop capture).
Until now a change swapped two frames, `PhoneFrame` and `BrowserFrame`, with `display` alone: the
tile jumped between two heights and nothing said that the two pictures are one site.

Four concepts were prototyped against the real captures (Shapeshift, Turntable, Ink and Rebuild)
and judged through three lenses, a creative director's, an engineer's and an accessibility
reviewer's. Shapeshift scored 24.5 of 30, every judge ranked it first and none found a blocker.
It is the only concept whose motion makes the studio's argument, one site on every screen: there
is one device, and it reshapes. The chosen build takes grafts from the other three and cuts what
the judges flagged (the spec's section 0).

## Decision

1. **One device, two rest states, from the radios alone.** `app/_components/work-device.tsx`
   renders one device per tile: a stage, the device, its chrome (three dots, a tab with the lock
   and the address) and the two capture layers, `[data-frame="browser"]` and
   `[data-frame="phone"]`, which is where those attributes now live, so the e2e locators keep
   their meaning (at rest exactly one layer is displayed). `app/_styles/work.css` draws the
   desktop state and, from the checked Phone radio or a `data-hold` attribute, the phone state:
   192 px wide (224 from `lg`), a 20 px radius, a 4 px scrim ring, the chrome folded to 16 px
   and the tab shrunk to the 32 by 4 px speaker. The colours are five registered numbers
   (`--work-lift`, `--work-ring`, `--work-fold`, `--work-island`, `--work-speaker`, each
   `inherits: false`) at 0 or 1, so CSS owns every colour and a write restyles one element. Every
   read falls back to 0, the desktop state, so a browser without `@property` (Safari 16.2 and
   16.3 have the path clip and colour mixing but not it) still draws both rest states, and a
   flight there writes the same numbers unregistered.
   `BrowserFrame` and `PhoneFrame` stay as they are for `/start` and the sketch.

2. **The motion, beat by beat.** One number, p, runs from 0 (desktop) to 1 (phone). The thumb
   of the pill stretches across both words on a stiff leading edge and a soft trailing one,
   thinning by up to 1.75 px, and each word turns dark exactly under it. The address fades, the
   tab narrows into a near-black island and the three dots slide into it, the nearest first; the
   address and the island leave early in their beats and land flat either way (a plain ease-out
   came back to desktop at speed, and the address, still scaling and so drawn soft, snapped crisp
   at the hand-back). The window narrows about the desktop capture, which keeps its width, so
   both bezels close in on the page like a resized viewport, while a brand-blue readout counts
   1440px down to 390px and is gone by p 0.88, before the phone page it sits on settles.
   The phone capture pours in from under the bar behind a lit liquid front (a cubic whose middle
   sags with the front's speed and leans toward the pressed pill), pushing the dimming desktop
   page out through the bottom bezel; the bar folds, the island flattens into the speaker, the
   device grows tall, and as it passes 0.8 of its way one light runs round its edge from the
   pressed pill's side and the pool behind it blooms. Phone to desktop is the exact time mirror.
   Nothing crossfades: every pixel in flight is the old page, the new page, the bezel or the lit
   edge. The old page tucks up to a pixel (`tuckPx`) under the new one, as far as its foot
   allows: edge to edge, their two anti-aliased edges shared a device pixel as a flat front
   drained, and the device's dark ground showed through as a hairline (2 of 561 seeked frames).
   At pace 1 the device crosses p 0.5 at 400 ms and is at rest at 1,054 ms, and the beat ends at
   about 1.46 s; the ranges are `CONFIG.motion.work.beats`.

3. **The drive is a two-spring chain, not a tween.** A motor pulled by the checked radio (1.5 Hz,
   critically damped) pulls the device (1.2 Hz, ζ 0.8), so it leaves with no jolt and lands
   soft. A change of mind, by click, tap or arrow key, re-grips the motor where the device is,
   with no speed of its own, so only the device's momentum carries on before it turns and
   retraces the same path: every drawn value but the tile's height (decision 9) is a pure
   function of p, the device's speed and the meniscus's lean. The springs are integrated by
   semi-implicit Euler in fixed 1/240 s sub-steps, as `lib/motion/chain.ts` does, so 60 and 120
   Hz draw the same flight, and each frame is drawn from the flight sampled at the frame's own
   time, one partial step past the last whole one (`sampleAt`). The sample is never kept, so the
   stored flight still replays exactly from its events, and the landing beat and every hand-back
   are decided on it. Drawn from the whole sub-steps alone, a frame was up to 4.17 ms stale by a
   different amount each frame, and at 90, 144 and 165 Hz the front stepped one and two sub-steps
   a frame in turn all through the pour (7.2 px/frame² at 144 Hz, 1.0 sampled; on the real page
   at 60 Hz one flight in 27 showed 6.25). The physics and the drawing are
   `lib/motion/work-morph.ts` (pure, unit-tested); the DOM is
   `app/_components/work-morph-controller.ts`, one plain `requestAnimationFrame` loop for every
   tile in flight. Rejected: GSAP (a `reverse()` kinked the page, 23.7 px/frame², measured on
   Ink), a WAAPI clock, View Transitions (they snapshot the whole page, fight Lenis and can only be
   skipped, not retargeted), canvas and WebGL (six contexts, and the work hidden from the
   accessibility tree), and CSS transitions on `:has()` (they cannot share a path or push the old
   page on contact).

4. **The flight hands back to CSS in three parts, each by name.** On a change the controller
   measures both states (`data-hold` forces each for one read of computed sizes; the radios are
   never written), holds the old look inline in the same task, so the flipped CSS never paints,
   and waits for the capture it reveals to decode, 180 ms at most (`decodeMs`), so a warmed
   capture never pours in blank and a slow one does not hold the click. The pill hands back once
   both edges of its thumb are within a twentieth of a pixel of the label and still
   (`pill.rest`), after one frame drawn on the label's own edges, so the hand-back changes only
   how the outline is antialiased (the thumb is a clip, the label a rounded background; at 0.3 px
   the edge moved in the same frame and showed as a ring). The device's geometry hands back the
   moment the chain is still, which is where layout work ends; the landing beat's light and
   bloom, paint only, after that, and `data-beat` holds for the whole beat, the bloom's tail
   included, so the pool's own transition stays off while the script writes it. Every inline
   property is removed by name and an emptied `style` attribute goes; the tile's own inline style
   (its reveal delay and view timeline) belongs to React, so the tile only ever loses `height`.
   The captures move by plain 2D translates, painted with the device, and the new page stretches
   by its width, never a scale, so each is drawn in flight as its rest state draws it. On layers
   of their own (`translate3d`, as first specified) they rasterised apart from the rest state, so
   the text shimmered on the landing frame (4,093 of 99,360 screen pixels changed) and the first
   flight on a page dropped a frame making the layers (3 of 6); a scaled capture sometimes kept a
   sharper draw to the end, and its text softened on the frame it landed (3 of 8 landings).

5. **The page's HTML carries only what the rest states need.** The thumb and its dark copy of the
   words, the ink shade, the lit front (an SVG of four strokes of one curve), the size readout and
   the glint are made by the controller, `aria-hidden`, the first time a tile is reached for (a
   pointer, a focus, a press or its idle warm) or changed, and removed when it stops. The dark
   words take their labels' own classes and their text from the labels, as generated content, so
   a text query still finds one "Phone" per tile. The capture layers take no class of their own;
   the chrome's dots are `.work-chrome-dots` (`.work-dots` is already the rail's dot row).

6. **The pace is 1.15.** `CONFIG.motion.work.pace` and `--work-morph-pace` on `#work` are the same
   number; every spring and both beat clocks run that many times slower, so the device is at rest
   at 1.2 s and the beat ends at about 1.68 s. The owner has asked for weightier motion more than
   once; the switch's pace is scoped like `--menu-pace`, never the `--motion-*` clocks.

7. **It loads on intent and never on idle alone.** `app/_components/work-morph.tsx`, the one
   client leaf, holds only the trigger: the controller arrives as a lazy chunk on the first scroll
   intent (`whenScrolled`) or the first pointer, focus or touch inside `#work`, so Lighthouse
   never loads it. A change made before it arrives is the plain CSS swap, complete on its own.
   Intent warms both of a tile's captures, and a tile 60 per cent on screen is warmed on idle, so
   a touch screen's first tap, whose press leads the click by a tenth of a second, and each tile
   the rail brings in, never wait on a decode.

8. **Where nothing may fly, the switch arrives by opacity.** Under reduced motion, forced colours,
   or a browser without `clip-path: path()` or `color-mix()`, the pill is not enhanced (the labels
   keep their colour transition), the old view is held by `data-hold` until the new capture has
   decoded, and then the device rises from opacity 0.25 over 240 ms through WAAPI, which leaves no
   inline style. The media queries are watched, so turning reduced motion on lands any flight at
   once, and turning it off lets every hold go: a hold still waiting on its capture started the
   next flight from the view it hid, and its arrival then faded the device in flight. A flight
   that finds a hold, its media change not yet heard, lets it go and starts from the view it
   showed, or does not fly if that is the goal. Under forced colours the checked pill is the system's Highlight pair, and `.work-seg`
   lifts that rule over the in-flight label rule regardless. With JavaScript off, the radios and
   `:has()` draw both states of the one device. The accessibility tree holds one image per tile at
   rest and both for the second a flight lasts, when both are painted.

9. **The page around it keeps still.** Row-mates never move their devices: each device sits under
   its pill, and a stretched tile's spare room goes above its dated caption (decision 1 of the
   owner decisions below). A flying tile's height is its row's. The controller reads the tile's
   own height in each state and the room its resting row-mates keep, each top-aligned for the one
   read (`data-measure`). Each flight's curve runs between the row's height with the tile at each
   rest state (its own, or what the row keeps at that end, whichever is taller) on the device's
   own height beat, so the row, the row-mates' footers and the page below move on one curve, with
   no kink where the device outgrows room a taller row-mate lent it, and land flat on the room.
   The end a flight leaves keeps the row as it stands as it leaves, which a row-mate in flight may
   hold above the room, less the width of the corner that turns the row's speed onto a still
   height (`leaving`), and never below the room; the end it heads for takes the room as it
   stands, read again whenever a tile of the row starts or stops holding its own height, so a
   change of room moves a curve only as far as the flight has gone toward that end. On the room
   alone, a flight to the phone started 150 ms after its row-mate left the phone for desktop let
   the row fall toward the desktop height before its own rose (790.6 to 573.0 to 769.6 px on the
   production build); held at the row itself, with no corner taken off, a row already falling fast
   undershot it, climbed back and stalled before rising (613 to 581 to 613 px, 450 ms apart),
   where it now turns once. A tile changed again in its landing beat, its device handed back,
   holds its height again from the view its flight landed on, taken from the flight: its radio
   already shows the new view, and a read of the tile took that view's height for the row as it
   stood, so the row leapt 228 px in one frame (562.39 to 790.63 px). Every flying tile of a row
   writes one height (`rowAt` in `lib/motion/work-morph.ts`): the room and the curves, in the
   row's order, taken by a rounded maximum whose corner is as wide as two curves' closing speed
   takes to spend at 2.5 px/frame² (`rowTurnPxS2`), never below either and adding nothing where
   two meet at one speed; plus what the row carries from its last change (a tile starting or
   stopping holding its height, or a flight in it changing its mind), its place and speed as they
   stood before the floor (`rowRaw`), fading out over 240 ms at the pace (`carryMs`); and never
   below the room or a flying tile's own height. Carried on from the row as drawn, a hand-back
   rounded the row against its floor twice, and the tiles drawn after it in that frame stood up to
   0.67 px off those drawn before. A device that has handed back stays handed back until the next
   change: turned back in its first frames, one still inside its rest window drifted out of it on
   its own momentum and took its height again after its row-mates had let it go (they stood up to
   1.7 px apart for a fifth of a second at 120 Hz). So neither of two row-mates switched together
   snaps as the other lands (measured before the room was shared, the second landed 21 px short
   of its row and snapped to it), and the row turns no corner in a frame. This replaced curves
   re-based on the room in their own share whenever it changed, under a plain maximum: two
   row-mates switched back to desktop 250 ms apart jolted the row about 19 px in three frames and
   stopped it dead on the second tile's height, which had not yet left (7.6 to 8.8 px/frame² on
   the real page), and the room falling away under a flight near its goal could plunge its curve
   150 px in a few frames. Over 400 random sequences of two to four clicks on the first row at
   1440, drawn at 60 Hz, the rounded maximum took the row's worst second difference from 151.7 to
   6.9 px/frame² (121 sequences over 3 px/frame² to 64), and from 12.9 to 4.5 where every click
   goes the same way. Measured again with the leaving end, the landed view, the carry from the
   row before its floor and the sticky hand-back, through a mirror of the controller's own row
   logic with the landing beat in it (400 seeded sequences up to 500 ms apart, at pace 1.15): 10.2
   px/frame² at worst and 48 sequences over 3, against 16.3 and 76 before them, the worst of which
   was the landing beat's leap above, and 6.3 and 75 with that leap alone mended; 4.5 where every
   click goes the same way (12 over 3, as before). What stays over 3 is not a turn the row has to
   make: the corner's width follows the closing speed at each moment, so it turns the row at
   `rowTurnPxS2` only while that closing speed holds, and a corner that a changing speed narrows
   inside it turns the row faster. The worst is a flight turned back to desktop after the
   row-mates holding its leaving end up had landed: its curve re-bases 218 px onto the room, the
   carry takes the row down in about 280 ms, and the floor catches it. No frame dips below a
   tile, which the re-based curves did by up to 2 px, and a lone flight moves as it did, to
   within 0.1 px/frame². While any flight lives `<html>` carries `data-work-morph`, which turns
   scroll anchoring off, and the scroll choreography's resize refresh waits
   (`app/_components/motion/index.ts`); the last flight's `work:morph-end` event runs it once, a
   settle later. The attribute and the event are `CONFIG.motion.work.signal`, so the
   choreography's chunk never carries the switch. A resize that changes the width lands every
   flight at once; a phone's address bar, which changes only the height, does not. A page that
   hides lands them too, where their radios say: it draws no frames, and a flight left in it
   replayed every sub-step it had missed on the first frame back (47 ms of them after an hour).

10. **Work's sheet leaves the shared stylesheet.** `app/_styles/work.css` is imported by
    `app/page.tsx` rather than by `app/globals.css`, as `/start`'s sheets are by their route (ADR
    0037, D26), so `/start` never downloads the switch. `/` now links two sheets.

11. **Exceptions to ADR 0034 decision 7, the caps.** The switch is a component's own motion, not
    a scroll entrance, and it breaks three of the caps on the record: a flight of about 1.2 s of
    geometry and 1.68 s of paint against the 900 ms tween; `width` and `height` on the device and
    `height` on the tile, one layout pass a frame and only for the switched tile; and
    `box-shadow`, through `--work-lift` and `--work-ring`, on an element whose size already
    repaints it. No filter is used; the lit edge is SVG strokes, not a drop shadow.

## Consequences

- **Bytes** (`pnpm build && pnpm budget`, Windows, 27 September 2026, against the same tree
  before the change): `/` scripts 217,390 B against 216,767 B (the leaf and `CONFIG.motion.work`),
  stylesheets 18,185 B across two sheets against 16,517 B in one, HTML 34,924 B against 35,651 B
  (the one device is lighter than the two frames it replaces); `/start` scripts 253,577 B against
  253,119 B (`CONFIG` rides every route) and stylesheets 23,748 B against 24,183 B (without
  `work.css`). Every line holds and none moves. With `work.css` still in the shared sheet, `/start`
  measured 25,412 B against its 25,000 B line, which is why decision 10 was taken. The controller
  and the pure module are one lazy chunk, 6,161 B gzipped. After the review's fixes (the same
  day): `/` scripts 217,389 B, stylesheets 18,200 B and HTML 34,924 B, `/start` unchanged, and the
  lazy chunk 6,909 B; after its second round, `/` scripts 217,397 B and HTML 34,923 B, `/start`
  scripts 253,583 B (`tuckPx` rides `CONFIG`), and the lazy chunk 6,935 B; after its third, `/`
  scripts 217,416 B and HTML 34,924 B, `/start` scripts 253,604 B (`rowTurnPxS2` and `carryMs`
  ride `CONFIG`; 396 B under its line), and the lazy chunk 7,342 B (the row's rounded maximum and
  its carry); after its fourth, `/` scripts 217,417 B and HTML 34,925 B, stylesheets and `/start`
  unchanged, and the lazy chunk 7,456 B (the leaving end, the row before its floor and the sticky
  hand-back).
- **Measured on the production build** (Chromium with GPU flags, the second tile, real clicks):
  at 1440 by 900, each way, the worst frame is 16.8 ms and none is over 20 ms; the tile grows at
  most 11.9 px a frame to the phone and 13.7 px back, with a second difference of 2.2 and 1.6
  px/frame²; a change of mind at about 330 ms peaks at 2.9 and 3.4 px/frame² in two runs. The tile
  lands on 769.64 px and back on 562.39 px, the device on 224 by 486.66 and 330.67 by 242.41 px,
  with no inline style and none of the flight's attributes left. On the rail at 390 by 844, touch,
  the rail grows from 567.1 to 728.7 px and back (its tiles from 535.1 to 696.7, over the list's
  32 px foot), `scrollLeft` stays 0 and the page stays 390 wide. After the review's fixes, at DPR 2: no flight of 28 has a second difference of the tile's
  height over 3 px/frame² (2.06 to 2.20 to the phone, 1.56 to 1.63 back); the tallest tiles, the
  third and the sixth (562.39 to 806.64 px), step at most 14.0 px a frame to the phone and 16.2
  back, a hair over the spec's 16 from their longer travel at pace 1.15, with a second difference
  of at most 1.86 px/frame²; the first flight in a fresh browser drops one frame about 60 ms in
  (untraced, 6 of 13 on the rail and 1 of 6 at 1440), while the GPU process compiles the shader
  programs the flight's draws first need (five, in the traced flight), and neither the next pages
  in the same browser (0 of 9) nor a second tile's first flight on the page (0 of 16) drop one,
  so it is once per GPU process, not the first raster of a tile's capture, and nothing a warm of
  the capture could remove; on the frame it lands the screen changes by at most 8 pixels
  (by more than 40 of 255) in six phone landings, the desktop landing, the reverse and both
  rail landings; the pill's hand-off changes 139 to 164 pixels of its outline by at most 75, the
  antialiasing alone. Two row-mates switched together in eight sequences (450 ms apart, either
  order, one in the other's beat, turned back, three at once) keep the row's three tiles within
  0.02 px of one height in every frame, with a second difference of at most 3.24 px/frame². After
  the third round, two row-mates switched back to desktop 100, 250 and 450 ms apart, the review's
  case, peak at 1.56 to 1.75 px/frame² in three runs each, against 7.6 to 8.8 before, and one
  switched to desktop 100 ms before the other to phone at 3.7 to 3.8; the second tile alone,
  read from the heights the switch writes, peaks at 2.18 to 2.24 to the phone and 1.56 to 1.59
  back, as it did. With reduced motion turned off while a hold waits on a slow capture, the hold
  lets go at once and the next flight leaves from the phone that shows, with no fade on the
  device in flight. After the fourth round: Phone pressed in the first frame after a desktop
  landing has handed back, its beat still running, holds the row at 562.39 px and lifts it from
  there a pixel or two a frame (it leapt to 790.63 in one frame before), on the first and third
  tiles, on the rail at 390 (535.11, then 536.13) and the other way round (790.63, then 790.56);
  the first tile back to desktop and the second to the phone about 160 ms later never
  take the row below 769.63 px, where it lands, in five runs (it fell to 573.0 before), and 0 and
  50 ms apart likewise; 300 ms apart, the row already falling at speed, it turns 62 px under
  where it stood (744.0 to 682.1 to 769.6 px), and 450 ms apart it finishes the fall to the
  desktop height first (610.5 to 562.4 to 769.6), with no second difference over 2.4 px/frame².
  The second tile alone peaks at 2.19 to 2.25 px/frame² to the phone and 1.56 to 1.59 back in
  three runs each, as it did, two row-mates switched the same way 250 ms apart at 1.75 to 2.41,
  and bursts of five changes 100 and 200 ms apart at 1.12 to 1.78; every row keeps its tiles
  within 0.016 px of one height, the worst frame is 16.8 ms and none is over 20 ms, and every
  run lands clean; on the rail, 1.66 to 1.69 to the phone and 1.23 to 1.25 back.
- **Tests.** `lib/motion/work-morph.test.ts` (25 tests) holds both rest states exact, no empty
  screen at any p, speed from -2.6 to 2.6 p/s and lean, on the lg tile, the rail, a taller
  row-mate and focus 0 and 1, the old page tucked under the new as far as its foot allows (at
  least 0.45 of the front's lift, a whole pixel past about two), the geometry monotonic and it,
  the island and the address flat at both ends, the prototype's clock at pace 1 (p 0.5 at 400 ms, above 0.98 by 900 ms, still by
  1,100 ms, never past 1.003) and every time stretched by the pace, the same flight at 60 and 120
  Hz, the front drawn at each frame's own time within 1.5 px/frame² at 144 Hz, 3 at 90 and 6 at a
  jittered 60, a sample that is never kept, a change of mind that keeps the device's speed and
  rises no more than 0.15 for no more than 150 ms, the row's height (on the first row's own
  heights, drawn at 60 Hz as the controller draws it, a click on a landed tile taking the row as
  it stood from the view it showed) never below the room or a tile in it, the end a flight
  leaves keeping the row as it stands less the turn its speed needs, its carry holding place and
  speed through a change and carrying on from the row before its floor, a lone flight within its
  old bends, two row-mates switched the same way turning at no more than 3 px/frame² and
  opposite ways at no more than 4, the row after two row-mates' opposite changes 0 to 450 ms
  apart going below where it stood at the second only by the turn its speed then needs (and, up
  to 150 ms apart, no further below where it started and lands than it had come), and 60 seeded
  sequences of clicks at no more than 7, one landing beat per landing, and the pill and meniscus
  inside their bounds. `e2e/home-work-switch.spec.ts` (the desktop project) holds the hand-back
  to CSS, a change of mind and the arrow keys each retargeting one flight that reports one end, a
  change of mind in the landing beat that flies again with its readout never empty, and one from
  desktop to Phone that leaves the row within 2 px of where it stood in the first frame after the
  press, row-mates switched together on one height, row-mates switched opposite ways 150 ms apart
  never taking the row more than 5 px under where it lands, still row-mates, single labels, a
  flight landed as the page hides, and one end event, each landed tile and the band left without
  `data-measure`; `e2e/home-work-switch-still.spec.ts` holds the opacity arrival under reduced motion and
  the Highlight pill under forced colours; `e2e/no-script.spec.ts` gains the switch without
  script; `mobile-work.spec` and `tablet-work.spec` each gain a flight under a touch
  (`e2e/helpers/work.ts`), the page never wider than the screen, the rail never scrolled and the
  tile left clean. `home.spec`, `reduced-motion`, `a11y`, the no-script suite and the earlier
  phone and tablet tests pass unchanged.
- **Crop focus.** Three captures have their headline at one side, and at focus 0.5 the narrowing
  window cut it mid-word: Go Wild's and TrvlWell's sit left and VetPres's right. They carry
  `focus` in `CLIENT_ITEMS` (0.2, 0.35 and 0.85), rendered as `data-focus` on the tile; the other
  three centre.
- **To re-measure on devices:** the page-wide relayout below the row, and the captures' per-frame
  raster now that they paint with the device, on a low-end Android over the LAN, with the first
  flight on a fresh page; and Safari's `clip-path: path()`, `color-mix()` inside `calc()`, the
  registered numbers and the glint's mask on an iPhone; a browser that lacks one of the first two
  takes the opacity arrival.

## Owner decisions

Each has a default, and each is one line to revert.

1. **Row-mates top-aligned.** The device sits under the pill in both states, and a stretched
   tile's spare room goes above its dated caption, so in a mixed row the other tiles read pill,
   device, text, gap, footer, and nothing in them but the footer moves. To revert, give the
   desktop state's `.work-stage` `flex: 1` and `align-items: center`.
2. **The size readout** (1440px to 390px, brand blue, top right), the capture viewports, so the
   drag reads to someone who has never resized a browser. Off: skip its writes in `drawDevice`.
3. **Pace 1.15**, the lead's default over the prototype's 1 (decision 6).
4. **The landing beat**, one edge light and the pool's bloom. Off: two writes in `draw`. The
   light starts on the pressed pill's side, as the spec described it; the prototype ran it from
   the far side, and to have that back, swap the two `--glint-angle` values in `work.css`.
5. **Crop focus** 0.5 by default, with the three headlines above anchored to their side.
6. **The flight past ADR 0034's caps** (decision 11).
