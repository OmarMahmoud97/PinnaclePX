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
