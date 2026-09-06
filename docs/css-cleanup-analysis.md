# Home page CSS cleanup analysis

- Date: 6 September 2026
- Scope: the home page and everything it renders — `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, `app/tokens.css` and the 158-file import closure behind them.
- Progress: sections A and B were applied on 6 September 2026; C and D are still open and both need an owner decision. See "Progress" below. The findings are kept as they were written, so the line numbers refer to commit `a898a24`, not to the code after the changes.
- Constraint: the page must look exactly as it does now. Every recommendation below is either proven to produce identical rendered output, or is labelled as a change the owner has to decide.
- Method: read every file in the closure; measured the production build (`pnpm build`); compared the shipped stylesheet and the prerendered HTML byte for byte; measured computed styles in headless Chromium against a real production server; read the Lenis source for the scroll arithmetic. Every claim below names the evidence that produced it. Findings were generated across seven dimensions and each was put to two independent adversarial reviewers instructed to refute it; six findings were killed that way and are recorded in "Rejected" so they are not re-proposed later.
- Line numbers are from the files as read on this date, at commit `a898a24`.

## The headline

The stylesheet is in good order. There is **no dead CSS to delete**: every token in `app/tokens.css` has a live consumer, every hand-written rule in `app/globals.css` is load-bearing, and about 78 of the 80 arbitrary values in the closure are justified. The audit found no unused colour, no unused type step, no unused easing.

What it did find is three different things:

1. **Repetition in the source, not in the output.** Ten class-string clusters are hand-copied across 49 call sites. Extracting them changes nothing about what ships — this was proven by rebuild and byte comparison — but it means a change to a shared idea stops needing six or nine edits.
2. **One real defect.** `text-brand-deeper` on the numbered counters in Taster, Real build and Included never takes effect. Sixteen elements that were meant to be brand blue render grey. This is a decision for the owner, not a cleanup.
3. **One genuine byte win that is currently blocked.** Roughly 11.5 KB of the stylesheet exists only because Tailwind scans `docs/`. It cannot be excluded yet, because an accidental dependency runs through it.

## Measured baseline

The home page ships exactly one stylesheet, `.next/static/chunks/0uu9hscc5jr7c.css`.

| Measure                             | Bytes  |
| ----------------------------------- | ------ |
| Raw                                 | 80,607 |
| Gzip                                | 13,835 |
| Brotli                              | 11,488 |
| — of which `@font-face` (19 blocks) | 4,920  |
| — of which the utilities layer      | 60,376 |
| — of which `@layer base`            | 3,689  |
| — of which `@layer theme`           | 3,221  |

Fonts were checked and are clean: the home sheet carries Geist and Geist Mono only. Bricolage Grotesque, Poppins, Fraunces, DM Serif Display and the rest live in their own route chunks and do not leak into the home page.

## A. The ten repeated class recipes — safe, and proven

`app/_components/section-styles.ts` already holds four recipes (`displayHeading`, `titleHeading`, `cardHeading`, `stickyColumn`). Ten more clusters are repeated by hand and belong beside them.

| Proposed name   | Class string                                                             | Sites           | Files                                                                                           |
| --------------- | ------------------------------------------------------------------------ | --------------- | ----------------------------------------------------------------------------------------------- |
| `sectionGrid`   | `grid md:grid-cols-6 md:divide-x md:divide-border`                       | 6               | about, faq, outcomes, real-build, straight-answers, your-options                                |
| `headingColumn` | `flex flex-col gap-3 p-column max-md:pb-3 md:col-span-2 ${stickyColumn}` | 5               | faq, outcomes, real-build, straight-answers, your-options                                       |
| `sectionLead`   | `text-lead text-pretty text-on-surface-muted`                            | 9               | faq, how-it-works, included, outcomes, real-build, straight-answers, taster, work, your-options |
| `cardBody`      | `text-body text-pretty text-on-surface-muted`                            | 8 (+2 prefixed) | how-it-works, included, real-build ×2, straight-answers, taster, what-you-get, your-options     |
| `hairlineCell`  | `flex flex-col gap-3 bg-surface p-4 sm:p-cell`                           | 3               | what-you-get, included, work                                                                    |
| `cellGrid`      | `grid grid-cols-2 gap-px bg-border`                                      | 3               | what-you-get, included, work                                                                    |
| `stepRow`       | `flex gap-5 p-5 md:p-cell`                                               | 2               | taster, real-build                                                                              |
| `stepNumber`    | `${captionStyles} w-[2ch] shrink-0 pt-1 text-brand-deeper tabular-nums`  | 2               | taster, real-build                                                                              |
| `trailingNote`  | `flex flex-col gap-2 p-5 text-small text-on-surface-muted md:p-cell`     | 2               | outcomes, your-options                                                                          |
| `tapLinkStyles` | `${textLinkStyles} inline-block py-1` (in `components/ui/text-link.ts`)  | 9               | included ×2, outcomes, real-build, taster ×2, work ×2, your-options                             |

The same comment — `gap-px over a border-coloured background draws the hairlines between cells.` — is hand-copied into four files (`included.tsx:22`, `straight-answers.tsx:18`, `what-you-get.tsx:11`, `work.tsx:63`). It should be written once, above `cellGrid`. Two files already say in prose that these are meant to be one recipe: `real-build.tsx:18` ("Steps use the Taster's own row recipe so the two read as one system") and `work.tsx:50` ("one card each on the What you get cell recipe").

### How this was proven

Not by argument. A detached worktree was built at `a898a24`, 27 of these replacements were applied across 12 files, and the production build was compared with the baseline:

- Prerendered `index.html`: **byte-identical**, 135,753 bytes both.
- Stylesheet: **byte-identical**, 80,607 bytes both, and the content hash in the filename was unchanged (`0uu9hscc5jr7c.css` before and after).
- `pnpm typecheck` and `pnpm lint` both clean.

The mechanism is that `section-styles.ts` and `text-link.ts` are already scanned by Tailwind — `md:sticky` exists nowhere else in the repo and is emitted today — so moving a literal into them loses no candidate, and the rendered class attribute is the same string. The remaining sites work by that same mechanism. One reviewer independently reproduced the result by compiling `globals.css` twice through the repo's own PostCSS toolchain and comparing SHA-256 hashes, with a deliberate negative control (changing the column count in `sectionGrid`) to confirm the test could detect this class of edit.

### Two deliberate exclusions

- `about.tsx:50` uses `gap-6`, not `gap-3`, because the address card needs more air than a lead paragraph. It could be written `` `${headingColumn} gap-6` `` — `.gap-6` is emitted after `.gap-3` today, so it would win — but that leans on Tailwind's utility sort order rather than on the class set, and a version bump can move it. Leave `about.tsx` writing its column out in full.
- `straight-answers.tsx:19` and `:24` look like `cellGrid` and `hairlineCell` but use different padding (`p-5 md:p-cell`, no `grid-cols-2` base). Folding them in would change rendering. Leave them.

## B. The one real defect: the step counters are not brand blue

`captionStyles` (`components/ui/caption.ts:3`) is `font-mono text-label text-on-surface-muted`. Three call sites append `text-brand-deeper` to it through a plain template literal — not `cn()` — so **both** colour classes reach the DOM:

- `app/_components/taster.tsx:56`
- `app/_components/real-build.tsx:35`
- `app/_components/included.tsx:33`

Both rules sit in `@layer utilities` at equal specificity, and `.text-on-surface-muted` is emitted _after_ `.text-brand-deeper` (byte 46,550 against 46,350), so the muted colour wins.

Measured in headless Chromium against the production build:

```
--brand-deeper      : #0369a1
--on-surface-muted  : #475569

elements with both classes: 16
  [taster]   "01" -> computed color: rgb(71, 85, 105)   (= #475569, grey)
  [included] "01" -> computed color: rgb(71, 85, 105)
CONTROL (text-brand-deeper alone, What you get icon)
                    -> computed color: rgb(3, 105, 161) (= #0369a1, brand)
```

The control proves the class works when nothing overrides it. So the counters `01`, `02`, `03` … render grey on all sixteen elements, and have done since they were written.

This is a decision, not a cleanup, because the two ways out differ:

- **Keep the look exactly as it is** — delete the dead `text-brand-deeper` from the three call sites. Zero visual change. This is the option consistent with "everything looks just as perfect as it does now".
- **Honour what the code intended** — build the string with `cn()` so `tailwind-merge` drops the losing class and the counters turn brand blue. This _is_ a visual change on sixteen elements, and it is very likely what was meant when the class was written.

Other sites are unaffected: everything built with `cn()` already has its conflicts stripped at render time. These three survive precisely because they use template literals.

## C. The byte win, and why it is blocked

Tailwind scans `docs/` (52 markdown files, 1.8 MB) and `e2e/`. Prose and code samples in the design notes are treated as class candidates, so they emit real utility rules into the sheet every page of the site downloads.

Adding `@source not '../docs';` and `@source not '../e2e';` beside the existing `@source not '../templates';` was built and measured:

|                                  | Raw                 | Gzip               |
| -------------------------------- | ------------------- | ------------------ |
| Today                            | 80,607              | 13,835             |
| With `docs/` and `e2e/` excluded | 69,089              | 12,413             |
| **Saved**                        | **11,518 (−14.3%)** | **1,422 (−10.3%)** |

**It is not safe to do yet.** Both builds were served side by side and every element's computed style compared across `/`, `/start`, `/privacy` and the four `/examples/*` routes:

- `/`, `/start`, `/privacy`: **no differences** (the home page was checked at 390 px, 768 px and 1280 px; the only deltas were the port number inside image URLs).
- `/examples/atlas` and `/examples/meridian`: **real regressions.** Eight containers lost their width — `max-width: 1280px` became `none`.

The cause is precise and worth recording, because it is a latent fragility regardless of this cleanup. `max-w-(--breakpoint-xl)` is used by `templates/t03-meridian` and `templates/t04-atlas`. Those files are excluded from `globals.css` by `@source not '../templates'`, and `templates/tailwind.css` imports the theme with `theme(reference)`, which emits no variables. So `--breakpoint-xl: 80rem` reaches `:root` **only because prose in `docs/` quotes the template code**. Editing or deleting an unrelated design note would silently break the Atlas and Meridian example and preview pages.

Recommended order: make that dependency explicit first — either have the templates use a real scale step, or emit the breakpoint variable deliberately — and then the two `@source not` lines are free money on every page of the site.

## D. Anchor jumps land 64 px lower than intended

`app/globals.css:50` sets `html { scroll-padding-top: 4rem }`, with the comment "The fixed header is 4rem tall; keep every fragment jump and focus scroll clear of it." Ten sections _also_ carry `scroll-mt-16`, which is `scroll-margin-top: 4rem`.

These do not overlap — they **compound**. Scroll padding shrinks the scrollport and scroll margin expands the target box, and both are applied. Lenis does the same arithmetic explicitly (`node_modules/lenis/dist/lenis.mjs:786` subtracts `scrollMarginTop` _and_ `scrollPaddingTop`), so the smooth path and the native path agree.

Measured in Chromium against the production build:

```
header height         : 65 px
root scrollPaddingTop : 64 px
section scroll-margin : 64 px
native scrollIntoView lands: 128 px below the viewport top   (how-it-works, work, about, faq)
```

So every nav and footer anchor leaves 63 px of empty space above the section beyond the header it needed to clear. Both mechanisms are load-bearing — removing either moves every anchor landing by exactly 64 px — so **this is not a cleanup and nothing should be changed silently**. It is flagged because the comment says 4 rem and the page does 8 rem, and only the owner can say which is right.

For completeness: `#outcomes`, `#taster` and `#included` carry `scroll-mt-16` but have no inbound link. They are deep-linkable IDs and worth keeping.

## E. Checked and clean

Recording the negative results so this ground is not re-covered.

- **Design tokens.** Every token in `app/tokens.css` and `app/globals.css` has a live consumer. `--accent` and `--surface-muted` share the value `#f1f5f9` but are derived from separate recipe entries in `lib/tokens/derive.ts` and a generated brand set can separate them, so collapsing them would break per-brand recolouring. The word `inline` in `@theme inline` must stay: it substitutes the reference down to the `:root` variable that previews override at runtime.
- **`app/globals.css`, rule by rule.** All 170 lines are load-bearing. `body { overflow-x: clip }` is needed by the corner ticks at `-left-3`/`-right-3`, and `clip` specifically — `hidden` would make body a scroll container and break `stickyColumn`. The `html.lenis.lenis-smooth` override exists for scrolls that land mid-glide. The `scroll-behavior: smooth` rule is reachable whenever Lenis is absent (JavaScript off, chunk not yet loaded, load failed).
- **Arbitrary values.** 80 occurrences, ~78 justified. The sub-scale type sizes (6–13 px) in the sketch and wireframe components cannot use `text-label`, which is 12 px — `text-[9px]` is not `text-label`. Gradients, masks, grid track lists, `vh`/`ch`/`em` measures and variant selectors have no token form.
- **Redundant utilities.** Scanned all 275 distinct class attributes in the prerendered HTML: no duplicated tokens, no responsive variant restating its own base, and no same-group collisions other than the `text-brand-deeper` case in section B. `lib/cn.ts` is `clsx` + `tailwind-merge`, so every `cn()` call already strips conflicts. `text-body` is **not** a no-op — it carries `--text-body--line-height: 1.6` against preflight's 1.5.
- **Per-route CSS splitting.** 8,642 raw bytes (14.3% of the utilities layer) are unreachable from the home page, mostly `/start`'s multi-step form. A perfect split would save about 1,018 gzip bytes — 0.4% of the 215 KB of script the same page already carries — and one shared sheet is cached across the whole `/` → `/start` funnel. **Not worth it.** Note that 59% of that figure is the `docs/` leak in section C, which two lines fix without any architectural change.
- **Hoisting repeated classes onto parents.** A net loss in Tailwind v4. Tailwind emits one rule per utility however many elements carry it, so repeating a cell recipe on eight `<li>`s costs no extra CSS; rewriting it as `[&>li]:…` would add new arbitrary-variant rules and raise specificity from (0,1,0) to (0,1,1).

## Rejected findings

Six proposals were killed in review and should not be re-proposed:

| Proposal                                                        | Why it was rejected                                                                                                                                          |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Exclude `docs/` from Tailwind scanning as a standalone cleanup  | Breaks `--breakpoint-xl` on `/examples/atlas`, `/examples/meridian` and `/preview/[slug]`. Viable only after section C's first step.                         |
| Drop `--motion-stagger: 0ms` from the reduced-motion block      | The mechanism claim is right — its only reader is in the mutually exclusive `no-preference` block — but the declaration documents intent and costs 22 bytes. |
| Delete `html.lenis, html.lenis body { height: auto }`           | Provably a no-op today, but it is a guard against Lenis's documented wrapper behaviour, not dead code.                                                       |
| Rewrite `aspect-[9/19]` as a bare fraction                      | Render-identical, but pure churn; the evidence given for it was also wrong on one point.                                                                     |
| Rewrite `bg-[size:22px_22px]` as the v4 background-size utility | Render-identical modernisation, no benefit beyond style.                                                                                                     |
| Fold `scroll-mt-16` onto `<main>` with a child selector         | Would newly apply to Hero, What you get and Closing CTA, which deliberately lack it, moving where `#cta` lands.                                              |

Those three are written out in prose rather than as the classes they propose, because Tailwind scans
`docs/`: quoting a class that exists nowhere in the code emits a real, permanently unused rule into
the stylesheet every page of the site downloads. Writing this document cost 227 bytes that way before
the wording was changed. Until section C lands, that is the rule for every note in this directory.

## Progress (6 September 2026)

| Section                     | Status                     | What happened                                                                                                                                                                                                                                            |
| --------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A. Ten recipes              | Done                       | All ten extracted, 52 call sites converted. Three of the four copies of the hairline comment removed; `straight-answers.tsx` keeps its own, because it does the trick by hand on a different grid shape and is not converted.                            |
| B. The dead counter colour  | Done, keeping today's look | `text-brand-deeper` removed from `stepNumber` and from `included.tsx`. The counters still render `#475569`, exactly as before. `section-styles.ts` carries a note saying how to make them brand instead — with `cn()`, never by adding the utility back. |
| C. Excluding `docs/`        | Not done — still blocked   | Unchanged: the `--breakpoint-xl` dependency has to be made explicit first. Writing this document proved the point, adding 227 bytes of permanently unused CSS until the wording was changed; see the note under "Rejected".                              |
| D. The 8 rem anchor landing | Not done — owner decision  | Unchanged. Nothing was touched.                                                                                                                                                                                                                          |

### How A and B were verified

The stylesheet is **byte-identical** to the pre-change build — same content hash (`0uu9hscc5jr7c.css`), same 80,607 bytes — so not one byte of CSS moved.

For the markup, every replacement in A that preserves class order was applied first and checked on its own: all **966 class attributes** in the prerendered home page came out in an identical sequence, with only the JS chunk hashes and the Next build id differing, as they do on any rebuild.

The rest — the three `cellGrid` sites, which reorder two class strings, and B, which drops a token — were then checked where it actually counts. Both builds were served and **4,439 elements were compared across `/`, `/start` and `/privacy` at 390, 768 and 1280 px, on 63 computed properties each**:

- **0 real computed-style differences.** The only 24 deltas were the port number inside asset URLs.
- The 6 reordered attributes have an identical token set.
- The 48 counters that lost `text-brand-deeper` compute the same colour before and after — which is itself the proof the class was dead.

`pnpm lint`, `pnpm typecheck`, `pnpm knip` and `pnpm format:check` are clean; 477 unit tests pass; 42 e2e tests pass.

Four e2e accessibility tests fail, and they **failed identically on `a898a24` before any of this work** — verified by stashing the changes and re-running. `settled()` in `e2e/a11y.spec.ts:26` waits for every animation to stop, and the logo marquee is `logo-marquee 20s linear infinite`, so it never settles. The page is fine; the scan never runs. Worth fixing separately, because it means WCAG regressions currently go undetected.

## What is left

1. **Section C**, in two steps: make the `--breakpoint-xl` dependency explicit, then add the two `@source not` lines and re-run the cross-route comparison.
2. **Section D** stays open as an observation until the owner rules on 4 rem against 8 rem.
3. The a11y suite, so it can settle on a page with an infinite animation.
