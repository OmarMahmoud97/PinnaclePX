# Home page below the hero: the build plan

Branch `feat/home-below-the-hero`, 23 September 2026. The single build-ready plan from the design panel: the winning direction ("the ink continues") with eight grafts from the runners-up, written against `understand-brief.md` (the panel brief; section 3 of it is the fence) and the director's decisions D1 to D12. Everything below is buildable from this document; where a number must come from a build, it says "measured" and section 9 says how.

Status, 23 September 2026: the full build has landed and the closing pass is done, uncommitted, pending the owner's check: every section package, the integration pass, the dead-weight cleanup (the two empty motion modules and the three empty section sheets went, so section 8.1's "ten" of each is the foundation's count, not the finished tree's) and the closing measure. The director's amendments A1 to A3 are folded in below and marked; ADR 0034 is accepted. The hero line count at 1024 is resolved by a `14em` cap on `.hero-heading` (3, 2, 2, 2, 2, 2 re-measured; see the ADR's consequences). The byte lines are measured on the production build (section 9.4): `/` scripts 212,832 B gzipped (line 216,000, unmoved), stylesheets 18,271 B (line 18,500, from the provisional 18,000 by the plus-70-B rule), HTML 39,376 B (line 40,000), fonts 55,480 B as served (line 64,000, the same pair as in development), all four lazy guards ok; `/start` scripts 240,946 B (line 245,000). The Lighthouse run (section 9.5) and the contrast re-checks are in the ADR's consequences; `lighthouserc.json` first had to lose its `"preset": "mobile"`, a name this Lighthouse rejects, for `"formFactor": "mobile"`, the default it meant. The run's failing assertions (LCP, the script and total sizes, performance and best-practices on `/`; LCP, script size and best-practices on `/start`) are all pre-existing at HEAD by the same measure on the same day, never checked before because the preset name was invalid, and no GSAP or ScrollTrigger chunk loads at idle; the ADR has the numbers and what each one is.

Companion documents: `docs/adr/0034-*.md` (outlined in section 10, written by the foundation step), `docs/home-page-design-plan.md` (the earlier plan this supersedes below the hero), ADR 0031 and 0032 (the hero and the closing, unchanged).

---

## 1. Direction

### The thesis, in five sentences

The hero already ends in the studio's ink, a `#020a12` foot with the clients' marks on it, and today that foot crashes into a white ruled page. This plan lets the ink continue: the proof (six live sites) and the promise (four jobs) sit on the hero's own foot as one dark stretch, which ends in a pooled curve over a wash taken from the ramp's top stops. The wash carries the walkthrough and the two commercial bands, then dissolves to white for the sceptic's answers, the studio and the questions, and the closing hands the hero's ink back on white before the footer closes on the foot again. Every ground is a stop of the hero's ramp or a token the page already has; every hairline is replaced by a ground, a card, air or a shape, never by nothing. The voice is one grotesk with one serif italic on exactly the three phrases the copy already sets apart (see, look, looking), and the motion is a senior developer's: batch settles, a drawn-on glyph, a scrubbed rail, a one-degree tilt, a clipped wordmark rising, and nothing that hides content from a test.

### The arc, band by band

| Band                | Ground                                                                               | OKLCH L      | Seam into the next band                                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------ | ------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Hero foot           | `#020a12` centre, `#02111e` edges at rest                                            | .139         | Shared ground. The stretch's top 4rem feather (`#02111e` to `#020a12`) covers the edge mismatch at rest and under reduced motion. |
| `#work`             | `#020a12` (`.ink-stretch`, `data-theme="dark"`)                                      | .139         | Air (`--spacing-band`), same ground.                                                                                              |
| `#included`         | `#020a12`                                                                            | .139         | Shape. The stretch ends in an elliptical bottom edge painted over the walkthrough band's top (section 4.4).                       |
| `#how-it-works`     | `.walkthrough-band`: `#c6dcee` at the top into `#e2eef7`, flat before the first step | .884 to .943 | Same family; air.                                                                                                                 |
| `#real-build`       | `#e2eef7` (`--surface-wash`)                                                         | .943         | Air, same ground.                                                                                                                 |
| `#your-options`     | `#e2eef7`, dissolving to white over its last 1.5 bands of padding                    | .943 to 1    | Fade.                                                                                                                             |
| `#straight-answers` | `#ffffff`, cards on `--surface-wash`                                                 | 1            | Air.                                                                                                                              |
| `#about`            | `#ffffff`                                                                            | 1            | Air.                                                                                                                              |
| `#faq`              | `#ffffff`, cards on `--surface-wash`                                                 | 1            | Object: the closing's phone and glow.                                                                                             |
| `#cta`              | `#ffffff`, GlowBackdrop, ink (D3, unchanged)                                         | 1            | Shape. The footer is a sheet with rounded top corners laid over the closing's foot.                                               |
| Footer              | `#020a12` (`data-theme="dark"`), wordmark clipped at the page's edge                 | .139         | End.                                                                                                                              |

Lightness reads dark, dark, dark, curve, tinted, tinted, tinted, dissolve, white, white, white, white with ink, dark. Two dark runs, one tinted run, one white run: contiguous, never a stripe, and the header flips exactly twice on the way down (dark under the hero's foot and the stretch, light from the walkthrough, dark again at the footer).

### What makes it better than the reference

Kraft's page is one flat black holding rendered ribbons and invented benchmarks, with cards all on one recipe. Here the dark is the hero's own colour and it holds six real sites in dark bezels, each one a tap away; the lightening is the page's argument (what we built, how you would see yours, the deal, the person); and the ink that opens the page closes it. One hue family, one arc, real imagery, a plain price on white cards, and the walkthrough kept as the page's one performance rather than competing with it.

### What was grafted in, and from where

| Graft                                                                                                                                                                                                | From                      | Into                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------------------------------------ |
| The sheet mechanism (negative margin, top corners, `position: relative` only, the band above carrying the extra padding) as the exact implementation of the pooled edge and the footer's rounded top | scenes                    | section 4.4, `#how-it-works`, footer |
| The measured font plan: Mona Sans wght-only 39,788 B, Instrument Serif italic 22,128 B, 64,000 B line, TTF-measured H1 counts, numerals and wordmark at weight 800 instead of a width axis           | scenes                    | section 3                            |
| Hero dark-foot detection ORed into `data-over-dark`                                                                                                                                                  | scenes                    | section 5                            |
| The four job labels promoted to a display-size word beside the drawn glyph                                                                                                                           | colour-blocks, kraft-plus | `#included`                          |
| The FAQ's open card lights (a glow beat at low alpha that survives reduced motion)                                                                                                                   | editorial                 | `#faq`                               |
| The right column of the four Straight-answer cards offset so the 2x2 floats                                                                                                                          | scenes                    | `#straight-answers`                  |
| The heading block on the night first, the tiles' backlight rising with the batch                                                                                                                     | editorial                 | `#work`                              |
| A static cyan halo on the walkthrough's white panel at md+                                                                                                                                           | kraft-plus                | `#how-it-works`                      |
| The borderless segmented track for the Phone/Desktop toggle                                                                                                                                          | kraft-plus                | `#work`                              |
| The two lane heads drawn on together with one clip-path tween                                                                                                                                        | scenes                    | `#your-options`                      |
| Server markup finished by default for the numerals and the rail, un-finished only by the leaf                                                                                                        | kraft-plus                | `#real-build`                        |
| The optical em rule for the two H2 italics (1.06em, line-height 0.94) with the H1 em at 1em                                                                                                          | editorial                 | section 3                            |
| A solid wordmark colour at 3:1 instead of SVG text or a gradient clip                                                                                                                                | colour-blocks, editorial  | footer                               |

---

## 2. Tokens

All new tokens are site-only: values on `:root` in `app/globals.css`, utilities in globals' own `@theme inline` block, type, shadow and spacing tokens in globals' own `@theme` block. `app/tokens.css` changes only where section 3 says (the two font stacks and the fallback names). The fourteen derived token names keep their values (`scheme.test.ts`).

### 2.1 Existing tokens, unchanged

`--surface #ffffff`, `--surface-muted #f1f5f9`, `--surface-tint #f4fafe` (still used by `/start`; no longer on `/`), `--on-surface #0f172a`, `--on-surface-muted #475569`, `--border #e2e8f0`, `--accent #f1f5f9`, `--brand #0ea5e9`, `--brand-deeper #0369a1`, `--brand-deepest #075985`, `--on-brand #ffffff`, `--glow #2cd5ff`, `--glow-secondary #809ffc`, `--scrim #020617`, `--on-scrim #ffffff`, `--ink #004268`, `--danger`, `--warning`, `--success`, `--motion-tap`, `--motion-enter`, `--motion-settle`, the hero ramp, the headline fills and `.over-ink`'s four complements. Light-band text stays slate (question 12: no).

### 2.2 New site-only tokens

Ratios are WCAG 2.x, computed with culori in the panel's scratchpad scripts; the build re-checks the marked ones (section 9).

| Token                 | Value                                                                | Role                                                                                                                | Ratios                                                                                                                                               |
| --------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--ink-foot`          | `#020a12`                                                            | the dark ground (the hero's foot)                                                                                   | white 19.91; `#e2eef7` 16.88; `#9abfdd` 10.31; `#0ea5e9` 7.18; `#2cd5ff` 11.44; `#809ffc` 7.85                                                       |
| `--ink-card`          | `#021b2c`                                                            | card surface on the dark ground                                                                                     | vs foot 1.13 (a step, not a rule); `#e2eef7` 14.89; `#9abfdd` 9.09; `#0ea5e9` 6.34; `#2cd5ff` 10.09; `#809ffc` 6.93; `#75a5cc` 6.70; `#c6dcee` 12.20 |
| `--ink-raised`        | `#002943`                                                            | hover surface on dark (the dark twin of `--surface-tint`)                                                           | vs foot 1.33; `#e2eef7` 12.74; `#9abfdd` 7.77                                                                                                        |
| `--on-ink`            | `#e2eef7`                                                            | text on dark (the ramp's top stop)                                                                                  | 16.88 foot, 14.89 card                                                                                                                               |
| `--on-ink-muted`      | `#9abfdd`                                                            | muted text on dark (ramp stop, L .788)                                                                              | 10.31 foot, 9.09 card, 7.77 raised                                                                                                                   |
| `--ink-line`          | `#18242c`                                                            | the dark scope's `--border`: sketch bezels, the mobile drawer's edge, ring offsets; never a grid rule               | decorative                                                                                                                                           |
| `--brand-ink`         | `#0369a1` on light; `#0ea5e9` inside the dark scope                  | every coloured TEXT and meaningful icon; fills stay on `--brand-deeper`                                             | light: 5.93 white, 5.03 wash; dark: 7.18 foot, 6.34 card                                                                                             |
| `--surface-wash`      | `#e2eef7`                                                            | the tinted ground (walkthrough foot, Real build, Your options) and the tinted card on white (Straight answers, FAQ) | on-surface 15.14; on-surface-muted 6.43; brand-ink 5.03; brand-deepest 6.41; white card on it 1.18                                                   |
| `--surface-wash-deep` | `#c6dcee`                                                            | the walkthrough band's top only, as a gradient into `--surface-wash`; only the H2 and lead sit on it                | on-surface 12.64; on-surface-muted 5.37; brand-ink 4.20 (FAILS: no coloured text on the deep top)                                                    |
| `--job-found`         | `#2cd5ff` (= `--glow`)                                               | Found's glyph and word                                                                                              | 10.09 on card                                                                                                                                        |
| `--job-trusted`       | `#809ffc` (= `--glow-secondary`)                                     | Trusted's glyph and word                                                                                            | 6.93 on card                                                                                                                                         |
| `--job-answered`      | `#75a5cc` (ramp stop, L .702)                                        | Answered's glyph and word                                                                                           | 6.70 on card                                                                                                                                         |
| `--job-reachable`     | `#c6dcee` (ramp stop, L .884)                                        | Reachable's glyph and word                                                                                          | 12.20 on card (re-check at build)                                                                                                                    |
| `--backlight`         | `rgb(44 213 255 / 0.18)`                                             | the radial behind each Work phone; hover raises it to 0.32                                                          | decoration under an opaque image                                                                                                                     |
| `--wordmark`          | `#1b2e44`                                                            | the footer wordmark's solid fill                                                                                    | 1.44 on foot (measured at build with culori; decorative, aria-hidden, exempt from 1.4.3)                                                             |
| `--shadow-card`       | `0 1px 2px rgb(2 6 23 / 0.04), 0 16px 40px -16px rgb(2 6 23 / 0.14)` | white cards on the wash and on white                                                                                | n/a                                                                                                                                                  |
| `--shadow-card-ink`   | `inset 0 1px 0 rgb(226 238 247 / 0.06)`                              | the top-edge light on dark cards                                                                                    | n/a                                                                                                                                                  |
| `--shadow-panel`      | `var(--shadow-card), 0 0 120px -30px rgb(44 213 255 / 0.35)`         | the walkthrough panel at md+: card lift plus a static cyan halo, never animated                                     | n/a                                                                                                                                                  |
| `--glow-corner`       | `color-mix(in oklab, var(--glow) 12%, transparent)`                  | one radial in a card's corner (Straight answers, the open FAQ card, the About tile)                                 | over `#e2eef7` paints about `#c8eaf8`: brand-ink 4.9, on-surface-muted 5.8 (re-check at build; only h3 and body sit on it)                           |
| `--spacing-band`      | `clamp(4rem, 2.5rem + 6vw, 8rem)`                                    | vertical padding of every band                                                                                      | n/a                                                                                                                                                  |
| `--spacing-band-sm`   | `clamp(2.5rem, 1.5rem + 4vw, 5rem)`                                  | Work's top padding and the footer's                                                                                 | n/a                                                                                                                                                  |
| `--seam`              | `clamp(2rem, 6vw, 5rem)`                                             | the two shaped seams                                                                                                | n/a                                                                                                                                                  |
| `--radius-card`       | `1.5rem`                                                             | cards                                                                                                               | n/a                                                                                                                                                  |
| `--radius-panel`      | `2rem`                                                               | the walkthrough panel at md+                                                                                        | n/a                                                                                                                                                  |
| `--text-numeral`      | `clamp(2.5rem, 1.5rem + 3vw, 4.5rem)`, lh 1, ls -0.02em              | Real build's `01` to `05`                                                                                           | large text: 3:1 applies                                                                                                                              |
| `--text-jobword`      | `clamp(1.75rem, 1.25rem + 1.25vw, 2.5rem)`, lh 1, ls -0.02em         | Included's four job words                                                                                           | at 1440 "Reachable" is about 188 px in a 229 px cell                                                                                                 |
| `--tracking-eyebrow`  | `0.08em`                                                             | uppercase eyebrows                                                                                                  | n/a                                                                                                                                                  |
| `--motion-reveal`     | `600ms`                                                              | the CSS list reveal's duration (was 300)                                                                            | n/a                                                                                                                                                  |
| `--motion-stagger`    | `70ms` (was 40; 0 under reduce as today)                             |                                                                                                                     | n/a                                                                                                                                                  |

### 2.3 The dark scope

Applied on exactly two elements in the page: the wrapper around `#work` and `#included` (`div.ink-stretch[data-theme="dark"]`) and the `<footer data-theme="dark">`. The header's dark state (section 5) shares the rule.

```css
[data-theme='dark'],
[data-solid][data-over-dark] {
  color-scheme: dark;
  --surface: var(--ink-foot);
  --surface-muted: var(--ink-card);
  --surface-tint: var(--ink-raised);
  --on-surface: var(--on-ink);
  --on-surface-muted: var(--on-ink-muted);
  --border: var(--ink-line);
  --accent: var(--ink-card);
  --brand-ink: var(--brand);
}
```

Consequences, each deliberate:

- Every recipe flips with no class churn (`bg-surface`, `text-on-surface-muted`, Work's `hover:bg-surface-tint`). Buttons keep `bg-brand-deeper text-on-brand` (5.93 text; the fill's edge against the foot is 3.36, above the 3:1 non-text line). A filled primary button never sits inside a dark card (2.96 against `#021b2c`); on the dark stretch the one button (`/start`) sits on the band ground.
- The sketch frames in Work take the dark bezel automatically (`--sketch-bg: var(--surface)` resolves at the declaring element, constraint 44). The screenshots fill the phone; only the bezel and the browser chrome bar recolour. This is the chosen "dark client site" reading (question 14).
- `--brand-deeper` as text never occurs inside the scope: every text use moves to `text-brand-ink` site-wide (section 4.6), so one class is right in both scopes.
- Focus rings move from `ring-brand-deeper` / `outline-brand-deeper` to `ring-brand-ink` / `outline-brand-ink` site-wide: identical on light, 6.34 to 7.18 on dark where `#0369a1` would be 2.96 against a card.

### 2.4 The exact CSS to add to `app/globals.css`

Placed after the existing `:root` block and before the header rules. Amended 23 September 2026 by the director (A1): the section blocks in section 7 do NOT go between banners in `globals.css`. Each section owns one file under `app/_styles/` (`work.css`, `included.css`, `how-it-works.css`, `real-build.css`, `your-options.css`, `straight-answers.css`, `about.css`, `faq.css`, `closing.css`, `footer.css`), imported from `globals.css` with `@import './_styles/<name>.css'` lines placed after this block. Plain CSS rules only in those files (no `@theme`, no `@utility`); tokens and utilities stay in `globals.css`. A section package edits only its own file.

```css
/* ==== redesign: site-only tokens (ADR 0034) ==== */
@theme inline {
  --color-brand-ink: var(--brand-ink);
  --color-surface-wash: var(--surface-wash);
  --color-surface-wash-deep: var(--surface-wash-deep);
  --color-ink-card: var(--ink-card);
  --color-ink-raised: var(--ink-raised);
  --color-job-found: var(--job-found);
  --color-job-trusted: var(--job-trusted);
  --color-job-answered: var(--job-answered);
  --color-job-reachable: var(--job-reachable);
  --color-wordmark: var(--wordmark);
  --font-emphasis: var(--font-site-serif), 'Iowan Old Style', Georgia, serif;
  --shadow-card: var(--shadow-card);
  --shadow-card-ink: var(--shadow-card-ink);
  --shadow-panel: var(--shadow-panel);
}

@theme {
  --spacing-band: clamp(4rem, 2.5rem + 6vw, 8rem);
  --spacing-band-sm: clamp(2.5rem, 1.5rem + 4vw, 5rem);
  --spacing-seam: clamp(2rem, 6vw, 5rem);
  --radius-card: 1.5rem;
  --radius-panel: 2rem;
  --tracking-eyebrow: 0.08em;
  --text-numeral: clamp(2.5rem, 1.5rem + 3vw, 4.5rem);
  --text-numeral--line-height: 1;
  --text-numeral--letter-spacing: -0.02em;
  --text-jobword: clamp(1.75rem, 1.25rem + 1.25vw, 2.5rem);
  --text-jobword--line-height: 1;
  --text-jobword--letter-spacing: -0.02em;
  /* The site's retune of the shared scale (sizes unchanged; see section 3.3). Declared here,
     not in tokens.css, because t01-aurora reads text-title and text-display from that file. */
  --text-display--line-height: 1.02;
  --text-display--letter-spacing: -0.035em;
  --text-title--line-height: 1.06;
  --text-title--letter-spacing: -0.025em;
  --text-subtitle--line-height: 1.2;
  --text-subtitle--letter-spacing: -0.015em;
  --text-heading--line-height: 1.3;
  --text-heading--letter-spacing: -0.005em;
  --text-label--letter-spacing: 0em;
}

:root {
  --ink-foot: #020a12;
  --ink-card: #021b2c;
  --ink-raised: #002943;
  --on-ink: #e2eef7;
  --on-ink-muted: #9abfdd;
  --ink-line: #18242c;
  --brand-ink: #0369a1;
  --surface-wash: #e2eef7;
  --surface-wash-deep: #c6dcee;
  --job-found: var(--glow);
  --job-trusted: var(--glow-secondary);
  --job-answered: #75a5cc;
  --job-reachable: #c6dcee;
  --backlight: rgb(44 213 255 / 0.18);
  --wordmark: #1b2e44;
  --seam: var(--spacing-seam);
  --shadow-card: 0 1px 2px rgb(2 6 23 / 0.04), 0 16px 40px -16px rgb(2 6 23 / 0.14);
  --shadow-card-ink: inset 0 1px 0 rgb(226 238 247 / 0.06);
  --shadow-panel: var(--shadow-card), 0 0 120px -30px rgb(44 213 255 / 0.35);
  --glow-corner: color-mix(in oklab, var(--glow) 12%, transparent);
  --motion-reveal: 600ms;
  --motion-stagger: 70ms;
}

[data-theme='dark'],
[data-solid][data-over-dark] {
  color-scheme: dark;
  --surface: var(--ink-foot);
  --surface-muted: var(--ink-card);
  --surface-tint: var(--ink-raised);
  --on-surface: var(--on-ink);
  --on-surface-muted: var(--on-ink-muted);
  --border: var(--ink-line);
  --accent: var(--ink-card);
  --brand-ink: var(--brand);
}

body {
  font-synthesis: none;
}

/* The three serif italics: the hero's em keeps its 1em box (the fills are measured on it); the
   two H2 ems grow optically and tighten their line-height so the product stays under the strut. */
.hero-heading em,
.emphasis em {
  font-family: var(--font-emphasis);
  font-style: italic;
  font-weight: 400;
  letter-spacing: 0;
}

.emphasis em {
  font-size: 1.06em;
  line-height: 0.94;
}

/* The two shaped seams. The ink stretch paints over the walkthrough band's top (it is positioned,
   the band is not, and no z-index is set so no stacking context is made); the band under it
   carries the extra padding. The footer is a sheet laid over the closing's foot the same way. */
.ink-stretch {
  position: relative;
  margin-bottom: calc(-1 * var(--seam));
  border-radius: 0 0 50% 50% / 0 0 var(--seam) var(--seam);
  background: linear-gradient(to bottom, #02111e, var(--ink-foot) 4rem);
}

.under-ink {
  padding-top: calc(var(--spacing-band) + var(--seam));
}

.sheet {
  position: relative;
  margin-top: calc(-1 * var(--seam));
  border-start-start-radius: var(--seam);
  border-start-end-radius: var(--seam);
}

.before-sheet {
  padding-bottom: calc(var(--spacing-band) + var(--seam));
}

/* The one corner glow a light card may carry, placed by the list's --i so neighbours differ. */
.glow-corner::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  pointer-events: none;
  background: radial-gradient(
    60% 50% at calc(85% - var(--i, 0) * 25%) 0%,
    var(--glow-corner),
    transparent 70%
  );
}

.glow-corner {
  position: relative;
  isolation: isolate;
}
```

The list reveal rule (already in globals, inside the no-preference query) changes to the new numbers and gains the owned-group exception:

```css
html[data-motion] [data-reveal] > * {
  opacity: 0;
  translate: 0 2rem;
  scale: 0.97;
  transition:
    opacity var(--motion-reveal) var(--ease-enter),
    translate var(--motion-reveal) var(--ease-enter),
    scale var(--motion-reveal) var(--ease-enter);
  transition-delay: calc(var(--i, 0) * var(--motion-stagger));
}

html[data-motion] [data-reveal][data-inview] > * {
  opacity: 1;
  translate: 0 0;
  scale: 1;
}

/* Groups the choreography owns move by GSAP once it is armed; CSS must not race it. */
html[data-choreo] [data-reveal][data-choreo] > * {
  transition: none;
}
```

Under reduced motion the existing allowlist leaves only opacity transitioning; `translate` and `scale` snap, which is the "colour and opacity beats only" result.

---

## 3. Type

### 3.1 The two families

Display and body: **Mona Sans**, variable wght 200 to 900, roman only, no `wdth` axis (the two-axis latin file measures 98,124 B against 39,788 B without it; the width device is not worth the line). Emphasis: **Instrument Serif** italic 400, one static file. Geist and Geist Mono go. The walkthrough's Montserrat and DM Serif Display stay inside the phone as the invented client's brand (D2).

```ts
// app/layout.tsx
import { Instrument_Serif, Mona_Sans } from 'next/font/google'

// The studio's face (ADR 0034): one variable weight file, no width axis, roman only.
const siteSans = Mona_Sans({
  subsets: ['latin'],
  weight: 'variable',
  style: 'normal',
  variable: '--font-site-sans',
  display: 'swap',
})

// The voice: one italic file for the three emphasis phrases; the roman is never loaded.
const siteSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: 'italic',
  variable: '--font-site-serif',
  display: 'swap',
})

// ...
<html lang="en-GB" className={`${siteSans.variable} ${siteSerif.variable}`}>
```

Both preload (both paint the H1: "before" is the serif). `font-synthesis: none` on `body` so a missing italic shows as missing, never as a slanted sans.

### 3.2 The `tokens.css` mapping change (five places, one commit; constraint 48)

```css
/* app/tokens.css lines 27-28 */
--font-sans: var(--font-site-sans), ui-sans-serif, system-ui, sans-serif;
--font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
/* lines 33-36: the template fallbacks */
--font-display:
  var(--template-font-display, var(--font-site-sans)), ui-sans-serif, system-ui, sans-serif;
--font-body: var(--template-font-body, var(--font-site-sans)), ui-sans-serif, system-ui, sans-serif;
```

And `app/examples/ember/page.tsx:45`, `app/examples/summit/page.tsx:48`: `--font-geist-sans` becomes `--font-site-sans`. `--font-mono` is a fileless system stack kept only for Tailwind's `code/pre/kbd/samp` preflight; nothing on `/` is monospace any more.

### 3.3 The retuned scale

Sizes are unchanged in `tokens.css`; the line-height and tracking retune lives in globals' `@theme` (section 2.4) so the templates' scale does not move. Every size stays a `clamp()` with a rem term.

| Token               | Size                                       | lh (was)    | ls (was)                                                        | Weight in the recipes (was)                                     |
| ------------------- | ------------------------------------------ | ----------- | --------------------------------------------------------------- | --------------------------------------------------------------- |
| hero                | unchanged                                  | 1 (1)       | -0.025em (unchanged: protects the count)                        | 600; em 400 serif at 1em                                        |
| display             | unchanged                                  | 1.02 (1.04) | -0.035em (-0.04)                                                | 600                                                             |
| title               | unchanged                                  | 1.06 (1.1)  | -0.025em (-0.03)                                                | 600 (500): Mona Sans 500 reads light on dark and tinted grounds |
| subtitle            | unchanged                                  | 1.2 (1.25)  | -0.015em (-0.02)                                                | 600 (500)                                                       |
| heading             | unchanged                                  | 1.3 (1.35)  | -0.005em (-0.01)                                                | 600 (500)                                                       |
| lead / body / small | unchanged                                  | unchanged   | 0                                                               | 400                                                             |
| label               | 0.75rem                                    | 1.4         | 0 (was +0.04em mono); eyebrows add `tracking-eyebrow` uppercase | 400; eyebrows 500                                               |
| numeral (new)       | `clamp(2.5rem, 1.5rem + 3vw, 4.5rem)`      | 1           | -0.02em                                                         | 800, `tabular-nums`                                             |
| jobword (new)       | `clamp(1.75rem, 1.25rem + 1.25vw, 2.5rem)` | 1           | -0.02em                                                         | 700                                                             |

### 3.4 The italic device and where it appears

Exactly three runs, in Instrument Serif italic 400:

1. The hero's `<em>before</em>` (already an `em`; only the family changes, by CSS, so `hero.tsx` markup is untouched).
2. The walkthrough H2, "Five answers show you the _look_.": `HOW_IT_WORKS.emphasis = 'look'` is added to `section-copy.ts` beside `HERO.emphasis` (a constant, not a visitor-facing string; the heading string is unchanged and `getByRole('heading', { name })` reads the text content). The `emphasised(text, word)` helper moves from `hero.tsx` to `app/_components/words.tsx` as a named export used by both.
3. The closing's `<em>Looking is free.</em>` (already an `em`).

The two H2s carry the `emphasis` class (added to their `className` in `how-it-works.tsx` and `closing-cta.tsx`, not to the `titleHeading` recipe, because `.emphasis em` must never reach a template's H2). The optical rule is in section 2.4: `1.06em` with `line-height: 0.94` (product 0.996) keeps the em's inline box under the H2's strut; the H1 em stays at 1em so the measured fills are undisturbed.

### 3.5 The caption recipe

```ts
// components/ui/caption.ts
// Captions, dates, counters and progress text: the body family with lining, tabular figures.
export const captionStyles = 'text-label tabular-nums text-on-surface-muted'
// Eyebrows: the caption register set in small caps. CSS uppercase leaves textContent alone.
export const eyebrowStyles = `${captionStyles} font-medium tracking-eyebrow uppercase`
```

Consumers of `eyebrowStyles`: the Your-options `dt`s (phone) and lane heads, the footer's two group headings, the AddressCard `dt`s. Plain `captionStyles`: dates and hosts, "Question N of 5", the walkthrough captions, the sketch chips, the Work group note, the Included caption, the price notes. The thirteen raw `font-mono` sites (`work.tsx:29`, `walkthrough-built.tsx:168`, `walkthrough-frame.tsx:192,201,243`, `brief-sketch.tsx:119`, `browser-frame.tsx:36`, `phone-sketch.tsx:69`, `sketch-parts.tsx:36,217,225`, `design-slots.tsx:33,39`, `imagery-step.tsx:103`, `logo-step.tsx:55`, `preview/[slug]/page.tsx:83`) drop `font-mono` and keep or add `tabular-nums` where they show numerals. `ProgressSteps` keeps `captionStyles`.

### 3.6 Expected hero line counts (D1)

Measured by the scenes panel from Google's TTFs (`hmtx`, `cmap`): Mona Sans 600 is 3.7 per cent narrower than Geist 600 on the tagline (17.80 em against 18.48 em), and "before" in Instrument Serif italic is narrower again (2.18 em against 3.24 em). H1 column `min(vw - 48, 1024)` px; `text-balance` on.

| Width | Font px | Column | Geist longest line     | Mona Sans longest line  | Count today, expected |
| ----- | ------- | ------ | ---------------------- | ----------------------- | --------------------- |
| 390   | 36      | 342    | 384 (no two-line fit)  | 369                     | 3, 3                  |
| 768   | 48.4    | 720    | 516                    | 496                     | 2, 2                  |
| 1024  | 57.9    | 976    | 617                    | 593                     | 2, 2                  |
| 1280  | 67.4    | 1024   | 718                    | 690                     | 2, 2                  |
| 1440  | 73.3    | 1024   | 781                    | 751                     | 2, 2                  |
| 1920  | 90      | 1024   | 959 (6 per cent slack) | 922 (10 per cent slack) | 2, 2                  |

No count can rise (Mona is narrower at every width) and none can fall (at 390 the two-line layout misses by 8 per cent; from 1024 the one-line layout misses by 15 per cent or more). The build still runs the ADR 0031 procedure (section 9.3) because kerning and the `text-balance` heuristic are not in this arithmetic; the fills are re-sampled only if a count changes. The one pre-fill lever is `--text-hero--letter-spacing: -0.03em`.

### 3.7 The font byte ceiling

Measured: 39,788 B + 22,128 B = **61,916 B** (against 52,396 B today). The line is **64,000 B**, enforced by a `fonts` entry in `scripts/bundle-budget.mjs` (section 6.7) that sums the raw bytes of every `<link rel="preload" as="font">` the `/` HTML carries. The advisory 60 KB line in `docs/home-page-design-plan.md` is superseded. A Google-side re-cut of either file that trips the line is raised on the record, never by editing the subset.

---

## 4. Shell and spacing

### 4.1 Container

`page.tsx`'s `frame` constant is deleted, together with the header's inner `md:border-x` column and the `data-framed` observer (constraint 59). `<main>` holds the hero, then the ink stretch (Work and Included), then the seven other sections directly; the footer follows `<main>`. Every section paints its own ground edge to edge and its content sits in `shell` (`mx-auto w-full max-w-7xl px-6 md:px-10`). Heading blocks are `max-w-3xl`; About's paragraphs `max-w-prose`. Amended 23 September 2026 by the director (A1): a section's own CSS (its band gradient, rail, wordmark, light beat) lives in `app/_styles/<section>.css`, never in `globals.css`.

```tsx
// app/page.tsx (the shape; PageChoreography is section 6)
<main id="main" className="flex flex-col">
  <Hero />
  <div data-theme="dark" className="ink-stretch flex flex-col">
    <Work />
    <Included />
  </div>
  <HowItWorks />
  <RealBuild />
  <YourOptions />
  <StraightAnswers />
  <About />
  <Faq />
  <ClosingCta />
</main>
<SiteFooter />
<PageMotion />
<PageChoreography />
```

### 4.2 Section padding recipe

| Band                                                 | Padding classes                                                          | Why                                            |
| ---------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------- |
| `#work`                                              | `pt-band-sm pb-band`                                                     | the hero's foot already gives dark space above |
| `#included`                                          | `pt-band pb-[calc(var(--spacing-band)+var(--seam))]`                     | the pooled curve must not clip the caption     |
| `#how-it-works`                                      | `under-ink pb-band` (the class carries `padding-top: band + seam`)       | the heading clears the curve                   |
| `#real-build`, `#straight-answers`, `#about`, `#faq` | `py-band`                                                                |                                                |
| `#your-options`                                      | `pt-band pb-[calc(var(--spacing-band)*1.5)]`                             | carries the dissolve                           |
| `#cta`                                               | `pt-band before-sheet` (the class carries `padding-bottom: band + seam`) | the footer sheet overlaps its foot             |
| footer                                               | `sheet pt-band-sm`                                                       |                                                |

Inside a band: heading block, then `gap-10 md:gap-14` to the content, then `mt-10 md:mt-12` to a trailing note or button. The old `p-column` padding on heading blocks and cells is removed everywhere on `/`; `--spacing-column` and `--spacing-cell` stay in `tokens.css` for the templates.

Anchor offset (question 18): keep both `html { scroll-padding-top: 4rem }` and `scroll-mt-16`. A fragment lands 128 px down, inside the band's own top air, which reads as intended now that bands have padding. `#how-it-works` lands with its heading `band + seam` further down; acceptable, and the header is dark over the curve at that moment.

### 4.3 Card recipes

Plain strings in `section-styles.ts`, hand-ordered, never `cn()`:

- `card = 'rounded-(--radius-card) bg-surface shadow-card'`: white on the wash or on white.
- `cardWash = 'rounded-(--radius-card) bg-surface-wash'`: the wash on white (Straight answers, FAQ closed).
- `cardInk = 'rounded-(--radius-card) bg-surface-muted shadow-card-ink'`: inside the dark scope `bg-surface-muted` is `--ink-card`.
- `cardPad = 'p-5 md:p-7'`; phones use `p-4` where a section says so.
- `well = 'rounded-2xl bg-surface p-4 md:p-5'`: a cell inside a card that takes the ground colour (inside the dark scope, a darker well; on white, a white cell).
- `iconDisc = 'grid size-12 shrink-0 place-items-center rounded-full bg-surface text-brand-ink'`.

Elevation: on light, `--shadow-card`; on dark, the surface step plus the inset top light. No card has a border.

### 4.4 The seam treatment between every pair of bands

| Pair                                  | Treatment                                                         | Mechanism                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| hero, `#work`                         | shared ground                                                     | `.ink-stretch`'s 4rem top feather (`#02111e` to `#020a12`) meets the hero's still edges under reduced motion and its flat foot after the rise                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `#work`, `#included`                  | air                                                               | same ground, `--spacing-band`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `#included`, `#how-it-works`          | shape: the pooled edge                                            | `.ink-stretch { position: relative; margin-bottom: -seam; border-radius: 0 0 50% 50% / 0 0 seam seam }` paints over the walkthrough band's top; `#how-it-works` is not positioned and carries `.under-ink`. The stretch has no z-index, so it is not a stacking context (constraint 36 is about the stage's ancestors; the stretch is a sibling branch). The sticky stage, positioned later in the DOM, paints above the stretch but never enters the overhang: its initial position is below `band + seam` of padding and sticky only ever moves it down the page |
| `#how-it-works`, `#real-build`        | same family, air                                                  | the band's gradient ends on `--surface-wash` well before its foot; Real build is flat wash                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `#real-build`, `#your-options`        | air                                                               | same ground                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `#your-options`, `#straight-answers`  | fade                                                              | `.wash-dissolve { background: linear-gradient(to bottom, var(--surface-wash) calc(100% - var(--spacing-band) * 1.5), var(--surface)) }` on `#your-options`                                                                                                                                                                                                                                                                                                                                                                                                         |
| `#straight-answers`, `#about`, `#faq` | air; the figure/ground flip (wash cards on white) says "new band" | `py-band`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `#faq`, `#cta`                        | object                                                            | white meets white; the closing's glow and phone are the next thing the eye lands on                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `#cta`, footer                        | shape: the sheet                                                  | `footer.sheet { position: relative; margin-top: -seam; top corners seam }` over the closing, which carries `.before-sheet`. The closing is `isolate` but the footer comes later in the DOM and paints over it; the closing's `overflow-hidden` keeps the ink inside its own box                                                                                                                                                                                                                                                                                    |

### 4.5 The hairline removal list (brief section 2, all 24 items)

| #   | Rule                                                                         | Replaced by                                                                                                                                                                                                           |
| --- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Page frame `border-x` (main and footer)                                      | deleted with `frame`; grounds run edge to edge, content in `shell`                                                                                                                                                    |
| 2   | `divide-y` between sections                                                  | ground changes, the two shapes, `--spacing-band`                                                                                                                                                                      |
| 3   | `sectionGrid` `md:divide-x`                                                  | `gap-x-10 lg:gap-x-14` between the heading column and the body; no empty rule column                                                                                                                                  |
| 4   | `cellGrid gap-px bg-border` + `hairlineCell`                                 | `gap-3 md:gap-5` between real cards (`cardInk`, `card`, `cardWash`); both recipes deleted                                                                                                                             |
| 5   | Included's three nested `bg-border` layers                                   | four `cardInk` job cards holding two `well`s each; all three layers go together                                                                                                                                       |
| 6   | Straight answers `gap-px bg-border`                                          | `gap-5` between `cardWash` cards                                                                                                                                                                                      |
| 7   | Real build `divide-y border-t`                                               | `gap-4` rows, the numeral column and the rail (a drawn object beside the rows, never between them)                                                                                                                    |
| 8   | Your options `divide-y border-y`                                             | four `card` rows on the wash, `gap-4`                                                                                                                                                                                 |
| 9   | `bandEdge` gradient hairlines                                                | deleted (knip); the wash ground is the band                                                                                                                                                                           |
| 10  | Walkthrough stage `md:border-l`, inner `border-y`, dot grid                  | the white panel with `md:rounded-(--radius-panel) md:shadow-panel`; a resting glow replaces the dots                                                                                                                  |
| 11  | `CornerTicks` at the stage                                                   | removed from the home usage; the component stayed for `/start` until 24 September 2026, when `/start` dropped it and the file was deleted (ADR 0035)                                                                  |
| 12  | AddressCard `border border-border bg-surface-muted`                          | `card p-5` (both states designed, section 7.7)                                                                                                                                                                        |
| 13  | FAQ `divide-y`, `py-4 first:pt-0 last:pb-0`                                  | seven `cardWash` details with `gap-3`                                                                                                                                                                                 |
| 14  | Footer `border-t`, `md:divide-x`, identity `border-t`                        | the dark ground, `gap-10` columns, the wordmark                                                                                                                                                                       |
| 15  | Header `border-b border-on-surface/10`, inner `md:border-x` on `data-framed` | `shadow-header` alone; the inner column and its observer deleted                                                                                                                                                      |
| 16  | Header nav rule `h-px w-8 bg-current opacity-30`                             | kept: it is the nav's own chrome, not a grid line                                                                                                                                                                     |
| 17  | Mobile nav `border-b border-border`; hamburger `border-current/30`           | kept as controls: the drawer's edge (in the dark twin it is `--ink-line`) and the button's ring                                                                                                                       |
| 18  | Work radio pills `border border-border`                                      | the borderless segmented track (section 7.1)                                                                                                                                                                          |
| 19  | Call agenda `marker:text-border`                                             | `marker:text-on-surface-muted`                                                                                                                                                                                        |
| 20  | Progress unreached `bg-border`                                               | `bg-on-surface/12` (shared with `/start`; reads on both grounds)                                                                                                                                                      |
| 21  | Frame chrome `border-(--sketch-line)`                                        | KEPT: it is the illustration, recoloured by the scope                                                                                                                                                                 |
| 22  | Hero prompt                                                                  | untouched in this plan; on 24 September 2026 the field became a wash pill with the authored `brand-ink` outline and the box took `shadow-card`, its height unchanged (ADR 0031 and ADR 0034, amendments of that date) |
| 23  | Glow layers                                                                  | the closing's GlowBackdrop stays; new glows are `--backlight`, the panel's resting glow, `--glow-corner`                                                                                                              |
| 24  | `commercialBand bg-surface-tint`                                             | deleted; the wash is the ground of three bands and the "three bands max" rule is amended in the ADR                                                                                                                   |

### 4.6 The new `section-styles.ts` recipe set

```ts
// Type
export const displayHeading = 'text-display font-semibold text-balance'
export const titleHeading = 'text-title font-semibold text-balance'
export const stepHeading = 'text-subtitle font-semibold text-balance'
export const cardHeading = 'text-heading font-semibold'
export const numeral = 'text-numeral font-extrabold tabular-nums'
export const jobWord = 'text-jobword font-bold'
export const sectionLead = 'text-lead text-pretty text-on-surface-muted'
export const cardBody = 'text-body text-pretty text-on-surface-muted'

// Shell
export const shell = 'mx-auto w-full max-w-7xl px-6 md:px-10'
export const headingBlock = 'flex max-w-3xl flex-col gap-3'
export const sectionGrid = 'grid gap-10 md:grid-cols-6 md:gap-x-10 lg:gap-x-14'
export const stickyColumn = 'md:sticky md:top-24 md:self-start'
export const headingColumn = `flex flex-col gap-3 md:col-span-2 ${stickyColumn}`

// Surfaces
export const card = 'rounded-(--radius-card) bg-surface shadow-card'
export const cardWash = 'rounded-(--radius-card) bg-surface-wash'
export const cardInk = 'rounded-(--radius-card) bg-surface-muted shadow-card-ink'
export const cardPad = 'p-5 md:p-7'
export const well = 'rounded-2xl bg-surface p-4 md:p-5'
export const iconDisc =
  'grid size-12 shrink-0 place-items-center rounded-full bg-surface text-brand-ink'
```

Deleted (knip): `commercialBand`, `bandEdge`, `cellGrid`, `hairlineCell`, `stepRow`, `stepNumber`, `trailingNote`. `revealDelay` stays (the CSS reveal and the glow-corner placement both read `--i`). Site-wide swaps done by the foundation step: `text-brand-deeper` as text becomes `text-brand-ink` (`work.tsx:119`, `about.tsx:14,32`, `straight-answers.tsx:38`, `faq-entry.tsx:24,28`, `text-link.ts:3`, `choice-card.tsx:46`, `progress-steps.tsx:20` as `bg-brand-ink`, and the active-step rule in globals); `ring-brand-deeper` / `outline-brand-deeper` become `ring-brand-ink` / `outline-brand-ink` (`button.tsx:8`, `faq-entry.tsx:24`, `work.tsx:29`, `layout.tsx:48`, `site-header.tsx:24`).

---

## 5. Header

The two-state machine (`data-scrolled`, then `data-solid` and `data-filled` after `headerStepMs`, reversed on the way out) and the difference blend over the hero are untouched. `data-framed` and its observer are deleted. One attribute is added, `data-over-dark`, on the `group contents` wrapper.

### 5.1 The states

|                        | A: over the hero's top (no `data-solid`)              | B: solid over light (`data-solid`)                                                                                                                                  | C: solid over dark (`data-solid` + `data-over-dark`)                                                              |
| ---------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Surface layer          | hidden                                                | `bg-surface/92 backdrop-blur-lg shadow-header`; the `border-b border-on-surface/10` is removed                                                                      | the same classes; the scope rule makes it `rgb(2 10 18 / 0.92)` with blur; `shadow-header` invisible and harmless |
| Wordmark and links     | `text-surface mix-blend-difference`, hover opacity 60 | `--on-surface` navy                                                                                                                                                 | `#e2eef7` (at least 14:1 over any dark ground under it); nav rule `bg-current/30` follows                         |
| Ask                    | text link                                             | filled `bg-brand-deeper text-on-brand` (5.93); `.header-ask` hold unchanged                                                                                         | same fill and ink (5.93; fill edge vs the bar 3.36)                                                               |
| Mobile CTA (past hero) | hidden                                                | primary `sm`                                                                                                                                                        | primary `sm`                                                                                                      |
| Hamburger              | `border-current/30`                                   | follows                                                                                                                                                             | follows                                                                                                           |
| Transition             |                                                       | `transition-[background-color,color] duration-(--motion-enter) ease-standard` on the surface layer and the header: colour only, so it runs under reduced motion too | same                                                                                                              |

The re-assignment is gated on `data-solid` (the selector in section 2.3 is `[data-solid][data-over-dark]`), so the blend state over the hero, whose text is `text-surface`, never sees a dark `--surface`.

### 5.2 Detection (in `HeaderChrome`)

```ts
// Two sources, ORed: any dark band under the bar's middle, or the hero's own dark foot.
const dark = new Set<Element>()
const mid = Math.round(headerPx / 2)
let bands = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) dark.add(entry.target)
      else dark.delete(entry.target)
    }
    apply()
  },
  { rootMargin: `-${String(mid)}px 0px -${String(window.innerHeight - mid - 1)}px 0px` },
)
for (const band of document.querySelectorAll('[data-theme="dark"]')) bands.observe(band)
// The hero's foot: dark once no more than heroDarkFootShare of the hero is still below the bar.
const heroDark = () => {
  if (hero === null) return false
  const box = hero.getBoundingClientRect()
  return (
    box.bottom > headerPx && box.bottom - headerPx <= box.height * CONFIG.motion.heroDarkFootShare
  )
}
const apply = () => root.toggleAttribute('data-over-dark', dark.size > 0 || heroDark())
```

`heroDark()` runs inside the existing scroll listener (one `getBoundingClientRect` per scroll event, after the `scrollY > 24` check) and `apply()` after it. The observer is rebuilt from a throttled resize (150 ms) because the margin bakes in the viewport height. A page that loads scrolled (a fragment link) is right at once: IO fires on observe and the scroll listener runs once on mount. `CONFIG.motion.heroDarkFootShare = 0.2`, tuned by eye against the ramp's plateau at 390 and 1440 during the build.

### 5.3 The mobile nav's dark twin

`mobile-nav.tsx` changes nothing but the ring colour: the panel is inside the wrapper, so under state C `bg-surface` is the foot, links are `#e2eef7`, `hover:bg-accent` is `--ink-card`, `border-b border-border` is `--ink-line` (kept: it is the drawer's edge, a control), and the panel's CTA is the primary button on the panel ground (3.36 non-text, 5.93 text). Escape and focus return are untouched. With the menu open the `group-has-[[aria-expanded=true]]` rules already force `text-on-surface` and normal blending, so an open panel over the hero's top is white and over a dark band is dark, which is right. (Corrected 24 September 2026: the menu is now a sheet of ink that blooms from its button, and those two utilities are retired from `header-chrome.tsx`. The normal blend and the full-width row are keyed on the menu root's `data-menu` in `app/_styles/header.css`, which outlasts `aria-expanded` by the drain; the dark scope still follows the button. ADR 0034, amendment "the menu is ink".)

### 5.4 Tests kept

nav "Main", the "Menu" button, nav "Mobile" with the CTA, Escape closes and returns focus, the header CTA hidden until `#hero-cta` has scrolled past and hidden again back at `#hero` at 390x844 (`data-past-hero` is untouched), `#hero-cta` inside the first phone and tablet screen.

---

## 6. Motion infrastructure

Already in the tree, uncommitted, from the ADR 0034 scaffold: `loadScrollTrigger()` in `lib/motion/gsap.ts` (registers once, `ignoreMobileResize`), `whenScrolled()` in `lib/motion/idle.ts`, `onActiveLenis()` in `lib/motion/lenis.ts`, and the `scrollTrigger` lazy-chunk guard in `scripts/bundle-budget.mjs`. The foundation step keeps all four as they are and adds the leaf they expect.

### 6.1 The load trigger

`whenScrolled(cb)` (wheel, touchstart, keydown or scroll, whichever first) OR an `IntersectionObserver` on `#work` with `rootMargin: '50% 0px'`, whichever fires first; never idle alone. The hero is `min-h-svh`, so an un-scrolled Lighthouse audit never reaches `#work` at 50 per cent root margin, and its script total stays at about 220.3 KB against the 230,000 B line. Gate: `useMotionAllowed()` (false on the server and during hydration; the leaf renders nothing and creates nothing while it is false, and tears down on flip).

### 6.2 The one client leaf: `app/_components/page-choreography.tsx`

Rendered once in `page.tsx` after `PageMotion`. Its job is small so it rides the initial bundle cheaply (about 1.1 KB gzipped): the gate, the trigger, one dynamic import, and the settled bookkeeping. Everything authored rides the lazy chunk.

```ts
'use client'
// Boot: on the first scroll intent, load what the width needs and hand over to the modules.
useEffect(() => {
  if (!motionAllowed) return
  const main = document.getElementById('main')
  if (main === null) return
  let cancelled = false
  let stop: (() => void) | undefined
  const cancel = whenScrolledOrNear(main.querySelector('#work'), () => {
    const wide = window.matchMedia('(min-width: 48rem)').matches
    Promise.all([
      wide ? loadScrollTrigger() : loadGsap().then((gsap) => ({ gsap, ScrollTrigger: undefined })),
      import('@/app/_components/motion'),
    ])
      .then(([motion, { start }]) => {
        if (cancelled) return
        stop = start(main, motion)
      })
      .catch(() => {
        /* GSAP never arrives: the CSS reveal and the finished states carry the page */
      })
  })
  return () => {
    cancelled = true
    cancel()
    stop?.()
  }
}, [motionAllowed])
```

Below md the leaf loads GSAP core only (shared with the walkthrough, already cached on a motion phone that reaches the walkthrough) and never ScrollTrigger: phones get entrance choreography only (D5), and the only entrance CSS cannot author on a phone is the glyph draw-on, which needs no ScrollTrigger.

### 6.3 The motion modules: `app/_components/motion/`

`index.ts` exports `start(main, { gsap, ScrollTrigger })`, which:

1. Creates one `gsap.context` scoped to `main` and one `gsap.matchMedia()` with two conditions: `entrances: '(prefers-reduced-motion: no-preference)'` and `scrubs: '(prefers-reduced-motion: no-preference) and (min-width: 48rem)'`. Batch entrances are added under `scrubs` (md+); the phone path adds only the draw-on and the About tile's opacity beat.
2. If `ScrollTrigger` is present: `onActiveLenis((lenis) => lenis?.on('scroll', ScrollTrigger.update))`, `gsap.ticker.lagSmoothing(0)`, and `ScrollTrigger.refresh()` after `document.fonts.ready`, on the `walkthrough:ready` `CustomEvent` (dispatched on `window` from `HowItWorksTrack.markBuiltReady`, one line, owned by the how-it-works package), and from a throttled `ResizeObserver` on `main` (150 ms). Never `scrollerProxy`, `normalizeScroll`, ScrollSmoother, a pin, or `ScrollTrigger.killAll()`.
3. Calls each section module in order with a `SectionContext`. Amended 23 September 2026 by the director (as built by the foundation, `app/_components/motion/index.ts`, whose head comment is the contract): `{ gsap, ScrollTrigger, mm, root, own, settle, onInview }`. `own(group, { arm?, enter?, preempt? })` registers a `[data-reveal][data-choreo]` group under the executor contract below; every handler has a default (a rise from `riseRem` and `scaleFrom` over `tweenS` with `staggerS`; the pre-empt finishes over `--motion-settle`), so `own(group)` alone is the plain entrance, and a module overrides only the handler it changes. Handlers receive `Tools = { gsap, group, items, finish(vars?), clear(targets, props?), settle() }`; a custom `enter` must end by settling. `own` returns false and does nothing when the group already has `data-inview` or when `ScrollTrigger` is absent. `settle(group)` reports it finished. `onInview(group, cb)` is the phone-only beat: it runs `cb` once when someone sets `data-inview` on the group and returns false (doing nothing) if the group is already in view. Modules wrap their work in `mm.add(CONDITIONS, (media) => ...)` and read `media.conditions?.scrubs` or `media.conditions?.entrances`; `CONDITIONS` is exported from `index.ts`.
4. Sets `html[data-choreo]` once every module has set its initial states, and `html[data-motion-settled]` once every owned group has settled (or `CONFIG.motion.choreo.settleFailSafeMs` later). If no group is owned at arm time (a page already revealed by the fail-safe or by the a11y test), `data-motion-settled` is set immediately.
5. Returns `stop()`: `ctx.revert()` (kills only its own tweens and triggers and clears its inline styles), disconnects the observers, removes both attributes.

Each section module (`work.ts`, `included.ts`, `how-it-works.ts`, `real-build.ts`, `your-options.ts`, `straight-answers.ts`, `about.ts`, `faq.ts`, `closing.ts`, `footer.ts`) exports one function `(ctx: SectionContext) => void`, imports only types from `@/lib/motion/gsap`, never `gsap` itself (the ESLint boundary stands), reads its numbers from `CONFIG.motion.choreo`, and touches only elements inside its own section (`ctx.root.querySelector('#work')` and so on). The foundation step creates all ten as empty stubs so the packages never touch each other's files.

### 6.4 The executor contract (D6)

`[data-reveal]` to `data-inview` stays the source of truth for hidden-until-seen states. The choreography owns a group only when it carries `data-choreo="<name>"`. For an owned group:

- At arm time, the module skips any group that already has `data-inview` (on screen at boot, revealed by PageMotion's observer, by its 4,000 ms fail-safe, or by the a11y test's `settled()`): nothing is ever hidden that was already shown. Otherwise it `gsap.set`s the items' initial state (`y`, `scale`, `opacity`) and creates a `ScrollTrigger` at `CONFIG.motion.choreo.enterStart` (`'top 94%'`, a few pixels earlier than PageMotion's `-10%` line so the leaf normally wins the race), `once: true`.
- On enter, the module sets `data-inview` on the group (so the CSS finished state is in place under the inline styles) and tweens the items, ending with `clearProps: 'transform,opacity'` (never `'all'`, constraint 32) and `ctx.settle(group)`.
- A `MutationObserver` on every owned group watches `data-inview`. If anyone else sets it first, the module tweens the items to their finished state over `--motion-settle` (300 ms), clears by name, and settles the group. So the fail-safe, `settled()` and a fast flick all end in the CSS finished state, never a stuck opacity 0.
- `html[data-choreo] [data-reveal][data-choreo] > * { transition: none }` keeps CSS out of GSAP's way on owned groups (section 2.4).
- Scrubs (the rail fill, the wordmark) and the draw-on never hide content: they are created without ownership and need no settle.

`e2e/a11y.spec.ts`'s `settled()` gains one wait, in the same PR:

```ts
// The scroll choreography, once armed, owns some reveals; wait for it to have finished them.
await page.waitForFunction(() => {
  const html = document.documentElement
  return !html.hasAttribute('data-choreo') || html.hasAttribute('data-motion-settled')
})
```

It runs after the `data-inview` loop as today. Because `settled()` marks every group before axe's own scrolling loads the leaf, the leaf arms with nothing to own and sets `data-motion-settled` at once; the wait is for the ordinary case where a human-speed scroll armed it first.

### 6.5 Reduced motion, phones and no JS

- Reduced motion: `useMotionAllowed()` is false, so the leaf renders nothing; `gsap.matchMedia` is the second belt. Every finished state is the server markup (numerals reached, rail full, glyphs drawn, cards visible). Colour and opacity beats (the header flip, the active step, the FAQ light, the backlight, the reached numerals) still run through CSS transitions the global allowlist permits.
- Phones (below md): GSAP core only; every card group uses the CSS reveal (`data-reveal` without `data-choreo` below md is simplest: the modules only claim groups inside the `scrubs` condition, so below md the attribute is inert); the Included draw-on and the About tile's opacity fade fire from a `MutationObserver` on the group's `data-inview`.
- No JS: `html[data-motion]` is never set, nothing is hidden, the radios, the details and the anchors work natively.

### 6.6 `CONFIG.motion` additions (`lib/config.ts`)

```ts
motion: {
  staggerMax: 4,
  headerScrolledAtPx: 24,
  headerStepMs: 200,
  // The header goes dark once this share of the hero, or less, is still below the bar.
  heroDarkFootShare: 0.2,
  scroll: { lerp: 0.1, scrubLag: 0.6 },
  // The scroll choreography below the hero (ADR 0034). Entrances are batch tweens on lists the
  // choreography owns; the numbers sit inside `caps`, which the ADR records and a reviewer can check.
  choreo: {
    enterStart: 'top 94%',
    railStart: 'top 60%',
    tweenS: 0.8,
    staggerS: 0.08,
    riseRem: 2.5,
    scaleFrom: 0.96,
    tiltDeg: 1,
    drawS: 0.9,
    glyphStaggerS: 0.05,
    parallaxRem: 2.5,
    settleFailSafeMs: 4000,
  },
  caps: { translateRem: 2.5, scaleFrom: 0.94, tweenMs: 900, staggerMs: 80, parallaxRem: 6 },
},
```

Caps (D12), recorded in the ADR: entrances translate up to 2.5rem, scale 0.94 to 1, a single tween up to 900 ms, stagger up to 80 ms, parallax layers up to 6rem at md+; never animate width, padding, margin, inset, font axes, letter-spacing, box-shadow, filter, the H1, any `.over-ink` wrapper, or any ancestor of the walkthrough stage or of a sticky column. Properties this plan animates: `y`, `scale`, `opacity`, `rotate` (one degree), `scaleY` on a decorative rail, `strokeDashoffset` on decorative SVG paths, `clip-path` on the two lane heads.

### 6.7 `scripts/bundle-budget.mjs`

- The `scrollTrigger` lazy guard stays as written.
- New `fonts` entry for `/`: collect every `<link ... as="font" ...>` tag in the prerendered HTML, read its `href`, sum `statSync(assetPath(href)).size` (woff2 is already compressed; raw bytes as served), compare with `64_000`. Print it on the same `ok`/`OVER` line as the others.
- Stylesheet line for `/` and `/start`: provisional 18,000 B, replaced by the measured number plus at least 70 B rounded up to the next 500 (section 9.4). Scripts stay at 216,000 unless the measured initial total exceeds it, in which case 218,000 on the record.

---

## 7. Sections 1 to 9 and the footer

Common to all: the executor contract in 6.4; `scroll-mt-16` on the eight anchored sections; `shell` for content; `titleHeading` for every H2; the CSS reveal for heading blocks (`data-reveal` on the heading block's wrapper) everywhere; ScrollTrigger only at md+; nothing inside `#how-it-works` but a heading reveal. "Pins" quotes the brief's section 3 verbatim.

### 7.1 `#work` (dark)

**Layout.** Section `pt-band-sm pb-band` with `style={NEUTRAL.vars}` staying on the `<section>` (inside the scope, so the frames take the dark bezel). `shell`, then:

- 1440: `headingBlock` (H2 in `--on-ink`, lead in `--on-ink-muted`, 10.31); `ul data-reveal data-choreo="tiles" className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 md:mt-14 md:gap-5 lg:grid-cols-3"` (Amended 23 September 2026 by the director, A2: one column at phone width, two from `sm` at 640 px, three from `lg`); six `li className="group/card relative isolate flex flex-col gap-4 ${cardInk} ${cardPad} transition-colors duration-(--motion-tap) focus-within:bg-surface-tint hover:bg-surface-tint"` (isolate is fine: nothing sticky or over-ink inside). Inside, in DOM order: the segmented control, the backlight, the frames, the words.
  - The segmented control: `fieldset className="inline-flex self-center rounded-full bg-surface p-1"` (inside the scope, a darker well) with `legend.sr-only` and two `label className={SEGMENT}` where `SEGMENT = 'cursor-pointer rounded-full px-3 py-1 text-label font-medium text-on-surface-muted transition-colors duration-(--motion-tap) has-[:checked]:bg-on-surface has-[:checked]:text-surface has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-ink has-[:focus-visible]:ring-offset-2'` (28 px tall, no border; the checked pill is light with dark text, 16.88).
  - The backlight: `div aria-hidden className="pointer-events-none absolute inset-x-0 top-12 -z-1 h-3/5 bg-radial-[at_50%_40%] from-(--backlight) to-transparent to-70% opacity-0 transition-opacity duration-(--motion-reveal) group-hover/card:[--backlight:rgb(44_213_255/0.32)] group-[[data-inview]]/list:opacity-100"` (the group name `list` is on the `ul`; the layer fades in with the reveal, a colour beat that survives reduced motion; hover raises the alpha, colour only).
  - The phone frame (`PhoneFrame className="aspect-auto w-full max-w-56"`) or the browser frame, toggled exactly as today by `group-has-[input[value=desktop]:checked]/card`.
  - h3 `cardHeading`, trade `captionStyles`, did `text-small text-on-surface-muted`, result `text-small font-medium text-brand-ink` (6.34 on the card), host and date `captionStyles mt-auto`, the visit link `tapLinkStyles`.
  - Trailing block `mt-10 flex flex-col items-start gap-4 md:mt-12`: the group note (`captionStyles`) and the `lg` primary button on the band ground.
- 768: two columns, `cardPad` becomes `p-4`, phones `max-w-48`.
- 390: Amended 23 September 2026 by the director (A2): ONE column (`grid-cols-1`), `gap-3`, tiles `rounded-2xl p-4`, phones `max-w-48` (192 px, under the 224 px ceiling), the control above the frame, captions `text-label`, the button `w-full`. The two-up phone layout is withdrawn; the phone soft line (9.4) is reported either way. Amended again 24 September 2026 (ADR 0034, amendment 4): below 640 px on a touch screen the six tiles are one rail, swiped a tile at a time, with a dot per site under it; the column stays for a fine pointer, a zoomed desktop and print.

**Grounds and type.** Band `#020a12`; tiles `#021b2c` with the inset top light; H2 600 in `--on-ink`; the six real captures are the band's colour.

**Choreography.**

- Heading block: CSS reveal (`data-reveal`), so the night with white type reads first (editorial's beat).
- Tiles, md+ (`work.ts`): the group is owned; initial `y: 40, scale: 0.96, opacity: 0`; on enter `ScrollTrigger.batch` over the six `li`, `to { y: 0, scale: 1, opacity: 1, duration: tweenS, ease: 'power3.out', stagger: staggerS }`; the backlights ride the same batch (opacity 0 to 1 over 0.9 s starting 0.2 s in), and their `opacity-100` class state is set by `data-inview` anyway.
- Phones: CSS reveal, 70 ms stagger, backlight by the `data-inview` class.
- Reduced motion: opacity only; backlight fades in. No JS: everything visible, radios work by `:has()`.

**Pins (verbatim).** "`#work` contains exactly 6 `<li>` (the test counts every listitem inside `#work`, so no nested lists), 6 links `/^Visit the .* site$/` with https hrefs, 6 visible images (the desktop capture sits inside a `hidden` div), 6 dated captions, the Phone/Desktop native radios with `data-frame="phone"` / `data-frame="browser"`, and a "Show me my three designs" link to `/start`." "Work captures are fixed assets ... max rendered 400 px desktop / 224 px phone before upscaling." (D9.)

**Acceptance.** Screenshot at 1440: no visible edge between the hero's foot and the band; six dark tiles with a soft cyan pool behind each phone; the checked pill is light on dark; the result lines are cyan; the button is navy with white text on the band, not on a tile. At 390: one column (Amended 23 September 2026 by the director, A2), phones 192 px wide, no text wall (trade, did, result and the link each on their own lines with room); on a touch screen, from 24 September 2026 (ADR 0034, amendment 4), one rail, each tile on the 24 px line, the next peeking, a dot per site. Tests: `home.spec` Work block, `mobile.spec` `scrollWidth === 390`, axe zero violations with the `target-size` of the 28 px pills.

### 7.2 `#included` (dark)

**Layout.** `pt-band pb-[calc(var(--spacing-band)+var(--seam))]`, `shell`.

- 1440: `headingBlock`; `ul data-reveal data-choreo="jobs" className="mt-10 grid gap-5 md:mt-14 md:grid-cols-2 lg:grid-cols-4"` of four `li className="flex flex-col gap-5 ${cardInk} ${cardPad}"`: the glyph (`lucide` `Search` / `ShieldCheck` / `MessageCircleQuestion` / `Smartphone`, `aria-hidden`, `className="job-glyph size-10 text-job-found"` and so on, `strokeWidth={1.5}`), the job word (`p className="${jobWord} text-job-found"` with the existing label string: Found, Trusted, Answered, Reachable), the scene (`p className="text-body text-pretty text-on-surface"`), then the pair `ul className="mt-auto grid grid-cols-2 gap-3 lg:grid-cols-1"` of two `li className="flex flex-col gap-2 ${well}"` (h3 `cardHeading`, body `cardBody`, 9.09). The caption under the grid, `mt-10 ${captionStyles}`.
- 768: `md:grid-cols-2`, inner pair stacked (side by side the wells were 141 px wide and the titles wrapped; changed at the review pass).
- 390: one column, cards `rounded-2xl p-4`, inner pair stacked for the same reason (149 px wells), glyph `size-8`, job word at the clamp floor (28 px).

**Grounds and type.** Cards `#021b2c`, wells `#020a12` (the ground showing through the card: the mosaic). The four hues are the ramp's own: cyan, indigo, sky and ice, all at 6.7:1 or better on the card; the job word is the largest text in the band and the band's colour moment.

**Choreography.**

- md+ (`included.ts`): owned batch as Work (y 40, scale 0.96, stagger 80 ms, 0.8 s). The draw-on: at arm time, for every `path, circle, line, polyline, rect` inside `.job-glyph`, set `strokeDasharray` and `strokeDashoffset` to `getTotalLength()`; the batch brings `strokeDashoffset` to 0 over `drawS` (0.9 s) `power2.inOut`, `glyphStaggerS` within a glyph, then clears both by name.
- Phones: the cards use the CSS reveal; the draw-on fires from a `MutationObserver` on the group's `data-inview` (GSAP core only). The dash is set only when the group is not yet `data-inview` at arm time.
- Reduced motion and no JS: glyphs drawn, cards visible.

**Pins.** "H3 counts fixed: `#included` 8 ... Card titles stay h3; eyebrows and numerals must be `p`/`span` (aria-hidden if decorative)." "8 h3 in `#included`, visible with JS off." The job word is a `p`; the nested `ul` is allowed here (only `#work` counts every listitem).

**Acceptance.** Screenshot at 1440: four dark cards, four coloured glyphs with a word in the same hue under each (28 to 40 px), two darker wells at the foot of each card, the eight h3s level across the band; the band's foot curves down into the wash with the pale ground visible in both corners. Tests: `no-script.spec` 8 h3, axe (glyph hues decorative; the word text at or above 6.7:1).

### 7.3 `#how-it-works` (wash; D8, mechanics untouched)

**Layout.** `section className="walkthrough-band under-ink scroll-mt-16 pb-band"`, `shell` around the track. The section's CSS, in `app/_styles/how-it-works.css` (Amended 23 September 2026 by the director, A1; the `/* ==== how-it-works ==== */` banner below is that file's comment line):

```css
/* ==== how-it-works ==== */
.walkthrough-band {
  background: linear-gradient(
    to bottom,
    var(--surface-wash-deep),
    var(--surface-wash) calc(var(--spacing-band) + var(--seam) + 6rem)
  );
}
```

The gradient ends 6rem into the content, inside the heading cell at every width, so no step title ever sits on the deep top (brand-ink is 4.20 there). Inside `HowItWorksTrack`: the grid, the heading cell, `sticky top-16 z-10 md:top-24 md:col-span-3 md:col-start-4 md:row-span-2 md:self-start`, `data-stages`, `STEP_ROOM`, `[zoom:1.1] md:[zoom:1.5]`, `anchorShare` and the caption's `min-h-9` are byte-identical. Changes:

- The sticky wrapper loses `md:border-l md:border-border`.
- The inner panel becomes `relative isolate flex flex-col items-center gap-3 overflow-hidden bg-surface px-6 pt-4 pb-3 md:min-h-[60vh] md:justify-center md:rounded-(--radius-panel) md:py-12 md:shadow-panel` (`border-y` and `bg-surface-muted` gone; on phones it is a full-width white strip with no radius and no shadow, so the geometry the mobile test pins is unchanged).
- The dot-grid `div` is replaced by a resting glow `div aria-hidden className="absolute inset-0 -z-1 bg-radial-[at_50%_75%] from-glow/14 to-transparent to-70%"`; the `--sketch-glow` layer stays.
- `CornerTicks` is removed from this file (the component stayed for `/start` until 24 September 2026, when `/start` dropped it and the file was deleted, ADR 0035).
- `ProgressSteps`: reached `bg-brand-ink`, unreached `bg-on-surface/12`.
- `markBuiltReady` dispatches `window.dispatchEvent(new CustomEvent('walkthrough:ready'))` after `setBuiltReady(true)`.
- The heading: `<h2 className={\`${titleHeading} emphasis\`}>{emphasised(HOW_IT_WORKS.heading, HOW_IT_WORKS.emphasis)}</h2>`in`how-it-works.tsx`; the heading block carries `data-reveal`.
- The active-step rule in globals moves to `color: var(--brand-ink)` (5.03 on the flat wash).
- Step titles `stepHeading` 600.

1440 and 768: today's proportions. 390: today's stack.

**Choreography.** Heading block: CSS reveal. Steps: none added (no y-tween on the `ol` or its `li`s, constraint 36); the active-step colour transition is the choreography, as today. No ScrollTrigger inside the section; `how-it-works.ts` exists only to keep the module set complete and does nothing. Reduced motion and no JS: the finished sketch, "Question 5 of 5".

**Pins (verbatim).** "`#how-it-works` pins: exactly one "Question N of 5", no `/^Question \d$/`, `[data-wire="headline-slot"]`, `data-stages` on each step, caption "Built as an illustration. Not a client, not one of the designs.", built headline "Gardens that grow with you.", reaches built state when `#real-build` is scrolled into view and rewinds at `#included`; at 390x844 the phone frame sits between y 64 and 844 and is > 300 px tall with step 3 in view." "No ancestor of a sticky element ... may have `overflow` other than `visible` or `clip`." "No transform/scale on any ancestor of the walkthrough stage at build or rebuild time." "Per-step styling for the five walkthrough steps goes in `globals.css`."

**Acceptance.** Screenshot at 1440: the dark curve above, the pale wash under it, the H2 with "look" in the serif italic, a white rounded panel with a faint cyan halo holding the phone, no ticks, no dots, no left rule; the active step title in blue on the flat wash. At 390: the white panel edge to edge under the header, no corners. Tests: every `home.spec` walkthrough assertion, `mobile.spec` frame geometry, `reduced-motion.spec` finished state.

### 7.4 `#real-build` (wash)

**Layout.** `bg-surface-wash py-band`, `shell`, `sectionGrid`.

- 1440: `headingColumn` (sticky) with H2, lead, the `contrast` `lg` call button (`#0f172a` on the wash, 15.14) and the call promise. Body `md:col-span-4`: `ol data-reveal data-choreo="steps" className="relative flex flex-col gap-4"`; behind the numeral column the rail `div aria-hidden className="rail absolute top-4 bottom-4 left-[2.6rem] hidden w-0.5 rounded-full bg-on-surface/10 md:block"` with a child `div className="rail-fill absolute inset-0 origin-top rounded-full bg-brand-ink"`; each `li className="grid grid-cols-[5.5rem_1fr] items-start gap-x-6"`: the numeral `span aria-hidden data-reached className="${numeral} text-on-surface-muted transition-colors duration-(--motion-settle) data-reached:text-brand-ink"` (`01` to `05`), then `div className="flex flex-col gap-2 ${card} ${cardPad}"` with h3 `cardHeading`, body `cardBody`, and under step 1 the agenda `ul` with `marker:text-on-surface-muted`.
- 768: the same grid, numeral column `4.5rem`, numerals at the clamp floor (40 px).
- 390: `li flex flex-col gap-2`; the numeral above its card at `text-title` size (`numeralSm = 'text-title font-extrabold tabular-nums'` local to the file); no rail.

In `app/_styles/real-build.css` (Amended 23 September 2026 by the director, A1): `.rail-fill { transform: scaleY(1) }` is the default (finished); the module alone sets it to 0.

**Choreography.**

- md+ (`real-build.ts`): the rail fill is a scrub, `fromTo('.rail-fill', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: ol, start: railStart, end: 'bottom 60%', scrub: scroll.scrubLag, invalidateOnRefresh: true } })`. Each numeral: the module removes `data-reached` from every numeral whose row's trigger has not been passed, then creates one `ScrollTrigger` per row at `railStart` with `onEnter` adding and `onLeaveBack` removing `data-reached`; the colour beat itself is CSS. Rows: owned batch (y 40, opacity, stagger 80 ms).
- Phones: server markup is finished (all five reached, no rail), rows use the CSS reveal. The finished-by-default pattern (ADR 0005 d1) means reduced motion, no JS, and phones all show the same state with no extra rule.
- Reduced motion: all reached, rail full (the leaf never mounts).

**Pins (verbatim).** "`#real-build` shows "We agree a timeline on the call." and a "Book a 20-minute call" link to cal.com; the hero has zero such links and the page's first one goes to cal.com." "H3 counts fixed: ... `#real-build` 5."

**Acceptance.** Screenshot at 1440 mid-scroll: 40 to 72 px numerals in the muted slate turning blue as a thin blue line fills beside them; white cards on the wash with no rules; the navy call pill in the sticky column. At 390: numerals above each card, no rail, all blue. Tests: `home.spec` real-build block, `reduced-motion.spec` (no transform animation running after every section is scrolled: the rail is never created), axe (numerals are aria-hidden and at or above 40 px; both states pass 3:1).

### 7.5 `#your-options` (wash, dissolving)

**Layout.** `section className="wash-dissolve scroll-mt-16 pt-band pb-[calc(var(--spacing-band)*1.5)]"`; the section's CSS, in `app/_styles/your-options.css` (Amended 23 September 2026 by the director, A1):

```css
/* ==== your-options ==== */
.wash-dissolve {
  background: linear-gradient(
    to bottom,
    var(--surface-wash) calc(100% - var(--spacing-band) * 1.5),
    var(--surface)
  );
}
```

- 1440: `sectionGrid`; `headingColumn` with H2, lead and the agency line. Body `md:col-span-4`: the aria-hidden visual header `div className="hidden md:grid md:grid-cols-[1fr_2.4fr] md:gap-x-6"` with an empty cell and `div className="grid grid-cols-2 gap-4"` of two identical lane heads `span className="lane-head rounded-full bg-surface px-4 py-2 text-center text-small font-semibold shadow-card"`; then `div data-reveal data-choreo="rows" className="mt-4 flex flex-col gap-4"` of four `div className="grid gap-4 ${card} ${cardPad} md:grid-cols-[1fr_2.4fr] md:gap-x-6"` with h3 `cardHeading` and `dl className="grid gap-4 md:grid-cols-2 md:gap-x-6"` of two `div { dt, dd }`: `dt` in `eyebrowStyles md:sr-only`, **both** `dd` in `text-body text-pretty text-on-surface` (today's muted builder lane was a weighting; D10 removes it). The two notes under the rows: `mt-6 flex flex-col gap-2 text-small text-on-surface-muted`.
- 768: same; lane heads and answers two-up inside each card.
- 390: cards stack; each `dd` under its `dt` eyebrow.

**Choreography.**

- md+ (`your-options.ts`): the rows are an owned batch (y 40, opacity, stagger 80 ms); the two lane heads draw on together in one tween, `fromTo('.lane-head', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.6, ease: 'power3.out' })` at `enterStart`, both at once so neither lane leads (the CAP point made in motion).
- Phones: CSS reveal. Reduced motion and no JS: visible, heads unclipped (the clip is set only by the module).

**Pins (verbatim).** "`#your-options` shows "You build it with a builder" and "We build it with you" as visible text on desktop, names no builder, keeps `dl/dt/dd` rows (div wrappers allowed)." "Your options carries no visual weighting of the studio lane and no quality words; the builder lane stays neutral (CAP Code section 3; comparative advertising). Not overridden by the brief." "H3 counts fixed: ... `#your-options` 4."

**Acceptance.** Screenshot at 1440: two identical white lane pills, four white cards with the question left and two answers in the same ink and size, the price row's £679 and £250 in plain body text, the wash fading to white under the notes. Tests: `home.spec` heads visible at 1440, no `/Wix|Squarespace/`, axe `definition-list` and `dlitem`.

### 7.6 `#straight-answers` (white)

**Layout.** `bg-surface py-band`, `shell`, `sectionGrid`; body `ul data-reveal data-choreo="answers" className="grid gap-5 md:col-span-4 lg:grid-cols-2"` of four `li style={revealDelay(index)} className="glow-corner flex flex-col gap-4 ${cardWash} ${cardPad} lg:nth-[2n]:mt-10"`: the icon disc (`span aria-hidden className={iconDisc}` holding the lucide icon at `size-6`; brand-ink on white 5.93), h3 `cardHeading`, answer `cardBody` (6.43 on the wash). The icon leaves the h3 and sits above it; the heading text is unchanged. The right column sits 2.5rem lower (`lg:nth-[2n]:mt-10`) so the 2x2 floats rather than gridding. Amended 23 September 2026 by the director (A3): the white run (`#straight-answers`, `#about`, `#faq`) must read as a designed stretch, not as today's page. The offset cards and the corner glows here are REQUIRED, and this section's builder may add one further device inside the tokens (section 2) and the caps (6.6), in `app/_styles/straight-answers.css` and the component.

- 768: one column at md (the 4/6 body is about 470 px); two from lg.
- 390: one column, `p-5`, disc `size-10`, no offset.

**Choreography.**

- md+ (`straight-answers.ts`): owned batch with the tilt: from `{ y: 40, rotate: tiltDeg, opacity: 0, transformOrigin: '50% 100%' }` to `{ y: 0, rotate: 0, opacity: 1, duration: 0.85, ease: 'power3.out', stagger: staggerS }`, cleared by name. No hover tilt: the cards are not focusable and a hover promises a click (ADR 0026's rationale stands).
- Phones: CSS reveal. Reduced motion: opacity. No JS: visible.

**Pins (verbatim).** "H3 counts fixed: ... `#straight-answers` 4." "`mobile.spec.ts:75`": the four level-3 headings in `#straight-answers`.

**Acceptance.** Screenshot at 1440: four pale-blue cards on white, the right pair lower than the left, a white disc with a blue icon in each, a faint cyan light in one corner of each card at a different corner from its neighbour. Tests: `no-script.spec` and `mobile.spec` 4 h3; axe on the wash cards (body 6.43, h3 15.14).

### 7.7 `#about` (white)

**Layout.** `bg-surface py-band`, `shell`, `sectionGrid`.

- 1440: left column `flex flex-col gap-6 md:col-span-2 ${stickyColumn}` with H2, then the studio tile `div aria-hidden data-reveal="tile" className="glow-corner grid size-28 place-items-center ${cardWash}"` holding `LogoMark size={56} className="text-brand-ink"`, then, when `SITE.town !== null || SITE.contactEmail !== null`, the `AddressCard` restyled as `flex flex-col gap-4 ${card} p-5` (its `border border-border bg-surface-muted` dropped; `dt`s in `eyebrowStyles`, the mark in `text-brand-ink`). Right column `data-reveal flex flex-col gap-6 text-lead text-pretty text-on-surface-muted md:col-span-4` with the two `max-w-prose` paragraphs, the legal name `font-medium text-on-surface`.
- 768: same split.
- 390: heading, tile (`size-20`) and card stack above the paragraphs.

Both AddressCard states are designed: without the card the tile alone anchors the column; with it the card sits under the tile with `gap-6`. Both are verified in a worktree by setting `SITE.town` locally (question 22). Amended 23 September 2026 by the director (A3): the studio tile with its corner glow is REQUIRED, and this section's builder may add one further device inside the tokens and the caps, in `app/_styles/about.css` and the component.

**Choreography.**

- md+ (`about.ts`): the tile is `from { scale: 0.94, opacity: 0 }` 0.7 s `power3.out` on enter (not owned: the wrapper's `data-reveal` and the CSS reveal remain the truth; the module only adds the scale).
- Phones and reduced motion: the CSS reveal (opacity only under reduce). No JS: visible.

**Pins (verbatim).** "`/More than thirty websites since 2021/` visible, no `/Most agencies/` (`home.spec.ts:153-158`)."

**Acceptance.** Screenshot at 1440: the H2, a pale-blue rounded tile with the blue mark and a faint glow, two paragraphs at lead size; with `SITE.town` set locally, a white card under the tile with eyebrow labels. Tests: `home.spec` About block.

### 7.8 `#faq` (white)

**Layout.** `bg-surface py-band`, `shell`, `sectionGrid`; body `div data-reveal className="flex flex-col gap-3 md:col-span-4"` of seven `FaqEntry`. `faq-entry.tsx` still does not import `section-styles` and writes its classes out:

- `details className="faq glow-corner group rounded-(--radius-card) bg-surface-wash px-5 py-4 transition-[background-color,box-shadow] duration-(--motion-enter) ease-standard open:bg-surface open:shadow-card md:px-6 md:py-5"` with `style={revealDelay(index)}` on the entry (for `--i`).
- `summary`: as today with `rounded-md`, `font-semibold`, `group-open:text-brand-ink`, the ring `ring-brand-ink ring-offset-surface`; the lucide `Plus` (`size-5 shrink-0 text-on-surface-muted transition-[transform,color] duration-(--motion-enter) ease-standard group-open:rotate-45 group-open:text-brand-ink`) replaces `ChevronDown`.
- The answer `p` as today (`pt-3`, opacity fade).
- The light beat (in `app/_styles/faq.css`, Amended 23 September 2026 by the director, A1; the beat itself is REQUIRED under A3, and this section's builder may add one further device inside the tokens and the caps): the corner glow is hidden on a closed card and shown on an open one, `details.faq.glow-corner::before { opacity: 0; transition: opacity var(--motion-enter) var(--ease-standard) } details.faq[open].glow-corner::before { opacity: 1 }`. Open cards are white, so the glow paints over white (brand-ink 5.53, muted 7.07 at worst).

390: `px-4`, one column.

**Choreography.** Entrance: CSS reveal only (`faq.ts` does nothing). Native `::details-content` height transition as today; the plus rotates (snaps under reduce, which is right); the background, shadow and glow beats survive reduce.

**Pins (verbatim).** "`#faq` uses native `<details>/<summary>` with the answer in a `p`; entries start closed; opens natively with JS off; passes axe with all seven open." "`link-in-text-block` (inline links keep the underline)."

**Acceptance.** Screenshot at 1440 with the first entry open: seven pale-blue cards, the open one white with a soft shadow, a cyan corner light and a blue cross; closed ones show a grey plus. Tests: `home.spec` first entry closed then opens on click; `no-script.spec` opens; `a11y.spec` with all seven open, the `/privacy` link underlined.

### 7.9 `#cta` (white, the ink; D3)

Unchanged mechanics: `relative isolate overflow-hidden bg-surface px-6`, `GlowBackdrop`, `Ink`, the `.over-ink` runs, the `cta` button, the phone sketch, "Send this page". Changes: `py-section` becomes `pt-band before-sheet` (padding only); the H2 gains the `emphasis` class so its `em` takes the serif italic (a font-family rule creates no stacking context); `displayHeading` is 600 at the retuned tracking.

**Choreography.** md+ (`closing.ts`), opaque leaves only (constraint 41): the button's parent `div` `from { y: 16, opacity: 0 }` 0.6 s and the phone wrapper (`div.max-md:order-first`) `from { y: 40, opacity: 0 }` 0.9 s `power3.out`, both `clearProps: 'transform,opacity'` on complete, neither owned (they are not `[data-reveal]` groups and nothing here may be hidden from `settled()` longer than a tween). Never the H2 or any `.over-ink` element. Phones: the phone wrapper carries `data-reveal` for the CSS rise. Reduced motion: opacity via CSS. No JS: finished.

**Pins (verbatim).** "`#cta` keeps "Send this page" (button hydrated, `mailto:?subject=` link JS-off), zero textboxes, and the closing sketch that mirrors the hero's typed sentence." "The closing keeps an opaque white or near-white ground (`bg-surface` ...), `isolate`, `overflow-hidden`, a `relative` content wrapper, and only the four re-declared tokens for `.over-ink` text." "Nothing between an `.over-ink` element and `#cta` may create a stacking context."

**Acceptance.** Screenshot at 1440: the closing as today with "Looking is free." in the serif italic, the headline still flipping over the ink; the footer's dark sheet with rounded top corners sits over its foot with white in the corners. Tests: `home.spec` closing block, `no-script.spec` mailto.

### 7.10 Footer (dark)

**Layout.** `<footer data-theme="dark" className="sheet overflow-clip bg-surface pt-band-sm">` (outside `main`; no sticky inside, so `overflow-clip` is safe). `shell`, then `grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 md:gap-x-10` with no `divide-x` and no `border-t`: two `nav` groups (h3 in `eyebrowStyles text-on-surface`, links `text-small text-on-surface-muted hover:text-on-surface py-1.5`, 10.31 to 16.88), the identity block (`Logo` in `--on-ink`, blurb, the gated address line, copyright). Under the grid, `mt-16 md:mt-20`: the wordmark `p aria-hidden="true" className="wordmark"` holding `SITE.name` (an existing string), with the section's CSS in `app/_styles/footer.css` (Amended 23 September 2026 by the director, A1):

```css
/* ==== footer ==== */
.wordmark {
  font-size: clamp(5rem, 18vw, 16rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
  white-space: nowrap;
  color: var(--wordmark);
  translate: 0 30%;
  user-select: none;
}
```

Solid `#1b2e44` on the foot at 1.44:1 (measured at build with culori; the plan's 3.10 was wrong): a whisper that is decoration, aria-hidden and never read, so WCAG 1.4.3 does not apply and axe never sees it; there is no fallback dance and no `incomplete` entry on every run. 768: three columns, `translate: 0 32%`. 390: two nav columns, identity below spanning both, the wordmark about 70 px (18vw), `translate: 0 35%`.

**Choreography.** md+ (`footer.ts`): the wordmark scrubs `fromTo({ y: 40 }, { y: 0, ease: 'none', scrollTrigger: { trigger: footer, start: 'top bottom', end: 'bottom bottom', scrub: scroll.scrubLag } })` (2.5rem, under the 6rem parallax cap; `y` writes `transform`, the CSS `translate` is separate, so the two never fight). Phones and reduced motion: static.

**Header.** The footer is a dark band, so the bar flips dark over it through the same observer.

**Pins.** The footer links (`footer-links.ts`) and the address gate are untouched; `mobile.spec` `scrollWidth === 390` (the wordmark is inside `overflow-clip`); `tablet.spec` `scrollX` stays 0.

**Acceptance.** Screenshot at 1440: a near-black plinth with rounded top corners over the closing's white, three unruled columns, "PinnaclePX" at about 260 px cut off by the page's bottom edge in a dark slate-blue. Tests: mobile and tablet overflow, axe.

---

## 8. Build order and file ownership

### 8.1 Step F: foundation (lands first, one PR or the first commit of the branch)

Owns, and is the only step to touch:

- `app/layout.tsx` (fonts, the ring swap on the skip link), `app/tokens.css` (the two stacks and two fallbacks), `app/examples/ember/page.tsx:45`, `app/examples/summit/page.tsx:48`.
- `app/globals.css`: the section 2.4 block, the reveal retune, the active-step colour, and (Amended 23 September 2026 by the director, A1) the ten `@import './_styles/<name>.css'` lines after the redesign block; the folder `app/_styles/` with its ten files (`work.css`, `included.css`, `how-it-works.css`, `real-build.css`, `your-options.css`, `straight-answers.css`, `about.css`, `faq.css`, `closing.css`, `footer.css`), each holding one comment line naming its section, so every package edits only its own file. Plain CSS rules only in those files; tokens and utilities stay in `globals.css`.
- `app/_components/section-styles.ts` (the recipe set in 4.6), `components/ui/caption.ts`, `components/ui/button.tsx` (rings), `components/ui/text-link.ts` (hover to `brand-ink`), `components/ui/progress-steps.tsx` (`bg-brand-ink`, `bg-on-surface/12`), `components/ui/choice-card.tsx:46`, the thirteen `font-mono` sites in section 3.5 that are not section files (`walkthrough-built.tsx`, `walkthrough-frame.tsx`, `brief-sketch.tsx`, `browser-frame.tsx`, `phone-sketch.tsx`, `sketch-parts.tsx`, `design-slots.tsx`, `imagery-step.tsx`, `logo-step.tsx`, `preview/[slug]/page.tsx`).
- `app/_components/words.tsx` (export `emphasised`), `app/_components/hero.tsx` (import it; no markup change), `app/_components/section-copy.ts` (`HOW_IT_WORKS.emphasis`).
- `app/page.tsx` (the shell in 4.1), `app/_components/header-chrome.tsx` (section 5), `app/_components/site-header.tsx:24` (outline colour), `app/_components/mobile-nav.tsx` (ring colour only).
- `app/_components/page-choreography.tsx` (new), `app/_components/motion/index.ts` (new) and the ten stub modules, `lib/config.ts` (6.6), `e2e/a11y.spec.ts` (6.4), `scripts/bundle-budget.mjs` (6.7).
- `docs/adr/0034-*.md` (section 10) and this plan's status line.

The foundation must build, pass typecheck, lint, knip and the unit tests, and pass `pnpm e2e` on the CURRENT sections (the recipes it deletes are replaced with inline equivalents in each section only by the packages, so the foundation keeps the deleted names exported until the last package lands, then removes them in the closing commit; knip is a CI gate, so the removal commit is the last one on the branch). It also runs the six-width hero line count (9.3) before any section package starts.

### 8.2 The work packages (independent after F; parallel builders never share a line)

| Package                | May edit (Amended 23 September 2026 by the director, A1: the CSS column names each package's own file under `app/_styles/`)                                                                                                                                                                  |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| W1 `#work`             | `app/_components/work.tsx`, `app/_components/motion/work.ts`, `app/_styles/work.css`                                                                                                                                                                                                         |
| W2 `#included`         | `app/_components/included.tsx`, `included-items.ts` (only if a glyph name needs a field), `motion/included.ts`, `app/_styles/included.css`                                                                                                                                                   |
| W3 `#how-it-works`     | `app/_components/how-it-works.tsx`, `how-it-works-track.tsx` (the panel's class string, the dot-grid swap, the ticks import, the `walkthrough:ready` dispatch), `motion/how-it-works.ts` (stays empty), `app/_styles/how-it-works.css` (the active-step rule's colour is already moved by F) |
| W4 `#real-build`       | `app/_components/real-build.tsx`, `motion/real-build.ts`, `app/_styles/real-build.css`                                                                                                                                                                                                       |
| W5 `#your-options`     | `app/_components/your-options.tsx`, `motion/your-options.ts`, `app/_styles/your-options.css`                                                                                                                                                                                                 |
| W6 `#straight-answers` | `app/_components/straight-answers.tsx`, `straight-answer-items.ts` (only if the icon set changes), `motion/straight-answers.ts`, `app/_styles/straight-answers.css`                                                                                                                          |
| W7 `#about`            | `app/_components/about.tsx`, `motion/about.ts`, `app/_styles/about.css`                                                                                                                                                                                                                      |
| W8 `#faq`              | `app/_components/faq.tsx`, `faq-entry.tsx`, `motion/faq.ts` (stays empty), `app/_styles/faq.css`                                                                                                                                                                                             |
| W9 `#cta`              | `app/_components/closing-cta.tsx`, `motion/closing.ts`, `app/_styles/closing.css` (probably empty)                                                                                                                                                                                           |
| W10 footer             | `app/_components/site-footer.tsx`, `motion/footer.ts`, `app/_styles/footer.css`                                                                                                                                                                                                              |

Rules for every package: components use semantic utilities only (no hex in TSX); the section's motion module reads its numbers from `CONFIG.motion.choreo` and adds nothing to `lib/config.ts` (if a number is missing, the package proposes it in its PR and F's owner adds it); each package runs `pnpm prettier --write` on its files, `pnpm typecheck`, `pnpm test`, and the e2e projects that pin its section (`--project=desktop|mobile|tablet` with `-g` on the section's tests), and posts its 1440/768/390 screenshots against the acceptance criteria in section 7.

### 8.3 The closing commit

Removes the deleted recipe names from `section-styles.ts`, runs the full gate line, measures the budgets on a clean worktree (9.4), writes the numbers into `bundle-budget.mjs` and ADR 0034, and runs Lighthouse by hand (9.5).

---

## 9. Verification plan

### 9.1 Commands

```
pnpm typecheck && pnpm lint && pnpm format:check && pnpm knip && pnpm test
pnpm build && pnpm budget
pnpm e2e                      # all projects; or --project=desktop | mobile | tablet
node scripts/template-compare.mjs   # not needed here; listed so nobody runs it by mistake
npx @lhci/cli autorun         # by hand, before merging (lighthouserc.json is binding)
```

`git add` by path only (never `-A`); re-check `git status` before every commit (other sessions edit the tree).

### 9.2 Viewports to screenshot

Every section at 390x844, 768x1024 and 1440x900 (the three e2e projects' sizes), plus the full page at 1920x1080 for the seams and the header states. Capture with the ink off (`prefers-reduced-motion: reduce` is not the same thing: use the scratchpad's `shoot.mjs` with the canvas disabled) and once with motion on after a slow scroll, so the finished states and the mid-scroll states are both on record. Specific frames to keep: the hero-to-Work seam at rest and after the rise; the pooled curve; the header over the hero's foot, over the stretch, over the wash, over the footer; the FAQ with the first entry open; About with and without the AddressCard.

### 9.3 The hero line-count check (D1)

In a worktree with the fonts swapped and nothing else: ink off, screenshot the hero at 390, 768, 1024, 1280, 1440 and 1920 and count the H1's lines. Expected 3, 2, 2, 2, 2, 2 (section 3.6). If every count holds, the fills stand and the ADR says so with the six screenshots' names. If any count changes: try `--text-hero--letter-spacing: -0.03em` first; if that does not restore it, follow ADR 0031's procedure (sample the ground behind the first and last line at each width, extend each pair to the heading box edges, one pair per range, hold within about 11 levels of 255, record the pairs in `globals.css` and the ADR) and re-run the two LCP tests and the CLS line.

### 9.4 The budget re-measure procedure and the numbers to record

On a clean worktree of the finished branch: `pnpm build && pnpm budget` on Windows, then the same on CI's Linux run. Record in `bundle-budget.mjs`'s comment and in ADR 0034, with the date and reason:

- scripts `/` (expected about 213 to 214 KB; line 216,000 unless exceeded, then 218,000);
- stylesheet (expected 17.0 to 17.4 KB; the line is the measured number plus at least 70 B rounded up to the next 500, provisionally 18,000; the same line applies to `/start`, which shares the sheet);
- HTML `/` (expected about 35.5 KB; line 40,000 unchanged);
- fonts `/` (expected 61,916 B; line 64,000);
- the four lazy guards all `ok`;
- the phone soft line: `#work + #included + #real-build + #your-options` at 390 (reported by `mobile.spec`, with Work one column on phones under A2 the number may exceed 8,440 px, and the assertion is soft; write the number in the ADR either way);
- the contrast re-checks marked in section 2.2 (`--job-reachable`, `--wordmark`, `--glow-corner` over the wash and over white), computed with the scratchpad's culori script and pasted into the ADR.

### 9.5 Lighthouse by hand

`npx @lhci/cli autorun` against the production build; the audit never scrolls, so the script total must read about 220.3 KB (initial plus Lenis plus the fluid chunk) and never carry GSAP or ScrollTrigger; LCP is the H1 on desktop and the H1 or a P on tablet; CLS under 0.02 with the size-adjusted fallback; TBT under 150 ms on the mid-tier preset; third-party count unchanged (self-hosted fonts). Paste the summary into the ADR.

---

## 10. ADR 0034 outline

**Title:** `0034-the-page-below-the-hero-continues-the-ink.md`. Status accepted; date the day it lands; supersedes `docs/home-page-design-plan.md` below the hero (sections 4 to 8 of it) and the "instrument register" at its line 265; keeps ADR 0031 and 0032 whole.

**Decisions (numbered, in the repo's plain style):**

1. The lower page is the hero's ramp run again: one dark stretch on the foot, a wash from the ramp's top stops, white, the closing on white with the ink, a dark footer. Every ground is a stop or an existing token.
2. Hairlines are gone below the hero; separation is a ground, a card, air or one of two shapes. The header's nav rule, the mobile drawer's edge, the hamburger's ring and the sketch bezels stay as controls and illustration.
3. Two families, Mona Sans (wght only) and Instrument Serif italic, loaded through next/font; Geist, Geist Mono and the mono register retired; the italic is real and appears on exactly three phrases; the H1 follows the site's family and its fills stand (or are re-measured, with the record).
4. Site-only tokens and the dark scope in `globals.css`; `--brand-ink` splits coloured text from fills; light-band text stays slate; the four job hues are the ramp's own.
5. ScrollTrigger is registered behind the lazy loader, loaded on scroll intent or `#work` nearing, never idle; pinning stays refused; scrubs are md+ only; the executor contract keeps `[data-reveal]` to `data-inview` as the truth and emits `data-motion-settled`.
6. The caps in D12 replace the design plan's 300 ms / 0.5rem; the CSS reveal moves to 2rem / 0.97 / 600 ms / 70 ms.
7. The header gains `data-over-dark` from a band observer and the hero's foot; the mobile panel inherits it.
8. The walkthrough's mechanics are untouched; only its ground, heading, panel chrome and the active-step colour change; `walkthrough:ready` is dispatched for the choreography's refresh.
9. Budget lines: fonts 64,000 B (new, enforced), stylesheet raised on the measured number, scripts unchanged unless measured over.

**What it amends:** ADR 0005 d6 (the caps; scroll-tied motion below the hero; pinning, scroll snapping, SplitText and autoplay loops still refused); ADR 0025 d1 (ScrollTrigger is now registered, behind the loader); ADR 0026 d1, d2 and d8 (grounds now carry the hue; the three-band tint scarcity and "everything else greyscale" are replaced by the arc; motion may move as well as colour), its "builder dd muted" treatment (both lanes now full ink), and its refusals of scroll-driven inking, ambient motion below the hero and the H2 italic; ADR 0031 d4 (the hero's italic is now a true italic). **What stands on non-taste grounds:** constraints 3 (LCP), 22 (contrast rules), 24 (no studio-lane weighting), 25 (single-colour logos), 27 (the reduced-motion allowlist), no pinning, no dark closing. **Refusals kept on taste:** brand full stops on H2s, gradient-clipped text anywhere, hover tints on non-focusable cells, colour inside reveal mid-states, a trades marquee, count-ups, a second hue.

**Assumptions made for the owner (numbered so each can be a yes or a no):**

1. The lightness arc: dark stretch, wash, white, ink on white, dark footer (question 1).
2. The closing keeps the ink on white; no dark closing (question 2; D3).
3. The header goes dark over dark bands and the hero's foot rather than staying white or blending mid-page (question 3; D4).
4. ScrollTrigger yes, pinning no (question 4; D5).
5. Phones get entrance choreography only; scrubs are md+ (question 5).
6. The caps in D12 and the CSS reveal's new numbers (question 6).
7. The hero's typeface follows the site (D1) and its `<em>` becomes a true serif italic; Geist Mono and the mono register are retired; the walkthrough's client faces do not count toward two (question 7).
8. The font line is 64,000 B, enforced (question 8).
9. The stylesheet line moves on the measured number; the templates' `@font-face` rules stay in the shared sheet this pass (question 9).
10. Lighthouse CI is binding and run by hand; wiring it into `ci.yml` is a separate change (question 10).
11. No second hue: colour is the blue, cyan, indigo and ice of the hero's ramp; the walkthrough's terracotta stays inside the phone (question 11).
12. The dark set follows the ramp's hue; light-band text stays slate (question 12).
13. Navy fills with white text everywhere; `--brand-ink` for coloured text (question 13).
14. Work's frames take the dark bezel inside the stretch (question 14).
15. The taste refusals listed above stay refused (question 15).
16. Real build's counters are muted until reached and blue after, one decision for the page; Included has no counters, it has the four job words (question 16).
17. Corner ticks and the dot grid leave the home page (they stay on `/start`); the mono register goes (question 17).
18. Both anchor offsets stay (question 18).
19. The executor contract in section 6.4 (question 19).
20. The walkthrough's mechanics are untouched (question 20).
21. No re-capture; the 224 and 400 px ceilings hold (question 21).
22. About is designed for both AddressCard states and both are verified locally (question 22).
23. No new visitor-facing words: `HOW_IT_WORKS.emphasis` is a constant like `HERO.emphasis`; the job words, numerals and `SITE.name` are existing strings (question 23).
24. The OG image stays generic (question 24).
25. The four job labels are promoted to display-size words in four hues, with "Reachable" in the ramp's ice rather than white.
26. The cyan backlight behind the Work captures stays at 0.18 (0.32 on hover) unless the Mvmnt or URUNN tiles fight it, in which case it becomes a neutral white at 8 per cent.
27. The footer wordmark is a solid `#1b2e44` (1.44:1 on the foot, decorative and aria-hidden), not SVG text and not a gradient clip.
28. Both `dd`s in Your options take the same ink; the two lane heads draw on together.
29. Straight answers' and the FAQ's cards sit on the wash, with a corner glow (static, and on open respectively).
30. The Included and Straight-answer icons are lucide glyphs chosen by the build (Search, ShieldCheck, MessageCircleQuestion, Smartphone; Bot, Mail, RefreshCw, HelpCircle as today).

**Budget lines it moves:** fonts (new line, 64,000 B, enforced); stylesheet (measured, provisionally 18,000 B for `/` and `/start`); scripts (unchanged at 216,000 unless measured over, then 218,000); HTML unchanged; the Lighthouse script total unchanged at 230,000; the phone soft line unchanged and its number recorded.

---

## 11. Rejected

What the runners-up offered that is left out, and why.

- **Editorial's paper ground (`#eff4f8`) and card mesh.** Paper against white is the one-level tint the brief's critique already called indistinguishable; the two-glow mesh on every card is the most recognisable AI-startup card device of the moment, and `--mesh-y` written per frame repaints gradients rather than compositing. Kept instead: one corner glow, static, on the two white-run card sets and on open FAQ cards, with the wash (1.18:1 against white) as the card ground.
- **Editorial's dawn under Work** (white heading on the foot, a 14rem fade, white cards straddling the seam). It is the best first screen on the panel, but it sends the page light within one band, and the winner's dark stretch is the thesis. Its sequencing (heading on the night first, the tiles lit after) is grafted.
- **Editorial's dark band at the decision** (Real build and Your options on `#02101d`). A dark pricing slab is the SaaS register the brief said to avoid, and a comparison reads as a document on the wash and as a table on dark. Kept instead: the wash for the two commercial bands.
- **Editorial's `stickyColumn` at lg and its 12-column grid.** They change every two-column band on tablet while the walkthrough stays on its md grid, which gives 768 a mixed rhythm and risks `home.spec`'s 1440 lane-head assertion for nothing the 6-column grid cannot do.
- **Editorial's gradient-clipped wordmark at 1.4 to 2:1.** An `incomplete` entry on every axe run and a fallback that has to be designed anyway. Kept instead: a solid fill, aria-hidden and outside 1.4.3 (1.44:1 as built).
- **Scenes' horizontal Work rail with its scroll-timeline ruler.** It hides three of the six sites, the page's best asset, behind a gesture on desktop, with a hidden scrollbar on Windows and Lenis's wheel capture unaddressed on a nested scroller. Its sheet mechanism, measured font plan, hero-foot detection, lane-head draw and offset cards are grafted.
- **Scenes' alternating scheme (dark, dark, white, tint, dark, dark, white, white, white, dark).** Five scheme changes and four header flips is a stripe at page level; the winner's two flips are the arc.
- **Scenes' brick offsets with 3rem drift** and the **About count-up with new labels** ("30+", "websites since 2021", "open above"). The drift is a device on top of a device in a band that already draws four glyphs; the count-up adds visible strings against D7 and restates a register row.
- **Scenes' CSS counters on the walkthrough steps.** Per-step chrome inside `#how-it-works` is exactly what D8 keeps still, and the `/ ''` alt syntax needs Safari 17.4.
- **Scenes' zebra rows and muted builder `dd`.** The zebra assumed one slab; the rows here are separate cards. The muted builder lane is a weighting and D10 removes it.
- **Colour-blocks' pastel blocks with white gutters** (cyan-white, periwinkle, pale blue, navy). It throws the hero away after a 2.5rem strip, adds a hue (periwinkle) the ramp does not have, and reads as a friendly product site. Its giant job words, its two-up Work at 390, its solid wordmark and its finished-by-default reasoning are grafted.
- **Colour-blocks' `data-ground="blue"` scope with a second `--brand-ink`.** One dark scope and one wash is enough tokens; a third scope for one band is the "five themes" risk its own spec named.
- **Colour-blocks' 448 px drifting mark on About.** A 6rem ambient object at the parallax cap in the quietest band; the studio tile does the job at zero motion cost.
- **Kraft-plus's seven dark bands and the dusk-to-dawn ramp at About's foot.** Six consecutive dark bands surrender the clear separation the owner asked for, put About (a named person, a UK town) in the AI-product register, and its lit-panel mechanism was wrong as written (`--sketch-bg` resolves on the sticky wrapper, not the panel). The dawn is the best single image on the panel and is not needed once the page lightens at the walkthrough. Its halo, its segmented track and its finished-by-default markup are grafted.
- **Kraft-plus's and ink-continues' wide cut (`axes: ['wdth']`, 110 per cent headlines, 125 per cent numerals).** The two-axis file measures 98,124 B, which fails both directions' own lines; a wide cut beside a serif italic is two loud devices; and it dates fastest. Numerals and the wordmark are weight 800 at width 100.
- **Kraft-plus's `data-reveal="gsap"` lists hidden by GSAP alone.** It breaks D6: `settled()` forces `data-inview` before GSAP loads, axe's own scrolling then loads the leaf, which hides off-screen lists as axe reads them. The contract in 6.4 (skip anything already `data-inview`, pre-empt on mutation) is the fix.
- **Kraft-plus's raised script and stylesheet lines (220,000 and 19,000) and its anchor-offset change.** Nothing here needs them; lines move only on a measured number.
- **Ink-continues' own phone-side IO colour beat for the numerals and its `html:not([data-motion])` rail rule.** Replaced by finished-by-default markup, which needs no rule and makes reduced motion, no JS and phones identical.
- **Ink-continues' SVG-text wordmark and its "Reachable in white".** SVG text passes axe by accident (CSS `color`, not `fill`) and depends on the font loading; white as the fourth hue read as the odd one out. Solid HTML text and the ramp's ice replace them.
- **A trades marquee, hover tilts, brand full stops on H2s, gradient-clipped text below the hero, a second (warm) hue, a dark closing, pinning, scroll snapping, SplitText, autoplay loops, re-captures.** Each was on offer somewhere on the panel; each is a device on top of a device or a constraint the brief does not override.
