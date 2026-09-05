# Codebase map for new home page sections

Written 5 September 2026 from the working tree at `c:/Users/Omar/Documents/PinnaclePX` (branch `main`, clean, head `c01165f`). Every statement below is **observed (code)** unless marked otherwise: I read the file named. Nothing here comes from the web. Where I could not run something to confirm a behaviour it is marked **Unverified**.

Paths are repo-relative. "The plan" means the home page plan this map is written for; "the design plan" means `docs/home-page-design-plan.md`.

---

## 0. Ground truth that changes the plan (read this first)

1. **The page promises three designs; the pipeline builds one today.** `app/start/_components/actions.ts:72` sets `conceptCount: conceptCountFor(READY_TEMPLATES.length)`; `lib/select/select.ts:9` returns `Math.min(CONFIG.templates.conceptsShown, readyCount)`; `templates/registry.ts` has one ready template (`t01-aurora`). `e2e/brief.spec.ts` asserts this ("One design while only Aurora is ready"). The word "three" is hard-coded text in fourteen places on the home page (section 9 lists them). Nothing derives it from `READY_TEMPLATES`. The plan has to decide how the "three" claims are gated.
2. **Aurora lays out by viewport, not by container.** 32 `md:` and 3 `lg:` utilities across nine files in `templates/t01-aurora/sections/`, plus `70svh`, `70vh`, `50vh`, `45vh`, `20vh`, `15vh` and an `animation-range: 0 100vh`. Zero `@container`, `container-type`, `cqi` or `@md:` anywhere under `templates/`. The design plan's row in section 3.5 and its owner decision 11 ("templates lay out by container queries ... Add a CI grep") were not implemented and ADR 0008 does not mention it. So the template cannot render "at frame size" inside a DOM frame on the home page today (section 6.4 gives the options).
3. **Lighthouse thresholds are declared, not enforced.** `lighthouserc.json` exists (LCP 2000 ms, CLS 0.02, TBT 150, performance 0.95, a11y 1.0, script 230 KB, image 500 KB, total 600 KB, third-party 4, mobile preset, 5 runs), but no `package.json` script and no job in `.github/workflows/ci.yml` (88 lines: `verify`, `budget`, `e2e`) runs it. The design plan's CI gate 2 is unbuilt.
4. **The reading-level script does not exist.** `scripts/` holds only `bundle-budget.mjs`. The mechanical copy check is `app/_components/copy.test.ts` (section 5.3), and it covers only exported constants, not JSX prose.
5. **The copy test expects exactly two "AI" mentions.** `copy.test.ts` asserts `mentions.toHaveLength(2)` (the question "Is this AI?" and its answer). A new straight answer ("Is my sentence or logo used to train anything?") must not use the word, or the test changes.
6. **`/examples/aurora` cannot be rendered inline in the home page DOM.** Aurora emits `id="top"`, `<main id="main">`, a second `<h1>`, `id="how-it-works"` (collides with the home page section), `id="features"`, `id="why"`, `id="start"`, a `<header class="sticky top-0 z-50">`, `nav aria-label="Main"` (duplicate) and scroll-driven animations on `animation-timeline: scroll(root)`. An iframe or static captures are the honest routes (section 6.4).
7. **A new section needs three registrations to be first-class:** its `id` in `SECTION_IDS` (`app/_components/page-motion.tsx:8`), its copy constants in the `COPY` array of `copy.test.ts`, and, if it must survive JavaScript off, its heading in `e2e/no-script.spec.ts`.
8. **`SITE.bookingUrl` is a placeholder** (`https://cal.com/pinnaclepx/quick-chat`, comment: "Replace with the real Cal.com booking link before launch"). Every "Book a 20-minute call" link points at it. `SITE.town` and `SITE.contactEmail` are `null` and the About card and footer identity render nothing for them (excluded by the owner; may stay null).
9. **CSS headroom is about 635 bytes.** The stylesheet budget is 14,000 B gzipped; ADR 0008 measured 13,365 B after Aurora's utilities joined the one site stylesheet. Every new utility class on the home page costs CSS; an examples band with new grid recipes may cross the line and force either a budget change (recorded, as ADR 0006 did) or reuse of existing recipes only.
10. **Only VetPres exists in code.** `lib/brief/example-brief.ts` holds VetPres. "Mvmnt" and "Go Wild Dog Walking" appear only in docs and two test files (`lib/brief/sketch.test.ts`, `templates/t01-aurora/contract.test.ts`). The Aurora example brand is a fourth invented business, Kestrel (`templates/t01-aurora/example/content.ts`), not one of the three approved example briefs.
11. **A real `/preview/[slug]` page needs a database row that the retention sweep deletes after 30 days** (`lib/inngest/functions/retention-sweep.ts`, `CONFIG.retention.days`). A home page link to real pipeline output would die within a month unless the plan exempts a fixture submission.

---

## 1. Section anatomy

### 1.1 The page shell (`app/page.tsx`)

```tsx
<div className="mx-auto max-w-7xl border-x border-border">
  {' '}
  // the hairline column
  <JsonLd />
  <SiteHeader />
  <main id="main" className="flex flex-col divide-y divide-border pt-16">
    {' '}
    // pt-16 clears the fixed h-16 header
    <Hero />
    <WhatYouGet />
    <HowItWorks />
    <Taster />
    <StraightAnswers />
    <About />
    <Faq />
    <ClosingCta />
  </main>
  <SiteFooter />
  <PageMotion />
</div>
```

- The hairline between sections is `divide-y` on `<main>`: every section must be a **direct child** of `<main>`. Wrapping two sections in a fragment is fine; wrapping them in a `<div>` loses the hairline.
- The comment in `page.tsx:14` records the reserved slot: "The examples gallery slots in between HowItWorks and Taster once the templates render."
- Every non-stage section is `<section id="…" className="scroll-mt-16">`. `html { scroll-padding-top: 4rem }` (`app/globals.css`) does the same for fragment jumps; Lenis reads it too.
- Header: `HeaderChrome` is `fixed inset-x-0 top-0 z-50 border-b border-border bg-surface`, height `h-16`, inner `mx-auto flex h-16 max-w-7xl items-center justify-between border-border px-6 md:border-x`.

### 1.2 The four section shapes in use (exact recipes)

**Shape A, 2/4 heading + content** (`straight-answers.tsx`, `about.tsx`, `faq.tsx`):

```
section.scroll-mt-16
  div.grid.md:grid-cols-6.md:divide-x.md:divide-border
    div.flex.flex-col.gap-3.p-column.max-md:pb-3.md:col-span-2        // heading column (FAQ adds stickyColumn; About uses gap-6)
      h2.{titleHeading}
      p.text-lead.text-pretty.text-on-surface-muted                  // one-line lead
    <content>.md:col-span-4
      either: div.divide-y.divide-border.p-column.max-md:pt-6        // FAQ entries
      or:     div.flex.flex-col.gap-5.p-column.text-lead.text-pretty.text-on-surface-muted.max-md:pt-6   // About prose, p.max-w-prose
      or:     ul[data-reveal].grid.gap-px.bg-border.md:col-span-4.md:grid-cols-2      // Straight answers 2x2
                li.flex.flex-col.gap-3.bg-surface.p-5.md:p-cell  style={revealDelay(i)}
                  h3.{cardHeading}.flex.items-center.gap-2.5 > Icon.size-5.shrink-0.text-brand-deeper + text
                  p.text-body.text-pretty.text-on-surface-muted
```

**Shape B, 3/3 with a stage or steps column** (`how-it-works-track.tsx`, `taster.tsx`):

```
div.grid.md:grid-cols-6.md:grid-rows-[auto_1fr]
  heading: div.p-column.max-md:pb-3.md:col-span-3            (HIW: col 1-3; Taster: md:col-start-4, flex flex-col gap-3)
  stage:   div.sticky.top-16.z-10.md:top-24.md:col-span-3.md:col-start-4.md:row-span-2.md:self-start.md:border-l.md:border-border   (HIW)
           ol[data-reveal].divide-y.divide-border.border-y.border-border.md:col-span-3.md:col-start-1.md:row-span-2.md:row-start-1.md:border-y-0.md:border-r   (Taster steps, mirrored)
  body:    div.flex.flex-col.gap-8.p-column.max-md:pt-6.md:col-span-3.md:col-start-1   (HIW beats + actions)
           div.flex.flex-col.gap-4.p-column.max-md:pt-6.md:col-span-3.md:col-start-4   (Taster actions)
```

HIW's stage inner: `relative flex flex-col items-center gap-3 overflow-hidden border-y border-border bg-surface-muted px-6 pt-5 pb-4 md:min-h-[60vh] md:justify-center md:border-y-0 md:py-12`, with a dot grid layer `bg-[radial-gradient(var(--border)_1px,transparent_1px)] mask-[radial-gradient(ellipse_at_center,black_30%,transparent_72%)] bg-[size:22px_22px]` and a glow layer `bg-radial-[at_50%_80%] from-(--sketch-glow) to-transparent to-65% transition-colors duration-700`, both `absolute inset-0 -z-1 aria-hidden`. Below md the phone is clipped: `relative max-h-40 overflow-hidden mask-[linear-gradient(to_bottom,black_75%,transparent)] md:max-h-none md:overflow-visible md:mask-none`.

Taster step row: `li.flex.gap-5.p-5.md:p-cell` with number `span.{captionStyles}.w-[2ch].shrink-0.pt-1.text-brand-deeper.tabular-nums` = `String(index + 1).padStart(2, '0')`, then `div.flex.flex-col.gap-2 > h3.{cardHeading} + p.text-body...`. The DOM order is heading, steps, actions so a phone reads the call before the button (comment in `taster.tsx`).

**Shape C, full-width cell strip** (`what-you-get.tsx`):

```
section#what-you-get
  h2.sr-only
  ul[data-reveal].grid.grid-cols-2.gap-px.bg-border.lg:grid-cols-4
    li.flex.flex-col.gap-3.bg-surface.p-4.sm:p-cell  style={revealDelay(i)}
      <WhatYouGetGlyph name=…/>  h3.{cardHeading}  p.text-body.text-pretty.text-on-surface-muted
```

**Shape D, stage section with a glow** (`hero-stage.tsx`, `closing-cta.tsx`):

```
section.relative.isolate.px-6.py-section        (closing adds overflow-hidden; hero adds group and data-* attributes)
  <CornerTicks />  <GlowBackdrop tinted />        (hero)  |  <GlowBackdrop />  (closing)
  div.mx-auto.grid.max-w-6xl.items-center.gap-10.lg:grid-cols-12.lg:gap-8      (hero: text lg:col-span-5, stage lg:col-span-7)
  div.mx-auto.grid.max-w-5xl.items-center.gap-10.md:grid-cols-[1fr_auto].md:gap-16   (closing; sketch div.max-md:order-first)
  text column: div.flex.flex-col.items-center.gap-6.text-center.lg:items-start.lg:text-left
```

### 1.3 Type and text recipes (`app/_components/section-styles.ts`, `components/ui/*.ts`)

| Export                                          | Class string                                                                       | Use                                                                               |
| ----------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `displayHeading`                                | `text-display font-semibold text-balance`                                          | H1 and the closing H2 only                                                        |
| `titleHeading`                                  | `text-title font-medium text-balance`                                              | every section H2                                                                  |
| `cardHeading`                                   | `text-heading font-medium`                                                         | card and step H3                                                                  |
| `stickyColumn`                                  | `md:sticky md:top-24 md:self-start`                                                | a heading column beside a taller neighbour (FAQ)                                  |
| `captionStyles` (`components/ui/caption.ts`)    | `font-mono text-label text-on-surface-muted`                                       | the mono "instrument" register: captions, labels, numbers; never headings or body |
| `textLinkStyles` (`components/ui/text-link.ts`) | `font-medium text-on-surface underline underline-offset-4 hover:text-brand-deeper` | the quieter of two actions, inline                                                |
| lead paragraph (inline everywhere)              | `text-lead text-pretty text-on-surface-muted`                                      | under an H2                                                                       |
| body paragraph                                  | `text-body text-pretty text-on-surface-muted`                                      | answers and details                                                               |
| small                                           | `text-small text-on-surface-muted`                                                 | click triggers, notes                                                             |

Type tokens (`@theme` in `globals.css`): `text-display` clamp(2.25rem, 1.25rem + 3.3vw, 3.75rem) / 1.04 / -0.04em; `text-title` clamp(1.75rem, 1rem + 2.2vw, 2.75rem) / 1.1 / -0.03em; `text-heading` clamp(1rem, 0.95rem + 0.25vw, 1.125rem) / 1.35; `text-lead` clamp(1.0625rem, 1rem + 0.35vw, 1.25rem) / 1.5; `text-body` 1rem / 1.6; `text-small` 0.875rem / 1.5; `text-label` 0.75rem / 1.4 / 0.04em. Spacing: `py-section` = clamp(3.5rem, 2rem + 5vw, 6rem); `p-column` = clamp(1.5rem, 0.75rem + 3vw, 3.5rem); `p-cell` = clamp(1.25rem, 1rem + 1vw, 2rem). Fonts: `--font-sans` Geist, `--font-mono` Geist Mono (root layout, `next/font/google`, preloaded), `--font-display` / `--font-body` fall back to Geist unless a template root sets `--template-font-display/body`.

Colour tokens (`:root` in `globals.css`, mapped by `@theme inline`): surface #ffffff, surface-muted #f1f5f9, on-surface #0f172a, on-surface-muted #475569, border #e2e8f0, accent #f1f5f9, brand #0ea5e9 (2.77:1, decoration only), brand-deeper #0369a1 (5.93:1, the fill that carries text), brand-deepest #075985, on-brand #ffffff, glow #2cd5ff, glow-secondary #2c30ff, scrim #020617, on-scrim #ffffff, danger, warning, success #15803d. Shadows: `shadow-badge`, `shadow-cta`, `shadow-dialog`. Eyebrows: the design plan (section 6) asked for a mono eyebrow above every H2; none exists in the code today. A new section may add one as a `<p className={captionStyles}>` (a `p`, not a heading).

### 1.4 Hairlines: the four techniques

1. Between sections: `divide-y divide-border` on `<main>` (direct children only).
2. Between the two columns of a section from md: `md:divide-x md:divide-border` on the grid (shape A) or `md:border-l` / `md:border-r border-border` on the stage column (shape B).
3. Between cells of a grid: `gap-px bg-border` on the grid with `bg-surface` on every cell (shapes A-2x2 and C). The comment in `what-you-get.tsx` and `straight-answers.tsx` explains it.
4. Below md around a list that sits between two padded columns: `border-y border-border` removed at md (`md:border-y-0`), as the Taster steps do.

### 1.5 Reveal on scroll

- Mark the list container `data-reveal`; give each **direct child** `style={revealDelay(index)}` (`app/_components/reveal.ts`, sets `--i`, capped at `CONFIG.motion.staggerMax - 1` = 3).
- CSS (`globals.css`, under `prefers-reduced-motion: no-preference` only): `html[data-motion] [data-reveal] > *` starts `opacity: 0; translate: 0 0.5rem` and transitions over `--motion-settle` with `transition-delay: calc(var(--i, 0) * var(--motion-stagger))`; `[data-inview]` releases it. The selector is `> *`, so a wrapper element between the container and the items breaks the stagger.
- `PageMotion` (`app/_components/page-motion.tsx`) marks items already on screen before it sets `data-motion` on `<html>` (no blink), observes the rest with `rootMargin: '0px 0px -10% 0px'`, and after `REVEAL_FAIL_SAFE_MS` (4000) shows everything. JavaScript off: no `data-motion`, nothing is hidden. Reduced motion: `--motion-stagger: 0ms` and the global `transition-property` clamp removes the translate.
- `e2e/a11y.spec.ts` forces `data-inview` on every `[data-reveal]` before scanning, so a new reveal list needs nothing extra there.

### 1.6 Sticky columns

`stickyColumn` (`md:sticky md:top-24 md:self-start`) on the heading column (FAQ), or `sticky top-16 z-10 md:top-24 md:self-start` on a stage that must also pin on phones (HIW). `top-24` = 6rem: the 4rem header plus 2rem. `body { overflow-x: clip }` (not `hidden`) keeps sticky working while the corner ticks overhang the column. The design plan's rule (section 6): a column is sticky only when its neighbour is at least a viewport taller.

### 1.7 Phone rhythm

Gutter is 24 px everywhere (`px-6` on stage sections; `p-column` collapses to 1.5rem at 390 px). Heading column `max-md:pb-3`, body column `max-md:pt-6`: the tiered stack. `e2e/mobile.spec.ts` asserts `document.documentElement.scrollWidth === 390` and that `#hero-cta` and the reassurance line sit inside the first 844 px.

---

## 2. Reusable components and their props

All in `components/` unless noted. Server components unless marked client.

| Component                                                      | File                                         | Props (exact)                                                                                                                                                                                                                                                                                             | Notes                                                                                                                                                                                                                                                                                                                    |
| -------------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `buttonStyles({ variant?, size?, className? })` and `<Button>` | `components/ui/button.tsx`                   | variants `primary` (bg-brand-deeper, text-on-brand), `cta` (gradient brand-deeper→brand-deepest, `shadow-cta`, `ring-2 ring-brand-deepest`), `contrast` (bg-on-surface text-surface), `outline`, `ghost`; sizes `sm` h-8, `md` h-10 (default), `lg` h-12 px-8 text-base, `icon` size-8, `icon-lg` size-10 | Rule in the file: anything that opens `/start` or the booking page is `lg`; `cta` variant is used only in the hero and closing; the Taster's call button is `contrast lg`. Press scale only under `motion-safe`.                                                                                                         |
| `TrackedLink` (client)                                         | `components/ui/tracked-link.tsx`             | `ComponentProps<typeof Link> & { event: 'cta_click' \| 'call_click'; location: string }`                                                                                                                                                                                                                  | `event` is `Extract<AnalyticsEvent, …>`: a new event name for a link means widening this type.                                                                                                                                                                                                                           |
| `TrackedAnchor` (client)                                       | same                                         | `ComponentProps<'a'> & { event: 'contact_click'; location: string }`                                                                                                                                                                                                                                      | For `mailto:`.                                                                                                                                                                                                                                                                                                           |
| `CornerTicks`                                                  | `components/ui/corner-ticks.tsx`             | `{ edges?: readonly ('top' \| 'bottom')[] }` (default `['bottom']`)                                                                                                                                                                                                                                       | Parent must be `relative`; ticks are `absolute z-40`; the horizontal stroke is `hidden md:block` so nothing overhangs a phone.                                                                                                                                                                                           |
| `GlowBackdrop`                                                 | `components/ui/glow-backdrop.tsx`            | `{ tinted?: boolean }`                                                                                                                                                                                                                                                                                    | Two radial layers `absolute inset-0 -z-1`; parent must be `relative isolate`. `tinted` adds a third layer in `--sketch-glow` shown while the nearest `.group` carries `data-tinted`, crossfading only once `data-live`. No blur filter (LCP rule).                                                                       |
| `captionStyles`, `textLinkStyles`                              | `caption.ts`, `text-link.ts`                 | strings                                                                                                                                                                                                                                                                                                   | See 1.3.                                                                                                                                                                                                                                                                                                                 |
| `Field`                                                        | `components/ui/field.tsx`                    | `{ id; label; hint?; error?; children: (attrs: { id; 'aria-describedby'; 'aria-invalid' }) => ReactNode }` plus `fieldStyles` string                                                                                                                                                                      | Render-prop wiring for label, hint and error. `fieldStyles` keeps `text-base` so iOS does not zoom.                                                                                                                                                                                                                      |
| `ChoiceCard` (client)                                          | `components/ui/choice-card.tsx`              | `{ selected: boolean; onSelect(); onPreview?(active: boolean); title; detail?; media?: ReactNode }`                                                                                                                                                                                                       | `role="radio"`; the parent supplies the radiogroup. Used on `/start`; available to a home page picker (a style or segment chooser) if one is ever wanted.                                                                                                                                                                |
| `ProgressSteps`                                                | `components/ui/progress-steps.tsx`           | `{ current: number; total: number }`                                                                                                                                                                                                                                                                      | Renders "Question N of M" in the mono register plus M decorative segments. `e2e/home.spec.ts` asserts exactly one `/Question \d of 5/` inside `#how-it-works` and `reduced-motion.spec.ts` asserts "Question 5 of 5" count 1 inside `#how-it-works`: a second instance **inside that section** fails; elsewhere is fine. |
| `FilePicker` (client)                                          | `components/ui/file-picker.tsx`              | `{ accept; multiple?; onFiles(files); className?; children }`                                                                                                                                                                                                                                             | `/start` only.                                                                                                                                                                                                                                                                                                           |
| `Logo`, `LogoMark`                                             | `components/brand/logo.tsx`, `logo-mark.tsx` | `Logo { nameClassName? }`; `LogoMark { size: number; className? }`                                                                                                                                                                                                                                        | Mark is `currentColor`; `LogoMark size={40} className="text-brand-deeper"` is the About card usage.                                                                                                                                                                                                                      |
| `BriefSketch`                                                  | `components/sketch/brief-sketch.tsx`         | `{ model: SketchModel; phoneFrom?: 'md' \| 'lg' (default 'lg'); ticks?: boolean (default true); built?: ReactNode; phoneBuilt?: ReactNode }`                                                                                                                                                              | Browser frame `max-w-2xl` with the phone over its corner from `phoneFrom`; `aria-hidden`; the wrapper must carry `style={model.vars}` (the caller does). Every part carries `data-part`.                                                                                                                                 |
| `PhoneSketch`                                                  | `components/sketch/phone-sketch.tsx`         | `{ model; zoom?: number; className?; built?: ReactNode }`                                                                                                                                                                                                                                                 | `w-36 aspect-[9/19]`, scaled with CSS `zoom` (1.5 in the hero strip and HIW, 1.2 in the closing).                                                                                                                                                                                                                        |
| `SketchChips`                                                  | `components/sketch/sketch-chips.tsx`         | `{ answers: Answers; answered: number; prefix?: string (default 'Your brief so far'); chipsClassName? }`                                                                                                                                                                                                  | Renders an sr-only sentence `${prefix}: Sentence, VetPres, …` and `aria-hidden` chips. Two e2e specs match the exact string `Example brief so far: Sentence, VetPres`.                                                                                                                                                   |
| `sketchModelFrom(answers, stage, files)`                       | `components/sketch/sketch-model.ts`          | `Answers`, stage 1-5, `SketchFiles { logo: string \| null; photos: readonly string[] }` → `SketchModel { company, description, initials, logo, imageStyle, imageLabel, photos, coloured, vars }`                                                                                                          | Style paints from stage 4, colour from stage 5; the `dark` style swaps the sketch scheme. `vars` sets `--sketch-bg/-bg-muted/-fg/-muted/-line/-dash/-strong/-on-strong/-soft/-glow`.                                                                                                                                     |
| Sketch parts                                                   | `components/sketch/sketch-parts.tsx`         | `Bar { className; part? }`, `Wordmark`, `Headline`, `Paragraph`, `CtaPill` (`{ model; frame: 'browser' \| 'phone' }`), `ImageBlock { model; className }`, `PhotoFill { url; style; className }`                                                                                                           | The wireframe vocabulary; a new sketch-style illustration should be built from these, not from new bars.                                                                                                                                                                                                                 |
| `SKETCH_CAPTION`                                               | `components/sketch/captions.ts`              | keys `yours`, `example`, `built`, `walkthrough`, `closing`                                                                                                                                                                                                                                                | The honesty labels. `home.spec.ts` and `tablet.spec.ts` match `example` and `built` verbatim; `copy.test.ts` checks every value. A new caption belongs here.                                                                                                                                                             |
| Example brief                                                  | `lib/brief/example-brief.ts`                 | `EXAMPLE_ANSWERS` (VetPres, minimal style, `#2e8c9c`), `DEMO_STAGES = [1,2,4,5]`, `FINAL_STAGE = 5`, `answersAt(stage, chars)`, `answeredAt(stage)`                                                                                                                                                       | Only example brief in code.                                                                                                                                                                                                                                                                                              |
| `EXAMPLE_FILES`                                                | `app/_components/photos.ts`                  | `{ logo: null, photos: [clinic.src] }`                                                                                                                                                                                                                                                                    | The one photograph: `app/_images/vetpres-clinic.webp`, 19,132 B, Pexels 6235243, no face, 640 px, 4:3; used as a CSS `background-image`, not `next/image`.                                                                                                                                                               |
| Colour helpers                                                 | `lib/brief/sketch.ts`                        | `initialsFrom`, `tabLabelFrom`, `brandHexFrom(colours)`, `tintsFrom(hex \| null, 'light' \| 'dark')`, `builtTintsFrom(hex)`                                                                                                                                                                               | Relative-`oklch()` derivations from one hex, hue kept.                                                                                                                                                                                                                                                                   |
| Token engine                                                   | `lib/tokens/derive.ts`, `lib/tokens/css.ts`  | `deriveTokens(hex, scheme, pairs): TokenSet`; `tokenStyle(tokens): CSSProperties`                                                                                                                                                                                                                         | Server-safe and pure; `app/examples/aurora/page.tsx` uses them to paint Aurora with Kestrel's amber `#f59e4a`.                                                                                                                                                                                                           |
| `typeStyle(style)`                                             | `app/preview/_components/fonts.ts`           | `VisualStyle` → `--template-font-display/body`                                                                                                                                                                                                                                                            | Four `next/font/google` pairs, `preload: false`.                                                                                                                                                                                                                                                                         |
| `revealDelay(index)`                                           | `app/_components/reveal.ts`                  | `CSSProperties`                                                                                                                                                                                                                                                                                           | See 1.5.                                                                                                                                                                                                                                                                                                                 |
| `WhatYouGetGlyph`                                              | `app/_components/what-you-get-glyphs.tsx`    | `{ name: 'layouts' \| 'colours' \| 'wording' \| 'link' }`                                                                                                                                                                                                                                                 | 56x40 SVG in the sketch vocabulary: `stroke-border`/`fill-border` for paper, `currentColor` (`text-brand-deeper`) for ink, `strokeWidth 1.25`. The model for any new glyph.                                                                                                                                              |
| `FaqEntry` (client)                                            | `app/_components/faq-entry.tsx`              | `{ index; question; answer }`                                                                                                                                                                                                                                                                             | Native `<details class="faq">`; tracks `faq_open { index }`; `globals.css` animates `::details-content` height.                                                                                                                                                                                                          |
| `HowItWorksTrack` (client)                                     | `app/_components/how-it-works-track.tsx`     | `{ heading: ReactNode; beats: ReactNode; actions: ReactNode }`                                                                                                                                                                                                                                            | Beats carry `data-beat="N"`; the stage paints stage N when a beat is 60% on screen.                                                                                                                                                                                                                                      |
| `HeaderChrome`, `MobileNav`, `SiteHeader`, `SiteFooter`        | `app/_components/*`                          | `NAV_LINKS`, `CTA`, `BOOK_CALL` from `nav-links.ts`; `FOOTER_GROUPS` from `footer-links.ts`                                                                                                                                                                                                               | `NavLink.href` is Next's `Route` type (typed routes on); `'/#examples'` typechecks as a hash route. Mobile rows stagger `delay-[calc(var(--i)*30ms)]`.                                                                                                                                                                   |
| `sentence-store.ts`, `lib/brief/draft.ts`                      |                                              | `setSentence/getSentence/subscribeToSentence`; `writeDraft(answers)` to `sessionStorage['pinnaclepx.brief']`                                                                                                                                                                                              | How the hero hands a sentence to `/start?q=2`; the closing frame reads the store. A "not-ready" path could reuse the draft store, but nothing persists across tabs or days.                                                                                                                                              |

---

## 3. The motion system and its rules

### 3.1 Gates

- `useMotionAllowed()` (`lib/motion/use-motion-allowed.ts`): `useSyncExternalStore` over `(prefers-reduced-motion: no-preference)`; **false on the server and during hydration**, so every leaf renders its finished state first and only a motion-allowing client rewinds.
- `whenIdle(cb)` (`lib/motion/idle.ts`): runs on `requestIdleCallback` (timeout 1500 ms), a 200 ms timer where it is missing (Safari), or the first scroll; returns a cancel function.
- `loadGsap()` / `loadLenis()` (`lib/motion/gsap.ts`, `lenis.ts`): cached dynamic imports. ESLint (`NO_MOTION_LIBRARIES` in `eslint.config.mjs`) forbids importing `gsap` or `lenis` outside `lib/motion`; `scripts/bundle-budget.mjs` fails the build if a chunk matching `/gsap\.version|_gsap|GreenSock/` (>20 KB) or `/lenis-smooth|lenisVersion/` (>5 KB) is in the home page's initial script tags.
- Templates may not import `lib/motion` at all (`TEMPLATES_ONLY_PURE`): template motion is CSS.

### 3.2 CSS tokens (`app/globals.css`)

`--motion-tap` 120 ms (hover, press), `--motion-enter` 200 ms (chevron, menu, header state, `question-in`), `--motion-settle` 300 ms (`sketch-in`, reveals; the design plan's hard cap for any single movement), `--motion-stagger` 40 ms (0 under reduce). Easings `--ease-enter` cubic-bezier(0.16, 1, 0.3, 1) for entrances, `--ease-standard` cubic-bezier(0.2, 0, 0, 1) for state changes; Tailwind utilities `ease-enter`, `ease-standard`, `duration-(--motion-enter)`, `animate-question-in`, `animate-sketch-in`. Timings JavaScript reads live in `CONFIG.demo` and `CONFIG.motion` (ADR 0005 item 5).

### 3.3 What runs under reduced motion

- Global rule: `transition-property: color, background-color, border-color, opacity !important` on everything, so any `translate`/`transform`/`height` transition becomes instant. Both site keyframes (`question-in`, `sketch-in`) are redefined as fade-only. `scroll-behavior: smooth` applies only under `no-preference`. **A new `@keyframes` with a translate must be redefined fade-only under `reduce`**, or `e2e/reduced-motion.spec.ts` fails: it scrolls through `how-it-works`, `taster`, `straight-answers`, `faq`, `cta` and asserts no running animation has `transform` or `translate` keyframes, and that `<html>` never gains the `lenis` class.
- Colour and opacity keep their durations (WCAG 2.3.3 excludes them). The FAQ height snaps; the header's colour state still transitions.
- GSAP and Lenis never load; the hero shows the finished sketch (`FINISHED` frame), `BuiltPage` never mounts (so its chunk, Montserrat, Caveat Brush and the photograph are never downloaded).

### 3.4 The rules a new section inherits

From ADR 0005 (as amended by 0006 and 0021) and the design plan section 5: may animate opacity, `translate` up to 0.5rem, scale 0.97 to 1, rotate (the FAQ chevron), colour, background-colour, border-colour, and `height` on `::details-content` only. Never: width, padding, margin, inset, font-weight, letter-spacing, box-shadow, blur or any filter, the glow's layers, the H1 or subhead (LCP), pinning, scroll snapping, SplitText. Loops: only the hero (owner decision, ADR 0006, knowingly short of WCAG 2.2.2 with no pause control). Scroll smoothing: Lenis site-wide (ADR 0021). The server renders every finished state; hidden-before-reveal exists only under `html[data-motion]`.

### 3.5 Lenis and anchors (`app/_components/smooth-scroll.tsx`, ADR 0021)

One leaf in the root layout; `lerp` from `CONFIG.motion.scroll.lerp` (0.1), `autoRaf`, `stopInertiaOnNavigate`, touch native. A capture-phase click listener handles links whose `href` is a fragment of the current page: `preventDefault`, `history.pushState(hash)`, `lenis.scrollTo(target)`; `next/link` sees the prevented default and stands down. A link carrying `data-lenis-ignore` (the skip link) or `download`, a modified click, a non-`_self` target, or another path is left alone. Lenis honours `scroll-padding-top: 4rem`. `scrollToTop()` in `lib/motion/lenis.ts` goes through Lenis while it runs. `e2e/home.spec.ts` asserts `<html>` gains class `lenis`, that clicking the nav's FAQ link lands on `#faq` with its top ≥ 64 px. A new `/#examples` link in `NAV_LINKS` works with no extra code.

### 3.6 IntersectionObserver patterns already on the page

| Leaf                   | Observes                 | Threshold / margin                          | Effect                                                                                                                              |
| ---------------------- | ------------------------ | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `PageMotion` (views)   | each id in `SECTION_IDS` | `CONFIG.analytics.sectionViewThreshold` 0.2 | `section_view { id }` once                                                                                                          |
| `PageMotion` (reveals) | `[data-reveal]`          | `rootMargin -10%` bottom                    | `data-inview`                                                                                                                       |
| `HeaderChrome`         | `#hero-cta`              | default                                     | `data-past-hero` on the header (phone CTA appears); scroll listener sets `data-scrolled` past `CONFIG.motion.headerScrolledAtPx` 24 |
| `HowItWorksTrack`      | `[data-beat]`            | `CONFIG.motion.walkthroughThreshold` 0.6    | paints stage N; last beat paints 4 then 5 after 900 ms                                                                              |
| `HeroStage`            | the stage div            | `CONFIG.demo.startThreshold` 0.25           | starts, pauses and resumes the loop                                                                                                 |

### 3.7 The hero loop, for anyone who touches the hero

`hero-loop.ts` (client-only): three forward-only GSAP timelines (brief, build, reset) chained by completion inside one `gsap.context`; FLIP by `data-part` pairs across `data-layer="sketch"` and `data-layer="built"`; inline styles cleared by name (`transform,transformOrigin,opacity,visibility,filter`), never `clearProps: 'all'`. `BuiltPage` is `next/dynamic` `ssr: false`, `memo`, and calls `onReady` so the loop can measure. Section attributes the tests read: `data-live`, `data-built`, `data-tinted` on `#hero`. Timings: `CONFIG.demo` (typing 16 ms/char, build 2400 ms, hold 3500 ms, reset 900 ms; about 15 s a pass). A first keystroke in the hero field kills the loop for good (`ownRef`). `e2e/home.spec.ts` asserts two full passes and that the LCP element stays `H1` (tablet: `H1` or `P`).

---

## 4. Analytics

`lib/analytics/events.ts` (client-only, `@vercel/analytics` `track`):

```ts
export type AnalyticsEvent =
  | 'cta_click'
  | 'call_click'
  | 'contact_click'
  | 'faq_open'
  | 'section_view'
  | 'brief_focus'
  | 'brief_step'
  | 'brief_error'
  | 'brief_complete'
export function trackEvent(
  event: AnalyticsEvent,
  data: Readonly<Record<string, string | number | boolean | null>>,
): void
```

- Adding an event: extend the union. If a link should carry it, widen the `Extract<…>` in `TrackedLink` (`components/ui/tracked-link.tsx`) or write a new leaf. Values must be flat primitives (Vercel's rule). The design plan reserved `example_open { business }` (unbuilt) and `section_view { id }` (built).
- `section_view`: `SECTION_IDS` in `app/_components/page-motion.tsx` is a hard-coded `as const` list: `what-you-get`, `how-it-works`, `taster`, `straight-answers`, `about`, `faq`, `cta`. The hero is not counted. **A new section must add its `id` here** or it is never counted. The comment says "Ids match app/page.tsx".
- `location` values in use: `hero`, `header`, `header-mobile`, `mobile-nav`, `how-it-works`, `taster`, `closing` (cta/call), `preview`, `preview-hub` (call), `about`, `footer` (contact). Keep the convention: the section id, or a named chrome slot.
- `/start` events: `brief_focus { location }`, `brief_step { step, location? }`, `brief_error { step, reason }`, `brief_complete { step }`. `faq_open { index }` uses an index so the value stays under Vercel's 255-character cap (plan note).
- Server-side events (`lead_created`, `preview_ready`, `call_booked`) are planned in the design plan and not built; nothing imports `@vercel/analytics/server`.
- Vercel Analytics and Speed Insights are mounted in `app/layout.tsx`; the plan's own note: custom events need the plan tier's permission (**Unverified** here; from the design plan, not checked today).

---

## 5. What the tests pin down

### 5.1 Playwright projects (`playwright.config.ts`)

| Project          | Viewport | Specs                                           | Options                    |
| ---------------- | -------- | ----------------------------------------------- | -------------------------- |
| `desktop`        | 1440x900 | `home.spec.ts`, `brief.spec.ts`, `a11y.spec.ts` |                            |
| `mobile`         | 390x844  | `mobile.spec.ts`, `a11y.spec.ts`                | `isMobile`, `hasTouch`     |
| `tablet`         | 768x1024 | `tablet.spec.ts`, `a11y.spec.ts`                | `isMobile`, `hasTouch`     |
| `reduced-motion` | 1440x900 | `reduced-motion.spec.ts`                        | `reducedMotion: 'reduce'`  |
| `no-script`      | 1440x900 | `no-script.spec.ts`                             | `javaScriptEnabled: false` |

Runs against `pnpm dev` (`reuseExistingServer` locally); the submit test skips without `E2E_SUBMIT=1`. CI job `e2e` runs the whole suite on Chromium.

### 5.2 Every home page assertion, by spec

**`home.spec.ts` (desktop)**

- H1 text is exactly `See your new website before you hire.`; `nav[aria-label="Main"]` visible.
- `#hero` has a link named `Show me my three designs` and a link `Book a 20-minute call` with `href` matching `/cal\.com/`.
- `#how-it-works`: heading `One question at a time.` visible; zero elements matching `/^Question \d$/`; exactly one matching `/Question \d of 5/`.
- Scrolling `#how-it-works [data-beat="5"]` into view shows `Question 5 of 5` and `VetPres`.
- Hero loop: caption `Sketch of an example brief. A first look, not one of the designs.` visible; `#hero` gains `data-built` and `data-tinted`; caption `The same example brief, built as an illustration. Not a client, and not one of the designs.` visible; then loses and regains `data-built` (two passes). Timeout 60 s.
- After a full build the LCP element's tag is `H1`.
- Typing a sentence into `What does your business do?` shows it in `#hero`, `#hero-cta` leads to `/start?q=2`, and Back shows the sentence in question one.
- `#taster`: heading matching `/Imagine what an hour does/`; link `Book a 20-minute call` → `/cal\.com/`.
- `#faq details` first entry opens on summary click.
- At 390x844: `Menu` button opens `nav[aria-label="Mobile"]` containing the `Show me my three designs` link.
- Title matches `/See your new website before you hire\./`; `og:image` matches `/opengraph-image/`; JSON-LD contains `"@type":"Organization"`.
- `<html>` gains class `lenis`; clicking `FAQ` in the main nav lands on `#faq`, in viewport, top ≥ 64.

**`brief.spec.ts` (desktop, home-related test only)**: for each of `#hero`, `#how-it-works`, `#taster`, `#cta`, the first link matching `/Show me my three designs|Answer the five questions/` has `href="/start"`.

**`mobile.spec.ts` (390x844)**

- `#hero-cta` top ≥ 64 and bottom ≤ 844; the text `Free. No sign-up. Nobody calls you unless you book.` inside `#hero` bottom ≤ 844.
- `scrollWidth === 390`.
- After `<html>[data-motion]`: the header's `Show me my three designs` link hidden; scrolling `#straight-answers` into view makes it visible; scrolling `#hero` back hides it.
- `#what-you-get`, `#straight-answers`, `#about`, `#faq` visible after scroll; `#straight-answers` has exactly **4** `h3`.
- Menu closes on Escape and returns focus to the button.

**`tablet.spec.ts` (768x1024)**: `#hero-cta` bottom ≤ 1024; `window.scrollTo(200,0)` leaves `scrollX === 0`; `#hero [data-frame="browser"]` visible; `data-built` within 25 s and the `built` caption visible; LCP tag is `H1` or `P`.

**`reduced-motion.spec.ts`**: `matchMedia` reports reduce; sr-only text `Example brief so far: Sentence, VetPres` attached; `#hero` never has `data-built`; after scrolling `how-it-works`, `taster`, `straight-answers`, `faq`, `cta`: `#how-it-works` has exactly one `Question 5 of 5`; no running animation with `transform`/`translate` keyframes; `<html>` has no `lenis` class.

**`no-script.spec.ts`**: headings `One question at a time.`, `Straight answers.`, `About the studio`, `Frequently asked questions`, `Your three designs are five questions away.` visible; first `Show me my three designs` link visible; `Example brief so far: Sentence, VetPres` attached; first `#faq details` opens natively and its `p` is visible; `#straight-answers` has 4 `h3`; `#what-you-get` has 4 `h3`.

**`a11y.spec.ts`** (all three viewports): waits for `#hero[data-built]` (scrolling the first visible `#hero [data-frame]` into view first), forces every `[data-reveal]` to `data-inview`, waits for all animations to stop, runs axe with `wcag2a`, `wcag2aa`, `wcag22aa`: zero violations on the page as loaded, and again with the menu open (if visible) and **every `#faq summary` clicked**.

### 5.3 Consequences for adding, reordering or changing sections

- **Adding a section between `HowItWorks` and `Taster` (the reserved slot) breaks no existing assertion.** No spec asserts section order; the only order-dependent test scrolls to `#straight-answers` to make the header CTA appear, which any position after the hero satisfies.
- **A fifth straight answer breaks two specs** (`mobile.spec.ts` and `no-script.spec.ts` assert 4 `h3` in `#straight-answers`). Gate it or update both counts in the same change. A fifth "What you get" cell breaks `no-script.spec.ts` (4 `h3`).
- **Any change to** the H1, the two sketch captions, `Question N of 5` inside `#how-it-works`, the chips prefix sentence, the CTA label `Show me my three designs`, the call label `Book a 20-minute call`, or the five heading strings in `no-script.spec.ts` needs the matching spec change.
- **A new section's H2 should join `no-script.spec.ts`** so JavaScript-off completeness stays tested; its list should be `data-reveal` (already handled by `a11y.spec.ts`); anything interactive (a snap row, a picker) must pass axe with tags `wcag22aa` at 390, 768 and 1440 px.
- **A new FAQ item** is auto-covered: `a11y.spec.ts` clicks every summary; `copy.test.ts` checks every `FAQ_ITEMS` string.
- **A new `<details>` or disclosure elsewhere** is not auto-covered; add it to `a11y.spec.ts` if it can hide content.
- **A section that renders a template or an iframe**: `a11y.spec.ts` waits for `#hero[data-built]` then scans the whole document; an iframe's contents are not scanned by axe by default; a same-origin embedded template would be scanned and must pass (Aurora's example did on 4 September, ADR 0008).
- **CLS**: no e2e CLS test exists (the design plan's CLS test was not built); `lighthouserc.json` sets 0.02 but is not run.

### 5.4 The copy test (`app/_components/copy.test.ts`, Vitest, runs pre-push and in CI)

`COPY` = `SITE.tagline`, `SITE.description`, `SITE.reassurance`, `SITE.callPromise`, `SITE.colourPromise`, every `SKETCH_CAPTION` value, every `CALL_AGENDA.what`, every `WHAT_YOU_GET_ITEMS` title and detail, every `STRAIGHT_ANSWER_ITEMS` question and answer, every `FAQ_ITEMS` question and answer. Four rules:

1. No sentence over 20 words (split on `.!?` followed by whitespace; words split on whitespace).
2. No em dash `—`.
3. Exactly **2** matches of `\bAI\b` across all of `COPY`.
4. No `\bcopy\b` (case-insensitive).

**Not covered today**: the hero subhead (`hero.tsx` JSX), the HIW lead, beats and `LEGEND` (`how-it-works.tsx`), the Taster H2, lead and `STEPS` (`taster.tsx`, not exported), About's two paragraphs (`about.tsx`), the footer blurb (`site-footer.tsx`), the Straight answers lead, the FAQ lead, the closing H2, the `Field` label and hint in the hero. A plan should put every new section's words in an exported `*-items.ts` or `lib/site.ts` constant and add it to `COPY`; it may also add the existing JSX prose to the test as a cheap win. There is **no** reading-level (Flesch-Kincaid) script; the design plan (section 7, roadmap 0.2) describes one as a CI warning over `*-items.ts`, `lib/site.ts` and the section components. Not built.

Other unit tests touching the home page: `components/sketch/sketch-model.test.ts`, `lib/motion/flip.test.ts`, `lib/brief/*.test.ts`; `tests/integration/registry.test.ts` asserts `TEMPLATES.length === CONFIG.templates.count`, unique ids, Aurora ready, every ready template has a contract whose fallback fits, `t02-monolith` has no contract.

---

## 6. Templates: what exists, the contract, and rendering at frame size

### 6.1 State

| Template                     | `meta.ready` | Contract                           | Component                                                                                                    | Notes                                                                                                                                                            |
| ---------------------------- | ------------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `t01-aurora`                 | **true**     | `templates/t01-aurora/contract.ts` | seven sections under `sections/`, `aurora.css` (2,865 B raw), one client component (`nav-menu.tsx`)          | `polarity: 'either'`, `tones: ['luminous','product','confident']`; example brand Kestrel with two Pexels WebPs (`gauge.webp` 41,530 B, `radiator.webp` 83,064 B) |
| `t02-monolith` … `t10-orbit` | false        | none                               | `index.tsx` renders `<section class="min-h-screen bg-surface p-8 text-on-surface"><h1>{name}</h1></section>` | `description: 'Placeholder. Replace with the real template description.'`, `tones: []`; listed as knip entries                                                   |

`templates/registry.ts`: `TEMPLATES` is a ten-element tuple (`TemplateTuple`, compile-time), `READY_TEMPLATES = TEMPLATES.filter(t => t.ready)`, `CONTRACTS` map (Aurora only), module-load checks for unique ids and a contract per ready template, `contractFor(id)`. It is the only file under `templates/` that `lib/` may import (ESLint `LIB_ONLY_REGISTRY`), and it must not import components (`NO_COMPONENTS_IN_CONTRACTS`).

### 6.2 The contract (ADR 0008, `lib/copy-slots/contract.ts`)

`TemplateContract = { meta, contrastPairs, imageSlots, copySchema (zod, shape only), guide (prompt text), fallbackCopy(brief), copyViolations(copy), headlineOf(copy) }`. Aurora: `AuroraContent` (`copy-slots.ts`) is one object: `brand { name, legalName, tagline, logo }`, `nav { links[2-4], cta }`, `hero { headline, subhead, primary, secondary, reassurance, frame { title, rows[3] }, image | null }`, `features { title, lead, items[3] }`, `steps { title, lead, items[3] }`, `statement { text, image | null }`, `cta { headline, body, action, reassurance }`, `footer { groups[1-2] }`. Character ranges in `AURORA_SLOTS` (e.g. `hero.headline` 18-60, `hero.subhead` 60-190, `statement.text` 60-180). Nine `AURORA_CONTRAST_PAIRS`; `imageSlots: ['hero', 'statement']`. Links are never written by the model: `assembleAurora` maps a fixed link plan onto anchors (`#features`, `#how-it-works`, `#why`, `#start`, `#top`). Assets: `TemplateAssets { logo: wordmark | image{src,alt,width,height}; images: Record<slot, SlotImage | null> }` with `SlotImage { src, alt, width, height, credit | null }`.

Painting rules: only the fourteen token names in `lib/tokens/types.ts` as Tailwind classes (alpha allowed, e.g. `bg-on-surface/6`); two font variables; motion in the template's own scoped stylesheet, CSS only, page complete without it; `@supports (animation-timeline: scroll())` for the scroll-driven parts; the header's glass is colour so it runs under reduce.

### 6.3 How a template is rendered

- `templates/render.tsx`: `renderConcept(templateId, copy, assets)` is a `switch` (Aurora only); it validates `copy` with the template's zod schema and calls `assembleAurora`. Only the preview pages import it.
- `app/preview/[slug]/[templateId]/page.tsx`: reads the row (`readPreview`), computes `statusOf(row)`, wraps the template in `<div style={{ ...tokenStyle(row.tokens), ...typeStyle(answers.imagery.style) }}>` under a `StudioBar`. Fully dynamic; a row that is not ready shows `ConceptPending` (polls every `CONFIG.polling.statusMs`).
- `app/examples/aurora/page.tsx`: `<div style={tokensFor(scheme)}><Aurora content={KESTREL} /></div>` where `tokensFor` = `tokenStyle(deriveTokens('#f59e4a', scheme, AURORA_CONTRAST_PAIRS))` plus Bricolage Grotesque and Instrument Sans (`preload: false`). `robots: noindex`, unlinked, `?scheme=light` for the light polarity. ADR 0008 item 7: "the examples gallery replaces it".
- `next.config.ts`: `images.remotePatterns` allows `*.public.blob.vercel-storage.com` (pipeline images); no `formats` key (Next's default is WebP only; the design plan's AVIF request was not done).

### 6.4 Can Aurora render inside the home page at frame size?

**Not as a DOM child, and not without work.** Facts:

- Breakpoints: `md:` x32, `lg:` x3 (`hero.tsx`, `nav.tsx`, `nav-menu.tsx`, `features.tsx`, `how-it-works.tsx`, `statement.tsx`, `cta.tsx`, `footer.tsx`, `product-frame.tsx`). Viewport units: `h-[70vh]` and `top-[-20vh]`/`h-[50vh]`/`top-[-15vh]`/`h-[45vh]` in `aurora-field.tsx`, `min-h-[70svh]` in `statement.tsx`, `animation-range: 0 100vh` in `aurora.css`. No container queries. Inside a 600 px frame on a 1440 px viewport the desktop grid would apply at 600 px.
- Document collisions listed in section 0 item 6 (`id="main"`, `id="how-it-works"`, second `<h1>`, sticky `z-50` header, `scroll(root)` timelines).
- Options, with what each costs in this codebase:
  1. **`<iframe src="/examples/aurora" loading="lazy" title="…">`**: its own viewport, so `md:` and `vh` behave; honest (a real render); no change to the template. Costs a second document (Aurora's CSS and the `NavMenu` chunk, two Google font families at first paint of the frame, the two example WebPs), makes the `noindex` route linked, and axe does not scan inside it. Lenis and the page's observers ignore it. Keyboard focus can enter it; give it a `title` and a visible "Open in a new tab" link. `resource-summary` budgets in `lighthouserc.json` count iframe requests once the frame loads (**Unverified**: whether the lazy frame loads inside Lighthouse's viewport at 390 px depends on where the section sits).
  2. **Static captures**: the design plan's `scripts/render-examples.ts` (Playwright by hand at 1440x900 and 390x844, `animations: 'disabled'`, WebP/AVIF via `sharp`, committed under `app/_images/examples/`, static `import`, `next/image` with `sizes`). Zero runtime JavaScript, honest if captioned as a render of the template with the example content, re-run when `templates/` changes. Nothing of it exists yet; `next/image` is not used on the home page today, so the first static image import brings the `next/image` client code with it (small; **Unverified** exact bytes against the 210 KB script budget with ~3.8 KB headroom).
  3. **Retrofit Aurora to container queries** (Tailwind 4 `@container` and `@md:` variants; replace `vh` with `cqh` or fixed rem): makes one component work in a frame and full width. Touches a shipped template (an ADR 0008 amendment), the CI grep the design plan wanted, and the nine remaining templates' shape. Medium effort; the durable fix if the examples band is meant to show live templates.
  4. **A scaled inline render (`zoom` or `transform: scale`)** is not viable: viewport breakpoints still key off the real viewport and the id/landmark collisions remain. **Unverified** how `zoom` interacts with `vh`; not worth testing given the collisions.
- **Never**: a fake preview. The hero's `BuiltPage` is the illustration pattern the codebase already accepts (labelled "built as an illustration", client-only, Montserrat and Caveat Brush so it reads as another brand's site); it is not a template and must keep its caption.

### 6.5 Gating templates in code

- `READY_TEMPLATES.length` is the one runtime signal (1 today). It is imported by `app/start/_components/actions.ts` and `lib/inngest/functions/build-concepts.ts`; `lib/preview/status.ts` imports `TEMPLATES` for names. A home page server component may import `READY_TEMPLATES` from `@/templates/registry` (nothing forbids `app/` importing the registry; `app/preview` already does).
- `CONFIG.templates = { count: 10, conceptsShown: 3 }`; `conceptCountFor(ready) = min(3, ready)`.
- `ALLOW_REPEAT_TEMPLATES=1` (`lib/env.ts`) lets one address see the same template again in development; refused when `VERCEL_ENV === 'production'`. Not for the home page.
- The Straight answer "Will it look like everyone else's?" is, per the comment in `straight-answer-items.ts`, to join "once the ten templates render"; the design plan gates it on all ten, not three.

---

## 7. Images and performance budgets

### 7.1 Image handling today

- `app/_images/vetpres-clinic.webp` (19,132 B) is the only site image; static `import clinic from '@/app/_images/vetpres-clinic.webp'`, used as `clinic.src` in a CSS `background-image` (`PhotoFill`), not `next/image`. Provenance and licence are in the comment in `photos.ts`; the design plan's rule puts captions and alt beside the imports in that file.
- Templates use `next/image`: `product-frame.tsx` (`width`/`height`, `sizes="(min-width: 1024px) 240px, 100vw"`), `statement.tsx` (`fill`, `sizes="100vw"`), `logo.tsx`. Example content passes `gauge.src/width/height` from static imports.
- Pipeline images are re-hosted on Vercel Blob (`remotePatterns`), stored at `CONFIG.images.maxWidth` 1920, quality 80.
- Rules from the design plan section 4 that stand: static imports only (never a string `src`), fixed 4:3 or 3:2 boxes, lazy below the fold with `sizes` per column, **no photograph above the fold** (the H1 stays LCP; two e2e tests enforce it), any treatment baked into the file, never a face, never stock people, never a real business under an invented name, one mono caption line under every photograph (facts only, under 15 words), alt under 125 characters.
- Fonts: Geist and Geist Mono preloaded (root layout); Montserrat and Caveat Brush only with `BuiltPage` (client, `preload: false`); Aurora's Bricolage and Instrument Sans only on `/examples/aurora` (`preload: false`); the four preview pairs in `app/preview/_components/fonts.ts`.

### 7.2 Budgets and where they are enforced

| Budget                               | Value                                                                | Enforced by                                                     |
| ------------------------------------ | -------------------------------------------------------------------- | --------------------------------------------------------------- |
| `/` initial scripts                  | 210,000 B gzipped (measured 206,202 on 3 Sept, ADR 0006)             | `scripts/bundle-budget.mjs`, CI job `budget` after `pnpm build` |
| `/` stylesheets                      | 14,000 B (measured 13,365 after Aurora, ADR 0008)                    | same                                                            |
| `/` HTML                             | 25,000 B (measured 21,602)                                           | same                                                            |
| `/start` scripts                     | 245,000 B (raised for zod 4, ADR 0019)                               | same                                                            |
| GSAP and Lenis lazy                  | pattern match on initial script chunks                               | same                                                            |
| LCP                                  | ≤ 2,000 ms mobile                                                    | `lighthouserc.json` only; **not run**                           |
| CLS                                  | ≤ 0.02                                                               | `lighthouserc.json` only; **not run**                           |
| TBT                                  | ≤ 150 ms                                                             | `lighthouserc.json` only; **not run**                           |
| Performance / a11y / best practices  | ≥ 0.95 / 1.0 / 1.0                                                   | `lighthouserc.json` only; **not run**                           |
| Script / image / total / third-party | ≤ 230,000 / 500,000 / 600,000 B / 4 requests                         | `lighthouserc.json` only; **not run**                           |
| LCP element                          | `H1` at 1440, `H1` or `P` at 768                                     | `e2e/home.spec.ts`, `e2e/tablet.spec.ts`                        |
| Fold                                 | `#hero-cta` and trigger inside 844 px at 390; CTA inside 1024 at 768 | `mobile.spec.ts`, `tablet.spec.ts`                              |
| No sideways scroll                   | `scrollWidth === 390`                                                | `mobile.spec.ts`                                                |
| WCAG 2.2 AA                          | axe zero violations, three viewports                                 | `a11y.spec.ts`                                                  |

Design plan section 8 field targets (not enforced anywhere): LCP 2.0 s p75, INP 150 ms, CLS 0.05; images 250 KB at 390 px and 500 KB at 1440; any non-LCP photo 60 KB; first-load requests 20, third-party 4. The design plan's `WebVitals` leaf and long-animation-frame observer are not built.

Headroom today (from the measured numbers): scripts about 3.8 KB, CSS about 635 B, HTML about 3.4 KB. A plan that adds `next/image`, an iframe, or several new grid recipes must either measure after `pnpm build && pnpm budget` or budget for a recorded increase.

---

## 8. Hard constraints from `docs/standards.md` and where each is checked

| Constraint                                                                                                                                     | Mechanical check (file)                                                                                                                                                                                                                         | Applies to                                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Templates paint only with the fourteen tokens; no hex, no Tailwind palette classes                                                             | ESLint `no-restricted-syntax` (`NO_HEX_OR_PALETTE`) on `templates/**` and the CI grep step "Forbid hex/palette/viewport units in templates" in `ci.yml` (the step's name says viewport units; its two greps check hex and palette classes only) | `templates/` only. `app/` and `components/` have **no** hex or palette lint; tokens there are convention (all current code complies). |
| Templates import only `@/lib/tokens/*` and `@/lib/copy-slots/*`, never `@/app`                                                                 | ESLint `TEMPLATES_ONLY_PURE`, `TEMPLATES_NO_APP`                                                                                                                                                                                                | `templates/**`                                                                                                                        |
| `lib/` never imports `app/` or `templates/` (except the registry from select, inngest, preview)                                                | `LIB_NO_APP_OR_TEMPLATES`, `LIB_ONLY_REGISTRY`                                                                                                                                                                                                  | `lib/**`                                                                                                                              |
| Pure modules never import IO modules                                                                                                           | `PURE_NO_IO` on `lib/tokens`, `lib/copy-slots`, `lib/select`                                                                                                                                                                                    |                                                                                                                                       |
| Registry and contracts hold no components                                                                                                      | `NO_COMPONENTS_IN_CONTRACTS`                                                                                                                                                                                                                    | `templates/registry.ts`, `templates/*/contract.ts`                                                                                    |
| `gsap` and `lenis` only in `lib/motion`, lazy                                                                                                  | `NO_MOTION_LIBRARIES` + `bundle-budget.mjs`                                                                                                                                                                                                     | everywhere                                                                                                                            |
| Anthropic and Pexels only from `lib/ai` and `lib/images`                                                                                       | `NO_ANTHROPIC_SDK`, `NO_PEXELS_SDK`, `NO_THIRD_PARTY_HOSTS`                                                                                                                                                                                     | everywhere                                                                                                                            |
| No barrel imports                                                                                                                              | `NO_BARREL` (`^@/(lib\|templates\|components)/.*/index$`)                                                                                                                                                                                       | everywhere                                                                                                                            |
| No default exports outside Next file conventions                                                                                               | `import/no-default-export` with an ignore list                                                                                                                                                                                                  | everywhere                                                                                                                            |
| `process.env` only in `lib/env.ts` (and config files)                                                                                          | `no-restricted-properties`                                                                                                                                                                                                                      |                                                                                                                                       |
| `console` only in `lib/log.ts`                                                                                                                 | `no-console`                                                                                                                                                                                                                                    |                                                                                                                                       |
| No `any`, no non-null assertions, no empty catch, `type` not `interface`                                                                       | typescript-eslint `strictTypeChecked` + `stylisticTypeChecked`, explicit rules                                                                                                                                                                  |                                                                                                                                       |
| Strict TS: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `verbatimModuleSyntax`, `noUnusedLocals/Parameters` | `tsconfig.json`; `pnpm typecheck` in pre-push (`lefthook.yml`) and CI                                                                                                                                                                           |                                                                                                                                       |
| Prettier (with Tailwind class sorting) and ESLint on staged files                                                                              | `lefthook.yml` pre-commit                                                                                                                                                                                                                       |                                                                                                                                       |
| No unused files, exports or dependencies                                                                                                       | `pnpm knip` in CI (`knip.jsonc`: `templates/*/index.tsx` and `drizzle.config.ts` are entries)                                                                                                                                                   | new files must be imported or listed                                                                                                  |
| Every tunable number in `lib/config.ts`; CSS durations in `globals.css` (ADR 0005 exception)                                                   | convention and review only; no lint                                                                                                                                                                                                             |                                                                                                                                       |
| Server components by default; small client leaves                                                                                              | convention; Next errors on non-serialisable props                                                                                                                                                                                               |                                                                                                                                       |
| Typed routes                                                                                                                                   | `typedRoutes: true`; `NavLink.href: Route`                                                                                                                                                                                                      | new hrefs must exist or be hash routes                                                                                                |
| WCAG 2.2 AA                                                                                                                                    | `a11y.spec.ts` (axe) at three viewports                                                                                                                                                                                                         | home page only                                                                                                                        |
| Complete without JavaScript; reduced motion honoured                                                                                           | `no-script` and `reduced-motion` Playwright projects                                                                                                                                                                                            |                                                                                                                                       |
| Voice rules (20 words, no em dash, "AI" twice, no "copy")                                                                                      | `copy.test.ts`                                                                                                                                                                                                                                  | registered constants only                                                                                                             |
| Byte budgets                                                                                                                                   | `bundle-budget.mjs` in CI                                                                                                                                                                                                                       | `/` and `/start`                                                                                                                      |
| Exactly ten templates, unique ids, contract per ready template                                                                                 | `TemplateTuple` at compile time; module-load throws; `tests/integration/registry.test.ts`                                                                                                                                                       |                                                                                                                                       |
| Template example content fits its slots; contrast pairs over known tokens                                                                      | `templates/t01-aurora/copy-slots.test.ts`                                                                                                                                                                                                       |                                                                                                                                       |
| One `globals.css` (with the per-template scoped stylesheet exception, ADR 0008 item 5)                                                         | convention                                                                                                                                                                                                                                      | a new home page section adds no stylesheet                                                                                            |
| No `use cache`; preview dynamic                                                                                                                | convention (standards TL;DR)                                                                                                                                                                                                                    |                                                                                                                                       |
| Never log personal data                                                                                                                        | convention                                                                                                                                                                                                                                      |                                                                                                                                       |

Standards Area 8 anti-patterns with only a review check: `useEffect` for data fetching, business logic in handlers or actions, non-serialisable props.

---

## 9. Numbers and strings that reach the copy, and where

### 9.1 `CONFIG` (`lib/config.ts`) values rendered to visitors

| Value                                                               | Rendered in                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `retention.days` = 30                                               | `what-you-get-items.ts` cell 4 ("It stays live for 30 days."); `faq-items.ts` item 4 ("We delete them after 30 days unless you have booked a call."); `app/start/_components/brief-done.tsx:91`; `app/privacy/page.tsx` (three places); `lib/email/preview-link.ts` (text and HTML); the sweep itself (`lib/inngest/functions/retention-sweep.ts`, cron `0 3 * * *`) |
| `call.minutes` = 20                                                 | `nav-links.ts` `BOOK_CALL.label` ("Book a 20-minute call", every call link and both e2e assertions); `taster.tsx` `STEPS[1].body` ("20 minutes. We go through…"); `lib/site.ts` `CALL_AGENDA` last item `to`; `lib/email/preview-link.ts` (twice). The comment: "the Cal.com event length is set by hand to match".                                                  |
| `templates.count` = 10, `templates.conceptsShown` = 3               | `lib/select/select.ts` `conceptCountFor` and `tests/integration/registry.test.ts` only. **No copy derives from them.**                                                                                                                                                                                                                                               |
| `form.maxChars` = 400                                               | the hero `<input maxLength>` (`hero-stage.tsx`); `form.minChars` = 30 is enforced on `/start`                                                                                                                                                                                                                                                                        |
| `deadline.totalMs` = 300,000                                        | the done page's countdown ring; the words "about five minutes" are hard-coded prose in `hero.tsx`, `SITE.description`, `faq-items.ts` item 2, `taster.tsx`                                                                                                                                                                                                           |
| `analytics.sectionViewThreshold` = 0.2, `motion.*`, `demo.*`        | behaviour only (sections 3 and 4)                                                                                                                                                                                                                                                                                                                                    |
| `QUESTION_IDS.length` = 5 (`lib/brief/question-ids.ts`, not CONFIG) | `ProgressSteps total` in HIW; the words "five questions" are hard-coded prose everywhere else                                                                                                                                                                                                                                                                        |

### 9.2 Hard-coded counts a plan must keep consistent (or derive)

"three" / "Three": `hero.tsx` subhead; `lib/site.ts` `SITE.description` and `CALL_AGENDA[0]`; `what-you-get-items.ts` "Three designs, not one"; `nav-links.ts` `CTA.label` "Show me my three designs"; `how-it-works.tsx` `LEGEND` "Three designs / picked for you"; `taster.tsx` H2, lead and step 01; `straight-answer-items.ts` item 3 ("three you haven't seen. Up to nine in all." = 3 x 3); `about.tsx`; `faq-items.ts` item 6; `closing-cta.tsx` H2; `site-footer.tsx` blurb. Also `/start`'s final button "Show me my three designs" (`e2e/brief.spec.ts`). The done page and preview hub already say "design"/"designs" from the real count.

### 9.3 `SITE` (`lib/site.ts`)

`name` PinnaclePX; `legalName` Pinnacle PX; `tagline` "See your new website before you hire." (H1, `<title>`, e2e); `description` (meta, OG, JSON-LD); `reassurance` "Free. No sign-up. Nobody calls you unless you book." (under both CTAs; `mobile.spec.ts` matches it); `callPromise` "No pitch. We look at your designs together." (Taster, preview hub, email); `colourPromise` (What you get cell 2 and question five); `town: null`, `contactEmail: null`; `bookingUrl` placeholder. `CALL_AGENDA`: 0-5 "You say what is wrong with the three designs.", 5-15 "What you sell, who you want more of, and what customers ask before they book.", 15-20 "A fixed quote and a timeline."

### 9.4 Navigation and footer today

`NAV_LINKS`: How it works (`/#how-it-works`), About (`/#about`), FAQ (`/#faq`). `CTA`: "Show me my three designs" → `/start`. `BOOK_CALL` → `SITE.bookingUrl`. `FOOTER_GROUPS`: "The five questions" (How it works, Straight answers, FAQ) and "Studio" (About, "What an hour does" → `/#taster`, Privacy → `/privacy`, Book a 20-minute call). The footer's comment: "Only destinations that exist." The desktop nav is `hidden md:block` with `ghost sm` buttons; the mobile panel rows stagger 30 ms each ("four rows, so the last arrives within 120 ms"). Whether a fourth desktop link fits beside the CTA at 768 px is **Unverified** (not measured today).

### 9.5 The privacy page (`app/privacy/page.tsx`) already answers part of the new objections

It names the processors (Vercel, Neon, Inngest, Anthropic "writes the wording from your sentence, and judges stock photographs", Pexels, Resend), states retention, lawful basis, "one email", "no mailing list", rights and the ICO. It says nothing about model training either way (grep for "train" in `app/` and `lib/` finds nothing). A home page straight answer about training would need a true statement the owner confirms about the Anthropic API terms; the code holds no such fact.

---

## 10. Where the persuasion arc and the reserved slot are recorded

- `docs/home-page-plan.md` section 2: nine visitor thoughts mapped to sections (hero → What comes back → How it works → Taster → Straight answers → About → FAQ → Closing); section 3.5 "Examples (deferred)": "Ship nothing in this slot until then: no mock browser frames, no grey bars, no stock photography."
- `docs/home-page-design-plan.md` section 3.5: the band's copy and layout ("Nine designs from three example briefs", cards each 4/12, mono eyebrow "Example brief, not a client", phone snap row, `example_open`, "Examples" in `NAV_LINKS`, the fifth straight answer gated on all ten), the container-query decision, and `scripts/render-examples.ts`; section 10 roadmap rows 2.1 to 2.3; section 11 decisions 3 (example names checked at Companies House), 5 (payment, ownership, domain FAQ "only once every clause is true"), 10 (Vercel Pro), 11 (container queries), 15 (one reminder email), 16 (Google reviews), 17 ("AI" once).
- `app/page.tsx:14`: the slot sits between `HowItWorks` and `Taster`.
- `docs/adr/0008` item 7: `/examples/aurora` is for design review and "the examples gallery replaces it".
