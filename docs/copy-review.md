# Home page copy review: the conversion pass

Reviewed 5 September 2026 against the working tree on `main`, after the owner's brief the same evening: the page exists to convert. It has two jobs, in order: get the visitor to answer the five questions, then get them to book the call. Every line earns its place by moving the visitor towards one of those two, or by removing a reason not to. Mechanism detail that does neither goes. And the visitor has to see what they get by choosing this studio for the real build: a content system they can edit, search and answer-engine readiness, phone-first design, accessibility, speed, uptime, integrations and motion.

Method: every visitor sentence read in its source file and again in its layout (screenshots of every section at 390 and 1440), each claim checked against the code and `docs/claims-register.md`, four lenses in turn (the sceptical client, the conversion copywriter, the brand voice editor, the compliance reader). The voice rules hold throughout: every sentence under 20 words, British English, counts in words, "AI" exactly twice on the page, no exclamation marks, no percentages outside the measured results, none of the words the copy test bans. Every proposed sentence below was run through those rules by script.

**Status, 5 September 2026, late evening: applied.** The owner asked for the changes to be made. Everything in sections 2, 4 and 5 is on the page, with the recommended answer taken where section 8 left a choice: the band sits between Our work and the real build (`app/_components/included.tsx`, `included-items.ts`); the Fast cell carries the process line; the card is "Go Wild"; the How it works legend is gone. The one cell that waits is Stays up: it is written and tested, and renders in place of Written for you the moment `CONFIG.care` is set (decision 10), so the grid stays eight either way. The register carries a row for every new claim (`docs/claims-register.md`), PRODUCT.md and ADR 0022 record the band and the 38 KB HTML line, and the five questions on `/start` plus the hero's field and link now sit in the copy corpus. Checks after the edits: typecheck, lint, knip and Prettier clean, 460 unit tests passing, the production build and the budget passing, and the end-to-end suite 45 passed and 1 skipped against a production server on port 3100 (the same suite against the owner's dev server, mid-recompile of ninety changed files, timed out on nine to eleven tests that each pass alone). What is still open is in section 9.

## 1. Where the page loses conversion today

1. **The value of hiring the studio is buried.** Everything the owner listed lives in one paragraph inside step 04 of a five-step process list, four screens down, in muted body text. Nothing above it says what the visitor gets by choosing this studio over a builder or another agency.
2. **Three bands end without an ask.** Our work shows six live sites and then stops. The real build ends at "It goes up at your web address." The comparison ends on a line that sends people to builders' help pages. The visitor has just been persuaded and is handed nothing to do.
3. **How it works sells machinery.** Its third beat and the tick legend describe when the pipeline starts ("while you answer, we're already working", "by your fourth answer"). That removes no fear and adds no value, and the code does not do it: the only pipeline trigger is the final submit in `app/start/_components/actions.ts`. Cut, and say the payoff instead.
4. **Process outweighs payoff.** The Taster and the real build list eight steps between them. Benefits appear in fragments. The order of the deal (see first, then decide, then pay) is the page's strongest argument and is said once, in the comparison's left column.
5. **Repetition spends words without adding pull.** "On the call" 11 times, "fixed quote" 6, "from scratch" 5, "around what you liked" 4. The spine phrases stay; the tics go.

## 2. The new band: what you get when you choose us

**Where.** Between Our work and "If you like one, here is what happens next", so the arc runs proof, value, process. The visitor has just seen six live sites; this band says what every one of them came with, and what theirs would.

**Shape.** The What you get recipe: hairline cells, two across on a phone and four across from `lg`, each with a mono label, a title and one line, `data-reveal` staggered. A mono caption under the grid for the reader who knows the terms, then the ask. Section id `included`, H2 in `titleHeading`.

**Copy.**

> [H2] Everything your real site needs, built in.
>
> [Lead] The three designs show the look. The real site is made by hand, with motion where it helps, and all of this comes as standard.

| Label | Title              | Line                                                                                         | Backed by                                                                                                                                                             |
| ----- | ------------------ | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01    | Yours to edit      | Your own content system. Change words, prices and photos yourself, whenever you like.        | Owner, 5 September 2026 (custom CMS on every build); WithU row ("the team edits it themselves"). New register row.                                                    |
| 02    | Found, and quoted  | Built so Google can show every page, and so the chat assistants people now ask can quote it. | Register row 26 (owner: search and answer-engine readiness on every build). Never a ranking promise, as FAQ 12 already holds.                                         |
| 03    | Phone first        | Most of your customers will arrive on a phone. Every page is designed there first.           | Register row 22 (Ofcom Online Nation 2025, Adults' Media Use 2026). See section 6 on the owner's figure.                                                              |
| 04    | Works for everyone | Big text, a screen reader, an old phone: it works, to the WCAG accessibility standard.       | Owner, 5 September 2026. New register row; this records decision 26 from the content plan.                                                                            |
| 05    | Fast               | Tested on a phone before launch. Anything slow is fixed before you see it.                   | Owner's commitment, 5 September 2026: new register row. A load-time figure waits on the six sites passing (section 6a).                                               |
| 06    | Stays up           | Hosted where we can watch it, so if it ever goes down we know before you do.                 | Gated: needs the care decision (decision 10) and the monitoring interval in `CONFIG.care`. Until then the cell is absent, not softened. "No downtime" is not sayable. |
| 07    | Connected          | Your bookings, payments, forms and the tools you already use, wired in and working.          | Register row 26 (owner: integrations on every build).                                                                                                                 |
| 08    | Made for you       | Designed by hand for your business, never from a template. It moves where motion helps.      | Register rows 17 and 26 (designed from scratch); owner (motion), 5 September 2026.                                                                                    |

> [Caption, mono] If you know the terms: a custom CMS, SEO, AEO, GEO and WCAG.
>
> [Ask, small] It starts with your three designs.
> [Text link] Show me my three designs
> [Small] or [text link] book a 20-minute call

Notes on the wording. Titles are two or three words so the grid scans; lines are one or two sentences so the cells stay level (the longest is 17 words). "Found, and quoted" carries both search and answer engines in the visitor's words, and the caption names SEO, AEO and GEO for the founder who searches by those terms. "Works for everyone" states the outcome and names the standard once; "fully" is left out because an absolute claim cannot be substantiated. "Made for you" carries the animation point where this audience will accept it: as care, not as effects.

If the owner would rather not add a band, the fallback is to lift step 04's second paragraph out of the process list and give it this grid inside the real build section, under the lead. The copy is the same; the arc is weaker because value then arrives after process.

## 3. Section by section

| Section              | Its job in the arc                    | Ends with an ask today                      | Verdict     | Change                                                                                                |
| -------------------- | ------------------------------------- | ------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------- |
| Hero                 | The offer and the form                | Yes: button, trigger line, call link        | Sells       | Field hint (section 5).                                                                               |
| What you get         | What the form gives, in five minutes  | Not needed: the button sits above it        | Sells       | Colours cell trimmed (section 5).                                                                     |
| How it works         | Remove the effort and spam fears      | Yes: button                                 | Rework      | Cut the legend. Lead and beat 3 rewritten to the payoff (section 4).                                  |
| Four things          | Why a site matters to their week      | Yes: text link                              | Sells       | None.                                                                                                 |
| Five answers         | Convert the viewer to the call        | Yes: call button, questions link            | Sells       | Step 03 (section 5).                                                                                  |
| Our work             | Proof                                 | **No**                                      | Add the ask | Ask under the footnotes (section 4). Card lines and lead (section 5).                                 |
| Everything built in  | Value of choosing the studio          | New                                         | Add         | Section 2.                                                                                            |
| Here is what happens | The paid step as a process; the fears | **No**                                      | Add the ask | Step 04's second paragraph moves to the new band. Step 05 gets a fact. Ask after step 05 (section 4). |
| Doing it yourself    | Fair comparison, order of the deal    | **No**                                      | Add the ask | Signpost fixed for phones. Ask after the generous line (section 4).                                   |
| Straight answers     | The four fears before typing          | No, and none needed: FAQ and closing follow | Sells       | "Is this AI?" reordered (section 5).                                                                  |
| About                | A real studio, one person             | No, and none needed                         | Sells       | None.                                                                                                 |
| FAQ                  | The remaining reasons not to          | The closing follows                         | Sells       | FAQ 5, 11, 12 (section 5).                                                                            |
| Closing              | The form, the call, the share         | Yes: all three                              | Sells       | Caption (section 5).                                                                                  |

## 4. The asks and the How it works rewrite

Exact copy. Each ask is one small line and a text link in `textLinkStyles`, the way Outcomes already ends, so no band gains a second button.

**How it works.** The legend (`HOW_IT_WORKS.legend`) is removed. The beats become:

| Line   | Now                                                                                                                                            | Proposed                                                                                                                 |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Lead   | You see one question, answer it, and the next one appears. While you answer, we're already working.                                            | You see one question, answer it, and the next one appears. Nothing to prepare, and nothing to upload unless you want to. |
| Beat 3 | By your fourth answer, we've already started on your wording. When your designs are ready, the link appears on screen and lands in your inbox. | Five answers, then about five minutes. Your three designs appear on screen, and the link lands in your inbox.            |

"Nothing to upload unless you want to" is true: the logo and photos are both skippable. The beat now says the two things a hesitant visitor wants to hear: how little it asks, and how soon it pays off.

**Our work**, under the two footnotes:

> Yours starts the same way: five questions, three designs, then a conversation.
> [Text link] Show me my three designs

**Here is what happens next**, after step 05:

> Anything you want to ask about a step, ask it on the call.
> [Text link] Book a 20-minute call

**Doing it yourself, or asking us**, after the generous line:

> See what asking us looks like first. Three designs, free, in about five minutes.
> [Text link] Show me my three designs

## 5. Line-level fixes that still stand

From the first pass, kept because each one removes friction on the way to the form or the call.

| Where                        | Now                                                                                                                                                                                         | Proposed                                                                                                                                                                       | Why                                                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Hero field hint              | Yours fills the sketch as you type.                                                                                                                                                         | Your answer fills the sketch as you type.                                                                                                                                      | "Yours" has nothing to refer to.                                                                                              |
| What you get, colours        | On every design. We keep your colour and only adjust it if text would be hard to read on it.                                                                                                | On every design. Your colour stays. We only adjust it if text would be hard to read on it.                                                                                     | Reassurance first, exception second; the tallest phone cell loses a line. Shared with question five via `SITE.colourPromise`. |
| Taster step 03               | You get a fixed quote and a timeline on the call. Then we design and build your real site around what you liked.                                                                            | With the quote agreed, we design and build your real site. It is shaped by which design you liked, and why.                                                                    | Drops the repeat of the agenda line above it; says what the designs are for.                                                  |
| Our work, lead               | Real businesses, live today. Open any of them on your phone.                                                                                                                                | Real businesses, live today, from a dog walker to a fitness app. Open any of them on your phone.                                                                               | Four of the six are apps; a tradesperson needs the range in one breath.                                                       |
| Our work, Go Wild name       | Go Wild Dog Walking                                                                                                                                                                         | Go Wild                                                                                                                                                                        | The trade line already says dog walking; the link stops wrapping on a phone. Alt texts keep the full name.                    |
| Our work, TrvlWell           | A rebrand and a rebuild, relaunched on a new identity.                                                                                                                                      | Rebranded, rebuilt and relaunched.                                                                                                                                             | It and the Mvmnt line told the same story one card apart.                                                                     |
| Our work, Mvmnt              | Rebranded and rebuilt around a new identity.                                                                                                                                                | A new identity, and a new site built to carry it.                                                                                                                              | As above.                                                                                                                     |
| Our work, WithU              | Their site as WithU became its own brand. The team edits it themselves.                                                                                                                     | Built as WithU became a brand in its own right. Their team edits it themselves.                                                                                                | The first sentence did not parse. It also now previews "Yours to edit".                                                       |
| Real build, step 04          | Body plus the second paragraph "Built so Google and the chat assistants people now ask can read every page. Your bookings, payments or forms connected. You can see how many people visit." | Body only. The second paragraph leaves; its content is the new band, and "You can see how many people visit" joins the Connected cell's evidence as analytics.                 | Value stated once, where it sells, not inside step four of five.                                                              |
| Real build, step 05          | It goes up at your web address.                                                                                                                                                             | It goes live at your web address, in place of your old site if you have one.                                                                                                   | The body repeated the title. Replacing the old site is already promised in FAQ 7.                                             |
| Options, signpost            | Builders' own help pages describe the left column, if you want to check.                                                                                                                    | What we say about builders comes from their own help pages, if you want to check.                                                                                              | On a phone there is no left column.                                                                                           |
| Straight answers, Is this AI | ... A person designs every layout, and a person builds your real site. It never sees your logo, your colours or your photos.                                                                | ... helps choose stock photos. It never sees your logo, your colours or your photos. A person designs every layout, and a person builds your real site.                        | "It" now follows "AI", not "your real site", and the answer ends on the person. No new words, so the "AI" count stays at two. |
| FAQ 5                        | No. It's a first look made in five minutes, to show you our design in your brand. If you like one, we design your real site from scratch, around what you liked.                            | No. It's a first look, made in five minutes, to show you how we design in your brand. If you like one, that tells us your taste. Your real site is then designed from scratch. | Says what the three designs are for.                                                                                          |
| FAQ 11                       | Who looks after it after launch?                                                                                                                                                            | Who looks after the site once it is live?                                                                                                                                      | "after it after"; "live" is the visitor's word.                                                                               |
| FAQ 12                       | We build every page so Google and the chat assistants people now ask can read it. Being found also takes work after launch, and we say what on the call.                                    | Every page is built so Google can read it, and so can the chat assistants people now ask. Being found also takes work after launch. We say what that involves on the call.     | Verb early; the clipped ending made sense of.                                                                                 |
| Closing caption              | A client's brief. A sketch from one sentence. A conversation starts your real site.                                                                                                         | A client's brief. A sketch from one sentence. Not one of the designs.                                                                                                          | The mono register is for labels, and the persuasive line is the Taster's H2. Four wrapped lines become three.                 |

Kept on purpose, with the conversion lens applied: the H1 and subhead (the promise and its qualifier); "Free. No sign-up. Nobody calls you unless you book."; the Outcomes lead and rows; the Taster H2 and lead; "You can also keep the link and do nothing" (permission lowers the cost of clicking); the VetPres line ("We still look after it" is the only card showing a client who stayed); the disclosure "Four of the six are brands of one group, whose rebrand we led" (the second half sells); "Builders' own help pages" as a fairness signpost (it is what lets the comparison say "we build it with you" without a competitor's name); About, whole.

## 6. The value claims and what can be said

The owner's list, claim by claim, with what the evidence supports today.

| Owner's point                           | Sayable now                                                                                    | What is needed for more                                                                                                                                                                                                                                                                                                                                                                                                         |
| --------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Custom CMS                              | "Your own content system. Change words, prices and photos yourself."                           | A register row citing the owner, 5 September 2026. This also settles decision 34 (self-editing: yes).                                                                                                                                                                                                                                                                                                                           |
| SEO, AEO and GEO optimised              | "Built so Google can show every page, and so the chat assistants people now ask can quote it." | Already a register row (26). Acronyms in the mono caption only.                                                                                                                                                                                                                                                                                                                                                                 |
| Completely mobile responsive            | "Most of your customers will arrive on a phone. Every page is designed there first."           | Already backed by Ofcom (row 22).                                                                                                                                                                                                                                                                                                                                                                                               |
| "64% of website views come from mobile" | Not on the page.                                                                               | Three reasons. The page's rule is no percentages outside the measured results. The figure is global (StatCounter, September 2026: about 60 per cent worldwide; UK page views run roughly even between phone and desktop, 46 to 54 per cent mobile depending on bot filtering). And the UK point is already made, in words, with Ofcom behind it. A wrong-for-the-UK figure is a reason for a sceptic to stop trusting the page. |
| Fully WCAG accessible                   | "Big text, a screen reader, an old phone: it works, to the WCAG accessibility standard."       | A register row citing the owner. "Fully" left out: absolutes cannot be substantiated (CAP 3.7).                                                                                                                                                                                                                                                                                                                                 |
| Super fast performance                  | "Tested on a phone before launch. Anything slow is fixed before you see it."                   | The six live sites measured 27 to 64 on Lighthouse mobile (section 6a), so no load-time line and no "super fast" yet. Lighter client sites, re-measured and filed, unlock a figure.                                                                                                                                                                                                                                             |
| No downtime                             | "Hosted where we can watch it, so if it ever goes down we know before you do."                 | Gated on decision 10 and a monitoring interval in `CONFIG.care`. "No downtime" itself cannot be promised by anyone and would fail CAP 3.7 on the first outage.                                                                                                                                                                                                                                                                  |
| Integrations                            | "Your bookings, payments, forms and the tools you already use, wired in and working."          | Already a register row (26).                                                                                                                                                                                                                                                                                                                                                                                                    |
| Animations                              | "It moves where motion helps."                                                                 | Owner, 5 September 2026. Said as care, not as effects, for this audience.                                                                                                                                                                                                                                                                                                                                                       |

**Speed.** The research already on file (`docs/research/home-page-content/outcome-copy.md`, theme 4) says a load-time promise needs measurement first. The six client sites were measured on 5 September 2026; the results and the line they support are in section 6a.

### 6a. What the six live sites measure

Google's PageSpeed Insights API refused keyless requests (HTTP 429), so the six sites were measured locally with Lighthouse 13.4.1, mobile form factor, simulated slow 4G, one run each, on 5 September 2026 between 21:10 and 21:15 UTC. Method, caveats and the re-run command are in `docs/research/home-page-content/client-site-speed.md`.

| Site                   | Score | Largest paint | Blocking time | Page weight |
| ---------------------- | ----- | ------------- | ------------- | ----------- |
| gowilddogwalking.co.uk | 27    | 12.9 s        | 3,400 ms      | 3,336 KiB   |
| vetpres.com            | 64    | 5.4 s         | 210 ms        | 4,586 KiB   |
| trvlwell.co            | 62    | 6.7 s         | 0 ms          | 918 KiB     |
| withuapp.com           | 39    | 6.6 s         | 3,190 ms      | 1,573 KiB   |
| mvmnt.com              | 34    | 9.3 s         | 2,170 ms      | 24,059 KiB  |
| urunn.com              | 32    | 23.4 s        | 9,860 ms      | 44,697 KiB  |

Lighthouse's "good" line is a largest paint under 2.5 s and blocking time under 200 ms. Layout shift is excellent on all six (0 to 0.022) and does not appear above. Everything else is over the line, and two pages weigh more than 20 MB on a phone, which is autoplaying hero video. One lab run with simulated throttling overstates what a visitor on a good connection feels; it is also exactly what a sceptical visitor sees when they paste an address into PageSpeed Insights, which the client-voice research says buyers do before they hire.

What follows for the copy:

- **"Super fast" is not sayable**, and neither is any load-time line. A visitor can disprove it in a minute with the six addresses the page hands them.
- **The process is sayable**, as the owner's commitment, and it is what the Fast cell says: "Tested on a phone before launch. Anything slow is fixed before you see it." It needs a register row citing the owner and a re-check after the first build ships under it.
- **The six sites are a conversion risk in their own right.** The work band says "Open any of them on your phone". Lighter hero media on the two heaviest pages and a look at the blocking scripts on four would move every score, and the numbers here are the baseline to measure that against. That is client work, not copy, and it is the strongest single thing the owner can do for the word "fast".
- Once the six are re-measured and pass, the cell can carry the numbers: "Every site we run loads its first screen in under three seconds on a phone." Not before.

## 7. What the changes cost

- **HTML budget.** The page measures 35,011 B against a 36,000 B line (`scripts/bundle-budget.mjs`, ADR 0022). A band of eight cells plus three asks adds roughly 2 KB and the legend's removal gives back about 300 B. Raise the line to 38 KB with an ADR 0022 amendment, as the last three sections did.
- **Tests.** The new H2 joins `no-script.spec.ts` and the id joins `reduced-motion.spec.ts` and `page-motion.tsx`; a new `included-items.ts` joins `copy-corpus.ts`; the mobile ten-screen cap may need the band added to its list. `HOW_IT_WORKS.legend` and its two icons go.
- **Register.** Four new rows (CMS, accessibility, speed, motion) and one gated row (uptime).
- **Not in the corpus today** and worth adding while touching it: the hero field label and hint, "Rather talk first?", "About the studio", and the ten lines of the five questions on `/start`.

## 8. Decisions for the owner

1. **The new band**: add it between Our work and the real build (recommended), or fold the grid into the real build section under its lead.
2. **Stays up**: record decision 10 (the studio hosts and watches every site) and the check interval, and the cell ships. Otherwise it stays out and "no downtime" is not said anywhere.
3. **Fast**: approve the process line ("Tested on a phone before launch. Anything slow is fixed before you see it.") as your commitment, or hold the cell. Separately, decide whether to lighten the six live sites before launch, since the page invites visitors to open them (section 6a).
4. **Card name**: "Go Wild" or "Go Wild Dog Walking".
5. **How it works**: confirm the legend goes. Nothing else on the page depends on it.

## 9. What is left after this pass

Copy that is written and waiting on a decision or evidence, and work the review surfaced that is not copy.

1. **Stays up.** Record decision 10 (the studio hosts and watches every site) and the check interval in `CONFIG.care`. The cell then replaces Written for you on its own; nothing else changes.
2. **The six live sites are slow on a phone** (section 6a). Lighter hero media on mvmnt.com and urunn.com and a look at the blocking scripts on four of the six would move every score. Client work, not copy, and the strongest single thing behind the word "fast". Re-measure and file the results with the Fast row; a load-time figure can join the cell once every site passes.
3. **The gated contract lines** from the content plan (decisions 6 to 10, 13, 15, 27, 32, 33, 35): payment in stages, ownership, a timeline in weeks, the check before launch, the change round, the care plan, the page set. Each is written in the plan and joins the real build, the comparison and the FAQ once its decision is recorded.
4. **Evidence to file** for the three measured results (TrvlWell, Mvmnt, URUNN): the analytics exports and the dated search screenshot the register rows name.
5. **The journey band** (`#examples`: VetPres's sentence re-run through the five questions, beside their real site) waits on a real render and VetPres's consent row.
6. **Before launch**, unchanged: the verified sending domain, the studio's contact email and town, the Vercel environment. The Cal.com link is confirmed: the owner gave `https://cal.com/pinnaclepx/quick-chat` on 5 September 2026, the address `SITE.bookingUrl` already held.
7. **Nothing is committed.** The whole of today's work sits uncommitted on `main`, alongside the template work from outside this session; branch off main before committing.

## 10. The evidence pass, 21 September 2026

The owner ran an evidence-graded review of what makes a lead-generation page convert (`docs/compass_artifact_wf-deafb080-cb89-5e00-b4c2-71b285cf9ac8_text_markdown.md`) and asked for its findings to be applied. Read against the page, most of the best-evidenced findings were already in place: one goal repeated down the page and no exit links in the nav (anchors only), the first question in the hero as a form, a first-person and specific button, a risk-reducer beside it, named and numeric results, the "what's the catch", "is this AI" and "my email" objections answered before the final ask, a native `<details>` FAQ that crawlers and answer engines can read, and copy scoring well under the reading ceiling (`reading-level.test.ts`). So this was a targeted pass, not a rewrite, in keeping with the owner's rule that the page is refined and not redesigned. Every sentence below passed `copy.test.ts` (550 unit tests green), typecheck, lint and Prettier, and was checked at 390 and 1440 on the dev server.

**Applied.**

1. **The five-second test (review section 3).** The hero subhead now opens with the audience: "For UK small businesses and start-ups." The headline keeps the outcome alone. Still thirty words, so the 390 by 844 fold holds the button. The last sentence is one risk-reducer ("Free, before you talk to anyone."); the "see how we work" clause moved out, since Straight answers' "What's the catch?" carries it. `SITE.description` says "A UK web design studio" first, for the search snippet and the WebSite schema.
2. **Proof next to the claim (section 6).** Two Outcomes rows end on a measured result: Found carries URUNN ("From unranked to page one on Google.") and Reachable carries TrvlWell ("Demo requests rose 40% after the relaunch."). The row names the client by slug and `outcomes.tsx` renders the client's own result string from `work-items.ts` (`measuredClient`), so the figure is the register's, character for character, and the copy test's exemption already covers it; a new test holds that a row can only cite a client with a result. Trusted and Answered carry none: Mvmnt's "bounce rate" is jargon to this reader, and a result on every row would read as decoration.
3. **Plainer Outcomes bodies.** "Structured data" and "local SEO" left the Found row; "speed feeds into where you rank" became "people leave a slow page", which is behaviour, not a ranking claim. Trusted opens on the register's own sentence ("People decide whether you look real before they read a word."). The lead's four "perhaps" fragments became three "maybe" sentences and a bridge.
4. **Message match between the offer and its caveats.** What you get's wording cell now says "A first draft from your own sentence, so there are no blank boxes and nothing to write.", which agrees with the FAQ's "placeholder" and sells the benefit (nothing to write). How it works step 02 no longer implies the company name is where the link goes: "Your email is only where the link goes."
5. **The call's risk reversal.** `SITE.callPromise`, under every call button: "No pitch. We look at your designs together, and you leave with a fixed quote. Go ahead only if you want to." The agenda's last line, said where the button is.
6. **The email objection (section 7).** "We send you your link, and nothing else. No newsletter, no chasing. You book a call if you want one. We don't ring you." Register rows 14 and 15 back it: the link is the only email a visitor gets and no follow-up exists.
7. **FAQ answers that were weak or off-voice.** Cost: no price on the page (owner's rule), so the answer gives what a price gives a buyer (section 8 of the review, "decision support"): one fixed number, agreed before work starts, unchanged after, what moves it, and that the designs and the call cost nothing. Care: "We can provide a post launch update and maintenance package." became "We can, if you want us to. We say what looking after it covers, and what it costs, on the call.", with the plan's terms still gated on the contract. "Can I use one of the designs" lost "Imagine what a proper conversation would give you." "What if the wording is wrong?" now opens "Some of it will be."

**Decisions for the owner.**

1. **A "starting from" price.** The strongest recommendation in the review that the page does not follow (section 8: 81 per cent of B2B buyers want to find a price themselves; 16 per cent cross off a supplier who hides it). It is blocked by the no-price rule. If the rule is ever relaxed, one anchor ("Sites start from £N") in the cost FAQ and the comparison's "How you pay" row is the place, and it needs a real number and a register row.
2. **What moves the quote.** The cost FAQ now says "how many pages you need and what has to connect, like bookings or payments." Confirm this is how the studio prices, or say what is. Register row added, marked owner to confirm.
3. **A named person.** The review counts a named human among the trust signals a free offer with AI in it needs (section 7). About says "one-person studio" but not who. The Cal.com page already shows the name. Adding it is one word in `ABOUT.first`; the no-photo rule is untouched either way.
4. **The logo strip's disclosure.** Section 6 warns that logos from one parent group, shown as breadth, invite scepticism, and recommends disclosing the relationship next to the logos. The page discloses it in the work band ("Four of the six are brands of one group"), four sections down. A caption under the hero strip would cost fold space on a phone; a screen-reader label is free. Left as is pending the owner's view.
5. **The headline.** "See your new website before you hire." names the outcome, not the audience, and promises a website where the offer is three homepage designs. It was kept: the subhead now names the audience, the fold is tight, and the six-word promise is the page's identity. If a five-second test (Lyssna or Maze, review section 3) shows visitors cannot say what the offer is, "See three designs for your new website before you hire." is the honest longer form.

**Not done, and why.** Removing the header nav (section 10 of the review): the links are all anchors, which the review allows, and the footer's only exits are the privacy notice and the booking page. Cutting the secondary call button: the review itself notes a demoted "book a call" route captures high-intent buyers on high-consideration services; it is a text link everywhere except the Taster, whose job is the call. Scroll-depth and conversion heatmaps (section 10, Stage 3): instrumentation, not copy, and the right next step before any further structural change.

## 11. The five decisions, 21 September 2026

The owner asked for the five decisions left open in section 10 to be made for them, with one instruction on the price: it has to cover the ads, pay the owner and pay the contract designers, and still be the best price the customer can be given. Decisions 2 to 5 were made on the evidence already in hand. The price was worked through a twelve-agent pass: five researchers (UK market prices, ad and funnel costs, labour rates, the rules on "from" prices, the studio's cost to serve; every figure sourced and graded), three pricing strategists (cost-plus, market-anchored, funnel-optimised), a judge, and three refuters (viability, compliance, market). Everything below is applied and tested (551 unit tests, typecheck, lint, knip, Prettier; the FAQ and the comparison row checked at 390).

### 11.1 The price: £4,750 for a five-page site, £250 a page beyond it

**The number.** A five-page site with one form or booking connected, wording, a content system and the launch included, is £4,750. Extra pages are £250 each; bookings, payments and other tools are quoted by what they are. Both figures live in `CONFIG.price` and render through `printedPrice` and `PRICE` in `lib/site.ts`, so the page never carries a typed digit and one edit changes every instance.

**Where it appears.** Four places, never the hero (the studio's own research: a hero price reads budget-tier, `home-page-design-research.md`). The cost FAQ, in full; the "How you pay" row, as the figure against a builder's monthly fee, with care after launch named beside it so a one-off against a subscription does not mislead by omission; the designs page (`app/preview/[slug]`), above the call button, after two sentences that set the taster apart from the build so the reader prices a hand-built site and not the three designs above it; and the emailed link, the same two lines above the booking address. **Owner action:** paste `PRICE.taster`, `PRICE.build`, `PRICE.scope` and `PRICE.basis` into the Cal.com event description, so nobody arrives at the call surprised; and carry no price in an ad, or the identical qualified sentence, never a bare "from £4,750" (the ASA's DFDS test).

**How the number was reached.** The judge priced bottom-up and checked against the market. The smallest paid-channel job costs about £4,140 fully loaded: the owner 48 hours at £45 (£2,160; the ONS median for web design professionals over about 1,100 billable hours, lifted for the holiday and National Insurance a sole trader carries); a contract designer 16 hours at £48 (£768; YunoJuno's £385 design day rate); £1,125 of ads per signed client (£3 a click, the evidence midpoint for plain UK terms like "website for my business", through a funnel of 6 in 100 clicks to a taster, 15 in 100 tasters to a call, 30 in 100 calls to a signed build); and £87 of overhead, free tasters (about 30p a run at Anthropic list prices, roughly 22 runs a client) and launch-month hosting. The judge rounded to £4,500. The viability refuter rejected that: the £360 buffer is a third of an ad line that is the product of three unmeasured rates, so any one of them missing by a quarter, or £1 on the click, or eight more owner hours, makes the from-price job a loss; and the £982 of monthly "profit" is already about 22 hours of the owner's unbilled sales, ad and admin time. Its fix was £4,750, which gives the smallest job a £610 buffer (tolerating clicks-to-taster down to about 3.9 in 100, or calls-to-sign down to 20 in 100, before it loses money) while still reading "under five thousand", £250 under Fit Design's £5,000 without copy, and clearly above the £499 to £1,850 productised tier the page positions against. The market refuter confirmed the placing: the UK studio band for design alone is £3,000 to £8,000 (Media Village £3,000 to £4,500 for five pages; wat.studio £3,500 to £6,500), copy is usually £1,150 or more on top (Let Me Write: £350 for a home page, £200 a page), and every published UK price under £4,000 leaves out copy, accessibility and answer-engine readiness. A typical six or seven page build with two connections costs about £4,880 and quotes at about £5,750, so the from-to-typical gap is real scope, not a decoy.

**The monthly model it rests on** (paid channel only; every referral client, and the studio has thirty sites of them, adds about £1,125 straight to margin): £2,250 of Google Search spend buys 750 clicks, 45 tasters, about 7 calls and 2 signed builds; revenue about £10,500; designers £1,824; the owner £4,770 for 106 build hours (about £57,000 a year) plus about 22 unbilled hours; overhead £174; about £1,480 left after the unbilled hours are counted.

**Why not lower.** £4,500 pays everyone only if all three funnel rates hold, and nothing is left for one revision round. £3,500 pays everyone only if the owner does the whole build in 35 hours at £40 with no unpaid sales time, under every hours guide found (70 to 110 hours for this scope); £3,000 pays the owner about £26 an hour. Every published price below £4,000 is a different product. The best price for the customer is the lowest honest one, and honest means the designer and the owner are paid.

**Why not higher.** £5,000 copies Fit Design's number and reads agency to a wary small-business audience, which undoes the page's position between builders and agencies. A higher from price does not raise the typical quote, which pages and connections set on the call; it only narrows who books the call, the cheapest lever in the funnel, and makes the ASA's significant-proportion test harder because fewer builds would land at the printed figure.

**Conditions that keep the number on the page.**

1. **Quote log from day one.** Every quote issued, with pages and connections. Over any rolling six months at least a quarter of signed builds must be at £4,750 (the ASA passed Accor at 23 in 100 spread evenly and failed Octopus at 5.8, FlixBus at 6, Better Bathrooms at 8.6). Review quarterly; if fewer than a quarter land there, raise the printed figure to what a quarter actually pay. The five-page scope is offered on every call and never upsold away: it is a real product with a real delivery (CAP 3.22, CMA209 3.2).
2. **Scope and basis beside the figure, every time, in the same type size** (DMCC Act 2024 s.230, CMA209 4.16 and 4.23). `PRICE.scope` and `PRICE.basis` are the only sentences that carry the number for that reason; nothing renders `CONFIG.price.from` bare.
3. **The two qualifications sit in the same sentence as the promise they qualify** (CRA 2015 s.50(2)): "It does not change unless you ask for more, and then we quote that in writing first."
4. **VAT.** The number assumes the studio is not VAT registered (thirty sites in four years implies turnover under the £90,000 threshold). While unregistered, no VAT wording anywhere: showing VAT unregistered is penalised (Finance Act 2008 Sch 41). Check the rolling twelve-month turnover monthly; at the modelled £10,500 a month the threshold is crossed in about month nine. When registration comes, flip `CONFIG.price.vatRegistered` and every instance becomes "£5,700 including VAT" with equal prominence, never "plus VAT", because the audience is mixed and mostly cannot recover it (CAP 3.18). Never absorb it: £4,750 inclusive nets £3,958, under the £4,140 floor. From about £80,000 of rolling turnover, quote builds that will invoice after the expected registration date at the inclusive figure, so no in-flight build is honoured below the floor. Honour any quote already issued at the price on the quote.
5. **Measurement gate before the ad budget scales.** Run a first tranche of about 500 clicks (£1,500) to read clicks-to-taster; pause ads whenever the trailing cost per signed client over the last three exceeds £1,700; do not scale past £750 a month until three signed builds have come through paid ads. Time the next three builds: if owner hours pass 58 on a typical build, the typical quote moves first; the from price rises only if the quote log says so.
6. **Total price.** The figure includes the domain set-up, the launch and launch-month hosting (s.230). Care after launch is optional and priced on its own, and the client can host elsewhere if they decline it; its terms stay gated on decision 10.
7. **Held back until the log supports it:** "Most builds land between £4,750 and £6,500", an objective claim with no history behind it at launch (CAP 3.7).

**Inputs the owner can change, each with the value assumed:** owner hours 48 on the smallest build and 58 on a typical one; owner rate £45 an hour; designer £48 an hour for 16 and 22 hours; £3 a click and £2,250 a month; the 6, 15 and 30 in 100 funnel; overhead £150 a month; copy written by the owner from the AI draft in 6 to 8 of the owner hours (outsourcing at £440 a day adds about £660 a build and would push the from price to £5,000). Every one is a line in the model, and none is measured yet: the gate above measures them.

### 11.2 The quote basis: pages and what has to connect, confirmed

All three strategists and the hours evidence agree that time scales per page (about 4 to 10 hours a page) and per integration (a booking £200 to £1,000, a CRM £500 to £3,000 at contractor rates), so the basis the cost FAQ stated is the honest one. It is now a rate card: £250 a page, connections by what they are.

### 11.3 The owner is named

"If you like one, you talk to Omar Mahmoud, who runs the studio." in About, and `founder` on the Organization schema, so the entity is one person everywhere an answer engine looks. The booking page already showed the name; the no-photo rule is untouched. The old line "that is the same person all the way through" went, because the owner pays contract designers on builds: the new line, "Omar stays on your build from the call to launch", is true of the person and claims nothing about who does every task. `SITE.owner` holds the name.

### 11.4 The logo strip discloses the group, and drops the two unnamed marks

"Companies we have designed and built for. Four of them belong to one group." under the strip, at every size. It costs nothing on the phone fold, which the strip was already below, and reads at 1440 under the six marks. The two marks the owner supplied without a name (the "n" and the "VA") left the strip: an unnamed logo is decoration to the visitor who does not know it and a liability to the one who does, and the review's rule is logos only if recognisable and evidenced. They return the day the register names each brand and what was built for it. **Still to file before launch:** what was built for Sky and when.

### 11.5 The headline stays

"See your new website before you hire." The audience now sits in the first line of the subhead, the fold is tight, and the six-word promise is the page's identity. The honest longer form ("See three designs for your new website before you hire.") is recorded in section 10 for the day a five-second test says the offer is not landing; until a test says so, the identity wins.

### 11.6 The owner's override: websites from £679 (21 September 2026, later the same day)

The owner set the starting price at £679 in place of the pass's £4,750. Applied as `CONFIG.price = { from: 679, perPage: 250, pages: 1 }`, so every instance now reads "A one-page site with a contact form is £679." with the rate card unchanged beyond it: extra pages £250 each, bookings, payments and other tools quoted by what they are, one fixed quote on the call. A five-page site therefore quotes at £1,679 and a typical six or seven page build with two connections at about £2,500 to £2,800.

**Why the scope is one page.** A printed price has to be one the studio genuinely sells at (CAP 3.22, CMA209 4.19), with what it buys beside it (DMCC s.230). The pass costed the five-page build at about £4,140 fully loaded (48 owner hours, 16 designer hours, £1,125 of ads, overhead); £679 covers about fifteen owner hours at £45 and nothing for a designer or ads, which is a one-page site the owner designs and builds alone. To print £679 for the five-page scope instead, set `pages` to 5 in `CONFIG.price`; nothing else changes.

**What the override changes in the model.** At £679 the smallest job cannot carry an ad cost: the paid channel only works if the typical quote, not the from price, pays for it, and the ASA condition in 11.1 now applies to £679 (a quarter of signed builds over any six months must be one-page sites at that figure, or the printed number rises to what a quarter actually pay). The design research's finding that a low price reads budget-tier (`home-page-design-research.md`, Appero "from £499") still stands, which is why the number stays out of the hero. The conditions in 11.1 (quote log, scope and basis beside every instance, the VAT flip to "£815 including VAT", the ad stop-loss) are unchanged.

## 12. The mandate pass, 22 September 2026

The owner's brief that morning: the page is text heavy and repetitive; it is about the five
questions and the three free designs when it should be about the website the studio would build;
the visitor should finish it believing the studio can build them the best possible site; the
voice should be professional, and fun and cool with it; the hero is out of scope.

**Method.** Eight research lenses (page structure, end-product copy, twenty-five live studio home
pages, brand voice, buyer language, text density, one-person-studio credibility, and this repo's
own prior research), a completeness critic that sent four gaps back for study (pricing
presentation, the walkthrough's captions, the closing and footer, and what "cool" means for a
trust-dependent service), then a marketer, a copywriter and a designer auditing the page
independently, a creative director settling the plan, three drafts written to different angles,
three judges scoring them band by band, one assembly, and four adversarial verifiers
(compliance, voice, mandate, mechanics) whose 61 findings, 14 of them must-fix, were applied
before the wording shipped. The decisions are in `docs/adr/0033`.

**What shipped.** Nine bands where there were twelve, 1,189 visible words where there were 2,262,
and the served HTML down from 38 KB to 33.5 KB gzipped. Work moves to first after the hero.
Outcomes and Included merge into one band about the site (`#included`): four jobs, each a label,
a scene and the two things built in to do it. The Taster and the real build merge into one
process band (`#real-build`) ending on the call. What you get is cut, its two facts rehoused in
the walkthrough's lead and the details answer. The FAQ goes from eleven items to seven, losing
the five that restated the taster and gaining "Who will I actually work with?". The closing opens
on the finished site and closes on the free step.

**The repetition it removes.** "Three designs" eighteen times to five, each doing a different job
(shown, compared, defended, priced against, asked for); "real site" eleven to one; "on the call"
twelve to three; "five minutes" eight to two; "every page" ten to six; "designed by hand" five to
three. Every ask line under a band is gone: the button is the ask.

**What it refuses to say.** No superlative about the studio's work, no enquiry or ranking promise,
no class claim about agencies or builders, nothing gated (ownership, payment terms, weeks, the
care plan, training data, reply times). "Google can show every page" and "the chat assistants can
quote it" are withdrawn to what register rows 26 and 29 actually say, "read". The Answered scene
loses "More people who arrive ready." because no row covers enquiry quality.

**Open for the owner** (the full list is in the session's plan; these are the ones that change
what is on the page): the closing heading replaces the hero's bookend; the build heading is no
longer the pinned "If you like one, here is what happens next."; About says "since 2021" while
register row 31 says 2022, so the row needs amending with the owner's record before this ships;
`SITE.description` is the search snippet and now names the product; the worked five-page total
(£1,679) is new and renders from `CONFIG.price`; and the one gap the pass could not close, that
nothing on the page says the finished design will be good rather than merely complete, which
needs a register row about how the six client sites were designed plus one checkable line under
their cards.
