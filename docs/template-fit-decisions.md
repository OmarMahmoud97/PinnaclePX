# Template fit: senior review and decisions

Written 2 October 2026 on branch docs/template-fit-decisions, cut from origin/main at 11940ad (Phase 1 merged as PR #55). It follows [template-fit-plan.md](template-fit-plan.md) and [template-fit-brief.md](template-fit-brief.md), and ADR 0048 records it.

On 2 October 2026 the owner asked for the plan to be reviewed from a senior's point of view before any decision was made: find its shortcomings against the goal, which is to give every visitor the best possible website, adjust the plan to fix them, then make the decisions. "Do not guess, assume or hallucinate."

How to read it:

- **Part 1** is a one-page summary.
- **Part 2** is the review: each shortcoming, its evidence and what it costs a visitor.
- **Part 3** is the adjusted plan: what ships, in what order, and what waits.
- **Part 4** has the decisions: the plan's 17, plus six the review added.
- **Part 5** lists what only the owner can do.
- **Part 6** corrects statements in the Phase 1 plan and in earlier records.

**How the review was done.** It ran in five rounds, and no round made a paid call or a Pexels API call; pictures were read only from the Pexels CDN.

1. **Six reviewers.** Each read the plan, the brief, the fit records, the code and the stored eval runs from one side: the visitor's outcome, the choice of templates, photographs, the templates themselves, risk and money, and the plan's own numbers.
2. **A checker for each finding.** Every finding went to an independent checker, who re-ran or rewrote each count. None of the 49 findings was refuted. 25 held as written, 18 of them with a smaller correction. 24 held in direction, with a number, citation or scope corrected. Seven proposed adjustments were judged unsound and are not used. This document uses the corrected versions.
3. **Two critics.** They looked for what all six had missed: journey states nobody measured, and the plan's coherence. Their 25 findings were checked the same way. 13 held as written, 5 of them with a smaller correction (CRS-1, CRS-2, CRS-3, CRS-5 and CRS-7), and 12 held in direction with corrections. None was refuted. Two proposed adjustments, CRS-1's sticky studio bar and CRC-3's "proposed" categories file, were judged unsound and are not used (section 2.9).
4. **A red team on the first draft.** Five reviewers tried to break the decisions. They raised 131 issues (45 major, 86 minor, no blocker), and the draft was rewritten from them.
5. **Two checkers on the rewrite.** One traced the 25 critic findings and the 45 red-team majors into it: all 70 were applied, 22 of them only in part. The other checked its numbers, citations and contradictions. Together they listed 62 issues (16 major), and this version corrects them.

**Where the evidence is.** Paths starting `review/` and `review2/` are in the git-ignored folders test-results/template-fit/review/ and test-results/template-fit/review2/ of the ../PinnaclePX-fit worktree, beside Phase 1's evidence.

- `review/<side>/` holds each reviewer's scripts and outputs, and `review/verify-<side>/` each checker's.
- `review/<side>.md` holds both write-ups.
- `review2/` holds the critics, their checkers and the red team in the same layout.

Code paths are at origin/main 11940ad.

**Short paths and ids.**

- "t05 nav.tsx" is templates/t05-ember/sections/nav.tsx. Every short path of that kind names a file in that template's folder or its sections/ folder.
- "records.md" is docs/template-fit/records.md, "plan:" is docs/template-fit-plan.md and "brief:" is docs/template-fit-brief.md.
- Finding ids:
  - OUT, SEL, PHO, TPL, RSK and EVI are in review/outcome.md, selection.md, photos.md, templates.md, risk.md and evidence.md.
  - CRS and CRC are in review2/critic-states.md and critic-coherence.md.
  - RS, RTP, RT-MW, RO and rt-templates are in review2/rt-selection.md, rt-photos.md, rt-money-wording.md, rt-owner.md and rt-templates.md.

**Words used here.**

- **Copy-free:** a change to nothing the AI writing step reads, so it needs no paid run.
- **Seeded shuffle:** today's template choice, random but the same for the same answers (lib/select/select.ts).
- **Tiers:** the order a kind of business's templates are offered in, once labels exist.
- **Floor:** the lowest judge score, out of 10, a stock picture may have and still be shown.
- **Never unjudged:** no stock picture is shown unless the judge has scored it.
- **Slot class:** a kind of picture space, such as a full-screen hero, a picture beside text, or a small square per item.
- **Seam:** a breakpoint where the layout changes.
- **Eval:** the paid test harness (pnpm eval), with its stored runs baseline, l0-skeleton, l6 and l7 in test-results/eval.
- **On-scrim:** the light text colour made for the dark scrim.
- **A checked colour:** a text colour the colour engine brings to WCAG AA for the brand.
- **Layout shift:** how far the page jumps while it loads.

**Who decided.** The owner delegated every decision on 2 October 2026.

- **Evidence first.** Each decision below rests on evidence. Where evidence is missing, the decision is the option that stays safe whichever way the unknown turns out, and says so.
- **Rules instead of taste where possible.** Where a measurable rule can replace a matter of taste, the rule is used: for example, words over a photograph must pass a contrast check over any picture, instead of a veil strength being picked by eye.
- **Thresholds are proposals.** Every number set here without a source is marked "(a proposal)".
- **What stays with the owner.** The owner keeps the things no one else can do: reading production's account settings, merging, and the labels of taste on rendered pages ("suits"). The brief keeps those labels from any model, this one included.
- **What waits on labels.** No fix of a visible defect waits for labels. Three things do: best-fitting designs first, any clash, and the picture floor. Without labels the template choice stays today's seeded shuffle and no floor ships.

## Part 1. Summary for the owner

**What the review found**

1. **The worst things a visitor sees were missed, or scheduled last.**
   - **Words over photographs.** On every stored Ember and Summit hero picture, some of the words over the photograph fail WCAG contrast: every text item passes on 0 of 10 Ember pictures and 0 of 15 Summit pictures. Ember or Summit is in about three of every four first visits, and the plan left the fix to Phase 4. Harbor's hero fails too, even with no picture.
   - **The studio bar.** On the visitor's real page, the fixed headers of Ember, Harbor, Summit and Vector cover the studio's own bar. "Back to your designs" and "Book a 20-minute call" cannot be tapped on any stored page of those four templates. About half of all designs shown are one of them.
   - **Text that breaks.** Harbor's text breaks on phones: the headline is clipped in 4 of 7 stored answers at 390 px, and longer trade words such as PHYSIOTHERAPY clip even under the layout first proposed. Aurora's menu button is pushed off a 390 px screen for business names of about 16 characters or more. Headers wrap and collide at tablet widths in seven templates (all but Vector).
   - **Menus.** Atlas's header menu cannot be used: its list vanishes before a click or a Tab can land. Summit's phone menu opens over the hero photograph behind a veil too thin to read.
   - **Faint text.** Text falls below WCAG AA on light palettes: Harbor's form labels and small print reach 2.5:1, and Monolith's headline sets its key words, often the trade, at about 1.5 to 2.5:1.
   - **The visitor's logo.** It vanishes when the visitor chooses the dark look and uploads a dark logo, in every header and footer of all eight templates. /start promises a background that suits it.
2. **The plan judged pages at desktop width**, though PRODUCT.md says visitors arrive "mostly on a phone". Its renders were at 1440 px, and its labelling sheet named no width. Even a four-width check misses breaks measured at 320 to 360 px and at the 1280 px seam.
3. **Much of the planned build could never change a visitor's page.**
   - With eight ready templates and the plan's minimum of six per row, a visit cannot fall short. The "fewer designs" path, its new status, its migration and its new public words would guard a state no visitor can reach.
   - The category step, the tiers and the fit data change nothing until the owner gives a label. Until then the selector returns today's choice exactly.
4. **The photograph rules would have emptied pages.**
   - Every rule that removes a picture fell back to empty states nobody designed.
   - The floor of 7 was never checked against a person's judgement, and the planned labels could not check it.
   - The legibility rule, as written, would have emptied every Ember and Summit hero.
5. **The page a visitor gets when the model is refused was never described, and it is the worst page there is.**
   - The headline is the first sentence cut mid-phrase (16 of 20 fixtures on six templates), followed by generic steps.
   - The first picture is an unjudged result of a search for the company name, and the others are unjudged results of a search for the first sentence; nobody has tested what those searches return. Even the model's own searches, taken in Pexels' order without judging, would have had about one picture in three rejected.
   - The page then says this was done "to finish on time".
   - Meanwhile the plan treated the last $2 of the month's limit as an eval budget, without knowing whether production shares that limit.
6. **Everything waited on hours of the owner's labelling**, with no stopping point and no free measure of progress.
7. **Smaller problems.**
   - Harbor's high cost comes mostly from answers the code could not read, not from its cap.
   - The eval counted those unreadable answers as fits.
   - Nothing reads the template descriptions.
   - 17 of the 59 pages planned for labelling lack their first-screen picture.
   - The "every design" lines are false, and one is on a public page today.

**What changes**

- **Visible defects first, measured by code.** They ship in Phase 2 as free, copy-free pull requests, with checks that code runs: no clipped or split words, header controls that fit, contrast that passes, menus that work, a studio bar that can be reached, and no leftover on the page.
- **One standard for every check.** It starts at 390 px, then covers 320, 360, 768, 1024, 1280, 1440 and 1920, each breakpoint a change touches (±1 px) and a phone held sideways, in all four looks' fonts. Text fit, header fit and words over pictures use every width; contrast and the studio bar are checked at 390 and 1440.
- **Words over a photograph must pass over any picture,** not just the stored ones.
- **Machinery that cannot change a page waits until it can.** The category step and the tiers are built when the owner's first label could change a pick. No shortfall path and no category column are built: the category is worked out, never stored (decision 3), and the shortfall question returns with the visit-cap work (decision 4).
- **Photograph rules ship in a set order.** Designed empty states come first, then "never unjudged" one slot class at a time, then a floor only once it is calibrated.
- **Paid passes 1 to 4 run now, on the owner's go-ahead of 2 October 2026.** $11.44 is available on the console. They go one change at a time, each capped ($4.81 for all four), which leaves at least $6.63, about 49 submissions, for production. Passes 5 and 6 wait for November and their own go-ahead.
- **Labelling becomes optional and capped.** A core round of about 70 minutes (an estimate) plus optional picture samples. Every visible fix ships without it.

**What happens next.** Phase 2 starts now from origin/main as pull requests:

- the eval and review tooling first, carrying the checks;
- one pull request per template;
- the Ember and Summit hero treatment on its own, so a taste dispute holds up nothing else;
- the preview chrome, meaning the studio bar and the visitor's logo;
- the site wording;
- the picture rules.

Each has before-and-after renders, and its tests stay green.

**What only the owner can do** (Part 5):

- read production's Anthropic and Pexels key settings, and the month's spend before each paid pass;
- merge the pull requests, dropping either of the two commits flagged for it if wanted (decision 15's mail-to-self ask and decision 7a's stock fill);
- optionally, label: a core round of about 70 minutes, and picture samples of about 70 minutes more (estimates);
- once the category step comes, write about 36 one-liners.

## Part 2. The senior review

Each shortcoming gives what was wrong, the evidence and what it costs a visitor. The change it led to is in Parts 3 and 4.

### 2.1 The worst visible defects were missed or scheduled last

**Hero words unreadable on Ember and Summit (review findings PHO-1, OUT-1).**

- **The plan's evidence.** It knew from a prototype that most stored heroes failed (plan:1288-1300). It still routed the scrims to decision 7, which blocks Phase 4 (plan:159, :290).
- **The re-measurement.** It used the real text boxes from rendered pages, each fixture's own derived colours and font pair, and the WCAG level for each text item, at 1440x900 and 390x844 (review/photos/measure-hero.cjs, legibility-real.cjs).
  - Every hero text item meets its level on 95% of its box at both widths for 0 of 10 Ember pictures and 0 of 15 Summit pictures. The headline alone passes for 3 of 10 and 0 of 15.
  - Across every unrejected candidate in the stored hero pools, 2 of 219 pass at all. At a floor of 7, no Ember pool (0 of 11) and no Summit pool (0 of 17) holds a passing picture (review/verify-photos/leg-pool.cjs).
  - So the plan's legibility rule would have emptied every Ember and Summit hero, and its second hero search could not have helped.
- **Why the words fail.** Both heroes are bare CSS backgrounds (t05 hero.tsx:14-19; t07 hero.tsx:16-23). Their words use surface colours with no scrim (t05 hero.tsx:22, :30; t07 hero.tsx:29-46). Both headers are transparent at the top (t05 nav.tsx:51; t07 nav.tsx:69), so the wordmark and links sit on the photograph too.
- **Reach.** Ember or Summit appears in 74.7% of first visits under today's selector (review/outcome/exposure.mjs; review/verify-outcome/expo.cjs, 100,000 seeds).
- **What passes, and over which pictures.** On the stored pictures, the existing scrim token as a veil passes 10 of 10 Ember and 15 of 15 Summit pictures from 0.65 (14 of 15 at 0.6). A surface veil at 0.8 passes 10 of 10 and 10 of 15. Harbor's own treatment passes 7 of 10 and 5 of 15 (review/photos/scrim-dark.cjs, scrim-sweep.cjs; review2/critic-coherence/scrim-dark-ext.cjs).
- **A rule that holds over any picture** needs the scrim veil at 0.55 or more with full-strength on-scrim words, 0.65 if an item keeps a 75% alpha. A surface veil needs 0.51 to 0.60 under on-surface words and 0.81 to 0.82 under on-surface-muted. This was checked against pure white and pure black under every fixture's tokens in both schemes (review2/rt-photos/worst-case-veil.cjs).

**Harbor's hero fails too, with or without a picture (PHO-1, CRC-1).**

- **With no picture.** Its faded labels (text-on-surface/50 at t06 hero.tsx:110; /40 at :123-124) reach 3.40:1 and 2.54:1 on light surfaces.
- **Fixing the faded text alone is not enough.** Over its 9 stored pictures, only 2 then pass.
- **What passes.** Moving every faded hero item, the /60 subhead included, to on-surface-muted and showing the picture at 20% instead of 40% passes 9 of 9, header included (review2/critic-coherence/harbor-after-fix.cjs, harbor-opacity-header.cjs).
- **Other words over pictures.** Summit's photo-cell captions sit on a 30% scrim, and Vector's open project view on a 40% scrim. Over a bright area, on-scrim words there can fall to about 2.1:1 and 2.8:1 (review2/rt-photos/misc-checks.cjs, a worst-case bound).

**The studio bar is covered on half the designs a visitor opens (CRS-1).**

- **How the page is built.** On /preview a 56 px studio bar sits in the page's flow above the design (app/preview/[slug]/[templateId]/page.tsx:56-57; studio-bar.tsx:22-24). Ember, Harbor, Summit and Vector fix their headers at the top of the screen (t05 nav.tsx:50-51; t06 nav.tsx:75-77; t07 nav.tsx:68-69; t08 header.tsx:86-88), so their headers cover the bar.
- **The measurement.** A replica of the bar was set over all 30 stored pages of the four templates, at 390 and 1440, at scroll 0, 20 and 40. In 0 of 540 tests (three studio links, the home link included, on 30 pages at two widths and three scroll positions) could a pointer reach a studio link, so neither "Back to your designs" nor "Book a 20-minute call" can be tapped (review2/verify-critic-states/sb-check.mjs).
- **The visitor's own name.** It sits over the bar's ink at about 1.10:1.
- **Reach.** 94.8% of first visits include at least one of these templates (review2/verify-critic-states/expo.out.txt:2).
- **Already known.** docs/template-analysis.md:493 recorded this as high, but the plan never carried it.

**Text and controls that do not fit (TPL-1, TPL-3, CRS-3, CRS-4, rt-templates-01).**

- **Harbor.**
  - The headline is text-7xl at every width, in overflow-hidden rows (t06 hero.tsx:8, :46-72), and the phrases sit in a row that cannot wrap (:103).
  - At 390 px the headline is clipped in 4 of 7 stored answers, the phrase row runs off the screen in 5 of 7, and the tiles chop words in 7 of 7 (review/verify-templates/harbor-measure.cjs).
  - The layout first measured to fix it still clips longer trade words. PHYSIOTHERAPY, CONSTRUCTION and CONVEYANCING clip at 390 in every look, and at 640 when the 72 px size returns. 29 of 128 stored model headlines across all templates contain a word of 11 or more letters (review2/rt-templates/harbor-head-render.cjs, long-words.cjs).
  - Its header wraps at 768 on 5 of 5 pages.
- **Aurora.**
  - The header ask is meant to hide below md, but the button style's `inline-flex` wins over `hidden` (t01 nav.tsx:43; styles.ts:13-14).
  - At 390 px the menu button is pushed partly or wholly off the screen on 5 of 9 stored pages, and the page slides sideways (review2/verify-critic-states/hdr390.mjs).
  - This is the cause of t01-D2's 435 px phone shots, a template defect rather than an eval one.
- **Vector.** The menu pill covers the visitor's name on 4 of 8 pages at 390.
- **Headers at tablet widths** (review2/verify-critic-states/hdr-wrap.mjs, mono-cards.mjs):
  - Aurora's nav wraps at 768 on 4 of 9 pages.
  - Monolith's wordmark wraps at 768 on 7 of 8.
  - Atlas's nav wraps at 1024 on 5 of 5.
  - Meridian's "Why us" overlaps "Services" at 1024 on 5 of 8.
  - Ember's nav wraps at 768 on 2 of 7 pages, and Summit's on 1 of 10.
  - Monolith's hero cards sit in a fixed 700 px box that runs past the screen from 1024 to about 1419 px, cutting the business's name mid-word.
- **Vector held sideways.** On a phone held sideways (844x390), Vector's headline runs under its own pills on 8 of 8 pages.
- **Monolith's About phrases** collide at tablet widths (review/verify-templates/monolith-measure.cjs). The layout first proposed for them still breaks "Independent" mid-word.
- **No text-fit check exists** in the plan, the records or the eval.

**Atlas's header menu cannot be used (TPL-2).** The list closes on the button's blur and unmounts before a click or a Tab lands (t04 nav.tsx:55-61, :66). Its links drop from 4 to 0 on mousedown (review/verify-templates/atlas-menu.cjs). Every Atlas page has this menu.

**Summit's phone menu cannot be read over the hero (CRS-7).** Below md, the open menu is the surface colour at 25% over the hero photograph, with 14 px links at 75% (t07 nav.tsx:79, :86). Every link passes on only 4 to 5 of the 15 stored pictures in the light scheme and 1 in the dark. At 70%, like Ember's sheet, all 15 pass in both schemes (review2/verify-critic-states/menu-leg.cjs, menu-leg-sv.cjs).

**Faint text (TPL-5, CRC-5, CRS-2, rt-templates-04, RS-03).**

- **Why the colour engine misses it.** Text set as on-surface at an alpha is invisible to the colour engine, which brings only declared pairs to AA (lib/tokens/derive.ts:77; a pair carries no alpha, lib/tokens/types.ts:38).
- **Harbor.** On its derived light palette, 88 of 261 text elements are below AA, including form labels, tile descriptions, the small print and the photo credit, at 2.48 to 2.55:1.
- **Summit.** Its form's select text sits at /37 (2.34:1).
- **Monolith.**
  - Its headline's two key phrases are gradients built from the glow tokens and fixed white (monolith.css:87-102). Their lowest stop is under 3:1 on 8 of 8 light pages, so a word like "Accountancy" reads at about 1.6:1 at 390.
  - Meridian's headline phrase starts at about 1.7:1 on 9 of 9 light pages.
  - The glow tokens are decoration: lib/config.ts:95-96 says "Glows are never behind text".
  - Monolith's area labels reach 2.79:1.
- **Atlas.** Its table headings reach 4.34:1 against 4.5:1.

Sources: review/verify-templates/contrast.cjs; review2/verify-critic-states/grad-stops.mjs, grad-paint.mjs, sponsor-ratio.mjs; review2/critic-coherence/faded-ratios.cjs; review2/rt-selection/contrast-others.out.txt.

**The visitor's logo vanishes on the dark look (CRS-5, CRS-6).**

- **Why.** The dark look wins over the logo's own artwork (lib/tokens/scheme.ts:8-11; ADR 0010). No template puts a plate behind an image logo.
- **The measurement.** A dark logo on the dark look sits at 1.03 to 1.31:1 in every header and footer of all eight templates (review2/verify-critic-states/dark-logo.mjs).
- **The broken promise.** /start promises "a background that suits it" (app/start/_components/start-copy.ts:282).
- **The hero veil makes it worse.** On Ember and Summit, a dark scrim veil over the hero would bury a dark logo on the light scheme: it would be visible on only 0 to 2 of the stored pictures. A surface-coloured veil in the header zone keeps every polarity-matched logo visible (review2/verify-critic-states/logo-hero.cjs).

**Same defects in other templates, and asks with nowhere to go (TPL-6, TPL-7, CRS-9).**

- **Asks with nowhere to go.**
  - Aurora's and Monolith's closing buttons point at their own band, and Atlas's pitch button at itself (t01 contract.ts:147, :152, :164; t02 contract.ts:237-295; records.md:685-687).
  - Ember's asks lead to steps with no form.
- **Focus, headings and autofill.**
  - Ember and Harbor never return focus to the menu button.
  - Monolith and Harbor have wrong heading levels.
  - No template form sets autocomplete.
- **Vector's cursor disc.** With reduced motion on, every Vector page shows its "Open" cursor disc in the top-left corner (vector.css:260, :409-422; review2/verify-critic-states/vector-cursor.mjs).

### 2.2 The plan judged at desktop width (OUT-3, PHO-6, CRC-2)

- **The audience.** PRODUCT.md:11 says visitors arrive "mostly on a phone". That is the product's own statement; no analytics count was available. The plan cited the line only for who arrives.
- **Renders and the sheet.** 7 of the plan's 9 renders are at 1440, the two at 390 show only contact forms, and the labelling sheet names no width.
- **First pictures on phones.** In 62.7% of first visits, Design one is a template that shows 30% or less of its first picture at 390 (review/outcome/exposure.mjs). Aurora's window shows a 320x71 strip of it (records.md:1835).
- **Four widths are not enough.** Harbor's measured layout breaks a word at 320, 360 and 1280. The Monolith layout as first worded breaks words in 9 of 12 answers at 320 (review2/critic-coherence/harbor-fixsim-seams.cjs, mv3.cjs). The site's own end-to-end tests render phones at 320 and 360 px in at least 16 places. The brief already asked for 1920 and every breakpoint at ±1 px (brief:226, :272).
- **The crop limit cannot simply move to 390.** No one picture shape loses less than 35% at both 390x844 and 1440x900 (review/verify-outcome/crop-both.cjs). Each crop can be judged on its own, though.

### 2.3 Work that cannot change a visitor's page sat on the critical path

**The shortfall path is unreachable (OUT-4, SEL-2, RSK-2).**

- **Why.** After visit 1 an address has seen three designs. One INSERT records each choice (lib/db/exclusivity.ts:45-49). So a row with six eligible templates always holds three unseen for visit 2, whichever kind of business each visit is read as. A third visit is exhausted before fit applies (lib/select/select.ts:41).
- **The count.** Every pool of six to eight and every seen set with a visit left (2,109 pairs) gives 0 shortfalls (review/verify-selection/shortfall-combi.cjs).
- **When this holds.** While every row keeps six eligible templates, every earlier submission built three designs, and every template accepts either logo polarity.
- **When shortfalls appear.** Only once a ninth template is ready (ADR 0038:22), or a row falls below six.

**The category step and the tiers change nothing before a label exists.**

- **The check.** With no clash and no "suits" label, the proposed rule returns today's ids: 0 differences over 20,000 seeds (test-results/template-fit/select-sim.mjs --check, re-run three times).
- **The migration is not needed.** The plan proposed migration 0011 to store the category (plan:929-936), but under fixed rules the category can be worked out from the company and the sentence, which /admin already holds (db/0008_brief_overview.sql:1).
- **Migrations carry their own risk.** A missing migration made a real send fail against the dev database (docs/pipeline-quality-plan.md:103), and ADR 0037:651-654 records that every send fails until a migration is applied. A production outage is not verified.

**The descriptions have no reader (SEL-7).** Nothing in app, lib or templates reads TemplateMeta.description. /admin shows only the name (app/admin/_components/brief-view.ts:57), and the copy model gets only the name (lib/ai/copy.ts:41).

**Owner hours with no stopping point (OUT-5, CRC-12).**

- **The hours.** The free round is about 205 minutes at the mid estimate (plan:1554), with no named core round and no free measure of progress.
- **Labelling at two widths costs more.** Labelling the core pages at 390 and 1440 lifts the core round from about 45 to about 70 minutes (an estimate).

### 2.4 The photograph rules would have emptied pages

**Every rule that removes a picture falls back to undesigned empty states (PHO-2).**

- **Today's empty states.** These are leftovers from the ports:
  - Summit: a blank 448 px half-card (t07 services.tsx:58).
  - Ember: a muted disc (t05 dishes.tsx:29-30). Its About block collapses to 0 px from 768, and its feature block at every width (records.md:894-895).
  - Atlas: half a section left blank (records.md:654-659).
- **No ship order.** The plan gave no order for shipping its rules. A 35% crop limit at 1440 on today's landscape pools would empty 21 of 29 filled tall slots in baseline (review/verify-photos/c6-crop.cjs).

**The floor of 7 is uncalibrated, and the planned labels cannot calibrate it (PHO-3, RTP-3, RTP-4).**

- **Too few low scores.** Of the 42 l6 first pictures on the sheet, only 2 score below 7 (review/photos/slot0-scores.cjs).
- **What a floor of 7 costs.** Pictures shared between a visitor's three designs rise from 26 to 43 in l6.
- **Too few labels.** A floor per score band needs about 35 labels per band to show 90% acceptance with confidence: even 22 of 22 accepted bounds acceptance only above 85% (review2/rt-photos/wilson.cjs).
- **Only first pictures.** The planned labels cover first pictures only, so they cannot set a floor for the other slots.

**"Never unjudged" and the fallback (PHO-4, RTP-5, RTP-6, RTP-22, CRC-15).**

- **On ordinary days.** In the stored runs no ranking failed. A first picture was lost after Pexels errors (15 designs), and once on a day with no outage: electrician's second search was entirely rejected, and production would not retry it.
- **On a refusal day**, every design's first picture would fall back.
- **Shared candidates.** Row A's businesses share no candidate in their pools. Rows B, C and D do: in l6, 5 pictures scored 7 or more for two businesses of the same row (review2/rt-photos/shared-candidates.cjs). So a row-level picture might suit more than one business; no owner label confirms it.
- **No reliable count.** Nothing logs a first slot left empty by a rejected or empty pool (lib/images/stage.ts:141-146, :164).

**Free rules with measured gains were held back to Phase 4 (PHO-5, CRS-8).**

- **Pick extra item pictures last.** Choosing the item pictures past each contract minimum last cuts empty and shared shown slots from 50 and 55 to 43 and 49 in l6, with no wait (review/photos/priority-order.cjs).
- **Monolith's circles.** These quote and profile circles drew 13 stock pictures in l6, yet the template draws initials when the slot is empty (t02 avatar.tsx:20-31).
- **Alt text.** Pexels' alt goes onto the page unchanged (lib/images/stage.ts:200).
- **Own photographs.** When a visitor adds their own photographs, every slot after them is left empty (lib/images/plan.ts:26-30). With one photograph and the stored copy, that is 7 of Ember's 8 drawn slots and 8 of Summit's.

**17 of the 59 pages planned for labelling lack their first picture (EVI-1).** In l6, five hero pools ended empty after two Pexels 500s each, and electrician's 12 kitchen pictures were all rejected (review/verify-evidence/v1-hero.cjs, v1-pages.cjs).

**The spec is underpriced (PHO-7, EVI-3, CRC-6, RT-MW-01).**

- **Per submission.** With every item the spec adds (per class and section, second crops, the people field and judge-written alt), class-aware judging costs a median of about +$0.06 and at most about +$0.09 a submission. That is on PHO-7's checked model; crop image tokens are not measured (review2/verify-critic-coherence/spec-cost.cjs).
- **The pass that measures it** costs about $3.90, not $2.71: the decided spec, priced on the model of review2/verify-critic-coherence/spec-cost.cjs over the 20 l6 sets. An earlier $3.61 (review2/rt-money-wording/photo-pass.cjs) left out class 4's crop, Rule P and alt.

**Pexels' limits (PHO-8, RSK-5, RT-MW-05).**

- **What a 429 does.** It settles every stock slot of that submission at once (lib/images/pexels.ts:33-37; build-concepts.ts:126-129).
- **Partial outages.** A pool whose searches all fail makes the whole imagery step retry, repeating every search and paid ranking. This happened in 6 of 20 l6 fixtures.
- **The quota count.** By Pexels' documentation, the remaining count logged on each search (pexels.ts:29-32) is the monthly allowance, not the hourly one. That is not verified here, because the saved copy of the page is a challenge page, so it is checked against a logged response before decision 7's alert is built.

### 2.5 The refused-model page and the money

**The worst page was never described (RSK-1).**

- **When it happens.** When the Anthropic API refuses a call (for example a credit refusal, stored as a 400 in 18 template answers of l0-skeleton), the brief falls back at once and so does each design's copy (lib/ai/errors.ts:13-21; lib/inngest/stages.ts:56-70; build-concepts.ts:184-187).
- **A spent monthly limit.** Whether it is refused like the credit balance is not verified. It may return a 429, which lib/ai/errors.ts treats as passing: the copy then retries until the sweeper settles it about 255 s in, so the visitor waits about four minutes (review/risk.md:28).
- **The headline.** On six templates it is then the first sentence cut mid-phrase in 16 of 20 fixtures. In 9 of 20 it ends on a joining word, for example "Rated 4.9 on Google by over 300 patients, we have been the" (review/verify-risk/fbh.cjs).
- **The pictures.** The first slot's searches are for the company name and the rest for the first sentence, unjudged and in Pexels' order (lib/copy-slots/brief.ts:67; lib/images/stage.ts:147-156). What those searches return is not tested. Replayed on the model's own searches, the judge would have rejected 122 of 381 such picks in baseline and 116 of 343 in l6 (review/verify-risk/nj.cjs).
- **The note.** It says parts were set simply "to finish on time" (app/start/_components/done-copy.ts:116, :138, :168-169; lib/site.ts:33). That is false for a refusal, a third failed attempt or a Pexels 429 (RSK-4).
- **The fixed fallback.** Harbor's and Vector's fallback headline is a fixed line, "What we do, and who it is for".

**Money.**

- **What is left.** About $2 of the $30 monthly organisation limit is left until 1 November (docs/pipeline-quality-plan.md:77). That buys 14 submissions at the $0.135 mean and 8 at the $0.235 maximum.
- **Who else draws on it.** Another project in the organisation draws on the same limit (ADR 0044:28). Whether production's key does too is not known.
- **The cap a whole month gives.** At most 222 submissions at today's cost, and about 153 once class-aware judging adds its median of about +$0.06 (about 133 at its most, +$0.09).
- **What the eval can see.** The eval has no spend stop and cannot see the organisation's spend (tests/eval/pipeline.eval.ts:7-14; summary.ts:8-15).

**Is production live?**

- **The deployment.** The Vercel deployment answered /start with 200, and main deploys to Production on merge: GitHub lists 47 Production deployments, 31 of them successful (review/risk.md:32; review/verify-risk/prod-deploys.txt).
- **The public domain.** pinnaclepx.com serves a Webflow site whose /start is a 404 (review/risk.md:32), and the claims register marks the designs "live, gated on traffic" (docs/claims-register.md:11).
- **Unknown.** Whether real briefs exist is not known: nobody has read /admin. Whether production's key is set up correctly is not verified either; PRODUCT.md:33 still lists ANTHROPIC_WORKSPACE_ID under "Before traffic".

### 2.6 The category step had no rules and no safe test (SEL-1, SEL-4, SEL-5, EVI-5, RS-01, RS-06)

- **No rules exist yet.** The plan recommends fixed word rules, but Phase 1 wrote none: test-results/template-fit/cat/presume.cjs is a hand reading keyed by fixture id.
- **The plan's own trade words, untuned:**
  - They agree with the plan's rows on 9 of 20 fixtures.
  - They put two fixtures in a wrong row through words that name a partner, not the business ("until the builder leaves", "GPs and consultants").
  - They find no row in VetPres's own sentence (review/verify-selection/rules-recheck.cjs).
- **When a wrong row hurts.** It changes nothing under two tiers while no clash is approved. Under suits first it fills all three places with that row's "suits" designs (review/verify-selection/tiers-recheck.mjs).
- **A second way suits first hurts.** A "suits" label taken on one page of one kind of business, inside a wide row, would fill visit 1 for every kind in that row.
- **The held-out check is too weak.** The planned check is one fixture per row, written by the rule author. Seven right out of seven bounds accuracy only above 59% (two-sided 95%). Showing a wrong-row rate below 10% needs at least 36 sentences, all right (review2/rt-selection/wrong-row-bound.cjs).
- **Suits first beats suits lead on counts.** Suits first shows the most judged-right designs any rule can show, on visit 1 and over two visits (row B: 3.00 against 1.39 on visit 1). Suits lead is more robust to a wrong row and to a label resting on one page.
- **The evidence for row F is thinner than "five of six clients".** Four of those five are brands of one group, the 10XU group (app/_components/work-items.ts:26; docs/home-page-content-plan.md:335). That makes three client relationships, two of them software. PRODUCT.md:11 also names "early-stage founders".

### 2.7 Harbor's cost was misattributed, and the eval counted unreadable answers as fits (TPL-4, EVI-2, RT-MW-09)

**What Harbor's cost is made of.** The plan said Harbor's values miss the 12-character cap "on every attempt", and that this is why its answers cost $0.086 (plan:648). In l6:

- the cap was missed in 4 of Harbor's 17 calls, costing $0.100;
- answers the code could not read cost $0.157 (review/verify-evidence/v2-copy.cjs);
- in l7, Harbor was the cheapest template.

**Unreadable answers across all templates.** These occurred in 16 of 107 l6 copy calls across five templates. All finished normally, and the follow-up calls cost $0.342, 14.7% of copy spend. The eval keeps no raw text (tests/eval/pipeline.eval.ts:116-133).

**They were counted as fits.** The eval records no violation for an unreadable answer and counts it as fitted (tests/eval/summary.ts:259, :271). So l6's "first copy answers fit 36 of 60" (ADR 0044:27) is really 26 of 60, and "34 of 40 in-call retries fitted" is really 32 (review2/rt-money-wording/first-fit.cjs).

### 2.8 Smaller corrections

- **Decision 5's stated cause is too broad (EVI-4).** "The cause is the sentence" is wrong for three fixed-four structures: Monolith's steps, Meridian's benefits and Summit's reasons. The brief always has three points and three steps, so a fourth item appears in 41 of 41 answers.
- **Frequency claims count the same businesses (EVI-6).** "36 Summit pages" are 10 fixtures counted across four runs, 14 of them fallback pages. The icons are hard-coded, so they appear on every page by construction.
- **Some fixes change nothing visible (TPL-8).** 8 of the 32 copy-free fixes change only an address or a form field's name. The "details in the URL" defects need an empty email, which never happens on a visitor's page (lib/db/schema.ts:45).
- **/examples (TPL-9).** It is unlinked and noindexed, and template:compare prints box sizes only, without scoring regions.
- **Renaming a copy key would break stored designs (rt-templates-05).** renderConcept parses every stored row with the template's current schema and throws on a mismatch, and /preview has no error boundary (templates/render.tsx:24-53). So a rename would turn a stored design into an error page for as long as rows written before it are kept: 30 days, or 210 days and more for a kept brief.
- **The porting guide prescribed the defects (CRC-8).** It said to keep source names, set greys as alpha shades and place a source's icons by position (docs/template-porting-guide.md:45, :82, :86).
- **The "every design" lines (RSK-3).** They include a heading on a public production page today: /examples/hub?state=exhausted.
- **Committing /admin lines (RSK-6).** Per-brief /admin lines must never be committed: the repository is public.

### 2.9 What the critics added

The two critics' 25 findings are folded into sections 2.1 to 2.8. They are listed here with their status, so each can be traced.

| Id     | Finding                                                                                                               | Status                         | Where it lands                   |
| ------ | --------------------------------------------------------------------------------------------------------------------- | ------------------------------ | -------------------------------- |
| CRS-1  | Fixed headers cover the studio bar on Ember, Harbor, Summit and Vector                                                | Confirmed (0 of 540 reachable) | Decision 22                      |
| CRS-2  | Monolith's and Meridian's gradient headline words at about 1.5 to 2.5:1 on light pages                                | Confirmed                      | Decision 15                      |
| CRS-3  | Aurora's menu button off screen at 390; Vector's menu pill covers the name                                            | Confirmed                      | Decision 15                      |
| CRS-4  | Headers wrap and collide at tablet widths; Monolith's hero cards cut; Vector's headline under its pills held sideways | Partly (counts corrected)      | Decisions 15, 19                 |
| CRS-5  | The hero rule tested only a wordmark; a dark veil buries dark logos                                                   | Confirmed                      | Decisions 7, 23                  |
| CRS-6  | A dark logo vanishes on the dark look in all eight templates                                                          | Confirmed                      | Decision 23                      |
| CRS-7  | Summit's phone menu unreadable over the hero                                                                          | Confirmed                      | Decision 15                      |
| CRS-8  | Own photographs leave every later slot empty; the fill was in no phase                                                | Partly (counts corrected)      | Decision 7a                      |
| CRS-9  | Vector's cursor disc shows under reduced motion                                                                       | Confirmed                      | Decision 15                      |
| CRS-10 | The designs page draws dark-look posters light                                                                        | Confirmed, low                 | Part 5                           |
| CRC-1  | Harbor's hero fails the rule over its pictures                                                                        | Confirmed                      | Decisions 7, 15                  |
| CRC-2  | Four widths miss breaks at 320, 360 and 1280                                                                          | Partly                         | Decision 19                      |
| CRC-3  | Some success criteria need labels no round produced                                                                   | Partly                         | Decisions 7, 9; Part 5           |
| CRC-4  | Monolith's first layout fails its own check                                                                           | Confirmed                      | Decision 15                      |
| CRC-5  | The faded-text fix covered body size only, and its check could not see faded text                                     | Partly                         | Decisions 9, 15                  |
| CRC-6  | The judging ceiling was priced without the spec's own additions                                                       | Partly                         | Decision 10                      |
| CRC-7  | The pull request split collided on shared files                                                                       | Partly                         | Decision 21                      |
| CRC-8  | The porting guide was not amended                                                                                     | Confirmed                      | Decision 21 (amended in this PR) |
| CRC-9  | Moving the first own photograph blanks the poster                                                                     | Confirmed                      | Decision 5                       |
| CRC-10 | Checks rest on git-ignored data; the scorecard measures none of the new targets                                       | Partly                         | Decisions 9, 20                  |
| CRC-11 | Claims in the first draft that misquoted their source                                                                 | Partly                         | Corrected throughout             |
| CRC-12 | Labelling at two widths was not re-costed                                                                             | Partly                         | Part 3, Part 5                   |
| CRC-13 | The repository squash-merges, so one disputed commit holds a whole PR                                                 | Confirmed                      | Decision 21                      |
| CRC-14 | Working the category out again in /admin loses the record of what chose a past visitor's designs                      | Partly                         | Decision 3                       |
| CRC-15 | No picture set plus "never unjudged" blanks posters on refusal days                                                   | Partly                         | Decision 8                       |

## Part 3. The adjusted plan

Three principles replace the phase gates of the brief (brief:18) and of the plan. This changes the owner's brief under the delegation, and the owner can restore the gates on this pull request:

1. **Ship first what a visitor sees, and measure it with code.**
2. **Build selection machinery only when it can change a pick.** That means when the owner gives the first label that could change which templates a row may show or how they are ordered.
3. **Ship each rule that can remove a picture only after its fallback exists**, and only once it is calibrated.

### The check standard every Phase 2 pull request meets (decisions 9 and 19)

**Widths.** 390 first, then 320, 360, 768, 1024, 1280, 1440 and 1920, each breakpoint the change touches at ±1 px, and a phone held sideways (844x390). Results are reported per width, 390 first.

**Copy.** Every stored model answer for the template, set in each of the four looks' fonts. Synthetic values test the limits:

- each text slot at its longest allowed value;
- the longest real words found in stored headlines and briefs (STRAIGHTFORWARD, NORTHUMBERLAND, PHYSIOTHERAPY, KNARESBOROUGH);
- business names of 10, 16, 40, 60 and 80 characters.

**Text fit.** No word is clipped, split mid-word or run past the screen. Header controls do not overlap, do not wrap inside a link or button, and stay inside the screen. The visitor's own wordmark may wrap, but never overlaps or clips.

**Words over a picture** (decision 7's rule).

**Contrast.** Every rendered text element is checked from its computed colour, with any alpha composited over its real background. The check runs in all four looks, both schemes, at 390 and 1440. The pass mark is AA: 4.5:1, or 3:1 for large text. Gradient text (background-clip: text) is checked from its resolved stops instead, because the computed-colour scan skips it: every stop meets the text's level against the colour under it, in both schemes (review2/verify-critic-states/grad-stops.mjs).

**The studio bar and menus.** At scroll 0, 20 and 40, a pointer reaches each studio link. A click and a Tab reach every menu entry. The phone menu returns focus to its button.

**Heading outline and accessible names.** These match an expected list written into the check.

**Behaviour.** Each decided behaviour has a one-line check:

- every form field carries its autocomplete token;
- every ask's link is its template's closing block, and the closing button is a mailto with its label as the subject, or, with no email, a link to the top or to its own block;
- Ember's grid picture rests upright once the pointer leaves;
- Summit's caption link is visible on keyboard focus;
- Summit's closing picture is not loaded with priority at 390;
- Vector's cursor disc has opacity 0 under reduced motion (review2/verify-critic-states/vector-cursor.mjs).

**Before and after.** Every check runs on the unchanged code and on the change, and the pull request reports both.

### Phase 2, now: free, copy-free, no labels and no paid calls

**1. Eval and review tooling (merges first, decisions 9, 17, 19 and 20).**

- **Unreadable answers.**
  - The raw text of any unreadable answer is kept, and an unreadable answer never counts as a fit.
  - Re-summarising the four stored runs is free (EVAL_SUMMARISE). It corrects l6 to 26 of 60 first answers fitted.
- **New switches.**
  - A switch writes copy for named templates only.
  - A spend stop (EVAL_MAX_USD) starts no new fixture once a run's priced cost reaches its cap.
- **Phone screenshots.** They are taken at 390, scrolled, with reduced motion.
- **The checks, as scripts runnable against a local server with stored copy and pictures injected:**
  - text fit;
  - words over a picture, both worst case and on stored pictures;
  - rendered contrast;
  - menu reach and studio-bar reach;
  - layout shift;
  - accessible names;
  - leftovers on the rendered page.
- **Frozen detectors.** They are committed and frozen before the first template pull request. Their known blind spots are listed (Summit's t07-L9), and any later change to a detector is reported in the pull request that makes it.
- **CI.** It guards text fit as an end-to-end spec over a development-only route that renders a committed set of stored model answers (tests/fixtures/template-copy/): copy written for invented test businesses, with no personal data. /examples cannot take a stored answer, and test-results/eval is git-ignored.
- **Fixtures.** It appends decision 11's four new fixtures to the frozen fixtures (tests/fixtures/eval).
- **The scorecard** reports picture numbers per stored run: empty slots by cause (search error, all rejected, pool used up), sharing, score bands and flagged alt text.

**2. One pull request per template.** Each is copy-free: no change to a guide, a slot key, a count or anything else the copy model reads. Each carries:

- the leftover fixes of decision 1, with the stand-ins fixed per element;
- its universal defects (decision 15);
- every faded text that is not decorative, moved to a text colour the colour engine checks;
- its tone word and a rewritten description (decision 12).

| Template | Visible changes beyond the shared list                                                                                                                                                                                                                                                                         | Its own checks                                                                                                                                            |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Harbor   | Headline sized by its longest word; wrapping hero phrases; tiles one column on phones; header fit at 768 to 1024; hero words over the picture (decision 7's rule and order); news field and "Privacy · Terms" not drawn; hover-only line not drawn; focus return; footer headings; autofill                    | Text fit, including synthetic long words; the words-over-picture rule over any picture and its 9 stored pictures                                          |
| Atlas    | Header menu usable by pointer and keyboard; nav fit at 1024 to 1279; heading levels; table headings' contrast; the asks rule                                                                                                                                                                                   | Menu reach at 390 and 1440; header fit                                                                                                                    |
| Ember    | Header fit at 768; picture turn ends upright; empty pictures keep their shape; focus return; the asks rule                                                                                                                                                                                                     | Text and header fit; empty-state renders; the open phone menu over any picture                                                                            |
| Summit   | Phone menu at least 70% surface; photo-cell captions readable over any picture; caption links visible on focus; menu focus; the closing picture not loaded with priority on phones; header fit at 768; autofill; form text contrast                                                                            | Menu and caption legibility over any picture and the 15 stored pictures                                                                                   |
| Monolith | About phrases fit at every width; hero cards fit from 1024 to 1440; wordmark fit at 768; headline gradient readable in the light scheme; area labels' contrast; three steps drawn; headings; the asks rule; initials in the circles hidden from screen readers                                                 | Text fit; gradient contrast from its resolved stops; three steps on every stored page                                                                     |
| Aurora   | Window chrome removed; header ask hidden on phones as intended; nav fit at 768; window's phone geometry; the asks rule                                                                                                                                                                                         | Header fit with names of up to 80 characters; the window's three lines whole, at least 65% of its picture shown at every width below 1024, seams included |
| Meridian | Placeholders removed; headline phrase readable in the light scheme; nav fit at 1024; heading levels; picture box; dead markup; fallback headings; autofill                                                                                                                                                     | Layout shift 0 at 390; header fit; heading outline; gradient contrast from its resolved stops                                                             |
| Vector   | Name pill clears the menu pill; headline clear of its pills when the phone is held sideways; cursor disc hidden under reduced motion; open project view readable over any picture; letter-by-letter heading gets a text alternative; menu button named with its visible label; heading levels; fallback labels | Header fit; accessible names; the words-over-picture rule on the open view                                                                                |

**3. Hero legibility (Ember and Summit, decision 7).** Their hero treatment and its header states ship in a pull request of their own, together with the matching treatment on the done page's posters. A taste dispute over it then holds up nothing else.

**4. Preview chrome (decisions 22 and 23).** The studio bar stays reachable over every template, and the visitor's logo stays visible in every scheme.

**5. Site wording (decisions 13, 14 and 18).**

- The "every design" lines, in words that name no number.
- The partial notes, with no false reason.
- A fallback headline that never stops mid-phrase, in lib/copy-slots/fit.ts.
- Two claims-register rows.

**6. Picture rules that need no model change (decision 7a).**

- Alt text checked before it reaches the page.
- Pexels' width and height kept on each candidate.
- Extra item pictures chosen last.
- Monolith's circles never take stock.
- Stock judged as today for the slots a visitor's own photographs leave, in a commit of its own with the two public lines it changes (decision 7a).

**Ordering.**

- **The sheet.** The labelling sheet is rendered only after the template pull requests merge, so the owner never labels a defect that is already fixed.
- **Shared lines.** Some pull requests change the same lines. The preview chrome, the hero, and the Ember, Harbor, Summit and Vector pull requests edit the same class strings of the fixed bars (t05 nav.tsx:51, t06 nav.tsx:77, t07 nav.tsx:69, t08 header.tsx:88), the phone sheets (t05 nav.tsx:84, t06 nav.tsx:127, t07 nav.tsx:79) and Vector's name pill (t08 header.tsx:95).
- **The order.** The suggested order is the tooling pull request, then the preview chrome, then the rest. Whichever merges later rebases on the earlier.

### The owner's optional round, once the sheet exists

- **The core round, about 70 minutes (an estimate at the plan's rates; the first ten pages are timed).**
  - The 15 pages of the 8 doubt cells, at 390 and then 1440.
  - The 20 fixture categories. This part is needed before the category rules are scored in CI.
  - The first pictures.
- **One protocol for every picture label.** Each picture gets one accept or reject label in its slot, seen at 390 and then 1440, with the words over it hidden and, in a per-item slot, its item's title shown. All picture labels can then be pooled.
- **Optional samples.**
  - A first-picture calibration sample: about 130 pictures, about 43 minutes.
  - A detail-picture sample: about 82 pictures from the other slots, about 27 minutes.
  - Both are costed at two views of 10 s each, as the core round is (estimates).
  - The other range pages, the look pages and the stress pages, all capped.

### Paid passes: 1 to 4 now, on the owner's go-ahead; 5 and 6 from November

Each pass runs one change at a time, so its effect can be measured, and each is capped (decision 10). In this order:

1. Monolith's and Vector's copy-changing fixes.
2. Harbor's.
3. The other copy-changing fixes, and "match three" for Meridian's and Summit's fixed fours.
4. Copy for the 18 empty cells and the new fixtures.
5. Class-aware judging and the photograph prompts, in a pass of their own. It needs no labels.
6. The calibration re-rank, once the picture samples are labelled.

### Phase 3: when the first label could change a pick

- **The category rules,** scored on withheld sentences.
- **The tiers,** with suits first switched on per row.
- **The minimum CI test.**
- **The lapse test.**
- **The range report,** and the replacement of the eval's coverage test with the range assertions (N and M).
- **On /admin:** the category and generated descriptions.
- **In the open event:** the position of each design.

### Phase 4: photographs, in this order

1. **Designed empty states** for every slot class.
2. **Search and rank as saved steps**, so a retry repeats only what failed, with caps.
3. **"Never unjudged",** one slot class at a time, with decision 8's /admin count of designs that lack a first picture.
4. **Class-aware judging,** through its paid pass.
5. **The floor,** once calibrated.
6. **Crop and pixel filters,** each with its matching search.
7. **The after-round.** The new picks are rendered in their slots with the development route and added to the labelling sheet with the same sampling rule (brief:340). The owner's accept-or-reject labels on them are set against the core round's first-picture labels and the samples, which serve as the before. Acceptance is reported before and after, per template and category, with counts, 95% intervals and the judge's agreement with the owner (brief:162). It takes about 8 minutes per 100 pictures at 5 s each (plan:1561, an estimate), and it is optional like every label.

## Part 4. The decisions

### Decision 1. Leftover fixes, routing, /examples and Meridian's defects

**Decided.** Approve all 32 copy-free leftover fixes, the copy-free address half of t04-L1, and the 2 fallback-only fixes (t01-L8, t08-L7), element by element.

**Stand-ins.** Order decides first: numerals for ordered steps, and one repeated mark for lists in no order. The mark comes from the template's own sections where it has one. A small brand dot is used only where it has none (Ember). Where a mark has no job, it goes. Numerals are hidden from screen readers. Numerals the source drew only as decoration may stay, hidden from screen readers, at 15% or fainter (Meridian's benefits, t03-L2).

| Fix            | Element                                                                                                                                                                                   | Stand-in                                                                                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| t01-L1 to L6   | Aurora's window chrome                                                                                                                                                                    | Remove the dots and the progress bars; one plain bullet on all three lines; the name as a plain heading; no selected style; ticks without toggles                  |
| t02-L1         | Monolith's panels mark                                                                                                                                                                    | Remove; the name alone                                                                                                                                             |
| t02-L2         | Bulb on the offering card                                                                                                                                                                 | Monolith's own Check (hero-cards.tsx:87)                                                                                                                           |
| t02-L3         | Radar beside each label                                                                                                                                                                   | Remove; labels alone, moved to a checked text colour (2.79:1 today)                                                                                                |
| t02-L4         | Step icons                                                                                                                                                                                | Numerals 1 to 3 (new to Monolith; three steps are drawn, decision 15)                                                                                              |
| t02-L5         | Service icons                                                                                                                                                                             | Check in the existing tinted square                                                                                                                                |
| t02-L6, L7     | "Free Icons", "Menu Icon"                                                                                                                                                                 | Titles removed and drawings hidden from screen readers; "Menu"                                                                                                     |
| t03-L1         | Marquee icons                                                                                                                                                                             | None (the row repeats, so numerals would restart)                                                                                                                  |
| t03-L2         | Benefit icons                                                                                                                                                                             | Drop the icons. The faint 01 to 04 stay where they are, as decoration (an aria-hidden watermark at 15%), and the title leads                                       |
| t03-L3         | Feature icons                                                                                                                                                                             | One Check in the existing disc                                                                                                                                     |
| t03-L4         | Contact-step icons                                                                                                                                                                        | Numerals 01 to 03 at the row's own size, in brand-deeper, in the icon's place                                                                                      |
| t03-L7, t06-L4 | Placeholders                                                                                                                                                                              | Meridian: none except "Your message..."; Harbor: "Your name", "your@email.com"                                                                                     |
| t05-L1         | Ember's chef's hat, leaf, heart                                                                                                                                                           | A small brand dot (new; Ember already numbers its points and steps)                                                                                                |
| t06-L1         | Harbor's six card icons                                                                                                                                                                   | Check in the existing square, as Harbor's own pricing list draws it (pricing.tsx:75)                                                                               |
| t06-L2         | Bolt in the hero pill                                                                                                                                                                     | A plain brand dot, as Harbor's partners row draws it (partners.tsx:31)                                                                                             |
| t07-L1         | Summit's medical icons                                                                                                                                                                    | CircleCheck, Summit's own list mark (services.tsx:46)                                                                                                              |
| t07-L2         | Summit's step icons                                                                                                                                                                       | Numerals in the dashed rings, in on-surface-muted (the rings' /55 fails AA)                                                                                        |
| t04-L3         | Atlas's "More" links                                                                                                                                                                      | Not drawn when the card holds words                                                                                                                                |
| Addresses      | Monolith's #cta, #dishes, #timing, #booking-process, #metrics, #book-appointment, #facilities, #projects, and Atlas's #tools (the address half of t04-L1); field names doctor, department | Neutral names, with the copy model's target names mapped so the copy is unchanged. Meridian's #community and Atlas's #offer keep their names until their paid pass |

The address renames update these tests: Monolith contract.test.ts:145, Ember :150-157, Summit :161-167 and Vector :116, plus Aurora :121 and Atlas :138 for the asks rule (decision 15). Vector's scroll spy follows the new id. Each template pull request adds a test that the replaced drawings are gone; none exists today.

**Routing.** None. No template is kept from a row because of a leftover. Routing would empty the pools (plan:51-54), and the fixes are free.

**/examples.** Change both. 31 of the 32 fixed elements are hard-coded in shared section files, /examples is unlinked and noindexed, and template:compare does not score regions (TPL-9). The port ADRs record which elements no longer match the source, in this pull request. Renamed ids are compared with `name=#old::#new`.

**Meridian.**

- Approve D2 (heading levels), D4 (dead markup) and D5 (generic fallback headings).
- Approve D3, the picture box: pass the picture's own width and height, and make its wrapper full width, with a target of layout shift 0 at 390.
- Defer D1, the mail subject. On a visitor's page the mail goes to the visitor's own address and the chosen subject is already in the body, so it needs a different submit method for little gain.

**The copy-changing leftovers** wait for the paid passes in Part 3. They are:

- t01-L7;
- t02-L10 to L16;
- t03-L10 and L11;
- t04-L6 and L7;
- t05-L4 to L8;
- t06-L7 to L10;
- t07-L7 to L9;
- t08-L1 to L4 and L6;
- the copy-changing halves of t03-L9, t04-L1, t04-L2, t04-L3, t07-L3, t07-L4 and t08-L5.

t06-L12 and L13 are handled copy-free by decision 15. Raw-text capture and the named-template switch ship first (Part 3, item 1). A copy key is renamed only with a read-side alias, so stored designs keep rendering (decision 12).

**Why.** Every one of the 59 l6 model-copy pages shows at least one leftover that reads wrong for its business. After these fixes the count projects to 21 of 59, with Harbor's footer drops under decision 15 (review/verify-outcome/leftover-after.cjs). None of the 32 changes what the copy model reads: it gets the template's name, its guide and a skeleton whose strings are emptied (lib/ai/copy.ts:38-44; lib/ai/json.ts:24-45).

### Decision 2. Categories, the clash table, labels and lapse

**Decided.**

- **Rows.** Approve rows A to F plus U, described by what their businesses typically have, with example trades, as proposed. They are provisional. Row F rests on three client relationships, two of them software, and on PRODUCT.md:11's early-stage founders.
- **Unlisted kinds.** These go to the U pool. Fixed rules cannot tell "a kind with no row" from "a sentence that names no trade", so "unlisted" is not promised as a recorded value.
- **The /admin count is not a blocker.** The rows are re-checked once 30 real briefs exist (a proposal). Only counts per row are ever committed: the repository is public, so no per-brief line goes into it.
- **Lapse.** Labels lapse automatically when their cause is fixed. The lapse test is built in Phase 3, before the selector reads any label, and labels taken earlier are checked by it then.
- **The 20 fixture categories.** The owner confirms them in the core round (about 5 minutes). That confirmation is needed before the category rules are scored in CI (brief:152). Until then the plan's proposed categories stand, and nothing a visitor sees depends on them.

**Why.** A row changes no visitor's designs until it holds an approved clash or "suits" label (2.3). Approving now is reversible, as the plan says (plan:113).

### Decision 3. Where the category comes from

**Decided.** Option C: fixed rules over the sentence and the company name, giving "unclear" on no match or a tie. No model call steers the choice, so "Is this AI?", the privacy page and docs/pipeline-plan.md:11 stay true. No migration:

- **Where it is worked out.** Once, in the select step, and returned beside that step's outcome, never in the row's columns. The select step logs the slug, the category, the rule and label versions (a hash of each data file) and each design's tier, never the sentence.
- **Keeping the record.** How long Vercel keeps logs is not verified (review/risk.md:188), and a brief is kept 30 days, or 180 days from its last won or booked mark (lib/config.ts:207). So the rule and label files keep the date each version took effect, and the row that chose any kept brief's designs can be worked out again from its created_at (CRC-14). The log line is a cross-check, and no migration is needed.
- **On /admin.** /admin works out a brief's row with the rules and labels in force when it was built, so it shows the row that chose its designs.
- **Imagery.** It may read the category only for a use decision 7 names, gated like suits ordering. Until then it ignores it.

**Built in Phase 3, when the first label could change a pick**, with these conditions:

1. The words are kept as data. "app" is matched as a whole word, and app words are tested against trade words.
2. **Scoring.** It is scored on sentences its author did not write. These are at least 36 owner-written one-liners, about five per row, each with a company name. They are kept outside the repository until the rules are frozen in a tagged commit, then added and scored with no rule change in that pull request. Client sentences already published in the repository serve as regression tests (lib/brief/example-brief.ts:12; app/_components/work-items.ts), never a sentence from /admin.
3. **Targets.** 0 wrong rows on the withheld sentences, which bounds the wrong-row rate below 10% (two-sided 95%). 0 wrong rows when the owner checks the computed row on the first 30 real briefs. "Unclear" on at most 50% of the withheld sentences that name a trade (a proposal). "Unclear" gives today's choice, so it can never leave a visitor worse off.
4. **If the rules cannot meet these targets**, the step stays on rules, and a model call goes back to the owner as a new decision, with the exact new words for "Is this AI?" (straight-answer-items.ts:34), the privacy page (privacy-copy.ts:17) and docs/pipeline-plan.md:11. This decision approves no model call that steers the choice.

**Why.** Rules cost nothing, add no time and keep working when the API refuses. With today's untuned words they reach only 9 of 20, so they must be tuned and tested on withheld sentences before they steer anything. Building them before a label exists would change nothing a visitor sees (2.3, 2.6).

### Decision 4. Choosing among the templates that fit

**Decided.**

- **Shortfall.** None can occur while every row keeps six eligible templates, so build no "fewer designs" path, no "call" path, no new status, no migration and no new words.
  - **The minimum test.** When the selection rule is built, a CI test checks that every row ("unclear" included, and per logo polarity once any template is not "either") keeps at least three times the number of full visits allowed. That is two visits today (ADR 0038:15), so 6. The visit-cap work (ADR 0043:43) sets the next number.
  - **The property test.** The selector returns three whenever three unseen ready templates that accept the logo's polarity remain.
  - **The case that cannot be reached.** The pure selector fills the last places from held-back clashes, clashing ones last, and marks its answer. build-concepts logs that as an error, and no public line changes.
  - **When the question comes back.** The shortfall question is decided in the visit-cap work, or when an approved clash would take a row below six, which the test then forces.
- **Order.** Suits first, decided now, with Design one not required to suit. Per row, it switches on only once three things hold:
  1. the category step meets its targets (decision 3);
  2. that row has a "suits" label;
  3. each of that row's "suits" labels holds on two of the row's fixtures that agree (a gate this decision adds; brief:294 asks only that disagreeing fixtures be reported).

  Until then the row runs two tiers, which gives exactly today's choice while no clash is approved.

- **Visit 2.** Three unseen eligible templates, which the minimum guarantees.

**Why.**

- The arithmetic and an exhaustive count prove the shortfall unreachable under the minimum (2.3).
- Suits first shows the most judged-right designs any rule can show (2.6).
- It can hurt in two ways, a wrong row and a label resting on one page, and both are gated.

**The owner should know** that the minimum of six caps approved clashes at two per row.

### Decision 5. Other signals

**Decided.**

- **The look.** It does not steer the choice. Instead, every template must honour every look, and code checks it:
  - a unit test fails when a template draws a literal colour (Vector's picture treatment excepted while its doubt cell stands);
  - the rendered contrast check runs in all four looks.

  This replaces the first draft's claim of "no fixed dark colour". Surfaces follow the scheme, but Monolith's headline gradient mixes in fixed white and breaks the light scheme (CRS-2, fixed under decision 15). The look pages are rendered; labelling them stays optional.

- **Own photographs.** Their placement stays as today. Moving the first one off the first slot would take it off the done page's poster, which always shows the first slot (lib/preview/status.ts:46-50), and off Atlas's desktop hero. How own photographs fill slots is outside the brief unless the owner says so (brief:212), so it goes to the owner in Part 5, with renders. Stock pictures for the slots they leave are decided under decision 7a.
- **Sentence length.** No guard rail. The corrected cause: variable-length lists pad when the sentence is short. The three fixed-four structures pad for everyone. Monolith's draws three steps now (decision 15); Meridian's and Summit's wait for the third paid pass.

**Why.** Steering by look would cut variety and need taste labels. Making every template render every look well serves every visitor.

### Decision 6. Which structures count as clashes

**Decided.**

- **No clash now.** No stored page or render shows a structure that a row cannot fill honestly (plan:658).
- **Labelling the 13 doubt cells.**
  - The 8 with stored pages go first in the core round, at 390 and then 1440.
  - The five empty hero pools, and electrician's all-rejected one, are refilled from baseline's stored pools and marked as such. Electrician stays "all rejected" in today's numbers.
  - Each doubt is labelled on its merits. If a row ends with more than two clashes, the CI minimum test fails, and decision 4's shortfall question is decided then.
- **The 5 cells with no page** get paid copy within the 18 empty cells, in the fourth paid pass, after the copy-changing fixes. Their pages then show the fixed guides.

**Why.** A clash needs evidence, and none meets the bar. No visitor waits on these labels, because nothing routes until they exist.

### Decision 7. Photographs

**7a. Decided now: code only, no model change, shipped in Phase 2's picture-rules pull request.**

- **Alt text.** A stock picture keeps Pexels' alt only if all of these hold:
  - it is at most 120 characters;
  - it has no digits;
  - it has no capitalised word, other than the first word of a sentence, that the visitor's sentence, the company name or the brief did not give.

  Otherwise its alt is empty. A visitor's own photographs keep their alt. The class-based empty alt waits for Phase 4's slot classes.

- **Width and height.** Pexels' width and height are kept on each candidate as data, with no filter yet.
- **Item pictures.** The item slots past each contract's minimum are filled last. The minimums come from a small table checked by a test against each contract.
- **Monolith's circles.** Stock never fills them: the stage plans them as empty when no own photograph reaches them, and the template's initials show. A visitor's own photograph still goes where it goes today.
- **Stock for the slots a visitor's own photographs leave.** These slots are filled with stock, ranked as today (CRS-8). It changes no prompt, and it costs at most what a visitor without photographs already costs.
  - **The public lines it changes.** In the same commit, the privacy page's Pexels row (app/privacy/privacy-copy.ts:18) becomes "supplies stock photographs for any photo space your own photos do not fill", and the home page's line (app/_components/section-copy.ts:50) becomes "Your photos go in first; we find photos to match for the rest." A claims-register row records them (brief:204).
  - **Flagged for the owner.** It changes the page a visitor with own photographs gets, which the brief puts out of scope unless the owner says so (brief:212). So it is a commit of its own, flagged on the pull request, and the owner can drop it.
- **The check.** Replaying the stored pools shows l6's empty and shared slots at 43 and 49 or fewer. No circle holds a stock picture. Flagged alt text is 0, and the share of alts left empty is reported beside it.

**The rule for words over a picture.** It ships in Phase 2 with the hero treatment and the template pull requests.

- **The rule.** Every text item over a picture meets 4.5:1 (small) or 3:1 (large) over every pixel of its box, when the picture under it is pure white and when it is pure black. It covers:
  - the hero, with the header's wordmark and links;
  - Harbor's closing band;
  - Summit's photo-cell captions;
  - Vector's open project view;
  - the open phone menu at scroll 0, wherever its sheet is translucent over a picture (Ember's and Summit's);
  - the done page's posters.

  This holds in both schemes, at the standard widths, with the header at the top and scrolled past its glass threshold, and with no picture.

- **The cross-check.** It also passes the 95% rule on every stored picture and every unrejected candidate in the stored Ember and Summit hero pools (219).
- **The visitor's logo** stays visible at 3:1 over its box in the header's top state, tested with stand-in logos at both ends of the polarity band each scheme gets: black and L* 0.34 on the light scheme, L* 0.66 and white on the dark. Mixed artwork is measured and reported (decision 23).
- **Choosing the treatment.** The pull request tries the options in order of how much of today's look each keeps, each up to a cap:
  1. a local gradient behind the words only;
  2. a surface veil, at most 0.8, with any on-surface-muted words over the picture set in on-surface (muted words need 0.81 to 0.82 over any picture, section 2.1);
  3. the scrim token as a veil with the words in on-scrim, at most 0.7.

  The header zone always takes a surface-coloured veil, never the dark scrim, so a dark logo stays visible. The pull request ships the first option that passes everywhere within its cap. If none does, it ships the best one and lists the failing cases, and the owner can object on the pull request. A cap is never raised to force a pass.

- **Header colours.** Each text colour is paired with the colour under it, so a darkening layer is never put under dark words. Header text that changes over the hero changes back when the header turns solid.
- **Posters.** In the photo, type and airy layouts, a poster-surface veil sits under the bar and the words, strong enough for the poster's ink to keep 4.5:1 over pure black at 136, 164 and 196 px.

**Decided for Phase 4, in this order:**

1. **Designed empty states for every slot class.** Each is designed before the first rule that can empty that class ships: a muted block that keeps the slot's shape and carries the brand tint, never a collapse. A test fails when an empty slot's box is smaller than its picture's box would be.
2. **Search and rank as saved steps,** so a retry repeats only what failed.
   - **Caps.** At most 12 distinct searches and 12 distinct rank calls a submission. Each failed one may be retried up to 3 times, against a separate cap of 12 retries (a proposal).
   - **First,** Inngest's per-step behaviour is read in its documentation (plan:1386).
   - **The owner's build email** notes a Pexels quota stop (a 429), or a monthly remainder below 2,000 of 20,000 (a proposal).
3. **"Never unjudged", one slot class at a time,** each once its fallback exists.
   - **When searches are skipped.** Only on an account-level refusal: an authentication error, or a 400 whose message contains "Your credit balance is too low to access the Anthropic API" (quoted from test-results/eval/l0-skeleton/bakery.json, which git ignores). The status and wording of a spent monthly limit are not known (section 2.5): the first one is logged, and the matcher is extended to it in a commit of its own. Any other error keeps searching, because the brief and the judge run on different models (lib/config.ts:113). Each refusal's message is logged, so a new wording shows.
   - **Logging.** One log line per design whose first slot is left empty, with its cause.
4. **Class-aware judging.**
   - **What the judge sees.** Per class and section, at the crop the page shows. It gets a second crop for classes 1, 2, 6, 8, 9 and 10 and the 390 crop for class 4, and scores each crop on its own; code keeps the lower score.
   - **What it reports.** Rule P, and alt written for classes 3 to 6.
   - **Measurement.** It is measured in its own paid pass, including its real cost (decision 10).
5. **The floor.** None until calibrated.
   - **The labels.** The owner's labels on two seeded samples, each with its size and Wilson margin stated on the sheet (brief:296):
     - first pictures: about 130 from both runs' hero pools, stratified by score (about 35 each of 6s, 7s and 8s, the 14 9s, 10 rejected, and the 5 unrejected 4s and 5s). The 42 stored slot-0 picks are among them, and their core-round labels are reused;
     - other slots: about 82 detail-pool pictures, stratified by template and category (brief:296) and by score.

     Each is labelled under the one protocol of Part 3, so a per-item picture is seen with its item's title (plan d; brief:157). Each band's count and Wilson interval are reported.

   - **The re-rank.** An eval mode that makes no Pexels call re-ranks those candidates under the new prompt. It sends the crops the class-aware judge would get, and is paid as decision 10's pass 6 (an estimate of about $0.25: 40 rank calls at l6's $0.00624).
   - **The rule.** A class's floor is the lowest score at which every band from there up shows acceptance at or above the class's target. A band with fewer than 35 labels is pooled with the band above.
   - **Classes with no sample** keep no floor.
6. **Crop and pixel filters,** each with its matching search orientation.
   - **The limit.** 35% at 1440 (50% for the very wide strip). For class 1 no crop limit applies at 390, because no one picture shape keeps within 35% at both 390x844 and 1440x900. A class whose phone shape can meet the limit applies it at every width it shows.
   - **Ember's About picture** leaves class 6 and keeps a landscape search, checked at 390 and 1440, with its 768 crop also judged.
   - **The class-6 filter** waits for a probe of at most 20 portrait searches.

**Also decided:**

- **Different pictures in each design.** ADR 0017's rule stays.
- **People and faces (Rule P).** No identifiable face, and no person at all in a circle beside a name or quote.
  - From the photograph-prompts pass, the brief prompt asks for "hands or figures whose faces cannot be seen" in place of "No faces" (lib/ai/prompts.ts:37).
  - Rule P keeps docs/pipeline-plan.md:284's purpose ("the product forbids stock people": no stock portraits), and the ADR amends that line to Rule P's words.
  - PRODUCT.md:41's "no stock photographs of generic people" is read as covering the studio's own pages; Part 5 asks the owner to confirm.
  - Whether warm-look pages show people ("Daylight, people, texture.") is measured in the photograph pass from the judge's people field.
- **Per-item pictures.** Whether they wait for their copy (plan d) is decided on the detail sample's labels.
- **The second hero search** runs only when nothing passes floor, crop, pixels and people. Legibility never triggers it.
- **The fallback brief's searches.**
  - **Where they are set.** For a brief that fell back for any reason other than an account-level refusal, they are set in lib/images, not in the fallback brief (which the copy model reads). They never use the company name.
  - **The probe.** Their words are set after a probe of at most 40 Pexels searches.
  - **When probes run.** Both probes run only after the owner's answer on the Pexels key.
- **Acceptance.** The placeholders stay at 90% for first pictures and 80% for the rest, judged on pooled labels and measured before (the core round and the samples) and after (Part 3, Phase 4 item 7). Per template and per cell they are reported with 95% intervals but not gated.

**Why.** Each rule that can remove a picture ships after its fallback exists, so no page ends up emptier than an empty state that has been designed (2.4). The rule for words over a picture holds over any picture, including a visitor's own photographs, which no model sees.

### Decision 8. An approved picture set

**Decided.** No set for now. Designed empty states (decision 7) are the fallback.

**Before slot 0 switches to "never unjudged."** One designed empty poster and one neutral poster per look are rendered for each template, free from stored data, and the owner chooses between them. If the neutral poster wins, the per-look set is built first.

**The revisit trigger.**

- **The count.** /admin counts, from the imagery column over the 30 days rows are kept, the share of built designs whose first slot is empty. The owner reads it monthly.
  - **No migration.** It reads the submission table directly, as /admin already does for a person's briefs (lib/db/briefs.ts:26-29), so the brief_overview view does not change.
  - **Refusals left out.** It leaves out submissions whose brief settled as a fallback (stage_brief, lib/db/schema.ts:94), the stored sign of an account-level refusal. This is a proxy: a brief that fell back after failed attempts is left out too.
  - **Causes.** The cause of each empty first slot is in the never-unjudged log line, read in Vercel while logs are kept (retention not verified, review/risk.md:188). It is not stored, because the imagery column holds a picture or null per slot, and the blob sweep reads every value that is not null as a picture (lib/blob/urls.ts:22-23).
- **When it fires.** At least 20 designs are counted, and more than 5% (a proposal) of them lack a first picture.
- **What gets priced.** Then the smallest useful sets are priced side by side:
  - a neutral set per look for the first-picture classes, about 32 pictures and 16 minutes of the owner's review;
  - a set per row for rows B, C and D, whose businesses already share candidates.

**Why.** Whether a neutral picture beats a designed empty state is untested. In the stored runs the first picture was lost only on Pexels' error days and once to an all-rejected search (2.4).

### Decision 9. Targets

**Decided.** These label-free targets apply now. They are checked by the frozen detectors of Part 3's tooling, which runs before and after every pull request and every paid pass.

- **Leftovers.** No copy-free leftover on any rendered page after the template pull requests. No detected copy-dependent leftover after the paid passes. A guide-echo check flags any guide "such as" example or slot-key word found word for word in stored copy (brief:90).
- **Text fit, header fit, contrast, menus and the studio bar.** Part 3's check standard, at every width it names.
- **Words over a picture.** Decision 7's rule, over any picture.
- **Alt text.** No flagged alt text, with the share of empty alts reported.
- **Empty slots.**
  - On stored runs they are reported by cause.
  - The transient-error part is measured on production: imagery stages that settled with an empty slot after a search error, counted from the retry and fallback logs (lib/inngest/stages.ts:61, :67) while Vercel keeps them (retention not verified, review/risk.md:188). The target is 0 a month.

Picture acceptance follows decision 7.

**Category step targets** are decision 3's. Agreement with the owner on every fixture is required, or each miss is listed and accepted by the owner (brief:154). The clash rate that wrong categories cause is 0 by construction while no clash is approved; from the first approved clash, its target is 0 on the withheld sentences.

**N and M** for the range assertions are set once a clash or "suits" label exists. Until then every ready template is eligible in every row.

**What visitors choose.**

- **Recording.** When the category step ships, the design-open event gains the design's position. The owner records which design the visitor chose at a call in the brief's note, so no column is added.
- **Use.** These choices are reported to the owner beside the labels, against the row that chose each brief's designs (decision 3). They never set or change a label (brief:45).

**Why.** Code-counted targets need no owner time and do not move with taste. Per-cell picture targets cannot be told apart from sampling noise at these sizes (OUT-6).

### Decision 10. Limits

**Decided.**

**No paid pass runs before the owner has answered Part 5's first item.** None runs in October unless the owner raises the organisation's monthly limit: the organisation has spent about $28 of its $30 (docs/pipeline-quality-plan.md:77), so no pass fits under the $10 reserve below. A spend limit on production's own workspace would not change that: the $30 limit is the organisation's (ADR 0044:28), and a workspace's own limit sits inside it.

**Answered on 2 October 2026.** The owner gave the go-ahead: $11.44 is available on the console, ANTHROPIC_WORKSPACE_ID is set on Vercel, and production's Pexels key is the eval's. Production is taken to draw on the same balance.

- **October.** Passes 1 to 4 run, one at a time, each within its cap ($4.81 for all four), which leaves at least $6.63 for production: about 49 submissions at $0.135, or 28 at the $0.235 maximum. If the organisation's $30 monthly limit still applies (about $28 was spent by 1 October), the API refuses calls once it is reached, and refused calls cost nothing; the pass then stops and the owner is told.
- **From November.** The $10 reserve below applies again, and passes 5 and 6 wait for their prerequisites and their own go-ahead.
- **Pexels.** The key is shared, so no eval sends more than 100 requests in an hour, and the probes may now run.

**Before each paid pass, the owner reads the organisation's month-to-date spend and gives the go-ahead on the pass's row of the table below (brief:20).** A pass starts only if that spend plus the pass's cap leaves at least $10 of the organisation's monthly limit: at most $20 of today's $30 (a proposal). That $10 is for visitors and the organisation's other project together: about 74 submissions at $0.135, about 51 once Phase 4 adds its median cost, and about 44 at its most. Also recommended: give the eval key a workspace of its own with a monthly spend limit, so the API enforces the eval's budget. The spend check still runs, because that workspace shares the organisation's limit.

**November's eval budget is $7.50 (a proposal).** A pass starts only if the month's eval spend so far, plus its cap, fits within it; a pass that does not fit waits for December. The eval's spend stop (EVAL_MAX_USD) is set to each pass's cap.

| Pass | What it measures                                                                                                       | Estimate | Cap   |
| ---- | ---------------------------------------------------------------------------------------------------------------------- | -------- | ----- |
| 1    | Monolith's and Vector's copy-changing fixes                                                                            | $0.50    | $0.65 |
| 2    | Harbor's                                                                                                               | $0.43    | $0.56 |
| 3    | The remaining copy-changing fixes and "match three"                                                                    | $1.40    | $1.82 |
| 4    | The 18 empty cells ($0.73), the U and own-photograph fixtures (about $0.29) and the second row-F fixture (about $0.35) | $1.37    | $1.78 |
| 5    | Class-aware judging and the photograph prompts on the original 20 fixtures (more if a crop costs 439 image tokens)     | $3.90    | $5.07 |
| 6    | The calibration re-rank, once the picture samples are labelled                                                         | $0.25    | $0.50 |

- **Where the estimates come from.**
  - Passes 1 to 3 are the l6 per-answer costs on each template's stored fixtures, with the named-template switch.
  - Pass 4 runs as one eval with EVAL_MAX_USD at $1.78. Its 18 cells alone passed $1.00 in 0.1% of bootstrap draws (review/evidence/cap-risk.cjs). The own-photograph fixture's two extra variants re-run only the rank stage, about $0.01 each at l6's rank cost a submission (test-results/eval/l6-all-fixes/summary.md).
  - Pass 5 is the decided spec on the model of review2/verify-critic-coherence/spec-cost.cjs over the 20 l6 sets, $3.86 to $3.90.
  - Pass 6 is 40 rank calls at l6's $0.00624. The second crops it sends are not priced, so its cap is twice its estimate (a proposal).
- **When they run.** Passes 1 to 4 now, on the owner's go-ahead ($4.81 at their caps). Pass 5 from November, within November's $7.50, once class-aware judging is built; it needs no labels. Pass 6 waits for the picture samples' labels.

**Ceilings per submission.**

- **Cost.** At most +$0.10 (a proposal). The decided judging spec is estimated at a median of about +$0.06 and at most about +$0.09; crop image tokens are not measured.
- **Re-checking.** The ceiling is re-checked against pass 5's measured cost before Phase 4's judging ships.
- **Capacity.** In a $30 month that is about 153 submissions at the median and about 133 at the most, against 222 today. Before launch the owner decides the monthly limit itself: raise it, or move production to an organisation of its own.
- **Time.** At most +5 s (the plan's recommendation, plan:217).

**Pexels.**

- **Request counts.** Each run is capped at its count plus 30%:
  - pass 5 about 67;
  - each new fixture 3 to 4;
  - the class-6 probe at most 20;
  - the fallback-search probe at most 40.

  While the key may be shared, no eval sends more than 100 in any hour (a proposal). The probes wait for the owner's answer on the key.

- **A higher limit.** The owner asks Pexels for one before launch. It costs nothing and does not block Phase 4.

**Owner hours.** The core round, about 70 minutes (an estimate). Everything else is optional: the picture samples add about 70 minutes.

**Why.** The refused-model page is the worst page a visitor can get, and production may share the limit (2.5). Spending nothing until the owner checks costs a month's delay on the copy-changing fixes and the photograph passes, while every copy-free fix ships meanwhile.

### Decision 11. Fixtures

**Decided.** Append four fixtures now, in the tooling pull request; the free checks run at once.

- **An app founder (row F),** worded the way real founders write, naming the trade the app serves, as VetPres does. It is added because such visitors arrive (PRODUCT.md:11; two of three client relationships). It is also the source industry of Aurora, Monolith and Meridian (plan:397), so a "suits" label for any of the three in row F counts only once the second row-F fixture agrees (a gate decision 4 adds; brief:294 asks only that disagreeing fixtures be reported).
- **A second app founder (row F),** worded the same way for a different trade from the first, so a row-F "suits" label can be checked on two fixtures.
- **A sentence that names no trade (U).**
- **A visitor with own photographs,** in three variants of 1, 3 and 6 stand-in files, in portrait and landscape, served locally in development. The three variants share one paid copy run (EVAL_STAGES with EVAL_REUSE_RUN) and re-run only the rank stage.

**Their copy.** It is written in paid pass 4.

**Held-out data.** The owner's one-liners of decision 3. They are kept outside the repository until the rules are frozen, and replace brief:323's held-out fixtures, because the category reads only the sentence and the company name.

**What is not added.** No source-industry fixture beyond the two row-F ones, and no other new trade, until real briefs show such visitors. Their rows already hold 3 to 6 fixtures.

### Decision 12. Tone words, slot keys and descriptions

**Decided.**

- **Tone words.** Aurora "sleek", Ember "welcoming", Harbor "energetic", Summit "crisp", Vector "cinematic", as proposed.
  - No other template uses these words, and the renames change no choice among the eight ready templates.
  - Each pull request that renames one reports the template mix from EVAL_PLAN=1 before and after (brief:325).
  - Lucent's word, and whether Aurora and Lucent keep avoiding each other, are decided in the visit-cap work.
- **Slot keys.**
  - Image slot keys are mapped to slot classes in Phase 4 and never renamed, since stored pictures are keyed by them.
  - A copy key is renamed only alongside a paid pass, and only with a read-side alias: the schema accepts the old key until no row written before the rename remains, or the stored rows are migrated first. That is at least 210 days (30, plus 180 for a kept brief; lib/config.ts:207), and longer while a kept brief is re-stamped. A unit test renders a copy object in the old shape.
- **Descriptions.** Each ready template's description is rewritten now from its fit record, in words that name no industry.
  - **What it says.** It describes the design and states what its structures need: "four photographed subjects", "a form asking for a person and a date".
  - **The range line.** It reads "Not yet judged for any kind of business." until labels exist. From Phase 3 it is generated from the labels file, and /admin shows it beside each design, where the owner checks a real visitor's three designs.
  - **Never on the sheet.** The description never appears on the labelling sheet.

**Why.** The owner asked for descriptions that help decide. Nothing reads them today (2.3), so they must be accurate for a person and must appear where real choices are checked.

### Decision 13. Public wording

**Decided.** Under option C and the minimum of six, no "three designs" line changes. Once the selection rule exists, the second-visit answer's switch reads the smallest row pool, so it stays true by construction.

Lines that change:

- the "every design" lines (decision 14), in the site wording pull request;
- the partial notes (decision 18), in the same pull request;
- the privacy page's Pexels row and the home page's photo line (decision 7a), in the picture-rules pull request.

Lines that stay:

- "Is this AI?" and the privacy page's Anthropic row, since no model steers the choice.
- /start's "a background that suits it" (start-copy.ts:282). Decision 23 makes it true again.

Already untrue or open, and outside this change. The first is in the questionnaire, which the brief puts out of scope (brief:212), and the others are the owner's to settle. The partial notes are already untrue too, but decision 18 changes them because they belong to the refused-model page. These are listed for the owner in Part 5:

- the send step's three-designs lines (start-copy.ts:98-99), read by an address on its third visit, which gets no designs (ADR 0038:15);
- the claims register's "A person designs every layout" (docs/claims-register.md:19);
- whether "Daylight, people, texture." (lib/brief/styles.ts:12) holds, measured in the photograph pass.

### Decision 14. The "every design" lines

**Decided.** Reworded now, in words that name no number, so they stay true under any visit cap. The words pass the site's copy rules: the longest sentence is 16 words, with no banned word and no em dash.

| Where                                                | Today                                                                                                                                                        | New                                                                                                                                            |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Done page heading (done-copy.ts, STOPPED.exhausted)  | You have seen every design we have for now.                                                                                                                  | You have had your free designs.                                                                                                                |
| Done page lead                                       | Every design we can build has been shown to this address, so there is nothing new to show you. The next step is a call: we go through your designs together. | Each email address gets a set number of free designs, and this one has had them. The next step is a call: we go through your designs together. |
| Designs page heading (HUB_STOPPED.exhausted)         | Every design we have has been shown to this address.                                                                                                         | This email address has had its free designs.                                                                                                   |
| Owner's brief page (brief-view.ts:36)                | None: this address had already seen every design                                                                                                             | None: this address had already had its free designs                                                                                            |
| Owner's brief page, standing panel (standing.ts:158) | Finished, no link sent: every design already seen                                                                                                            | Finished, no link sent: free designs already used                                                                                              |

"There are no new designs to show you." and the designs page's lead stay, because both are true.

**Tests and comments that change.**

- **Pins by literal.** e2e/brief-hub.spec.ts:126-128, app/admin/_components/standing.test.ts:335-337, and the test name at brief-view.test.ts:94.
- **Pins by import, which stay green.** e2e/brief-done.spec.ts:190-197, brief-view.test.ts:102-108, and the copy rules through copy-corpus.ts:307-308.
- **Phone fit.** The phone-fit loop at e2e/mobile-hub.spec.ts:24 gains the exhausted state.
- **Comments.** The comments at done-copy.ts:213, lib/brief/status.ts:23-24 and lib/db/schema.ts:239 change with them.

**A new claims-register row**, the first for these lines, cites lib/select/select.ts:37-41 and ADR 0046.

- **When it is re-checked.** Whenever the visit cap, the number of ready templates, the designs shown per visit or any template's logo polarity changes.
- **Its one known exception.** A build that fails after its templates were chosen still counts them.

### Decision 15. Universal defects outside leftovers

**Decided. Approved and shipped in the template pull requests, each against Part 3's check standard:**

- **Text and header fit.**
  - **Harbor.** Its headline is sized at render by its longest word, capped at 72 px. Its phrases wrap, its tiles are one column on phones, and its header fits from 768 to 1024.
  - **Monolith.** Its About phrases and hero cards are iterated until they pass. The measured starting point for the phrases is one column below 640, two to 1535 and four from 1536, at 30 px.
  - **Aurora.** Its header ask hides below md as intended, and its nav fits at 768.
  - **Atlas and Meridian.** Their navs fit at 1024.
  - **Vector.** Its name pill clears the menu pill, and its headline clears its pills when a phone is held sideways.
- **Words over pictures** (decision 7's rule).
  - Harbor's hero words: every faded item moves to a checked colour, and the treatment follows decision 7's order: a local gradient behind the words first, then the picture's strength. 20% passed its 9 stored pictures (CRC-1), but over any picture a uniform surface layer needs 0.81 to 0.82 under on-surface-muted words and 0.51 to 0.60 under on-surface (review2/rt-photos/worst-case-veil.cjs). So the pull request measures Harbor's own picture and gradient, and reports the strength that passes.
  - Summit's photo-cell captions and Vector's open project view.
  - The Ember and Summit heroes ship in their own pull request.
- **Contrast.**
  - Every faded text that is not decorative moves to a text colour the colour engine checks, in every template, unless the contrast check measures its shade at AA on every derived palette, light and dark. That includes Harbor's form labels, tile descriptions, small print and photo credit, Summit's form text, Monolith's area labels and Atlas's table headings. On-surface at 75% and 85% passes with room to spare (7.8:1 and more on the stored palettes, measured in the Ember and Summit pull requests), because the colour recipe fixes the surfaces' lightness (lib/config.ts, colour), so those shades may stay. The porting guide says the same.
  - Monolith's and Meridian's headline gradients are built from checked colours in the light scheme (brand-deeper to brand-deepest), keeping the glow for the dark scheme.
- **Menus.**
  - Atlas's header menu closes only when focus leaves the list, or becomes a native details and summary as the FAQs already are.
  - Summit's phone menu sheet is at least 70% surface.
  - Every phone menu returns focus to its button.
  - Vector's menu button's accessible name keeps its visible label and adds the word menu ("Home menu"), so speech input still works (WCAG 2.5.3).
- **Monolith draws three steps.** The first three steps are the brief's three, in order, in 16 of 16 stored answers. how-it-works.tsx draws the first three, in one column, three from md. The fixed count, the guide, assembleMonolith and the fallback's four items stay as they are, so the copy call and its retries are unchanged.
- **Harbor's footer.** The news field ("Hear from us", which no stored sentence offers) and the "Privacy · Terms" small print (pages the taster does not have) are no longer drawn. They are dropped in footer.tsx only.
- **One rule for every ask.**
  - **Where each ask points.** Every ask points at the template's closing block: Aurora #start, Monolith #contact (renamed from #cta under decision 1), Ember #cta instead of #booking-process, and Atlas's closing cell in its footer, the note headed "Get in touch", at a new #contact. Atlas's pitch (#start) is its third section, so it cannot close the page.
  - **What the closing button does.** It opens a mail to the page's email, with the button's label as the subject. With no email it points at the top, as Vector's does, or at its own block. This follows the established rule that a form mails the page's address (docs/template-porting-guide.md, section 3; t08 contract.ts:171).
  - **On a taster** the page's email is the visitor's own, so this opens a mail addressed to them. docs/template-analysis.md flagged mail-to-self forms as high. So this ships as its own commit, which the owner can ask to drop before merge.
- **Aurora's window.** At every width below 1024, the 767/768 and 1023/1024 seams included (today 14% at 767 and 7% at 1023, records.md:1842-1843), it shows its three lines whole and at least 65% of its picture (decision 7's 35% crop limit), for example by placing the picture before the rows or by raising the clip on narrow screens. If a measured render shows that 65% cannot be met, the pull request says so.
- **Accessibility.**
  - Heading levels in Meridian, Atlas, Vector, Monolith (its hero cards included) and Harbor.
  - Summit's caption links visible on focus.
  - Vector's letter-by-letter heading given a text alternative.
  - Autofill on Harbor's, Meridian's and Summit's forms.
  - Monolith's circle initials hidden from screen readers.
- **Behaviour.**
  - Ember's grid picture turns a full turn and ends upright, and its empty pictures and blocks keep their shape.
  - Harbor's hover-only line that is not a link is no longer drawn.
  - Summit's closing picture is no longer loaded with priority on phones, where it is hidden.
  - Vector's cursor disc is hidden unless the pointer can hover and the disc is in use.
  - Meridian's D2 to D5 (decision 1).
  - Vector's fallback marquee reads "What" and "we do", with at least one of its repeated labels varied.

**Deferred, with reasons:**

- **The "details in the URL" part of t06-D4 and t07-D5.** It cannot happen on a visitor's page, because the email is never empty there.
- **Atlas's first picture, which is not drawn below 640 (t04-D3), and Vector's first screen with no button (t08-D7).** These are design choices.
- **Vector's fixed violet-to-pink picture treatment (t08-D3).** It stays with its doubt cell (decision 6).
- **Meridian's and Summit's fourth benefit and reason.** "Match three" changes the copy schema, so it goes in the third paid pass.
- **The other design-level points in docs/template-analysis.md** (a persistent phone ask, Vector asking late). They are outside this brief and listed for the owner.

### Decision 16. Harbor's 12-character limit

**Decided.**

- **Keep 12.** Keeping it changes nothing the copy model reads, so it needs no eval.
- "Raise Harbor's cap" comes off the fix list.
- The phone layout is fixed instead, by sizing the headline to its longest word (decision 15).
- **Harbor's cost** goes through decision 17. Its unreadable answers cost more than its cap misses (2.7).
- **Optional, at Harbor's paid pass:** reword its two guides to "one or two short words", so the purpose matches the limit.

### Decision 17. Unreadable answers

**Decided.** Yes, now, free, for every template's copy call (the brief call uses structured output and had no failures in its 40 calls):

- when an answer does not parse, the eval keeps a bounded copy of its text;
- tests/eval/summary.ts counts an attempt whose answer did not parse (parsed null) as a "not JSON" violation, so it never counts as a fit. Because the rule sits in the summary, re-summarising the stored runs corrects them: their records hold no violation for such answers (tests/eval/pipeline.eval.ts:299-301);
- a unit test passes a broken answer through the noteModelCall mock.

**Re-summarising the stored runs.** The four stored runs are re-summarised for free, so l6 reads 26 of 60 first answers fitted and 32 of 40 in-call retries, not 36 and 34. Part 6 records the correction to ADR 0044:27 and pipeline-quality-plan.md:10.

**When it ships.** Before any paid pass. Pass 1's templates had no unreadable answer in l6, so the Harbor pass is the first that can explain the 14.7% of copy spend.

### Decision 18. The page a visitor gets when the model is refused (added)

**Decided.**

- **The fallback headline.** It never stops mid-phrase or on a joining word. In lib/copy-slots/fit.ts, a cut text ends, in order of preference:
  1. at a sentence end;
  2. just before a colon or semicolon;
  3. at a comma, with the comma removed;
  4. at a word boundary with trailing joining words removed;

  each only while the slot's minimum still holds. The template's fillers complete it as today. fitToSlot serves only the templates' fallback copy, which the copy model never reads.

- **The test.** A unit test runs every branch over the 20 fixtures and over company names of 10, 59, 60, 61 and 80 characters. No headline cut by fitToSlot may end on a joining word (the, a, an, in, on, of, for, and, or, to, with, by, at, from, all, our, your, we, is, are, been, have, has, that, who, which, but, as) or a comma. Harbor's and Vector's fixed line, "What we do, and who it is for", is a whole clause, is not cut, and is exempt.
- **The partial notes.** They drop "to finish on time" and stop saying where the words came from, since Harbor's and Vector's fallback headline is a fixed line.

  | Where                      | New                                      |
  | -------------------------- | ---------------------------------------- |
  | done-copy.ts:116           | "Headlines set simply."                  |
  | done-copy.ts:168           | "Headlines are set simply."              |
  | done-copy.ts:138           | "Some photo spaces left plain."          |
  | done-copy.ts:169           | "Some photo spaces are left plain."      |
  | lib/site.ts:33 (the email) | "Parts of your designs were set simply." |

  This is true whether some or all of the words fell back.

- **Tests and records that change.**
  - **Pins that change.** done-progress.test.ts:105 and :111, and preview-link.test.ts:72.
  - **Pins by import that stay green.** preview-link.test.ts:73-76, e2e/brief-done.spec.ts:181-186, e2e/brief-hub.spec.ts:111-115, and the copy rules through copy-corpus.ts.
  - **Comments.** The comments at done-copy.ts:111 and lib/site.ts:30-32 change.
  - **Records.** ADR 0015 decision 5 (as amended by ADR 0037 decision 10) gains an amendment line, and a claims-register row records the notes.
- **Searches after an account-level refusal** are decided by decision 7. The owner's checks come before launch (Part 5).

### Decision 19. Phone first, and every width (added)

**Decided.** Part 3's check standard applies to every Phase 2 change: 390 first, then 320, 360, 768, 1024, 1280, 1440 and 1920, each breakpoint the change touches at ±1 px, and 844x390, in all four looks' fonts.

**Picture labels.** First-picture labels are taken in their slot at 390 and at 1440, and at 1440 only where the slot is not drawn at 390 (Atlas's first picture, below 640). Monolith's and Vector's first pictures are not on the first screen, so the page is scrolled to them.

### Decision 20. A label-free scorecard and checks (added)

**Decided.** Part 3's tooling pull request builds the checks and the scorecard, and merges before the template pull requests.

- **Detectors.** They are frozen and listed with their blind spots.
- **Where they run.** The stored runs are git-ignored, so the full set runs locally, after every pull request and every paid pass, and each pull request reports its numbers. CI guards text fit through the committed stored answers.

### Decision 21. Ship order and pull request size (added)

**Decided.**

- **The pull requests.** The tooling pull request first. Then one per template, the Ember and Summit hero treatment on its own, the preview chrome, the site wording and the picture rules (Part 3).
- **Shared files.** Each pull request touches only its own template's folder, apart from what Part 3 names. Where two share lines (Part 3, Ordering), the later one rebases.
- **This pull request** carries everything shared: ADR 0048, the "Amended by" lines of the ADRs it amends, the port ADRs' amendments and the porting guide's amendment. The porting guide now says to replace a source's trade icons, anchors and placeholders, to keep readable text off alpha shades, and to check text fit, words over pictures and contrast at the page a visitor gets.
- **Dropping a commit.** Pull requests land as single squashed commits, so a disputed commit is dropped from its branch, or moved to a pull request of its own, before the rest merges.
- **Migrations.** None is planned: Phase 3 records the chosen design in the owner's note, decision 3 keeps its rules and labels with the date each took effect, and decision 8's count reads the submission table directly. Any future migration is applied to production's database before the pull request that reads it merges, as a checklist line on that pull request (RSK-7).

### Decision 22. The studio bar stays reachable (added)

**Decided.** On the visitor's page, the fixed headers of Ember, Harbor, Summit and Vector, and their full-screen sheets, start below the studio bar while any of it is on screen. The bar keeps scrolling away with the page, as designed.

- **How.** A small script on the preview page sets the visible height of the bar as a variable, and those templates read it, falling back to 0. /examples and the development route keep their headers at the top.
- **Check.** At scroll 0, 20 and 40, a pointer at each studio link reaches the link (0 of 540 today), the template's header is whole below the bar, and the header sits at the top once the bar has scrolled away.
- **Development route.** It can draw the studio bar, so decision 7's header checks run on the geometry a visitor gets.

**Why.** "Book a 20-minute call" is the studio's most valuable link, and on half the designs a visitor opens it cannot be reached (CRS-1). Making the bar sticky was weighed and not chosen: it would cover the sticky headers of Aurora, Monolith and Meridian, and keep 56 px of every phone screen.

### Decision 23. The visitor's logo is always visible (added)

**Decided.** When a dark logo meets a dark page, the logo sits on a plate of the light scheme's surface, in the header and the footer of every template. Over a hero picture the header zone takes a surface-coloured veil (decision 7).

- **How.** The logo's polarity is passed to the templates with the logo, which has no polarity today (lib/copy-slots/assets.ts:18-20). Vector's pill becomes that plate.
- **Check.** Stand-in image logos, each a uniform mark, in every template's header and footer, at 3:1. L* is CIE lightness scaled 0 to 1, and the logo stage calls artwork below 0.35 dark and above 0.65 light (lib/config.ts:51-52; lib/logo/polarity.ts:32-34).
  - Dark artwork, black and L* 0.34: on the light scheme, and on the dark look on the plate.
  - Light artwork, white and L* 0.66: on the dark scheme. It never gets the light scheme (lib/tokens/scheme.ts:8-11), so it is not tested there.
- **Mixed artwork** (L* 0.35 to 0.65) gets the light scheme, or the dark look when it is chosen. It is measured with stand-ins at L* 0.35, 0.5 and 0.65 in the header, the footer and the hero's header zone, and reported, not gated. No one background serves the whole band: an L* 0.65 mark sits at about 2.6:1 on the light surface and an L* 0.35 one at about 2.5:1 on the dark, and real mixed artwork is often two-toned. Part 5 gives the owner the numbers.

**Why.** The dark look already wins over the logo's artwork (ADR 0010). A plate keeps both of the visitor's choices: the look they chose and the logo they gave. It also keeps /start's promise of "a background that suits it" true, with no change to the questionnaire (CRS-6).

## Part 5. What only the owner can do

**Now:**

1. **Production's keys (decision 10).** These are outside the repository and its placeholder keys, so only the owner can read them.
   - **In the Anthropic console:** which organisation and workspace production's ANTHROPIC_API_KEY belongs to, that workspace's monthly limit, and the organisation's month-to-date spend. A limit on production's workspace is not enough on its own: every workspace in the organisation shares its $30 monthly limit. Recommended: give the eval key a workspace of its own with a monthly spend limit.
   - **In the Vercel project's Production environment variables:** whether ANTHROPIC_WORKSPACE_ID is set, if production's key needs it (lib/ai/client.ts:13-15).
   - **Pexels:** whether production's PEXELS_API_KEY is the eval's.

   **Answered on 2 October 2026:** $11.44 is available on the console, ANTHROPIC_WORKSPACE_ID is set on Vercel, and production's Pexels key is the eval's. The owner said to go ahead, so passes 1 to 4 run now within their caps (decision 10).

2. **Merge the pull requests.** Each lands as one squashed commit. To drop part of one, name the commit in a review comment and it is removed before merge. Two commits are flagged for this: the ask rule's mail to the page's own address (decision 15) and the stock fill for the slots a visitor's own photographs leave (decision 7a).
3. **Optional labelling,** once the sheet exists. The core round is about 70 minutes, an estimate, and the first ten pages are timed. The picture samples (about 70 minutes more) and Phase 4's after-round (about 8 minutes per 100 pictures) are optional.

**Before each paid pass:** read the organisation's month-to-date spend, and give the go-ahead on the pass's row of decision 10's table (brief:20).

**As Phase 4 reaches the first picture (decision 8):**

- before slot 0 switches to "never unjudged", choose between a designed empty poster and a neutral one;
- once the /admin count ships, read its share of designs with no first picture each month.

**Before launch, outside this brief:**

- **Money and limits.**
  - Raise the organisation's monthly limit, or move production's key to an organisation of its own.
  - Ask Pexels for a higher limit.
  - Decide whether to add a site-wide daily cap on submissions and, if so, what the capped state says. Today one IP address with enough email addresses can start 120 a day, about $16 (lib/config.ts:27-29).
- **Wording.**
  - Settle the claims register's "A person designs every layout" (docs/claims-register.md:19).
  - Reword /start's send-step lines, which promise three designs to an address on its third visit (start-copy.ts:98-99).
  - Confirm that PRODUCT.md:41's "no stock photographs of generic people" covers the studio's own pages and not the tasters.
- **Pictures and the designs page.**
  - Say whether own photographs may be placed differently (brief:212). Renders of the poster and the 390 and 1440 first screens are provided when the stock fill ships.
  - Say whether the designs page should draw dark-look posters dark (CRS-10).
  - Read the mixed-artwork logo ratios on the preview chrome pull request, and say whether mixed logos get a plate (decision 23).
  - Consider the design points in docs/template-analysis.md this brief does not cover: a persistent phone ask, and Vector asking late.

**With the category step:**

- Write about 36 one-liners, about five per row, kept outside the repository.
- Re-check the rows at 30 real briefs.
- Note at each call which design the visitor chose.

Every decision above can be overruled on its pull request. A change there replaces the decision here.

## Part 6. Corrections

The plan is kept as written, as the Phase 1 record. Read it with these corrections:

1. **Part 1 summary (plan:69-75).** Phase 2's fix pull request waited for decisions 1 and 15 only (plan:81, :272). The summary at plan:69 also gated it on decisions 2, 10 and 11 and the /admin count. All are now made, and the /admin count blocks nothing.
2. **Decision 5 (plan:146).** "The cause is the sentence" holds for variable-length lists only. The fixed-four structures pad for everyone.
3. **Decision 16 (plan:298-299) and t06-D7 (plan:648).**
   - The 12-character cap explains $0.100 of Harbor's $0.428 l6 copy spend, and unreadable answers $0.157.
   - The cap was missed in 4 of 17 calls, not on every attempt, and by 3 to 6 characters in the gardens fixture.
   - plan:299 is wrong that keeping the cap needs an eval.
4. **Photograph plan (plan:1250).** In l6 the second hero query ran in all 7 pools whose first search failed, and 3 more times in l7. It supplied candidates in 2 pools and a usable picture in 1; 5 pools ended empty.
5. **Photograph cost (plan:1216-1221).** The second crop (class 10's included), the people field and judge-written alt all add cost. The decided spec is a median of about +$0.06 and at most about +$0.09 a submission, crop tokens unmeasured (decision 10).
6. **Row F (plan:36, :331, :362).** Four of the five software clients are brands of one group (the 10XU group: app/_components/work-items.ts:26; docs/home-page-content-plan.md:335), so the band holds three client relationships, two of them software.
7. **Frequencies (plan:44-47).** The pages counted are 10 Summit, 7 Ember and 5 Harbor fixtures across four runs, fallback pages included. The icons are hard-coded, so they appear on every page.
8. **The shortfall (plan:1007).** A category change cannot cause a shortfall while every row keeps six eligible templates. Shortfalls need a ninth ready template and a third visit, or a row left with fewer than six.
9. **The /start lines (plan:1016).** These are read by every visitor at the fifth question, not only by returning ones.
10. **The legibility prototype (plan:1288-1300).**
    - It checked the heading box at 3:1 only, so its 2 of 10 and 1 of 15 were upper bounds. With measured boxes and every text item, both are 0.
    - Its Harbor row (plan:1294, 9 of 9) is also wrong: Harbor's own treatment passes 0 of 9, and its faded hero text fails with no picture.
11. **The 32 copy-free fixes.** 22 change what is drawn (20 at phone width), 2 change only what a screen reader or tooltip says, and 8 change only an address or a form field's name. A 33rd, the address half of t04-L1 (Atlas's #tools becoming #approach), also changes only an address.
12. **Five more plan statements.**
    - plan:278 lists t01-D3 and t02-D4 as ready copy-free fixes, though neither has a target (decision 15).
    - plan:283's URL defects cannot happen on a visitor's page.
    - plan:287's t07-D7 is now measured.
    - plan:386's "record unlisted separately" is not possible with rules (decision 2).
    - plan:934's "/admin can only show what is stored" does not hold for a category worked out from the stored sentence (decision 3).
13. **Ember's About picture (plan:1148).** It is not a tall slot at 1440 (387x326, records.md:1938).
14. **ADR 0044:27 and docs/pipeline-quality-plan.md:10.** "First copy answers fit 36 of 60; 34 of 40 in-call retries fitted" counted unreadable answers as fits; the real figures are 26 of 60 and 32 of 40 (decision 17).
15. **t01-D2 (records.md:159).** The 435 px phone shots come from Aurora's header ask showing on phones (a template defect), not from the eval alone.
16. **ADR 0044:27 and docs/pipeline-quality-plan.md:47.** Harbor's cost comes more from unreadable answers ($0.157) than from cap misses ($0.100, in 4 of 17 calls), and the cap was not missed "on every attempt" (section 2.7).
