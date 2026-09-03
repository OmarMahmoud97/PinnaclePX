# The hero loop, refined: smoother, nicer, more detail

Prepared 3 September 2026, after the loop in `docs/hero-loop-plan.md` shipped and the owner asked for it to be smoother, look nicer and carry more detail. It was implemented the same day; the next section records what the build found and where it departs from the text below. Every proposal names its evidence, its mechanism, its risk and its test, and section 6 is the order of work. The rules from ADR 0005 and 0006 hold throughout: transforms and opacity only, no plugin, no motion on the H1, no bounce or elastic easing, no blur, nothing outside the frame moves.

## Built on 3 September 2026

All three phases are in, each proven by the checks in section 6 before the next began. Where the build departs from the plan, this is why:

- **The ease is `power3.inOut`**, as recommended. The before and after contact sheets, on identical labels, show the photograph motionless until 0.70 s and across the whole frame by 0.85 s before, and moving from 0.55 s to 1.00 s in one arc after. The owner has the sheets.
- **The reset stops the build rather than reverting it.** A revert would also have taken back the fade in progress, since the finished parts' opacity is what the fade animates; so the build is killed at the swap, what it wrote on the sketch's parts is cleared by name then, and what it wrote on the finished parts is cleared when the reset completes.
- **The finished page is memoised.** Phase 2 made it bigger, and the hero re-renders it on every typed character and at `data-built`; at 4x CPU throttle that showed as one 66 to 71 ms frame per build, reproducible three times, attributed to React's scheduler. `React.memo` on the page, whose props never change, took it back to zero long frames and a longest gap of 33 ms.
- **The finished page has two type tiers.** The frame only exists from `lg`, and its page area is the sketch's height; with the card copy added the finished page overran that height by 11 px at 1440 and 71 px at 1024, where the headline wraps to four lines. Below `xl` the headline, kicker and paragraph step down a size, the page's rhythm is 20 px rather than 24, and the card copy is clamped to one line. Measured after: 7 px of room at 1440, 18 px at 1024, footer fully inside the frame at both. On the phone the cards keep a bar where the copy goes, since 6 px words are not words.
- **The typing helper lives in `lib/brief/typing.ts`** with `CONFIG.demo.typing`, and the example brief's test now checks the real schedule, which is about 4 s.
- **The brief sets the empty frame on its first tick.** With one callback per character, the first character landed a tick after the brief started, so on the first pass the finished sketch showed for one frame before typing began; the contact-sheet harness caught it because its observer saw the live and tinted states together. The brief now sets the empty frame at time zero, in the same render as the live state.
- **The card copy is written to fit** one row of the narrowest card the browser frame draws, at 1024 px, rather than clamped mid-sentence.
- **The hold stays at 3.5 s**, the owner having not chosen otherwise.

Final numbers on `/`: scripts 205,956 B gzipped (budget 210,000), stylesheet 12,046 B, HTML 21,608 B; 114 unit tests, 34 Playwright tests, three consecutive passes with no stray inline style, and at 4x throttle 165 frames in 2.77 s with none over 34 ms.

## 1. What was measured first

All on 3 September 2026 against the dev server at 1440 by 900, with Chrome's CPU throttled 1x and 4x through the DevTools protocol.

| Measure                                                   | 1x                         | 4x            |
| --------------------------------------------------------- | -------------------------- | ------------- |
| Frames rendered during the build                          | 130 in 2.18 s              | 163 in 2.74 s |
| Mean gap between frames                                   | 16.7 ms                    | 16.8 ms       |
| Longest gap                                               | 16.8 ms                    | 33.3 ms       |
| Gaps over 34 ms (a dropped frame at 60 Hz)                | 0                          | 0             |
| Long animation frames (over 50 ms) during the build       | 0                          | 0             |
| Montserrat and Caveat Brush loaded before the first build | yes                        | yes           |
| Photograph fetched before the first build                 | at 119 ms after navigation | at 155 ms     |
| The photograph's travel at 1440 px                        | 307 px left, scale 1.173   | same          |

So the build already renders every frame, and the saturation tween on the photograph, the one paint-heavy beat, costs nothing measurable. Smoothness has to come from the motion itself.

**Where the motion is not smooth.** The travel ease is `expo.inOut` everywhere. Its speed peaks at 6.9 times the average, so in the middle tenth of a second the photograph covers 47 percent of its path: 144 of its 307 pixels in 100 ms, about 32 pixels a frame. That is the snap a viewer feels. For the text pairs the crossfade hides the middle of the travel, but it hides it with a ghost: each side is at half opacity at the fastest moment, so the old and new words are both faintly visible while moving fastest. The same curve with a lower peak fixes both: `power3.inOut` peaks at 3 times the average and covers 25 percent of the path in that tenth of a second; `power2.inOut` peaks at 2 times and covers 17 percent. Both ship in GSAP's core.

## 2. Smoother

1. **Travel ease.** `expo.inOut` becomes `power3.inOut` for every travel, durations unchanged. The photograph is the element that stays fully visible while it moves, so it decides this; the text pairs follow for consistency. Risk: none to structure, it is one constant. Test: a contact sheet of frames every 50 ms through the photograph's travel, before and after, so the owner can choose between the two, or `power2.inOut` if they want it calmer still.
2. **Crossfade windows.** The outgoing sketch part fades over the first 40 percent of its travel and the finished part fades in over the last 40 percent, leaving the middle fifth, the fastest fifth, with nothing visible. This is the shape of Material's fade-through pattern: outgoing fully gone before incoming arrives. The eye is carried across the gap by the photograph and by the other parts, which are on different beats. Risk: a part could read as vanishing and reappearing if the gap is too wide; 20 percent is the starting point and the contact sheet decides. The number becomes `CONFIG.demo.build.cross`.
3. **The ground arrives with the photograph.** The finished page's tint fades in from 0.05 s to 0.75 s today, under a wireframe that has not started moving, which reads as a wash followed by furniture. It moves to the photograph's beat, 0.25 s to 1.35 s, so the ground comes in with the first big move. One number in config.
4. **No empty frame at the reset.** Today the finished page fades out to nothing and only then does the blank sketch fade in, so the frame is briefly empty. The sketch's layer is hidden and swapped at 60 percent of the fade-out instead of the end, and its fade-in starts at 65 percent, so the two cross-dissolve. The swap still happens while the sketch's layer is hidden, which is what stops the finished sketch flashing before the blank one, so the three-pass check must stay clean.
5. **The finished page lifts as it goes.** With its fade-out at the reset, a rise of 6 px (`y: -6`, inside the plan's 0.5 rem ceiling). Trivial, and it makes the reset read as the page being put away rather than switched off.

## 3. Nicer

1. **The headline arrives word by word.** The six words of the finished headline become inline-block spans at render time (the copy is static, so no text-splitting plugin is needed), each rising 6 px and fading in 40 ms after the last, inside the headline's own crossfade. The block still travels as one part; the words are nested tweens on its children, so the build's revert at the reset still restores everything. `text-wrap: balance` keeps working across inline-block boxes. Risk: low; the one thing to check is that a word span never breaks a line differently from the plain text, which the contact sheet shows.
2. **Pill labels arrive after their pills.** A pill scales up out of a thin bar, so during the first part of its travel its label is squashed flat; at the moment the label starts to fade in today (halfway), the pill is at about 55 percent of its height. The label becomes a child span that fades in over the last 25 percent only, when the pill has its shape. Applies to the navigation pill and the hero button, on both frames.
3. **Cards resolve in two steps.** Each card's crossfade stays as it is; its icon scales from 0.7 to 1 (`power3.out`, no overshoot) 80 ms after the card, and its title rises 4 px with it. Three cards, 60 ms apart, so the row settles left to right in about half a second. The arrows keep their small `back.out` overshoot; nothing else gets one, because the house rule is no bounce.
4. **The phone's parts rise as they arrive.** On the phone nothing travels, since the finished page keeps the sketch's order, so the build there is crossfades alone. Each finished part on the phone gets a 4 px rise with its fade, which gives the phone its own arrival rhythm at no cost.
5. **A favicon dot in the tab.** When the wordmark takes the brand colour, a 6 px dot in `--sketch-strong` fades in beside the lock in the browser chrome's tab. Tiny, honest, and it is the kind of detail that makes a frame read as a real browser.

## 4. More detail

1. **A human typing rhythm.** The sentence types at a constant 16 ms a character today, which reads as a machine. A pure helper, `typingOffsets(text, timings)` in `lib/brief/`, returns the start time of every character with a pause after a comma (120 ms) and a full stop (240 ms) and a small deterministic jitter per character (seeded from the index, so it is identical on every pass and in every test), unit-tested. The brief act schedules one `call` per character from those offsets rather than one linear tween. The example sentence has one comma and two full stops, so the brief grows by under half a second; the e2e timeouts have room. The numbers live in `CONFIG.demo`.
2. **A line of copy on each card.** The finished cards carry a grey bar where copy would go. One short line each, in `built-copy.ts` beside the titles, makes the finished page read as finished. This is placeholder marketing copy for an example business, flagged in that file already; whether VetPres is a real product whose copy needs permission is still section 10, item 6 of the loop plan, and this adds three sentences to that question.

## 5. Considered and not recommended

- **Slow zoom on the photograph during the hold.** It would add life, and it is the exact image-drift the research lists as a template tell. The hold is for reading. Not recommended.
- **Replacing the saturation tween with a two-layer opacity crossfade.** Measured at zero cost at 4x throttle, so there is nothing to fix.
- **A caret while typing.** Blinking cursors are on the research's never list.
- **Any plugin.** `CustomEase` would allow the site's own `--ease-standard` curve in the loop; the core eases above get the same result without adding to the lazy chunk or the loader.
- **Gating the first build on `document.fonts.ready`.** Both fonts were loaded eight seconds before the first build in every measurement, because the finished page mounts at idle and its hidden text triggers the fetch. Cheap insurance, but insurance against a case that was not observed; it can be added in a line if the field data ever shows a fallback-font frame.

## 6. Order of work and how each step is proven

Three phases, each verified before the next, each reversible on its own.

1. **Smoother** (section 2): constants and timings only, no new markup. Then: the contact sheets for the photograph's travel and one text pair at 50 ms steps, the three-pass style check, the full Playwright suite, the frame-gap measurement at 4x (must stay at zero gaps over 34 ms), and the byte budget.
2. **Nicer** (section 3): the word spans, label spans, card internals, phone rise, favicon dot. Then the same checks, plus the reduced-motion and no-script suites, because these add markup to the finished page and the sketch's chrome.
3. **More detail** (section 4), on the owner's say-so per item: the typing helper with its unit test, then the card copy. Then the same checks; the two-pass e2e test guards the loop's total length.

Expected cost: under 1 KB gzipped of script across all three phases, against 5.8 KB of headroom, measured after each. No change to the server HTML except the favicon dot's span and the card copy.

## 7. Decisions for the owner

1. **The travel ease**: `power3.inOut` (recommended) or the calmer `power2.inOut`, chosen from the contact sheet after phase 1.
2. **The typing rhythm**: on, with the pauses above, or off.
3. **Card copy**: three lines of placeholder copy, or keep the bars until the VetPres question is settled.
4. **The favicon dot**: in or out. It is decoration, and honest decoration.
5. **The hold**: 3.5 s today. With the richer arrival, 4 s may read better; it is one number.
