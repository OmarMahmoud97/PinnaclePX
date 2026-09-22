# The closing section takes the hero's ink

- Status: accepted
- Date: 21 September 2026
- Builds on: ADR 0031 (the hero's ink, and its headline's colour flip)
- Amends: ADR 0031 (decision 3, one canvas becomes two; the idle wander, which now resumes)

## Context

The owner asked for the closing section (`#cta`, the last heading and the phone frame) to carry
the same WebGL ink as the hero, without slowing the site down. Earlier the same day they asked
for the hero's idle wander, which until then stopped for good at the first pointer event, to
start again once the pointer has been still for five seconds.

The closing section's ground is the page's white with the two glows fading in toward its foot.
The ink is a multiply: it shows as the studio's blue where one splat lands and builds up to
black, and it goes wherever the idle path and the pointer take it, which is everywhere. Dark
text on that ground would be swallowed. The hero has the same problem over its light half and
solves it by blending the headline by difference (ADR 0031, decision 4).

## Decision

1. **One `Ink` component, for both sections.** `app/_components/hero-ink.tsx` becomes
   `app/_components/ink.tsx`, its canvas class `.ink`, its colour `--ink` on `:root` (one colour
   over both grounds), and its tunables `CONFIG.ink`. Nothing about the simulation changes: the
   chunk is still fetched after `whenIdle`, still only while motion is allowed, and each canvas
   still requests frames only while it is on screen, so the two are never both running.

2. **Each canvas makes its context at the same idle moment, not when its section nears the
   screen.** Creating a context and compiling the seven programs is a few frames of main-thread
   work. Done at idle it is spent before the visitor does anything; done as the closing section
   scrolls near, it would land in the middle of a smooth scroll. The price is a second idle
   context holding a few megabytes of quarter-resolution textures. Browsers allow around sixteen
   contexts a page; this page has two.

3. **Every run of text on the closing ground flips by difference, the way the headline does.**
   `.over-ink` (`app/globals.css`) blends the element by difference and, because the ground is
   white and needs no fill, declares the tokens the text and its links use as the complements of
   what should show: `--on-surface` as a near-white that reads near-black, `--on-surface-muted`
   and the hover colour as a neutral grey of the muted token's lightness (a cool grey's
   complement is warm, so the hue is dropped rather than flipped), `--surface` as black so a
   focus ring's offset still reads as the ground. The utilities on the elements are unchanged;
   they resolve the re-declared variables. The heading, the three small lines and the phone's
   caption carry the class. The button and the phone frame are opaque and paint over the ink.

4. **The ask loses its colour and takes the hero's emphasis instead.** The closing heading's
   "five questions away." was the page's only coloured display phrase (`--brand-deepest`). Under
   a difference blend a blue shows as its complement over the ink, salmon, so the phrase is now
   an italic at the regular weight, as the hero's set-apart word is. This is a change to the
   heading's look with no ink under it (near-black in place of navy and blue) and is the owner's
   to reverse; the comment on `CLOSING` in `section-copy.ts` records both states.

5. **The section paints its own surface and positions its content.** The canvas needs an opaque
   ground inside the isolated section to multiply onto (`bg-surface`, in place of relying on the
   body's), and the content wrapper is `relative` so it paints over the canvas rather than under
   it. Nothing between the flipped text and the section creates a stacking context.

6. **The wander resumes after five seconds.** `lib/motion/fluid.ts` no longer latches idle off at
   the first pointer event: it records when the pointer last moved and is idle whenever that was
   more than `CONFIG.ink.idle.after` ago (5,000 ms). Re-entering idle jumps the pointer from the
   cursor to the path, the same one-frame velocity that blooms the ink on load, and by then five
   seconds of the 0.96 per frame fade has cleared the canvas, so the bloom lands on an empty
   ground. Scrolling away for longer than that and back does the same.

## Consequences

- Over the blue of a single splat, the flipped letters show the complement of blue, a warm
  tan, and over the ink's mid-tones their contrast dips before it recovers over the black core.
  The hero's headline does exactly this (its "website" turns brown over blue ink), so the closing
  matches it rather than introducing anything new; but the hero keeps its small text on the dark
  foot where the ink vanishes, while the closing's small text sits where the ink goes. It is the
  same class of departure ADR 0031 records: decoration that moves, absent under reduced motion,
  stopped off screen. axe reports blended text as indeterminate rather than as a violation, so
  the accessibility scans pass as they did for the headline; they are not evidence about it.
- A colour token used inside `.over-ink` that is not one of the four re-declared shows as its
  complement. The comment on the class says so; a new element there states its colour with one
  of those four.
- `CONFIG.hero.ink` is `CONFIG.ink`; ADR 0031's references to the old path and to `HeroInk`
  describe the same code under its old names. `docs/fluid-hero-guide.md` section 6 records the
  wander's resumption.
- Measured after `next build` on 21 September 2026, with the other work in the tree that day:
  initial scripts on `/` 211,788 B gzipped (budget 216,000), stylesheet 15,410 B (16,000), HTML
  38,713 B (40,000); the fluid chunk stays lazy. Every line stands.
