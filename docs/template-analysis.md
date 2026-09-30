# Template analysis: Ember, Harbor, Summit and Vector

Phase 1 of the owner's brief for two new templates, one for fintech and one for any industry. It analyses the four templates the owner rates highest, `t05-ember`, `t06-harbor`, `t07-summit` and `t08-vector`, and sets the bar the new two must pass. Analysis only: no template code was changed. Written 27 Sept 2026 against `b47f988`, and revised the same day after a verification pass.

**Summary.**

- The "config" the brief asks for already exists: a content object per template, 14 colour tokens derived from one brand hex, two font variables and named image slots. A template chooses roles, never values, and a visitor's page gets one of four font pairs and no figures at all.
- The four are class-for-class ports. Their best ideas transfer: sampled-spring easing, reveals that hide nothing without JavaScript, hairline grids, WebGL that reads the tokens. Their sector icons, fixed sizes, alpha text and dead-end asks do not.
- On their example routes none of the four passes the repo's own Lighthouse or axe bar. Opacity-0 heroes break LCP, alpha text fails contrast, and CI checks no template route.
- On a visitor's page every figure is null, every contact route is a mailto for the lead's own address, and a fixed header covers the StudioBar.
- Before Phase 2 the owner must settle the set size and visit cap, the GSAP and WebGL boundary, the contact mechanism and the fit signal ("Decisions before Phase 2").
- Phase 2 proposes two directions per template, Intaglio and Sheaf for fintech and Mullion and Placard for any industry, each with a style tile in `docs/directions/`. It recommends Intaglio and Mullion, and waits on the owner's picks and on the decisions the directions assumed ("Design directions (Phase 2)").

**Evidence.**

- Code: every file under `templates/t05-ember` to `templates/t08-vector`, the shared contract (`lib/copy-slots`), the colour engine (`lib/tokens`), the imagery stage (`lib/images`), the pipeline (`lib/inngest/functions/build-concepts.ts`), ADRs 0005, 0008, 0023, 0024, 0027 to 0031, 0034 and 0038, and `docs/template-porting-guide.md`.
- Measurements: a production build of `b47f988` served by `next start` from a detached worktree. Lighthouse 12.8.2, mobile, simulated throttling, three runs, medians, plus one devtools-throttled run per page. axe 4.13 through `@axe-core/playwright` with the wcag2a, 2aa, 21a, 21aa and 22aa tags, after scrolling the page through. Playwright probes for keyboard, overflow, reduced motion, no JavaScript and WebGL. **Every number comes from that local build, not from Vercel.** Lighthouse's headless Chromium drew WebGL with SwiftShader, a software renderer, so Vector's CPU figures are pessimistic but valid for comparison.
- Revision probes: Playwright against the owner's dev server on port 3000 for page positions, type sizes, measure and tabular figures (layout matches the build). Contrast figures marked "computed" come from `deriveTokens` over 12 brand hexes with each alpha composited and scored by culori's `wcagContrast`, the solver's own function. They were not measured in a browser.
- Where the raw data lives: the Lighthouse and axe JSON and the probe scripts sit in the analysis session's scratchpad, outside the repo. `.compare/template-analysis/` holds only PNGs and `meta.json`, so none of these numbers can be re-run from the tree today ("Tooling the bar needs").
- Screenshots: 279 PNGs at 375, 768, 1024, 1440 and 1920 in `.compare/template-analysis/<template>/`, which git ignores (`.gitignore:26`). Names are relative to that folder (`harbor/375-00.png` is Harbor at 375 px, first viewport); inside a template's own subsection the folder is dropped.
- Units: B is bytes and kB is 1,000 B throughout.
- Terms: the StudioBar is the 56 px studio strip above a template on the preview route (`app/preview/_components/studio-bar.tsx:24`), `/preview/[slug]/[templateId]`. Kestrel is the made-up business every example page describes. Lantern is Lighthouse's simulated-throttling model.
- Every example page fills every optional section. A visitor's page does not. Where the two differ, this document says which one it describes.
- Not measured: the live preview route (it needs a database row, so the StudioBar overlap is simulated); hidden-tab pausing (headless Chromium kept the page visible); INP (TBT stands in); axe on a derived light palette; the phone menus with JavaScript off; any metric on a visitor-shaped page (derived tokens, preview fonts, Pexels WebP, fallback copy, optional sections null); real-GPU frame timing for Vector; a screen-reader pass on any template; h3, button and label sizes; screenshots of the other scheme, a derived palette, a null-optional page, no JavaScript, the no-WebGL fallback, 320 px and the StudioBar overlap.

## Where the brief collides with the repo

**"The config" is a content object, 14 tokens and two font variables.** There is no per-template config file.

- Each template exports a content type (`copy-slots.ts`) and a contract (`contract.ts`): a zod copy schema, a guide generated from the slot table, `assemble`, a deterministic fallback, and `defineContract` (`lib/copy-slots/contract.ts:11-25`). The pipeline fills the content object from five answers: one sentence of at most 400 characters, the company name, a logo, a style (always required) plus optional photos, and a colour (`lib/brief/submission.ts:14-26`, `lib/config.ts:133`). The style also picks the type pair and, when it is `dark`, forces the dark scheme (`app/preview/_components/fonts.ts:27-32`, `lib/tokens/scheme.ts:9`).
- Colour is 14 tokens derived from one brand hex (`lib/tokens/derive.ts:27-79`). A template chooses which tokens it paints and which text pairs it declares. It does not choose the scheme (`lib/tokens/scheme.ts:8-11`) or any value. The brand set has no success, danger or warning token (`lib/tokens/types.ts:11-26`); those utilities are fixed site colours (`app/globals.css:87-89`) and are never contrast-solved. The token called `accent` is a pale panel tint, not the brand colour (`lib/config.ts:68,82`).
- Type is two variables set from one of four fixed pairs chosen by the visitor's style (`app/preview/_components/fonts.ts:19-41`): Fraunces with Instrument Sans, Manrope with Inter, Bricolage Grotesque with DM Sans, Sora with Inter. Roman only, so every italic is synthesised. No monospace. All seven load with `preload: false` and `display: 'swap'` (`fonts.ts:19-25`), so the preview face swaps in after first paint; its LCP and CLS cost was not measured.
- Images are landscape Pexels photos or the visitor's uploads, re-hosted as one WebP up to 1920 px wide (`lib/images/pexels.ts:23`, `lib/images/rehost.ts:20-35`). Uploads fill slots in order and every later slot is null (`lib/images/plan.ts:24-28`). Slots declare no aspect ratio. A fintech "product UI" must be drawn in code from copy, as Aurora's product frame is (ADR 0008 decision 6), not supplied as a picture.
- Example routes bypass most of this. They hand-write the default scheme's tokens. Aurora derives both schemes (`app/examples/aurora/page.tsx:24`); Ember, Harbor, Summit and Atlas derive their second scheme through `?scheme=` (`app/examples/ember/page.tsx:42`, `harbor/page.tsx:42`, `summit/page.tsx:45`, `atlas/page.tsx:44`); Monolith, Meridian and Vector derive none. Harbor imports the source's Inter and Space Grotesk (`harbor/page.tsx:36-37,44-45`). Ember and Summit import only Urbanist for display and set the body in the site's Mona Sans, not the source's Geist (`ember/page.tsx:44-45`, `summit/page.tsx:47-48`). Vector imports no font and sets the system stacks `ui-serif` and `ui-sans-serif` (`vector/page.tsx:56-58`).
- So the owner reviews pages that are fuller and truer to the source than a visitor's page: every optional section is filled and the source's palette and display face are used. They are not better in every way. The hand-set Ember palette fails contrast where a derived set passes (ADR 0027:24; axe found 15 to 16 nodes on the hand-set light set and 1 on the derived dark set).

**Collisions with the content mechanism.**

- **Figures, prices, fees, security claims, disclaimers.** `lib/copy-slots/rules.ts:10` rejects any digit the owner did not type; `:9-21` rejects claim words (certified, accredited, guaranteed, trusted by, testimonials). Every number, fee, rating or compliance line must live in an optional `| null` section that `assemble` sets null and only the example fills (`templates/t06-harbor/contract.ts:240`, `templates/t08-vector/contract.ts:167`). A stat-shaped section need not go: Harbor keeps its hero stats and metrics grid on every visitor page, filled with worded values such as "Open late" or "Same week" (`t06-harbor/contract.ts:141-142,161-162`, kept at `:233,238`), and its count-up leaves a phrase as it is (`t06-harbor/sections/count.tsx:21-23`). So on a visitor's page a fintech template loses its real figures, prices, ratings and compliance lines, not its KPI-shaped bands. A regulatory disclaimer must never be generated for a real business.
- **Tabular figures.** Measured on the faces as Google Fonts serves them (the source next/font downloads from): `font-variant-numeric: tabular-nums` changes nothing in Fraunces or DM Sans ("1111" stays narrower than "0000"), and equalises the digits in Instrument Sans, Manrope, Inter, Bricolage Grotesque and Sora. So the warm pair's display face and the bold pair's body face cannot set tabular figures.
- **Palette.** A Phase 2 "palette" can only name token roles and how much of each a page uses, never values. There is no gain or loss token (`lib/tokens/types.ts:11-26`), so a fintech up/down encoding has no solved colour. Adding one changes the colour engine and every template's solve.
- **Copy the templates hard-code.** Against "every copy from the config", all four footers print "All rights reserved" and "Photos by ... Pexels" (`t05-ember/sections/footer.tsx:87,91`, `t06-harbor/sections/footer.tsx:101,120`, `t07-summit/sections/footer.tsx:88,92`, `t08-vector/sections/footer.tsx:135,139`). Harbor prints "Scroll" (`t06-harbor/sections/hero.tsx:124`) and the placeholders "John Doe" and "john@example.com" (`contact.tsx:93,106`, against ADR 0008 decision 1). Vector's cursor says "Open" (`t08-vector/sections/projects.tsx:154`). Menu toggles carry fixed English names (`t05-ember/sections/nav.tsx:74,104`, `t06-harbor/sections/nav.tsx:115,134`, `t07-summit/sections/nav.tsx:91,123`).
- **Charts.** A chart needs values and `rules.ts:10` bans digits, so on a visitor's page any chart is decoration. Real values belong to the example only.
- **Meta tags.** Templates have no metadata hook. A visitor's design page sets its title (`"{company}, design N of M"`) and `noindex` (`app/preview/[slug]/[templateId]/page.tsx:29-41`) and inherits the studio's description, Open Graph tags and `canonical: '/'` (`app/layout.tsx:31-45`). The share image takes the first chosen template's `headlineOf` (`app/preview/[slug]/opengraph-image.tsx:21-26`). Every template renders through that one route (`templates/render.tsx:24-49`), so per-template meta needs a contract field (`lib/copy-slots/contract.ts:11-25`) and a change to one shared route file. A required field would touch all eight `contract.ts` files; an optional one touches none.
- **WebGL reading tokens.** Possible today. Vector's waves read `--glow`, `--glow-secondary`, `--brand` and `--surface` with `getComputedStyle` and parse six-digit hex (`templates/t08-vector/sections/waves.tsx:109-117,183-192`), which `formatHex` guarantees (`lib/tokens/derive.ts:78`). A non-hex value silently becomes white (`waves.tsx:111`). Vector's other shader ignores the tokens and hard-codes a violet-to-pink duotone (`ripple.tsx:59`). Follow the first.
- **One token set per submission.** The three chosen templates' contrast pairs are solved together (`lib/inngest/functions/build-concepts.ts:90-94`). A new template that declares a new pair can shift the colours of Ember, Harbor, Summit or Vector when shown beside them, with no change to their code.
- **A config flag to turn WebGL off.** Templates may not import `lib/config` or `lib/env` (`eslint.config.mjs:37-40,127-137`). The flag has to be a template-local constant (the ADR 0008 decision 5 precedent for tunables), a value threaded through `TemplateAssets`, or a data attribute. Each departs from `docs/standards.md:49-50` and needs an ADR line.

**The set is eight, and the visit cap depends on it.**

- `TemplateTuple` has exactly eight elements (`lib/copy-slots/template-meta.ts:19-28`), `CONFIG.templates.count` is 8 (`lib/config.ts:108`), and `tests/integration/registry.test.ts:6-8` holds them together. ADR 0038 fixed the set at eight on 26 Sept.
- The two-visit cap is not a setting. Eight templates at three a visit leave two unseen after two visits, and `selectTemplates` returns nothing when fewer than three remain (`lib/select/select.ts:41`). ADR 0038:22: "a ninth template would allow a third visit. Adding one needs an explicit cap on the number of visits first." Ten templates leave four unseen, which opens a third paid visit.
- Replacing two of the eight does not keep the cap either. `selectTemplates` filters the current candidates by `!seen.has(t.id)` (`lib/select/select.ts:39`), so an address that saw a removed template has four unseen after the swap (the two new, two old) and gets a third paid visit. Either the explicit cap lands first, or production's `seen` table is confirmed to hold no such rows before the swap ships.
- The owner must choose: replace two of the eight, grow to ten, or keep the new two example-only, where no visitor sees them. Growing needs `template-meta.ts` (the tuple), `CONFIG.templates.count`, `templates/registry.ts`, `templates/render.tsx`, `lib/preview/descriptors.ts` (one unique poster layout per template, `lib/preview/descriptors.test.ts:31-35`), `app/_styles/design-poster.css` and the explicit cap (in `lib/db/exclusivity.ts` or the select stage), superseding ADR 0038. Replacing leaves the tuple and the count alone but needs the registry, `render.tsx`, `descriptors.ts` and `design-poster.css` edits, and deletes two template folders, their `app/examples/<name>/page.tsx` routes and, for ported ones, their `THIRD_PARTY_NOTICES.md` entries. Only growth leaves every existing template folder untouched.
- `t09-<name>` and `t10-<name>` are safe ids: `t09-linen` and `t10-orbit` were never ready and never selected (ADR 0038:9).

**The selector does not match templates to industries.**

- Selection uses readiness, unseen status, logo polarity, a seeded shuffle and variety of tone words (`lib/select/select.ts:18-55`). Neither the submission nor the brief has an industry field (`lib/brief/submission.ts:14-26`, `lib/copy-slots/brief.ts:11-26`). A fintech-only template will be shown to a bakery as often as to a fintech. Either it degrades to a credible neutral page, or selection gains a fit signal, which changes the brief stage, the selector and their tests.
- Every existing template is already multi-industry by construction: its contract takes any brief, and all eight declare `polarity: 'either'`. Their pictures and icons are not. Ember draws a chef's hat, a leaf and a heart for every brand (`templates/t05-ember/sections/features.tsx:9`), Harbor a dumbbell and a trophy (`t06-harbor/sections/services.tsx:9`), Summit a stethoscope, a heart pulse, a hospital and an ambulance (`t07-summit/sections/why.tsx:9`). Summit's booking form has the visitor pick a person, a department and a date; on a visitor's page the person field's label is model-written ("Who to ask for") and has no options, and only its id and name say doctor (`t07-summit/contract.ts:186-188,290`, `sections/booking.tsx:89-96`). Vector's "Selected Work" presumes a portfolio no brief holds (`t08-vector/contract.ts:103-106`). The multi-industry template is not a new job; it is the job the four already fail visually.

**The four are ports, so their DNA is partly inherited.**

- Ember is PrebuiltUI's Restro, Harbor its Forged gym and Summit its MediCare hospital, all MIT and taken from published builds because the repository folders hold only a README (ADRs 0027 to 0029). Vector is rebuilt from the public demo of React Bits Pro's paid Agency template (ADR 0030). The rule was class for class (ADR 0023:21), so the sizes, spacing, easings, section order and faults are the sources'.
- The ADRs' pixel-match checks (ADR 0027:24, ADR 0029:24) are stale. The example bodies render in Mona Sans since ADR 0034, not the source's Geist, and the example comments still say Geist (`app/examples/ember/page.tsx:34-36`, `app/examples/summit/page.tsx:36-40`).
- Vector's shaders are "written from the demo's own GLSL" and its example pictures are "the demo's own files", with no licence named (`THIRD_PARTY_NOTICES.md:65-69`). The owner's clearance (ADR 0030:11) is not the licensor's.

**No template uses GSAP or a WebGL library today.**

- GSAP 3.15.0 and Lenis 1.3.26 are site dependencies (`package.json:41,43`), loaded only through `lib/motion`: GSAP by `loadGsap` (`lib/motion/gsap.ts:12-34`), Lenis by `loadLenis` (`lib/motion/lenis.ts:10-13`). ESLint forbids both outside `lib/motion` (`eslint.config.mjs:28-32`, lifted for `lib/motion` at `:216-225`) and forbids templates from importing anything but `@/lib/tokens/*` and `@/lib/copy-slots/*` (`:37-40`). ADR 0008 decision 4: "nothing in a template loads GSAP". Vector ported GSAP's curves and ScrollTrigger's `scrub: 1` to CSS scroll-driven animation plus a small controller (`t08-vector/sections/scrubs.tsx`).
- The only template WebGL is Vector's raw WebGL1 (`waves.tsx`, `ripple.tsx`). The site's ink is raw WebGL in `lib/motion/fluid.ts`. No library anywhere.
- Lint has a loophole: `import('gsap')` inside a template passes, because `no-restricted-imports` ignores dynamic imports (verified with `eslint --stdin`). Passing lint is not compliance with ADR 0008.
- **Smallest addition for GSAP:** an owner-approved ADR amending ADR 0008 decision 4, and one ESLint change letting templates import `@/lib/motion/gsap` and the arming helpers (`@/lib/motion/idle`, `use-motion-allowed`). ScrollTrigger must also follow the site's Lenis (`app/_components/motion/index.ts:325-345`), which lives in `lib/motion`.
- **What GSAP costs against the budget.** The 230,000 B line is Lighthouse's `resource-summary:script:size`, a transfer measure (`lighthouserc.json:22`). On the example routes Lighthouse transferred 159,441 B of script for Ember, 160,058 B for Harbor, 160,131 B for Summit and 169,649 B for Vector, Lenis included. GSAP core is 27,185 B gzipped and ScrollTrigger about 17.4 kB (built chunks, 44.7 kB together). Both at idle would reach about 204 to 214 kB, under the line. The site's pattern loads core only below 48rem (`app/_components/page-choreography.tsx:9-10,39-41`), which is what a mobile run gets: about 187 to 197 kB. The preview route imports all eight templates. Its client reference manifest lists 41,907 B (gzip -9) of entry JavaScript against Ember's 18,143 B, so by estimate it transfers about 183 kB: about 210 kB with GSAP core and about 228 kB with ScrollTrigger too, only about 2 kB under the line (an estimate from built chunks, not a Lighthouse run). Arming on scroll intent (`whenScrolled`, `lib/motion/idle.ts:49-62`), as the home page does (ADR 0034:119-125), is still wise for that headroom and for TBT; the byte line alone does not force it.
- **Smallest addition for WebGL:** no dependency. The work is a lifecycle the repo has never had in one place (see "Animation setup and cleanup").

**Nothing gates a template's performance or accessibility today.** `lighthouserc.json:4-8` collects `/`, `/start` and `/contact` only, and no CI job runs it. `scripts/bundle-budget.mjs` budgets the same three routes (`:90,128,149`). No e2e or axe spec visits a template example route: `e2e/a11y.spec.ts` visits `/` (`:34,44`), and the only `/examples` route under test is `/examples/hub` (`e2e/a11y-hub.spec.ts:12`), which is not a template. Code quality is gated: per-template contract and copy-slot tests, the registry test (`tests/integration/registry.test.ts:18-27`) and ESLint's template boundary and hex and palette bans (`eslint.config.mjs:148-158`) all run in hooks and CI. A template can fail every performance and accessibility threshold in the brief and CI stays green.

**One live claim is affected.** The home page says "A person designs every layout" (`app/_components/straight-answer-items.ts:34`), already flagged in `docs/claims-register.md:19`. If an agent designs the new two, the owner needs to settle that wording first.

## Build system

### Stack and dependencies

- Next.js 16.3.5 with Turbopack, React 19.3.0, Tailwind CSS 4.3.3, TypeScript 6.0.3, pnpm 10.34.5 (`package.json:5,45,46,72,73`).
- Templates use `next/image`, `lucide-react` 1.47.0 (`:44`) and zod 4.6.5 in contracts (`:52`). Nothing else.
- Site only: GSAP 3.15.0 and Lenis 1.3.26 (`:41,43`). sharp 0.35.4 re-hosts images (`:50`). No three.js or ogl.
- Templates render only on `/examples/*` and `/preview/*` (ADR 0024). `templates/tailwind.css:18-21` takes the theme and `app/tokens.css` by reference and builds utilities from `templates/` alone; `app/globals.css:9` keeps the folder out of the site sheet. Every example route is dynamic: it awaits `searchParams` (`app/examples/ember/page.tsx:58-59`).
- The root layout still wraps every template route: it preloads Mona Sans and Instrument Serif italic (`app/layout.tsx:12-27`), mounts the skip link (`:53-59`) and mounts Lenis (`:61`).
- `templates/render.tsx:3-18` imports all eight template indexes, so every preview page links all eight templates' stylesheets: 11 sheets, 40,204 B gzipped, measured on the preview route.

### File structure and naming

Vector's tree, since it is the one template with WebGL. The other three share the top level and have fewer client files.

```text
templates/
  tailwind.css            utilities for templates/ only (ADR 0024)
  registry.ts             TEMPLATES (the eight-tuple), CONTRACTS, contractFor
  render.tsx              switch: parse copy, assemble, render; imports all eight
  t08-vector/
    index.tsx             Vector: div#top.vector, header, main#main, footer, two controllers
    meta.ts               id, name, description, ready, polarity, tones (selector input)
    copy-slots.ts         VectorContent, VECTOR_SLOTS, VECTOR_COUNTS, VECTOR_CONTRAST_PAIRS, vectorViolations
    contract.ts           vectorCopySchema, TARGETS/HREF/NAV, PURPOSE and guide, assembleVector,
                          vectorFallbackCopy, vectorContract
    styles.ts             recipes (container, pad, anchored, pill) and delay()
    vector.css            easings, @property, keyframes, reduced-motion and scripting gates
    contract.test.ts      fallback over a brief corpus, guide coverage, link enum, assembly
    copy-slots.test.ts    example passes, bare content passes, violations reported, pairs known
    sections/
      header.tsx    client   glass pills, scroll spy, menu
      logo.tsx               image logo or wordmark (client bundle, via header)
      hero.tsx               server; embeds the waves
      waves.tsx     client   raw WebGL1 waves, SVG fallback, compile() and quad()
      projects.tsx  client   marquee, cards, cursor, overlay dialog
      ripple.tsx    client   per-card WebGL ripple and duotone
      services.tsx           250vh pin, one span per letter
      menu.tsx      client   flowing menu rows
      about.tsx, proof.tsx, footer.tsx   server
      faq.tsx       client   accordion
      reveal.tsx    client   IntersectionObserver for [data-fade]
      scrubs.tsx    client   ScrollTrigger scrub:1 emulation
    example/
      content.ts             KESTREL_VECTOR, every optional piece filled
      project-1.webp .. project-3.webp
app/examples/vector/page.tsx  unlinked, noindex, hand-written token sets
```

| Thing           | Convention                                                                                                                                    | Example                                                   |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Components      | `<Name><Block>`, one per file, named exports; helpers unprefixed                                                                              | `EmberHero`, `HarborCount`, `Stars`                       |
| Content symbols | `<Name>Content`, `<NAME>_SLOTS`, `_COUNTS`, `_CONTRAST_PAIRS`, `<name>Violations`, `<name>CopySchema`, `assemble<Name>`, `<name>FallbackCopy` | `assembleSummit`                                          |
| Example content | `KESTREL_<NAME>`, every optional section filled                                                                                               | `KESTREL_HARBOR`                                          |
| Scoped CSS      | `<name>.css`, rules under `.<name>`, hooks prefixed `<name>-`                                                                                 | `.harbor-glow-a`, `.vector-mask`                          |
| Motion hooks    | `data-rise` (plays on load), `data-fade` plus `data-shown` (plays in view); Vector adds `data-scrub*` and `data-trigger`                      | `ember.css:110-153`                                       |
| Motion tunables | custom properties at the top of the template's CSS, delays through `delay()` or `motion()` in `styles.ts`                                     | `--ember-settle`, `motion(delay, travel, duration, ease)` |
| Landmarks       | root `div#top`, `main#main` for the site's skip link                                                                                          | `index.tsx` in all four                                   |
| Section ids     | the source's own names, sector words included (judged under "Cross-template inconsistencies")                                                 | `#booking-process`, `#why-choose-us`                      |

### The customisation mechanism

Each input, on a visitor's page and on the example route, and what the template itself decides.

- **Colour.**
  - Visitor: `build-concepts.ts:86-94` resolves the hex, the scheme and the union of the three templates' pairs. `deriveTokens` (`lib/tokens/derive.ts:27-79`) builds OKLCH tints and `solvePairs` moves each declared text token to 4.5:1 (`lib/tokens/contrast.ts:39-62`). Stored as `row.tokens`; `tokenStyle` writes `--surface` and the rest on the preview wrapper (`page.tsx:80`, `lib/tokens/css.ts:6-8`), and `@theme inline` maps them to `--color-*` (`app/tokens.css:8-25`).
  - Example: a hand-written default scheme, and `deriveTokens` for the second scheme except on Vector (see the collisions above).
  - Template decides: which tokens to paint, which pairs to declare, and alpha tints, which are never solved.
- **Fonts.**
  - Visitor: `typeStyle` sets `--template-font-display` and `--template-font-body` on the same wrapper (`fonts.ts:35-41`); `app/tokens.css:34-37` maps them to `font-display` and `font-body`, falling back to Mona Sans.
  - Example: next/font imports in the route, or system stacks on Vector.
  - Template decides: which elements take the display face, and weights (from classes).
- **Images.**
  - Visitor: `planImagery` gives slot 0 the brief's hero queries and the rest detail queries (`lib/images/plan.ts:15-47`); Pexels landscape search, model ranking and re-host (`lib/images/stage.ts:119-184`, `rehost.ts:20-35`); stored as `row.imagery[id]`, passed as `assets.images` (`page.tsx:77`); `assemble` places each `SlotImage` or null.
  - Example: the files in `templates/<id>/example/`, cut-outs and hand-picked photos included.
  - Template decides: crop, `sizes`, loading and the placeholder for null.
- **Copy.**
  - Visitor: `copyPrompt(brief, name, GUIDE)` (`lib/ai/copy.ts:33`), structured output against the copy schema, judged by `copyViolations` plus `ruleViolationsIn` (`lib/copy-slots/rules.ts:38-52`). Each step attempt makes up to two calls, the second with the violations fed back (`lib/ai/copy.ts:36-70`); a failing attempt is retried up to `CONFIG.copy.attempts` = 3 (`build-concepts.ts:168-173`, `lib/config.ts:128`), so up to six calls before `fallbackCopy(brief)`, which is never rule-checked. A permanent model error falls back at once (`build-concepts.ts:176-180`). Stored as `row.copy[id]`; `render.tsx:24-49` parses and assembles.
  - Example: `KESTREL_<NAME>` in `example/content.ts`, already assembled.
  - Template decides: slots, ranges, counts, the purpose line per slot and the fallback.
- **Logo.** Visitor: `{ kind: 'image', alt: company }` or `{ kind: 'wordmark' }` (`page.tsx:73-76`); `assemble` sets `brand.logo`. Example: the example content's own. Template decides: size, placement and the wordmark's face (`sections/logo.tsx`).
- **Links.** Code only: `TARGETS`, `HREF` and `NAV_HREFS` in each `contract.ts`; the model picks only enum targets. The template decides every href.
- **Email.** Visitor: the lead's own address (`page.tsx:72`), which becomes a `mailto:`. Example: Kestrel's. The template decides which control carries it.
- **Meta.** The route only: title and `noindex` from `page.tsx:29-41`; description, Open Graph and canonical from `app/layout.tsx:31-45`; share image from `opengraph-image.tsx:21-26`. The template decides only `headlineOf`.

### Animation setup and cleanup

| Part                | Ember                                                            | Harbor                                                               | Summit                                            | Vector                                                                                                                                               |
| ------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Load entrances      | `[data-rise]` keyframes, pure CSS (`ember.css:108-117`)          | same, plus the h1 rows rising inside clipped rows (`hero.tsx:46-72`) | same, plus a hero brighten (`summit.css:117-142`) | same, plus 3D line rises (`vector.css:178-183,262-280`)                                                                                              |
| In-view entrances   | one IntersectionObserver, threshold 0, once (`reveal.tsx:10-28`) | one observer per `data-margin`, once (`reveal.tsx:10-39`)            | one observer, once (`reveal.tsx:10-27`)           | an observer toggling both ways, bottom margin -50% (`reveal.tsx:10-36`); a rAF scrub controller (`scrubs.tsx:94-200`); CSS `view()` fallback         |
| Other client motion | header glass on scroll, dish half-turn counter                   | header, count-up in rAF (`count.tsx:18-66`)                          | header, one-open FAQ                              | header scroll spy, cursor and marquee rAF loops, two WebGL shaders, menu rows                                                                        |
| Cleanup             | unobserve after the first hit, disconnect, listeners removed     | same, plus `cancelAnimationFrame` and the exit timer cleared         | same                                              | listeners removed, rAF cancelled, observers disconnected; GL objects never deleted; no context-loss handling                                         |
| Reduced motion      | keyframes inside `no-preference`; observer never created         | same; marquee stops                                                  | same                                              | controller returns early, but every WebGL context (four on the example) is still created and draws a still frame; the cursor disc stays painted      |
| No JavaScript       | complete: hiding sits under `@media (scripting: enabled)`        | complete                                                             | complete, but FAQ answers are unreachable         | text complete, waves absent, FAQ answers unreachable, no header navigation                                                                           |
| Hydration fails     | 74 blocks stay at opacity 0                                      | 66 blocks stay at opacity 0                                          | 46 of 47 blocks stay at opacity 0                 | the 6 `[data-fade]` project titles and lines stay at opacity 0; scrubbed parts still reveal through the CSS `view()` fallback (`vector.css:294-383`) |

All four read the reduced-motion preference once at mount with `matchMedia(...).matches` (`t05-ember/sections/reveal.tsx:12`, the same line in the other three, and `t08-vector/sections/ripple.tsx:158`), so a change mid-visit is ignored. The site's `useMotionAllowed` subscribes to changes (`lib/motion/use-motion-allowed.ts:9-22`).

The global reduced-motion rule forces `transition-property` to colour and opacity on every element (`app/globals.css:616-634`). Translate and scale transitions in templates become instant for free. Keyframe animations and JavaScript-driven motion are not covered; each template must gate those itself.

**The site's GSAP loader, for reference.** `loadGsap()` and `loadScrollTrigger()` are cached dynamic imports that register the plugin once and set `ignoreMobileResize` (`lib/motion/gsap.ts:12-34`). The leaf `PageChoreography` mounts only when `useMotionAllowed()` is true and arms on `whenScrolled`, never on idle, "so an un-scrolled Lighthouse audit never fetches GSAP" (ADR 0034:119-125). Below 48rem it loads GSAP core only and never fetches ScrollTrigger (`app/_components/page-choreography.tsx:9-10,37-41`; ADR 0034:128). It builds one `gsap.context` and one ungated `gsap.matchMedia` (`app/_components/motion/index.ts:309`); each module adds one of two conditions, entrances on `(prefers-reduced-motion: no-preference)` and scrubs on that plus `(min-width: 48rem)` (`:84-88`). Only when ScrollTrigger is present does it subscribe ScrollTrigger to Lenis and set `lagSmoothing(0)` (`:325-345`). On stop it kills the triggers and reverts both (`:392-406`). Reduced-motion visitors download no GSAP. A template copying this pattern gets the phone split, and a lighter phone payload, for free.

**WebGL in the repo.**

| Concern        | Site ink (`lib/motion/fluid.ts`, `app/_components/ink.tsx`)                        | Vector waves (`waves.tsx`)                 | Vector ripple (`ripple.tsx`)                                                              |
| -------------- | ---------------------------------------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Start          | lazy chunk after `whenIdle`, only if motion is allowed (`ink.tsx:49-86`)           | on mount, at hydration (`:164`)            | on mount (`:143`), before the texture loads                                               |
| DPR            | CSS pixels (`:181-190`)                                                            | clamped 1 to 1.5 (`:201`)                  | CSS pixels (`:203-208`), so soft on retina                                                |
| Resize         | ResizeObserver; re-creates framebuffers without deleting the old ones (`:186-210`) | debounced 150 ms (`:245-249`)              | undebounced (`:359-363`)                                                                  |
| Offscreen      | IntersectionObserver stops rAF (`:332-336`)                                        | IntersectionObserver (`:237-244`)          | IntersectionObserver (`:350-357`)                                                         |
| Hidden tab     | rAF only (`:321`), which browsers do not run in a hidden tab, so it stops          | same (`:232-252`)                          | same (`:346-364`), except the 100 ms reduced-motion poll, which is throttled, not stopped |
| Context loss   | none                                                                               | none                                       | none; a lost context leaves a black card                                                  |
| Teardown       | `WEBGL_lose_context` (`:71,338-345`)                                               | keeps the context on purpose (`:178-179`)  | releases nothing (`:374-381`)                                                             |
| Reduced motion | never starts                                                                       | one still frame (`:216,225-227`)           | one draw, then a 100 ms poll that runs forever if the texture never loads (`:366-373`)    |
| No WebGL       | the CSS gradient stands                                                            | SVG bands (`:277-332`)                     | the `next/image` duotone (`:392-403`)                                                     |
| Colour         | the `--ink` custom property via `getComputedStyle`, hex-checked (`ink.tsx:18-26`)  | tokens via `getComputedStyle` (`:183-192`) | hard-coded violet and pink (`:59`)                                                        |

ADR 0031:109-110 says the ink "stops off screen and in a hidden tab"; for rAF loops that is accurate in effect. Hidden-tab behaviour itself was not measured. `CONFIG.ink` supplies only the simulation tunables (`ink.tsx:59`, `lib/motion/fluid.ts:70`); what the ink lacks is a brand token, not the read-from-CSS pattern.

The model to copy: the ink's lifecycle (lazy, after idle, motion-gated, one stop function that releases the context) with the waves' DPR clamp, debounced resize, token colours and real fallback. Add what none has: `webglcontextlost` handling that falls back to the static state, and `gl.delete*` on re-allocation. An explicit `visibilitychange` pause adds little to a rAF loop but is needed for any timer. A released canvas cannot be reused, so it remounts with a new key. Templates cannot import `fluid.ts` or `idle.ts`, so the helpers are either copied into the template or the boundary widens; record the choice in the same ADR as GSAP.

### Tooling

| Check               | Command                                                                                                                                                                                                                 | Where it runs                                                              |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Types               | `pnpm typecheck` (`next typegen && tsc --noEmit`)                                                                                                                                                                       | pre-push (`lefthook.yml:13-18`), CI `verify`                               |
| Lint                | `pnpm lint` (`eslint .`, `strictTypeChecked` plus `stylisticTypeChecked`)                                                                                                                                               | pre-commit on staged ts/tsx (`lefthook.yml:11`), CI (`ci.yml:37`)          |
| Format              | `pnpm format:check` (Prettier with `prettier-plugin-tailwindcss`, which sorts classes)                                                                                                                                  | pre-commit on staged files (`lefthook.yml:9`), CI                          |
| Hex and palette ban | ESLint `no-restricted-syntax` on string and template literals in `templates/**/*.{ts,tsx}` (`eslint.config.mjs:8-10,74-91,148-158`); a CI grep over the same files that also catches comments and GLSL (`ci.yml:39-46`) | ESLint at pre-commit and in CI; the grep in CI only. Neither checks `.css` |
| Dead code           | `pnpm knip`                                                                                                                                                                                                             | CI only                                                                    |
| Unit tests          | `pnpm test` (`vitest run`); per-template contract tests plus `tests/integration/registry.test.ts`                                                                                                                       | pre-push, CI                                                               |
| Build               | `pnpm build` (also fails on type errors)                                                                                                                                                                                | CI `budget` job                                                            |
| Byte budget         | `pnpm budget` (`scripts/bundle-budget.mjs`)                                                                                                                                                                             | CI `budget` job; `/`, `/start` and `/contact` only                         |
| e2e and axe         | `pnpm e2e` (Playwright; `e2e/a11y*.spec.ts` on site routes and `/examples/hub` only)                                                                                                                                    | CI `e2e`                                                                   |
| Lighthouse          | `lighthouserc.json` through lhci                                                                                                                                                                                        | nowhere; by hand. `docs/audit-plan.md:286` wrongly says CI enforces it     |
| Port comparison     | `pnpm template:compare` (`scripts/template-compare.mjs`)                                                                                                                                                                | by hand                                                                    |

- TypeScript is strict with `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` and `verbatimModuleSyntax` (`tsconfig.json:12-16`).
- The CI grep step is named "Forbid hex/palette/viewport units" (`ci.yml:39`) but checks no viewport units.
- Hooks skip knip, the greps, build, budget and e2e (`docs/shipping-a-change.md:33-48`). Done means the full sequence: `pnpm typecheck && pnpm lint && pnpm format:check && pnpm knip && pnpm test && pnpm build && pnpm budget`, the CI greps, and a hand-run axe and Lighthouse on the example routes.
- ESLint also bans barrels, default exports outside Next conventions, `process.env`, `console`, `!` and empty blocks (`eslint.config.mjs:16-19,117-137,252-276`).

## Design DNA

| Aspect                                                                          | Ember                                                                                                                                                                  | Harbor                                                                                                                                         | Summit                                                                                      | Vector                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Source                                                                          | PrebuiltUI Restro (restaurant)                                                                                                                                         | PrebuiltUI Forged (gym)                                                                                                                        | PrebuiltUI MediCare (hospital)                                                              | React Bits Pro Agency (paid demo)                                                                                                                                                                      |
| Example scheme                                                                  | light                                                                                                                                                                  | dark                                                                                                                                           | light                                                                                       | dark                                                                                                                                                                                                   |
| Container                                                                       | gutters 24/48/96/160 px (`styles.ts:14`), content `max-w-7xl` (1280)                                                                                                   | 1440 max, gutters 32/64/96 (`styles.ts:17`)                                                                                                    | gutters 24/48/64/96 (`styles.ts:17`); six different max widths from 768 to 1440             | 1440, then 1800 from 2xl (`styles.ts:17`); gutters 24/48/96 (`:20`)                                                                                                                                    |
| Breakpoints used                                                                | md, lg, xl for gutters; md for columns; lg once                                                                                                                        | md, xl for gutters; md and lg for columns                                                                                                      | md, lg, xl for gutters; md and lg for columns                                               | sm, lg for gutters; 2xl for the container                                                                                                                                                              |
| Grid                                                                            | flex rows plus three grids: dishes 2 then 4 from md (`dishes.tsx:23`), booking 2 from md (`booking.tsx:16`), testimonials 1, 2, 3 at md and lg (`testimonials.tsx:23`) | 12-column splits at lg; hairline grids (`gap-px` over `bg-border`)                                                                             | 3-column why grid, sticky deck, 7/5 then 5/7 mosaic                                         | alternating project rows, 1/2/4-column bento                                                                                                                                                           |
| Section spacing                                                                 | `mt-44` (176 px) at every width (`about.tsx:15` and seven more)                                                                                                        | `py-30` (120 px top and bottom) at every width (`styles.ts:20`)                                                                                | `mt-36`, `md:mt-44` (144 to 176 px) (`styles.ts:20`)                                        | `py-24`, `lg:py-32`, plus a 250vh pin (`services.tsx:22`)                                                                                                                                              |
| Type scale                                                                      | stepped Tailwind sizes, no `clamp()`                                                                                                                                   | stepped, no `clamp()`                                                                                                                          | stepped, no `clamp()`                                                                       | `clamp()` with vw-only middle terms for display and for the hero lead (`hero.tsx:45`); stepped elsewhere                                                                                               |
| h1                                                                              | 48 to 60 px, leading 1 (`hero.tsx:25`)                                                                                                                                 | 72 px at every width, leading 0.9, weight 900, caps (`hero.tsx:8`)                                                                             | 48 to 60 px, leading 1.25 (`hero.tsx:39`)                                                   | `clamp(3rem, 8vw, 12rem)`, 115 px at 1440 (`hero.tsx:25`)                                                                                                                                              |
| Section h2                                                                      | body face, 400, 36 to 48 px (`styles.ts:29`), except the closing band's: display face, 500, 30 to 40 px (`cta.tsx:44`)                                                 | display, 900, caps, 48 px (`styles.ts:27`); About's 48 then 60 px from md (`about.tsx:68`); the CTA band's 60 px at every width (`cta.tsx:33`) | display, 500, at `/85` alpha (`styles.ts:30`), 48 px (`why.tsx:43`), 36 on some             | body (sans) face, 500, a size per block: 100.8 px services sentence, 48 px About, 36 px proof, 48 px FAQ at 1440 (`services.tsx:26`, `about.tsx:43`, `proof.tsx:69`, `faq.tsx:24`)                     |
| Eyebrow                                                                         | medium, caps, `brand-deeper` (`styles.ts:28`)                                                                                                                          | 12 px, 600, tracking 0.25em, caps, `brand-deeper` (`styles.ts:23`)                                                                             | sentence case at `/75` alpha (`styles.ts:29`)                                               | none                                                                                                                                                                                                   |
| Tracking                                                                        | default, except the footer watermark's `tracking-wide` (`footer.tsx:107`)                                                                                              | h1 -0.025em (-1.8 px at 72), eyebrows 0.25em                                                                                                   | headings `tracking-tight` (`styles.ts:30`)                                                  | headings and pills `tracking-tight`                                                                                                                                                                    |
| Body (measured at 1440)                                                         | 14 px (`index.tsx:45`), line height 1.43 to 1.63                                                                                                                       | 16 px hero lead, 14 px elsewhere, mostly `on-surface` alphas; line height 1.63                                                                 | 16 px hero lead, 14 px elsewhere at 55% alpha; line height 1.43 to 1.71                     | 16 to 28 px: FAQ answers 16 px (`faq.tsx:77`), project lines 20 px (`projects.tsx:440`), hero lead 18, 21.6 and 28 px at 375, 1440, 1920                                                               |
| Measure at 1440 (width over "0")                                                | 36 to 52 ch; FAQ answers 89 ch                                                                                                                                         | 36 to 66 ch                                                                                                                                    | 38 to 52 ch; FAQ answers 85 ch                                                              | 44 to 58 ch; FAQ answers 81 ch                                                                                                                                                                         |
| Pairing on the example                                                          | Urbanist display, Mona Sans body                                                                                                                                       | Space Grotesk display, Inter body                                                                                                              | Urbanist display, Mona Sans body                                                            | system `ui-serif` italic accents, `ui-sans-serif` body                                                                                                                                                 |
| Colour                                                                          | one brand colour in small doses, spent once on a full-bleed closing band                                                                                               | near-black plus one electric brand colour; greys are `on-surface` alphas; glows by `color-mix`                                                 | greyscale from `on-surface` alphas; brand on the buttons only; accent tints alternate cards | monochrome; brand only as light in the WebGL waves; CTAs are inverted `on-surface` pills                                                                                                               |
| Tokens never used (grep of each token's utilities and `var()` under the folder) | accent, brand, glow, glow-secondary, scrim, on-scrim                                                                                                                   | brand, on-surface-muted, glow, glow-secondary, scrim, on-scrim                                                                                 | brand                                                                                       | border, accent, brand-deeper, brand-deepest, on-brand                                                                                                                                                  |
| Radius and shadow                                                               | 24 px photos, full pills, no shadow                                                                                                                                    | full pills, 16 px surfaces, glows as the only shadow                                                                                           | stepped 4 to 24 px, no shadow                                                               | full pills on project and About pictures, buttons, cursor and arrow discs; 16 px bento cards and FAQ rows; header "pills" are 12 then 16 px rectangles (`header.tsx:95,104`) with the only `shadow-lg` |
| Header glass                                                                    | fixed, glass after 10 px (`nav.tsx:14`)                                                                                                                                | fixed, glass after 40 px (`nav.tsx:14`)                                                                                                        | fixed, glass after 10 px (`nav.tsx:14`)                                                     | fixed glass pills at all times                                                                                                                                                                         |
| Client components                                                               | 3                                                                                                                                                                      | 3                                                                                                                                              | 3                                                                                           | 8 (plus the logo, via the header)                                                                                                                                                                      |
| Image slots                                                                     | 12                                                                                                                                                                     | 3                                                                                                                                              | 13                                                                                          | 5                                                                                                                                                                                                      |
| Page height, example, 375 / 1440                                                | 10,694 / 7,320 px                                                                                                                                                      | 18,689 / 9,913 px                                                                                                                              | 14,865 / 10,054 px                                                                          | 10,544 / 10,264 px                                                                                                                                                                                     |

### Motion language

| Motion            | Ember                                                                                                                                                                                        | Harbor                                                                                                                                                                                                                                                            | Summit                                                                                                                                    | Vector                                                                                                                                                                                                                                                                                                                       |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entrance duration | 1.18 s for every travel (`--ember-settle`, `ember.css:20`)                                                                                                                                   | 0.6 s default (`harbor.css:144`), 0.3 to 0.8 s set per block through `motion()`; the menu 250 to 300 ms (`nav.tsx:127,141`); a 2.2 s count-up that runs only on numeric values, so never on a visitor's page (`count.tsx:11-13,31`); a 25 s marquee, example only | 1.18 s settle, 1.48 s soft, 0.36 s quick (`summit.css:21-26`), plus a 0.5 s `ease-out` brighten on the hero and closing band (`:136,177`) | 0.3 to 1.6 s on load; scrubbed parts run on scroll distance, not time; a 1 s scrub chase; 3.5 s wave sweep                                                                                                                                                                                                                   |
| Stagger step      | a 0.2 s wait for a block's second part; 0.05, 0.1 or 0.15 s per list item                                                                                                                    | 0.1 s steps within a block, 0.08 s per list item, 0.15 s per h1 row                                                                                                                                                                                               | a 0.2 s wait for a block's second part; 0.1 or 0.15 s per list item                                                                       | 0.2 s per hero line; 0.05 of the scroll range per letter (`vector.css:352`)                                                                                                                                                                                                                                                  |
| Travel            | 50 px default; 20, 80 and 150 px variants (`ember.css:83,130-144`)                                                                                                                           | 40 px rise, 60 px slide (`harbor.css:113,120`); h1 rows 120 px                                                                                                                                                                                                    | 50 px default; 80, 100 and 150 px (`summit.css:155-169`)                                                                                  | 20 px on load (`vector.css:188`), 60 px in view (`:394`); scrubs set their own                                                                                                                                                                                                                                               |
| Curves            | two sampled springs as 21-stop `linear()`: entrance, fallback `cubic-bezier(0.16, 0.52, 0.08, 1)`; dish turn, underdamped to 1.0079, fallback `(0.32, 0.56, 0.02, 1.08)` (`ember.css:20-76`) | `--harbor-ease` = CSS `ease` (`harbor.css:107`), `ease-out`, and `(0.16, 1, 0.3, 1)` for the h1                                                                                                                                                                   | three sampled springs as `linear()`, fallbacks `(0.16, 0.52, 0.08, 1)`, `(0.16, 0.52, 0.12, 1)`, `(0.22, 0.1, 0.2, 1.1)`; plus `ease-out` | GSAP power2, power3, power2.in, power3.in (the pinned letters, `vector.css:355`) and expo as `linear()`; beziers `(0.22, 1, 0.36, 1)`, `(0.25, 1, 0.5, 1)` for the hero lead, a sine pair for the menu hop, a back curve for the cursor, `(0.165, 0.84, 0.44, 1)` for the wave sweep (`vector.css:25-34,87-134,249-284,416`) |
| GSAP equivalent   | none in core: `CustomEase` from the `linear()` stops                                                                                                                                         | `expo.out` for the h1; `CustomEase` for CSS `ease`                                                                                                                                                                                                                | `CustomEase` from the stops                                                                                                               | direct: `--vector-power3` is GSAP `power3.out` (a quartic), `--vector-power2` is `power2.out`, `--vector-expo` is `expo.out`                                                                                                                                                                                                 |
| Hover and press   | Tailwind's default 150 ms colour; dish half turn 0.98 s on pointer-enter (`dish.tsx:19-21`)                                                                                                  | 200 ms; nav pill scales 1.03 on hover, 0.97 on press (`nav.tsx:104`)                                                                                                                                                                                              | 150 ms default; arrows nudge 4 px (`styles.ts:33`)                                                                                        | 200 ms; header pills scale 1.05 and 0.95 (`header.tsx:95`); pills fade to 0.8                                                                                                                                                                                                                                                |
| Trigger           | load; observer, threshold 0, no margin, once                                                                                                                                                 | load on timed delays; observer per `data-margin` of -80, -50 or -40 px, once                                                                                                                                                                                      | load; observer, once; sticky layout                                                                                                       | load; `view()` timelines from `cover 10vh` to `cover 30vh` by default (`vector.css:294-299`); observer at -50% bottom, both ways; pointer                                                                                                                                                                                    |

### Section patterns across the four

What survives on a visitor's page. "null" means `assemble` drops it. Heights at 375 are estimates, not renders: the example's height less the measured height and gap of each null section (`t05-ember/contract.ts:237`, `t06-harbor/contract.ts:239-242,257`, `t07-summit/contract.ts:282`, `t08-vector/contract.ts:167`).

| Pattern                | Ember                             | Harbor                                                         | Summit                         | Vector                                            |
| ---------------------- | --------------------------------- | -------------------------------------------------------------- | ------------------------------ | ------------------------------------------------- |
| Header with an ask     | from md                           | from md                                                        | from md                        | never                                             |
| Hero                   | yes; proof row null               | yes; stats hold phrases                                        | yes; proof row null            | yes; no ask                                       |
| Offer                  | dishes, features                  | services, about                                                | why, services deck, facilities | services rows                                     |
| Process (steps)        | booking-process                   | none (metrics may hold steps)                                  | booking-process                | none                                              |
| Proof-shaped band      | stats ordinals; testimonials null | metrics phrases; gallery, pricing, testimonials, partners null | articles null                  | projects written from the brief; proof bento null |
| FAQ                    | yes                               | yes, beside the form                                           | yes                            | yes                                               |
| Form                   | none                              | three fields                                                   | six fields                     | none                                              |
| Closing ask            | brand band                        | band after the form                                            | band after the form            | footer                                            |
| Height at 375, visitor | about 8,900 px                    | about 10,700 px                                                | about 13,500 px                | about 8,900 px                                    |

Recommended skeleton for the new two: header with a persistent ask, a text-led hero with its ask, the offer, three steps, a worded proof band (Harbor's pattern, phrases in place of figures), the FAQ beside the contact block, a closing ask, the footer. Figures and testimonials go in optional sections between the offer and the FAQ, filled on the example only.

### Ember

| Section            | Conversion job                                                                          | Ask                                                       |
| ------------------ | --------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| nav                | wayfinding, a persistent ask from md                                                    | pill to `#booking-process`, md and up only (`nav.tsx:64`) |
| hero               | promise and first ask; the proof row exists only on the example (`contract.ts:206`)     | pill to `#booking-process`                                |
| about              | humanise and place the business                                                         | optional location link                                    |
| stats              | three reasons; the 60 px ordinals look like data but are not                            | none                                                      |
| dishes             | the offer at a glance, 4 to 8 cells; prices banned (`contract.ts:141-142`)              | none; cells look clickable (`dish.tsx:18`)                |
| features           | differentiation, with restaurant icons for every brand (`features.tsx:9`)               | none                                                      |
| booking-process    | how to start; the target of every CTA                                                   | none: no button, form or contact (`booking.tsx:12-73`)    |
| timing             | hours card and a second ask; a generic sentence on a visitor's page (`contract.ts:233`) | pill back up to `#booking-process`                        |
| testimonials (opt) | social proof; removed on a visitor's page                                               | none                                                      |
| faq                | objections; the fallback reuses the step bodies (`contract.ts:332-362`)                 | none                                                      |
| cta                | closing ask on a full-bleed brand band                                                  | pill back up to `#booking-process`                        |
| footer             | the only real contact on a visitor's page                                               | `mailto:` (`footer.tsx:56-65`)                            |

**Signature.** A photographic hero bleeding off one edge, one brand colour used only for actions and markers, then spent all at once on a full-bleed closing band with pictures pinned at its corners (`1440-07.png`: the example's cut-out plates; on a visitor's page, circle crops of stock photos, `cta.tsx:37`). Dishes turn half a turn on a spring each time the pointer arrives.

**What it does exceptionally well.** Each point says whether it survives on a visitor's page.

- Spring motion with no library (survives). The source's springs are sampled into 21-stop `linear()` easings with cubic-bezier fallbacks behind `@supports` (`ember.css:15-78`), one 1.18 s duration for every travel, and a 20-line observer for 74 blocks (`reveal.tsx:10-28`).
- Nothing hidden without JavaScript (survives). Blocks hide only under `no-preference` and `scripting: enabled` (`ember.css:108,124-127`); with JavaScript off, 0 of 74 are hidden (measured). Entrances animate only `translate`, `scale` and `opacity`, and `fill-mode: backwards` releases each element so later hovers are never pinned (`ember.css:131`).
- Token-true ornaments (survives). The laurel PNGs are CSS masks over `bg-on-surface` (`ornament.tsx:10-20`), so any brand or scheme recolours them.
- `relative isolate` on the root lets the 300 px footer watermark sit at `-z-1` behind the content without fighting the host page (survives; `index.tsx:45`, `footer.tsx:103-110`).
- Practical facts on a photograph (partly): the hours card over the dining room carries its own button (`1440-04.png`). The card and button survive; the hours rows are example only. For fintech: fees or steps set on a product surface, figures on the example only.
- Round plates as a motif (example only). The plates are the example's cut-out PNGs. The template draws a dish picture as a plain square (`size-30 object-cover`, no rounding, `dishes.tsx:32-39`); only the empty placeholder is round (`:30`). On a visitor's page dish-1 to dish-8 are rectangular stock photos (`contract.ts:397-410`, `lib/images/plan.ts:28-31`), so the grid shows squares, and the half turn on pointer-enter leaves a photo upside down until the pointer enters again (`ember.css:158-160`, `dish.tsx:19-23`).
- A consistent photo grade carrying the colour while the UI stays neutral (example only). The template applies no grade: no filter, blend or duotone in `ember.css` or `sections/*.tsx`. On a visitor's page the effect depends on which Pexels photos the imagery stage picks for its 12 slots (`lib/images/plan.ts:28-43`).

### Harbor

| Section            | Conversion job                                                          | Ask                                                                           |
| ------------------ | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| nav                | a persistent ask from md; the phone overlay carries a CTA               | brand pill to `#contact`                                                      |
| hero               | hook, first ask, a stats row set with phrases on a visitor's page       | primary to `#contact`, secondary to `#about`                                  |
| about              | identity and offer tags; optional badge and quotes                      | none                                                                          |
| services           | what you get, 3 to 6 cards; the third is always lit (`services.tsx:37`) | none; a hover-only "more" line (`services.tsx:66-71`)                         |
| metrics            | proof by numbers in the source; phrases or steps on a visitor's page    | none                                                                          |
| gallery (opt)      | outcome proof                                                           | outlined pill                                                                 |
| pricing (opt)      | price objection and plan choice                                         | plan buttons to `#contact` (`pricing.tsx:84`)                                 |
| testimonials (opt) | social proof                                                            | none                                                                          |
| partners (opt)     | authority                                                               | none                                                                          |
| contact            | FAQ beside the form: objections next to the conversion point            | form: `mailto:` POST, or GET to `#cta` without an email (`contact.tsx:75-81`) |
| cta                | final ask, placed after the form                                        | both buttons back up (`contract.ts:249-255`)                                  |
| blog (opt)         | expertise                                                               | a link; the cards are not links                                               |
| footer             | wayfinding and a newsletter                                             | newsletter `mailto:`                                                          |

**Signature.** Near-black with one electric accent. Every heading lights one phrase in the accent under a tiny tracked eyebrow. The h1 rows rise inside clipped rows. Hairline grids, and a featured plan filled solid with the accent and glowing (`1440-05.png`).

**What it does exceptionally well.**

- The desktop hero holds the whole stack in one viewport (survives): badge, three-line headline, subhead, primary and secondary CTA, then a proof row over a hairline (`1440-00.png`). The order is right; the fixed sizes are not.
- The clipped-row headline rise (survives): each row is `overflow-hidden` and its span rises 120 px on `cubic-bezier(0.16, 1, 0.3, 1)` over 0.8 s at 0.15 s steps (`hero.tsx:46-72`). A mask reveal with transform and opacity only, no JavaScript.
- One motion helper (survives), `motion(delay, travel, duration, ease)`, writes custom properties, so every stagger is data (`styles.ts:36-47`). Entrances use `translate` and `scale` while the hover lift uses `transform`, so they compose (`harbor.css:48-56,110-135`).
- Hairline grids (survives): `gap-px` over `bg-border` inside one rounded, clipped frame gives crisp dividers with no border arithmetic (`services.tsx:35`, `metrics.tsx:38`).
- Strict tokens (survives): no hex in any `.ts` or `.tsx` under the folder. One hex survives in a CSS comment (`harbor.css:43`, `#1a2000`), which no check scans and which does not render. Greys are alphas of `on-surface`; every glow is `color-mix` on `brand-deeper`, so it recolours per brand (`harbor.css:18-46`).
- A filled, glowing featured plan (example only, since pricing is null on a visitor's page; `1440-05.png`, `375-11.png`). Use a filled featured card for the one decision a page wants to steer.
- FAQ beside the form, as native `<details>` that work without JavaScript (survives; `contact.tsx:44-61`, `1440-08.png`).
- The phone menu (survives): a full-screen sheet with large tracked capitals and one accent CTA (`375-menu.png`).

### Summit

| Section          | Conversion job                                                                       | Ask                                                                        |
| ---------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| nav              | a persistent ask from md                                                             | button to `#booking-process`, the steps, not the form (`contract.ts:244`)  |
| hero             | promise and first ask; the proof row is null on a visitor's page (`contract.ts:252`) | primary to `#booking-process`, secondary to `#our-services`                |
| why-choose-us    | four reasons around a portrait                                                       | none                                                                       |
| our-services     | 3 to 6 offers with checklists, as a sticky deck                                      | none                                                                       |
| booking-process  | how it works; where both primary CTAs land                                           | none                                                                       |
| facilities       | four more benefits with hover captions from md                                       | four "Explore" links to `#book-appointment`, invisible until hover from md |
| faq              | objections                                                                           | none                                                                       |
| articles (opt)   | authority                                                                            | a link                                                                     |
| book-appointment | the only form: six fields, including a person to see and a date                      | `mailto:` POST, or GET to `#cta` without an email                          |
| cta              | closing ask                                                                          | back up to the form directly above (`contract.ts:303`)                     |
| footer           | contact                                                                              | `mailto:`                                                                  |

**Signature.** High-key and airy. A hero photograph pre-faded to white on the text side (the example's), a sticky stacking deck of service cards whose tabs pile up like index cards, dashed-ring icons on a hairline timeline, and the brand name as an outline watermark in the footer.

**What it does exceptionally well.**

- The sticky deck turns a long service list into a progression with zero JavaScript (survives): `position: sticky` at 96 px plus 40 px per card, alternating tints (`services.tsx:32-33`, `1440-04.png`). The root clips nothing on purpose so it works (`index.tsx:19-24`).
- A pre-faded hero photo (example only): the headline sits on clean ground with no scrim and no contrast risk at 1024 and above (`1440-00.png`). Stock photos are never pre-faded.
- One action colour used only for action (survives): every dark rectangle is a Book button, and the label never changes (`1440-01.png` to `1440-11.png`).
- The most careful motion of the four (survives): three springs sampled to `linear()` with settle-time durations, a 0.5 s `ease-out` brighten, and per-block travel set on the block so nested parts do not inherit it (`summit.css:16-101,136,154-177`).
- The cleanest accessibility plumbing (survives): the menu is `inert` only while narrow and closed, via `matchMedia` (`nav.tsx:40-61`); the FAQ has `aria-expanded` and `aria-controls` with inert closed panels (`faq.tsx:45-46,63`); one h1, then h2 per block, then h3.
- Small craft (survives): the steps' hairline is masked by `ring-6 ring-surface` around each icon so it reads as passing behind (`steps.tsx:44,49`); the watermark is a text stroke from the `border` token (`summit.css:203-206`). The CTA cut-out sits flush on the band's bottom edge, cropped by `overflow-hidden` rather than breaking it (`cta.tsx:18,53`, `1440-10.png`), and exists only on the example: the pipeline supplies landscape photos (`lib/images/pexels.ts:23`).

### Vector

| Section        | Conversion job                                                           | Ask                                                                                                                  |
| -------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| header         | orientation; the menu pill names the current section                     | none; "Contact" sits inside the collapsed menu                                                                       |
| hero           | positioning over WebGL waves                                             | none: only the word "Scroll" (`hero.tsx:12-61`)                                                                      |
| projects       | proof of craft through a portfolio the brief cannot supply               | none; the overlay shows a photo and a title only (`projects.tsx:236-317`)                                            |
| services       | a value sentence grown letter by letter, then 3 to 6 rows                | every row to `#contact` (`index.tsx:42`)                                                                             |
| about          | identity and the first button, 58% down the page on a phone, 71% at 1440 | to `#contact`                                                                                                        |
| proof (opt)    | social proof bento                                                       | to `#contact` from sm up only (`proof.tsx:72`), plus four links named only "Open" to `#projects` (`:14,112,128,162`) |
| faq            | objections                                                               | none                                                                                                                 |
| footer#contact | close: the address set huge and one button                               | `mailto:`, or `#top` when there is no email (`contract.ts:171`)                                                      |

**Signature.** Brand colour as light: three WebGL bands in the glow, second glow and brand tokens, under scanlines, turning with scroll. One typographic turn, sans for the set-up and serif italic for the payoff, on the hero's last line, the marquee and every project title. Round pills on pictures and buttons, 12 to 16 px rectangles elsewhere, and a footer that sits under the page like a curtain.

**What it does exceptionally well.**

- GSAP's curves without GSAP (survives): power curves reproduced as sampled `linear()` easings with cubic-bezier fallbacks (`vector.css:21-162`), and a 200-line controller reproducing ScrollTrigger's `scrub: 1` whose rAF runs only while something settles (`scrubs.tsx:124,149-184`).
- The pinned sentence is pure CSS (survives): a sticky inner inside a 250vh block, each letter's `animation-range` computed from its index and the count (`vector.css:346-359`), whole words kept together (`services.tsx:28-44`). It has an accessibility defect (see "Accessibility").
- The waves pick additive blending on a dark surface and multiply on a light one from the surface's luminance (survives; `waves.tsx:119-123`), so one element carries the brand on either scheme. About 10 kB of client code over the other templates (169,649 B against about 160,000 B, Lighthouse transfer).
- The directional menu hover (survives): nearest-edge detection, an instant set, a forced reflow, then a transition, with the letter-split copy in an `aria-hidden` face (`menu.tsx:11-45,63-97`).
- A token duotone for stock photos (survives, not yet reviewed visually). The screenshots (`1440-01.png` to `1440-03.png`) show the shader's hard-coded violet-to-pink duotone, which replaces the CSS version once the texture loads and ignores the tokens (`ripple.tsx:56-64,341-344,392`). What a visitor gets is the CSS duotone from `--glow`, `--glow-secondary` and `--surface` (`vector.css:464-470`), because the shader fails on Blob pictures (see "Performance"). Only the CSS version transfers.
- Scale contrast: about 100 to 154 px display against 16 to 28 px body (survives; `1920-00.png`).

## Weaknesses

### Cross-template inconsistencies

Each row commits to one answer.

| Convention        | Ember                                           | Harbor                                      | Summit                                         | Vector                                    | Follow, and why                                                                                                                                                                                                                                                                                                 |
| ----------------- | ----------------------------------------------- | ------------------------------------------- | ---------------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Type scale        | stepped                                         | stepped, fixed 72 px h1                     | stepped                                        | `clamp()`, vw-only middle term            | Neither. `clamp(min, rem + vw, max)` or the site's `text-display` family (`app/tokens.css:52-82`): fluid, and it still grows at 200% zoom (WCAG 1.4.4).                                                                                                                                                         |
| Section rhythm    | `mt-44`, no phone step                          | `py-30`, no phone step                      | `mt-36` to `md:mt-44`                          | `py-24` to `lg:py-32`                     | Padding on each band, as Vector does, so bands own their space: `clamp(4rem, 3rem + 5vw, 8rem)`, 67 px at 375 and 120 px at 1440. Harbor's fixed `py-30` adds 1,920 px to the example's phone page.                                                                                                             |
| Container         | one recipe                                      | one recipe                                  | six max widths, six left edges (`1920-08.png`) | header and content gutters differ         | One recipe for header, sections and footer: 1440 px max (Harbor's and Vector's), gutters `clamp(1.5rem, 1rem + 3vw, 6rem)`. Vector's 1800 px step helps only 1920 and up.                                                                                                                                       |
| Easing tunables   | sampled spring `linear()`, `@supports` fallback | named cubic-beziers                         | sampled springs, `@supports` fallback          | sampled GSAP curves, `@supports` fallback | Ember and Summit: named custom properties at the top of the CSS, `linear()` with a bezier fallback, used everywhere. Vector declares the curves but bypasses them with inline copies (`header.tsx:119,126,140`, `vector.css:284`).                                                                              |
| Duration scale    | 1.18 s                                          | 0.6 s default, 0.3 to 0.8 s                 | 0.36, 1.18 and 1.48 s                          | 0.3 to 1.6 s                              | Summit's three named speeds (quick, settle, soft) as custom properties: they cover hover, entrance and long travel with one curve family.                                                                                                                                                                       |
| Motion helper API | `delay()`                                       | `motion(delay, travel, duration, ease)`     | `delay()`                                      | `delay()` plus data attributes            | Harbor's: every parameter the sources vary per block becomes data, so no variant needs its own attribute selector.                                                                                                                                                                                              |
| Reveal trigger    | observer, once                                  | observer per margin, once                   | observer, once                                 | observer both ways, plus scrub            | Once, threshold 0, no negative margin (Harbor's -80 px margin left a focused link at opacity 0). Hide nothing until the client code marks the root as armed, as ADR 0005:12 does for the site; a JavaScript timeout never runs when its own chunk fails.                                                        |
| Reduced motion    | read once                                       | read once                                   | read once                                      | read once                                 | CSS media queries for CSS motion; for JavaScript motion, a subscription shaped like `useMotionAllowed` (`lib/motion/use-motion-allowed.ts:9-22`).                                                                                                                                                               |
| Header            | fixed, glass at 10 px                           | fixed, glass at 40 px                       | fixed, glass at 10 px                          | fixed pills                               | Sticky in normal flow, with no overflow-hidden ancestor (`overflow-x-clip` on the root), glass once content passes under it. Fixed at `top: 56px` fails: the StudioBar scrolls away and the example routes have no bar. Harbor's `overflow-x-hidden` root (`index.tsx:41`) would stop a sticky header sticking. |
| Phone header CTA  | none (`nav.tsx:64`)                             | none in the bar; CTA in the overlay         | none (`nav.tsx:111`)                           | none                                      | A CTA in the phone bar. None of the four has one.                                                                                                                                                                                                                                                               |
| Phone menu        | full-screen sheet, focus stays on toggle        | full-screen, focus moved in                 | full-screen, sheet before toggle in DOM        | dropdown named after the section          | Harbor's focus-in, plus dialog semantics, an inert and scroll-locked page (including Lenis) and focus returned to the toggle. All four drop focus to `<body>`.                                                                                                                                                  |
| FAQ               | native `<details>`                              | native `<details>`                          | React state, one open                          | React state, several open                 | Native `<details>`: answers are in the HTML and work without JavaScript. Summit's and Vector's are unreachable without it.                                                                                                                                                                                      |
| Hero image        | raw CSS background (`hero.tsx:14-19`)           | `next/image`, lazy (`hero.tsx:24-30`)       | raw CSS background (`hero.tsx:16-17`)          | none                                      | A text LCP. A hero picture uses `next/image` with `loading="eager"`, `fetchPriority="high"` and a true `sizes`; `preload` only when it is the LCP at every width (Next 16's own advice, `image.md:283-289`). Never a CSS URL.                                                                                   |
| Text over photos  | no scrim                                        | 40% photo under a gradient from `surface`   | no scrim; example photo pre-faded              | text on the waves' bright cores           | The `scrim` and `on-scrim` pair built for this (`lib/tokens/types.ts:10`), declared, at an opacity tested to 4.5:1 over a pure white patch. Harbor's gradient only where the text sits wholly on its opaque part.                                                                                               |
| Secondary text    | mostly `on-surface-muted`; alphas in 8 places   | alphas /70 to /30                           | alphas /85 to /37                              | alphas /80 to /60                         | Declared pairs only (`on-surface-muted`), which the solver guarantees. No alpha text. Ember already mostly does this (13 uses of `text-on-surface-muted`; `copy-slots.ts:178-179`).                                                                                                                             |
| Focus style       | browser default                                 | default; inputs strip the outline           | default; inputs strip the outline              | default, clipped by `overflow-hidden`     | An explicit `focus-visible` ring at 3:1 on every control. None of the four defines one.                                                                                                                                                                                                                         |
| Contact route     | footer mailto                                   | three-field mailto form                     | six-field mailto form                          | mailto only                               | Harbor's placement, a short block beside the FAQ, not its mechanism: on a visitor's page there is no phone number, the mailto goes to the lead, and without an email the form GETs the fields into the URL. The mechanism is decision 5.                                                                        |
| Icons             | hard-coded restaurant set                       | hard-coded gym set                          | hard-coded medical set                         | none                                      | Vector: no sector icons. If icons are wanted, the model picks from a neutral enum.                                                                                                                                                                                                                              |
| Section ids       | `#booking-process`                              | `#contact`, `#about`                        | `#why-choose-us`, `#book-appointment`          | `#projects`, `#contact`                   | Neutral ids (`#services`, `#process`, `#faq`, `#contact`), as Harbor and Vector have: Ember's and Summit's sector words leak into every URL and nav target.                                                                                                                                                     |
| Radius scale      | 24 px and full                                  | 16 px and full                              | stepped 4 to 24 px                             | 12, 16 px and full                        | Two radii plus the pill, as custom properties. Fewer values are easier to keep consistent across ten sections.                                                                                                                                                                                                  |
| Null image        | `surface-muted` box at the picture's size       | `accent` fill                               | not checked                                    | not checked                               | Keep the box at its aspect ratio in a declared tint, as Ember and Harbor do; never collapse the layout.                                                                                                                                                                                                         |
| Client components | 3                                               | 3                                           | 3                                              | 8                                         | At most three client leaves plus the one WebGL leaf: each adds hydration work and a failure point, and Vector's eight cost about 10 kB.                                                                                                                                                                         |
| Wordmark face     | display                                         | display                                     | body (`logo.tsx:22`)                           | body                                      | Display, as `lib/copy-slots/assets.ts:16` states.                                                                                                                                                                                                                                                               |
| Anchor offset     | `scroll-mt-30` plus the site's 4rem = 184 px    | none: the site's 64 px against an 80 px bar | `scroll-mt-30`, 184 px                         | `scroll-mt-25`, 164 px                    | `scroll-margin-top` = the header's height minus 4rem, per breakpoint. The target's margin and the root's `scroll-padding-top` (`app/globals.css:371-373`) add, in Lenis (`node_modules/lenis/dist/lenis.mjs:783-786`) and in native jumps, and all four headers are taller than 64 px.                          |

### Accessibility

- **The skip link is invisible on every template page (high, all eight).** It is first in the tab order but stays 1x1 and clipped when focused, measured on the four and on `/examples/aurora`. `templates/tailwind.css:21` imports `tailwindcss/utilities.css` without `layer(utilities)`, so the template sheet emits an unlayered `.sr-only` that beats the site's layered `focus:not-sr-only`. Any site utility a template class shadows has the same problem.
- **Alpha text fails AA, and the solver cannot see it (high: Ember, Harbor, Summit).** `solvePairs` moves declared pairs only (`lib/tokens/contrast.ts:39-62`); no template declares an alpha. Figures are computed unless they say axe.
  - Ember `on-surface/55` (FAQ answers, legal line, footer-link hover, `faq.tsx:26,34`, `footer.tsx:85`, `styles.ts:32`): 3.94 to 4.02:1 on derived light sets. `/37` (the closed-day row, null on a visitor's page): 3.13 to 3.19:1 on derived dark sets.
  - Harbor `/40` 3.80:1 and `/30` 2.60:1 on the example's dark set. On derived light sets `/40` is 2.53 to 2.56:1, `/30` 1.92 to 1.96:1 and `/50` 3.37 to 3.42:1; on derived dark sets `/40` is 3.48 to 3.54:1 and `/30` 2.44 to 2.54:1. Only `/60` passes on light (4.63 to 4.73:1). `/40` is Harbor's most-used alpha, 15 uses: form labels (`contact.tsx:10`), placeholders, captions, the legal line, blog meta. axe: 32 nodes at 375 and 38 at 1440 on the hand-set dark set; `?scheme=dark` renders the same set (`harbor/page.tsx:42,61`), so axe never saw a second Harbor scheme.
  - Summit `/55` 3.81 to 4.02:1 on every derived light set (body copy); `/37` 2.29 to 2.35:1 (form values, legal line, `booking.tsx:8,152`). axe: 8 nodes, on the hand-set light and derived dark sets. The example's pure black `on-surface` hides the `/55` failure.
  - Vector: inactive menu links (`on-scrim/60` on `scrim/70`) about 3.6:1 over a light surface (`header.tsx:104,148`).
  - Ember's axe count (15 at 375, 16 at 1440) comes mostly from its hand-set palette: white on `#fe6e00` at 2.82:1. The derived dark set leaves one node, the `/37` closed-day row (#67605d on #120c09, 3.14:1), and turns the hero h1 near-white on the light marble photo, which axe cannot score (seen in an audit capture, not saved to `.compare`). A derived light set was not run through axe; its `/55` lines compute below 4.5:1, which the hand-set black hides (black `/55` on white is 4.74:1).
- **Text on arbitrary photographs with no scrim (high: Ember, Summit, Vector).** Ember's headline, logo and nav sit on the photo; a dark scheme puts a near-white h1 on light marble and it disappears (`hero.tsx:17-35`, `meta.ts:9`). Summit's hero is the same (`hero.tsx:16-24`). Summit's facility caption declares `on-scrim` on solid `scrim` but paints white over `scrim/30`, about 2.1:1 in the worst case (`facilities.tsx:44-46`). Vector's full-screen project overlay sets its 32 to 96 px `on-scrim` title over the photograph under only `bg-scrim/40` (`projects.tsx:276,281`): over a white patch that computes to 2.76 to 2.84:1 across the 17-hex corpus in both schemes, below the 3:1 large text needs. Vector also sets white text on the waves' near-white cores, which the token rule forbids (`lib/tokens/types.ts:9`). axe cannot score text on images.
- **A heading spelled out letter by letter (high: Vector).** The pinned services h2 wraps every character in its own inline-block span with no text alternative (`services.tsx:24-44`), so screen readers can read it letter by letter (not tested with one). The pattern to follow: the whole sentence in an `sr-only` span, the letters `aria-hidden`.
- **Menus are not dialogs, and focus is lost (medium, all four).** No menu returns focus to its toggle: Escape or Close drops focus to `<body>`. The full-screen sheets (Ember, Harbor, Summit) let Tab reach content hidden under them (WCAG 2.4.11). Summit's sheet comes before its toggle in the DOM, so the first Tab after opening lands behind the sheet (`nav.tsx:77,122`). Vector's toggle is named after the current section ("Home"), never "Menu" (`header.tsx:106-116`).
- **Focused controls that cannot be seen (medium).** Summit's four "Explore Now" links stay at opacity 0 from md, with no `focus-within` reveal, and focusing one scrolls the cell blank (`facilities.tsx:44`). On the example, Harbor's "Explore all insights" stays at opacity 0 when focused, because its -80 px reveal margin does not fire at the viewport foot (`blog.tsx:29-36`); the blog is null on a visitor's page, but the same margin wraps visitor blocks such as the CTA band's buttons (`cta.tsx:29-40`, `contact.tsx:28-31,66`), which the audit saw only as transient fades. Vector's 15 footer stops at 1440 are focused behind `#faq`, because the sticky footer is covered (`footer.tsx:26`); its menu rows and FAQ questions clip the focus ring (`menu.tsx:49`, `faq.tsx:51`). Harbor and Summit replace the input outline with a faint border (`t06-harbor/sections/contact.tsx:9`, `t07-summit/styles.ts:40-41`).
- **Touch targets under 44 px at 375 (medium; the brief's rule).** Ember 15, Harbor 22, Summit 26, Vector 14, not counting the site's skip link: mostly footer links 17 to 21 px tall and 30 to 36 px social icons. axe's 2.5.8 check passes on the spacing exception; the brief's 44 px does not.
- **Motion (medium).** On the example, Harbor's partners marquee loops forever with no pause control (WCAG 2.2.2) and snaps back, because `-50%` resolves against the viewport-wide box (`partners.tsx:27`, `harbor.css:86-99`). Partners is null on a visitor's page (`contract.ts:242`), so neither ships; it is a pattern not to copy. Vector under reduced motion paints its 80 px "Open" cursor at the top-left corner, because its hidden state lives inside `no-preference` (`vector.css:409-422`, `vector/375-reduced-00.png`).
- **Headings and names (medium).** Vector jumps from h1 to h3, puts its h3s inside `role="button"`, and jumps h2 to h4 in the footer (`projects.tsx:390-392`, `footer.tsx:58`); Lighthouse flags `heading-order` and `label-content-name-mismatch`. Four Vector links are named only "Open" (`proof.tsx:14`), which puts WCAG 2.4.4 at risk. Once WebGL takes over a project picture, its `<Image>` and alt text unmount and the canvas is `aria-hidden` (`ripple.tsx:341-344,386-392`), so on the example the three project pictures have no text alternative. Harbor's footer uses h4 after h2 (`footer.tsx:80`). Ember's timing h3 has no h2 of its own (`timing.tsx:23`). Harbor's 22vw footer watermark is already `aria-hidden` (`footer.tsx:25-28`); axe flags it at 1.04:1 because it scores rendered text regardless, and it needs no fix.
- **Forms (medium).** No `autocomplete` on Harbor's name, email and newsletter inputs or on Summit's name, email and phone (WCAG 1.3.5). Summit requires nothing. Without an email, both forms GET to `#cta`, which writes what was typed into the URL: name, email and message in Harbor (`contact.tsx:75-122`, no phone field), every field, phone included, in Summit.
- **Zoom (medium).** Vector's display sizes use vw-only middle terms (`hero.tsx:25`, `services.tsx:26`, `menu.tsx:67`), as do the hero lead (`hero.tsx:45`), About (`about.tsx:43`), the marquee (`projects.tsx:219`) and the project titles (`projects.tsx:431`). The site's own type scale avoids this (`app/tokens.css:52-54` describes the site tokens; it is not a rule on templates). At 200% zoom on a 1440 screen, `8vw` of a 720 px CSS viewport is still 115 device px, so the h1 does not grow.

### Performance

Measured on the local production build. Lighthouse mobile, simulated throttling, median of three runs, unless the row says otherwise. Lighthouse rows are transfer sizes as served; the gzip rows are gzip -9 of the built files. The two script measures differ by about 28 kB; the cause was not isolated. The budget uses the transfer measure.

| Measure (repo budget)                     | Ember               | Harbor                  | Summit             | Vector                   |
| ----------------------------------------- | ------------------- | ----------------------- | ------------------ | ------------------------ |
| Performance (at least 0.95)               | 0.75                | no score (NO_LCP)       | 0.79               | no score (NO_LCP)        |
| Performance, devtools-throttled           | 0.81                | 0.84                    | 0.94               | no score (NO_LCP)        |
| Accessibility (1)                         | 0.96                | 0.96                    | 0.96               | 0.98                     |
| Best practices (1)                        | 0.96                | 0.96                    | 0.96               | 0.96                     |
| LCP, simulated (at most 2,000 ms)         | 14,700 ms (hero h1) | none                    | 5,410 ms (hero h1) | none                     |
| LCP, devtools-throttled                   | 3,170 ms (h1)       | 3,190 ms (an h1 row)    | 2,060 ms (h1)      | none; cause not isolated |
| CLS (at most 0.02)                        | 0                   | 0                       | 0                  | 0                        |
| TBT simulated / devtools (at most 150 ms) | 69 / 126 ms         | not computable / 276 ms | 74 / 122 ms        | not computable / 445 ms  |
| FCP                                       | 1.21 s              | 1.81 s                  | 1.66 s             | 1.21 s                   |
| Total transfer (at most 600 kB)           | 2,953 kB            | 426 kB                  | 838 kB             | 506 kB                   |
| Images (at most 500 kB)                   | 2,650 kB            | 66 kB                   | 531 kB             | 226 kB                   |
| Script transfer (at most 230 kB)          | 159 kB              | 160 kB                  | 160 kB             | 170 kB                   |
| Fonts                                     | 84 kB               | 128 kB                  | 84 kB              | 56 kB                    |
| Third-party requests (at most 4)          | 0                   | 0                       | 0                  | 0                        |
| First-load JS, gzip -9, initial tags      | 188,129 B           | 188,744 B               | 188,819 B          | 197,845 B                |
| CSS, gzip                                 | 32,162 B            | 33,100 B                | 32,432 B           | 33,528 B                 |
| axe `color-contrast` nodes, 375 / 1440    | 15 / 16             | 32 / 38                 | 8 / 8              | 0 persistent             |
| Horizontal overflow, five widths          | none                | none                    | none               | none                     |

- Colour contrast is the only axe rule that fails, in all four; the counts are its nodes. Best practices loses 0.04 on every page to two local 404s for `/_vercel/*/script.js` (`app/_components/telemetry.tsx`), which resolve only on Vercel. SEO 0.69 is the intentional `noindex`. Neither is the templates' fault; the rest is.
- **Entrances from opacity 0 break LCP (high, all four).** Every hero part starts at opacity 0 with `fill-mode: both`. Harbor and Vector report NO_LCP in all simulated runs, so Lighthouse CI cannot score them at all. Ember's and Summit's simulated LCP (14.7 s, 5.4 s), against about 0.3 s observed unthrottled, comes from Lantern charging the h1 with the raw PNG backgrounds that start first.
- **Raw CSS backgrounds (high: Ember, Summit).** Ember's hero and timing photos and Summit's hero are inline `background-image` URLs (`ember/sections/hero.tsx:14-19`, `timing.tsx:12-19`, `summit/sections/hero.tsx:16-17`): no srcset, no preload, not discoverable. Ember's example ships a 1.88 MB hero PNG and loads a 546 kB timing photo that sits 3,000 px below the fold. On a visitor's page a phone downloads the full 1920 px WebP.
- **Wrong priorities (medium).** Harbor's full-bleed hero picture is lazy with no `fetchpriority` (`hero.tsx:24-30`), so it arrives late. It is not the LCP: it fills a `min-h-screen` section edge to edge (`:20,22,27`), Chromium's LCP skips images that cover the whole viewport as backgrounds, and the one run that registered an LCP named the headline. Harbor's LCP problem is the opacity-0 headline. Summit's closing picture uses the deprecated `priority` inside a `hidden lg:block` wrapper, so every phone preloads an 87 kB image it never shows (`cta.tsx:53,60`).
- **Vector's GPU and main thread (high).** One WebGL context for the waves plus one per project picture: 4 on the example, 3 to 5 on a visitor's page (`copy-slots.ts:134` allows 2 to 4 projects; the fallback writes three, `contract.ts:237`). Each ripple creates its context before the texture loads, so it creates one even when the texture then fails (`ripple.tsx:146-153,169-181`). All use `powerPreference: 'high-performance'` (`waves.tsx:170`, `ripple.tsx:151`); card shaders redraw every frame while visible even when idle; the cursor and marquee rAF loops run for the page's life with no offscreen pause (`projects.tsx:112-134,186-206`); the cursor writes `left` and `top` every frame; every letter of the pinned sentence has `will-change: transform` (`vector.css:354`). Max potential FID 590 ms, main thread 3.2 s, bootup 1.6 s (SwiftShader).
- **Vector's shader never renders on a visitor's page (high).** Blob pictures are cross-origin and the texture `Image` has no `crossOrigin`, so `texImage2D` throws a SecurityError that is swallowed (`ripple.tsx:169-181`, reproduced). The canvas keeps redrawing invisibly, and every project picture downloads twice: the optimised copy for the fallback and the raw original for the texture (78 kB of WebP plus 141 kB of originals for the example's three).
- **Shared costs (medium).** Every preview route links all eight templates' stylesheets (`templates/render.tsx:3-18`). Every template route preloads Mona Sans (39.8 kB) and Instrument Serif italic (15.7 kB); none of the four uses the serif, and Vector uses neither (`app/layout.tsx:12-27`). Lenis runs a 60 Hz rAF loop on every template page when motion is allowed (`app/layout.tsx:61`).

### Conversion

A template on `/preview` converts at two levels. It must look like a site that would convert for the prospect's own business, and nothing in it may cover the StudioBar's "Book a call", which is the studio's real conversion, or come before it in the tab order. Gate 13 holds both.

| First impression and ask                 | Ember                                   | Harbor                                                                  | Summit                                                                                    | Vector                                                      |
| ---------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| CTA in the first viewport at 375         | yes                                     | yes, but the headline clips and both buttons wrap (`harbor/375-00.png`) | yes                                                                                       | no                                                          |
| CTA in the phone header                  | no                                      | no                                                                      | no                                                                                        | no                                                          |
| Proof above the fold on a visitor's page | none                                    | a stats row holding phrases                                             | none                                                                                      | none                                                        |
| Where the primary CTA lands              | `#booking-process`, which has no action | `#contact`, the form                                                    | `#booking-process`, steps; the form is about 3,200 px further at 1440 and 4,900 px at 375 | `#contact`, the sticky footer, which the jump never reveals |
| Contact route                            | footer mailto                           | mailto form                                                             | six-field mailto form                                                                     | mailto, or `#top` without an email                          |

- **Asks that dead-end or loop (high).** Ember's four CTAs all land on three steps with no button, form or contact (`t05-ember/contract.ts:198,204,235,242`, `t05-ember/sections/booking.tsx:12-73`); the two lower ones scroll the reader back up. Summit's primary CTAs land on the steps, not the form (`t07-summit/contract.ts:244,250`). Harbor's closing band sits after the form and both its buttons point back up (`t06-harbor/index.tsx:53-54`). Vector's `#contact` is the `lg:sticky` footer (`t08-vector/sections/footer.tsx:24-27`), so a link to it moves the page by the viewport height minus the footer's 869 px minus the 164 px offset: up 133 px at 1440x900, up 313 px at 1280x720, and down about 47 px on a 1080 px-tall screen. In every case the footer stays under `main`, so the jump never reveals it. At 1280x720 and 1366x657 the footer is taller than the viewport, so its address and button are never reachable and sit under the header's hit box.
- **No figures on a visitor's page (high, all four).** Every figure-bearing slot is null in `assemble` (`t05-ember/contract.ts:206,227,237`, `t06-harbor/contract.ts:236-242,257,267`, `t07-summit/contract.ts:252,282`, `t08-vector/contract.ts:167`). What remains is proof-shaped: Ember's 60 px ordinals; Harbor's hero "stats", short phrases set large where figures would go (the model writes phrases such as "Open late", `t06-harbor/contract.ts:141-142`; "Listen / Agree / Deliver" is the fallback only, `:340-344`); Vector's numbered "work" cards filled with "What / we do" on fallback (`t08-vector/contract.ts:204-209`).
- **No persistent phone ask (high, all four).** Ember's next Book button after the hero is about 6,690 px down, and its menu sheet holds links only (`ember/375-menu.png`). Summit's form section starts at about 12,440 px and the form at about 12,640 px of 14,865 at 375 (measured).
- **Vector asks late (high).** No button or phone above the fold; the first ask is 58% down on a phone and 71% at 1440, after a 250vh pinned sentence that shows a black screen and half-grown letters (`vector/1440-04.png`, `vector/375-05.png`).
- **Sector lock (high).** Chef's hats, dumbbells, ambulances, a "who to see" booking field and a portfolio, shown to any business the seeded shuffle picks.
- **The fixed headers cover PinnaclePX's own StudioBar (high).** All four are `position: fixed; top: 0` while the StudioBar sits in flow above the template (`app/preview/[slug]/[templateId]/page.tsx:57`). A reproduction on the example routes put Ember's, Harbor's and Summit's header over both studio links at scroll 0; Vector shares the pattern. Simulated, not observed on a live preview. It would hide the studio's highest-value link, "Book a call".
- **Forms mail the lead themselves (high).** On a preview, `assets.email` is the submitter's own address (`page.tsx:72`), so a prospect testing the form opens their own mail client. mailto forms give no confirmation and fail silently without a mail client.
- **The fallback reads broken (medium).** Ember's pads "About Kestrel" with a filler sentence and repeats the same three sentences in features, steps and FAQ (`contract.ts:314-362`, confirmed by running it). The fallback runs after three failed step attempts (up to six model calls), on a permanent model error, or when the deadline sweeper settles the stage.
- **Phone pages are long (medium).** Harbor is 18,689 px at 375 on the example (23 screens), but five optional sections worth about 8,075 px drop on a visitor's page, which is about 10,700 px. All of Harbor's vertical padding is 2,456 px of it (13%); its fixed 240 px `py-30` on eight sections is 1,920 px. Summit's gaps do step down on phones (144 px, then 176 from md) and total 1,312 px of 14,865; its length is stacked content, the services deck alone 4,988 px (six cards, each with a 256 px picture under the text, `services.tsx:32,58`) and the why grid 1,504 px.
- **Screenshot defects (medium).** Harbor's phone hero clips "POTENTIA[L]" and "STRENGT[H]" (`harbor/375-00.png`); its tablet nav collides (`harbor/768-00.png`); its metric figures clip at 375, 768 and 1024 (`harbor/375-07.png`). Ember's plates clip at 768 (`ember/768-02.png`) and its phone hero loses the photo entirely (`ember/375-00.png`). Summit's phone deck hides most of each card under the next one (`summit/375-08.png`). Vector's glass never blurs while motion is allowed: the header's `filled` opacity animation makes it the backdrop root, so `backdrop-filter` has nothing behind it to blur (`vector/375-menu.png`, `header.tsx:86-88`, `vector.css:263`; proved by a runtime override). Under reduced motion the animation is not applied and the blur renders (`vector.css:260-265`).

### Code

- **Harbor's fallback breaks its own limits (high).** It checks the CTA only against `cta.primary`'s 24 characters, then reuses it for `nav.cta` (max 16) and `hero.primary` (max 20) (`t06-harbor/contract.ts:317,333,338`). "Book a free assessment" and "Request a callback", both allowed by the brief prompt (`lib/ai/prompts.ts:36`), produce violations. The comment claims it always passes (`:311-312`), the corpus never covers it, and `build-concepts.ts:173` stores fallback copy unvalidated.
- **No render-level tests (high).** Each template tests its contract and slots only. No e2e, visual or axe spec renders an example or a pipeline-shaped page. `lib/tokens/derive.test.ts:34` claims the registry test derives tokens per template's pairs; it does not.
- **Harbor's guide contradicts its counts (medium).** The prompt says one to three lines for every heading, but the About heading needs two (`contract.ts:125,145` against `copy-slots.ts:274`), so a compliant answer costs a paid retry.
- **Vector's WebGL robustness (medium).** No `webglcontextlost` handling; a lost context turns a project card solid black because its fallback is unmounted (`ripple.tsx:392`, measured). GL objects are never deleted and the effect re-runs on the same context. Disc growth ignores frame time, so ripples grow twice as fast at 120 Hz (`ripple.tsx:299`). The hero waves' opacity classes are applied twice (`hero.tsx:17`, `waves.tsx:266`).
- **Metadata wrong in the contract (medium).** Vector declares `polarity: 'either'` but always puts the logo on a dark glass pill, so dark logos vanish (`meta.ts:9`, `header.tsx:95`).
- **Licence gap (medium: Vector).** Covered under "The four are ports". Ember's eight Unsplash portraits are covered at `THIRD_PARTY_NOTICES.md:79`.
- **Dead or colliding CSS (low).** Vector's `3xl:max-w-550` compiles to nothing (`styles.ts:17`). Vector's leftover `.hero` class picks up the site's global `view-timeline` (`hero.tsx:15`, `app/globals.css:703-705`). Harbor's FAQ `grid-template-rows` transition never runs (`harbor.css:70-83`).
- **Timing duplicated between JS and CSS (low)** (`t08-vector/sections/header.tsx:13` against `:119-140`; `projects.tsx:229` against `:265`; `t06-harbor/sections/nav.tsx:15` against `:127`).
- **React keys from model strings (low, all four).** For example `t07-summit/sections/why.tsx:24`, `t06-harbor/sections/services.tsx:41`, and in Vector the hero lines, project titles, menu rows, FAQ questions, nav labels and footer items (`hero.tsx:27`, `projects.tsx:475`, `menu.tsx:122`, `faq.tsx:39`, `header.tsx:138`, `footer.tsx:81`); duplicate copy collides. The copyright year is computed once at module load in all four footers.

## Decisions before Phase 2

Each has options and a recommendation. Decisions 1, 5, 6, 7 and 10 shape the Phase 2 designs; the rest can wait for the build.

1. **Set size and the visit cap.** Replace two, grow to ten, or keep the new two example-only. Either real option needs the explicit visit cap first, because a swap also reopens a third paid visit. Recommend: the cap first, then grow to ten, which leaves every existing folder alone.
2. **The two example routes' tokens.** Keep hand-set sets, or derive both schemes as Aurora does. Recommend: derive by default and keep the source's set behind a query for pixel checks, so the owner reviews what a visitor gets.
3. **GSAP in templates.** An ADR amending ADR 0008 decision 4, an ESLint change, and a rule for the dynamic-import loophole. Recommend: yes, through the `lib/motion` loaders, armed on scroll intent, core only below 48rem.
4. **The WebGL helpers.** Copy them into each template, or widen the boundary to one `lib/motion` WebGL module. Recommend: widen, so the lifecycle is written and tested once.
5. **The contact mechanism on a visitor's page.** A real endpoint, an honest mailto link, or a designed demo state that says the live site would deliver the message. Recommend: the demo state, since a prospect gains nothing from mailing themselves; record it in an ADR.
6. **Industry fit.** A neutral page, or a fit signal in the brief and selector. Recommend: neutral first; the fintech template carries its character through type, layout and chrome, with figures on the example only.
7. **Fonts.** Keep the four pairs, or allow a per-template override in `typeStyle`, keyed on template id, at the cost of one more lazy face per preview. Recommend: an override for the fintech template's figure face, since two of the seven faces have no tabular figures.
8. **The WebGL off flag.** A template-local constant, a `TemplateAssets` field or a data attribute. Recommend: a template-local constant (the ADR 0008 decision 5 precedent).
9. **Per-template meta.** Recommend an optional contract field and the one shared route change, which touches no other contract.
10. **Gain and loss colour.** A new token, or a monochrome encoding (arrows, weight, position). Recommend: monochrome, since figures are example-only anyway.
11. **Fixed UI chrome.** Record English chrome ("All rights reserved", menu labels) in an ADR as not copy, or move it into the content object. Recommend: the ADR, and move anything that reads as the business's voice.
12. **The live claim.** Reword "A person designs every layout" if an agent designs the new two.
13. **Vector's licence.** Confirm the demo's GLSL and pictures with the licensor, or replace them.

## Quality bar

Where the repo's `lighthouserc.json` is stricter than the brief, the repo wins: LCP 2,000 ms, not 2.5 s; CLS 0.02, not 0.1. Run every gate on the example route and on a pipeline-shaped fixture (every optional section null, images from Blob, fallback copy, preview fonts), at 375, 768, 1024, 1440 and 1920, in a derived light set and a derived dark set. Each gate names its tool; the procedures follow.

1. **Repo gates.** typecheck, lint, format:check, knip, test and build exit 0; the CI hex and palette grep is clean; grep finds no `import(` of a banned package. (pnpm, grep)
2. **Contract and fallback.** The fallback passes `copyViolations` and `ruleViolationsIn` over the corpus and edge names, and never puts one sentence in two slots. (vitest; A)
3. **Everything from the config.** No hex, palette class, colour literal, `font-family`, next/font import, CSS `url()` or raw `<img>` in the template; every image is a `SlotImage` from `assemble`; no visible string outside the agreed chrome list (decision 11); meta through the contract if decision 9 lands. (ESLint, grep)
4. **Colour pairs.** No alpha text; every painted text colour is a declared pair; text over imagery sits on the scrim pair at 4.5:1 over white and black; the new pairs solved with each existing template's pairs never throw. (grep, vitest; B)
5. **axe and semantics.** 0 axe violations at five widths, both schemes, menu open and closed; Lighthouse accessibility 1; one h1, no skipped level, landmarks, no generic link names, split text with a whole-text alternative, every picture keeps its alt when a canvas replaces it; one screen-reader pass. (Playwright, Lighthouse, VoiceOver or NVDA; C)
6. **Keyboard.** Every stop is visible when focused, hit-testable and ringed at 3:1; the skip link shows; the phone menu is a dialog. (Playwright; D)
7. **Reach and reflow.** Every target 44x44 at 375 except the site's skip link; no horizontal scroll at 320 or at 200% zoom; text spacing and forced colours lose nothing; full-height blocks use `svh` or `dvh`. (Playwright, grep; E)
8. **Type.** Display sizes `clamp()` with a rem term; body at least 16 px; measure 45 to 75 ch at 1440, FAQ answers included; figures tabular in a face that has `tnum`. (grep, Playwright; F)
9. **LCP and images.** The LCP element is visible at first paint; hero pictures eager with high fetch priority and a true `sizes`; `uses-responsive-images` passes at 375 and 1440; LCP at most 2,000 ms, and NO_LCP fails. (lhci; G)
10. **Lab budget.** Performance at least 0.95, best practices 1, CLS at most 0.02, TBT at most 150 ms, script transfer at most 230,000 B, images 500,000 B, total 600,000 B, third-party requests at most 4, lab INP at most 200 ms, and the template's own gzipped CSS under a figure the owner sets. (lhci, Playwright; H)
11. **One WebGL moment.** Exactly one context, after first paint; DPR at most 2; its draws stop offscreen and when hidden; context loss shows the static state; teardown releases everything; colours from tokens; one download per texture; a static state under reduced motion, no WebGL and the flag off. (Playwright, vitest; I)
12. **Motion and fallbacks.** Reduced motion is still; any motion longer than 5 s, the WebGL loop and marquees included, has a visible pause control (WCAG 2.2.2); JavaScript off loses nothing; a blocked chunk hides nothing; GSAP only by the book. (Playwright; J)
13. **Conversion and the studio.** An ask in the first viewport and in the header at every width, the phone bar included; no CTA lands on a target above itself; every CTA reaches the decision-5 mechanism at 1280x720 and 1366x657; forms are labelled, autocompleted, never write values into the URL and show success and failure; the StudioBar is never covered and stays first in the tab order. (Playwright; K)
14. **Neutral and complete.** No sector noun, icon or form field from a banned list; the null-optional page has no empty cell, figure-shaped block without a figure or placeholder shown as content; three fixture briefs signed off. (grep, Playwright, owner; L)
15. **Clean.** No class that compiles to nothing; no CSS rule unused in every state; no React key from model copy; logo polarity matches the header's ground; anchor offsets match the header; every example asset licensed in `THIRD_PARTY_NOTICES.md`. (built CSS, CDP, grep; M)

**Tooling the bar needs.** Phase 3 must add what does not exist: a fixture render path (`assemble` over `fallbackCopy`, derived tokens, preview fonts and cross-origin images) on a static route, since `scripts/bundle-budget.mjs` fails a route that is not prerendered (`:5-6`) and every example route is dynamic; an `e2e/templates.spec.ts` for gates 5 to 8 and 11 to 15; a template Lighthouse config with `aggregationMethod: "median"` on its assertions; a budget entry for the fixture route; and the Phase 1 probes committed as specs, since today they live outside the repo.

**Procedures.**

- **A.** Copy the two edge names (`lib/preview/example.ts:21-26`) into the template test's own corpus (Harbor's already keeps edge cases of its own there, `t06-harbor/contract.test.ts:10-17`), or run the check once per ready template in `tests/integration/registry.test.ts`, which may import `lib/preview`; a template test may not (`eslint.config.mjs:37-40,151-155`). Add a `ctaLabel` of 4 and 22 characters and a one-sentence description. With one sentence the shared `fallbackBrief` repeats it by construction (`lib/copy-slots/brief.ts:53-65`), so distinct text must come from fixed claim-free phrases per slot, as `STEPS` does (`:39-46`), or the slot is null.
- **B.** Grep `text-[a-z-]+/[0-9]+` on the template and `color-mix` or opacity on text in its CSS; both must find nothing, which the grep `text-on-.../NN` alone misses (`t08-vector/sections/footer.tsx:12`, `t05-ember/sections/footer.tsx:107`, `harbor.css:63`). axe checks what is painted. Solve the union of the new pairs with each other template's pairs over the corpus (`lib/tokens/derive.test.ts:10-28`) in both schemes, assert `deriveTokens` does not throw (a 4.5:1 check adds nothing: `solvePairs` passes or throws, `lib/tokens/contrast.ts:56-61`), and report any change to an existing template's solved tokens for the owner. Compute the scrim pair over pure white and pure black at the scrim's opacity.
- **C.** `@axe-core/playwright` with wcag2a, 2aa, 21a, 21aa and 22aa after a full scroll. Lighthouse `heading-order` and `label-content-name-mismatch` pass.
- **D.** Tab through the page; each stop's effective opacity (the product over its ancestors) is 1 within 300 ms of focus, or reveals finish at once under `:focus-within`; `elementFromPoint` at its centre returns it or a descendant; the ring is at least 3:1. The skip link is visible once `layer(utilities)` is fixed. The menu moves focus in, traps Tab, returns focus to the toggle on Escape and Close, makes the page `inert` and unscrollable under Lenis, and its toggle says what it opens.
- **E.** Measure every interactive box at 375. At 320 CSS px and at 200% zoom of 1280, `scrollWidth` equals `clientWidth` (WCAG 1.4.10). Apply the WCAG 1.4.12 text-spacing overrides: no text clips. Emulate `forced-colors: active`: every control and focus ring shows. The `svh` or `dvh` rule is the brief's, not a measured defect; grep the hero and any pinned stage for `min-h-screen`, `h-screen` and `100vh`, which all four heroes use today (`t05-ember/sections/hero.tsx:18`, `t06-harbor/sections/hero.tsx:20`, `t07-summit/sections/hero.tsx:22`). A root `min-h-screen`, such as Vector's (`t08-vector/index.tsx:36`), is not a full-height block.
- **F.** Grep for a `clamp()` whose middle term is vw alone. Measure each paragraph's width over the width of "0" in its face. Check `tnum` by comparing "1111" and "0000" widths under `tabular-nums` in every face a figure can take; Fraunces and DM Sans fail today.
- **G.** A hero picture uses `loading="eager"` and `fetchPriority="high"`, with `preload` only when it is the LCP at every width (`node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md:283-289`); no `priority`, no CSS URL, nothing hidden or below the fold preloaded. Five runs with median aggregation; without it lhci asserts the best of five runs.
- **H.** Block `/_vercel/*` for best practices. Lab INP: scripted menu, FAQ and form-focus interactions under 4x CPU throttle, read through PerformanceObserver `event` entries or web-vitals `onINP`. Preview pages are `noindex` and low-traffic, so field INP will not arrive.
- **I.** Count contexts in Playwright; create the context after `whenIdle` or scroll intent, never before FCP; DPR 1.5 recommended, as `waves.tsx:201` does. Count the template's own draws (wrap `gl.drawArrays`), not page-wide rAF, which Lenis keeps busy (`app/_components/smooth-scroll.tsx:80`): zero offscreen, and zero after overriding `document.visibilityState` and dispatching `visibilitychange`. Force a loss with `WEBGL_lose_context`; unmount and check `gl.delete*` and `loseContext`. Unit-test the colour parser against every `formatHex` output of `deriveTokens` over the corpus; an unparseable value shows the static state, never white. Load textures from the rendered `<img>`'s `currentSrc`, the same-origin `/_next/image` URL already cached, and assert one request per picture. Screenshot the static state under reduced motion, `--disable-webgl` and the flag.
- **J.** With `reducedMotion: 'reduce'`, after the page settles no transform or keyframe animation runs (colour and opacity transitions are allowed, as `app/globals.css:614-634` keeps them), no content is hidden, and no decorative motion element, such as a cursor disc, is painted. With JavaScript off, all content, FAQ answers and phone navigation are reachable. With the client chunk blocked and scripting on, nothing is hidden, because hiding waits for the root to be marked armed. GSAP: an owner-approved ADR, the site loader, zero GSAP bytes in an unscrolled run, core only below 48rem, one `gsap.context` and `matchMedia` per condition, reverted on unmount.
- **K.** On a mirror of the preview route, `elementFromPoint` at both StudioBar links returns them at scroll 0 and after any scroll back to the top, and the first Tab stops after the skip link are the StudioBar's. Form fields have visible labels, `autocomplete` tokens and marked required fields.
- **L.** A grep list of sector nouns and icon names. Three named fixture briefs (a bakery, a physio, a fintech) rendered at 375 and 1440, screenshots stored and signed off by the owner against a written rubric, if decision 6 chooses a neutral page.
- **M.** Knip, then the built CSS for classes that emit nothing, then Chromium rule-usage coverage (CDP `CSS.startRuleUsageTracking`) across the five widths, both schemes, reduced motion and the open menu; each unused rule in the template's sheet is explained or removed. Anchor offsets: `scroll-margin-top` equals the header height minus 4rem at each breakpoint.

## Design directions (Phase 2)

Phase 2 proposes two directions for each new template: **Intaglio** and **Sheaf** for fintech, **Mullion** and **Placard** for any industry. Each has a full spec below, a comparison with its sibling, and a recommendation for the owner to accept or overrule. Written 27 Sept 2026 on `feat/new-templates` at `6ca198a`, and revised on 28 Sept 2026 after a verification pass: every number it changed was measured again with the lab tools or in the tiles, and all four tiles and their screenshots were updated. No template, site or config file was changed.

**What the directions assume.** The owner has not yet answered "Decisions before Phase 2", so every direction is designed under that section's recommendations:

- **1, set size:** the explicit visit cap lands first, then the set grows to ten. No design depends on it. Fintech takes `t09-<name>` and any-industry `t10-<name>`.
- **2, example tokens:** each example derives both schemes from its one hex, as a visitor's page does; `?scheme=dark` shows the other.
- **3, GSAP:** allowed in templates only through the `lib/motion` loaders, armed on scroll intent, with ScrollTrigger only from 48rem.
- **4, WebGL helpers:** one `lib/motion` WebGL lifecycle module, written and tested once.
- **5, contact:** on a visitor's page the contact block is a designed demo state that says the live site would deliver the message; the example shows a real-looking form.
- **6, industry fit:** neutral first. A fintech template will also be shown to bakeries and physios, so it carries its character through type, layout and chrome, with figures on the example only.
- **7, fonts:** the four pairs, plus a per-template override for the fintech template's figure face only.
- **8, the WebGL off flag:** a template-local constant. So is every other tunable a template reads in JavaScript: the specs' DPR caps, debounce and fade times, font waits, physics, rect limits and fallback timers, kept as named constants in one template-local file. `docs/standards.md:49` puts every tunable in `lib/config.ts`, which templates cannot import, and ADR 0008 decision 5 covers only tunables that CSS reads, so the decision-8 ADR line must name them all. The alternative for the shared lifecycle numbers (DPR caps, the 150 ms debounce, fades) is `CONFIG.motion`, read by the `lib/motion` WebGL module, which may import `lib/config`.
- **9, meta:** per-template meta through an optional contract field.
- **10, gains and losses:** monochrome (arrow, sign, weight, position), no new colour token.
- **11, chrome:** each spec lists its fixed English strings for the ADR.

Each spec ends with "If the owner decides otherwise", which says what changes under every other answer.

**Style tiles.** One throwaway, self-contained HTML file per direction, to open in a browser: `docs/directions/intaglio.html`, `sheaf.html`, `mullion.html` and `placard.html`. Each shows type, palette, every button state and a rough hero, with scheme and hex controls, so the owner can judge what a screenshot cannot: the other scheme and a swapped accent. Intaglio and Sheaf also have a face-pair control; Mullion and Placard show each of the four preview pairs as a static frame. All four load their faces from Google Fonts, so they need a connection. Mullion's and Placard's photographs are relative paths into `templates/`, so those two render fully only when opened from the repo.

**Screenshots.** In `.compare/template-analysis/directions/`, which git ignores:

- full pages: `<slug>-1440.png` and `<slug>-375.png` for each direction;
- first viewports: `intaglio-1440-first.png`, `intaglio-375-first.png`, and `<slug>-1440-00.png` and `<slug>-375-00.png` for the other three;
- Sheaf also has 17 detail frames (`sheaf-hero-*`, `sheaf-pour-*`, `sheaf-contact-*`, `sheaf-header-320.png`).

The full pages run past Chromium's 16,384 device px capture limit, so Intaglio's, Sheaf's and Mullion's are stitched from viewport or chunk captures. Placard's (750 × 79,884 at 375 and 1440 × 28,288) were checked for this document: sampled strips 8,192 and 16,384 px apart never match, so neither repeats. Every tile's screenshots were taken again on 28 Sept 2026 after the review corrections below changed all four tiles. The comparison captures of the other templates and the studio's home are in `.compare/template-analysis/<aurora|monolith|meridian|atlas|home>/`.

**Why these four.** Each was chosen from a wider set of concepts scored by three judges, then revised against their critique.

| Direction | Template     | Why it was chosen                                                                                                                                                                                                                                                                               |
| --------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intaglio  | fintech      | The two highest-scoring fintech concepts (combined 21 and 20) merged, since every judge said they were one direction. It is the brief's first named case, a B2B payments platform that wants demo bookings, with every trust item the brief lists and proof without digits on a visitor's page. |
| Sheaf     | fintech      | The judges agreed the other fintech concepts were one engraving idea, so the second direction had to be consumer and phone-first. It keeps the set's strongest conversion devices (price and catch first, a small first step, one filled ask) in an identity no template uses.                  |
| Mullion   | any industry | Tied for the top multi score (21); two of three judges ranked it first. The clearest conversion grammar in the set: colour means "act here". It moved no existing template's colours and is the multi direction furthest from both fintech directions.                                          |
| Placard   | any industry | Tied for the top multi score (21) and the creative director's first choice. The most robust visitor page in the set: text-led, every null photo a designed variant, the fewest declared pairs. Renamed from Broadside, which clashed with real web-design studios.                              |

**How the four differ.**

- **Faces:** no two share a display face (Newsreader, Familjen Grotesk, Schibsted Grotesk, Besley) or a body face (IBM Plex Sans, Atkinson Hyperlegible Next, Source Serif 4, Public Sans).
- **Example hues:** engraving violet `#4a2a6a`, navy `#1e3a8a`, viridian `#0f7a6c` and vermilion `#b3261e`, four families. Sheaf's example moved from raspberry to navy, which also removes its clash with Placard's red; navy is close to the studio's own deep blue (see Sheaf's risks). Every design holds for any hex.
- **WebGL:** four different ideas (an engraved seal, a particle pour, a tile field, a raking light), each one context with a static SVG or CSS state that is the finished design.
- **Closest pair:** Intaglio and Placard, both light, paper-like and ruled. They are separated by a transitional serif and mono against a slab and sans, a document-led sheet against a photography-led one, dotted leaders, a torn counterfoil, double rules and a seal against none of them, and violet against vermilion. If the owner wants the widest gap, pair Intaglio with Mullion.
- **Against the eight and the studio:** none uses a centred hero with a glow (Aurora, Meridian), floating cards (Monolith), 3D objects, gradients, blue washes or market tables (Atlas), a photo hero with avatars and stars (Ember), caps with neon on black (Harbor), a faded photo or sticky deck (Summit), colour-band WebGL, serif italics or duotones (Vector), or the studio's ink, fluid, curved edges, capsule header, navy and sky bands or prompt box.
- **Colour safety:** in a common run over 26 hexes, each direction's declared pairs, solved with each existing template's pairs, moved 0 of 416 solved token sets. Each spec also records its own run. Showing any of the four beside the eight changes none of their colours on that corpus. Mullion's tenth pair (brand-deeper on accent), added after that run, was solved again beside all eight templates at once, over the 17-hex corpus and the tile's eight hexes in both schemes: 0 shifted, 0 order-sensitive, 0 throws.

**Names.** Web searches on 27 Sept 2026, finance first and the studio's own trade second. None is a trademark search: each template name still needs a UK IPO and EUIPO check, and each company name a Companies House check, before anything ships.

- **Kept:** Intaglio and Sheaf (no finance firm found). Mullion: The Mullion Group, an Australian carbon-accounting software firm, and Mullion PFD exist outside finance and web design; alternatives if wanted are Ashlar and Transom. Placard: Placard Wizard is hazmat-placard software for trucking firms.
- **Dropped:** Broadside (Broadside Marketing and Broadside Interactive design websites for small businesses, the studio's own trade, so the concept became Placard); Talus (Talus Pay, a US payments fintech); Granary (Granary Finance, a DeFi protocol); Moraine (no collision, but a fourth M-name).
- **Example companies.** Kestrel is replaced on both fintech examples: the FCA publishes a warning about an unauthorised firm called Kestrel Finance, Kestrl is a UK fintech app, and Kestrel Government Payment Solutions and Kestrel Financial Services Limited trade in payments and finance. Intaglio uses **Whimbrel Payments Ltd** (searches found Whimbrel software, IT and property firms, nothing in finance); Sheaf uses **Stonechat** (nothing found). Lanner (Lanner Capital, an FCA-registered lender) and Nuthatch (Nuthatch Software) were rejected. The multi examples keep Kestrel by convention in trades where no Kestrel business turned up: **Kestrel Sash Windows**, York (Mullion; real Kestrel joinery, carpentry and kitchen firms exist) and **Kestrel Sweeps**, Calder Valley (Placard; the Placard example names no real sweep or stove registration scheme).
- **Inside the examples:** the fictional suppliers, customers and people (Quillon Steelworks, Fenwright & Rye, Tolland Freight, Marrowby Print Co., Priya Raman, Tom Adeyemi, Amara Osei, Maya Okonjo, Jess, Arun) were not searched one by one. Phone numbers use Ofcom's drama range (0113 496 0xxx), and Sheaf's code encodes the reserved domain `example.com`.

### GSAP and WebGL

**No existing template uses GSAP or a WebGL library.** Vector runs raw WebGL1 (`waves.tsx`, `ripple.tsx`). The site loads GSAP 3.15.0 and Lenis only through `lib/motion` (`loadGsap`, `loadLenis`), ESLint forbids both anywhere else, and ADR 0008 decision 4 says nothing in a template loads GSAP. There is no three.js, ogl or other WebGL library in the repo.

**The smallest addition, shared by all four directions:**

1. One owner-approved ADR amending ADR 0008 decision 4. It lets templates use GSAP through the `lib/motion` loaders (decision 3) and widens the template import boundary to the motion helpers and one WebGL module (decision 4), so both choices sit in one record. ADR 0008 bars all of `lib/motion`, not only GSAP ("Templates cannot import `lib/motion`", decision 4), and the boundary is also a rule of `docs/standards.md:90-93` ("`templates/**` may import only from `lib/tokens/**` and `lib/copy-slots/**`"). So the same ADR must record the deviation from the standards doc, as ADR 0002 requires of every deviation, and every direction needs it, whether or not it uses GSAP.
2. One ESLint change letting templates import `@/lib/motion/gsap`, the arming helpers (`@/lib/motion/idle`, `use-motion-allowed`) and the WebGL module, plus a rule that closes the `import('gsap')` loophole, which `no-restricted-imports` misses today (`eslint.config.mjs:37-40,148-158`). It does not open `@/lib/motion/lenis`, the only handle on the running Lenis (`setActiveLenis` and `onActiveLenis`, `lib/motion/lenis.ts:17-37`), so a template can neither stop Lenis nor subscribe ScrollTrigger to it. No direction needs either: every phone menu follows the site's own (see "Menus and the StudioBar" below), and no direction uses ScrollTrigger. A later template that does must add `@/lib/motion/lenis` to the allowance and the ADR.
3. One `lib/motion` WebGL lifecycle module: a lazy chunk, motion-gated, DPR at most 2, a debounced resize that deletes before it reallocates, drawing stopped offscreen and in a hidden tab, `webglcontextlost` falling back to the static state, teardown through `gl.delete*` and `WEBGL_lose_context`, and a token parser unit-tested over every `formatHex` output of `deriveTokens`.
4. A `whenIntent` helper beside `whenScrolled` (pointer, scroll, touch or key), so a context is never created in an unattended run.

No new dependency.

**The arming rule for GSAP.** Load it with `loadGsap`, armed on `whenScrolled` and never on idle, so an unscrolled audit fetches none. Core only below 48rem; ScrollTrigger only from 48rem and only with the site's Lenis subscription, which needs `@/lib/motion/lenis` in the ESLint allowance and the ADR (step 2 leaves it out, because no direction uses ScrollTrigger). Reduced-motion visitors download none.

**Menus and the StudioBar.** Every direction's phone menu is a full-screen `100dvh` dialog, and the site's Lenis is created without `autoToggle` (`app/_components/smooth-scroll.tsx:78-83`), so setting overflow on `<html>` does not stop it either (`node_modules/lenis/dist/lenis.mjs:484-487,525-527`). Each menu therefore copies the site's own phone menu (`app/_components/mobile-nav.tsx:70-79,171`), which never stops Lenis: the sheet carries `data-lenis-prevent` and `overscroll-behavior: contain` (in the template's own CSS, since the repo does not import `lenis.css`), and the page behind it is inert. Prefer `<dialog>.showModal()`, which makes everything outside the dialog inert without the template reaching outside its own root. Either way the open sheet covers the StudioBar, which sits in flow above the template (`app/preview/_components/studio-bar.tsx:22-24`), and the inert page includes it. Gate 13 ("the StudioBar is never covered") needs one amendment in Phase 3: "except while the template's own modal menu is open", or each sheet starts below the StudioBar while the bar is in view. The headers themselves stay sticky in normal flow and never cover the bar.

**The budget arithmetic** (from "No template uses GSAP or a WebGL library today"). The line is 230,000 B of script transfer. The example routes transferred 159,441 to 169,649 B. GSAP core is 27,185 B gzipped and ScrollTrigger about 17.4 kB, so both at idle reach about 204 to 214 kB. The preview route, which imports all eight templates, transfers about 183 kB by estimate: about 210 kB with core and about 228 kB with ScrollTrigger too, only about 2 kB under the line.

**What each direction uses.**

| Direction | GSAP                                                                 | ScrollTrigger | WebGL moment                                            | Where and when a context is created                                                                         | DPR | Script cost (estimates unless stated)                                                            |
| --------- | -------------------------------------------------------------------- | ------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | --- | ------------------------------------------------------------------------------------------------ |
| Intaglio  | none; one-shot CSS keyframes on one IntersectionObserver             | none          | an engraved guilloche seal on the hero's tear           | from 64rem only, on first intent after first paint; never on phones                                         | 2   | leaf 4 to 6 kB plus the module's 2 to 3 kB, lazy (tile sketch 4,248 B gzipped, measured)         |
| Sheaf     | none; CSS keyframes on one observer                                  | none          | a pour of grains into the hero's column                 | every width; the leaf loads after `whenIdle` and creates its context when the column is within one viewport | 2   | about 4 to 6 kB with the module, lazy                                                            |
| Mullion   | core only, from 48rem, armed on `whenScrolled`; CSS rise below 48rem | none          | a stepped tile field in the hero's call pane            | from 48rem, on first intent after first paint; never on phones                                              | 1.5 | GSAP core 27,185 B after the first scroll; leaf 3 to 4 kB with the module (tile 3,374 B gzipped) |
| Placard   | none; CSS load draw and one observer                                 | none          | one raking light across the paper, ending above the ask | from 48rem, on first intent while 60% of the hero is in view; never on phones                               | 1   | 3 to 5 kB plus the module (tile block 4,452 B gzip -9, measured)                                 |

- **No direction uses ScrollTrigger**, so the 228 kB case never arises.
- **The preview route's script, re-estimated with the new templates.** The 183 kB baseline is today's eight-template preview (Phase 1's estimate from built chunks). `templates/render.tsx:3-18` imports every template statically, so each new template's first-load client leaves reach every preview page before any GSAP loads. By Phase 1's per-template average ((41,907 - 18,143) / 7 = 3,395 B), the two new templates add about 6.8 kB: about 190 kB. Mullion's GSAP core after the first scroll (27,185 B) makes about 217 kB, still under the 230,000 B line with about 13 kB of room; ScrollTrigger on top would pass the line (about 234 kB). These are estimates from Phase 1's estimates, not a Lighthouse run.
- **GSAP is 0 B on phones and in an unscrolled run in every direction**, but not every lazy chunk is. Sheaf's WebGL leaf loads after `whenIdle`, which fires on idle or the first scroll with a 1,500 ms idle timeout (`lib/motion/idle.ts:8-26`), so its 4 to 6 kB chunk does load during an unattended audit; the other three arm only on intent. Moving Sheaf to `whenIntent` (recommended below) removes it.
- **Every WebGL moment ends at an ask.** Intaglio's highlight stops pointing at the ask, then the ask's arrow nudges. Sheaf's pour carries the pot across January's line level with the hero key. Mullion's front lands on the ring round the ask. Placard's light comes to rest above the pressed ask.
- **Every static state is the finished design**, shown at first paint, under reduced motion, without WebGL, with the flag off and after context loss. Sheaf's pending band, an earlier exception, now appears only once its WebGL leaf holds a context (see Sheaf's "States").

**Departures for the owner to accept or overrule.**

- **GSAP.** The brief asks for GSAP for scroll and interaction choreography. Intaglio, Sheaf and Placard do all of theirs in CSS started by one IntersectionObserver, because nothing they do is scrubbed, chained across bands or interrupted, and load 0 B of GSAP; each records it as a deviation. Only Mullion uses GSAP. If the owner wants GSAP in every template, Placard names its one job (the arrival at the reply slip); Intaglio and Sheaf would each need one found.
- **Sheaf arms its WebGL without intent.** Its leaf loads at idle and creates the context once the column is within one viewport, so that phones always see the pour. At 375 × 667 the hero card starts at 683 px, inside that margin, so by the spec an unattended lab run at phone width would create a context; the other three never do. Moving Sheaf to `whenIntent` changes little on a desktop, where a pointer moves at once; on a phone the pour would start after the first scroll. Recommend moving it.
- **Budget reach.** `templates/render.tsx` imports every template, so each new template's client leaves reach every preview page. All four specs flag it; Phase 3 should load client code by template id before adding either template.
- **Own type scales.** Each direction defines its own `clamp()` scale, while ADR 0008 decision 3 says a template uses the site's fluid scale (`text-display` and friends). Only Aurora does today (`templates/t01-aurora/styles.ts:8`). The Phase 3 ADR must record that the new templates carry their own scales, as the ports do under ADR 0023, or build them on the site's steps.
- **Tunables in JavaScript.** See decision 8 above: every JavaScript tunable is a named template-local constant, recorded in the ADR, or a `CONFIG.motion` value read by the shared module.

### Fintech

**Segment and CTA.** The brief asks which segment each page is for, because a B2B payments platform that wants demo bookings and a consumer app that wants downloads are different pages. The two fintech directions take one each on purpose, so the owner's pick is also the segment choice. **Intaglio** is a B2B accounts-payable platform for UK firms of about 50 to 500 staff, and its one conversion is a booked demo: 'Book a demo', landing on a booking form at `#contact`. **Sheaf** is a consumer savings app for UK sole traders, and its one conversion is a download started: 'Get the app', landing on one card at `#start` that holds the store link on a phone and a code to scan or 'Email me the link' from 48rem. Neither segment changes what a visitor's page may say. The selector has no fit signal (decision 6), so either template will be shown to bakeries and physios; its figures, fees, compliance lines and disclaimer live only on the example; and a visitor's page keeps the segment's character through type, layout and chrome while its ask is the visitor's own `ctaLabel`. Both examples carry every trust item the brief lists (security and compliance signals, transparent pricing or fees, product UI drawn from copy, proof metrics and a regulatory disclaimer slot), and each spec's "Trust plan" says what survives on a visitor's page.

#### Intaglio

Fintech template, direction 1 of 2. A B2B supplier-payments page set out as a counterfoil you could sign: the words and the ask on the stub, the payment run on the body, an engraved seal stamped across the tear beside the ask, a fee schedule that adds up, and one short booking form.

- **Style tile:** `docs/directions/intaglio.html`, one self-contained file. It has:
  - scheme, face-pair and hex controls (five hexes);
  - example hero frames at 1440 × 900, 1366 × 657, 1280 × 720 and 375 × 667, each with a live readout of where every part sits;
  - three visitor fixtures at 1440 and 375: a bakery built only from a realistic, full-length 383-character brief sentence, a physio stress case and the fallback copy;
  - the fact-budget panel, the type specimen, both palettes with their ratios and every button state;
  - the live WebGL seal on the tear, beside its static fallback, and the print run;
  - the booking form in five states, the assurance register and the section order.
- **Screenshots:** in `.compare/template-analysis/directions/` (git ignores `.compare`):
  - `intaglio-1440-first.png` (DPR 1) and `intaglio-375-first.png` (DPR 2);
  - `intaglio-1440.png` (1440 × 22,729) and `intaglio-375.png` (375 × 38,991, DPR 1). Both full pages are stitched from viewport captures, because Chromium's full-page capture repeats content past 16,384 device px.

##### At a glance

- **Template:** fintech. Id `t09-intaglio` if the set grows to ten (decision 1).
- **Segment:** B2B accounts payable, for UK firms of about 50 to 500 staff.
  - Their finance teams pay a few hundred to a few thousand supplier invoices a month.
  - The product checks every new supplier bank detail, puts each payment run in front of two approvers, pays the run and matches each payment to its invoice in the customer's ledger.
  - Sales-led: the page books demos, never sign-ups or downloads.
- **Example company:** Whimbrel Payments Ltd, fictional. Kestrel is not used, because the FCA warns about an unauthorised firm called Kestrel Finance.
  - The suppliers are fictional: Quillon Steelworks, Fenwright & Rye, Tolland Freight and Marrowby Print Co.
  - So are the fixture businesses: Hollinby Bakehouse, Calder Valley Sports Physiotherapy and Ashworth & Pell.
  - All need a Companies House check before the example ships.
- **Target visitor:** a financial controller or finance director, often the first senior finance hire.
  - They arrive after an invoice-fraud scare or a month-end that took a week, and must justify a switch to an owner or a board.
  - They are literal and sceptical. They read fees line by line and ask where the money sits and who can move it.
  - They visit at a desk in the working week, check again on a phone, and forward the page to whoever signs.
  - Their questions, in order: what is it, does it work, what does it cost, is our money safe, how hard is switching, who else uses it.
- **Primary conversion goal:** one booked demo, sent from the booking form at `#contact`, the last section before the footer. Every ask sits above that form and points down to it (gate 13).
- **Primary CTA:** 'Book a demo'.
  - On a visitor's page it is the ask slot, written from the brief's ctaLabel and held to 4 to 22 characters by the template's own slot range. Only the prompt asks for 4 to 22 (`lib/ai/prompts.ts:36`); `ctaLabel` is `z.string()` with no limit (`lib/copy-slots/brief.ts:23`), and fallback copy is stored unvalidated (`build-concepts.ts:173,180`). So the fallback uses the brief's ctaLabel only when it fits the slot, and 'Get in touch' otherwise, and its test covers ctaLabels of 0, 3, 4, 22, 23 and 40 characters.
  - An askShort slot of at most 14 characters feeds the bars. It has its own validated fallback, which avoids Harbor's reuse bug.

##### Concept

Intaglio borrows the look of money that is built to be hard to forge: engraved line-work, a counterfoil's tear line and the accountant's double rule, on plain paper. The hero is one outlined sheet torn in two: the promise and the ask sit on the stub, the company's own payment run on the body, and an engraved seal is stamped across the tear level with the ask, whose bottom edge the total's double rule shares. On a visitor's page the same sheet carries at most three of the business's own terms in words, signed with its name and sealed with its initial.

##### Why it should convert

This is reasoning only. Conversion cannot be measured here, and nothing below claims an outcome.

1. **It answers risk before a word is read.** The buyer's main objection is risk: fraud, error and loss of control. Security print is a visual language people already read as hard to fake, so the page makes its case without shields, locks or claims.
2. **The first viewport holds the whole stack** (headline, lead, ask and a trust line) at 375 × 667, 1280 × 720, 1366 × 657 and 1440 × 900, StudioBar included. From 64rem the product sits beside them on the same sheet. Positions are under "Evidence".
3. **The bands follow the buyer's questions.** Fees come second, because hidden charges are this category's main fear. A 'What Whimbrel earns' row answers the catch before anyone asks.
4. **The ask sits on the bottom line.** In the hero, the total's double rule is level with the ask's bottom edge. On the fee schedule, the total and the ask share one double rule.
5. **Proof sits beside every ask:**
   - the trust line under the hero ask;
   - the total above the schedule's ask;
   - corrections and signed statements just before the form;
   - next-step lines on the form's own stub.
6. **At most one filled ask is ever in view.**
   - The header ask is outlined whenever any in-page ask is on screen, and filled only when none is.
   - The section order keeps in-page asks at least a screen apart.
   - The phone bar always carries the ask.
7. **Motion ends at the ask.**
   - From 64rem, the seal's highlight stops pointing at the ask, then the ask's arrow nudges once.
   - With no WebGL moment, the arrow nudges at the end of the run's print instead.
   - The schedule's print run and the process rule end at their asks.
8. **The page stays calm:** no urgency devices, gradients or hype. That matches how this buyer wants their own finance function to feel. On a bakery's page, a signed, sealed sheet of the bakery's own terms still reads as a careful business.

##### Buttons and asks

- **Primary, 'Book a demo':** one square cell with 2 px corners, at least 48 px tall (44 px in the bars).
  - The fill is `brand-deeper` and the label `on-brand`. An arrow drawn as inline SVG sits inside the same cell, so no figure font loads for it.
  - On hover, `:focus-visible` and `:active`, the fill becomes `brand-deepest` and the arrow moves 4 px right (transform, 0.24 s). Mouse, keyboard and touch get the same cue.
  - Press scales it to 0.98. A transparent 1 px border keeps the edge visible in forced colours. No clip-path goes on any focusable element.
  - **No equals sign anywhere.** The earlier 'label | =' two-cell shape read as a split button or a menu icon, next to the Menu toggle in the phone bar.
- **Second line, example only:** the hero ask carries '25 minutes. No obligation.' at 1rem, which makes the button 4rem tall. It is null on a visitor's page.
- **Header ask:** the label only, no glyph, askShort, `nowrap`.
- **Where asks appear:**
  - the header at every width, the 375 bar included;
  - the hero stub;
  - the fee schedule's stub, on the double rule;
  - the end of the process rule;
  - the form's submit.
- **Secondary actions are text links,** never a second button.
  - 'See the fees' (dotted underline, a 44 px row, to `#terms`) sits beside the hero ask.
  - 'Request the security pack' sits in the assurance register and goes to `#contact` with that topic preselected.
- **Handoff.** One IntersectionObserver (threshold 0) watches every in-page `[data-ask]`.
  - While any of them is on screen, the header ask is outlined: a 1 px `brand-deeper` border and a `brand-deeper` label on `surface`, a declared pair.
  - When none is on screen, the fill fades in. The fill is a second span, `aria-hidden`, stacked over the outlined label and faded by opacity over 0.3 s, so the change is opacity only and the accessible name never changes.
  - Hover, focus and press show the fill too, in `brand-deepest` when it is already filled.
- **Focus:** a 2 px `on-surface` ring at a 3 px offset on every control. It measures 17.32:1 on the page and 15.12:1 on paper in light, and 17.24:1 and 14.25:1 in dark.

##### Type

**Example page.** Licences and figures were measured with the phase-2 font tool; the reserved font name comes from each family's `OFL.txt` in google/fonts. File sizes are the latin woff2 files as served, measured from the URLs next/font's own `getGoogleFontsUrl` builds.

| Role                                                       | Face                                                                                                                                                         | Weights shipped                                                                                  | Licence                                | Tabular figures (font tool, 96 px)                                                                                                                              |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Display: h1 to h3, the wordmark, the seal's initial        | Newsreader (Production Type): one self-hosted file, the optical-size axis (opsz 6 to 72) at weight 500, `font-optical-sizing: auto`, through next/font/local | 500 (60,724 B)                                                                                   | SIL OFL 1.1, no reserved name          | yes; default figures already tabular (0s and 1s both 595.2 px at 500 and 96 px on the shipped `opsz,wght@6..72,500` file; 580 px on the wght-only file); lining |
| Body: text, labels, nav, buttons, row names, worded values | IBM Plex Sans (IBM)                                                                                                                                          | 400 text; 500 labels, nav, buttons, names, worded values; both from one variable file (45,712 B) | SIL OFL 1.1, reserved font name "Plex" | yes; default tabular (592/592 at 400 and 500); lining                                                                                                           |
| Figures: digit runs in value cells only                    | IBM Plex Mono (IBM)                                                                                                                                          | 400 (14,708 B) references and times; 500 (14,888 B) amounts                                      | SIL OFL 1.1, reserved font name "Plex" | yes; default tabular (592/592 at 400 and 500); lining                                                                                                           |

- **Why next/font/local for Newsreader.** next/font/google cannot pair a fixed weight with an axis. `Newsreader({ weight: '500', axes: ['opsz'] })` throws 'Axes can only be defined for variable fonts when the weight property is nonexistent or set to `variable`'. The routes, measured:
  - (a) Weight omitted with `axes: ['opsz']` downloads the full variable file (`opsz,wght@6..72,200..800`): 132,000 B.
  - (b) A static 500 downloads 23,624 B. Its default optical size is drawn for text, and at 80 px it sets narrower and flatter; compared side by side, it loses the engraved contrast.
  - (c) The file Google serves for `opsz,wght@6..72,500` is 60,724 B. It is self-hosted with next/font/local and `adjustFontFallback: 'Times New Roman'`.
  - **Chosen: (c).** It is exactly the file the tile loads. Newsreader has no reserved font name, so shipping that subset is allowed, with a line in `THIRD_PARTY_NOTICES.md`. The file goes beside `app/examples/intaglio/page.tsx`, since templates import no fonts.
- **Example font transfer:** 60,724 + 45,712 + 14,708 + 14,888 = 136,032 B. Plex Sans is a variable family: the usual `IBM_Plex_Sans({ weight: ['400', '500'] })` builds `css2?family=IBM+Plex+Sans:wght@400;500`, and Google answers both weights with the same 45,712 B variable file, downloaded once. Two separate single-weight calls would load static cuts of 22,588 and 24,184 B instead (137,092 B in all). Plex Mono is static, so its 400 and 500 are separate files of 14,708 and 14,888 B.
- **Three voices, one job each:** the serif sets titles like an engraving, the mono prints the money, and the sans explains. Plex Sans and Plex Mono share proportions, so a payee and its amount sit on one baseline.
- **Mono prints digit runs only.** Amounts, references and times in value cells are wrapped in figure spans.
  - Words inside a value cell ('Unlimited', 'each', 'over mid-market') stay in the body face at 500 with `tabular-nums`.
  - Running text never uses mono, even when it holds digits: the FAQ, the trust line, labels.
  - A date in words ('26 Sep 2026') is set in the body face.
  - On a visitor's page a value cell uses the body face unless the owner typed a digit into it.
- **The reserved name "Plex" needs the owner's attention.** The latin woff2 that next/font self-hosts is Google's subset, and OFL-FAQ 1.1-update7 entry 2.6 says: "Is subsetting a webfont considered modification? Yes. ... This is permitted by the OFL but would not normally allow the use of RFNs." A subset may keep the name only if it is Functionally Equivalent to the original (entries 2.7 and 2.8), which nobody has established for Google's split files. So serving Google's Plex files under the Plex name relies on permission from IBM. Flag it for the owner, or self-host IBM's own published Plex webfonts unmodified. The same applies to the Plex Mono visitor override (decision 7). Newsreader, Familjen Grotesk, Atkinson Hyperlegible Next, Schibsted Grotesk, Source Serif 4, Besley and Public Sans have no reserved name (each family's `OFL.txt` in google/fonts).
- **No italics anywhere.** The preview faces are roman only and would synthesise them, so the template sets `font-synthesis: none`.

**Fluid scale.** Every clamp has a rem term, so it still grows at 200% zoom. The scale is the template's own, a departure from ADR 0008 decision 3 for the Phase 3 ADR (see "Departures").

| Element                                        | clamp()                                                                                        | 375     | 1440                      | Short laptops cap   |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------- | ------------------------- | ------------------- |
| h1, up to 44 characters                        | clamp(2.375rem, 1.5rem + 3.9vw, 5.5rem), leading 1.02, tracking -0.015em, `text-wrap: balance` | 38.6 px | 80.2 px (88 px from 1641) | 3.75rem             |
| h1, 45 to 64 characters                        | clamp(2.125rem, 1.4rem + 3.1vw, 4.5rem)                                                        | 34 px   | 67 px                     | 3.25rem             |
| h1, 65 to 90 characters                        | clamp(2rem, 1.3rem + 2.4vw, 3.75rem)                                                           | 32 px   | 55.4 px                   | 2.875rem            |
| h2                                             | clamp(2rem, 1.4rem + 2vw, 3.5rem), leading 1.08                                                | 32 px   | 51.2 px                   | none                |
| h3                                             | clamp(1.25rem, 1.05rem + 0.8vw, 1.625rem)                                                      | 20 px   | 26 px                     | none                |
| Lead, max 36rem                                | clamp(1.125rem, 1rem + 0.5vw, 1.375rem), line height 1.5, `text-wrap: pretty`                  | 18 px   | 22 px                     | 1.125rem, max 40rem |
| Body, max 64ch; FAQ answers 64ch               | clamp(1.0625rem, 1rem + 0.25vw, 1.1875rem), line height 1.55                                   | 17 px   | 19 px                     | none                |
| Run amounts / references / dates and approvals | 1rem Plex Mono 500 / 1rem Plex Mono 400 / 1rem body face                                       | 16 px   | 16 px                     | none                |
| Hero total                                     | clamp(1.25rem, 1rem + 0.6vw, 1.625rem)                                                         | 20 px   | 24.6 px                   | none                |
| Schedule total                                 | clamp(1.5rem, 1.1rem + 1.2vw, 2.25rem)                                                         | 24 px   | 34.9 px                   | none                |
| Ledger figures, example only                   | clamp(2.25rem, 1.4rem + 2.6vw, 3.5rem), 400                                                    | 36 px   | 56 px                     | none                |

- **The h1 step is chosen by length.** `assemble` picks it by character count, so nothing is measured at runtime. The tile's samples are 44, 59 and 89 characters, counted on normalised text.
- **Short laptops:** `@media (min-width: 64rem) and (max-height: 50rem)`. It changes:
  - hero top padding to 0.75rem, sheet padding to 1.25rem and row padding to 5 px;
  - the h1 caps in the table above;
  - the lead to 1.125rem at up to 40rem;
  - the gap above the ask to 1.25rem.
  - The tile flags its 1366 × 657 and 1280 × 720 frames with `data-short`.
- **No text on the page is under 16 px except three named cases:** the 12 px 'Placeholder' and 'Preview' tags, which are chrome, and the 15 px wordmark step for names over 24 characters below 30rem (see "Wordmark"). References, dates, approvals and the ask's second line were raised from 15 to 16 px.
- **No font layout shift on the example.** next/font uses fallback metrics, and value cells are fixed-width in rem and right-aligned.
- **Rows wrap, never truncate.**
  - Below 30rem a row becomes label over value; `nowrap` with an ellipsis would cut model copy.
  - From 75rem a run row sits on one line: payee, reference, amount, mark.
  - Each approver's name and time are kept together.

**Under the four preview pairs.** The template sets roles and weights, and `typeStyle` supplies the faces. Display is always 500, which all four pairs have. Measured at 500:

| Visitor style             | Display + body                | Tabular figures                                                       | How it reads                                                                                   |
| ------------------------- | ----------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| warm                      | Fraunces + Instrument Sans    | Fraunces no (0s 651.53 / 1s 456.17 px); Instrument Sans yes (592/592) | the closest to the example: a heritage statement (the tile's fallback fixture)                 |
| minimal                   | Manrope + Inter               | both yes (611.2 / 638.03)                                             | a Swiss instrument (the tile's bakery)                                                         |
| bold                      | Bricolage Grotesque + DM Sans | Bricolage yes (600.64); DM Sans no (678.41 / 330.89)                  | a financial magazine (the tile's physio); wide set, so tracking is never tighter than -0.015em |
| dark (dark scheme forced) | Sora + Inter                  | both yes (664.97 / 638.03)                                            | a night print                                                                                  |

- **Figure face on visitor pages (decision 7).**
  - IBM Plex Mono comes in through a third variable, `--template-font-figure`. `typeStyle` sets it for this template id only; `app/preview/_components/fonts.ts` declares it with `preload: false` and `display: 'swap'`.
  - That touches five shared places, not two. `typeStyle(style)` takes the template id too, and its call site changes (`app/preview/[slug]/[templateId]/page.tsx:80`, which passes only `answers.imagery.style`). `app/tokens.css` gains `--font-figure: var(--template-font-figure, ...)` in `@theme inline` beside the display and body faces (`:33-37`), so templates get a `font-figure` utility through `templates/tailwind.css:19`, since gate 3 bans `font-family` in a template. And the example route sets the variable itself.
  - A browser downloads a face only when text uses it, and a visitor's page can show only digits the owner typed. So most visitor pages download nothing extra.
  - The tile's physio fixture shows the exception: '45 minutes' came from the owner's sentence, so the 45 prints in Plex Mono under the bold pair, where DM Sans cannot set tabular figures.
- **Wordmark.** It is set in the display face at 1.375rem from 30rem and 1.125rem below.
  - Below 30rem it is 1rem for names over 12 characters and 0.9375rem over 24, chosen in `assemble`.
  - It wraps with `text-wrap: balance` and never breaks inside a word.
  - Measured at 375, 'Calder Valley Sports Physiotherapy' sets on three lines, its widest word 104 px in a 116 px box. Beside it sit a 133 × 44 'Book a session' ask and a 60 × 44 Menu toggle, in a 68 px bar with no overflow.

##### Palette

- **Example hex #4a2a6a, 'engraving violet',** the ink of an engraved banknote. Both schemes are derived with `deriveTokens`, as a visitor's page would be (decision 2): light by default, `?scheme=dark` for the other.
- **Two alternates in the tile's Hex control**, to compare in both schemes:
  - **#1F6B52, jade.** It passes every pair but sits close to Mullion's viridian.
  - **#6b1e2c, oxblood,** a banknote ink outside the SaaS-purple zone. In light it gives a faint rose paper (#fef8f9 page, #f2e8e9 paper); in dark it turns the ask salmon (#d9818a).
- **Brand colour marks action only: asks, links and the seal.** Figures and totals are always `on-surface`. So a red or oxblood brand can never make a total read as a loss.
- **Where the numbers come from.** Every ratio below comes from the phase-2 palette tool: the repo's own `deriveTokens` and `solvePairs`, scored with culori `wcagContrast` and floored to two decimals.
  - **Hex set:** 27 hexes, in both schemes. That is the tool's 17-hex corpus (`lib/tokens/derive.test.ts` plus `lib/brief/palettes.ts`) and #F5C400, #22D3EE, #84CC16, #e11d48, #c2185b, #0f7a6c, #b3261e, #1F6B52, #4a2a6a and #6b1e2c.
  - **Result:** nothing throws, and the solver moved no token for these pairs on any of them.

**Tokens, #4a2a6a.**

| Token                | Light            | Dark             | Role, and rough share of a 1440 page                                                                       |
| -------------------- | ---------------- | ---------------- | ---------------------------------------------------------------------------------------------------------- |
| surface              | #fbf9fd          | #0e0c11          | page ground and the opaque header (never glass); the tear's notches; about 70%                             |
| surface-muted        | #f2eef6          | #19171c          | the schedule stub, FAQ summaries, the footer, the demo-state chrome line; about 5%                         |
| on-surface           | #17151a          | #f3f0f7          | headings, text, figures and totals, rules, paper outlines, the notch rings, the focus ring                 |
| on-surface-muted     | #56545a          | #a6a3aa          | secondary text, dotted leaders, the tear's dashes, input edges, seal band B                                |
| border               | #dfdce4          | #2f2c32          | row hairlines only; decorative, never the only edge of a control                                           |
| accent               | #ede9f1          | #232026          | paper: the counterfoil, the fee schedule, the booking form, the seal's ground and disc; about 18%          |
| brand                | #634386          | #8060a5          | the seal's underprint band only, as decoration                                                             |
| brand-deeper         | #4a2a6a          | #ae8dd5          | ask fills, the header outline and label, seal bands A and C, the rim, the initial; never a figure; 2 to 3% |
| brand-deepest        | #3a1958          | #c19fe9          | ask hover and press                                                                                        |
| on-brand             | #ffffff          | #0c0a0f          | ask labels                                                                                                 |
| glow, glow-secondary | #cfaafc, #00c09f | #c38dff, #00aa8d | unused on purpose                                                                                          |
| scrim, on-scrim      | #060509, #ffffff | #020103, #ffffff | unused: no text sits on a photograph anywhere                                                              |

- **No gradients, glass, shadows or alpha.** Every text colour is one of the ten declared pairs below.
- **Paper is always outlined.** Paper against the page is 1.13 to 1.22:1, so every paper surface gets a 1 px `on-surface` outline, broken only at the tear's notches.

**Light scheme.**

| Pair (text on ground)                                       | Where                                                   | #4a2a6a            | Worst of 27 hexes |
| ----------------------------------------------------------- | ------------------------------------------------------- | ------------------ | ----------------- |
| on-surface on surface                                       | headings, body                                          | 17.32              | 17.23             |
| on-surface-muted on surface                                 | lead, secondary text                                    | 7.13               | 7.01              |
| on-surface on surface-muted                                 | schedule stub, FAQ, footer                              | 15.82              | 15.82             |
| on-surface-muted on surface-muted                           | footer small print, disclaimer                          | 6.52               | 6.43              |
| on-surface on accent                                        | everything on paper: h1, run, totals, form labels       | 15.12              | 15.12             |
| on-surface-muted on accent                                  | lead and trust line on the stub, references, form hints | 6.23               | 6.18              |
| brand-deeper on surface                                     | the outlined header ask                                 | 10.96              | 5.39              |
| brand-deeper on accent                                      | the seal's initial (real text on the paper disc)        | 9.57               | 4.75              |
| on-brand on brand-deeper                                    | ask label                                               | 11.47              | 5.62              |
| on-brand on brand-deepest                                   | ask label on hover and press                            | 14.38              | 7.33              |
| 3:1, ask fill on the page (brand-deeper against surface)    | the header ask, filled                                  | 10.96              | 5.39              |
| 3:1, ask fill on paper (brand-deeper against accent)        | hero, schedule and form asks                            | 9.57               | 4.75              |
| 3:1, hover fill on paper (brand-deepest against accent)     | UI edge                                                 | 12.00              | 6.20              |
| 3:1, hover fill on the page (brand-deepest against surface) | UI edge                                                 | 13.74              | 7.03              |
| 3:1, input edge (on-surface-muted on accent)                | UI edge                                                 | 6.23               | 6.18              |
| 3:1, focus ring on paper (on-surface on accent)             | UI                                                      | 15.12              | 15.12             |
| border on surface (not a UI edge)                           | hairlines                                               | 1.29               | 1.28              |
| accent on surface (why paper is outlined)                   | paper                                                   | 1.14               | 1.13              |
| brand on accent (underprint, decoration)                    | seal                                                    | 6.54               | not required      |
| **Alpha: on-surface at 50% on surface**                     | **banned**                                              | **3.39, fails AA** | **3.36**          |

**Dark scheme, the night print.**

| Pair (text on ground)                     | Where                                         | #4a2a6a                  | Worst of 27 hexes |
| ----------------------------------------- | --------------------------------------------- | ------------------------ | ----------------- |
| on-surface on surface                     | headings, body                                | 17.24                    | 17.20             |
| on-surface-muted on surface               | lead, secondary text                          | 7.82                     | 7.74              |
| on-surface on surface-muted               | schedule stub, FAQ, footer                    | 15.76                    | 15.68             |
| on-surface-muted on surface-muted         | footer small print, disclaimer                | 7.14                     | 7.05              |
| on-surface on accent                      | everything on paper                           | 14.25                    | 14.13             |
| on-surface-muted on accent                | lead and trust on the stub, references, hints | 6.46                     | 6.38              |
| brand-deeper on surface                   | the outlined header ask                       | 7.01                     | 6.21              |
| brand-deeper on accent                    | the seal's initial                            | 5.79                     | 5.15              |
| on-brand on brand-deeper                  | ask label                                     | 7.10                     | 6.29              |
| on-brand on brand-deepest                 | ask label on hover and press                  | 8.82                     | 8.27              |
| 3:1, ask fill on the page                 | UI edge                                       | 7.01                     | 6.21              |
| 3:1, ask fill on paper                    | UI edge                                       | 5.79                     | 5.15              |
| 3:1, hover fill on paper                  | UI edge                                       | 7.19                     | 6.77              |
| 3:1, hover fill on the page               | UI edge                                       | 8.71                     | 8.17              |
| 3:1, input edge on accent                 | UI edge                                       | 6.46                     | 6.38              |
| 3:1, focus ring on paper                  | UI                                            | 14.25                    | 14.13             |
| border on surface (not a UI edge)         | hairlines                                     | 1.41                     | 1.41              |
| accent on surface (why paper is outlined) | paper                                         | 1.21                     | 1.20              |
| brand on accent (underprint, decoration)  | seal                                          | 3.16                     | not required      |
| **Alpha: on-surface at 50% on surface**   | **banned**                                    | **4.86, passes by luck** | **4.84**          |

- **Why alpha text is banned:** the same 50% alpha fails in light (3.39) and passes in dark (4.86), and the solver never sees it. On-surface-muted at 70% on accent fails at worst in both schemes: 3.18 light, 3.85 dark.
- **The ask label is never `on-surface`:** on-surface on brand-deeper is 1.57 light and 2.45 dark.
- **Large text** (h1 to h3, totals) uses pairs that clear 4.5:1 on every hex, so the 3:1 large-text allowance is never needed.
- **Beside the other templates (procedure B).** The ten pairs were solved with each existing template's own pairs, over the 27 hexes in both schemes.
  - That covered all eight templates one by one, plus two unions: Ember with Harbor and Summit, and Harbor with Vector and Atlas.
  - Result: `shiftedByNewPairs` was empty in 540 of 540 solves, with no order sensitivity and no throws. Showing Intaglio beside any of them changes none of their colours.
- **Swapped hex, measured.**

| Hex              | Light: ask fill, label, ratio            | Dark: ask fill, label, ratio                |
| ---------------- | ---------------------------------------- | ------------------------------------------- |
| #1F6B52, jade    | #1f6b52, white, 6.39                     | #68af93, #080c0a, 7.62                      |
| #6b1e2c, oxblood | #6b1e2c, white, 11.36                    | #d9818a, #0f090a, 7.01                      |
| #F5C400          | #796000 (deep ochre), white, 6.02        | #f5c400 (the yellow itself), #0e0b04, 11.96 |
| #808080          | #636363 (a steel engraving), white, 6.00 | #9e9e9e, #0b0b0b, 7.34                      |

- **Gains and losses (decision 10):** monochrome. The page uses:
  - a true minus, and up and down triangles drawn as SVG;
  - weight 500 against 400;
  - accounting brackets for outflows, such as (12,400.00);
  - a visually hidden 'up', 'down' or 'paid out'.

##### Signature motion: the print run

Rules draw, figures land, the total lands last, then the ask moves. Every band ends on its bottom line, which leads the eye down each document to the button.

- **Fee schedule.** When the schedule enters the viewport, it plays one sequence of about 2.3 s, once and never scrubbed. The trigger is one IntersectionObserver: threshold 0, once, no negative margin.
  1. Each row's dotted leader draws from label to value (`scale` X from the left, 0.5 s), and its value settles (a 6 px rise and fade, 0.18 s later), 70 ms apart row by row.
  2. The two strokes of the double rule draw 60 ms apart.
  3. The total rises inside a clipped row.
  4. The stub settles 8 px under the tear.
  5. The ask's arrow nudges once (0.7 s, 6 px and back).
- **Hero.** The h1, lead, ask and trust line never animate, so the LCP is painted at first paint.
  - **From 64rem, at load,** the body's run prints: rows rise inside clipped rows 70 ms apart from 0.2 s, then the total's double rule draws. This is CSS only, under `(scripting: enabled)` and `(prefers-reduced-motion: no-preference)`, with `fill-mode: backwards`, so a failed chunk hides nothing.
  - **The arrow nudges once per visit:** at the end of the WebGL moment, or at the end of the print wherever no WebGL moment can run (flag off, no WebGL, a failed context).
  - **Below 64rem** the body is below the fold, so its rows print when it enters the viewport, and the ask does not nudge.
- **Process:** one rule with three ticks draws left to right and ends at the ask, whose arrow nudges.
- **Proof:** a strike rule draws through each old value, then the new value rises.
- **Header:** the handoff fade described above.
- **Form:** on success, the seal stamps into the receipt (scale 1.35 to 1 and a quarter turn, 0.5 s).
- **Interaction:** the arrow's 4 px move on the ask; the FAQ plus turns into a minus; press scales to 0.98. Nothing is hover-only.
- **Timing and easing.**
  - Three speeds as custom properties at the top of the template's CSS: quick 0.24 s, settle 0.9 s, soft 1.4 s.
  - One critically damped spring, x(t) = 1 - (1 + ωt)e^(-ωt) with ω = 9.233 (settled to 0.999 at t = 1), sampled into 21 stops of `linear()`: 0, 0.079, 0.236, 0.403, 0.551, 0.671, 0.764, 0.833, 0.883, 0.919, 0.944, 0.962, 0.974, 0.983, 0.988, 0.992, 0.995, 0.997, 0.998, 0.999, 1.
  - `cubic-bezier(0.16, 0.52, 0.08, 1)` behind `@supports` as the fallback.
  - One `motion(delay, travel, duration, ease)` helper, so every stagger is data. Transform and opacity only.
- **GSAP: none, whatever decision 3 says.**
  - Every sequence here is a one-shot CSS keyframe run, triggered by one IntersectionObserver. Nothing is scrubbed, chained across bands or interrupted.
  - The pointer rake lives in the WebGL leaf's own draw-on-change loop.
  - CSS meets the brief for this template, so it takes decision 3 the other way: 0 B of GSAP on every page, phones and desktops alike.
- **Reduced motion.** Nothing moves.
  - Every rule is drawn and every figure shown; entrances become 0.2 s opacity fades; the success stamp simply appears; WebGL never starts.
  - The preference is subscribed to, not read once.
  - Verified in the tile: with `reducedMotion: 'reduce'`, no animation runs and the seal stays SVG.
- **What the repo needs for this template:**
  - one `lib/motion` WebGL lifecycle module (decision 4);
  - one small `whenIntent` helper (pointer, scroll or key) beside `whenScrolled`;
  - one ESLint change letting templates import those two.
  - It still needs the same ADR as the others. It uses no GSAP, but ADR 0008 decision 4 bars all of `lib/motion`, and the standards doc's import boundary (`docs/standards.md:90-93`) bars every `lib` module but tokens and copy-slots, so the WebGL module and `whenIntent` need the amendment and the recorded deviation (see "GSAP and WebGL", step 1).

##### WebGL moment: the engraving on the tear

- **What it draws.** The seal stamped across the hero's tear line, turned -8 degrees.
  - Size: clamp(8.5rem, 3rem + 8vw, 12rem). That is 136 px at 1024, 157 at 1366, 163 at 1440, and 192 from 1800.
  - Four bands of closed-form rosette rings, r = R + A cos(kθ - 2πi/N), each drawn N times at phase steps. In seal units of ±100: underprint D, R 94, A 3, k 32; band A, R 82, A 8, k 15; band B, R 62, A 7, k 10; band C, R 45, A 5, k 8.
  - A ground disc of radius 99.5 in `accent`, so the tear's dashes stop at the stamp's edge.
  - A rim at r 99, and an `accent` disc of radius 34 ringed in `brand-deeper` and hatched every 2.4 units.
  - The company's initial sits in the disc as a relief of those lines, the way banknote portraits are engraved. No words go round the ring, so it certifies nothing.
- **Placement, from 64rem.** The seal sits in the tear's zero-width grid track, centred on the tear and level with the ask's centre.
  - Its top margin is `ask gap + ask height / 2 - seal / 2`. A matching negative bottom margin keeps its box the ask row's height, so it never sizes the row.
  - The stub keeps a right padding of half the seal plus 1rem on every row. The body's total and approvals keep a left padding of the same.
  - The run above ends at least half the seal plus 1rem above the seal's centre: `padding-bottom: max(1rem, seal / 2 + 1rem - ask gap - ask height / 2)`.
  - Measured: no text line comes within 19 px of the drawn circle at any width from 1024 to 1920 in 16 px steps. That holds in all four fixtures, in normal and short mode.
- **Placement, below 64rem.** The seal sits in the body's foot beside the total or the signature, at clamp(7rem, 5rem + 6vw, 8.5rem), and stays static.
- **Tokens read.** `brand-deeper` for bands A and C, the rim, the disc ring and the initial's hatch; `on-surface-muted` for band B; `brand` for underprint D; `accent` for the ground and the disc.
  - They are read with `getComputedStyle` and parsed as six-digit hex, which `formatHex` guarantees. The parser is unit-tested over the corpus.
  - An unparseable value keeps the SVG, never white. Ink is drawn on a transparent premultiplied canvas.
- **Ring counts from device pixels.** Each band gets N = round(2A × d / 200 / 3.2), clamped 4 to 24, where d is the seal's device-pixel diameter. Strokes then keep about 3.2 device px of paper between them.
  - At 163 device px (1440, DPR 1) bands A, B, C and D get 4, 4, 4 and 4 rings. At 326 (DPR 2) they get 8, 7, 5 and 4.
  - At the 192 px cap they get 5, 4, 4 and 4, and at 384 they get 10, 8, 6 and 4.
  - All read as clean guilloche in the tile.
- **When it starts, and how it ends.** From 64rem only, after first paint, on the first sign of intent (pointer movement, a scroll or a key), never on idle. An unattended Lighthouse run creates no context.
  - The canvas fades in over the identical SVG (240 ms, opacity).
  - The relief rises, and one highlight sweeps one and three-quarter turns round the rim on the spring (1.4 s), stopping pointing left, at the ask.
  - Then the ask's arrow nudges once. That is the end frame: the last thing that moves is the button.
  - Hovering, focusing or pressing the ask presses the seal (relief depth 1 to 1.25 over 140 ms, released on leave), so keyboard and touch get the cue too.
  - While the hero is in view, pointer movement rakes a light across the relief.
  - It draws only when an input changes. There is no loop, so no pause control is needed (WCAG 2.2.2).
  - Below 64rem the seal and the ask are never on screen together (at 375 the foot seal starts at 1,135 px against a 667 fold), so no context is created there.
- **How.** Raw WebGL: WebGL2, else WebGL1 with `OES_standard_derivatives`.
  - One full-screen quad. Rings are drawn analytically as the perpendicular distance to each ring, divided by sqrt(1 + slope²), anti-aliased over one device pixel.
  - The relief comes from a 256 by 256 mask of the initial, drawn on a 2D canvas in the display face after `document.fonts.load` (R8 on WebGL2, LUMINANCE on WebGL1). The hatch lines bend along the mask's gradient.
  - If the face takes longer than 1.5 s, or the first character is not a letter, the rosette runs without relief.
  - `powerPreference: 'low-power'`, `antialias: false`.
- **DPR, pause, loss, teardown (the shared lifecycle module).**
  - DPR is min(devicePixelRatio, 2); the canvas is at most 384 by 384 device px.
  - Context creation and shader compile run in separate tasks, with `KHR_parallel_shader_compile` when present.
  - A ResizeObserver, debounced 150 ms, reallocates with `gl.delete*`. IntersectionObserver and `visibilitychange` stop drawing.
  - `webglcontextlost` is prevented and shows the SVG. The context is also released if the viewport drops below 64rem.
  - Once the hero has left the viewport after the moment, the canvas fades back to the SVG. The module then deletes the program, buffer and texture, calls `WEBGL_lose_context`, and never re-creates it.
  - Exactly one context on the page; the booking form's seal is SVG.
- **Gates.** It runs only when all of these hold: motion is allowed, WebGL exists, the template-local constant `INTAGLIO_WEBGL` is true (decision 8), `forced-colors` is not active, and the viewport is at least 64rem.
- **Cost.** The tile's working sketch (shader plus lifecycle, unminified, with tile-only strings) is 12,617 B raw and 4,248 B gzipped.
  - Estimate 4 to 6 kB gzipped for the production leaf, plus 2 to 3 kB for the shared module. Both are lazy and outside first-load JavaScript.
  - It makes no network requests. The mask texture is 65,536 B (64 KiB) of GPU memory: 256 × 256 texels of one byte. About 90 frames are drawn during the moment, then only on input.
  - Shader compile time on a real GPU is unmeasured (gate 11).
- **Verified in the tile** (headless Chromium, ANGLE d3d11):
  - WebGL2 at 163 by 163 device px at DPR 1 and 326 by 326 at DPR 2;
  - exactly one arrow nudge at the end of the sweep, and live in the dark scheme;
  - static, with the reason shown, at 375, under reduced motion and in forced colours;
  - 'Release the context' deletes everything and calls `loseContext`, and replaying remounts a fresh canvas.

##### Static fallback

- **What it is.** An inline SVG seal built on the server by a template-local `seal-geometry.ts`, from the same parameters as the shader, so the fade lines up and a unit test can compare them.
  - One path per band (8 points per wave, one decimal, implicit line-to), repeated by rotated `use` elements, over the `accent` ground disc.
  - Strokes of 0.75 CSS px with `vector-effect: non-scaling-stroke`, in `brand-deeper`, `on-surface-muted` and `brand`, set through classes.
  - The disc's hatch is a `pattern`. The initial is real text in the display face, in `brand-deeper` on `accent`, a declared pair. The whole seal is `aria-hidden`.
- **Two ring sets for two densities.** The server cannot know the device pixel ratio, so it emits both the 1x and the 2x `use` sets, and `(min-resolution: 2dppx)` shows one.
  - Counts come from the smallest CSS size the seal takes in that slot: 136 px on the hero from 64rem, 112 px in the phone foot. The floor is 4 rings per band.
  - The band paths are shared, so the second set costs little.
- **Measured:** the tile renders exactly this build. At 163 CSS px it is 8,103 B raw and 2,282 B gzipped, both ring sets included.
- **When it shows.** It is the first-paint state for everyone, and the whole design:
  - below 64rem, under reduced motion, without WebGL, with `INTAGLIO_WEBGL` false, and after context loss;
  - with JavaScript off and in print;
  - in forced colours, where strokes become `CanvasText`, the canvas is hidden and the tear becomes a dashed `CanvasText` outline.
- **The booking form carries the same SVG.** Its stamp on success is a CSS transform, not a second context.
- **Everything else degrades the same way.** Without JavaScript, the FAQ (native `details`), the phone navigation (a wrapping row of anchors) and every block stay reachable. Nothing hides until the root is armed.

##### Sections, in order

Neutral ids and no sector icons. At most three engraved or torn devices appear on the page: the hero counterfoil with its seal, the schedule's stub, and the booking form's stub.

1. **header** (the `header` element). Job: wayfinding and the ask at every width.
   - **Build.** Sticky in normal flow, never fixed, so the bar never covers the StudioBar, which stays first in the tab order (root `overflow-x: clip`, no `overflow: hidden` ancestor). The open menu is the one exception (see "Menus and the StudioBar").
   - It is opaque `surface`, and a hairline appears once content passes under it. `scroll-margin-top` equals the header's height minus 4rem at each breakpoint.
   - **From 64rem:** wordmark or logo (logo capped at 11rem by 2.5rem), up to four anchors, and the ask with the handoff.
   - **Below 64rem:** the wordmark, the askShort ask and a 44 px 'Menu' toggle.
     - The toggle opens a 100dvh dialog sheet (`<dialog>.showModal()`). Focus moves in and is trapped; Escape and Close return it to the toggle; the page is inert. Lenis is not stopped, since a template has no handle on it: the sheet carries `data-lenis-prevent` and `overscroll-behavior: contain`, as the site's own menu does. While open it covers the StudioBar.
     - Anchors are set in the display face on hairlines, with the ask at the sheet's foot.
   - **Example:** Whimbrel; Product, Fees, Safeguards, Questions.
   - **Visitor page:** logo image or display-face wordmark (logo polarity 'either'), and model-written labels to fixed targets. Targets whose bands are null drop out.
2. **intro**, the counterfoil. Job: state the value, make the first ask, show the product and one trust signal, all in the first viewport.
   - **Build.** One sheet of `accent` paper, outlined 1 px in `on-surface`. From 48rem it is inset in the container; below 48rem it runs full-bleed with rules top and bottom.
     - The tear is a 1 px dashed `on-surface-muted` rule (6 px on, 5 px off). A half-circle notch sits at each end: 17 px, filled `surface` and ringed `on-surface`, cut into the outline, which it breaks.
   - **From 64rem:** a three-track grid (stub 7fr, a zero-width tear track, body 5fr) in three rows:
     1. kicker, h1 and lead on the stub; the run on the body;
     2. the ask and 'See the fees' on the stub; the seal on the tear; the total on its double rule on the body, bottom-aligned with the ask;
     3. the trust line on the stub; the approvals on the body.
   - **Widths:**
     - 1440: container 90rem, gutters clamp(1.5rem, 1rem + 3vw, 6rem).
     - 1920: the same container, with wider margins; the h1 caps at 88 px.
     - 48 to 64rem: one column (stub, then a horizontal tear, then body).
     - 375: h1, lead (slot capped at 170 characters), a full-width ask, the trust line, then 'See the fees'. The kicker is visually hidden below 48rem and kept for screen readers; the tear and body follow below the fold.
   - **Short laptops:** the rules under "Type".
   - **Example copy.**
     - Kicker: 'Supplier payments for finance teams'.
     - h1: 'Pay every supplier on time. Pay nobody else.' (44 characters, step 1).
     - Lead (166 characters): 'Whimbrel checks every new bank detail, puts each run in front of two approvers and matches every payment to its invoice. Friday's run takes twenty minutes, not a day.'
     - Trust line, two example facts with a hairline between them only when they share a line: '£1.42bn paid to 41,000 suppliers since 2023' and 'Two approvers on every run, always'.
     - The hero carries no placeholder. The safeguarding line and its register reference live in the assurance register.
     - Run: 'Friday run', 26 Sep 2026.
       - Quillon Steelworks, INV-20931, £3,120.00, matched.
       - Fenwright & Rye, INV-4417, £12,480.50, matched.
       - Tolland Freight, TF-09-118, £864.00, matched.
       - Marrowby Print Co., MP-3302, £1,205.90, one approver to go.
       - 39 more payments, £30,540.00. The run adds up: the four shown plus £30,540.00 make the total.
       - '43 payments £48,210.40' on the double rule; 'Approved by A. Okafor 09:12 and R. Lindqvist 09:40', each name kept with its time.
   - **Visitor page.**
     - The kicker, h1, lead and ask come from copy. The secondary link goes to `#terms` when that band exists, otherwise to `#offer`.
     - Trust line: at most two grounded items, never repeating a row's fact. One item, or none, is fine.
     - The body becomes 'At a glance': a model-written title and at most three grounded label and value rows, values in the body face at 500. The figure face is used only for an owner-typed digit. No status marks.
     - The body's bottom line is the business's signature: the name on the double rule in the display face, the place from the sentence under it, or the name alone when there is no place.
     - The seal carries the initial.
     - A hero photo, when present, sits inside the body's top corner beside the title at 3:2: 12rem wide from 75rem, 10rem from 64rem, and 12rem at 48 to 64rem. Below 48rem it becomes a full-width band at the head of the body.
       - It never crosses the tear. With no photo, the title takes the row.
       - **Loading.** Below 48rem the band is in the first viewport whenever the stub is short: under fallback copy the stub's last part ends at 453 of 667 at 375 (see "Evidence"), so a band of about 343 × 229 px sits largely above the fold, several times the one-line h1's area, and at Lighthouse's 412 × 823 mobile viewport (`lighthouserc.json:12`) even the example's stack leaves it in view. So the photo is one element loaded with `loading="eager"`, `fetchPriority="high"` and a true `sizes` at every width, and is not lazy: a lazy LCP image fails Lighthouse's `lcp-lazy-loaded` audit and delays LCP against the 2,000 ms line. It is not preloaded, since it is not the LCP at every width. The alternative is to move it below the rows on phones. Measure the fallback and bakery fixtures with a photo at 375 × 667 and 412 × 823 before claiming a text LCP.
     - **Under fallback copy:** rows and kicker are null.
       - The h1 is the first sentence when it is 90 characters or fewer. Otherwise it is that sentence's first clause (up to the first comma, semicolon, colon or dash) when the clause is 12 to 90 characters, and the rest of the sentence, capitalised, moves to the body as a note in the body face at 1.125rem, sealed. Only when no such clause exists is the h1 the company name, with the whole sentence as the note. In the tile, Ashworth & Pell's 152-character sentence gives a 78-character h1 at step c and the note 'With fittings by appointment and most alterations ready within the week.'
       - The trust line is a fixed claim-free chrome line, 'A first message commits you to nothing.', so the first viewport keeps a trust signal.
       - No words appear twice. The ask is 'Get in touch'.
3. **terms**, fees, second on purpose. Job: answer the price objection with the whole arithmetic, then ask on the bottom line.
   - **Build.** From 64rem, the h2 and lead stick in columns 1 to 4 (CSS `position: sticky`) and the schedule takes 5 to 12.
     - Rows are label, dotted leader and value. Digit runs are in the figure face; words stay in the body face.
     - Below a notched tear, the `surface-muted` stub carries the total and the ask on one double rule, plus one line of fine print.
     - At 375 every row is label over value, never a sideways-scrolling table.
   - **Example.** h2 'Fees, in full'.
     - Rows: Platform, per month, £0; Domestic supplier payment, £0.20 each; International payment, 0.35% over mid-market; Approver seats, Unlimited; Bank detail checks, Included; Setup and migration, None; What Whimbrel earns, the 0.35% and the £0.20.
     - A worked month for a 120-person firm: 400 domestic payments £80.00; £60,000.00 abroad at 0.35%, £210.00; platform £0.00. Total, a month: £290.00.
     - 'Checked by Amara Osei, pricing. Last changed 1 September 2026.' Fine print: 'No contract. A month's notice to leave.'
   - **Visitor page.** Only terms the hero did not already use, in words, at most four rows; otherwise null. The bakery and physio fixtures have none left.
     - Prices appear only if the owner typed them. `rules.ts` checks only that each run of digits appears somewhere in the owner's sentence (`lib/copy-slots/rules.ts:10,46`), so '45 minutes' lets '£45 a session' through and '2024' lets '£20' through, and '£', 'price' and 'per month' are never checked. A price row therefore needs its own check that the whole amount, with its currency sign, appears in the sentence, which needs the owner's sentence in `copyViolations` (see the claim list under assurance). The figure face prints what passes. The motion is identical.
4. **offer**, product proof. Job: prove the product is real and specific, without screenshots. No ask.
   - **Build.** Three capability rows separated by hairlines: a fragment drawn in code on the left (5 columns), and an h3 with up to 64ch of body on the right (6 columns). Rows never alternate sides. One column below 64rem, fragment first.
   - **Example:**
     - 'Every new bank detail checked': a payee record, account name matches, checked 09:02.
     - 'Two approvers on every run': two signature lines with names, roles and times.
     - 'Matched to the invoice': an invoice reference and amount joined to a payment reference, 'Synced to your ledger'.
     - No real product, bank or software names.
   - **Visitor page:** the brief's offers.
     - The fragment slot shows a detail photo at 3:2 (lazy, true `sizes`, square corners).
     - When there is none, it shows a specimen plate: `accent` paper with a static underprint of waved lines in `brand`, and the offer's short label in the body face.
5. **assurance**, safety and compliance. Job: answer 'is our money and data safe, and who can move it' before the final ask. Ask: the text link 'Request the security pack'.
   - **Build.** h2 and lead in columns 1 to 4; a register in 5 to 12, in a plain 1 px `on-surface` frame.
     - Each row has a section mark and ordinal in the display face, a name, one plain sentence and, on the example only, a monochrome 'In place' with a drawn check.
     - Then a documents row, the register line and the link.
     - The tile shows this block at 1440.
   - **Example.** h2 'Where your money sits, and who can move it'. Seven rows:
     - client money held in segregated safeguarding accounts at partner banks, apart from Whimbrel's own;
     - two-person approval that cannot be switched off;
     - bank detail checks before a first payment;
     - passkeys or hardware keys for every user;
     - encryption in transit and at rest, data stored in the UK;
     - an independent penetration test every year, summary on request;
     - every action logged and exportable for auditors.
     - Documents: security overview, data processing agreement, penetration test summary.
     - The register line is a placeholder: '[Legal name] is authorised by the [regulator] under the [regulations] for the issuing of electronic money. Firm reference [000000].'
     - No real regulator, scheme, standard or certification body appears anywhere.
   - **Visitor page.** 'What you can hold us to' appears only when the sentence states commitments: at most three, grounded, with no status column. Otherwise the band is null.
     - A claim list rejects regulated, authorised, licensed, insured, protected, safeguarded, compliant, encrypted, secure, guaranteed and free, plus regulator, scheme and standard acronyms, unless the owner typed them.
     - Under today's contract no template can enforce it. `copyViolations` receives only the copy (`lib/copy-slots/contract.ts:22`) and returns `SlotViolation`s, which are length reports (`lib/copy-slots/validate.ts:5`) that `fromSlotViolation` turns into 'N characters; must be min to max' (`lib/copy-slots/rules.ts:55-60`), so a template cannot even report a banned word. Only `ruleViolationsIn` sees the owner's words (`lib/ai/copy.ts:55-58`), and those words are `answers.description` (`build-concepts.ts:111,155,166`). The list, and any 'unless the owner typed them' exception, needs one shared contract change: `copyViolations(copy, ownersWords)`, able to return `CopyViolation`s (path and reason) beside `SlotViolation`s, with `lib/ai/copy.ts:55-58` passing `ownersWords` and converting only the slot kind. It touches `lib/copy-slots/contract.ts` and `lib/ai/copy.ts`, and none of the eight templates if the parameter is optional and the return type widens to the union.
     - The documents, register line and security-pack link are null.
6. **process.** Job: make switching feel small, then ask at the natural decision point. Ask: the primary, where the rule ends.
   - **Build.** Three steps on one horizontal rule with three ticks, each ringed in `surface`, so the rule reads as passing behind (Summit's craft). The rule ends at the ask. Vertical below 48rem.
   - Step labels are words in the body face at 500 ('First', 'Then', 'After that'), never numerals.
   - **Example:** 'A 25-minute demo'; 'Connect your bank and ledger, an afternoon'; 'Your first run the same week'.
   - **Visitor page:** the brief's three steps, model-written or the shared fallback's claim-free three. Timing phrases are null.
7. **proof.** Job: show results for firms like the visitor's, just before the objections and the form. No ask.
   - **Build.** Corrections the accountant's way: the old value struck through with one rule and the new value beside it, marked up as `del` and `ins` with a visually hidden 'was' and 'now'.
   - **Example.**
     - Corrections: Friday's run, a day becomes 20 minutes; month-end close, 6 days becomes 2 days; payments to a changed bank detail, 3 last year becomes 0.
     - Two signed statements in the display face at h3 size, over a signature hairline:
       - 'Friday's run used to take a day. It is done before the ten o'clock meeting now.' Priya Raman, Financial Controller, Fenwright & Rye.
       - 'The bank detail check stopped a changed account in our first month.' Tom Adeyemi, Finance Director, Quillon Steelworks.
     - A ledger: paid to suppliers, 12 months, £1.42bn, up 38%; suppliers paid, 41,000; median run, approval to paid, 19 min, down 4 min; payments to a changed bank detail, 0.
     - Footnote: 'Illustrative figures for a fictional company.'
   - **Visitor page:** worded corrections only when the sentence states a before and an after (at most two, grounded). Otherwise the band is null. Statements and ledger are null.
8. **contact**, the FAQ and the booking form. Job: clear the last doubts and take the booking. This is the conversion point, last before the footer. Ask: the form's submit.
   - **Layout.** From 64rem the FAQ takes columns 1 to 6 and the form 8 to 12.
     - The form is sticky beside the FAQ only when it fits the viewport, checked at 1280 by 720 and 1366 by 657.
     - Below 64rem the FAQ comes first, then the form. `#contact` targets the form.
   - **FAQ.** Native `details`, six on the example: cost, contract, accounting-system fit, fraud liability, data location, switching time.
     - 56 px summaries with a plus that turns into a minus; answers at 64ch, body face, no mono.
     - It works without JavaScript.
   - **Form.** A counterfoil of its own.
     - The stub carries h2 'Book a demo' and three next-step lines: 'A reply within one working day', '25 minutes on your own supplier run', 'No card, no contract'.
     - A notched tear follows, then the fields. The static seal overhangs the top-right corner.
     - Fields: name, work email and company; monthly supplier payments (a select: under 100, 100 to 500, 500 to 2,000, over 2,000); and a topic as two 48 px radio rows ('A demo', 'The security pack'), preselected by the link that brought the visitor.
     - Visible labels, autocomplete tokens (`name`, `email`, `organization`), and 'All four fields are needed.' above them.
     - 48 px fields on `surface` with `on-surface-muted` edges. The submit is the primary ask.
     - An alternative route: 'Or call 0113 496 0000', from Ofcom's drama range. Values never go into the URL, with or without JavaScript: the submit is inert without it (`type="button"`, or a React function action, never a native `<form>` with no action, which submits GET to the current URL as Harbor's and Summit's do), and a visible note says the form needs JavaScript.
   - **States, all in the tile at 375:**
     - **Sending:** label 'Sending', fill `brand-deepest`, fields locked, `aria-busy`.
     - **Error:** an alert with a 2 px `on-surface` border and a drawn '!' glyph: 'Your booking was not sent. Check the field marked below, or call 0113 496 0000.' The field gets a 2 px `on-surface` edge and an inline message, 'Enter the whole address, like name@company.co.uk', joined by `aria-describedby`. It is monochrome; there is no danger token.
     - **Success:** the fields give way to a receipt: 'Booked. Thank you, Amara.', the reply promise, the details as ledger rows, and a reference on a double rule. The seal stamps in.
   - **Visitor page.**
     - Three to five FAQs whose answers restate the sentence or say how to ask. One is on how cost is agreed, and one on what happens after sending.
     - Fields: name, email and message, with labels from copy and the ctaLabel submit. The stub's next-step lines are the trust items.
     - Decision 5's demo state: nothing is sent. The receipt says 'Your message is ready for {company}', and the seal stamps.
     - One line of chrome on `surface-muted`, with a 'Preview' tag, says: 'Nothing was sent. On the live site this message goes straight to {company}.' No mailto.
     - Without JavaScript the submit is inert and the demo note is visible from the start, as Mullion and Placard specify, so a native GET never writes the name, email or message into the URL. `TemplateAssets` supplies no endpoint (`lib/copy-slots/assets.ts:26-30`).
9. **footer.** Job: wayfinding, contact and the regulatory slot. No ask.
   - **Build.** `surface-muted` ground; the wordmark and a one-line description; three link columns, every link a 44 px row; the contact line.
     - Under a double rule sits the disclaimer slot, in the body face at 16 px, `on-surface-muted`, 64ch. Then come photo credits and the copyright line. No watermark.
   - **Example disclaimer**, tagged Placeholder: '[Whimbrel Payments Ltd], registered in [England and Wales], company number [00000000], registered office [address]. Authorised by the [regulator] as an electronic money institution, firm reference [000000]. Client money is safeguarded and is not covered by [deposit protection scheme]. Whimbrel is a fictional company and this is example copy; a real firm replaces it with wording its compliance team has approved.'
   - **Visitor page:** the slot is null and never generated. The lead's email shows as plain text, and Pexels credits appear only when stock was used.

**Each size, designed.**

- **375:** the stub order above, the phone bar (wordmark, askShort, Menu), every row label over value, and the body below the tear, full width.
- **768:** an inset sheet in one column with a horizontal tear; inline asks; process and proof still vertical.
- **1024:** the counterfoil grid, the seal at 136 px, two-line run rows, the sticky schedule heading, capability rows side by side.
- **1440:** the same in a 90rem container, with one-line run rows.
- **1920:** the same container with wider margins. Display sizes cap (h1 88 px, seal 192 px), so the measure never stretches.
- No block is full height, so no `vh` unit is used. The menu sheet uses `100dvh`.

##### The fact budget (visitor pages)

A sentence of at most 400 characters holds about six to eight facts. The page never shows more facts than the sentence holds.

| Slot             | At most                          | Where each fact must come from                                                            | When the sentence runs out                         |
| ---------------- | -------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Kicker           | one phrase                       | restates the sentence                                                                     | null (visually hidden on phones anyway)            |
| h1               | one sentence                     | restates the sentence                                                                     | the fallback rule above                            |
| Lead             | one or two facts, 170 characters | restates the sentence                                                                     | null                                               |
| Trust line       | two items                        | grounded, and never a fact a sheet row already shows                                      | one item; under fallback the fixed claim-free line |
| At a glance rows | three                            | grounded values; labels are short titles of up to 24 characters                           | fewer rows; null under fallback                    |
| Signature        | name and place                   | the company name, and a place the sentence names                                          | the name alone                                     |
| What's included  | four rows                        | only terms the hero did not use                                                           | null                                               |
| Commitments      | three                            | only commitments the sentence states                                                      | null                                               |
| Corrections      | two                              | only a before and an after the sentence states                                            | null                                               |
| FAQ              | three to five                    | answers restate the sentence or say how to ask; no new times, prices, policies or results | fewer                                              |

- **The grounding rule.** Every content word of a value must appear in the words the copy model is shown. Words are lower-cased, stop words dropped, and a simple suffix stem applied, so 'delivery' meets 'deliver'.
  - **What it can check against.** The copy model is never shown the owner's sentence: `copyPrompt` sends `JSON.stringify(brief)`, the template name and the guide (`lib/ai/prompts.ts:52-58`), and the brief is the brief model's own paraphrase ('positioning: one sentence ... in their words', value propositions 'drawn from what the owner said', `:27-36`). A check against the sentence would flag the brief's own paraphrases, which the model cannot see to fix. So Phase 3 either adds the owner's sentence to `copyPrompt` (a shared prompt change, recorded in an ADR) or grounds against the brief fields the model is shown (positioning, value propositions, steps, statement). The tile's bakery was built straight from the sentence, which skips the brief stage, so it shows the budget, not the check.
  - It is checked in the copy stage beside `rules.ts`'s digit rule, which needs the owner's words in `copyViolations` (see the claim list under assurance). An ungrounded value is a violation fed back to the model, and the retry prompt must name the ungrounded words: today it says only 'Your last answer broke these limits' (`lib/ai/prompts.ts:61-68`).
  - **What happens when it fails.** No violating value is ever stored. `writeCopy` returns the copy only when there are no violations (`lib/ai/copy.ts:55-59`); otherwise the step retries, and after `CONFIG.copy.attempts` the whole template's copy is replaced by `fallbackCopy(brief)`, after up to six paid calls (`build-concepts.ts:166-173`). So a strict grounding rule raises the fallback rate for the whole page, not just one row. `assemble` cannot drop a single row, because it gets only the parsed copy and `TemplateAssets` (logo, images, email; `templates/render.tsx:24-45`, `lib/copy-slots/assets.ts:26-30`), with no sentence to check against; per-row dropping would need the sentence passed through `TemplateAssets` or a stored flag, a shared change.
  - A contract test runs the check over the three fixtures, and over invented rows that must all fail: 'Baked each morning' against a sentence silent on mornings, 'From the shop counter', and 'Ask us anything first'.
- **Shown in the tile.** Hollinby Bakehouse is built only from a 383-character sentence with eight facts, of which the hero uses seven:
  - kicker, fact 1; h1, fact 2; lead, fact 7;
  - trust line, facts 5 and 6; rows, facts 2, 3 and 4; the signature, from fact 1;
  - fact 8, Yorkshire flour, is unused, and nothing is padded;
  - What's included and the corrections are null.
  - The physio fixture shows one trust item and two rows.
  - The earlier tile's invented 'Baked each morning' and 'From the shop counter', the filler 'Ask us anything first', and the implied outcome 'Queue at the counter / Order ahead' are all gone.

##### Trust plan

- **Security and compliance.**
  - Example:
    - the assurance register: the safeguarding line with its placeholder register reference, status words and documents;
    - the placeholder register line, and 'Request the security pack';
    - FAQ answers on fraud liability and data location.
    - The hero's trust line carries two example facts and no placeholder.
    - No real regulator, scheme, standard or certification body is named. Each is a dashed-underline bracket tagged 'Placeholder', which a screen reader announces as a placeholder.
  - Visitor page: no compliance, security or regulatory statement is ever generated; the claim list enforces it once the shared `copyViolations(copy, ownersWords)` change lands (see assurance). Commitments appear only when stated, and the seal carries only the initial.
- **Transparent pricing or fees.**
  - Example: the full schedule with 'What Whimbrel earns', a worked month, a double-ruled total, a signature and a date, the ask on the bottom line, and a cost FAQ.
  - Visitor page: terms left over after the hero, or null, and a required FAQ on how cost is agreed. Digits appear only when the owner typed them.
- **Product UI drawn from copy.**
  - Example: the payment run on the counterfoil's body, and three drawn fragments. All come from the content object, never a screenshot.
  - Visitor page: the 'At a glance' body in the business's words; the fragments become 3:2 detail photos or specimen plates.
- **Proof metrics.**
  - Example: the trust-line figures, three figure corrections, two signed statements and a four-line ledger.
  - Visitor page: worded corrections only when stated. No figure-shaped block ever appears without a figure (gate 14).
- **Regulatory disclaimer slot.**
  - Example: the footer slot, structured and marked as a placeholder.
  - Contract shape: `legal: { register: string, disclaimer: string } | null`, set null in `assemble` and never model-written. On a visitor page it is absent.
- **How it reads for a non-fintech brief.** The fintech character is carried by type (a transitional serif, and a figure face that prints only real digits), by layout (one outlined sheet, dotted leaders, double rules, the bottom-line ask) and by chrome (the tear and the seal). None of it depends on figures.
  - In the tile: the bakery under the minimal pair, the physio under the bold pair (its one owner-typed digit in Plex Mono), and the fallback tailor under the warm pair.
  - Each reads as a careful local business with a signed, sealed sheet, not an invoice.

##### Performance plan

- **LCP 2,000 ms or less.** The h1 is server-rendered text with no entrance.
  - The example faces come through next/font with fallback metrics; Newsreader goes through next/font/local with `adjustFontFallback`.
  - The visitor photo is small beside the body's title from 48rem, but below 48rem its full-width band can be the largest paint whenever the stub is short (the fallback and bakery fixtures), and at 412 × 823 even under the example's stack. So it is eager with `fetchPriority="high"` and a true `sizes` at every width, never lazy. Which element is the LCP at 375 × 667 and 412 × 823 is measured on the fixtures, not claimed.
- **CLS 0.02 or less.**
  - Value cells are fixed rem widths.
  - The seal's box is fixed by its width and aspect ratio, and its margins keep it out of row sizing.
  - The canvas fades by opacity over an SVG of the same size, and the header handoff is opacity on a stacked layer.
  - The preview faces' swap after first paint may re-wrap the h1. That cost is shared with the other eight and unmeasured.
- **TBT 150 ms or less.**
  - No GSAP.
  - WebGL only after intent, from 64rem, with shader compile split from context creation.
  - At most three client leaves (header handoff and menu, the in-view observer, the booking form) plus the WebGL leaf, and no rAF loop at rest.
- **Bytes.**
  - Example fonts: 136,032 B (Plex Sans 400 and 500 from one variable file).
  - A visitor page loads no extra face unless the owner typed a digit into a value cell; then Plex Mono 500 adds 14,888 B.
  - GSAP: 0 B. The seal SVG is 2,282 B gzipped inline. The WebGL leaf is lazy.

##### Principles carried from the four, and what is not carried

- **Ember.**
  - Carried: sampled-spring `linear()` easings with `@supports` fallbacks and one duration family; reveals that hide nothing without JavaScript; ornaments painted from tokens (the seal's strokes, as the laurel masks were); a relative isolate root; one brand colour kept for action.
  - Not carried: the textured photo hero, cut-outs, caps eyebrows, laurels, the ordinals band and the full-bleed brand band.
- **Harbor.**
  - Carried:
    - the whole hero stack in one viewport, in the right order;
    - transform-only clipped-row reveals for every landing total, and `motion(delay, travel, duration, ease)`;
    - crisp hairlines with no border arithmetic;
    - worded values where figures are banned, and greys as declared pairs, not alphas;
    - the FAQ as native `details` beside the form;
    - a full-screen phone menu, now a real dialog.
  - Not carried: capitals, the lit phrase, neon on black, the stats row over a dimmed photo, the glowing filled plan card, and tagged gap-px cells.
- **Summit.**
  - Carried: one action colour used only for action, with a label that never changes; three named speeds; an inert menu, `aria-expanded`, and one h1 then h2 then h3; a rule passing behind ringed ticks.
  - Not carried: the photo faded to white, the sticky stacking deck, black rectangles, dashed rings, the outline watermark, and the text-beside-a-product-card hero.
- **Vector.**
  - Carried: WebGL that reads the tokens, holds in either scheme and falls back to the static state, never white; dramatic scale contrast (80 px display against 19 px body at 1440); a whole-text alternative wherever text is split.
  - Not carried: a colour field behind the headline, the serif-italic payoff, stadium duotones, glass pills, the letter-by-letter pin and rows of huge light words.
- **Phase 1 fixes:**
  - a sticky header in flow, and an ask in the phone bar;
  - declared pairs only, and clamp() with a rem term;
  - body at least 16 px and 64ch;
  - 44 px targets, including footer links;
  - neutral ids and no sector icons;
  - a text LCP at first paint;
  - asks that never dead-end or point up;
  - one WebGL context with a full lifecycle.

##### Distinct from

- **Atlas, the repo's fintech-coded page and the one to be furthest from:**
  - None of Atlas's props: no 3D clay, coins, wallets, safes, bank cards or crypto marks.
  - No market furniture: no market table, sparklines, converter, red or green.
  - None of its surface style: no pale blue wash, gradient pills, rounded geometric sans or soft shadows.
  - Instead: one torn paper sheet, square buttons, a serif and a mono, and money shown as the company's own payments and fees, not a market.
  - The hero is no longer Atlas's or Summit's text column beside a product visual: the words and the product share one sheet, split by a tear.
- **Aurora:** no centred hero, no product window rising from a two-hue glow, no traffic-light chrome or 'Today' rows, no pills, and no closing box with light pooling up.
- **Monolith:** no floating mini-cards, no lit or gradient words, no equal icon-card grids, no '2.7K+' strip. Figures are exact and live inside sums.
- **Meridian:** no capsule header or logo tile, no announcement chip, no screenshot rising from a glow, no eyebrow over every h2 (one kicker, hero only), and no faint oversized numerals.
- **The studio's home:**
  - no ink, fluid or smoke; every band edge is straight and ruled;
  - no heavy grotesque with a serif-italic word, and no metallic text;
  - no capsule header, active dot, navy and sky alternation, prompt box or browser frames.
- **Sheaf:** B2B demo against consumer download. Intaglio has a torn sheet, rules, a transitional serif and a mono against Sheaf's rounded app cards and grotesques; line-art engraving against a particle pour; a square one-cell button against a rounded two-line key.
- **Mullion:** no colour-blocked panes or tile field.
- **Placard:** no Clarendon banner, margin notes, run-in heads, graded photo plates, or raking light across a continuous sheet.
  - Intaglio's paper is one counterfoil with a tear and a seal, set in a 500-weight transitional serif and engraving violet. Placard has a slab serif and a vermilion spot colour.
  - If both are chosen, Intaglio keeps its transitional serif and its counterfoil; Placard should carry no double rules, and Intaglio carries no margin notes.

##### Risks

- **Heritage drift.** Engraving and a counterfoil can tip into 'old private bank' or a cheque book. The flat product run, the mono figures and the three-device cap hold it modern; the owner should judge the tile.
- **A counterfoil on a bakery's page** could read as a receipt. The visitor sheet is titled from copy, carries no prices, ends on the business's signature and sits beside the ask.
  - The three fixtures of procedure L (bakery, physio, fintech) must be signed off at 375 and 1440, in both schemes and all four pairs.
- **The seal as a certification mark.** It carries no words. If the owner still reads approval into it, show the logo at its centre or keep the static SVG only.
- **Invented facts.** The grounding rule's word check can be fooled by recombining the sentence's own words: 'deliver' and 'morning' make 'Delivery in the morning'. The fixtures and the guide must hold the line.
- **Moiré on untested densities.** The ring-count rule was checked at DPR 1 and 2 in Chromium only; DPR 3 phones never create a context, but other engines are unverified. At DPR 1 the 163 px seal gets four rings per band, which reads plainer than larger sizes.
- **Budget.** `templates/render.tsx` imports every template, so each new template's client leaves reach every preview page. Phase 3 should load client code by template id.
- **Placeholders** in the register and footer may look unfinished to the owner. That is deliberate honesty, and the owner should agree to it.
- **Plex's reserved name.** Google's subsetted files may not carry the Plex name without IBM's permission (OFL-FAQ 2.6); the fallback is IBM's own webfonts, self-hosted unmodified (see "Type").
- **The fallback's clause split** is a deterministic rule on punctuation, so a sentence whose first comma falls in a list ('We sell bread, cakes and pies ...') gives a short, odd headline. The 12-character floor and the name fallback limit it; the fallback corpus test must include such sentences.
- **Violet tints the paper faintly lilac,** as Summit's alternate cards are. Oxblood's dark scheme turns the ask salmon. The jade and oxblood alternates exist for the owner's choice.
- **Tight fits.** At 1024 × 768 the example's trust line ends at 681 of 768 px, and a 65 to 90 character visitor headline relies on the step caps.
- **Names.** Web searches found no fintech called Intaglio or Whimbrel Payments, but that is not a trademark search. Every fixture business and supplier also needs a Companies House check.

##### What the mechanism cannot handle

- **Figures, fees and claims.** `rules.ts` bans digits the owner did not type, and listed claim words. So fees, figures, statements, the register line and the disclaimer live only in optional sections that `assemble` sets null.
  - A real fintech lead's visitor page shows the worded version and no compliance line. A brief field for approved wording would be new work.
- **No industry signal** exists in the brief or the selector (decision 6). This page will be shown to bakeries and physios as often as to fintechs, so it is neutral by construction.
- **Tabular figures.** Fraunces and DM Sans have none, so the Plex Mono override needs decision 7: a third variable in `typeStyle`, keyed on template id.
- **No success, danger, or gain and loss token.** Every state, the form's error included, is monochrome (decision 10).
- **No compliance vocabulary in `rules.ts`.** The template needs its own claim list, because changing the shared list would touch all eight, and that list needs the shared `copyViolations(copy, ownersWords)` change described under assurance.
- **Grounding needs the owner's sentence where the template's violations run.** The digit rule already sees what the owner typed. `copyViolations` does not receive the sentence today (`lib/copy-slots/contract.ts:22`), and the copy model never sees it (`lib/ai/prompts.ts:52-58`); without both changes, the fact budget is enforced only by counts and the guide.
- **Contact.** On a visitor's page the only address is the lead's own, so the form needs decision 5's demo state and ADR-worded chrome. No calendar booking exists.
- **Image slots declare no ratio.** They supply landscape photos or uploads in order. The body's corner photo and the detail plates crop with `object-fit: cover`, so a portrait or logo upload crops badly.
- **The initial** comes from the company name. A name starting with a digit, emoji or non-Latin letter gets the rosette without relief, and an image logo cannot become engraving.
- **Meta and the WebGL switch.** Per-template meta needs decision 9's optional contract field. The WebGL switch is a template-local constant (decision 8), because templates may not import `lib/config`.
- **Chrome strings for decision 11's list:**
  - 'Menu', 'Close', 'Placeholder', and 'Preview' with the demo-state line;
  - the form's 'Sending' and its error sentences;
  - the visually hidden 'was', 'now', 'up', 'down', 'matched' and 'one approver to go';
  - the fallback's link and nav labels ('See what we do', 'What we do', 'How to start', 'Questions');
  - the fallback's trust line, 'A first message commits you to nothing.', and the form's no-JavaScript note;
  - 'Photos from Pexels', and the copyright line.
- **Nothing to prove it with yet.** There is no fixture render path and no axe or Lighthouse run on any template route. Phase 3 must add them to prove the null-optional page, both schemes, the four pairs and every fallback.

##### If the owner decides otherwise

- **1, set size:** no design change. The id becomes `t09` or `t10`, or the page stays example-only.
- **3, GSAP in templates:** no change either way, since Intaglio uses none.
- **4, helpers copied, not shared:** the WebGL lifecycle (about 2 kB) lives in the template with its own tests. No visible change.
- **5, the contact mechanism:**
  - A real endpoint: the same form posts and keeps its receipt state.
  - An honest mailto: the form becomes one 'Write to {company}' link beside the next-step lines.
- **6, a fit signal:** fintech briefs see Intaglio more often. Figures stay example-only, and the worded design stays as the neutral fallback.
- **7, no font override:** figures and value cells take the body face with `tabular-nums`. That works in Instrument Sans and Inter, but breaks in DM Sans under the bold pair. The ledger voice then rests on the rules, leaders and seal.
- **8, a `TemplateAssets` field or data attribute:** only the place where the switch is read changes.
- **9, declined:** the route's generic title and the studio's description stay.
- **10, a gain and loss token:** the triangles could take it, with the monochrome code kept as the primary cue.
- **11, chrome moved into copy:** the strings above become slots with fixed fallbacks.

##### Open questions

1. **Colour:** engraving violet, jade #1F6B52, or oxblood #6b1e2c? Compare them in the tile's Hex control in both schemes.
2. **Placeholders:** the register reference now lives only in the assurance register and footer. Does the owner accept visible Placeholder brackets there, instead of plausible-looking fake regulator text?
3. **The seal:** keep it as a mark with no words, or put the logo at its centre when an image logo exists?
4. **The visitor signature:** the company name and place, or the name only?
5. **Placard:** if both are chosen, are two serif-on-paper templates in one set acceptable?
6. **The line budget:** may a Phase 3 tile or spec page carry `prettier-ignore` on dense CSS blocks, as this tile does?
7. **Newsreader:** route (c) at 60,724 B, or the lighter static cut at 23,624 B with a flatter headline?

##### Evidence

- **Tokens and ratios:** the phase-2 palette tool (`palette.mjs`), running the repo's own `deriveTokens` and `solvePairs`, cross-checked 252 of 252 against vitest.
  - Ten pairs plus the UI checks over the corpus and ten further hexes (27 in all) in both schemes: no throws, no solver moves.
  - `--with` each template and two unions: 0 of 540 solves shifted, no order sensitivity.
- **Fonts:**
  - The phase-2 font tool (`font.mjs`): licence from google/fonts `METADATA.pb`; tabular figures measured in headless Chromium on next/font's own css2 URL, at 500 and 400.
  - Newsreader's three routes: the latin woff2 sizes from URLs built by next/font's own `validateGoogleFontFunctionCall`, `getFontAxes` and `getGoogleFontsUrl`, with the static and optical-size cuts rendered side by side at 80 and 38 px.
  - The reserved font names come from each family's `OFL.txt`.
- **First viewport.** Frame pixels from the top, StudioBar included (subtract 56 for the example route, which has no bar). Measured by the tile's own live readouts, and by a probe that asserts each frame's scale is 1. Chromium, Google-served faces.

| Fixture           | Viewport          | h1                | Ask        | Trust line | 'See the fees' | Last part vs fold                |
| ----------------- | ----------------- | ----------------- | ---------- | ---------- | -------------- | -------------------------------- |
| Example (step 1)  | 1280 × 720, short | 60 px, 197 to 381 | 494 to 559 | 575 to 629 | 505 to 549     | 629 of 720 (573 without the bar) |
| Example           | 1366 × 657, short | 60 px, 197 to 320 | 461 to 527 | 543 to 567 | 472 to 516     | 567 of 657 (511)                 |
| Example           | 1440 × 900        | 80 px, 241 to 486 | 629 to 695 | 715 to 739 | 640 to 684     | 739 of 900 (683)                 |
| Example           | 1024 × 768, short | 60 px             | 546 to 611 | 627 to 681 | 556 to 600     | 681 of 768                       |
| Example           | 1920 × 1080       | 88 px             | 760 to 825 | 845 to 899 | 770 to 814     | 899 of 1080                      |
| Bakery (step b)   | 1280 × 720, short | 52 px, 197 to 357 | 513 to 561 | 577 to 602 | 515 to 559     | 602 of 720                       |
| Bakery            | 1366 × 657, short | 52 px             | 487 to 535 | 551 to 576 | 489 to 533     | 576 of 657                       |
| Bakery            | 1440 × 900        | 67 px             | 559 to 607 | 627 to 652 | 561 to 605     | 652 of 900                       |
| Physio (step c)   | 1280 × 720, short | 46 px, 197 to 338 | 424 to 472 | 488 to 513 | 426 to 470     | 513 of 720                       |
| Physio            | 1366 × 657, short | 46 px             | 397 to 445 | 461 to 486 | 399 to 443     | 486 of 657                       |
| Physio            | 1440 × 900        | 55 px             | 577 to 625 | 645 to 670 | 579 to 623     | 670 of 900                       |
| Example           | 375 × 667         | 162 to 280        | 455 to 520 | 536 to 611 | 615 to 659     | 659 of 667                       |
| Bakery            | 375 × 667         | 162 to 266        | 387 to 435 | 451 to 501 | 505 to 549     | 549 of 667                       |
| Physio            | 375 × 667         | 162 to 325        | 446 to 494 | 510 to 535 | 539 to 583     | 583 of 667                       |
| Fallback (step c) | 375 × 667         | 162 to 293        | 317 to 365 | 381 to 405 | 409 to 453     | 453 of 667                       |

- **Seal clearance sweep.** The distance from the drawn circle (layout width × 0.995) to every text line box on the sheet, from 1024 to 1920 in 16 px steps, in all four fixtures, normal and short mode.
  - The minimum is 19 px (physio, normal), against the 16 px rule. No text crosses the tear.
  - An earlier run that did not pin the frame's scale gave false misses; the probe now asserts scale 1.
  - Measured against the rotated bounding box instead of the drawn circle, the short mode at 1504 px and wider comes out about 1 px under 16, because the box is about 13% wider than the circle.
- **Tile checks:**
  - no horizontal scroll at 320, 375, 768, 1024 or 1440, and no clipped text except the intentionally hidden kickers;
  - every target in the phone frames and form states at least 44 px;
  - every phone bar fits;
  - WebGL at DPR 1 and 2 with one nudge, static at 375, under reduced motion and in forced colours;
  - the first Tab stop ringed 2 px in `on-surface`.
- **Tile bug fixed in this pass.** The frames' body size used to follow the tile's viewport, because `1cqi` declared on the container itself resolves against the viewport. It is now set on the container's children. Phone first-viewport positions were unaffected, since the hero sets its own sizes.

##### Changed after review

- **Composition.** The hero became the counterfoil: one sheet, the seal on the tear beside the ask, the total's rule level with the ask. It replaces the text column beside a product card.
- **The ask.** A single cell with an arrow; no equals sign anywhere; the header ask has no glyph.
- **Laptop folds.** Short-laptop rules, and measurements at 1280 × 720, 1366 × 657, 1024 × 768 and 1920 × 1080.
- **The WebGL moment.** It now ends on the ask's arrow, runs from 64rem only, and creates no context below.
- **Facts.** The fact budget and the grounding rule replace the old slot counts. The trust line is capped at two, the sheet at three rows, and the invented bakery terms are gone.
- **Placeholders.** The hero's trust line carries two example facts and no Placeholder chip.
- **The tear.** A notched tear line replaces the ringed-hole perforation.
- **Handoff.** It watches every in-page ask, and the fill is a stacked, aria-hidden layer.
- **Mono and type sizes.** Mono sets digit runs only, and text of 15 px was raised to 16 px.
- **Newsreader** is specified as a next/font/local file (the old call throws).
- **GSAP** was dropped for this template.
- **New roughs:** the booking form in five states, the assurance register, and the physio and fallback fixtures.
- **Colour.** Oxblood was added as an alternate; figures and totals were moved off the brand colour.
- **Tile fixes:** the character counts, the 320 overflow, the concept cut to three sentences, the lead at 166 characters, approvals kept with their times, the static seal's size stated from measurement, and the phone captures stitched instead of repeating.

#### Sheaf

Fintech template, direction 2 of 2. A consumer savings app for the self-employed. It draws saving as a stack you can read: every payment's share is a band of grains, and each band is labelled by its own statement row. The page says what it costs and how the company is paid before it asks for anything. Style tile: `docs/directions/sheaf.html`. Screenshots are in `.compare/template-analysis/directions/sheaf-*.png`:

- full pages at 1440 and 375, stitched from viewport segments so nothing repeats;
- hero frames at 375, 768, 1024, 1440 and 1920;
- dark heroes at 375 and 1440;
- the visitor's hero at 375, 1920 and 1440 dark;
- a three-frame pour;
- the conversion point at 1440 and 375, with its states;
- the headers at 320.

##### At a glance

- **Template:** fintech. Id `t09-sheaf` if the set grows to ten (decision 1).
- **Segment:** consumer. UK sole traders such as electricians, cleaners, photographers and illustrators. The product is a phone app that moves a chosen share of every payment into an easy-access tax pot paying variable interest. The pot is held at a partner bank in the customer's own name. It is self-serve and download-led, and open to new customers: one honest state, not a waitlist.
- **Example company (fictional):** Stonechat. Kestrel is not used: Kestrel Finance is on an FCA warning list, Kestrl is a UK fintech app, and other Kestrel firms trade in payments. A web search found no app or finance company called Stonechat or Sheaf, but a trademark search is still needed. Fictional people: Maya Okonjo (founder), Jess (electrician, Stockport), Arun (photographer, Leeds).
- **Target visitor:** a sole trader aged about 25 to 55, on a phone in the evening after a tax bill caught them short. They distrust apps that are free until they are not, and they read the small print. They act only once they know the catch and know they qualify. On a second visit they are on a laptop at the kitchen table, comparing two or three providers.
- **Single primary conversion goal:** a download started. Every ask lands on one card, `#start`, in `#contact` after the FAQ, the last section before the footer. On a phone the card's action is the store link; from 48rem it is a code to scan or 'Email me the link'. No ask points back up (gate 13).
- **Primary CTA:** 'Get the app', with one label everywhere.

##### Concept

Sheaf draws the tax pot as a tall column of grain bands, one band for each payment's share, stacked to scale on the floor where July's bill was paid and labelled by a ledger whose rows are the statement, with a dashed line marking the next bill. The column paints settled for everyone; once the WebGL leaf holds a context, the newest payment's band is drawn as an empty dashed outline, and with the column in view its £240 pours in and carries the pot across the line for January's bill, level with the hero key, while big plain type and one filled key carry the rest. On a visitor's page the same column holds three equal bands, each labelled by one of the business's own `#services` rows, and the pour adds the first of them.

##### Why it should convert

This is reasoning only. Conversion cannot be measured here, and nothing below claims an outcome.

1. **Cost and catch before the ask.** '£0 a month' is set in the display face above the hero key. Directly under it: 'We are paid from the interest: the bank pays 4.25%, you get 3.85% and we keep 0.40%.' The doubt that '£0' raises is answered before the first ask, and `#paid` shows the split in full straight after the hero.
2. **A small first step.** The key's second line says what happens next, 'Set up in about 2 minutes, with no credit search.', which removes the credit-score worry at the click. The card at `#start` lists who can join as plain text beside a live action. The three-question check is optional and never disables anything.
3. **One filled ask in view.** From 48rem the header ask is outlined while the hero ask is on screen. It fills once the hero ask leaves and is outlined again while `#start` is on screen. Below 48rem a thumb-height dock takes over; it sinks once the card's own action is on screen and stays down below it. Two filled asks never compete, and no ask points back up.
4. **Proof and trust in the first viewport.** An example-only proof line sits under the key: '2,418 sole traders use Stonechat · Rated [rating] on [app store]', with placeholder chips. The card ends 'Held in your name at [partner bank]'. The first repeat ask, after `#paid`, has a short customer quote beside it.
5. **A benefit you can read.** The column is an information graphic, not a jar. It shows where every pound came from, that interest is small, that the pot was emptied for July's bill, and that the latest payment tips it over January's line.
6. **Objections in the order people raise them:**
   - cost and the catch (hero);
   - the split in full (`#paid`);
   - how it works (`#process`, with the app drawn);
   - where the money is (`#safety`);
   - proof (`#proof`);
   - who is behind it (`#about`);
   - the questions, then the card (`#contact`).
7. **A plain voice.** Big type and short sentences, a reading face built so no letter can be mistaken for another, and every figure in one tabular face.

##### Buttons and asks

- **Primary key:** brand-deeper fill, on-brand label, 14 px corners and a transparent 2 px border, which keeps the key's edge in forced colours.
  - The hero key is at least 64 px tall with two lines: 'Get the app' at 1.125rem weight 600, then 'Set up in about 2 minutes, with no credit search.' at 1rem, the page's small-print floor (it was 0.9375rem, 15 px). Elsewhere it is 48 px with one line. Below 30rem it is full width, and at 375 the second line wraps, so the key is 84 px tall (measured; 81 px at 15 px). From 48rem it stays 64 px, and the laptop folds below are unchanged.
  - Hover, focus-visible and :active all step the fill to brand-deepest, so touch gets every state, and a press scales to 0.98.
  - The focus ring is 2 px on-surface at a 3 px offset.
- **Secondary, outlined:** a 2 px brand-deeper border and label on surface. Hover, focus and press fill it with surface-muted. It is used only for the header ask before the handoff and while `#start` is on screen.
- **Text links:** brand-deeper, weight 600, underline 2 px (3 px on hover), inline-flex, at least 44 px tall. 'How we make money' goes to `#paid`; on a visitor's page, 'See how it works' goes to `#process`.
- **Menu:** a 44 × 44 icon button (two bars) with a visually hidden 'Menu' label. It opens a 100dvh dialog sheet with the ask, built as "Menus and the StudioBar" describes: `showModal()`, `data-lenis-prevent` and `overscroll-behavior: contain` on the sheet, an inert page, and the StudioBar covered only while it is open.
- **Where the ask appears:**
  - the header at every width;
  - the hero;
  - after `#paid` (with a quote), after `#process` and after `#proof`;
  - the phone dock;
  - the action on the `#start` card.

  Every ask is a link to `#start`, which has `scroll-margin-top` equal to the header height minus 4rem plus 1rem, so the card's top and its action land in view. On a desktop the card's submit, 'Email me the link', is the one filled key in view. It is a different action, and its label says so.

- **Dock, below 48rem:**
  - A full-width filled key on a surface strip with a hairline top, safe-area aware.
  - It rises (translateY 100% to 0, 0.5 s on the spring) once the hero ask leaves the viewport. It sinks once the `#start` card's own action comes on screen and stays down for the rest of the page, because below the card its link to `#start` would point back up (gate 13). The FAQ sits above the card, so a reader working through the questions has the ask in reach, pointing down.
  - It is last in the DOM, so the StudioBar keeps the first Tab stops. The template's root carries a matching `padding-bottom`, and the template's own focusable targets carry `scroll-margin-bottom` of the dock's height, so a focused control is never under it. `scroll-padding-bottom` is not used: it applies to the scroll container, which is `<html>` (the site sets `scroll-padding-top: 4rem` there, `app/globals.css:371-373`), and a template's rules are scoped under its own root, which does not scroll (ADR 0008 decision 5, ADR 0024). A `:root:has(.sheaf)` rule would work but sits outside the template's scope and would need recording.
- **Visitor page:** the ask slot on every ask, with no second line: written from the brief's ctaLabel and held to 4 to 22 characters by the template's own slot range, since nothing upstream enforces the prompt's 4 to 22 (`lib/copy-slots/brief.ts:23`, `build-concepts.ts:173,180`). The fallback uses the ctaLabel only when it fits, else 'Get in touch', and is tested with ctaLabels of 0, 3, 4, 22, 23 and 40 characters. The header uses the ask when it has 12 characters or fewer, else an `askShort` slot of at most 12 characters, with a validated fallback ('Get in touch'). The cap was measured at 320 in all five pairs with the 44 × 44 Menu: 12 characters leave the wordmark at least 105 px. A 14-character label still fits but squeezes the wordmark to 81 to 87 px.
- **Header at phone widths:** the wordmark is `min-width: 0` and wraps with `hyphens: auto`. It drops to 1.125rem below 24rem, and a name over 18 characters takes 1.125rem below 64rem and 1rem below 24rem. Measured with 'Northern Physiotherapy and Sports Rehab' in all five pairs: there is no horizontal overflow at 320 or 375, and the header grows from 64 to 83 px at 320 and to 66 px at 375.

##### Type

**Example page** (next/font/google in `app/examples/sheaf/page.tsx` only). All facts below come from the lab font tool, measured on the file next/font self-hosts.

| Role                                                                                                            | Face                                                                                                                                                   | Weights used                                                                           | Licence                                                                             | Figures (measured, 96 px, ten 0s against ten 1s)                                                                                    |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Display: h1 to h3, the wordmark, the balance, the price line, ledger amounts, every figure on the example route | Familjen Grotesk (Familjen STHLM AB), `Familjen_Grotesk`                                                                                               | 700 display; 400, 600 and 700 for figures in text (one variable file, wght 400 to 700) | SIL Open Font License 1.1 (github.com/google/fonts ofl/familjengrotesk/METADATA.pb) | Tabular by default: 560/560 px at 400 and 700; lining                                                                               |
| Body: text, labels, keys, ledger labels                                                                         | Atkinson Hyperlegible Next (Braille Institute, Applied Design Works, Elliott Scott, Megan Eiswerth, Letters From Sweden), `Atkinson_Hyperlegible_Next` | 400 and 600 (variable file, wght 200 to 800)                                           | SIL Open Font License 1.1 (ofl/atkinsonhyperlegiblenext/METADATA.pb)                | tnum yes: proportional by default (638.09/406.73 px at 400, 645.77/428.81 at 600), 622.73/622.73 under tabular-nums at both; lining |

- **Why figures go to Familjen on the example route.** Atkinson's zero is slashed, and no OpenType feature removes it (`zero`, `ss01` to `ss09`, `cv01` to `cv09`, `salt`, `onum` and `pnum` were probed), so '£0 a month' would read '£Ø a month'.
  - A `withFigures(text)` helper wraps each digit run (with a leading '£' and a trailing '%') in a span set in the display face with `tabular-nums lining-nums`. It runs **only on the example route**, where the body is Atkinson.
  - On a visitor's page no preview pair uses Atkinson, so running digits stay in the body face. Only tabular cells (the balance, ledger amounts, the price line) take the display face. Measured in the tile: the visitor frame has 0 figure spans, and under Warm the example frame's running digits render in Instrument Sans while the balance stays in Fraunces.
- **Contrast of the pair:** a tight grotesque with ink traps against an open, wide reading face. There is no serif, mono or italic, and `font-synthesis: none` bans faux italic and faux bold.
- **Resemblance:** neither face appears anywhere in the repo or in the Intaglio, Mullion and Placard tiles.

**Scale.** Every clamp has a rem term. The 375, 1440 and 1920 sizes were read live in the tile. The scale is the template's own, a departure from ADR 0008 decision 3 for the Phase 3 ADR (see "Departures").

| Element                                                    | clamp()                                   | 375 | 1440 | 1920 |
| ---------------------------------------------------------- | ----------------------------------------- | --- | ---- | ---- |
| h1, up to 40 characters                                    | clamp(2.75rem, 1.5rem + 5.2vw, 6.75rem)   | 44  | 99   | 108  |
| h1, 41 to 64                                               | clamp(2.375rem, 1.3rem + 4vw, 6rem)       | 38  | 78   | 96   |
| h1, 65 to 90                                               | clamp(2rem, 1.2rem + 3vw, 4.5rem)         | 32  | 62   | 72   |
| h2                                                         | clamp(2rem, 1.3rem + 2.6vw, 4rem)         | 32  | 58   | 64   |
| Price line ('£0 a month'), the largest figure after the h1 | clamp(1.75rem, 1.2rem + 1.6vw, 2.5rem)    | 28  | 40   | 40   |
| h3 and the balance (tabular)                               | clamp(1.5rem, 1.1rem + 1.4vw, 2.25rem)    | 24  | 36   | 36   |
| Lead                                                       | clamp(1.125rem, 1rem + 0.35vw, 1.3125rem) | 18  | 21   | 21   |
| Body                                                       | clamp(1.0625rem, 1rem + 0.2vw, 1.1875rem) | 17  | 19   | 19   |
| Small print, labels, ledger rows                           | 1rem                                      | 16  | 16   | 16   |

- **Leading and wrapping.** Display leading is 0.98, with tracking of -0.025em and `text-wrap: balance`. `assemble` picks the h1 step by character count. Sentence case, and headings take no closing full stop.
- **The h1 cap.** The cap is 6.75rem, so a 32-character headline holds one line in the 90rem container at 1920, and the whole hero fits the 900 px frame there (measured: key 506 to 570, card 300 to 855).
- **Measure**, width over the width of '0' in its face, measured:
  - hero lead: 47 at 1440 and 1920, 50.4 at 1024 (it sits above the row there), 52.9 at 768;
  - FAQ answers: 62 at 1440, 61.9 at 1024 and 768.

  Body runs 45 to 62ch and the lead is capped at 40rem.

- **No font layout shift.** The example uses next/font with `adjustFontFallback`. The balance and ledger cells are tabular, and the column has a fixed height in rem. On a visitor's page the preview pair swaps in after first paint, a shared cost the analysis left unmeasured.
- **No per-template font override is needed (decision 7).**

**Under the four preview pairs.** The display face is always 700, which all four have. The identity is structural: the full-width headline, the column and its ledger, the keys, the dock, and the cost-then-ask order. So it holds in every pair. Each pair is measured at the weights Sheaf uses.

| Style   | Display + body                   | tnum, measured                                                          | What changes                                                                                                                                   |
| ------- | -------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| warm    | Fraunces + Instrument Sans       | Fraunces 700: **no** (689.92/485.45 px); Instrument Sans 600: yes (592) | Softer. Tabular cells in Fraunces come out proportional, since the template cannot tell the pair; the tile's thumbnail shows the misalignment. |
| minimal | Manrope + Inter                  | Manrope 700 yes (611.2); Inter 600 yes (637.09)                         | Calm and even; the closest to a bank.                                                                                                          |
| bold    | Bricolage Grotesque + DM Sans    | Bricolage 700 yes (613.13); DM Sans 600 **no** (686.09/350.09)          | The loudest. Tabular cells are in the display face, so DM Sans never sets one.                                                                 |
| dark    | Sora + Inter, dark scheme forced | Sora 700 yes (664.97); Inter 600 yes                                    | The evening version.                                                                                                                           |

In every non-example pair the example's h1 wraps to two lines at 1366 and 1440. The hero key stays above the fold at 1366 × 657, with a lowest bottom edge of 638 px across the five pairs.

##### Palette

**Example hex #1e3a8a (navy), derived for both schemes (decision 2).** Light is the default and `?scheme=dark` gives the other. Navy replaces raspberry. Raspberry read as pay-later shopping, its dark scheme read as nightlife, and it sat beside Placard's vermilion and Vector's magenta. Raspberry stays in the tile as a swap. A template chooses roles, never values or the scheme.

**Roles and rough shares of a 1440 page:**

- **surface, about 62%:** the page ground and the column's interior.
- **surface-muted, about 22%:** the app's own surfaces: the pot card, the `#paid` band, the `#start` card and FAQ rows.
- **accent, about 4%:** chips, the open FAQ row and the segmented-radio track.
- **on-surface, about 7%:** all text, the column's 2 px rim and base rule, the "you" share of the split bar, and the focus ring.
- **on-surface-muted, about 2%:** secondary text, input edges, leaders, the goal line, every older band's grains, and the "us" stipple.
- **border:** rare hairlines, decorative only.
- **brand-deeper, about 3%:** keys, links, the header outline, the wordmark mark, and the newest band with its pending outline. The brand is spent on new money and on the action, so the eye links the band to the key.
- **brand-deepest:** hover and press.
- **on-brand:** key labels.
- **Unused on purpose:** brand, glow, glow-secondary, scrim and on-scrim. No text ever sits on a photo, and there are no gradients, glass or shadows.
- **Corners:** 28 px cards, 14 px keys and inputs, 10 px chips. The column is square-cornered.

**Declared text pairs (9).** Every figure below is the lab palette tool's output: the repo's `deriveTokens` and `solvePairs`, scored by culori `wcagContrast` and floored to two decimals. The solver moved no token for navy or for the tile's four swap hexes (#c2185b, #2f6f4e, #808080, #f5c400) in either scheme.

Light, #1e3a8a:

| Pair                                                                 | Hex                        | Ratio           | Use                                                                     |
| -------------------------------------------------------------------- | -------------------------- | --------------- | ----------------------------------------------------------------------- |
| on-surface on surface                                                | #13161c on #f8fafe         | 17.33           | All text                                                                |
| on-surface-muted on surface                                          | #52555d on #f8fafe         | 7.13            | Secondary text                                                          |
| on-surface on surface-muted                                          | #13161c on #ecf0f9         | 15.87           | Text on cards, ledger                                                   |
| on-surface-muted on surface-muted                                    | #52555d on #ecf0f9         | 6.53            | Secondary text on cards, goal label                                     |
| on-surface on accent                                                 | #13161c on #e7ebf5         | 15.18           | Chips, open FAQ row, radio track                                        |
| brand-deeper on surface                                              | #1e3a8a on #f8fafe         | 9.91            | Links, outlined key label                                               |
| brand-deeper on surface-muted                                        | #1e3a8a on #ecf0f9         | 9.07            | Links on cards                                                          |
| on-brand on brand-deeper                                             | #ffffff on #1e3a8a         | 10.35           | Key label                                                               |
| on-brand on brand-deepest                                            | #ffffff on #102877         | 13.19           | Key label, hover and press                                              |
| _UI, 3:1, not solved:_ input edge on page                            | #52555d on #f8fafe         | 7.13            | Inputs                                                                  |
| _UI:_ input edge, leaders and goal line on a card                    | #52555d on #ecf0f9         | 6.53            | Card parts                                                              |
| _UI:_ key on the page; newest band and pending outline in the column | #1e3a8a on #f8fafe         | 9.91            | Keys, the pour band                                                     |
| _UI:_ key against a card                                             | #1e3a8a on #ecf0f9         | 9.07            | Keys on cards                                                           |
| _UI:_ focus ring, column rim, base rule                              | #13161c on #f8fafe         | 17.33           | Also 15.87 on surface-muted                                             |
| _Graphic:_ older bands' grains in the column                         | #52555d on #f8fafe         | 7.13            | Dense and sparse bands                                                  |
| _Decorative, fails by design:_ border on surface                     | #dadee7 on #f8fafe         | 1.28            | Hairlines only; never a control edge                                    |
| **Alpha text (banned):** on-surface at 0.5 over surface              | painted #86888d on #f8fafe | **3.39, fails** | At 0.6 it happens to pass (#6f7176, 4.67), and the solver never sees it |
| **Alpha text (banned):** on-surface-muted at 0.7 over surface-muted  | painted #80848c on #ecf0f9 | **3.28, fails** |                                                                         |

Dark, #1e3a8a (keys turn periwinkle with near-black labels):

| Pair                                                                                | Hex                          | Ratio                                       |
| ----------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------- |
| on-surface on surface                                                               | #eef2f9 on #0b0d13           | 17.29                                       |
| on-surface-muted on surface                                                         | #a0a5ae on #0b0d13           | 7.85                                        |
| on-surface on surface-muted                                                         | #eef2f9 on #15181f           | 15.81                                       |
| on-surface-muted on surface-muted                                                   | #a0a5ae on #15181f           | 7.17                                        |
| on-surface on accent                                                                | #eef2f9 on #1e2228           | 14.22                                       |
| brand-deeper on surface                                                             | #759bf4 on #0b0d13           | 7.16                                        |
| brand-deeper on surface-muted                                                       | #759bf4 on #15181f           | 6.55                                        |
| on-brand on brand-deeper                                                            | #080b11 on #759bf4           | 7.26                                        |
| on-brand on brand-deepest                                                           | #080b11 on #8cafff           | 9.08                                        |
| _UI:_ input edges, leaders, goal line (on-surface-muted on surface / surface-muted) | #a0a5ae on #0b0d13 / #15181f | 7.85 / 7.17                                 |
| _UI:_ key and newest band (brand-deeper on surface / surface-muted)                 | #759bf4 on #0b0d13 / #15181f | 7.16 / 6.55                                 |
| _UI:_ focus ring, rim, base rule                                                    | #eef2f9 on #0b0d13           | 17.29                                       |
| _Decorative, fails by design:_ border on surface                                    | #2a2e35 on #0b0d13           | 1.42                                        |
| **Alpha text (banned):** on-surface at 0.5 over surface                             | painted #7d8086 on #0b0d13   | 4.90: passes here and fails on light (3.39) |
| **Alpha text (banned):** on-surface-muted at 0.7 over surface-muted                 | painted #767b83 on #15181f   | **4.17, fails**                             |

- **Band inks cannot rely on hue.** brand-deeper against on-surface-muted is 1.38 (light) and 1.09 (dark) for navy, and on a grey brand the two are near twins (#636363 against #555555). So neighbouring bands are separated by density and by one empty lattice row, not by colour. The newest band is always dense brand-deeper; the older bands alternate dense and sparse on-surface-muted.
- **Over the corpus** (the 17 hexes in `lib/tokens/derive.test.ts` plus `lib/brief/palettes.ts`, both schemes), nothing throws. The worst cases for the nine pairs, light then dark:
  - on-surface on surface: 17.23, 17.20
  - on-surface-muted on surface: 7.01, 7.74
  - on-surface on surface-muted: 15.84, 15.69
  - on-surface-muted on surface-muted: 6.43, 7.06
  - on-surface on accent: 15.12, 14.13
  - brand-deeper on surface: 5.39, 6.21
  - brand-deeper on surface-muted: 4.94, 5.67
  - on-brand on brand-deeper: 5.62, 6.29
  - on-brand on brand-deepest: 7.33, 8.27
- **Beside the other templates (procedure B).** These nine pairs were solved in union with each of the eight existing templates' pairs, over the same corpus in both schemes. They shifted 0 of 272 solved token sets, with none order-sensitive and none throwing. Atlas's own `brand` still moves for #00ff00, and Sheaf's pairs do not change it. Sheaf cannot move Ember's, Harbor's, Summit's or Vector's colours.
- **Swapped hex, all in the tile:**
  - Raspberry (#c2185b), the old example, gives pink keys (white label 6.69) and hot-pink keys on dark (6.69).
  - Grey (#808080) gives graphite keys, and the newest band is told apart only by position, density and label.
  - Yellow (#f5c400) gives olive keys (#796000, white label 6.02) on light and yellow keys with near-black labels (11.96) on dark.
  - Green (#2f6f4e), used for the visitor state, gives a quiet bakery green.
- **Gains and losses (decision 10): monochrome.** Money in: a plus, a north-east arrow and weight 600. Money out: accounting brackets, a south-east arrow and weight 400 (the floor row, '(£3,100.00)'). Both carry visually hidden 'in' and 'out'. Every success and failure state is words and an icon, never red or green.

##### The column

- **Shape.** A tall, straight-sided column with a square base, outlined 2 px in on-surface, open at the top with 7 px outward lips.
  - Width `clamp(5rem, 3.5rem + 6vw, 9rem)` and height `clamp(20rem, 14rem + 14vw, 26.5rem)`.
  - Measured: 80 × 320 at 375, 102 × 331 at 768, 117 × 367 at 1024, 142 × 424 at 1440, 144 × 424 at 1920 (floored; the clamps give 117.44 × 367.36 at 1024).
  - It sits on the card's inner left edge, so at 1440 it stands beside the hero key.
- **Bands.** Grains sit on a 4 × 3.5 px lattice anchored at the floor. Each band is a whole number of lattice rows with one empty row between bands.
  - On the example, bands are to scale (the full height is £2,000) above a floor of two rows, so September's £3.17 of interest reads as a thin band rather than vanishing.
  - At 1440 the example's bands are 25, 6, 41, 2 and 14 rows from the floor up.
  - A visitor's three bands each take a quarter of the height.
- **Inks.** The newest band is dense brand-deeper. Older bands are on-surface-muted, alternating dense (both lattices) and sparse (every other row), so each band reads against its neighbours in any hex.
- **Ledger and leaders.** Each band has one ledger row: label left, tabular amount right, at 1rem.
  - A row sits level with its band's middle, pushed apart to its own height and clear of the goal label. A leader (1.5 px on-surface-muted, with a 2.75 px on-surface dot at the band end) angles between the two.
  - The ledger reads newest first, top down, which matches the stack bottom up.
  - The base rule runs from the column's base under the ledger. The floor row below it reads 'Tax bill, 31 July ↘ (£3,100.00)'.
  - A dashed goal line crosses the column and the ledger at January's bill, labelled 'January's bill, about £1,400' just above it, or just below it when the header block leaves no room.
- **Layout.** Below 48rem the card's title and balance stand above the column, and the ledger sits beside it (80 px column, 1rem leader gap). From 48rem the title and balance sit at the top of the ledger side, beside the column's empty headroom, so the card fits the first viewport at 1440 (card 283 to 838).
  - The build computes row positions server-side in `column-geometry.ts` for the two row pitches and emits them as custom properties. Leaders are one SVG in the same coordinates.
  - Band edges snap to the lattice with CSS `round()`. This is untested outside the tile, which computes in px.
- **The example's figures** add up. The statement in `#process` and the card agree:
  - after July's bill: £0.00;
  - +£420.00 → £420.00;
  - +£96.00 → £516.00;
  - +£680.00 → £1,196.00;
  - +£3.17 interest → £1,199.17;
  - +£240.00 → £1,439.17.

  Each invoice line is 20% of the invoice.

- **Accessibility.** The column and leaders are `aria-hidden`. The ledger is the real content: a list named 'Set aside since the July bill, newest first'. In forced colours the grains take CanvasText (`forced-color-adjust: none` on the heap only), and the rim, leaders and pending outline take CanvasText too.

##### Signature motion: the handoff and the post

- **Speeds:**
  - `--sheaf-quick` 0.24 s: hover, press, focus and the handoff's 0.3 s cross-fade.
  - `--sheaf-dock` 0.5 s: the dock.
  - `--sheaf-settle` 1.1 s: entrances.
  - `--sheaf-soft` 1.5 s: the `#paid` split's long travel.
  - One curve for all of them: a critically damped spring, x(t) = 1 - (1 + ωt)e^(-ωt) with ω = 7, divided by x(1) so it ends at 1, sampled into `linear(0, 0.049 5%, 0.157 10%, 0.285 15%, 0.411 20%, 0.526 25%, 0.625 30%, 0.708 35%, 0.775 40%, 0.828 45%, 0.871 50%, 0.929 60%, 0.963 70%, 0.983 80%, 0.994 90%, 1)`, with `cubic-bezier(0.16, 0.52, 0.08, 1)` behind `@supports`.
  - The motion leans slower, as the owner prefers. Transform and opacity only.
- **The handoff (CSS, every width).** One IntersectionObserver (threshold 0, no margin) watches the hero ask, the `#start` card and its action, and toggles data attributes. The header key cross-fades from its outlined layer to its filled layer (opacity), and the dock translates.
- **The post, in `#process` (CSS).** The drawn app's statement rows post one at a time: a 12 px rise and fade, 0.12 s apart, on the settle curve, started by the same observer. The running balance is plain text.
- **The split, in `#paid` (CSS).** The solid "you get 3.85%" share scales in from the left (scaleX, 1.5 s). At 0.9 s the stippled "we keep 0.40%" share slides in from the right (translateX 100% to 0, 1.1 s), then the labels fade in (0.24 s).
- **Entrances (CSS).** A 16 px rise and fade on the settle curve, written through one `motion(delay, travel, duration, ease)` helper, with 0.12 s steps. Blocks hide only after the client leaf sets `data-armed` on the root, so JavaScript off or a blocked chunk hides nothing. The h1, lead, price line, ask and proof line never animate.
- **No GSAP (decision 3 does not apply).** Every job that needed it is gone or done in CSS:
  - the balance tick is dropped (it would have shown a false figure mid-pour);
  - the split and the post are CSS keyframes started by the observer.

  Sheaf fetches 0 B of GSAP at every width.

- **Interaction.** Keys step to brand-deepest on hover, focus-visible and :active alike, and a press scales to 0.98. The FAQ plus turns to a minus. Nothing is hover-only, and no input adds grains.
- **Reduced motion.** Entrances become 0.2 s opacity fades, and the dock and handoff change by opacity only. The WebGL never starts. The preference is subscribed, not read once.
- **The smallest repo addition:**
  - an owner-approved ADR line letting templates import `@/lib/motion/idle`, `use-motion-allowed` and one `lib/motion` WebGL lifecycle module (decision 4);
  - the ESLint change for those paths and a rule closing the `import('gsap')` loophole.

  No new dependency.

##### WebGL moment: the pour

- **Where.** Inside the hero card's column. The canvas covers the column plus 1rem above its rim, never text.
- **States.** First paint shows the settled bands in CSS for everyone, rendered on the server, the newest band filled.
  - The pending state (the newest band as an empty dashed brand-deeper outline) is gated on the root's `data-armed`, which the WebGL leaf sets only once it holds a context, and the canvas draws that state itself. It is never gated on `(scripting: enabled)`. So first paint, JavaScript off, a blocked chunk, no WebGL, the flag off (CSS cannot read a TypeScript constant, so the server renders the settled band whatever `SHEAF_WEBGL` says) and reduced motion all show the settled column, as the Phase 1 rule asks: hide nothing until the client marks the root as armed.
  - The ledger row, balance and goal are always the final figures, so every state is complete.
  - The cost: where the column is already in view when the leaf arms (a desktop hero), the band is filled at first paint, empties as the canvas cross-fades in, and fills again as the pour runs. On phones the column is below the fold when the leaf arms, so the reader meets the empty band and the pour.
- **What it draws.** `gl.POINTS` in one draw call, with no textures or framebuffers. Grains are round, soft-edged points 3.7 CSS px across (a smoothstep edge, premultiplied blending) on the lattice the CSS stipple uses. Grain counts measured:
  - hero at 1440 (142 × 424): 2,856 grains, 476 of them in the pour band;
  - phone (80 × 320): 1,186 and 204;
  - a visitor's column at 1440: 2,550 and 1,020.
- **The motion.** The vertex shader places each grain from time alone.
  - A grain is hidden until its release. It then falls from 14 px above the rim at 2,600 px/s² to within 6 px of its own column, lands 5 px above its lattice place and settles on a critically damped curve (0.14 s plus 1 s per 280 px).
  - Releases run bottom-up over 0.9 s with 0.12 s of jitter, so the band is laid row by row from its floor, like rain filling a layer rather than a stream (which read as a sand timer).
  - The pour runs 1.46 s from first release to the last settle, crossing the goal line, and ends 1.91 s after arming. The pending outline fades over the last 0.25 s. It then stops.
  - There is no loop, so no pause control is needed (WCAG 2.2.2). No input moves anything.
- **Arming.**
  - The leaf loads after `whenIdle`, and only if motion is allowed, WebGL exists, the template-local `SHEAF_WEBGL` is true (decision 8) and `forced-colors` is not active.
  - It creates its context when the column comes within one viewport of the screen, sets `data-armed` on the root, draws the pending state exactly, and cross-fades in over the static column (opacity, 0.3 s).
  - It pours once the column itself (not the card) is at least 75% in view, so on phones the pour is always seen.
- **Colours.** `--brand-deeper`, `--on-surface` and `--on-surface-muted` are read with `getComputedStyle` on the canvas and parsed as `#rrggbb`. The parser is unit-tested against every `formatHex` output of `deriveTokens` over the corpus. An unparseable value keeps the static column, never white.
- **Lifecycle (the shared module).**
  - One context: WebGL2, else WebGL1.
  - DPR `min(devicePixelRatio, 2)`; the canvas is at most 288 × 880 device px at the 9rem column.
  - A debounced ResizeObserver rebuilds positions from the same geometry and deletes the old buffer.
  - Drawing runs only while the column is in view (IntersectionObserver) and the tab is visible (`visibilitychange`). The clock advances only inside frames, with dt capped at 50 ms, so a paused pour resumes where it stopped.
  - `webglcontextlost` calls `preventDefault` and shows the settled static column.
  - When the column leaves the viewport after the pour, or on unmount, the static column shows the settled state and the canvas fades. The module then deletes the buffer, shaders and program and calls `WEBGL_lose_context`.
- **Cost.**
  - Measured in the tile sketch: 121 frames (DPR 1) or 119 (DPR 2) in all, including the 0.45 s arm wait, then zero frames. After a replay that is scrolled offscreen at once, 1 frame is drawn in 1.5 s.
  - Under reduced motion no context is created (measured: 0 canvases) and the column shows the settled state.
  - Estimated, not measured in a build: about 4 to 6 kB gzipped for the leaf plus the shared module, lazy.
  - One shader compile, off the LCP path (the h1 is the LCP).
- **Visitor page.** The same pour fills the top band, labelled by the first `#services` row. There is no goal line or floor row.

##### Static fallback

- **What it is.** The static column is HTML and CSS built from the same `column-geometry.ts`.
  - One absolutely positioned layer per band covers the interior, clipped to the band's rows by `clip-path: inset()`.
  - Each layer is stippled with one (sparse) or two (dense) `radial-gradient` dot lattices, 4 × 7 px tiles anchored at the floor. That is the shader's lattice, so the canvas's settled frame and the static state match band for band (see `sheaf-pour-3-settled.png` beside the static card in the full page).
  - The rim and pending outline are a small SVG.
- **Weight.** Measured in the tile: 787 B of markup per column, 343 B gzipped (it was 3,133 and 951 for the round pot).
- **When it shows:** settled, at first paint for everyone; under reduced motion (checked), with JavaScript off, with a blocked chunk, without WebGL, with `SHEAF_WEBGL` false and after context loss. In forced colours the grains take CanvasText.
- **Everything else works without JavaScript:**
  - the criteria are text;
  - the optional check is radios in a `<details>` with a `:has()` result;
  - FAQ answers are native `<details>`;
  - nothing is hidden until `data-armed`.

##### The hero at each width

Measured in the tile. Each frame is one viewport with the 56 px StudioBar at its top, and container units stand in for vw.

- **375 × 667 (example).** All above the fold:
  - h1 (two lines, 44 px) 138 to 224;
  - lead 244 to 325;
  - price line with the company's cut 343 to 429;
  - full-width two-line key 447 to 531;
  - 'How we make money' 541 to 585;
  - proof line 603 to 653.

  The card's top is at 683: title and balance above, then the 80 × 320 column with its ledger. The header stays in flow: the wordmark, the outlined ask and the 44 × 44 Menu, 64 px tall.

- **375 (visitor).** h1 138 to 250 (three lines at step 2), lead 270 to 378, key 396 to 460, assurance line 478 to 503, link 513 to 557, card top 587.
- **768.** The same stack, with the key at its natural width. The card is full width, 673 to 1127, with the desktop inner layout: a 102 px column, and title and balance beside its headroom.
- **1024 × 768.** h1 two lines at 77 px (151 to 302), then the lead full width above the row (328 to 387, 50.4ch). The row is 1fr 1fr:
  - left: price 405 to 504, key 522 to 586, link 596 to 640, proof 658 to 709;
  - right: the card from 411, with a 117 × 367 column.
- **1440 × 900.** h1 one line at 99 px (156 to 253). The row is 1fr 1fr with the lead back in the left column:
  - left: lead 283 to 346 (47ch), price 364 to 471, key 489 to 553, link 563 to 607, proof 625 to 651;
  - right: card 283 to 838, column 311 to 735.

  The newest band (412 to 460) sits just above the key's top. The `#paid` band starts at 910, just under the fold.

- **1920 × 900.** The content caps at 90rem inside gutters of clamp(1rem, 0.5rem + 3vw, 6rem), which is 65.6 px at 1920; the 6rem cap is reached only at about 2,933 px. The h1 holds one line at 108 px, the key is at 506 to 570 and the card at 300 to 855.
- **The gutter recipe.** Sheaf's gutter differs from the one container recipe Phase 1 set and Intaglio and Placard use, clamp(1.5rem, 1rem + 3vw, 6rem) (27.25 px at 375, 59.2 at 1440, 73.6 at 1920). Phase 3 should adopt that recipe; it widens the gutter by 8 px at every width below the cap, so the hero positions above must be measured again.
- **Laptop folds (gate 13).** The key's bottom edge is at 548 px at 1366 × 657 and 538 px at 1280 × 720 in the example pair. Across all five pairs it is at most 638 and 626. The critic's 179 px gap is gone: lead, price, key, link and proof stack at one 1.125rem rhythm, and the card sets the row height.
- **No horizontal overflow at 320 or 375 in any of the five pairs, with a 39-character name. No target under 44 × 44 at 375 or 1440** (measured, and measured again after the key's second line went to 1rem).

##### Sections, in order

Ids are neutral and the root keeps `#top`, so the hero is `#intro`. At most three client leaves (chrome with the header, handoff and dock; entrances; the `#start` card) plus the WebGL leaf.

| #   | Section                      | Job in the flow                                                                                           | Its ask                                                                                           | On a visitor's page                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --- | ---------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | header                       | Keep one ask in reach at every width                                                                      | Outlined; fills once the hero ask leaves (from 48rem); outlined again while `#start` is on screen | Logo or wordmark (a long name wraps at a smaller step); three model-written anchors to `#services`, `#process`, `#about`; the ctaLabel if it has 12 characters or fewer, else `askShort`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2   | `#intro`                     | Say what it is, what it costs and how the company is paid, ask, and show proof in the first viewport      | The two-line key                                                                                  | h1, lead, one-line ask key, a model-written assurance line (no claims) and 'See how it works'. The assurance line's fallback is the fixed claim-free risk-reversal 'Getting in touch commits you to nothing.' (the tile's visitor page shows it). The card titled by the model (up to 32 characters) holds the column with three equal bands labelled by the first three `#services` rows' short titles (up to 20 characters each), each with that row's one-line statement from 48rem. An optional `price` slot takes the price line's place above the key, else null; `rules.ts` only checks that its digit runs appear somewhere in the owner's sentence, so it needs its own check that the whole amount, currency sign included, appears there (which needs the owner's words in `copyViolations`). There is no proof line. |
| 3   | `#paid`                      | The split in full, signed and dated                                                                       | Key, with one short quote beside it                                                               | Null, with its nav link                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 4   | `#services` ('What you get') | The offer as three or four big plain statements, each a short title and a line; no icons, cards or counts | None                                                                                              | The brief's value propositions as the rows (the same titles label the column); an optional 21:9 photo band (image slot 1) that drops with no gap when null                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 5   | `#process` ('How it works')  | What happens after the ask, shown in the product                                                          | Key under the steps                                                                               | The steps set as the app's list, each with a one-word model status (fallback 'First', 'Then', 'After'); no amounts                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 6   | `#safety`                    | Where the money is and who oversees it                                                                    | None                                                                                              | Null; nothing is generated                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 7   | `#proof`                     | Figures and quotes beside a repeat ask                                                                    | Key                                                                                               | Null; no figure-shaped block remains                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 8   | `#about`                     | Warmth: who is behind it, as a signed letter                                                              | None                                                                                              | The brief's statement as the letter, signed with the company name. Image slot 0 sits at 3:2 beside it from 64rem and at 4:3 above it on phones, never under text. When slot 0 is null the letter runs alone at 62ch with no empty box. No people strip.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 9   | `#contact`                   | The FAQ, then the `#start` card (right of the FAQ, sticky, from 80rem)                                    | The card's action                                                                                 | The model's FAQ, which always includes one question on how the price is agreed, answered without figures (fixed claim-free fallback: 'How is the price agreed?', 'Say what you need in your message, and {company} will explain how the price is worked out.'), then a card with name, email and message (labels from copy) and the ask as its submit, settling into decision 5's demo state. Without JavaScript the submit is inert and the demo note is visible, so no value is written into the URL                                                                                                                                                                                                                                                                                                                           |
| 10  | footer                       | Small print at 16 px, then wayfinding                                                                     | None                                                                                              | No disclaimer; the model's one-line description, anchors as 44 px rows, credits                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 11  | dock (below 48rem)           | The persistent phone ask                                                                                  | Full-width key                                                                                    | ctaLabel                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

Example content for the sections that carry the trust story:

- **`#paid`.** 'The bank pays 4.25% on everything in Stonechat pots. You get 3.85%. We keep 0.40%. That is all we earn.' Then:
  - a full-width bar: solid on-surface for the "you" share (385 parts) and on-surface-muted stipple for the "us" share (40 parts), with the labels in words;
  - a 'We never' list: charge you a fee, sell your data, lend your money out;
  - the signature 'Checked by Maya Okonjo, founder. Last changed 1 September 2026.';
  - the key, with 'I used to dread January. This year the money was just there.' (Jess, electrician, Stockport) beside it.
- **`#process`.** Three steps ('Check you can join', 'Connect the account your customers pay into', 'Choose your share') beside the app's pot screen, drawn in code with no device frame. It shows the statement in the tile, newest first:
  - '+£240.00 → £1,439.17';
  - '+£3.17' interest → £1,199.17;
  - '+£680.00', '+£96.00' and '+£420.00';
  - '(£3,100.00) tax bill paid, 31 July → £0.00'.

  The running balance adds up.

- **`#safety`.** A three-node row drawn in code: You, your Stonechat pot, and [partner bank: placeholder], held in an account in your name. Plain rows follow:
  - eligible deposits are covered up to [limit] by [scheme];
  - you sign in with a face or fingerprint, plus a code on a new phone;
  - if Stonechat closed, your money stays at the bank and comes back to you;
  - who we are: [legal name], authorised by [regulator], firm reference [placeholder].

  Every placeholder is a dashed chip tagged 'Placeholder'.

- **`#proof`.** Four exact figures in the display face:
  - £3,140,000 set aside for tax bills;
  - 2,418 people saving;
  - a 4-minute median wait to talk to a person;
  - £0 charged in fees since launch.

  One quote: 'It moves the tax before I can spend it. That is the whole point.' (Arun, photographer, Leeds). A rating line whose source is a placeholder.

- **`#contact`.**
  - **The FAQ comes first at every width, then the `#start` card,** so the objections are answered before the final ask, as Intaglio does below 64rem, and the DOM order matches the reading order. From 80rem the FAQ sits left and the card right, sticky while it fits (`max-block-size` in dvh). At 64rem the FAQ column would run 35.9ch (measured), so below 80rem the FAQ runs full width (61.9ch) above the card. (The earlier order, card first with the FAQ under it below 80rem, put the only objection answers on a visitor's page after the final ask, and let the dock rise over the FAQ with a link back up.)
  - The card reads 'You can join if you: are self-employed or a sole trader; are 18 or over and live in the UK; have a UK bank account in your name', beside a live action:
    - on phones, 'Get the app' and one chrome line, 'Example page: a real site links to the app stores here.';
    - from 48rem, a code to scan, drawn in code from a precomputed module matrix for the example link (no encoder shipped), beside an email field (autocomplete email, required and marked) and 'Email me the link'.
  - 'Not sure? Check in three taps' opens three 56 px Yes/No segmented radios. The result is shown by `:has()`: 'You can join. The action above is ready when you are.' or 'Not yet, and here is why: …', each with an icon. It never disables the action.
  - **Submit states:** default, focus, sending ('Sending', `aria-busy`), sent ('Sent. Check your inbox for the link.', `role="status"`) and failed ('Not sent. Try again, or scan the code instead.', `role="alert"`).
  - **Field states:** default, focus (on-surface border plus the ring), and invalid on submit (a 3 px on-surface border plus 'Enter an email address like name@example.com' with an icon, never red).
  - Example FAQs: 'Why is it free?', 'Is my money safe if Stonechat closes?', 'Can I take money out today?', 'Does it file my tax return?'. Answers are native details at up to 62ch; the open row is on accent.
  - Without JavaScript the email form's submit is inert and its chrome line visible; nothing is ever sent by a native GET, so no address reaches the URL.

**Each size, designed.** The hero, the column, the header and `#contact`'s split are measured above. The sections below the hero are specified here, width by width. The tile draws only `#paid`'s split, `#contact` and the image boxes, so these layouts are not yet drawn; Phase 3 draws and measures them. Grids are 4 columns below 48rem, 8 from 48rem and 12 from 64rem, inside the 90rem container; bands own their padding, clamp(4rem, 3rem + 5vw, 8rem).

| Section                  | 375                                                                                                                                                                                               | 768                                                                                                                                                     | 1024                                                                                                                                                    | 1440                                                        | 1920                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------- |
| `#paid` (example only)   | one surface-muted card: h2, the sentence, the split bar full width with its two labels stacked in words, 'We never' as three rows, the signature, then the key full width with the quote under it | the same card; the bar's labels sit at either end on one line; 'We never' as three short columns; the key at its natural width with the quote beside it | the card splits 5 and 7 columns: h2, sentence and signature left; bar, labels and 'We never' right; the key and quote in one row under the right column | the same split with more air; the sentence at the lead size | the container stops at 90rem; the bar never runs wider than its column |
| `#services`              | h2, then three or four statements stacked on hairlines, each an h3 title over its line; the 21:9 photo band full bleed after the list, or nothing                                                 | the statements in two columns, a lone fourth spanning both; the band full width                                                                         | h2 in columns 1 to 4, the statements in two columns across 5 to 12; the band under them across 1 to 12                                                  | the same; statement lines hold 45 to 62ch                   | capped; the band stays inside the container, never full bleed          |
| `#process`               | the three steps as a numbered list in words, then the drawn pot screen full width with no device frame, then the key full width                                                                   | steps and screen side by side, 4 and 4 columns, the key under the steps                                                                                 | steps in 1 to 6, the screen in 7 to 12 (at most 30rem wide), the key under the steps                                                                    | the same                                                    | capped                                                                 |
| `#safety` (example only) | the three-node row turned vertical (You, the pot, the bank, joined by one rule), then the plain rows                                                                                              | the three nodes on one horizontal rule; the rows under them in one column                                                                               | the nodes across 1 to 12; the rows in two columns under them                                                                                            | the same                                                    | capped                                                                 |
| `#proof` (example only)  | the four figures in a 2 by 2 grid, the quote, the rating line, then the key full width                                                                                                            | the same grid; the quote beside the key                                                                                                                 | the four figures in one row of four; the quote and the key in one row under them                                                                        | the same                                                    | capped                                                                 |
| `#about`                 | slot 0 at 4:3 above the letter, the letter at up to 62ch; with no photo the letter alone                                                                                                          | the same, the photo at most 36rem wide                                                                                                                  | slot 0 at 3:2 in columns 1 to 5, the letter in 7 to 12; with no photo the letter alone at 62ch                                                          | the same                                                    | capped                                                                 |
| `#contact`               | the FAQ, then the card full width with 'Get the app'; the dock sinks once the card's action is on screen                                                                                          | the FAQ at 61.9ch, then the card (at most 40rem) with the code and the email field                                                                      | the same stack (the FAQ beside the card would run 35.9ch)                                                                                               | FAQ left, card right at 30rem, sticky                       | the same, capped                                                       |
| footer                   | wordmark, the description, anchors as 44 px rows, then the small print at 16 px                                                                                                                   | two columns: wordmark and description, anchors; small print full width under them                                                                       | three columns: wordmark and description, anchors, contact; the small print at 64ch under a rule                                                         | the same                                                    | capped                                                                 |
| dock                     | full-width key on a surface strip                                                                                                                                                                 | none: the header ask takes over from 48rem                                                                                                              | none                                                                                                                                                    | none                                                        | none                                                                   |

##### Trust plan

| Signal                      | Example page                                                                                                                                                                                                                                                                                                                                                         | Visitor page                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Security and compliance     | 'Held in your name at [partner bank]' on the hero card; `#safety` with the three-node diagram and placeholder chips; the FAQ answer on closure. No real bank, regulator or scheme is named or shown approving anything.                                                                                                                                              | Nothing is generated and `#safety` is null. A claim list (free, insured, protected, regulated, authorised, secure, guaranteed, compliant, and regulator and scheme names) rejects those words unless the owner typed them, on top of `rules.ts`, once the shared `copyViolations(copy, ownersWords)` change described under Intaglio's assurance lands; today's contract cannot report a banned word. No lock icons or badges ever. |
| Transparent pricing or fees | '£0 a month' and the company's cut in the hero, above the key; the `#paid` split, signed and dated; 'Why is it free?'                                                                                                                                                                                                                                                | An owner-typed price, if any, takes the price line's place above the key                                                                                                                                                                                                                                                                                                                                                            |
| Product UI drawn from copy  | The pot card (balance, the column, the ledger, the floor row, the goal) and the `#process` statement screen, all drawn in code, never a picture and never in a phone frame                                                                                                                                                                                           | The card's column labelled with the business's own `#services` titles; the steps set as the app's list                                                                                                                                                                                                                                                                                                                              |
| Proof metrics               | The hero proof line ('2,418 sole traders use Stonechat · Rated [rating] on [app store]'); a quote beside the ask after `#paid`; `#proof`'s four figures, one quote and a placeholder-sourced rating beside a repeat ask                                                                                                                                              | Null                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Regulatory disclaimer slot  | The footer at 16 px, tagged 'Placeholder': '[Legal name] is authorised by [regulator] as [firm type] (firm reference [000000]). Your pot is a savings account with [partner bank]; eligible deposits are protected up to [limit] by [scheme]. Interest rates are variable. Stonechat does not give tax advice; how much to set aside depends on your circumstances.' | Null; never generated for a real business                                                                                                                                                                                                                                                                                                                                                                                           |

**How it reads for a non-fintech brief** (neutral first, decision 6).

- **A bakery** (the tile's visitor state: Wrenfold Bakery, bold pair, #2f6f4e) gets a big plain headline, the ask and an assurance line. Beside them is 'What we bake': a column of three bands labelled 'Sourdough', 'Rye' and 'Seasonal loaves'. From 48rem each band carries its `#services` line ('Baked by hand through the night.'). The pour fills the top band.
  - The labels are the same titles `#services` already shows, so the card invents no operating facts. A brief with no operating facts still yields three titles, since `#services` always holds three or four rows, and the fallback copy writes them too.
  - It carries no sector nouns and no money language.
- **A physio or solicitor** gets their offer as a labelled stack ('Assessment', 'Treatment', 'Exercises at home'), which reads as "what you get, in parts".
- Procedure L adds a fourth fixture: a one-sentence brief with no operating facts.

##### Principles carried from the four, and traits deliberately not carried

**Carried:**

- **Ember:** springs sampled into `linear()` with a bezier fallback; nothing hidden without JavaScript; ornament drawn in tokens (the grains, as the laurels were masks over a token); the brand kept scarce, then spent on one element per band (the newest money and the key).
- **Harbor:**
  - the whole persuasive stack in the first viewport;
  - one `motion()` helper whose parameters are data;
  - the FAQ as native details beside the conversion point;
  - a full-screen phone menu with the ask;
  - worded values where figures are banned.
- **Summit:** one action colour used only for action, with one label; named speeds; the accessibility plumbing (an inert menu, one h1 then h2 then h3).
- **Vector:** WebGL that reads the tokens and has a designed non-WebGL state; strong scale contrast (99 px display against 19 px body).
- **Phase 1 fixes:**
  - the header in flow with an ask in the phone bar;
  - declared pairs only, with no alpha text;
  - `clamp()` with a rem term;
  - neutral ids and no sector icons;
  - no ask that points back up, and every ask on the action's own anchor;
  - native details;
  - `svh`/`dvh` for full-height blocks (only the menu sheet);
  - an explicit focus ring;
  - `scroll-margin-top` equal to the header height minus 4rem.

**Deliberately not carried:**

- Ember's photo hero, avatars and stars, cut-outs, uppercase eyebrows, laurels and giant ordinals.
- Harbor's capitals, lit phrases, neon on black, hero stats row, gap-px grids and glowing featured card.
- Summit's pre-faded photo, badge chip, rating row, sticky deck, black rectangles, dashed rings and watermark.
- Vector's colour field behind the headline, serif-italic payoff, duotone, glass header pills and letter-by-letter pin.

**Distinct from the rest of the set:**

- **Aurora:** no centred hero, glow, window chrome, or rows led by dots with progress bars. The ledger has no dots or bars; its rows are tied to a graphic by leaders. The headline is left and full width, and the keys have 14 px corners, not pills.
- **Monolith and Meridian:** no floating card cluster, pricing tile, lit words, capsule header or screenshot.
- **Atlas, the existing consumer-fintech page:** no 3D, coins, cards, market table, converter, red or green, gradient pills, rounded geometric sans or drop shadows. On the navy example the derived surface-muted is itself a pale blue (#ecf0f9), so "no pale blue wash" holds only for other hexes.
- **The studio's home:**
  - particles that stack in a square column, not a fluid mass;
  - no liquid band edges, capsule header, prompt box, browser frames or phone mockups (the app UI is drawn unframed).
  - **The shared note is larger than the hue alone.** With #1e3a8a the derived surface-muted is pale blue (#ecf0f9), painted on about 22% of the page as 28 px rounded cards with navy keys. That is close to the pale-blue rounded-card bands and navy button of the studio's home (compare `sheaf-hero-1440.png` with `home/1440-03.png` to `1440-05.png`) and to Atlas's pale blue hero (`atlas/1440-00.png`). See Risks.
- **Intaglio:** a consumer download against a B2B demo; rounded app surfaces and two grotesques against paper, rules, serif and mono.
- **Mullion and Placard:** no ruled panes, colour-blocked cells, slab banner or margin notes. Sheaf is the only one of the four with a phone dock, particles and an annotated graphic in the hero.

##### Risks

- **Toy risk.** Now low: the column is an annotated statement at hero scale, not a jar, and the pour lays a band row by row rather than streaming. Judge the pour live in the tile; the three stills are in `sheaf-pour-*.png`.
- **Resemblance of the hue and the cards.**
  - Navy shares a family with the studio home's deep blue ink (#004268) and its sky bands, and with the blue examples (#4d80ff, #468ef9).
  - It also makes the derived surface-muted pale blue (#ecf0f9), so the example's 28 px cards (about 22% of the page) with navy keys sit close to the home's pale-blue rounded-card bands and navy button, and to Atlas's pale blue hero. This is a judgement for the owner, made from the screenshots.
  - Structure, type and the graphic differ, and a visitor's page takes their own hex.
  - If the owner wants no blue on the example, green (#2f6f4e) or grey are in the tile, and nothing depends on the hue.
- **Neutrality.** The visitor column is a labelled offer, which is honest but not quantitative. Four fixture briefs must be signed off (procedure L). The fallback is the static settled column.
- **Scale honesty.** Bands are to scale above a two-row floor, so the £3.17 interest band is drawn thicker than its share (7 px, not about 0.7 px). The ledger gives the true figure.
- **The live and static columns differ slightly in weight at DPR 1:** antialiased CSS dots read a touch darker than soft-edged points. Tune the point size against the static in Phase 3.
- **Store links.** No real store badges or platform names can appear (trademarks), so the example's phone action uses one labelled chrome line. The owner must agree.
- **Budget.** Until `render.tsx` loads client code by template id, the WebGL leaf of every new template reaches every preview page. Sheaf adds no GSAP.
- **Long headlines.** The 65 to 90 character step needs checking at 375 × 667 with the StudioBar; the tile checked 32 and 42 characters.
- **A filled band that empties.** The pending outline now appears only once the WebGL leaf holds a context, so a blocked chunk or no WebGL leaves the band filled. The cost is on desktops, where the column is in the first viewport: the band is filled at first paint, empties as the canvas cross-fades in, and fills again with the pour. Judge it in the tile's live pour; if it reads as a glitch, arm only while the column is out of view, or pour straight from the pending frame without the 0.45 s wait.
- **Names.** No trademark search has been run on Stonechat or Sheaf.

##### Mechanism gaps

- `rules.ts` bans digits the owner did not type and claim words. So figures, rates, the company's cut, the ledger, proof, the safety diagram and the disclaimer exist only in optional sections that `assemble` sets null. A visitor's page keeps the order and the column, in words.
- The visitor column needs each `#services` row to carry a short title (up to 20 characters) and a one-line statement. That is a slot shape, not a new fact; the guide restates only what the brief says.
- No brief field carries an app-store link, a regulator, a partner bank or approved disclaimer wording, and none should be generated.
- The template cannot tell which pair it is set in, so under warm the tabular cells are proportional (Fraunces ignores tabular-nums).
- There is no gain, loss, success or danger token; every state is monochrome (decision 10).
- There is no field for staff names or portraits, so the example's people strip has no visitor version.
- Image slots declare no ratio or focal point: the letter photo crops 3:2 or 4:3 at centre, and one upload leaves the 21:9 band null. The hero has no image slot by design (a text LCP).
- **Chrome strings for decision 11:**
  - 'Menu', 'Close', 'Placeholder';
  - the store-link and send-link lines;
  - the demo-state line ('Sent, as a demo. On {company}'s live site this message goes straight to them.' and 'Nothing was sent anywhere from this preview.');
  - the check's two results;
  - the field error;
  - the sending, sent and failed lines;
  - the status fallbacks;
  - the assurance line's fallback, 'Getting in touch commits you to nothing.', and the price FAQ's fixed fallback;
  - visually hidden 'in' and 'out'.
- The selector has no industry signal, so a bakery can be shown this page (hence neutral first).
- The claim list and an owner-typed `price` check need the owner's words in `copyViolations`, a shared contract change (see Intaglio's assurance).

##### If the owner decides otherwise

- **1, set size:** no design change.
- **3, no GSAP in templates:** no change; Sheaf uses none. **GSAP allowed:** still none needed.
- **4, helpers copied into the template:** the WebGL lifecycle lives in the template, with no visible change.
- **5, a real endpoint:** the visitor card posts and shows its real sent and failed states (already drawn). **An honest mailto:** the card becomes one 'Write to {company}' link and the FAQ widens.
- **6, a fit signal:** consumer-finance briefs see Sheaf more often; figures stay example-only either way.
- **7, font override:** unaffected, since Sheaf needs none. If an override lands anyway, a tabular figure face could fix warm's proportional cells.
- **8, the flag as a `TemplateAssets` field or a data attribute:** only where the switch is read changes.
- **9, meta declined:** the route's title and the studio's description stay. **Granted:** the title renders as '{company}: {headline} | PinnaclePX', because the root layout's title template adds the suffix (`app/layout.tsx:33`, `lib/site.ts:5`), unless the field returns `title: { absolute }`; either way it replaces the route's 'design N of M' (`app/preview/[slug]/[templateId]/page.tsx:35-38`).
- **10, a new gain token:** it could tint the in and out marks, still paired with signs and arrows.

##### Open questions for the owner

1. Does the column read as a statement you can trust, not decoration? Judge the live pour in the tile and the dark scheme.
2. Is one labelled chrome line acceptable in place of store badges on the example?
3. Is a hero with no photograph right for a visitor who uploaded photos? Their photos first appear in `#services` and `#about`.
4. Is navy right for the example, given the studio's own deep blue, or should it be green or grey?
5. Trademark checks on 'Stonechat' and 'Sheaf'.

##### Style tile

`docs/directions/sheaf.html`, 1,212 lines, Prettier-clean. The style and script blocks carry `prettier-ignore`; Prettier formats the markup. It holds:

- **Controls:** light and dark scheme; four derived hexes (navy, raspberry, grey, yellow) plus the visitor's green; the type pair (example, warm, minimal, bold, dark, where dark forces the dark scheme). Every token is a CSS custom property set from the palette tool's output, so a rebrand is a token swap.
- **Hero:**
  - the example page and a visitor's page (Wrenfold Bakery, bold pair, #2f6f4e), each as a full-width 1440 × 900 viewport with a fold label that reads its own width;
  - 375 frames with the 667 fold marked;
  - three 320 headers, one with a 39-character name.
- **Type:** the clamp ladder with live sizes, the body at 62ch, the slashed-zero proof, a tabular statement with monochrome in and out, and four pair thumbnails.
- **Palette:** both schemes' 14 tokens with roles, every declared pair printed on itself with its ratio, the 3:1 UI pairs and the alpha rows.
- **Buttons and links:** every state, static and live, including the 44 × 44 Menu icon, plus the header handoff and the dock.
- **The conversion point:** the `#contact` frame at 1440 and 375, with the card first, the criteria, the code and email field, the optional check, the FAQ with one row open, and a strip of states:
  - field default, focus and invalid;
  - submit default, focus, sending, sent and failed;
  - both check results;
  - the visitor's card and its demo state, in the visitor's green.
- **The pour:** a raw WebGL1 sketch (paused offscreen, skipped under reduced motion) beside the static column with a pending and settled switch, and a six-step storyboard.
- **Sections:** the order with each section's job, ask and visitor-page behaviour; the `#paid` split with the key and quote after it; and the 21:9, 3:2 and 4:3 image boxes with their null behaviour.
- **Full-page captures:** `sheaf-375.png` is 750 × 61,564 and `sheaf-1440.png` 1440 × 16,863, captured one screen at a time and joined, with nothing repeated. The QR in the tile is a pattern only; the build needs a stored module matrix for the example link, not an encoder.

#### Intaglio against Sheaf

| Aspect           | Intaglio                                                                                                                                                                                                                                                           | Sheaf                                                                                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Segment          | B2B accounts payable for UK firms of about 50 to 500 staff; sales-led                                                                                                                                                                                              | consumer savings app for UK sole traders; self-serve                                                                                                                     |
| Primary CTA      | 'Book a demo', landing on the booking form at `#contact`                                                                                                                                                                                                           | 'Get the app', landing on the `#start` card (the store link on a phone; a code or 'Email me the link' from 48rem)                                                        |
| Scheme bias      | light paper in engraving violet `#4a2a6a`; dark is the night print                                                                                                                                                                                                 | light on navy `#1e3a8a` (raspberry kept as a swap); dark turns the keys periwinkle                                                                                       |
| Type             | Newsreader 500 (optical sizes), IBM Plex Sans 400 and 500, IBM Plex Mono 400 and 500 for digit runs only; all OFL (Plex's reserved name needs IBM's permission for Google's subsets); 136,032 B on the example; a Plex Mono override on visitor pages (decision 7) | Familjen Grotesk 700 (400 to 700 for figures) and Atkinson Hyperlegible Next 400 and 600; both OFL; no override                                                          |
| Signature        | a torn counterfoil: the words and ask on the stub, the payment run on the body, fees second with the ask on a double rule; at most three engraved or torn devices; a square one-cell ask with an arrow                                                             | the tax pot as a column of grain bands labelled by a ledger; cost and the company's cut above the first ask; rounded 28 px app cards, two-line keys and a phone dock     |
| Motion           | a one-shot CSS print run that ends on the ask, and the header handoff; 0 B of GSAP                                                                                                                                                                                 | the CSS handoff, the statement rows posting and the split bar; 0 B of GSAP                                                                                               |
| WebGL moment     | an engraved guilloche seal on the tear with the initial in relief; from 64rem, on intent; the highlight stops pointing at the ask, then the ask's arrow nudges; SVG fallback 2,282 B gzipped                                                                       | a pour of grains fills the newest band and crosses January's line level with the hero key; every width, armed at idle when near view; CSS stipple fallback 343 B gzipped |
| A visitor's page | an 'At a glance' sheet of up to three grounded rows, signed with the business's name and sealed with its initial; fees, assurance, proof and the disclaimer null unless stated                                                                                     | a column of three bands labelled by the `#services` titles; `#paid`, `#safety`, `#proof` and the disclaimer null                                                         |
| Strongest reason | the brief's first named case with every trust item it lists and fees answered second; first viewports measured at four desktop sizes and at 375 for the example and three visitor fixtures                                                                         | the price and the catch answered before the first ask, a small first step with no credit search, one filled ask in view, and an app identity no template has             |
| Biggest risk     | heritage drift into a cheque book or an old private bank, and dependence on the figure-face override (decision 7) to keep figures tabular under the bold pair                                                                                                      | the column reads as decoration on a bakery's page; a context created without intent; navy close to the studio's own blue                                                 |

**Recommendation: Intaglio**, for the owner to accept or overrule.

1. **It is the brief's first named case and carries every trust item it lists.** Security and compliance in an assurance register, fees second with 'What Whimbrel earns' and a worked month, product UI drawn from copy, proof as corrections and signed statements, and a disclaimer slot already shaped in the contract (`legal: { register, disclaimer } | null`).
2. **It is proven furthest for neutral first (decision 6).** Three visitor fixtures (a bakery built from a realistic, full-length 383-character brief sentence, a physio stress case and the fallback) under three of the four pairs, measured at 375 and at four desktop sizes, with a fact budget and a grounding rule so a visitor's sheet never shows a fact the owner did not state.
3. **It is the lightest on a phone.** No GSAP, no WebGL context below 64rem, and no context without intent anywhere, so an unattended lab run loads neither.
4. **It pairs well.** With Mullion it gives the widest gap in the set.

Choose **Sheaf** instead if the studio expects consumer-facing fintech and app leads, or wants a warmer, phone-first page. It needs no font override, so decision 7 could then be declined. Its WebGL should move to `whenIntent` before the build (see "GSAP and WebGL"). Under a set of ten only one fintech template ships; the other stays a tile.

### Multi-industry

**How they adapt.** Both directions work inside the existing customisation mechanism, with no pipeline change. The copy object fills fixed slots with ranged lengths and counts and a deterministic fallback; the 14 tokens come from the visitor's one hex, and the template picks roles only; the two font variables come from the visitor's style, and the dark style forces the dark scheme; and the image slots (two in Mullion, three in Placard) take the visitor's uploads in order, leaving later slots null, or ranked landscape Pexels photos when there are none. Industry shows only through the business's own words and photographs: both are neutral by construction (decision 6), with neutral ids and no sector nouns, icons or form fields. Each adds only template-local contract slots: both add `askShort` (at most 14 characters, with a validated fallback), and Placard adds `promise` (12 to 72 characters, a risk-reversal line). The three tests the brief names (short or long copy, any photography or none, a swapped accent) are answered in each spec's "How it adapts across industries".

#### Mullion

Multi-industry template, direction 1 of 2. Any small service business's page is built as one ruled frame of panes, and colour has one meaning: a coloured pane always holds an ask. The id is `t10-mullion` if the set grows to ten (decision 1). Style tile: `docs/directions/mullion.html`. Screenshots: `.compare/template-analysis/directions/mullion-1440.png`, `mullion-1440-00.png`, `mullion-375.png` and `mullion-375-00.png`.

The full-page captures are stitched from chunks of at most 4,000 CSS px taken at device scale 1, so no single capture comes near Chromium's 16,384 device px limit. The 1440 page is 22,506 px tall and the 375 page 35,541 px. `mullion-375-00.png` is the first phone screen at device scale 2.

##### At a glance

- **Segment:** small service businesses whose site has one job, a first enquiry. That covers trades, clinics, food shops, advisers, studios and small software firms. It is not for multi-product shops, booking calendars or dashboards. It is neutral by construction (decision 6): no sector icons, section ids or form fields.
- **Example company (fictional):** Kestrel Sash Windows, a sash-window restorer in York (repair, draught-proofing, new sashes, doors). Searches found real Kestrel joinery, carpentry and kitchen firms, but no Kestrel sash-window firm. Run a Companies House check before the example ships. The tile's other three businesses also need that check if any of them reaches a fixture: Hollin Lane Bakehouse, Pellow & Garth Solicitors and Low Moor Sound.
- **Target visitors:**
  - The business's own customer, usually on a phone after a search, a map listing or a friend's link, comparing two or three local providers. They want three answers in seconds: what this business does, whether it suits them, and how to start.
  - The studio's prospect judging their preview. They need a finished, credible site for their own business, whatever they typed, with any photo or none, in either scheme.
- **Primary conversion goal:** one first enquiry (a quote, booking or consultation request), sent from the form in `#contact`. That is the last section before the footer. Every ask leads there and none points back up (gate 13).
- **Primary CTA:** the business's first step as a verb phrase ("Book a survey", "Order for collection", "Book a consultation"): the ask slot, written from the brief's `ctaLabel` and held to 4 to 22 characters by the template's own slot range, since nothing upstream enforces the prompt's 4 to 22 (`lib/copy-slots/brief.ts:23`, `build-concepts.ts:173,180`). An `askShort` slot of 4 to 14 characters feeds the header cell. The fallback uses the ctaLabel only when it fits the slot, and both otherwise fall back to "Get in touch". Example: "Book a survey".

##### Concept

A small business's page as one ruled frame of panes. Colour means one thing: act here. From 64rem the ask runs as one coloured column, from the header's top-right cell through the hero's call pane, and the contact block at the close grows out of it.

##### Why it should convert

This is reasoning only. Conversion cannot be measured here, and nothing below claims an outcome.

1. **One affordance.** Brand colour appears only where you can act: the header's ask cell, the hero's call pane, the pane beside the steps and the contact block. Once a visitor learns this, nobody hunts for the next step. It is Summit's one action colour, set as blocks.
2. **An ask always in reach.** The ask is the top-right cell of the header at every width, the phone bar included. It also appears at each decision point: "Ask about this" on every service, the coloured pane beside the steps, a link after the FAQ, and then the form.
3. **The whole hero in one screen.** At 1440 × 900 the header, the kicker deck, the h1, the service index, the lead, the trust line, the ask and the photo all fit above the fold (the example's ask foot is at 490 px and the photo ends at 880, measured with the example's Source Serif 4 on its wght-only file).
4. **Proof beside each ask.** The trust line sits inside the call pane. The steps sit beside the second ask. The reasons band and the FAQ come before the last one.
5. **No dead ends.** Every CTA lands on the form, which sits below all of them, and the form is never hidden when the visitor arrives.
6. **Scannable.** The hero's service index names what you can buy before the first scroll, and services read as a ruled list, so one pass finds your need.
7. **The prospect's own picture near the top.** From 64rem slot 0 sits in the hero's second row, so a bakery sees its bread in the first screen. With no photo, the business's name is set large there instead, never a hole and never a repeat.
8. **Motion points at the ask.** The tile front crosses the call pane toward the ask in its corner, and the closing block's colour grows out of the hero ask's own column.
9. **Fast by design.** The h1 is text painted at first paint, and GSAP and WebGL arrive only after intent and only from 48rem. The budget looks reachable but is unmeasured.

##### Type

These fonts are for the example page only, loaded with `next/font` in `app/examples/mullion/page.tsx`. The licence and figure measurements come from the lab font tool, which reads each family's `METADATA.pb` and measures the exact file next/font would self-host.

| Face                              | Role                                                                               | Weights used                                                                | Licence                              | Tabular figures (measured, 96 px)                                                                                           |
| --------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Schibsted Grotesk (Bakken & Bæck) | display: h1 to h3, the kicker deck, service names, wordmark, the example's figures | 600 only                                                                    | SIL OFL 1.1 (`ofl/schibstedgrotesk`) | yes at 600: ten 0s and ten 1s both 625.38 px under `tabular-nums` (634.47 and 381.63 px without); lining                    |
| Source Serif 4 (Adobe)            | body, lead, labels, buttons                                                        | 400 for text, 500 for buttons and labels; no optical sizing (route a below) | SIL OFL 1.1 (`ofl/sourceserif4`)     | yes, tabular by default (523.84 px at 400, 532.48 px at 500 on the wght file; 451.2 and 459.84 px on the opsz file); lining |

- **The example page only.** No visitor ever gets the serif body: the tile labels the example hero "Example page faces" on the demo itself, and every visitor demo uses a preview pair.
- **Source Serif 4's route, measured.** next/font/google cannot pair fixed weights with an axis: `Source_Serif_4({ weight: ['400', '500'], axes: ['opsz'] })` throws 'Axes can only be defined for variable fonts when the weight property is nonexistent or set to `variable`', the same trap Intaglio found for Newsreader. The routes, from next/font's own URL builder:
  - (a) no optical sizing: `Source_Serif_4({ weight: ['400', '500'] })` loads one variable wght file for both weights, 50,824 B latin;
  - (b) optical sizing: `axes: ['opsz']` with the weight omitted loads `opsz,wght@8..60,200..900`, 122,360 B latin, 2.4 times the bytes;
  - (c) a trimmed opsz file self-hosted through next/font/local, as Intaglio does.
  - **Chosen: (a).** The body runs at 17 to 22 px, where the optical sizes differ least, and the example only. Tabular figures hold on both files.
- **Contrast of faces, under any pair:** a display face set at poster size (h1 up to 112 px, h2 up to 56 px, the kicker deck up to 26 px) over a plain text face at 16 to 22 px. Every one of the four pairs gives that contrast; the serif is the example's extra, not what the direction rests on.
- **No italics** (none are synthesised), no capitals, no eyebrows. The kicker is the h1's own first deck, in on-surface, not a grey label above it. Other labels are run-in bold text inside their line.
- **Loading:** only the display face is preloaded, because it carries the LCP. `adjustFontFallback` is on for both.

The scale. Every display step is a `clamp()` with a rem term; the body, labels and the longest wordmark step are fixed rem sizes. Mullion is the only direction whose body does not scale: 17 px holds 46 to 62ch at every width (see line length), and gate 8 asks only that display sizes be fluid. If the owner reads the brief as every size fluid, the body takes clamp(1.0625rem, 1rem + 0.2vw, 1.1875rem), as Sheaf's and Placard's do, and the measures are taken again. The scale is the template's own, a departure from ADR 0008 decision 3 for the Phase 3 ADR (see "Departures").

| Role                               | Value                                                                 | px at 375 / 1440 / 1920 |
| ---------------------------------- | --------------------------------------------------------------------- | ----------------------- |
| h1, step 1 (up to 28 characters)   | `clamp(2.75rem, 1.5rem + 5vw, 7rem)`                                  | 44 / 96 / 112           |
| h1, step 2 (29 to 56)              | `clamp(2.25rem, 1.25rem + 3.75vw, 5.5rem)`                            | 36 / 74 / 88            |
| h1, step 3 (57 to 90)              | `clamp(1.625rem, 0.9rem + 3vw, 4.25rem)`                              | 26 / 58 / 68            |
| kicker deck (first line of the h1) | `clamp(1.125rem, 1rem + 0.6vw, 1.625rem)`                             | 18 / 25 / 26            |
| h2                                 | `clamp(1.75rem, 1.1rem + 2.4vw, 3.5rem)`                              | 28 / 52 / 56            |
| h3, service names, the ask prompt  | `clamp(1.25rem, 1.05rem + 0.8vw, 1.75rem)`                            | 20 / 28 / 28            |
| wordmark, up to 18 characters      | `clamp(1.25rem, 1.1rem + 0.5vw, 1.625rem)`                            | 20 / 25 / 26            |
| wordmark, 19 to 28                 | `clamp(1rem, 0.9rem + 0.5vw, 1.375rem)`                               | 16 / 22 / 22            |
| wordmark, 29 to 80                 | `0.875rem`, leading 1.14                                              | 14                      |
| lead                               | `clamp(1.125rem, 1.02rem + 0.45vw, 1.375rem)`, leading 1.45, max 40ch | 18 / 22 / 22            |
| body                               | 1.0625rem, leading 1.6, max 62ch (FAQ answers included)               | 17                      |
| labels, captions, form hints       | 1rem, body 500 for labels                                             | 16                      |

- **Headline setting:** leading 1.04, tracking -0.025em. Headings are top-anchored in every pane, the hero included, so the h1 sits directly under its kicker deck and level with the lead beside it. Only the no-photo wordmark and the hero caption sit at the foot of their panes. `assemble` picks the h1 step by length and drops one step when the longest unbreakable word is over 11 characters. Step 3's phone size (26 px) is the "one step down on phones" for long headlines.
- **Wrapping:** headings use `text-wrap: balance` and body text uses `pretty`. Headings and the wordmark get `overflow-wrap: anywhere` and `hyphens: auto` under `lang="en-GB"`, with `hyphenate-limit-chars: 12 5 5`, because plain `hyphens: auto` broke "win-dows" and "work-ing" in narrow panes.
- **Line length, measured** (width over "0" in the painted face) at 768, 1024, 1280, 1440 and 1920 in the example faces and all four preview pairs: services 46.2 to 62ch, steps 46 to 62, about 46.8 to 62, reasons 50.8 to 62, FAQ answers 55.3 to 62. Every body paragraph holds 45 to 75.
- **Named exception, the lead.** The lead is a 2 to 6 line standfirst in the call pane, the narrow ask column, and measures 22.8 to 39.1ch (widest at 1920 in the example face, narrowest in Bricolage and DM Sans at 1280). The slot is capped at 140 characters so it never becomes body copy; widening the call pane would break the header's nav budget or the ask column. Record it in the ADR.

Under the four preview pairs (display 600; body 400 and 500):

- **Warm** (Fraunces with Instrument Sans): an editorial poster that softens a trade's page. Fraunces ignores `tabular-nums` (measured at 600: 664 against 465.77 px). That never shows, because a visitor page has no figures.
- **Minimal** (Manrope with Inter): crisp and quiet; the frame and the colour column carry the character. Both have tabular figures (611.2 and 638.5 px).
- **Bold** (Bricolage Grotesque with DM Sans): chunky posters that suit trades and cafes. DM Sans ignores `tabular-nums` (672.64 against 315.53 px), and again no figures reach it.
- **Dark** (Sora with Inter; the dark style forces the dark scheme): pale colour panes on near-black. Sora is the widest face (664.97 px for ten 0s), so the h1 steps are fitted to it.

- **Figures:** example page only, in the display face with `tabular-nums`, right-aligned so the digits stack. On a visitor's page the only numerals are the step numbers 1 to 3, drawn by code, so no font override is needed (decision 7).
- **No font layout shift from the grid:** pane heights come from the grid, the h1 step and fixed ratios, not from measured text. The preview pairs load with `preload: false` and swap after first paint, a shared risk that has not been measured.

##### Palette

- **Example hex:** #0f7a6c, viridian. Both schemes are derived (decision 2), and light is the default: in the real `schemeFor`, every style except dark gives light, unless the logo is light artwork.
- **Four grounds:**
  - **clear** = surface: the page, most panes and the hero caption.
  - **tint** = accent: the no-photo wordmark pane and the FAQ's left pane.
  - **muted** = surface-muted: the reasons band.
  - **colour** = brand-deeper with on-brand text: the header ask cell (from 64rem), the call pane, the pane beside the steps and the contact block. Colour is used nowhere else: the brand joints of the earlier draft are gone.
- **Rules, in two tones and two weights:**
  - The frame's outer edges and each section's top rule are on-surface, 1 px; the reasons band's top rule is 2 px.
  - Pane rules inside a section are the border token, 1 px: a decorative step (1.28:1 light, 1.41:1 dark), drawn by each pane as pseudo-elements 1 px into its neighbour and clipped by the row at the frame. They are not UI components and the panes are also told apart by spacing and headings, so WCAG 1.4.11 does not apply; record the exception in the ADR.
  - on-surface-muted is kept for input edges, chip edges and the FAQ toggle square, where 3:1 is required (7.08 light, 7.8 dark).
  - Colour panes draw no rules; their fill is the edge.
- **Other tokens:** **brand-deepest** is the hover fill (on every button and the header cell) and the WebGL front under text. **on-brand** is the text and mullion colour on colour panes and the front's lift round the ask.
- **Share of a 1440 light page (estimated):** surface 55%, brand-deeper 15%, accent 10%, surface-muted 10%, rules and type the rest.
- **Unused:** brand, glow, glow-secondary, scrim and on-scrim. No gradients, shadows, radii, alpha tints or text on photos.

Tokens come from the lab palette tool, which runs the repo's `deriveTokens` and `solvePairs`. It is cross-checked against vitest: 252 of 252 cases identical. The solver moved no token for #0f7a6c in either scheme.

| Token                 | Light             | Dark              |
| --------------------- | ----------------- | ----------------- |
| surface               | #f6fbfa           | #090f0d           |
| surface-muted         | #eaf2f0           | #141a18           |
| on-surface            | #121716           | #ecf4f2           |
| on-surface-muted      | #505755           | #9fa6a5           |
| border                | #d8e0de           | #292f2e           |
| accent                | #e5edeb           | #1d2322           |
| brand                 | #0f7a6c           | #1f8374           |
| brand-deeper          | #007466           | #56b1a1           |
| brand-deepest         | #006055           | #6ac4b4           |
| on-brand              | #ffffff           | #070c0b           |
| glow / glow-secondary | #51d7c2 / #e9884c | #00c6af / #e26c00 |
| scrim / on-scrim      | #030706 / #ffffff | #010202 / #ffffff |

The declared text pairs (ten) come first in each table, then the 3:1 non-text parts, which are not solved, then the decorative and composited cases. Ratios are floored. "Corpus worst" is the lowest ratio over the tool's 17-hex corpus, with that hex. The tenth pair, brand-deeper on accent, was added after review: the FAQ's tint pane paints its 'Ask us something else' link in brand-deeper on accent, which passed only by luck while undeclared (4.75 at worst on light), the reason alpha text is banned.

**Light**

| Pair                                  | Paints                                                                   | #0f7a6c             | Corpus worst    |
| ------------------------------------- | ------------------------------------------------------------------------ | ------------------- | --------------- |
| on-surface on surface                 | text on clear panes, h1                                                  | 17.32               | 17.23 (#ffff00) |
| on-surface-muted on surface           | intro lines, form hints                                                  | 7.08                | 7.01 (#00ff00)  |
| on-surface on accent                  | the no-photo wordmark, the FAQ side                                      | 15.21               | 15.12 (#0000ff) |
| on-surface-muted on accent            | secondary text on tint                                                   | 6.22                | 6.18 (#00ff00)  |
| on-surface on surface-muted           | reasons band                                                             | 15.91               | 15.84 (#ffff00) |
| on-surface-muted on surface-muted     | reasons secondary text                                                   | 6.5                 | 6.43 (#00ff00)  |
| brand-deeper on surface               | "Ask about this", links, the clear phone ask cell's label                | 5.44                | 5.39 (#00ff00)  |
| on-brand on brand-deeper              | all text on colour panes; the inverse button's label (the pair reversed) | 5.69                | 5.62 (#00ff00)  |
| on-brand on brand-deepest             | every hover fill; text over the front                                    | 7.48                | 7.33 (#00ff00)  |
| brand-deeper on accent                | the "Ask us something else" link on the FAQ's tint pane                  | 4.78                | 4.75 (#00ff00)  |
| non-text: on-surface-muted on surface | input and chip edges, FAQ toggle square                                  | 7.08                | 7.01            |
| non-text: brand-deeper on surface     | the clear ask cell's 3 px rule                                           | 5.44                | 5.39            |
| non-text: on-brand on brand-deeper    | focus ring and mullion inside colour                                     | 5.69                | 5.62            |
| non-text: on-surface on surface       | frame and section rules; focus ring on clear ground                      | 17.32               | 17.23           |
| decorative: border on surface         | pane rules                                                               | 1.28                | 1.28 to 1.30    |
| decorative: border on accent          | a pane rule on tint                                                      | 1.12                | 1.12 to 1.13    |
| alpha: on-surface at 50% on surface   | paints #848988                                                           | **3.39, fails 4.5** | 3.36 to 3.42    |

**Dark**

| Pair                                  | Paints                                                    | #0f7a6c           | Corpus worst    |
| ------------------------------------- | --------------------------------------------------------- | ----------------- | --------------- |
| on-surface on surface                 | text on clear panes, h1                                   | 17.3              | 17.2 (#6b2d5b)  |
| on-surface-muted on surface           | intro lines, form hints                                   | 7.8               | 7.74 (#ff00ff)  |
| on-surface on accent                  | the no-photo wordmark, the FAQ side                       | 14.28             | 14.13 (#ffff00) |
| on-surface-muted on accent            | secondary text on tint                                    | 6.43              | 6.38 (#808080)  |
| on-surface on surface-muted           | reasons band                                              | 15.77             | 15.69 (#ff0000) |
| on-surface-muted on surface-muted     | reasons secondary text                                    | 7.11              | 7.06 (#ff00ff)  |
| brand-deeper on surface               | "Ask about this", links, the clear phone ask cell's label | 7.55              | 6.21 (#ff00ff)  |
| on-brand on brand-deeper              | all text on colour panes; the inverse label               | 7.68              | 6.29 (#ff00ff)  |
| on-brand on brand-deepest             | every hover fill; text over the front                     | 9.53              | 8.27 (#ff00ff)  |
| brand-deeper on accent                | the "Ask us something else" link on tint                  | 6.23              | 5.15 (#ff00ff)  |
| non-text: on-surface-muted on surface | input and chip edges                                      | 7.8               | 7.74            |
| non-text: brand-deeper on surface     | the clear ask cell's rule                                 | 7.55              | 6.21            |
| non-text: on-brand on brand-deeper    | focus ring and mullion inside colour                      | 7.68              | 6.29            |
| non-text: on-surface on surface       | frame and section rules; focus ring                       | 17.3              | 17.2            |
| decorative: border on surface         | pane rules                                                | 1.41              | 1.41 to 1.43    |
| decorative: border on accent          | a pane rule on tint                                       | 1.17              | 1.16 to 1.17    |
| alpha: on-surface at 50% on surface   | paints #7b8280                                            | 4.92, passes here | 4.84 to 4.92    |

- **Why alpha text is banned.** The same 50% alpha passes on dark and fails on light, and the solver sees neither. The tile shows it as a painted swatch, never as live text.
- **Unsolved, never text:** brand-deepest on brand-deeper is 1.31 light and 1.24 dark, one step of the front, decoration only.
- **Focus rings, all measured pairs:** a 2 px ring inset 6 px in the control's own text colour: on-brand on a brand-deeper fill (5.69 light, 7.68 dark), brand-deeper on the on-brand inverse fill (the same pair reversed), on-brand on brand-deepest when hovered (7.48, 9.53), on-surface on clear controls (17.32, 17.3). Links, chips and form fields take a 2 px on-surface ring at 2 px offset.
- **Beside the other templates.** Solving the ten pairs with all eight templates' pairs (`--with ember,harbor,summit,vector,aurora,monolith,meridian,atlas`) shifts no token for #0f7a6c (`shiftedByNewPairs: {}`, `orderSensitive: false`, both schemes). Over the corpus, in both schemes, the union throws nothing and shifts nothing (0 of 34 cases shifted), and the same holds for the tile's other seven hexes. Solved alone, the ten pairs moved no token for any corpus or tile hex, so the tile's token sets stand. Mullion shown beside Ember, Harbor, Summit or Vector cannot recolour them. Pane rules add no pair, since border is never solved.
- **The front's lift.** In the field zone round the ask, tiles mix brand-deeper toward on-brand by at most 20%: #339085 on light and #469083 on dark, 1.48 and 1.47:1 against the pane. The ring of tiles touching the ask never lifts (the mat), so the ask's edge is always against plain brand-deeper. Under text the front mixes toward brand-deepest, so on-brand text stays between its two solved pairs, at 5.69 or more light and 7.68 or more dark.
- **The tile's other token sets** (the solver moved none):
  - Hollin Lane Bakehouse, #b0562a light: brand-deeper #9d4516; on-brand on it 6.37, brand-deeper on surface 6.09, on-brand on brand-deepest 8.21.
  - Pellow & Garth, #1e3a8a light: brand-deeper #1e3a8a; 10.35, 9.91 and 13.19.
  - Low Moor Sound, #c75b7a dark: brand-deeper #e57694 with on-brand #10090a; 6.89, 6.8 and 8.63.
- **The worst accents, drawn statically in the tile** (no click needed):
  - #f5c400 light: olive panes (#796000); on-brand on it 6.02, brand-deeper on surface 5.77, on-brand on brand-deepest 7.77.
  - #808080 light: a greyscale page (#636363 panes); 6, 5.75, 7.81. The asks are still the only filled blocks.
  - #84cc16 light: dark olive-green panes (#477200); 5.71, 5.48, 7.45.
  - On dark, yellow stays yellow (#f5c400 with near-black text at 11.96), and the dark style turns every colour pane pale with near-black text.

##### Signature motion: set into the frame

- **Rows assemble in grid order.**
  - One IntersectionObserver: threshold 0, fires once, no negative margin.
  - When a row enters, its pane rules draw: vertical rules `scaleY` down from the section rule, the bottom rule `scaleX` from the left edge, 0.5 s. This works because the rules are pseudo-elements, not a gap over a background.
  - Each pane's content rises one 8 px module and fades in, staggered 0.06 s by column index (Harbor's parameters-as-data helper).
  - An ask pane's colour layer slides in by one column width (0.7 s); its text and ask appear once the colour has landed, so contrast never breaks mid-move.
- **Nothing on screen replays, and nothing waits at the ask.**
  - Every row that intersects the viewport when motion arms is marked shown at once, without animating, so the hero and whatever the first scroll reveals never flash.
  - A `:focus-within` rule ends any reveal at once, so a focused control is never below full opacity (procedure D).
- **The closing ask.** The contact heading, its points and the form are never hidden. The heading sits in the ask column on colour from the start, and the form is a surface pane, legible on any ground. Only the decorative colour layer behind them widens, from the ask column (anchored right) to the full frame (`scaleX`, 1.1 s), inside the 1,560 px frame, never full bleed. The widening is skipped entirely when `#contact` is reached from any in-page link (a click listener on `a[href="#contact"]` marks it shown), when the address carries `#contact`, and when the block is already on screen as motion arms. Below 48rem there is no widening at all.
- **What it points at.** Inside each row the coloured pane lands last. The closing colour grows from the column where the hero's ask stood.
- **Timing:**
  - quick 0.15 s for hover and press, settle 0.7 s for entrances, long 1.1 s for the close;
  - one curve: a critically damped spring sampled into `linear(0, 0.236 10%, 0.551 20%, 0.764 30%, 0.883 40%, 0.944 50%, 0.974 60%, 0.988 70%, 0.995 80%, 0.998 90%, 1)`, with `cubic-bezier(0.25, 0.6, 0.3, 1)` as fallback, passed to GSAP as the same function;
  - transform and opacity only, hover included: every hover fill is a pseudo-element's opacity cross-fade. The inverse button's hover switches at once with no transition, so its label never passes through a low-contrast mix. Hidden states apply only after the root is marked armed.
- **GSAP (decision 3).**
  - From 48rem: GSAP core through `loadGsap`, armed on `whenScrolled`, with one `gsap.context` and one `matchMedia` condition (`(prefers-reduced-motion: no-preference) and (min-width: 48rem)`), reverted on unmount.
  - No ScrollTrigger at any width: the observer starts the timelines.
  - Below 48rem there is no GSAP: a 12 px CSS rise on the same observer, nothing else.
- **Hover and touch.** Buttons deepen to brand-deepest in 150 ms and a press scales to 0.98. Nothing is revealed by hover alone; every hover state has a focus and a press twin.
- **Reduced motion.** No GSAP is downloaded. Rules are static, the closing block is full width from the start, only 0.2 s opacity fades run, and no WebGL context is created.
- **Cost.** GSAP core is 27,185 B gzipped, loaded only from 48rem and after the first scroll. That is 0 B on phones and in an unscrolled audit.
- **Smallest addition.** No template uses GSAP or a WebGL library today, and nothing new is added as a dependency. The addition is:
  - an ADR amending ADR 0008 decision 4;
  - one ESLint change letting templates import `@/lib/motion/gsap`, `@/lib/motion/idle` and `use-motion-allowed`, plus a rule closing the `import('gsap')` loophole;
  - one `lib/motion` WebGL lifecycle module (decision 4);
  - a `whenIntent` helper.

##### WebGL moment: the tiles lean toward the ask

- **Where, per width.**
  - 64rem and up: one canvas over the whole call pane. The ask is the pane's own bottom-right cell, flush to its right and bottom edges, spanning 4 of the pane's 5 columns at 64 to 80rem and 3 of 4 from 80rem. The field zone (the pane below the trust line) is at least `3 × 24 px + 3.5rem` tall.
  - 48 to 64rem: the call pane runs full width with its text in columns 1 to 5; the canvas covers columns 6 to 8, the ask cell sits at their foot, full width of those columns.
  - Below 48rem: no WebGL at all. Phones never create a context, so no 20 to 50 ms context-creation task (estimate) can land on a first interaction, and INP there is untouched. The call pane ends in a full-width ask cell.
- **What it draws.** Square tiles on a 24 px module, in one fragment shader over one triangle.
  - The grid is anchored at the ask's bottom-left corner. A tile's ring number is its whole-tile Chebyshev distance from the ask: `max(-i, i - ceil(bw) + 1, -j, j - ceil(bh) + 1)`, where bw and bh are the ask's width and height in tiles. Because the ask sits in the corner, every ring is an L that leans up and left toward the headline, never a halo clipped by an edge.
  - Ring 1 is the mat and never lifts. Lifted tiles have a 1 px gap in the pane colour.
- **The moment.** After arming, a diagonal band of tiles crosses the pane from its top-left corner, the headline's side, toward the ask's top-left corner in 1.4 s. It deepens toward brand-deepest under text and lifts toward on-brand round the ask. As it lands, ring 2 (the L one module out from the ask) lifts for 0.38 s and settles. Then it stops.
- **After it.** Tiles within 2.5 tiles of a pointer lift a step and spring back. Hovering, pressing or keyboard-focusing the ask lights the same L. It is drawn on demand, and nothing runs longer than about 2 s without input, so no pause control is needed (WCAG 2.2.2).
- **At rest.** The rest frame is the plain pane, so when nothing moves the canvas is hidden (`visibility: hidden` after a 0.15 s fade) and shown again when something starts. Measured in the tile: with the DOM text hidden, the settled canvas and the plain pane are identical pixel for pixel (456 × 481 px, 0 differing). With text shown they differ only in glyph smoothing, because text over a visible canvas loses subpixel anti-aliasing; hiding the canvas at rest gives it back.
- **Tokens.** It reads `--brand-deeper`, `--brand-deepest`, `--on-brand` and the module `--t` through `getComputedStyle`, parsed as `#rrggbb` (which `formatHex` guarantees), and re-reads them when the tokens change. Anything unparseable keeps the static state, never white.
- **Arming and gates.** From 48rem only, after first paint, on first intent (pointer, scroll, touch or key). It runs only when motion is allowed, WebGL exists, `MULLION_WEBGL` is true (decision 8) and `forced-colors` is not active.
- **Lifecycle.** It uses the shared `lib/motion` module.
  - Context: `KHR_parallel_shader_compile` when present; `antialias: false`, `alpha: false`, `powerPreference: 'low-power'`; DPR capped at 1.5.
  - A debounced resize (150 ms) rebuilds the ring texture.
  - An IntersectionObserver and `visibilitychange` stop drawing when the pane is off screen or the tab is hidden.
  - `webglcontextlost` removes the canvas and leaves the static state.
  - When the pane leaves the viewport for good, or on unmount, it deletes the program, buffer and texture and calls `WEBGL_lose_context`.
  - The canvas is `aria-hidden`, and every word in the pane is real DOM.
- **Seen in the deliverables.** The tile draws four real frames from the live context at 0.3, 0.7, 1.1 and 1.4 s (the landing L), copied out right after each draw, with the ask and the text lines marked on them; the storyboard's third frame is the 0.7 s one.
- **What WebGL adds over CSS.** A CSS mask sweeping a static tile pattern could draw the front at no script cost. WebGL adds the per-tile pointer response and the landing L, both quantised to whole tiles on one spring, and it reads the tokens live. If the owner reads the moment as decoration, the CSS sweep is the fallback plan, and the brief's one WebGL moment would need another home.
- **Cost.**
  - Bytes: the tile's leaf is 3,374 B gzipped unminified, including still-copying code the template does not need, and the ring function 524 B. Budget about 3 to 4 kB with the shared module (estimate).
  - Pixels: one flat colour per fragment; about 0.49 megapixels per frame at 1440 (a 456 by 481 px pane at DPR 1.5). Frames are drawn only while something moves, about 1.8 s per visit plus input.
  - Main thread: context creation happens only from 48rem and after intent, so it never lands in an unscrolled lab run or on a phone.
- **Verified in the tile** (Chromium, D3D11): one WebGL context (the stills are 2D copies); the rest frame matches the plain pane as above; the front, the landing L and the hover L render. With `reducedMotion: 'reduce'`, and again with `--disable-webgl`, no context is created and the static state shows.

##### Static fallback

- **What it is.** The plain call pane: brand-deeper with the lead, the trust line under a 1 px on-brand rule, and the inverse ask cell in the corner. The earlier CSS ring frames are cut: at rest they read as a stepped glow, and they were cut off at 1024, 768 and 375. This also removes the `round()` and `mask-composite` dependency, its `@supports` guard, and 433 B of gzipped CSS from every preview.
- **When it shows:** at first paint, whenever nothing moves, under reduced motion, without WebGL, with the flag off, after context loss, with an unparseable colour, with JavaScript off and on every phone. Under forced colours the canvas is hidden and every pane keeps a system-colour rule.
- The ask pane beside the steps is the same plain colour pane with its ask as its bottom cell, so "a coloured pane means act here" looks the same everywhere.
- Without JavaScript every row, rule and colour is painted, the FAQ is native `<details>`, the topic chips are native radios, and the phone menu falls back to an in-page list of anchors at the foot of the header.

##### Buttons and links

- **Form.** A Mullion button is a small window: a label light and a square 3.5rem arrow light, split by a 1 px mullion in the text colour. Where it can, it is its pane's own bottom-right cell, flush to the pane's edges: the call pane's ask, the ask beside the steps, the form's submit. This replaces the earlier label-and-arrow rectangle with a 4 px arrow nudge.
- **Kinds.** Primary on clear ground (brand-deeper, on-brand label); inverse inside a colour pane (on-brand, brand-deeper label); secondary for Menu (surface, on-surface, 1 px on-surface edge); text link in brand-deeper, underlined, thicker on hover and press.
- **The header ask cell.** From 64rem a filled two-light cell, 4rem tall; below 64rem a clear cell with a brand-deeper label and a 3 px brand-deeper rule, which fills only once the call pane has left the viewport, so a phone or a 768 screen never shows two filled asks. Its focus ring is 2 px inset 6 px: on-brand on the filled cell, on-surface on the clear one. The tile draws all states.
- **Accessible names.** Every "Ask about this" carries its service after the visible words ("Ask about this: Draught-proofing"), so the label stays in the name and 3 to 6 links never share one.

##### Sections, in order

Section ids are neutral: `#top`, `#main`, `#services`, `#process`, `#about`, `#reasons`, `#proof`, `#faq`, `#contact`. Column spans never depend on text length. Grids are 4 columns below 48rem, 8 to 64rem, then 12. The bakery's visitor page (4 services, 3 steps, a slot 1 photo, 3 reasons, 4 questions), rewritten so every fact restates the owner's sentence, measures 5,461 px at 375, 5,242 at 768, 3,869 at 1024, 4,104 at 1440 and 4,229 at 1920, StudioBar excluded.

1. **header**
   - Job: wayfinding and a persistent ask at every width; the ask is always the top-right cell.
   - Placement: sticky in normal flow, on solid surface, no glass. The root is `overflow-x: clip`, so the header bar never covers the StudioBar; only the open menu does (see "Menus and the StudioBar").
   - 375: logo, a 3.5rem Menu cell, then the ask cell (`askShort`). 56 px tall. A name over 28 characters takes its own row above the bar; that row scrolls away and only the 56 px bar sticks.
   - 768: logo 4 columns, Menu 1, ask 3, clear (the phone rule). 64 px.
   - 1024: logo 6, Menu 1, ask 5: the nav moves into the Menu from 64 to 80rem, and the ask cell stands exactly over the call pane. 64 px.
   - 1280 and up: logo 3, nav 5, ask 4, the ask cell over the call pane. 64 px.
   - Measured: 64 px at every name length from 14 to 80 characters from 48rem in all five pairs (80 characters takes three lines at 1280); 56 px on phones for names up to 28 characters (one to three lines). Three 14-character labels fit the nav cell at 1280 (505 px), 1440 (569) and 1920 (649) in every face. `scroll-margin-top` is the header height minus 4rem per breakpoint: 56 px bar below 48rem, 64 px from it.
   - Menu: a full-screen dialog (`showModal()`), `height: 100dvh`, of ruled link rows with the ask pane at its foot. Focus moves in, is trapped and is returned; the page is inert. Lenis is not stopped, since a template has no handle on it: the sheet carries `data-lenis-prevent` and `overscroll-behavior: contain`, as the site's own menu does. While open it covers the StudioBar.
   - Visitor page: an image logo or the wordmark (three steps, wraps anywhere, which handles the 60-character unbroken edge name); three nav labels of 3 to 14 characters with fixed targets; `askShort`.
2. **intro** (hero)
   - Job: say what the business does, where and for whom, take the first ask, keep a trust signal in the same screen, and from 64rem show the business's own picture.
   - Row A: the h1 pane, then the call pane. The h1 holds the kicker as its first deck and the headline under it, top-anchored. From 48rem the foot of the h1 pane is the service index: the first three service names below 80rem and four from it, 3.5rem ruled links to `#services`, carrying no claims. The call pane holds the lead, the trust line under a 1 px on-brand rule, and the inverse ask cell flush in its bottom-right corner.
   - Row B: slot 0 beside a clear caption pane (caption at the foot).
   - 375: h1 pane, call pane (ask as its full-width bottom cell), photo at 4:3, caption.
   - 768: the h1 pane across 8 columns with the index; the call pane full width, text in columns 1 to 5 and the ask cell at the foot of 6 to 8; the photo at 16:9.
   - 1024: 7 and 5, photo 16:9. 1280 to 1440: 8 and 4, photo 21:9. 1920: the frame holds at 1,560 px.
   - Row A's height comes from content. Measured from the h1's foot to the index: 32 to 103 px across 1024 to 1920 in all pairs (the earlier 188 to 241 px gap was between the kicker and the h1).
   - Phone fold, measured to the ask's foot from the top of the StudioBar: example 492 px, bakery 530, law firm 499, studio (Sora) 526 at 375; 466, 483, 500 and 503 at 390. The worst case (a 45-character name on its own row, a 56-character kicker, a 90-character h1 at 26 px, a 139-character lead, a 60-character trust line, a 22-character ask) reaches 626 px in four pairs and 653 in Sora at 375, and 627 in all five at 390. So every demo (466 to 530 px) clears 375 × 548, Safari's visible height with its bars on a 375 × 667 phone (an assumption to confirm on a device, the same figure Placard uses), and the worst case clears 375 × 667 and 390 × 664 but not 548: on small phones with long briefs the header's ask cell, always in the first screen, carries the first-screen ask.
   - LCP: slot 0 is the likely LCP at every width, phones included. Measured on the tile's hero markup (box areas in the first viewport, StudioBar included), its visible part is larger than the h1's box for the example and the bakery at 375 × 667, 390 × 664, 412 × 823 (Lighthouse's mobile viewport), 768 × 1024, 1024 × 768 and 1440 × 900: for example 59,835 against 32,435 px² for the example at 375, and 106,894 against 36,355 at 412. So the one slot 0 element is eager, `fetchPriority="high"` and has a true `sizes` at every width; if the fixture's Lighthouse runs confirm it as the LCP at every width, it is also preloaded (Next 16's rule, `image.md:283-289`). The h1 still paints at first paint.
   - Example copy: kicker "Sash window repair in York"; h1 "Old sash windows, working like new"; lead "We repair, draught-proof and remake timber sash windows across York, so they open, close and keep the heat in."; trust "Rated 4.9 from 212 reviews"; ask "Book a survey".
   - Visitor page: the model's kicker, h1, lead and ask. The trust line restates something the brief says, with no digits or claim words; if the brief states no such fact, it is a fixed claim-free risk-reversal, "Asking first commits you to nothing." (36 characters), so the first screen keeps a trust signal rather than an instruction (Placard's `promise` slot is the pattern). Slot 0 is the first upload or the ranked Pexels hero. When null, row B is a tint pane with the company name set as a wordmark at h1 size, the only place the name is set large, never the kicker or heading again.
3. **services**
   - Job: let the reader find their need and ask about it.
   - Layout: 1280 and up, the heading and intro line in columns 1 to 3, then three to six ruled rows in 4 to 12, the name in 4 to 6 and the text and its ask in 7 to 12. 1024: heading in 1 to 4, rows in 5 to 12 with the name above the text. 768 and 375: stacked.
   - CTA: "Ask about this" on every row, a 44 px text link to `#contact` that checks that service's topic radio. Without a script it still jumps.
   - Visitor page: names up to 48 characters, descriptions 60 to 220, written from the brief. The price line is `price | null`, example only ("from £180 a window").
4. **process**
   - Job: remove the uncertainty of the first step, then ask again at the decision point.
   - Layout: 1280 and up, the heading and a ruled, numbered list of three steps in columns 1 to 8, with the ask pane in 9 to 12 spanning both, the hero's column again. 1024: heading in 1 to 4, steps in 5 to 12, and the ask pane full width below with its ask cell in 8 to 12. 768 and 375: stacked, the ask pane last. Never equal cards.
   - Each step: a numeral 1 to 3 drawn by code, a title of up to 36 characters and text up to 180.
   - CTA: the ask pane in brand-deeper, a prompt of up to 60 characters and the inverse ask as its bottom cell.
   - Example: Book a survey; A written quote; We fit, usually a day per window.
   - Visitor page: the model writes the three steps from the brief. The fallback steps are fixed, claim-free phrases about the site's own flow: "Send a short message", "Talk it through", "Agree the next step".
5. **about**
   - Job: put a person and a place behind the offer. No CTA.
   - Layout: slot 1 in its own pane, 3:2, in columns 1 to 6 from 1280 (1 to 4 at 1024, with the text in 5 to 12), 16:9 at 768, 4:3 at 375; lazy, true `sizes`, never under text. The heading and a 200 to 480 character story sit beside it.
   - Visitor page: when slot 1 is null (every visitor with exactly one upload), the row re-spans: the heading in columns 1 to 5 and the story in 6 to 12. No twin and no repeated heading. The tile draws both states.
6. **reasons** (the worded proof band)
   - Job: why this business over the next one, just before the objections. No CTA.
   - Layout: a muted band under a 2 px on-surface rule; heading in columns 1 to 3 (1 to 4 at 1024), then three or four run-in rows in 4 to 12, each a bold title of up to 40 characters followed by up to 160 characters of text. No figures or claim words.
   - Visitor page: the model writes reasons only from what the brief states. The fallback sets the band to null rather than invent reasons, and the frame closes over it.
7. **proof** (optional, example only)
   - Job: social proof and figures beside the final decision.
   - Example: two quotes from named fictional customers and a tabular figure row, as the tile shows it (1,240 windows restored since 2009; 212 reviews, rated 4.9; 96 sashes refitted this year).
   - Visitor page: null, and the frame closes over it with no gap.
8. **faq**
   - Job: answer how to start, timing and what happens next before the last ask.
   - Left pane (tint), columns 1 to 3 (1 to 4 at 1024): a heading, a line and "Ask us something else", a link to `#contact` in brand-deeper on accent, the tenth declared pair.
   - Right pane: four to six native `<details>` rows, questions up to 90 characters and answers up to 360 at 62ch. Summaries are at least 56 px tall with a square 44 px plus that turns into a minus.
   - Visitor page: questions and answers restate only the brief. One question is always on cost or payment, answered without figures: by restating the brief when it says anything about price or payment (the tile's bakery: "When do I pay?"), otherwise by a fixed claim-free answer on how the price is agreed ("Say what you need in your message, and {company} will explain how the price is worked out."), as Intaglio and Placard require. The fallback is five fixed questions about the site's own flow, with no promises about price, speed or availability: how the price is agreed (that fixed answer), what to put in a message, what happens after sending it, how to add something later, and how to ask about something not listed.
9. **contact**
   - Job: the conversion point. The brand-deeper block spans the frame; its colour grows from the ask column.
   - Layout: 1280 and up, the form pane (surface) in columns 1 to 8, inset in the colour, and the heading, a line and three reassurance points (up to 48 characters each, on-brand, between on-brand rules) in 9 to 12, the ask column. 1024: form 1 to 7, heading 8 to 12. Below 64rem: heading first, then the form.
   - Form: name, email, the topic chips and a message. The chips are the service names plus "Something else", a native radio group of 44 px labels that works without JavaScript and submits a value. Fields are labelled, with `autocomplete` and required fields marked. Errors are monochrome (an icon, text and a 2 px on-surface rule), since there is no danger token. The submit is the form pane's bottom-right cell.
   - Visitor page: decision 5's demo state inside the pane: "This is a preview: on the live site your message would reach {company}. Nothing is sent from here." Nothing is written to the URL; with JavaScript off the submit is inert and the note is visible. The points restate the brief or fall back to fixed claim-free phrases. The example shows a real-looking form with a phone field and a success state that gives a reply time.
10. **footer**
    - Job: a last contact route, and wayfinding.
    - Contents: the wordmark, the one-line description, nav links as 44 px rows, the business email as plain text on a preview (decision 5), and the legal line agreed under decision 11 ("© {year} {company}. All rights reserved.", plus the Pexels credit when a Pexels photo is used).
    - The frame's side rules end on a closing rule. No watermark.

Copy slots, all ranged for the contract and fallback:

| Slot               | Range                                                            |
| ------------------ | ---------------------------------------------------------------- |
| askShort           | 4 to 14                                                          |
| kicker             | 12 to 56                                                         |
| h1                 | 12 to 90                                                         |
| lead               | 80 to 140                                                        |
| trust line         | 20 to 60                                                         |
| ask                | 4 to 22                                                          |
| caption            | 40 to 110                                                        |
| nav                | 3 labels of 3 to 14                                              |
| services           | 3 to 6 rows (name 3 to 48, text 60 to 220)                       |
| steps              | 3 (title 3 to 36, text 40 to 180) plus an ask prompt of 20 to 60 |
| about              | heading plus 200 to 480                                          |
| reasons            | 3 or 4 (title 3 to 40, text 60 to 160), or null                  |
| FAQ                | 4 to 6 (question 10 to 90, answer 60 to 360)                     |
| contact            | heading, line of 40 to 140, three points up to 48                |
| footer description | 40 to 160                                                        |

**Guide rules for the model** (on top of `rules.ts`): the trust line, the contact points, the reasons and every FAQ answer restate only what the brief states; no promise of price, speed, availability, guarantees or policies the brief does not name; nav labels are nouns or short phrases of at most 14 characters. The fallback is tested against these ranges with ctaLabels of 0, 3, 4, 22, 23 and 40 characters, since nothing upstream holds the ctaLabel to 4 to 22.

##### How it adapts across industries

The existing mechanism is enough, with no pipeline change. The style picks the font pair and, for dark, the scheme. The hex gives the four grounds. Copy fills fixed slots, and photos fill slots or none. The tile renders four businesses from the same markup:

- **Sash-window restorer** (example; Schibsted Grotesk with Source Serif 4; #0f7a6c light). A 34-character h1 takes step 2 (74 px at 1440); the ask's foot is at 492 px on a phone and 490 at 1440.
- **Bakery** (warm; #b0562a light). Built from a full owner's sentence of 339 characters, printed in the tile's caption as Intaglio's Hollinby fixture is: 'Hollin Lane Bakehouse is a sourdough bakery on Hollin Lane in Hebden Bridge, open every day but Monday. We bake overnight in the room behind the counter: sourdough loaves, seeded rye, pastries and celebration bakes. Order online by the evening before, or a few days ahead for celebration trays, and pay when you collect; no account needed.' "Bread worth the early start", 27 characters, takes step 1 (96 px at 1440, 44 at 375). The ask is "Order for collection" and the `askShort` is "Order". A food photo fills row B from 64rem, and the tile renders its whole page below the hero at 1440 and at 375. Every fact on it restates that sentence and the rest is the site's own flow. An earlier draft showed a one-line brief beside copy that invented opening days, lead times, a founding story and a popularity claim ("Why people queue"), which broke this spec's own guide rules; that copy is gone.
- **Law firm** (minimal; #1e3a8a light, navy). A 90-character h1 takes step 3 (58 px). With no photo, row B carries "Pellow & Garth Solicitors" as a wordmark, and the page reads as sober and credible. On a phone the ask's foot is at 499 px.
- **Recording studio** (dark style; Sora with Inter; #c75b7a, forced dark). A near-black frame with pale rose panes and near-black text; a 40-character h1 takes step 2; an off-topic, saturated blue photo sits beside the rose pane.
- **Also fits:** a physio (minimal) whose one upload fills slot 0 while about re-spans, since no stethoscope icon exists to misfire; a landscaper (bold); a software firm (dark), whose services read as features and whose steps read as onboarding. There is no product UI, which is Aurora's job.

**Short and long copy, by construction.**

- The h1 step comes from character count and the longest word; headings are top-anchored, so spare height gathers above the service index, never between the kicker and the h1.
- Row siblings stretch, and the call pane's height comes from the grid and its field zone's minimum. A short lead leaves more plain colour above the ask, never a stub.
- Counts are fixed or ranged, and body text holds 46 to 62ch in every face at every width.
- Every slot at its maximum still puts the phone ask above 667 px in all five pairs.

**Any or no photography, shown.** Photos sit only in their own ruled panes, at a fixed ratio, with no text on them and no grade. They sit beside clear panes and under the h1 pane, never touching the colour pane's text. The tile tests it with off-topic stand-ins from the repo's licensed example files: a dining room for the sash firm, a plated dish for the bakery, runners on a saturated blue sky beside the dark rose pane, a colourful food still beside olive panes, red and orange gym kit beside a greyscale page, and a dark gym beside lime-derived panes. With no photos, the wordmark twin and the about re-span keep the page complete.

**A swapped accent.** Nothing depends on hue, only on tonal steps. Every text pair is solved, and the WebGL lift uses only solved fills plus a 20% mix that never borders text or the ask. The tile's token swap (viridian, vermilion, grey and yellow, light and dark) restyles every surface that has no fixed set, and the three worst accents are drawn statically.

**What the mechanism cannot handle (flagged):**

- There is no industry field, so no menus, opening hours, price lists, portfolios or product screenshots. Industry shows only through words and photos.
- The submission has no hours, address, phone or map, and `rules.ts` bans digits and claim words. So a visitor's page has no prices, ratings, years, counts, accreditations or testimonials.
- The model can still invent promises without digits or claim words ("same-week slots"); the guide rules above and the fixed fallbacks limit this but cannot prove it.
- Slots declare no ratio or focal point, and Pexels returns landscape only. Uploads fill slots in order and leave later ones null. There are no portraits or cut-outs, so no team headshots.
- Only the four pairs reach a visitor, so no visitor page gets a serif body, and the template cannot tell which pair it is in.
- The template cannot choose the scheme and cannot know it at render, because `assemble` gets copy and assets only (`templates/render.tsx:24-45`, `lib/copy-slots/assets.ts:26-30`). CSS can derive from `--surface` through relative colour syntax, and script can read the computed token, as Vector's waves and Placard's light do. The dark style turns the blocks pale.
- There is no success, danger or warning token, so form states are monochrome.
- The dark fill band turns yellow, lime and very light brands into olive panes on light, and greys into a greyscale page.
- Counts are fixed by the schema: a business with two services still gets three rows.
- Fallback copy is stored unvalidated (`build-concepts.ts:173`), so Mullion's fallback must be tested against its own ranges.
- Every preview links every template's stylesheet, so Mullion's CSS adds bytes to all previews (smaller now that the CSS rings are gone).

##### Performance and accessibility plan

- **LCP.** Slot 0 is the likely LCP at every width, phones included (measured in the tile at 375, 390, 412, 768, 1024 and 1440; see intro): one element, eager, high priority, with a true `sizes`, never a CSS URL, and preloaded only if the fixture confirms it at every width. The h1 is server text painted at first paint. The LCP measurement lists 375, 390, 412 and 768 as well as 1024 and 1440. The alternative is to place row B after the services on phones.
- **CLS.** CLS comes only from the font swap; panes are sized by the grid and fixed ratios.
- **Script and TBT.** At most three client leaves (header and menu, choreography, contact form), plus the WebGL leaf from 48rem. That leaves 0 B of GSAP and WebGL on phones and in an unscrolled run.
- **Budget.** The budget (LCP at most 2.0 s, CLS at most 0.02, TBT at most 150 ms) looks reachable but has not been measured.
- **Accessibility.**
  - Controls: every one is at least 44 px (the tile's live controls pass at 375 and 1440). Focus rings as listed under Palette, all at 3:1 or more.
  - Text: no alpha text, no text on photos, no text over a lifted tile except on its solved pairs.
  - Structure: one h1 holding both decks, then h2 per section; the phone menu is a dialog; the FAQ uses `<details>`; the topic chips are a radio group with a legend; the form has labels, `autocomplete` and monochrome errors; "Ask about this" links carry their service; decorative layers are hidden under forced colours and pane rules take a system colour.
  - Checked in the tile: no horizontal scroll at 375 or 1440, no console errors, no failed image loads, no live control under 44 px.

##### Distinct from

- **Aurora:** no centred hero, glow, product window or pills. Mullion has a top-anchored two-deck headline beside a square colour pane, and no light or glow at rest.
- **Monolith:** no floating cards, lit words, equal icon-card grids or "2.7K+" strip. Spans are asymmetric and there are no icons.
- **Meridian:** the header is a full-width ruled row, not a capsule with a logo tile. No chip, screenshot, coloured eyebrows or faint numerals.
- **Atlas:** no 3D, gradients, blue wash, shadows, rounded geometric sans, market rows or converter.
- **Ember:** no photographic hero with objects bleeding off, avatars, cut-outs, ordinals or laurels. The closing block stays inside the frame, so it is not a full-bleed band.
- **Harbor**, built only from what visitors get (not the scheme: on a visitor's page Harbor follows the same `schemeFor` rule, light by default, `lib/tokens/scheme.ts:8-10`; its near-black is only its example route's hand-set set, `app/examples/harbor/page.tsx:16,42`, and like every template Mullion goes dark for a light-artwork logo in any style):
  - one square frame across the page with asymmetric spans (8 and 4, 3 and 9, 8 beside the ask column), where Harbor's grid is a rounded box of equal tagged cells;
  - two rule tones and weights (on-surface section rules, border pane rules, a 2 px band rule) drawn as pseudo-elements, where Harbor's hairlines are one gap-over-background grid;
  - colour only as the ask column, from the header cell through the call pane, the pane beside the steps and the close, where Harbor lights a featured cell and phrases in headings;
  - no caps, lit phrases, eyebrows, chips, icons, hero stats row or hero photo.
- **Summit:** no faded photo, badge chip, sticky deck, black buttons, dashed rings, watermark, grey eyebrows or arrow-nudge rectangles. The buttons are two-light cells flush in their pane's corner.
- **Vector:** no colour bands or flowing field. The tiles are still squares, hidden at rest, that move in two short bursts. No serif italic, duotones, glass pills or letter pin.
- **The studio's home:** no ink, fluid or curved edges, no serif-italic swap or metallic text, no capsule header, navy and sky bands, prompt box or browser frames.
- **Placard:** a grid of colour panes against Placard's continuous sheet with one spot colour; no margin notes or graded plates; Mullion's run-in labels sit in ruled rows, not in margins.
- **Intaglio and Sheaf:** no drawn product UI, no figures or figure face on a visitor's page, no documents, torn sheets or particles.

##### Principles carried from the four, and surface traits not carried

- **Carried:**
  - Summit's one action colour used only for action ("a coloured pane always holds an ask"), and its accessibility plumbing.
  - Harbor's whole hero stack in one viewport, its motion helper whose parameters are data, strict tokens, native `<details>` beside the conversion point, and a phone menu that takes focus (upgraded to a dialog).
  - Ember's rule that nothing is hidden without JavaScript, its sampled-spring easing with fallbacks, and spending the brand big at the close.
  - Vector's WebGL that reads the tokens, and its strong scale contrast.
  - Phase 1's fixes: a sticky header in flow with an ask in the phone bar, a text LCP, neutral ids, no sector icons, no ask that dead-ends or points up, no alpha text, a 3:1 focus ring, 44 px targets and at most three client leaves.
- **Not carried:** Ember's photo hero and round cut-outs; Harbor's caps, lit phrases, neon, tagged cells and gap-px technique; Summit's faded photo, deck, black buttons, eyebrows and arrow nudge; Vector's colour bands, italic payoff, duotones and glass; every sector icon; every fixed header; every glow.

##### Risks

- **A wireframe or spreadsheet feel** if the rules are heavy or the padding tight. Pane rules are now a 1.28:1 decorative step, the frame and section rules carry the structure, real photos fill the photo panes, and padding scales to 32 px. Judge it on the tile.
- **An echo of Harbor's grid.** A visible ruled grid may still remind the owner of Harbor's hairlines. The difference rests on the list under "Distinct from", all of which reaches a visitor.
- **The moment's subtlety.** The lift is 1.47 to 1.48:1 against the pane and the canvas is hidden at rest, so the moment is felt more than seen. The stills show it; the CSS sweep is the fallback plan if it reads as decoration.
- **Text smoothing while the canvas shows.** For up to about 2 s the call pane's text loses subpixel anti-aliasing and regains it when the canvas hides; a sharp eye may notice the switch on LCD screens.
- **Small phones.** On 375 × 548 (assumed Safari height) the worst-case brief puts the call pane's ask at 626 to 653 px, below the fold; the header ask carries it. Linux CI sets text about 4% wider, which could add a line.
- **Phone headers with long names.** A 29 to 80 character name adds a 57 px row above the sticky bar at the top of the page; a 19 to 28 character name can take three 16 px lines inside the 56 px bar.
- **1 px rules on fractional columns** (1366 px, 150% zoom) can land half a pixel off. The rules are pseudo-elements snapped to device pixels.
- **Source Serif 4's optical sizes, measured.** The optical-size file is 122,360 B latin against 50,824 B for the wght-only file that serves 400 and 500 (2.4 times), and next/font/google cannot request the axis with fixed weights. The example takes the wght-only file (route a under "Type"); moving the tile to it put the example's phone ask foot at 492 px (from 465) and 490 at 1440 (from 458).
- **Budget.** The WebGL leaf and a tenth template's client code reach every preview while `render.tsx` imports all templates.
- **Full-width colour** needs `overflow-x: clip` on the root, not `hidden`, or the sticky header stops sticking.
- **Not drawn in the tile.** The lower sections' 1024 layouts are specified and measured but drawn only at 1440 and 375, and the 1280 hero is not drawn. The example's photograph is a stand-in (Ember's dining room).
- **The name.** "Mullion" is less familiar than Aurora or Summit. Alternatives: Ashlar, Transom.

##### If the owner decides otherwise

1. **Set size:** nothing changes.
2. **Hand-set example tokens:** the example keeps #0f7a6c light as the default and shows `?scheme=dark` from the same derivation. No visual change.
3. **No GSAP in templates:** CSS `view()` timelines with the observer as fallback for the rule draw and the rise, and the closing colour's widening as a transition on `data-shown`, with the same skip rules.
4. **Copy the WebGL helpers:** the lifecycle is copied into the leaf. No visible change.
5. **A real endpoint:** the form gets live success and failure states. **An honest mailto:** the form pane becomes a "Write to {company}" link cell in the same place.
6. **A fit signal:** nothing changes; Mullion stays neutral.
7. **Fonts:** no override is needed either way.
8. **The WebGL flag:** only where the flag is read changes.
9. **Per-template meta granted:** the title renders as "{company}: {kicker} | PinnaclePX", since the root layout's title template adds the suffix (`app/layout.tsx:33`), unless the field returns `title: { absolute }`; it replaces the route's "design N of M". The description comes from the lead. Otherwise the route defaults stand.
10. **Gain and loss colour:** not applicable.
11. **Fixed UI chrome:** "Menu", "Close", "Something else", "Ask about this", "Ask us something else", the legal line, the demo note, the trust line's fallback ("Asking first commits you to nothing.") and the fixed FAQ answers join the chrome list.
12. **The live claim** and 13. **Vector's licence** do not touch Mullion.

##### Open questions

1. Slot 0 measures larger than the h1 at every width in the tile, phones included. Accept it as the LCP (eager, high priority, preloaded if the fixture confirms it at every width), or move row B below the services on phones so the h1 leads there? Measure both at 375, 412, 768, 1024 and 1440.
2. Hyphenation: `hyphenate-limit-chars` is not in Safari. Keep `hyphens: auto` there, or set `hyphens: manual` on the h1 and rely on `overflow-wrap: anywhere`?
3. The example needs a licensed sash-window photo; the tile's dining room is a stand-in.
4. Companies House checks for Kestrel Sash Windows and the tile's three other names before any fixture uses them.
5. Is the WebGL moment worth its bytes over the CSS sweep, judged from the stills and the live pane?
6. The name: Mullion, Ashlar or Transom.

#### Placard

Multi-industry template, direction 2 of 2. Any business's one-page site set as a well-made printed bill. It has a banner headline, a heavy rule struck once in the spot colour where there is something to do, margin notes that answer the reader's next question, and one ask pressed into the paper with its undertaking beside it. Id `t10-placard` if the set grows to ten (decision 1). Style tile: `docs/directions/placard.html`. Screenshots: `.compare/template-analysis/directions/placard-1440.png`, `placard-1440-00.png`, `placard-375.png` and `placard-375-00.png`.

**Revised after critique (27 Sept 2026).** Every change below is measured in the tile:

- Real photographs now go through the grade, and the brand tone is dropped because it tinted food.
- The slot is designed in CSS first and reaches 3:1 on grey brands.
- The paper texture is capped at `border`, so text stays legible even where a mask misses.
- A long-name rule and a worst-case frame are added.
- The trust line becomes a risk-reversal undertaking inside the slot, and the rating moves to Record.
- End marks replace the left-end tab, and the spot colour now means "act".
- There is no GSAP. The phones keep the static slot. The reply slip and the Menu states are drawn.
- Frames are added at 768, 1024 and 1920, and the phone fold is measured at browser heights.
- The statement is unquoted and signed.

##### At a glance

- **Segment.** Any small business whose one-page site has one job: a first enquiry. That covers trades, clinics, professional services, food and local retail, studios and small software firms. It does not suit multi-product shops, booking calendars or dashboards. It is neutral by construction (decision 6): no sector nouns, icons, section ids or form fields.
- **Target visitors.** First, the business's prospective customer. They are usually on a phone from search, a map listing or a friend's link, and want three answers in seconds: what this business does, whether it is for someone like them, and how to start. Second, the prospect judging their own preview. For them the page must look art-directed despite weak photos, model copy and a colour picked in five seconds.
- **Single primary conversion goal.** One enquiry sent from the reply slip at `#contact`, the last section before the footer. Every ask on the page moves down to it, and none points back up.
- **Primary CTA.** The ask slot, written from the brief's `ctaLabel` and held to 4 to 22 characters by the template's own slot range, since nothing upstream enforces the prompt's 4 to 22 (`lib/copy-slots/brief.ts:23`, `build-concepts.ts:173,180`); the fallback uses the ctaLabel only when it fits, else 'Get in touch', and is tested with ctaLabels of 0, 3, 4, 22, 23 and 40 characters. Plus a new `askShort` slot of at most 14 characters for the masthead, and a new risk-reversal line `promise` (12 to 72 characters) set in the slot under the ask. Example: 'Book a sweep' with 'A fixed price agreed before we start'.
- **Example company (fictional).** Kestrel Sweeps, a chimney sweep and stove fitter in the Calder Valley. 'Kestrel Joinery, Bristol' was dropped because a real Kestrel Carpentry and Joinery trades there. The example names no real registration scheme. Run a Companies House check before the example ships.

##### Concept

Placard sets any business's page as a printed bill carried by structure rather than pictures: a copyfitted banner headline, a heavy rule, run-in heads, margin notes that open with the reader's own question and a footnoted process sentence. Its one spot colour means act: it is struck on the rule under the last word of a headline whose band carries an ask, and it fills the ask itself, which sits in a slot pressed into the paper with the business's undertaking printed on the slot's floor. Every photograph gets one gentle grade from the tokens so a mismatched set clashes less, and on desktops one light rakes across the paper grain once and comes to rest above the slot, whose walls answer it.

##### Why it should convert (reasoning, not a measured outcome)

1. **The first viewport holds four items in reading order.** A value headline, a supporting line, the ask, and a risk-reversal undertaking in the same slot as the ask. All are server-rendered text with no entrance, and the ask works at first paint. See the measured table below. The h1 is the likely LCP at 375 × 667 and 360 × 640 (and, by box area, at 1024, 1440 and 1920); at 768 × 1024 and at Lighthouse's 412 × 823 plate 0 is likely larger (see "Plate 0 as LCP" under Risks).
2. **There is an ask in the masthead at every width, the phone bar included.** None of the four existing templates has one.
3. **Every ask lands on `#contact`, the last section.** The FAQ sits directly above it, so cost, timing and how to start are answered before the final ask. "Ask about this" also preselects the slip's topic and moves focus to the first empty field.
4. **Margin notes answer the next question where it arises**, in the reader's own words.
5. **The process is one sentence of three clauses with footnoted details.** That removes "what happens next" in one read, and the second ask follows at that decision point.
6. **One colour, one meaning.** brand-deeper paints the ask and the end mark of a band that carries an ask, and nothing else. Footnote numerals, figures, terms, links, captions and photographs are in ink. Wherever the red appears, there is something to press.
7. **The ask never depends on hue.** Its slot's carrying edge is 3:1 or better against the paper in both schemes, and the label is set at 600, so a grey brand's ask still reads as a live control.
8. **A short phone page.** With optional sections null, the estimate is 7,000 to 7,500 px at 375, against 8,900 to 13,500 px for the four existing templates (an estimate, not a render).

**First viewport, measured in the tile.** Frames are at true size (the body font is on an inner wrapper, so container units resolve against the frame) and include the 56 px StudioBar. Values are px from the top of the viewport; "Ask" is the button inside its slot. The toolbar heights, 548 (Safari on a 375 by 667 phone) and 560 (Chrome on a 360 by 640 phone), are assumptions to confirm on devices.

| Frame                                                     | Bar                    | Headline                                          | Ask                                               | Trust line ends       | Screen fold | Toolbars fold |
| --------------------------------------------------------- | ---------------------- | ------------------------------------------------- | ------------------------------------------------- | --------------------- | ----------- | ------------- |
| A, Kestrel, 59-char h1, Besley, 375                       | 58                     | 133 to 269                                        | 399 to 451                                        | 481                   | in (667)    | in (548)      |
| B, bakery, 27-char h1, warm pair, 375                     | 58                     | 133 to 222                                        | 351 to 403                                        | 456                   | in          | in            |
| C, solicitors, 90-char h1, dark pair, no photo, 375       | 58                     | 133 to 296                                        | 425 to 477                                        | 530                   | in          | in            |
| D, worst case, 375                                        | 58 (ask and Menu only) | 213 to 376                                        | 530 to 582                                        | 634                   | in          | below         |
| A, 360 by 640                                             | 58                     | 133 to 269                                        | 422 to 474                                        | 505                   | in (640)    | in (560)      |
| B, 360                                                    | 72                     | 147 to 233                                        | 387 to 439                                        | 492                   | in          | in            |
| C, 360                                                    | 58                     | 133 to 293                                        | 422 to 474                                        | 527                   | in          | in            |
| D, 360                                                    | 58                     | 212 to 373                                        | 527 to 579                                        | 654                   | below       | below         |
| A, 768 by 1024 / 1024 by 768 / 1440 by 900 / 1920 by 1080 | 58                     | 145 to 307 / 153 to 353 / 165 to 429 / 170 to 458 | 427 to 479 / 517 to 569 / 580 to 632 / 615 to 667 | 509 / 599 / 663 / 697 | in          | n/a           |
| B, 1440                                                   | 58                     | 165 to 416                                        | 567 to 619                                        | 672                   | in          | n/a           |
| C, 768 / 1024 / 1440 / 1920                               | 58                     | 145 to 277 / 153 to 307 / 165 to 356 / 170 to 394 | 397 to 449 / 470 to 522 / 507 to 559 / 551 to 603 | 479 / 575 / 589 / 634 | in          | n/a           |
| D, 768 / 1440                                             | 58                     | 203 to 335 / 165 to 356                           | 482 to 534 / 539 to 591                           | 587 / 643             | in          | n/a           |

The worst case (D) uses an 80-character name, a 90-character headline, a 140-character standfirst, a two-line trust line, a 14-character askShort and a 22-character ask, in Sora with Inter. Its masthead ask is in view at every height. The lede's own ask and trust line fall below the browser's visible height at 375 by 548, and below both folds at 360 by 640 (open question 8). The nav sits on one line in every frame from 768 up. The 1920 figures were measured again in this pass: the tile's frames had run the lede the full frame width, and every band now stops at the 90rem container (gutters included), as this spec says, which moves the 1920 headline, ask and trust line down; all are still in view.

##### Type

**Example page** (next/font/google in `app/examples/placard/page.tsx`). Licences, weights and figures come from the Phase 2 font tool: Google Fonts METADATA.pb, next/font's own font-data.json, and a Chromium measurement of the file next/font self-hosts.

| Role                                                                                         | Face                                                                       | Weights shipped                                                                                                                                | Licence                   | Figures (measured)                                                                                                 |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Display: h1, h2, margin-note questions, process sentence, statement, FAQ questions, wordmark | **Besley** (Owen Earl), a Clarendon revival                                | 600 only: `Besley({ weight: '600' })` loads a static latin woff2 of 18,916 B (the variable 400 to 900 file is 36,592 B); italics exist, unused | SIL Open Font License 1.1 | tabular-nums does not equalise at 600 (0s 544 px, 1s 587.2 px under tnum). Lining. Never sets figures.             |
| Body: paragraphs, notes, captions, terms, particulars, labels, buttons                       | **Public Sans** (USWDS; Dan Williams, Pablo Impallari, Rodrigo Fuenzalida) | 400, 500 and 600 from one variable file (100 to 900; italics unused)                                                                           | SIL Open Font License 1.1 | tnum works: 0s and 1s both 688 px at 400 and 500. Proportional by default, so figures take `tabular-nums`. Lining. |

- No italics, capitals, tracked labels or eyebrows.
- `font-synthesis: none`, so no browser fakes an italic.

**Fluid scale.** Every display step is `clamp()` with a rem term; the fixed rows below (the long wordmarks, the ask label, the margin-note question and the small text) are rem sizes that do not scale. Sizes are given in px at 375, 1440 and 1920. The scale is the template's own, a departure from ADR 0008 decision 3 for the Phase 3 ADR (see "Departures").

| Element                                                           | Value                                            | 375 / 1440 / 1920 | Leading, tracking, measure                                                          |
| ----------------------------------------------------------------- | ------------------------------------------------ | ----------------- | ----------------------------------------------------------------------------------- |
| h1, up to 36 characters (the banner)                              | clamp(2.75rem, 1rem + 7.8vw, 8rem)               | 45 / 128 / 128    | 0.98, -0.02em, full measure, `text-wrap: balance`; 5.8 times the standfirst at 1440 |
| h1, 37 to 64 characters                                           | clamp(2.125rem, 0.94rem + 5.07vw, 6rem)          | 34 / 88 / 96      | 1, -0.016em, full measure; 4 times the standfirst                                   |
| h1, 65 to 90 characters                                           | clamp(1.875rem, 1.3rem + 2.8vw, 4.5rem)          | 31 / 61 / 72      | 1.04, 32ch, 38ch with no plate                                                      |
| h2                                                                | clamp(1.875rem, 1.4rem + 2vw, 3.5rem)            | 30 / 51 / 56      | 1.06                                                                                |
| h2, over 40 characters                                            | clamp(1.625rem, 1.3rem + 1.4vw, 2.75rem)         | 26 / 41 / 44      | 1.1                                                                                 |
| Process sentence                                                  | clamp(1.75rem, 1.15rem + 2.6vw, 3.5rem)          | 28 / 56 / 56      | 1.18, 24ch                                                                          |
| Statement                                                         | clamp(1.75rem, 1.2rem + 2.2vw, 3.25rem)          | 28 / 51 / 52      | 1.15, 24ch                                                                          |
| Standfirst                                                        | clamp(1.0625rem, 0.9rem + 0.55vw, 1.375rem)      | 17 / 22 / 22      | 1.45, 46ch, slot capped at 140 characters                                           |
| Body                                                              | clamp(1.0625rem, 1rem + 0.2vw, 1.1875rem)        | 17 / 19 / 19      | 1.55, 66ch; FAQ answers 62ch                                                        |
| Wordmark in the bar, up to 24 characters                          | clamp(1.25rem, 1.1rem + 0.6vw, 1.625rem)         | 20 / 26 / 26      | 1.05, at most two lines                                                             |
| Wordmark in the bar, 25 to 80 characters (from 64rem)             | 1.125rem                                         | 18                | two lines at most in Sora                                                           |
| Wordmark opening the lede (names over 16 characters, below 64rem) | 1.0625rem display 600                            | 17                | 1.25, wraps freely                                                                  |
| Ask label                                                         | 1.0625rem in the slot, 1rem in the bar, body 600 | 17 / 16           | nowrap                                                                              |
| Margin-note question                                              | 1.1875rem display 600                            | 19                | answer 1rem, 45ch                                                                   |
| Notes, captions, terms, labels                                    | 1rem                                             | 16                | No running text is below 16 px; only aria-hidden footnote numerals are smaller.     |

The copyfit steps for the headline, name and statement are chosen at render from character counts, so they are known on the server and never shift.

**The end mark.**

- brand-deeper, 6 px tall and max(2.5rem, 0.9em) wide.
- It is struck on the heavy rule under the last word of the headline, through a zero-width inline-block at the end of the headline (`<span class="end" aria-hidden>`). That makes it end-aligned with the last glyph wherever the copy wraps.
- Only bands that carry an ask get one: masthead, lede, services, process, particulars and the reply slip.

**Under the four preview pairs.** A visitor's style picks the pair, and the template knows only `--template-font-display` and `--template-font-body`. All seven preview faces are SIL Open Font License 1.1 (font tool). The display faces serve 600, and the body faces serve 400, 500 and 600 from their variable files at no extra cost, since `fonts.ts` requests no fixed weights.

| Style   | Display / body                   | Reads as                                 | Display tnum         | Body tnum            |
| ------- | -------------------------------- | ---------------------------------------- | -------------------- | -------------------- |
| warm    | Fraunces / Instrument Sans       | a soft printed bill, nearest the example | no (664 / 465.77 px) | yes (592 / 592)      |
| minimal | Manrope / Inter                  | a Swiss broadsheet                       | yes (611.2)          | yes                  |
| bold    | Bricolage Grotesque / DM Sans    | a poster                                 | yes (607.38)         | no (686.09 / 350.09) |
| dark    | Sora / Inter, dark scheme forced | a night edition                          | yes (664.97)         | yes                  |

The tile renders each pair with the whole kit: masthead, banner with end mark, the slot, a margin-note question, two run-ins with a column rule, the footnoted process and a particulars row. Under Manrope and Bricolage it still reads as a bill because the structure carries it. A visitor's page sets no figures, so no pair's tnum gap matters. On the example the rates are Public Sans with `tabular-nums` in a right-aligned column.

**Masthead label widths at 16 px, weight 600, measured in the tile.** The widest face varies by label: 'Book a sweep' 102 to 107 px, 'Order a cake' 94 to 98, 'Book a call' 79 to 83, 'Request a call' 104 to 108, 'Book a consultation' 148 to 153 (Inter widest). `askShort` is capped at 14 characters, and the fixture test measures it in all four body faces against 7.5rem (120 px).

**Font loading.** next/font with `adjustFontFallback`. Plate boxes have fixed ratios, so a face swap moves only text. The preview faces load with `preload: false` and swap after first paint; that CLS is measured per pair on the fixture.

##### Palette

Example brand hex **#b3261e**, printer's vermilion: rubrication, black text with one red. Every token and ratio below comes from the Phase 2 palette tool running the repo's own `deriveTokens` and `solvePairs` (verified 252 of 252 cases identical to the repo's vitest). The mixes were measured with culori `wcagContrast` over the same engine output (`placard-mix.mjs`), 17 corpus hexes plus the tile's seven, both schemes, 48 cases, no throws. Ratios are floored to two places. The solver moved nothing for #b3261e. Default scheme: light, unless the style is dark or the logo is light artwork (the real `schemeFor`).

**Roles and proportions** (one continuous sheet, no alternating bands):

| Token                               | Light     | Dark      | Paints                                                                                         | Share        |
| ----------------------------------- | --------- | --------- | ---------------------------------------------------------------------------------------------- | ------------ |
| surface                             | #fef9f8   | #120b0a   | the sheet                                                                                      | about 85%    |
| surface-muted                       | #f8edec   | #1f1614   | the slot's floor, the reply slip                                                               | about 2.5%   |
| on-surface                          | #1e1311   | #f8efee   | all type, the 2 px heavy rules, footnote numerals, record figures, error edges, the focus ring | about 9%     |
| on-surface-muted                    | #5f5250   | #b0a19e   | notes, captions, terms, field edges, the Menu outline                                          | about 2%     |
| border                              | #e8dad8   | #362b29   | hairlines and column rules (decorative), and the limit of the paper texture                    | under 1%     |
| brand-deeper                        | #b3251e   | #f96a5b   | the ask fill and the end mark of a band that carries an ask; nothing else                      | under 1%     |
| brand-deepest                       | #9e0405   | #ff8b7c   | the ask's hover and pressed fill                                                               | state only   |
| on-brand                            | #ffffff   | #120807   | the ask label                                                                                  | with the ask |
| scrim                               | #0b0403   | #040101   | mixed into the slot's shaded walls and the shadow on the ask's top edge; never a text ground   | trace        |
| on-scrim                            | #ffffff   | #ffffff   | mixed into the slot's lit lip; never text                                                      | trace        |
| accent, brand, glow, glow-secondary | unpainted | unpainted | none                                                                                           | 0            |

**Declared text pairs.** There are seven, all already declared by Aurora and unchanged by this revision. The worst case is over the 17-hex corpus plus the tile's seven hexes, in both schemes. Nothing throws. brand-deeper:surface stays declared although nothing sets text in it: the solve guarantees the ask fill and the end mark reach 4.5:1 against the paper, not just 3:1.

Light:

| Pair                              | Where                                     | #b3261e | Worst (hex)     |
| --------------------------------- | ----------------------------------------- | ------- | --------------- |
| on-surface on surface             | body, headlines, figures                  | 17.39   | 17.23 (#ffff00) |
| on-surface-muted on surface       | notes, terms, captions                    | 7.16    | 7.01 (#00ff00)  |
| on-surface on surface-muted       | the trust line in the slot, slip labels   | 15.83   | 15.83 (#b3261e) |
| on-surface-muted on surface-muted | "(required)" and "(optional)", slip notes | 6.51    | 6.43 (#00ff00)  |
| brand-deeper on surface           | kept solved for the ask and end mark      | 6.28    | 5.39 (#00ff00)  |
| on-brand on brand-deeper          | the ask                                   | 6.56    | 5.62 (#00ff00)  |
| on-brand on brand-deepest         | the ask, hovered or pressed               | 8.49    | 7.33 (#00ff00)  |

Dark:

| Pair                              | #b3261e | Worst (hex)     |
| --------------------------------- | ------- | --------------- |
| on-surface on surface             | 17.22   | 17.20 (#6b2d5b) |
| on-surface-muted on surface       | 7.82    | 7.74 (#ff00ff)  |
| on-surface on surface-muted       | 15.69   | 15.69 (#ff0000) |
| on-surface-muted on surface-muted | 7.13    | 7.06 (#ff00ff)  |
| brand-deeper on surface           | 6.71    | 6.21 (#ff00ff)  |
| on-brand on brand-deeper          | 6.80    | 6.29 (#ff00ff)  |
| on-brand on brand-deepest         | 8.68    | 8.27 (#ff00ff)  |

**Non-text parts and the texture limit** (3:1 needed where a part identifies a control; measured, not solved):

| Part                                                                              | Colours                                                                                                                                    | Light, #b3261e (worst) | Dark, #b3261e (worst) |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | --------------------- |
| Ask fill against the paper                                                        | brand-deeper vs surface                                                                                                                    | 6.28 (5.39)            | 6.71 (6.21)           |
| Ask fill against the slot floor                                                   | brand-deeper vs surface-muted                                                                                                              | 5.72 (4.94)            | 6.11 (5.67)           |
| The slot's carrying edge against the paper                                        | light: top and left walls, 3 px, surface-muted mixed 42% toward scrim; dark: bottom and right lip, 2 px, surface mixed 34% toward on-scrim | 3.18 (3.13, #808080)   | 3.05 (3.04, #808080)  |
| The slot's other edge (decorative)                                                | light lip; dark walls                                                                                                                      | 1.01                   | 1.01 (1.00)           |
| Wall shadow on the ask's top edge, 3 px (decorative; the label never overlaps it) | brand-deeper mixed 38% toward scrim vs the fill                                                                                            | 1.71 (1.25, #000000)   | 2.22 (2.22)           |
| Hover fill against the paper                                                      | brand-deepest vs surface                                                                                                                   | 8.13 (7.03)            | 8.56 (8.17)           |
| Focus ring, 2 px, 3 px offset                                                     | on-surface vs surface                                                                                                                      | 17.39 (17.23)          | 17.22 (17.20)         |
| Field edge on the slip                                                            | on-surface-muted vs surface-muted                                                                                                          | 6.51 (6.43)            | 7.13 (7.06)           |
| Field edge against the field                                                      | on-surface-muted vs surface                                                                                                                | 7.16 (7.01)            | 7.82 (7.74)           |
| Error edge (2 px) and error rule (3 px)                                           | on-surface vs surface-muted                                                                                                                | 15.83 (15.83)          | 15.69 (15.69)         |
| Menu hover and pressed edge                                                       | on-surface vs surface-muted                                                                                                                | 15.83                  | 15.69                 |
| Hairlines (decorative, never a control edge)                                      | border vs surface                                                                                                                          | 1.30 (1.28)            | 1.42 (1.41)           |
| Text where the paper texture peaks (its limit is border)                          | on-surface-muted on border                                                                                                                 | 5.49 (5.45, #00ff00)   | 5.49 (5.44, #808080)  |
|                                                                                   | on-surface on border                                                                                                                       | 13.36 (13.36)          | 12.10 (12.07)         |
| For the record: the first version's margin tone                                   | on-surface-muted on border mixed 14% toward on-surface                                                                                     | 4.15 (4.12)            | 3.64 (3.60)           |

The walls, lip and shadow are `color-mix(in srgb, ...)` of two tokens (Chrome 111, Safari 16.2, Firefox 113). An engine without it gives the slot a 1 px on-surface-muted edge instead (7.01:1 worst).

**Why alpha text is banned (one composited row).** on-surface at 50% over surface, light, #b3261e, paints #8e8685 at **3.41:1 and fails 4.5:1** (corpus worst 3.36). The same alpha on dark reads 4.84:1; at 60% on light it scrapes 4.68 (worst 4.63); on-surface-muted at 80% on light gives 4.37 (worst 4.31). The solver never sees an alpha, so whether one passes depends on the scheme and the hex. Placard paints no alpha text anywhere.

**Beside the other templates.** Placard's seven pairs were solved together with each existing template's pairs (Aurora, Monolith, Meridian, Atlas, Ember, Harbor, Summit, Vector) over the corpus in both schemes: 272 solves, 0 tokens shifted, 0 order-sensitive, 0 throws. Beside Atlas the dark `brand` moves (#c4382e to #d94d40 for #b3261e) because Atlas declares brand as text. Placard never paints brand, so nothing it shows changes. That run predates the revision; it still holds because the seven pairs did not change.

**Swapped accent.** Only brand-deeper is visible, and it is solved against the paper:

- A yellow brand prints deep on light paper (#f5c400 becomes #796000, 5.77:1) and stays bright on dark (11.81:1).
- A grey brand (#57534e) makes a monochrome page (7.30 light, 7.29 dark). Its ask still reads as a control because the slot's edge reaches 3:1 and the label is 600.
- The tile swaps all 14 tokens from four hexes and both schemes with no other change, the light included (swap run: 86 frames, walls mixing correctly after a rebrand).

**Photo grade.** CSS, present at first paint and without JavaScript; the strengths are template constants.

- **Lead** (plate 0 and every upload): `saturate(0.85) contrast(1.04)`, no tone layer.
- **Detail** (stock detail plates): `saturate(0.5) contrast(1.06)` plus an ink tone, on-surface in `mix-blend-mode: color` at 0.35.
- **Both**: a paper wash in surface at alpha 0.12 + (1 - L of surface) x 0.12 through relative colour syntax (about 0.12 on light paper, 0.22 on dark; older engines get a flat 0.12).
- The plate is isolated. Ratios are 3:2 on phones, 16:9 at 768 and 4:3 from 1024, with `object-position: 50% 40%`. Captions are statements about the business, never descriptions of the picture.
- **What the tile shows** (four mismatched pictures: food on marble, a dark gym, a cold clinic and an uploaded screenshot, at lead and detail, light #b3261e and dark #0e7490). The screenshot is a fictional, unbranded booking app drawn as an SVG in the tile; it replaced a capture of TrvlWell, a real client's site, since the brief allows fictional brands only. Lead keeps food's colour. Detail pulls a set closer, but a cold clinic still reads cool. The grade reduces clashes; it does not turn any four photos into one series.
- **The brand tone first specified is dropped.** At 18% under #0e7490 it cast teal on food and marble.
- **Copy-space stock crops badly.** The food picture's dish sits at one edge of empty marble, so at 4:3 the plate shows mostly marble. The slot has no focal point (see the limits below).

##### Signature motion: set, then pressed

Every motion ends at an ask, and only transform and opacity animate. No GSAP (see below). An earlier draft animated colour and box-shadow in two places, the slot's walls during the WebGL moment and the hover shadows; both are now layers faded by opacity or scaled pseudo-elements (see "Interaction" and "The slot answers the same light").

- **Load (CSS only).** Under `@media (scripting: enabled) and (prefers-reduced-motion: no-preference)`, 120 ms after first paint the lede's heavy rule draws left to right (`scaleX`, settle). The end mark then strikes down onto it under the headline's last word (`scaleY`, quick). `animation-fill-mode: backwards` releases both, as Ember does, so nothing waits for the client and nothing stays hidden. The headline, standfirst and slot never move.
- **In view.** One IntersectionObserver (threshold 0, once, no negative margin) marks each band shown. Its rule draws, its end mark strikes if the band carries an ask, and its margin note fades in with 16 px of travel 0.2 s later. Hiding happens only under the root's `armed` class, which the client sets, so a blocked chunk hides nothing.
- **Process.** The three footnote numerals appear in turn (opacity, 0.3 s steps) and each note rises 12 px. The sequence ends as the second ask's end mark strikes. The clauses carry no underline.
- **Interaction.**
  - The ask never nudges. On hover it takes brand-deepest (a pre-filled layer faded in by opacity), sinks 1 px, and the wall's shadow on its top edge deepens from 3 to 4 px; pressing sinks it 2 px with a 5 px shadow. The shadow band is a pseudo-element scaled in Y (3 to 4 to 5 px), not an animated box-shadow.
  - 'How it works' is a ruled link whose ink rule thickens from 2 to 4 px: a pseudo-element under the text scaled in Y from its bottom edge, so no layout shift and no box-shadow transition.
  - Text links go from a 1 to a 2 px underline.
  - Menu takes the surface-muted fill and an on-surface edge on hover. Pressed and open add a 2 px wall shade.
  - The FAQ plus turns into a minus.
  - Touch gets the same through `:active` and `details`.
- **Arrival at the slip.** 'Ask about this' links to `#contact` and carries the service's name (visible label plus visually hidden ': sweeping', WCAG 2.4.4 and 2.5.3). The slip's client leaf presets its topic. When the jump settles, it moves focus to the first empty field with `preventScroll: true` (the site's handler has already focused `#contact`), and the slip's end mark strikes if it has not yet.
  - **How it knows the jump settled.** The site's capture-phase handler turns every same-page hash click into `lenis.scrollTo(target)` (`app/_components/smooth-scroll.tsx:91-110`), and at `lerp: 0.075` (`lib/config.ts:376`) a glide of 1,000 to 7,000 px takes about 1.7 to 2.1 s to settle, so a 600 ms timer would fire mid-glide. Lenis stops the native `scrollend` during its own smooth scroll and dispatches its own `scrollend` (a CustomEvent with `detail.lenisScrollEnd`) when the glide ends (`node_modules/lenis/dist/lenis.mjs:510-519`). So while `html.lenis` is present the leaf waits for that event alone, and it keeps a 600 ms timer only when Lenis is absent (reduced motion, where the jump is instant).
- **Timing.** Three named speeds: quick 0.24 s, settle 0.9 s and soft 1.4 s. They are sampled springs in `linear()` with a `cubic-bezier(0.16, 0.52, 0.08, 1)` fallback behind `@supports`. A Harbor-style `motion(delay, travel, duration, ease)` helper writes custom properties.
- **GSAP: none.** Decision 3 allows it, but everything above is CSS plus one observer, and a second implementation of the same moves would add 27,185 B from 48rem for sequencing only. This is recorded as a deviation from the brief's GSAP allowance, and 0 B of GSAP reaches any Placard page. Placard still needs the shared ADR and ESLint change: ADR 0008 decision 4 bars all of `lib/motion` and the standards doc's boundary bars every other `lib` module, so the `lib/motion` WebGL module, `whenIntent` and `use-motion-allowed` need them (see "GSAP and WebGL", steps 1 and 2).
- **Reduced motion.** Subscribed to (the `useMotionAllowed` pattern), not read once. Nothing hides, rules and marks are drawn, entrances become 0.2 s opacity fades, and transitions are limited to colour and opacity, as `app/globals.css` does. No WebGL context is created.

##### WebGL moment: the pressing (desktops only)

- **What it draws.** One `aria-hidden` canvas behind the lede, a fragment shader over one triangle. The paper is a height field:
  - chain lines every 96 px;
  - two value-noise fibres (2.5 px round, and 16 by 2 px long);
  - laid lines every 4 px at half the first strength, on light paper only. On dark paper they read as Vector's scanlines (`vector/1440-00.png`), so dark paper has none.
  - One point light, Lambert against the flat sheet, inverse-square falloff over 0.28W + 150 px. No shape layer: the slot is CSS.
- **The slot answers the same light, by opacity.** Each frame the light model computes a Lambert term for each of the slot's four walls (normals tilted 45 degrees) against the flat sheet's, with the shader's falloff, and turns it into a strength N of at most 55%.
  - Over each static wall sits one solid strip in scrim (shade) and, over each lip, one in on-scrim (light), each the wall's own width, at opacity 0 at rest. The light model sets each strip's opacity to N. In sRGB a solid strip at opacity N over the wall paints exactly `color-mix(in srgb, <wall or lip>, <scrim or on-scrim> N%)`, so the look is unchanged, and only opacity animates, as the brief asks. The first draft wrote those mixes into `--wt`, `--wl`, `--wb` and `--wr` every frame for 83 to 86 frames, which animated colour and box-shadow and repainted the walls each frame. The tile still demonstrates it that way; Phase 3 builds the strips.
  - At opacity 0 the walls equal the static mixes, so arming never flashes.
  - The strips return to 0 on release.
  - The walls stay crisp at every pixel ratio. The first version drew them in a DPR 1 canvas and they blurred on 2x screens.
- **What it reads.** surface, surface-muted and border through `getComputedStyle`, parsed as six-digit hex. An unparseable value keeps the static state, never white. The shader picks shade or highlight from the paper's luminance, so it works in either scheme and re-reads on a rebrand (proved in the tile).
- **Text-safe by construction, and masked as well.**
  - The texture never goes past border, so any text it reaches stays at 5.44:1 or better (on-surface-muted) and 12.07:1 or better (on-surface) even with no mask.
  - The canvas also holds every text box it sits under between surface and surface-muted, padded 12 px and feathered 24 px. These are: the wordmark when it opens the lede, the h1, the standfirst, the trust line (on the slot's opaque floor anyway), 'How it works', each term, the plate caption, and at 768 any text below the plate that the canvas covers.
  - The template marks them `data-text`. The client passes up to 16 rects as a uniform array with a count, re-measured after fonts are ready and on every debounced (150 ms) ResizeObserver tick. More than 16 keeps the static state.
  - No shading of any kind reaches text: the only bevel is the slot's own 3 px walls, inside the slot's box.
  - Phase 3 samples the canvas under every text rect (within surface and surface-muted) and everywhere else (within surface and border).
- **The moment.**
  - It starts after first paint, on the first pointer move, wheel, scroll or key while at least 60% of the lede is in view (on a real page that is immediate).
  - One light enters from the upper left, rakes across the sheet on a quadratic path, lowers from half the sheet's width to 110 px, and comes to rest 44 px left of and 52 px above the slot over 1.4 s. The intensity ramps in over the first 20%, and the walls deepen over the last 45% (gain 0.9 to 1.5).
  - Mid-sweep the right lip darkens and the left wall lifts; at rest the static pattern deepens.
  - The last and strongest change is at the ask. No pointer-following, no loop.
- **After it.** Hovering, focusing or pressing the ask relights the walls in 140 ms, by the strips' opacity. The tile drew 83 to 86 frames per run at 768 and 1440, then none.
- **Gates.** The light runs only when all of these hold:
  - motion is allowed;
  - WebGL is present;
  - the viewport is at least 48rem;
  - the template-local `PLACARD_WEBGL` constant is true (decision 8);
  - `forced-colors` is not active.

  The context is created on the first run only, so phones and reduced motion never get one (verified: "Reduced motion: the static slot is shown and no WebGL context is created").

- **Lifecycle** (the shared `lib/motion` module, decision 4):
  - A lazy chunk; `KHR_parallel_shader_compile` when present.
  - DPR 1: the grain is soft, and the slot's crispness no longer depends on it.
  - No `preserveDrawingBuffer`.
  - IntersectionObserver and `visibilitychange` stop drawing.
  - `webglcontextlost` is prevented, shows the static state and remounts the canvas. Events from a canvas already retired by a deliberate release are ignored.
  - When the lede leaves view after the moment, the program and buffer are deleted, `WEBGL_lose_context` is called, the wall strips return to opacity 0 and the canvas remounts. A return shows the static slot, so the moment plays once. No textures, so no cross-origin fetch.
- **Cost.** The tile's whole WebGL block is 4,452 B gzip -9, including the wall function and status messages; the shader alone is 699 B. The Phase 3 estimate is 3 to 5 kB plus the shared module. On phones it is 0 B with no context. About 1.2 megapixels per frame at 1440, for about 85 frames.

##### Static fallback

- **The slot.** A surface-muted floor with four inset walls: the top and left 3 px in surface-muted mixed 42% toward scrim, and the bottom and right 2 px in surface mixed 34% toward on-scrim. The ask carries a 3 px shadow band at its top. This is the design, not a degraded state: it is what phones, reduced motion, no WebGL, the flag off, context loss, the time before intent and JavaScript off all show (tile, right-hand stage).
- **Rules and end marks** are drawn, and notes are visible.
- **Forced colours.** The canvas is hidden, box-shadows drop, and the slot gets a 1 px CanvasText border.
- **No `color-mix`.** The slot gets a 1 px on-surface-muted edge.
- **The photo grade** is CSS and identical in every state.
- **Without JavaScript.** The FAQ (native `details`) and the phone navigation (an in-page contents list at the masthead's foot) work. The slip's submit is inert with a visible note, and nothing is ever sent by GET or mailto.

##### Sections, in order

The container is 90rem with gutters of clamp(1.5rem, 1rem + 3vw, 6rem). Each band owns its padding, clamp(4rem, 3rem + 5vw, 8rem). Ids are neutral: `#services`, `#process`, `#faq`, `#contact`. There are at most three client leaves (masthead and menu, reveals, reply slip) plus the WebGL leaf.

**1. Masthead.** Job: orient, and keep the ask one tap away at every width.

- Sticky in normal flow under the StudioBar, never fixed, so the bar never covers 'Book a call' (only the open menu does). `overflow-x: clip` on the root. Plain surface with a border rule below; no glass, no capsule. At least 3.5rem and **at most 4.5rem** tall at every width (58 px measured in every frame; 72 px for 'Oxlip Bakehouse' at 360).
- **Long names are never truncated.**
  - A name of up to 16 characters sits in the bar at every width, on at most two lines.
  - A longer name sits in the bar only from 64rem, stepping down to 1.125rem past 24 characters. Below 64rem it opens the lede instead, in the display face at 1.0625rem, and scrolls away.
  - Below 48rem the bar then carries only the ask (stretched) and Menu; from 48rem to 64rem, the nav and the ask.
  - The rule runs on character counts known on the server, so it never shifts. The thresholds are checked against Sora, the widest display face.
- **375:** the wordmark or none, the ask on one line (`white-space: nowrap`, `askShort`), and a 44 px Menu. **768 and up:** three anchors separated by hairline column rules, and the ask at the right. 2 px corners; no pills anywhere.
- **Phone menu:** a 100dvh paper dialog (`showModal()`) set as a contents page, with display-face links on hairlines in 56 px rows, then the ask in its slot with the undertaking. Focus moves to the first link and returns to Menu on Escape or Close; the page is `inert`. Lenis is not stopped, since a template has no handle on it: the sheet carries `data-lenis-prevent` and `overscroll-behavior: contain`, as the site's own menu does. While open it covers the StudioBar (see "Menus and the StudioBar"). Menu shows its pressed state while open (drawn in the tile at 375 with the first link focused).
- CTA: the ask to `#contact`.
- Visitor page: an uploaded logo sits in a 40 by 160 px box; polarity 'either'; nav labels up to 16 characters, pointing to required sections only.

**2. The lede** (`intro`). Job: state the value and make the first ask with a reason to act, inside the first viewport (the measured table above).

- A copyfitted h1, then a full-measure 2 px rule with the end mark under the headline's last word, then the deck.
- **The slot:** the ask on its floor, with the risk-reversal line under it on surface-muted (on-surface, 500, up to two lines, 15.69:1 or better), max 26rem wide from 48rem and full width on phones. 'How it works' (to `#process`) sits beside the slot from 48rem and below it on phones. The other terms follow as a ruled particulars row with column rules from 48rem (on-surface-muted, no bullets).
- **1024 and up:** 12 columns. The standfirst, slot row and terms sit in columns 1 to 6 on packed rows; plate 0 sits at 4:3 in columns 8 to 12 with a caption rule. A slack last row takes the plate's extra height, so the text column never spreads.
- **768:** one text column, the slot row and terms, then plate 0 full width at 16:9.
- **375:** one column, a full-width slot, the secondary link, the terms, then plate 0 bleeding to both edges at 3:2.
- **1920:** the container stops at 90rem and the h1 at its cap.
- Content height, never full height, so no svh or dvh is needed here.
- **Loading.** Nothing starts hidden. The one plate 0 element loads with `loading="eager"` and `fetchPriority="high"` at every width, and `sizes="(min-width: 90rem) 34rem, (min-width: 64rem) 38vw, 100vw"`. The plate spans 5 of 12 columns inside the 90rem container, gutters included; measured in the tile it is 373.7 px at 1024 (36.5vw), 536.7 px at 1440 (37.3vw), 532.7 at 1600 and 524.7 px at 1920 (27.3vw), where the earlier 36vw asked for 691 px. 38vw (64 to 90rem) and 34rem (544 px, from 90rem) sit at or just above the plate at every width. It is not preloaded, because it is not the LCP at every width: measured in the tile (box areas in the first viewport), the h1's box is larger at 375 × 667, 360 × 640, 1024 × 768, 1440 × 900 and 1920 × 1080, and plate 0's visible part is larger at 768 × 1024 and at Lighthouse's 412 × 823 (see Risks). The WebGL lives here from 48rem.
- CTA: the ask, and 'How it works'.
- **Example:**
  - h1: 'Chimneys swept and stoves fitted, with no soot left behind.'
  - standfirst: 'Sweeping, smoke tests and stove fitting by a two-person firm that sheets the room first and hoovers after.'
  - ask: 'Book a sweep'.
  - risk-reversal line: 'A fixed price agreed before we start', the same mechanism a visitor gets. The rating moved to Record.
  - terms: 'Dust sheets down, room hoovered after', 'A written report on every flue'.
- **Visitor page:**
  - The headline, standfirst and terms are model copy: plain undertakings from the owner's sentence with no digits or claim words.
  - The `promise` slot's guide asks for "one plain undertaking that removes a risk of getting in touch: the price agreed before work starts, when they will hear back, how the room or site is left, or what happens if plans change; no figures, times, prices or guarantees the owner did not write". The fixed claim-free fallback is 'Asking commits you to nothing.'
  - Visitor pages carry no third-party proof of any kind.
  - Plate 0 is the first upload or the ranked Pexels hero, at the lead grade.
  - With plate 0 null, the terms move right as ruled particulars under a 2 px rule, and the headline takes the wider 38ch measure, known at render.

**3. Services.** Job: show what the business does, scannable in one pass.

- The h2 comes first, then the rule with the end mark (the band carries asks). The margin note opens with the reader's question in the display face ('What do you actually do?') and answers in about 45ch: in the margin column from 64rem, above the run-ins below it.
- The first entry leads, with its run-in beside plate 1 at 3:2 and a caption. The rest are run-in paragraphs: the head in the body face at 600, the text running on. They sit in two columns with a column rule from 48rem, one column below. No icons, cards or counts.
- CTA: every run-in ends in 'Ask about this', a 44 px link to `#contact` carrying the service's name for assistive technology and preselecting the slip's topic.
- Visitor page: three to six entries from the brief's value props. Plate 1 is null when the visitor uploaded exactly one photo; the lead entry then spans the main columns at 62ch.

**4. Statement.** Job: give the business a voice between the offer and the process.

- The brief's statement set large in the display face (two copyfit steps), **unquoted**, and signed with the company's name under a short 2 px ink rule. Quotation marks belong to third-party words only. No end mark (no ask here). Plate 2 sits at 4:3 beside it from 1024, and below it on phones.
- CTA: none; the next ask follows the process.
- Visitor page: the company's own reason for existing. Plate 2 is null with fewer than three photos, and the statement then spans ten columns. The fallback uses a fixed claim-free line, never the headline's sentence again (procedure A).

**5. Process** (`#process`). Job: remove "what happens next" at the decision point.

- The three steps as one sentence in the display face, the clauses joined by the template as 'A, B and C', or 'A, B, and C' when clause B itself contains ' and ' (so the example's serial comma below is the join's own output), each clause closed by an aria-hidden footnote numeral in ink. No underlines. The notes sit beneath as an ordered list: three columns with hairlines from 768, stacked on phones. Complete without JavaScript.
- CTA: the second ask in its slot with a one-line reassurance. End mark on the band's rule.
- Example: 'You pick a morning, we sheet the room and sweep, and you get a written report before we leave.'
- Visitor page: clauses and notes come from the brief's steps. A template check needs clauses 2 and 3 in lower case with no closing punctuation. If the model's clauses fail it, the band renders as a plain ordered list rather than spending a paid retry. The fallback's fixed clauses: 'Tell us what you need, we agree the details and we get to work'.

**6. Particulars.** Job: answer practical questions as a short spec, with the ask beside it.

- Three or four run-in rows on hairlines: a fixed label in the body face at 600, followed by the value ('What we do', 'Who it is for', 'Where', 'How to start'). No dotted leaders. Values come from the brief and are nullable: a null value drops its row, and fewer than three values makes the band null. A margin note sits at the foot.
- CTA: the ask at its foot, with an end mark.
- Example, as the tile shows it, using only the fixed labels: 'What we do: sweeping, smoke tests and stove fitting', 'Where: Hebden Bridge, Todmorden and the Calder Valley', 'How to start: book a morning here, or ring'. Then a rates table (example only) with right-aligned tabular figures: sweep with a smoke test £75; second chimney, same visit £40; bird nest removal from £95; stove fitting, supplied and installed, from £2,400.
- Visitor page: rates are null. The guide bans hours, prices, places and times the owner did not give.

**7. Record (example only).** Job: proof by figures, as one sentence in the display face with the figures in Public Sans 600 `tabular-nums` in ink: 'Since 2012 we have swept 4,300 chimneys across the valley, and 260 customers rate us 4.9 of 5.' Visitor page: null; its rule and spacing are not rendered.

**8. Reviews (example only).** Job: third-party proof before the objections. Two or three short quotations in the display face, with hanging marks and staggered indents, and a first name and village in the body face. These are the only quotation marks on the page. No stars, avatars or cards. Visitor page: null.

**9. Questions** (`#faq`). Job: answer the remaining objections before the final ask. Native `details` rows on hairlines, questions in the display face, answers at 62ch, rows at least 56 px. From 80rem the heading and a note pointing to the reply slip sit in the margin column. Visitor page: four to six model-written pairs, one on cost answered without figures, one on how to start.

**10. The reply slip** (`#contact`). Job: convert. It comes last, so every ask moves down to it. Drawn in the tile at 1440 and 375, in both schemes and in every state.

- A closing headline (copyfit), with the end mark on its rule, and a reassurance line on the left. The slip sits on the right on surface-muted with **boxed fields**: surface fields with a 1 px on-surface-muted edge (6.43:1 worst against the slip), min 48 px tall, labels above in on-surface 500, and "(required)" and "(optional)" in words.
- The fields are name, email, a topic select ('What is it about?': the service names plus 'Something else', preset by 'Ask about this', with the chevron drawn in ink from gradients) and a message, with `autocomplete` tokens throughout.
- The submit is the ask in its slot, labelled with the ask itself ('Book a sweep'; on a visitor's page the ask slot), so the one action colour keeps one label. The tile showed 'Send the enquiry' until this pass; it now shows the ask. Without JavaScript the submit is inert and the demo note visible.
- **States.**
  - Focus: the 2 px ring.
  - Error, in ink only: a 2 px on-surface field edge, `aria-invalid`, and a sentence under a 3 px ink rule ('Enter an email address with an @, so we can reply.').
  - Submitting: the label reads 'Sending your enquiry' with no arrow, `aria-busy`, fields dimmed to on-surface-muted, 'your words stay here if it fails'.
  - Success and failure are announced through `role="status"`.
- At 375 the slip follows the headline at full width. `scroll-margin-top` equals the masthead's height minus 4rem at each breakpoint.
- **Visitor page:** decision 5's demo state. The form validates, and on submit the slip is replaced, in the template's own tokens, by a note: 'This is a preview, so nothing was sent. On {company}'s live site, this enquiry would arrive in their inbox, and their reply would go to the address you gave. To have a site like this made for real, use Book a call at the top of this page.' This is chrome under decision 11. Nothing is sent and no value enters the URL. The example shows a realistic confirmation in Kestrel's voice.

**11. Colophon** (footer). Job: close with the essentials, set as a printer's colophon under a heavy rule.

- Contents: the wordmark; a one-line description; the nav again; the email as plain text; photo credits; the copyright.
- Every link is padded to 44 px. No watermark, no newsletter.
- **Visitor-page sources:**
  - The wordmark is the company name.
  - The description line is the Particulars 'What we do' value, omitted when null.
  - The email is the lead's own address (`page.tsx:72`), shown as text, not a mailto (decision 5).
  - The credits are 'Photographs by {name} on Pexels' from each `SlotImage`'s credit, as chrome.
  - The copyright is '© {year} {company}', with the year computed at render, not at module load.

**Each width, deliberately** (all drawn in the tile for Kestrel and the solicitors):

- **375.** One column, full-width slots, plates bleed, the Menu sheet, no WebGL.
- **768.** Nav in the masthead, the slot and the secondary link side by side, terms in a ruled row, plates full width at 16:9, process notes in three columns, and the light runs.
- **1024.** The 12-column deck with plate 0 right at 4:3; services and particulars in two columns.
- **1440.** The margin column from 80rem; the banner headline on two or three lines.
- **1920.** The container stops at 90rem and the h1 at its cap; margins grow and nothing stretches.

No horizontal page scroll at 320, 375, 768 or 1440 (tile probe; the fold table scrolls inside its own box at 320).

##### How it adapts across industries

Everything uses the existing mechanism: the copy object, the 14 tokens, the two font variables and three image slots (lede, services, statement). The tile renders four businesses at 375 and 1440, two of them also at 768, 1024 and 1920.

- **Chimney sweep, the example** (#b3261e, light, Besley with Public Sans). The 59-character headline takes the middle step: three lines at 1440, four at 375.
- **Bakery** (warm style, #b45309 to brand-deeper #9d4600 at 6.07:1). Fraunces with Instrument Sans. The 27-character headline takes the banner step, 128 px at 1440. The undertaking is 'Order by Thursday, collect on Saturday, pay on collection'. Run-ins: 'Sourdough.', 'Pastries.', 'Celebration cakes.'.
- **Solicitors** (dark style, #57534e, forced dark, brand-deeper #a29e98 at 7.29:1). Sora with Inter. The 90-character headline takes the smallest step. With no photograph, the terms sit right as ruled particulars. A grey brand makes a monochrome night edition whose ask still reads through its slot. 'Book a consultation' (148 to 153 px) is too wide for the phone bar, so `askShort` is 'Book a call'.
- **Three cases specified, not rendered in the tile** (their token ratios are computed with the palette tool; no frame draws them):
  - **Physio** (minimal, #0e7490 to #006e8a at 5.59:1). Manrope with Inter. One upload leaves plates 1 and 2 null, so the lead service spans and the statement spans ten columns.
  - **Landscaper** (bold, #4d7c0f to #457200 at 5.51:1). Bricolage Grotesque with DM Sans.
  - **Software firm** (minimal, light-artwork logo so dark by polarity, #6366f1 to #8792ff at 7.01:1). No product UI. An uploaded screenshot is graded like a photograph at the lighter lead strength; the tile's grade proof shows that grade on a fictional app screenshot drawn in the tile, not on this firm's page.

**Short or long copy.**

- Copyfit steps are chosen at render: h1 three, h2 two, statement two, wordmark three placements.
- Measure caps: body 66ch, standfirst 46ch, FAQ 62ch, notes 45ch.
- Run-ins and particulars flow rather than fill fixed boxes. `text-wrap: balance` and `pretty` are on, with `overflow-wrap: anywhere` and `hyphens: auto` against single long words at 375.
- The worst case the schema accepts is drawn at 375, 768 and 1440. Every slot's minimum and maximum is tested at 375 and 1920 on the fixture.

**Any photography or none.**

- One grade from the tokens in CSS, lighter on the business's own pictures.
- Landscape ratios close to the sources.
- No text on any photograph, so no scrim.
- Each null plate is a designed layout variant chosen at render, never a placeholder. With all three null the page is fully typographic and complete.

**A swapped accent.** Only brand-deeper is visible, and it is solved against the paper: 5.39:1 or better on light and 6.21:1 on dark. There are no glows or tints, so no hue shift and no second hue.

**What the mechanism cannot handle (flagged).**

- **Photographs.**
  - Slots have no focal point or declared ratio. A portrait upload loses its top and bottom, and copy-space stock crops to empty background (the tile's food plate).
  - The grade reduces clashes between mismatched photographs; it cannot make them one series.
  - The copy model never sees the chosen photographs, so an unrelated stock photo can sit above a correct caption.
  - Every upload is treated as a photograph. A screenshot, menu or logo is graded like the rest, and there is no per-image opt-out.
  - Uploads leave later slots null (one upload empties plates 1 and 2). A Pexels top-up rule would change `lib/images/plan.ts`.
- **Type and copy.**
  - The template cannot tell which pair it is in, so tracking, leading and copyfit thresholds are one set for all four; Sora sets widest and the thresholds are checked against it.
  - Roman only: no real italics for quotes or captions, and none are used.
  - No figures, prices, ratings, testimonials or compliance lines on a visitor's page. The owner sees that state only on the Phase 3 fixture route.
  - The process sentence needs a grammar check the mechanism cannot enforce beyond that check; failure falls back to a list.
- **New slots.**
  - `askShort` is a new slot whose width depends on the face, which the copy check cannot measure, so the cap is characters plus a fixture measurement.
  - `promise` is a new slot. Its risk-reversal must come from the owner's sentence or the fixed fallback, and the model cannot verify that the business actually offers it.
- **Colour.**
  - On light schemes the visitor's exact pale hex never appears (brand-deeper is solved dark).
  - A grey brand gives an ask that reads as neutral, carried by its slot, not by colour.
- **Industry.** There is no industry field, so Placard carries no sector nouns, icons or form fields.
- **Owner decisions.** Contact depends on decision 5, per-template meta on decision 9, and English chrome on decision 11: Menu, Close, '(required)', '(optional)', the error sentences, the preview note, 'Photographs by ... on Pexels' and the copyright line.
- **Browser support.**
  - The slot's walls need `color-mix` (Chrome 111, Safari 16.2, Firefox 113); older engines get a flat 1 px edge.
  - The scheme-aware wash needs relative colour syntax (Chrome 119, Safari 18, Firefox 128); older engines get a flat wash.
  - The end mark sits on the rule through a zero-width inline-block and `--rg`, so a Phase 3 change to the rule's margin must move both together.

##### Principles carried from the four, and surface traits deliberately left behind

Carried:

- **Ember:** one brand colour spent on action; reveals that hide nothing without JavaScript; `fill-mode: backwards` load motion; sampled-spring easings; token-true ornaments (the end mark and the slot's walls all come from tokens); an isolated root.
- **Harbor:** the whole hero stack in one viewport; hairline structure instead of boxes; native `details` beside the conversion point; the `motion()` helper; strict tokens; a full-sheet phone menu with the ask.
- **Summit:** one action colour whose label never changes (the slip's submit carries the ask's own label); three named speeds; careful accessibility plumbing; a progression that works with zero JavaScript; captions on rules.
- **Vector:** real scale contrast (a 128 px banner against a 22 px standfirst); WebGL that reads the tokens, adapts to the scheme from the surface's luminance and has a designed fallback.
- **Phase 1 fixes:** a sticky in-flow header with a phone ask; declared pairs only; a 3:1 focus ring; neutral ids; two radii (2 px controls, 4 px slot); a text LCP; padding owned by each band; one container recipe; a boxed, labelled, autocompleted form that never writes to the URL.

Not carried:

- **Ember:** the centred hero over a textured photo, the avatar and star row, cut-outs, caps eyebrows, laurels, giant ordinals and the full-bleed brand band.
- **Harbor:** capitals, neon on black, lit phrases, the stats row, gap-px cells and the dimmed photo hero.
- **Summit:** the photo faded to white, the badge chip, the sticky deck, black buttons with a 4 px arrow nudge, the dashed-ring timeline and the outline watermark.
- **Vector:** the colour field and scanlines, the serif-italic payoff, stadium duotones, glass pills and the letter-by-letter pin.

**Distinct from the rest of the set.**

- **The first version's familiar tells are gone:** the red tab on the left end of a black rule (the Economist's box), the rectangular red button with a nudging arrow (Summit's button recoloured), the dash-bulleted terms, and the hanging-quoted house statement.
- **What remains is Placard's own:** the end mark placed by the copy, the slot with its undertaking, margin-note questions, run-ins with column rules, the footnoted process sentence, and copyfit.
- **Aurora:** no glow, centred hero, product window, pills or bordered closing box.
- **Monolith:** no floating cards, lit words, icon grids or stats strip.
- **Meridian:** no capsule header, logo tile, chip, screenshot or eyebrows over centred h2s.
- **Atlas:** no 3D, market rows, gradients, rounded geometric sans or shadowed cards.
- **The studio's home:** no fluid or ink (the WebGL is still paper lit once, with no colour of its own), no curved edges, no grotesque with a serif-italic swap, no capsule header, navy and sky bands or browser frames.
- **Intaglio** (the fintech direction nearest in spirit): fine security print on outlined documents against a bold letterpress bill on one continuous sheet; slab against transitional serif; no mono, dotted leaders, torn counterfoils, double-ruled totals or seal; photographs central; a raking light on paper against an engraved medallion. The residual overlap is that both are light, paper-like and ruled. If the owner picks Intaglio and wants the widest gap, Mullion is the better multi partner.
- **Mullion:** one sheet and one spot colour against a grid of colour panes.
- **Sheaf:** no rounded app surfaces, dock, particles or product UI.

##### Risks

- **The light's strength.** The texture is now capped at border and the walls at a 55% mix, which is quieter than the first version. Judge it on a real monitor at 1x and 2x, not in a screenshot. It may now be too quiet to be worth its bytes (open question 1).
- **A text-led page exposes weak copy.** The fallback needs fixed claim-free phrases per slot, never the owner's sentence twice.
- **Grading colour-critical products.** The lead strength keeps food recognisable in the tile, but the owner should judge a real bakery fixture; the strengths are template constants.
- **Four pairs.** The owner reviews a slab example, but visitors get one of four pairs, three of them sans. The tile shows the whole kit under all four; judge the fixture in each.
- **Worst-case phones.** On a 360 by 640 phone a two-line undertaking under a five-line headline falls below the fold (open question 8).
- **Masking** depends on settled layout. The pass starts after fonts are ready and re-measures on resize; the border cap makes a missed mask legible anyway.
- **Plate 0 as LCP.** Measured in the tile by box area in the first viewport: plate 0's visible part is larger than the h1's box at 768 × 1024 (about 302,000 against 112,000 px² for the example) and at Lighthouse's 412 × 823 (61,000 against 51,000 for the example, 72,000 against 34,000 for the bakery); the h1 is larger at 375 × 667, 360 × 640, 1024 × 768, 1440 × 900 and 1920 × 1080, though close at 1440. The one plate element is already eager and high priority at every width, so loading needs no change, but the LCP element must be measured on the fixture at 412 × 823, 768 × 1024, 1024, 1440 and 1920.
- **Browser support.** `mix-blend-mode`, `color-mix` and relative colour syntax need a cross-browser check.
- **Budget.** The WebGL leaf and any new client code reach every preview while `render.tsx` imports all templates.
- **The demo note's home.** The preview note is drawn in the template's own tokens, because templates cannot paint studio colours. If the owner prefers a studio-rendered note, that needs a contract callback.
- **Name.** 'Placard Wizard' (hazmat placard software) exists outside finance and web design; this is not a trademark search.
- **Selector tones.** Suggested: 'printed', 'typographic', 'measured', avoiding the 'editorial' that Atlas and Vector carry.

##### If the owner decides otherwise

- **1, set size:** no design change. The id becomes `t09` or `t10`, or the page stays example-only.
- **3, GSAP:** Placard uses none either way. If the owner's brief requires GSAP in every new template, its one job from 48rem is the arrival at the slip: the topic flips, the end mark strikes and focus lands, sequenced after Lenis settles. That costs 27,185 B after the first scroll and the ESLint change the analysis names.
- **4, helpers copied, not shared:** the lifecycle is copied into the template; no visible change.
- **5, an honest mailto:** the slip becomes one 'Write to {company}' link with the address set large, still in its slot. **A real endpoint:** the same form submits for real and the preview note goes.
- **6, a fit signal:** no change; selection could weight Placard toward service businesses.
- **7, font override:** not needed for figures (a visitor's page has none). A Besley display override would keep the slab for every visitor at one more lazy face per preview: a static 600 cut, 18,916 B latin (the variable file is 36,592 B). The tile's pairs proof argues the structure carries without it.
- **8, the flag as a prop or data attribute:** no visual change.
- **9, per-template meta granted:** the title becomes the company plus the standfirst's first clause, rendered with the root layout's ' | PinnaclePX' suffix (`app/layout.tsx:33`) unless the field returns `title: { absolute }`, in place of the route's 'design N of M'; the description is the standfirst.
- **10, gain and loss colour:** no effect (no figures on a visitor's page).
- **11, chrome in the content object:** Menu, Close, the field words, the error sentences, the preview note, the photo credit and the copyright line move into copy.

##### Open questions for the owner

1. Is the pressing worth about 4.5 kB and a desktop GPU context, now that the slot reads without it and the light is quieter? Or should Placard ship the static slot everywhere? Decide on a real monitor.
2. Settled by this revision, pending your agreement: the example's lede uses the visitor mechanism (an undertaking), and the rating lives in Record.
3. Settled by this revision, pending your agreement: a grey brand keeps a neutral ask, carried by the slot's 3:1 edge and the 600 label, with no on-surface fill and no chroma signal. See 'Primary, grey brand' in the tile's buttons proof.
4. Approve the new `askShort` slot (14 characters, fixture-measured against 7.5rem in all four body faces).
5. Approve the new `promise` slot (12 to 72 characters, risk-reversal only) and its fixed fallback 'Asking commits you to nothing.'
6. Answered in part: on dark paper the laid lines read as Vector's scanlines, so they are gone there and halved on light. Does the light paper's grain read as paper to you on a real screen?
7. Approve Placard without GSAP, a deviation from decision 3's allowance, recorded in the ADR.
8. The worst case at 360 by 640 puts a two-line undertaking below the fold. Accept it (the masthead ask stays in view), or cap `promise` at one line (about 40 characters) on every page?

#### Mullion against Placard

| Aspect           | Mullion                                                                                                                                                                                                       | Placard                                                                                                                                                                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Segment          | small service businesses whose site has one job, a first enquiry                                                                                                                                              | the same                                                                                                                                                                                                                                            |
| Primary CTA      | the brief's `ctaLabel` ('Book a survey'), `askShort` in the header cell; every ask lands on the form at `#contact`                                                                                            | the brief's `ctaLabel` ('Book a sweep'), `askShort` in the masthead and a `promise` line under the ask; every ask lands on the reply slip at `#contact`                                                                                             |
| Scheme bias      | light by default with viridian `#0f7a6c` colour panes; the dark style turns the panes pale with near-black text                                                                                               | a light cream sheet with one vermilion spot `#b3261e`; dark is a night edition                                                                                                                                                                      |
| Type             | Schibsted Grotesk 600 over Source Serif 4 400 and 500 on the example; both OFL; visitors get their pair                                                                                                       | Besley 600 over Public Sans 400, 500 and 600 on the example; both OFL; visitors get their pair                                                                                                                                                      |
| Signature        | one square ruled frame of asymmetric panes; colour means "act here", running as one column from the header cell through the call pane into the closing block; two-light button cells flush in the pane corner | a printed bill: copyfitted banner headline, heavy rules with an end mark only where there is an ask, margin notes that open with the reader's question, run-ins, a footnoted process sentence, and the ask pressed into a slot with its undertaking |
| Motion           | rows assemble in grid order and the closing colour widens from the ask column; GSAP core from 48rem after the first scroll, a CSS rise below                                                                  | rules draw and end marks strike above each ask; CSS and one observer, 0 B of GSAP                                                                                                                                                                   |
| WebGL moment     | a stepped tile field in the call pane: a front crosses toward the ask and the ring round it lifts; from 48rem, on intent; hidden at rest                                                                      | one raking light across laid paper that comes to rest above the pressed ask, with the slot's walls answering in CSS; from 48rem, on intent                                                                                                          |
| Photographs      | in their own ruled panes at fixed ratios, ungraded; slot 0 in the hero from 64rem; a null slot becomes the wordmark pane or a re-span                                                                         | one CSS grade from the tokens, lighter on uploads; plates at fixed ratios; each null plate is a designed layout variant                                                                                                                             |
| Declared pairs   | nine; 0 existing tokens shifted                                                                                                                                                                               | seven, all already declared by Aurora; 0 existing tokens shifted                                                                                                                                                                                    |
| Strongest reason | one affordance that holds for any hex, face pair and copy length: a coloured pane always holds an ask                                                                                                         | the most robust text-led visitor page, and a phone page shorter than the four existing templates' (about 7,000 to 7,500 px at 375, estimated, against their 8,900 to 13,500; Mullion's bakery page measures 5,461)                                  |
| Biggest risk     | a spreadsheet feel or an echo of Harbor's grid, and a WebGL lift (1.47:1) subtle enough to read as decoration                                                                                                 | the slab identity is the example's, while three of the four visitor pairs are sans; a light that may be too quiet to earn its 4.5 kB; the closest direction to Intaglio                                                                             |

**Recommendation: Mullion**, for the owner to accept or overrule.

1. **Its conversion grammar is structural.** Colour meaning "act here" survives every face pair, hex and copy length, so the page a visitor gets is the page the owner judged. Placard's tile shows its structure still reads as a bill under all four pairs, but the slab the owner reviews on its example reaches no visitor.
2. **It keeps the set far apart.** It is the multi direction furthest from both fintech directions, and with Intaglio it gives the widest gap in the set; Intaglio and Placard are the closest pair.
3. **It uses GSAP as the brief asks,** inside the recommended arming rules (core only, from 48rem, after the first scroll, no ScrollTrigger).
4. **Two of three judges ranked it first.**

Choose **Placard** instead if the owner picks Sheaf for fintech (either multi direction then keeps a wide gap), or values a page that looks art-directed with weak photographs over the colour grammar. It then needs the `promise` slot approved and its light judged on a real monitor. If the owner reads Mullion's tile field as decoration, its CSS sweep is the fallback, and the template's one WebGL moment would need another home.

#### What the mechanism cannot handle

Consolidated from the four specs. None of it blocks Phase 3; each item is a limit the directions design around or a change that needs the owner.

- **No industry field.** The brief and the selector carry no sector, so no template can show menus, hours, price lists, portfolios or product screenshots, and a fintech page will be shown to a bakery (decision 6).
- **No figures or claims on a visitor's page.** `rules.ts` bans digits the owner did not type and claim words, so prices, fees, ratings, years, counts, testimonials, accreditations, compliance lines and disclaimers live only in optional sections the example fills. A disclaimer is never generated.
- **Invented promises get through.** A claim without digits or listed words ('same-week slots', 'Delivery in the morning' built from the sentence's own words) passes `rules.ts`. Guide rules, a grounding check and fixed fallbacks limit it but cannot prove it. `copyViolations` does not see the owner's sentence today (`lib/copy-slots/contract.ts:22`) and the copy model is never shown it (`lib/ai/prompts.ts:52-58`), so a template-local claim list, an owner-typed price check or a grounding check each need a shared change first (`copyViolations(copy, ownersWords)`, and the sentence in `copyPrompt` or grounding against the brief). A value that fails still fails the whole template's copy into its fallback, not one row.
- **Photographs.** Slots declare no ratio or focal point; Pexels is landscape only; uploads fill slots in order and leave later ones null; there are no portraits or cut-outs; the copy model never sees the chosen photos; and every upload is treated as a photograph, screenshots and logos included.
- **Type.** Only the four pairs reach a visitor, and the template cannot tell which one it is in. Fraunces and DM Sans have no tabular figures, so a figure face needs decision 7's override. Roman only.
- **Colour.** The template cannot choose the scheme and cannot know it at render, because `assemble` gets copy and assets only; CSS can derive from `--surface` through relative colour syntax, and script can read the computed token, as Vector's waves and Placard's light do. There is no success, danger, warning or gain and loss token, so every state is monochrome. Pale, yellow and lime brands turn olive on light, and a visitor's exact pale hex never appears.
- **Fixed counts.** The schema sets row counts, so a business with two services still gets three rows.
- **New slots.** `askShort` (all four) and `promise` (Placard) are template-local, but their width depends on the face, which the copy check cannot measure: their caps are characters plus a fixture measurement.
- **Contact.** On a visitor's page the only address is the lead's own, so every form is decision 5's demo state with chrome worded under decision 11. There is no calendar booking and no app-store link field.
- **Unvalidated fallback.** Fallback copy is stored unchecked (`build-concepts.ts:173`), so each new fallback must be tested against its own ranges.
- **Shared bytes.** Every preview links every template's stylesheet and imports every template's client code (`templates/render.tsx`), so each new template adds weight to every preview until client code loads per template id.
- **Meta and the WebGL switch.** Per-template meta needs decision 9's optional contract field; the WebGL switch is a template-local constant because templates may not import `lib/config` (decision 8).
- **No proof yet.** There is no fixture render path and no axe or Lighthouse run on any template route ("Tooling the bar needs").

### Checkpoint 2

**Owner:** pick one direction per template (recommended: Intaglio for fintech and Mullion for any industry), answer decisions 1 to 11 in "Decisions before Phase 2", which every direction assumed, and answer the chosen directions' open questions before Phase 3 builds them.
