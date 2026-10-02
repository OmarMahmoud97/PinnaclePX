# Template fit records: Phase 1 evidence

Part 2 of the [template fit plan](../template-fit-plan.md), kept in its own file because of its size. Written 2 October 2026 on branch docs/template-fit-plan, from origin/main at b711770, under the brief in [template-fit-brief.md](../template-fit-brief.md). It holds each template's fit record, the measured slot geometry and the renders. Evidence files are in the git-ignored folder test-results/template-fit/ of the ../PinnaclePX-fit worktree; the renders are in [renders/](renders/).

## Part 2. The templates

### t01-aurora (Aurora)

Sources for this section. Paths are under `templates/t01-aurora/` unless written in full. Stored records are `test-results/eval/<run>/<fixture>.json`, field `copy.t01-aurora`. My scripts and their outputs are in `test-results/template-fit/t0102/`, called `t0102\` below.

#### 1. Design

- **Header:** sticky and 64 px tall, with the logo, up to four links and one button. It turns to glass once the page scrolls (sections/nav.tsx:15-19; aurora.css:105-111). Below md the links fold into a menu (sections/nav-menu.tsx).
- **Hero:** a centred headline, a sentence, two round buttons and a one-line reassurance. Under them a drawn panel rises out of a two-hue light field. The panel is clipped at 22rem, or 20rem from md (sections/hero.tsx:11-56, :48).
- **What they do:** one lit panel for the lead point, beside two quieter points under rules (sections/features.tsx:45-75).
- **How it works:** the heading stays in place beside three numbered steps, on a line that draws itself as you scroll (sections/how-it-works.tsx:12-32; aurora.css:80-85).
- **Statement:** one large sentence at the foot of a full-bleed photograph with a gradient scrim. The section is at least 70svh tall (sections/statement.tsx:14-38).
- **Closing:** a bordered, lit panel with the ask (sections/cta.tsx), then the footer.

| Aspect  | Code fact                                                                                                                                                                                                                                                                                     |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Density | Low. Every list is exactly three (contract.ts:69-73). No text slot is longer than 190 characters (copy-slots.ts:46-74). With no pictures the page is 3,822 px tall at 1440 (`test-results/eval/l0-skeleton/shots/dentist-claims-t01-aurora-desktop.png`, height read from the file's header). |
| Type    | The look's display face on every heading (styles.ts:8-10).                                                                                                                                                                                                                                    |
| Colour  | Radial light built from the glow, second glow and brand tokens (sections/aurora-field.tsx:14-44).                                                                                                                                                                                             |
| Motion  | Things rise and bloom on load; on scroll the light drifts, the line draws and the photograph settles (aurora.css:63-93). Under reduced motion there is only opacity (:96-101).                                                                                                                |
| Led by  | Type and the drawn panel, with one photograph lower down.                                                                                                                                                                                                                                     |

#### 2. Range

M = model copy, with the number of calls. F = fallback copy. – = the fixture was not in that run. The kind is the first clause of `notes` in tests/fixtures/eval/fixtures.json. Source: `t0102\range-matrix.out.txt`.

| Fixture         | Kind (fixtures.json line) | Sentence length | baseline | l0                 | l6                     | l7  |
| --------------- | ------------------------- | --------------- | -------- | ------------------ | ---------------------- | --- |
| architects      | creative (:103)           | 208             | M1       | M1                 | M2                     | M2  |
| bakery          | food (:175)               | 163             | M1       | M1                 | M1                     | –   |
| cafe            | food (:91)                | 154             | M1       | M1                 | M1                     | M2  |
| dentist-claims  | clinic (:31)              | 255             | M2       | M2                 | M2                     | M1  |
| electrician     | trades (:151)             | 173             | M1       | M2                 | M2                     | –   |
| florist         | shop (:115)               | 156             | M1       | M2                 | M2                     | M2  |
| gardens         | trades and design (:211)  | 140             | M2       | F (credit refused) | M1                     | –   |
| hr              | consultancy (:163)        | 193             | M1       | M2                 | F ("best" three times) | –   |
| physio-unbroken | clinic (:127)             | 176             | M1       | M1                 | M2                     | –   |

Aurora carried 9 businesses in 31 stored pairs: 29 with model copy and 2 with fallback. l6 and l7 together hold 12 model answers. It was never given the shortest (37 characters), longest (400) or vague (94) fixtures.

**The drawn panel (t01-S1), stored model copy.** Each row reads heading :: three lines. Marks: R means a line repeats a feature title that the same panel already lists down its side; "status" means a line states a stage the sentence never stated. Status words come from `t0102\count-aurora.out.txt`, which lists words that appear in neither the sentence nor the brief.

| Run, fixture       | Panel                                                                                                         | Marks                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| l6 architects      | Studio Marlowe :: House extension, Peak District; Loft conversion, Sheffield; Barn conversion, planning stage | status ("planning stage")          |
| l7 architects      | Our Projects :: House extension, Sheffield; Loft conversion, in progress; Barn conversion, planning stage     | status ×2                          |
| l6 bakery          | Today's Bake :: Sourdough loaves proving; Tin loaves in the oven; Buns ready for crates                       | status ("proving", "in the oven")  |
| l6 cafe            | Today's Menu :: Breakfasts cooked with care; Sourdough toasties made to order; Cakes baked fresh this morning | R ×1                               |
| l7 cafe            | Today's Menu :: Breakfast by the water; Sourdough toasties, made to order; Cakes baked here this morning      | R ×1                               |
| l6 dentist-claims  | Oakfield :: Check-ups for all the family; Hygiene visits every week; Treatment across two surgeries           | none                               |
| l7 dentist-claims  | Oakfield Care :: Family check-ups; Hygiene visits; Flexible appointments                                      | none                               |
| l6 electrician     | Our Work :: Rewires done properly; Consumer unit upgrades; EV charger installs                                | none                               |
| l6 florist         | Otley Road :: Fresh bouquets made daily; Wedding flowers for your day; Weekly office arrangements             | R ×2                               |
| l7 florist         | Otley Road :: Fresh bouquets for every occasion; Wedding flowers made with care; Weekly office arrangements   | R ×3                               |
| l6 gardens         | Your Garden :: Design sketch and plan; Planting chosen for the space; Paths, patios and raised beds           | none                               |
| l6 physio-unbroken | Your Recovery :: Sports injury treatment plan; Back pain assessment notes; Post-operative rehab progress      | status ("notes", "progress"); R ×1 |

Totals from `t0102\count-aurora.out.txt`:

- Status lines appear in 4 of 12 answers.
- 8 of 36 lines repeat a feature title.
- 12 of 12 answers filled the lines with the business's own offerings.

**Other structures, from l6 and l7** (`t0102\dump-aurora.out.txt`):

- **Lead point and two points (t01-S2):** 36 of 36 titles are the brief's value-prop titles word for word. Examples: electrician "NICEIC approved; Written quotes first; Tidy, careful work"; cafe "Baked here each morning; Hearty breakfasts; Sourdough toasties".
- **Steps (t01-S3):** 36 of 36 are the brief's step titles word for word. Examples: cafe "Find us by the canal; Settle in; Order at the counter"; architects "We talk it through; We draw and plan; We stay involved".
- **Statement (t01-S4):** 12 of 12 are the brief's statement word for word. Example: electrician "We care about doing electrical work properly, so your home stays safe and sound."
- **Reassurance lines (t01-S5):** the hero and closing reassurances are identical in 4 of 12 answers (l6 architects, l6 physio-unbroken, l7 architects, l7 florist).
- **Padding:** none, because every list equals the brief's three.
- **Guide examples copied:** none. The guide has no "such as" examples (`grep -c "such as" contract.ts` returns 0).
- **Source words:** "dashboard", "app", "software", "screen", "platform", "product", "users" and "overview" appear in no answer. "stage" and "progress" appear only in the status lines above (`t0102\source-words.out.txt`).

#### 3. Leftovers [R]

The copy model sees none of the drawn chrome, so "repeated in stored copy" is n/a for drawn elements.

| Fix id  | Element                                                                 | path:line                              | What a visitor sees                             | Channel                          | Proposed neutral fix                                               | Changes what the copy model sees | Repeated in stored model copy                                                                                         | Reads wrong for                                                                                  |
| ------- | ----------------------------------------------------------------------- | -------------------------------------- | ----------------------------------------------- | -------------------------------- | ------------------------------------------------------------------ | -------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| t01-L1  | Three window dots                                                       | sections/product-frame.tsx:26-28       | Window controls on the panel                    | page (panel is aria-hidden, :22) | Remove                                                             | No                               | n/a                                                                                                                   | Businesses with no software window to show. No stored fixture is software (fixtures.json notes). |
| t01-L2  | Progress bars at fixed fills: full, three-fifths, one-fifth             | product-frame.tsx:12, :66-70           | Each line looks like a job at a different stage | page                             | Remove, or three equal plain rules                                 | No                               | n/a. Status lines appeared in 4 of 12 answers; the cause cannot be pinned on this element.                            | Businesses whose lines are offerings, which was 12 of 12 answers                                 |
| t01-L3  | Row dots, the first in brand colour                                     | product-frame.tsx:62-64                | The first line looks active                     | page                             | The same plain bullet on all three lines                           | No                               | n/a                                                                                                                   | As L2                                                                                            |
| t01-L4  | Title-bar pill with the name centred and a spacer                       | product-frame.tsx:25-32                | The company name in an app title bar            | page                             | Set the name as a plain heading at the panel's top                 | No                               | n/a                                                                                                                   | As L1                                                                                            |
| t01-L5  | The rail's first entry styled as selected                               | product-frame.tsx:36-50 (style :42-44) | A side menu with one item chosen (md and up)    | page                             | Keep the list; drop the selected style                             | No                               | n/a                                                                                                                   | As L1                                                                                            |
| t01-L6  | Tick rows with grey bars and toggle switches, two on and one off        | sections/features.tsx:9-43             | A settings screen above the lead point          | page (aria-hidden, :16)          | Keep the ticks; remove the toggles                                 | No                               | n/a                                                                                                                   | Businesses with nothing to switch on or off; all stored fixtures                                 |
| t01-L7  | Guide text: "a short screen title inside an illustration of their work" | contract.ts:98                         | The panel's heading                             | copy model only                  | "a short heading for the panel under the headline, in their words" | Yes; needs an eval run           | "screen" appears in 0 answers. Headings were the name or a place in 5 of 12, "Today's ..." in 3, "Our/Your ..." in 4. | Not shown by stored copy. Its part in the status lines is not verified.                          |
| t01-L8  | Fallback panel heading "Overview"                                       | contract.ts:223                        | "Overview" on fallback pages                    | page (fallback only)             | "What we do" (fits 3 to 16 characters, copy-slots.ts:57)           | No                               | 2 fallback pages: l6 hr and l0 gardens                                                                                | Every business; it is a dashboard word                                                           |
| t01-L9  | Tone "product"                                                          | meta.ts:10                             | Nothing                                         | metadata (variety only)          | See part 7                                                         | No                               | n/a                                                                                                                   | Names a kind of offering                                                                         |
| t01-L10 | Description "product frame"                                             | meta.ts:7                              | Nothing                                         | metadata                         | "drawn panel"                                                      | No                               | n/a                                                                                                                   | As L9                                                                                            |

Checked and neutral, so no fix is proposed:

- **Anchor ids:** #top (index.tsx:22), #main (:24), #features (sections/features.tsx:51), #how-it-works (sections/how-it-works.tsx:11), #why (sections/statement.tsx:14) and #start (sections/cta.tsx:11). Link targets are at contract.ts:23-32.
- **Schema keys the model reads:** brand, nav, hero, frame, rows, features, steps, statement, cta and footer (contract.ts:38-66). The template name "Aurora" is sent too (lib/ai/copy.ts:41).
- **Image slot keys:** "hero" and "statement" (contract.ts:277). The copy model never sees them.
- **Fixed words:** "Menu" (nav-menu.tsx:52), "Main" (nav.tsx:28), "Mobile" (nav-menu.tsx:63), "© {year}", and the Pexels credit (footer.tsx:48-63).
- **Forms, field names and placeholders:** none.
- **Code comments that call the panel "the product"** (product-frame.tsx:15-20; copy-slots.ts:31-32) reach no channel.

#### 4. Structures [S]

| Id     | Named by the content it needs                                                                                                                                                                                                | path:line                                                          | Stored fills                         | Limits the evidence shows                                                                                                                                                                                                                             |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| t01-S1 | A drawn panel holding a heading of 3 to 16 characters and three short lines of 8 to 40 characters. The three feature titles run down its side (md and up). The hero picture sits beside the lines (lg and up) or under them. | copy-slots.ts:57-58; sections/hero.tsx:48-55; product-frame.tsx:53 | Table in part 2                      | Every business filled three lines with its own offerings. 4 of 12 answers drifted into stages the sentence never stated (architects ×2, bakery, physio-unbroken). 8 of 36 lines repeat titles the panel already shows. No business failed to fill it. |
| t01-S2 | Exactly three points, one led. Titles 6 to 32 characters, bodies 60 to 190.                                                                                                                                                  | contract.ts:71; copy-slots.ts:61-62                                | 36 of 36 are the brief's value props | None. The brief always holds three (lib/ai/prompts.ts:33).                                                                                                                                                                                            |
| t01-S3 | Exactly three numbered steps                                                                                                                                                                                                 | contract.ts:72; sections/how-it-works.tsx:20-32                    | 36 of 36 are the brief's steps       | None shown. A cafe got visitor steps ("Find us by the canal"), as the brief prompt allows (prompts.ts:34).                                                                                                                                            |
| t01-S4 | One sentence of 60 to 180 characters, set large over a full-bleed photograph                                                                                                                                                 | copy-slots.ts:67; statement.tsx:33-37                              | 12 of 12 are the brief's statement   | None shown                                                                                                                                                                                                                                            |
| t01-S5 | Two reassurance lines and a closing ask                                                                                                                                                                                      | copy-slots.ts:56, :68-71                                           | Identical in 4 of 12 answers         | Repetition only                                                                                                                                                                                                                                       |

No structural clash is proposed. The evidence shows strain in t01-S1 but no business that could not fill it. Whether the strain lifts once t01-L1 to L7 are fixed is not verified; that needs a render and an eval run.

#### 5. Content demand

| Demand             | Count                                                             | path:line                |
| ------------------ | ----------------------------------------------------------------- | ------------------------ |
| Distinct offerings | 3 panel lines and 3 points. The points are the brief's own three. | contract.ts:99, :102-103 |
| Separate reasons   | 0                                                                 | none                     |
| Steps              | 3                                                                 | contract.ts:106          |
| Long paragraphs    | 0 over 190 characters                                             | copy-slots.ts:53-71      |

How the fixtures filled it (`t0102\range-matrix.out.txt` and the attempts listing in this section's scripts):

- **Fallback rate:** l6 1 of 9 (hr, a copy rule: "best" in a step body in all three tries). l7 0 of 4. baseline 0 of 9. l0 1 of 9 (gardens: credit refused, which is not the template).
- **Retries:** 8 of 12 model answers needed a second call. One was for a rule ("best", l6 dentist-claims). Seven were because the first answer could not be read as JSON (part 8, t01-D1).
- **Items beyond the brief's three:** none are possible.
- **Repetition across sections:** see part 2.
- **Shortest it carried, gardens (140 characters):** l6 needed one call and nothing was padded.
- **Longest it carried, dentist-claims (255 characters):** l6 needed a second call for "best" in the closing reassurance; the sentence says "number one" and "award-winning". l7 needed one call, and its closing line uses the visitor's own "8am to 8pm".

#### 6. Slots

| Slot                                                                                             | Role and shape                                                                                                                                                                                                                                                                                                            | Text over it                                                                                                     | Shape implies people | Empty state                                                      |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------- | ---------------------------------------------------------------- |
| hero (slot 0). It gets the hero searches and is the poster's picture (lib/preview/status.ts:49). | A picture inside the drawn panel. From lg it is a 15rem column at the panel row's height, cropped to fill (product-frame.tsx:53, :82). Below lg it is 4:3 at full panel width, under the lines, inside a panel clipped at 22rem or 20rem (sections/hero.tsx:48). Whether it is visible below lg is for the renders agent. | None. alt="" (:78).                                                                                              | No                   | Omitted (:75)                                                    |
| statement                                                                                        | A full-bleed backdrop under one large sentence, cropped to fill a section at least 70svh tall (statement.tsx:22-25, :33). It also zooms from 1.08 as it scrolls (aurora.css:50-54, :87-91), but not under reduced motion.                                                                                                 | Yes. The sentence sits on a scrim that is solid at the foot (:29, :35). Pexels' alt text goes on the page (:21). | No                   | The light field, with the sentence in surface text (:15-16, :35) |

Own photographs fill slots in order, and any later slot stays empty (lib/images/plan.ts:22-30). A visitor can add up to 6 (lib/config.ts:141).

| Own photographs | Empty slots that render | Photographs never shown |
| --------------- | ----------------------- | ----------------------- |
| 1               | 1 (statement)           | 0                       |
| 3               | 0                       | 1                       |
| 6               | 0                       | 4                       |

#### 7. Tone and description words

- **"product"** (meta.ts:10). Proposed word for the feel: "sleek". No ready template uses "sleek" or "product" (templates/*/meta.ts:10; only t10, which is not ready, has "product"), so the variety pass among the ready eight would behave as it does today.
- **"product frame"** (meta.ts:7). Proposed: "drawn panel".
- "luminous" and "confident" are already words for a feel.

#### 8. Defects (wrong for every business)

- **t01-D1:** the first answer could not be read as JSON in 7 of 11 first calls in l6 and 3 of 4 in l7. Monolith, Atlas and Vector had 0, and Harbor had 4 of 9. Each miss costs a second call. The cause is not recorded: the eval keeps no raw text when there is no JSON (tests/eval/pipeline.eval.ts:114-131; per-template counts from my script in this section).
- **t01-D2:** the stored phone shot is 435 px wide for a 390 px viewport (tests/eval/screenshots.mjs:24-26; `l0-skeleton/shots/dentist-claims-t01-aurora-phone.png`, file header). It shows the header button beside the menu toggle, although sections/nav.tsx:43 hides it below md. The cause is not verified.
- **t01-D3:** the closing button points at its own section: href #start (contract.ts:164) inside `id="start"` (sections/cta.tsx:11).

#### 9. "Suits" candidates (proposals for the owner, not verdicts)

- **Trades and home services with three named services**, for example the electrician and gardens fixtures. The panel lines came straight from the sentence with no status words, and nothing was padded (part 2).
- **Shops and makers with named products**, for example florist and bakery. The lines were their own products. The bakery's status words are a strain to re-check after t01-L2 and t01-L7.
- **Any business with a short sentence.** The page asks for nothing beyond the brief's three of each and has no long paragraph (part 5). This is a sentence property, so it supports the two proposals above but is not a category of its own.
- **In doubt until a render with t01-L1 to L7 fixed:** clinics (physio lines read as records) and creative studios (invented stages).
- **Software and apps:** no stored evidence, because no fixture is one. These stay unjudged.

#### 10. Provenance

Aurora was built in-house as "a seven-section SaaS page" (docs/adr/0008-template-contract-and-aurora.md:11). ADR 0008:20 makes the panel "of this product and never of software in general". The example page is "an invented job-scheduling product for trades businesses" (example/content.ts:5). Commit 7b420b6, which first wrote the copy model's guide, aimed the panel at "their work" and "things they do" (contract.ts:98-99), but the drawing kept its window chrome. No ADR records that change of aim (grep of docs/adr). This explains t01-L1 to L10.

### t02-monolith (Monolith)

Paths are under `templates/t02-monolith/` unless written in full. Stored records are `test-results/eval/<run>/<fixture>.json`, field `copy.t02-monolith`. The scripts are in `t0102\`, as for Aurora.

#### 1. Design

- **Header:** sticky and 56 px tall, with the name beside a small mark, the links as quiet buttons and a grey button (sections/nav.tsx:12-38).
- **Hero:** two columns from lg (sections/hero.tsx:13).
  - Left: a bold headline with two phrases set in two gradients (sections/emphasis.tsx:24-41; monolith.css:87-102), a sentence and two buttons.
  - Right: four overlapping cards in a fixed 700×500 box over a sliding blurred glow (sections/hero-cards.tsx:29; monolith.css:13-42). The cards are hidden below lg.
- **Label row:** a small centred heading in brand colour over wrapping labels, each with an icon (sections/sponsors.tsx).
- **About:** a muted, bordered panel with a picture, a paragraph and four large phrases. The phrases run in four columns from lg and two below (sections/about.tsx:14-41).
- **Steps:** four cards (sections/how-it-works.tsx:20).
- **Features:** a row of badges, then three cards, each with a picture in its footer (sections/features.tsx).
- **Services:** three cards with icons beside a large picture (sections/services.tsx:17).
- **Then:** a muted ask band, an FAQ accordion, the footer, and a back-to-top button (monolith.css:109-126).

| Aspect  | Code fact                                                                                                                                                         |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Density | High: many cards, and fixed counts of 3 and 4 (contract.ts:93-103). With no pictures the page is 5,170 to 5,230 px tall at 1440 (l0 desktop shots, file headers). |
| Type    | The body face only, with bold sans headings. No section uses `font-display` (grep).                                                                               |
| Colour  | Cards on the accent surface. One phrase per heading in a brand gradient (styles.ts:35-36).                                                                        |
| Motion  | The sliding glow, the accordion and the back-to-top button only (monolith.css).                                                                                   |
| Led by  | Cards and type. Pictures are shown whole at their own ratio (`object-contain`).                                                                                   |

#### 2. Range

Same marks as Aurora's table. Source: `t0102\range-matrix.out.txt`.

| Fixture         | Kind (fixtures.json line) | Sentence length | baseline            | l0                                                      | l6  | l7  |
| --------------- | ------------------------- | --------------- | ------------------- | ------------------------------------------------------- | --- | --- |
| a1-gas          | trades (:19)              | 150             | F (grammar refused) | F (digit rule)                                          | M1  | M2  |
| awkward         | consultancy (:79)         | 217             | F (grammar)         | M1                                                      | M1  | M1  |
| cafe            | food (:91)                | 154             | F (grammar)         | M2                                                      | M1  | M2  |
| cleaning        | services (:199)           | 165             | F (grammar)         | F (credit refused)                                      | M1  | –   |
| dentist-claims  | clinic (:31)              | 255             | F (grammar)         | M2                                                      | M2  | M1  |
| gardens         | trades and design (:211)  | 140             | F (grammar)         | F (credit)                                              | M1  | –   |
| physio-longest  | clinic (:139)             | 125             | F (grammar)         | M2                                                      | M2  | –   |
| physio-unbroken | clinic (:127)             | 176             | F (grammar)         | F (audience line over 30 characters in all three tries) | M2  | –   |

Monolith carried 8 businesses in 28 stored pairs: 16 with model copy and 12 with fallback. Every baseline answer fell back because "The compiled grammar is too large" (stored `errors`). l6 and l7 hold 12 model answers. It was never given the shortest, longest or vague fixtures.

**Stored l6 model copy, by structure** (`t0102\dump-monolith.out.txt`). P marks padding beyond the brief. R marks a line that repeats another section, measured by containment in a tag, label, feature title, value prop or included point.

| Fixture         | Label row (t02-S2)                                                        | Four phrases (t02-S3)                                                                                                         | Fourth step (t02-S4)     | Services (t02-S6)                                                        |
| --------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------ |
| a1-gas          | Boiler repairs; Boiler servicing; New installs; Bradford; Shipley         | Gas Safe / registered engineers; Same week / appointments; No charge / for call-outs; Local cover / Bradford and Shipley      | Boiler sorted (P)        | Boiler repairs; Boiler servicing; New boiler installs (R ×2)             |
| awkward         | Small businesses; Sole traders; Landlords; Tax returns; VAT; Payroll      | Twelve years / around Leeds; No jargon / plain explanations; Friendly / and approachable; Fair prices / kept down             | Friendly all the way (P) | Books and bookkeeping; Tax returns and VAT; Payroll support (R ×3)       |
| cafe            | (heading "What we serve") Breakfasts; Sourdough toasties; Cakes; Coffee   | Baked fresh / every morning; By the canal / in Hebden Bridge; Dogs welcome / and muddy boots; Prams welcome / pop in any time | Enjoy the canal (P)      | A warm welcome for all; A spot by the water; Food made with care         |
| cleaning        | Newcastle; Gateshead; Domestic Cleaning; End-of-Tenancy                   | Same cleaner / every visit; Insured / and DBS-checked; Agreed / checklist; Newcastle / and Gateshead                          | Enjoy Your Home (P)      | Domestic Cleaning; End-Of-Tenancy Cleaning; Checklist Planning (R ×2)    |
| dentist-claims  | Check-ups; Hygiene visits; Treatment; Family dental care                  | Open daily; Two surgeries; Flexible finance; Trusted hygiene                                                                  | Book Again (P)           | Family Check-ups; Dental Treatment; Hygiene Visits (R ×3)                |
| gardens         | Garden Design; Planting Plans; Paths and Patios; Raised Beds; Maintenance | Design; Planting; Paths; Care                                                                                                 | Ongoing Care (P)         | Design and Planning; Building Work; Ongoing Maintenance (R ×1)           |
| physio-longest  | Running; Cycling; Walking; Gait Analysis; Injury Rehab                    | Sports massage; Gait analysis; Injury rehab; Saturday clinic                                                                  | Keep Moving (P)          | Training Recovery; Movement Check; Return To Sport                       |
| physio-unbroken | Sports injuries; Back pain; Post-op rehab; Evening slots                  | Sheffield / and Leeds clinics; Evening / appointments; Sports injury; Post-op                                                 | Keep recovering (P)      | Direct or referred care; Flexible appointments; Tailored treatment plans |

How l7 differed:

- **a1-gas:** fourth step "Job done properly".
- **awkward:** fourth step "Friendly and fair", which restates a value prop. Its phrases include "Friendly / and cheap", the visitor's own word.
- **cafe:** fourth step "Relax by the water". Its services were "Dogs welcome; Prams welcome; Muddy boots welcome".
- **dentist-claims:** fourth step "Plan Larger Work". Its phrases were "Two / surgeries; Seven days / a week; 8am to 8pm / opening hours; 0% finance / on larger treatment", which are the visitor's own figures.

Counts over the 12 answers (`t0102\count-monolith.out.txt`):

- **Fourth step added:** 12 of 12. The first three steps are the brief's steps word for word in 36 of 36.
- **Feature titles:** 36 of 36 are the brief's value props.
- **The hero's offering card:** repeats feature 1 in 12 of 12, as the guide asks (contract.ts:156).
- **Included points:** 20 of 36 are a value prop.
- **Phrases:** 35 of 48 restate another section.
- **Service titles:** 16 of 36 repeat a tag, label or feature.
- **Tags:** 39 of 73 are also labels.
- **Quote card:** first person plural in 12 of 12. It is the brief's statement word for word in 3 of 12.
- **Guide examples copied:** see part 3, t02-L10 to L14.
- **Source words:** "sponsor", "users", "template", "software", "app", "team" and "pricing" appear in no answer. "plan" appears in 2 of 12 included-card sentences, for gardens and physio-longest (`t0102\source-words.out.txt`).

#### 3. Leftovers [R]

| Fix id  | Element                                                                                                      | path:line                                       | What a visitor sees                                                                           | Channel                        | Proposed neutral fix                                      | Changes what the copy model sees | Repeated in stored model copy                                                              | Reads wrong for                                                                    |
| ------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------ | --------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| t02-L1  | Panels mark beside the name                                                                                  | sections/logo.tsx:24; sections/icons.tsx:5-22   | A layout-grid icon in the header, menu and footer when there is no logo image                 | page                           | Remove, or a plain dot                                    | No                               | n/a                                                                                        | Any business                                                                       |
| t02-L2  | Light bulb on the offering card                                                                              | hero-cards.tsx:97                               | A bulb beside "Gas Safe registered" or "Open Every Day" (lg and up)                           | page                           | One neutral mark, or none                                 | No                               | n/a                                                                                        | Any business whose first point is not an idea                                      |
| t02-L3  | Radar beside every label                                                                                     | sponsors.tsx:20                                 | A radar beside "Bradford" or "Landlords"                                                      | page                           | Remove, or a plain dot                                    | No                               | n/a                                                                                        | All 12 answers: the labels were offerings, places and audiences                    |
| t02-L4  | Medal, map, plane and gift drawings on the steps, by position                                                | how-it-works.tsx:8, :27                         | In l6 a1-gas: "We quote the job" gets a map, "We get it done" a plane, "Boiler sorted" a gift | page                           | Numerals 1 to 4, or one neutral mark                      | No                               | n/a                                                                                        | All 12 step sets                                                                   |
| t02-L5  | Chart, wallet and magnifier drawings on the services                                                         | services.tsx:9, :32                             | In l7 cafe: "Dogs welcome" gets a chart, "Prams welcome" a wallet                             | page                           | Numerals, or one neutral mark                             | No                               | n/a                                                                                        | All 12 service sets                                                                |
| t02-L6  | `<title>Free Icons</title>` in eight drawings                                                                | icons.tsx:31, 109, 177, 235, 333, 407, 497, 567 | A "Free Icons" tooltip, and "Free Icons" read aloud                                           | page tooltip and screen reader | Remove the titles; mark the drawings aria-hidden          | No                               | n/a                                                                                        | Every business (also t02-D1)                                                       |
| t02-L7  | Screen-reader text "Menu Icon"                                                                               | nav-menu.tsx:49                                 | "Menu Icon" read aloud                                                                        | screen reader                  | "Menu"                                                    | No                               | n/a                                                                                        | Every business                                                                     |
| t02-L8  | Ids #sponsors and #statistics                                                                                | sponsors.tsx:11; about.tsx:34                   | Nothing; no link targets them (contract.ts:23)                                                | DOM only                       | #areas and #highlights, or drop                           | No                               | n/a                                                                                        | None seen                                                                          |
| t02-L9  | Anchor #cta behind every ask                                                                                 | contract.ts:29, :237, :242, :252, :284, :295    | "#cta" in the address bar                                                                     | URL                            | #contact                                                  | No                               | n/a                                                                                        | Every business (web jargon)                                                        |
| t02-L10 | Guide example "such as Why we started"                                                                       | contract.ts:146                                 | The quote card's subtitle                                                                     | copy model only                | No example: "a short line under the name, in their words" | Yes                              | 12 of 12 (l6 ×8, l7 ×4)                                                                    | Every page says the same thing, and says it even when the sentence gives no origin |
| t02-L11 | Guide examples "such as What you get" and "such as Included"                                                 | contract.ts:151-152                             | The included card's title and badge                                                           | copy model only                | Drop the examples                                         | Yes                              | 12 of 12 and 11 of 12                                                                      | The same words for every business                                                  |
| t02-L12 | Guide example "such as What we cover"                                                                        | contract.ts:158                                 | The label row's heading                                                                       | copy model only                | Drop the example                                          | Yes                              | 11 of 12                                                                                   | The same words for every business                                                  |
| t02-L13 | Guide examples "such as Same week" and "such as appointments"                                                | contract.ts:164-165                             | The phrases                                                                                   | copy model only                | Examples that presume no booking, or none                 | Yes                              | 3 answers used them, all in the visitor's own words (a1-gas l6 and l7, physio-unbroken l6) | Businesses without appointments; not shown in stored copy                          |
| t02-L14 | Guide examples "About the company name", "Frequently asked questions", "Still have questions?", "Contact us" | contract.ts:160, :186, :190, :191               | Headings and the FAQ's closing line                                                           | copy model only                | Optional: leave or drop                                   | Yes                              | 10, 12, 12 and 12 of 12. The two misses are the long-name fixtures.                        | None; repetition only                                                              |
| t02-L15 | Key `sponsors`                                                                                               | contract.ts:59, :158-159                        | The label row                                                                                 | copy model only                | Rename to `areas`                                         | Yes                              | 0 answers say "sponsor"                                                                    | None shown                                                                         |
| t02-L16 | Keys `cards.quote`, `cards.profile` and `cards.plan`                                                         | contract.ts:46-56                               | The hero cards                                                                                | copy model only                | Rename to `statement`, `audience` and `included`          | Yes                              | "plan" in 2 of 12 included-card sentences; no prices or tiers                              | None shown                                                                         |
| t02-L17 | Image slot keys `quote` and `profile`                                                                        | contract.ts:482                                 | Nothing. The judge's purpose names no slot (lib/images/plan.ts:42-45).                        | metadata                       | Map to slot classes named by shape                        | No                               | n/a                                                                                        | None                                                                               |

Checked and neutral:

- **Fixed words:** "Back to top" (scroll-to-top.tsx:10), "Close menu" and "Close" (nav-menu.tsx:55, :85), "Main" and "Mobile", "©", and the Pexels credit (footer.tsx).
- **Forms:** none on a visitor's page, because the newsletter is null (contract.ts:290).
- **Fallback-only words:** "Listen", "Agree", "Deliver" and "Stay" (contract.ts:404-409).

#### 4. Structures [S]

| Id     | Named by the content it needs                                                                                                                                                                                                           | path:line                                       | Stored fills                                                                                           | Limits the evidence shows                                                                                                                                                                                                                                    |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| t02-S1 | Four cards (lg and up only): a first-person line of 20 to 90 characters with a 40 px circle; an audience line of 4 to 30 characters with a 96 px circle; a card of three included things with a badge and a button; and the first point | hero-cards.tsx:29-104; copy-slots.ts:151-163    | Audience lines such as "Homeowners needing boiler work". Included points were value props in 20 of 36. | The audience line ran over 30 characters in 3 of the 5 retries, and caused the l0 physio-unbroken fallback. This is sentence-level (long audiences). The circles are a slot question (part 6).                                                               |
| t02-S2 | 3 to 6 labels of 3 to 18 characters                                                                                                                                                                                                     | copy-slots.ts:165, :230                         | Table in part 2                                                                                        | None shown. It mixed offerings, places and audiences.                                                                                                                                                                                                        |
| t02-S3 | A paragraph of 120 to 420 characters and exactly four large phrases with no numbers                                                                                                                                                     | contract.ts:99, :163-165; copy-slots.ts:168-170 | Table in part 2                                                                                        | 35 of 48 phrases restate another section. One l6 retry was a phrase at 18 characters (the limit is 16).                                                                                                                                                      |
| t02-S4 | Exactly four steps                                                                                                                                                                                                                      | contract.ts:100, :169                           | Fourth step added in 12 of 12                                                                          | Universal padding: the brief always has three (prompts.ts:34)                                                                                                                                                                                                |
| t02-S5 | 4 to 9 badges and exactly three cards, each over a picture                                                                                                                                                                              | contract.ts:101, :173-175; features.tsx:18-44   | 73 tags; feature titles were value props in 36 of 36                                                   | None shown                                                                                                                                                                                                                                                   |
| t02-S6 | Three services "different from the features"                                                                                                                                                                                            | contract.ts:102, :179                           | Table in part 2                                                                                        | Needs about six distinct offerings. 16 of 36 titles repeated another section. The cafe got reasons (l6) and welcomes (l7), and physio-longest got rewordings. With one café fixture, it cannot yet be said whether this is sentence-level or category-level. |
| t02-S7 | 3 to 5 questions with answers of 40 to 300 characters                                                                                                                                                                                   | copy-slots.ts:219-220, :236                     | 8 of 12 used five                                                                                      | One answer came in at 39 characters (a retry)                                                                                                                                                                                                                |

No structural clash is proposed. t02-S6 for businesses with few distinct offerings is in doubt, and needs a second fixture of that kind.

#### 5. Content demand

| Demand             | Count                                                                                          | path:line                                   |
| ------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Distinct offerings | 6 (3 features and 3 different services), plus 4 to 9 tags, 3 to 6 labels and 3 included points | contract.ts:101-102, :155, :159, :173, :179 |
| Reasons and facts  | 4 phrases, a first-person line and an audience line                                            | contract.ts:99, :144-148                    |
| Steps              | 4                                                                                              | contract.ts:100                             |
| Questions          | 3 to 5                                                                                         | copy-slots.ts:236                           |
| Long paragraphs    | 1 (120 to 420 characters), plus FAQ answers of up to 300                                       | copy-slots.ts:168, :220                     |

How the fixtures filled it:

- **Fallback rate:** baseline 8 of 8 (grammar refused), l0 4 of 8, l6 0 of 8, l7 0 of 4.
- **Retries:** 5 of 12. Three were for the audience line, one for a phrase's length, and one (l7 cafe) for a footer group with a single link.
- **Items beyond the brief's three:** a fourth step in 12 of 12; four phrases every time; 36 service titles; 73 tags, an average of 6.1.
- **Shortest it carried, physio-longest (125 characters):** needed a second call for the audience line. It got "Keep Moving" as a fourth step. Its three services were rewordings of its three offerings.
- **Longest it carried, dentist-claims (255 characters):** l6 needed a second call for a phrase at 18 characters. Its services repeated the labels: 3 of 3 in l6 and 2 of 3 in l7.

#### 6. Slots

| Slot                                                           | Role and shape                                                                                                                              | Shows                         | Text over it | Implies people               | Empty state                                  |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ------------ | ---------------------------- | -------------------------------------------- |
| about (slot 0, the poster's picture: lib/preview/status.ts:49) | Beside the paragraph from md, under it below md. 300 px wide at its own ratio, shown whole (about.tsx:15-23).                               | all widths                    | none         | no                           | Omitted; the text takes the full width (:16) |
| services                                                       | Beside the service cards from lg, under them below lg. 300, 500 (md) or 600 (lg) px wide, shown whole (services.tsx:17, :45-53).            | all widths                    | none         | no                           | Omitted; from lg its column stays empty      |
| feature-1 to feature-3                                         | One per feature card, in the card's footer. 200 px wide, or 300 from lg (features.tsx:34-44). Each one's purpose is its own card's feature. | all widths                    | none         | no                           | An empty card footer                         |
| quote                                                          | A 40 px circle beside the name, cropped to fill (avatar.tsx:17, :40; hero-cards.tsx:32)                                                     | lg and up (hero-cards.tsx:29) | none         | yes: the shape of a portrait | The brand's initials (avatar.tsx:20-31)      |
| profile                                                        | A 96 px circle over a card's top edge (hero-cards.tsx:45-50)                                                                                | lg and up                     | none         | yes                          | Initials                                     |

Empty slots that render with own photographs. Seven slots render at 1024 px and wider; five below that:

| Own photographs | 1024 px and wider                     | Below 1024 px |
| --------------- | ------------------------------------- | ------------- |
| 1               | 6                                     | 4             |
| 3               | 4                                     | 2             |
| 6               | 1 (the profile circle shows initials) | 0             |

With 6 photographs, the visitor's sixth photograph is cropped into the 40 px circle.

In l6, none of the 13 stock pictures placed in the circles has alt text describing a portrait. Six describe people at work (`t0102\slots-picks.out.txt`).

#### 7. Tone and description words

None name a kind of business: the tones are "friendly", "card" and "busy" (meta.ts:10), and the description (meta.ts:7) names none either. No change is proposed.

#### 8. Defects (wrong for every business)

- **t02-D1:** "Free Icons" (fix t02-L6).
- **t02-D2:** "Menu Icon" (fix t02-L7).
- **t02-D3:** meta.ts:7 says "three How-it-works cards", but four render (contract.ts:100). It also describes the hero cards, which do not show below 1024 px.
- **t02-D4:** the band's own button points at #cta, which is the band itself (contract.ts:284; sections/cta.tsx:11).
- **t02-D5:** the fourth step and the fourth phrase pad the page for every business (t02-S3 and t02-S4). This goes on the fix list.

#### 9. "Suits" candidates (proposals for the owner, not verdicts)

- **Trades and home services with several named jobs and an area they cover** (a1-gas, cleaning). Tags, labels and services were all their own jobs and places. Caveat: the services repeat the tags.
- **Clinics and practices with several treatments and facts** (dentist-claims, both physio fixtures). The phrases were drawn from the sentence; l7 used the visitor's own figures. Caveat: long audience lines.
- **Accountancy and consultancy with listed services and clients** (awkward). Its tags were "Books; Tax returns; VAT; Payroll; Sole traders; Landlords".
- **Weakest fill:** the café. Its services became reasons and welcomes, and its fourth step became "Enjoy the canal". This is in doubt, not a proposed clash.

#### 10. Provenance

Monolith was ported from leoMirandaa/shadcn-landing-page by Leopoldo Miranda (docs/adr/0023-three-templates-ported-from-open-source-layouts.md:13). That source is a landing-page template for a software product. Its words are kept on the example page: "Sponsor 1" to "Sponsor 6" (example/content.ts:82), "2.7K+ Users" (:88), "Code Collaboration" (:153), "Is this template free?" (:316), and portraits from pravatar.cc (:6-10, :16). This explains t02-L1 to L17: the sponsors row, the statistics behind the four phrases, the testimonial, team and pricing cards, and the icons taken from the source's Icons.tsx (sections/icons.tsx:1-3).

### t03-meridian (Meridian)

**Evidence used.** Template paths below are relative to `templates/t03-meridian/` unless they start with `lib/`, `app/`, `tests/`, `docs/` or `node_modules/`. Stored runs are in `test-results/eval/`. "Model copy" means l6-all-fixes plus l7-sentence, which is 13 answers. Counts come from my scripts in `test-results/template-fit/t0304/`: range.cjs, dump.cjs (output dump-t03-meridian.txt), counts.cjs, repeat.cjs, verbatim.cjs, lengths.cjs and picks.cjs. I also fetched one stored page from the dev server and saved it as mer-elec.html (`/dev/eval/l6-all-fixes/electrician/t03-meridian`). real-run holds only screenshots of /start, with no copy for this template.

#### 1. Design

- **Order.** Header, hero, sliding labels, benefits, features, services, ask, contact, FAQ, footer (index.tsx:38-52). Testimonials, team and pricing are always null on a visitor's page (contract.ts:221-222,228).
- **Header.** A floating rounded bar, sticky 20 px from the top. It is 90% wide on phones, 70% from md and 75% from lg (sections/nav.tsx:17).
  - From lg, the first item opens a 600 px panel with a picture and three short entries. It opens on hover or keyboard focus (nav.tsx:29-70; meridian.css:59-81).
  - Below lg, a sheet slides in from the left (nav-menu.tsx:53-100).
- **Hero, centred.**
  - A one-word tag in a pill, with a short line beside it.
  - A bold headline with one phrase in a gradient, a lead and two buttons.
  - Then one wide picture rising out of a blurred pool of the brand colour and fading into the page at its foot (hero.tsx:15-67).
- **Sliding labels.** A row of short labels, each beside an icon, fading at both edges (sponsors.tsx:12-37; meridian.css:12-53).
- **The rest, in order:**
  - words beside a two-by-two of cards, each with an icon and a faint number from 01 to 04 (benefits.tsx:15-50);
  - a centred grid of icon cards (features.tsx:37-66);
  - two to four cards held to 60% width (services.tsx:28);
  - a large centred ask under an 80 px speech-bubbles mark, between two rules (community.tsx:14-40);
  - three steps beside a form card (contact.tsx:29-163);
  - FAQ rows (faq.tsx:13-39);
  - a boxed footer (footer.tsx:18-65).

| Aspect  | From code                                                                                                              |
| ------- | ---------------------------------------------------------------------------------------------------------------------- |
| Type    | Body face only. No Meridian file uses font-display (grep), so the look's display face never shows.                     |
| Colour  | brand-deeper carries the eyebrows, icons and gradient phrase. Cards sit on the accent surface (copy-slots.ts:202-212). |
| Motion  | The sliding row, which stands still under reduced motion (meridian.css:45-53). Also the hover menu and accordions.     |
| Led by  | Type and cards. One picture.                                                                                           |
| Density | A small eyebrow over every section heading (styles.ts:34).                                                             |

#### 2. Range

| Fixture      | Kind (tests/fixtures/eval/fixtures.json) | Design no. | baseline | l0-skeleton | l6-all-fixes | l7-sentence |
| ------------ | ---------------------------------------- | ---------- | -------- | ----------- | ------------ | ----------- |
| architects   | creative (:103)                          | 3          | fallback | model       | model        | model       |
| electrician  | trades (:151)                            | 2          | fallback | model       | model        | not run     |
| it-support   | services (:223)                          | 3          | fallback | fallback    | model        | not run     |
| joinery      | trades (:7)                              | 1          | fallback | model       | model        | model       |
| longest      | consultancy (:67)                        | 1          | fallback | model       | model        | model       |
| photographer | creative (:187)                          | 1          | fallback | fallback    | model        | not run     |
| shortest     | services (:55)                           | 3          | fallback | model       | model        | model       |
| vague        | services (:43)                           | 2          | fallback | model       | model        | model       |

Why the fallbacks happened:

- **baseline:** "The compiled grammar is too large" (baseline/*.json, field copy.t03-meridian.errors).
- **l0-skeleton:** a credit refusal (l0-skeleton/it-support.json and photographer.json, same field).

Source: range.cjs.

**What l6 wrote in each structure.** Marks:

- [P] is padding: a point the sentence did not make.
- [=] repeats another section.

| Business     | Tag: line                                           | Sliding labels                                                             | 4th benefit                     | Features                                                                          | Services                                                                                              | Steps (contact rows)                                 |
| ------------ | --------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| architects   | Studio: "Architecture for Peak District homes"      | Extensions, Loft conversions, Barn conversions, Peak District, Sheffield   | Close involvement               | We talk it through, We draw and plan, We stay involved [= steps]                  | House extensions, Loft and barn conversions, Planning handled                                         | same as features                                     |
| electrician  | York: "Serving York and Selby homes"                | Rewires, Consumer units, EV chargers, Fault finding, York, Selby           | Local to you [= area]           | Rewires, Consumer units, EV chargers, Fault finding                               | Home rewires, Consumer unit upgrades, EV charger installs, Fault finding and repairs [= features 4/4] | Get in touch, Receive your quote, We get to work     |
| it-support   | Nottingham: "IT support for small offices"          | Helpdesk, Microsoft 365, Backups, Security                                 | Less to worry about [= backups] | Helpdesk, Microsoft 365, Backups, Security                                        | Ongoing helpdesk support, Microsoft 365 management, Backups and security cover [= features]           | Get in touch, We set things up, Ongoing support      |
| joinery      | West Yorks: "Handmade joinery for your home"        | Wardrobes, Alcove units, Kitchens, Measuring, Fitting                      | Fits your home                  | Measured to fit, Drawn for your room, Made and fitted by us                       | Fitted wardrobes, Alcove units, Kitchens                                                              | Get in touch, Measure and draw, Make and fit         |
| longest      | Durham: "A two-person consultancy in Durham"        | Business review, Valuation, Paperwork, Finding a buyer, Handover support   | Calm, trusted approach          | Initial conversation, Plain business review, Ongoing support [= steps]            | Preparing for sale, Preparing for handover                                                            | same as features                                     |
| photographer | Relaxed: "Documentary photography, no forced poses" | Weddings, Family sessions, Northumberland, Documentary style               | Something to keep               | Weddings, Family sessions, Across Northumberland [P: a place, to reach three]     | Wedding photography, Family photography, UK printed albums                                            | Get in touch, Meet and plan, Photograph the day      |
| shortest     | Chorlton: "Dog grooming and walking, close to home" | Grooming, Walking, Chorlton                                                | Dogs come first [P]             | Grooming, Walking, Local to you [P; all three bodies = the menu's, word for word] | Dog grooming, Dog walking                                                                             | Get in touch, We arrange a visit, Ongoing care       |
| vague        | Hello: "A friendly hand, house and garden"          | House jobs, Garden jobs, Little fixes, Bigger tasks, Indoors, Outdoors [P] | Happy to help [= statement]     | Little fixes, Bigger tasks, Indoor jobs [P]                                       | Around the house, Around the garden                                                                   | Give us a ring, We talk it through, We get it sorted |

What l7 changed:

- **architects and joinery:** features became the offerings and services became the process.
- **longest:** four features, and the fourth benefit "Known through accountants". This came after the rules rejected the title "Trusted by".
- **shortest:** added the label "Local visits" [P] and the 4th benefit "Personal care" [P].
- **vague:** added the 4th benefit "Friendly chat first" [P].
- **architects:** wrote "we know the homes and the area well" [P].

The other structures:

- **Header menu:** held three offerings or themes in 13 of 13 answers.
- **Ask:** worded from the sentence, for example "Ready to sort your electrics" and "Get in touch about your dog".
- **Form subjects:** named the visitor's own services in 13 of 13 answers, plus a catch-all in 12 of 13.
- **FAQ:** drawn from the sentence, for example "Are you NICEIC approved?".

Source: dump-t03-meridian.txt.

#### 3. Leftovers [R]

| Fix     | Element (path:line)                                                                                                            | What a visitor sees                                                                              | Channel                                                                                                                  | Proposed neutral fix                                                                                          | Copy model sees the fix? | Stored copy                                                                                                                                                                                                                                     | Reads wrong for                                                     |
| ------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| t03-L1  | Label-row icons by position: Crown, Vegan, Ghost, Puzzle, Squirrel, Cookie, Drama (sections/sponsors.tsx:7,16-19)              | A crown by "Rewires", a vegan leaf by "Consumer units", a ghost by "EV chargers" (mer-elec.html) | Page only. Lucide adds aria-hidden (node_modules/lucide-react/dist/esm/shared/src/build/buildLucideIconNode.mjs:48)      | One neutral mark for every label, or none                                                                     | No                       | Drawn on 13 of 13 model pages                                                                                                                                                                                                                   | Every kind. Beside food, the vegan leaf also reads as a diet claim. |
| t03-L2  | Benefit icons: Blocks, ChartLine, Wallet, Sparkle (benefits.tsx:8,26,34)                                                       | A line chart by "Written quotes first", a wallet by "Tidy, careful work" (l6 electrician)        | Page                                                                                                                     | Drop them and let the 01 to 04 numbers lead                                                                   | No                       | 13 of 13                                                                                                                                                                                                                                        | Every kind whose benefits are not money or growth                   |
| t03-L3  | Feature icons: TabletSmartphone, BadgeCheck, Goal, PictureInPicture, MousePointerClick, Newspaper (features.tsx:23-30,46,52)   | A tablet and phone by "Rewires", picture-in-picture by "Fault finding"                           | Page                                                                                                                     | One neutral mark, or numbers                                                                                  | No                       | 13 of 13                                                                                                                                                                                                                                        | Every kind without a screen product                                 |
| t03-L4  | Contact-row icons: Building2, Phone, Mail (contact.tsx:19,41-45)                                                               | A building by "Get in touch", a phone by "Receive your quote", an envelope by "We get to work"   | Page                                                                                                                     | Numbers 1 to 3                                                                                                | No                       | 13 of 13                                                                                                                                                                                                                                        | Every kind. They read as contact details that are not there.        |
| t03-L5  | Down-chevrons mark in a gradient tile when no logo is uploaded (logo.tsx:24)                                                   | An arrow tile as the logo                                                                        | Page                                                                                                                     | The initial in the tile, or the name alone                                                                    | No                       | Every page without a logo (all fixtures use a wordmark)                                                                                                                                                                                         | None shown                                                          |
| t03-L6  | Speech-bubbles mark over the ask (community.tsx:21)                                                                            | A chat mark over the ask heading                                                                 | Page                                                                                                                     | Keep. It is already the port's stand-in (docs/adr/0023-three-templates-ported-from-open-source-layouts.md:33) | No                       | 13 of 13                                                                                                                                                                                                                                        | None shown                                                          |
| t03-L7  | Placeholders "Leopoldo", "Miranda", "leomirandadev@gmail.com" (contact.tsx:81,92,107)                                          | A stranger's name and a real-looking address in the form                                         | Page                                                                                                                     | No placeholders, since the labels already say what to type. Keep "Your message..." (:148).                    | No                       | Every page                                                                                                                                                                                                                                      | Every kind                                                          |
| t03-L8  | Field names firstName, lastName, email, subject, message, and ids meridian-* (contact.tsx:79-80,90-91,104-105,120-121,145-146) | Nothing on the page                                                                              | Form data. With text/plain (contact.tsx:70-71), the names head the lines of the mail body. Not checked in a mail client. | Plain names: name, email, subject, message                                                                    | No                       | Every page                                                                                                                                                                                                                                      | None shown                                                          |
| t03-L9  | Section id and link target `community` (community.tsx:14; contract.ts:23,28,161,203,210; contact.tsx:67)                       | "#community" in the address bar after the header or hero button                                  | URL. The copy model also reads the target name (contract.ts:161).                                                        | Rename the id to `ask` and map the old target to it (copy-free). Rename the target later.                     | Id: no. Target: yes.     | Buttons lead there on 13 of 13 pages. The model used the target once (l6 longest footer) and never wrote the word (counts.cjs).                                                                                                                 | None shown on a render. URL only.                                   |
| t03-L10 | Schema key `sponsors` (contract.ts:53,125-126) and its DOM id (sponsors.tsx:27)                                                | Nothing                                                                                          | Copy model; page source                                                                                                  | Rename the key to `labels`                                                                                    | Yes                      | No sponsor word in 13 of 13 (counts.cjs)                                                                                                                                                                                                        | None shown                                                          |
| t03-L11 | Guide examples (contract.ts:114,117,125,127,132,137,147,154-156)                                                               | The same labels on every page, with "What we do" twice                                           | Copy model, then page                                                                                                    | Describe each slot's job without a "such as" example                                                          | Yes                      | Copied word for word (counts.cjs): "What we do" (menu) 13/13, "What we do" (eyebrow) 13/13, "What we cover" 13/13, "Services" 13/13, "Contact" 13/13, "Send message" 13/13, "FAQ" 13/13, "Common questions" 13/13, "Benefits" 12/13, "New" 0/13 | None shown                                                          |
| t03-L12 | "PRO" badge (services.tsx:35)                                                                                                  | Never shown, because `pro` is always false (contract.ts:219)                                     | None                                                                                                                     | None needed                                                                                                   | No                       | 0                                                                                                                                                                                                                                               | None                                                                |

The other anchors are neutral: #benefits, #features, #services, #contact, #faq, #footer, #top and #main.

#### 4. Structures [S]

| Id      | Content it needs (path:line)                                                                                                                                                                                                        | Stored fills                                                                             | Limit the evidence shows                                                                                 |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| t03-S1  | A one-word tag and a short line above the headline (hero.tsx:18-23; copy-slots.ts:119-120)                                                                                                                                          | A place in 8 of 13, otherwise "Studio", "Relaxed" or "Hello"                             | None                                                                                                     |
| t03-S2  | One wide picture under the hero (hero.tsx:53-67)                                                                                                                                                                                    | See part 6                                                                               | None in copy. A page without the picture needs a render to judge.                                        |
| t03-S3  | Three short entries beside a picture, in a header menu from lg (nav.tsx:29-70; contract.ts:86)                                                                                                                                      | Offerings in 13 of 13. The third was a place in "shortest" ("Local to you").             | Sentence-level padding only                                                                              |
| t03-S4  | Three to seven labels for areas or kinds of work (sponsors.tsx:12-37; copy-slots.ts:184; contract.ts:126)                                                                                                                           | Offerings plus places (7 of 13)                                                          | Sentence-level: invented splits for the vague sentence                                                   |
| t03-S5  | Exactly four numbered benefits (benefits.tsx:24-48; contract.ts:87,130)                                                                                                                                                             | The 4th was added in 13 of 13: drawn from the sentence in 6, a repeat in 3, padding in 4 | Universal. The brief always has three selling points (lib/ai/prompts.ts:33).                             |
| t03-S6  | Three to six features, "what they do" (features.tsx:43-64; copy-slots.ts:185; contract.ts:133-136)                                                                                                                                  | Offerings, or the process                                                                | Sentence-level                                                                                           |
| t03-S7  | Two to four services, "different from the features" (services.tsx:28-38; copy-slots.ts:186; contract.ts:140)                                                                                                                        | They repeated the features in 4 of 13 (repeat.cjs). Two cards in 5 of 13.                | The page asks for offerings five times (S3, S4, S6, S7, S10). That is universal, not a kind of business. |
| t03-S8  | A large ask (community.tsx:14-40)                                                                                                                                                                                                   | Worded from the sentence in 13 of 13                                                     | None                                                                                                     |
| t03-S9  | Three steps beside the form (contact.tsx:39-57; contract.ts:88,150)                                                                                                                                                                 | The brief's steps in 13 of 13                                                            | None                                                                                                     |
| t03-S10 | A form with first and last name, email, a subject chosen from two to five, and a message. It mails the visitor's own address (contact.tsx:63-157; copy-slots.ts:194; contract.ts:234; app/preview/[slug]/[templateId]/page.tsx:72). | The visitor's own services in 13 of 13                                                   | None                                                                                                     |
| t03-S11 | Three to five questions (faq.tsx; copy-slots.ts:195)                                                                                                                                                                                | Three questions in 1 answer, four in 5, five in 7                                        | None                                                                                                     |

I propose no structural clash. No fixture failed a structure, and every strain traces to the brief or the sentence.

#### 5. Content demand

| Demand             | Count (code)                                                                                                         | Stored model copy (13 answers)                                                                                                      |
| ------------------ | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Distinct offerings | Menu 3; labels 3 to 7; features 3 to 6; services 2 to 4; subjects 2 to 5 (contract.ts:86; copy-slots.ts:184-186,194) | Shared titles (repeat.cjs): menu and labels 11/13; labels and features 11/13; labels and subjects 11/13; features and services 4/13 |
| Reasons            | Benefits: exactly 4                                                                                                  | A 4th was added in 13/13                                                                                                            |
| Steps              | Contact rows: exactly 3                                                                                              | Identical to the features in 2/13 (l6 architects, l6 longest)                                                                       |
| Long paragraphs    | None required. The longest slot is a 300-character FAQ answer (copy-slots.ts:176).                                   | The longest prose stored was 138 characters (lengths.cjs)                                                                           |

Fallback, retries and repetition:

- **Fallback rate:** 8/8 in baseline, 2/8 in l0, 0/8 in l6, 0/5 in l7.
- **Retries:** 7 over the 13 model answers (counts.cjs). Their causes:
  - length: 2;
  - wrong shape: 2;
  - claim rules: 2 ("Trusted by" in l7 longest; "best" in l7 vague);
  - not recorded: 1 (l6 vague).
- **Items beyond the brief's three:** the 4th benefit in 13/13. A 4th feature in 3/13, and only where the sentence named four.
- **Sentences of 20 or more characters repeated word for word across sections:** in 5 of 13 answers (verbatim.cjs).

Shortest and longest fixtures:

- **Shortest (37 characters):** one attempt in each run. Two services. A place used as a feature. Its three menu bodies repeated in the features. Padded 4th benefits.
- **Longest (400 characters):** filled every list from the sentence. Its features repeated its steps in l6.

#### 6. Slots

| Slot                                                                    | Role and shape                                                                                                                                                                     | Shows                                                                       | Text over it                                                                                                    | Shape implies people | Empty state                                           |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------- | ----------------------------------------------------- |
| hero: slot 0, which the poster also shows (lib/preview/status.ts:46-49) | One wide picture under the hero words, shown whole at its own ratio. Full width inside a 24 px gutter (styles.ts:15), then 1200 px from md. Rounded and bordered (hero.tsx:55-63). | Every width                                                                 | None. A fade covers its bottom 80 px, or 112 px from md (hero.tsx:66). A colour pool sits behind its top (:54). | No                   | Not drawn. The pool and fade remain (hero.tsx:54-66). |
| hero again, in the header menu (contract.ts:204)                        | The left half of a 600 px panel, cropped to fill, as tall as the three entries beside it (nav.tsx:42-52)                                                                           | lg and up, and only while the menu is open (nav.tsx:26; meridian.css:59-76) | None                                                                                                            | No                   | A muted block (nav.tsx:44)                            |

- **Own photographs:** with 1, 3 or 6, no slot is empty (lib/images/plan.ts:26-30; contract.ts:406). Every photograph after the first goes unused.
- **Stored l6 picks:** the slot was empty for 4 of 8 pairs.
  - architects, joinery and longest: every hero search returned a Pexels 500.
  - electrician: all 12 candidates were rejected.
  - Source: picks.cjs, and imagery.pools in l6-all-fixes/<fixture>.json.

#### 7. Tone and description words

None names a kind of business. The tones are polished, card and spacious (meta.ts:10). The description (meta.ts:7) names sections, not a trade. I propose no change.

#### 8. Defects (wrong for every business)

- **t03-D1. Mail subject.** The mail's subject line is the button label, "Send message" in 13/13 answers (contact.tsx:68). The chosen subject only goes into the body.
- **t03-D2. Heading levels.**
  - Every eyebrow is an h2 beside the real h2: benefits.tsx:18,20; features.tsx:38,40; services.tsx:22,24; contact.tsx:33,35; faq.tsx:15,17.
  - Section leads are h3 (features.tsx:42; services.tsx:25).
  - The copyright line is an h3 (footer.tsx:43-45).
- **t03-D3. Picture box size.** The hero picture is declared 1200×1200 whatever its real size (hero.tsx:57-58). Possible layout shift. Not measured.
- **t03-D4. Dead markup.** An empty grid (services.tsx:26), an empty card header (contact.tsx:61) and an empty card footer (contact.tsx:160).
- **t03-D5. Fallback-only headings.** Fallback copy heads the services section "In their own words" (contract.ts:338).
- **t03-D6. Description.** meta.ts:7 leaves out the sliding labels and the header menu.

#### 9. "Suits" candidates (proposals for the owner, not labels)

- **Businesses that name four or more services, such as a trade with a list of jobs or IT support.** In l6, electrician and it-support filled the menu, labels, features, services and subjects with their own items. Only the 4th benefit repeated something. The page does repeat that list (features and services matched 4/4), and whether that suits is the owner's call on a render.
- **Businesses that take written enquiries about a choice of services.** Subjects held the visitor's own services in 13/13.
- **A weaker candidate: businesses with little to photograph.** The page has one slot and draws without it (hero.tsx:55). Whether it reads complete without a picture needs a render. Not verified.

#### 10. Provenance

- **Source.** Bruno Felipy's shadcn-landing-page (MIT), recorded in docs/adr/0023-three-templates-ported-from-open-source-layouts.md:14.
- **Its business.** A free landing-page template for a software product: "Is this template free? ... a free NextJS Shadcn template" (example/content.ts:351).
- **What it explains:**
  - L10: the sponsors row ("Our Platinum Sponsors", content.ts:72).
  - L9: `community`, from the source's "Join Discord" (:271).
  - L4: contact rows that were an address, phone, mail and hours, with the mail line leomirandadev@gmail.com (:329-334). This is also where the L7 placeholders come from.
  - L3: the feature icons, which suit an app.

### t04-atlas (Atlas)

**Evidence used.** As for Meridian, with dump-t04-atlas.txt, imgmeta.cjs, and atl-gas.html (`/dev/eval/l6-all-fixes/a1-gas/t04-atlas`). Model copy here is 8 answers: 5 in l6 and 3 in l7.

#### 1. Design

- **Order.** Hero, card, pitch, offer, band, checklist, steps, FAQ, back-to-top, footer (index.tsx:51-75). Market tables, exchange rows, partners, newsletter and step pictures are null on a visitor's page (contract.ts:222,227,233,251-255,262).
- **Background.** A faint wash of the brand hues behind the top of the page (index.tsx:43-46; atlas.css:10-30).
- **Header.** Links, a "More" drop-down, and two round buttons: one outlined, one filled with the gradient (nav.tsx:20-92).
- **Hero, split.**
  - A gradient eyebrow in capitals.
  - A headline with every word capitalised (hero.tsx:37) and a lit phrase.
  - A paragraph from 640 px (:41) and two round buttons.
  - A picture at the right from 640 px (:58).
  - Three small discs and a star (:74-100).
- **The rest, in order:**
  - a card over the hero's foot with three titled columns (market.tsx:61-148);
  - a split with a bordered "label │ statement" box and a full-width button (pitch.tsx:28-101);
  - a picture at seven of twelve columns beside three ticked points (offer.tsx:14-53);
  - a rounded tinted band with three titled points and a picture (tools.tsx:27-61);
  - a checklist beside a picture (why.tsx:12-46);
  - three 160 px numbered gradient discs joined by dashed arrows (steps.tsx:30-72);
  - an FAQ beside a picture (faq.tsx:15-69);
  - a ruled four-cell footer (footer.tsx:24-128).

| Aspect | From code                                                                                                                          |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Type   | Body face only (no font-display)                                                                                                   |
| Motion | The hero slides in on load. Blocks below fade, slide or flip in with the scroll. All off under reduced motion (atlas.css:142-187). |
| Led by | Six pictures shown whole beside words, alternating sides                                                                           |

#### 2. Range

| Fixture      | Kind              | Design no. | baseline | l0-skeleton                                | l6    | l7      |
| ------------ | ----------------- | ---------- | -------- | ------------------------------------------ | ----- | ------- |
| a1-gas       | trades (:19)      | 2          | fallback | fallback (the digit in "A1", six attempts) | model | model   |
| awkward      | consultancy (:79) | 3          | fallback | model                                      | model | model   |
| it-support   | services (:223)   | 2          | fallback | fallback (credit)                          | model | not run |
| photographer | creative (:187)   | 2          | fallback | fallback (credit)                          | model | not run |
| vague        | services (:43)    | 3          | fallback | model                                      | model | model   |

All baseline fallbacks: "The compiled grammar is too large" (range.cjs; copy.t04-atlas.errors).

**What l6 wrote.** Marks as for Meridian: [P] is padding, [=] repeats another section.

| Business     | Card columns                                                       | Offer points                                                                                                | Band points                                                               | Checklist                                                                               | Steps                                                   |
| ------------ | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| a1-gas       | Boiler Repairs, Boiler Servicing, New Installs                     | Gas Safe registered engineers, Same-week appointments available, No call-out charge for quotes              | Gas Safe registration, Quick appointments, No call-out charge [=]         | Gas Safe registered engineers, Same-week appointments, No call-out charge [= offer 3/3] | Get in touch, We quote the job, We get it done          |
| awkward      | No jargon, just help; Years around Leeds; Friendly and fair prices | Books kept in order; Tax returns and VAT sorted; Payroll taken care of                                      | Plain speaking, always; Local knowledge; Fair, friendly pricing [=]       | No jargon; Twelve years around Leeds; Fair prices [= columns 3/3]                       | Free first meeting; We sort your books; Ongoing support |
| it-support   | Helpdesk; Microsoft 365; Backups and security                      | Helpdesk for everyday problems; Microsoft 365 set up and managed; Backups and security in place [= columns] | Fixed monthly price; A real person answers; Support that fits your office | Built for small offices; No jargon, no fuss [P]; A real person answers [=]              | Get in touch; We set things up; Ongoing support         |
| photographer | Documentary Style; Weddings and Family; UK Printed Albums          | Documentary-style coverage; Weddings and family sessions; UK printed albums [= columns]                     | A calm presence; No forced poses; Albums you can hold                     | Relaxed, not posed; A calm approach; Something to keep [=]                              | Get In Touch; Meet And Plan; The Day Itself             |
| vague        | All Sorts Of Jobs; Easy To Reach; House And Garden Covered         | Little fixes and bigger tasks; Help indoors and in the garden; A friendly chat before we start [P]          | A Chat First; Jobs Big Or Small; We Get It Done [P]                       | We Help With All Sorts; Easy To Get Hold Of; Indoors Or Out [=]                         | Give Us A Ring; We Talk It Through; We Get It Sorted    |

- **l7 filled a1-gas and vague the same way as l6.** The card columns and steps were the same or nearly so, and a1-gas's checklist again repeated the offer. The band was reworded in both, and vague's offer and checklist were reworded too. For awkward, l7 put offerings in the card ("Books sorted | Tax returns | VAT and payroll").
- **Pitch box:** "Why" in 8 of 8. The statement is the brief's own sentence, word for word, in 8 of 8.
- **Title Case:** link labels were in Title Case in 5 of 8 answers. Cause not verified.

#### 3. Leftovers [R]

| Fix     | Element (path:line)                                                                                                  | What a visitor sees                                                                                          | Channel                         | Proposed neutral fix                                                                           | Copy model sees the fix? | Stored copy                                                                                                             | Reads wrong for                                                  |
| ------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| t04-L1  | `tools` as schema key, link target, section id and slot key (contract.ts:23,68-73,129,153-158,170,418; tools.tsx:28) | Links "Our tools" and "Tools we use" leading to a band about prices, people or years. "#tools" in the URL.   | Copy model, page, URL, metadata | A neutral name such as `approach`. The id first (copy-free), then the key (needs an eval run). | Id: no. Key: yes.        | "Our tools" in l6 it-support (menu and footer). "Tools we use" in l7 awkward (menu and footer). That is 2 of 8 answers. | Kinds that do not sell tools. Shown for IT support and accounts. |
| t04-L2  | `offer` as key, target, id and slot key (contract.ts:23,62-67,148-152,418; offer.tsx:14)                             | Menu entries "Our offer" and "The Offer". "#offer" in the URL.                                               | Same                            | `included`                                                                                     | Same                     | 2 of 8 (l6 awkward, l6 vague)                                                                                           | Kinds with no promotion to offer. Not shown on a render.         |
| t04-L3  | "More ›" link by each column title, all going to #why (market.tsx:72-79; contract.ts:141,223)                        | Three "More" links that all land on the reasons. Screen readers hear "More: Boiler Repairs" (market.tsx:74). | Page, screen reader             | Do not draw the link when the card holds words (copy-free). Drop the slot later.               | Drawing: no. Slot: yes.  | "More" 8 of 8                                                                                                           | Every kind                                                       |
| t04-L4  | Drop-down label, "such as More" (nav.tsx:51-80; contract.ts:127)                                                     | "More"                                                                                                       | Page                            | Keep                                                                                           | n/a                      | 8 of 8                                                                                                                  | None shown                                                       |
| t04-L5  | Box label, "such as Why" (pitch.tsx:44-46; contract.ts:145)                                                          | "Why"                                                                                                        | Page                            | Keep                                                                                           | n/a                      | 8 of 8                                                                                                                  | None shown                                                       |
| t04-L6  | Eyebrow, "such as the company name" (contract.ts:132), set in capitals (styles.ts:22)                                | The name in capitals, under a header that already shows it                                                   | Copy model, page                | "A few words on what they do"                                                                  | Yes                      | 8 of 8                                                                                                                  | None shown                                                       |
| t04-L7  | FAQ eyebrow, "such as Support" (contract.ts:165)                                                                     | "SUPPORT" over the questions                                                                                 | Copy model, page                | "such as Questions"                                                                            | Yes                      | 2 of 8; "Questions" in 6                                                                                                | Not shown                                                        |
| t04-L8  | "Frequently asked questions" (contract.ts:166) and "Get in touch" (:171)                                             | Neutral words                                                                                                | Copy model                      | Keep                                                                                           | n/a                      | 8 of 8 each                                                                                                             | None                                                             |
| t04-L9  | Discs and star over the hero (hero.tsx:17-21,74-100)                                                                 | Coloured shapes, from 640 px                                                                                 | Page (aria-hidden)              | Keep or drop                                                                                   | No                       | Every page                                                                                                              | None shown                                                       |
| t04-L10 | Initial in a gradient tile when no logo is uploaded (logo.tsx:26-34)                                                 | A lettered tile                                                                                              | Page                            | Keep                                                                                           | No                       | Every page                                                                                                              | None                                                             |
| t04-L11 | "Back to top" (index.tsx:68); "© Copyright {year} {name}. All rights reserved" (footer.tsx:109)                      | Fixed words                                                                                                  | Page                            | Drop "Copyright" after the © sign                                                              | No                       | Every page                                                                                                              | None                                                             |

The anchors #start, #why, #how-it-works, #faq, #hero and #navbar are neutral (contract.ts:23-33; pitch.tsx:28).

#### 4. Structures [S]

| Id     | Content it needs (path:line)                                                                                                   | Stored fills                                        | Limit the evidence shows                                                                                                                                                                                                  |
| ------ | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| t04-S1 | A split hero with a picture (hero.tsx:29-102)                                                                                  | Headlines from the sentence                         | None                                                                                                                                                                                                                      |
| t04-S2 | Three things they do, as columns on the card (market.tsx:61-148; contract.ts:92,139)                                           | Offerings in 5 of 8, reasons in 3 of 8              | Sentence-level                                                                                                                                                                                                            |
| t04-S3 | One sentence on why they do this, in the bordered box (pitch.tsx:37-92)                                                        | The brief's statement in 8 of 8                     | None                                                                                                                                                                                                                      |
| t04-S4 | Three ticked things the customer gets (offer.tsx:14-53; contract.ts:93,151)                                                    | Offerings, or the reasons again                     | See S6                                                                                                                                                                                                                    |
| t04-S5 | Three titled points, "different from the columns" (tools.tsx; contract.ts:94,155)                                              | Reasons restated                                    | See S6                                                                                                                                                                                                                    |
| t04-S6 | Three ticked reasons (why.tsx; contract.ts:95,160)                                                                             | The same as the offer, 3/3, for a1-gas in both runs | S2, S4, S5 and S6 ask for four sets of three from a brief with three selling points (lib/ai/prompts.ts:33). Word-for-word repeats in 5 of 8 answers (verbatim.cjs). Universal and sentence-level, not a kind of business. |
| t04-S7 | Three steps in numbered discs. These stand in for step pictures, which are always null (steps.tsx:42-69; contract.ts:251-255). | From the brief                                      | None                                                                                                                                                                                                                      |
| t04-S8 | Three to five questions beside a picture (faq.tsx)                                                                             | Four or five                                        | None                                                                                                                                                                                                                      |
| t04-S9 | Six pictures shown whole and unframed (contract.ts:418)                                                                        | Part 6                                              | The source's pictures were transparent cut-outs. Whether rectangular photographs read right in their place needs a render. Not verified.                                                                                  |

I propose no structural clash.

#### 5. Content demand

- **Fixed counts.** Offerings: 3 in the card and 3 in the offer. Reasons: 3 in the band and 3 in the checklist. Steps: 3. FAQ: 3 to 5 (contract.ts:91-97; copy-slots.ts:191).
- **Long paragraphs.** None required. The longest prose stored was 108 characters, against slot limits of 300 and 400 (lengths.cjs).
- **Fallback rate.** 5/5 in baseline, 3/5 in l0, 0 in l6 and l7.
- **Retries.** 4 over the 8 model answers:
  - "Years of experience" (l6 awkward);
  - "best" (l6 and l7 vague);
  - link labels in the wrong shape (l7 awkward).
- **Items beyond three.** None possible, since every list except the FAQ is fixed at three. The FAQ had five questions in 6 of 8 answers.
- **Shortest fixture it got (vague, 94 characters).** Two attempts in each run. Padded offer and band.
- **Longest it got (awkward, 217 characters).** Honest offerings. In l6 the card equalled the checklist.

#### 6. Slots

| Slot                                      | Role and shape                                                                              | Shows            | Text over it                                            | Shape implies people | Empty state                                       |
| ----------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------- | -------------------- | ------------------------------------------------- |
| hero: slot 0, which the poster also shows | A picture shown whole at its own ratio, in the right half of the hero (hero.tsx:58-73)      | From 640 px only | None. The discs and star may overlap it (not measured). | No                   | The right half is left blank                      |
| pitch                                     | Shown whole beside the box. On phones it sits above the words (pitch.tsx:15-26,31,96-98).   | Every width      | None                                                    | No                   | Not drawn. The words keep half the width from lg. |
| offer                                     | Shown whole at 95% of seven of twelve columns (offer.tsx:16-29)                             | Every width      | None                                                    | No                   | Seven columns are left blank from lg              |
| tools                                     | Shown whole inside the band. On phones it sits above the points (tools.tsx:13-26,32,55-59). | Every width      | None                                                    | No                   | Not drawn. The words keep half the band.          |
| why                                       | Shown whole, left of the checklist (why.tsx:14-28)                                          | Every width      | None                                                    | No                   | The left half is left blank                       |
| faq                                       | Shown whole, left of the questions (faq.tsx:17-30)                                          | Every width      | None                                                    | No                   | The left half is left blank                       |

**Own photographs** (lib/images/plan.ts:26-30):

| Own photographs | Empty slots, 640 px and wider (6 render) | Empty slots, below 640 px (5 render)         |
| --------------- | ---------------------------------------- | -------------------------------------------- |
| 1               | 5                                        | 5 (the one photograph fills the hidden hero) |
| 3               | 3                                        | 3                                            |
| 6               | 0                                        | 0                                            |

**Stored picks** (l6, picks.cjs):

- awkward filled 1 of 6. Its detail searches returned a Pexels 500.
- The other four filled 6 of 6.

**Source pictures.** Transparent WebP files from 669×625 to 1047×1017 (imgmeta.cjs). The stored candidates are landscape photographs (lib/images/pexels.ts:23).

#### 7. Tone and description words

None names a kind of business (meta.ts:7,10). "editorial" names a page style, so I propose no change.

#### 8. Defects (wrong for every business)

- **t04-D1. Two "How it works" items in the header.**
  - The third link goes to #tools (contract.ts:33,125-126). The outline button goes to #how-it-works (contract.ts:130,211).
  - 7 of 8 answers labelled both "How it works", and atl-gas.html confirms it.
- **t04-D2. Every ask leads to #start, the pitch section.**
  - This is set at contract.ts:212,218,230,238,244,264. The pitch's own button points at itself.
  - The page has no form and no contact line, so "Book a visit" appears five times on l6 a1-gas and none of them lets anyone book.
- **t04-D3. The poster picture is missing on phones.** Below 640 px the page never shows the picture the poster showed (hero.tsx:58; lib/preview/status.ts:46-49).
- **t04-D4. Heading levels.** An h4 sits under an h2 (tools.tsx:42), and the footer note is an h5 (footer.tsx:68).
- **t04-D5. Description.** meta.ts:7 leaves out the offer and the band, and puts the steps before the checklist (index.tsx:55-59).

#### 9. "Suits" candidates (proposals for the owner, not labels)

- **Businesses with a few named offerings and separate reasons to choose them.** a1-gas, it-support and awkward filled the card and offer with their own items. With only three reasons, though, those reasons repeat.
- **Businesses with work or places to photograph.** Six pictures lead the page. Stored judge scores (picks.cjs):
  - photographer and the house-and-garden fixture: 7 to 8;
  - gas engineer: 6 to 9;
  - IT support detail slots: 6.

  These are model verdicts against generic purposes, so the evidence is weak.

#### 10. Provenance

- **Source.** Rafli Surya Pratama's Nefa (MIT), recorded in docs/adr/0023-three-templates-ported-from-open-source-layouts.md:15.
- **Its business.** A crypto exchange: "Buy & trade on the original crypto exchange." (example/content.ts:198), "Advanced Trading Tools" (:235) and a credit card offer (:224).
- **What it explains:**
  - L1 and L2: `tools` and `offer`.
  - L3: the market tables' "More" links.
  - S3: the box, which stood in for the exchange rows (pitch.tsx:9-12).
  - L9 and S9: the ornaments and cut-out pictures.

### t05-ember (Ember)

Paths with no folder are under `templates/t05-ember/`, and section files are under its `sections/`. SCR is the folder `test-results/template-fit/fit57/`. It holds every script and output cited here. I made no renders, so nothing here has been checked on a page.

#### 1. Design

- **Order** (index.tsx:47-60):
  - a header that turns to glass after 10 px (nav.tsx:14,51)
  - the hero
  - About
  - three numbered points (stats.tsx:19)
  - a grid of items with pictures
  - three icon rows beside a tall picture
  - three steps with bracketed numbers (booking.tsx:60-62)
  - a photograph block holding a card
  - questions
  - a closing band in the brand colour
  - the footer under a faint 300 px watermark of the name (footer.tsx:103-110)
- **Led by photographs.** The poster label is "Photo-led" (lib/preview/descriptors.ts:21). The hero is a full-screen photograph with centred words set straight on it (hero.tsx:14-36).
- **Type.** The display face is used for the headline, the closing heading, the wordmark and the watermark (hero.tsx:25, cta.tsx:44, logo.tsx:22, footer.tsx:107). A coloured eyebrow in capitals sits over every heading (styles.ts:28).
- **Density.** Low: 176 px between sections (mt-44, for example about.tsx:15).
- **Colour.** The brand colour fills the buttons, the eyebrows and the closing band (styles.ts:21-22, cta.tsx:25). Whether the page is light or dark comes from the look and the logo (lib/tokens/scheme.ts:8-11).
- **Motion** (ember.css:108-161, reveal.tsx:10-26), all off under reduced motion:
  - the hero rises on load;
  - each block below rises once, when first seen;
  - a grid picture turns half a turn each time the pointer enters it.
- **Never shown on a visitor's page:** the rating row, the place card, the quote beside the steps, the hours rows, testimonials, social links and the phone number (contract.ts:206,208,227,233,237,246,251).

#### 2. Range

Sources: SCR range.cjs and range.txt; quotes from SCR ember-l6l7.txt (made by dump.cjs).

| Fixture        | Kind (notes)                 | Sentence chars | baseline | l0-skeleton               | l6-all-fixes | l7-sentence |
| -------------- | ---------------------------- | -------------- | -------- | ------------------------- | ------------ | ----------- |
| cleaning       | services (fixtures.json:199) | 165            | model    | fallback (credit refusal) | model        | not run     |
| hr             | consultancy (:163)           | 193            | model    | model                     | model        | not run     |
| joinery        | trades (:7)                  | 250            | model    | model                     | model        | model       |
| longest        | consultancy (:67)            | 400            | model    | model                     | model        | model       |
| physio-longest | clinic (:139)                | 125            | model    | model                     | model        | not run     |
| shortest       | services (:55)               | 37             | model    | model                     | model        | model       |
| tutors         | services (:235)              | 156            | model    | fallback (credit refusal) | model        | not run     |

That is 24 pairs: 22 with model copy and 2 with fallback copy. test-results/eval/real-run holds three screenshots and no copy record, so it adds no pairs.

**Marks used below.** [P] means padding: an item the sentence did not name as an offering. That is my reading against each sentence; the owner may read it differently. [R] means the item repeats another section.

**S1, the grid of items** (l6 and l7):

| Run, fixture      | Items (note)                                                                                                       | [P] |
| ----------------- | ------------------------------------------------------------------------------------------------------------------ | --- |
| l6 cleaning       | Domestic Cleaning (For regular homes); End-Of-Tenancy Cleaning; Agreed Checklists [P]; Regular Visits [P]          | 2   |
| l6 hr             | Contracts (Fit for your firm); Handbooks; Difficult conversations; TUPE guidance                                   | 0   |
| l6 joinery        | Fitted Wardrobes (Made for your space); Alcove Units; Kitchens; Bespoke Joinery [P]                                | 1   |
| l7 joinery        | Fitted wardrobes; Alcove units; Kitchens; Bespoke joinery [P]                                                      | 1   |
| l6 longest        | Initial conversation [P][R steps]; Plain business review [R steps]; Valuation support; Ongoing support [R steps]   | 1   |
| l7 longest        | Plain review (How it runs); Valuation (What it's worth); Paperwork; Finding a buyer                                | 0   |
| l6 physio-longest | Sports Massage (For tight muscles); Gait Analysis; Injury Rehab; Saturday Drop-in (No long wait)                   | 0   |
| l6 shortest       | Dog grooming; Dog walking; Local visits [P]; Ongoing care [P][R steps]                                             | 2   |
| l7 shortest       | Dog grooming; Dog walking; Grooming visits [P]; Walking visits [P]                                                 | 2   |
| l6 tutors         | Small group tutoring (Up to four students); One to one tutoring; GCSE maths and science; A level maths and science | 0   |

**S2, six reasons.** The numbered points' titles, then the icon rows' titles. The verdict in each row is my reading.

| Run, fixture      | Points → rows                                                                                                                                  | Verdict                                      |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| l6 cleaning       | One Trusted Cleaner, Insured And DBS-Checked, Agreed In Advance → The Same Cleaner, Checked And Insured, Clear Checklists                      | all three restated                           |
| l6 hr             | Contracts and handbooks, Difficult conversations, TUPE guidance → Retainer or day rate, Alongside your firm, Across the north west             | six distinct                                 |
| l6 joinery        | Made by hand, Just the two of us, Full attention, every job → Hand made, not mass produced; One small team throughout; Only a few jobs a month | all three restated                           |
| l7 joinery        | the same points → Measured and drawn by us; Fitted by the two of us; Only a few jobs a month                                                   | two restated                                 |
| l6 longest        | Plain review first, Alongside you throughout, Support after the deal → Honest first look, There throughout, Care after handover                | all three restated; two bodies word for word |
| l7 longest        | the same points → Small and hands-on, Known to accountants, There for the whole journey                                                        | one restated                                 |
| l6 physio-longest | Sports Massage, Gait Analysis, Injury Rehab → Calm, focused care; Support for your sport; Easy to book                                         | distinct; the points repeat the grid [R]     |
| l6 shortest       | Grooming, Walking, Local to you → Gentle approach, Regular routine, Right in Chorlton                                                          | all three restated                           |
| l7 shortest       | Gentle grooming, Regular walks, Local care → Local to Chorlton, Gentle approach, Happy, healthy dogs                                           | all three restated                           |
| l6 tutors         | Small group sizes, One to one option, Same tutor weekly → In person or online, Proper attention each week, Consistent, steady progress         | two restated                                 |

**S3, the steps.**

- The first step is "Get in touch" in 8 of 10 answers.
- The heading is the guide's own "Three simple steps" in 7 of 10.
- Examples:
  - joinery l6: "Get in touch / Measure and draw / Make and fit"
  - physio-longest l6: "Get In Touch / Book Your Visit / Start Your Recovery"

**S4, the card on the photograph.**

- Card titles: Ready When You Are (cleaning), Where to find us (hr l6, joinery l7), Get in touch (joinery l6), Based in Durham (longest, twice), Ready when you are (physio-longest), Based in Chorlton (shortest, twice), In Ilkley or online (tutors).
- The nav label that leads to this card: Areas (3), Area, Find Us, Chorlton (2), Ilkley, Durham, Contact.

**S7, the questions.** There were 4 for the 37-character sentence and 5 for every other.

**Guide examples copied word for word.** Counts are over all 22 model answers, with l6 and l7 together in brackets (SCR guide-copies.cjs):

| Example                      | All 22 | l6 and l7 |
| ---------------------------- | ------ | --------- |
| "How it works"               | 22     | 10/10     |
| "FAQs"                       | 22     | 10/10     |
| "Frequently asked questions" | 22     | 10/10     |
| "Get in touch"               | 22     | 10/10     |
| "What sets us apart"         | 17     | 7/10      |
| "Three simple steps"         | 16     | 7/10      |
| "Made with care"             | 8      | 4/10      |
| "What we make"               | 4      | 2/10      |
| "Where to find us"           | 3      | 2/10      |
| "Where flavour meets care"   | 0      | 0/10      |

Words from the source's industry appear in the visible copy of 0 of 22 answers.

#### 3. Leftovers [R]

| Id      | Element                                                                                                                                                        | Where                                                                        | Visitor sees                              | Channel                                     | Proposed neutral fix                                                                 | Changes what the copy model sees? | Stored repeats                                                                                                                                | Reads wrong for (proposal)                                                                                                          |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| t05-L1  | Chef's hat, leaf and heart icons, by row                                                                                                                       | features.tsx:1,9,30,38                                                       | A mark beside each of the three rows      | page (aria-hidden)                          | One neutral mark for every row, or the row number                                    | no                                | Drawn on all 24 pages (three rows fixed, contract.ts:93)                                                                                      | Hat: any business that does not cook (all 7 stored). Leaf and heart: not verified                                                   |
| t05-L2  | Laurel marks either side of About's eyebrow                                                                                                                    | about.tsx:33-35; ornament.tsx:2-3,10-20                                      | Two small sprigs                          | page (aria-hidden)                          | Keep, or a short rule                                                                | no                                | 24/24                                                                                                                                         | None shown                                                                                                                          |
| t05-L3  | Anchor ids #dishes, #timing and #booking-process                                                                                                               | dishes.tsx:14; timing.tsx:15; booking.tsx:15; links set at contract.ts:34-44 | The word in the address bar after a click | URL                                         | Neutral ids such as #offers, #reach and #steps; change the link addresses only       | no                                | All 24 pages: the nav links #dishes and #timing; every button goes to #booking-process (contract.ts:198,204,235,242)                          | dishes: any business without food. booking-process: any without bookings. timing: any without opening times                         |
| t05-L4  | Schema and slot keys `dishes.*`, `booking.*` and `timing.*`, and the link target names                                                                         | contract.ts:60-66,77,138-153,163-164                                         | Nothing                                   | copy model only                             | Neutral keys (offers, steps, card), or the old names mapped to them                  | yes (needs an eval)               | Footer targets written: dishes 22/22, booking-process 22/22, timing 8/22 (SCR anchors.txt). Food words in visible copy: 0/22                  | None in the copy; it feeds t05-L3                                                                                                   |
| t05-L5  | Guide example "Where flavour meets care"                                                                                                                       | contract.ts:129                                                              | Nothing                                   | copy model                                  | An example with no trade word                                                        | yes                               | 0/22                                                                                                                                          | None shown                                                                                                                          |
| t05-L6  | Place wording: the nav guide's "where to find them", the card guide's "such as Where to find us", and the fallback nav label "Find us"                         | contract.ts:126,151,305                                                      | A place label in the nav and on the card  | copy model; page when fallback copy is used | Nav guide "how to reach them"; card example "Ready when you are"; fallback "Contact" | yes                               | The nav label to the card was a place in 9/10 (l6, l7). Card title "Where to find us" in 3/22 and a place in 13/22. Fallback "Find us" in 2/2 | Businesses customers do not visit. hr l6: "Where to find us" over "We work with growing firms across Manchester and the north west" |
| t05-L7  | Guide example "Made with care"                                                                                                                                 | contract.ts:133                                                              | About's eyebrow                           | copy model, then page                       | An example that names no making, such as "Who we are"                                | yes                               | 8/22: joinery 4, shortest 3, cleaning 1                                                                                                       | Businesses that make nothing: copied 3 times for the dog groomer and walker and once for the cleaner                                |
| t05-L8  | Guide example "What we make"                                                                                                                                   | contract.ts:138                                                              | The grid's eyebrow                        | copy model, then page                       | "What we offer" (the model's own choice in 15/22)                                    | yes                               | 4/22, all joinery                                                                                                                             | None shown                                                                                                                          |
| t05-L9  | "never a price"                                                                                                                                                | contract.ts:142                                                              | Nothing                                   | copy model                                  | Keep: it repeats the copy rule (lib/ai/prompts.ts:15)                                | no change                         | 0 prices written                                                                                                                              | None                                                                                                                                |
| t05-L10 | Fixed words and labels: "All rights reserved.", "Photos by … on Pexels", and the screen-reader labels "Menu", "Close menu", "Main", "Mobile" and "{name} home" | footer.tsx:87,89-99; nav.tsx:54,57,74,86,104                                 | The footer line; spoken labels            | page; screen reader                         | Keep                                                                                 | no                                | 24/24                                                                                                                                         | None                                                                                                                                |
| t05-L11 | Footer watermark of the name                                                                                                                                   | footer.tsx:103-110                                                           | The name, huge and faint                  | page (aria-hidden)                          | Keep (it is the visitor's name)                                                      | no                                | 24/24                                                                                                                                         | None                                                                                                                                |
| t05-L12 | Tone word "hospitable"                                                                                                                                         | meta.ts:10                                                                   | Nothing                                   | metadata (used only in the variety pass)    | See part 7                                                                           | no                                | Not applicable                                                                                                                                | Not applicable                                                                                                                      |

Ember has no form, so it has no form field names, ids or placeholders. The ids #stats and #features name no trade, and #stats is never a link target (contract.ts:24-33).

#### 4. Structures [S]

| Id     | Content it needs                                                                                              | Where                                                                    | Stored fills                                                                                                             | Limit the evidence shows                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| t05-S1 | Four to eight distinct offerings, each with a note of 20 characters or fewer and its own small square picture | contract.ts:140-142,213-216; copy-slots.ts:123-124,163; dishes.tsx:23-46 | 4 items in 10/10, never 8. 9 of 40 items [P] (part 2)                                                                    | **Words:** sentence-level. Sentences that named 2 offerings (cleaning, shortest) or 3 (joinery) were padded. **Pictures:** offerings that are advice got document and handshake pictures: hr dish-2 "a person signing a divorce decree", and the same subject in all four longest items (SCR picks-ember-l6.txt). Per-item slots take pool pictures with one shared purpose, whatever the item (lib/images/plan.ts:41-45), so this cannot yet be separated from the pipeline. No clash proposed |
| t05-S2 | Six distinct reasons: three points, then three rows "different from the three titles above"                   | contract.ts:92-93,136-137,145-146                                        | All three restated in 5/10, two in 2/10 (my reading)                                                                     | Universal: every brief carries three value props (lib/ai/prompts.ts:33)                                                                                                                                                                                                                                                                                                                                                                                                                         |
| t05-S3 | Three steps, the target of every button                                                                       | contract.ts:94; booking.tsx:52-69                                        | 10/10 filled                                                                                                             | Universal; the dead end is a defect (t05-D2)                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| t05-S4 | A card on a 650 px photograph: a short title, one or two sentences and a button                               | timing.tsx:16-53; contract.ts:151-153                                    | Quoted in part 2                                                                                                         | None beyond the place wording, which is t05-L6                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| t05-S5 | A full-screen photograph behind the hero words, with no scrim                                                 | hero.tsx:14-36                                                           | l6 hero empty in 3/7 (hr, joinery, longest). The hr hero searches errored (l6-all-fixes/hr.json imagery.pools[0].errors) | Legibility not verified; no render                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| t05-S6 | About eight photographs for four items; the closing band's corners reuse items 1 to 4                         | contract.ts:397-410; index.tsx:58; cta.tsx:28-39                         | See part 6                                                                                                               | Few own photographs leave most slots empty (part 6; decision 5)                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| t05-S7 | Three to six questions                                                                                        | copy-slots.ts:166; faq.tsx                                               | 4 or 5                                                                                                                   | None                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

#### 5. Content demand

| Demand                                         | Count                                                              | Where                              |
| ---------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------- |
| Distinct offerings                             | 4 to 8 (the guide says "four or eight")                            | copy-slots.ts:163; contract.ts:140 |
| Reasons                                        | 3 points, then 3 different rows                                    | contract.ts:92-93,145              |
| Steps                                          | 3                                                                  | contract.ts:94                     |
| Questions                                      | 3 to 6                                                             | copy-slots.ts:166                  |
| Long paragraphs (up to 150 characters or more) | Hero subhead 60-160; About 60-170; card 40-180; each answer 40-200 | copy-slots.ts:111,116,138,148      |
| Bodies of 50 to 120 characters                 | 9 (points, rows and steps)                                         | copy-slots.ts:120,128,134          |

How the stored answers filled it (l6 and l7, 10 answers):

- **Fallback:** 0/10. Across all runs it was 2/24, both credit refusals in l0. No answer fell back because its copy failed (SCR range.txt).
- **Calls:** 18 model calls for 10 answers. The causes (SCR calls.txt):
  - 6/10 answers broke the 20-character note limit (5 on the first call; l6 physio-longest on its second, after a first call that did not parse);
  - one answer did not parse;
  - "best" appeared in hr l6 and tutors l6;
  - "Trusted by" appeared in longest l7.
- **Items beyond the brief's three:** the grid always took four. 9 of 40 items were padding.
- **Repetition** (SCR repeat.cjs, repeat.txt):
  - 9/10 answers have a near-identical sentence in two sections (content-word overlap 0.6 or more);
  - 5/10 have a sentence that is identical in two sections;
  - only tutors had none;
  - the answers to questions restate the points or steps in 8/10.
- **About wrote founding motives the sentence never gave.** The eyebrow "Why we started" appears in 6/22, with bodies such as "We set up Northgate People to give…" (hr l6) and "We started Hillside Tutors to…" (tutors l6). This is universal: About asks for a story that a sentence may not hold.
- **Shortest (37 characters):**
  - model copy, with one call, in both l6 and l7;
  - 2 of the 4 grid items were padding each time;
  - 7 and 5 repeated pairs;
  - l7 answered "Will the same person look after my dog?" without giving an answer.
- **Longest (400 characters):**
  - two calls in each run;
  - the l6 grid borrowed the steps, while the l7 grid took four offerings from the sentence;
  - 7 and 6 repeated pairs.

#### 6. Slots

All of this is read from the code, except the two empty states marked "measured". Sizes marked "computed" are arithmetic on the classes; another agent measures the rendered sizes.

| Slot                      | Role and shape                                                                                                                                                                                            | Text over it                                                                                                                             | Shape implies people?                                 | Empty state                                                                                                                           | Renders                                                                        |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| hero (slot 0, the poster) | Full-screen backdrop behind centred words; screen-shaped, cover (hero.tsx:14-19)                                                                                                                          | Eyebrow, headline, subhead and button, with no scrim (hero.tsx:21-36). No contrast pair covers text on a picture (copy-slots.ts:176-183) | no                                                    | The plain page colour (hero.tsx:15)                                                                                                   | always                                                                         |
| about                     | Rounded picture beside About, at most 548 px wide; its height follows the row (about.tsx:21-27)                                                                                                           | none                                                                                                                                     | no                                                    | A muted block, 342x269 at 390; from 768 px it collapses to 0 px wide, so nothing shows (about.tsx:19; measured, slotgeo-visitor.json) | always                                                                         |
| features                  | Tall rounded picture beside the rows, 444 px tall and at most 384 px wide (computed 384×444 from md, 342×444 at 390) (features.tsx:51-57)                                                                 | none                                                                                                                                     | no. The code calls it a portrait (features.tsx:12)    | A muted block that collapses to 0 px wide at every width, so nothing shows (features.tsx:49; measured, slotgeo-visitor.json)          | always                                                                         |
| timing                    | Wide backdrop behind a solid card, 650 px tall and at most 1024 px wide (computed 1024×650 at 1440; at 390, 342×650, mostly covered by a 294 px card) (timing.tsx:16-21)                                  | The card sits on it; no text is set on the photograph                                                                                    | no                                                    | A muted block (timing.tsx:18)                                                                                                         | always                                                                         |
| dish-1 to dish-8          | Small square, one per offering: 120 px, 140 px from md (dishes.tsx:32-38). dish-1 to dish-4 appear again as 80, 112 and 140 px circles at the closing band's corners, with empty alt text (cta.tsx:28-39) | None (the name and note sit below)                                                                                                       | Circles of face size; the content is the item picture | A round muted disc (dishes.tsx:30); the corner is left out (cta.tsx:29)                                                               | Only up to the number of items (contract.ts:213-216): 4 in every stored answer |

Own photographs fill the slots in order, and every later slot stays empty (lib/images/plan.ts:26-30). Counting only slots that render:

| Items         | Slots that render | Empty with 1 photo | With 3 | With 6 |
| ------------- | ----------------- | ------------------ | ------ | ------ |
| 4 (as stored) | 8                 | 7                  | 5      | 2      |
| 8             | 12                | 11                 | 9      | 6      |

The corner circles follow dish-1 to dish-4.

#### 7. Tone and description words

- **Tone word "hospitable"** (meta.ts:10) names a sector. Proposed word for the feel: "welcoming".
- **Description** (meta.ts:7): it names no kind of business. It does describe "a card of rows" and "a portrait", and the rows never show on a visitor's page (contract.ts:233).

#### 8. Defects that are wrong for every business

- **t05-D1.** Each pointer entry turns a grid picture half a turn, and it stays turned. After an odd number of entries the photograph is upside down (dish.tsx:12-24; ember.css:156-161; docs/template-analysis.md:306). This happens only with a pointer and with motion allowed.
- **t05-D2.** Every button leads to the steps, which hold no form, link or button (contract.ts:198,204,235,242; booking.tsx:52-69; docs/template-analysis.md:290). The only contact on the page is the footer's email link (footer.tsx:56-65).
- **t05-D3.** A missing grid picture is drawn as a round disc, but a present one is a square (dishes.tsx:29-39). A part-filled grid therefore mixes the two shapes.
- **t05-D4.** The hero words sit on the photograph with no scrim and no contrast check (hero.tsx:17-36; copy-slots.ts:176-183). Not verified on a render.
- **t05-D5.** Nav targets are fixed by position (contract.ts:44,194-197). In l6 longest, the label "Contact" opened the card on the photograph.
- **t05-D6.** The meta description describes parts a visitor's page never shows (part 7).

#### 9. "Suits" candidates (proposals for the owner, not labels)

- **Proposal: businesses that name four or more offerings that can be photographed.** The evidence is all from stored copy and judge scores; there are no renders with leftovers fixed, and only the owner can label "suits".
  - The grid filled with no padding for physio-longest, tutors, hr and l7 longest.
  - Every slot that renders took a picture the judge scored 7 to 9 for cleaning, physio-longest, shortest and tutors, and for joinery apart from its empty hero (SCR picks-ember-l6.txt).
  - So the candidates are makers and hands-on services with several offerings: fitted furniture, cleaning, treatments, tutoring and pet care.
- **In doubt: businesses whose offerings are advice.** The words filled honestly for hr and longest, but the item pictures were documents and handshakes. Label these only after per-item pictures follow their own items (decision 7).

#### 10. Provenance

- **Source:** PrebuiltUI's Restro, a restaurant template (THIRD_PARTY_NOTICES.md:35; ADR 0027:9; copy-slots.ts:6-13).
- **What it explains:**
  - the hat, leaf and heart icons;
  - the names dishes, timing and booking-process;
  - "flavour" and "never a price" (the source's dishes had dollar prices, example/content.ts:38-47);
  - the hours rows on the card (example/content.ts:150-160);
  - the turning picture, which suited the source's round plate cut-outs (docs/template-analysis.md:306).

---

### t06-harbor (Harbor)

Paths with no folder are under `templates/t06-harbor/`, and section files are under its `sections/`. SCR is the same `scratchpad\fit57\` folder.

#### 1. Design

- **Order** (index.tsx:43-57):
  - a fixed bar that drops in and turns to glass after 40 px (nav.tsx:14,77)
  - a full-screen hero (hero.tsx), made of:
    - a photograph at 40% under a fade from the page colour, coming from the left;
    - a pill;
    - three heavy capital lines that rise out of clipped rows, the middle one in the accent;
    - a paragraph and two round buttons;
    - three large phrases over a hairline;
    - a "Scroll" hint.
  - About: a tall rounded picture beside a capitals heading, paragraphs and pills
  - a hairline grid of 3 to 6 cards, with the third always lit (services.tsx:35-47)
  - a quieter band with one huge faint word behind a grid of large phrases (metrics.tsx)
  - questions beside a message form
  - a closing band over a faint photograph
  - a footer with an email field, under the name as a watermark
- **Led by type.** The poster label is "Type-led" (lib/preview/descriptors.ts:22). Every heading is heavy capitals in the display face (styles.ts:27), with one lit phrase (lines.tsx:9-28). Two of the three pictures are dimmed (hero.tsx:29, cta.tsx:22).
- **Density.** High: 120 px of padding on each section (styles.ts:20), and hairline grids.
- **Colour.** One accent, used on the eyebrows, the lit phrases, the middle headline line, the buttons, the third card and the large phrases. Whether the page is light or dark comes from the look and the logo (lib/tokens/scheme.ts:8-11).
- **Motion.** The hero arrives on a timer. Each block plays one entrance when it comes into view. All of it is off under reduced motion (harbor.css:137-178; reveal.tsx).
- **Never shown on a visitor's page:** About's badge and quotes, the gallery, plans, testimonials, partners, articles and social links (contract.ts:236-242,257,267).

#### 2. Range

Sources: SCR range.txt and calls.txt; quotes from SCR harbor-l6l7.txt.

| Fixture      | Kind (notes)              | Sentence chars | baseline                   | l0-skeleton                              | l6-all-fixes | l7-sentence |
| ------------ | ------------------------- | -------------- | -------------------------- | ---------------------------------------- | ------------ | ----------- |
| a1-gas       | trades (fixtures.json:19) | 150            | fallback (grammar refusal) | model                                    | model        | model       |
| gardens      | trades and design (:211)  | 140            | fallback (grammar refusal) | fallback (credit refusal)                | model        | not run     |
| hr           | consultancy (:163)        | 193            | fallback (grammar refusal) | fallback (credit refusal, after 3 calls) | model        | not run     |
| photographer | creative (:187)           | 131            | fallback (grammar refusal) | fallback (credit refusal)                | model        | not run     |
| shortest     | services (:55)            | 37             | fallback (grammar refusal) | model                                    | model        | model       |

That is 17 pairs: 9 with model copy and 8 with fallback copy.

Marks are as for Ember. [I] means a quality the sentence never stated.

**S1, the hero lines and phrases:**

| Run, fixture    | Lines                                | Phrases (label)                                                                                      |
| --------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| l6 a1-gas       | BOILER / REPAIRS / NEAR YOU          | Gas Safe (registered engineers); Same week (appointments available); No call-out (charge for quotes) |
| l7 a1-gas       | BOILER / REPAIRS / AND MORE          | The same three                                                                                       |
| l6 gardens      | THOUGHTFUL / GARDENS / FOR YOUR HOME | Design; Planting; Maintenance                                                                        |
| l6 hr           | HR SUPPORT / ON YOUR / TERMS         | Contracts; Hard talks; TUPE                                                                          |
| l6 photographer | YOUR DAY / CAPTURED / NATURALLY      | Documentary; Weddings; UK printed                                                                    |
| l6 shortest     | CARING FOR / YOUR DOG / IN CHORLTON  | Gentle care (grooming done with patience) [I]; Regular walk; Local to you                            |
| l7 shortest     | The same lines                       | Grooming (gentle and careful); Walking (regular and reliable) [I]; Local                             |

**S2, the cards** (tag: title):

| Run, fixture       | Cards                                                                                                                        |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| l6 a1-gas          | Repairs: Boiler repairs; Servicing: Boiler servicing; Installs: New installs. l7 adds Quotes: Free quotes, from the sentence |
| l6 gardens         | Design: Garden Design; Planting: Planting Plans; Structure: Paths and Patios                                                 |
| l6 hr              | Contracts: Contracts and handbooks; People: Difficult conversations; Transfers: TUPE guidance                                |
| l6 photographer    | Style: Documentary style; Coverage: Weddings and family; Albums: UK printed albums                                           |
| l6 and l7 shortest | Grooming: Gentle grooming; Walking: Regular walks; Local: Local to you [P]. The padding item is the lit third card           |

**S3, the grid of phrases** (values; watermark):

| Run, fixture    | Values                                             | Watermark |
| --------------- | -------------------------------------------------- | --------- |
| l6 a1-gas       | Gas Safe; Same week; No charge [R hero]            | TRUST     |
| l7 a1-gas       | The same [R hero]                                  | TRUSTED   |
| l6 gardens      | Design; Planting; Structure; Maintenance [R cards] | CARE      |
| l6 hr           | Get in touch; We look; Ongoing (the brief's steps) | SUPPORT   |
| l6 photographer | Relaxed; Quiet; Printed                            | NATURAL   |
| l6 shortest     | Gentle; Regular; Local [R]                         | CHORLTON  |
| l7 shortest     | The same [R]                                       | CARE      |

**S4, the form.** Each business got its own hint in the message field:

- "Tell us about your boiler problem"
- "Tell us about your garden..."
- "What do you need help with?"
- "Tell us your date and what you have in mind"
- "Tell us about your dog and what you need"

There were 4 or 5 questions each.

**S5, the footer field.** "Hear from us" and "your@email.com" in 9 of 9 answers.

**S6, About:**

- The pills repeat the card titles word for word in 5/7.
- The paragraphs gave motives the sentences never did:
  - a1-gas: "because we want local homes to have reliable, properly qualified…";
  - hr: "We set up Northgate People to give…";
  - shortest: "because we care about their comfort and happiness".

**Guide examples copied word for word,** over all 9 model answers (SCR guide-copies.cjs):

| Example                     | Copied |
| --------------------------- | ------ |
| "Who we are"                | 9/9    |
| "What we do"                | 9/9    |
| "Find out more"             | 9/9    |
| "Get in touch"              | 9/9    |
| "Send message"              | 9/9    |
| "Hear from us"              | 9/9    |
| "your@email.com"            | 9/9    |
| "Privacy · Terms"           | 9/9    |
| "What matters"              | 8/9    |
| "FAQ"                       | 8/9    |
| "Our ethos"                 | 1/9    |
| "Made for people who train" | 0/9    |
| "Open late"                 | 0/9    |
| "every weekday"             | 0/9    |
| "PROOF"                     | 0/9    |

"Same week" appears 3/9, all for a1-gas, whose own sentence says "same-week appointments". Words from the source's industry appear in the visible copy of 0 of 9 answers, apart from "figures" (t06-L7).

#### 3. Leftovers [R]

| Id      | Element                                                                                                                                         | Where                                            | Visitor sees                                      | Channel                          | Proposed neutral fix                                | Changes what the copy model sees? | Stored repeats                                                                              | Reads wrong for (proposal)                                                           |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------- | -------------------------------- | --------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| t06-L1  | Six icons by card position: dumbbell, bolt, brain, heart, timer, trophy                                                                         | services.tsx:1,9,38,56-60                        | An icon in a square on each card                  | page (aria-hidden)               | One neutral mark for every card, or the card number | no                                | Dumbbell, bolt and brain on all 17 pages; heart on the 2 four-card pages (a1-gas l0 and l7) | Dumbbell: any business that is not exercise (all 5 stored). The others: not verified |
| t06-L2  | Bolt in the hero pill                                                                                                                           | hero.tsx:1,40                                    | A small bolt before the badge words               | page (aria-hidden)               | A plain dot, or nothing                             | no                                | 17/17                                                                                       | Not verified                                                                         |
| t06-L3  | The word "Scroll" with a line                                                                                                                   | hero.tsx:117-126                                 | "SCROLL" set vertically, bottom right             | page; screen reader (not hidden) | Keep, or hide it from screen readers                | no                                | 17/17                                                                                       | None                                                                                 |
| t06-L4  | Placeholders "John Doe" and "john@example.com"                                                                                                  | contact.tsx:93,106                               | Grey hints in the name and email fields           | page; screen reader              | "Your name" and "your@email.com"                    | no                                | 17/17                                                                                       | None by trade; the same named person appears on every page                           |
| t06-L5  | Field ids harbor-name, harbor-email and harbor-message; field names name, email and message; the footer field's name, email                     | contact.tsx:85-122; footer.tsx:60-62             | Nothing                                           | form data                        | Keep (no trade word)                                | no                                | Not applicable                                                                              | None                                                                                 |
| t06-L6  | Anchor id #metrics                                                                                                                              | metrics.tsx:16; contract.ts:23-31                | "#metrics" in the address bar after a footer link | URL                              | A neutral id such as #highlights                    | no (link address only)            | Footer links to it in 8/8 fallback answers and 3/9 model answers (SCR anchors.txt)          | None by trade; it names figures the band never shows                                 |
| t06-L7  | Keys and guide words for figures: `hero.stats[]`, `metrics.*`, "the grid of figures", "over the grid" and the target "metrics"                  | contract.ts:141-143,157-164,190                  | Nothing, unless copied                            | copy model                       | Neutral keys and "the grid of short phrases"        | yes (needs an eval)               | "Our figures" became a footer link label in l6 a1-gas (1/9)                                 | Every business: the band holds no figures                                            |
| t06-L8  | Guide example "Made for people who train"                                                                                                       | contract.ts:136                                  | Nothing                                           | copy model                       | An example with no trade, such as "who it is for"   | yes                               | 0/9                                                                                         | None shown                                                                           |
| t06-L9  | Guide examples "Open late" and "every weekday"                                                                                                  | contract.ts:142-143                              | Nothing                                           | copy model                       | Examples that presume no opening hours              | yes                               | 0/9                                                                                         | None shown                                                                           |
| t06-L10 | Guide example "PROOF"                                                                                                                           | contract.ts:160                                  | Nothing                                           | copy model                       | A neutral example                                   | yes                               | 0/9                                                                                         | None shown                                                                           |
| t06-L11 | Neutral guide examples copied word for word: "Who we are", "What we do", "Find out more", "What matters", "FAQ", "Get in touch", "Send message" | contract.ts:140,149,156,157,165,170,178          | The same words on every page                      | copy model, then page            | Keep, or vary                                       | yes                               | 9, 9, 9, 8, 8, 9 and 9 of 9                                                                 | None                                                                                 |
| t06-L12 | Guide examples "Hear from us" and "your@email.com"                                                                                              | contract.ts:186-187                              | The footer field's label and hint                 | copy model, then page            | See t06-S5                                          | yes                               | 9/9 each                                                                                    | Any business that sends no news by email. No stored sentence mentions news           |
| t06-L13 | Guide example "Privacy · Terms", also in the fallback copy                                                                                      | contract.ts:192,437; footer.tsx:135              | Small print naming two pages                      | copy model, then page            | Leave empty                                         | yes                               | 9/9 model; 8/8 fallback                                                                     | Every business without those pages (t06-D3)                                          |
| t06-L14 | Fixed words and labels: "All rights reserved.", "Photos by … on Pexels", and the labels "Open menu", "Close menu", "Main" and "{name} home"     | footer.tsx:39,101,118-134; nav.tsx:76,85,115,134 | The footer line; spoken labels                    | page; screen reader              | Keep                                                | no                                | 17/17                                                                                       | None                                                                                 |
| t06-L15 | Footer watermark of the name                                                                                                                    | footer.tsx:25-32                                 | The name, huge and faint                          | page (aria-hidden)               | Keep                                                | no                                | 17/17                                                                                       | None                                                                                 |
| t06-L16 | Tone word "athletic"                                                                                                                            | meta.ts:10                                       | Nothing                                           | metadata                         | See part 7                                          | no                                | Not applicable                                                                              | Not applicable                                                                       |

#### 4. Structures [S]

| Id     | Content it needs                                                                                                                                         | Where                                                                     | Stored fills                                                                          | Limit the evidence shows                                                                                                                               |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| t06-S1 | Exactly three capital lines of 3 to 20 characters, the second lit, and three large phrases of 12 characters or fewer, with no numbers, each over a label | contract.ts:95-96,137,141-143; copy-slots.ts:174,178-179; hero.tsx:45-115 | Quoted in part 2                                                                      | Sentence-level. The 37-character sentence got qualities it never stated [I], and the 12-character cap was broken on three calls in a row (l6 shortest) |
| t06-S2 | Three or more named offerings, as 3 to 6 cards with a one-word tag, a title and a body; the third card is always lit                                     | copy-slots.ts:194-196,279; services.tsx:35-47                             | Honest for a1-gas, gardens and hr. The photographer's first card is a style           | Sentence-level. Two named offerings were padded with "Local to you", which then became the lit card                                                    |
| t06-S3 | A further 3 to 6 short phrases under one huge word                                                                                                       | contract.ts:157-164; copy-slots.ts:201-204,281; metrics.tsx               | Repeat the hero phrases or the cards in 5/7. hr used the brief's steps                | Universal. The brief has three points and three steps (lib/ai/prompts.ts:33-34), so this third set repeats for everyone                                |
| t06-S4 | Questions, and enquiries in writing: 3 to 6 questions beside a name, email and message form that opens a mail to the visitor's own address               | contact.tsx:37-130; copy-slots.ts:289; contract.ts:247                    | 4 or 5 questions; a hint written for each business                                    | None                                                                                                                                                   |
| t06-S5 | Something to send by email: a footer field whose label the copy model writes                                                                             | footer.tsx:46-75; contract.ts:186-187,260                                 | "Hear from us" 9/9                                                                    | Universal. The brief holds no fact about news, and no stored sentence offered any                                                                      |
| t06-S6 | A paragraph about the company and three to five pills, beside a tall picture                                                                             | about.tsx:15-93; copy-slots.ts:183-184,275-276                            | The pills repeat the cards in 5/7. Motives were written that the sentences never gave | Universal and sentence-level                                                                                                                           |
| t06-S7 | A closing heading and two or three sentences, over a faint photograph                                                                                    | cta.tsx:14-62                                                             | Filled 7/7                                                                            | None                                                                                                                                                   |

#### 5. Content demand

| Demand             | Count                                                                         | Where                                     |
| ------------------ | ----------------------------------------------------------------------------- | ----------------------------------------- |
| Distinct offerings | 3 to 5 pills; 3 to 6 cards                                                    | copy-slots.ts:276,279                     |
| Short points       | Exactly 3 in the hero; 3 to 6 in the grid; each 12 characters or fewer        | contract.ts:96; copy-slots.ts:178,202,281 |
| Steps              | None required. Fallback copy puts the steps in the grid (contract.ts:366-379) | Not applicable                            |
| Questions          | 3 to 6                                                                        | copy-slots.ts:289                         |
| Headline           | Exactly 3 lines of 3 to 20 characters                                         | contract.ts:95; copy-slots.ts:174         |
| Long paragraphs    | About: 1 or 2 of 60-260; closing body 60-220; each answer 40-220              | copy-slots.ts:183,236,249,275             |

How the stored answers filled it (l6 and l7, 7 answers):

- **Fallback:** 0/7. Across all runs it was 8/17: five grammar refusals in baseline and three credit refusals in l0. No answer fell back because its copy failed.
- **Calls:** 19 model calls for 7 answers. The causes (SCR calls.txt):
  - unparsed answers on 6 calls (gardens 4, hr 2);
  - phrases over 12 characters (gardens at 15 to 18; shortest at 13, three times);
  - a description over 30 characters (a1-gas);
  - "best" (hr).
- **Beyond three:**
  - pills: 4 in 6/7;
  - cards: 4 in 1/7, from the sentence;
  - grid: 4 in 1/7.
- **Repetition** (SCR repeat.txt):
  - all 7 answers repeat a sentence across sections, and 3/7 word for word;
  - the hero phrases come back in the grid in 5/7;
  - the pills equal the card titles in 5/7;
  - the nav's last link equals the button in 7/7.
- **Shortest (37 characters):**
  - l6 took 4 calls, l7 took 1;
  - the cards were padded with "Local to you";
  - the qualities in the phrases [I] were invented.
- **Longest that Harbor got (hr, 193 characters):**
  - 4 calls;
  - honest cards;
  - the grid became the brief's steps.

#### 6. Slots

All of this is read from the code. Sizes marked "computed" are arithmetic on the classes.

| Slot                      | Role and shape                                                                                                                                                                     | Text over it                                                                 | Shape implies people? | Empty state                                     | Renders |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------- | ----------------------------------------------- | ------- |
| hero (slot 0, the poster) | Full-screen backdrop, cover, at 40% under a fade from the page colour, coming from the left (hero.tsx:22-32)                                                                       | Badge, three lines, subhead, two buttons and three phrases (hero.tsx:34-115) | no                    | The page colour and the fade only (hero.tsx:23) | always  |
| about                     | Tall rounded picture, 600 px tall and 700 px from lg, cover, with a fade at its foot (about.tsx:28-40). Computed: 326×600 at 390, 640×600 at 768, 336×700 at 1024, 483×700 at 1440 | none (the badge is not shown, contract.ts:236)                               | no                    | An accent-tinted fill (about.tsx:29-30)         | always  |
| cta                       | Faint backdrop for the closing band, full width, cover, at 20% under a 70% wash (cta.tsx:15-26)                                                                                    | Eyebrow, heading, body and two buttons                                       | no                    | The wash only                                   | always  |

Own photographs (lib/images/plan.ts:26-30):

- 1 photo: 2 of 3 slots empty.
- 3 photos: 0 empty.
- 6 photos: 0 empty, and 3 photos unused.

#### 7. Tone and description words

- **Tone word "athletic"** (meta.ts:10) names a sector. Proposed words for the feel: "energetic" or "forceful".
- **Description** (meta.ts:7): it names no kind of business. It does describe nine parts a visitor never sees: the badge, six cards, a gallery, plans, testimonials, partners, articles and a four-column footer. It also says "near-black" when the surface actually follows the look and the logo.

#### 8. Defects that are wrong for every business

- **t06-D1.** "Find out more →" appears under a card on hover but is not a link (services.tsx:66-71). It never shows on a touch screen. The words appear in 9/9 answers.
- **t06-D2.** The nav's fifth link repeats the header button. The guide asks for "the closing ask" as the fifth label, and that link points at #cta (contract.ts:32,133-134). This happened in 9/9 model answers, so the desktop bar shows the same label twice ("Get in touch", or "Book a visit" for a1-gas).
- **t06-D3.** "Privacy · Terms" is plain text that names pages which do not exist (footer.tsx:135).
- **t06-D4.** When no email is known, both forms submit with GET to #cta. That puts the typed name, email and message in the URL (contact.tsx:75-81; footer.tsx:52-58).
  - The /dev/eval route always has no email (app/dev/eval/[run]/[fixture]/[templateId]/page.tsx:49).
  - A visitor's preview has no email only when the lead row is missing (app/preview/[slug]/[templateId]/page.tsx:70-72).
- **t06-D5.** Grid rows are left ragged (computed, not verified on a render):
  - 3 phrases on a phone's two columns, and 4 from md on three columns (metrics.tsx:38);
  - 3 cards between 768 and 1023 px (services.tsx:35).
- **t06-D6.** The meta description is wrong as described in part 7.

#### 9. "Suits" candidates (proposals for the owner, not labels)

- **Proposal: businesses whose sentence names three or more offerings and short points that can be set large.**
  - a1-gas filled the hero phrases straight from its sentence.
  - gardens, hr and photographer filled the cards with no padding.
  - The questions and form were honest in 7/7.
- **Proposal: businesses with little to photograph.**
  - Two of the three pictures are dimmed (hero.tsx:29, cta.tsx:22).
  - hr's page had an empty hero, and its empty state is the page colour (hero.tsx:23-32).
  - Not verified on a render.

#### 10. Provenance

- **Source:** PrebuiltUI's Forged, a gym template (THIRD_PARTY_NOTICES.md:45; ADR 0028:9; copy-slots.ts:6-13).
- **What it explains:**
  - the six icons and the bolt;
  - "Made for people who train", "Open late" and "every weekday";
  - the stats and metrics names, and "the grid of figures" (the source showed 12+ and 98% under the watermark "NUMBERS", example/content.ts:55-57,130);
  - the "John Doe" placeholders.

### t07-summit (Summit)

Paths that start with a file name, `sections/` or `example/` are under `templates/t07-summit/`. `THIRD_PARTY_NOTICES.md` is at the repository root. The counts come from my scripts in the session scratchpad (`test-results/template-fit/`): `fit78-range`, `fit78-counts`, `fit78-flags`, `fit78-srcwords` and `fit78-picks`. Each is a `.cjs` script with a `.txt` output.

#### 1. Design

- **Order** (`index.tsx:44-56`):
  - a fixed bar that turns to glass;
  - a full-screen first screen over a photograph, with a ringed pill, a headline set to the left, a line and two square buttons;
  - four cards around a centre picture;
  - a deck of 3 to 6 cards that stick and stack as the page scrolls, every other one tinted (`sections/services.tsx:29-33`);
  - steps down a hairline;
  - four photographs in a 7/5/5/7 grid whose captions slide up;
  - questions, one open at a time;
  - a six-field form beside its heading;
  - a closing band with a picture rising from its edge;
  - a footer over the name drawn as an outline.

  Visitors never get the articles block (`contract.ts:282`).

- **Density:** airy, with 144 px between blocks and 176 px from md (`styles.ts:20`).
- **Type:** headings in the display face, medium weight, tight spacing, at 85% opacity (`styles.ts:30`). Body text is small and grey. Form labels are in capitals (`styles.ts:42`).
- **Colour:** greys taken from the text colour. The brand colour appears only on buttons (`sections/hero.tsx:53`, `sections/cta.tsx:41`). Every other deck card takes the accent (`sections/services.tsx:32`).
- **Motion:** the first screen brightens from two fifths, blocks rise once, and the deck sticks with CSS alone (`summit.css:117-190`).
- **Led by photographs:** 13 slots (`contract.ts:488-502`). `docs/pipeline-quality-plan.md:82` says "Ember and Summit without pictures render mostly blank". The poster's words are "Quiet and airy" (`lib/preview/descriptors.ts:23`).

#### 2. Range

| Fixture    | Kind (notes) | baseline | l0       | l6    | l7      |
| ---------- | ------------ | -------- | -------- | ----- | ------- |
| architects | creative     | fallback | model    | model | model   |
| awkward    | consultancy  | fallback | model    | model | model   |
| bakery     | food         | fallback | fallback | model | not run |
| cleaning   | services     | fallback | fallback | model | not run |
| florist    | shop         | fallback | model    | model | model   |
| it-support | services     | fallback | fallback | model | not run |
| joinery    | trades       | fallback | model    | model | model   |
| longest    | consultancy  | fallback | model    | model | model   |
| tutors     | services     | fallback | fallback | model | not run |
| vague      | services     | fallback | model    | model | model   |

There are 36 stored answers: 22 model copy and 14 fallback. Every fallback came from an API error, not from the content (`fit78-range.txt`):

- baseline's 10 failed with "The compiled grammar is too large";
- l0's 4 failed with "Your credit balance is too low".

These fixtures were never given Summit: a1-gas, cafe, dentist-claims, electrician, gardens, hr, photographer, both physios and shortest.

What l6 and l7 wrote. The marks are:

- **F:** a fact from the sentence that the first three reasons did not use;
- **P:** padding, meaning a quality the sentence does not state, or one already made (my reading);
- **Rep:** repetition, counted by `fit78-flags`;
- **G:** a guide example copied word for word.

| Fixture    | t07-S1 fourth reason, l6; l7                        | t07-S2 cards, l6; l7                                                                                  | t07-S3 grid titles, l6                                                                                            |
| ---------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| architects | "Considered design" P; "We're a small studio" F     | 4, two share a checklist (Rep); 3, two share one (Rep)                                                | First sketches / Planning paperwork / Loft spaces / Barn spaces                                                   |
| awkward    | "Straightforward support" P; "Free first meeting" F | Bookkeeping / Tax returns / VAT / Payroll, distinct in both runs                                      | Plain explanations / Local knowledge / Fair, friendly pricing / Support all year (2 bodies restate reasons)       |
| bakery     | "Local and personal" P                              | Sourdough / Tin loaves / Buns                                                                         | Fresh bread each morning / Reliable early delivery / Orders that fit your shop / A bakery that listens            |
| cleaning   | "Built On Trust" P                                  | 4, two of them audiences ("For Homeowners", "For Tenants"); 5 lines repeated (Rep)                    | Your Own Cleaner / Checked And Insured / A Clear Checklist / Covering The Area                                    |
| florist    | "Same-Day Delivery" F, both runs                    | Bouquets / Wedding Flowers / Office Flowers, distinct in both runs                                    | Colourful Bouquets / Wedding Arrangements / Office Displays / Our Otley Road Shop                                 |
| it-support | "Built for small offices" P                         | Helpdesk / Microsoft 365 / Backups and security                                                       | Helpdesk access / Microsoft 365 setup / Protected data / One fixed price (same as a reason, Rep)                  |
| joinery    | "Fits your home exactly" P; "Made for your home" P  | Wardrobes / Alcove units / Kitchens; in l7 all three have the same checklist (Rep)                    | A visit to your home / A design drawn for you / Handmade in our workshop / Fitted by the two of us                |
| longest    | "Steady guidance" P; "Known to accountants" F       | 5 stages from the sentence, distinct in both runs                                                     | An honest starting point / Help through valuation / Paperwork handled with care / A steady year after handover    |
| tutors     | "In Ilkley or online" F                             | 4 subjects, every card "Small group or one to one / Same tutor each week / In Ilkley or online" (Rep) | Steady weekly rhythm / Personal attention / In Ilkley or online / Maths and science focus (same as a reason, Rep) |
| vague      | "We like helping" P; "Down to earth" P              | Indoors / Outdoors / All sorts; the third card's checklist is the steps (P)                           | Jobs big and small / A quick chat / Indoors and out / Getting it done (2 bodies restate reasons)                  |

- **t07-S4, the form:** all 16 answers wrote "Who to ask for" over "A name, if you have one" (G). The date label read "Preferred date" (G) in 15 and "Preferred start date" for the l6 bakery.
- **Fourth nav link** (it always leads to the grid):
  - l6: Projects, FAQs, What We Have, Reviews, Blooms, FAQs, Our Work, Our Work, FAQs, Our Work;
  - l7: Projects, FAQs, Flowers, Our work, Our Work, Get in Touch.
- **Source words:** 1 of 22 model answers ("Facilities" as a footer link label in the l0 florist; its nav label was "Flowers"). "Care" appears in 11, always as "take care of" or "with care" (`fit78-srcwords.txt`).

#### 3. Leftovers [R]

A count "of 22" covers every model answer: l0 6, l6 10, l7 6 (`fit78-counts.txt`).

| Fix id  | Element                                                                                                                                                                                                                                                                                                                           | Visitor sees                                                                 | Channel                                                               | Proposed fix                                                            | Changes copy model input | Stored copy repeated                                    | Reads wrong for                                                                         |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| t07-L1  | Reason icons by position: stethoscope, heart pulse, hospital, ambulance (`sections/why.tsx:1,9,28`); always four (`contract.ts:111`)                                                                                                                                                                                              | four medical drawings                                                        | page (`aria-hidden`)                                                  | one neutral set, such as numerals 01 to 04                              | no                       | on all 36 stored pages                                  | every business outside healthcare (all 10 fixtures given Summit)                        |
| t07-L2  | Step icons: magnifier, calendar, clipboard, heart-handshake (`sections/steps.tsx:1,8,46`)                                                                                                                                                                                                                                         | a calendar on step two                                                       | page (`aria-hidden`)                                                  | numerals in the dashed rings                                            | no                       | all 36 had three steps, so the fourth icon never showed | businesses whose second step is not a booking ("We plan your bake", "Measure and draw") |
| t07-L3  | Anchors `#booking-process` and `#book-appointment` (`sections/steps.tsx:17`, `sections/booking.tsx:24`); the main buttons lead there (`contract.ts:244,250,303`)                                                                                                                                                                  | in the URL                                                                   | URL; the model reads the names as link targets (`contract.ts:52,200`) | `#steps`, `#contact`                                                    | yes                      | footer links chose them 20 and 12 times in 22 answers   | businesses that take no bookings (shops, wholesale, advice)                             |
| t07-L4  | Anchor `#facilities` and section key `facilities` (`sections/facilities.tsx:17`, `contract.ts:47,77,168-173`)                                                                                                                                                                                                                     | in the URL after the fourth nav link                                         | URL; copy model                                                       | `#photos`; rename or map the key                                        | yes                      | once as a visible label (l0 florist)                    | businesses without premises                                                             |
| t07-L5  | Field id `summit-doctor`, name `doctor` (`sections/booking.tsx:89,94-95,103-104`)                                                                                                                                                                                                                                                 | "doctor=" in the email body, or in the URL when there is no email (`:43-49`) | form data, URL                                                        | `summit-person`, `person`                                               | no                       | not in copy                                             | every business outside healthcare                                                       |
| t07-L6  | Field id `summit-department`, name `department` (`sections/booking.tsx:122,127-128`)                                                                                                                                                                                                                                              | "department=" as above                                                       | form data, URL                                                        | `summit-service`, `service`                                             | no                       | not in copy                                             | firms without departments (all 10 fixtures)                                             |
| t07-L7  | Schema and slot keys `doctor`, `department` (`contract.ts:88-89,186-191`)                                                                                                                                                                                                                                                         | nothing directly                                                             | copy model only                                                       | `person`, `service`                                                     | yes                      | neither word in 22 answers                              | none seen; a risk only                                                                  |
| t07-L8  | Guide example "Open every day of the week" (`contract.ts:148`)                                                                                                                                                                                                                                                                    | the pill line                                                                | copy model only                                                       | "such as where they work or who they serve"                             | yes                      | 0 of 22                                                 | businesses without opening hours (a risk only)                                          |
| t07-L9  | Guide purpose "what they have" for the link to the grid (`contract.ts:144-145`)                                                                                                                                                                                                                                                   | the fourth nav label                                                         | copy model, then page                                                 | "a name for the four photographs"                                       | yes                      | Our Work 7, FAQs 5, Projects 3                          | see t07-D1                                                                              |
| t07-L10 | Guide examples copied word for word (`contract.ts:152-192,201`): "Who to ask for" 22, "A name, if you have one" 22, "What you need" 22, "Choose one" 21, "Preferred date" 21; "Why choose us", "See what we do", "How it works", "What you get", "Find out more", "FAQs", "Frequently asked questions" and "Get in touch" 22 each | the same labels on every Summit page                                         | copy model, then page                                                 | the wording is neutral; the form's problem is the field itself (t07-S4) | n/a                      | counts as given, of 22                                  | form labels: as t07-S4; others: none found                                              |
| t07-L11 | Fallback words "Hello", "What you get" and fixed form labels (`contract.ts:374,377,446-451`); ornaments: check circles, arrows, chevrons, plus and cross, mail icon, outlined name, "All rights reserved" (`sections/services.tsx:46`, `sections/faq.tsx:53-55`, `sections/footer.tsx:78,88,118-125`)                             | generic words and marks                                                      | page                                                                  | keep                                                                    | no                       | 14 fallback answers                                     | none found                                                                              |

#### 4. Structures [S]

| Id     | Content it needs                                                   | Code                                                                    | Stored fills                                                                                                                                                                               | Limit the evidence shows                                                                                                                                                                                                                                                                                                                                |
| ------ | ------------------------------------------------------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| t07-S1 | exactly four distinct reasons                                      | `contract.ts:111,155-156`; the brief has three (`lib/ai/prompts.ts:33`) | a fourth in 22 of 22. It was a fact (F) in 2 of 10 in l6 and 4 of 6 in l7. l7 added the sentence to the copy call (`docs/pipeline-quality-plan.md:64`)                                     | padding for every business whose sentence yields three reasons. No category limit                                                                                                                                                                                                                                                                       |
| t07-S2 | 3 to 6 named offerings, each with 2 to 5 parts and a large picture | `copy-slots.ts:195-196`, `contract.ts:159-162`                          | 3 cards in 14, 4 in 6, 5 in 2. A line repeated on another card in 9 of 22; every card the same in 2                                                                                        | sentence-level: offerings named without their parts repeat lines. No category limit                                                                                                                                                                                                                                                                     |
| t07-S3 | four subjects a photograph can show, different from the reasons    | `contract.ts:112,170-172`                                               | showable for joinery, florist and bakery. Abstract for advice and service sentences ("Local knowledge", "One fixed price", "A quick chat"). A grid body close to a reason body in 13 of 22 | proposed, in doubt: businesses whose offering is advice or paperwork fill the grid with ideas no photograph shows. The l6 longest's four cells were office and handshake shots (`fit78-picks.txt`). Needs a render with pictures (decision 6)                                                                                                           |
| t07-S4 | a customer who asks for a named person and picks a date            | `sections/booking.tsx:88-155`, `contract.ts:290-294`                    | "Who to ask for" in 22 of 22; "Preferred date" in 21                                                                                                                                       | person field: proposed, in doubt, for sole traders and very small teams. 2 of 10 fixtures say they are two people ("the two of us", "two-person") and still got it. `docs/pipeline-quality-plan.md:82` calls it odd "for a joinery". Team size comes from the sentence, so it may not map to a category. Date field: no case found where it reads wrong |
| t07-S5 | a photograph with calm space behind text set to the left           | `sections/hero.tsx:16-64`                                               | picture only                                                                                                                                                                               | t07-D2, for every business                                                                                                                                                                                                                                                                                                                              |
| t07-S6 | three or four steps; 3 to 6 questions                              | `copy-slots.ts:197-198`                                                 | three steps in 22; five questions in 18; the l6 vague answers restate its reasons (my reading)                                                                                             | sentence-level                                                                                                                                                                                                                                                                                                                                          |

#### 5. Content demand

- **Counts:** the page asks for at least 17 titled items, from a brief of three selling points and three steps (`contract.ts:111-112`, `copy-slots.ts:195-198`):
  - four reasons;
  - 3 to 6 offerings, with at least six checklist lines;
  - 3 or 4 steps;
  - four grid titles;
  - 3 to 6 questions.

  There are no long paragraphs. The longest prose slot is a 220-character answer (`copy-slots.ts:156`).

- **Fallback:** 14 of 36, all from API errors; 0 of 16 in l6 and l7.
- **Retries:** a second attempt in 3 of 6 l0 model answers, 5 of 10 in l6 and 2 of 6 in l7.
- **Beyond the brief's three:** a fourth reason in 22 of 22; a fourth or fifth offering in 8; four or more questions in 22.
- **Repetition across sections:** a grid body close to a reason body in 13 of 22; a grid title the same as a reason title in 4.
- **Shortest fixture (vague, 94 characters):** two attempts in l6 and in l7. The fourth reason was padding both times, and one checklist was made of the steps.
- **Longest fixture (longest, 400 characters):** fitted at the first attempt in l6, with five distinct cards. The fourth reason was padding in l6 and a fact in l7.

#### 6. Slots

| Slot                        | Role and shape (code)                                                                                                                                                                                                                       | Text over it                                                                                    | Implies people | Empty state                     |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------- | ------------------------------- |
| `hero` (slot 0, the poster) | full-screen backdrop, cover, centred (`sections/hero.tsx:19-23`)                                                                                                                                                                            | pill, headline, line and two buttons, with no scrim (`:25-64`)                                  | no             | page surface, text still shown  |
| `why`                       | centre picture among four cards: 320 px tall, 384 px from sm, the full column height from lg (`sections/why.tsx:57`)                                                                                                                        | none                                                                                            | no             | muted block                     |
| `cta`                       | closing picture, from lg only: 493 px wide, height from the picture's own ratio, its foot running off the band (`sections/cta.tsx:52-61`)                                                                                                   | none                                                                                            | no             | not drawn                       |
| `service-1` to `-6`         | half of a deck card. Below md it is full width under the text, 256 px tall, 320 from sm. From md it is half the card and 448 px tall, and 579 px wide from xl (`sections/services.tsx:57-58`). One renders per card (`contract.ts:264-267`) | none                                                                                            | no             | page-surface block              |
| `facility-1` to `-4`        | grid cell, stacked below md, then 7/5/5/7; 300, 340 then 379 px tall (`sections/facilities.tsx:29-33`)                                                                                                                                      | title, line and link on a 30% blurred scrim; always shown below md, on hover from md (`:44-58`) | no             | muted cell, caption still drawn |

A visitor's own photographs fill slots in this order, and every later slot stays empty (`lib/images/plan.ts:25-30`). /start takes up to six (`lib/config.ts:141`). Empty blocks drawn:

| Own photographs | Filled                  | Empty with 3 cards (14 of 22 stored)                    | With 6 cards |
| --------------- | ----------------------- | ------------------------------------------------------- | ------------ |
| 1               | hero                    | 8 (why, 3 cards, 4 cells); the closing picture vanishes | 11           |
| 3               | hero, why, cta          | 7                                                       | 10           |
| 6               | hero, why, cta, 3 cards | 4 (the grid)                                            | 7            |

#### 7. Tone and description words

| Word               | Where                                                     | Proposed word for the feel |
| ------------------ | --------------------------------------------------------- | -------------------------- |
| "clinical"         | tone (`meta.ts:10`); "A calm clinical page" (`meta.ts:7`) | "crisp"                    |
| "appointment form" | `meta.ts:7`                                               | "enquiry form with a date" |

The description also names "a row of portraits" and "three article cards". Visitors never get either (`contract.ts:252,282`).

#### 8. Defects (wrong for every business)

- **t07-D1.** The fourth nav link always leads to the grid (`contract.ts:47`). Yet 8 of 22 labels named something else: "FAQs" 5 times, "Process", "Get in Touch", and "Reviews" on a page that has none.
- **t07-D2.** The hero text sits on the photograph with no scrim (`sections/hero.tsx:16-24`). Nothing checks that it can be read.
- **t07-D3.** From md, the caption links stay at opacity 0 when they have focus (`sections/facilities.tsx:44`; `docs/template-analysis.md:436`).
- **t07-D4.** The closing picture is marked `priority` inside a wrapper hidden below lg. Phones therefore load it but never show it (`sections/cta.tsx:53,60`).
- **t07-D5.** The form has no `autocomplete` (`sections/booking.tsx:56-86`). When there is no email, it writes every field into the URL (`:43-49`).
- **t07-D6.** The phone menu sheet comes before its toggle in the page, and focus is never returned to the toggle (`sections/nav.tsx:76-142`; `docs/template-analysis.md:435`).
- **t07-D7.** Text with transparency, such as `text-on-surface/55`, may fail AA contrast, and the colour solver cannot see it (`sections/why.tsx:32`; `docs/template-analysis.md:427`). I have not verified this.

#### 9. "Suits" candidates (proposals for the owner, not labels)

- **Makers and trades with things to show and visits to book:** all of the joinery's grid titles could be photographed, and its l6 cell pictures all scored 8 (`fit78-picks.txt`). Against it, checklist lines repeated (Rep), and the person field strains for a two-person firm.
- **Shops making products on the premises, with dated delivery:** the florist got distinct checklists and a factual fourth reason in both runs, and a grid of things a photograph can show. The date field suits a delivery.
- **Home services booked by date:** the cleaner's grid and date field fit, though five checklist lines repeated.
- **Not proposed:** advice and paperwork businesses (t07-S3 is in doubt). Practices that work by appointment are unjudged, because the dentist and both physios never got Summit.

#### 10. Provenance

PrebuiltUI's MediCare, a hospital website (`THIRD_PARTY_NOTICES.md:55-57`; `docs/adr/0029-summit-ported-from-a-published-build.md:9`). It explains the medical icons, the `doctor` and `department` fields and the booking anchors.

### t08-vector (Vector)

Paths that start with a file name, `sections/` or `example/` are under `templates/t08-vector/`. `THIRD_PARTY_NOTICES.md` is at the repository root. The counts come from the same scratchpad scripts as Summit's (`fit78-*.cjs` and their `.txt` outputs).

#### 1. Design

- **Order** (`index.tsx:38-49`):
  - two floating dark glass pills: one holds the name, the other a menu that names the current section, with a plus (`sections/header.tsx:85-160`);
  - a full-screen first screen of type over moving colour bands, with no picture and no button (`sections/hero.tsx:15-58`);
  - a giant two-word marquee that runs with the scroll over 2 to 4 items. The items alternate sides, and each has a rounded picture, a number, a two-part title and a sentence. Each opens full screen (`sections/projects.tsx:396-488`);
  - one sentence pinned while its letters grow, then 3 to 6 full-width rows that flip to their inverse under the pointer (`sections/services.tsx:21-48`);
  - a wide pill-shaped picture, a centred statement and a round button;
  - questions;
  - an inverted footer that the page slides off, with the visitor's email set huge (`sections/footer.tsx:24-45`).

  Visitors never get the proof block (`contract.ts:167`).

- **Scale:** display type up to `clamp(3rem,8vw,12rem)` (`sections/hero.tsx:25`). The pinned block is 250vh tall (`sections/services.tsx:22`).
- **Type:** one sans at medium weight. Serif italic is used for the headline's last line, the marquee's second word and the second part of each title (`sections/hero.tsx:37`, `sections/projects.tsx:435,469`).
- **Colour:** monochrome. The brand colour shows only as light in the bands (`vector.css:444-459`). Buttons and the footer are inverted. Item pictures are recoloured to two tones (`vector.css:461-470`).
- **Motion:** heavy. It covers the bands, headline lines rising out of clipped rows, a marquee and entrances tied to the scroll, a spring cursor, the letter pin, the flipping rows and the footer reveal.
- **Led by type and motion:** five picture slots, none in the first screen (`contract.ts:290`). The poster's words are "Bold and editorial" (`lib/preview/descriptors.ts:24`).

#### 2. Range

| Fixture         | Kind (notes) | baseline | l0       | l6    | l7      |
| --------------- | ------------ | -------- | -------- | ----- | ------- |
| bakery          | food         | model    | fallback | model | not run |
| cafe            | food         | model    | model    | model | model   |
| dentist-claims  | clinic       | model    | model    | model | model   |
| electrician     | trades       | model    | model    | model | not run |
| florist         | shop         | model    | model    | model | model   |
| physio-longest  | clinic       | model    | model    | model | not run |
| physio-unbroken | clinic       | model    | model    | model | not run |
| tutors          | services     | model    | fallback | model | not run |

There are 27 stored answers: 25 model copy and 2 fallback. Both fallbacks were l0's "credit balance is too low" (`fit78-range.txt`). These fixtures were never given Vector: a1-gas, architects, awkward, cleaning, gardens, hr, it-support, joinery, longest, photographer, shortest and vague.

What l6 (and l7) wrote. The marks are:

- **Rep:** an item restated as a row. The test compares words and misses plurals, so the count is a floor;
- **G:** a guide example copied word for word.

| Fixture         | t08-S1 marquee and items                                                                                                                 | t08-S2 pinned sentence; rows                                                                               |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| bakery          | "Fresh Bread": Sourdough / Loaves, Tin Loaves / and Buns, Wholesale / Orders                                                             | "We bake bread for cafés and farm shops across Calderdale."; 6 rows, with all 3 items again (Rep)          |
| cafe            | "Morning Bakes": Baked / Each Morning, Hearty / Breakfasts, Sourdough / Toasties (l7 "Baked Daily", much the same)                       | "Breakfasts, toasties and cakes baked here each morning."; 4 rows, 2 of 3 items again (Rep)                |
| dentist-claims  | "Our Care": Two / Surgeries, Open / Daily, Flexible / Payment, Trusted / Hygienists. All are facts, not offerings (l7 has three of them) | "We care for your family's smiles, every day of the week."; 5 rows, 2 of 4 items again (Rep)               |
| electrician     | "Recent Work" (G "Work"): Full / Rewire, Consumer / Units, EV Charger / Install, Fault / Finding                                         | "Honest electrical work for homes across York and Selby."; 4 rows naming the same four jobs                |
| florist         | "Selected Blooms" (G "Selected"), both runs: Fresh / Bouquets, Wedding / Flowers, Office / Arrangements                                  | "Bold flowers for every moment, made on Otley Road."; 4 rows, 2 of 3 items again (l7 3 of 3) (Rep)         |
| physio-longest  | "Helping Hull": Sports / Massage, Gait / Analysis, Injury / Rehab                                                                        | "Sports massage, gait analysis and injury rehab for Hull."; 3 rows, exactly the items (Rep)                |
| physio-unbroken | "Support Areas": Sports / Injury Care, Back Pain / Support, Post-Operative / Rehab                                                       | "Physiotherapy for sports injuries, back pain and post-operative rehab."; 4 rows, 3 of 3 items again (Rep) |
| tutors          | "Learning Styles": Small / Groups, One to / One, Same / Tutor (formats)                                                                  | "GCSE and A level maths and science tutoring, in Ilkley or online."; 6 rows, none repeated                 |

Across all 25 model answers (`fit78-counts.txt`, `fit78-srcwords.txt`):

- the name was lower-cased in all 25, for example "oakfield dental practice" and "bright spark electrical";
- the second nav label was "Our Work" in 22 ("Their Work", "Our Café" and "Our Food" once each). The footer link to `#projects` read "Our Work" in 23 ("Their Work" and "Our Café" once each);
- no answer invented a project. The items were offerings, facts or formats. "Work" appears in an item only as "larger dental work" and "Work through injury rehab";
- the scroll hint was "Scroll" (G) in 25. The footer headings were "Navigation" (G) in 25 and "Services" (G) in 20;
- the questions heading was "Frequently / Asked" in 14 and "Frequently asked / Questions" in 11;
- none copied "We craft experiences that captivate." or "Built to evolve ideas."

#### 3. Leftovers [R]

A count "of 25" covers every model answer: baseline 8, l0 6, l6 8, l7 3 (`fit78-counts.txt`).

| Fix id | Element                                                                                                                                                                                                                                                                                                                                                                                        | Visitor sees                                                                                                   | Channel                                       | Proposed fix                                     | Changes copy model input | Stored copy repeated                                                         | Reads wrong for                                                                                                        |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------ | ------------------------ | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| t08-L1 | Guide "two to four pieces of work" (`contract.ts:103-104`)                                                                                                                                                                                                                                                                                                                                     | the item titles                                                                                                | copy model only                               | "two to four things they offer or are known for" | yes                      | 0 of 25 invented work                                                        | none in stored copy; a risk for any business without past work to show                                                 |
| t08-L2 | Guide "their work" for the second nav link (`contract.ts:95-96`), which leads to `#projects` (`contract.ts:36`)                                                                                                                                                                                                                                                                                | "Our Work" in the menu pill while the items are on screen (`sections/header.tsx:45-51,116`), and in the footer | copy model, then page                         | "a name for the items, such as what they offer"  | yes                      | 22 of 25 in the nav, 23 of 25 in the footer                                  | businesses with no past work to show. The café, bakery, dentist and tutors got "Our Work" over food, facts and formats |
| t08-L3 | Guide "set in lower case in the bar as the source set its own" (`contract.ts:93`)                                                                                                                                                                                                                                                                                                              | the name lower-cased in the bar and footer (`sections/logo.tsx:21`, `sections/footer.tsx:52`)                  | copy model, then page                         | "the company name as given"                      | yes                      | 25 of 25                                                                     | any business whose name has capitals (all 20 fixtures)                                                                 |
| t08-L4 | Marquee examples "Selected" and "Work" (`contract.ts:101-102`)                                                                                                                                                                                                                                                                                                                                 | the giant marquee                                                                                              | copy model, then page                         | "two words naming what the items are"            | yes                      | "Selected" 4 (l0 2, l6 1, l7 1); "Work" 3 (once each in baseline, l0 and l6) | businesses without a portfolio ("Selected Work", l0 electrician)                                                       |
| t08-L5 | Anchor `#projects`, schema key `projects`, slot keys `project-1` to `-4` (`sections/projects.tsx:456`, `contract.ts:23,49,121,158,290`)                                                                                                                                                                                                                                                        | in the URL                                                                                                     | URL; copy model (slot paths and link targets) | `#featured`; rename or map the keys              | yes                      | the footer linked to it in 25 of 25                                          | as t08-L2                                                                                                              |
| t08-L6 | Guide examples "We craft experiences that captivate." and "Built to evolve ideas.", the source's own lines (`contract.ts:108,116`; `example/content.ts:65,131`)                                                                                                                                                                                                                                | nothing so far                                                                                                 | copy model only                               | examples drawn from no trade                     | yes                      | 0 of 25                                                                      | none in stored copy                                                                                                    |
| t08-L7 | Fallback words "Work", "Our Work" and "Our work" (`contract.ts:229,236,272,279`)                                                                                                                                                                                                                                                                                                               | nav, marquee and footer on fallback pages                                                                      | page                                          | "What we do"                                     | no                       | 2 fallback answers                                                           | businesses without past work to show                                                                                   |
| t08-L8 | Ornaments and fixed words: "Open" on the cursor disc (`sections/projects.tsx:144,154`), numbers 01 to 04 (`:426`), plus and cross (`sections/header.tsx:117-123`), row arrows (`sections/menu.tsx:98-110`), "Close overlay" (`sections/projects.tsx:296`), guide examples "Scroll", "Services" and "Navigation" (`contract.ts:100,117-119`), "All rights reserved" (`sections/footer.tsx:135`) | generic words and marks                                                                                        | page; screen reader for "Close overlay"       | keep                                             | n/a                      | "Scroll" 25, "Navigation" 25, "Services" 20                                  | none found                                                                                                             |

#### 4. Structures [S]

| Id     | Content it needs                                                                                                                 | Code                                                               | Stored fills                                                                                                                                                                                                                                                            | Limit the evidence shows                                                                                                                         |
| ------ | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| t08-S1 | 2 to 4 things that can be named, each worth a full-screen picture, each titled in two short parts                                | `copy-slots.ts:90-91,134`; `sections/projects.tsx:236-317,396-443` | 3 items in 22 answers, 4 in 3. Offerings for 6 of 8 l6 businesses, facts from the sentence for the dentist and formats for the tutors. A second part opening with "and" in 3 of 25 ("Tin Loaves / and Buns", "Rewires / and units"), plus "One to / One" for the tutors | sentence-level: a sentence of facts gives items such as "Open / Daily", opened full screen. Not judged without a render. No category limit shown |
| t08-S2 | one line of 30 to 80 characters and 3 to 6 offerings                                                                             | `copy-slots.ts:93-94,135`; `sections/services.tsx:21-48`           | its own sentence in 25 of 25. Rows: 3 in 7 answers, 4 in 15, 5 in 1, 6 in 2                                                                                                                                                                                             | none by category. Repetition is built in: the footer lists the rows again (`contract.ts:174`)                                                    |
| t08-S3 | one sentence under a wide picture, and a button                                                                                  | `sections/about.tsx:16-57`                                         | filled in 25                                                                                                                                                                                                                                                            | none                                                                                                                                             |
| t08-S4 | an email address as the only contact: a giant address and one button at the foot, with no form and no button in the first screen | `sections/footer.tsx:29-43`, `contract.ts:169-171`                 | the preview shows the visitor's own email                                                                                                                                                                                                                               | no business shown where it reads wrong; see t08-D7                                                                                               |
| t08-S5 | pictures that still read in two tones                                                                                            | `sections/ripple.tsx:384-404`, `vector.css:461-470`                | n/a                                                                                                                                                                                                                                                                     | not judged. For a business whose offering is its colour (flowers, food), a render is needed                                                      |

#### 5. Content demand

- **Counts:** the page asks for at least eight titled items, and has no reasons or steps section (`copy-slots.ts:131-138`):
  - 2 to 4 items;
  - 3 to 6 rows;
  - a headline of 2 or 3 lines;
  - a pinned sentence and a statement;
  - 3 to 6 questions.

  There are no long paragraphs. The longest prose slot is a 300-character answer (`copy-slots.ts:113`).

- **Fallback:** 2 of 27.
- **Retries:** a second attempt in 7 of 8 baseline answers, 5 of 6 l0 model answers, 5 of 8 in l6 and 3 of 3 in l7. l7's first-fit rate was 0% (`test-results/eval/l7-sentence/summary.md:27`). The l7 dentist took four attempts, mostly because nav links came back as objects. They have since been made plain strings (`docs/pipeline-quality-plan.md:65`, `contract.ts:47`).
- **Beyond the brief's three:** a fourth item in 3 of 25; more than three rows in 18 of 25.
- **Repetition across sections:** an item restated as a row in 21 of 25, and every item restated in 12. The footer repeats the rows by code.
- **Shortest fixture (physio-longest, 125 characters):** two attempts in l6. The items and the rows were both the three named treatments. The 24-character cap cut the name to "ashgrove physio clinic" (`copy-slots.ts:82`).
- **Longest fixture (dentist-claims, 255 characters):** fitted at the first attempt in l6, with four items, all facts.

#### 6. Slots

| Slot                                                                           | Role and shape (code)                                                                                                                                                                                                                                                                                                                                                                   | Text over it                                                                                      | Implies people | Empty state          |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------- | -------------------- |
| `about` (slot 0, the poster; takes the hero searches, `lib/images/plan.ts:31`) | wide picture over the statement: 21:9, 3:1 from lg, fully rounded ends, the container's width up to 1440 px less padding (`sections/about.tsx:32`, `styles.ts:17,20`). It grows from 0.9 with the scroll                                                                                                                                                                                | none                                                                                              | no             | muted pill           |
| `project-1` to `-4`                                                            | one per item: a 4:3 box with fully rounded corners, full width below md and three fifths from md. The picture is scaled 1.15 inside, revealed through a growing circle and shown in two tones (`sections/projects.tsx:399-421`, `sections/ripple.tsx:392-401`). It fills the screen when opened (`sections/projects.tsx:264-276`). Only the first 2 to 4 render (`contract.ts:156-159`) | none on the card; the two-part title on a 40% scrim when opened (`sections/projects.tsx:276-284`) | no             | muted block (`:420`) |

A visitor's own photographs fill slots in this order (`lib/images/plan.ts:25-30`). In item slots they show in two tones, never in their own colours.

| Own photographs | Filled                        | Empty with 3 items (22 of 25 stored) | With 4 items |
| --------------- | ----------------------------- | ------------------------------------ | ------------ |
| 1               | about                         | 3                                    | 4            |
| 3               | about, items 1 and 2          | 1                                    | 2            |
| 6               | all five; the sixth is unused | 0                                    | 0            |

#### 7. Tone and description words

| Word               | Where                                                         | Proposed word for the feel                                                                      |
| ------------------ | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| "studio"           | tone (`meta.ts:10`); "A near-black studio page" (`meta.ts:7`) | "cinematic"                                                                                     |
| "project pictures" | `meta.ts:7`                                                   | "item pictures"                                                                                 |
| "editorial"        | tone (`meta.ts:10`)                                           | names a style of publishing, not a business. Keep it, or use "magazine-like"; the owner decides |

The description also names "a bento of quiet cards", which visitors never get (`contract.ts:167`).

#### 8. Defects (wrong for every business)

- **t08-D1.** The guide example for the questions heading, "such as Frequently asked and Questions" (`contract.ts:112`), produced "Frequently / Asked" in 14 of 25. That heading never says "questions".
- **t08-D2.** The pinned heading is spelled out letter by letter with no text alternative (`sections/services.tsx:24-44`; `docs/template-analysis.md:434`). Not tested with a screen reader.
- **t08-D3.** The shader's two-tone colouring is a fixed violet to pink (`sections/ripple.tsx:59`), so it ignores the look's colours. When the shader takes over, the picture's alt text is removed and the canvas is `aria-hidden` (`:388,392`). `docs/template-analysis.md:388` says visitors get the CSS version instead, because the shader fails on Blob pictures. I have not verified this.
- **t08-D4.** The menu toggle is named after the current section, never "Menu" (`sections/header.tsx:106-116`).
- **t08-D5.** The meta says `polarity: 'either'`, but the logo always sits on a dark glass pill, so a dark logo vanishes (`meta.ts:9`, `sections/header.tsx:95`).
- **t08-D6.** Headings jump from h1 to h3 (`sections/projects.tsx:428`), and the footer uses h4 (`sections/footer.tsx:58,78,88`).
- **t08-D7.** There is no button in the first screen. The first ask is 58% of the way down a phone page (`docs/template-analysis.md:491`). Not re-measured.

#### 9. "Suits" candidates (proposals for the owner, not labels)

- **Trades with three or four distinct jobs:** the electrician's items and rows were its four jobs, and its l6 item pictures scored 8 to 9 (`fit78-picks.txt`).
- **Practices with named treatments or sessions:** both physios' items were named treatments in every run. Their l6 item pictures were massage or shoulder shots for every item, "Gait Analysis" included. That is a photograph problem for Phase 4.
- **Makers and shops with named products:** the bakery, café and florist items were products. The two-tone pictures remove the products' colours, so this waits for a render (t08-S5).
- No category is excluded on stored evidence. The dentist's items were facts, which is a sentence-level cause.

#### 10. Provenance

React Bits Pro's Agency template, a creative agency's site, rebuilt from its public demo (`THIRD_PARTY_NOTICES.md:65`; `docs/adr/0030-vector-ported-from-a-paid-template.md:9`). It explains "pieces of work", "their work", `projects`, the lower-case name and "Selected Work" (`example/content.ts:25,39`).

### t09-inegro (Inegro), code facts only

**Scope.** Inegro is not ready (`templates/t09-inegro/meta.ts:10`) and is in no stored run. So there is no range, no stored fill and no repetition count. Every category a fix would open is unjudged.

**Slot measurements.** Slot geometry was measured on `/examples/inegro`, with the example's copy and pictures, for geometry only. There were 21 widths: 390, 579 to 581, 767 to 769, 781 to 783, 1023 to 1025, 1219 to 1221, 1279 to 1281, 1440 and 1920 (`scratchpad/slot-geometry-inegro.json`). Nothing scrolls sideways at any of them.

#### 1. Design

**Order** (`templates/t09-inegro/index.tsx:39-58`):

1. A bar with four links, two of which open panels of links and picture cards, and an outlined ask.
2. A full-screen hero: five coloured ribbons that draw themselves, a two-line headline with one phrase in the brand colour, a subhead and 2 to 4 pill links.
3. A frosted text card over a full-width photograph.
4. A list of 3 to 6 big one-line names. One is open at a time, onto a picture card.
5. Three short notes that travel along two ribbons in turn, then a resting statement card.
6. A paragraph beside a turning ring that shows three numbered lines one at a time.
7. A second frosted card.
8. Three boxes washed from a colour into the dark.
9. A third frosted card.
10. An email form.
11. A band washed from white through the brand into the dark, with a big button.
12. A white footer.

**Look and type.**

- The page is led by type and motion, and it is heavy on text. Photographs sit behind text cards or under a card's title.
- Type uses the look's display and body faces (`inegro.css:26-29`).
- Colour comes from the brand's tokens. The ribbons, boxes and two buttons use a palette derived from the brand and glow tokens (`inegro.css:33-51`).

**Motion** (ADR 0041:22-27):

- Each long paragraph lights letter by letter with the scroll.
- Each block after a glass card slides out from under it.
- The notes travel the ribbons in turn, and the ring turns.
- Above 1024 px, the names' letters roll on hover.
- Under reduced motion nothing moves (`sections/motion.tsx:15`; ADR 0041:28).

**Fixed formats.**

- The offering cards are numbered 01 to 06, with the brand's name on a tab (`sections/services.tsx:111,115`).
- The ring's lines are numbered 01 to 03 (`sections/process.tsx:99`), "so nothing is claimed" (ADR 0041:19).

#### 2. Range

None stored. The template was never given to a fixture.

#### 3. Leftovers [R]

| Fix id | Element                                                                                                                                       | Where                                                   | Channel                                                                                                                                                                                 | Proposed fix                                                          | Changes what the copy model sees |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------- |
| t09-L1 | Guide example "such as With a site visit" for the card tagline. It comes from the in-house example, not the source (`example/content.ts:40`). | `contract.ts:142`                                       | Seen only by the copy model. It reaches the page if copied word for word.                                                                                                               | An example that presumes no visit, such as "Start with a chat"        | Yes                              |
| t09-L2 | `newsletter` as the form's id and as a link target. The source's form was a newsletter form (ADR 0041:19).                                    | `sections/newsletter.tsx:12,15,19`; `contract.ts:31,42` | In the URL (`#newsletter`) when a pill or footer link targets it (guide lists it at `contract.ts:130,174`), or when the closing button has no email (`contract.ts:272`). Also a DOM id. | Rename the id and the target to `email-form`                          | Yes (the guide's target list)    |
| t09-L3 | Slot paths `newsletter.*`                                                                                                                     | `contract.ts:166-169`                                   | Seen only by the copy model                                                                                                                                                             | Rename to `emailForm.*`, or leave it, since its purpose text is plain | Yes, if renamed                  |
| t09-L4 | Field id `newsletter-email`                                                                                                                   | `sections/newsletter.tsx:33,37`                         | DOM id and label link. The form data uses the name `email` (`:39`).                                                                                                                     | Rename to `inegro-email`                                              | No                               |
| t09-L5 | Slot names `name` and `role` on the three notes. The source set its quotes' speaker there (ADR 0041:19).                                      | `copy-slots.ts:46-47`; `contract.ts:145-146`            | Seen only by the copy model. The layout, an italic sentence over a bold title (`sections/notes.tsx:30-32`), is design.                                                                  | Rename to `title` and `topic`                                         | Yes                              |
| t09-L6 | A networks list that includes `substack` and `spotify`                                                                                        | `copy-slots.ts:52-53`                                   | None on a visitor page: the row is null (`contract.ts:274`). Example only.                                                                                                              | None needed                                                           | No                               |

- **Kept, names no trade:**
  - The screen-reader label "Menu" (`sections/header.tsx:265`).
  - The credit "Photographs by … on Pexels." (`sections/footer.tsx:38-45`).
  - "© {legal name} {year}" (`footer.tsx:49`).
- **Universal, not a leftover:** 13 guide examples name no trade but are likely to be copied word for word, as Summit's and Monolith's were. They include "See how we can help", "Introduction", "Enquire now", "Why we exist" and "Get in touch by email" (`contract.ts:128-169`). Not verified for Inegro, because there is no stored copy.

#### 4. Structures [S]

| Id     | Content it needs                                                                                                                                                                           | Where                                                       | Limits the code shows                                                                                                                                          |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| t09-S1 | Four long paragraphs in the visitor's voice: about them (180 to 560 characters), how working together goes (150 to 360), how they work (150 to 400) and why they exist (150 to 420)        | `copy-slots.ts:136,152,156,166`                             | At least 630 characters of prose from a sentence of 30 to 400 (`lib/config.ts:138-139`). The fallback pads with four filler sentences (`contract.ts:281-290`). |
| t09-S2 | Three to six named offerings. Each has a big one-line name (4 to 24 characters), a line (30 to 80) and a picture card with a title (8 to 34) and a tagline (8 to 30) set over the picture. | `copy-slots.ts:141-144,183`; `sections/services.tsx:63-120` | The brief holds no list of offerings (`lib/ai/prompts.ts:28-37`). The fallback uses the three value-prop titles (`contract.ts:348-353`).                       |
| t09-S3 | Three short sentences about how they work, each with a short title, then the company's statement over its own name                                                                         | `contract.ts:143-148,244`; `sections/notes.tsx:18-35`       | Fits the brief's three points plus a statement (`lib/ai/prompts.ts:33,35`)                                                                                     |
| t09-S4 | Three step titles of 8 to 34 characters, shown one at a time in a ring beside a paragraph                                                                                                  | `sections/process.tsx:97-108`; `copy-slots.ts:154`          | Fits the brief's three steps (`lib/ai/prompts.ts:34`)                                                                                                          |
| t09-S5 | Exactly three boxes, one per value proposition                                                                                                                                             | `contract.ts:101,160-162`                                   | Fits the brief's three points                                                                                                                                  |
| t09-S6 | Three full-width backdrop photographs under text cards                                                                                                                                     | `sections/glass.tsx:45-55`                                  | Text covers most of each (see 6)                                                                                                                               |
| t09-S7 | The bar's two panels, which show the first two offerings as picture cards                                                                                                                  | `sections/header.tsx:78-90`; `contract.ts:205-214`          | Shown only when a panel is open                                                                                                                                |

#### 5. Content demand

| Item               | Count                                                                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Distinct offerings | 3 to 6, each with 4 texts and 1 picture                                                                                                 |
| Points             | 3 notes and 3 boxes. Both draw on the brief's three value props in the fallback (`contract.ts:355-360,384-388`).                        |
| Statement          | Used in up to 4 places in the fallback: the intro, the statement card, the mission and the closing band (`contract.ts:341,362,392,401`) |
| Steps              | 3 lines plus one paragraph                                                                                                              |
| Long paragraphs    | 4, of 150 characters or more each (630 to 1,740 characters in total), plus 2 of 80 to 220 (`copy-slots.ts:148,171`)                     |
| Pictures           | 9 slots. 3 backdrops always render, plus one card per offering.                                                                         |

- **Fallback repetition** (`contract.ts:307-413`):
  - The three value-prop titles appear as the offering names and card titles, the note titles and the box titles (`:349,351,358,386`).
  - "In our own words" appears on all three notes (`:359`).
  - "With {name}" is every card's tagline (`:352`).
- **Not measurable:** the fallback rate, retries, the shortest and longest fixtures, and points added beyond the brief's three. There are no stored runs.

#### 6. Slots

The poster shows `imageSlots[0]` (`lib/preview/status.ts:49`), which for Inegro is the intro backdrop.

| Slot                           | Role and shape                                                                                                                                                                                                                                                                                            | Shows                                                                                                                                    | Text over it                                                                                                                                                                         | Shape implies people | Empty state                                                             |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- | ----------------------------------------------------------------------- |
| intro, approach, mission       | Full-width backdrop under a frosted text card. Its height follows the text. Measured with the example's copy: 0.39:1 to 1.45:1 below 768 px, 0.56:1 to 1.27:1 from 768 to 1024 px (0.56:1 to 0.78:1 from 768 to 783 px, 1.02:1 to 1.27:1 at 1023 and 1024 px), and 0.95:1 to 3.18:1 from 1025 to 1920 px. | At every width                                                                                                                           | The text card covers 22% to 100% of a 9x9 grid of sample points (100% for intro at 390 px, 78% for the other two at most widths), plus a scrim from the top (`inegro.css:1296-1303`) | No                   | The band is filled with the scrim colour (`inegro.css:1315-1318`)       |
| service-1 to service-6         | One picture per offering. The card's width varies (see note below). Its height follows the picture's ratio, with a minimum of 320 px, or 260 px from 768 to 1024 px (`inegro.css:1447-1470,1656-1666`). Measured 1.06:1 at 390, 1.5:1 from 579 to 767, 1.35:1 from 768 to 1024, and 1.47:1 from 1025.     | Only the open offering's card. The first opens on load (`sections/services.tsx:49`). Slots beyond the number of offerings do not render. | The title, tagline and optional mark sit at the top right, on a gradient over the whole card (`inegro.css:1472-1485`). The brand tab sits at the foot.                               | No                   | A blank block in the scrim colour, 320 px tall (`inegro.css:1467-1470`) |
| service-1 and service-2, again | Small card pictures in the bar's panels, 300:167 (`inegro.css:611-619`); 198x110 measured in the phone sheet                                                                                                                                                                                              | Only while a panel or the phone sheet is open                                                                                            | None                                                                                                                                                                                 | No                   | No picture. The card shows its words (`sections/header.tsx:80-87`).     |

- **Card widths:** 100% minus 50 px, up to 480 px, below 768 px; 350 px from 768 to 1024 px; 470 px from 1025 px.
- **Seams:**
  - At 767 to 768 px, the intro band grows from 614 to 1,364 px tall with the example's copy, and the card goes from 480x320 to 350x260.
  - At 1024 to 1025 px, the card goes from 350x260 to 470x320.
  - At 580, 782, 1220 and 1280 px, no slot changes shape.
- **Crop:** a 3:2 picture loses about 29% of its width at 390 px (340x320), and almost nothing from 1025 px. This is computed from the measured boxes.
- **Visitor's own photographs** fill slots in contract order and leave the rest empty (`lib/images/plan.ts:25-30`; `contract.ts:418-428`). With three offerings:

  | Own photographs | Rendered slots left empty | Note                                         |
  | --------------- | ------------------------- | -------------------------------------------- |
  | 1               | 5 of 6                    |                                              |
  | 3               | 3 of 6                    |                                              |
  | 6               | 2 of 6                    | 2 photographs go to slots that do not render |

#### 7. Tone and description words

- **Tones:** "luminous", "thoughtful" and "editorial" (`meta.ts:12`). None names a kind of business.
- **Description** (`meta.ts:7`): no industry word.
- **Two phrases describe the example page, not a visitor's page:**

  | Phrase              | Why it is wrong for a visitor's page                              | Proposed wording                              |
  | ------------------- | ----------------------------------------------------------------- | --------------------------------------------- |
  | "quote cards"       | The cards carry the business's own points (`contract.ts:143-148`) | "note cards"                                  |
  | "deep night-violet" | A visitor's page takes the brand's tokens (ADR 0041:20)           | "a dark or light page in the brand's colours" |

#### 8. Defects

1. Under reduced motion, the three notes never show. Their cards stay at opacity 0 (`inegro.css:1741`) and only the resting statement card is shown (`inegro.css:1767-1768`; `sections/motion.tsx:15`).
2. Under reduced motion, only the first of the three steps shows (`inegro.css:1914-1925`).
3. Each offering's picture shows only after a press, except the first (`sections/services.tsx:49`). Each one still takes a picture (`lib/images/plan.ts:25-46`).
4. The card title and tagline sit at the top right, over a gradient that is clear at the top left and full scrim at the bottom right (`inegro.css:1472-1485`). Their contrast is not verified. ADR 0041:48 already says a photograph under a glass card has contrast that a brand's colours cannot guarantee.
5. List keys are the text itself (`sections/services.tsx:67`, `sections/process.tsx:101`). Two equal names would share a key. The effect is not verified.
6. The fallback repeats the same points across sections (see 5).

#### 9. Provenance

- **Source:** a podcast's WordPress site that a friend of the owner built for a client. The site is not named (ADR 0041:13; `THIRD_PARTY_NOTICES.md:73`).
- **It explains:**
  - `#newsletter` (the source's newsletter form, ADR 0041:19).
  - The networks list (`copy-slots.ts:52-53`).
  - The notes' `name` and `role` slots (the source's guest quotes).
  - The list of names (the source's guests).
  - The cards' dropped portraits (ADR 0041:29).
  - The ring (the source's community figures).

### t10-lucent (Lucent), code facts only

**Scope.** Lucent is not ready (`templates/t10-lucent/meta.ts:10`) and is in no stored run. Every category a fix would open is unjudged.

**Slot measurements.** Geometry was measured on `/examples/lucent` at 37 widths. They cover each breakpoint ±1 px at 359, 460, 560, 600, 640/641, 700, 860, 899/900, 960/961 and 1024, plus 390, 768, 1440 and 1920 (`scratchpad/slot-geometry-lucent.json`). Nothing scrolls sideways at any of them.

#### 1. Design

**Order** (`index.tsx:52-70`):

1. A splash where the name rises out of a blur.
2. A floating glass pill bar with four links and an ask.
3. The hero: a big two-sentence headline, a lead and two buttons, beside a drawn phone that holds the main picture.
4. A wide picture that grows near the top.
5. An overview: a two-line heading, a paragraph, three ticked lines and a parallax picture.
6. A white card of three short lines (the last in the accent) with a picture.
7. A picture onto which a notice drops.
8. Three numbered pills beside a tall picture.
9. A sideways rail of four feature cards, the last one black.
10. A wide picture.
11. Two tall pictures side by side.
12. A statement that rises word by word.
13. Questions.
14. A card of one sentence and pills.
15. A picture card with three lines and an email form.
16. A dark footer whose big ask slides up line by line.

**Look and behaviour.**

- The page is led by pictures and a framed screen, with 14 picture slots.
- It has grain, one accent and a tint that warms the page around the wide picture (`index.tsx:50-51`; ADR 0043:19,26).
- Every button leads to the ask, which opens a mail message (`contract.ts:242-247`).

#### 2. Range

None stored.

#### 3. Leftovers [R]

| Fix id | Element                                                                                                                                                                  | Where                                                                                                                                             | Channel                                                                                | Proposed fix                                                        | Changes what the copy model sees  |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------- |
| t10-L1 | Guide example "such as Booking confirmed" for the notice title                                                                                                           | `contract.ts:155`                                                                                                                                 | Seen only by the copy model                                                            | "such as Message received"                                          | Yes                               |
| t10-L2 | An envelope icon in the place of the source's Apple logo                                                                                                                 | `sections/hero.tsx:15-17,33`                                                                                                                      | Seen on the page (aria-hidden)                                                         | Owner decision 3 (ADR 0043:46): keep it, or drop the icon           | No                                |
| t10-L3 | "Contact us", which copies the address and shows "✓ {email} copied"                                                                                                      | `sections/footer.tsx:78-80`; `sections/copy-email.tsx:44`; guide example at `contract.ts:202`                                                     | Seen on the page                                                                       | Owner decision 4 (ADR 0043:46): keep it, or make it a mail link     | Only if the guide example changes |
| t10-L4 | Slot paths `widgets.*` and `journal.*`, which are the source's section names (ADR 0043:18), and `reminder.*`, whose origin is not verified                               | `contract.ts:151-158,169-171,186-195`                                                                                                             | Seen only by the copy model                                                            | Rename by job, for example `wide.*`, `pictureForm.*` and `notice.*` | Yes                               |
| t10-L5 | Picture slot keys `widgets`, `journal` and `reminder`                                                                                                                    | `contract.ts:512,518,521`                                                                                                                         | Metadata only. The judge's purpose text uses no slot key (`lib/images/plan.ts:42-45`). | Map them to slot classes named by shape and job                     | No                                |
| t10-L6 | Class names taken from the source's sections: `lc-ai`, `lc-import`, `lc-watch`, `lc-jrn`, `lc-promo__video`, `lc-widgets__video`, `lc-footer__store`, `lc-footer__badge` | `sections/features.tsx:16`; `sections/story.tsx:132`; `sections/showcase.tsx:17,30,38`; `sections/closing.tsx:63-66`; `sections/footer.tsx:55-56` | Metadata only (class attributes)                                                       | None needed, or rename                                              | No                                |

- **Kept, names no trade:**
  - The rail's screen-reader label "Highlights" (`sections/features.tsx:17`).
  - "© {year} {legal name}. All rights reserved." (`sections/footer.tsx:82`).
  - The Pexels credit.

#### 4. Structures [S]

| Id     | Content it needs                                                                                                                                 | Where                                                                        | Limits the code shows                                                                                                                                                                                |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| t10-S1 | The main picture inside a drawn phone. It needs a picture that reads on a 0.46:1 screen.                                                         | `sections/hero.tsx:46-66`; `lucent.css:627-637`; `sections/phone-frame.webp` | Measured at 0.46:1 at all 37 widths, with object-fit cover. A 3:2 picture shows 31% of its width, and Pexels is searched landscape only (`lib/images/pexels.ts:23`). Owner decision 2 (ADR 0043:46). |
| t10-S2 | A notice the business sends a customer: a title of 8 to 28 characters, a line of 16 to 40 with no times or dates, and a time word with no digits | `sections/story.tsx:98-121`; `contract.ts:152-158`; `copy-slots.ts:194-196`  | The guide calls it "a phone notification". The fallback fills it for any business: "A note from {name}", "Your message has reached us.", "now" (`contract.ts:428-432`).                              |
| t10-S3 | Four feature cards in a sideways rail: the brief's three points and its statement, each with a two-line heading                                  | `contract.ts:163-168`; `sections/features.tsx:14-60`                         | Fits the brief's 3 points plus a statement (`lib/ai/prompts.ts:33,35`). The fourth card's heading is drawn as dots until a tap (see 8).                                                              |
| t10-S4 | Three lines of 4 to 15 characters each, "a rhythm of three", the last in the accent                                                              | `contract.ts:148-149`; `copy-slots.ts:189`                                   | Fixed at three (`contract.ts:100`)                                                                                                                                                                   |
| t10-S5 | Three numbered steps as pills beside a tall picture                                                                                              | `sections/story.tsx:128-155`                                                 | Fits the brief's three steps                                                                                                                                                                         |
| t10-S6 | 13 pictures below the hero, all of which render                                                                                                  | `index.tsx:33-44,55-68`; `contract.ts:507-522`                               | All of them draw from one detail pool (`lib/images/plan.ts:31-33`)                                                                                                                                   |
| t10-S7 | An email form and three inviting lines of 2 to 14 characters, set on a picture                                                                   | `sections/closing.tsx:63-110`; `contract.ts:186-195`                         | Text covers 27% to 68% of the picture (see 6)                                                                                                                                                        |

#### 5. Content demand

| Item                | Count                                                                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Distinct offerings  | No list. There are 2 to 4 pills, "each one thing they offer" (`contract.ts:185`; `copy-slots.ts:240`), and 3 ticked lines (`contract.ts:146`).      |
| Points              | 4 cards: the 3 value props plus the statement. No padding.                                                                                          |
| Steps               | 3 pills plus one paragraph                                                                                                                          |
| Questions           | 3 to 5 (`copy-slots.ts:239`)                                                                                                                        |
| Paragraphs          | 11 of 60 to 260 characters (`copy-slots.ts:186-212`): at least 1,070 characters and at most 2,370, plus 3 to 5 answers of 40 to 320 characters each |
| Fixed heading lines | 19 (`contract.ts:98-110`)                                                                                                                           |
| Pictures            | 14, all of which render                                                                                                                             |

- **Fallback repetition** (`contract.ts:376-502`):
  - The positioning sentence fills 7 places: `:407,414,427,458,465,475,480`.
  - The audience fills 3 places: `:422,453,466`.
- **Not measurable:** the fallback rate, retries, and the shortest and longest fixtures. There are no stored runs.

#### 6. Slots

The poster shows `imageSlots[0]` (`lib/preview/status.ts:49`), which for Lucent is the picture inside the phone. No slot's shape implies people.

| Slot                            | Role and shape (measured)                                                                                                                                                    | Text over it                                                                                               | Empty state                                                           |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| hero                            | Main picture inside a drawn phone, 0.46:1. 263x569 at 358, 423x915 from 639 to 900, 387x837 from 901 to 960 and at 1440 to 1920, 320x692 at 961 to 962, 340x737 around 1024. | None. The frame and a tint sit over it.                                                                    | A muted block inside the frame (`lucent.css:636`)                     |
| promo                           | Wide picture that grows near the top, 16:9 at every width                                                                                                                    | None                                                                                                       | Muted placeholder block (`sections/ui.tsx:106`; `lucent.css:162-165`) |
| overview, breakdown             | Pictures beside text, 4:3. Both are parallax.                                                                                                                                | None                                                                                                       | Placeholder                                                           |
| reminder                        | Picture under the notice, 1.5:1, at most 760x506 from 859 px                                                                                                                 | The notice covers 23%. The alt text is forced empty (`sections/story.tsx:103`).                            | Placeholder                                                           |
| steps                           | Tall picture beside the steps, 0.76:1                                                                                                                                        | None                                                                                                       | Placeholder                                                           |
| feature-1, feature-2, feature-4 | A window that runs past the card's foot. 1:1 up to 640 px, 0.83:1 (5:6) from 641 px. Inside a sideways rail.                                                                 | None                                                                                                       | Placeholder                                                           |
| feature-3                       | Framed tile, 1:1 at every width                                                                                                                                              | None                                                                                                       | Placeholder                                                           |
| widgets                         | Wide picture under the page's tint, 16:9. 460x259 from 559 to 900, 860x484 from 959.                                                                                         | None                                                                                                       | Placeholder                                                           |
| pair-1, pair-2                  | Two tall pictures side by side, 0.56:1 (9:16)                                                                                                                                | None                                                                                                       | Placeholder                                                           |
| journal                         | Picture card, 16:9, but square from 700 to 899 px                                                                                                                            | Three lines and the email form cover 27% to 68%. The alt text is forced empty (`sections/closing.tsx:68`). | Placeholder                                                           |

- **Seams:**

  | Width (px) | Change                                                             |
  | ---------- | ------------------------------------------------------------------ |
  | 560 to 561 | The hero shrinks                                                   |
  | 640 to 641 | Feature windows go from 1:1 to 5:6                                 |
  | 699 to 700 | The journal becomes square                                         |
  | 899 to 900 | The journal returns to 16:9                                        |
  | 900 to 901 | Two columns begin: the steps picture goes from 810x1061 to 383x501 |
  | 960 to 961 | The overview, breakdown and features shrink                        |

- **Visitor's own photographs:** with 1, 3 or 6, the number of slots left empty is 13, 11 or 8 of 14 (`lib/images/plan.ts:25-30`).

#### 7. Tone and description words

| Word                                          | Where        | Names a business                                                                 | Proposed feel word (owner decides, decision 12)       |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------- | ----------------------------------------------------- |
| "product"                                     | `meta.ts:12` | Yes                                                                              | "polished"                                            |
| "warm"                                        | `meta.ts:12` | No. It is a feel, and also a look's name (`app/preview/_components/fonts.ts:28`) | Keep                                                  |
| "glassy"                                      | `meta.ts:12` | No                                                                               | Keep                                                  |
| "a phone whose screen holds the main picture" | `meta.ts:7`  | It implies an app                                                                | "a tall framed screen", if decision 2 keeps the frame |
| "a pricing switch with rolling numbers"       | `meta.ts:7`  | It describes plans that a visitor's page never shows (`contract.ts:318`)         | Drop it                                               |

#### 8. Defects

1. The fourth card's heading carries the statement, but when motion is allowed it is a drifting cloud of dots until a tap or focus. The real heading is at opacity 0 until then (`sections/particles.ts:3-9`; `lucent.css:1196`). Under reduced motion it is shown whole (`particles.ts:50-55`).
2. Text sits over two content pictures whose alt text is forced empty (see 6). No contrast pair covers that text, and its contrast is not verified.
3. The description names pricing that never shows (`meta.ts:7`).
4. Step pills are keyed by their text (`sections/story.tsx:139`). Two equal steps would share a key. The effect is not verified.
5. The fallback repeats the positioning 7 times (see 5).

#### 9. Provenance

- **Source:** subscrr.app, the site of the owner's own iPhone app (ADR 0043:12; `THIRD_PARTY_NOTICES.md:83`).
- **It explains:**
  - The phone frame (`sections/hero.tsx:10-12`).
  - The envelope in the Apple logo's place.
  - The notice card. The example's notice is "Subscription Reminder" (`example/content.ts:88`).
  - The names `widgets` and `journal` (ADR 0043:18).
  - The `lc-*` class names.
  - The pricing and the "Beta" badge, which are null on a visitor's page (`copy-slots.ts:14-19`).
  - The App Store badge, now a pill, and the QR card, which was dropped (ADR 0043:29).

### Measured slot geometry

I measured this on 2 October 2026 in headless Chromium (Playwright), on the worktree's dev server (http://localhost:3101, branch docs/template-fit-plan at b711770). Pages were /examples/<name>, with reducedMotion set to reduce. The scripts and raw output are in test-results/template-fit/:

- slotgeo.mjs runs the measurements.
- slotgeo-page.js does the measuring inside the page.
- slotgeo-specs.mjs maps each slot to its element.
- slotgeo-examples-<name>.json holds the raw results, one file per template.
- slotgeo-visitor.json, slotgeo-visitor-check.json and slotgeo-visitor-text.json hold the visitor-page results.
- slotgeo-summarise.mjs and slotgeo-final.mjs build these tables.

How it was measured:

- **Loading:** each page was loaded and scrolled top to bottom in half-screen steps, so every block had entered. It was then returned to the top. Lucent got 1.8 s for its splash.
- **Mapping:** each slot name was followed through the template's assemble function in contract.ts to its content field. From there it went to the picture the example page puts in that field. The element was found on the page by that file name, in the img src or the CSS background. Where a file repeats, a selector picks the right copy (listed under each table).
- **Test picture:** before measuring, every slot's picture was swapped in the browser for a 600x400 (3:2) test picture. So a box that follows its picture's shape shows what a 3:2 landscape photograph gets.
- **Reading a cell:** rendered box in CSS px (ratio), then fit, share, text over, then any layer over it.
  - "own ratio": the box takes the picture's shape.
  - "contain": the picture is shown whole inside a box of another shape.
  - "CSS bg": the picture is a CSS background image.
  - "drawn": the picture is drawn on a WebGL canvas.
  - "WxH visible": the part left after a parent box clips it.
- **Share:** the part of a 3:2 photograph's area still visible after the fit, the slot's rounded corners and every clipping parent. It was counted on a 40x40 grid of sample points over the picture.
- **Text over:** text whose line boxes cross the visible picture and are painted above it (checked with document.elementsFromPoint at each line).
  - "+ controls" means links, buttons or fields are painted above it.
  - Fixed or sticky bars count only for slots at the top of the page.
- **Layers:** elements painted above the picture that cover at least 10% of it: a gradient scrim, a tint, a frosted or solid card, or a drawing. "N% opacity" is the picture's own opacity.
- **Widths:** 390x844, 768x1024, 1024x768, 1440x900 and 1920x1080.
- **Seams:**
  - Every Tailwind breakpoint (640, 768, 1024, 1280, 1536) at minus and plus 1 px, for all ten templates.
  - Inegro's own media queries (580, 782, 1220, in inegro.css) and Lucent's (359, 460, 560, 600, 700, 860, 900, 960, in lucent.css).
  - All seams were measured 900 px tall.
  - The other templates' own media queries do not touch a slot: monolith.css:44,61 (a glow), atlas.css:20 (a gradient), t07 nav.tsx:41 (the bar), t05 booking.tsx:30 max-md (no slot).
  - A seam row is listed only when one of these changes: visibility, fit, text, a layer, or the cut. It is also listed when the ratio moves by more than 10%, or the share by more than 10 points.
- **Visitor pages:** I checked one stored l6-all-fixes pair per ready template, at the five widths. They draw no pictures, so each line records the empty state. For slots that carry text, I painted a test picture into the empty box to record what sits on it (slotgeo-visitor-text.json).

#### Aurora (t01)

| Slot             | 390                                                      | 768                                                         | 1024                                                         | 1440                                                         | 1920                                                         | Role and shape                                                                                                                                                                                                                                 |
| ---------------- | -------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| hero (window)    | 335x251 (4:3) cover, 320x71 visible, 23%, text over: no  | 430x323 (4:3) cover, 430x34 visible, 9%, text over: no      | 240x196 (1.22:1) cover, 80%, text over: no                   | 240x196 (1.22:1) cover, 80%, text over: no                   | 240x196 (1.22:1) cover, 80%, text over: no                   | Small picture inside the drawn window: under its three rows below lg, and in a 15rem column beside them from lg. Below lg the window's clip (22rem, 20rem from md) leaves only a strip. Rounded 12 px. product-frame.tsx:75-83, hero.tsx:47-48 |
| statement (band) | 390x591 (2:3) cover, 45%, text over: yes, gradient scrim | 768x717 (1.07:1) cover, 70%, text over: yes, gradient scrim | 1024x538 (1.90:1) cover, 80%, text over: yes, gradient scrim | 1440x630 (2.29:1) cover, 65%, text over: yes, gradient scrim | 1920x756 (2.54:1) cover, 60%, text over: yes, gradient scrim | Full-width backdrop at least 70svh tall, with one large sentence on it over a gradient scrim. statement.tsx:19-37                                                                                                                              |

Breakpoint seams (900 px tall; only slots that change):

| Breakpoint | Slot          | At bp-1                                                 | At bp+1                                                |
| ---------- | ------------- | ------------------------------------------------------- | ------------------------------------------------------ |
| 768        | hero (window) | 677x508 (4:3) cover, 677x70 visible, 14%, text over: no | 431x323 (4:3) cover, 431x34 visible, 9%, text over: no |
| 1024       | hero (window) | 685x514 (4:3) cover, 685x33 visible, 7%, text over: no  | 240x196 (1.22:1) cover, 80%, text over: no             |

Mapping: hero = content.hero.image (templates/t01-aurora/contract.ts:156), example picture gauge.webp. statement = statement.image (:160), example picture radiator.webp.

Visitor page (l6-all-fixes/architects, model copy): no picture is drawn.

- hero is omitted. From 1024 the window keeps an empty 240 px column beside the rows (grid 558px 240px at 1440).
- statement: the band stays (390x592, 768x718, 1024x539, 1440x631, 1920x757), with a glow and the sentence on the page colour (statement.tsx:15-16).

#### Monolith (t02)

| Slot                               | 390                                          | 768                                                             | 1024                                                            | 1440                                                            | 1920                                                            | Role and shape                                                                                                       |
| ---------------------------------- | -------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| about (beside text)                | 292x195 (3:2) contain, 100%, text over: no   | 300x200 (3:2) shown whole in a 300x516 box, 100%, text over: no | 300x200 (3:2) shown whole in a 300x296 box, 100%, text over: no | 300x200 (3:2) shown whole in a 300x240 box, 100%, text over: no | 300x200 (3:2) shown whole in a 300x240 box, 100%, text over: no | Picture beside the company paragraph (under it below md), 300 px wide, shown whole. Rounded 8 px. about.tsx:16-24    |
| services (beside cards)            | 300x200 (3:2) contain, 100%, text over: no   | 500x333 (3:2) contain, 100%, text over: no                      | 472x315 (3:2) contain, 100%, text over: no                      | 600x400 (3:2) contain, 100%, text over: no                      | 600x400 (3:2) contain, 100%, text over: no                      | Large picture beside the cards, 300/500/600 px wide, shown whole. services.tsx:45-53                                 |
| feature-1 to feature-3 (card foot) | 200x133 (3:2) own ratio, 100%, text over: no | 200x133 (3:2) own ratio, 100%, text over: no                    | 254x169 (3:2) own ratio, 100%, text over: no                    | 300x200 (3:2) own ratio, 100%, text over: no                    | 300x200 (3:2) own ratio, 100%, text over: no                    | Small picture at the foot of each of three cards, 200/300 px wide, own shape. features.tsx:35-44                     |
| quote (hero card avatar)           | hidden                                       | hidden                                                          | 40x40 (1:1) cover, 52%, text over: no                           | 40x40 (1:1) cover, 52%, text over: no                           | 40x40 (1:1) cover, 52%, text over: no                           | 40 px circle beside the name on a floating card, lg only. An avatar position. hero-cards.tsx:29-32, avatar.tsx:26-41 |
| profile (hero card avatar)         | hidden                                       | hidden                                                          | 96x96 (1:1) cover, 52%, text over: no                           | 96x96 (1:1) cover, 52%, text over: no                           | 96x96 (1:1) cover, 52%, text over: no                           | 96 px circle over the top edge of a floating card, lg only. An avatar position. hero-cards.tsx:45-50                 |

Breakpoint seams (900 px tall; only slots that change):

| Breakpoint | Slot                       | At bp-1                                                         | At bp+1                                                         |
| ---------- | -------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------- |
| 768        | about (beside text)        | 300x200 (3:2) contain, 100%, text over: no                      | 300x200 (3:2) shown whole in a 300x516 box, 100%, text over: no |
| 1024       | about (beside text)        | 300x200 (3:2) shown whole in a 300x404 box, 100%, text over: no | 300x200 (3:2) shown whole in a 300x296 box, 100%, text over: no |
| 1024       | quote (hero card avatar)   | hidden                                                          | 40x40 (1:1) cover, 52%, text over: no                           |
| 1024       | profile (hero card avatar) | hidden                                                          | 96x96 (1:1) cover, 52%, text over: no                           |

Mapping:

- quote and profile = hero.cards (templates/t02-monolith/contract.ts:245-246), example portraits pravatar-35 and pravatar-58. The same portraits repeat in #testimonials and #team, so the selector excludes those sections.
- about (:263) = pilot.png. feature-1 to 3 (:270-272) = looking-ahead, reflecting and growth. services (:279) = cube-leg.png.

Visitor page (l6-all-fixes/a1-gas):

- about, services and feature-1 to 3 are omitted (no element; the sections are present).
- quote and profile are muted circles with initials, 40 and 96 px, at 1024 and up only (avatar.tsx:27-33).

#### Meridian (t03)

| Slot              | 390                                                                  | 768                                                                  | 1024                                                                 | 1440                                                                  | 1920                                          | Role and shape                                                                                                                           |
| ----------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| hero (under hero) | 342x230 (3:2) own ratio, 100%, text over: no, gradient fade over 35% | 720x482 (3:2) own ratio, 100%, text over: no, gradient fade over 23% | 976x652 (3:2) own ratio, 100%, text over: no, gradient fade over 18% | 1200x802 (3:2) own ratio, 100%, text over: no, gradient fade over 15% | 1200x802 (3:2) own ratio, 100%, text over: no | Wide picture under the hero words, full width up to 1200 px, own shape. A fade into the page covers its foot (80/112 px). hero.tsx:53-66 |
| hero (nav menu)   | not shown                                                            | not shown                                                            | 274x262 (1.05:1) cover, 70%, text over: no                           | 274x262 (1.05:1) cover, 70%, text over: no                            | 274x262 (1.05:1) cover, 70%, text over: no    | The same picture as a near-square tile in the desktop menu panel, shown on hover or focus, lg only. nav.tsx:39-53, meridian.css:59-76    |

Breakpoint seams (900 px tall; only slots that change):

| Breakpoint | Slot            | At bp-1   | At bp+1                                    |
| ---------- | --------------- | --------- | ------------------------------------------ |
| 1024       | hero (nav menu) | not shown | 274x262 (1.05:1) cover, 70%, text over: no |

Mapping: the hero slot is drawn twice, under the hero (templates/t03-meridian/contract.ts:212) and in the desktop menu (:204). The example page gives the menu a different picture, so I found the menu copy by selector (.meridian-menu img) and opened the menu by focusing its link.

Visitor page (l6-all-fixes/architects):

- hero is omitted. Its wrapper measures 0x0, so its glow and fade show nothing (hero.tsx:53-66).
- The menu copy is a muted block, 274x262, lg only (nav.tsx:43-44).

#### Atlas (t04)

| Slot               | 390                                          | 768                                          | 1024                                                         | 1440                                                         | 1920                                                         | Role and shape                                                                                                    |
| ------------------ | -------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| hero (split)       | hidden                                       | 704x469 (3:2) own ratio, 100%, text over: no | 468x312 (3:2) own ratio, 468x296 visible, 95%, text over: no | 676x451 (3:2) own ratio, 676x435 visible, 98%, text over: no | 916x611 (3:2) own ratio, 916x595 visible, 98%, text over: no | Right half of the split hero from sm, own shape; not shown below 640. Top 16 px cut at lg (-mt-4). hero.tsx:58-72 |
| pitch (phone copy) | 358x239 (3:2) own ratio, 100%, text over: no | hidden                                       | hidden                                                       | hidden                                                       | hidden                                                       | The same slot drawn above the pitch, below 640 only. pitch.tsx:15-31                                              |
| pitch (wide copy)  | hidden                                       | 669x446 (3:2) own ratio, 100%, text over: no | 468x312 (3:2) own ratio, 468x296 visible, 95%, text over: no | 669x446 (3:2) own ratio, 669x430 visible, 98%, text over: no | 669x446 (3:2) own ratio, 669x430 visible, 98%, text over: no | Beside the pitch from 640, own shape; top 16 px cut from lg (-mt-4). pitch.tsx:23,96                              |
| offer (column)     | 340x227 (3:2) own ratio, 100%, text over: no | 669x446 (3:2) own ratio, 100%, text over: no | 523x348 (3:2) own ratio, 100%, text over: no                 | 753x502 (3:2) own ratio, 100%, text over: no                 | 1019x679 (3:2) own ratio, 100%, text over: no                | Picture in a 7/12 column beside the offer, own shape. offer.tsx:18-27                                             |
| tools (phone copy) | 358x239 (3:2) own ratio, 100%, text over: no | hidden                                       | hidden                                                       | hidden                                                       | hidden                                                       | The same slot drawn above the tools text, below 640 only. tools.tsx:14-32                                         |
| tools (wide copy)  | hidden                                       | 720x480 (3:2) own ratio, 100%, text over: no | 476x317 (3:2) own ratio, 100%, text over: no                 | 684x456 (3:2) own ratio, 100%, text over: no                 | 924x616 (3:2) own ratio, 100%, text over: no                 | Beside the tools text in a tinted band from 640, own shape. tools.tsx:56                                          |
| why (half)         | 326x217 (3:2) own ratio, 100%, text over: no | 704x469 (3:2) own ratio, 100%, text over: no | 468x312 (3:2) own ratio, 100%, text over: no                 | 676x451 (3:2) own ratio, 100%, text over: no                 | 916x611 (3:2) own ratio, 100%, text over: no                 | Left half beside the list, own shape. why.tsx:16-26                                                               |
| faq (half)         | 358x239 (3:2) own ratio, 100%, text over: no | 704x469 (3:2) own ratio, 100%, text over: no | 468x312 (3:2) own ratio, 100%, text over: no                 | 676x451 (3:2) own ratio, 100%, text over: no                 | 916x611 (3:2) own ratio, 100%, text over: no                 | Left half beside the questions, own shape. faq.tsx:19-29                                                          |

Breakpoint seams (900 px tall; only slots that change):

| Breakpoint | Slot               | At bp-1                                      | At bp+1                                                      |
| ---------- | ------------------ | -------------------------------------------- | ------------------------------------------------------------ |
| 640        | hero (split)       | hidden                                       | 577x385 (3:2) own ratio, 100%, text over: no                 |
| 640        | pitch (phone copy) | 607x405 (3:2) own ratio, 100%, text over: no | hidden                                                       |
| 640        | pitch (wide copy)  | hidden                                       | 577x385 (3:2) own ratio, 100%, text over: no                 |
| 640        | tools (phone copy) | 607x405 (3:2) own ratio, 100%, text over: no | hidden                                                       |
| 640        | tools (wide copy)  | hidden                                       | 593x395 (3:2) own ratio, 100%, text over: no                 |
| 1024       | hero (split)       | 959x639 (3:2) own ratio, 100%, text over: no | 469x312 (3:2) own ratio, 469x296 visible, 95%, text over: no |
| 1024       | pitch (wide copy)  | 669x446 (3:2) own ratio, 100%, text over: no | 469x312 (3:2) own ratio, 469x296 visible, 95%, text over: no |

Mapping:

- hero (templates/t04-atlas/contract.ts:220) = hero-image.webp; pitch (:231) = buy-and-trade; offer (:239) = nefa-cc; tools (:246) = advanced-trading-tools; why (:248) = industry-leading-security; faq (:257) = faq.
- pitch and tools are each drawn twice. The two copies are told apart by their sm:hidden and sm:block wrappers (pitch.tsx:31,96; tools.tsx:32,56).

Visitor page (l6-all-fixes/a1-gas): all six slots are omitted (no element). Every section is present.

#### Ember (t05)

| Slot                              | 390                                                                                  | 768                                                                                  | 1024                                                                                 | 1440                                                                                  | 1920                                                                                  | Role and shape                                                                                                                                                                                                 |
| --------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| hero (backdrop)                   | 390x844 (1:2.16) cover (CSS bg), 30%, text over: yes + controls                      | 768x1024 (3:4) cover (CSS bg), 50%, text over: yes + controls                        | 1024x768 (4:3) cover (CSS bg), 90%, text over: yes + controls                        | 1440x900 (1.60:1) cover (CSS bg), 95%, text over: yes + controls                      | 1920x1080 (16:9) cover (CSS bg), 85%, text over: yes + controls                       | Full-screen CSS background. The bar, eyebrow, headline, line and button sit straight on it, with no scrim. hero.tsx:13-18                                                                                      |
| about (beside text)               | 342x228 (3:2) cover, 100%, text over: no                                             | 221x374 (1:1.69) cover, 40%, text over: no                                           | 280x326 (1:1.16) cover, 55%, text over: no                                           | 387x326 (6:5) cover, 80%, text over: no                                               | 446x326 (1.37:1) cover, 90%, text over: no                                            | Rounded (24 px) picture beside the about words. Below md the box follows the picture's shape. From md it sits in the row at 326 to 374 px tall and 221 to 446 px wide, tall and narrow at 768. about.tsx:18-28 |
| features (beside rows)            | 342x444 (1:1.30) cover, 50%, text over: no                                           | 294x444 (2:3) cover, 45%, text over: no                                              | 371x444 (5:6) cover, 55%, text over: no                                              | 384x444 (1:1.16) cover, 60%, text over: no                                            | 384x444 (1:1.16) cover, 60%, text over: no                                            | Tall rounded (24 px) picture, 444 px high, beside the three rows. features.tsx:48-58                                                                                                                           |
| timing (band behind card)         | 342x650 (1:1.90) cover (CSS bg), 35%, text over: yes + controls, solid card over 69% | 672x650 (1.03:1) cover (CSS bg), 70%, text over: yes + controls, solid card over 39% | 832x650 (1.28:1) cover (CSS bg), 85%, text over: yes + controls, solid card over 31% | 1024x650 (1.58:1) cover (CSS bg), 95%, text over: yes + controls, solid card over 26% | 1024x650 (1.58:1) cover (CSS bg), 95%, text over: yes + controls, solid card over 26% | Wide rounded (24 px) CSS background, 650 px tall, under a solid card of words and a button. timing.tsx:13-21                                                                                                   |
| dish-1 to dish-8 (grid)           | 120x120 (1:1) cover, 65%, text over: no                                              | 114x140 (1:1.23) cover, 55%, text over: no                                           | 140x140 (1:1) cover, 65%, text over: no                                              | 140x140 (1:1) cover, 65%, text over: no                                               | 140x140 (1:1) cover, 65%, text over: no                                               | Small square, one per offering, 120/140 px, square corners (the empty state is a disc). dishes.tsx:29-39                                                                                                       |
| dish-1 to dish-4 (closing corner) | 80x80 (1:1) cover, 52%, text over: no                                                | 112x112 (1:1) cover, 52%, text over: no                                              | 140x140 (1:1) cover, 52%, text over: no                                              | 140x140 (1:1) cover, 52%, text over: no                                               | 140x140 (1:1) cover, 52%, text over: no                                               | Circle in a corner of the closing band, 80/112/140 px, repeating the first four item pictures. cta.tsx:10-15,27-39                                                                                             |

Breakpoint seams (900 px tall; only slots that change):

| Breakpoint | Slot                      | At bp-1                                                                              | At bp+1                                                                              |
| ---------- | ------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| 768        | about (beside text)       | 548x365 (3:2) cover, 100%, text over: no                                             | 222x374 (1:1.68) cover, 40%, text over: no                                           |
| 768        | features (beside rows)    | 384x444 (1:1.16) cover, 60%, text over: no                                           | 295x444 (2:3) cover, 45%, text over: no                                              |
| 768        | timing (band behind card) | 719x650 (1.11:1) cover (CSS bg), 75%, text over: yes, solid card over 35%            | 673x650 (1.04:1) cover (CSS bg), 70%, text over: yes + controls, solid card over 39% |
| 768        | dish-1 to dish-8 (grid)   | 120x120 (1:1) cover, 65%, text over: no                                              | 114x140 (1:1.23) cover, 55%, text over: no                                           |
| 1024       | about (beside text)       | 316x326 (1:1.03) cover, 65%, text over: no                                           | 281x326 (1:1.16) cover, 55%, text over: no                                           |
| 1024       | timing (band behind card) | 927x650 (1.43:1) cover (CSS bg), 95%, text over: yes + controls, solid card over 28% | 833x650 (1.28:1) cover (CSS bg), 85%, text over: yes + controls, solid card over 31% |
| 1280       | about (beside text)       | 375x326 (1.15:1) cover, 75%, text over: no                                           | 328x326 (1:1) cover, 65%, text over: no                                              |

Mapping:

- hero = CSS background (templates/t05-ember/contract.ts:205), hero-banner.png.
- about (:208) = about.png. I excluded the location thumbnail, which a visitor page never draws (location: null, :208).
- dish-N (:215) = dish-N.png in #dishes. dish-1 to 4 appear again in #cta (index.tsx:58).
- features (:222) = chef.png. timing = CSS background (:231), restro-timing.png.

Visitor page (l6-all-fixes/joinery):

- hero is the full-screen section with no background (390x844 to 1920x1080). The bar, eyebrow, headline, line and button still sit where the picture would be.
- about is a muted block, 342x269 at 390. From 768 it is 0 px wide, so nothing shows (about.tsx:19).
- features is a muted block 0 px wide at all five widths, so nothing shows (features.tsx:49).
- timing is a muted band, 342x650 to 1024x650, under the card. The card has a heading, a line and a button; the opening rows are not drawn (contract.ts:233).
- dish-1 to 4 are muted discs, 120 px at 390 and 140 px from 768.
- dish-5 to 8 are not drawn: the copy has 4 items, as do all 7 Ember answers in l6.
- The corner pictures are omitted.

#### Harbor (t06)

| Slot                | 390                                                                                           | 768                                                                                           | 1024                                                                                           | 1440                                                                                           | 1920                                                                                        | Role and shape                                                                                                                                                                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| hero (backdrop)     | 390x952 (1:2.44) cover, 25%, text over: yes + controls, gradient scrim, 40% opacity           | 768x1024 (3:4) cover, 50%, text over: yes + controls, gradient scrim, 40% opacity             | 1024x809 (5:4) cover, 85%, text over: yes + controls, gradient scrim, 40% opacity              | 1440x900 (1.60:1) cover, 95%, text over: yes + controls, gradient scrim, 40% opacity           | 1920x1080 (16:9) cover, 85%, text over: yes + controls, gradient scrim, 40% opacity         | Full-screen backdrop at 40% opacity, under a gradient from the page colour on the left. The bar, headline, buttons and stats sit on it. hero.tsx:22-32                                                                                           |
| about (beside text) | 326x600 (1:1.84) cover, 35%, text over: example badge only, gradient scrim                    | 640x600 (1.07:1) cover, 70%, text over: example badge only, gradient scrim                    | 336x700 (1:2.08) cover, 30%, text over: example badge only, gradient scrim                     | 483x700 (1:1.45) cover, 45%, text over: example badge only, gradient scrim                     | 483x700 (1:1.45) cover, 45%, text over: example badge only, gradient scrim                  | Tall rounded (16 px) picture beside the about words, 600 px high (700 from lg), with a gradient over its foot. The example draws a badge on it; a visitor page has none (contract.ts:236), and I measured no text over it there. about.tsx:28-40 |
| cta (band)          | 390x902 (1:2.31) cover, 30%, text over: yes + controls, gradient scrim, 70% tint, 20% opacity | 768x694 (1.11:1) cover, 75%, text over: yes + controls, gradient scrim, 70% tint, 20% opacity | 1024x634 (1.62:1) cover, 95%, text over: yes + controls, gradient scrim, 70% tint, 20% opacity | 1440x634 (2.27:1) cover, 65%, text over: yes + controls, gradient scrim, 70% tint, 20% opacity | 1920x634 (3:1) cover, 50%, text over: yes + controls, gradient scrim, 70% tint, 20% opacity | Full-width backdrop at 20% opacity, under a 70% page-colour tint and a gradient. Centred words and buttons sit on it. cta.tsx:15-26                                                                                                              |

Breakpoint seams (900 px tall; only slots that change):

| Breakpoint | Slot                | At bp-1                                                                  | At bp+1                                                                    |
| ---------- | ------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| 768        | about (beside text) | 703x600 (1.17:1) cover, 80%, text over: no, gradient scrim               | 641x600 (1.07:1) cover, 70%, text over: example badge only, gradient scrim |
| 1024       | about (beside text) | 895x600 (3:2) cover, 100%, text over: example badge only, gradient scrim | 336x700 (1:2.08) cover, 30%, text over: example badge only, gradient scrim |

Mapping: hero (templates/t06-harbor/contract.ts:234), about (:236) and cta (:255) = example pictures unsplash-1534438327276, unsplash-1571019614242 and unsplash-1517836357463 (example/content.ts:59,74,349).

Visitor page (l6-all-fixes/a1-gas):

- hero is omitted. The gradient stays over the page colour, and the bar, headline, buttons and stats sit there.
- about is an accent block (326x600, 640x600, 336x700, 483x700, 483x700) under the gradient, with no text over it.
- cta is omitted; the tint and gradient stay.

#### Summit (t07)

| Slot                            | 390                                                                | 768                                                           | 1024                                                          | 1440                                                             | 1920                                                            | Role and shape                                                                                                                                                          |
| ------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| hero (backdrop)                 | 390x844 (1:2.16) cover (CSS bg), 30%, text over: yes + controls    | 768x1024 (3:4) cover (CSS bg), 50%, text over: yes + controls | 1024x768 (4:3) cover (CSS bg), 90%, text over: yes + controls | 1440x900 (1.60:1) cover (CSS bg), 95%, text over: yes + controls | 1920x1080 (16:9) cover (CSS bg), 85%, text over: yes + controls | Full-screen CSS background. The bar, badge, headline, line and buttons sit straight on it, with no scrim. hero.tsx:16-24                                                |
| why (beside reasons)            | 342x320 (1.07:1) cover, 70%, text over: no                         | 672x384 (1.75:1) cover, 85%, text over: no                    | 289x462 (1:1.60) cover, 40%, text over: no                    | 375x462 (4:5) cover, 55%, text over: no                          | 375x462 (4:5) cover, 55%, text over: no                         | Rounded (12 px) picture between the reason cards; wide below lg, tall from lg. why.tsx:57-67                                                                            |
| cta (closing band)              | hidden                                                             | hidden                                                        | 493x329 (3:2) cover, 100%, text over: no                      | 493x329 (3:2) cover, 100%, text over: no                         | 493x329 (3:2) cover, 100%, text over: no                        | Picture standing at the right of the closing band, 493 px wide, lg only. cta.tsx:52-62                                                                                  |
| service-1 to service-6 (row)    | 294x256 (1.15:1) cover, 75%, text over: no                         | 312x448 (1:1.44) cover, 45%, text over: no                    | 424x448 (1:1.06) cover, 65%, text over: no                    | 579x448 (1.29:1) cover, 85%, text over: no                       | 579x448 (1.29:1) cover, 85%, text over: no                      | Rounded (12 px) picture beside each offering row, one per offering; wide on phones, tall at md. services.tsx:58-68                                                      |
| facility-1 (grid)               | 342x300 (1.14:1) cover, 75%, text over: yes, frosted card over 50% | 385x379 (1.02:1) cover, 70%, text over: no                    | 516x379 (1.36:1) cover, 90%, text over: no                    | 665x379 (16:9) cover, 85%, text over: no                         | 665x379 (16:9) cover, 85%, text over: no                        | Rounded (16 px) tile in a 7/5 grid from md, one per item. A frosted caption panel with the item's title sits on it below md, and on hover from md. facilities.tsx:31-46 |
| facility-2 to facility-3 (grid) | 342x300 (1.14:1) cover, 75%, text over: yes, frosted card over 50% | 271x379 (1:1.40) cover, 50%, text over: no                    | 364x379 (1:1.04) cover, 65%, text over: no                    | 471x379 (5:4) cover, 85%, text over: no                          | 471x379 (5:4) cover, 85%, text over: no                         | As facility-1, in the 5-column cells.                                                                                                                                   |
| facility-4 (grid)               | 342x300 (1.14:1) cover, 75%, text over: yes, frosted card over 50% | 385x379 (1.02:1) cover, 70%, text over: no                    | 516x379 (1.36:1) cover, 90%, text over: no                    | 665x379 (16:9) cover, 85%, text over: no                         | 665x379 (16:9) cover, 85%, text over: no                        | As facility-1, in the 7-column cell.                                                                                                                                    |

Breakpoint seams (900 px tall; only slots that change):

| Breakpoint | Slot                            | At bp-1                                                                       | At bp+1                                                                       |
| ---------- | ------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 640        | why (beside reasons)            | 448x320 (1.40:1) cover, 95%, text over: no                                    | 448x384 (1.17:1) cover, 80%, text over: no                                    |
| 640        | service-1 to service-6 (row)    | 543x256 (2.12:1) cover, 70%, text over: no                                    | 545x320 (1.70:1) cover, 90%, text over: no                                    |
| 640        | facility-1 (grid)               | 591x300 (1.97:1) cover, 75%, text over: yes, frosted card over 67%            | 593x340 (1.74:1) cover, 85%, text over: yes + controls, frosted card over 60% |
| 640        | facility-2 (grid)               | 591x300 (1.97:1) cover, 75%, text over: yes, frosted card over 33%            | 593x340 (1.74:1) cover, 85%, text over: yes + controls, frosted card over 55% |
| 640        | facility-3 to facility-4 (grid) | 591x300 (1.97:1) cover, 75%, text over: yes, frosted card over 67%            | 593x340 (1.74:1) cover, 85%, text over: yes + controls, frosted card over 60% |
| 768        | why (beside reasons)            | 448x384 (1.17:1) cover, 80%, text over: no                                    | 672x384 (1.75:1) cover, 85%, text over: no                                    |
| 768        | service-1 to service-6 (row)    | 671x320 (2.10:1) cover, 70%, text over: no                                    | 313x448 (1:1.43) cover, 45%, text over: no                                    |
| 768        | facility-1 (grid)               | 719x340 (2.11:1) cover, 70%, text over: yes + controls, frosted card over 61% | 386x379 (1.02:1) cover, 70%, text over: no                                    |
| 768        | facility-2 (grid)               | 719x340 (2.11:1) cover, 70%, text over: yes + controls, frosted card over 54% | 271x379 (1:1.40) cover, 50%, text over: no                                    |
| 768        | facility-3 (grid)               | 719x340 (2.11:1) cover, 70%, text over: yes + controls, frosted card over 61% | 271x379 (1:1.40) cover, 50%, text over: no                                    |
| 768        | facility-4 (grid)               | 719x340 (2.11:1) cover, 70%, text over: yes + controls, frosted card over 61% | 386x379 (1.02:1) cover, 70%, text over: no                                    |
| 1024       | why (beside reasons)            | 672x384 (1.75:1) cover, 85%, text over: no                                    | 290x462 (1:1.59) cover, 40%, text over: no                                    |
| 1024       | cta (closing band)              | hidden                                                                        | 493x329 (3:2) cover, 100%, text over: no                                      |

Mapping: hero = CSS background (templates/t07-summit/contract.ts:253), hero-bg.png. why (:259) = doctors.png. service-N (:266) = service-N. facility-N (:276) = facility-N. cta (:304) = cta.png.

Visitor page (l6-all-fixes/joinery):

- hero is the full-screen section with no background. The bar, badge, headline, line and two buttons sit there; the proof row is not drawn (contract.ts:252).
- why is a muted box: 342x320, 672x384, 289x462, 375x462, 375x462.
- service-1 to 3 are surface boxes: 294x256, 312x448, 424x448, 579x448, 579x448.
- service-4 to 6 are not drawn: the copy has 3 items. l6 answers have 3 to 5, so service-6 was never drawn in l6.
- facility-1 to 4 are muted boxes, with the caption panel on them below md.
- cta is omitted.

#### Vector (t08)

| Slot                          | 390                                                              | 768                                                            | 1024                                                           | 1440                                                              | 1920                                                             | Role and shape                                                                                                                                                                                                                   |
| ----------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| about (band)                  | 342x147 (21:9) cover, 59%, text over: no                         | 672x288 (21:9) cover, 59%, text over: no                       | 832x277 (3:1) cover, 47%, text over: no                        | 1248x416 (3:1) cover, 47%, text over: no                          | 1608x536 (3:1) cover, 47%, text over: no                         | Wide pill-shaped band picture, 21:9, and 3:1 from lg. about.tsx:32-36                                                                                                                                                            |
| project-1 to project-3 (card) | 342x257 (4:3) cover (drawn), 56%, text over: no                  | 365x274 (4:3) cover (drawn), 56%, text over: no                | 461x346 (4:3) cover (drawn), 56%, text over: no                | 710x533 (4:3) cover (drawn), 56%, text over: no                   | 926x695 (4:3) cover (drawn), 56%, text over: no                  | Large pill-shaped frame, one per item, 3/5 of the row from md. The picture is drawn in a duotone shader, through a circle that opens on scroll, set 1.15x larger than its frame. projects.tsx:339,399-421, ripple.tsx:9-21,48-52 |
| project-4 (card)              | absent                                                           | absent                                                         | absent                                                         | absent                                                            | absent                                                           | As project-1 to project-3. The example has three items, so this slot is not on the example page; it was measured as an empty frame on a visitor page (below).                                                                    |
| project-1 (full screen)       | 390x844 (1:2.16) cover, 30%, text over: yes + controls, 40% tint | 768x1024 (3:4) cover, 50%, text over: yes + controls, 40% tint | 1024x768 (4:3) cover, 90%, text over: yes + controls, 40% tint | 1440x900 (1.60:1) cover, 95%, text over: yes + controls, 40% tint | 1920x1080 (16:9) cover, 85%, text over: yes + controls, 40% tint | The item's picture full screen when an item is opened, under a 40% scrim, with the item's title and a close button on it. projects.tsx:263-276                                                                                   |

Breakpoint seams (900 px tall; only slots that change):

| Breakpoint | Slot         | At bp-1                                  | At bp+1                                 |
| ---------- | ------------ | ---------------------------------------- | --------------------------------------- |
| 1024       | about (band) | 927x397 (21:9) cover, 59%, text over: no | 833x278 (3:1) cover, 47%, text over: no |

Mapping:

- about (templates/t08-vector/contract.ts:163) = project-2.webp inside #about.
- project-N (:158) = the Nth card in #projects. Its picture is a WebGL canvas; WebGL ran in headless Chromium with SwiftShader.
- I opened the full-screen view by clicking the first card.

Visitor page (l6-all-fixes/electrician, 4 items):

- about is a muted pill: 342x147, 672x288, 832x277, 1248x416, 1608x536.
- project-1 to 4 are muted pill frames: 342x257, 365x274, 461x346, 710x533, 926x695. l6 answers have 3 or 4 items.

#### Inegro (t09, not ready)

| Slot                          | 390                                                                                            | 768                                                                                                                                      | 1024                                                                                                                   | 1440                                                                                                                | 1920                                                                                                                  | Role and shape                                                                                                                                                                                                                                                   |
| ----------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| intro (band)                  | 390x1006 (1:2.58) cover, 25%, text over: yes + controls, gradient scrim, frosted card over 88% | 768x1364 (9:16) cover, 40%, text over: yes + controls, gradient scrim, frosted card over 93%, line drawing over 33%, solid card over 10% | 1024x1004 (1.02:1) cover, 70%, text over: yes + controls, gradient scrim, frosted card over 80%, line drawing over 16% | 1440x804 (16:9) cover, 85%, text over: yes + controls, gradient scrim, frosted card over 73%, line drawing over 55% | 1920x724 (2.65:1) cover, 55%, text over: yes + controls, gradient scrim, line drawing over 76%, frosted card over 69% | Full-width band backdrop under a frosted card of words and a button, with a gradient scrim from the top. From 768 a line drawing also reaches over its top part; at 1440 I identified it as the hero's inegro-lines-strip. glass.tsx:45-55, inegro.css:1288-1310 |
| service-1 (card)              | 340x320 (1.06:1) cover, 70%, text over: yes, gradient scrim                                    | 350x260 (4:3) cover, 90%, text over: yes, gradient scrim                                                                                 | 350x260 (4:3) cover, 90%, text over: yes, gradient scrim                                                               | 470x320 (1.47:1) cover, 100%, text over: yes, gradient scrim, solid card over 10%                                   | 470x320 (1.47:1) cover, 100%, text over: yes, gradient scrim, solid card over 10%                                     | Rounded (20 px) card picture, one per offering, one open at a time (the first by default). A gradient info panel with the title and line covers it, and a tab with the business name sits on its foot. services.tsx:49,84-104                                    |
| approach (band)               | 390x754 (1:1.93) cover, 35%, text over: yes + controls, gradient scrim, frosted card over 60%  | 768x1004 (1:1.31) cover, 50%, text over: yes + controls, gradient scrim, frosted card over 72%                                           | 1024x804 (1.27:1) cover, 85%, text over: yes + controls, gradient scrim, frosted card over 74%                         | 1440x684 (2.11:1) cover, 70%, text over: yes + controls, gradient scrim, frosted card over 67%                      | 1920x604 (3.18:1) cover, 45%, text over: yes + controls, gradient scrim, frosted card over 63%                        | As intro.                                                                                                                                                                                                                                                        |
| mission (band)                | 390x838 (1:2.15) cover, 30%, text over: yes + controls, gradient scrim, frosted card over 58%  | 768x1124 (1:1.46) cover, 45%, text over: yes + controls, gradient scrim, frosted card over 79%                                           | 1024x884 (1.16:1) cover, 75%, text over: yes + controls, gradient scrim, frosted card over 93%                         | 1440x724 (2:1) cover, 75%, text over: yes, gradient scrim, frosted card over 63%                                    | 1920x644 (3:1) cover, 50%, text over: yes + controls, gradient scrim, frosted card over 66%                           | As intro.                                                                                                                                                                                                                                                        |
| service-2 to service-6 (card) | 340x320 (1.06:1) cover, 70%, text over: yes, gradient scrim                                    | 350x260 (4:3) cover, 90%, text over: yes, gradient scrim                                                                                 | 350x260 (4:3) cover, 90%, text over: yes, gradient scrim                                                               | 470x320 (1.47:1) cover, 100%, text over: yes, gradient scrim, solid card over 10%                                   | 470x320 (1.47:1) cover, 100%, text over: yes, gradient scrim, solid card over 10%                                     | As service-1, shown when its name is pressed.                                                                                                                                                                                                                    |
| service-1 (menu card)         | 220x122 (16:9) cover, 85%, text over: no                                                       | 220x122 (16:9) cover, 85%, text over: no                                                                                                 | 220x122 (16:9) cover, 85%, text over: no                                                                               | 225x125 (16:9) cover, 85%, text over: no                                                                            | 225x125 (16:9) cover, 85%, text over: no                                                                              | Small rounded (10 px) card in the open menu: the desktop panel from 1025, the phone sheet's strip below. header.tsx:76-95,142                                                                                                                                    |
| service-2 (menu card)         | 220x122 (16:9) cover, 135x122 visible, 53%, text over: no                                      | 220x122 (16:9) cover, 85%, text over: no                                                                                                 | 220x122 (16:9) cover, 85%, text over: no                                                                               | 225x125 (16:9) cover, 85%, text over: no                                                                            | 225x125 (16:9) cover, 85%, text over: no                                                                              | As service-1 (menu card). On phones the second card starts partly off the side of a sideways strip.                                                                                                                                                              |

Breakpoint seams (900 px tall; only slots that change):

| Breakpoint | Slot                          | At bp-1                                                                                       | At bp+1                                                                                                             |
| ---------- | ----------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 768        | intro (band)                  | 767x614 (5:4) cover, 85%, text over: yes + controls, gradient scrim, frosted card over 64%    | 769x1364 (9:16) cover, 40%, text over: yes + controls, gradient scrim, frosted card over 88%, line drawing over 17% |
| 768        | service-1 (card)              | 480x320 (3:2) cover, 100%, text over: yes, gradient scrim, solid card over 10%                | 350x260 (4:3) cover, 90%, text over: yes, gradient scrim                                                            |
| 768        | approach (band)               | 767x530 (1.45:1) cover, 95%, text over: yes + controls, gradient scrim, frosted card over 57% | 769x1004 (1:1.31) cover, 50%, text over: yes + controls, gradient scrim, frosted card over 80%                      |
| 768        | mission (band)                | 767x558 (1.37:1) cover, 90%, text over: yes + controls, gradient scrim, frosted card over 67% | 769x1124 (1:1.46) cover, 45%, text over: yes + controls, gradient scrim, frosted card over 78%                      |
| 768        | service-2 to service-6 (card) | 480x320 (3:2) cover, 100%, text over: yes, gradient scrim, solid card over 10%                | 350x260 (4:3) cover, 90%, text over: yes, gradient scrim                                                            |
| 1024       | service-1 to service-6 (card) | 350x260 (4:3) cover, 90%, text over: yes, gradient scrim                                      | 470x320 (1.47:1) cover, 100%, text over: yes, gradient scrim, solid card over 10%                                   |

Mapping:

- intro (templates/t09-inegro/contract.ts:231), service-N (:239), approach (:251) and mission (:264) = the example pictures of the same names.
- service-1 and 2 are also drawn in the menu (index.tsx:42, header.tsx:142). I measured them with the menu open: the desktop panel from 1025, the phone sheet below.
- Services 2 to 6 were opened one by one by pressing their names.

Visitor page: none, because the template is not ready. Geometry comes from /examples only.

#### Lucent (t10, not ready)

| Slot                               | 390                                                             | 768                                                                        | 1024                                                                      | 1440                                                                       | 1920                                                                       | Role and shape                                                                                                                                                                                                                       |
| ---------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| hero (phone screen)                | 290x627 (1:2.16) cover, 30%, text over: no, frame drawn over    | 423x915 (1:2.16) cover, 30%, text over: no, frame drawn over               | 341x737 (1:2.16) cover, 30%, text over: no, frame drawn over              | 387x837 (1:2.16) cover, 30%, text over: no, frame drawn over               | 387x837 (1:2.16) cover, 30%, text over: no, frame drawn over               | Screen inside a drawn phone frame, about 1:2.16, rounded 25 px, with the frame image drawn over it. hero.tsx:47-66, lucent.css:621-637                                                                                               |
| promo (wide)                       | 350x197 (16:9) cover, 83%, text over: no                        | 691x389 (16:9) cover, 85%, text over: no                                   | 922x518 (16:9) cover, 85%, text over: no                                  | 1176x662 (16:9) cover, 85%, text over: no                                  | 1152x648 (16:9) cover, 85%, text over: no                                  | Wide 16:9 tile, rounded 40 px. story.tsx:17-19                                                                                                                                                                                       |
| overview (tile)                    | 350x263 (4:3) cover, 88%, text over: no                         | 691x518 (4:3) cover, 90%, text over: no                                    | 479x359 (4:3) cover, 89%, text over: no                                   | 607x455 (4:3) cover, 90%, text over: no                                    | 590x442 (4:3) cover, 90%, text over: no                                    | 4:3 tile, rounded 40 px. story.tsx:38-40                                                                                                                                                                                             |
| breakdown (tile)                   | 340x255 (4:3) cover, 88%, text over: no                         | 718x539 (4:3) cover, 90%, text over: no                                    | 450x337 (4:3) cover, 89%, text over: no                                   | 573x429 (4:3) cover, 90%, text over: no                                    | 563x422 (4:3) cover, 90%, text over: no                                    | 4:3 tile, rounded 40 px. story.tsx:76-78                                                                                                                                                                                             |
| reminder (tile)                    | 350x233 (3:2) cover, 98%, text over: yes, frosted card over 17% | 691x460 (3:2) cover, 100%, text over: yes, frosted card over 15%           | 760x506 (3:2) cover, 100%, text over: yes, frosted card over 15%          | 760x506 (3:2) cover, 100%, text over: yes, frosted card over 15%           | 760x506 (3:2) cover, 100%, text over: yes, frosted card over 15%           | 3:2 tile under a small frosted notice card with three short lines. story.tsx:99-101                                                                                                                                                  |
| steps (tile)                       | 350x458 (1:1.31) cover, 50%, text over: no                      | 691x905 (1:1.31) cover, 50%, text over: no                                 | 435x570 (1:1.31) cover, 50%, text over: no                                | 552x723 (1:1.31) cover, 50%, text over: no                                 | 536x702 (1:1.31) cover, 50%, text over: no                                 | Tall tile (1:1.31), rounded 40 px. story.tsx:147-149                                                                                                                                                                                 |
| feature-1 to feature-2 (rail card) | 248x248 (1:1) cover, 65%, text over: no                         | 506x607 (5:6) cover, 506x578 visible, 52%, text over: no                   | 306x367 (5:6) cover, 306x325 visible, 48%, text over: no                  | 439x527 (5:6) cover, 55%, text over: no                                    | 447x537 (5:6) cover, 55%, text over: no                                    | Window in a card of a sideways-scrolling rail: one card at a time, with the next card's edge showing. Square below 640 and 5:6 from 640; the card's foot cuts it at 768 and 1024. features.tsx:75-80, lucent.css:1248-1262,1287-1295 |
| feature-3 (rail card)              | 248x248 (1:1) cover, 65%, text over: no                         | 506x506 (1:1) cover, 65%, text over: no                                    | 306x306 (1:1) cover, 65%, text over: no                                   | 439x439 (1:1) cover, 65%, text over: no                                    | 447x447 (1:1) cover, 65%, text over: no                                    | Square framed tile (rounded 26 px) in the same rail. features.tsx:64-70                                                                                                                                                              |
| feature-4 (rail card)              | 250x250 (1:1) cover, 65%, text over: no                         | 508x610 (5:6) cover, 508x581 visible, 52%, text over: no                   | 307x368 (5:6) cover, 307x326 visible, 48%, text over: no                  | 440x528 (5:6) cover, 55%, text over: no                                    | 448x538 (5:6) cover, 55%, text over: no                                    | As feature-1 and feature-2, on the dark card.                                                                                                                                                                                        |
| widgets (wide)                     | 350x197 (16:9) cover, 83%, text over: no                        | 460x259 (16:9) cover, 84%, text over: no                                   | 860x484 (16:9) cover, 85%, text over: no                                  | 860x484 (16:9) cover, 85%, text over: no                                   | 860x484 (16:9) cover, 85%, text over: no                                   | Wide 16:9 tile, rounded 40 px. showcase.tsx:18-20                                                                                                                                                                                    |
| pair-1 to pair-2 (tall)            | 170x302 (9:16) cover, 38%, text over: no                        | 339x604 (9:16) cover, 39%, text over: no                                   | 442x785 (9:16) cover, 40%, text over: no                                  | 439x780 (9:16) cover, 40%, text over: no                                   | 439x780 (9:16) cover, 40%, text over: no                                   | Two tall 9:16 tiles side by side, rounded 40 px. showcase.tsx:37-41                                                                                                                                                                  |
| journal (wide)                     | 350x197 (16:9) cover, 83%, text over: yes + controls            | 691x691 (1:1) cover, 65%, text over: yes + controls, frosted card over 14% | 922x519 (16:9) cover, 85%, text over: yes + controls, solid card over 15% | 1176x662 (16:9) cover, 85%, text over: yes + controls, solid card over 13% | 1152x648 (16:9) cover, 85%, text over: yes + controls, solid card over 13% | Wide 16:9 tile (square from 700 to 900) with a heading link on it. From 700 the signup form overlaps its foot. closing.tsx:64-66                                                                                                     |

Breakpoint seams (900 px tall; only slots that change):

| Breakpoint | Slot                               | At bp-1                                                                    | At bp+1                                                                    |
| ---------- | ---------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 640        | feature-1 to feature-2 (rail card) | 413x413 (1:1) cover, 65%, text over: no                                    | 415x498 (5:6) cover, 415x475 visible, 52%, text over: no                   |
| 640        | feature-4 (rail card)              | 415x415 (1:1) cover, 65%, text over: no                                    | 417x500 (5:6) cover, 417x477 visible, 52%, text over: no                   |
| 700        | journal (wide)                     | 629x354 (16:9) cover, 85%, text over: yes + controls                       | 631x631 (1:1) cover, 65%, text over: yes + controls, frosted card over 15% |
| 900        | journal (wide)                     | 809x809 (1:1) cover, 65%, text over: yes + controls, frosted card over 12% | 811x456 (16:9) cover, 85%, text over: yes + controls, solid card over 19%  |
| 1024       | feature-1 to feature-2 (rail card) | 306x367 (5:6) cover, 306x325 visible, 48%, text over: no                   | 306x368 (5:6) cover, 55%, text over: no                                    |
| 1024       | feature-4 (rail card)              | 307x368 (5:6) cover, 307x326 visible, 48%, text over: no                   | 307x369 (5:6) cover, 55%, text over: no                                    |

Mapping: every slot maps to the example picture of the same name (templates/t10-lucent/contract.ts:256-325). The rail cards were brought into view by scrolling the rail sideways.

Visitor page: none, because the template is not ready. Geometry comes from /examples only.

#### Not measured, or measured with limits

- **Real photographs vary in shape.** The test picture is exactly 3:2, and every share figure assumes 3:2. "Own ratio" slots will take each real photograph's own shape: Monolith's feature pictures, Meridian's picture under the hero and all of Atlas.
- **Hover and press states were mostly not measured.** I measured only the Meridian menu (keyboard focus), the Inegro menus and service cards (pressed) and the Vector full-screen view (pressed). Not measured:
  - Summit's facility captions, which show on hover from md.
  - Ember's item and corner pictures on hover.
  - Vector's card lean under the pointer (scale 1.22, projects.tsx:401-406).
- **Vector's cards are drawn by a WebGL shader.**
  - They are shown in a duotone, through a circle that opens as the card scrolls (ripple.tsx:9-21).
  - The share counts the cover crop, the 1.15 scale and the pill frame. It does not count the circle, which depends on scroll position.
  - Without WebGL the page falls back to a grey picture under two blend layers (ripple.tsx:392-403). That fallback was not measured.
- **Scroll-linked motion** was measured only under reduced motion, at the scroll position that centres each slot (or the top of the page for backdrops). Inegro's bands slide over one another as the page scrolls (glass.tsx:21-23, data-stack). Positions mid-slide were not measured.
- **No clip-path, mask, filter or blend mode** was found on any slot or its parents at rest (raw files, fields masks, filter and blend).
- **One reading left out:** at 1023 px, the second card in Inegro's phone menu read 56% opacity at the moment of measuring. It was probably still fading in, so it is not in the seam table.
- **Example-only text over pictures:** three example pages put text over a picture that a visitor page does not draw. These are Harbor's about badge (contract.ts:236), Ember's hero proof row and opening rows (contract.ts:206,233), and Summit's hero proof row (contract.ts:252). The visitor-page lines record what remains.
- **Vector's project-4** is not on its example page, which has three items. It was measured only as an empty frame on a visitor page.
- **Inegro and Lucent** have no visitor page, so their slots could not be checked there.
- **Browsers and devices:** I used only Chromium on Windows. No real device or other browser was checked.

### Renders

**How they were made.** The renders come from run l6-all-fixes, through the development route `/dev/eval/l6-all-fixes/<fixture>/<templateId>` on the worktree's dev server (port 3101). Each one uses Chromium, reducedMotion 'reduce', a scroll to the foot and back, then a clip of the named section. They were compressed to 256-colour palette PNGs with sharp. The scripts and raw outputs are in the scratchpad, `test-results/template-fit/`:

- `renders-make.mjs` and `renders-compress.cjs` make and compress the renders.
- `renders-hidden-check.mjs` and `renders-hidden-which.mjs` run the blank-block check.
- `renders-a11y.mjs` takes the screen-reader snapshot.
- Raw outputs: `renders-hidden-check-l0.json`, `renders-hidden-check-l6.json` and `renders-raw/`.

**What the renders can and cannot show.**

- Every page uses stored model copy (`fallback: false` in each record), with the fixture's look and colour and a wordmark logo.
- The route draws no pictures (`app/dev/eval/[run]/[fixture]/[templateId]/page.tsx:49`), so every picture slot shows its empty state.
- Leftovers are shown as shipped, not hidden. These renders are evidence of leftovers, not of how well a design fits.

**Does reduced motion plus a scroll show every block? Yes.**

| Check                                                                                                                                                     | Pages             | Text and icon (SVG) elements under 10% opacity | Where                                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| The 12 l0-skeleton pairs with stored shots, reloaded the old way: 1440 wide, motion allowed, no scroll, 500 ms wait, as `tests/eval/screenshots.mjs` does | 12                | 442 of 1,332, on 7 pages                       | Atlas 21 and 22, Ember 71, Harbor 79, Summit 114 and 113, Vector 22. Aurora, Monolith and Meridian had none |
| The same 12 pages with reduced motion and a scroll                                                                                                        | 12                | 50 of 1,345, on 3 pages                        | All hidden on purpose (see below)                                                                           |
| All 60 stored l6 pairs, at 1440 and 390 wide, with reduced motion and a scroll                                                                            | 120, all HTTP 200 | Only the same things hidden on purpose         | Harbor on 5 of 5 pages; Summit on 10 of 10                                                                  |

The elements still hidden after the scroll are meant to be hidden until a person acts:

- Harbor's "Find out more" line shows only on hover (`templates/t06-harbor/sections/services.tsx:66`).
- Summit's photo captions show only on hover from 768 px wide (`templates/t07-summit/sections/facilities.tsx:44`).
- Summit's question answers stay hidden until a question is opened (`templates/t07-summit/sections/faq.tsx:64`).

**Verdict.** The blank areas in the old l0-skeleton shots were the animation artefact. One example: the stored `test-results/eval/l0-skeleton/shots/joinery-t05-ember-desktop.png` is blank where `ember-joinery-1440.png` below shows Ember's offerings and feature rows for the same business.

**The set.** Nine files in `docs/template-fit/renders/`, 314,596 bytes in total (about 0.31 MB, under the 3 MB cap).

| File                          | Bytes   | Size (px) | What it shows                                                                                                                                                                                                                                                                                                                                                               | Leftovers [R] and structures [S] cited                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ----------------------------- | ------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `summit-bakery-1440.png`      | 23,270  | 1440x694  | Summit's four reason cards for the bakery: "Proper bread daily", "Early delivery", "Wholesale or retail", "Local and personal". They sit around an empty centre picture block, under a stethoscope, a heart pulse, a hospital and an ambulance.                                                                                                                             | [R] icons: `templates/t07-summit/sections/why.tsx:1,9,28`. [R] id `#why-choose-us`: `why.tsx:38`. [S] exactly four cards (`templates/t07-summit/contract.ts:111`) from a brief that always has three points (`lib/ai/prompts.ts:33`), so the fourth is padding.                                                                                                                                                                                                                                                                                                       |
| `summit-bakery-390.png`       | 12,027  | 390x860   | Summit's form at phone width. The fields are name, email, phone, "Who to ask for" (placeholder "A name, if you have one"), "What you need" and "Preferred start date", with a date picker.                                                                                                                                                                                  | [R] field id and name `doctor`: `templates/t07-summit/sections/booking.tsx:89-111`. [R] field id and name `department`: `booking.tsx:122-135`. [R] id `#book-appointment`: `booking.tsx:24`. [R] guide example "Who to ask for": `templates/t07-summit/contract.ts:187`. [S] fields for a person, a service and a date: `booking.tsx:14,145-150`.                                                                                                                                                                                                                     |
| `harbor-a1-gas-1440.png`      | 21,415  | 1440x741  | Harbor's service cards for the gas engineer: "Boiler repairs", "Boiler servicing", "New installs". They sit under a dumbbell, a lightning bolt and a brain. The third card is highlighted by design (`services.tsx:37`).                                                                                                                                                    | [R] the source's icons, placed by position: `templates/t06-harbor/sections/services.tsx:1,9,38`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `harbor-a1-gas-390.png`       | 9,126   | 326x661   | Harbor's form card at phone width. The placeholders read "John Doe" and "john@example.com". The message placeholder is the model's own.                                                                                                                                                                                                                                     | [R] `templates/t06-harbor/sections/contact.tsx:93,106`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `ember-joinery-1440.png`      | 29,232  | 1440x1216 | Ember's offerings grid for the joiner: "Fitted Wardrobes", "Alcove Units", "Kitchens", "Bespoke Joinery", each over an empty 140 px circle. Below it are the feature rows, each with a chef's hat, a leaf or a heart beside its title. The tall picture beside the rows draws nothing when empty: its block measured 0 px wide at 1440.                                     | [R] icons: `templates/t05-ember/sections/features.tsx:1,9,38`. [R] id `#dishes`: `templates/t05-ember/sections/dishes.tsx:14`. [S] one picture per offering: a circle when empty (`dishes.tsx:30`), a 120 or 140 px square when filled (`dishes.tsx:38`). Defect: the empty tall picture collapses (`features.tsx:49`; measured in the scratchpad's `renders-probe.mjs`).                                                                                                                                                                                             |
| `aurora-bakery-1440.png`      | 124,176 | 1440x839  | Aurora's hero for the bakery and its window. The window has three title-bar dots, the name in the bar and a rail of feature titles. It shows "Today's Bake" over three rows: "Sourdough loaves proving", "Tin loaves in the oven", "Buns ready for crates". Each row has a dot and a progress bar fixed at full, three fifths and one fifth. The window's picture is empty. | [R] window chrome: dots at `templates/t01-aurora/sections/product-frame.tsx:26-28`, fixed fills at `:12`, row dots and bars at `:63-68`. [S] exactly three short rows, "things they do": `templates/t01-aurora/contract.ts:98-99`.                                                                                                                                                                                                                                                                                                                                    |
| `vector-electrician-1440.png` | 49,268  | 1440x3414 | Vector's items for the electrician. The marquee reads "RECENT WORK". Four items numbered 01 to 04 carry two-part titles ("Full / Rewire", "Consumer / Units", "EV Charger / Install", "Fault / Finding"), each beside an empty rounded picture. The "Open" cursor shows only under a pointer, so it is not in the render.                                                   | [R] numbers: `templates/t08-vector/sections/projects.tsx:426`. [R] id `#projects`: `projects.tsx:456`. [R] guide examples "Selected" and "Work": `templates/t08-vector/contract.ts:101-102`. [R] guide wording "pieces of work": `contract.ts:104`. The stored nav label "Our Work" and the lower-case name "bright spark electrical" (`l6-all-fixes/electrician.json`, fields `copy.t08-vector.final.nav.links[1]` and `.brand.name`) follow the guide (`contract.ts:93,96`). [S] two to four items that open full screen: `templates/t08-vector/copy-slots.ts:134`. |
| `meridian-joinery-1440.png`   | 21,479  | 1400x840  | Meridian's contact form for the joiner. The placeholders read "Leopoldo", "Miranda" and "leomirandadev@gmail.com". Beside the form, three step rows ("Get in touch", "Measure and draw", "Make and fit") each start with an icon: a building, a phone and an envelope.                                                                                                      | [R] `templates/t03-meridian/sections/contact.tsx:81,92,107`. [R] the row icons are contact-detail icons placed by position (`contact.tsx:1,19,41`), but the guide fills the rows with "step titles" (`templates/t03-meridian/contract.ts:150`).                                                                                                                                                                                                                                                                                                                       |
| `monolith-a1-gas-1440.png`    | 24,603  | 1400x614  | Monolith's four steps for the gas engineer, under a medal, a map pin, a plane and a gift. The fourth step, "Boiler sorted", comes from a brief of three steps. A screen reader hears each step heading as "Free Icons Get in touch" (Playwright snapshot of the page's accessibility tree, `renders-a11y.mjs`).                                                             | [R] icons: `templates/t02-monolith/sections/how-it-works.tsx:4,8,22`. [R] the SVG title "Free Icons": `templates/t02-monolith/sections/icons.tsx:31,109,177,235`. [S] exactly four steps (`templates/t02-monolith/contract.ts:100,169-170`) against the brief's three (`lib/ai/prompts.ts:34`).                                                                                                                                                                                                                                                                       |
