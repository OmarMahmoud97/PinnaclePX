# The walkthrough is a scroll-stepped timeline of an example brand

- Status: accepted
- Date: 6 September 2026
- Amends: ADR 0005 (item 3, one GSAP leaf and the walkthrough's discrete stages)
- Builds on: ADR 0006 (the build, FLIP on GSAP core)

## Context

How it works showed one phone frame painting a client's brief as three beats of copy scrolled
past it. The stage was "the last beat on screen", so at 1440 by 900, where the whole section fits
one screen, the frame arrived already at stage 5 and the only thing that ever moved was a 900 ms
timer between stages 4 and 5; each stage was a React remount with a 300 ms fade; stage 3 was
skipped; and the story ended on a wireframe. On 6 September 2026 the owner asked for the
animation to be replaced: as smooth as the hero's, moving through every question from 1 to 5,
painting an invented brand rather than VetPres, and ending on something that looks like a real,
good website. The plan is `docs/walkthrough-plan.md`.

## Decision

1. **One paused GSAP timeline, seven labels, no callbacks.** `walkthrough-timeline.ts` authors
   the whole story once: the sentence typing, the name landing, the logo, the look, the colour,
   and the build. Every state change is a tween on a stable DOM (`walkthrough-frame.tsx` draws
   the phone with every state present at once: a slot and its answer as siblings in one grid
   cell, a grey base and a coloured twin for every coloured element), so the timeline plays the
   same forwards and backwards. The scroll picks a stop and `tweenTo` glides there at the
   authored speed; a jump over several stops is capped (`CONFIG.walkthrough.catchUp`) so a flick
   to the bottom watches the page assemble in one pass. GSAP core only; no ScrollTrigger, so
   `loadGsap` is untouched and this is the second leaf on the one lazy chunk.
2. **The scroll drives the stop, not the playhead.** The copy is five steps, one per answer,
   each saying what the answer does to the design; each carries `data-stages`, the stops it
   paints spread evenly down its height, and the last paints the colour and then the finished
   page, so the build lands while the frame is still whole on screen (the owner's note on the
   first cut, where the button carried it and the frame was leaving as it finished). A pure function, `stageAt`, gives the stop from the beats' boxes and a
   reading line: the sticky frame's bottom edge plus a gap, clamped to a share of the viewport,
   because on a wide screen the frame sits beside the beats and is not yet stuck when the first
   beat arrives. One passive scroll listener, one read per frame; Lenis scrolls the window, so
   its glides arrive as ordinary scroll events. Progress ("Question N of 5") and the caption are
   React state driven by the stop, so they are right before GSAP arrives.
3. **The build is shared.** The FLIP routine from the hero loop (`addBuild`, the layers and the
   measuring) moved to `sketch-build.ts`, parameterised by a beats table; the hero passes
   `CONFIG.demo.build` and the walkthrough `CONFIG.walkthrough.beats.build`. The hero's
   behaviour is unchanged and its Playwright tests still hold. The walkthrough adds the build as
   one nested timeline, so it scrubs and reverses with the rest.
4. **The brand is invented and says so.** Fernbrook Gardens (`walkthrough-brand.ts`,
   `walkthrough-photos.ts`): a garden design studio that does not exist, checked against the web
   on 6 September 2026, answered in the form's own shape and held to its schema by a unit test.
   Its four photographs are Pexels stock with no person in them, its mark is an icon, its
   colour the Forest preset, and its finished page's words are placeholder marketing. The
   captions read "An example brief. A sketch, not one of the designs." and "Built as an
   illustration. Not a client, not one of the designs."; the screen-reader sentence says "An
   example brief so far". VetPres stays the hero's and the closing frame's brief. `PRODUCT.md`
   gains "an example brief" for an invented business; "a client's brief" is unchanged.
5. **Degradation as the hero's.** The server renders the finished sketch. A client that allows
   motion marks the stage `data-phase="empty"` in its first render, and CSS shows the slots and
   hides the answers, which is the timeline's time-zero state written inline once GSAP has taken
   over, so the attribute goes with no change on screen. The finished page is a `next/dynamic`
   chunk with `ssr: false`, fetched with its one font file (DM Serif Display) and its photographs
   when the section is a viewport away and the browser is idle, only on a motion client. Reduced
   motion, JavaScript off and a GSAP chunk that never arrives keep the finished sketch. A resize
   rebuilds the timeline and seats it at the current stop.
6. **The section is taller, and the phone shows whole.** Beats take about a quarter of a screen
   per stage at `md` and up and less on a phone, so each stop has its own stretch of scrolling.
   Below `md` the sticky block is the whole frame at zoom 1.1, no longer a masked strip.
7. **Numbers.** Measured after `next build` on 6 September 2026, on a clean checkout of the
   branch and of `main`, gzipped: initial scripts on `/` 212,545 B against 208,824 on `main`, so
   the walkthrough's page code (the frame, the track, the stop function, the brand and the
   timeline, which Turbopack folds into the page's shared chunk even as a dynamic import) is
   3,721 B, about a third of that the four photographs' blur placeholders that a static image
   import carries. `main` had 1,176 B of headroom under the 210,000 B line, so the line in
   `scripts/bundle-budget.mjs` moves to 215,000 B. Stylesheet 13,430 B (13,103 before; line
   14,000). HTML 37,369 B (36,576 before; line 38,000, unchanged). Lazy, for motion clients
   only, fetched a viewport before the section: the finished page's chunk 2,543 B, the serif's
   one file 8,492 B, and the photographs, 114 KB for the hero image and about 3 KB for each
   card square. GSAP and Lenis stay lazy chunks; the budget script still checks both.

## Consequences

- ADR 0005's "one leaf uses GSAP" is now two; the loader, the ESLint boundary and the budget
  check that keeps GSAP out of the initial script tags are unchanged. The design plan's section
  3.4 (an IntersectionObserver switching discrete stages) is superseded by this record.
- Scroll-driven motion moves only while the visitor moves, plus one capped catch-up glide, so
  WCAG 2.2.2 does not apply to it; the hero's knowing departure (ADR 0006) is not widened.
- `CONFIG.motion.walkthroughThreshold` is gone; `CONFIG.walkthrough` holds the reading line, the
  beats, the catch-up cap and the resize settle.
- `CONFIG.demo.build` gains `photoFilter`, the treatment the photograph arrives wearing, which the
  hero sets to the saturation it always used.
- The claims register carries a row for the example brand; the reading-level and voice tests
  cover its captions; the walkthrough's answers are tested against the form's schema.
