# Fit the three free designs to the visitor's business, and check every stock photograph against its slot

If we give a visitor three designs that look nothing like what their business should look like, they will not want our services. The designs are tasters, not the final site (PRODUCT.md), but they are the first work of ours a visitor sees.

The owner (the studio owner giving you this task) asked for a description of each template that helps decide which templates a visitor gets. Nothing reads the descriptions today, and nothing knows the visitor's kind of business when templates are chosen, so better descriptions alone would change nothing a visitor sees. The job is the whole chain: evidence about each template, the kind of business known before the choice, and a choice that uses both. The descriptions are then rewritten from the same evidence, so a person can check them.

Judge every template by its design and its range, never by the industry it was ported from. Several templates came from sites built for one trade (a restaurant, a gym, a hospital, an agency, an app). That is where they came from, not what they are for, and the owner's view is that many of them are multi-purpose. What ties a page to its source is usually a few leftovers, such as icons, field names and stock wording, that can be fixed without touching the design. Treat leftovers as defects to fix, not as reasons to restrict a template. "Many" is not "all": show each template's range with evidence, never assume it, and keep every real limit the evidence shows.

Keep the variety: the choice stays a seeded shuffle. Put guard rails around it so that:

1. no visitor is shown a template that clashes with their kind of business (except as the owner allows when too few templates fit), and the best-fitting templates come first; and
2. no stock photograph reaches a page unless it passed checks for the slot it fills: its relevance to the business and the section, its shape, and its job on the page.

Do not guess, assume or invent a fact. Every claim needs evidence you can point to, in both directions: that a template clashes with a kind of business, and that it can serve one. "Unknown", "unjudged" or "not verified" is always an acceptable answer. Estimates, prices and recommendations are allowed when labelled as such, with their inputs and sources shown.

## Before you start

- Work in the four phases below. Stop at the end of each one until the owner answers. Mark each open decision with the phase it blocks. Inside a phase, free work that can be undone may follow your recommendation on a decision the owner left open, but never start a phase before the owner has answered the one before it. Paid, public or production changes always wait for an answer.
- Phase 1 changes no tracked file except this brief (docs/template-fit-brief.md), the new docs/template-fit-plan.md, and the records and renders it cites under docs/template-fit/. Copying stored runs into the git-ignored test-results folder, running your own dev server and writing scratch scripts are fine.
- Make no paid call without the owner's go-ahead on a written estimate with a cap. A paid call is any Anthropic API call, including `pnpm eval` without `EVAL_PLAN=1` or `EVAL_SUMMARISE`. Treat every Pexels API call the same way, since production may share the key. At the last record about $2 of this month's $30 organisation limit was left, less than one full eval pass, and production may draw on the same limit.
- Never submit a brief through /start. It runs the paid pipeline, writes a lead to the production database and emails the owner (e2e/helpers/start.ts).
- Set up first:
  - Run `git fetch origin`, then create your own worktree on a new branch from origin/main. Other sessions edit the main tree.
  - Stay in step with origin/main while you work: fetch before each phase and before each PR, and rebase your branch when main has moved.
  - Install with `pnpm install --frozen-lockfile --ignore-scripts`. The prepare script would point the shared git hooks at your worktree.
  - Give the worktree a .env.local built from CI's placeholder values (.github/workflows/ci.yml). Never put real keys in it outside a paid run the owner approved, so a mistaken paid run fails instead of spending.
  - Copy the stored eval runs into its test-results/eval.
  - Run your own dev server on a port other than 3000.
  - Run commands that set environment variables from Bash (`EVAL_PLAN=1 pnpm eval`), not PowerShell.

## Words used here

- Owner: the studio owner giving you this task, and nobody else. Only the owner decides matters of taste, money and public wording. The code and its prompts call the visitor "the owner" (ownersWords; "The owner's own words" in lib/ai/prompts.ts). Leave those names in code, but in the plan, the ADR, the labelling sheet, new comments and your reports, call that person the visitor.
- Visitor: the person who fills in /start. Design: one of the three free homepages they get; Design one is the first shown. Poster: a design's card on the done page, which shows the template's first image slot (lib/preview/status.ts). Template: t01 to t10 under templates/. Slot: a named picture position in a template's imageSlots.
- Source: the site a template was ported from (Aurora was built in-house as a SaaS page). It is provenance only: it explains where the leftovers came from, and it is never evidence of fit, for or against.
- Everything a visitor's page shows, whatever the business, is one of three kinds:
  - Leftover [R]: kept from the source and removable or rewordable without changing the layout. That covers an icon or drawing, an ornament, a fixed word, an anchor id, a form field's name or id, a placeholder, a guide example or slot key that the copy model reads, and a tone word. Whether it happens to belong to some trade does not change what it is.
  - Structure [S]: part of a section's shape that needs certain content, such as a date to book and a person to choose, a grid of named offerings each over a picture, two to four items that open full screen, a drawn window holding three short lines, a phone screen, or a fixed count.
  - Design: the layout, section order, density, type, colour behaviour, motion, and what leads the page (photographs, type or a screen).
    Record each fixed element with path:line, its kind, and its channel: seen on the page, in the URL, read by a screen reader, sent in form data, seen only by the copy model, or metadata only.
- Category: a kind of business, from a closed list the owner approves, including "unclear".
- Fit, for a template and a category, judged on the page a visitor actually gets (optional sections hidden, model copy, real pictures):
  - clashes: a structure on the page that this kind of business cannot fill honestly, or that reads wrong for it, shown by stored model copy or a render. A leftover never makes a lasting clash. It keeps a template from a category only as an interim clash, if the owner chooses to route on it until it is fixed; mark it "lifts when fixed", with its fix id.
  - neutral: nothing on the page is wrong for it. Neutral is not the same as good.
  - suits: the design reads as right for this kind of business, on a render with that category's model copy and pictures and with leftovers fixed or hidden. That is taste: you may propose it with reasons, but only the owner gives it. A template may suit many categories. Never propose it because the source was this kind of business, or because a leftover matches it.
  - unjudged: no owner label yet. The selector treats it as neutral, but every report, description and test counts it separately, and nothing may claim range from it.
  - A clash counts once the owner has approved it, in the clash table or as a label. Every clash and label names its cause: an element from the fit record, or "too little in this sentence".
- Range: the categories a template is eligible for (no approved clash) and those it suits, each with its evidence.
- For "unclear" the business is unknown, so no render can judge it. Propose its row with reasons, the pool it leaves and the visits it allows. It excludes only templates with a structure most arrivals cannot fill. Put it to the owner under decision 2.

## What is true today

Checked on 2 October 2026. Verify each point before you rely on it.

### Choosing templates

- lib/select/select.ts takes the ready templates this email has not seen and filters them by logo polarity (every template is 'either', so the filter does nothing). It shuffles them with a seed, then picks one at a time, preferring the first template whose tones are all new. Nothing reads TemplateMeta.description, and tones are used only for variety.
- The seed is the payload hash: the email's HMAC plus every answer the pipeline reads, but not the visitor's name. For the 30 days a submission is kept, the same email with the same answers gets its first submission back. A returning visitor therefore gets new designs only after changing an answer.
- In lib/inngest/functions/build-concepts.ts the select step runs before the brief step. No business type field exists in the form, the stored answers or the brief.
- At select time the business signals are the visitor's 30 to 400 character sentence and the company name. The look, the colour, the logo's polarity and the number of own photographs are also known.
- In run l6 the brief call took 5.5 to 7.7 seconds. It makes three attempts, each with a 20 second timeout and a 20 second pause between them, before falling back.
- lib/select is pure and synchronous. It may not import lib/ai, lib/images, lib/db, lib/inngest, app, or anything under templates/ except templates/registry (eslint.config.mjs). revealTemplates (lib/db/exclusivity.ts) may call it up to three times. Select has no fallback: at the deadline the sweeper marks it failed.
- Each email sees each template once. With eight ready templates at three a visit, an email gets two visits.
- When fewer than three eligible templates remain, the selector returns an empty list. The done page then says "You have seen every design we have for now", the designs page says "Every design we have has been shown to this address", and no email is sent.
- The number of designs is fixed at submit, before select runs, and the posters, the status and the email follow it. The home page promises a returning email three designs it has not seen. The owner's "four visits of three" (ADR 0043) is not built. t09 Inegro and t10 Lucent are not ready.
- docs/pipeline-plan.md says "No AI call ever picks a template, a colour, a layout or an image URL".
- The site's "Is this AI?" answer (app/_components/straight-answer-items.ts, docs/claims-register.md) says: "AI drafts your wording from your own sentence and helps choose stock photos. It never sees your logo, your colours or your photos. A person designs every layout, and a person builds your real site." app/_components/copy.test.ts pins how many times "AI" appears.
- "Five questions" is a live claim in the register, and "five answers" appears in the preview email, the designs page, /start, /contact and the home page. A new question in the form would make them all untrue.
- tests/eval/pipeline.eval.ts requires every ready template to be chosen by at least five of its 20 fixtures. Harbor and Atlas sit at exactly five, so almost any routing change fails it.
- The fixtures file is frozen: add fixtures, never edit them. No fixture is a restaurant, gym, salon, solicitor, builder, vet, or software or app business, though five of the six clients in the home page's work band (app/_components/work-items.ts) are apps or software. No fixture uploads photographs.

### What the templates carried, and what went wrong

- In the stored eval runs, the eight ready templates were given 60 template-and-business pairs, none of them in the template's source industry. l6-all-fixes has model copy for 59 of them. The copy model filled the structures with each business's own offerings, for example:
  - Harbor for a gas engineer: "Repairs / Boiler repairs", "Servicing / Boiler servicing", "Installs / New installs";
  - Aurora's window for a bakery: "Today's Bake" over "Sourdough loaves proving", "Tin loaves in the oven", "Buns ready for crates";
  - Ember's grid for a joiner: "Fitted Wardrobes", "Alcove Units", "Kitchens", "Bespoke Joinery";
  - Summit's photo grid for the same joiner: "A visit to your home", "A design drawn for you", "Handmade in our workshop", "Fitted by the two of us";
  - Vector's items for an electrician, each title in two parts: "Full / Rewire", "Consumer / Units", "EV Charger / Install", "Fault / Finding". All 25 stored Vector answers filled its items with offerings, never with invented projects.
- A count on 2 October found words from the source's industry in almost none of the stored model answers (Ember 0 of 22, Harbor 0 of 9, Summit 1 of 22, and Vector 0 of 25 for portfolio words). docs/template-analysis.md agrees: "Every existing template is already multi-industry by construction: its contract takes any brief ... Their pictures and icons are not."
- What went wrong on those pages was mostly leftovers. These are examples, not a full list:
  - Ember draws a chef's hat, a leaf and a heart on its feature rows, and puts #dishes, #timing and #booking-process in the URL [R]. It has a grid of four to eight named offerings, each over a small square picture, and a full-screen photograph with the heading set on it and no scrim [S].
  - Harbor puts its source's six icons on its service cards by position, starting with a dumbbell, and its form's placeholders are "John Doe" and "john@example.com" [R].
  - Summit draws a stethoscope, a heart pulse, a hospital and an ambulance on its reason cards, puts #why-choose-us, #booking-process and #book-appointment in the URL, and names a form field doctor in its id and name [R]. Its form asks for a person to deal with, a service from the page's own list and a date [S].
  - Aurora's window has an application's chrome: dots, a title bar and progress bars at fixed fills [R]. Inside it are three short lines its guide asks to be "things they do" [S]. ADR 0008 calls it a window "of this product". For the architects in l6, its status rows drew claims the sentence never made, a strain caused by the structure.
  - Vector shows two to four named items that open full screen [S]. Its guide calls them "pieces of work" and the nav item "their work", and asks for the name in lower case "as the source set its own" [R]. 22 of 25 stored answers labelled the link "Our Work", and all 25 lower-cased the name.
  - Monolith and Meridian have fixed icon sets [R]: Monolith's medal, map, plane and gift, and its chart, wallet and magnifier; Meridian's marquee of a crown, a ghost, a squirrel and others, and its benefit and feature icons. Meridian's contact form's placeholders are a real person's name and email address (templates/t03-meridian/sections/contact.tsx) [R].
  - Atlas keeps its sections but none of its source's crypto data. Its slots are shaped for 3D cut-outs [S].
  - Lucent puts the hero picture in an iPhone frame, where about 31% of a 3:2 photograph shows [S]. Whether to keep the frame is open (ADR 0043).
- The copy model copies the guides' "such as" examples word for word: Summit's "Who to ask for" in every stored answer, Monolith's "Why we started" in 8 of 8 l6 answers. Guide examples and slot keys (dishes, booking, timing, doctor, projects, sponsors, community, tools) are leftovers too.
- Fallback copy is the same generic wording for every business ("What we do, at a glance", "Ask us for details"). It shows the leftovers, but says nothing about range.
- Some limits come from the brief, not the business. Every brief has exactly three selling points, three steps and one statement (lib/ai/prompts.ts), so Monolith's fourth step, Meridian's fourth benefit and Summit's fourth reason are padding for everyone ("Built On Trust", "We like helping"). Short sentences padded sections in every industry.
- Other strains the evidence shows: Ember's item pictures for the HR firm were "a person signing a divorce decree on a desk", because stock struggles to picture offerings that are not things; Lucent's phone screen; Summit's person and date fields; and Inegro's paragraphs of 150 to 560 characters, written from a sentence of at most 400.
- The meta.ts descriptions describe the example pages, including pieces a visitor's page never shows: Harbor's floating badge, gallery, plans, testimonials, partners and articles; Summit's portraits and articles; Vector's bento; the opening-time rows on Ember's card. Monolith's gives the wrong number of steps. Summit's opens "A calm clinical page", and Vector's "A near-black studio page".
- Five tone words name a kind of business: Aurora's and Lucent's "product", Ember's "hospitable", Harbor's "athletic", Summit's "clinical" and Vector's "studio". Tones drive only the variety pass.
- docs/template-analysis.md calls the leftovers "sector lock (high)". Its industry-fit decision (recommended: "neutral first") has never been formally answered; the owner's view above answers it in principle.
- A clash table that counted leftovers as clashes would typecast the templates. A simulation on 2 October left 13 of the 20 fixtures with only Monolith, Meridian and Atlas, which is one visit, not two, and Aurora and Harbor reached almost no one.

### Photographs

- The brief prompt asks for two hero searches and two detail searches (lib/ai/prompts.ts). Nothing caps them, and one stored brief wrote three detail searches.
- Slot 0 of each template takes the hero searches, even where slot 0 is not a hero (Monolith, Vector, Inegro). Every other slot of all three designs draws from one pool: the results of every detail search together, judged once.
- Per-item slots (one picture per named offering, service or item) take the next picture in the pool, not one that matches their item. Imagery runs in parallel with copy, so it does not know the items. Slots that will not render still take pictures. The slot keys carry the source's subjects (dish-1 to dish-8, facility-1 to facility-4, project-1 to project-4).
- The look's words are appended to every query, even when the query already has them ("bright kitchen natural light natural light").
- Pexels is searched landscape-only, 12 results, page 1 (lib/images/pexels.ts). Width and height are parsed, then dropped (lib/images/candidates.ts). Pexels' alt text goes onto the page unchanged, place names included ("Charming lakeside restaurant interior in Trakai" for a UK cafe).
- Haiku judges 350 px-tall thumbnails against "the main picture on the homepage of <company>" or "a supporting picture further down the homepage of <company>", plus the brief's positioning. It is told to prefer "room for words" in every picture (lib/ai/rank.ts, lib/images/plan.ts, lib/ai/prompts.ts). It is never told the slot's shape, crop or section, or whether text sits on the picture.
- There is no minimum score. Unjudged pictures are used last, and if the ranking call fails, Pexels' order is used with nothing rejected. The second hero search runs only if the first fails or finds nothing, however poor the first one's pictures.
- When the model is refused (a credit refusal came back as a 400), the brief falls back at once and every ranking fails. Slot 0 then shows unjudged results of a search for the company name plus the look's words. The other slots show unjudged results for the first sentence of the visitor's description plus the look's words.
- Slots declare no role, shape or size (TemplateContract.imageSlots is a list of names). Some cannot be filled well by landscape stock:
  - Monolith's 40 px and 96 px circles, whose shape implies a face;
  - Ember's 120 to 140 px squares, one per offering (the source's were dish cut-outs), and its tall crop beside the feature rows (the source's showed a chef);
  - two of Summit's slots, whose source pictures were staff photographs;
  - the slots in Atlas and Monolith made for transparent cut-outs and drawings;
  - Lucent's phone screen and 9:16 tiles.
- Ember's and Summit's heroes set text straight on the photograph with no scrim.
- Faces: the brief prompt says "no faces", the judge rejects only "a single identifiable person's face as the subject", the warm look promises "people", and the Pexels licence forbids implying endorsement by the people shown.
- A visitor's own photographs fill the first slots, and every later slot stays empty. One photograph leaves Ember's other eleven slots and Summit's other twelve empty. An empty slot draws the template's empty state, often a grey block.
- The stored screenshots that look blank below the hero are an artefact: tests/eval/screenshots.mjs never scrolls, so the entrance animations never play. They also hide most leftovers, so they are not evidence of range either way.
- ADR 0012 says a picture is never the reason a page does not appear, and ADR 0017 chose different pictures in each design over the single best one.
- Nothing measures relevance except the judge's own scores. In l6:
  - 42 of 324 filled slots took a picture scored 4 to 6 (40 of them a 6);
  - 57 slots were empty, and 75 took a picture another design had already taken;
  - 38 of the 57 empty slots came from pools where every search got a Pexels 500 (21 of the 67 searches made failed), which production would retry.
- No eval run's picks have been rendered in their slots, and nothing records a review of a picture in its slot.
- Each imagery attempt makes one hero search (two if the first fails or finds nothing), every detail search (usually two) and at most two rankings.
- Any slot left empty by an error re-runs the whole step with empty caches every 20 seconds, repeating every search and ranking, until the sweeper settles the stage 45 seconds before the deadline. A Pexels 429 settles that submission's imagery at once with its empty slots, unless another slot in the same attempt failed for another reason.

### Money and limits

- A submission costs $0.135 on average (ADR 0044). Exhausted visits make no model call. A template answer costs from $0.025 (Vector) to $0.086 (Harbor) (docs/pipeline-quality-plan.md).
- The organisation's model limit is $30 a month. About $28 was spent at the last record (docs/pipeline-quality-plan.md), leaving about $2 until it resets on 1 November. That is less than one full eval pass ($2.71 for l6). Production may share the limit.
- Pexels allows 200 requests an hour and 20,000 a month. Whether the eval and production share PEXELS_API_KEY is not known.

### Tools that exist

- The stored eval runs are in C:\Users\Omar\Documents\PinnaclePX-pipeline\test-results\eval\ while that worktree exists. Each fixture holds its brief, its chosen templates, copy for those three, its search pools with verdicts, and per-slot picks. Candidates keep only id, alt, photographer and a 350 px-tall thumbnail URL: no size and no full-size URL. They cover 60 of the 160 pairs of ready template and fixture.
- `EVAL_PLAN=1 pnpm eval` prints the template mix with no calls. `EVAL_SUMMARISE=<run> pnpm eval` recomputes a run's summary and overwrites its summary.json and summary.md, so run it on a copy. lib/env.ts checks every key on import, so both need an env file; CI's placeholders do.
- /dev/eval/<run>/<fixture>/<templateId> (development only) renders a stored run's copy as a visitor gets it, without pictures. It serves only the three templates that fixture got; other pairs return 404.
- `pnpm eval:shots <run> <baseUrl>` captures full pages at 1440 and 390 only, with no reduced motion and no scrolling, so the reveal animations leave blocks blank. For the renders you need, write a scratch Playwright script that sets reducedMotion to 'reduce' and covers every width you need. Lucent is not ready, so it appears only at /examples/lucent; wait past its splash (0.7 seconds under reduced motion).
- /examples/<name> shows each template's example page: the source's own words and pictures, fuller than any visitor's page. Use it for slot geometry only, never for fit; it shows the template as its source, which is the reading to avoid.
- docs/template-analysis.md (around line 2012) has a method for showing a design's range: the same design rendered for far-apart businesses, with short and long copy, any photography or none, and a swapped accent.
- next/image allows only Blob hosts, and next.config.ts exports a plain object. Allowing images.pexels.com in development only means turning it into the function form keyed on PHASE_DEVELOPMENT_SERVER.

## What success looks like

- Templates:
  - A template the owner approved as clashing with the business's category is never chosen for it, on any visit, except as the owner's answer to decision 4 allows when fewer than three unseen templates fit.
  - No template is kept from a category by a leftover once its fix has merged. Every lasting clash cites a structure, and the stored copy or render that shows it.
  - Among the rest, "suits" comes before "neutral" and "unjudged", unless the owner chooses otherwise under decision 4. Within each tier keep today's rule: the seeded shuffle, then the first template whose tones are all new (counting tones already taken from a higher tier), else the next in shuffled order. Tone variety never moves a template across tiers. Design one comes from the highest tier with a template left.
  - Each ready template's range is reported: the categories labelled suits, neutral and clashes (with causes), the categories still unjudged, the categories its approved fixes would open, and its share of Design one and of all three designs in each category, from the pure selector over seeded identities (free). A template eligible only for its source's industry, or eligible but never chosen, is flagged with its reason.
  - After the approved fixes, every category, "unclear" included, keeps at least the number of eligible templates the owner sets. Six keeps two visits of three; today every category has eight.
  - Tests that CI runs (*.test.ts) prove all of this over every fixture. They read each fixture's owner-approved category and the owner's labels from files kept beside the frozen fixtures.
  - The coverage test is replaced, not loosened: every ready template is eligible for at least N approved categories and is chosen in at least M, with N and M in lib/config.ts. Every ready template's copy stays measured by the eval.
  - Whatever assigns the category (rules or a model) matches the owner's category on every fixture, or the owner accepts each listed miss. It answers "unclear" no more often than the owner allows. Report both on held-out fixtures it was not tuned on.
- Photographs:
  - Every stock photograph that reaches a page meets all of these:
    - it was judged for relevance to the visitor's business and to the section it sits in, and against its slot's class (one of a few slot specs: role, shape, any text over it, the rule on people). A per-item slot is judged against its own item, if decision 7 lets those pictures wait for their copy. No picture is ever unjudged or taken in raw search order;
    - that judgement scored at or above a floor set in lib/config.ts;
    - its crop loss and pixel size are within the class's limits;
    - the judge reported it meets the slot's rule on people.
  - Otherwise the slot takes the fallback the owner chose under decision 7. Unit tests prove each rule. That is the guarantee code can give.
  - Whether the pictures look right is measured: the share the owner accepts when they are rendered in their slots, before and after, against a target the owner sets. Report it per template and category, with counts and 95% intervals, and report the judge's agreement with the owner as a number.
  - Never call that rate a guarantee, in the plan, the ADR or on the site.
- Nothing on the site becomes untrue at any merge. The added cost and time per submission stay under ceilings the owner sets. Exhausted visits stay free.

## Rules

- Origin is provenance. Never restrict or prefer a template because of where it came from, never call it by its source's trade ("the restaurant template"), and describe its design in words that name no industry.
- Evidence, strongest first:
  1. code facts with path:line;
  2. renders of the page a visitor gets, cited by a file the owner can open. Use model copy, and when the design is being judged, have the leftovers fixed, or hidden and marked so;
  3. stored model output from the eval runs, counted by a script you cite. It shows how the copy model filled each section for each business: honest fill, padding, repetition, guide words copied, source words. It shows what a section becomes for a business. Fallback copy is not evidence of range.
- A model's verdict, yours included, ranks below all three kinds of evidence. It may support a proposal, but never a clash on its own, and it never counts as acceptance. Acceptance comes from tests and the owner's labels on rendered pages. Wherever a model informs fit or pictures, report its agreement with the owner's labels as a number and list the disagreements.
- Never infer fit from a template's name, its tones, its source's business, its /examples page, its current meta description or a single adjective, in either direction.
- Many, not all:
  - Keep every structural limit the evidence shows, and list it.
  - Propose "suits" candidates across categories from each template's range evidence, so the best-fitting tier is filled. Report any category left with no "suits" template.
  - The owner's view sets a principle; it approves no change to what a template draws. Each fix is approved element by element, and it replaces the leftover inside the section's existing structure.
- When a sentence does not mention something, it is unknown, not absent.
- Do not loosen the copy rules. Record every fill problem with its cause:
  - universal: for example a fourth point from a brief that always has three. It goes on the fix list;
  - sentence-level: too few distinct points or characters. It is never a category label;
  - category-level: businesses of this kind typically lack what the structure needs. It goes to the clash table.
- Clashes and labels lapse with their cause. When a fix merges, remove the interim clashes that cite only that element, return the labels whose only cause was that element to unjudged, and put them back on the labelling sheet. A test fails if a clash or label cites an element that no longer exists at its file:line.
- The category step:
  - Any model work for fit runs in its own memoised step before select and reaches the selector as data. lib/logo/stage.ts shows the shape: catch, log, return a safe value.
  - If it fails, or runs past its timeout (a number in lib/config.ts, inside the owner's ceiling on added seconds), treat the business as "unclear". It never fails a build.
  - Say in the plan whether the category should also be stored on the submission row, which needs a migration.
  - With the same seed, seen set and category, the selector returns the same templates. Use no Math.random and no clock.
  - Check that the visitor has designs left before any paid call.
  - Never return an empty list because of fit: the page would tell the visitor they have seen every design.
- A visitor's logo, colours and own photographs never reach a model. The site promises it.
- Keys: for a paid run the owner approved, copy only ANTHROPIC_API_KEY, ANTHROPIC_WORKSPACE_ID and PEXELS_API_KEY from the main tree's .env.local into your worktree's, then restore the placeholders. Never copy DATABASE_URL, BLOB_READ_WRITE_TOKEN or RESEND_API_KEY.
- Repo:
  - Read node_modules/next/dist/docs before writing Next.js code.
  - Only lib/ai calls the Anthropic API, and only lib/images calls the Pexels API (api.pexels.com). Loading stored photos from images.pexels.com in development is fine.
  - Templates import only lib/tokens and lib/copy-slots, so type the fit data in lib/copy-slots/template-meta.ts. Type a template's traits there: its leftovers (each with file:line and fix id), its structures by the content they need, and its content demand. Keep verdicts per category only in the owner's clash table and labels file.
  - Make fit data and slot specs optional on the shared types, so t09 and t10 compile without them, and test that every ready template has both.
  - Name slot classes by shape and job, in words that name no industry (for example "small square, one per offering" or "full-screen backdrop under text"). Derive each one from the slot's geometry and placement on the visitor's page, never from the source's example picture or the slot key. A per-item slot's purpose is its item's own copy. A unit test checks class names, roles and purposes against an owner-approved list of source words.
  - A contract names each slot's class. The class limits live in lib/config.ts, where lib/images reads them.
  - lib/copy-slots/fit.ts already means fitting text into slots, so name the new pieces differently.
  - Validate with zod at the edges. Put tuning numbers in lib/config.ts. Write British English with no em dashes. Stage files by name.
  - Record decisions in one new ADR, created in the first phase that changes code and amended in each later phase. Number it with the next free number after fetching origin/main and checking open PRs (0048 on 2 October 2026; 0046 and 0047 are taken). It amends ADRs 0009, 0011, 0012, 0017, 0038, 0043 and 0044 and docs/pipeline-plan.md where they change. For each leftover fix it also amends the template's port ADR (0008, 0023, 0027, 0028, 0029 or 0030) and docs/template-porting-guide.md. Say whether /examples keeps the source's element, so `pnpm template:compare` still matches the source.
  - Update the claims register and any public line in the same PR as the change that would make it untrue, in words the owner approved, and keep app/_components/copy.test.ts green.
  - Claim only what you measured, and name the run.

## Out of scope unless the owner says so

- Changing what a template draws, or what its contract tells the copy model, beyond changes the owner approves element by element. That covers fixing leftovers (icons, ids, field names, placeholders, guide examples, slot keys), scrims on the Ember and Summit heroes, and changes to avatar or cut-out slots. Contract guides are template data, not the copy rules. A changed guide changes model output, so measure it with an eval run inside the approved budget. New descriptions for ready templates, fit data and slot specs are in scope.
- Making t09 or t10 ready, or giving them slot specs. Building the visit cap.
- The copy rules: SYSTEM_PROMPT, copyPrompt and retryPrompt in lib/ai/prompts.ts, and lib/copy-slots/rules.ts. The brief prompt's image searches and the ranking prompt in the same file are in scope, through the eval.
- The questionnaire. How a visitor's own photographs fill slots. ALLOW_REPEAT_TEMPLATES on Vercel.

## Phases

End each phase with a PR from its own branch, with the verify, budget and e2e checks green. The Vercel check stays red until its environment is set, and it is not required. Start the next phase from origin/main once that PR has merged, or ask the owner whether to build on the unmerged branch.

### Phase 1: evidence and options

- A fit record for each ready template, in this order:
  1. its design, in words that name no industry;
  2. its range: every business it carried in the stored runs (run, fixture, model or fallback copy), and what the stored model copy wrote in each structure, quoted, with where it padded or repeated;
  3. its leftovers: every fixed element of kind [R], with path:line, its channel, a proposed fix, whether the fix changes what the copy model sees, how often stored copy repeated it, and the categories the fix would open;
  4. its structures [S], named by the content they need, with the stored fills and the limits the evidence shows;
  5. its content demand as counts (distinct offerings, reasons, steps, long paragraphs), and how the fixtures' sentences filled them: fallback rate, retries, items added beyond the brief's three, repetition across sections, and the results for the shortest and longest fixtures;
  6. its slots: each slot's role and shape in words that name no industry, at 390, 768, 1024, 1440 and 1920 wide and at each of the template's breakpoints ±1 px. Give whether it shows at that width, any text over it, whether its shape implies people, and its empty state, and how empty the slots would be with 1, 3 and 6 own photographs;
  7. the tone and description words that name a kind of business, each with a proposed word for the feel;
  8. its defects;
  9. last, its provenance: the source and its business, recorded only to explain the leftovers.
     For t09 and t10, record code facts and slot geometry only.
- A fix list: every leftover across the ready templates, Monolith's and Meridian's included, each with its change and the categories it would open.
- A clash table of structures only, for the owner to approve, including the "unclear" row. Cite each clash to code and to stored copy or a render. Interim clashes caused by leftovers go in a separate column marked "lifts when fixed", each pointing at its fix. They are used only if the owner chooses to route on them until the fix ships (decision 1).
- A proposed category list with "unclear":
  - Ground it in who arrives. Use the kinds of business in real briefs (ask the owner, who can read them at /admin, ADR 0045; your placeholder env cannot), PRODUCT.md, the fixtures and the work band.
  - Never add a category or a fixture because a template came from that industry.
  - Describe each category by what its businesses typically have that a page might presume: bookings by date, a person to choose, a premises, things to photograph, named past work, an app or screen. Build the clash table from those presumptions against the templates' structures.
  - Flag any category whose row simply reproduces one template's source.
  - Compare this approach with a plain list of trades, on labelling effort and on how many businesses each puts in the wrong category.
- Pools and visits for each category, "unclear" included, in three states: today, with any interim clashes; after each proposed fix on its own; and after all of them. Name the fixes that keep every category at the owner's minimum.
- The variety each option in decision 4 gives. From the pure selector over seeded identities, report each template's share of Design one and of all three designs per category, and any eligible template never chosen.
- The options for knowing the category before select (decision 3):
  - a separate memoised lib/ai call with its own timeout;
  - the brief moved before select, with a category field;
  - deterministic rules over the sentence;
  - an optional kind-of-business picker inside the first question (it keeps "five questions" true and the frozen fixtures valid), or a new question;
  - for comparison only, a model that reads the descriptions and the sentence and picks three. Say that it breaks the seeded shuffle, the determinism rule and docs/pipeline-plan.md.
    For each option give the cost; the added seconds and how much later the posters appear; what happens on failure; how it is tested; and the ADRs and public lines it changes. Recommend one. If the owner picks an approach with no category (fit by presumption, or a model's pick), restate "What success looks like" for it in the plan before Phase 3.
- The selection options for decision 4. Include what visit 2 gets, and the collision when fewer unseen templates fit than the designs promised at submit: whether "no clash" or "three designs" gives way. Every surface stays true either way.
- The photograph plan (decision 7):
  - slot classes named by shape and job, with a spec and limits for each;
  - searches per class and orientation;
  - judging each pool once per class and section kind present in the chosen three, at the crop the page shows;
  - the floor and the crop limit;
  - a code check of text legibility where text sits on a picture;
  - alt text written for the slot rather than copied from Pexels;
  - trying the second hero search when the first one's pictures are poor;
  - the fallback brief's searches;
  - making each search and ranking its own memoised step, so a retry repeats only what failed;
  - caps on searches and rankings per submission in lib/config.ts, with the number of submissions an hour that allows within Pexels' 200 requests.
- Price a hybrid. Live searches come first, then an owner-approved picture set per category and slot class as the fallback when nothing passes, the judge is down or Pexels fails. Size the set (categories × classes × pictures for two visits without a repeat), with the owner's hours to approve it.
- Estimate how many slots each floor would leave empty from the stored verdicts, on pools whose searches all answered. Call it a proxy, since those scores answered generic purposes.
- The size of Phase 2:
  - Count its pages and estimate the owner's labelling hours.
  - Price the model copy that labels of range need, in three sizes: every missing pair (about $4.21 at today's cost per answer, an estimate), one fixture for each template and kind of business with no stored page, or only the pairs whose structural clash is in doubt.
  - Price fixtures from the sources' own industries separately; they test only "suits" there.
- The open decisions, starting from the list below, each with options, evidence, your recommendation and the phase it blocks.

Write it all to docs/template-fit-plan.md; if it grows past what GitHub renders, move the per-template records into docs/template-fit/records.md and link them. Commit the renders it cites under docs/template-fit/renders/, compressed and named <template>-<fixture>-<width>.png, and keep the set small.

### Phase 2: measurement

- Copy-free fixes first. Once the owner approves fixes that change nothing the copy model sees (icons, drawings, marks, ids, field names and ids, placeholders, fixed words), ship them in their own PR. Render each template before and after at the widths above and keep its tests green, so the owner labels what ships. Fixes that change copy (guide examples, slot keys) wait for an eval run inside the approved budget. For leftovers the owner has not decided, render the page both ways for one far category per template, so the owner sees what each leftover costs.
- A development-only route that renders any ready template with any fixture:
  - It uses the stored copy where the run has it. Otherwise it uses the template's fallback copy from the stored brief, under a "fallback copy" label.
  - Picks are replayed with the choice rule the eval mirrors (tests/eval/pipeline.eval.ts, from lib/images/stage.ts). A template the fixture did not get is replayed as its only design, and the sheet says so.
  - Pictures come from the stored thumbnail URLs on images.pexels.com, never the API. Read each picture's width and height from the fetched file; never assume them.
  - To fetch a larger size, change the thumbnail URL's h=350, after checking on one photo that the new URL returns the same photo at that size. State on the sheet the size the owner is judging.
- Free renders, before anything paid:
  - the 59 stored model-copy pages with their stored picks;
  - every ready template in each of the four looks from stored copy: 32 pages, with tokens and fonts re-derived for each look, and pictures marked as searched for another look;
  - a stress set for each template: the shortest and longest fixtures it was given; no pictures, and pictures from another category's pool; and two accents from the palettes.
    Where a leftover's fix is still pending, hide it in the scratch Playwright script and mark the page "leftovers hidden, not shipped".
- New fixtures that the owner approved under decision 11:
  - add them because such visitors arrive, never because a template came from that industry;
  - cover the missing categories, a sentence that names no trade, and visitors with own photographs (stand-in files served locally in development, never uploaded);
  - add them, and never edit existing ones;
  - they have no stored brief or copy, so until a paid run they serve only the free checks: `EVAL_PLAN=1 pnpm eval` and the selection unit test.
- A labelling sheet the tests can read: a committed JSON file that only the owner fills. Never pre-fill a label; put any proposal in a separate field the tests ignore.
  - The owner confirms each fixture's category.
  - For each page, the owner answers two questions:
    1. the page label: clashes, neutral or suits;
    2. separately, "Leaving aside these words and these pictures, is the design wrong for this kind of business?"
  - For any "clashes", the owner ticks reasons from a closed list: a named leftover, a named structure, this sentence's copy, the pictures, the look or colour, or other (with a note). Only a design answer with a structural or other reason makes a category clash. Leftovers go to the fix list, copy to the fit record and pictures to Phase 4.
  - Choose fixtures by rule: the category's fixture with stored model copy, otherwise one drawn with a seed stated in the plan. When two fixtures of a category disagree on the design, report it; the worse label does not simply win.
  - Label range only on model copy. Mark fallback pages; they count only for the fallback case.
  - Label pictures accept or reject: every slot-0 picture (the one the poster shows), plus a sample stratified by template and category, seeded, with its size and margin of error stated.
  - Show pages in a seeded order, and never show a template's source, tones or description on the sheet. Skip only pairs with an approved lasting clash.
  - Label in order of value: stored model-copy pages first, then pairs whose structural clash is in doubt, then cells with no page, then stress and look pages.
  - Time the owner's first ten pages, estimate the total, and let the owner cap the hours.
- Today's numbers from the stored runs and `EVAL_PLAN=1`, with empty slots counted by cause: search error, all rejected, or pool used up.

Stop for the owner's labels and the paid-run budget. Once the budget is approved:

1. Let the eval write copy for named templates.
2. Run the new fixtures, and every pair the owner will label that lacks stored copy.
3. Render them with the route and add them to the sheet.
4. Stop again for the owner's labels.

If the owner wants clashes routed sooner, Phase 3 may start once the clash table is approved. The selector reads the labels file, so later labels change the choice without new code.

### Phase 3: templates

- Build the category step, the fit data and the selection rule, plus the approved fixes that change copy, each measured with an eval run inside the approved budget. Render each changed template before and after at the widths above, and keep its tests green.
- Build the lapse rule and its test.
- Tests:
  - 0, 1, 2, and 3 or more fitting templates;
  - a second visit: the same fixture with one answer changed, and the category recomputed;
  - an "unclear" business;
  - the same seed, seen set and category giving the same result;
  - the category step failing;
  - the range assertions (N and M).
- Replace the eval's coverage test with the range assertions, and say why in the ADR. Keep every ready template's copy measured: have the eval write copy for named templates on fixtures chosen for coverage, rather than lowering any floor.
- After tuning the category step, freeze it and add held-out fixtures you did not tune on (approved under decision 11). Stop for the owner's categories for them. If the step calls a model, measure it with a paid run inside the approved budget, or ask for one.
- Rewrite each ready template's description from its fit record. Describe the design in words that name no industry, then its range from the labels file: "Judged right for ...; kept from ..., because <a structure>; not yet judged for ...". Never name the source's industry as its purpose, mention the source only in a provenance line, and leave out leftovers awaiting a fix. Add a test that keeps each description in step with the typed data and the labels file.
- Rename the tone words the owner approved, and report the template mix before and after with `EVAL_PLAN=1`.
- If labels were taken before fixes merged, re-render a seeded 20% of labelled pages from main after the merge, ask the owner to confirm them, and report how many changed.
- Report, before and after:
  - each template's range;
  - each category's pool and visits;
  - variety per category;
  - clashes on visits 1 and 2;
  - the category step's agreement and its "unclear" rate on the held-out fixtures.

Stop.

### Phase 4: photographs

- Add slot classes to each ready template's contract and make the approved photograph changes. Unit-test every photograph rule under "What success looks like".
- Make paid runs only within the approved budget.
- Render the new picks in their slots with the Phase 2 route, add them to the labelling sheet with the same sampling rule, and stop for the owner's labels.
- Then report, before and after:
  - the owner's acceptance rate per template and category, and the judge's agreement with the owner;
  - empty and repeated slots, by cause;
  - searches and rankings per submission;
  - cost per submission.

Stop.

## Decisions to put to the owner

**Answered on 2 October 2026.** The owner delegated these decisions after a senior review of the Phase 1 plan. [template-fit-decisions.md](template-fit-decisions.md) records the answers and six added decisions (18 to 23). Under the delegation, its Part 3 replaces the phase gates above: visible fixes ship first, and selection machinery is built only when a label can change a pick. Each paid pass still needs the owner's go-ahead on its written estimate and cap.

Add any others you find.

1. The owner's view (2 October 2026) answers the industry-fit decision in docs/template-analysis.md in principle: fix leftovers rather than restrict templates. Still to decide:
   - each fix, element by element, and its stand-in;
   - whether /examples keeps the source's elements;
   - whether any template is routed away on a leftover as a stopgap until its fix ships;
   - which of Meridian's defects to fix.
2. The categories, and how they are described (trades, what businesses have, or both). Also the clash table including the "unclear" row, the labels, and whether labels lapse automatically when their cause is fixed.
3. Where the category comes from, and whether a model may inform which templates a visitor sees. Allowing a model changes docs/pipeline-plan.md and the "Is this AI?" answer.
4. Choosing among the templates that fit:
   - When fewer than three unseen templates fit, whether the visitor gets fewer designs, a template that clashes, or the call, each with true words.
   - The tiers, after seeing the variety simulation: whether fit only removes clashes or also puts "suits" first, and whether Design one must come from "suits".
   - The minimum number of eligible templates per category after the fixes, and what visit 2 gets.
5. Other signals:
   - whether the chosen look steers the choice, decided after seeing the 32 look pages;
   - whether templates that the visitor's own photographs would leave mostly empty are kept out;
   - whether sentence length becomes a guard rail of its own.
6. Which structures count as clashes, and for which categories: Summit's person and date fields; Ember's and Summit's picture-led layouts for businesses with little to photograph; Aurora's window chrome; Vector's full-screen items once its guide words are neutral; Lucent's phone frame.
7. Photographs:
   - the floor and the crop limit;
   - when nothing passes: the template's empty state, or a picture from the approved set (decision 8);
   - when the judge is unavailable: the empty state or the approved set, never an unjudged picture;
   - different pictures in each design, or the best for each;
   - people and faces, including the warm look's promise of "people";
   - what circle, portrait and cut-out slots show;
   - whether per-item pictures wait for their copy;
   - whether visitors with their own photographs get stock for the remaining slots;
   - the acceptance target per template and category.
8. Whether to build an owner-approved picture set per category, the only literal guarantee there is, and how large.
9. The acceptance targets: the clash rate that wrong categories cause, the category step's agreement and "unclear" rate, the picture acceptance rate, and N and M for the range assertions.
10. Limits:
    - ceilings on added cost and seconds per submission;
    - the Pexels budget, whether production shares its key, and whether to ask Pexels for a higher limit;
    - this month's eval spend, the size of the paid copy for labels, and whether production shares the model limit;
    - the owner's labelling hours.
11. Which fixtures to add, including held-out ones, and whether to add any from the sources' own industries to test "suits" there.
12. The words that replace the tone words that name a business, and whether to rename slot keys or only map them to classes named without industry words.
13. Public wording for anything the change makes untrue.
