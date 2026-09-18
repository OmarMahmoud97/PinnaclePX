# The hero is ink over a gradient, and the sketch loop moves out of it

- Status: accepted
- Date: 18 September 2026
- Amends: ADR 0005 (item 3, the one GSAP leaf, which moved; item 6, ambient motion), ADR 0006
  (the loop is no longer in the hero), ADR 0026 (the refusal of ambient motion, for the hero
  only)

## Context

The owner brought a reference design (a screenshot of the Kraft template's hero, and
`docs/fluid-hero-guide.md`, which explains its WebGL animation pass by pass and carries the
whole simulation verbatim) and asked for it to be the new design of the hero, with the studio's
own logo and links in the nav. The reference is a single column: a see-through nav, one screen
of ground running from white to indigo to near-black, an ink simulation multiplied onto the
light half, a two-line headline with one italic word that flips colour over the ink, a prompt
box, a caption and a scroll arrow.

The hero as built (ADR 0006) was a two-column stage: the headline, the subhead, the sentence
field and the buttons on the left, the sketch loop on the right. The loop does not fit the
reference's composition, and it is the page's one authored moment in ADR 0005's terms, so it
was not deleted on the strength of a reference that does not mention it.

The ink is ambient motion, which ADR 0005 item 6 never allowed and ADR 0026 refused by name.
The owner has asked for it, and it is the design's whole point.

## Decision

1. **The hero takes the reference's composition, in the studio's colours.** One screen
   (`min-height: 100svh`), edge to edge rather than inside the page's hairline frame, which now
   starts at the section under it (the owner's instruction, 18 September 2026), with the
   content pinned to the bottom and the gradient, of a fixed height, pinned to the bottom too,
   so the headline always lands on the light part and the caption on the dark part whatever
   the viewport's height (guide, section 11). The fifteen-stop
   ramp, the two headline fills and the ink were re-fitted from the reference's indigo (OKLCH
   hue about 277) to `--brand-deeper`'s hue (242.7), each colour keeping its lightness and chroma
   and clamped back into sRGB with culori, so the hero belongs to a page whose ask is blue. The
   reference's own indigo is in the guide, section 2, if the owner prefers it.

2. **The ink is the reference's simulation, ported.** The seven shaders are verbatim
   (`lib/motion/fluid-shaders.ts`). The JavaScript is rewritten in `lib/motion/fluid.ts` with the
   guide's three corrections (the pointer measured against the canvas, the splat radius following
   the short side on portrait screens, one loop rather than two) and a clean stop that cancels
   the frame, disconnects both observers, removes both window listeners and releases the GPU
   context. It returns quietly without WebGL, float textures or a complete framebuffer, and
   throws on a shader that fails to compile or link, because that is a programming error. The
   tunables live in `CONFIG.hero.ink`; the two constants GLSL cannot read from there, the fade
   and the divergence scale, stay in the shaders, the way CSS durations live in `globals.css`
   (ADR 0005 item 5).

3. **The simulation is a lazy chunk, loaded the way GSAP and Lenis are.** `HeroInk`
   (`app/_components/hero-ink.tsx`) imports it dynamically after `whenIdle`, only while
   `useMotionAllowed` is true, and the simulation runs only while the hero is on screen.
   `scripts/bundle-budget.mjs` fails the build if `u_point_size` appears in the initial script
   tags. Reduced motion, JavaScript off, no WebGL and a chunk that never arrives all show the
   still gradient: the canvas is `aria-hidden`, and white where there is no ink, which multiply
   leaves alone.

4. **The headline flips colour over the ink.** `.hero-heading` fills its letters with the clean
   gradient behind them (`background-clip: text`) and blends by difference (guide, section 10):
   no ink, the gradient minus itself, black; dark ink behind, the fill shows and the letters turn
   light. The H1 is still server-rendered, still never animates, and is the largest contentful
   paint on desktop and tablet (Playwright). Nothing between it and the section may create a
   stacking context, or the flip switches off. The set-apart word is `HERO.emphasis`, "before",
   and Geist ships no italic face, so the browser's synthesised oblique is what shows.

5. **The header blends by difference over the hero, and is solid once scrolled or while the
   menu is open.** Text in `--surface` minus the white page reads black, and over dark ink
   stays light. Anything drawn in the header shows inverted, so its links dim on hover instead
   of recolouring, the menu button is see-through with a hairline in the current colour, the
   border and the column rules wait for the solid state, and the ask is a text link after the
   reference's rule until `data-scrolled`, when it becomes the filled button the header has
   carried since the design plan. The phone's button past the hero is unchanged. `<main>` loses
   its top padding: the hero sits under the see-through header.

6. **The prompt box is the first question.** `HeroPrompt` holds the sentence field (its
   placeholder and its screen-reader label both "What does your business do?"), the trigger line,
   and the ask carrying `#hero-cta`, which the header watches. The sentence goes to the sentence
   store as before; `hasTyped` joins the store so a cleared field still counts as typed.

7. **The sketch loop moves to its own section, `#sketch`, directly under the hero, unchanged in
   behaviour.** `app/_components/sketch-loop.tsx` is `hero-stage.tsx` renamed, with the tinted
   glow, the corner ticks, the caption, the chips and the logo strip. It starts when a quarter
   of its stage is on screen, as before, which is now after a scroll. The first keystroke in the
   hero still stops it for good and redraws it with the visitor's words, through the store rather
   than a shared component; the hint that promised this under the field is gone, since the sketch
   is no longer beside it. Whether the section stays, moves or goes is the owner's call; nothing
   of ADR 0006 was deleted.

8. **Copy.** `HERO.emphasis` and `HERO.scrollLabel` (the arrow) and `SKETCH.heading` (the new
   section's outline heading) join the corpus; `HERO.fieldHint` goes.

9. **Numbers, after `next build` on 18 September 2026:** initial scripts on `/` 215,020 B gzipped
   (budget 216,000), HTML 39,883 B (40,000), stylesheet 15,384 B (was 13,975; budget 14,500). The
   stylesheet line moves to 16,000 B for the fitted ramp, the ink canvas, the blend and fills,
   the hero type token and the header's two states; ADR 0006 decision 7 set the precedent of
   moving the line on the record rather than trimming unrelated CSS. GSAP, Lenis and the ink stay
   lazy chunks.

## Consequences

- ADR 0005 item 6 loses "ambient motion" for the hero's ink only, at the owner's instruction;
  ADR 0026's refusal list stands for everything else on the page. The ink is also WCAG 2.2.2's
  kind of moving content with no pause control, the departure ADR 0006 decision 2 already
  records for the loop, with the same mitigations: reduced motion skips it, it stops off screen
  and in a hidden tab.
- The provenance of the simulation is recorded in `THIRD_PARTY_NOTICES.md`: Ksenia Kondrashova's
  CodePen, a cut-down of Pavel Dobryakov's WebGL Fluid Simulation, which is MIT. The owner's
  recovered files (`deployed-webgl-source.js`, `deployed-component.js`, `FluidBackground.tsx`
  and `shaders/`) are not needed in the repository, since the guide carries the source, and a
  bundle recovered from another site does not belong in a public repository.
- Playwright: the sketch assertions move from `#hero` to `#sketch` and scroll it into view
  first; the two LCP tests no longer wait for a build; reduced motion asserts the canvas keeps
  its unsized default, which is the sign the simulation never started.
- Cost: nine to eleven quarter-resolution passes a frame, plus a full-size blur and multiply,
  while the hero is on screen. Not profiled on a mid-range phone (guide, section 13). If field
  data shows long frames, the first lever is `CONFIG.hero.ink.resolution`.
- Not tested: Safari, Firefox, real GPUs, and devices without float render targets (guide,
  section 16).
- The headline fills were measured on this page, not taken from the reference: with the ink
  off, the ground behind the headline's first and last line was sampled at 390, 768, 1024,
  1280, 1440 and 1920 wide and each pair extended to the heading box's edges. On a phone the
  headline sits on the white top of the ground and from `md` on the light blue, so there is one
  pair per range, and every width holds to within about 11 levels of 255. The reference's
  fills, fitted to a shorter content stack, read the headline dark brown here. The fill is
  cleared with `-webkit-text-fill-color` rather than `color`, because Chrome does not count
  text with a fully transparent `color` as a largest-contentful-paint candidate: with it the
  subhead became the LCP element on desktop. Move the headline or change the ramp and measure
  again.

## Amendments

- 18 September 2026, later the same day: the owner asked for the sketch loop's section to be
  deleted and the client logo strip moved into the hero. Decision 7 no longer applies:
  `sketch-loop.tsx` and `hero-loop.ts` are gone, and ADR 0006 is superseded. The FLIP build
  (`sketch-build.ts`), the finished page's face (`built-fonts.ts`) and the example photograph
  stay, because the How it works walkthrough and the closing frame use them; the finished page
  itself (`built-page.tsx`, `built-copy.ts`) and the loop's other leftovers go, as knip lists
  them. The typed sentence now reaches only the closing frame, so the sentence store is back to what it was before this record and decision 6's
  `hasTyped` never shipped; `CONFIG.demo` keeps the keys the walkthrough reads, and the
  captions only the loop showed are gone with it, as is decision 8's `SKETCH.heading`. The logo
  strip takes its ink from its container's text colour, so on the dark foot of the ground it
  shows in the hero's white at the same 70%. The arrow under the caption now points at What you
  get. The Playwright assertions on the loop are gone, and the accessibility scans run on the
  page as it loads. Measured after the removal: initial scripts on `/` 211,303 B gzipped, HTML
  37,905 B, stylesheet 15,149 B; the lines stay where decision 9 set them.
