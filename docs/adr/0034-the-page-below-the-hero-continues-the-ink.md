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
   consequences).

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
