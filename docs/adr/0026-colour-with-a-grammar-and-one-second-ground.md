# Colour with a grammar, and one second ground

- Status: accepted
- Date: 6 September 2026
- Amends: ADR 0005 (item 6, motion on the glow's layers)
- Amended by: ADR 0037 (decision 1, the visitor's colour on `/start`, 25 September 2026)

## Context

The owner asked for more colour and more animation — gradients, coloured text, things fading in
and out — while the page still reads as premium and professional, and while it stays the page it
is (`docs/home-page-plan.md`: refinement, not redesign).

The page as built did not have a colour problem so much as an absence. Measured on 6 September
2026: 22 of the 35 home-page components carry no brand colour at all, and every one of Outcomes,
Included, Real build, Your options, What you get and How it works is `#0f172a` on `#ffffff` with
`#e2e8f0` hairlines and nothing else. Colour lived in five places — the two washes, the buttons,
three icon sets and the links. The middle of the page, which is most of it, was greyscale.

Two other measurements shaped what could be done. The hero and closing washes are already the
most saturated thing on the site, so "more colour" could not mean more chroma there. And all
three byte budgets were effectively full: 225 B of stylesheet, 266 B of HTML and 660 B of script
headroom on `/`.

## Decision

1. **A grammar, not a palette**, written beside the tokens in `app/globals.css`: blue is the
   product (the counters, the progress, the icons, the links, the ask, the step you are on, the
   answer you opened); the glows are light, and never carry ink; everything else stays greyscale.
   An element that falls into none of those three sentences does not get a colour. Amended 25
   September 2026 (ADR 0037, Release 3): on `/start` the visitor's chosen colour is a fourth
   sentence. From the colour question on it retints their draft, becomes the lamp's light and
   re-hues the region's dark band; a grey colour keeps the studio's light.

2. **One second ground.** `--surface-tint`, white with 6% brand mixed in oklab (`#f4fafe`), on
   Included, Real build and Your options — the three bands where the page turns from proof to
   price — and on no fourth band, because three tinted sections read as one stretch and four
   read as a stripe pattern. `--on-surface-muted` holds 7.20:1 on it and `--brand-deeper` 5.64:1,
   so every existing recipe works there unchanged. The stretch is opened and closed by one
   gradient hairline (`bandEdge` in `app/_components/section-styles.ts`), used exactly twice.

3. **`--surface-tint` is mapped in `app/globals.css`, not `app/tokens.css`.** `tokens.css` is
   imported by reference into `templates/tailwind.css` (ADR 0024), so a mapping there would let a
   template write `bg-surface-tint` and get the marketing site's ground on a client's preview,
   where it is not one of the fourteen tokens a brand derives. Declared in the site sheet, the
   utility cannot be generated under `templates/`.

4. **`--glow-secondary` is corrected, not invented.** It shipped at OKLCH lightness 0.491 while
   the studio's own engine specifies 0.72 for a light-mode second glow
   (`CONFIG.colour.light.glowSecondary`), so behind the wash it read as dirt rather than as a
   second colour; it is now `#809ffc`, and the two layers carry it at 10% and 8% rather than 4%
   and 3%. The hue stays at 268.6 rather than taking `glowHueShift`, which would land a
   yellow-green under a hero already showing a client's teal. 2.54:1 on white: light, never ink.

5. **The wash reaches a phone's first screen.** The mask reached full strength at 100% of a
   section far taller than a phone, so on the device most visitors arrive on, the colour was
   under the fold and the first screen was white with one coloured object. Below `md` the mask
   now completes at 55%. The fix is the stop, not more chroma.

6. **The one authored payoff actually lands.** The second wash layer steps back to 45% while the
   hero holds a client's colour, so the studio's cyan gives way to the brand being painted rather
   than stacking with it. Opacity only, on the group's existing `data-live` / `data-tinted`
   contract, so nothing new loads and reduced motion still receives it in full.

7. **Colour marks state on the things the visitor is touching, reading or scrolling past.** The
   hero field takes a live boundary and caret; the ask keeps a gradient on hover instead of
   collapsing to a flat fill; the walkthrough's active step colours its title; an open FAQ entry
   colours its question and chevron; the six work cells answer hover and focus; the three
   measured results — the only figures on the page — take the product's colour; and the closing
   H2's ask takes the page's one coloured display phrase.

8. **All new motion is colour or opacity**, which is the one class WCAG 2.3.3 excludes from
   motion animation, so a reduced-motion visitor receives every new beat in full. Nothing loops,
   nothing autoplays, nothing tracks the scroll for decoration, and nothing joins the home page's
   initial script tags.

### Amending ADR 0005

ADR 0005 item 6 lists "motion on the glow's layers" among the things that never happen. Decision
6 above is exactly that, deliberately: the record was written when the glow was scenery, and the
measurement that changed it is that the page's one authored moment — the frame turning to a
client's colour — currently changes the ground almost not at all, because the site's cyan and the
example brand's teal are nine degrees of hue apart. The rest of item 6 stands.

The design plan's list of animatable properties (section 5) gains the gradient stops
`--tw-gradient-from` and `--tw-gradient-to`, which Tailwind registers with `syntax: '<color>'`, so
naming them in a transition interpolates them with no keyframes and no library.

### What was refused

Recorded here so the next pass does not re-propose them: a brand-coloured full stop on every
section H2; gradient-clipped text anywhere; a second warm hue (twelve degrees from the
walkthrough's own terracotta — two near-but-not-equal warms is the amateur tell); coloured corner
ticks, because registration marks are instrument marks; ambient motion of every kind — a
breathing glow, a drifting gradient angle, a second marquee; scroll-driven "inking" section
hairlines, which are a reading-progress bar on a page whose job is to get someone to type or
call; colour inside the list-reveal keyframes, which would repaint ~50 elements of persuasion
copy through low-contrast mid-states; a hover tint on the cells of Included, Straight answers and
Your options, where nothing is focusable and a hover promises a click that never comes; a tinted
lane on the studio column of Your options, because `option-items.ts` records that the comparison
runs under CAP Code section 3 and visual weighting is emphasis even when the words are neutral;
colourising the client logo strip, whose marks are masks so no client's brand competes; and
widening the reduced-motion allowlist to carry the gradient stops, which would buy a cosmetic
hover glide for a visitor who has asked for less motion. The gradient hover jumps under reduce,
and that is correct.

Two items are left open for the owner rather than decided here: the sixteen step counters and
Outcomes' four labels in brand ink (one decision across Taster, Real build and Included — never
fork `stepNumber` to do half of it), which `section-styles.ts` and
`docs/css-cleanup-analysis.md` section B already record as open; and an inverted dark closing
band, which is the strongest available answer to a closing section doing less work than its
height suggests, but changes what about a thousand pixels of the page look like and needs to be
seen rendered before a yes.

## Consequences

- `e2e/a11y.spec.ts`'s `settled()` waited for every animation to stop while the logo marquee runs
  `infinite`, so the axe scans could not complete on a page carrying the strip. It now waits only
  on animations with a finite `endTime`. This landed first, deliberately: axe is the only
  automated check that reads colour, and until it ran, colour work here had no coverage at all.
  Six scans (desktop, mobile, tablet × two states) pass.
- The stylesheet budget goes from 14 KB to 14.5 KB and `/`'s HTML from 39 KB to 40 KB, measured at
  13,975 B and 39,188 B. ADR 0006 decision 7 set the precedent: raise the line on the record
  rather than trimming unrelated CSS to squeeze under it.
- `--glow-secondary` moves `/start`'s "bold" imagery swatch too; it drops the `/70` alpha it used
  to need to read as bold against the lighter value.
- `CLOSING` in `section-copy.ts` is stored as two parts and joined for the copy corpus, so the
  voice tests still read one sentence.
- Templates are untouched: no token joins the derived fourteen, and no file under `templates/`
  uses `--surface-tint`.
- The walkthrough's active step is a plain rule in `app/globals.css`, not utilities on each step.
  The five steps are serialised into `HowItWorksTrack`'s props as a client component's children,
  and repeating ~90 characters of classes across them grew that tree enough to make React's
  development-only key validation misfire — it reported an unkeyed child of `HowItWorks` even
  though every `<li>` carries `key={step.title}`. Measured in an isolated worktree: the same bulk
  added to Outcomes, or ten characters added to the same `<li>`, produced nothing; eighty-nine
  characters on that `<li>` produced the warning, and reverting cleared it. The rule is identical
  on every step, so CSS is where it belonged anyway, and it costs nothing in the payload.
