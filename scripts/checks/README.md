# Template checks

The checks every template change is held to (decisions 9, 19, 20 and 22 in `docs/template-fit-decisions.md`, and the check standard in its Part 3). Each one renders stored model copy as a visitor's page through the development-only routes and measures it in Chromium. Nothing here calls a model or the Pexels API; the stored-picks check reads pictures from Pexels' CDN (images.pexels.com), at most four at a time.

## Running them

Start a dev server of your own, never the owner's on port 3000 (every check refuses it), and point a check at it:

```sh
pnpm exec next dev -p 3120
node scripts/checks/text-fit.mjs --base http://localhost:3120
```

`pnpm check:<name>` runs the same (package.json lists one script a check, which is also how Knip knows the files are used).

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
| `--jobs <n>`                           | pages measured at once, where the check says so (two or three by default)                                                               |
| `--out <dir>`                          | where results go (default `test-results/checks/<check>`)                                                                                |

Each writes `results.json` (every finding), `failed.json` and `summary.txt` (what a pull request quotes). A page a check could not measure (a crashed tab, a page that would not load) is tried once more, then listed in `failed.json` and at the foot of the summary, never left out quietly; a browser that has gone is launched again. A server error or no answer at all is asked again for about 70 seconds, since on a busy machine the dev server can fail to start the worker it runs for each request to a route with parameters, answer 500 until it can, or stop.

The pages come from `/dev/copy/<template>/<name>` for the corpus (`tests/fixtures/template-copy`: every l6 and l7 model answer, and synthetic answers with every text slot at its longest, the long real words in every headline and phrase slot, and business names of 10, 16, 40, 60 and 80 characters cut to each brand slot's limit at a word; `tests/eval/corpus.test.ts` writes and holds them) and from `/dev/eval/<run>/<fixture>/<template>` for a stored run. Both take (`app/dev/_render/concept.tsx`):

- `?look=` and `?scheme=`;
- `?pictures=white|black|grey`: every image slot filled with a flat stand-in;
- `?logo=<fill>`: a stand-in image logo of a CIE lightness, decision 23's marks, each the artwork its name says when the logo stage reads it (`app/dev/_render/stand-in.test.ts`);
- `?email=`;
- `?bar=1`: the studio bar above the page, as the preview page draws a design (decision 22);
- `?probe=<path>,<path>`: the copy's text at each path replaced by a marker, `Probe 01`, `Probe 02`, so a check can find the link a copy slot labels.

`/dev/contract/<template>` gives a template's guide and copy keys.

Beside each template's corpus, `_expected.json` holds what the checks expect of it on main: the CI guard's text-fit cases that fail and those it skips, with why, and the template's outline, each block by its address and the heading level it opens with. The template's own pull request edits that file, and only its own: a case its fix makes pass leaves the failing list, and an address it renames is renamed there.

## The checks

| Check               | What fails                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Started from                                                                                           |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `text-fit.mjs`      | a text clipped by an ancestor that hides its overflow, run past the screen, or a word broken across lines; a header control that wraps inside its link or button, overlaps another, or leaves the screen (the visitor's wordmark may wrap: the control that shows the copy's brand name or the company name, else the one holding the logo, else the link home)                                                                                                                                | review/verify-templates/harbor-measure.cjs, monolith-measure.cjs                                       |
| `over-picture.mjs`  | `--mode worst`: a text on a picture under 4.5:1 (3:1 large) at any pixel of its box, over a pure white and a pure black picture and with none, both schemes, the header at the top and scrolled past its glass threshold, a phone's menu open. `--mode picks`: under 95% of a box's pixels at its level over each stored pick. `--mode pool`: the same over each unrejected candidate of the stored Ember and Summit hero pools. `--mode logos`: a stand-in logo under 3:1 at any pixel        | review/photos/measure-hero.cjs, legibility-real.cjs                                                    |
| `contrast.mjs`      | a text under AA over what the page paints under it, all looks and both schemes, 390 and 1440, no pictures; each faded colour class's lowest ratio is listed                                                                                                                                                                                                                                                                                                                                    | review/verify-templates/contrast.cjs                                                                   |
| `gradient-text.mjs` | a stop of a gradient text (background-clip: text) under the text's level against any pixel under it, both schemes                                                                                                                                                                                                                                                                                                                                                                              | review2/verify-critic-states/grad-stops.mjs                                                            |
| `behaviour.mjs`     | a form field without its autocomplete token; an ask (found by the copy path that labels it) that does not lead to the closing block, or a closing button outside that block or not mailing the page with its label as the subject (with no email, not leading to the top or its own block); a picture a phone hides that loads with priority there; Ember's picture resting turned; Summit's caption link unseen on keyboard focus; Vector's cursor disc not at opacity 0 under reduced motion | review/verify-templates/menu-focus.cjs, a11y-check.cjs; review2/verify-critic-states/vector-cursor.mjs |
| `menus.mjs`         | a menu entry a pointer or Tab cannot reach, a click that does not land, Escape ignored, a toggle a pointer cannot reach; on the phone menu, focus that does not move into it as it opens (or with the next Tab), does not come back to its button when it shuts without a link followed (Escape, its close button, a press outside), or goes anywhere but the chosen link's target                                                                                                             | review/verify-templates/atlas-menu.cjs, menu-focus.cjs                                                 |
| `studio-bar.mjs`    | under the studio bar at scroll 0, 20 and 40: a studio link a pointer cannot reach at every point of its box, a template header not whole below the bar; once the bar has scrolled away, a header not where it sits without the bar                                                                                                                                                                                                                                                             | review2/verify-critic-states/sb-check.mjs                                                              |
| `layout-shift.mjs`  | layout shift above 0 at 390 with every picture held back 2.5 s                                                                                                                                                                                                                                                                                                                                                                                                                                 | review/verify-templates/meridian-cls.cjs                                                               |
| `a11y-names.mjs`    | the shared outline and name rules (one h1 and none before it, no skipped level, no eyebrow or copyright line or paragraph set as a heading, every control named and its name holding a short label's words, no drawing named as an icon, initials in a circle hidden, a letter-by-letter heading read as words), each template's expected outline (`_expected.json`) and its own expectations of its controls                                                                                  | review/verify-templates/a11y-check.cjs                                                                 |
| `leftovers.mjs`     | each decided copy-free leftover drawn, each renamed address or field name still present, each copy-dependent leftover's words on the page, and each guide example or copy-key word echoed in stored copy                                                                                                                                                                                                                                                                                       | review/outcome/scorecard.cjs and the fix list                                                          |

## In CI

`e2e/reduced-motion-template-fit.spec.ts` runs the text-fit measure (`lib/text-fit-measure.mjs`) over each template's corpus at 320, 390, 768, 1024 and 1440, in each answer's own look: the three longest stored answers and every synthetic one, 90 seconds a case. Each page's display and body faces are loaded first, by the face's own name; a face that does not load fails the case with its name, never a measure in a fallback face. The cases that fail on main are each template's `textFit.failing` (`_expected.json`), expected failures that template's pull request turns into passes. Its `textFit.unsettled` cases are skipped, with why: those that pass only narrowly (they fail with text 0.03em or 0.05em wider, and CI's Linux Chromium sets text about 4% wider), and Aurora's that fail only through its header ask (whose two display classes the dev server's style sheets order either way from one start to the next, t01-D2).

## Frozen detectors and their blind spots

These detectors were frozen on 2 October 2026, before the first template pull request (decision 20), and frozen again on 3 October 2026, after an independent check found faults and gaps in them (listed below; the tooling pull request's description gives what each change found). A later change to any of them is reported in the pull request that makes it, with what it finds before and after the change, so a pass that comes from a changed detector is visible. An edit to a template's `_expected.json` is such a change, and its pull request says so.

What each one cannot see:

- **Text fit.**
  - Words in a marquee (a box that clips a row of repeated words) and decorative text (`aria-hidden`, such as the footer watermarks) are not measured.
  - A line counts as clipped downward only when its middle is hidden, so a tight row that shaves a few pixels off ascenders or descenders passes.
  - Text clipped by `clip-path` or a mask, and the text inside form fields, are not measured.
  - The header is the first `header`, else `nav`, drawn across the top of the first screen.
  - A business name with nowhere to break may break anywhere (plan 7.7), so its own breaks are not counted.
  - A wordmark that shows neither name in its text, holds no logo image and is not a link home is measured as any other control.
- **Words over a picture.**
  - The stand-in pictures are flat 3:2 fills; the picks and pool modes serve each picture as a 3:2 centre crop, close to but not exactly the crop a visitor's page makes.
  - A picture a template draws into a canvas through its own treatment (Vector's duotone) is measured as the canvas paints it, not as pure white and black.
  - A text is on a picture when a fifth of a line lies on the picture's box; a text over a smaller part is the contrast check's.
  - Transitions are off while it measures, so every colour is read at rest; a text that only a running transition shows is not measured mid-way.
- **Contrast and gradient text.**
  - Each text is judged at the first scroll stop where it is whole on the screen with nothing opaque drawn over it, and nothing fixed or sticky painting over any part of it (its middle and four corners are tried; a fill, a backdrop filter or a background image paints, so a header's empty dropdown frame hanging below it does not); one seen only under a fixed or sticky element, such as a glass header bar, is measured again scrolled to the middle of the screen; one never seen so is reported unjudged. The same holds for the words-over-a-picture check with the header at the top.
  - Faded text inside an element that has its own background and an opacity is approximated by the text's own opacity.
  - A gradient set on an ancestor, or a mask, is not read as gradient text.
  - Colours are read at rest, as above.
- **Behaviour.** Each ask is found by its copy path (`ASKS` in the file): a link a template labels with words of its own, not the copy's, is reported "not drawn" at 1440, never passed. Meridian's, Harbor's, Summit's and Vector's asks are reported but were not decided. Ember's picture is found by `.ember-spin`, Summit's captions by the pictures of its photo cells, and Vector's disc by `.vector-cursor`: a renamed class reads as "not found", never as a pass.
- **Menus.** A menu is one a header or nav button with `aria-expanded` opens; its entries are the links that come into view. A menu opened any other way is not tried. The focus rules are tried on the phone menu only. Focus moving in passes when it lands anywhere in the menu, its close button included, not only on its first link; the menu is the element its button controls, else the smallest box holding every entry. A press outside goes to a point on nothing that acts, and a sheet that covers the screen has no outside. A chosen link is tried with the first entry that leads within the page, from the keyboard.
- **Studio bar.** The dev route draws the bar as the preview page does, from the same component; a script the preview page adds beside the bar, and not inside it, is not drawn here, so the preview chrome's pull request keeps the bar's height script inside it or adds it to the route.
- **Layout shift.** Pictures are held back; fonts are not, so a font swap's shift is counted.
- **Accessible names and outline.** The expected outline names each block's first heading, not the headings within it, which the shared rules hold. Label-in-name is checked for labels of up to five words.
- **Leftovers.**
  - Copy-dependent leftovers are found by fixed text patterns, which miss Summit's t07-L9 (the photo grid's link named for the source's "what they have": "Our Work", "Projects") and any new phrase a guide change brings.
  - Drawn leftovers are found by their classes or icon names, so one redrawn with other classes reads as gone.
  - The echo check leaves out copy-key words that name nothing of a trade (`PLAIN_KEYS`).

### Changed after the first freeze, on 3 October 2026

Each change below was made before any template pull request merged. What each found before and after it, on main, is in the tooling pull request's description.

- **Pixels read at rest.** The pixel checks (over-picture, contrast, gradient text) turn transitions off for the whole measurement. Before, a text with a colour transition faded back in after each screenshot with its glyphs hidden, and was read mid-fade.
- **The wordmark is the brand name.** Text fit found the visitor's wordmark by the company name's first 16 characters, so a wordmark showing the copy's own brand name (a shortened name, a synthetic answer's) was measured as a header control that must not wrap.
- **The asks rule as decided.** Atlas's closing block is its foot's note at `#contact`, with its pitch's button one more ask; a closing button with no email may lead to its own block; asks are found by copy path, not by their words.
- **The phone menu's focus rules** (moving in, coming back, following a chosen link) were added; a menu a press outside leaves open is noted, not failed. The studio-bar check was added, with the route's `?bar=1`.
- **A crash costs one page, not a run**, and a page settles without waiting on an animation driven by scrolling.
- **The over-picture check finds an open phone menu's button by a mark**, so a menu that Escape leaves open (Atlas's on main) is shut and measured, not lost to a timeout.
- **Each template's expected outline** was added to the accessible-names check, and the mixed stand-in logos moved inside the mixed band.

### Changed on 4 October 2026

Blind spots the template checks of 3 and 4 October found. What each found before and after it, on main's corpus, template by template, is in the pull request's description.

- **Fonts load by the face's own name, and a face that does not load fails by name.** `loadFonts` asked for next/font's whole family list, which goes on to a fallback drawn from a local font (Arial or Times New Roman). Linux lacks those, so on CI's runner every load failed with "NetworkError: A network error occurred." and all 69 cases of the CI text-fit guard failed before measuring anything. It now asks for the face the list names first (as `app/start/_components/draft/load-faces.ts` does), at 400 and 700, and throws naming each face and weight that did not load or that no `@font-face` answers for, and when no element sets the look's faces, so nothing is measured in a face the page does not use.
- **A background clipped to text in every layer is gradient text.** The computed `background-clip` is a list, one entry a background layer, and only `text` was matched, so Monolith's lit headline words (`text, text`, two layers) were read as solid text: the contrast check judged their transparent colour at 1:1, the gradient-text check skipped them, and the pixel checks did not hide them before reading the pixels under other text. A gradient text's colours are now read layer by layer, as they are painted: a layer whose stops are all opaque hides the layers under it, one whose stops are all clear shows them, and a part-clear layer's stops are laid over each colour under them (Monolith's lit words lay an opaque layer over the glow's on a light page and a clear one on a dark page, so judging every stop of both layers failed both schemes on stops no visitor sees).
- **Aurora's window dots (t01-L1) are the window's row.** The selector matched the wordmark's single point (`templates/t01-aurora/sections/logo.tsx`), so the leftover read as drawn on every page; it now matches the dots that sit in a row of them, in the product frame's title bar.
- **A text under a fixed or sticky element is measured again.** At 320x568, a text just below one scroll stop's fold lay under the fixed glass header bar at the next, and as the bar's fill is clear the text counted as uncovered and was read through the bar at about 1:1 (Harbor's "Get in touch" on l6-gardens, Ember's and Summit's synthetic-long-words, Summit's photo captions). Such a text, under a fixed or sticky element that paints where it lies (a fill, a backdrop filter or a background image), is now skipped at that stop and re-measured scrolled to the middle of the screen, or reported unjudged if it is never seen clear; this changes the contrast and gradient-text checks the same way.
