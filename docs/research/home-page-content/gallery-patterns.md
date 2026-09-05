# Showing rendered example designs on the home page: patterns, evidence and a recommendation

Research note for the home page plan, 5 September 2026. Scope: how to put a finished design in front of the visitor without faking a preview, at three states of the template library (one ready, three ready, ten ready). Labels follow the repo's convention: evidence, practitioner opinion, observed (a page or file loaded today), business reasoning. Anything not verified is marked **Unverified**.

## 0. What the codebase gives us today (observed, 5 September 2026)

- `templates/t01-aurora` is a server component with one client leaf (`sections/nav-menu.tsx`, 3.2 KB of source) and a scoped stylesheet `aurora.css` whose keyframes ship only with routes that render the template (ADR 0008, decision 5). Placeholders t02 to t10 render only their name inside `min-h-screen`.
- Aurora lays out with viewport breakpoints, not container queries: 35 `sm:`/`md:`/`lg:` occurrences across 10 of its 12 files, six viewport-unit values (`h-[70vh]`, `top-[-20vh]`, `h-[50vh]`, `top-[-15vh]`, `h-[45vh]` in `aurora-field.tsx`; `min-h-[70svh]` in `statement.tsx`), zero `@container`, `@md:` or `cqi`. The design plan (section 3.5) and the research (section 3) both said templates must be container-query based before one can be shown live inside a home page frame; Aurora was built before that rule landed. The CI grep in `.github/workflows/ci.yml` forbids hex literals and Tailwind palette classes under `templates/`, and nothing else; the planned grep for `md:`, `lg:`, `vh`, `dvh`, `svh` does not exist.
- A live Aurora embed would duplicate landmarks and ids on the home page: Aurora renders `<div id="top">`, `<main id="main">`, `<header>`, `<nav aria-label="Main">`, `<footer>`, an `<h1>`, and sections `#start`, `#features`, `#how-it-works`, `#why`. The home page already has `id="main"`, `#how-it-works` and `#start`. Any live embed needs an `embedded` mode in the template contract (no landmarks, no ids, headings demoted to `p` or `aria-hidden`), which is an amendment to ADR 0008.
- Cost of one live Aurora instance, measured from the owner's dev server at `http://localhost:3000/examples/aurora`: the fragment from `<div id="top"` to `</footer>` is 23,097 bytes raw, 4,397 bytes gzipped, 180 elements. The production `/` prerender (`.next/server/app/index.html`, built 5 September 2026 01:25) is 21,696 bytes gzipped against the 25,000 budget in `scripts/bundle-budget.mjs`: 3.3 KB of headroom. One live embed exceeds the HTML budget; three are out of the question without a new budget line.
- The example brand on `/examples/aurora` is Kestrel, an invented job-scheduling product, with two Pexels photographs (`gauge.webp` 41.5 KB, `radiator.webp` 83.1 KB at twice display size) and two Google fonts (Bricolage Grotesque, Instrument Sans, `preload: false`). Kestrel is not one of the three approved example businesses (VetPres, Mvmnt, Go Wild Dog Walking, PRODUCT.md line 47). The route is `noindex` and unlinked; ADR 0008 item 7 says the examples gallery replaces it.
- The home page's example brief is VetPres (`lib/brief/example-brief.ts`: description, wordmark, `minimal` style, custom teal `#2e8c9c`, one clinic photograph). The hero already loops a wireframe into a finished-page illustration (`app/_components/built-page.tsx`, client-only, Montserrat and Caveat Brush) under the caption `SKETCH_CAPTION.built`: "The same example brief, built as an illustration. Not a client, and not one of the designs." So the page already performs a "sketch becomes page" transition with an illustration; the real render can take that illustration's place in a second, still, labelled appearance.
- `BriefSketch` accepts a `built` node for the browser frame and `phoneBuilt` for the phone frame (`components/sketch/brief-sketch.tsx`). A rendered capture can be passed in as an `<Image>` child, so the finished design sits inside the frames the sketch already uses. No new frame component is needed.
- Budgets that bind: `/` scripts 210 KB (201 used), stylesheet 14 KB (13.4 used), HTML 25 KB (21.7 used); Lighthouse mobile: LCP 2,000 ms, CLS 0.02, TBT 150 ms, images 500 KB, total 600 KB, performance 0.95 (`lighthouserc.json`). E2E projects: desktop, mobile (asserts `document.documentElement.scrollWidth === 390`), tablet, reduced-motion (asserts no running animation on `transform` or `translate` after scrolling the page), no-script (heading counts in `#straight-answers` and `#what-you-get`), axe with `wcag2a`, `wcag2aa`, `wcag22aa`.
- `next.config.ts` sets `images.remotePatterns` only. Next 16.3.4's `image.md` (in `node_modules/next/dist/docs`): a static import supplies `width`, `height` and `blurDataURL` automatically; `priority` is deprecated in favour of `preload`; without `sizes` the browser assumes `100vw`; `formats` defaults to `['image/webp']` and accepts `['image/avif', 'image/webp']`; `qualities` defaults to `[75]` and the doc says the field "is required starting with Next.js 16" (the default still applies when it is absent; set it explicitly to remove the ambiguity).
- The pipeline's `READY_TEMPLATES` filter (`templates/registry.ts`) means a real submission today builds one design, not three. Whatever the examples section shows, the "three designs" promise elsewhere on the page is untrue until three templates are ready. The gallery must not deepen that gap; section 6 gates its copy on the ready count.

## 1. Presentation patterns compared

Costs are for the examples band below the fold; the H1 (desktop) or subhead (phone) stays the LCP element in every option. "JS off" is the no-script Playwright project.

### 1.1 Static capture of the real render, in the page's own browser and phone frames

- Mechanism: Playwright captures the real example route; the file is committed under `app/_images/examples/`, statically imported, and shown through `next/image` inside `BriefSketch`'s `built` slot (browser) and `phoneBuilt` slot (phone).
- LCP: none (below the fold, `loading="lazy"`). If a capture ever moves above the fold it becomes the LCP candidate; note Chrome ignores images under 0.05 bits per displayed pixel for LCP since about Chrome 112 (evidence, Chromium metrics changelog, April 2023), so a flat, mostly one-colour design capture can be excluded and a slow hero image can hide behind a "good" LCP.
- CLS: zero. Width and height come from the static import and the frame has a fixed aspect. INP: zero, nothing interactive.
- Bytes: a first-viewport capture at 1440x900, device scale 2, displayed at most 672 px wide (`max-w-2xl`), served as AVIF by `next/image`. Estimate 40 to 80 KB per desktop capture and 15 to 25 KB per phone capture (**Unverified** until the first render; budget them at the plan's 60 KB non-LCP photo line and fail the render script over 100 KB).
- Accessibility: an `img` with alt text that says what the design is ("Aurora layout for the VetPres example brief: dark page, teal headline, product window") plus the visible mono caption. Nothing to operate. WCAG 1.4.5 does not treat it as an image of text: "screenshots, and diagrams which visually convey important information through more than just text" are excluded from the definition (evidence, W3C Understanding 1.4.5).
- JS off: identical. Reduced motion: identical (nothing moves).
- Honesty: a picture of a real render is real, provided the caption says what it is and the render came from the route the link opens. Drift is the risk: a template change leaves a stale picture. Section 5 handles freshness.
- Verdict: the primary mechanism at every state. Every gallery observed today uses it (section 2).

### 1.2 Long screenshot with hover-to-scroll

- Mechanism: full-page capture, frame with `overflow: hidden`, `translateY` on hover over several seconds.
- Bytes: a 1440 by roughly 5,000 px capture is 150 to 300 KB even as AVIF (**Unverified**, estimate from the first-viewport figure scaled by height). CLS zero if the frame is fixed. INP zero.
- Accessibility and phones: hover does not exist for the 83% of this audience on a phone (evidence cited in the home page plan, Unbounce) and a focus equivalent is needed for keyboard. The movement is a long `transform` animation, which the reduced-motion e2e project forbids after scroll, so it must be gated behind `motion-safe`. It is also close to the design plan's "never" list (autoplay, marquee).
- Honesty: fine.
- Verdict: no. Hover-only, byte-heavy, and the page has one authored motion already (the hero loop, ADR 0006).

### 1.3 Scaled live render of the real component inside a container

- Mechanism: render `<Aurora content={...}/>` on the server inside a fixed-aspect box, either `zoom: 0.31` (Baseline 2024, newly available since May 2024; "can affect the page layout", MDN) or a 1280 px-wide inner element under `transform: scale()` (no layout effect, MDN). Mark it `inert` (Baseline widely available since April 2023: no focus, no click, no find-in-page, excluded from the accessibility tree, MDN) and `aria-hidden`, with an sr-only description beside it.
- Layout: with `zoom`, container queries inside see the zoomed width (about 1,290 px for a 400 px box at 0.31), so a container-query template renders its desktop layout; with `transform`, the inner element is given the desktop width explicitly. Aurora today uses `md:` and `vh`, so inside any home page frame narrower than 768 px it renders its phone layout and its glow field is sized to the page viewport, not the frame. A refactor to `@container`, `@md:` (28 rem) and `cqi` (Tailwind 4.3 ships these in core, no plugin, observed Tailwind docs) is required first, plus the `embedded` mode from section 0.
- Bytes: +4.4 KB gzipped HTML per instance (measured), `aurora.css` joins the `/` stylesheet (about 0.6 KB of headroom left on a 14 KB budget), the phone menu client leaf joins the initial script tags, the example brand's two font files load on `/` (Bricolage and Instrument Sans for Kestrel; VetPres's pair would differ), and the brand's photographs load through `next/image`. `backdrop-blur-xl` on the product frame and three radial gradients cost paint on a mid-tier phone even at thumbnail size.
- CLS: zero inside a fixed box with `overflow: hidden`. INP: zero when inert. Reduced motion: Aurora's own CSS honours it. JS off: complete (server-rendered).
- Accessibility: text at 0.31 scale is about 5 px and unreadable, the same as a thumbnail; the sr-only description carries the meaning; nothing is focusable. Duplicate landmarks and ids are the real hazard (section 0).
- Honesty: the strongest of all. It is the actual component, always fresh, and a polarity or colour toggle is one CSS-variable swap, which would demonstrate the token engine for free.
- Verdict: the right upgrade for a single hero example once templates are container-query based, and never for nine (nine instances are about 40 KB of HTML, nine image sets and up to nine font pairs). For the one-ready state it costs an Aurora refactor and an ADR amendment before anything can be seen; the capture pipeline costs the same effort and is needed for three and ten anyway. Defer; write t02 onward with container queries from the start so the option stays open.

### 1.4 Sandboxed iframe of the real preview route

- Mechanism: `<iframe src="/examples/vetpres/aurora" loading="lazy" sandbox title="...">` scaled with `transform` on a 1280 px-wide frame.
- Layout advantage: the iframe's own viewport is 1280 px, so Aurora's `md:` classes work unchanged; no refactor.
- Bytes and main thread: a second full document. The example route's HTML alone is 13.7 KB gzipped in dev, and a Next page brings the React and Next floor (about 155 KB gzipped per the plan) unless `sandbox` without `allow-scripts` blocks hydration. Even then the browser parses and lays out a whole page. web.dev: embeds are "an `<iframe>` that pulls in a page composed of markup, scripts, and stylesheets"; lazy loading saves about 500 KB for a YouTube embed; the facade pattern (a static stand-in) is "224 times faster" (evidence, web.dev embed best practices). `loading="lazy"` on iframes is supported in Chrome 77+, Firefox 121+ and Safari 16.4+ (evidence, web.dev iframe lazy loading).
- Accessibility: a nested document with its own landmarks, a keyboard trap risk, and scrolling inside a scaled frame on touch. Needs a `title`.
- Budgets: `scripts/bundle-budget.mjs` reads only the scripts referenced by `/`'s HTML, so an iframe's document would slip past it, but Lighthouse's resource summary counts every request, so the 230 KB script and 600 KB total lines would fail if the iframe loads during the run.
- Honesty: real.
- Verdict: no for the home page. Acceptable only as a review tool. The static capture of the same route is the facade web.dev recommends.

### 1.5 Desktop and phone pair

- A composition, not a mechanism: one desktop capture in the browser frame with the phone capture over its corner, exactly how `BriefSketch` already places `PhoneSketch`. It answers "credible on a phone" (gap 2) with a picture rather than a claim, and it costs one extra small image.
- Verdict: yes, at every state, using the existing frames.

### 1.6 Dark and light polarity toggle

- Aurora accepts either polarity (`?scheme=light` on the example route). With captures, a toggle means two images per design and a control; with JS off it can still work through radio inputs and `:has(:checked)` in CSS, or degrade to showing the default. The change is an opacity crossfade, which WCAG 2.3.3 and the design plan permit under reduced motion.
- Value: shows "your colours, on a dark or a light page" without a fake palette row. Cost: doubles renders and adds a control to test. No gallery observed today offers it (section 2), so it is a differentiator, not a convention.
- Verdict: not at one; optional at three; recommended at ten if the token engine's light scheme is part of the pitch. Owner decision (section 7).

### 1.7 "Open this design" link

- Every gallery observed today ends its card with a link to the real thing: Framer "Show Preview", Webflow "Preview", Relume "Preview", Wix "View", ThemeForest "Live Preview". It is the convention and the honesty valve: the picture is a picture; the link is the page.
- Cost: nothing. A `TrackedLink` with `example_open`. The destination must carry the label line ("Made from a five-answer brief we wrote ourselves. No client was involved." from the research) and a way back.
- Verdict: yes, at every state. Same tab (the repo has no new-window convention and WCAG 3.2.5 prefers none); owner may override.

## 2. How the galleries do it today (observed, 5 September 2026)

| Site                                                   | What I saw                                                                                                                                                                                                                                                                                          | How I saw it                                       |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Wix, `wix.com/website/templates`                       | Static JPG thumbnails at 322x182 from Wix's image CDN, no browser frame; on hover "Edit" and "View"; under each card the name, "Good For:" use cases and a "Description:"; 12 per page, paginated to page 249; no device or theme toggles                                                           | WebFetch, full page                                |
| Relume, `relume.ai/components` (redirected from `.io`) | Static PNG thumbnails; per item "Copy" ("Copying..."), "Preview", "Save"/"Saved", "Watch tutorial"; badges "Interactions", "Uncommon", "Off-grid", "Bento"; no device or theme toggles; "Upgrade" for gated items                                                                                   | WebFetch, full page                                |
| Framer, `framer.com/templates/` and a detail page      | Index cards: name, creator, "Free" or a price; the page data carries a `previewUrl` for every template (120 occurrences in the raw HTML). Detail page for Cohesion: "Show Preview" opens the live site at `cohesion.framer.ai`; "Remix for Free"; no device or theme toggles                        | WebFetch (index and detail), curl for the raw HTML |
| Webflow, `webflow.com/templates`                       | Markdown fetch failed twice ("Header overflow"). Raw HTML via curl: 41 cards, each with a `preview-link` and a "Preview" label in its data, WebP thumbnails named like `Preview__5_.webp`; no video elements                                                                                        | curl only; card visuals **Unverified**             |
| Squarespace, `squarespace.com/templates` and `/browse` | Client-rendered ("Loading"); the gallery never appeared in the fetched HTML                                                                                                                                                                                                                         | Fetch failed; nothing observed                     |
| Awwwards, `awwwards.com/websites/`                     | Unframed thumbnails, name, studio with avatar, badges "DEV", "SOTD" ("Site Of The Day", 25 on the page), "HM", date, a filter bar (awards, categories, tags, technology, country, font), pagination. No `<video>` element in the server HTML, so the hover-video reputation is **Unverified** today | WebFetch and curl                                  |
| ThemeForest, `themeforest.net/category/site-templates` | Static screenshot, title, "by" author, category, price; buttons "Live Preview", "Add to cart", "Add to collection"                                                                                                                                                                                  | WebFetch                                           |

What this adds up to (business reasoning from the observations): the convention is a static thumbnail of the first viewport, unframed or lightly framed, a short factual line under it, and a "Preview" link to the real page. Nobody observed embeds live iframes in the grid, offers device or polarity toggles in the grid, or auto-rotates. The differentiators available to PinnaclePX are therefore not mechanism but honesty and context: show the brief that produced the design beside the design, label it, and use the page's own sketch frames.

## 3. Scroll-snap rows on phones versus stacked cards

- Erik Runyon's measurements (evidence, 2012 to 2013, Notre Dame sites): about 1% of visitors clicked a carousel feature on ND.edu and 84% of those clicks were on position 1; static carousels on three other sites drew 1.7 to 2.3% clicks with 48 to 62% on the first slot; the one auto-forwarding site drew 8.8% with 40% on the first slide, 18% on the second, down to 11% on the last.
- Nielsen Norman Group (practitioner opinion, 2013, reviewed August 2026): people often scroll past carousels; five or fewer frames; do not auto-forward on mobile; "dots are a particularly poor cue on mobile devices"; controls inside the carousel, large enough to click.
- Baymard (evidence from moderated testing, 2019, updated April 2025): 33% of top US and European e-commerce sites have a homepage carousel and 46% of those have usability issues; most users "won't see all the slides"; on mobile avoid autorotation, support swipe, keep text as HTML not embedded in images, load quickly.
- Smashing Magazine (practitioner opinion, Vitaly Friedman, April 2022): slide advancement follows "an exponential rate of decay"; "always indicate a slice of the upcoming slide"; "dragging alone isn't good enough"; replace dots with labels, thumbnails or numbers.
- A search snippet attributed a "64% chance that the user will swipe again" to a horizontal-list guide; the source page was not loaded, so **Unverified**.
- WAI-ARIA APG carousel pattern (evidence, W3C): container `region` or `group` with `aria-roledescription="carousel"`; each slide a `group` with `aria-roledescription="slide"` and a name such as "3 of 10"; if it rotates, a rotation control first in the tab order and rotation stops on focus and hover; the tabbed variant reuses the tabs pattern. WCAG 2.5.7 excludes user-agent scrolling from the dragging criterion (evidence, W3C Understanding 2.5.7), so a swipeable row is compliant, but keyboard users still need buttons (2.1.1) of at least 24 by 24 CSS px (2.5.8).
- The repo's own guard: the mobile e2e asserts `scrollWidth === 390`, so any row must clip inside its own `overflow-x-auto` container.

Business reasoning from the evidence: on a phone, a stacked card is seen by everyone who scrolls, while the second card in a snap row is seen by a minority who swipe and the third by fewer still. Three example cards stacked cost about three phone screens, which the page's rhythm can afford once (the FAQ and the taster already run longer). Nine cards in a row is where the decay bites, and nine stacked is too tall. So: stack at three; at nine, use tabs (one per brief, three designs stacked inside each) rather than a nine-card row. This revises the design plan's section 3.5 choice of a snap row on phones. If the owner still wants a row, the compliant shape is `snap-x snap-mandatory`, `w-[82vw]` cards so the next one peeks, previous and next buttons of 24 px or more inside the row, `aria-roledescription="carousel"`, no auto-rotation, `motion-safe` smooth scrolling, and the `scrollWidth` test unchanged.

## 4. One, three or nine, and how one honest example is not thin

- One example is thin only when it is presented as a gallery of one. Presented as a demonstration of the mechanism (brief in, design out) it is the strongest single frame the page can show, because it closes the loop the hero opens: the visitor has watched the VetPres wireframe paint itself; now they see what the studio's first layout does with that same brief.
- The three candidate treatments for one template:
  1. A single hero example: the desktop capture in the browser frame with the phone capture over its corner, the five answers beside it as `SketchChips`, the label, and the link. Good, but it stands alone.
  2. Three polarities or colours of one layout (dark, light, another brand colour). It shows the token engine, but at one template it invites "so you have one design", and a third polarity does not exist (Aurora has two).
  3. Before and after: the phone sketch at stage 5 (already server-rendered, zero bytes) labelled "What you see while you answer", beside the real render labelled "What came back" (pipeline output) or "What it looks like" (hand-set content). Identical input, visible transformation; the research (section 3, item 4) proposed exactly this and the codebase now has both halves.
- Recommendation: treatment 3 at one template, folding treatment 1 into it (the "after" is the desktop and phone pair). At three templates the same brief yields three designs, which is precisely what a real visitor receives, so the band becomes "One brief, three designs": stronger and truer than three briefs with one design each. At ten templates, three briefs with three designs each (nine, as both plans say), which is also where the three example businesses do the "who it is for" job (gap 4): a software company, a gym, a dog walker.
- What must be true for "What came back": the copy, tokens and imagery on the example must be the pipeline's own output for the VetPres brief, frozen once and committed as fixture content. If the owner prefers to hand-write the content (as Kestrel's was), the caption changes to "This is what it looks like" and the word "came back" never appears. The design plan (3.5) set this rule; this note only adds that the honest sentence is also the more persuasive one.
- Kestrel should not appear on the home page: the approved example businesses are three (PRODUCT.md line 47) and every appearance must be labelled "Example brief, not a client". Kestrel can stay on the unlinked review route.

## 5. The build pipeline for static renders

### 5.1 Capture (Playwright 1.62.1, already installed; observed typings in the pnpm store)

- `page.screenshot` and `locator.screenshot` options: `animations: 'disabled'` "stops CSS animations, CSS transitions and Web Animations"; finite animations are fast-forwarded to completion and infinite ones cancelled to their initial state; `caret` defaults to `'hide'`; `scale` is `'css'` (one pixel per CSS pixel) or `'device'` (default); `type` is `png`, `jpeg` or `webp`; `quality` for jpeg defaults to 80 and for webp 100 is lossless; `mask`, `style` (a stylesheet applied during capture), `fullPage`, `clip`, `omitBackground`.
- Recipe: a context at 1440x900 and one from `devices['iPhone 13']` (390x844), `deviceScaleFactor: 2`, `reducedMotion: 'reduce'` so Aurora's scroll-driven rules never engage, wait for `document.fonts.ready`, then `screenshot({ animations: 'disabled', scale: 'device', type: 'png' })` of the first viewport. Full-page captures are not needed for the band (section 1.2).
- Where it runs: not on Vercel. The build image is Amazon Linux 2023 and its page lists no browser (observed, Vercel docs); Playwright's own guidance is `npx playwright install --with-deps` on `ubuntu-latest` (observed, Playwright CI docs), which `ci.yml` already does for Chromium. So the render script runs by hand (`pnpm render:examples`) or as a manually triggered GitHub Actions job, and the output is committed.

### 5.2 Encode and commit

- Playwright's PNG at 2x is 1 to 2 MB per capture; do not commit it. Run `sharp` (0.35.4, installed) to WebP at quality 88 as the committed source (sharp defaults: WebP quality 80, effort 4 of 6; AVIF quality 50, effort 4 of 9, chroma 4:4:4; observed sharp docs). Expect roughly 100 to 200 KB per desktop source file (**Unverified** until the first run).
- Serve through `next/image` with a static import, so `width`, `height` and `blurDataURL` are automatic and the browser gets AVIF where it can: add `images.formats: ['image/avif', 'image/webp']` and `images.qualities: [75]` to `next.config.ts`. Set `sizes` on every capture (`(min-width: 768px) 50vw, 100vw` for the browser frame; a fixed pixel width for the phone frame), or the browser assumes `100vw` (observed Next 16 docs).
- Vercel Hobby includes 5,000 image transformations a month and returns 402 with the alt text beyond that, and is "restricted to non-commercial personal use only"; Pro is the studio's plan question, already open in the design plan (observed, Vercel docs, updated August 2026). Nine designs, two captures each, eight widths and two formats is about 300 transformations, cached after first request.

### 5.3 Freshness without flaky pixels

- Screenshots differ between Windows (the owner's machine) and Linux (CI) in font antialiasing, so a pixel diff in CI would fail on noise. Instead the render script writes a sidecar `manifest.json` with a hash of the template's source files and the fixture content per capture; a Vitest test recomputes the hash and fails when a committed capture is older than its template. That gives the plan's "CI fails on a dirty diff" guarantee without pixel comparison. A pixel comparison can run locally as a warning.

### 5.4 Live render at build time via React Server Components (the alternative)

- The home page is static; `<Aurora/>` inside it renders at build with no runtime cost beyond the bytes in section 1.3. It never goes stale and honest by construction. It requires the container-query refactor of Aurora, the `embedded` mode, a stylesheet budget review (13.4 of 14 KB used), and one font pair and image set per example brand on `/`. The RSC route is the better long-term answer for exactly one hero example; the capture route is the only answer for nine. Build the capture pipeline first because every state needs it; keep the live-render upgrade for the single example as a later, measured change.

## 6. Recommendation by state, with acceptance checks

Common to all states: full-width band between How it works and the taster (the reserved slot in `app/page.tsx`); corner ticks on the band (its rule: a stage where the product is shown); H2 in the title token; mono captions; the label "Example brief, not a client" visible at every breakpoint; the footnote "Every business here is invented. Nothing on this page is client work."; every capture lazy, with `sizes`, alt text and a factual caption ("Aurora layout, VetPres example brief, rendered 5 September 2026"); the words "live", "generated", "instantly" never appear; "AI" never appears in this band. Events (typed in `lib/analytics/events.ts`): `example_open { business, template }`, `example_tab { business }`, `example_polarity { scheme }`, and `examples` in `SECTION_IDS` for `section_view`. Nav: "Examples" joins `NAV_LINKS` when the band ships; footer group gains "Examples". Copy is driven by `READY_TEMPLATES.length`, so a template flipping to `ready: true` changes the band without a copy PR.

### 6.1 One template ready: "From five answers to a first design"

- Composition: 12-column band. Left 5/12: the phone sketch at stage 5 for VetPres (server-rendered, the closing section's component), captioned "What you see while you answer". Right 7/12: `BriefSketch` with `built` set to the desktop capture and `phoneBuilt` to the phone capture, captioned "What came back" (only if the content is frozen pipeline output; else "What it looks like"). Under both: the five answers as chips, the label, "Open this design" to `/examples/vetpres/aurora`. Below md the two frames stack: sketch, then design.
- Copy note: the band says "a first design" and "Aurora, the first of our layouts"; it does not say "three" or "ten". The rest of the page's "three designs" promise is a separate gap the plan must close before traffic (section 0, last bullet).
- Acceptance: the band renders with `READY_TEMPLATES.length >= 1`; the label is visible at 390, 768 and 1440; `img` alt present and non-empty; Lighthouse mobile on `/` stays at performance 0.95 or better, LCP unchanged (H1 or subhead), CLS 0.02 or less, image bytes under 250 KB at 390; `pnpm budget` passes with no change to the budgets; the no-script project sees the two captions and the label; the reduced-motion project reports no running `transform` animations; axe clean; the render manifest hash matches the template source; `/examples/vetpres/aurora` carries the studio's label line and a link back to `/`.

### 6.2 Three templates ready: "One brief, three designs"

- Composition: the brief once at the top of the band (sentence in quotation marks, chips, label). Three cards on the 12-column rhythm (4/12 each), "Design 01" to "Design 03" with the template name in the mono register, one desktop capture each in the browser frame with the phone capture over its corner at lg only, "Open this design" per card. Phones: cards stacked, not a snap row (section 3). Optional polarity toggle per card if the owner wants it (section 1.6): two captures per design, radio inputs and `:has()` so it works with JS off, opacity crossfade only.
- Acceptance: as 6.1 plus: three `Design 0N` headings at every breakpoint; the mobile project's `scrollWidth === 390` still holds; each card's link opens the matching example route; total image bytes at 390 under 250 KB and at 1440 under 500 KB with all three loaded; band height at 390 under about 1,300 px (three cards of roughly 420 px); if the toggle ships, it is operable by keyboard, announces state, and the reduced-motion project sees no transform animation.

### 6.3 Ten templates ready: "Three briefs, nine designs"

- Composition: tabs per brief (VetPres, Mvmnt, Go Wild Dog Walking) following the ARIA tabs pattern (arrow keys between tabs, `tabpanel` per brief); inside each panel the 6.2 layout with that brief's three designs. JS off: all three panels render stacked with their brief headings, no tab bar. Hidden panels use the `hidden` attribute so their lazy images do not load until shown (**Unverified** in every browser; verify in the mobile project by counting image requests before and after a tab change). Polarity toggle recommended. The fifth straight answer "Will it look like everyone else's?" ships only here, because only here is "ten layouts" true. The Go Wild card carries "The brief you saw fill in above" only if the hero's example brief is Go Wild; today it is VetPres, so that line moves to the VetPres tab.
- Acceptance: as 6.2 plus: tabs pass axe with `wcag22aa`; arrow keys move between tabs and Tab enters the panel; the no-script project sees nine designs and three labels; image requests on first load at 390 are the active tab's only; the manifest covers all nine renders; `example_tab` fires once per change.

## 7. Owner decisions this note needs, with defaults

1. Pipeline output or hand-set content for the example designs. Default: run the pipeline once on the VetPres brief, freeze the output as fixture content, say "What came back".
2. Kestrel on the home page. Default: no; the three approved businesses only; Kestrel stays on the unlinked review route.
3. Phone layout at three: stacked or a snap row. Default: stacked (section 3 evidence); tabs at nine.
4. Polarity toggle. Default: not at one, optional at three, yes at ten.
5. Container queries for t02 to t10 and an Aurora refactor. Default: the rule and the CI grep now for new templates; refactor Aurora only when a live embed is actually wanted.
6. `/examples/*` routes public but `noindex`. Default: yes (SEO is out of scope by the owner's exclusion), linked only from the band.
7. Vercel Pro before the page takes traffic (image transformations, commercial use). Default: yes, already on the plan's list.
8. Same tab or new tab for "Open this design". Default: same tab.

## 8. Sources loaded today

- https://www.wix.com/website/templates (observed)
- https://www.relume.ai/components (observed; redirected from relume.io)
- https://www.framer.com/templates/ and https://www.framer.com/marketplace/templates/cohesion/ (observed; raw HTML via curl for `previewUrl` count)
- https://webflow.com/templates (curl only; WebFetch failed twice with "Header overflow")
- https://www.squarespace.com/templates and /templates/browse (fetch failed: client-rendered)
- https://www.awwwards.com/websites/ (observed; no video element in server HTML)
- https://themeforest.net/category/site-templates (observed)
- https://www.w3.org/WAI/ARIA/apg/patterns/carousel/ (evidence)
- https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html (evidence)
- https://www.w3.org/WAI/WCAG22/Understanding/images-of-text.html (evidence)
- https://www.nngroup.com/articles/designing-effective-carousels/ (practitioner opinion, 2013, reviewed 2026)
- https://baymard.com/blog/homepage-carousel (evidence, 2019, updated 2025)
- https://erikrunyon.com/2013/01/carousel-stats/ (evidence, 2013)
- https://www.smashingmagazine.com/2022/04/designing-better-carousel-ux/ (practitioner opinion)
- https://web.dev/articles/iframe-lazy-loading and https://web.dev/articles/embed-best-practices (evidence)
- https://developer.mozilla.org/en-US/docs/Web/CSS/zoom, .../Global_attributes/inert, .../CSS/@container (evidence, Baseline statements)
- https://tailwindcss.com/docs/responsive-design (observed, container query variants)
- https://chromium.googlesource.com/chromium/src/+/refs/heads/main/docs/speed/metrics_changelog/2023_04_lcp.md (evidence)
- https://sharp.pixelplumbing.com/api-output/ (observed)
- https://playwright.dev/docs/ci (observed); screenshot options from `node_modules/.pnpm/playwright-core@1.62.1/.../types.d.ts` (observed)
- https://vercel.com/docs/image-optimization/limits-and-pricing and https://vercel.com/docs/builds/build-image (observed, updated August 2026)
- https://www.navattic.com/report/state-of-the-interactive-product-demo-2026 (evidence for SaaS demos: 86% of captures are HTML, ungated +6% engagement and +7% completion, interactive demos 12% higher conversion than video; an analogy for this page, not a measurement of design galleries)
- Local: `node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md`; `templates/t01-aurora/*`; `app/examples/aurora/page.tsx`; `templates/render.tsx`; `next.config.ts`; `lighthouserc.json`; `scripts/bundle-budget.mjs`; `.github/workflows/ci.yml`; `e2e/*.spec.ts`; `components/sketch/*`; `app/_components/built-page.tsx`, `hero-stage.tsx`; `lib/brief/example-brief.ts`; measurements from `http://localhost:3000` (dev) and `.next/server/app/index.html` (production build of 5 September 2026).
