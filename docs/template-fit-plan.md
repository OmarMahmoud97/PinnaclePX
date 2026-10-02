# Template fit plan: Phase 1, evidence and options

Written 2 October 2026 on branch docs/template-fit-plan, cut from origin/main at b711770. This is Phase 1 of the brief in [template-fit-brief.md](template-fit-brief.md). It changes no code. It ends with the owner's decisions; Phase 2 waits for them.

How to read it:

- **Part 1** is for the owner: a one-page summary and the decisions, each with options, evidence, a recommendation and the phase it blocks.
- **Part 2** is the evidence for each template: its fit record, the measured slot geometry and the renders.
- **Part 3** puts the templates against kinds of business: the proposed categories, the fix list, the clash table, the pools and visits, and the variety simulation.
- **Part 4** has the options behind decisions 3, 4 and 7, the selection simulator, and the size and price of Phase 2.

Words follow the brief: the owner is the studio owner, the visitor is the person who fills in /start, a leftover [R] is something kept from a template's source that can be fixed without changing the layout, and a structure [S] is part of a section's shape that needs certain content. A fixture is one of the 20 invented test businesses. The copy model is the AI model that writes each design's words. An eval is a paid test run of the pipeline on the fixtures, and l6 (l6-all-fixes) is the last full one, covering all 20 fixtures; l7-sentence later re-ran 10 of them. A fallback page uses a template's default words because the copy model's answer failed. Nothing here is an owner label: every "suits", "doubt" or category assignment is a proposal.

Evidence files (scripts, raw measurements, counts) are in the git-ignored folder test-results/template-fit/ of the ../PinnaclePX-fit worktree. Paths written as "scratchpad" below refer to that folder. The renders are committed in [template-fit/renders/](template-fit/renders/).

## Part 1. For the owner

### Summary for the owner

This covers the eight ready templates, read against the evidence in this plan. That evidence is 60 stored pairs of a template and a fixture, with words written by the copy model for 59 of them in the last full test run (l6), plus measured picture slots and nine renders. Rows A to F and U are the provisional categories (see Categories): A work done at the customer's home or site, B appointments and sessions with a person, C things made or sold, D advice and business services, E creative and design work, F apps, software and online products, U unclear. The owner has given no labels yet, so everything below is evidence or a proposal.

**What the evidence shows about each template's range**

| Template | Test pages with written copy, by row (last full test run)      | What the stored copy shows                                                                                               | Rows in doubt (the structure in question)                                      | Leftovers that read wrong        |
| -------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | -------------------------------- |
| Aurora   | A2 B2 C3 E1 (D: the HR firm's page fell back to default words) | Every business put its own offerings in the panel (12 of 12). 4 of 12 drifted into stages the sentence never stated      | B, D, E (the panel's three short lines)                                        | 6, all for A to E                |
| Monolith | A3 B3 C1 D1                                                    | The businesses' own jobs, places and treatments. A fourth step was added in 12 of 12                                     | C (three services that must differ from the features)                          | 9, every row                     |
| Meridian | A3 B1 D2 E2                                                    | Offerings in the menu and form subjects (13 of 13), and in most labels and features. A fourth benefit in 13 of 13        | none                                                                           | 5: 4 every row, 1 for A to E     |
| Atlas    | A2 D2 E1                                                       | The businesses' own offerings. Four sets of three repeat word for word in 5 of 8                                         | none                                                                           | 2: 1 every row, 1 for A to E     |
| Ember    | A2 B3 D2                                                       | Its own offerings in the grid; padded where the sentence named fewer than four, and once for the longest (9 of 40 items) | D, F (a picture for each offering; a full-screen photo behind the headline)    | 4, by row, none for C            |
| Harbor   | A2 B1 D1 E1                                                    | Its own offerings on the cards for 4 of 5 businesses                                                                     | none                                                                           | 6, every row                     |
| Summit   | A3 B1 C2 D3 E1                                                 | Its own offerings on the cards. A fourth reason in 22 of 22                                                              | C, D, E, F (four photographed subjects; a form asking for a person and a date) | 7: 2 every row, 5 by row         |
| Vector   | A1 B4 C3                                                       | Items were offerings, facts or formats, never invented projects (25 of 25)                                               | C, D, F (items that open full screen; pictures recoloured to two tones)        | 4: 1 every row, 3 for B, C, D, F |

- **No clashes shown.** No structure was shown to clash with any row. The strains come from two places. Some come from the brief's fixed three points, three steps and one statement, so they are universal. Others come from short sentences, so they are sentence-level. Thirteen template-and-row cells are in doubt. The 8 that already have test pages are labelled in the first round, with the other stored pages. The other 5 have no page until paid copy is written for them ($0.18).
- **Row F is untested.** Row F has no fixture, so every template is unjudged there. Yet five of the six clients in the home page's work band are apps or software (app/_components/work-items.ts).
- **Two slot-0 pictures barely show.** Slot 0 is the picture the poster shows.
  - Aurora's slot 0 shows 7% to 23% of a 3:2 photograph below 1024 px.
  - Atlas's slot 0 is not drawn below 640 px (Measured slot geometry).

**What the leftovers cost today**

- **How many.** 98 leftovers are recorded: 97 in the fit records and 1 added here. 43 of them reach a page whose words the copy model wrote, and read wrong there for at least one row. 23 of those 43 read wrong for every row. Two more read wrong only on fallback pages: Aurora's "Overview" heading and Vector's "Work" labels (t01-L8, t08-L7). Both are copy-free.
- **Every stored page with written copy shows one.** Each carries at least one leftover that reads wrong for that business. Examples:
  - Summit's medical icons appear on all 36 stored Summit pages.
  - Ember's chef's hat appears on all 24 stored Ember pages.
  - Harbor's dumbbell appears on all 17 stored Harbor pages.
  - Vector's name is lower-cased in 25 of 25 answers.
  - Monolith's step headings are read aloud as "Free Icons ...".
  - Meridian's form shows a stranger's name and email address.
- **Keeping templates away from rows until their leftovers are fixed (routing) empties the pools.** A row's pool is the set of templates it may be shown. A visit shows three designs, so a pool of three to five fills one visit and six or more fill two.
  - Routing only on the leftovers that read wrong for some rows, the pools fall to A3 B3 C3 D2 E3 F5 U2. No row keeps two visits, and D and U cannot fill even one.
    - This leaves Ember only in C, Summit only in B, and Aurora, Meridian and Atlas only in F. C, B and F hold the source kinds of Ember, Summit, Aurora and Meridian, which is the typecasting the brief warns against.
  - Routing on every leftover, each row keeps 0 or 1 template.
- **Fixing them is mostly free.**
  - 32 of the 43 are copy-free: they change nothing the copy model reads, so they can ship in Phase 2 with no paid call. They are the 28 marked "No" in the fix list's copy model column, plus four more: Atlas's "More" links, which simply stop being drawn (t04-L3), and three web-address changes that keep the names the copy model reads (t07-L3, t07-L4 and t08-L5).
  - 1 is partly copy-free: Atlas's #tools web address (t04-L1). Its address change is free, but its "Our tools" labels go only when the name the copy model reads is renamed, which needs an eval.
  - 10 change what the copy model reads, and so need an eval. Two of them, Harbor's footer news field and its "Privacy · Terms" small print (t06-L12, t06-L13), could instead be dropped from the page, which changes the design.
- **Measuring the copy changes.** Measuring all 39 recorded leftovers whose fixes change what the copy model reads (the 10 above, plus the 1 partly copy-free, plus ones that read wrong for no row but still shape the words) means re-writing copy for the 60 stored l6 pairs. That costs about $2.33 (estimate), which is more than the roughly $2 left this month.

**The three decisions that matter most**

1. **Decision 1.** Fix leftovers rather than route on them. Approve the 32 copy-free fixes element by element so they can ship first in Phase 2.
2. **Decisions 2 and 6.** Approve the rows (A to F plus unclear) and a clash table (which templates cannot honestly serve which rows) with no clash today. Label the 8 doubt cells that already have test pages first; the other 5 need paid copy first ($0.18 on their own, or within the $0.73 set below). Please also send the /admin count of real briefs, which the row list needs.
3. **Decision 4.** Set a minimum of six eligible templates per row, enforced by a test, and give "fewer designs, with true words" when too few fit. If every doubt became a clash, rows C, D and F would fall to one visit, and in row D the second visit would get one design.

**What happens next**

- The owner answers the decisions that block Phase 2 (1, 2, 10, 11 and 15) and sends the /admin count.
- Phase 2 then starts from origin/main:
  - the pull request with the copy-free fixes;
  - a development-only page that draws any template with any fixture;
  - 131 free test pages, drawn from stored copy;
  - the labelling sheet. That is about 3.4 hours of the owner's labelling at the mid estimate.
- Then, only on an approved budget, paid copy for the 18 empty cells (10 on existing fixtures, 8 on a new app business): $0.73 estimated, capped at $1.00. Phase 2 then stops for the owner's labels.

### Decisions for the owner

Each decision gives its options, the evidence, a recommendation and the phase it blocks. "Free now" says whether work may go ahead on the recommendation as free, reversible work.

**1. Leftover fixes, /examples, routing and Meridian's defects.** Blocks Phase 2's fix pull request. Routing blocks Phase 3.

- **Options:**
  - approve fixes element by element;
  - also keep templates away from rows their leftovers read wrong for until the fixes ship: (a) only for leftovers that read wrong for some rows, or (b) for every leftover;
  - for /examples: keep the source's elements through the example content, or change both.
- **Evidence:** Fix list; Pools and visits (routing (a) leaves A3 B3 C3 D2 E3 F5 U2 templates per row, and routing (b) leaves 0 or 1); Renders.
- **Recommendation:**
  - Approve the 32 fixes that change nothing the copy model reads, so they need no paid test run, for Phase 2's first pull request:
    - Aurora's app-window dots, progress bars, row dots, title bar, selected menu item and toggles (t01-L1 to L6);
    - Monolith's icons, its hidden "Free Icons" and "Menu Icon" labels, and its #cta web address (t02-L1 to L7, L9);
    - Meridian's icons, and the stranger's name and email in its form (t03-L1, L2, L3, L4, L7);
    - Atlas's "More" links beside each column, which stop being drawn (t04-L3);
    - Ember's chef's hat, leaf and heart icons, and its #dishes, #timing and #booking-process web addresses (t05-L1, L3);
    - Harbor's gym icons, its "John Doe" placeholders and its #metrics web address (t06-L1, L4, L6);
    - Summit's medical and calendar icons, its booking and facilities web addresses, and its doctor and department form fields (t07-L1 to L6). For the addresses (t07-L3, L4), only the address changes; the names the copy model reads stay;
    - Vector's #projects web address (t08-L5). Only the address changes; the names the copy model reads stay.
  - Approve the two copy-free fixes that show only on fallback pages in the same pull request: Aurora's "Overview" heading and Vector's "Work" labels (t01-L8, t08-L7).
  - Do not route on leftovers.
  - Let /examples keep the source's elements wherever they come from example content. Record in each port ADR where a hard-coded element changes there too. Not verified: how `pnpm template:compare` scores those regions.
  - For Meridian, fix the mail subject that always reads "Send message", the wrong heading levels and the unused markup (t03-D1, D2, D4). Measure whether its fixed 1200×1200 picture box makes the page jump before fixing that (t03-D3).
- **Free now:** no for shipping, because each fix changes what a template draws. Yes for scratch before-and-after renders.

**2. Categories, clash table, labels and lapse.** Blocks Phase 2 (sheet rows and fixture categories).

- **Options:** rows A to F plus U, described by presumptions, with example trades; a plain list of 26 trades; or both. Unlisted kinds go to U, or get rows of their own. Labels lapse automatically, or by hand.
- **Evidence:** Categories; The size of Phase 2 (48 against 208 labels; 149 against 282 pages; 4.1 against 8.9 hours at the mid estimate); Clash table.
- **Recommendation:**
  - The mix: rows A to F plus U, described by presumptions, with example trades.
  - Unlisted kinds get the U pool and are recorded as "unlisted".
  - Labels lapse automatically, with a test that fails when a cited element is gone.
  - Send the /admin count first.
- **Free now:** yes. The sheet can be laid out on the provisional rows and changed later; nothing reaches visitors.

**3. Where the category comes from, and whether a model may steer the choice.** Blocks Phase 3.

- **Options (A to E in Part 4):** a separate AI call that names the category; the call that writes the brief moved earlier, so it names the category before the templates are picked; fixed word rules; a kind-of-business picker in question 1; an AI model that picks the templates (for comparison only).
- **Evidence:** Knowing the category before select.
- **Recommendation:**
  - Fixed rules over the sentence and company name, giving "unclear" on no match or a tie.
  - Store the category with each brief, so /admin can show it and you can check it (one database change).
  - Add the model call as an upgrade only if the rules miss the targets in decision 9.
  - This changes no public line.
- **Free now:** no (Phase 3).

**4. Choosing among the templates that fit.** Blocks Phase 3.

- **Options:**
  - when too few templates fit (the shortfall): fewer designs, fill with a template that clashes (the clash fill), or offer the call;
  - how your labels order the choice: fit only removes clashes (two tiers); every design you judged right comes first (suits first); or only Design one must be one you judged right, so the best fits spread over both visits (suits lead). Also whether Design one must always be one you judged right;
  - a minimum per row;
  - what visit 2 gets.
- **Evidence:** The selection rule; Variety; Pools and visits.
- **Recommendation:**
  - Fewer designs with true words, and the call when none fits.
  - Suits first, with Design one not required to suit. After your labels, I re-run the simulation and you choose between suits first and suits lead, since suits first puts every design you judged right into visit 1.
  - A minimum of six per row, unclear included, checked by a test.
  - Visit 2 gets three of the unseen eligible templates.
- **Free now:** no (Phase 3).

**5. Other signals.** Blocks Phase 3. The look part waits for Phase 2's 32 look pages.

- **Options:** the look steers the choice or not; keep away templates the visitor's own photographs would leave mostly empty, or fill the rest with judged stock; a sentence-length guard rail or none.
- **Look:** decide after the 32 look pages (each template in each of the four looks).
- **Own photographs:** with one photograph, Summit draws 8 empty blocks (3 cards) and Ember 7 (4 items). Recommendation: do not route on this; fill the rest with judged stock (decision 7).
- **Sentence length:** short sentences made the copy model pad lists with filler items in Ember, Harbor, Meridian, Summit and Atlas. Aurora has no list longer than three, so nothing could be padded. The cause is the sentence, not the template. Recommendation: no guard rail.
- **Free now:** no.

**6. Which structures count as clashes.** Blocks Phase 3. Routing may start once the clash table is approved.

- **Options:** for each of the 13 doubt cells, a clash, not a clash, or wait for labels.
- **Evidence:** Clash table, including its map of the items named in this decision.
- **Recommendation:**
  - Approve no clash now.
  - Label the 8 doubt cells that have stored pages first.
  - Approve $0.18 of paid copy for the 5 doubt cells with no page, or $0.73 to fill all 18 empty cells.
- **Free now:** n/a.

**7. Photographs.** Blocks Phase 4. The class list also shapes the Phase 2 picture sample.

- **Options:** per part, in Photograph plan, section 12.
- **Evidence:** Photograph plan; Measured slot geometry.
- **Recommendation (from the photograph plan):**
  - A stock picture needs a score of at least 7 out of 10 from the judging model (the floor).
  - A picture may lose at most 35% of its area to cropping on a 1440 px screen (50% for Vector's very wide strip), and the judge also sees its tightest crop.
  - When no picture passes or the judging model is down: a picture from the approved set (decision 8) where one is built, otherwise the template's empty state, and never a picture nobody judged.
  - Keep today's rule: different pictures in each design, shared only when the searches run out, and never twice on one page (ADR 0017).
  - No recognisable face in any stock picture; hands, backs and distant figures are fine.
  - Monolith's two small round portraits show the business's initials, never a stock face.
  - A picture for a named offering is judged against that offering's words once they exist (a median 1.5 s more); the searches still run early.
  - Stock fills the slots a visitor's own photographs leave.
  - A second search for the first-screen picture when nothing from the first passes every check.
  - Caps of 12 searches and 12 rankings per submission.
- **Added here:**
  - Without a darkening layer behind the words (a scrim), a prototype legibility check (text boxes approximated, not measured) failed most stored Ember and Summit heroes: 2 of 10 and 1 of 15 passed. A scrim needs the owner's approval.
  - Aurora's slot 0 shows 7% to 23% of its picture below 1024 px (new finding t01-D4).
- **Free now:** yes, for the slot-class list used to draw the Phase 2 sample.

**8. An owner-approved picture set.** Blocks Phase 4.

- **Options:** no set; a set for the six picture kinds that are not one per item (full-screen backdrop, wide band, very wide strip, small picture in a drawn panel, picture shown whole beside words, tall picture: slot classes 1 to 6); a set for every kind.
- **Evidence:** Photograph plan, section 11. For the 7 rows recommended here:
  - slot classes 1 to 6 need 154 pictures, about 1.3 hours of review;
  - all classes need 329 pictures, about 2.7 hours.
  - Both estimates assume 2 candidates per kept picture at 15 s each.
- **Recommendation:** slot classes 1 to 6 first.
- **Free now:** no.

**9. Acceptance targets.** Blocks Phases 3 and 4.

- **What to set:** the clash rate that wrong categories cause; the category step's agreement and "unclear" rate; the picture acceptance rate; N and M for the range assertions (a test that every ready template is eligible in at least N approved rows and chosen in at least M).
- **Options:** set the targets now from the placeholders, or after Phase 2's labels.
- **Evidence:** Variety. If every doubt became a clash, the templates would be eligible in this many of 7 rows:
  - Summit 3 (A, B, U);
  - Aurora and Vector 4 each;
  - Ember 5;
  - Monolith 6;
  - Meridian, Atlas and Harbor 7 each.
- **Recommendation:** set them after Phase 2's labels.
  - Agreement: every fixture, or listed misses the owner accepts.
  - Picture placeholders: 90% for slot-0 pictures and 80% for the rest.
  - N and M: chosen once the doubts are labelled.
- **Free now:** no.

**10. Limits.** Blocks Phase 2's paid step, and Phases 3 and 4.

- **Options:** your ceilings on cost and seconds; paid copy of $0.18, $0.73 or none until 1 November; ask Pexels for a higher limit or not.
- **Evidence:**
  - The fixed rules recommended in decision 3 add $0 and no time.
  - The photograph plan adds a median $0.037 (at most $0.050) a submission when each kind of picture is judged separately for each page section, or $0.025 (at most $0.044) when it is judged once per kind. Each second search for the first-screen picture adds about $0.006. Waiting for the words of named offerings adds a median 1.5 s.
  - About $2 is left until 1 November.
  - Paid copy to fill the 18 empty cells is $0.73.
  - Measuring every copy-changing fix is about $2.33 (estimate).
  - Labelling is 2.2 to 6.0 hours.
  - Whether production shares the Pexels key is not known.
- **Recommendation (proposals):**
  - Ceilings of +$0.06 and +5 s a submission.
  - Phase 2 paid copy capped at $1.00.
  - Copy-changing fixes measured after the reset.
  - Pexels caps of 12 a submission, which allow 16 submissions an hour.
  - Please tell me whether production uses the same Anthropic organisation limit and the same PEXELS_API_KEY as the eval; I cannot see either.
  - No request to Pexels for a higher limit is needed at the proposed cap (16 submissions an hour); ask only if real traffic nears it.
- **Free now:** no.

**11. Fixtures.** Blocks Phase 2 (new fixtures) and Phase 3 (held-out fixtures).

- **Options:** the three fixtures proposed, any of them, or source-industry fixtures as well.
- **Evidence:** Categories; The size of Phase 2.
- **Recommendation:**
  - Add one apps fixture (row F), one sentence that names no trade (U) and one with own photographs (stand-in files).
  - Write one more fixture per row that the rules are never tuned on (held-out fixtures), after the rules are frozen.
  - Add no source-industry fixture until the /admin count shows such visitors and two labels disagree.
- **Free now:** yes for writing them (append-only). Their paid copy waits.

**12. Tone words and slot keys.** Blocks Phase 3.

- **Options:** the proposed words or your own; rename slot keys, or only map them to classes.
- **Tone words (proposed).** Each template's metadata lists three words for its feel, and the picking step uses them for variety. These five name a kind of business:

  | Template | Now        | Proposed              |
  | -------- | ---------- | --------------------- |
  | Aurora   | product    | sleek                 |
  | Ember    | hospitable | welcoming             |
  | Harbor   | athletic   | energetic or forceful |
  | Summit   | clinical   | crisp                 |
  | Vector   | studio     | cinematic             |
  - Keep "editorial".
  - Variety is unchanged (Variety section).
  - Lucent's proposed "polished" would collide with Meridian's, so pick another word when Lucent is readied.

- **Slot keys:** map each picture slot's internal name to a slot class (Photograph plan), which changes nothing on the page. Rename the internal names the copy model reads (such as sponsors, tools, offer, dishes, metrics, doctor and projects) only alongside a paid test run (t02-L15, L16, t03-L10, t04-L1, L2, t05-L4, t06-L7, t07-L7 and t08-L5).
- **Free now:** no.

**13. Public wording.** Blocks any Phase 3 merge that makes a line untrue.

- **Options:** new words now, or the clash fill (decision 4), which changes no line.
- **Lines affected:**
  - the second-visit answer and its switch on six ready templates (app/_components/straight-answer-items.ts:13-20);
  - the /start lines for returning visitors (app/start/_components/start-copy.ts:98-99);
  - the claims register's "About five minutes to three designs" and "Three designs" claims (docs/claims-register.md:10-11);
  - "Is this AI?" and the privacy page, only if a model informs the category.
- **Recommendation:** with the fixed rules (decision 3) and fewer designs (decision 4), the owner's words for the second-visit answer and the /start lines. "Is this AI?" stays.
- **Free now:** no.

**14. Added: the "every design" lines are untrue today.** Blocks nothing in this plan.

- **Options:** reword now in a small pull request, or leave it until the visit cap is built.
- **Evidence:** with eight ready templates, a third visit leaves two unseen. The select step returns an empty list, and the pages say "You have seen every design we have for now" (done-copy.ts:206-207) and "Every design we have has been shown to this address" (:219-221). Neither line is in the claims register.
- **Recommendation:** the owner's words in a small separate pull request now.
- **Free now:** no (public).

**15. Added: universal defects outside leftovers.** Blocks Phase 2 (copy-free ones) or Phase 3.

- **Options:** approve, reject or defer each.
- **Evidence:** Fix list, universal defects.
- **Recommendation:** approve element by element.
  - These copy-free ones ship with the Phase 2 fix pull request:
    - Aurora's and Monolith's closing buttons, which point at their own section (t01-D3, t02-D4);
    - Meridian's mail subject, wrong heading levels and unused markup (t03-D1, D2, D4; also decision 1), and its generic headings on fallback pages (t03-D5);
    - wrong heading levels on Atlas and Vector (t04-D4, t08-D6);
    - Ember's grid picture, which ends up upside down after pointer entries, and its missing grid pictures, drawn as discs beside square ones (t05-D1, D3);
    - Harbor's "Find out more", which appears on hover but is not a link (t06-D1);
    - Harbor's and Summit's forms, which put typed details in the web address when no email is known, and Summit's form, which has no autofill (t06-D4, t07-D5);
    - Summit's caption links, which stay invisible when they have keyboard focus; its closing picture, which phones load but never show; and its phone menu, which never returns focus to its button (t07-D3, D4, D6);
    - Vector's heading spelled out letter by letter with no text alternative, its menu button, which is never called "Menu", and its dark logo, which vanishes on the dark pill (t08-D2, D4, D5);
    - the eval's phone screenshots, which are 435 px wide and never scroll (t01-D2; eval code only).
  - Measure before deciding: Meridian's fixed picture box (t03-D3, decision 1), Summit's faded text that may fail contrast (t07-D7), and Harbor's ragged grid rows (t06-D5). The last two are not verified.
  - These change the design, so the owner decides them separately:
    - Atlas's and Ember's buttons that lead to a section with no form or link (t04-D2, t05-D2), and Vector's first screen with no button (t08-D7): under this decision, one by one;
    - Aurora's and Atlas's hidden first pictures (t01-D4, t04-D3), Ember's and Summit's hero words with no scrim (t05-D4, t07-D2), and Ember's empty picture blocks, which collapse to nothing (t05-D7): decision 7;
    - Vector's fixed violet-to-pink colouring of its pictures (t08-D3): with its two-tone doubt in decision 6.
  - The template descriptions that describe each example page (t02-D3, t03-D6, t04-D5, t05-D6, t06-D6, and Summit's and Vector's) are rewritten in Phase 3 with the tone words (decision 12).
  - Monolith's "Free Icons" and "Menu Icon" (t02-D1, D2) are leftovers under decision 1. The defects marked "Yes: eval" wait for a paid test run. Harbor's cost, Aurora's unreadable answers and the "every design" lines are decisions 16, 17 and 14.
- **Free now:** no.

**16. Added: Harbor's 12-character phrase limit.** Blocks Phase 3's eval.

- **Evidence:** Harbor's short phrases in the hero and in its phrase grid may be 12 characters at most (the `hero.stats` and `metrics` values). The copy model writes them one or two characters too long and retries, so Harbor's answers cost $0.086 against $0.025 to $0.041 for the others (docs/pipeline-quality-plan.md:47).
- **Options:** raise the cap, or keep it. Either way the copy model's input changes, so it needs an eval.
- **Recommendation:** measure it in the same run as Harbor's guide fixes.
- **Free now:** no.

**17. Added: Aurora's unreadable first answers.** Blocks nothing.

- **Options:** make the eval keep the raw answer text, or not.
- **Evidence:** the first answer came back in a form the code could not read in 7 of 11 first calls in l6, and the eval keeps no raw text, so the cause is unknown (t01-D1).
- **Recommendation:** a free code change so the eval keeps the raw text, then look on the next approved run.
- **Free now:** yes (eval code only, no call).

## Part 2. The templates

The fit records, the measured slot geometry and the renders are in [template-fit/records.md](template-fit/records.md).

## Part 3. Templates against kinds of business

### Categories (decision 2)

Every category assignment below is provisional. The owner confirms or changes it. The scripts and their outputs are in the session scratchpad, in folder `cat` (test-results/template-fit/cat):

- `pairs.cjs` and `pairs.json`: the stored pairs in each run, with model or fallback copy.
- `cells.cjs`: the cells, the costs and the stress fixtures.
- `presume.cjs`: what each fixture's sentence states. Every quote is checked against fixtures.json.
- `draw.cjs`: the seeded fixture draws.

#### Who arrives: the evidence

| Source                                                    | What it says about who arrives                                                                                                                                                                  |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PRODUCT.md:11                                             | Small UK businesses and early-stage founders who need a new website (paraphrased)                                                                                                               |
| PRODUCT.md:50                                             | Six real clients "came to the studio through this site"                                                                                                                                         |
| app/_components/work-items.ts:38, :46, :54, :63, :70, :78 | Those six are: dog walking; veterinary prescription software; a travel wellness app; an audio fitness app; an at-home fitness app; a running coaching app. Five of the six are apps or software |
| work-items.ts:25                                          | "from a dog walker to a fitness app"                                                                                                                                                            |
| app/start/_components/start-copy.ts:236                   | The first question's example: "Physiotherapy clinic in Sheffield. Sports injuries, post-op rehab, same-week appointments."                                                                      |
| app/_components/walkthrough-brand.ts:17, :45              | The walkthrough's invented example business designs and plants gardens                                                                                                                          |
| lib/brief/example-brief.ts:12                             | The closing sketch paints VetPres, a prescription platform                                                                                                                                      |
| tests/fixtures/eval/fixtures.json                         | 20 invented businesses. Their notes group them as trades 3, trades and design 1, clinic 3, services 5, consultancy 3, food 2, creative 2, shop 1. None is software or an app (brief:70)         |
| The real briefs at /admin                                 | Not read, because this worktree has placeholder keys. The request to the owner is below                                                                                                         |

The fixtures' sentences seldom say what a page might presume (presume.cjs). Of the 20 sentences:

| What the sentence states                             | Sentences |
| ---------------------------------------------------- | --------- |
| A date, appointment, visit or session                | 5         |
| A particular person (none offers a choice of person) | 5         |
| A place customers come to                            | 5         |
| Things made, sold or built                           | 7         |
| Named past work                                      | 0         |
| An app or a screen                                   | 0         |
| Three or more named offerings                        | 13        |

A word search (cat/presume.cjs) finds "appointments" in 2 sentences (a1-gas and physio-unbroken). It finds no "portfolio", "project", "software" or "menu" at all, and no "app" as a whole word. A sentence's silence is unknown, not absent (brief:179). So the category has to carry the typical case, and the owner confirms it.

#### Proposed categories

| Id  | Category                                   | Example trades (for the category step and for confirming fixtures, never label rows)                                           | Grounded in                                                             | Fixtures (provisional)                                            |
| --- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- | ----------------------------------------------------------------- |
| A   | Work done at the customer's home or site   | joiner, plumber or gas engineer, electrician, builder, cleaner, gardener, handyman                                             | 6 fixtures; the walkthrough's garden example                            | joinery, a1-gas, electrician, cleaning, gardens, vague            |
| B   | Appointments and sessions with a person    | dentist, physio, vet, salon, personal trainer, tutor, dog walker or groomer                                                    | 5 fixtures; start-copy.ts:236; one client (work-items.ts:38)            | dentist-claims, physio-unbroken, physio-longest, tutors, shortest |
| C   | Things made or sold: shops, food and drink | café, restaurant, bakery, florist, independent shop                                                                            | 3 fixtures                                                              | cafe, bakery, florist                                             |
| D   | Advice and business services               | accountant, consultant, HR adviser, solicitor, IT support                                                                      | 4 fixtures                                                              | longest, awkward, hr, it-support                                  |
| E   | Creative and design work                   | architect, photographer, designer, agency                                                                                      | 2 fixtures                                                              | architects, photographer                                          |
| F   | Apps, software and online products         | an app, a software platform, an online service                                                                                 | PRODUCT.md:11; five of six clients (work-items.ts); example-brief.ts:12 | none yet                                                          |
| U   | Unclear                                    | the sentence names no kind of business; or it names a kind no row covers; or the category step failed or timed out (brief:187) | brief:41, :49                                                           | none of the 20; vague is the closest                              |

**What each category's businesses typically have that a page might presume.** These values are proposals, for the owner to confirm. The second table shows how many of each row's fixtures state it (presume.cjs).

| Id  | Bookings by date                     | A person to choose         | A premises customers visit       | Things to photograph                     | Named past work               | An app or screen | Offerings it can name                                                                                    |
| --- | ------------------------------------ | -------------------------- | -------------------------------- | ---------------------------------------- | ----------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------- |
| A   | often (visits, quotes)               | sometimes; rarely a choice | rarely                           | often (the finished job)                 | often (past jobs)             | no               | yes                                                                                                      |
| B   | usually                              | often                      | often; some are mobile or online | rarely (the service is done to a person) | rarely                        | no               | yes                                                                                                      |
| C   | sometimes (tables, orders, delivery) | rarely                     | usually                          | usually (the products)                   | rarely                        | no               | yes (products)                                                                                           |
| D   | sometimes (a first meeting)          | sometimes                  | rarely                           | rarely (the offering cannot be seen)     | sometimes; often confidential | no               | yes, but intangible                                                                                      |
| E   | sometimes (a shoot or site date)     | rarely                     | rarely                           | usually (the work itself)                | usually                       | no               | yes                                                                                                      |
| F   | rarely (a demo)                      | no                         | no                               | rarely (screens instead)                 | no                            | usually          | yes (features)                                                                                           |
| U   | unknown                              | unknown                    | unknown                          | unknown                                  | unknown                       | unknown          | only what every brief has: three selling points, three steps and one statement (lib/ai/prompts.ts:33-35) |

| Id     | Fixtures | Date stated | Person | Premises | Things to photograph | Past work | Screen | 3+ offerings |
| ------ | -------- | ----------- | ------ | -------- | -------------------- | --------- | ------ | ------------ |
| A      | 6        | 2           | 2      | 0        | 2                    | 0         | 0      | 4            |
| B      | 5        | 2           | 1      | 3        | 0                    | 0         | 0      | 2            |
| C      | 3        | 0           | 0      | 2        | 3                    | 0         | 0      | 3            |
| D      | 4        | 1           | 2      | 0        | 0                    | 0         | 0      | 3            |
| E      | 2        | 0           | 0      | 0        | 2                    | 0         | 0      | 1            |
| All 20 | 20       | 5           | 5      | 5        | 7                    | 0         | 0      | 13           |

**Unclear.** It presumes nothing. Its row is in the clash table: the templates it excludes, the pool it leaves and the visits it allows. It excludes only templates with a structure most arrivals cannot fill (brief:49). Proposal: a business that is clear but fits no row also gets the unclear pool. The category step would record "unlisted" separately, so the owner can see which kinds keep arriving. This is for the owner to decide.

**Rows that contain a template's source.** Sources are provenance only. No row is proposed because of them.

| Row | Sources inside it                                                                                                                                                                                                          | Does the row simply reproduce a source?                                                                                                                                                                                                                                                                             |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A   | none                                                                                                                                                                                                                       | No. It is the largest row (6 fixtures), and no template came from it                                                                                                                                                                                                                                                |
| B   | Summit's source, a hospital (ADR 0029:9). Harbor's source, a gym (ADR 0028:9)                                                                                                                                              | No. Its fixtures are a dentist, two physios, a tutor and a dog groomer and walker. **Flag:** a separate "clinics" row or "fitness" row would reproduce a source                                                                                                                                                     |
| C   | Ember's source, a restaurant (ADR 0027:9)                                                                                                                                                                                  | No. Its fixtures are a café, a bakery and a florist. **Flag:** a "food and drink" row on its own would come close to Ember's source                                                                                                                                                                                 |
| D   | Atlas's source, a crypto exchange (ADR 0023:15, :22), is nearby                                                                                                                                                            | No. Its fixtures are consultancy, accountancy, HR and IT support                                                                                                                                                                                                                                                    |
| E   | Vector's source, an agency (ADR 0030:9)                                                                                                                                                                                    | **Flag:** its defining presumption, named past work, is the source's portfolio. All 25 stored Vector answers filled its items with offerings, never projects (brief:79). This row must not become Vector's only home                                                                                                |
| F   | Aurora's source, an in-house SaaS page (ADR 0008:11). Monolith's and Meridian's sources, landing pages for a software or template product (ADR 0023:13-14; mp-evidenceA.md:301, :454). Lucent's source, an app (not ready) | **Flag, the strongest:** this row matches four sources. It is proposed because of who arrives (PRODUCT.md:11; work-items.ts), not because of them. It has no fixture. A "suits" label here needs a render with an app's own copy. Aurora already has model copy for 8 businesses outside software in l6 (pairs.cjs) |

#### Compared with a plain list of trades

The trade list used here has 26 trades:

- the 19 trades the fixtures name (physio appears twice);
- the 7 kinds the brief says no fixture covers: restaurant, gym, salon, solicitor, builder, vet, software or app (brief:70).

Where one sentence names two trades, the list merges them: plumber or gas engineer; dog walker or groomer.

| Fixture         | Fixture's note    | Category (provisional) | Ambiguous?                                                 | Trade (provisional)     | Ambiguous?                                |
| --------------- | ----------------- | ---------------------- | ---------------------------------------------------------- | ----------------------- | ----------------------------------------- |
| joinery         | trades            | A                      | yes, A or E: makes by hand in a workshop (fixtures.json:9) | joiner                  | no                                        |
| a1-gas          | trades            | A                      | no                                                         | plumber or gas engineer | no, only because the list merges the two  |
| dentist-claims  | clinic            | B                      | no                                                         | dentist                 | no                                        |
| vague           | services          | A                      | yes, A or U: "things around the house and garden" (:45)    | handyman                | yes: handyman, gardener or none           |
| shortest        | services          | B                      | no                                                         | dog walker or groomer   | no, only because the list merges the two  |
| longest         | consultancy       | D                      | no                                                         | management consultant   | no                                        |
| awkward         | consultancy       | D                      | no                                                         | accountant              | no                                        |
| cafe            | food              | C                      | no                                                         | café                    | no                                        |
| architects      | creative          | E                      | no                                                         | architect               | no                                        |
| florist         | shop              | C                      | no                                                         | florist                 | no                                        |
| physio-unbroken | clinic            | B                      | no                                                         | physiotherapist         | no                                        |
| physio-longest  | clinic            | B                      | no                                                         | physiotherapist         | no                                        |
| electrician     | trades            | A                      | no                                                         | electrician             | no                                        |
| hr              | consultancy       | D                      | no                                                         | HR consultant           | no                                        |
| bakery          | food              | C                      | no                                                         | baker                   | no                                        |
| photographer    | creative          | E                      | no                                                         | photographer            | no                                        |
| cleaning        | services          | A                      | no                                                         | cleaner                 | no                                        |
| gardens         | trades and design | A                      | yes, A or E: design, maintenance and building (:213)       | garden designer         | yes: garden designer, gardener or builder |
| it-support      | services          | D                      | no                                                         | IT support              | no                                        |
| tutors          | services          | B                      | no                                                         | tutor                   | no                                        |

| Measure                                                         | Categories (A to F plus U) | Plain trades                                      |
| --------------------------------------------------------------- | -------------------------- | ------------------------------------------------- |
| Rows besides unclear                                            | 6                          | 26                                                |
| Owner labels needed (8 ready templates × rows)                  | 48                         | 208                                               |
| Unclear cells (approved with reasons, no render)                | 8                          | 8                                                 |
| Cells with a stored l6 model-copy page                          | 30                         | 57                                                |
| Cells with a fixture but no model page                          | 10                         | 95                                                |
| Cells with no fixture at all                                    | 8 (row F)                  | 56 (7 trades)                                     |
| New fixtures needed to reach every cell                         | 1                          | 7                                                 |
| Fixtures per row                                                | 0 to 6 (median 3.5)        | 18 rows with one fixture, 1 with two, 7 with none |
| Rows that can run the "two fixtures disagree" check (brief:294) | 5 of 6                     | 1 of 26                                           |
| Fixtures left ambiguous                                         | 3 of 20                    | 2 of 20, and 4 without the two merges             |

**Where each scheme puts a business in the wrong place:**

| Scheme     | How                                                                                                                      | Fixtures it touches (provisional)                                                                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Categories | A business that spans two rows must take one. Labels from the other row never reach it                                   | joinery (A or E), gardens (A or E), vague (A or U)                                                                                                                                                                      |
| Categories | A wide row holds businesses whose pages need different things. A template could read right for one and wrong for another | In B, a dentist with "Two surgeries" (fixtures.json:33) sits beside a tutor "in person in Ilkley or online" (:237). In C, a café "on the canal" (:93) sits beside a bakery delivering "for cafés and farm shops" (:177) |
| Trades     | A trade that is not on the closed list has no row. It falls to unclear, or to the nearest trade, which is a guess        | None of the 20, since the list is built from them. Every new kind of business would be affected. How many real briefs this covers is not verified                                                                       |
| Trades     | One trade holds businesses whose pages need different things, and each trade's label rests on a single sentence          | physio-unbroken ("clinics", "Evening appointments", :129) and physio-longest ("a drop-in clinic on Saturdays", :141)                                                                                                    |
| Trades     | A sentence that names two or three trades needs a merged row, or it becomes ambiguous                                    | a1-gas (gas and plumbing), shortest (grooming and walking), gardens (design, maintenance and building)                                                                                                                  |

**Recommendation: a mix.**

- The rows are categories, A to F plus unclear, each described by what its businesses have.
- Each row lists example trades. The category step can use them as rules, and the owner can use them to confirm fixtures.
- Labels and clashes are kept per row, never per trade.
- A row is split only when two of its fixtures disagree on the design answer (brief:294). Even then, the split follows a presumption (for example, premises or none), not a trade.

Why:

- 48 labels instead of 208.
- One new fixture instead of seven.
- Five of the six rows can check whether their own fixtures agree.

The cost is one more ambiguous fixture (3 against 2), and the owner settles those three by hand.

#### Request to the owner (blocks decision 2)

> Please open /admin and go through the briefs it lists (the last 30 days, plus any kept because the person booked a call or hired the studio; PRODUCT.md:30). For each brief, write one line with:
>
> 1. the kind of business in a few of your own words, such as "mobile dog groomer" or "booking app for salons". No names, company names, emails or quotes from the sentence, because this plan is committed to the repository;
> 2. the row it fits (A to F), or "none" if no row fits, or "can't tell" if the sentence does not say;
> 3. which of these the sentence mentions: a date or appointment, a particular person, a place customers come to, things it makes or sells, past jobs or projects, an app or a screen;
> 4. whether the person booked a call.
>
> Then add the total number of briefs, and any kind of business you expect that no row covers. If there are more than 40, the 40 most recent are enough.

### Fix list

**How to read it**

- **Rows:** the provisional categories, A to F and U.
- **"Reads wrong for":** the rows whose typical business (the presumptions in Categories) the leftover misleads. These are also the rows its fix would open if the owner routes on leftovers (decision 1). With no routing, a fix opens no row.
  - "in part" means only some of the row's example trades.
  - "all rows" means A to F.
- **Copy model:** "Yes: eval" means the fix changes what the copy model sees, so it needs an eval run inside an approved budget.
- **Sources:** every path is under the template's folder unless written in full. Counts come from the fit records' scripts.

#### Aurora (t01)

| Fix     | Element (path:line)                                                                 | Channel                       | Proposed change                                                    | Copy model | Reads wrong for                           |
| ------- | ----------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------ | ---------- | ----------------------------------------- |
| t01-L1  | Three window dots (sections/product-frame.tsx:26-28; render aurora-bakery-1440.png) | page (panel aria-hidden, :22) | Remove                                                             | No         | A to E; F not judged                      |
| t01-L2  | Progress bars at fixed fills (product-frame.tsx:12, :66-70)                         | page                          | Remove, or three equal plain rules                                 | No         | A to E (lines were offerings in 12 of 12) |
| t01-L3  | Row dots, the first in brand colour (product-frame.tsx:62-64)                       | page                          | One plain bullet on all three lines                                | No         | A to E                                    |
| t01-L4  | Title-bar pill with the name and a spacer (product-frame.tsx:25-32)                 | page                          | The name as a plain heading                                        | No         | A to E                                    |
| t01-L5  | Rail's first entry styled as selected (product-frame.tsx:36-50, style :42-44)       | page, md and up               | Keep the list, drop the selected style                             | No         | A to E                                    |
| t01-L6  | Tick rows with grey bars and on/off toggles (sections/features.tsx:9-43)            | page (aria-hidden, :16)       | Keep the ticks, remove the toggles                                 | No         | A to E                                    |
| t01-L7  | Guide "a short screen title inside an illustration of their work" (contract.ts:98)  | copy model                    | "a short heading for the panel under the headline, in their words" | Yes: eval  | none shown ("screen" in 0 of 12)          |
| t01-L8  | Fallback panel heading "Overview" (contract.ts:223)                                 | page, fallback only           | "What we do"                                                       | No         | all rows, on fallback pages (2 stored)    |
| t01-L9  | Tone "product" (meta.ts:10)                                                         | metadata                      | "sleek"                                                            | No         | n/a                                       |
| t01-L10 | Description "product frame" (meta.ts:7)                                             | metadata                      | "drawn panel"                                                      | No         | n/a                                       |

#### Monolith (t02)

| Fix     | Element (path:line)                                                                                                               | Channel                | Proposed change                                           | Copy model | Reads wrong for                                     |
| ------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------- | ---------- | --------------------------------------------------- |
| t02-L1  | Panels mark beside the name (sections/logo.tsx:24; sections/icons.tsx:5-22)                                                       | page                   | Remove, or a plain dot                                    | No         | all rows                                            |
| t02-L2  | Light bulb on the offering card (sections/hero-cards.tsx:97)                                                                      | page, lg and up        | One neutral mark, or none                                 | No         | all rows                                            |
| t02-L3  | Radar beside every label (sections/sponsors.tsx:20)                                                                               | page                   | Remove, or a plain dot                                    | No         | all rows (labels were offerings, places, audiences) |
| t02-L4  | Medal, map, plane, gift on the steps by position (sections/how-it-works.tsx:8, :27; render monolith-a1-gas-1440.png)              | page                   | Numerals 1 to 4, or one neutral mark                      | No         | all rows (12 of 12 step sets)                       |
| t02-L5  | Chart, wallet, magnifier on the services (sections/services.tsx:9, :32)                                                           | page                   | Numerals, or one neutral mark                             | No         | all rows (12 of 12)                                 |
| t02-L6  | `<title>Free Icons</title>` in eight drawings (sections/icons.tsx:31, 109, 177, 235, 333, 407, 497, 567)                          | tooltip, screen reader | Remove the titles; mark the drawings aria-hidden          | No         | all rows                                            |
| t02-L7  | "Menu Icon" (sections/nav-menu.tsx:49)                                                                                            | screen reader          | "Menu"                                                    | No         | all rows                                            |
| t02-L8  | Ids #sponsors, #statistics (sponsors.tsx:11; about.tsx:34)                                                                        | DOM only               | #areas and #highlights, or drop                           | No         | none shown                                          |
| t02-L9  | Anchor #cta behind every ask (contract.ts:29, :237, :242, :252, :284, :295)                                                       | URL                    | #contact                                                  | No         | all rows (web jargon)                               |
| t02-L10 | "such as Why we started" (contract.ts:146)                                                                                        | copy model, then page  | No example: "a short line under the name, in their words" | Yes: eval  | all rows (12 of 12, with no origin in the sentence) |
| t02-L11 | "such as What you get", "such as Included" (contract.ts:151-152)                                                                  | copy model, then page  | Drop the examples                                         | Yes: eval  | none (same words: 12 and 11 of 12)                  |
| t02-L12 | "such as What we cover" (contract.ts:158)                                                                                         | copy model, then page  | Drop the example                                          | Yes: eval  | none (11 of 12)                                     |
| t02-L13 | "such as Same week", "such as appointments" (contract.ts:164-165)                                                                 | copy model, then page  | Examples that presume no booking, or none                 | Yes: eval  | none shown (3 uses, all the visitor's own words)    |
| t02-L14 | "About the company name", "Frequently asked questions", "Still have questions?", "Contact us" (contract.ts:160, :186, :190, :191) | copy model, then page  | Leave, or drop                                            | Yes: eval  | none                                                |
| t02-L15 | Key `sponsors` (contract.ts:59, :158-159)                                                                                         | copy model             | `areas`                                                   | Yes: eval  | none shown                                          |
| t02-L16 | Keys `cards.quote`, `cards.profile`, `cards.plan` (contract.ts:46-56)                                                             | copy model             | `statement`, `audience`, `included`                       | Yes: eval  | none shown ("plan" in 2 of 12)                      |
| t02-L17 | Slot keys `quote`, `profile` (contract.ts:482)                                                                                    | metadata               | Map to slot classes named by shape                        | No         | none                                                |

#### Meridian (t03)

| Fix     | Element (path:line)                                                                                                            | Channel                                             | Proposed change                                                          | Copy model              | Reads wrong for                                               |
| ------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------- | ------------------------------------------------------------- |
| t03-L1  | Label icons by position: Crown, Vegan, Ghost, Puzzle, Squirrel, Cookie, Drama (sections/sponsors.tsx:7, 16-19)                 | page (aria-hidden)                                  | One neutral mark, or none                                                | No                      | all rows; beside food (C) the leaf also reads as a diet claim |
| t03-L2  | Benefit icons Blocks, ChartLine, Wallet, Sparkle (benefits.tsx:8, 26, 34)                                                      | page                                                | Drop them; the 01 to 04 numbers lead                                     | No                      | all rows                                                      |
| t03-L3  | Feature icons TabletSmartphone, BadgeCheck, Goal, PictureInPicture, MousePointerClick, Newspaper (features.tsx:23-30, 46, 52)  | page                                                | One neutral mark, or numbers                                             | No                      | A to E; F not judged                                          |
| t03-L4  | Building, phone, envelope icons on the steps (contact.tsx:19, 41-45; render meridian-joinery-1440.png)                         | page                                                | Numbers 1 to 3                                                           | No                      | all rows (read as contact details that are not there)         |
| t03-L5  | Down-chevrons tile when no logo (logo.tsx:24)                                                                                  | page                                                | The initial in the tile, or the name alone                               | No                      | none shown                                                    |
| t03-L6  | Speech-bubbles mark over the ask (community.tsx:21)                                                                            | page                                                | Keep (ADR 0023:33)                                                       | No                      | none shown                                                    |
| t03-L7  | Placeholders "Leopoldo", "Miranda", "leomirandadev@gmail.com" (contact.tsx:81, 92, 107; render meridian-joinery-1440.png)      | page                                                | No placeholders; keep "Your message..." (:148)                           | No                      | all rows                                                      |
| t03-L8  | Field names firstName, lastName, email, subject, message; ids meridian-* (contact.tsx:79-80, 90-91, 104-105, 120-121, 145-146) | form data (mail body; not checked in a mail client) | name, email, subject, message                                            | No                      | none shown                                                    |
| t03-L9  | Id and target `community` (community.tsx:14; contract.ts:23, 28, 161, 203, 210; contact.tsx:67)                                | URL; copy model reads the target                    | Id `ask` with the old target mapped (copy-free); rename the target later | Id no; target yes: eval | none shown (URL only)                                         |
| t03-L10 | Key `sponsors` (contract.ts:53, 125-126); DOM id (sponsors.tsx:27)                                                             | copy model, page source                             | `labels`                                                                 | Yes: eval               | none shown                                                    |
| t03-L11 | Guide examples (contract.ts:114, 117, 125, 127, 132, 137, 147, 154-156)                                                        | copy model, then page                               | Describe each slot's job with no "such as"                               | Yes: eval               | none (copied in up to 13 of 13)                               |
| t03-L12 | "PRO" badge (services.tsx:35)                                                                                                  | none (`pro` always false, contract.ts:219)          | None needed                                                              | No                      | none                                                          |

#### Atlas (t04)

| Fix     | Element (path:line)                                                                                   | Channel                                      | Proposed change                                                           | Copy model                 | Reads wrong for                                                                            |
| ------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------ |
| t04-L1  | `tools` as key, target, id and slot key (contract.ts:23, 68-73, 129, 153-158, 170, 418; tools.tsx:28) | copy model, page, URL, metadata              | `approach`: the id first (copy-free), then the key                        | Id no; key yes: eval       | A to E; "Our tools" or "Tools we use" over a band of prices, people or years in 2 of 8 (D) |
| t04-L2  | `offer` as key, target, id and slot key (contract.ts:23, 62-67, 148-152, 418; offer.tsx:14)           | copy model, page, URL, metadata              | `included`                                                                | Id no; key yes: eval       | not shown on a render ("Our offer" in 2 of 8)                                              |
| t04-L3  | "More ›" link by each column, all to #why (market.tsx:72-79; contract.ts:141, 223)                    | page, screen reader ("More: Boiler Repairs") | Do not draw it when the card holds words (copy-free); drop the slot later | Drawing no; slot yes: eval | all rows (8 of 8)                                                                          |
| t04-L4  | Drop-down label "such as More" (nav.tsx:51-80; contract.ts:127)                                       | page                                         | Keep                                                                      | n/a                        | none shown                                                                                 |
| t04-L5  | Box label "such as Why" (pitch.tsx:44-46; contract.ts:145)                                            | page                                         | Keep                                                                      | n/a                        | none shown                                                                                 |
| t04-L6  | Eyebrow "such as the company name", in capitals (contract.ts:132; styles.ts:22)                       | copy model, page                             | "A few words on what they do"                                             | Yes: eval                  | none shown (repeats the name, 8 of 8)                                                      |
| t04-L7  | FAQ eyebrow "such as Support" (contract.ts:165)                                                       | copy model, page                             | "such as Questions"                                                       | Yes: eval                  | none shown                                                                                 |
| t04-L8  | "Frequently asked questions" (contract.ts:166), "Get in touch" (:171)                                 | copy model                                   | Keep                                                                      | n/a                        | none                                                                                       |
| t04-L9  | Discs and star over the hero (hero.tsx:17-21, 74-100)                                                 | page (aria-hidden), 640 and up               | Keep or drop                                                              | No                         | none shown                                                                                 |
| t04-L10 | Initial in a gradient tile when no logo (logo.tsx:26-34)                                              | page                                         | Keep                                                                      | No                         | none                                                                                       |
| t04-L11 | "Back to top" (index.tsx:68); "© Copyright {year} {name}. All rights reserved" (footer.tsx:109)       | page                                         | Drop "Copyright" after ©                                                  | No                         | none                                                                                       |

#### Ember (t05)

| Fix     | Element (path:line)                                                                                       | Channel                      | Proposed change                                         | Copy model | Reads wrong for                                                                                          |
| ------- | --------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------- |
| t05-L1  | Chef's hat, leaf, heart by row (features.tsx:1, 9, 30, 38; render ember-joinery-1440.png)                 | page (aria-hidden)           | One neutral mark, or the row number                     | No         | hat: A, B, D, E, F, and C in part (its shops); leaf and heart not verified. Drawn on all 24 stored pages |
| t05-L2  | Laurel marks by About's eyebrow (about.tsx:33-35; ornament.tsx:2-3, 10-20)                                | page                         | Keep, or a short rule                                   | No         | none shown                                                                                               |
| t05-L3  | Ids #dishes, #timing, #booking-process (dishes.tsx:14; timing.tsx:15; booking.tsx:15; contract.ts:34-44)  | URL                          | #offers, #reach, #steps; change the link addresses only | No         | #dishes: A, B, D, E, F. #timing: A, D, E, F. #booking-process: F; C, D, E in part                        |
| t05-L4  | Keys `dishes.*`, `booking.*`, `timing.*` and target names (contract.ts:60-66, 77, 138-153, 163-164)       | copy model                   | Neutral keys, or the old names mapped                   | Yes: eval  | none in copy (food words 0 of 22)                                                                        |
| t05-L5  | "Where flavour meets care" (contract.ts:129)                                                              | copy model                   | An example with no trade word                           | Yes: eval  | none shown (0 of 22)                                                                                     |
| t05-L6  | Nav "where to find them", card "such as Where to find us", fallback "Find us" (contract.ts:126, 151, 305) | copy model; page on fallback | "how to reach them"; "Ready when you are"; "Contact"    | Yes: eval  | A, D, E, F; hr got "Where to find us"                                                                    |
| t05-L7  | "such as Made with care" (contract.ts:133)                                                                | copy model, then page        | "such as Who we are"                                    | Yes: eval  | A, B, D, F (3 times for the dog groomer, once for the cleaner)                                           |
| t05-L8  | "such as What we make" (contract.ts:138)                                                                  | copy model, then page        | "What we offer"                                         | Yes: eval  | none shown (4 of 22, all joinery)                                                                        |
| t05-L9  | "never a price" (contract.ts:142)                                                                         | copy model                   | Keep                                                    | No change  | none                                                                                                     |
| t05-L10 | Fixed words and screen-reader labels (footer.tsx:87, 89-99; nav.tsx:54, 57, 74, 86, 104)                  | page, screen reader          | Keep                                                    | No         | none                                                                                                     |
| t05-L11 | Footer watermark of the name (footer.tsx:103-110)                                                         | page (aria-hidden)           | Keep                                                    | No         | none                                                                                                     |
| t05-L12 | Tone "hospitable" (meta.ts:10)                                                                            | metadata                     | "welcoming"                                             | No         | n/a                                                                                                      |

#### Harbor (t06)

| Fix     | Element (path:line)                                                                                      | Channel               | Proposed change                                                          | Copy model       | Reads wrong for                                                                             |
| ------- | -------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------ | ---------------- | ------------------------------------------------------------------------------------------- |
| t06-L1  | Six icons by card position, dumbbell first (services.tsx:1, 9, 38, 56-60; render harbor-a1-gas-1440.png) | page (aria-hidden)    | One neutral mark, or the card number                                     | No               | all rows, B included: of B's example trades it fits only a personal trainer. 17 of 17 pages |
| t06-L2  | Bolt in the hero pill (hero.tsx:1, 40)                                                                   | page                  | A plain dot, or nothing                                                  | No               | not verified                                                                                |
| t06-L3  | "Scroll" with a line (hero.tsx:117-126)                                                                  | page, screen reader   | Keep, or hide from screen readers                                        | No               | none                                                                                        |
| t06-L4  | Placeholders "John Doe", "john@example.com" (contact.tsx:93, 106; render harbor-a1-gas-390.png)          | page, screen reader   | "Your name", "your@email.com"                                            | No               | all rows (the same named person on every page)                                              |
| t06-L5  | Field ids and names (contact.tsx:85-122; footer.tsx:60-62)                                               | form data             | Keep                                                                     | No               | none                                                                                        |
| t06-L6  | Id #metrics (metrics.tsx:16; contract.ts:23-31)                                                          | URL                   | #highlights                                                              | No               | all rows (names figures the band never shows)                                               |
| t06-L7  | `hero.stats[]`, `metrics.*`, "the grid of figures" (contract.ts:141-143, 157-164, 190)                   | copy model            | Neutral keys; "the grid of short phrases"                                | Yes: eval        | all rows (reached the page once, "Our figures")                                             |
| t06-L8  | "Made for people who train" (contract.ts:136)                                                            | copy model            | "who it is for"                                                          | Yes: eval        | none shown (0 of 9)                                                                         |
| t06-L9  | "Open late", "every weekday" (contract.ts:142-143)                                                       | copy model            | Examples that presume no opening hours                                   | Yes: eval        | none shown (0 of 9)                                                                         |
| t06-L10 | "PROOF" (contract.ts:160)                                                                                | copy model            | A neutral example                                                        | Yes: eval        | none shown                                                                                  |
| t06-L11 | Neutral examples copied word for word (contract.ts:140, 149, 156, 157, 165, 170, 178)                    | copy model, then page | Keep, or vary                                                            | Only if varied   | none (8 or 9 of 9)                                                                          |
| t06-L12 | "Hear from us", "your@email.com" for the footer field (contract.ts:186-187)                              | copy model, then page | A neutral example (eval), or drop the field (t06-S5, changes the design) | Yes: eval, or No | all rows: no stored sentence offers news (9 of 9)                                           |
| t06-L13 | "Privacy · Terms" in guide and fallback (contract.ts:192, 437; footer.tsx:135)                           | copy model, then page | Leave empty (eval), or stop drawing the small print (copy-free)          | Yes: eval, or No | all rows without those pages (17 of 17)                                                     |
| t06-L14 | Fixed words and labels (footer.tsx:39, 101, 118-134; nav.tsx:76, 85, 115, 134)                           | page, screen reader   | Keep                                                                     | No               | none                                                                                        |
| t06-L15 | Footer watermark (footer.tsx:25-32)                                                                      | page (aria-hidden)    | Keep                                                                     | No               | none                                                                                        |
| t06-L16 | Tone "athletic" (meta.ts:10)                                                                             | metadata              | "energetic" or "forceful"                                                | No               | n/a                                                                                         |

#### Summit (t07)

| Fix                  | Element (path:line)                                                                                                                   | Channel                               | Proposed change                                                                                   | Copy model             | Reads wrong for                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------ |
| t07-L1               | Stethoscope, heart pulse, hospital, ambulance on the reasons (sections/why.tsx:1, 9, 28; render summit-bakery-1440.png)               | page (aria-hidden)                    | Numerals 01 to 04, or one neutral set                                                             | No                     | A, C, D, E, F; B in part. All 36 stored pages          |
| t07-L2               | Step icons, a calendar on step two (sections/steps.tsx:1, 8, 46)                                                                      | page (aria-hidden)                    | Numerals in the dashed rings                                                                      | No                     | A and C shown; others not verified                     |
| t07-L3               | Ids #booking-process, #book-appointment (steps.tsx:17; booking.tsx:24; contract.ts:244, 250, 303); target names (contract.ts:52, 200) | URL; copy model reads the names       | #steps, #contact, with the target names kept and mapped (copy-free, as t03-L9); rename them later | Id no; names yes: eval | F; C, D, E in part                                     |
| t07-L4               | Id #facilities, key `facilities` (facilities.tsx:17; contract.ts:47, 77, 168-173)                                                     | URL; copy model                       | #photos with the key mapped (copy-free); rename later                                             | Id no; key yes: eval   | A, D, E, F                                             |
| t07-L5               | Field `summit-doctor`, name `doctor` (booking.tsx:89, 94-95, 103-104; render summit-bakery-390.png)                                   | form data; URL when no email (:43-49) | `summit-person`, `person`                                                                         | No                     | A, C, D, E, F; B in part                               |
| t07-L6               | Field `summit-department`, name `department` (booking.tsx:122, 127-128)                                                               | form data, URL                        | `summit-service`, `service`                                                                       | No                     | all rows                                               |
| t07-L7               | Keys `doctor`, `department` (contract.ts:88-89, 186-191)                                                                              | copy model                            | `person`, `service`                                                                               | Yes: eval              | none seen (0 of 22)                                    |
| t07-L8               | "Open every day of the week" (contract.ts:148)                                                                                        | copy model                            | "such as where they work or who they serve"                                                       | Yes: eval              | none shown (0 of 22)                                   |
| t07-L9               | Purpose "what they have" for the grid link (contract.ts:144-145)                                                                      | copy model, then page                 | "a name for the four photographs"                                                                 | Yes: eval              | all rows (8 of 22 labels named something else; t07-D1) |
| t07-L10              | Guide examples copied word for word (contract.ts:152-192, 201)                                                                        | copy model, then page                 | Wording is neutral; the problem is t07-S4                                                         | n/a                    | form labels: as t07-S4; others none                    |
| t07-L11              | Fallback words, fixed labels, ornaments (contract.ts:374, 377, 446-451; services.tsx:46; faq.tsx:53-55; footer.tsx:78, 88, 118-125)   | page                                  | Keep                                                                                              | No                     | none                                                   |
| t07-L12 (added here) | Id #why-choose-us (sections/why.tsx:38; contract.ts:28, 39, 47)                                                                       | URL; copy model reads the target      | Keep, or #why with the target mapped                                                              | Id no                  | none (names no trade)                                  |

#### Vector (t08)

| Fix    | Element (path:line)                                                                                                                                                                                                                                                      | Channel                                            | Proposed change                                                     | Copy model            | Reads wrong for                                                |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- | ------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------- |
| t08-L1 | Guide "two to four pieces of work" (contract.ts:103-104)                                                                                                                                                                                                                 | copy model                                         | "two to four things they offer or are known for"                    | Yes: eval             | none in stored copy (0 of 25 invented work)                    |
| t08-L2 | Guide "their work" for the second nav link (contract.ts:95-96), to #projects (:36)                                                                                                                                                                                       | copy model, then page                              | "a name for the items, such as what they offer"                     | Yes: eval             | B, C, D, F ("Our Work" over food, facts and formats; 22 of 25) |
| t08-L3 | Guide "set in lower case in the bar as the source set its own" (contract.ts:93)                                                                                                                                                                                          | copy model, then page (logo.tsx:21; footer.tsx:52) | "the company name as given"                                         | Yes: eval             | all rows (25 of 25)                                            |
| t08-L4 | Marquee examples "Selected", "Work" (contract.ts:101-102; render vector-electrician-1440.png)                                                                                                                                                                            | copy model, then page                              | "two words naming what the items are"                               | Yes: eval             | B, C, D, F                                                     |
| t08-L5 | Anchor #projects, key `projects`, slot keys project-1 to 4 (sections/projects.tsx:456; contract.ts:23, 49, 121, 158, 290)                                                                                                                                                | URL; copy model                                    | #featured (copy-free with the target mapped); rename the keys later | Id no; keys yes: eval | B, C, D, F (footer link in 25 of 25)                           |
| t08-L6 | Examples "We craft experiences that captivate.", "Built to evolve ideas." (contract.ts:108, 116)                                                                                                                                                                         | copy model                                         | Examples drawn from no trade                                        | Yes: eval             | none (0 of 25)                                                 |
| t08-L7 | Fallback "Work", "Our Work", "Our work" (contract.ts:229, 236, 272, 279)                                                                                                                                                                                                 | page, fallback only                                | "What we do"                                                        | No                    | B, C, D, F on fallback pages (2 stored)                        |
| t08-L8 | Ornaments and fixed words: "Open", numbers 01 to 04, plus and cross, arrows, "Close overlay", "Scroll", "Services", "Navigation", "All rights reserved" (projects.tsx:144, 154, 296, 426; header.tsx:117-123; menu.tsx:98-110; contract.ts:100, 117-119; footer.tsx:135) | page, screen reader                                | Keep                                                                | n/a                   | none                                                           |

#### Universal defects (wrong for every business)

Ids are the fit records' own. "New" marks a finding from the measured geometry or this synthesis.

| Theme                                 | Ids (path:line)                                                                                                                                                                                                                                                                                         | What a visitor gets                                                                                                                                                                                     | Proposed fix (owner approves)                       | Copy model    |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------- |
| Counts above the brief's three        | t02-D5 (contract.ts:99-100), t03-S5 (contract.ts:87), t07-S1 (contract.ts:111)                                                                                                                                                                                                                          | Padding: 12 of 12, 13 of 13, 22 of 22 answers                                                                                                                                                           | Per structure: match three, or keep                 | Yes: eval     |
| Sets that repeat the brief's three    | t03-S7, t04-S6 (contract.ts:91-95), t05-S2 (contract.ts:92-93), t06-S3 (contract.ts:157-164)                                                                                                                                                                                                            | Word-for-word repeats in 5 of 8 (Atlas) and 5 of 7 (Harbor); restated reasons in 5 of 10 (Ember)                                                                                                        | Per structure                                       | Yes: eval     |
| Motives the sentence never gave       | t02-L10; Ember About ("Why we started" 6 of 22); Harbor About (t06-S6)                                                                                                                                                                                                                                  | Invented founding stories                                                                                                                                                                               | Guide wording                                       | Yes: eval     |
| Asks that go nowhere                  | t01-D3 (contract.ts:164; cta.tsx:11), t02-D4 (contract.ts:284; cta.tsx:11), t04-D2 (contract.ts:212, 218, 230, 238, 244, 264), t05-D2 (contract.ts:198, 204, 235, 242; booking.tsx:52-69)                                                                                                               | A button that points at its own section, or at steps with no form or link                                                                                                                               | Point each ask at a contact target                  | No            |
| Labels that do not match their target | t04-D1 (contract.ts:33, 125-126, 130, 211), t05-D5 (contract.ts:44, 194-197), t06-D2 (contract.ts:32, 133-134), t07-D1 (contract.ts:47), t08-D1 (contract.ts:112)                                                                                                                                       | Two "How it works" (7 of 8); the same label twice, "Get in touch" or "Book a visit" (9 of 9); "Reviews" with no reviews; "Frequently / Asked" (14 of 25)                                                | Guide wording per slot                              | Yes: eval     |
| Typed details in the URL              | t06-D4 (contact.tsx:75-81; footer.tsx:52-58), t07-D5 (booking.tsx:43-49, 56-86)                                                                                                                                                                                                                         | With no email, the form GETs every field into the URL                                                                                                                                                   | POST, or disable the form                           | No            |
| Hero words with no scrim              | t05-D4 (hero.tsx:17-36), t07-D2 (hero.tsx:16-24)                                                                                                                                                                                                                                                        | Prototype check: 2 of 10 and 1 of 15 stored heroes pass                                                                                                                                                 | A scrim (out of scope until approved)               | No            |
| Slot-0 picture hidden or clipped      | t01-D4 new (hero.tsx:48; product-frame.tsx:75-83), t04-D3 (hero.tsx:58)                                                                                                                                                                                                                                 | Aurora: 7% to 23% of a 3:2 picture shows below 1024 px, and an empty 240 px column shows from 1024 when there is no picture. Atlas: not drawn below 640 px                                              | Owner decides (design)                              | No            |
| Accessibility                         | t02-D1, D2 (=L6, L7), t03-D2 (benefits.tsx:18, 20 and others), t04-D4 (tools.tsx:42; footer.tsx:68), t07-D3 (facilities.tsx:44), t07-D6 (nav.tsx:76-142), t07-D7 (why.tsx:32, not verified), t08-D2 (services.tsx:24-44), t08-D4 (header.tsx:106-116), t08-D6 (projects.tsx:428; footer.tsx:58, 78, 88) | Wrong heading outline, unseen focus, no text alternative, a toggle not called "Menu"                                                                                                                    | Fix each                                            | No            |
| Behaviour                             | t05-D1 (dish.tsx:12-24), t05-D3 (dishes.tsx:29-39), t05-D7 new (about.tsx:19; features.tsx:49), t06-D1 (services.tsx:66-71), t06-D5 (metrics.tsx:38, computed)                                                                                                                                          | Upside-down picture after pointer entries; disc and square mixed; an empty About block 0 px wide from 768 px, and an empty feature block 0 px wide at every width; hover-only words that are not a link | Fix each                                            | No            |
| Loading and markup                    | t03-D3 (hero.tsx:57-58), t03-D4 (services.tsx:26; contact.tsx:61, 160), t07-D4 (cta.tsx:53, 60)                                                                                                                                                                                                         | A box declared 1200×1200; dead markup; a picture loaded on phones and never shown                                                                                                                       | Fix each                                            | No            |
| Mail and logo                         | t03-D1 (contact.tsx:68), t08-D5 (meta.ts:9; header.tsx:95), t08-D3 (ripple.tsx:59, 388, 392)                                                                                                                                                                                                            | Every mail subject reads "Send message"; a dark logo vanishes on Vector's dark pill; a fixed violet-to-pink duotone ignores the look                                                                    | Fix each; duotone is the owner's call               | No            |
| First screen                          | t08-D7 (docs/template-analysis.md:491, not re-measured)                                                                                                                                                                                                                                                 | No button in Vector's first screen                                                                                                                                                                      | Owner decides                                       | No            |
| Cost                                  | t06-D7 new (docs/pipeline-quality-plan.md:47), t01-D1 (tests/eval/pipeline.eval.ts:114-131)                                                                                                                                                                                                             | Harbor's 12-character value slots are missed on every attempt, so its answers cost $0.086 against $0.025 to $0.041 for the others. Aurora's first answer was not readable in 7 of 11 l6 calls           | Raise Harbor's cap (owner); the eval keeps raw text | Yes: eval; No |
| Descriptions                          | t02-D3, t03-D6, t04-D5, t05-D6, t06-D6; Summit and Vector part 7                                                                                                                                                                                                                                        | Each describes the example page                                                                                                                                                                         | Rewrite in Phase 3                                  | No            |
| Fallback only                         | t03-D5 (contract.ts:338), t01-L8                                                                                                                                                                                                                                                                        | Generic headings on fallback pages                                                                                                                                                                      | Neutral words                                       | No            |
| Eval tool                             | t01-D2 (tests/eval/screenshots.mjs:24-26)                                                                                                                                                                                                                                                               | Phone shots 435 px wide, no scroll                                                                                                                                                                      | Use the reduced-motion scroll script                | No            |
| Site wording                          | X-D1 new (app/start/_components/done-copy.ts:206-207, :219-221; lib/select/select.ts:41)                                                                                                                                                                                                                | On a third visit two designs are still unseen, yet the page says "You have seen every design we have"                                                                                                   | Owner's words (decision 14)                         | No            |

Not on this list: t09 and t10 leftovers (t09-L1 to L6, t10-L1 to L6). Those templates are not ready, so they are out of scope.

### Clash table

This table covers structures only. A cell says "clashes" only where stored model copy or a render shows that the row cannot fill the structure honestly. **No cell meets that bar.**

"doubt" marks a cell to label first in Phase 2. A blank cell means no structural clash was shown. Row F has no fixture, so its blank cells are unjudged, not cleared.

| Row            | Aurora                                                                               | Monolith                                                                         | Meridian | Atlas | Ember                                                                                                                  | Harbor | Summit                                                                                                            | Vector                                                                                        |
| -------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- | -------- | ----- | ---------------------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| A home or site |                                                                                      |                                                                                  |          |       |                                                                                                                        |        |                                                                                                                   |                                                                                               |
| B appointments | doubt (t01-S1: physio lines read as records, "notes", "progress"; 1 of 3 B answers)  |                                                                                  |          |       |                                                                                                                        |        |                                                                                                                   |                                                                                               |
| C made or sold |                                                                                      | doubt (t02-S6: the café's services became reasons, then welcomes; one C fixture) |          |       |                                                                                                                        |        | doubt (t07-S4: C rarely has a person to choose; bakery and florist got the person field from the guide)           | doubt (t08-S5: two-tone pictures drop the products' colour; no render)                        |
| D advice       | doubt (t01-S1: no model page, hr fell back; lines for intangible offerings untested) |                                                                                  |          |       | doubt (t05-S1: hr and longest item pictures were documents and handshakes)                                             |        | doubt (t07-S3: grid titles were ideas, "Local knowledge", "One fixed price"; longest's cells were office shots)   | doubt (t08-S1: intangible items that open full screen; no model page)                         |
| E creative     | doubt (t01-S1: the architects' lines invented stages in 2 of 2)                      |                                                                                  |          |       |                                                                                                                        |        | doubt (t07-S4: E rarely has a person to choose; architects got the person field)                                  |                                                                                               |
| F apps         |                                                                                      |                                                                                  |          |       | doubt (t05-S1, S5: a picture per offering and a full-screen photograph; F rarely has things to photograph; no fixture) |        | doubt (t07-S3, S4: four photographed subjects, a person and a date; F has no person and rarely books; no fixture) | doubt (t08-S1: an app's features as two to four items that each open full screen; no fixture) |
| U unclear      |                                                                                      |                                                                                  |          |       |                                                                                                                        |        |                                                                                                                   |                                                                                               |

**About the doubt cells**

- There are 13.
- Eight have stored model pages, so they need no new spend: Aurora B, Monolith C, Summit C, Vector C, Ember D, Summit D, Aurora E and Summit E.
- Five have none: Aurora D, Vector D, Ember F, Summit F and Vector F. These are the cells of size (c) in "The size of Phase 2", $0.18.

**Why some cells are blank**

- **Aurora C.** The bakery's "proving" and "in the oven" are 1 of 5 C answers. Aurora's fit record proposes C as a suits candidate, to re-check after t01-L2 and L7.
- **Summit A.** The person field strains for two-person firms, but that is sentence-level. The grid titles were abstract for vague and cleaning, and could be photographed for joinery.
- **Ember B.** The grid filled with no padding for physio-longest and tutors.
- **Vector B.** The dentist's items were facts, which is sentence-level.
- **Vector E.** Row E presumes named past work, which Vector's items take. It is flagged so that row E does not become Vector's only home.
- **Atlas.** Its six pictures sit beside words and none is tied to an item, so no doubt is proposed. It has not been rendered with pictures.

**Row U.** No structure is one that most arrivals cannot fill. Every structure was filled from the brief's three points, three steps and statement, or padded where the sentence was short (sentence-level). Revisit this once the /admin count shows how many arrivals are row F.

**Decision 6's named items map as follows**

| Item named in decision 6        | Where it lands                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------ |
| Summit's person and date fields | t07-S4: C, E, F                                                                |
| Picture-led layouts             | t05-S1 and t07-S3: D, F                                                        |
| Aurora's window chrome          | Leftovers t01-L1 to L6, not a structure. The panel's lines are t01-S1: B, D, E |
| Vector's full-screen items      | t08-S1: D, F                                                                   |
| Lucent's phone frame            | Not ready, out of scope (t10-S1)                                               |

#### Interim clashes from leftovers (lifts when fixed)

**How a leftover is counted:**

- It counts for a row when it reads wrong for the row's typical business. "In part" is not counted.
- It counts for U when it reads wrong for four or more of the six rows.
- A leftover that reads wrong for every row is listed only in the last row of the table. Routing on it would remove the template from every row.

Each cell lifts when its fixes ship.

| Row       | Aurora       | Monolith              | Meridian           | Atlas  | Ember                | Harbor                       | Summit               | Vector         |
| --------- | ------------ | --------------------- | ------------------ | ------ | -------------------- | ---------------------------- | -------------------- | -------------- |
| A         | t01-L1 to L6 |                       | t03-L3             | t04-L1 | t05-L1, L3, L6, L7   |                              | t07-L1, L2, L4, L5   |                |
| B         | t01-L1 to L6 |                       | t03-L3             | t04-L1 | t05-L1, L3, L7       |                              | (t07-L1, L5 in part) | t08-L2, L4, L5 |
| C         | t01-L1 to L6 |                       | t03-L3             | t04-L1 | (t05-L1, L3 in part) |                              | t07-L1, L2, L5       | t08-L2, L4, L5 |
| D         | t01-L1 to L6 |                       | t03-L3             | t04-L1 | t05-L1, L3, L6, L7   |                              | t07-L1, L4, L5       | t08-L2, L4, L5 |
| E         | t01-L1 to L6 |                       | t03-L3             | t04-L1 | t05-L1, L3, L6       |                              | t07-L1, L4, L5       |                |
| F         |              |                       |                    |        | t05-L1, L3, L6, L7   |                              | t07-L1, L3, L4, L5   | t08-L2, L4, L5 |
| U         | t01-L1 to L6 |                       | t03-L3             | t04-L1 | t05-L1, L3, L6, L7   |                              | t07-L1, L4, L5       | t08-L2, L4, L5 |
| Every row |              | t02-L1 to L7, L9, L10 | t03-L1, L2, L4, L7 | t04-L3 |                      | t06-L1, L4, L6, L7, L12, L13 | t07-L6, L9           | t08-L3         |

Blank F cells for Aurora, Meridian and Atlas are not judged, not cleared. The pools count those templates as eligible because unjudged is treated as neutral.

**What this table does to the pools.** Routing on its row-specific cells keeps Ember only in C and Summit only in B, because those rows' typical businesses include ones the leftover fits. It keeps Aurora, Meridian and Atlas only in F. C, B and F hold the source kinds of Ember, Summit, Aurora and Meridian, which is why routing on leftovers typecasts.

### Pools and visits

**How visits are counted.** Visits of three equal the pool divided by three, rounded down: a pool of 0 to 2 gives no full visit, 3 to 5 gives one, and 6 to 8 gives two.

**Sources.** The counts come from the scratchpad's synth-pools.mjs and synth-pools.txt, and the shortfalls from select-sim.mjs over 10,000 identities per row (synth-result-*.md). The scratchpad is `test-results/template-fit/`.

| Row | Today, no routing | Today, routing on row-specific leftovers (a)     | Today, routing on every leftover (b) | After all fixes, doubts eligible | After all fixes, doubts as clashes |
| --- | ----------------- | ------------------------------------------------ | ------------------------------------ | -------------------------------- | ---------------------------------- |
| A   | 8 (2)             | 3 (1): Monolith, Harbor, Vector                  | 0 (0)                                | 8 (2)                            | 8 (2)                              |
| B   | 8 (2)             | 3 (1): Monolith, Harbor, Summit                  | 0 (0)                                | 8 (2)                            | 7 (2)                              |
| C   | 8 (2)             | 3 (1): Monolith, Ember, Harbor                   | 1 (0): Ember                         | 8 (2)                            | 5 (1)                              |
| D   | 8 (2)             | 2 (0): Monolith, Harbor                          | 0 (0)                                | 8 (2)                            | 4 (1)                              |
| E   | 8 (2)             | 3 (1): Monolith, Harbor, Vector                  | 0 (0)                                | 8 (2)                            | 6 (2)                              |
| F   | 8 (2)             | 5 (1): Aurora, Monolith, Meridian, Atlas, Harbor | 1 (0): Aurora                        | 8 (2)                            | 5 (1)                              |
| U   | 8 (2)             | 2 (0): Monolith, Harbor                          | 0 (0)                                | 8 (2)                            | 8 (2)                              |

**What visit 2 gets, under the "fewer" shortfall rule:**

- Under (a), F gets two designs. A, B, C and E reach the call. D and U get two designs on visit 1 and the call on visit 2.
- After all fixes with doubts as clashes, visit 2 gets two designs in C and F, and one in D.

**Single fixes that change a pool on their own:**

| Fix    | Routing | Template returns to | Pools after             |
| ------ | ------- | ------------------- | ----------------------- |
| t03-L3 | a       | Meridian: A to E, U | A4 B4 C4 D3 E4 F5 U3    |
| t04-L1 | a       | Atlas: A to E, U    | A4 B4 C4 D3 E4 F5 U3    |
| t04-L3 | b       | Atlas: F            | F2, others unchanged    |
| t08-L3 | b       | Vector: A, E        | A1 E1, others unchanged |

**Every other change needs a template's whole set:**

| Template | Fixes that must all ship               | Pools after, routing (a)    | Pools after, routing (b) | All copy-free?                           |
| -------- | -------------------------------------- | --------------------------- | ------------------------ | ---------------------------------------- |
| Aurora   | t01-L1 to L6                           | A4 B4 C4 D3 E4 F5 U3        | A1 B1 C2 D1 E1 F1 U1     | Yes                                      |
| Monolith | t02-L1 to L7, L9, L10                  | unchanged (not routed in a) | A1 B1 C2 D1 E1 F2 U1     | No: L10                                  |
| Meridian | t03-L3 (a); t03-L1, L2, L3, L4, L7 (b) | A4 B4 C4 D3 E4 F5 U3        | A1 B1 C2 D1 E1 F2 U1     | Yes                                      |
| Atlas    | t04-L1 (a); t04-L1, L3 (b)             | A4 B4 C4 D3 E4 F5 U3        | A1 B1 C2 D1 E1 F2 U1     | No: t04-L1's key                         |
| Ember    | t05-L1, L3, L6, L7                     | A4 B4 C3 D3 E4 F6 U3        | A1 B1 C1 D1 E1 F2 U1     | No: L6, L7                               |
| Harbor   | t06-L1, L4, L6, L7, L12, L13           | unchanged (not routed in a) | A1 B1 C2 D1 E1 F2 U1     | No: L7, L12, L13                         |
| Summit   | t07-L1 to L5 (a); plus L6, L9 (b)      | A4 B3 C4 D3 E4 F6 U3        | A1 B1 C2 D1 E1 F2 U1     | (a) yes, with the ids mapped; (b) no: L9 |
| Vector   | t08-L2, L4, L5 (a); plus L3 (b)        | A3 B4 C4 D3 E3 F6 U3        | A1 B1 C2 D1 E1 F2 U1     | No                                       |

**Fixes that keep every row at six or more (two visits):**

- **No routing (recommended under decision 1).** Every row stays at eight today, and no fix is needed for the pools.
- **Routing (a), row-specific leftovers.**
  - The copy-free fixes t01-L1 to L6, t03-L3 and t07-L1 to L5 (with the ids mapped) give A6 B5 C6 D5 E6 F6 U5.
  - Adding t04-L1, whose key rename needs an eval run, gives A7 B6 C7 D6 E7 F6 U6.
- **Routing (b), every leftover.**
  - Every copy-free fix gives A2 B2 C3 D2 E2 F3 U2.
  - Six in every row then needs the whole sets of any four of Monolith, Atlas, Harbor, Ember, Vector and Summit. All 15 such sets of four were checked, and each includes a fix the copy model sees.
  - At today's cost per answer on their stored l6 fixtures, the cheapest four to measure are Atlas, Vector, Ember and Monolith, at about $0.93 (estimate: 5 × $0.033 + 8 × $0.025 + 7 × $0.039 + 8 × $0.037).
  - Measuring every copy-changing fix on all 60 l6 pairs is about $2.33 (estimate).
- **Still short after all fixes:**
  - none, if the doubts stay eligible;
  - C (5), D (4) and F (5), if the owner approved every doubt as a clash. No leftover fix lifts these; only labels can.

### Variety

**How it was simulated.** select-sim.mjs ran the proposed rule from "The selection rule" over 10,000 seeded identities per row: visit 1, then visit 2 with visit 1's templates seen. It used the tones in each meta.ts:10 and the "fewer" shortfall rule. The inputs come from synth-inputs.mjs, and the results are in synth-result-after-*.md and synth-variety.md in the scratchpad. All four tables are illustrative.

**Suits labels are illustrative, not proposals.** They are taken from each fit record's suits candidates:

| Template | Illustrative suits rows |
| -------- | ----------------------- |
| Aurora   | A, C                    |
| Monolith | A, B, D                 |
| Meridian | A, D                    |
| Atlas    | A, D                    |
| Ember    | A, B                    |
| Harbor   | A, D, E                 |
| Summit   | A, C                    |
| Vector   | A, B                    |

- That gives row A eight suits candidates, B three, C two, D four and E one. **No suits candidate is proposed for F or U.**
- Summit's suits label in C is dropped when its doubt counts as a clash.

#### Two tiers, doubts eligible: pooled over the seven rows (70,000 identities)

Every row came within 0.9 points of the pooled share on visit 1.

| Template | Visit 1 Design one | Visit 1, any of three | Visit 2 Design one | Visit 2, any of three | Either visit |
| -------- | ------------------ | --------------------- | ------------------ | --------------------- | ------------ |
| Aurora   | 12.4%              | 43.6%                 | 11.2%              | 39.1%                 | 82.8%        |
| Monolith | 12.6%              | 35.2%                 | 13.1%              | 38.5%                 | 73.6%        |
| Meridian | 12.5%              | 35.1%                 | 13.1%              | 38.3%                 | 73.3%        |
| Atlas    | 12.5%              | 34.6%                 | 13.0%              | 36.2%                 | 70.7%        |
| Ember    | 12.5%              | 43.9%                 | 11.3%              | 39.2%                 | 83.1%        |
| Harbor   | 12.6%              | 35.0%                 | 13.1%              | 36.3%                 | 71.4%        |
| Summit   | 12.7%              | 44.1%                 | 11.0%              | 38.9%                 | 82.9%        |
| Vector   | 12.4%              | 28.6%                 | 14.4%              | 33.6%                 | 62.2%        |

#### Two tiers, doubts as clashes

**How to read the next three tables:**

- Each cell gives four whole percentages: visit 1 Design one / visit 1 any of three / visit 2 Design one / visit 2 any of three.
- "out" means the template is not eligible in that row.
- Rows A and U match the pooled table above.

| Row        | Aurora            | Monolith          | Meridian          | Atlas             | Ember             | Harbor            | Summit            | Vector            | Visit 2 designs |
| ---------- | ----------------- | ----------------- | ----------------- | ----------------- | ----------------- | ----------------- | ----------------- | ----------------- | --------------- |
| B (pool 7) | out               | 14 / 40 / 15 / 48 | 15 / 41 / 15 / 47 | 14 / 39 / 15 / 42 | 15 / 54 / 11 / 40 | 15 / 40 / 15 / 43 | 14 / 55 / 12 / 40 | 14 / 31 / 17 / 41 | 3               |
| C (pool 5) | 20 / 60 / 20 / 40 | out               | 20 / 60 / 20 / 40 | 20 / 61 / 20 / 40 | 20 / 59 / 20 / 41 | 20 / 60 / 20 / 40 | out               | out               | 2               |
| D (pool 4) | out               | 25 / 50 / 50 / 50 | 25 / 50 / 50 / 50 | 25 / 100 / 0 / 0  | out               | 25 / 100 / 0 / 0  | out               | out               | 1               |
| E (pool 6) | out               | 17 / 47 / 18 / 53 | 16 / 46 / 18 / 54 | 16 / 48 / 17 / 52 | 17 / 78 / 7 / 22  | 16 / 48 / 18 / 52 | out               | 17 / 34 / 23 / 67 | 3               |
| F (pool 5) | 20 / 70 / 15 / 30 | 20 / 45 / 27 / 55 | 20 / 45 / 27 / 55 | 20 / 70 / 15 / 30 | out               | 20 / 71 / 15 / 30 | out               | out               | 2               |

#### Suits first (illustrative suits), doubts eligible

Rows A (every template suits), F and U (no suits) match the pooled table above.

| Row        | Aurora           | Monolith          | Meridian          | Atlas            | Ember            | Harbor            | Summit           | Vector           | Visit 2 designs |
| ---------- | ---------------- | ----------------- | ----------------- | ---------------- | ---------------- | ----------------- | ---------------- | ---------------- | --------------- |
| B (pool 8) | 0 / 0 / 20 / 61  | 34 / 100 / 0 / 0  | 0 / 0 / 20 / 60   | 0 / 0 / 20 / 59  | 33 / 100 / 0 / 0 | 0 / 0 / 20 / 60   | 0 / 0 / 20 / 60  | 33 / 100 / 0 / 0 | 3               |
| C (pool 8) | 50 / 100 / 0 / 0 | 0 / 17 / 17 / 46  | 0 / 17 / 17 / 47  | 0 / 17 / 17 / 50 | 0 / 16 / 17 / 73 | 0 / 17 / 16 / 50  | 50 / 100 / 0 / 0 | 0 / 17 / 16 / 33 | 3               |
| D (pool 8) | 0 / 0 / 0 / 51   | 25 / 50 / 50 / 50 | 25 / 50 / 50 / 50 | 25 / 100 / 0 / 0 | 0 / 0 / 0 / 50   | 25 / 100 / 0 / 0  | 0 / 0 / 0 / 50   | 0 / 0 / 0 / 49   | 3               |
| E (pool 8) | 0 / 34 / 14 / 46 | 0 / 31 / 14 / 40  | 0 / 30 / 14 / 40  | 0 / 35 / 12 / 30 | 0 / 35 / 13 / 46 | 100 / 100 / 0 / 0 | 0 / 35 / 13 / 46 | 0 / 0 / 20 / 53  | 3               |

#### Suits first (illustrative suits), doubts as clashes

| Row        | Aurora            | Monolith          | Meridian          | Atlas             | Ember            | Harbor            | Summit          | Vector           | Visit 2 designs |
| ---------- | ----------------- | ----------------- | ----------------- | ----------------- | ---------------- | ----------------- | --------------- | ---------------- | --------------- |
| B (pool 7) | out               | 34 / 100 / 0 / 0  | 0 / 0 / 25 / 75   | 0 / 0 / 25 / 74   | 33 / 100 / 0 / 0 | 0 / 0 / 25 / 75   | 0 / 0 / 25 / 75 | 33 / 100 / 0 / 0 | 3               |
| C (pool 5) | 100 / 100 / 0 / 0 | out               | 0 / 50 / 25 / 50  | 0 / 50 / 25 / 50  | 0 / 50 / 25 / 51 | 0 / 51 / 25 / 50  | out             | out              | 2               |
| D (pool 4) | out               | 25 / 50 / 50 / 50 | 25 / 50 / 50 / 50 | 25 / 100 / 0 / 0  | out              | 25 / 100 / 0 / 0  | out             | out              | 1               |
| E (pool 6) | out               | 0 / 43 / 19 / 57  | 0 / 41 / 19 / 59  | 0 / 58 / 14 / 42  | 0 / 58 / 14 / 42 | 100 / 100 / 0 / 0 | out             | 0 / 0 / 34 / 100 | 3               |
| F (pool 5) | 20 / 70 / 15 / 30 | 20 / 45 / 27 / 55 | 20 / 45 / 27 / 55 | 20 / 70 / 15 / 30 | out              | 20 / 71 / 15 / 30 | out             | out              | 2               |

**Eligible templates never chosen**

**Over both visits, no eligible template went unchosen in any of the four runs.** On a single visit, these were never chosen:

| Run                            | Never chosen on one visit                                                                                                                                                                                                   |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Two tiers, doubts eligible     | none                                                                                                                                                                                                                        |
| Two tiers, doubts as clashes   | D, visit 2: Atlas and Harbor (on every visit 1)                                                                                                                                                                             |
| Suits first, doubts eligible   | B visit 1: Aurora, Meridian, Atlas, Harbor, Summit. B visit 2: Monolith, Ember, Vector. C visit 2: Aurora, Summit. D visit 1: Aurora, Ember, Summit, Vector. D visit 2: Atlas, Harbor. E visit 1: Vector. E visit 2: Harbor |
| Suits first, doubts as clashes | B visit 1: Meridian, Atlas, Harbor, Summit. B visit 2: Monolith, Ember, Vector. C visit 2: Aurora. D visit 2: Atlas, Harbor. E visit 1: Vector. E visit 2: Harbor                                                           |

**What the runs show**

- **Suits first spends every suits template on visit 1.** Design one came from suits on 100% of visit 1s in every row that had a suits label. On visit 2 the figure was 0% in B, C and E, and 100% in A and D, where more than three templates suit.
- **Shared tones move templates between visits.** The rule counts tones across tiers. In row E, Harbor (the only suits template) takes "bold" as Design one, so Vector, which shares "bold", never appears on visit 1. Monolith and Meridian share "card", and Atlas and Vector share "editorial", with the same effect wherever both are in one tier.
- **Rows with no suits candidate:** F and U. E has one.
- **Shared tones also set the shares with no labels.** Design one is even, because the first pick has no tones to avoid. The other places are not. Monolith and Meridian share "card", Atlas and Vector share "editorial", and Harbor and Vector share "bold" (templates/*/meta.ts:10), while Aurora, Ember and Summit share none. So in the pooled table Vector reaches 62.2% of identities over two visits, while Aurora, Ember and Summit reach about 83%. The same effect leaves Atlas and Harbor at five fixtures each in the eval's first-visit mix (Selection simulator, Checks).
- **The tone renames change none of this.** Each renamed tone, and each replacement (sleek, welcoming, energetic or forceful, crisp, cinematic), belongs to only one ready template (meta.ts:10 of all ten).
  - One clash in the wider proposals: Lucent's proposed "polished" is already Meridian's tone. It would become shared when Lucent is ready.

## Part 4. Options and the size of Phase 2

### Knowing the category before select (decision 3)

Today the select step (lib/inngest/functions/build-concepts.ts:55-70) runs straight after the logo step (:52). It runs before tokens (:84-96) and before the brief (:99-108). At select, the only business signals are the visitor's sentence and the company name.

The only measured model timings come from run l6-all-fixes:

- The brief call (Sonnet 5) took 1,483 tokens in and 538 out, 6.4 s on average, 5.5 to 7.7 s across its 20 calls, and cost $0.0083 a submission.
- The rank call (Haiku 4.5, with pictures) took 2.2 s on average and 4.2 s at most.

Sources: docs/pipeline-quality-plan.md:40-45; test-results/eval/l6-all-fixes/summary.json `cost.byStage`; each fixture record's `brief.calls[].ms`, which I counted. A submission costs $0.135 on average (ADR 0044:27).

#### The options

| Option                                                                                  | Where it goes                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Cost a submission (estimate)                                                                                                                                                 | Added before select                                                    | When the posters fill                                                                                                                                       | On failure                                                                                                                                                                                                                      |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A. A separate category call                                                             | A new lib/ai/category.ts, built like lib/ai/brief.ts:13-31. Its prompt sits beside briefPrompt (lib/ai/prompts.ts:21). A wrapper built like lib/logo/stage.ts:17-49. A new step between logo (build-concepts.ts:52) and select (:55), or run beside the logo step. The category goes into selectTemplates (:60-66). A 'category' stage is added to lib/ai/usage.ts:8 and tests/eval/pipeline.eval.ts:59. Timeout, model and max_tokens go in lib/config.ts:4-11,113,116 | about $0.0009 with Haiku 4.5, about $0.0019 with Sonnet 5 (+0.7% or +1.4% on $0.135)                                                                                         | not measured; estimate 1 to 3 s, plus one more step                    | every part (layout, colour, headlines, photos) arrives later by the call's time                                                                             | catch, log, return "unclear", never throw; one attempt. A timeout in lib/config.ts, inside the owner's ceiling, ends it as "unclear"                                                                                            |
| B. Brief moved before select, with a category field                                     | Move build-concepts.ts:99-108 above :55. Add a category field to briefSchema (lib/copy-slots/brief.ts:11-26); fallbackBrief (:50-69) returns "unclear". Add one line to briefPrompt (lib/ai/prompts.ts:21-38)                                                                                                                                                                                                                                                           | about +$0.0011 (Sonnet 5). Any change to the category list changes the brief prompt, so brief and copy must be re-measured through the eval ($2.71 a full pass, ADR 0044:28) | 5.5 to 7.7 s (the l6 brief calls)                                      | layout and colour 5.5 to 7.7 s later. Headlines and photos arrive as today, because they already wait for the brief. The whole build takes as long as today | the brief's own fallback: three attempts with 20 s timeouts and 20 s pauses (lib/config.ts:5,21,25; lib/inngest/stages.ts:47-48), so up to 100 s before "unclear". A permanent model error falls back at once (stages.ts:56-60) |
| C. Fixed rules over the sentence and the company name                                   | A pure function with its word lists kept as data (for example lib/category/rules.ts), called inside the select step at build-concepts.ts:60-66. Nothing new in lib/ai                                                                                                                                                                                                                                                                                                   | $0                                                                                                                                                                           | none measurable                                                        | as today                                                                                                                                                    | cannot throw. No match, or two categories matching, gives "unclear"                                                                                                                                                             |
| D. A kind-of-business picker                                                            | Inside question 1: app/start/_components/steps/describe-step.tsx:35, with its words in start-copy.ts:233-242. An optional field in describeSchema (lib/brief/schema.ts:13-19), submissionAnswersSchema (lib/brief/submission.ts:14-26) and the payload hash (lib/identity/payload.ts:14-27). As a new question, also lib/brief/question-ids.ts:8                                                                                                                        | $0                                                                                                                                                                           | none at build time. The visitor's extra time on /start is not measured | as today                                                                                                                                                    | a skipped picker, or "Other", falls back to C or to "unclear". The schema refuses an unknown value                                                                                                                              |
| E. For comparison only: a model reads the descriptions and the sentence and picks three | A call like A, whose answer replaces selectTemplates (lib/select/select.ts:37-55)                                                                                                                                                                                                                                                                                                                                                                                       | about $0.0040 with Sonnet 5, about $0.0020 with Haiku 4.5                                                                                                                    | not measured; its input is larger than A's                             | every part arrives later by the call's time                                                                                                                 | falls back to the seeded selector. Its picks must still be checked against `seen` and the clash table                                                                                                                           |

**How the costs were estimated** (all estimates):

- **Characters per token.** The brief call's text came to 736 tokens: an 866-character system prompt and a user turn of about 1,500 characters (docs/pipeline-quality-plan.md:32; I counted the lengths in lib/ai/prompts.ts). That is about 3.2 characters a token.
- **Option A:** a short system prompt (about 400 characters), about ten categories at about 120 characters each, the company and sentence (up to 480 characters), an instruction (about 300 characters) and an enum schema (about 100 tokens). That makes about 850 tokens in and 15 out.
- **Option B:** the same list and field added to the brief call, about 520 tokens in and 10 out.
- **Option E:** the descriptions of the eight ready templates total 3,995 characters (my count), giving about 1,850 tokens in and 30 out. Those descriptions describe the example pages, so they would have to be rewritten first.
- **Prices:** per million tokens, Sonnet 5 is $2 in and $10 out, Haiku 4.5 is $1 in and $5 out (ADR 0044:28).

**How the posters move.** A poster draws its parts as the build goes:

- its layout once select names the template, and its colour once tokens has run (app/preview/_components/design-poster.tsx:9-12);
- its headline once copy has settled, and its photo once imagery has settled (lib/preview/status.ts:126-127,149-150).

Every step after select waits for select (build-concepts.ts:55-132), so any step placed before select delays every part. Option B is the exception: the brief already comes before copy and imagery, so only the layout and colour move.

**Checking for designs left before any paid call.** Today an exhausted visit makes no model call, because the brief runs after select's exhausted branch (build-concepts.ts:74-82). Options A, B and E would make a paid call before select. Each therefore needs a free step first:

- it counts the ready templates this identity has not seen, reading `seen` the way lib/db/exclusivity.ts:39-42 does;
- it skips the call when fewer remain than the designs fixed at submit.

Two submissions racing for one identity can still waste one call. The identity limit is three submissions a day (lib/config.ts:29).

#### Testing, documents, public lines and privacy

| Option | Tested without paid calls                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | ADRs and docs it changes                                                                                                                                                                                                                                                                                                                | Public lines it changes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | What reaches a model                                                                                                     |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| A      | Unit tests with the client mocked, as lib/ai/rank.test.ts:6-11 does: an answer on the list, an answer off it, a timeout and a refusal each end in a category or "unclear". A prompt test that only the company and sentence are sent. A test that no call is made when no designs are left. Agreement with the owner's categories needs a paid eval stage (estimate: about 40 calls over 20 fixtures and the held-out ones, about $0.04 with Haiku). CI can re-check it only from stored answers | docs/pipeline-plan.md:11 ("No AI call ever picks a template": a model would steer the pick) and its step table (:187-195). ADR 0009 (steps), ADR 0011 (a new model stage checked by code), ADR 0044 (cost)                                                                                                                              | The "Is this AI?" answer (app/_components/straight-answer-items.ts:34) and its register row (docs/claims-register.md:18) need the owner's words saying that the model's reading of the sentence steers which designs are shown. The privacy page's Anthropic line (app/privacy/privacy-copy.ts:17) also changes. app/_components/copy.test.ts:33 pins how often "AI" appears. "Five questions" and "five answers" stay true                                                                                                                                             | the company name and the sentence only. The brief call also sends the look (lib/ai/prompts.ts:23-25); this call need not |
| B      | The same mocks. Agreement comes only from paid brief runs, and any change to the list means re-running brief and copy                                                                                                                                                                                                                                                                                                                                                                            | As A, plus the stage order in docs/pipeline-plan.md:191-193, app/start/_components/done-progress.ts:26 and lib/db/submissions.ts:14, because the brief would land before select. The copy prompt carries the whole brief as JSON (lib/ai/prompts.ts:53), so the category must be removed before copy, or the copy model's input changes | as A                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | what the brief sends today: company, sentence and the look's label and detail (lib/ai/prompts.ts:23-25)                  |
| C      | Free CI unit tests over every fixture, checked against the owner's category, plus held-out fixtures it was not tuned on (decision 11). Any change is re-tested for free                                                                                                                                                                                                                                                                                                                          | docs/pipeline-plan.md:133,191 (select's inputs); ADR 0009                                                                                                                                                                                                                                                                               | none                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | nothing                                                                                                                  |
| D      | Schema tests. A test that the 20 frozen fixtures keep their stored seeds: JSON.stringify drops a field that is undefined, so an absent kind leaves the hash unchanged (checked in Node). /start e2e that reaches states through the reducer, never by submitting                                                                                                                                                                                                                                 | ADR 0037 and docs/start-page-journey-plan.md. The questionnaire is out of scope unless the owner says so                                                                                                                                                                                                                                | Inside question 1: none, "five questions" stays true. As a new question it makes these untrue: lib/brief/question-ids.ts:1-8, app/start/page.tsx:13, app/start/_components/start-copy.ts:64, app/contact/_components/contact-copy.ts:146, app/preview/_components/hub.tsx:118, app/preview/[slug]/page.tsx:21, app/preview/[slug]/opengraph-image.tsx:64, lib/email/preview-link.ts:41, app/start/_components/draft-copy.ts:62, app/_components/section-copy.ts:22, app/privacy/privacy-copy.ts:35, lib/site.ts:14,119-120, PRODUCT.md:15 and docs/claims-register.md:9 | nothing                                                                                                                  |
| E      | Mocked tests only. No test can say in advance what a submission gets                                                                                                                                                                                                                                                                                                                                                                                                                             | Makes docs/pipeline-plan.md:11 untrue outright, and breaks the brief's same-input-same-answer rule and the seeded shuffle (lib/select/select.ts:33-36,43; docs/pipeline-plan.md:133). ADR 0009, ADR 0011                                                                                                                                | as A, and the answer must say that AI chooses which designs you see                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | company, sentence and the template descriptions                                                                          |

#### Store the category on the row?

Yes, I recommend it.

- **A run does not need it.** Inngest memoises each step's result (build-concepts.ts:24-26).
- **The owner does need it to check categories on real briefs.** /admin can only show what is stored, and only a stored value can be compared with the owner's later judgement.
- **What it takes:** a migration (the last is db/0010_enquiry.sql, so this would be 0011). It adds a nullable category and how it was set (rules, model, picker, or "unclear" after a failure), written by the select step. A new brief_overview view (db/0008_brief_overview.sql) would show it.
- **Privacy:** it is derived from the sentence the row already holds, and it is deleted with the row.

#### Recommendation

Option C: fixed rules over the sentence and the company name, "unclear" on no match or a tie, and the result stored on the row. The reasons:

1. Only C lets CI prove the category on every fixture for free, which "What success looks like" asks for. A model's answers can be checked in CI only from stored outputs.
2. It costs nothing, adds no seconds and cannot fail. The same inputs always give the same category.
3. It changes no public line and sends nothing new to a model. "Is this AI?", the privacy page and docs/pipeline-plan.md:11 all stay true.
4. About $2 of this month's $30 is left, and measuring a model's agreement would need a paid run.

The risk is that its accuracy is unknown on wording it was not tuned on. Measure it on held-out fixtures and on real briefs at /admin.

If its misses or its "unclear" rate go past the owner's targets (decision 9), add option A as the upgrade:

- Haiku 4.5, in its own memoised step;
- only after the free check for designs left;
- perhaps only for briefs the rules leave "unclear".

That upgrade changes the "Is this AI?" answer.

The other options:

- **D** is worth it only if the owner opens up the questionnaire. Inside question 1 it keeps "five questions" true.
- **B** ties the category to the copy model's input and makes the poster layouts wait 5.5 to 7.7 s.
- **E** is listed for comparison only.

### The selection rule (decision 4)

#### The rule, kept pure

Proposal: selectTemplates (lib/select/select.ts:18-26,37-55) gains three inputs and a labelled answer. It stays a pure function: no lib/ai, no lib/db, no clock, no Math.random.

- **`fitOf`**: this category's row of the owner's table (clashes, neutral, suits or unjudged). build-concepts passes it in as data, so lib/select imports nothing new.
- **`tiers` and `shortfall`**: settings in lib/config.ts.
- **The answer**: designs (a list of ids), exhausted, or no fit. Today an empty list means exhausted everywhere (lib/preview/status.ts:74-76; docs/pipeline-plan.md:191). So "no fit" must never come back as an empty list.

How it picks, as the simulator does:

1. Take the ready templates this identity has not seen, sort them by id, and shuffle them once with today's seeded generator (lib/select/prng.ts).
2. Split that order into tiers, keeping its order. Hold back the templates that clash.
3. Fill each place from the highest tier with a template left. Within a tier, use today's rule: the first template whose tones are all new (counting tones already taken from higher tiers), else the next in shuffled order.
4. Return "exhausted" only when fewer unseen ready templates remain than the count (select.ts:41, as today).

With no clash and no suits label, this returns exactly today's ids. The simulator found 0 differences over 20,000 random seeds and seen sets, for each tier rule. So it can ship before any label exists.

Removing the clashes before shuffling would also give the same answer every time. But then every pick in a category would move whenever one label in that category changed.

#### Two tiers or three

The simulator column below comes from an illustrative check: suits labels were given by id order, not proposed, over 10,000 identities.

| Rule                              | What it does                                                            | What the simulator shows                                                                                                                                                                                                                                                                   |
| --------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Two tiers                         | eligible or clashes; "suits" plays no part                              | variety as today, within the pool                                                                                                                                                                                                                                                          |
| Suits first (the brief's default) | suits, then neutral and unjudged; Design one from the highest tier left | With one to three suits templates, every visit 1 holds all of them. Design one is a suits template on 100% of visit 1s and on 0% of visit 2s. Tones still count across tiers: with Aurora and Monolith labelled suits, Meridian (which shares "card" with Monolith) appeared on no visit 1 |
| Suits lead (a variant)            | Design one from suits; every other place from all eligible templates    | Design one is from suits on 100% of visit 1s, and on 86% (two suits) or 100% (three suits) of visit 2s. With three suits, each was shown to 80% to 84% of identities over two visits, against 100% under suits first                                                                       |
| Design one must be suits          | as suits first, but no Design one unless it suits                       | With one to three suits templates, none is left by visit 2, so every visit 2 hits the shortfall rule. Until the owner labels anything, every visit does                                                                                                                                    |

Recommendation: suits first, without "Design one must be suits". Until the owner labels anything, it gives today's choice. Before choosing between suits first and suits lead, re-run the simulator on the owner's labels. That choice is between spending the best fits on visit 1 and spreading them over two visits.

#### When too few unseen templates fit

The number of designs is fixed at submit (app/start/_components/actions.ts:130, using conceptCountFor at lib/select/select.ts:8-10). Posters for that number are drawn before select runs. The status, the hub and the email all follow it (lib/preview/status.ts:81; app/preview/_components/hub.tsx:105; lib/inngest/functions/send-preview-link.ts:50).

When the shortfall happens:

- **Visit 1:** only if a category has fewer than three eligible templates.
- **Visit 2:** whenever a category has three to five. Under routing (a) in Pools and visits that is rows A, B, C, E and F; after all fixes with doubts as clashes, rows C, D and F.
- **Any visit after the category changes:** for example, when the visitor rewrites the sentence. This is not simulated.

An owner minimum of six eligible templates for every category, "unclear" included, checked by a test over the clash table, removes the first two cases. The shortfall can then come only from a category change, or from a pool shrunk by an interim clash before its fix ships.

|                                            | Fewer designs, with true words                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | A template that clashes                                                                           | The call                                                                                                                                                                                              |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What the visit gets                        | the fitting ones (one or two); the call when none fits                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | three, with clashing ones last; Design one is never a clash while any template fits               | no designs; words that say why, and the call                                                                                                                                                          |
| lib/select/select.ts                       | returns the fitting ones; "none fit" is its own answer, not an empty list                                                                                                                                                                                                                                                                                                                                                                                                                                                     | fills the last places from the held-back clashes                                                  | returns "no fit"                                                                                                                                                                                      |
| lib/db/exclusivity.ts                      | a short list is saved as now; the empty-list check (:46) must not stand for "none fit"                                                                                                                                                                                                                                                                                                                                                                                                                                        | no change                                                                                         | "no fit" saves nothing to `seen` and must reach the row as itself                                                                                                                                     |
| lib/brief/status.ts, lib/preview/status.ts | the count must follow the ids: StagePatch (lib/db/submissions.ts:211-213) gains conceptCount, written by select, so statusOf builds the right number of designs (status.ts:81)                                                                                                                                                                                                                                                                                                                                                | no change                                                                                         | a new status value (lib/brief/status.ts:26) and a stored reason, because an empty list already means exhausted (status.ts:74-76). That means a new column, so a migration                             |
| done-copy, hub, email                      | count words already cover one and two (app/start/_components/done-copy.ts:97-100,184-196; lib/email/preview-link.ts:34-41). The third poster, drawn since submit, drops when select runs, because the done page follows the poll's count (app/start/_components/done-boundary.tsx:183)                                                                                                                                                                                                                                        | no change                                                                                         | new STOPPED and HUB_STOPPED entries (done-copy.ts:199-222), plus brief-done.tsx:377, hub.tsx:43,80-99 and app/admin/_components/brief-view.ts:34-37,64. No email is sent (send-preview-link.ts:34-41) |
| Public lines                               | The second-visit answer "we'll show you three you haven't seen" (app/_components/straight-answer-items.ts:13-14). Its switch on six ready templates (:17-20, pinned by app/_components/copy.test.ts:81-84) should switch on the smallest category pool instead. The /start lines a returning visitor reads, "three designs are about five minutes away" and "Show me my three designs" (start-copy.ts:98-99). The claims register's "About five minutes to three designs" and "Three designs" (docs/claims-register.md:10-11) | none today. Goal 1 gives way, by the owner's leave. Any future line promising fit would be untrue | the second-visit answer and its switch, as for "fewer designs", and the e2e specs that pin the stopped words                                                                                          |
| Model cost                                 | less: fewer copy calls                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | as today                                                                                          | none, as for an exhausted visit (build-concepts.ts:74-82)                                                                                                                                             |

**A wording problem found while checking.** With eight ready templates, a third visit leaves two unseen, and select returns an empty list (select.ts:41). The done page then says "You have seen every design we have for now." and "Every design we can build has been shown to this address" (done-copy.ts:206-207). The hub says "Every design we have has been shown to this address." (:219-221). Two designs have not been shown. These lines are not in docs/claims-register.md (a search for "every design" finds nothing). They belong with decision 13.

**Recommendation.** Set the minimum at six for every category and test it, so the shortfall is rare. For the rare case, give fewer designs with true words, and the call when none fits. This keeps goal 1 without asking the owner to allow clashes. It reuses count words that already exist, and it costs less.

It needs the owner's words for the second-visit answer and for the /start lines. The "none fits" case still needs the call's new status. If the owner wants no new status, a clash fill for that case alone is the smallest change. If the owner wants no public line touched now, the clash fill is the only option that changes none.

#### What visit 2 gets

- **The setup:** the same identity, with visit 1's three marked as seen. The seed is new, because only a changed answer makes a new submission (actions.ts:50-57; lib/identity/payload.ts:14-27). The category is worked out again from the new answers.
- **A pool of six or more:** three fitting designs. In the seven-row run (Variety), with all eight eligible, that is three of the five unseen, and Design one on visit 2 ranges from 11.0% (Summit) to 14.4% (Vector).
- **A pool of three to five:** the shortfall rule, on every visit 2.
- **Under suits first:** visit 2 gets a suits template only when more than three were labelled suits.
- **Tones** start again each visit (select.ts:45).
- **A third visit:** none with eight ready templates (exhausted, as today). With ten ready and a pool of nine or more, a third visit could happen. The owner's four visits (ADR 0043) are not built.

#### Tests needed (pure, run in CI, free)

1. No clash and no suits label: today's ids, over many seeds and seen sets, for each tier rule.
2. Zero, one, two, and three or more fitting templates, with three or more unseen: the chosen shortfall answer, and never an empty list because of fit.
3. Exhausted only when fewer unseen ready templates remain than the count.
4. No approved clash is chosen while enough fitting templates remain (a property test over seeds and random tables).
5. Design one comes from the highest tier left, and tone variety never moves a template across tiers.
6. The same seed, seen set and category give the same answer; lib/select uses no Math.random and no clock.
7. A second visit: the same fixture with one answer changed, the category worked out again, and visit 1's templates seen.
8. An "unclear" business.
9. Every category in the owner's table, "unclear" included, keeps at least the owner's minimum (a number in lib/config.ts).
10. The range assertions N and M, replacing the coverage test (tests/eval/pipeline.eval.ts:509-540).
11. The count or the new status in lib/preview/status.test.ts and the done-copy tests, and the second-visit switch in app/_components/copy.test.ts:81-84.

### Selection simulator

All files are in test-results/template-fit/:

- **The script:** select-sim.mjs.
- **The inputs:** the six seven-row inputs that synth-inputs.mjs writes from the repo's meta.ts files (synth-today-a.json, synth-today-b.json and the four synth-after-\*.json), used by Pools and visits and Variety; and sim-mechanism-suits.json, used by "Two tiers or three".
- **The results:** synth-result-\*.json and .md, synth-variety.md (written by synth-tables.mjs), and sim-result-mech and sim-result-mech-lead, each as .json and .md.

To run it from Bash with Node 24:

- `node select-sim.mjs --check`
- `node select-sim.mjs <input.json> --n 10000 [--tier two-tier|suits-first|suits-lead] [--shortfall fewer|clash|call] [--out result.json] [--detail]`

#### Input

| Field             | Meaning                                                                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| templates         | id, ready and tones. Polarity is not read, because every template is 'either'                                                             |
| categories        | the list, "unclear" included                                                                                                              |
| eligibility       | category, then template, then one of: clashes, neutral, suits or unjudged. A missing pair counts as unjudged, which is treated as neutral |
| aliases           | optional; maps another label onto one of these, for example {"doubt": "neutral"} or {"doubt": "clashes"}                                  |
| tierRule          | two-tier, suits-first or suits-lead                                                                                                       |
| shortfall         | the rule whose shares are printed: fewer, clash or call. All three are always counted                                                     |
| count, identities | designs a visit (3), and seeded identities per category                                                                                   |

For each category, it runs the identities "<category>-<i>" on visit 1. It then runs visit 2 with visit 1's templates seen and the seed "<category>-<i>-v2". It reports:

- the pool, and how many full visits of three it allows;
- how often each shortfall rule fires on each visit, and what it gives;
- each template's share of Design one and of all three designs on each visit, and its share over both visits;
- any eligible template never chosen.

#### Checks

- It imports lib/select/prng.ts unchanged and carries a copy of select.ts:28-55.
- It works out each frozen fixture's seed the way templatesFor does (tests/eval/pipeline.eval.ts:85-96; lib/identity/payload.ts:14-27). Seed and templates match all 70 stored records: 20 each in baseline, l0-skeleton and l6-all-fixes, and 10 in l7-sentence.
- The first-visit mix over the 20 fixtures is: Summit 10, Aurora 9, Monolith 8, Meridian 8, Vector 8, Ember 7, Atlas 5, Harbor 5.
- With no clash, the proposed rule equals today's on 20,000 random seeds and seen sets, for each tier rule.
- Under suits first, one suits template was Design one for 5,000 of 5,000 seeds.
- The same inputs gave the same answer.

#### Limits

- The categories are provisional, and every run is illustrative.
- The seeds are short strings, not payload hashes. The shuffle is the same function, so the shares should match on average, but that is checked only on the 20 fixtures.
- The category stays the same across an identity's two visits.
- The visitor's own photographs and logo polarity play no part, because every template is 'either'.
- At 10,000 identities a category, shares carry about ±1 point of noise.

### Photograph plan (decision 7)

**What this rests on.** The code at b711770. The two separate picture records in the stored runs: baseline (l0-skeleton shares it) and l6-all-fixes (l7-sentence shares it). Scripts and outputs I wrote, all in `test-results/template-fit/pp/` (shown below as pp/…). I made no paid call and no Pexels API call. I fetched pictures only from the Pexels CDN (images.pexels.com), to read their real shape. Anything marked "proposal" is the owner's to decide.

#### What the code does today

| Step                   | Today                                                                                                                                    | Where                                                                                                                     |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Searches               | First hero search; the second runs only if the first fails or finds nothing. Every detail search runs. All landscape, 12 results, page 1 | lib/images/plan.ts:31-34; lib/images/stage.ts:125-140; lib/images/pexels.ts:21-24; lib/config.ts:126                      |
| Picture size           | Width and height are parsed, then dropped. The stored copy comes from `large2x`                                                          | lib/images/candidates.ts:16-17,28-35                                                                                      |
| What the judge is told | "the main picture…" or "a supporting picture…", plus the positioning. "Room for words" is asked of every picture                         | lib/images/plan.ts:42-45; lib/ai/prompts.ts:73                                                                            |
| Floor                  | None. Pictures the judge never scored are used last. A failed ranking keeps Pexels' order                                                | lib/images/plan.ts:55-66; lib/images/stage.ts:147-156                                                                     |
| Alt text               | Pexels' alt text, unchanged                                                                                                              | lib/images/stage.ts:200                                                                                                   |
| Retries                | One imagery step. If any slot is left empty by an error, every search and ranking runs again with empty caches after 20 s                | lib/inngest/functions/build-concepts.ts:112-125; lib/images/stage.ts:68-73; lib/inngest/stages.ts:61-63; lib/config.ts:21 |
| Measured in l6         | 3 to 4 searches and up to 2 rank calls per submission. 67 searches and 34 rank calls over 20 fixtures                                    | pp/… counts below; l6-all-fixes/summary.md:9,29                                                                           |

#### 1. Slot classes

I derived each class from where the slot sits on the visitor's page and its geometry in the code. I did not use the slot key or the source's picture. A per-item slot's purpose is its item's own copy. Slot 0 is also cropped into the done-page poster (lib/preview/status.ts:46-51; app/preview/_components/design-poster.tsx:38; app/_styles/design-poster.css:65-73). t09 and t10 are left out, as the brief requires. The classes are numbered 1 to 12, so that they are not confused with the category rows A to F.

| Class | Name (shape and job)                                    | Slots | Words over it                   |
| ----- | ------------------------------------------------------- | ----- | ------------------------------- |
| 1     | Full-screen backdrop under text                         | 4     | Yes                             |
| 2     | Wide band under a card or faded words                   | 2     | Faded words, or an opaque card  |
| 3     | Very wide strip, no words over it                       | 1     | No                              |
| 4     | Small picture inside a drawn window                     | 1     | No                              |
| 5     | Picture shown whole beside or under words               | 10    | No                              |
| 6     | Tall picture beside words                               | 4     | No                              |
| 7     | Small square, one per offering                          | 8     | No                              |
| 8     | Card picture, one per offering                          | 6     | No                              |
| 9     | Captioned tile, one per item                            | 4     | Caption over the foot           |
| 10    | Picture per item that opens full screen under its title | 4     | Title over the full-screen view |
| 11    | Small picture shown whole, one per point                | 3     | No                              |
| 12    | Round avatar                                            | 2     | No                              |

**Every ready slot mapped.** "Section" is one of: first screen, about the business, what they offer, closing, or its own item.

| Template | Slot              | Class | Section      | Shape on the page                                                                                                                              | Code                                                     |
| -------- | ----------------- | ----- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Aurora   | hero (slot 0)     | 4     | first screen | 4:3 below lg. From lg, a column at row height, about 240×197 at 1440 (measured on the example). Inside a window clipped at 22rem/20rem. alt="" | t01 product-frame.tsx:75-83; hero.tsx:48                 |
| Aurora   | statement         | 1     | about        | Full bleed, at least 70svh. Words at its foot over a gradient scrim                                                                            | t01 statement.tsx:15-37                                  |
| Monolith | about (slot 0)    | 5     | about        | 300 px wide, own shape                                                                                                                         | t02 about.tsx:20-23                                      |
| Monolith | services          | 5     | offer        | 300/500/600 px wide, own shape                                                                                                                 | t02 services.tsx:49-52                                   |
| Monolith | feature-1 to 3    | 11    | item         | 200/300 px wide, own shape, at the foot of each card                                                                                           | t02 features.tsx:39-42                                   |
| Monolith | quote, profile    | 12    | first screen | 40 px and 96 px circles, lg and up only                                                                                                        | t02 avatar.tsx:17,26; hero-cards.tsx:29                  |
| Meridian | hero (slot 0)     | 5     | first screen | Full width up to 1200 px, own shape, faded foot. Also cropped into the lg menu panel                                                           | t03 hero.tsx:53-66; nav.tsx:40-52                        |
| Atlas    | hero (slot 0)     | 5     | first screen | Right half, own shape, sm and up                                                                                                               | t04 hero.tsx:58-69                                       |
| Atlas    | pitch, tools, why | 5     | about        | Own shape, beside words                                                                                                                        | t04 pitch.tsx:15-23; tools.tsx:14-22; why.tsx:16-24      |
| Atlas    | offer             | 5     | offer        | Own shape, beside words                                                                                                                        | t04 offer.tsx:18-25                                      |
| Atlas    | faq               | 5     | closing      | Own shape, beside words                                                                                                                        | t04 faq.tsx:19-26                                        |
| Ember    | hero (slot 0)     | 1     | first screen | CSS background the size of the screen. Words centred on it, no scrim                                                                           | t05 hero.tsx:14-19                                       |
| Ember    | about             | 6     | about        | Up to 548 px wide, cover, column height. Rendered shape not verified                                                                           | t05 about.tsx:21-27                                      |
| Ember    | features          | 6     | about        | 384×444 (0.86)                                                                                                                                 | t05 features.tsx:51-57                                   |
| Ember    | timing            | 2     | closing      | CSS background, 650 px tall, up to 1024 px wide, with an opaque card over it                                                                   | t05 timing.tsx:12-21                                     |
| Ember    | dish-1 to 8       | 7     | item         | 120/140 px squares. dish-1 to 4 appear again as 80 to 140 px circles with alt "". 4 rendered in every stored answer                            | t05 dishes.tsx:28-39; cta.tsx:28-37; contract.ts:213-215 |
| Harbor   | hero (slot 0)     | 1     | first screen | The screen, shown at 40% over the surface, with a surface-to-clear gradient from the left. Words on the left                                   | t06 hero.tsx:20-32                                       |
| Harbor   | about             | 6     | about        | Tall column: 0.54 at 390, 1.07 at 768, 0.48 at 1024, 0.69 at 1440 (computed, mp-evidenceB.md:170)                                              | t06 about.tsx:28-41                                      |
| Harbor   | cta               | 2     | closing      | Full band at 20%, words centred over it                                                                                                        | t06 cta.tsx:14-26                                        |
| Summit   | hero (slot 0)     | 1     | first screen | CSS background the size of the screen. Words on the left, no scrim                                                                             | t07 hero.tsx:16-24                                       |
| Summit   | why               | 6     | about        | 1.07 at 390, 1.75 at 768, 0.63 at 1024, 0.81 at 1440 (computed)                                                                                | t07 why.tsx:56-65                                        |
| Summit   | cta               | 5     | closing      | 493 px wide, own shape, lg and up                                                                                                              | t07 cta.tsx:52-61                                        |
| Summit   | service-1 to 6    | 8     | item         | Half of each card: 1.15 at 390, 1.7 at 640, 0.70 at 768, 1.29 at 1440 (computed). 3 to 5 rendered in stored copy                               | t07 services.tsx:57-66; contract.ts:266                  |
| Summit   | facility-1 to 4   | 9     | item         | Title, line and link over its foot on a 30% scrim with blur. 0.71 to 1.76 (computed)                                                           | t07 facilities.tsx:31-45; contract.ts:276                |
| Vector   | about (slot 0)    | 3     | about        | 21:9, then 3:1 from lg, rounded ends                                                                                                           | t08 about.tsx:32-35                                      |
| Vector   | project-1 to 4    | 10    | item         | 4:3 rounded card in greyscale. Opens full screen under its title on a 40% scrim. 3 to 4 rendered                                               | t08 projects.tsx:263-276,399; ripple.tsx:393-401         |

Slot lists: t01 contract.ts:277, t02 :482, t03 :406, t04 :418, t05 :397-410, t06 :445, t07 :488-502, t08 :290. That makes 49 slots.

**Proposed spec per class.** P is the people rule in section 7. Minimum pixels is twice the largest box, capped at the stored 1920 px width (lib/config.ts:127). These figures come from the code. Replace them with the measured rendered sizes.

| Class | Search orientation           | Minimum pixels after the crop                     | Crop-loss limit at 1440                       | Second crop the judge sees                     | Quiet area and checks                               | People           |
| ----- | ---------------------------- | ------------------------------------------------- | --------------------------------------------- | ---------------------------------------------- | --------------------------------------------------- | ---------------- |
| 1     | landscape                    | 1920×1080                                         | 35%                                           | the 390 crop                                   | where the words sit; code legibility check          | P                |
| 2     | landscape                    | 1920 wide                                         | 35%                                           | the 390 crop                                   | Harbor: legibility check. Ember: the card covers it | P                |
| 3     | landscape                    | 1920×640                                          | 50%                                           | judged at 3:1                                  | none                                                | P                |
| 4     | landscape                    | 480×394 at 1440                                   | 35%                                           | none                                           | none                                                | P                |
| 5     | landscape (or square: owner) | 600 (Monolith about) to 1920 (Meridian)           | 0 (shown whole); width over height 1.0 to 1.8 | none                                           | none                                                | P                |
| 6     | portrait                     | 966×1400 (Harbor about), 768×888 (Ember features) | 35%                                           | the widest-shape crop (Summit why 1.75 at 768) | none                                                | P                |
| 7     | square                       | 280×280                                           | 35%                                           | none                                           | none                                                | P                |
| 8     | landscape                    | 1158×896                                          | 35%                                           | the 768 crop (0.70)                            | none                                                | P                |
| 9     | landscape                    | 1330×758                                          | 35%                                           | the 768 crop (0.71)                            | quiet foot; legibility check                        | P                |
| 10    | landscape                    | 1920×1080 (opens full screen)                     | 35%                                           | the full-screen crop at 390                    | legibility check on the open view                   | P                |
| 11    | landscape or square          | 600 wide                                          | 0; 1.0 to 1.8                                 | none                                           | none                                                | P                |
| 12    | not searched (proposal)      | 192×192                                           | n/a                                           | n/a                                            | n/a                                                 | no person at all |

**Evidence for orientation and limits.** I measured all 842 stored candidates (every search was landscape) from the CDN. Width over height: median 1.50, 5th to 95th percentile 1.33 to 1.65, none below 1.0 (pp/aspects.cjs). Crop loss under the page's centred cover crop (pp/crop-loss.cjs):

| Slot shape                     | Width over height | Loss for a stored picture (median) | Stored pictures within 35% | Loss for a square | Loss for a 2:3 portrait (assumed shape) |
| ------------------------------ | ----------------- | ---------------------------------- | -------------------------- | ----------------- | --------------------------------------- |
| Class 1 at 1440×900            | 1.60              | 6%                                 | 100%                       | 38%               | 58%                                     |
| Class 1 at 390×844             | 0.46              | 69%                                | 0%                         | 54%               | 31%                                     |
| Class 3 at lg (3:1)            | 3.00              | 50%                                | 0% (91% within 50%)        | 67%               | 78%                                     |
| Class 6, Harbor about at 1440  | 0.69              | 54%                                | 0%                         | 31%               | 3%                                      |
| Class 6, Summit why at 1024    | 0.63              | 58%                                | 0%                         | 37%               | 5%                                      |
| Class 7 square                 | 1.00              | 33%                                | 93%                        | 0%                | 33%                                     |
| Class 8, Summit service at 768 | 0.70              | 53%                                | 0%                         | 30%               | 5%                                      |
| Class 9, wide tile at 1440     | 1.76              | 15%                                | 100%                       | 43%               | 62%                                     |

So landscape-only search cannot meet any fixed limit for class 6, or for the narrow crops of classes 1, 8 and 9. That is why the limit applies at 1440 and the judge also sees the worst crop.

#### 2. Searches per class and orientation

- **Planning queries from the brief.** The brief call runs after select (build-concepts.ts:55-70, then :99-106). Its prompt can therefore list the classes the three designs need, each by its job in neutral words. It writes one query per class (2 to 5 plain words: a place, an object or work being done) and a second query for the slot-0 class. zod limits the count and length; today nothing does (lib/copy-slots/brief.ts:25). The look's words are added only when the query lacks them. Today they are always added (plan.ts:34), giving "bright kitchen natural light natural light" (map-process.md:62). This changes the brief prompt, so it goes through the eval (ADR 0044).
- **One Pexels request per distinct query, orientation and page size.** Page size proposal: 3 per slot of that class in the three designs, between 12 and 24. Pexels allows up to 80 (map-imagery.md:239). Each extra candidate adds about 264 input tokens to its rank call (docs/pipeline-quality-plan.md:32).
- **Width and height are kept.** Code drops candidates under the class's minimum pixels, or over its crop limit, before ranking. Pexels' `size` filter (map-imagery.md:235) is optional for classes 1, 2 and 3; how far it would shrink the results is not measured.
- **Source file.** Fetch the original at the stored width rather than `large2x`. `large2x` returned 1880×1243 and 1880×1255 for two stored pictures (pp/cdn-probe.cjs). A portrait `large2x` would be at most 1300 px tall (the 940×650 box at DPR 2; arithmetic, not measured). The stored file is at most 1920 px wide, so a landscape backdrop cropped for a 390 px phone has about 590 px across, about half what a 3x phone shows (computed).
- **Deduplication across the three designs.**
  - One request per query and orientation.
  - One rank call per class, section and candidate set.
  - Pictures are tracked by Pexels id across all pools, under ADR 0017's rule: distinct first, shared across designs only once the pool runs out, never twice on one page (stage.ts:164-178).
  - A picture taken by one class is not offered to another class on the same page.

| Per submission (pp/plan-counts.cjs, pp/plan-counts2.cjs)                                        | Searches          | Rank calls                                                                 |
| ----------------------------------------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------- |
| Today, no failures (l6)                                                                         | 3 to 4            | up to 2                                                                    |
| Per class; per-item slots draw a pooled class search (plans b and d), over the 56 sets of three | median 6, max 9   | median 8, max 10 (per class and section); median 6, max 9 (per class only) |
| One search per item after the copy (plan c), over the 56 sets at contract maxima                | median 14, max 27 | median 8, max 10                                                           |
| Plan c over the 20 stored fixture sets, stored item counts                                      | median 11, max 20 | median 8, max 10                                                           |

Added rank cost at l6's measured $0.00624 a call ($0.2120 over 34 calls, l6-all-fixes/summary.md:9), against today's 2 calls:

- per class and section: median +$0.037, max +$0.050 a submission;
- per class only: median +$0.025, max +$0.044.

Today's average is $0.135 a submission (ADR 0044:27). Showing the judge a second crop for classes 1, 2, 6, 8 and 9 adds about 264 tokens per candidate in those calls; I did not price it separately.

#### 3. Judging

- **One rank call per class and section present in the three designs.** Per-item classes get one call per template's item group, made once that template's copy exists (plan d, section 10).
- **At the crop the page shows.** The judge gets a CDN URL with `fit=crop&w=…&h=…`, which Haiku fetches by URL as today (lib/ai/rank.ts:43). The CDN crop is a centre crop, the same as the templates' centred cover. Its mean pixel difference from a centre crop I cut locally was 3.3 and 5.1; from a left crop, 66.1 and 40.7 (pp/cdn-crop-centre.cjs).
- **What the judge is told:**
  - the company, the positioning and, once decision 3 supplies it, the category;
  - the section and the slot's job in neutral words (for example "the backdrop of the first screen; a heading and two buttons sit over its centre");
  - the crop at 1440, plus the worst crop for classes whose shape changes with width;
  - where words sit, if any: "keep this area quiet and even";
  - for a per-item slot, that item's title and line;
  - the people rule.
  - Optionally the look's label: ADR 0044 proposed this but did not apply it (map-imagery.md:66).

  The judge is never sent the visitor's logo, colours or own photographs. "Room for words" moves out of the system prompt (prompts.ts:73) and goes only to classes with words over them.

- **What the judge returns, validated with zod:**
  - a score from 0 to 10 (today any number passes, rank.ts:19);
  - a reject reason or null;
  - `people`: none, unrecognisable or identifiable;
  - for content classes, an alt text (section 6).
- **Floor.** A number in lib/config.ts, optionally per class. Proposal: 7.
- **Never unjudged.**
  - A failed rank call is retried as its own step a set number of times, then the pool's slots take the fallback.
  - A candidate the judge never names is excluded. Today it is used last (plan.ts:63-64; rank.ts:57-66).
- **The second hero search.** The slot-0 class's second query runs when nothing from the first passes every check: floor, crop, pixels, people and legibility.
  - On the stored generic-purpose scores, at floor 7 no hero pool whose searches all answered lacked a passing picture.
  - At floor 8, 2 of 20 lacked one in baseline (cafe, longest) and 1 of 13 in l6 (gardens) (pp/hero-pools.cjs).
  - Today the second query ran only twice, in l6 for electrician and it-support, and only because the first failed.
  - Each time it runs it costs one search and one rank call (about $0.006).

#### 4. Floor proxy

The replay uses the choice rule of lib/images/stage.ts:164-178, as mirrored in tests/eval/pipeline.eval.ts:396-425. Only judged, unrejected pictures at or above the floor are eligible. "Shown" counts only slots the stored copy renders.

Check first: with today's rule, the replay reproduces each record's stored empty and repeated counts on all 20 fixtures of both runs (pp/floor-proxy.cjs).

This is a proxy. The scores answered generic purposes over today's two shared pools.

| Template | baseline: shown slots | empty at floor 0 / 5 / 6 / 7 / 8                                 | l6: shown slots, pools whose searches all answered | empty at floor 0 / 5 / 6 / 7 / 8                           |
| -------- | --------------------- | ---------------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------- |
| Aurora   | 18                    | 0 / 0 / 0 / 0 / 1                                                | 11                                                 | 0 / 0 / 0 / 0 / 1                                          |
| Monolith | 56                    | 2 / 2 / 2 / 4 / 17                                               | 31                                                 | 0 / 0 / 0 / 0 / 8                                          |
| Meridian | 8                     | 0 / 0 / 0 / 0 / 1                                                | 3                                                  | 0 / 0 / 0 / 0 / 0                                          |
| Atlas    | 30                    | 0 / 0 / 0 / 2 / 7                                                | 9                                                  | 0 / 0 / 0 / 0 / 1                                          |
| Ember    | 56                    | 1 / 1 / 1 / 5 / 19                                               | 39                                                 | 0 / 0 / 0 / 0 / 5                                          |
| Harbor   | 15                    | 0 / 0 / 0 / 0 / 0                                                | 8                                                  | 0 / 0 / 0 / 0 / 1                                          |
| Summit   | 100                   | 16 / 16 / 18 / 31 / 52                                           | 74                                                 | 1 / 1 / 1 / 4 / 21                                         |
| Vector   | 33                    | 0 / 0 / 0 / 0 / 5                                                | 23                                                 | 0 / 0 / 0 / 0 / 0                                          |
| **All**  | **316**               | **19 / 19 / 21 / 42 / 102** (6.0% / 6.0% / 6.6% / 13.3% / 32.3%) | **198**                                            | **1 / 1 / 1 / 4 / 37** (0.5% / 0.5% / 0.5% / 2.0% / 18.7%) |

**Empty slots by cause** (pp/floor-table.cjs):

- Inside the proxy, almost every empty slot is "pool used up": the page needs more passing pictures than the pool holds. Baseline at floor 8: 96 used up, 6 all rejected. At floor 7: 42 used up, 0 rejected. l6 at floor 8: 34 used up, 3 all rejected.
- By construction, no search errors fall inside the proxy. Outside it, l6 has 125 shown slots: 42 empty today, of which 36 are search errors, 3 all rejected and 3 pool used up.

**Other findings:**

- **Slots that never render.** Today they take pictures too. With them counted, floor 7 empties rise from 42 to 91 in baseline and from 4 to 18 in l6.
- **"The best for each design".** Under that rule instead, empties stay about the same (baseline 20 / 20 / 22 / 43 / 104) and more pictures are shared across designs (pp/floor-best-each.cjs).
- **Scores of the pictures taken today.** l6: 9 (20), 8 (167), 7 (95), 6 (40), 5 (1), 4 (1). Baseline: 9 (31), 8 (161), 7 (86), 6 (33), 5 (5), 4 (2) (pp/picked-scores.cjs).

#### 5. Words over pictures: a code check

**Proposal.** For classes 1, 2 (Harbor), 9 and 10, sharp takes the crop the page shows at 1440 and 390. It applies the template's own treatment (opacity, gradient or scrim) using the page's tokens, then measures contrast against the text colour inside the box where the words sit. The box comes from the contract. A picture passes when 95% of the box's pixels reach 3:1 for headings of 24 px and up, and 4.5:1 for smaller words (WCAG AA). 4.5:1 is the repo's token target (lib/config.ts:60). sharp is already used (lib/images/rehost.ts:21-25), and this is code, not a model.

**Prototype on the stored hero picks** (pp/legibility-proto.cjs and .json):

| Template                           | Distinct stored hero picks | Pass at both widths |
| ---------------------------------- | -------------------------- | ------------------- |
| Ember (no scrim)                   | 10                         | 2                   |
| Summit (no scrim)                  | 15                         | 1                   |
| Harbor (40% picture plus gradient) | 9                          | 9                   |

The worst case was an Ember pick with 6% of the box at 3:1.

Caveats: the boxes were approximated from the classes, not measured. Colour tint is ignored. Summit's heading is drawn at 85% opacity, which I ignored.

**Consequence.** Without a scrim, this check would empty most Ember and Summit heroes, and those are their posters. A scrim on those heroes is out of scope until the owner approves it element by element (decision 7).

#### 6. Alt text written for the slot

**The Trakai example.** In l6-all-fixes/cafe.json, the hero pool (query "canal towpath café morning natural light") gave candidate 6086919 a score of 8. Its alt text is "Charming lakeside restaurant interior in Trakai with warm lighting and lake views." Vector's `about` (slot 0) took it, and the alt text goes onto the page (t08 about.tsx:35). The visitor's sentence names Hebden Bridge.

**How often it happens.** As a code-only proxy, I flagged alt text with a capitalised word the visitor never gave. It caught 15 of 324 filled slots in l6 (5%) and 36 of 318 in baseline (11%), including Warsaw, Bogotá, Tokyo and Cape Town (pp/alt-names.cjs). It also flags dog breeds, so it over-counts places.

**Proposal by class:**

- **Classes 1 and 2: alt "", as decorative backdrops.** Ember's and Summit's heroes and Ember's timing band are CSS backgrounds with no alt at all today. Aurora's window is already alt "" (product-frame.tsx:78).
- **Per-item classes 7 to 11: alt "".** The item's title is printed beside each picture, so it would only repeat it.
- **Classes 3, 4, 5 and 6: alt written by the judge for this slot, then checked by code.** At most 120 characters, no digits, and no capitalised word that is not in the visitor's sentence, company name or brief. A failing alt becomes "".

#### 7. One rule on faces and people

**The conflict:**

- The brief prompt says "No faces" (prompts.ts:37).
- The judge rejects only "a single identifiable person's face as the subject" (prompts.ts:73).
- The warm look promises "Daylight, people, texture." (lib/brief/styles.ts:12), and the brief prompt is sent that line (prompts.ts:25).
- The Pexels licence says "Don't imply endorsement of your product by people or brands on the imagery" (map-imagery.md:125, from an earlier extraction).
- docs/pipeline-plan.md:284 says "the product forbids stock people".

**Evidence:**

- Faces were the largest rejection reason: 54 of 192 rejections in l6 and 76 of 162 in baseline (summary.md:29 in each run).
- 36% (l6) and 41% (baseline) of filled slots carry alt text naming a person. This comes from a word list, so it is a lower bound (pp/people.cjs).

**Proposed rule P.**

- No identifiable face anywhere.
- People may appear only when no face can be recognised: hands, backs, distant figures.
- No person at all in a slot beside a name, role or quote. That means class 12, where Monolith's quote avatar sits beside the brand name, a role and a quote.
- The judge reports `people`, and code rejects "identifiable".
- The brief prompt asks for "hands or figures whose faces cannot be seen" in place of "No faces". This meets the warm look's "people" without implying endorsement.
- Whether "Daylight, people, texture." stays as public wording is decision 13.

#### 8. The fallback brief's searches

Today the fallback uses the company name and the first sentence (lib/copy-slots/brief.ts:67). No stored run has a fallback brief, so the quality of these searches is not measured. Here is what they would send, built from the fixtures by the same sentence split and look words:

- "Bramble and Bean natural light"
- "AshgrovePhysiotherapyAndSportsInjuryClinicsSheffieldAndLeeds minimal"
- a 117-character sentence for joinery.

What Pexels would return for these was not tested.

If the brief failed because the model was refused, the judge uses the same API and will be refused too. So under "never unjudged" those slots take the fallback anyway.

**Proposal.**

- With a known category (decision 3): owner-approved queries per category and class, judged as usual.
- With "unclear", or with no judge: the approved set or the empty state.
- Never the company name.

#### 9. Steps, retries and caps

| Step (proposal) | Memo key                                 | On failure                                                                                                                    |
| --------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| plan            | pure, from the contracts and the brief   | n/a                                                                                                                           |
| search          | query + orientation + page size          | That search alone retries after 20 s. A 429 settles it as "quota". Each attempt counts towards the cap                        |
| rank            | class + section (+ item) + candidate ids | Retried alone, a set number of times (the brief uses 3, lib/config.ts:25). Then "judge down", and the slots take the fallback |
| choose          | pure, over the memoised results          | n/a                                                                                                                           |
| host            | Pexels id                                | That picture alone is retried                                                                                                 |
| write           | stage marking, as runStage does          | n/a                                                                                                                           |

**Today's worst case (estimate).**

- Imagery starts about 7 s in (brief median 6.4 s in l6).
- The sweeper settles it at 255 s (lib/config.ts:18).
- Each failed attempt takes about 5 s plus the 20 s pause (l6 pool median 5.4 s).
- That gives about 10 to 11 attempts, so about 40 to 44 searches and up to about 20 rank calls (about $0.12).
- Time is the bound, not the 14 retries (lib/config.ts:21).

**Proposed caps in lib/config.ts.** 12 searches and 12 rank calls per submission, retries included. Once a cap is reached, the remaining slots take the fallback.

| Plan                                             | Searches a submission     | Submissions an hour within Pexels' 200 (map-imagery.md:261) |
| ------------------------------------------------ | ------------------------- | ----------------------------------------------------------- |
| Today, no failures                               | 3 to 4                    | 50 to 66                                                    |
| Today, one search failing until the sweeper      | about 40 to 44 (estimate) | 4 to 5                                                      |
| Per class, median set                            | 6                         | 33                                                          |
| Per class, worst set plus a second slot-0 search | 10                        | 20                                                          |
| One search per item, worst set                   | 27 to 28                  | 7                                                           |
| At the proposed cap                              | 12                        | 16                                                          |

Whether production shares the Pexels key is not known. How Inngest retries and limits individual steps is not verified; check its documentation before building.

#### 10. Should per-item pictures wait for their copy?

Stored l6 timings for 20 fixtures (pp/timings.cjs):

| Measure                                                                     | Min    | Median | Max     |
| --------------------------------------------------------------------------- | ------ | ------ | ------- |
| Brief                                                                       | 5.5 s  | 6.4 s  | 7.7 s   |
| Copy, one template, as the eval ran it                                      | 7.2 s  | 15.1 s | 75.2 s  |
| Copy stage, slowest of three, adding production's 20 s pause per extra step | 13.2 s | 26.7 s | 115.2 s |
| Imagery stage                                                               | 4.5 s  | 6.0 s  | 11.6 s  |
| One pool (searches and rank)                                                | 2.9 s  | 5.4 s  | 11.6 s  |
| One rank call                                                               |        | 2.4 s  | 4.2 s   |

Imagery finished before the copy stage in 20 of 20 fixtures.

**What waiting costs:**

- **Plan c (search and rank after the copy):** adds a median 4.9 s, max 11.6 s, and needs more searches (section 2).
- **Plan d (searches early, only the per-item rank call waits):** adds a median 1.5 s, max 4.2 s, and no searches.
- Both add nothing in 8 of 20 fixtures.
- Posters are unaffected, since slot 0 is never a per-item slot.
- When a template's copy falls back, its items are generic, so its pictures are judged against the class purpose instead.

Caveat: the eval ran copy and then imagery in sequence, two fixtures at a time, so production timings may differ.

#### 11. Hybrid: an owner-approved picture set

Live searches come first. The set is the fallback when nothing passes, the judge is down or Pexels fails.

**What one category needs** to cover two visits without repeating a picture (6 of the 8 templates, taking the worst set for each class):

| Class    | 1   | 2   | 3   | 4   | 5   | 6   | 7            | 8                 | 9   | 10                | 11  |
| -------- | --- | --- | --- | --- | --- | --- | ------------ | ----------------- | --- | ----------------- | --- |
| Pictures | 4   | 2   | 1   | 1   | 10  | 4   | 8 (4 stored) | 6 (3 to 5 stored) | 4   | 4 (3 to 4 stored) | 3   |

That is 47 pictures per category (42 at the stored item counts), or 22 without the per-item classes (classes 1 to 6).

**Count:** the 7 recommended rows (A to F plus unclear).

| Scope                    | Pictures | Candidates reviewed (assuming 2 per kept picture) | Owner's hours at 15 s a candidate (estimate) |
| ------------------------ | -------- | ------------------------------------------------- | -------------------------------------------- |
| All classes              | 329      | 658                                               | 2.7                                          |
| Without per-item classes | 154      | 308                                               | 1.3                                          |

**Building it:**

- Sourcing takes about 77 Pexels requests (11 classes × 7 rows).
- Optional pre-ranking by the judge costs about $0.48 (estimate, scaled from $0.89 for 13 categories).
- A separate set per look multiplies everything by four.
- A set picture cannot match a visitor's own items.

#### 12. Options and recommendations

All parts block Phase 4. The class list also shapes the Phase 2 picture sample.

| Part                                    | Options                                                                                                           | Evidence                                                                                                                                        | Recommendation (proposal)                                                                                      |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Floor                                   | 6, 7 or 8                                                                                                         | Proxy: 21 / 42 / 102 of 316 shown slots empty (baseline); 1 / 4 / 37 of 198 (l6)                                                                | 7, per class, then reset from the owner's labels in Phase 4                                                    |
| Crop limit                              | 25%, 35% or 50% at 1440                                                                                           | A 3:2 picture loses 33% in a square; a 3:1 strip loses 50%                                                                                      | 35% (50% for class 3), with the worst crop judged                                                              |
| Nothing passes                          | Empty state, or the approved set                                                                                  | Set sizes in section 11                                                                                                                         | The set for classes 1 to 6 where built; otherwise the empty state                                              |
| Judge unavailable                       | Empty state, or the approved set; never unjudged                                                                  | Rank failure today keeps Pexels' order (stage.ts:147-156)                                                                                       | The same as "nothing passes"                                                                                   |
| Different pictures or the best for each | ADR 0017's rule, or best for each                                                                                 | Best for each gives no fewer empty slots and more sharing                                                                                       | Keep ADR 0017                                                                                                  |
| People                                  | None at all; no identifiable face; today's rule                                                                   | 54 face rejections in l6; licence line                                                                                                          | Rule P                                                                                                         |
| Circle, portrait and cut-out slots      | Class 12: initials or stock. Classes 5 and 11: photo shown whole, empty, or set objects. Class 6: portrait search | Class 12 sits beside a name and quote                                                                                                           | Class 12 shows initials; classes 5 and 11 show photos whole, within an aspect limit; class 6 searches portrait |
| Per-item pictures wait for copy         | No; plan c; plan d                                                                                                | +4.9 s or +1.5 s median                                                                                                                         | Plan d                                                                                                         |
| Visitors with their own photographs     | Leave the rest empty, or fill with judged stock                                                                   | One photo leaves Summit 8 drawn blocks empty with 3 cards (11 with 6) and Ember 7 with 4 items (11 with 8) (template-fit/records.md:903, :1320) | Fill with stock judged per class (a matter of taste)                                                           |
| Second hero search                      | Never, when poor, always                                                                                          | Needed rarely on generic scores                                                                                                                 | When nothing passes every check                                                                                |
| Fallback brief                          | Today's; category queries; no search                                                                              | Section 8                                                                                                                                       | Category queries, else the set or the empty state                                                              |
| Judging grain                           | Per class and section, or per class                                                                               | +$0.037 or +$0.025 median per submission                                                                                                        | Per class and section, if the owner accepts the cost                                                           |
| Caps                                    | Searches and rank calls per submission                                                                            | Section 9                                                                                                                                       | 12 and 12                                                                                                      |
| Approved set (decision 8)               | None; classes 1 to 6; all classes                                                                                 | 154 or 329 pictures for 7 rows                                                                                                                  | Classes 1 to 6 first                                                                                           |
| Acceptance target                       | Owner sets per template and category                                                                              | No owner labels yet                                                                                                                             | Set after Phase 2. Placeholder only: 90% of slot-0 pictures, 80% of others                                     |

#### Not verified

- Rendered slot sizes, including Ember about's shape. The measurement agent's numbers replace the computed ones.
- What portrait and square Pexels searches return, and their sizes.
- What the fallback queries return.
- `large2x` for portrait pictures.
- How Inngest retries and limits individual steps.
- Whether production shares the Pexels key.
- The judge's scores under the new purposes.
- The licence wording, which comes from an earlier extraction.
- The prototype's text boxes.

#### Files produced

All in pp/: cdn-probe.cjs, cdn-crop-centre.cjs, aspects.cjs (+aspects.json), crop-loss.cjs, floor-proxy.cjs (+floor-proxy-baseline.json, floor-proxy-l6-all-fixes.json), floor-table.cjs, floor-best-each.cjs, hero-pools.cjs, picked-scores.cjs, timings.cjs, plan-counts.cjs, plan-counts2.cjs, legibility-proto.cjs (+legibility-proto.json), people.cjs, alt-names.cjs.

### The size of Phase 2

All counts use the recommended categories. They come from cells.cjs and pairs.cjs over the stored runs in test-results/eval.

#### Stored model-copy pages per template and category (run l6-all-fixes)

| Template     | A   | B     | C     | D                    | E     | F     |
| ------------ | --- | ----- | ----- | -------------------- | ----- | ----- |
| t01-aurora   | 2   | 2     | 3     | **0** (hr fell back) | 1     | **0** |
| t02-monolith | 3   | 3     | 1     | 1                    | **0** | **0** |
| t03-meridian | 3   | 1     | **0** | 2                    | 2     | **0** |
| t04-atlas    | 2   | **0** | **0** | 2                    | 1     | **0** |
| t05-ember    | 2   | 3     | **0** | 2                    | **0** | **0** |
| t06-harbor   | 2   | 1     | **0** | 1                    | 1     | **0** |
| t07-summit   | 3   | 1     | 2     | 3                    | 1     | **0** |
| t08-vector   | 1   | 4     | 3     | **0**                | **0** | **0** |

- 30 of 48 cells have a page.
- 10 cells have a fixture but no model page.
- 8 cells (row F) have no fixture.

Each of the 10 cells gets one fixture, drawn with the seed `template-fit:<templateId>:<category>` through a copy of lib/select/prng.ts (draw.cjs):

| Cell       | Fixture drawn |
| ---------- | ------------- |
| Aurora D   | hr            |
| Monolith E | photographer  |
| Meridian C | florist       |
| Atlas B    | tutors        |
| Atlas C    | florist       |
| Ember C    | bakery        |
| Ember E    | architects    |
| Harbor C   | florist       |
| Vector D   | hr            |
| Vector E   | photographer  |

#### Pages on the labelling sheet

| Set                                                                            | Pages to label                         | New renders                          | Basis                                                                                                                    |
| ------------------------------------------------------------------------------ | -------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Stored model-copy pages, with stored picks                                     | 59                                     | 59                                   | l6 (pairs.cjs). Aurora for hr fell back, so it counts only for the fallback case                                         |
| Look pages: 8 ready templates × 4 looks                                        | 32                                     | 32                                   | brief:280                                                                                                                |
| Stress: the shortest and longest fixtures each template was given              | (16)                                   | 0                                    | All 16 are among the 59 stored pages. See the table below                                                                |
| Stress: no pictures, another category's pictures, two accents (4 per template) | 32                                     | 32                                   | brief:281                                                                                                                |
| Leftovers both ways, one far category per template                             | 8                                      | 8                                    | The "with leftovers" version is a stored page already counted. Fewer pages if the copy-free fixes ship first (brief:272) |
| Missing cells on existing fixtures (seeded draw above)                         | 10                                     | 10, after paid copy                  | Range is labelled only on model copy (brief:295)                                                                         |
| Row F: one new apps fixture × 8 templates                                      | 8                                      | 8, after a new fixture and paid copy | Needs decision 11                                                                                                        |
| Unclear row                                                                    | 0                                      | 0                                    | No render can judge it (brief:49)                                                                                        |
| **Total**                                                                      | **149** (131 free, 18 after paid copy) | 149                                  |                                                                                                                          |
| Plain trades, for comparison                                                   | 282                                    | 282                                  | 151 missing cells instead of 18                                                                                          |

| Template     | Shortest fixture given (characters) | Longest fixture given (characters) |
| ------------ | ----------------------------------- | ---------------------------------- |
| t01-aurora   | gardens (140)                       | dentist-claims (255)               |
| t02-monolith | physio-longest (125)                | dentist-claims (255)               |
| t03-meridian | shortest (37)                       | longest (400)                      |
| t04-atlas    | vague (94)                          | awkward (217)                      |
| t05-ember    | shortest (37)                       | longest (400)                      |
| t06-harbor   | shortest (37)                       | hr (193)                           |
| t07-summit   | vague (94)                          | longest (400)                      |
| t08-vector   | physio-longest (125)                | dentist-claims (255)               |

The owner also confirms each fixture's category: 20 now, 23 with the three new fixtures of decision 11. Only the apps fixture needs paid copy in Phase 2.

#### The owner's hours (an estimate)

The assumptions, all estimates, to be replaced by the timing of the owner's first ten pages (brief:299):

| Task                                                                | Low     | Mid   | High    |
| ------------------------------------------------------------------- | ------- | ----- | ------- |
| A range page: scroll it, answer both questions, tick the reasons    | 1 min   | 2 min | 3 min   |
| A look, stress or both-ways page, compared with a page already seen | 0.5 min | 1 min | 1.5 min |

At every level, a fixture's category takes 15 s and a slot-0 picture takes 10 s.

| Round                                                                                              | Pages   | Low       | Mid       | High      |
| -------------------------------------------------------------------------------------------------- | ------- | --------- | --------- | --------- |
| Free round: 59 range pages, 72 look, stress and both-ways pages, 20 categories, 59 slot-0 pictures | 131     | 1.8 h     | 3.4 h     | 5.0 h     |
| After paid copy: 18 range pages, 1 category, 18 slot-0 pictures                                    | 18      | 0.4 h     | 0.7 h     | 1.0 h     |
| **Categories, total**                                                                              | **149** | **2.2 h** | **4.1 h** | **6.0 h** |
| Plain trades, total (210 range pages, 27 categories)                                               | 282     | 4.8 h     | 8.9 h     | 13.0 h    |

Not included: the stratified picture sample, whose size the photograph plan sets. At 5 s a picture, every 100 pictures add about 8 minutes.

#### Model copy for labels of range (an estimate)

**Before any paid run, the eval has to change.** It cannot write copy for named templates yet. Its switches are EVAL_RUN, EVAL_FIXTURES, EVAL_STAGES, EVAL_REUSE_RUN, EVAL_PLAN, EVAL_SUMMARISE and EVAL_CONCURRENCY (tests/eval/pipeline.eval.ts:63-71). Phase 2 adds this as a free code change (brief:304).

**How the costs are built:**

- Prices are the cost per template answer, retries included, measured in l6 (docs/pipeline-quality-plan.md:47): Vector $0.025, Aurora $0.030, Atlas $0.033, Meridian $0.036, Monolith $0.037, Ember $0.039, Summit $0.041, Harbor $0.086.
- A brief costs $0.0083 (ADR 0044:27).
- Ranking costs $0.0106 a submission (test-results/eval/l6-all-fixes/summary.md:9).
- Pairs on existing fixtures reuse the stored l6 briefs (EVAL_STAGES=copy with EVAL_REUSE_RUN; docs/pipeline-quality-plan.md:105). Their pictures are replayed from stored pools (brief:275-277), so they need no brief, ranking or Pexels call.
- A new fixture needs its own brief and pictures. That is one or two hero searches plus usually two detail searches (brief:125), so 3 to 4 Pexels requests and one submission's ranking.

| Size                                                               | What it buys                                                                      | Pairs                                                                                 | Copy            | Brief and ranking | Total     | Fits the ~$2 left?                  |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------- | ----------------- | --------- | ----------------------------------- |
| (a) Every missing template-and-fixture pair                        | Model copy for all 160 pairs of the 20 fixtures                                   | 100, plus 1 re-run (Aurora for hr fell back)                                          | $4.21 + $0.03   | $0                | **$4.24** | No. Only after the 1 November reset |
| (b) One fixture for each template and category with no stored page | A model page in every cell of A to F                                              | 10 on existing fixtures, plus 8 on one new apps fixture                               | $0.383 + $0.327 | $0.019            | **$0.73** | Yes, leaving about $1.27            |
| (c) Only the cells whose structural clash is in doubt              | Pages for the decision-6 structures (brief:368) where no stored model page exists | Aurora D and Vector D (hr, by seed); Ember, Summit and Vector on the new apps fixture | $0.055 + $0.105 | $0.019            | **$0.18** | Yes                                 |

How size (a) splits by template:

| Template | Missing pairs | Cost  |
| -------- | ------------- | ----- |
| Aurora   | 11            | $0.33 |
| Monolith | 12            | $0.44 |
| Meridian | 12            | $0.43 |
| Atlas    | 15            | $0.50 |
| Ember    | 13            | $0.51 |
| Harbor   | 15            | $1.29 |
| Summit   | 10            | $0.41 |
| Vector   | 12            | $0.30 |

Harbor is 31% of the total. The 8 apps cells would add $0.35 to (a).

The cells in doubt for size (c):

| Cell     | Structure in doubt                                     | Why                                                                                               | Stored page   |
| -------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------- | ------------- |
| Aurora D | three short lines in a drawn window                    | The offerings cannot be seen. The architects' rows drew claims the sentence never made (brief:85) | Fallback only |
| Vector D | two to four named items that open full screen          | Intangible offerings                                                                              | None          |
| Ember F  | a grid of pictured offerings; a full-screen photograph | Little to photograph                                                                              | No fixture    |
| Summit F | person and date fields; four titled photographs        | Rarely books a person on a date; little to photograph                                             | No fixture    |
| Vector F | items that open full screen                            | An app's features as two to four items that each open full screen                                 | No fixture    |

The other 8 doubt cells already have stored model pages, so they are labelled in the first round with the stored pages (brief:298):

- Aurora in B (dentist-claims, physio-unbroken) and E (architects);
- Monolith in C (cafe);
- Vector in C (bakery, cafe, florist);
- Summit in C (bakery, florist), D (awkward, it-support, longest) and E (architects);
- Ember in D (hr, longest).

Lucent is not ready, so it is not priced.

For comparison, size (b) under plain trades costs $3.97 for 95 cells plus $2.42 for 7 new fixtures, about **$6.39**.

**Fixtures from the sources' own industries, priced separately.** These test only "suits" there. Phase 2 adds a fixture only because such visitors arrive, never because a template came from that industry (brief:284). So each one waits for the owner's real-brief count and decision 11.

| Source's industry              | Template it tests "suits" for | Copy   | Brief and ranking | Total                                                                                  |
| ------------------------------ | ----------------------------- | ------ | ----------------- | -------------------------------------------------------------------------------------- |
| Software or template product   | Aurora, Monolith, Meridian    | $0.103 | $0.019            | $0.12, or $0 extra if row F's apps fixture is added, since it gets all eight templates |
| Crypto exchange                | Atlas                         | $0.033 | $0.019            | $0.05                                                                                  |
| Restaurant                     | Ember                         | $0.039 | $0.019            | $0.06                                                                                  |
| Gym                            | Harbor                        | $0.086 | $0.019            | $0.11                                                                                  |
| Hospital                       | Summit                        | $0.041 | $0.019            | $0.06                                                                                  |
| Agency                         | Vector                        | $0.025 | $0.019            | $0.04                                                                                  |
| **All six, own template only** |                               | $0.327 | $0.113            | **$0.44**, or $0.32 with the apps fixture                                              |
| All six, every template        |                               | $1.96  | $0.113            | **$2.08**                                                                              |

**The limit.** At the last record about $2 of the $30 monthly limit was left: "spent to about $28" (docs/pipeline-quality-plan.md:77). It resets on 1 November. Production may draw on the same limit (brief:131). Neither point is verified today.

These figures are means from one run. A real run can cost more, Harbor most of all, because the spread comes from retries.

**Recommendation:**

- Size (b), with a cap of $1.00, once the eval can write copy for named templates and decision 11 approves the apps fixture.
- Size (c) instead if production shares the limit and the owner wants to keep a reserve this month.
- Size (a) and the source-industry fixtures after the reset, and only if the labels show cells whose fixtures disagree.
