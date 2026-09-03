# PinnaclePX home page: the build plan

Prepared 2 September 2026 from four independent proposals (a businessman, a copywriter, a developer and a sceptical business owner), three judges, a synthesis and three adversarial verifiers. This replaces the first plan of the same day. The research it rests on, with four corrections, is `docs/home-page-research.md`.

## 1. The business logic

The visitor is a UK small business owner who has been burned or quoted by an agency and arrives doubting everything, so the page must earn one small act, typing a sentence about their business, before it asks for anything that costs them. Every section below the hero removes one reason not to type: what it costs (nothing), what happens to the email (a link, no calls), what will be asked (five short things, one at a time, no phone number, no budget), what comes back (three first-look homepage designs and a shareable link), and who is behind it (a named UK studio with a town and an email address). The three designs are a taster, so the page must say so above the fold, then turn "they did that in five minutes" into "what would they do with an hour and everything I know about my business". The 20-minute call is the answer to that question, and it is always the visitor's choice. The only number that matters on this page is how many visitors start question one and reach a preview; a start that never reaches a preview never books a call. None of this can be measured until the pipeline exists (section 8, order of work).

## 2. The persuasion arc

| #   | The thought the visitor must have                                                                             | Section that produces it                                |
| --- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 1   | "I can see designs before I commit to anyone. That is the opposite of last time."                             | Hero headline and subhead                               |
| 2   | "The first thing they want is one sentence about my business. That is easy and it costs nothing."             | Hero: the live question one, helper line, click trigger |
| 3   | "I know exactly what I will have in five minutes, and that it is a first look, not the site."                 | Hero subhead, What comes back                           |
| 4   | "It is one question at a time, nothing scary is coming, and they are already working while I answer."         | How it works                                            |
| 5   | "The three designs are a taster. The real site comes from a conversation, and the call is free and optional." | Five answers is the taster                              |
| 6   | "They have answered the things I was worried about, in my words."                                             | Straight answers                                        |
| 7   | "There is a real studio in a real town, and I can email a person."                                            | About the studio, footer                                |
| 8   | "Nothing left to worry about."                                                                                | FAQ                                                     |
| 9   | "I have read it all. I will type the sentence now."                                                           | Closing section (the live question again)               |

## 3. Page structure, top to bottom

Copy is final unless marked [owner] or [gated]. Every sentence of final copy is under 20 words. Evidence is a URL from `docs/home-page-plan.md` section 12, "practitioner opinion", or "business reasoning". Anything attributed to the build guide is marked [build guide]; the guide is the PDF of 1 September 2026 and is not in the repository (section 9, item 8). Each section says when it can ship: **now** (no backend), **with the form route** (section 8, phase C), or **with templates** (t01 to t10 rendering).

### 3.1 Header

- Job: get out of the way; give one way to start from anywhere on the page.
- Copy: nav "How it works", "About", "FAQ". Button "Show me my three designs".
- Visual: unchanged fixed header. The button's href is `/#start` everywhere (one `CTA` constant, the same shape as today's `/#how-it-works`, so `typedRoutes` is satisfied). `id="start"` sits on the hero textarea with `scroll-mt-20` so the fixed header does not cover it; the fragment sets the sequential focus start point, and `TrackedLink` (already a client component) calls `focus()` when the target exists on the current page. Add "Examples" to the nav only when the examples section ships. The header button stays `hidden md:inline-flex`; on mobile the hero field is in the first screen and the menu holds the CTA (practitioner opinion; revisit after a baseline). Ships: href change with the form route; everything else now.
- Evidence: https://www.julian.com/guide/growth/landing-pages (navbar first); https://www.navattic.com/report/state-of-the-interactive-product-demo-2026 (80% of top demos have a CTA above the fold or in the navbar).

### 3.2 Hero with the live first question

- Job: make the visitor type a sentence about their business, and say above the fold that the designs are a first look.
- Copy: see section 4.
- Visual: the real question one form, not a picture. Ships with the form route. Never ship a field that posts nowhere.
- Evidence: https://www.nngroup.com/articles/scrolling-and-attention/ (57% of viewing time above the fold); https://marketingexamples.com/conversion/landing-page-guide (show the product in action); https://www.navattic.com/report/state-of-the-interactive-product-demo-2026 (ungated beats gated on engagement and completion); https://copyhackers.com/optimize-your-business-online-training/calls-to-action/ (click trigger); https://10web.io/ (live input in the hero) and https://www.relume.ai/ (shows a brief input in the hero; not confirmed live); https://unbounce.com/conversion-benchmark-report/ (83% mobile, grade 5 to 7 copy). First-person button copy ("Show me my three designs") is practitioner opinion; no source in the list reports the my/your test.

### 3.3 What comes back (replaces the proof strip)

- Job: answer "what exactly will I have in five minutes" in the visitor's words, so the sentence feels worth typing.
- Copy, four cells:
  - **Three designs, not one.** Different layouts, so you can see what suits you.
  - **Your logo and your colours.** On every design. We keep your colour and only adjust the lightness so text is easy to read. [build guide]
  - **Copy written from your answers.** Your services, your area, your words.
  - **A link you can share.** Send it to a partner or a colleague. It stays live for 30 days. [30 is the owner's decision of 3 September 2026; the build guide's Step 15 said 90; render it from `CONFIG.retention.days`]
- Visual: the existing hairline four-cell grid and icons (`proof-strip.tsx`). Drop "Accessible by construction (WCAG AA)" and "10 hand-built designs": both are planned, neither exists yet (all ten templates are placeholders; no contrast solver in `lib/`), and neither is a deliverable the visitor can picture. Ships now.
- Evidence: https://www.nngroup.com/articles/how-users-read-on-the-web/ (objective language +27%, users detest marketese); https://credibility.stanford.edu/guidelines/index.html (restraint with promotion). The reframing from product facts to deliverables is business reasoning.

### 3.4 How it works: one question at a time

- Job: remove the fear of a long form, and make "five minutes" believable by showing that work starts while the visitor is still answering. Do not list the questions: the owner's objection was to seeing them all up front, and a five-item sentence is the same information in a smaller font.
- Copy:
  - H2: **One question at a time.**
  - Lead: You see one question, answer it, and the next one appears. While you answer, we're already working.
  - Scope line: Five short questions. The first is a sentence or two about your business. The rest appear one at a time.
  - Reassurance line: No phone number. No budget question. No account. Skip anything you don't have.
  - Under the visual: By your fourth answer, we've already started on your copy. When your designs are ready, the link appears on screen and lands in your inbox.
  - Button: Show me my three designs (`/#start`). Click trigger: Free. No account. Nobody calls you unless you book.
- Visual: one "progress panel" card, not five form pictures. It shows "Question 4 of 5" with four of five segments filled and a short status list with check icons: "Your sentence: read" (ticked), "Three designs: chosen for you" (ticked), "Your copy: underway" (in progress). It names no unanswered question and shows no design placeholders. The ticks match when each stage starts [build guide]: brief on the sentence's submit, selection and copy on the logo's submit, so the panel is true under either question order in section 5. "Underway" is used because `CONFIG.stageBudgetMs.copy` is 60 seconds and the stage may have finished or fallen back by question four. Keep the sticky left column layout. Remove the gradient text and the Sparkles badge (they read as SaaS launch styling to this audience: practitioner opinion). Built at `app/_components/progress-panel.tsx` from `Badge`, Lucide icons and the card classes copied out of `form-step-mockup.tsx` before that file is deleted. Ships now.
- Evidence: https://www.nngroup.com/articles/page-fold-manifesto/ (users scroll when there is reason to); the owner's instruction of 2 September 2026 (business reasoning). The on-screen link is the guide's countdown-then-preview behaviour [build guide]; the email is question two's stated purpose.

### 3.5 Examples (deferred)

- Job: show real output so the visitor believes the designs exist.
- Copy: H2 **Three businesses, nine designs, all from five answers.** Card label: Example brief, not a client. Link: Open the live preview.
- Visual: Mvmnt, VetPres and Go Wild Dog Walking, three concept thumbnails each, rendered from real templates and linking to real `/preview/[slug]` pages. Ships with templates t01 to t03 and the preview route. Every template in `templates/` renders only its own name today. Ship nothing in this slot until then: no mock browser frames, no grey bars, no stock photography. A sceptic reads a fake preview as the agency lying on the first page.
- Evidence: https://www.mixo.io/ and https://durable.com/ (real example sites and template galleries); https://www.nngroup.com/articles/photos-as-web-content/ (users study information-carrying images and ignore filler); https://credibility.stanford.edu/guidelines/index.html (avoid errors and false claims).

### 3.6 Five answers is the taster (replaces "What happens after the preview")

- Job: turn "they did that in five minutes" into "what would they do with an hour", and make the call the obvious next step.
- Copy: see section 6.
- Visual: the two-column hairline layout `next-steps.tsx` uses today, heading and button left, three numbered lines right. No imagery. Ships now; the Cal.com link must be real before the page goes public.
- Evidence: the owner's statement of 2 September 2026 (business reasoning); https://www.julian.com/guide/growth/landing-pages (the closing story continues the headline); https://copyhackers.com/optimize-your-business-online-training/calls-to-action/ (click trigger under the secondary button).

### 3.7 Straight answers (replaces "Not another AI website builder")

- Job: answer the five fears a burned buyer has, in the order she has them. She is comparing you to the agency that let her down, not to Wix.
- Copy, H2 **Straight answers.** Five cells, each a question and a short answer:
  1. [gated: ships with templates] **Will it look like everyone else's?** Ten layouts, each designed by a person at the studio. Your logo, your colours and your words go on top. The full site is built from the one you pick, not copied from it.
  2. **Is this AI?** Partly, and we'll tell you where. AI drafts your copy from your own sentence and helps find photos. A person designs every layout. AI never picks the layout, your colours or your logo.
  3. **What do you do with my email?** We send you your link. You book a call if you want one. We don't ring you.
  4. **What if I don't like any of them?** Come back with the same email and we show you designs you haven't seen yet, up to nine in all. Or book the call and tell us what's wrong.
  5. **Am I locked in?** No. The preview is free and there is nothing to cancel.
- Visual: the existing `features.tsx` grid, four cells until the templates render, then five. Icons as today. Ships now (four cells).
- Evidence: https://www.julian.com/guide/growth/landing-pages (3 to 6 items, each handling an objection); https://marketingexamples.com/conversion/landing-page-guide ("would this help me sell in person?"). Item 2 matches the guide (AI writes copy and image search queries and ranks photos) [build guide]; item 4 restates the returning-email rule, bounded at nine because ten templates minus three per visit is exhausted on the fourth visit (what happens then is section 9, item 5). The choice of fears is practitioner opinion.

### 3.8 About the studio

- Job: prove there is a real organisation with a place and a person to email.
- Copy: H2 **About the studio.** Pinnacle PX is a web design studio in [town], UK. Most agencies ask you to commit before you have seen anything. A quote, a deposit, a six-week wait, then a first draft you might not like. We would rather show you first. Answer five questions and look at three designs in your own brand. Only then decide whether to talk to us. If you do, you talk to the people who will build your site. Email us at [contact email].
- Visual: text only, as today (`about.tsx`). No founder photo. Ships now; the section does not do its job until the town and email are supplied.
- Evidence: https://credibility.stanford.edu/guidelines/index.html (show a real organisation, make it easy to contact you).

### 3.9 FAQ

- Job: catch the remaining reasons not to type, in the sceptic's order. Because the questions are no longer listed anywhere visible, item 3 is the one place the full list lives, collapsed behind `details` for the visitor who wants it. Items 3, 4 and 5 carry the pre-flight reassurance and must not be cut.
- Copy, nine items:
  1. **Is it really free?** Yes. The three designs and the link are free. You pay only if you ask us to build the site.
  2. **Will someone call me?** No. You book a call if you want one.
  3. **What will you ask me?** What your business does, then where to send your link: your name, company and email. Then your logo, your photos and your colours, one at a time. No phone number and no budget.
  4. **How long does it take, and do I have to wait?** Answering takes a couple of minutes. Your designs are ready within about five minutes of your last answer. Watch them appear, or close the tab and use the emailed link. [build guide: countdown starts on the fifth answer]
  5. **Do I need a logo or brand colours?** No. Without a logo we set your company name as a wordmark. Without colours you pick a palette you like.
  6. **What happens to my details?** We store your name, email, company and what you upload. That is what we need to build your preview and send your link. We delete them after 30 days unless you have booked a call. Read the privacy notice. [the last sentence ships only with the link]
  7. **Can I use the preview as my website?** Not directly. It is a preview of the direction. If you like one, we build the full site from it.
  8. **What does the full site cost?** We give a fixed quote on the call, once we know what the site needs.
  9. **What if the copy is wrong?** Tell us on the call. The first draft is a starting point written from your one-sentence description.
- Visual: native `details` elements as today. No FAQPage schema. Ships now, minus the privacy sentence.
- Evidence: https://developers.google.com/search/blog/2023/08/howto-faq-changes (FAQ rich results are shown only for authoritative government and health sites); https://marketingexamples.com/conversion/landing-page-guide (FAQ handles objections). Item 8 respects the no-price decision; items 3 and 5 restate the guide's fallbacks [build guide].

### 3.10 Closing section

- Job: give the visitor who scrolled everything a second chance to type without scrolling back up.
- Copy: H2 **Your three designs are five questions away.** Sub: Free. No account. Nobody calls you unless you book. Then the same question-one field and button as the hero. Below: or book a 20-minute call.
- Visual: the hero's question-one component with the glow backdrop, so the bottom of the page is an input, not a button that scrolls to the top. Ships with the form route; until then the current button stays.
- Evidence: https://www.julian.com/guide/growth/landing-pages (repeat the CTA). That the visitors who reach the bottom are the warmest is practitioner opinion.

### 3.11 Footer

- Job: confirm the business is real and let the visitor check the privacy notice.
- Copy: Pinnacle PX, [town], UK. [contact email]. Privacy notice. Groups: "The five questions" (How it works, Straight answers, FAQ) and "Studio" (About, The taster, Book a 20-minute call). Brand line and copyright as today.
- Visual: existing three-column footer. Rename "Product" to "The five questions"; a physio owner is not buying a product. Ships now; town, email and privacy link wait on the owner.
- Evidence: https://credibility.stanford.edu/guidelines/index.html (address and contact details).

## 4. The hero in full

**Headline (H1):** See your new website before you hire anyone.

Keep the current line for launch. It names the desire and the fear in eight words, and `SITE.tagline` feeds the metadata and the Open Graph image. The e2e test hard-codes the string rather than importing `SITE.tagline`, so any headline change updates `e2e/home.spec.ts` by hand (section 8). The subhead carries the taster framing so the promise is honest above the fold. Once traffic exists, test "See three homepage designs in your own brand before you hire anyone." as the first sequential test; `SITE.tagline`, the OG image and the e2e test change together.

**Subhead:** Tell us what your business does in a sentence or two. Four short questions and about five minutes later, you'll see three first-look homepage designs in your logo and colours. A taste of how we work, free. Then decide whether to talk to us.

**The first question, presented as a real form inside the hero:**

- Card header: "Question 1 of 5" on the left, a five-segment progress bar on the right with the first segment filled in the brand colour. The text is read by screen readers; the segments are decorative.
- Label: **What does your business do?**
- Visible example line under the label, not a placeholder (placeholders vanish on focus): For example: Physiotherapy clinic in Sheffield. Sports injuries, post-op rehab, same-week appointments.
- Field: one textarea, three rows, 16px text (avoids iOS zoom on focus: practitioner opinion), no autofocus (it would pop the keyboard and scroll the page on load). A quiet character hint shows the limits from `CONFIG.brief.minChars` and `maxChars` [owner: set them; "a sentence or two" means the minimum is one short sentence].
- Helper line under the field: Next we'll ask where to send your link.
- Primary button, directly under the field, full width on mobile: **Show me my three designs**
- Click trigger inside the card under the button, at every breakpoint: Free. No account. Nobody calls you unless you book.
- Secondary, a text link below the card, not a second button: Rather talk first? Book a 20-minute call.

**Layout:** desktop (lg and up) two columns, headline and subhead left, the card right, all above the fold at 1440x900 under the 64px header. Below lg, stacked: headline, subhead, card, secondary link. Target, not yet measured: at 390x844 the headline, subhead, field, button and trigger share the first screen with the header. A Playwright assertion at 390x844 checks that the hero submit button's bounding box is inside the viewport before any scroll. If it fails, hide the subhead's third and fourth sentences below `md` (keep the taster sentence) rather than shrinking the field. Keep the glow backdrop and corner ticks. No browser frames, no design placeholders, no photo.

**Why the first question is the visual:** the sceptic wants to see the product working, and typing a sentence about her own clinic is the product working. The only honest visual available while the templates are placeholders is the mechanism itself.

**The click trigger's job:** Copyhackers: before clicking, the visitor is "wondering what's on the other side of that button", and the line under the button can tell them. Here it answers the two fears that stop a burned buyer (cost, the sales call). The helper line pre-warns the email ask so question two is never a surprise (practitioner opinion).

**Validation and states:** zod, server side, minimum and maximum length from `CONFIG.brief`. An empty or too-short field returns an inline error under the field and keeps the visitor's text. Pending: the submit button is a child of the form reading `useFormStatus`, disabled while pending, label "Sending", `aria-busy` on the form, so a slow 4G round trip cannot double-submit. Server error (database or cookie failure): inline "Something went wrong on our side. Your text is still here. Try again." Rate limited: inline "Too many tries. Wait a minute and try again." A honeypot field and the rate limit sit in the question-one Server Action and again in the question-two action; no CAPTCHA at question one.

**Accessibility:** the label is a real `label`; `aria-describedby` joins the example line, the helper line, the character hint and the error; `aria-invalid` on error; the error sits in a live region so screen readers hear it after `useActionState` returns; the honeypot is `aria-hidden`, `tabIndex={-1}`, `autoComplete="off"`; the muted trigger text over the glow must pass AA at its lightest point; the closing section's visually hidden form heading sits under its H2 in heading order.

## 5. Representing the multi-step form, and the question order

### How the form appears on the page

Question one appears as a live form twice (hero and closing section), sharing one component and one zod schema with the `/start` route so the three cannot drift. It is the only question shown as a form anywhere on the home page. The other four are represented by:

- the "Question 1 of 5" count and the progress bar, which say "short" without listing anything (the number five is already in the subhead);
- the helper line, which names only the next question;
- the scope and reassurance lines in How it works, which name no question beyond the first;
- the progress panel, which shows one-at-a-time and background work at "Question 4 of 5" without naming the unanswered questions;
- FAQ item 3, collapsed, for the visitor who wants the full list [owner: confirm this satisfies "not all the questions from the start", section 9 item 6].

The five form mockups, the "Question 1 to 5" list, the five-topic sentence and the grey "Design n ready" result card go.

Trade-offs of embedding question one: it removes a click and makes the button label true on tap; it costs one small client component in the hero (the standards say keep client leaves small; a textarea with `useActionState` qualifies); it means the hero form must post somewhere real, so the hero field ships only when the whole funnel can return a preview (section 8, order of work); and it creates two entry points on one page, which need distinct form ids and heading text for screen readers and a `location` field on the analytics event.

### Recommendation on question order: business sentence first, identity second

The build guide asks identity first. This plan recommends the sentence first, recorded as a deviation in `docs/adr/0003`. The owner must decide (section 9). The page copy in sections 3 and 4 is written for sentence first; the identity-first fallback below lists every line that changes.

What the visitor experiences: sentence, then "Where should we send your link?" (name, company, email), then logo, photos, colours. Still five questions, so all the copy stays true. What the server experiences: the sentence is held in a short-lived httpOnly cookie set by the question-one Server Action; the question-two action receives name, company and email, reads and re-validates the cookie, computes the HMAC identity, creates the lead in one database transaction, then sends the brief event, then clears the cookie. The event send is a network call and cannot sit inside the transaction. If the send fails, the action logs it (no personal data) and returns the server error state so the visitor retries; the lead insert is keyed on the identity hash, so the retry cannot double-create. No database row exists before the email, so the guide's invariant "identity creates the lead" still holds.

Business trade-offs:

- For sentence first: the first act is harmless and feels like the product working. The visitor has invested before the email is asked, and the email is framed as delivery, not as a gate. One, possibly two, of the four closest competitors put the brief input in the hero (https://10web.io/ live; https://www.relume.ai/ shown, not confirmed live). Navattic found ungated demos beat gated ones on engagement and completion (https://www.navattic.com/report/state-of-the-interactive-product-demo-2026). There is no anonymous lead row to clean up.
- Against: a visitor who abandons at question two leaves nothing, whereas identity first leaves an email. That email is a weak asset: the page promises nobody calls, so it can be used only for a reminder email, and someone unwilling to see a free preview is unlikely to book. This is business reasoning; the step-level drop-off is exactly what `brief_step` events are for (https://vercel.com/docs/analytics/custom-events). Measure and revisit after a baseline.

Technical trade-offs under the build guide:

- The identity hash is first needed for lead creation, template exclusivity and idempotency. Exclusivity and idempotency are enforced at template selection, which is the logo question (question three in either order), so neither guarantee changes.
- The brief stage starts one step later (on question two's submit instead of question one's). Its budget is 15 seconds (`CONFIG.stageBudgetMs.brief`); the copy stage that depends on it starts at question three; the five-minute countdown starts at question five. No visible time is lost, and every stage has a deterministic fallback [build guide].
- The cookie must be httpOnly, `sameSite: 'lax'`, short-lived (`CONFIG.brief.draftTtlSec`, one hour), signed with `HMAC_SECRET` read from `lib/env.ts` under a "draft" key prefix so a cookie signature is never a valid identity hash, and never placed in a URL. The pending privacy notice must mention it.
- The rate limit and honeypot apply at question one (it sets a cookie per submit) and at question two (it creates a lead and spends on the pipeline).

What it changes in the build guide: the order of questions one and two; lead creation moves from question one's submit to question two's; the brief event fires from the question-two action; the guide's step list, the Inngest `brief` function trigger and `docs/adr/0003` are updated together so the sentence is not lost between steps.

Fallback if the owner keeps identity first: the hero card holds name, company and email, with a helper beside the email ("We use this to send you your link. Nothing else."), the same button and trigger, and the sentence field on question two. Copy that changes with it: the subhead's first two sentences become "Tell us where to send your link. Four short questions and about five minutes later, you'll see three first-look homepage designs in your logo and colours."; the card label becomes "Where should we send your link?"; the helper line becomes "Next we'll ask what your business does."; the How it works scope line becomes "Five short questions. The first is where to send your link. The rest appear one at a time."; FAQ item 3 reorders to "Your name, company and email, then what your business does. Then your logo, your photos and your colours, one at a time."; the progress panel's ticks are unchanged. Expect fewer starts (practitioner opinion); three fields push the card lower on a 390px screen. Both orders use the same components, so the swap is a change in the step config, the actions and these lines, not a rebuild.

## 6. The taster-to-conversation bridge: exact copy

The bridge is carried in four places so a scanner cannot miss it: the hero subhead ("three first-look homepage designs", "a taste of how we work", "then decide whether to talk to us"), the What comes back strip (three designs and a link, not a site), this section, and FAQ items 7 and 9.

**Section id `taster`.**

H2: **Five answers get you three designs. Imagine what an hour does.**

Body: Your three designs come from five short answers. They show how we work, not the finished site. The real one comes from a proper conversation. What you sell, who you want to reach, and what customers ask before they book. That's what the call is for.

Right column, three numbered lines:

01 **You look at your three designs.** Share the link with whoever helps you decide. It stays live for 30 days, and nobody chases you.

02 **You book a call if you like one.** Twenty minutes. We go through your designs together. You tell us what's wrong and what's missing.

03 **We build the site.** You get a fixed quote and a timeline on the call. Then we build it from the design you chose.

Button: **Book a 20-minute call**

Click trigger: No pitch. We look at your designs together.

Below: You can also just keep the link and do nothing. The designs are free either way. Text link: or start the five questions first (`/#start`).

Out of scope here but the home page must not contradict it: the `/preview/[slug]` page should carry one line above its book-a-call button, in the past tense that fits a visitor who has designs in front of them: "Made in about five minutes from one sentence. Imagine what we could do with an hour." That is where the thought converts.

## 7. What to remove or change on the current page

"When" is now (no backend), form (with the form route, section 8 phase C), or templates (t01 to t10 rendering).

| File                                                               | Change                                                                                                                                                                                                                                                                              | When                                     |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `app/_components/nav-links.ts`                                     | `CTA.href` from `/#how-it-works` to `/#start`. A button labelled "Show me my three designs" that scrolls to a heading is the first point the sceptic stops, but a field that posts nowhere is worse, so the href moves only when the form route is live.                            | form                                     |
| `lib/site.ts`                                                      | Replace the placeholder `bookingUrl` (`https://cal.com/pinnaclepx/quick-chat`). It is live in the hero, taster, closing section and footer; a dead booking link is a Stanford "error of any size" on the one action that makes money. Add `town` and `contactEmail` when supplied.  | owner                                    |
| `lib/config.ts`                                                    | Add `brief: { minChars, maxChars, draftTtlSec }` and `retention: { days }`; every "90" in copy renders from `CONFIG.retention.days` so the copy and the deletion job cannot drift.                                                                                                  | now                                      |
| `app/_components/hero.tsx`                                         | New subhead and secondary link copy (section 4). Remove the `STEPS` import and the static question-two `FormStepMockup` together with the mockup. Render the live question-one component.                                                                                           | copy now; form field with the form route |
| `app/_components/how-it-works.tsx`                                 | Remove the five `FormStepMockup` instances, the `STEPS.map` loop, `ResultMockup`, the "The five questions" H3, the "made-up bookkeeping firm" paragraph, the gradient span and the Sparkles badge. New copy, the progress panel and a click trigger under the button (section 3.4). | now                                      |
| `app/_components/progress-panel.tsx` (new)                         | Decorative How it works visual, server component, `aria-hidden`. Card classes copied from `form-step-mockup.tsx` before that file goes.                                                                                                                                             | now                                      |
| `app/_components/form-step-mockup.tsx`, `app/_components/steps.ts` | Delete both, and the `STEPS` and `MockField` imports in `hero.tsx` and the mockup, in the same change so typecheck and knip stay clean. Step ids and titles are recreated as the form's step config under `app/(form)/` when the form ships.                                        | now                                      |
| `app/_components/proof-strip.tsx`, `proof-points.ts`               | Rename to `what-you-get.tsx` / `what-you-get-items.ts` with the four deliverables (section 3.3). Drop the WCAG and "hand-built" cells.                                                                                                                                              | now                                      |
| `app/_components/next-steps.tsx`                                   | Rename to `taster.tsx`, id `taster`, with the section 6 copy. "It stays live" becomes "stays live for 30 days" so it matches the FAQ and the retention job.                                                                                                                         | now                                      |
| `app/_components/features.tsx`, `feature-items.ts`                 | Rename to `straight-answers.tsx` / `straight-answer-items.ts`, question-form items (section 3.7). Fix the inaccurate "never picks a photo" line. Item 1 ("Ten layouts") is added only when the templates render.                                                                    | now (four cells); templates (fifth)      |
| `app/_components/about.tsx`                                        | Section 3.8 copy; town and contact email from `SITE`.                                                                                                                                                                                                                               | now; owner inputs                        |
| `app/_components/faq-items.ts`, `faq.tsx`                          | Replace with the nine items in section 3.9; add the privacy sentence and link once it exists. `faq.tsx` gains a small client leaf on `details` `toggle` for `faq_open`.                                                                                                             | now                                      |
| `app/_components/closing-cta.tsx`                                  | Rename to `closing-start.tsx`; render the question-one component instead of a button.                                                                                                                                                                                               | form                                     |
| `app/_components/footer-links.ts`, `site-footer.tsx`               | "Product" becomes "The five questions"; "Why not a builder" becomes "Straight answers" (`/#straight-answers`); "After the preview" becomes "The taster" (`/#taster`). Add town, email and privacy link.                                                                             | now; owner inputs                        |
| `app/_components/json-ld.tsx`                                      | Add `email` and `address` (town, GB) to the Organization node when supplied.                                                                                                                                                                                                        | owner                                    |
| `app/_components/section-view.tsx` (new)                           | Small `IntersectionObserver` client leaf, fires `section_view {id}` once per section.                                                                                                                                                                                               | now                                      |
| `app/page.tsx`                                                     | New order: Hero, WhatYouGet, HowItWorks, Taster, StraightAnswers, About, Faq, ClosingStart. Examples slot reserved between HowItWorks and Taster.                                                                                                                                   | now                                      |
| `components/ui/textarea.tsx` (new)                                 | Shared field primitive with the same `focus-visible` ring as `button.tsx`, so the hero field does not duplicate or skip it.                                                                                                                                                         | form                                     |
| `components/ui/tracked-link.tsx`                                   | Widen the event union to the typed list in `lib/analytics/events.ts`; call `focus()` on a same-page fragment target.                                                                                                                                                                | now                                      |
| `e2e/home.spec.ts`                                                 | Rewrite "how it works lists the five questions in order" and the hero test (section 8).                                                                                                                                                                                             | now; form                                |

Do not add: an examples gallery, mock browser frames, any image of a design, a sticky mobile CTA bar (the standards recommend against feature flags, so if it is ever trialled it is a single env boolean in `lib/env.ts`; defer it until a baseline exists), a FAQPage schema, prices, testimonials, client logos, or a founder photo.

## 8. Implementation notes

### Order of work

Nothing in `app/(form)`, `lib/brief`, `lib/identity`, `lib/select`, `lib/rate-limit.ts`, `lib/analytics` or `lib/inngest/functions` exists; `lib/db/schema.ts` has only a `briefs` table (id, slug, createdAt); `app/api/inngest/route.ts` registers zero functions; all ten templates render only their name. Each phase leaves a deployable page.

- **Phase A, now:** every "now" row in section 7. The current header and closing buttons keep their label and `/#how-it-works` href. The page is honest but its primary button still scrolls to a section, so do not spend on traffic until phase C (business reasoning).
- **Phase B, backend, no home page change:** `CONFIG` additions; `lib/brief/describe.ts` and `draft-cookie.ts`; `lib/rate-limit.ts` backed by a Postgres table in Neon keyed on a hash of IP plus route (never in-memory on serverless); `lib/identity` (HMAC via `lib/env.ts`); a `leads` table with identity hash, name, company, email, source (referrer and UTM) and migration under `db/`; the `pipeline/brief.requested` event type and the Inngest `brief`, `select`, `copy`, `imagery`, `tokens` and `deadline-sweeper` functions with their deterministic fallbacks; templates t01 to t03 rendering real sections; `/preview/[slug]` with the countdown and the designs as they finish; the question routes: `/start` (question one, Server Action), `/start/details` (question two, Server Action, with a Back link that reopens `/start` prefilled from the cookie), then `/start/brand` for questions three to five as one client page on the standards' `useReducer` with client-direct uploads. The route-per-step shape for questions one and two deviates from the standards' single reducer and is recorded in `docs/adr/0003`. Land each `lib/` module with the action that imports it, or add temporary knip entries as ADR 0002 item 9 does.
- **Phase C, the live hero:** only when a visitor can go from the hero to three rendered designs. Every "form" row in section 7. A completed question two must never dead-end, so questions three to five, the pipeline and the templates are prerequisites, not followers.
- **Phase D, examples gallery** with the three fixture businesses, then baseline and tests.

### Routes and components

- `app/(form)/start/actions.ts` (`'use server'`): `submitDescribe(prev, formData)`. Validate with zod, check the honeypot, apply the rate limit, set the draft cookie, `redirect('/start/details')`. Validate-delegate-respond; logic in `lib/`.
- `app/(form)/start/details/actions.ts`: reads and re-validates the cookie, checks honeypot and rate limit, creates the lead in a transaction, sends the brief event, clears the cookie, redirects. If the same email already has a finished preview, show and resend that link instead of starting again (business reasoning; the returning-email rule already keys on identity) [owner: confirm, section 9 item 7]. Once question five is submitted, the preview link is shown on screen as well as emailed, so a mistyped email does not lose the lead.
- `app/(form)/_components/describe-step.tsx` (`'use client'`): the shared question-one form using `useActionState`. Props: `variant: 'hero' | 'page' | 'closing'`, `formId`, `location`, `defaultValue`. Rendered by `hero.tsx`, `closing-start.tsx` and `start/page.tsx`. Progressive enhancement: posts without JavaScript. `/start` prefills from the draft cookie; the home page stays static, so the hero field does not.
- `components/ui/progress-steps.tsx`: "Question N of 5" text plus five segments, shared by the form and the progress panel.
- Two forms on one page: distinct `id` attributes, distinct visually hidden headings, `autoComplete="off"` on the textarea.
- Cookies and consent: Vercel Analytics is used without cookies and the draft cookie is strictly necessary, so no consent banner is planned. This is legal reasoning to confirm with the privacy notice, not a claim from the sources read.

### Analytics (`lib/analytics/events.ts`, typed)

This section supersedes section 8 of `docs/home-page-plan.md`. Client events via `track()` from `@vercel/analytics`: `cta_click {location}`, `call_click {location}`, `brief_focus {location}` (first focus of a question-one field), `brief_step {step, location}` (successful submit; step 1 replaces the old `brief_started`), `brief_error {location, reason}`, `faq_open {index}` (an index, not the question text, so it stays under the 255-character property cap), `section_view {id}`, `example_open {business}` (reserved for phase D). Server events via `track()` from `@vercel/analytics/server`: `lead_created`, `preview_ready`. `call_booked` comes from a Cal.com webhook once the real link and its hooks are confirmed. Custom events need the Custom Events permission on the Vercel plan and accept only string, number, boolean or null values (https://vercel.com/docs/analytics/custom-events); confirm the plan tier before making `brief_step` the KPI. The KPI is `brief_step` where `step = 1` against page views, then `preview_ready` against `brief_step 1`; neither exists before phase C. Baseline four weeks after phase C, then one change at a time; the first headline test runs for a fixed four weeks decided in advance (practitioner opinion). Reference point: Unbounce's overall median landing page conversion is 6.6% (https://unbounce.com/conversion-benchmark-report/); a free, ungated tool should sit above it for starts and well below it for booked calls (business reasoning).

### Tests

- Unit (Vitest, node): `lib/brief/describe.test.ts` (min and max length, whitespace trimmed); `lib/brief/draft-cookie.test.ts` (round trip, tampered signature rejected, expired cookie rejected); `lib/rate-limit.test.ts`; a honeypot test for each action.
- Integration (`tests/integration`): the question-two action reads the cookie, creates the lead, sends the event, clears the cookie; the send-failure path returns the error state and leaves one lead.
- e2e (`e2e/home.spec.ts`): phase A: `#how-it-works` has zero elements matching `/^Question \d$/` and one "Question 4 of 5"; the existing hero, nav, FAQ, mobile menu and metadata tests stay. Phase C: the hero contains a visible textarea labelled "What does your business do?"; submitting a valid sentence lands on `/start/details`; an empty submit shows an inline error and stays on the page; the closing section contains a second textarea with a different form id; the header and mobile menu CTA link to `/#start`; at 390x844 the hero submit button is inside the viewport before scrolling. The metadata test hard-codes the tagline; update it with any headline change. CI e2e submits hit the real action, so the run must stay under `CONFIG.rateLimit.max` per window or run against a preview deployment with its own Neon branch.
- Keep `pnpm typecheck`, `pnpm lint`, `pnpm knip` clean.

### Performance and mobile

No image above the fold; LCP is the H1. The client JavaScript above the fold is `describe-step.tsx`, `TrackedLink`, `MobileNav` and the `section-view.tsx` leaf. Measure LCP and INP with Speed Insights after each phase; if the `GlowBackdrop` blur costs paint time on low-end phones, drop the blurred layer.

### Records

- `docs/adr/0003`: the question-order deviation, the cookie hand-off, and the route-per-step shape for questions one and two.
- Update the build guide's step list and lead-creation moment in the same change, and check the guide in under `docs/` so copy marked [build guide] can be verified (section 9, item 8).
- Correct `docs/home-page-plan.md` section 2 as listed in section 10 below.
- Run every new line through a reading-level check before shipping. Unbounce's benchmark found grade 5 to 7 copy converts best across a cross-industry, North-American-weighted sample (https://unbounce.com/conversion-benchmark-report/); applying it to UK small business owners is reasoning, not a finding.

## 9. Open decisions for the owner

1. **Question order.** Sentence first (this plan) or identity first (the guide). Section 5 lists every line that changes.
2. **Missing inputs that block going public:** the real Cal.com link, the studio town, a contact email, and the privacy notice. A page that asks for an email with no privacy notice and a dead booking link should not be public.
3. **The pipeline is the biggest blocker.** The live hero (phase C) waits on questions one to five, the lead and identity modules, the rate limiter, the Inngest functions, and templates t01 to t03. Until then the page is a staging page, not a lead source.
4. **Retention.** The page says 30 days in three places, all rendered from `CONFIG.retention.days`. The build guide's Step 15 retention job must exist before launch, or the number comes out.
5. **Template exhaustion.** After three visits (nine templates) a returning email cannot see three unseen designs. Decide the fourth-visit behaviour (show the three they viewed longest, or route to the call) so item 4 in Straight answers stays true.
6. **The FAQ list.** Confirm that naming the five topics only inside the collapsed FAQ item 3 satisfies "not all the questions from the start".
7. **Returning email with a finished preview.** Confirm that question two resends and shows the existing link rather than starting a new run.
8. **The build guide.** Say where it lives, or check it in under `docs/`, so copy marked [build guide] can be verified.
9. **Follow-up policy for abandoned forms.** "Nobody calls you unless you book" is a promise. A single reminder email is defensible; a phone call is not. Decide now so the copy is not a lie later.

## 10. Sources

Every URL below was read on 2 September 2026. The findings and four corrections are recorded in `docs/home-page-research.md`.

- https://www.nngroup.com/articles/scrolling-and-attention/
- https://www.nngroup.com/articles/page-fold-manifesto/
- https://www.nngroup.com/articles/how-users-read-on-the-web/
- https://www.nngroup.com/articles/photos-as-web-content/
- https://unbounce.com/conversion-benchmark-report/
- https://copyhackers.com/optimize-your-business-online-training/calls-to-action/
- https://www.julian.com/guide/growth/landing-pages
- https://marketingexamples.com/conversion/landing-page-guide
- https://credibility.stanford.edu/guidelines/index.html
- https://www.navattic.com/report/state-of-the-interactive-product-demo-2026
- https://developers.google.com/search/blog/2023/08/howto-faq-changes and https://www.searchenginejournal.com/google-drops-faq-rich-results-from-search/574429/
- https://vercel.com/docs/analytics/custom-events
- https://durable.com/, https://www.mixo.io/, https://www.relume.ai/, https://10web.io/

Corrections applied after the adversarial re-read:

- First-person button copy ("Show me my three designs") is practitioner opinion. The Unbounce article previously cited for the Aagaard my/your test does not contain it, and no primary source was read.
- The Contentsquare device figures (scroll rate 50.5% desktop vs 45.2% mobile; 4:46 vs 2:20 per session) are on the report's engagement page, now cited correctly.
- NN/g's tabs article does not discuss sequential content; that inference is ours and is no longer attributed.
- The end of FAQ rich results (May to August 2026) is reported by Search Engine Journal, not by Google's 2023 post.

Repository files read: `docs/standards.md`, `docs/adr/0002-adopt-standards-document.md`, `app/page.tsx` and every file in `app/_components/`, `components/ui/button.tsx`, `components/ui/tracked-link.tsx`, `lib/site.ts`, `lib/config.ts`, `lib/env.ts`, `lib/db/schema.ts`, `lib/inngest/client.ts`, `app/api/inngest/route.ts`, `next.config.ts`, `templates/registry.ts`, `templates/t01-aurora/index.tsx`, `e2e/home.spec.ts`.
