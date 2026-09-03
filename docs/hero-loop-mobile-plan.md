# The hero loop on phones and tablets

Prepared 3 September 2026, after the owner said the loop is not visible well on a phone or a tablet, and implemented the same day; the next section records what the build found. Every number below was measured on the dev server on the day at 390 by 844 (phone), 768 by 1024 (tablet) and 1000 by 800 (a wide tablet, still below the `lg` breakpoint where the desktop composition begins).

## Built on 3 September 2026

Everything in sections 2 and 3 is in, with the recommended answers to section 7: the whole phone, shorter typing on phones, the kicker back on the phone, and `max-w-xl` for the tablet frame. Where the build departs from the text below, this is why:

- **The loop's start threshold is a quarter, not 30 percent.** With the whole phone under the button, the sketch's column is 29 percent on screen at 390 by 844 at load, so at 30 percent the loop did not start until the visitor scrolled and the frame's top showed a still, blank sketch at the fold; the strip it replaced had started at load. At a quarter it starts at load again, and a moving peek is the better reason to scroll. One number in `CONFIG.demo`, applied to pausing off screen as well.
- **The shared sketch gained a `phoneFrom` prop** ('md' or 'lg', default 'lg') for where the phone sits over the browser's corner, so `/start`, which renders the same component, is unchanged.
- **The finished phone page's photograph rises 128 px** (on the 1.5x phone strip) from below the button to under the navigation, pure translation, and the kicker rises in between it and the headline, as planned.

Measured after: at 390 the phone frame shows in full (456 px, top at 694 px, the button still at 528 to 576 px inside the first screen) and the hero is 248 px taller; the subhead is still the LCP element at 42,336 px². At 768 the browser frame is 520 px wide with the phone over its corner, the sketch's photograph paints at 118 by 89 px, about 10,500 px² against the subhead's 54,270 px², and the LCP element is the subhead. Five tablet tests join the suite, 39 in all, and pass; three consecutive phone passes leave no stray inline style; at 390 with the CPU throttled 4x the build runs 163 frames in 2.72 s with none over 34 ms; a contact sheet of the phone at 50 ms steps shows the photograph travelling up past the text from 0.75 s to 1.00 s and the card resolving by 1.65 s. Final numbers on `/`: scripts 206,202 B gzipped (budget 210,000), stylesheet 12,067 B, HTML 21,602 B.

## 1. What a phone and a tablet see today

Below `lg` (1024 px) the hero is one column: headline, subhead, the sentence field, the button, then the phone frame alone in a strip 208 px tall with a fade over its bottom fifth, then the caption. The strip was designed in `docs/home-page-design-plan.md` section 3.2 so that "the sketch peeks as the reason to scroll and the button stays inside 844 px", and the mobile Playwright suite holds the button to that.

| Measure at the hold                                    | Phone 390           | Tablet 768                                                                                                                             |
| ------------------------------------------------------ | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Phone frame height, and the strip that shows it        | 456 px, 208 px      | 456 px, 208 px                                                                                                                         |
| Share of the frame the visitor can see                 | 46 percent          | 46 percent                                                                                                                             |
| Finished page's photograph, top edge, against the crop | 28 px below it      | 28 px below it                                                                                                                         |
| Finished page's button against the crop                | in the fade band    | in the fade band                                                                                                                       |
| Phone frame width against the viewport                 | 216 of 390 px       | 216 of 768 px                                                                                                                          |
| LCP element and size                                   | subhead, 42,336 px² | subhead, 54,270 px²                                                                                                                    |
| Page wider than the viewport                           | no                  | 11 px, the corner ticks' strokes; `overflow-x: clip` on the body stops any sideways scroll, and a scroll attempt leaves `scrollX` at 0 |

So on a phone the whole build is: a headline changes typeface and colour, a paragraph changes typeface, and a button restyles under a fade. The photograph, the cards, the footer and the arrows never enter the crop. A tablet gets exactly the same 216 px phone, centred in 768 px of width, with the desktop composition (the browser frame with the phone over its corner, the one that carries the story) hidden until 1024 px. That is the complaint, and it is accurate.

Two things are working and must be kept. The button sits inside the first screen at 390 (top 528 px, bottom 576 px), and the loop only starts once 30 percent of its stage is on screen, which at 390 happens a few pixels of scroll after load, so a phone visitor sees the typing begin as they arrive at the strip rather than catching it mid-pass.

## 2. Phone (below 768 px)

1. **Show the whole phone.** The strip's crop goes; the frame renders in full, 456 px tall, and its own rounded bottom edge does the clipping, so the cards are cut by a bezel rather than a fade. The button stays where it is, so the fold test still holds; the hero grows by about 250 px below the fold, where growth costs nothing. The fade mask is no longer needed, since nothing is being hidden.
2. **An image-led finished page, so the phone has its own reflow.** On the phone nothing travels today because the finished page keeps the sketch's order (nav, headline, paragraph, button, photo). The finished page reorders to nav, photo, headline, paragraph, button, cards, footer, which is what a real mobile hero looks like. The parts still pair by name, so the photograph travels up about 92 px to sit under the navigation and the headline, paragraph and button travel down past it: the vertical twin of the desktop sweep, on the same code path, with the same eases and crossfade windows. The photograph is the same 4:3 box in both layers on the phone, so its travel is pure translation. The sketch's phone, shared with `/start`, does not change.
3. **The kicker returns on the phone.** It was removed because it arrived on top of the fading headline; with the fade-through gap from the refinement plan the old text is gone before anything new appears, so it can sit between the photograph and the headline, rising in like the third navigation link does on desktop.
4. **Type less on the phone.** The phone's paragraph shows two lines, about 62 characters, then an ellipsis, yet the brief types all 230, so a phone visitor watches an ellipsis for two and a half seconds. Below 768 px the brief types the first 80 characters at the hand's rhythm and then completes the sentence in one step, which the clamp hides. The number lives in `CONFIG.demo.typing`; the pass shortens from about 15 s to about 12.5 s on phones only. The chips and the screen-reader sentence are unaffected, since they read the stage, not the characters.

## 3. Tablet (768 to 1023 px)

1. **The desktop composition from 768 px.** The browser frame with the phone over its corner appears from `md` rather than `lg`, centred under the copy, and the phone strip is used only below `md`. This is four class swaps (`lg:` to `md:` on the frame's visibility, the strip's, the frame's corner padding and the phone overlay) and no new code.
2. **Narrower than on desktop, for the LCP.** At 768 the subhead is the LCP element at 54,270 px². A frame at the desktop's `max-w-2xl` would put the sketch's photograph, painted in the first screen at stage 5, at about 279 by 209 px, 58,000 px², and the photograph would become the LCP element. At `max-w-xl` it is about 234 by 176 px, 41,000 px², and the subhead keeps its place with room to spare. So the frame is `max-w-xl` from `md` and `max-w-2xl` from `lg`, and the finished page's smaller type tier, already written for narrow frames, applies below `xl` as it does now.
3. **The chips from 768 px.** There is room for the five answer chips under the frame at tablet widths; they show from `md` rather than `lg`.

## 4. What does not change

The button inside the first screen on a phone; the honesty caption under every frame; reduced-motion and JavaScript-off visitors seeing the finished sketch; the loop pausing off screen; the desktop composition from 1024 px; every rule in ADR 0005 and 0006.

## 5. Risks

- **LCP on tablets** is the one measured risk, handled by the frame width in section 3.2 and asserted by test (section 6). If a future copy change shrinks the subhead, the number to re-check is the sketch photograph's painted area against the subhead's.
- **The phone's finished page may not fit its frame.** Reordering does not change its height, and today's overflow (the third card and the footer clipped by the bezel) stays as it is. Verified by screenshot at 390.
- **A taller hero on phones** puts the caption about 250 px lower. It stays adjacent to the frame it labels.
- **The vertical travel on the phone crosses the text column.** The photograph paints above the text in the finished layer already, and the sketch's text fades in the first 40 percent of its travel, so the sweep reads as it does on desktop. Verified by contact sheet.

## 6. Order of work and how each step is proven

1. **Tablet first** (section 3): the class swaps and the width. Then a new Playwright project, `tablet`, at 768 by 1024 with touch, running a short spec: the button inside the first screen, no sideways scroll after a scroll attempt, the hero reaching `data-built`, and the LCP element being the subhead or the H1, never the photograph. The axe spec joins that project. The mobile suite must stay green unchanged.
2. **Phone** (section 2): the crop, the reorder, the kicker, the typing limit. Then the mobile suite, a contact sheet of the phone frame at 390 through the build (the harness slows the page's clock, as before), the three-pass style check on the phone frame, the frame-gap measurement at 4x CPU throttle at 390, and the byte budget, which should not move by more than a few hundred bytes.
3. **Docs**: the loop plan's section on the phone and its LCP row, the design plan's built-on note for section 3.2, and this plan's built-on section with the measurements.

## 7. Decisions for the owner

1. **Whole phone or a taller crop.** The whole frame is recommended; a crop tall enough to include the photograph and the button would be about 380 px anyway, nearly the frame's height, with a fade over the part that matters least.
2. **Shorter typing on phones**, or the full sentence for consistency with desktop.
3. **The kicker on the phone**, in or out.
4. **Tablet frame width**: `max-w-xl` is the LCP-safe recommendation; `max-w-2xl` would match desktop and hand the LCP to the photograph at 768.
