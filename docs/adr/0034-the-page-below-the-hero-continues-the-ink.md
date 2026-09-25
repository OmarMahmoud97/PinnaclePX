# The page below the hero continues the ink

- Status: accepted
- Date: 23 September 2026 (the foundation and, the same day, the closing commit)
- Supersedes: `docs/home-page-design-plan.md` below the hero (sections 4 to 8) and its
  "instrument register" (line 265)
- Amends: ADR 0005 (item 6, the caps and scroll-tied motion below the hero), ADR 0025
  (decision 1, ScrollTrigger), ADR 0026 (decisions 1, 2 and 8, the builder lane's muted `dd`,
  and its refusals of scroll-driven inking, ambient motion below the hero and the H2 italic),
  ADR 0031 (decision 4, the hero's italic is now a true italic)
- Keeps: ADR 0031 and 0032 otherwise whole; the hero's composition, ramp, ink and headline
  fills, subject to the re-measure recorded in the consequences
- Amended by: ADR 0037 (decision 3's italic rule on `/start`, and the pool's exemption from the
  caps, which now covers the `/start` curve, 25 September 2026)
- Plan: `docs/home-page-redesign-plan.md`, amended by the director on 23 September 2026 (A1 to
  A3)

## Context

The hero (ADR 0031) ends in the studio's ink: a `#020a12` foot with the clients' marks on it.
Below it the page was a white ruled sheet inside a hairline frame, with `divide-y` between
nine sections, `gap-px bg-border` cell grids, `divide-x` column rules, a dot grid and corner
ticks on the walkthrough stage, and one tinted band for the commercial pair. The owner's
brief for the redesign, 22 to 23 September 2026: keep every sentence, section and order (ADR
0033), keep the hero, and make the lower page belong to it. A design panel of five directions
was judged against the brief (`understand-brief.md`, section 3 of which is the fence: the
pinned tests, the hero's physics, the reduced-motion allowlist, the byte lines) and the winning
direction, "the ink continues", took eight grafts from the runners-up. The director's decisions
D1 to D12 and amendments A1 to A3 settle the points the panel left open.

Constraints that shape the decision and are not overridden by the brief: the H1 is the LCP on
desktop and its fills are measured artefacts (ADR 0031); nothing between the H1 and `#hero`
may create a stacking context; server markup renders every element finished (ADR 0005 d1); the
reduced-motion allowlist transitions colour and opacity only; GSAP and Lenis import only under
`lib/motion/**` behind cached loaders and never ride the initial bundle; the Lighthouse script
line of 230,000 B counts everything fetched at idle; site-only tokens live in `app/globals.css`,
never in `app/tokens.css`; knip is a CI gate; the Your options lanes carry no weighting (CAP
Code section 3).

## Decision

1. **The lower page is the hero's ramp run again.** One dark stretch on the hero's foot
   (`#work` and `#included` inside `div.ink-stretch[data-theme="dark"]`, ground `--ink-foot`
   `#020a12`), which ends in a pooled elliptical edge over a wash taken from the ramp's top
   stops (`--surface-wash-deep` `#c6dcee` into `--surface-wash` `#e2eef7`) that carries the
   walkthrough, Real build and Your options; the wash dissolves to white over the last band and
   a half of Your options; Straight answers, About and the questions sit on white with wash
   cards; the closing keeps the ink on white (ADR 0032); the footer is a dark sheet with rounded
   top corners laid over the closing's foot. Lightness reads dark, dark, dark, curve, tinted,
   tinted, tinted, dissolve, white, white, white, white with ink, dark. Every ground is a stop of
   the hero's ramp or a token the page already had. Two derived values are not grounds and not
   from the ramp: `--ink-line` `#18242c`, the rule colour inside the dark scope (1.26:1 on the
   foot, a rule and never text), and `--wordmark` `#1b2e44`, the footer's decorative wordmark
   (1.44:1 on the foot, `aria-hidden`, never read); both are the foot lifted a few levels so
   they sit in it rather than on it.

2. **Hairlines are gone below the hero.** Separation is a ground, a card, air (`--spacing-band`)
   or one of two shapes (the pooled curve, the footer sheet); never a rule. The page frame
   (`border-x` on main, footer and the header's inner column, with its `data-framed` observer),
   `divide-y` between sections, `sectionGrid`'s `divide-x`, the `gap-px bg-border` cell grids,
   Included's nested `bg-border` layers, the `bandEdge` gradients, the walkthrough stage's rule,
   dots and ticks, the FAQ's `divide-y`, the footer's `border-t` and `divide-x`, the header's
   `border-b` and the Work radio pills' borders all go (the plan's section 4.5 lists all 24).
   What stays as a control or an illustration: the header nav's rule, the mobile drawer's edge,
   the hamburger's ring and the sketch bezels, which the dark scope recolours.

3. **Two families, loaded through `next/font`: Mona Sans and Instrument Serif italic.**
   Mona Sans is one variable weight file with no width axis (`weight: 'variable'`, roman only)
   on `--font-site-sans`; Instrument Serif is one static italic file on `--font-site-serif`.
   Geist, Geist Mono and the mono register are retired: `--font-mono` in `tokens.css` is a
   fileless system stack kept only for the `code/pre/kbd/samp` preflight, and the sixteen
   `font-mono` sites outside the section files drop the class and keep or add `tabular-nums`
   where they show numerals. The italic appears on exactly three phrases, by CSS on an existing
   `<em>`: the hero's "before", the walkthrough H2's "look" (`HOW_IT_WORKS.emphasis`, a
   constant like `HERO.emphasis`, applied by the `emphasised` helper now exported from
   `words.tsx`) and the closing's "Looking is free." The hero's `em` keeps its 1em box; the two
   H2 ems are `1.06em` at `line-height: 0.94` under the `.emphasis` class. The body carries
   `font-synthesis: none`, so a missing italic shows as missing and never as a slanted sans. The
   walkthrough's Montserrat and DM Serif Display stay inside the phone as the invented
   client's brand and do not count toward two. The H1 follows the site's family (D1); its line
   count is measured at six widths and the fills stand only where the count holds (see the
   consequences). Amended 25 September 2026 (ADR 0037, Release 3): on `/start` each question's
   title carries one fixed italic payoff word, one display italic on screen at a time, and the
   draft beside it at most two italic notes; the home page's three phrases are unchanged.

4. **Site-only tokens and one dark scope in `app/globals.css`.** New `:root` values
   (`--ink-foot`, `--ink-card`, `--ink-raised`, `--on-ink`, `--on-ink-muted`, `--ink-line`,
   `--brand-ink`, `--surface-wash`, `--surface-wash-deep`, the four `--job-*` hues,
   `--backlight`, `--wordmark`, the three shadows, `--glow-corner`, `--motion-reveal`), their
   utilities in globals' own `@theme inline` block, and the spacing, radius, tracking, numeral
   and jobword type tokens plus the line-height and tracking retune of the shared scale in
   globals' own `@theme` block, so `tokens.css` and the templates' scale do not move. The scope
   rule `[data-theme='dark'], [data-solid][data-over-dark]` re-declares `--surface`,
   `--surface-muted`, `--surface-tint`, `--on-surface`, `--on-surface-muted`, `--border`,
   `--accent` and `--brand-ink`, sets `color-scheme: dark`, and sets `color: var(--on-surface)`
   so inheritance restarts at the scope (body's navy would otherwise be inherited into the
   stretch by every element without a colour class; the mobile axe run found 38 such
   findings). `--brand-ink` splits coloured text and meaningful icons (`#0369a1` on light,
   `--brand` inside the scope) from fills, which stay on `--brand-deeper`; every `text-brand-deeper`
   as text and every `ring-brand-deeper` / `outline-brand-deeper` moves to the `brand-ink`
   utilities on the home page below the hero and in `components/ui` (the button, the choice
   card, the field and the file picker; the text link gains an authored `focus-visible` outline
   in the same colour, so no link is left to a browser's default ring). The hero's prompt keeps
   `ring-brand-deeper/40` as the one exception, because the hero does not change (ADR 0031);
   the two rings on `/start` and the send button (`colours-step.tsx`, `send-page.tsx`) are the
   same value on their light ground and move in a later pass. Light-band text stays slate; the
   four job hues are the ramp's own
   (cyan, indigo, sky, ice). `.over-ink` gains `--brand-ink: #ababab`, a fifth re-declared
   token beside ADR 0032's four, because the text link's hover now reads `--brand-ink` and a
   token not re-declared shows as its complement under the difference blend.

5. **ScrollTrigger is registered, behind the lazy loader, and loaded on intent.**
   `PageChoreography` (`app/_components/page-choreography.tsx`, the one new client leaf) is
   gated on `useMotionAllowed` and arms on the first scroll intent (`whenScrolled`: a wheel
   tick, a touch, a scroll, or a scrolling key outside a field, since the hero's prompt is a
   textarea and typing is not intent) and on nothing else, never idle alone, so an un-scrolled
   Lighthouse audit never fetches GSAP. The plan's second trigger, an IntersectionObserver on
   `#work` nearing at 50 per cent root margin, was tried and dropped: it fires at load on a
   tall phone, where the hero's content runs past one screen, and again when a tool resizes
   the viewport to the page's height for a capture, which is exactly the audit the script line
   guards. From `md` it loads ScrollTrigger; below `md` GSAP core only (phones get entrances,
   never scrubs); a window armed narrow and widened past `md` later starts again with
   ScrollTrigger. The chunk
   `app/_components/motion/index.ts` makes one `gsap.context` on `<main>` and one
   `gsap.matchMedia`, subscribes ScrollTrigger to Lenis through `onActiveLenis`, refreshes after
   `document.fonts.ready`, on the `walkthrough:ready` event and from a settled ResizeObserver
   on `<main>`, and hands each section module a `SectionContext` (`gsap`, `ScrollTrigger`,
   `mm`, `root`, `own`, `settle`, `onInview`). There is one module per section that needs one,
   not one per section: the walkthrough (decision 9) and the FAQ, whose entrance is the CSS
   reveal and whose light beat is CSS, have none, and the closing commit deleted the two empty
   modules the foundation had stubbed for them. Pinning, scroll snapping,
   SplitText, autoplay loops, `scrollerProxy`, `normalizeScroll` and ScrollSmoother stay refused.

6. **The executor contract keeps `[data-reveal]` to `data-inview` as the truth.** A group is
   owned only when it carries `data-choreo`; at arm time a group that already has `data-inview`
   is skipped, so nothing shown is ever hidden again; an owned group's entrance sets
   `data-inview` and ends by clearing `transform,opacity` by name (never `'all'`); a
   MutationObserver pre-empts the entrance if anyone else sets `data-inview` first; once every
   owned group has settled `<html>` carries `data-motion-settled`, which `e2e/a11y.spec.ts`'s
   `settled()` waits on (it marks every group first, so the pre-empts settle them all). The
   fail-safe guards what the viewport has reached, never the page: every `settleFailSafeMs`
   (4,000 ms, from mount in `PageMotion` and from arming in the choreography) a hidden group
   whose top is inside the viewport is shown, which for an owned group runs its pre-empt, and
   a group below the fold keeps its entrance for when the visitor gets there. A page-wide
   one-shot was the first build and consumed every entrance unseen for anyone who read Work
   for four seconds. `<html>` carries `data-choreo="scrubs"` when ScrollTrigger is present and
   `data-choreo="entrances"` on a phone, and the rule `html[data-choreo='scrubs']
[data-reveal][data-choreo] > * { transition: none }`, from `md` where a group can be owned,
   keeps the CSS reveal out of GSAP's way on owned groups and nowhere else.

7. **The caps in D12 replace the design plan's 300 ms and 0.5rem.** Entrances translate up to
   2.5rem, scale 0.94 to 1, a single tween up to 900 ms, stagger up to 80 ms, parallax up to
   6rem at `md` and above (`CONFIG.motion.caps`); never width, padding, margin, inset, font
   axes, letter-spacing, box-shadow, filter, the H1, any `.over-ink` wrapper or any ancestor of
   the walkthrough stage or a sticky column. The CSS list reveal moves to `translate 0 2rem`,
   `scale 0.97`, `--motion-reveal` 600 ms and `--motion-stagger` 70 ms (0 under reduce).
   Under reduced motion the leaf never mounts, `gsap.matchMedia` is the second belt, and every
   finished state is the server markup.

8. **The header gains `data-over-dark`.** Two sources ORed on the `group contents` wrapper: an
   IntersectionObserver over every `[data-theme="dark"]` band with a one-pixel strip at the
   bar's middle, rebuilt on resize after `CONFIG.motion.choreo.resizeSettleMs`, and the hero's
   own foot, dark once no more than `CONFIG.motion.heroDarkFootShare` (0.35, tuned by eye at
   390 and 1440) of the hero is still below the bar's middle and while any of the hero is in
   view. The re-assignment is gated on `data-solid`, so the difference blend over the hero's
   top never sees a dark `--surface`. The header's text colour is a registered property,
   `--bar-ink`, held rather than transitioned at the blend flip and moved only by the scope's
   change of `--on-surface`, for the same reason the ask holds `--ask-ink`. The mobile panel
   inherits the scope; its hamburger ring goes to `brand-ink` only once solid.

9. **The walkthrough's mechanics are untouched.** Only its ground (the band gradient), its
   heading (the serif "look"), its panel chrome (a white rounded panel with a static cyan halo
   at `md`, edge to edge on phones) and the active-step colour (`--brand-ink`) change, and
   `markBuiltReady` dispatches `walkthrough:ready` for the choreography's refresh. No
   ScrollTrigger, pin or y-tween inside `#how-it-works` (ADR 0025).

10. **Section CSS lives in `app/_styles/<section>.css`** (A1): one file per section that needs
    one, imported from `globals.css` after the redesign block, plain rules only; tokens and
    utilities stay in `globals.css`. The foundation stubbed one file per section so that
    parallel builders never shared a line; the closing commit deleted the three that ended
    with no rule in them (Included, Real build and the closing, whose sections are utilities
    only; Real build's rail fill ships full as the server default, and the identity rule that
    said so went with the file). `#work` stacks one column at phone width, two from `sm`,
    three from `lg` (A2). The white run is a designed stretch: the offset cards, the corner
    glows, the studio tile and the FAQ light beat are required, and each of those sections may
    carry one further device inside the tokens and caps (A3).

11. **Budget lines.** Fonts: a new `fonts` entry in `scripts/bundle-budget.mjs` sums the raw
    bytes of every font `/` preloads and holds them under 64,000 B: Mona Sans 39,796 B and
    Instrument Serif italic 15,684 B, 55,480 B together, the same two files and the same bytes
    as next/font serves them in development (`.next/dev/static/media`) and in the closing
    commit's production build (`.next/static/media`, 23 September 2026); the script's comment
    carries the pair. Stylesheet: 18,500 B for `/` and `/start`, which share the sheet, from the
    closing commit's measure of 18,271 B (23 September 2026, the production build on Windows)
    plus the 70 B margin rounded up to the next 500; the foundation carried 18,000 B
    provisionally until the measure, and the plan's 17.0 to 17.4 KB estimate predates the seven
    section sheets, which gzip to 3,339 B on their own. Scripts: 216,000 B, unmoved, because
    the measured initial total is 212,832 B (the line would have gone to 218,000 B only had the
    measure exceeded it). HTML: 40,000 B unchanged, 39,376 B measured. The Lighthouse script
    total stays at 230,000 B.

## Consequences

- The hero line count, measured on 23 September 2026 with the fonts swapped and the ink off
  (the six screenshots are `shots/hero-lines/hero-{390,768,1024,1280,1440,1920}.png` in the
  session's scratchpad): 3, 2, **1**, 2, 2, 2 against the plan's 3, 2, 2, 2, 2, 2. At 1024 the
  tagline fits on one line (930 px in a 976 px column); the one-line span runs from below 990
  px to about 1150 px wide, and returns to two lines by 1200 px. The plan's arithmetic missed
  that the narrower serif "before" and the tracking together take the line under the column.
  The plan's one pre-fill lever, `--text-hero--letter-spacing: -0.03em`, tightens the line and
  cannot restore the count; loosening to -0.01em leaves 1024 to 1100 on one line as well. The
  decision taken: `.hero-heading` carries `max-width: 14em` and `margin-inline: auto`, in em
  so it scales with the type; the whole tagline is about 16em and its longer two-line half
  about 10.3em, so the cap breaks it once and never twice from `md`, and on a phone the column
  is narrower than the cap already. The heading box the fills were measured on is back, and
  the fills stand unmoved. Re-measured with the cap on 23 September 2026 (`hero-lines.mjs`,
  reduced motion, fonts ready): 3, 2, 2, 2, 2, 2 at 390, 768, 1024, 1280, 1440 and 1920, the
  plan's counts. `home.spec`'s "the headline is the largest contentful paint" and
  `tablet.spec`'s "the largest contentful paint is text" were re-run on the same day and pass.
  The CLS line is read from the Lighthouse run below.
- Foundation gates on 23 September 2026: typecheck, lint, the 551 unit tests and the full
  Playwright suite (44 passed, 1 skipped: the submit test that needs `E2E_SUBMIT=1`) pass on
  the foundation with the old section markup inside the new scopes. knip lists the ten new
  recipes in `section-styles.ts` and `eyebrowStyles` as unused until the section packages
  import them, as the build order expects; `commercialBand`, `bandEdge`, `cellGrid`,
  `hairlineCell`, `stepRow`, `stepNumber` and `trailingNote` stay exported until the closing
  commit deletes them. Closing gates, the same day, after the seven went and the two empty
  motion modules and three empty section sheets with them: typecheck, lint, knip (clean) and
  the 551 unit tests pass, and the dev server on this tree served `/` with a 200.
- The byte lines, measured at the closing commit on 23 September 2026 (`pnpm build && pnpm
budget`, the production build on Windows from the branch's working tree with the dev server
  stopped): `/` scripts 212,832 B gzipped against 216,000; stylesheets 18,271 B against the
  provisional 18,000, so the line is 18,500 on both routes (decision 11: the `@font-face`
  rules, the tokens, the scope, the recipes and the seven section sheets are real CSS, and
  deleting the hairline recipes clawed some back); HTML 39,376 B against 40,000; fonts
  55,480 B as served against 64,000, the same two files as in development; GSAP, Lenis, the
  fluid ink and ScrollTrigger each `ok` as a lazy chunk. `/start`: scripts 240,946 B against
  245,000, stylesheets 18,271 B (the same sheet), HTML 5,803 B against 25,000. The Linux
  number is CI's to report on the branch's first push; the 70 B margin inside every line is
  for it.
- The phone line (`#work + #included + #real-build + #your-options` at 390, reported by
  `mobile.spec`): 10,023 px on 23 September 2026 at the integration pass (Work 4,682 with one
  column of phone tiles under A2, Included 2,324, Real build 1,491, Your options 1,526), 11.9
  phone screens against the ten the content plan set. Re-measured at the review pass the same
  day, after Included's inner pair was stacked at every width below `lg`: 10,071 px (Work
  4,682, Included 2,372, Real build 1,491, Your options 1,526), still 11.9 screens; the
  number is expected and accepted under A2. The test now reports the number as an annotation
  and never fails on it, which is what "soft" meant: `expect.soft` still marked the run red.
- The contrast re-checks marked in the plan, computed at the closing commit on 23 September
  2026 with culori (`contrast.mjs` in the session's scratchpad, reading each token's `:root`
  value from `globals.css`): `--job-reachable` `#c6dcee` on `--ink-card` `#021b2c` 12.44 (the
  plan's 12.20 was on a slightly lighter card), 10.64 on `--ink-raised` and 14.10 on the foot;
  `--wordmark` `#1b2e44` on the foot 1.44, decorative and `aria-hidden` as decision 1 says.
  `--glow-corner` is the glow at 12 per cent alpha, and its peak composited over the wash
  paints `#ccebf8`: `--brand-ink` 4.75, `--on-surface` 14.29, `--on-surface-muted` 6.07; over
  white it paints `#e6faff`: 5.50, 16.55 and 7.02. Every text pair clears 4.5:1 at the peak,
  and the gradient is weaker everywhere else; brand-ink over the wash's peak is the narrowest
  margin on the page (0.25 above the line), so no coloured text may be added inside a glow
  corner on the wash without re-checking.
- Lighthouse by hand (`npx @lhci/cli@latest autorun`, Lighthouse 12.6.1 in HeadlessChrome
  153, the mobile form factor with simulated throttling, five runs per route against the
  production build, 23 September 2026). Two things had to give before it ran at all:
  `lighthouserc.json` asked for a `preset` called `mobile`, which this Lighthouse rejects (its
  presets are `perf`, `experimental` and `desktop`; mobile is the default), so the setting is
  now `formFactor: mobile`, the default said out loud; and on Windows chrome-launcher dies
  about one run in three deleting its temporary profile (an `EPERM` while Chrome's child
  processes still hold the log files, past Node's one second of retries), which the run got
  round by patching the copy in npx's cache to retry longer and warn rather than throw; the
  patch was reverted afterwards, and CI's Linux runner does not have the race. The assertions
  for `/`: accessibility 1.00, CLS 0, TBT 39 to 46 ms (line 150), image size 301,920 B (line
  500,000) and third-party count 0 (line 4) pass; performance 0.88 (line 0.95), best-practices
  0.96 (line 1), LCP 3,758 to 3,778 ms (line 2,000), script size 246,190 B (line 230,000) and
  total size 746,730 B (line 600,000) fail. `/start`: performance 0.95 to 0.96, accessibility
  1.00, CLS 0 and TBT 16 to 19 ms pass; best-practices 0.96, LCP 2,795 to 2,941 ms and script
  size 240,083 B fail. Every failing line is pre-existing, measured the same day with the same
  Lighthouse on a build of the commit the branch sits on (85f93fe, a detached worktree served
  on port 3100): `/` performance 0.88, best-practices 0.96, LCP 3,832 and 3,838 ms on the same
  element, script 245,052 B, total 761,072 B; `/start` LCP 2,790 ms, script 238,949 B,
  best-practices 0.96. The lines had never been checked: the preset name has been invalid since
  the file was written (commit e00b441), so no run of it ever reached the assertions. What each
  failure is: the LCP on both routes is text (on `/`, the hero's lead paragraph, `p.text-body`,
  which paints at first paint on the unthrottled machine, observed LCP 267 ms equal to observed
  FCP, so nothing hides it; the simulated 3.7 s is 88 per cent render delay, Lantern charging
  the initial script weight and its CPU time to a text LCP, the React and Next floor rather
  than anything below the hero, and the redesign moved it 60 to 80 ms down); performance is
  that LCP alone (the other four metrics score 0.93 or better); best-practices is
  `errors-in-console`, two 404s for `/_vercel/insights/script.js` and
  `/_vercel/speed-insights/script.js`, which exist only on Vercel; the script total carries no
  GSAP, no ScrollTrigger and no choreography chunk (the four lazy patterns match none of the
  twenty scripts; the eleven initial chunks are 178,409 B on the wire, and the rest is Lenis
  5,850 B, the fluid ink 3,346 B, the walkthrough's lazy pair 14,689 B and 43,348 B of
  `/start`'s own three chunks, which the hero's Link to `/start` prefetches at idle, as it did
  at HEAD, plus the two 274 B 404s); the total size is those scripts plus fifteen images at
  301,920 B (the six logos, the walkthrough's four photographs with `fernbrook-garden.webp` at
  114,294 B, the clinic photograph and four phone captures: two requests and 31,909 B fewer
  than HEAD) and four fonts at 110,032 B (the redesign's pair 56,080 B on the wire against
  Geist's 52,996 B, plus the walkthrough's Montserrat 35,808 B and DM Serif Display 18,144 B,
  in the DOM inside the phone since ADR 0025). Nothing in the redesign was changed for these
  lines; the lines themselves (2,000 ms on the mobile simulation for a text LCP behind 178 KB
  of framework, 230,000 B for a script total that includes `/start`'s prefetch, and
  best-practices 1 on a host without the Vercel endpoints) are the owner's to reset with the
  `ci.yml` wiring, which stays not done here.
- Kept on non-taste grounds: the LCP pins, the contrast rules, no weighting of the studio lane,
  single-colour client logos, the reduced-motion allowlist, no pinning, no dark closing.
  Refused on taste: brand full stops on H2s, gradient-clipped text anywhere, hover tints on
  non-focusable cells, colour inside reveal mid-states, a trades marquee, count-ups, a second
  hue, a wide font cut.
- The "three tinted bands at most" rule in ADR 0026 is replaced by the arc: the wash is the
  ground of three bands and the dark set of three more, which is the page's argument rather
  than a stripe.
- Not done here: wiring Lighthouse CI into `ci.yml` (a separate change); re-capturing the Work
  assets (the 224 and 400 px ceilings hold).

## Amendment, 23 September 2026, afternoon: the PX mark

The owner supplied a new logo the same day: a PX monogram in a navy-to-sky gradient, as a
transparent PNG (1563 by 1006 px, ink box 1107 by 729). It replaces the burst mark everywhere
the studio's own mark appears: the header, the footer, the About tile and address card, the
/start, /privacy and preview chrome, the tab icon, a new Apple icon, and the social image.

1. **One box, two renderings** (`components/brand/logo-mark.tsx`, `app/_styles/brand.css`).
   The artwork is a committed WebP at two widths in `public/brand/` (10 and 22 KB, served
   immutable with the export date as its version, as the work captures are). Where the
   artwork cannot work, its silhouette is drawn as a CSS mask through the same file's alpha:
   over the hero, filled with the current colour so the header's difference blend flips it
   with the text; on dark grounds (the footer, the header's dark state), filled with the
   ramp's light gradient (`--on-ink` to `--glow`), because the artwork's navy sinks into
   the foot. The CSS reads the header's existing attributes (`data-solid`, `data-over-dark`,
   the open menu) and the `data-theme` scope, so no component knows which rendering shows.
2. **The mark is landscape**, so `size` is now its height and the width follows the artwork's
   ratio; the About tile takes it at 60 px inside its ring, the address card at 32 px.
3. **The tab icon and the Apple icon** are the pre-filled light version on `--ink-card` (an
   image cannot read CSS, so the hex is written in the route); **the social image** is the
   gradient artwork beside the name on the page's white-to-wash ground with the navy
   tagline, so it is the same world as the page. Both PNG sources live in
   `app/_images/brand/` and are read at build time. `next/og` draws with satori, which knows
   only the plain img element, so those three routes carry a lint exception with the reason.
4. **A vector would be better.** The PNG is crisp at every size the site draws it (the largest
   is 122 px in the social image), but an SVG from the logo's designer would let the mask
   and the artwork scale without a raster and is the one asset still wanted; dropping it in
   is a change to `logo-mark.tsx` alone.
5. **Budgets, re-measured on the production build with the mark in** (23 September 2026):
   `/` HTML 35,305 B gzipped, down from 39,376, because the old mark was eleven inline SVG
   paths repeated in the header, the footer and the About tile and the new one is two short
   elements; stylesheet 18,430 B (was 18,271; the brand rules), so the line moves from
   18,500 to 19,000, because 18,430 plus the 70 B Windows-to-Linux margin sat exactly on the
   old line; scripts 212,832 B and fonts 55,480 B unchanged; every lazy guard ok; the full
   Playwright suite passes (45, one skipped for the database).

## Amendment, 23 September 2026, evening: the header is an island

The owner asked for a navigation bar as creative as the rest of the page, still responsive. Over
the hero nothing changes (ADR 0031: the row, the blend). Once scrolled, the row draws in to a
floating pill in the middle of the bar (`app/_styles/header.css`): the same elements in the same
order, 48 px tall on a glass of the page's surface, dark glass over the dark bands through the
existing `data-over-dark` state. The width moves from the column to fit-content, which
`interpolate-size` lets Chromium animate; other engines snap. The separate surface layer under
the header is gone: the glass is the row's own pseudo-element (a backdrop filter on the row
itself would make it the containing block of the phone sheet), drawn only once the blend is
normal, and dropped in the same instant the blend flips back, so no glass is ever blended. The
way in is no longer staged; the way out still empties the ask before the flip.

Under the section links a 6 px dot in `--brand-ink` marks the section the reader is in: the last
linked section whose top has passed the middle of the viewport, so a band without a link keeps
the link of the band before it. The chrome writes the dot's position as `--dot-x` on the nav and
the dot translates there over 420 ms; reduced motion snaps it. Between md and lg the pill drops
the name beside the mark so the four links and the ask fit at 768.

On a phone the menu is a sheet over the whole screen in the dark set: the four sections as big
type with their numerals, the ask and the call at the foot, the mark as a faint watermark, the
header's mark and cross above it (the dark scope now covers the header while the menu button is
expanded). Escape and focus return are unchanged; the tests that pin the header pass.

## Amendment, 23 September 2026, evening: the pooled curve is a circle segment on a spring

The owner asked for the curve under the ink stretch to be rounder, "like a circle", and to move
like liquid as the page scrolls. Both change decision 1's pooled edge; the rest of the record
stands.

1. **The shape is a circle segment, not the box's corners.** The stretch ends flat and the curve
   is an inline SVG at the end of it (`app/page.tsx`; `.ink-pool` in `app/globals.css`): one arc
   from edge to edge with a sagitta of 0.14 of the width, which is a circle of radius 0.96 of
   the width, hung over the walkthrough band's top the way the corners were. `--spacing-pool`
   (`clamp(3rem, 14vw, 17rem)`) is its depth and replaces `--seam` in the three places that
   measured the curve (`.under-ink`, the wash's flat stop, and Included's foot); `--seam` stays
   the footer sheet's radius. Included's foot is no longer a band at all: the owner saw a band
   of empty foot between the last row of cards and the curve and asked for the curve to begin
   where the cards end, its size unchanged, so the section ends one grid gap (20 px, the gap
   between the cards) under the last row and the ink pools straight under the content. A border-radius of the same depth is an
   ellipse, flat across the middle with steep shoulders; a circle's curvature is even, which is
   what "like a circle" means. The depth is 269 px at 1920 (measured) against 80 before. Between
   the token's two caps (343 to 1943 px wide) the SVG's box keeps the arc's own 1000:140, so the
   segment is a true circle there and a gently stretched one past them.
2. **It moves with the scroll, as a mass on a spring** (`app/_components/motion/ink-pool.ts`,
   numbers in `CONFIG.motion.choreo.pool`). From md up, with motion allowed, the scroll's speed
   pulls the apex (deeper on the way down, flatter on the way up, through tanh so a flick
   saturates) and a spring at 1 Hz with a damping ratio of 0.1 carries it back with a wobble.
   The spring is integrated by hand on GSAP's ticker from each frame's own length, so the motion
   keeps its momentum across wheel ticks, which a tween restarted on each tick cannot. Only
   `scaleY` about the curve's flat top moves, so the compositor stretches the pool's own layer
   and nothing repaints; a border-radius on the stretch itself would have repainted the whole
   dark band every frame. The loop wakes on the trigger's onUpdate while the pool is on screen
   and sleeps once the spring rests, so a still page costs nothing. Measured at 1920 on a
   six-notch wheel flick under Lenis: 104 px deeper at the peak, 68 px flatter at the swing
   back, then 51 px deeper, 35 flatter, 26 deeper, 18 flatter, at rest in about six seconds.
   Two quieter tunings came first: 1.3 Hz at 0.35 swung back 4 px, too little to read, and
   1.1 Hz at 0.2 swung back 18 px, which the owner saw and asked to be more prominent; the pull
   also now saturates at 1500 px/s rather than 2000, so one wheel notch stirs the curve (about
   23 px, swinging back 14). Phones keep the resting segment (no ScrollTrigger, D5); reduced
   motion never mounts the leaf, and the stylesheet keeps `will-change` off there too.
3. **The heading is never touched.** The walkthrough's `under-ink` padding is the band plus the
   pool. Up to `stretchKnee` (0.25) the curve is drawn as the spring has it; past the knee what
   is drawn eases toward `stretchCap` (0.42) and never reaches it, so the spring runs free (it
   can swing to about 0.5 on a hard flick) and the apex still stays under the padding: the band
   over the pool is 0.47 at its tightest (from 1943 px, where both tokens are at their caps),
   and the measured clearance to the heading at 1920 is 430 px against 382 at the cap. A hard
   wall at the cap was tried first and the spring stopped dead against it on a six-notch flick,
   which read as a thud. The caps in D12 gain one line: the pool's `scaleY` is decoration, like
   the rail's, bounded by `stretchCap` rather than by `scaleFrom`. Amended 25 September 2026 (ADR
   0037, Release 3): the exemption also covers `/start`'s pooled curve below `lg`, which springs
   on each Next and Back (`lib/motion/start-curve.ts`, `CONFIG.start.curve`), bounded by its own
   `stretchCap` of 0.3 and asleep after 2.5 s, and never moves under reduced motion.
4. **The header reads the ink's true foot.** The stretch's box now ends at the band's top, so
   the SVG carries `data-theme="dark"` of its own and the header's observer counts it: the bar
   flips where the apex passes it, as it did when the box overhung. The plan's section 4.4 row
   on the sheet mechanism (negative margin, corner radii) no longer describes the pooled edge;
   this record does.
5. **Budgets, re-measured on the production build** (23 September 2026, evening, with the
   other uncommitted changes of the day in the tree, after the owner's two follow-ups): `/`
   scripts 213,523 B gzipped against 216,000 (the pool's numbers ride CONFIG; the module itself
   is in the lazy choreography chunk), stylesheet 18,483 B against 19,000 (was 18,430), HTML
   35,306 B against 40,000 (the SVG is one short element and Included's foot is one utility),
   fonts unchanged, every lazy guard ok. Typecheck, lint, prettier, knip, the 551 unit tests
   and the Playwright suite (45 passed, one skipped for the database) pass.

## Amendment, 24 September 2026: Work is a rail on phones

Amendment 4 of this record. The owner, 24 September 2026: "all of the websites I have built under
eachother make it so that the user has to scroll for a really long time to get to the next section".
At 390 wide `#work` was 4,682 px, 5.55 phone screens, under A2's one column. Decided in
`fixes/work-phone-decision.md` (in the session's scratchpad) and built by section 17 of
`docs/start-page-redesign-plan.md`.

1. **A2 in decision 10 changes on touch screens.** Below 640 px on a coarse pointer the six tiles
   are one rail; below 640 px on a fine pointer they stay one column; from `sm` two columns and from
   `lg` three, as before. A mouse in a narrowed window, a zoomed desktop and print keep the column
   on purpose, so the owner sees the rail on a phone, or in the browser's device mode with touch
   turned on.
2. **The mechanism** (`app/_styles/work.css`, under `(width < 40rem) and (pointer: coarse)`, and
   `app/_components/work.tsx`). The list is a native horizontal scroller that bleeds to the
   viewport's edges: `padding: 0 4.5rem 2rem 1.5rem`, `overflow: auto hidden`,
   `overscroll-behavior-x: contain`, mandatory inline snap with `scroll-padding-inline: 1.5rem`, and
   `data-lenis-prevent-horizontal`. Each tile is `flex: none; width: 100%`, snaps at its start edge
   on the shell's 24 px line, and scales from that edge (`transform-origin: left`), so the snap
   never parks off the line during the reveal; the reveal's rise runs inside the bottom padding the
   negative margin gives back, and the hidden cross axis keeps the rail from ever scrolling
   vertically. The next tile peeks 60 px at the right and the sixth rests on the line at the end.
   Under the rail six `aria-hidden` 8 px dots in `--brand-ink` light from 30 per cent to full on
   their own tile's view timeline, one tile wide at the line (`work-dot`, opacity only, so it runs
   under reduced motion). The grid classes stay, so 768 and 1440 are unchanged.
3. **The reading of decision 5.** The "scroll snapping" it refuses is ScrollTrigger snapping the
   page. The browser's own snap inside a nested scroller is not that, just as `md:sticky` is not
   pinning.
4. **The reading of the content plan's ban** (`docs/home-page-content-plan.md`, lines 47, 358, 360
   and 1008). Its evidence (Runyon, Baymard, NN/g) concerns carousels that rotate by themselves and
   hide their slides. This rail rotates nothing and never moves without the reader's hand. It hides
   nothing from the DOM or the accessibility tree, it peeks the next tile, and its six dots show the
   count and the reader's place. If the owner holds the ban, the fallback is the content plan's own
   two-column grid, about 3.0 screens.
5. **The WCAG 1.4.10 reading.** Each tile reads whole at 320 px, with no sideways scroll needed to
   read a line, and a zoomed desktop, on a fine pointer, keeps the column.
6. **The pool behind each phone is restored.** It had painted nothing since commit 15d7721 dropped
   the tile's classes without a record; this corrects that. `.work-backlight` paints
   `radial-gradient(at 50% 40%, var(--backlight), transparent 70%)` from 3rem under the tile's top,
   three fifths of its height, and fades in with the reveal.
7. **Measured** on the dev server on 24 September 2026, with the build in: `#work` is 1,201 px at
   390 (1.42 screens), 1,217 at 320 and 360, and 1,184 at 430; a tile is 294 px wide at 390 and 224
   at 320; the rail's maximum scroll equals the sixth stop (1,530 at 390, 1,180 at 320); dot k+1
   reads 1.00 at stop k and the others 0.30, under reduced motion too. All six links, images and
   dated captions and the twelve Phone and Desktop radios stay in the DOM and the accessibility
   tree, Tab parks every focused tile at x 24, and axe finds no violation in `#work` at 320, 390 or
   430 px wide. At 768 and 1440 the tile boxes are identical to the page without the change. The
   phone line, the four watched sections at 390 as `e2e/mobile.spec.ts` reports them, is 6,514 px on
   the finished tree (Work 1,201, Included 2,296, Real build 1,491, Your options 1,526), 7.7 phone
   screens against the ten the content plan set, from 10,071 px and 11.9 screens: under ten for the
   first time. The whole page at 390 falls from 17,020 to 13,540 px. Work at 390 re-measured on the
   finished tree (`judge2-probe.mjs`) reads the same: 1,201 px, six 294 px tiles, the rail's end at
   1,530, dot k+1 lit at stop k and no sideways scroll.

## Amendment, 24 September 2026: the header changes in layers

The owner, 24 September 2026: "as the user scrolls between the top sections in the page the
navigation bar animation looks non premium as the show me my three designs button doesnt apear and
disapear smoothly if the user scrolls a little too fast". Decided in `fixes/header-ask-decision.md`
and built by the plan's section 14 (`app/_components/header-chrome.tsx`, `app/_styles/header.css`,
`app/_styles/brand.css`). It replaces the evening amendment's sentence "The way in is no longer
staged; the way out still empties the ask before the flip."

1. **Three attributes, in order.** `data-solid`: the blend is normal and the text reads `--bar-ink`.
   `data-island`: the pill's geometry, its glass and the mark's artwork. `data-past-hero`, with
   `data-filled` beside it: the hero's own button has left the top of the viewport. `data-over-dark`
   and `data-section` are as before. On the way in `data-solid` and `data-island` land together past
   24 px, over the hero's white top, where black becoming navy is nothing to see.
2. **The dissolve comes before the flip.** On the way out `data-island` leaves at once: the glass
   and the artwork fade over `--motion-enter` (200 ms) while the blend is still normal, and the row
   unwinds over `--motion-settle` (300 ms). `data-solid` leaves `CONFIG.motion.headerStepMs` later,
   300 ms, equal to `--motion-settle` (moved from 200 into `lib/config.ts` at integration), so the
   flip lands on a wide row with nothing left in the header to invert, 100 ms after the glass has
   gone. The blended state declares `transition: none` on the glass and the mark, so a stalled fade
   is cancelled at the flip.
3. **The hand-over is the hero's button, on every width.** The desktop ask fills, and on a phone the
   ask takes the name's place, once `#hero-cta`'s bottom is at or above the top of the viewport,
   read in the scroll handler in the frame the page moves (the observer it replaces reported a frame
   late). A page without that button hands over with the island. This is the owner's decision,
   reversible in one line in the chrome: the fill was the island's since the evening amendment.
4. **The drop is `top`, never a transform.** The island's 8 px drop is `top`, with `top: 0` on the
   base row, so the row is never the containing block of the phone menu's fixed sheet.
5. **The name and the phone ask fold by grid track** (`minmax(0, 1fr)` to `minmax(0, 0fr)`), which
   every engine interpolates; the outgoing label fades in the first 40 per cent of the clock and its
   `visibility` leaves with its opacity. The row's gap is constant and out of the transition list.
6. **The pill's width is measured, so every engine animates it.** The chrome clones the row into a
   hidden `.header-measure` box carrying the two attributes that shape it, reads the width and
   writes it on the row as `--pill-w` before the attributes land, so the draw-in runs from one
   length to another. The width snap at 24 px outside Chromium, which the evening amendment
   accepted, no longer happens, and `interpolate-size` is no longer set. The pill is measured again
   once the brand face has loaded and on a change of the viewport's width, with its transitions off
   for that one change so no link spills past the glass; a change of height alone, a phone's
   toolbar, leaves a running draw-in alone. Added at review the same day: a hidden gauge, one line
   of the row's own words at its natural width off the bar's left edge, is watched for its size, so
   a reader's text spacing or own style sheet, which changes the words' widths without a resize, has
   a standing island measured again (WCAG 1.4.12).
7. **The phone pill under 22.5rem** (added at review). Past the hero the phone pill holds the mark,
   the ask and Menu, 340 px at rest, which is wider than a 320 px screen: it met both edges, and the
   ask's label ran to 6 px from its own rounded ends. Below 22.5rem the ask's own start margin takes
   the gap beside it down to 8 px, on the ask's clock, and the pill's ends tighten, so the pill
   rests at 304 px, 8 px in from each edge as it is 8 px down. Before the hand-over, and on the
   questionnaire, which has no ask, nothing changes.
8. **Reduced motion.** `header.css`'s own reduce block, which wins over the global allowlist by
   specificity because the section sheets are imported before it, keeps `--bar-ink` on the bar and
   opacity inside it, so the header's words flip with the blend in the same frame instead of fading
   through white on white; width, height and the drop change at once, and the glass, the mark and
   the fold's opacity keep their fades.
9. **The questionnaire's island.** `HeaderChrome` takes `island` and `overDark`, rendered into the
   server's HTML, so `/start` opens on the solid dark island and the scroll never dissolves it (ADR
   0035).
10. **Measured** by the build package with the decision's probe (`jh-frames.mjs` and its companions
    in the session's scratchpad: eleven runs from 390 to 1440, 100 px wheel notches 16 ms apart,
    steps normalised to 16.7 ms), against a baseline taken before the edit. No frame drew the glass,
    the artwork, the fill or the phone ask while blended (the decision had counted one at 768 and
    two at 1440 before). The row was its full width in the frame the blend flipped back (207 and 777
    px before, at 390 and 768). The island left 304 to 327 ms before `data-solid`. At 390 the row's
    largest step was 33 px a frame (160 before), the Menu button's right edge stayed at 366 px in
    every frame (436 before, off the screen), and the phone ask held full opacity for two frames
    after the hand-over cleared (13 before). The desktop ask travelled 0 px while its fill was
    part-way at 768 and 1440 (76 and 193 before). Under reduced motion the header's colours were
    final in the first frame after every flip, and the sheet opened from the island was the screen's
    height in every frame. axe found no violation on the header in any state at any width. Re-run by
    package R on the finished tree the same day: at 390 no blended frame, the row's largest step 33
    px, Menu at 366 px at most, two frames of the ask at full opacity after the hand-over, 318 ms
    from the island leaving to the flip, and the row's last movement 19 ms before the page came to
    rest; the pill is 227 px at rest and 340 px past the hand-over, and at 320 it rests at 304 px, 8
    px in from each edge; at 1440 no blended frame, the row at 1,258 to 1,271 of 1,280 px in the
    flip frame and 327 ms from the island leaving to the flip, but the row's last movement came 120
    ms after the page rested, over the decision's 60 ms line, in a run whose frames were 36 ms apart
    (the ink draws in software there; the build package read 33 and 40 ms at a steadier frame rate,
    and 84 ms on a busier machine).
11. **Owner decisions carried**, each reversible in a line: the fill at the hand-over, and the 300
    ms clock (the slower alternative, 420 ms, would need its own token). What stays as it was: the
    phone ask is 32 px tall, the mark's mask still snaps its background at a dark band's edge, and a
    reload below 24 px still plays the draw-in on load.

## Amendment, 24 September 2026: the menu is ink

The owner, 24 September 2026: "the menu in tablet and movile could do with a nice openeing and
closing animation so it looks more premium". Decided in `fixes/menu-decision.md` and built by the
plan's section 15 (`app/_components/mobile-nav.tsx`, `app/_styles/header.css`,
`app/_styles/brand.css`).

1. **The gesture.** Tapping Menu fills its ring with ink, which blooms over the screen from the
   button's measured centre: `clip-path: circle()` on the sheet from 1.25rem, the ring, to 142 per
   cent over `--motion-reveal` with `--ease-enter`, the centre written as `--menu-at` at every open
   and close, so the bloom starts on the button whether the header is the full row or the island.
   The rows then arrive as every list on the page arrives: a 2rem rise over 600 ms, `--motion-tap`
   plus `--i` times `--motion-stagger`. Closing, the rows lift 8 px and fade in 120 ms, the ink
   holds, then drains into the button over `--motion-settle` on `--ease-drain` (`cubic-bezier(0.5,
0, 0.75, 0)`, a held breath and then an accelerating pull, on `:root` in `app/globals.css` since
   the review), and only then is the sheet hidden and the header let go. A clip on the sheet is safe
   for its fixed position because the island's drop is `top`, never a transform (the header
   amendment above).
2. **Three phases.** `closed`, `open` and `closing`, written as `data-menu` on the menu's root. The
   sheet is `inert` from the first closing frame, so it leaves the Tab order and the accessibility
   tree before the ink has drained, and `hidden` once `Promise.allSettled` over its own
   `getAnimations({ subtree: true })` has settled, with a fail-safe of twice
   `CONFIG.motion.headerStepMs`, 600 ms, for a transition that never ends. A tap during the drain
   reopens it; a viewport that grows past `md` while it is open closes it; `data-lenis-prevent` and
   `overscroll-behavior: contain` keep the page still behind it.
3. **The blend is keyed on the sheet, the scope on the button.** The dark scope stays keyed on the
   button's `aria-expanded`; the header's normal blend and its full-width, glassless row are keyed
   on `[data-menu]`, which outlasts `aria-expanded` by the drain. The header's two
   `group-has-[[aria-expanded=true]]` utilities are retired, and the band observer no longer counts
   the sheet (`[data-theme="dark"]:not(#mobile-nav)`), so `data-over-dark` neither arrives nor
   leaves a frame late.
4. **The holds.** The header's words and mark hold their colour until the ink's edge crosses them:
   27 ms in, as the bloom crosses the brand, and 270 ms out, as the drain uncovers it; 40 ms both
   ways under reduced motion, when the sheet is about half dark.
5. **Reduced motion.** No clip, no rise and no turn: the sheet fades in and out over 200 ms, and the
   rules in `header.css`'s reduce block, which win by specificity, stop every element in the header
   fading its own colour, the smear the old menu showed.
6. **The page is inert under the open sheet** (added at review, WCAG 2.4.11). While the menu is open
   every child of `body` but the one holding the header is `inert`, and so are the header's own
   parts beside the menu that the sheet is drawn over (past the hero, the phone's ask), while the
   mark and the button, above the sheet, stay; each is let go the moment the menu starts to close,
   and a part that was inert already is left alone. Tab past the sheet's last action goes to the
   browser and back to the header, never to a control drawn under the ink, Shift+Tab from the cross
   past the hero reaches the mark rather than the ask under the sheet, and a screen reader stays on
   the menu (`e2e/mobile-header.spec.ts`). A section link pressed in the menu glides once the page
   is let go, and the focus follows it (ADR 0021, amended).
7. **Touch and forced colours.** The header row's links are 40 px tall on a touch screen
   (`pointer-coarse:h-10`), inside the 48 px island, since from `md` the row is the tablet's menu.
   Added at review: under forced colours the Menu button's bars are `ButtonText` and the header's
   mark is `LinkText`, where their own fills were forced away and left an empty ring and an empty
   home link.
8. **Measured** by the build package with the decision's probe (`menu-judge/run.mjs`, read through a
   corrected analysis, `n1b/analyze2.mjs`, both in the session's scratchpad). The ink starts on the
   button to the pixel: 346, 32 from the top and 337, 32 from the island at 390, and 700, 32 and
   514, 32 at 744. At 390 the brand turns light in the 33 ms frame and the screen is covered by
   about 133 ms. `inert` lands in the first closing frame with the focus on the button, and `hidden`
   351 ms after the close from the top and 314 to 336 ms from the island (the decision's band was
   290 to 360), or 214 to 231 ms under reduced motion (180 to 240). The sheet is the viewport's
   height in every frame, with the row's translate `none` and the blend normal while it is shown. No
   frame draws the mark, the name or the cross under 3:1 from the top or from the island at 390,
   where the old menu drew three such frames on opening; a reopen 150 ms into the drain shows no
   hidden frame; under 4x CPU throttling the opening drops no frame over 34 ms; and five wheel
   notches and a 400 px swipe over the open sheet leave the page where it was, where the old menu
   let it move 499 px. At 430 one opening frame from the top draws the mark at 1.18:1, and at 744
   one frame each way, where the bloom crosses the brand between two frames at 60 Hz: no fixed hold
   serves every width, and the decision had misread its own data at 430. axe finds nothing on the
   open menu at 360, 390, 430 and 744. Re-run by package R on the finished tree at 390: the bloom
   starts at 346, 32 from the top and 337, 32 from the island, `hidden` lands 326 and 336 ms after
   the close began (235 ms under reduced motion), the sheet is 844 px tall in every shown frame with
   the row's translate `none` and the blend normal, and no frame draws the mark, the name or the
   cross under 3:1 (4.38:1 at the lowest, under reduced motion).
9. **Owner decisions carried**, each reversible in a line (`fixes/menu-decision.md`, section 10):
   the bloom and the drain; the drain's pace; the rows at the page's list pace, the last at 1,000
   ms; the sheet on screens narrower than 768 only, since from 768 the row holds the four links and
   the ask with room. Left for the owner's hand: ten opens and closes in Safari on a phone, from the
   top and from the island, looking for the one frame at a high refresh rate where the words and the
   ground disagree.

## Amendment, 24 September 2026: the hero prompt joins brand-ink

The owner, 24 September 2026: "in the hero the sizing of the input field and button needs
readjusting and fixing as it doesnt look good". The prompt box is rebuilt inside its own height (ADR
0031, amendment of the same date, which holds its anatomy and its measures). Two sentences of this
record change with it.

1. **Decision 4's one exception is closed.** The hero's prompt no longer keeps
   `ring-brand-deeper/40`: the field is a pill of the wash focused by the site's authored outline, 2
   px `brand-ink` at a 2 px offset, with a border under forced colours only, and the box lifts on
   `--shadow-card`, not `--shadow-dialog`. The ring on `/start` (the colour picker) moved the same
   day (ADR 0035). The last `ring-brand-deeper` on the site is the send button's in
   `app/_components/send-page.tsx`, which still waits for its pass.
2. **Decision 5's "textarea" is corrected to "input".** The hero's prompt is a text input; the
   reason stands, that typing in it is not scroll intent, so its first character must not fetch GSAP
   and ScrollTrigger. `lib/motion/idle.ts` has said "text input" since the review.

## Amendment, 24 September 2026: the byte lines

Measured on the production build of a clean copy of the finished tree (`pnpm build && pnpm budget`,
Windows, 24 September 2026), with the questionnaire's redesign (ADR 0035) and the four amendments
above in it, against 15d7721's own build the same day. The stylesheet line held at 19,000 B; the
scripts lines moved. The shared stylesheet measures 17,298 B, from 18,819 B at 15d7721 (18,044 B
plus the 775 B font sheet), where the plan (`docs/start-page-redesign-plan.md`, section 19) expected
about 20,100 B and a move to 20,500: `app/globals.css` now keeps `docs/` out of class detection
(`@source not '../docs'`), which on 15d7721's sheet was 3,132 B of utilities only a plan or a record
named. On that same basis, the sheet compiled without docs, the day's rules add 1,647 B (14,914 B
then, 16,561 B now): `header.css` the most (283 B to 964 B), then `start.css` (562 B, new),
`work.css` (167 B to 346 B), `how-it-works.css` (55 B to 265 B) and `brand.css` (154 B to 241 B).
next/font's faces now ride the same file, one request fewer. With docs read the sheet would be about
20,700 B, which would have moved the line to 21,000. No utility the day retired survives in the
sheet. `/` scripts measure 217,045 B against 216,000, from 214,075 B at 15d7721, so the line moves
to 218,000 B by the plan's rule (a measure over 215,930 B moves it there, which also covers the
measure plus the 70 B margin rounded up to the next 500, 217,115 B up to 217,500): the menu's open,
closing and inert states, the header's steps on `CONFIG.motion.headerStepMs`, `HeaderChrome`'s
island and over-dark props, its re-watch of the dark bands, its measured pill and its text gauge,
the hero prompt, the walkthrough's dock and its hold on an arrival fragment, and the glide's move of
focus. `/` HTML measures 35,738 B against 40,000 (35,530 B at 15d7721), and fonts 55,480 B as served
against 64,000, unchanged. `/start`'s scripts line moves from 245,000 to 246,500 B and its reasons
are ADR 0035's; the /start figure in this record's consequences, 240,946 B, predates the header's
commit, and 15d7721 measures 243,073 B there. GSAP, Lenis, the fluid ink and ScrollTrigger each stay
a lazy chunk. CI's Linux runner measures about 70 B heavier than Windows, and every line keeps that
margin.

## Amendment, 24 September 2026, evening: the header never passes through grey

Frame sheets of fast wheel bursts showed the header's words and mark passing through low contrast
in two moments, both already in the CSS at 15d7721: at the blend flip, where the words turned navy
in the same frame the glass began to fade in from nothing, so over the hero's ink they read navy on
dark, and the mark's two renderings cross-faded at half strength each; and at the edge of a dark
band, where `--bar-ink` and the glass's colour faded over the same `--motion-enter` and met in the
middle, grey on grey. Measured on compositor frames at 390, 768 and 1440, down and up, over 2, 5
and 8 notch bursts with 150 and 400 ms pauses: the worst text frame was 1.08:1 and the worst mark
frame 1.12:1.

The dark crossing is now one registered number, `--bar-dark` (0 to 1), set by the over-dark and
open-menu scopes and moved over `--motion-enter` on `--ease-bar`, which jumps from 0.35 to 0.75 in
one frame. The glass's colour is computed from it and still fades; the ink and the mark's rendering
snap on `--bar-snap`, a rounded copy that turns at 0.55, inside the jump, so a burst that reverses
halfway turns the glass and the words together. The glass has a floor, `--glass-floor` (0.5): it
arrives at the floor in the flip frame and eases on from there, and on the way out it eases down to
the floor and goes only in the frame the blend flips back. The mark swaps its artwork and its light
mask on the same snap instead of cross-fading (`app/_styles/brand.css`). `--ask-ink` is now a 0 to
1 number that holds only the fill, so the ask's hold never delays the dark snap. Reduced motion
keeps the colour fade and the glass's opacity only.

After: the worst text frame is 3.25:1 (768, down, over the hero's ink at the flip, the glass at its
floor), the worst mark frame 3.28:1, and every header text is 5.5:1 or better at rest. Left as it
was: over the hero, before the flip, the difference-blended links read 1.07 to 2.9:1 where the ink's
mid-greys sit under them, which is how the blend of ADR 0031 works on a mid-grey ground and is the
owner's to decide; the name and the phone's ask fold in and out through a fade, which is how a label
appears rather than a colour change.

The phone menu's sheet, from 640 to 767 px wide and at least 40rem tall, is laid out for a small
tablet in portrait: the four sections at `--text-display` with one column for the numerals, a
34rem measure, the ask at its natural width, 56 px tall, with the call beside it, and the watermark
larger and fainter, off the right edge. The open and close choreography, focus, Escape, inert and
reduced motion are unchanged.

Measured on the production build of the finished tree the same evening (a worktree of 15d7721 with
the day's files, Windows): `/` scripts 217,037 B of 218,000, stylesheets 17,851 B of 19,000, HTML
35,777 B of 40,000, fonts 55,480 B; `/start` scripts 246,213 B of 246,500, HTML 5,966 B of 25,000;
the four lazy guards ok; the built `/start` carries one `id="main"`. The full Playwright suite
passes in all five projects (114, one skipped for `E2E_SUBMIT`), with typecheck, lint, knip and the
554 unit tests.

## Amendment, 24 September 2026: the menu takes its time

The owner, 24 September 2026: "make the opening and closing animation of the navigation bar to
happen 30% slower to give a more premium feel", and, having seen that on a phone, "make it so that
ink spreads over screen takes 0.9s and everything else scales in duration accordingly". This amends
"the menu is ink" above: the durations in decision 1, the fail-safe in decision 2, the holds in
decision 4, and the pace carried in decision 9.

1. **One pace.** `--menu-pace`, 1.5, on `:root` in `app/globals.css`, stretches every clock the
   menu's open and close use, so the page's 600 ms reveal becomes the 900 ms bloom asked for and
   everything else keeps its proportion to it. `app/_styles/header.css` derives `--menu-tap`,
   `--menu-enter`, `--menu-settle`, `--menu-reveal` and `--menu-stagger` from the page's own on
   `.header-bar`, and every menu rule reads those. The page's tokens are untouched, so nothing
   else on the site moves. The first request was built at 1.3, a 780 ms bloom, and replaced the
   same day.
2. **The numbers.** The bloom takes 900 ms (600 before). The rows rise over 900 ms, 180 ms plus
   `--i` times 105 ms in, so the last lands at 1,500 ms (1,000). The cross meets in 180 ms and
   turns over 450 ms after 135 (120, and 300 after 90). Closing, the rows lift away in 180 ms
   (120), the ink drains over 450 ms (300), and the cross turns back over 300 ms and parts over 180
   ms after 225 (200, and 120 after 150). Opened from the island, the row unwinds and its glass
   fades over 450 ms (300); the row's draw-in back to the island once the sheet has gone is the
   header's own, which every scroll plays, and stays at 300 ms.
3. **The holds are shares of the paced clocks**, 4.5% of the bloom and 90% of the drain, so they
   stay on the ink's edge at any pace: 40.5 ms in and 405 ms out (27 and 270).
4. **The fail-safe stays twice the drain**, 900 ms (600). `CONFIG.motion.menuPace` is the token's
   number for `app/_components/mobile-nav.tsx`; keep the two equal, as `headerStepMs` and
   `--motion-settle` are kept.
5. **Reduced motion keeps the page's pace.** `--menu-pace` is 1 there, so the sheet still fades
   over 200 ms and both holds are still 40 ms.

Measured on the dev server at 390 in Chromium, from every CSS transition the header started while
the menu opened and closed, from the top and from the island: every one of the menu's is exactly
1.5 times its duration and delay before, and under reduced motion every transition is as it was.
`hidden` lands 472 to 506 ms after the close (354 to 365 before). Frame-sampled at 360, 390, 430
and 744 from the top at both paces, the mark turns light and back in the frame the ink's edge
reaches it and leaves it at 360 and 390; at 430 it turns light a frame early at either pace; at 744
it keeps the miss each way that decision 8 records, which the longer drain stretches from 24 to 41
ms on the way out (open, 36 ms at either pace). Read with care: `n1b/analyze2.mjs` from decision 8
takes the page under the bar to be white, so from a dark band (`#included`) it scores the light
mark as 1.18:1, at either pace. The phone header's specs, the reduced-motion fade, and the home and
a11y specs pass (39), with the 554 unit tests, typecheck, lint and knip.

## Amendment, 25 September 2026: the pooled curve is liquid, a chain of two springs

The owner asked for the curve's jiggle to be "more jiggly and natural". The evening amendment
of 23 September stands except where this says otherwise: the shape at rest, the trigger, the
knee and cap, the sleep, and phones and reduced motion are unchanged.

1. **The curve changes shape, not only depth.** One rigid `scaleY` at one frequency read as a
   rubber sheet on a spring: every point moved in step. While it moves the path is now
   rewritten each frame as one cubic (`lib/motion/pool-curve.ts`) whose handles at rest sit
   where a cubic hugs the arc (307 in from each end, 187 deep on the 1000 by 140 box, within
   0.03 of the true arc; the server markup keeps the arc and the loop writes it back at rest).
   A symmetric cubic is 3t(1 - t) of its handles' depth along its length whatever their inset,
   so the apex is the handles' depth alone and the handles' inset alone is the shape: toward
   the centre a pendant drop, toward the ends a flat-bottomed dish. The clearance under the
   walkthrough's heading (point 3 of the evening amendment) therefore holds for every shape.
2. **Two masses in a chain.** The scroll's speed pulls the shoulders (2 Hz, damping 0.2), and
   the belly follows the shoulders (1 Hz, damping 0.1, the accepted swing). The belly's depth
   is drawn as the apex, through the knee and cap as before, and the belly's lag behind the
   shoulders is drawn as the shape, `pointiness` (1.2) resting depths of lag per resting inset,
   eased through tanh toward 0.4 of the inset either way and never reaching it (a hard rail
   held the drop's point still for a tenth of a second at the top of a flick, measured, and a
   shape that stops is a wall). So a scroll just begun drops the ends before the middle (a
   dish), the belly then overshoots into a drop, the stop leaves the belly hanging while the
   shoulders return, and the swing back up tightens into a dish again; the shoulders' ripple,
   twice the belly's frequency (a hanging drop's first two symmetric modes) and gone inside a
   second, makes the settle start busy and end clean. The springs are stepped in fixed 1/240 s
   sub-steps so a 60 Hz and a 120 Hz display draw the same swing. `CONFIG.motion.choreo.pool`
   replaces `frequencyHz` and `dampingRatio` with `shoulders`, `belly` and `pointiness`.
3. **The repaint is the pool's own.** Rewriting `d` repaints the pool's layer, a strip `--pool`
   deep that `will-change: transform` keeps up where the scroll drives it, and nothing else;
   the whole-band repaint the evening amendment avoided is still avoided. The loop still wakes
   on the trigger and sleeps at rest, so a still page costs nothing. `/start`'s curve
   (`lib/motion/start-curve.ts`) is untouched and keeps its `scaleY` kick.
4. **Measured at 1440 on a six-notch wheel flick under Lenis** (pool 202 px deep): 300 ms in,
   the apex is 10 px deeper and the handles at 0.8 of their inset (the dish); 600 ms in, 73 px
   deeper with the handles at 1.31 (the drop); the swing back is 45 px flatter at 0.77 (the
   dish again), then 35 deeper, 25 flatter, 18 deeper, 13 flatter, 10 deeper, at rest in about
   six seconds. Numbers still to feel-check with the owner: `pointiness` (how far the shape
   goes with the depth) and the shoulders' damping (how much ripple sits on the first swing).
5. **Checks:** typecheck, lint, prettier, knip and the unit tests (834, eight of them new in
   `lib/motion/pool-curve.test.ts`: the resting arc, the cap, the lag and the overshoot, the
   ring and the settle, and frame-rate independence) pass.

## Amendment, 25 September 2026, later: the footer sheet's lip is liquid too

The owner, shown the pooled curve, asked for the same for the footer. The sheet's rounded top
(decision 1's second shape) now moves with the scroll as the pool does; the rest of the record
stands, and the amendment above changes in one respect: the chain it describes has moved to
`lib/motion/chain.ts`, shared by both edges, with `lib/motion/pool-curve.ts` keeping only the
pool's drawing. The two are driven by one loop, `app/_components/motion/liquid.ts`.

1. **The server markup is unchanged in kind.** The sheet keeps its CSS corners and its overlap
   over the closing's foot; phones, reduced motion and the page before the choreography loads
   see exactly what they saw. `app/_components/site-footer.tsx` adds an empty `svg.sheet-lip`
   before the content and moves the content's clip (the wordmark's cut) onto a positioned box
   inside the sheet, because a clip on the sheet would clip a swell above it, and because a
   positioned lip would otherwise paint over the in-flow column headings, which its foot
   reaches under (seen on the first run; the box now paints over it).
2. **From md up the choreography takes the edge over** (`app/_components/motion/sheet-lip.ts`):
   it marks the sheet `data-lip`, which drops the CSS corners and leaves the sheet's top strip
   unpainted (`--lip-room`, 1.3 corner radii, a hard-stop gradient on the sheet's own ground)
   and shows the lip; it measures the sheet's width and its corners' radius from the lip's box
   (`--seam` tall) and draws the same corners as one path in those pixels, the viewBox the
   sheet's own pixels, so a corner is a true circle at every width; a settled resize refreshes
   every trigger and the refresh re-measures. The swap is drawn in the frame the corners go, so
   nothing flashes; measured against the CSS corners at rest, the two match.
3. **The drawing** (`lib/motion/lip-curve.ts`): the corners stay pinned to the sheet's sides,
   a quarter circle each at rest (a cubic with handles 0.5523 of the radius along the end
   tangents); the flat top between them is a cubic whose apex is the belly's, in corner radii,
   down while the page glides down (the ink lags the page, as the pool's does) and up past rest
   once it stops; its handles' inset from the corners is `dome` (0.55) of the half-length,
   moved by the belly's lag behind the shoulders (`pointiness` 1.2, eased toward 0.4 either
   way): toward the corners while the shoulders lead, a flat lift with steep sides, toward the
   centre while the belly leads, a peaked swell. Each corner's landing tangent turns with the
   top's, so the join never kinks, and the rim tips a little the other way as the middle moves,
   as a meniscus does. The apex is the handles' height alone, so a trough (`stretchCap` 1.2
   radii) stays inside the unpainted strip and a swell stays under `--spacing-band`, never less
   than 1.5 radii from md, and never reaches the closing's phone.
4. **The numbers** (`CONFIG.motion.choreo.sheet`): the pool's springs (shoulders 2 Hz at 0.2,
   belly 1 Hz at 0.1), so the page's two liquid edges move as one ink; `stretchMax` 0.8 radii,
   the knee 0.7, the cap 1.2. Measured at 1440 (radius 80) on a six-notch wheel flick into the
   page's end under Lenis: a 65 px trough 700 ms in with the handles at 0.92 of the half-length
   (peaked), a 36 px swell at 1.2 s with the handles at 0.19 (flat), then 29 down, 20 up, 15
   down, 11 up, 8 down, the corners' rims tipping up to 16 px the other way; the loop sleeps
   about ten seconds after the flick, later than the pool's six, because the rest threshold is a
   share of the unit and a radius is a smaller unit than the pool's depth. Numbers still to
   feel-check with the owner: `stretchMax` (how deep the sag goes) and `dome`.
5. **Checks:** typecheck, lint, prettier, knip and the unit tests (841, with
   `lib/motion/chain.test.ts`, `pool-curve.test.ts` and `lip-curve.test.ts`) pass. Budgets are
   not re-measured here; the modules ride the lazy choreography chunk.
