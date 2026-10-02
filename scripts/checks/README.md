# Template checks

The checks every template change is held to (decisions 9, 19 and 20 in `docs/template-fit-decisions.md`, and the check standard in its Part 3). Each one renders stored model copy as a visitor's page through the development-only routes and measures it in Chromium. Nothing here calls a model or the Pexels API; the stored-picks check reads pictures from Pexels' CDN (images.pexels.com), at most four at a time.

## Running them

Start a dev server of your own, never the owner's on port 3000 (every check refuses it), and point a check at it:

```sh
pnpm exec next dev -p 3120
node scripts/checks/text-fit.mjs --base http://localhost:3120
```

Every check takes the options in `lib/args.mjs`:

| Option                                 | What it does                                                                                                                            |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `--base <url>`                         | the dev server (required)                                                                                                               |
| `--source <list>`                      | where the copy comes from: `corpus` (the committed copy corpus, the default) or `eval:<run>` for a stored run under `test-results/eval` |
| `--templates <list>`, `--names <list>` | only these templates, or these pages (a corpus name, or a run's fixture id)                                                             |
| `--kind <kind>`                        | `model` (stored model answers), `synthetic` (the corpus's answers at the limits) or `all`; each check sets its own default              |
| `--looks <list>`                       | `all` (the four looks' fonts), `own`, or names                                                                                          |
| `--widths <list>`                      | `standard` (390x844, 320, 360, 768, 1024, 1280, 1440, 1920, 844x390), `seams` (639/640, 767, 1023, 1279, 1535/1536), `all`, or sizes    |
| `--limit <n>`                          | at most n pages a template, the longest copy first                                                                                      |
| `--out <dir>`                          | where results go (default `test-results/checks/<check>`)                                                                                |

Each writes `results.json` (every finding) and `summary.txt` (what a pull request quotes).

The pages come from `/dev/copy/<template>/<name>` for the corpus (`tests/fixtures/template-copy`: every l6 and l7 model answer, and synthetic answers with every text slot at its longest, the long real words in every headline and phrase slot, and business names of 10, 16, 40, 60 and 80 characters cut to the brand slots as the pipeline cuts them; `tests/eval/corpus.test.ts` writes and holds them) and from `/dev/eval/<run>/<fixture>/<template>` for a stored run. Both take `?look=`, `?scheme=`, `?pictures=white|black|grey` (every image slot filled with a flat stand-in), `?logo=<fill>` (a stand-in image logo of a CIE lightness, decision 23's marks) and `?email=` (`app/dev/_render/concept.tsx`). `/dev/contract/<template>` gives a template's guide and copy keys.

## The checks

| Check               | What fails                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Started from                                                                                           |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `text-fit.mjs`      | a text clipped by an ancestor that hides its overflow, run past the screen, or a word broken across lines; a header control that wraps inside its link or button, overlaps another, or leaves the screen (the visitor's wordmark may wrap)                                                                                                                                                                                                                                              | review/verify-templates/harbor-measure.cjs, monolith-measure.cjs                                       |
| `over-picture.mjs`  | `--mode worst`: a text on a picture under 4.5:1 (3:1 large) at any pixel of its box, over a pure white and a pure black picture and with none, both schemes, the header at the top and scrolled past its glass threshold, a phone's menu open. `--mode picks`: under 95% of a box's pixels at its level over each stored pick. `--mode pool`: the same over each unrejected candidate of the stored Ember and Summit hero pools. `--mode logos`: a stand-in logo under 3:1 at any pixel | review/photos/measure-hero.cjs, legibility-real.cjs                                                    |
| `contrast.mjs`      | a text under AA over what the page paints under it, all looks and both schemes, 390 and 1440, no pictures; each faded colour class's lowest ratio is listed                                                                                                                                                                                                                                                                                                                             | review/verify-templates/contrast.cjs                                                                   |
| `gradient-text.mjs` | a stop of a gradient text (background-clip: text) under the text's level against any pixel under it, both schemes                                                                                                                                                                                                                                                                                                                                                                       | review2/verify-critic-states/grad-stops.mjs                                                            |
| `behaviour.mjs`     | a form field without its autocomplete token; an ask that does not lead to the closing block, or a closing button that does not mail the page with its label as the subject (or lead to the top with no email); a picture a phone hides that loads with priority there; Ember's picture resting turned; Summit's caption link unseen on keyboard focus; Vector's cursor disc not at opacity 0 under reduced motion                                                                       | review/verify-templates/menu-focus.cjs, a11y-check.cjs; review2/verify-critic-states/vector-cursor.mjs |
| `menus.mjs`         | a menu entry a pointer or Tab cannot reach, a click that does not land, Escape ignored, a phone menu that does not give focus back to its button, a toggle a pointer cannot reach                                                                                                                                                                                                                                                                                                       | review/verify-templates/atlas-menu.cjs, menu-focus.cjs                                                 |
| `layout-shift.mjs`  | layout shift above 0 at 390 with every picture held back 2.5 s                                                                                                                                                                                                                                                                                                                                                                                                                          | review/verify-templates/meridian-cls.cjs                                                               |
| `a11y-names.mjs`    | the shared outline and name rules (one h1 and none before it, no skipped level, no eyebrow or copyright line or paragraph set as a heading, every control named and its name holding a short label's words, no drawing named as an icon, initials in a circle hidden, a letter-by-letter heading read as words) and each template's own expectations                                                                                                                                    | review/verify-templates/a11y-check.cjs                                                                 |
| `leftovers.mjs`     | each decided copy-free leftover drawn, each renamed address or field name still present, each copy-dependent leftover's words on the page, and each guide example or copy-key word echoed in stored copy                                                                                                                                                                                                                                                                                | review/outcome/scorecard.cjs and the fix list                                                          |

## In CI

`e2e/reduced-motion-template-fit.spec.ts` runs the text-fit measure (`lib/text-fit-measure.mjs`) over each template's corpus at 320, 390, 768, 1024 and 1440, in each answer's own look: the three longest stored answers and every synthetic one. The cases that fail on main are listed there as expected failures, each with the template pull request that fixes it; the cases that pass only narrowly (they fail with text about 4% wider, as CI's Linux Chromium sets it), and Aurora's that fail only through its header ask (whose two display classes the dev server's style sheets order either way from one start to the next, t01-D2), are skipped with the same pointer.

## Frozen detectors and their blind spots

These detectors were frozen on 2 October 2026, before the first template pull request (decision 20). A later change to any of them is reported in the pull request that makes it, with what it finds before and after the change, so a pass that comes from a changed detector is visible.

What each one cannot see:

- **Text fit.**
  - Words in a marquee (a box that clips a row of repeated words) and decorative text (`aria-hidden`, such as the footer watermarks) are not measured.
  - A line counts as clipped downward only when its middle is hidden, so a tight row that shaves a few pixels off ascenders or descenders passes.
  - Text clipped by `clip-path` or a mask, and the text inside form fields, are not measured.
  - The header is the first `header`, else `nav`, drawn across the top of the first screen.
  - A business name with nowhere to break may break anywhere (plan 7.7), so its own breaks are not counted.
- **Words over a picture.**
  - The stand-in pictures are flat 3:2 fills; the picks and pool modes serve each picture as a 3:2 centre crop, close to but not exactly the crop a visitor's page makes.
  - A picture a template draws into a canvas through its own treatment (Vector's duotone) is measured as the canvas paints it, not as pure white and black.
  - A text is on a picture when a fifth of a line lies on the picture's box; a text over a smaller part is the contrast check's.
- **Contrast and gradient text.**
  - Each text is judged at the first scroll stop where it is whole on the screen with nothing opaque drawn over it; one never seen so is reported unjudged.
  - Faded text inside an element that has its own background and an opacity is approximated by the text's own opacity.
  - A gradient set on an ancestor, or a mask, is not read as gradient text.
- **Behaviour.** Asks are found by the copy that labels each template's ask slots (`ASKS` in the file), so an ask with other words is not checked; Meridian's, Harbor's, Summit's and Vector's asks are reported but were not decided. Ember's picture is found by `.ember-spin`, Summit's captions by the pictures of its photo cells, and Vector's disc by `.vector-cursor`: a renamed class reads as "not found", never as a pass.
- **Menus.** A menu is one a header or nav button with `aria-expanded` opens; its entries are the links that come into view. A menu opened any other way is not tried.
- **Layout shift.** Pictures are held back; fonts are not, so a font swap's shift is counted.
- **Accessible names and outline.** The expected list is the shared rules plus each template's entry in `EXPECT`; a template whose outline breaks no rule but differs from its design is not caught. Label-in-name is checked for labels of up to five words.
- **Leftovers.**
  - Copy-dependent leftovers are found by fixed text patterns, which miss Summit's t07-L9 (the photo grid's link named for the source's "what they have": "Our Work", "Projects") and any new phrase a guide change brings.
  - Drawn leftovers are found by their classes or icon names, so one redrawn with other classes reads as gone.
  - The echo check leaves out copy-key words that name nothing of a trade (`PLAIN_KEYS`).
