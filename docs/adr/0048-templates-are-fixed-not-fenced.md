# Templates are fixed, not fenced

- Status: accepted, 2 October 2026, by the owner's delegation ("make the decisions for me", after
  a senior review of the plan); each decision can be overruled on the pull request that carries it
- Date: 2 October 2026
- Amends: ADR 0010 (a dark logo on the dark look sits on a plate, so both of the visitor's choices
  stand); ADR 0012 and ADR 0017 (pictures: a rule that can remove a picture ships only after its
  fallback exists; ADR 0017's different-pictures rule stays); ADR 0038 and ADR 0043 (the shortfall
  question moves to the visit-cap work, and a CI minimum guards it until then); ADR 0044 (paid
  passes run one change at a time, each capped; its "36 of 60 first answers fitted" counted
  unreadable answers as fits and is 26 of 60). Each carries an "Amended by" line from this pull
  request. ADR 0015 decision 5, as amended by ADR 0037 decision 10, is amended in the site-wording
  pull request (the partial notes drop "to finish on time"). The port ADRs (0008, 0023, 0027, 0028,
  0029, 0030) and docs/template-porting-guide.md are amended in the same pull request as this ADR.
  docs/pipeline-plan.md:11 ("No AI call ever picks a template") stays true; its line 284 is
  amended to Rule P when the photograph pull request ships.

## Context

The owner asked for templates that fit each visitor's kind of business and for stock photographs
that are checked against their slot (docs/template-fit-brief.md). Phase 1 (docs/template-fit-plan.md,
PR #55) found that the templates are multi-purpose:

- every one of the 60 stored pairs was outside the template's source;
- the copy model filled each structure with the business's own offerings;
- what made pages look wrong was leftovers from the source sites (icons, field names,
  placeholders, guide words), not structures;
- no structure was shown to clash with any kind of business.

The owner then delegated the plan's decisions, asking first for a senior review of its
shortcomings against the goal of the best possible website for every visitor. The review ran in
five rounds: six reviewers, a checker for each finding, two critics, a five-reviewer red team on
the first draft and two checkers on the rewrite (docs/template-fit-decisions.md, Part 2). It found
that the plan had missed or
scheduled last the worst things a visitor sees:

- unreadable words over Ember's, Summit's and Harbor's hero photographs;
- a studio bar that four templates' headers cover, so "Book a 20-minute call" cannot be tapped
  on half the designs shown;
- text and header controls that break on phones and tablets;
- an Atlas menu that cannot be used;
- faint text below WCAG AA;
- a visitor's dark logo vanishing on the dark look.

It also found that the plan judged pages at desktop width although visitors arrive mostly on a
phone, and that it planned machinery that could never change a visitor's page: a shortfall path
that eight ready templates and a minimum of six make unreachable, a migration for a category that
can be worked out from the stored sentence, and tiers that return today's choice until a label
exists. Its photograph rules would have emptied pages before any fallback was designed. And it
never described the page a refused model produces, the worst page a visitor can get.

## Decision

The decisions, with their evidence, are in docs/template-fit-decisions.md, Part 4. In short:

1. **Fix, do not fence.**
   - No template is kept from any kind of business because of a leftover.
   - The 32 copy-free leftover fixes, the address half of t04-L1 and the 2 fallback-only fixes ship
     now, element by element, with stand-ins from each template's own vocabulary: numerals only for
     ordered items (or kept as faint decoration where the source drew them so), one neutral mark
     for unordered ones, nothing where a mark has no job.
   - /examples changes with them.
   - A copy key is renamed only alongside a paid pass, with a read-side alias so stored designs
     keep rendering.
2. **Visible defects first, measured by code.**
   - Phase 2 ships a tooling pull request with the checks, one copy-free pull request per
     template, the Ember and Summit hero treatment on its own, the preview chrome, the site
     wording and picture rules that need no model change.
   - Text fit, header fit and words over pictures are checked at 390 first, then 320, 360, 768,
     1024, 1280, 1440 and 1920, each touched breakpoint at ±1 px and a phone held sideways, in all
     four looks' fonts, with synthetic long words and names. Contrast and the studio bar are
     checked at 390 and 1440.
3. **Words over a photograph pass over any picture.**
   - Every text item over a picture meets WCAG AA over pure white and pure black under its box,
     in both schemes, with the header at the top and scrolled.
   - The visitor's logo stays visible.
   - The treatment that keeps most of today's look and passes is chosen, within capped strengths.
     If none passes, the best one ships and its failing cases are listed.
4. **The studio bar stays reachable, and the visitor's logo stays visible on every scheme.**
5. **No machinery before it can change a pick.**
   - No shortfall path, status, migration or new public words: while every row keeps six eligible
     templates, no visit can fall short.
   - The category comes from fixed rules over the sentence and the company name, worked out in the
     select step and logged with its rule and label versions. It is never stored and never comes
     from a model. The rules and labels keep the date each version took effect, so the row that
     chose any kept brief's designs can be worked out again.
   - Suits first switches on per row only once the rules meet their targets on withheld sentences
     and that row's labels hold on two agreeing fixtures.
6. **Photograph rules in a safe order.**
   - Designed empty states for every slot class come first, then saved and capped search and rank
     steps, then "never unjudged" one slot class at a time, then class-aware judging, then a floor
     calibrated on the owner's labels, then crop and pixel filters with their matching searches.
     An optional after-round of the owner's labels measures acceptance before and after.
   - No approved picture set for now.
7. **Money.**
   - No paid call before the owner reads production's key settings. On 2 October 2026 the owner
     did, and gave the go-ahead with $11.44 available: passes 1 to 4 run now, one at a time within
     their caps ($4.81 in all), leaving at least $6.63 for production. Passes 5 and 6 wait for
     November.
   - Before each pass the owner reads the month's spend and gives the go-ahead. A pass starts only
     if that spend plus its cap leaves $10 of the limit: at most $20 of today's $30.
   - November's evals are capped at $7.50, a pass at a time.
8. **The refused-model page is fixed in words now:** no headline cut mid-phrase, and no partial note
   that gives a false reason.

## Consequences

- **Pull requests from origin/main, each with before-and-after renders and checks:**
  - eval and review tooling first;
  - Harbor, Atlas, Ember, Summit, Monolith, Aurora, Meridian and Vector;
  - the Ember and Summit hero treatment;
  - the preview chrome (the studio bar and the logo);
  - the site wording;
  - the picture rules.

  The labelling sheet is rendered after the template pull requests merge.

- **Not built now:** the category step, the tiers, the fit data types, the lapse test and the range
  assertions. They are built in the pull request that adds the first label able to change a pick.
- **Not built under this ADR:** a shortfall path, which the visit-cap work decides, or a category
  column.
- **The owner's remaining tasks** are in docs/template-fit-decisions.md, Part 5: read production's
  key settings and the month's spend, give each paid pass its go-ahead, merge, and optionally label
  (a core round of about 70 minutes, and picture samples of about 70 minutes more).
- docs/template-fit-plan.md stays as the Phase 1 record; Part 6 of the decisions corrects it and
  ADR 0044's fit figures.
