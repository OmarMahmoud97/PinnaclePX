# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

UK owners of small businesses and early-stage founders who need a new website and are wary of agencies. Many have been burned before: a quote, a deposit, a six-week wait, then a first draft they did not like. They arrive doubting everything, mostly on a phone, and will not give an email or a phone number until they have seen something. Reading level target is about 7th grade. Secondary readers: a partner or colleague the owner forwards a preview link to.

## Product Purpose

PinnaclePX is a one-person UK web design studio. Its home page has one job: get the visitor to open `/start` and answer five questions (a sentence about the business; name, company and email; a logo or skip; a visual style with optional photos; a brand colour). Within about five minutes they receive three homepage designs in their own logo, colours and copy, free, with a shareable link that stays live for 30 days (`CONFIG.retention.days`). If they like one they book a 20-minute call, get a fixed quote, and the studio designs and builds a full custom site from scratch around what they liked: professional wording, pages Google and the chat assistants people now ask can read, bookings, payments or forms connected, analytics and hosting. Success is measured by how many visitors start question one, how many reach a preview, and how many book a call. The three designs are a taster of how the studio works, never the final design or close to it.

## Positioning

A web design studio that lets you see three homepage designs in your own brand, free, in five minutes, before you decide to work with anyone. Alternatives the visitor weighs: doing nothing, a DIY builder (Wix, Squarespace, Durable, Mixo), a freelancer marketplace, or a traditional agency with a quote and a long wait. PinnaclePX is not an AI website builder and must not be mistaken for one; a person designs every layout, AI drafts copy from the visitor's own sentence and helps find photos, and the page says so once, honestly.

## Operating Context

The visitor reads the home page, opens `/start`, answers one question at a time beside a live sketch (a wireframe browser and phone frame that fill in with their company name, sentence, logo, style and colour as they type), submits, and watches a five-minute countdown while three design links appear. The link is emailed. Nobody rings them unless they book. The studio owner reviews designs with the visitor on a Cal.com call.

## Capabilities and Constraints

- Built and working: the home page, the `/start` questionnaire with URL-per-question, session persistence, per-question validation, the live sketch, logo and photo uploads from the browser straight to Blob at content-addressed paths (a refresh keeps them), the done screen with countdown and design slots, analytics events, structured data, Open Graph image, the colour engine (`deriveTokens`, ADR 0010) and the template contract (ADR 0009).
- Built: the pipeline (ADRs 0009 to 0013). Submitting stores the lead and the submission, chooses the templates the visitor has not seen, derives the colour tokens, reads the logo, writes the brief and the copy with Sonnet 5 judged by code (falling back to the visitor's own words), fills the picture slots with the visitor's photographs or credited Pexels pictures ranked by Haiku 4.5, renders each design at `/preview/[slug]/[templateId]` within seconds, shows the address on the done page, emails the link once, and serves a card image for the shared link.
- Built: rate limits per address and per email, a honeypot and a three-second floor, the privacy notice at `/privacy`, a nightly retention sweep and erasure by email through an admin event (ADR 0014).
- Built: the work band (`#work`): dated phone captures of the six client sites in the sketch's phone frame, each linking to the live site, captured by `scripts/capture-work.mjs` into `app/_images/work/` (WebP, imported) and `public/work/` (AVIF, served as static files).
- Built: the site band (`#included`): four jobs a website has to do (found, trusted, answered, reachable), each a label, one scene line and the two cells built in to do it, so the band says what a hired build comes with in one place (a content system, search and answer engines, phone first, accessibility, speed as a process, integrations, made by hand, and the wording; hosting replaces the wording cell once the care plan is recorded). It absorbed the Outcomes band on 22 September 2026 (ADR 0033), when the page was cut from twelve bands to nine and reordered to sell the site rather than the free designs: Work first, then the site band, the walkthrough, the build, the comparison, Straight answers, About, the FAQ and the closing. `What you get`, `Outcomes` and the `Taster` no longer exist as bands, nor do the ids `#what-you-get`, `#outcomes` and `#taster`.
- Not built yet: nine of the ten templates (placeholders; `t01-aurora` is built and viewable at `/examples/aurora`, ADR 0008); the journey section (one client's sentence re-run through the five questions and shown beside the site the studio designed for them); a weekly drift check on the captured sites; the Cal.com webhook that would mark a call as booked. Before traffic: a verified Resend sending domain (`RESEND_FROM`), the Anthropic key's workspace id (`ANTHROPIC_WORKSPACE_ID`) or a workspace-scoped key, the studio's contact email in `lib/site.ts`, and the Vercel project's environment variables.
- Stack: Next.js 16 App Router, React 19, Tailwind CSS 4, TypeScript strict, Vercel. Standards in `docs/standards.md`: semantic CSS-variable tokens only, server components by default with small client leaves, every tunable number in `lib/config.ts`, no new dependency without a reason.
- Terminology: "the five questions", "three designs", "the live sketch", "the taster", "preview", "brief", "a client's brief" (the sentence the hero sketch paints), "an example brief" (the invented business the How it works walkthrough paints, never a client's; ADR 0025), "the five-minute version" (a taster render of a client's brief), "the site we designed for them" (a client's real site), "a client of ours" (the only relationship word), "Our work" (the six-site band). Never "AI website builder", "generate", "instantly"; never "example brief", "example business" or "not a client" about any client; never "trusted by", "clients include" or "worked with".
- Undecided: the studio town and contact email, the privacy notice, the follow-up policy for abandoned forms, fourth-visit behaviour once nine templates have been seen; whether real testimonials or a "worked with" line are wanted later (never invented; CAP 3.47 to 3.50); what happens when a client withdraws consent or their site changes (remove within five working days; re-capture, or the card leaves the band; never relabel a link to someone else's work); whether clients' own photographs replace the stock stand-ins in the fixtures; which client leads the hero and the journey.

## Brand Commitments

- Name: PinnaclePX (legal name Pinnacle PX). The incumbent identity (light surface, hairline grid column, corner ticks, radial glow, Geist Sans, brand blue ramp, burst mark) is to be kept and elevated, not replaced: the owner asked for the home page to be improved and taken to the next level, not redesigned (confirmed 3 September 2026). Individual elements may be refined where a designer finds a gap; a wholesale new visual world is out of scope.
- Owner rules: no price in the hero (a hero price reads budget-tier); the rate card (`CONFIG.price`, decided 21 September 2026, `docs/copy-review.md` section 11) renders through `printedPrice` in the cost FAQ, the "How you pay" row, the designs page and the emailed link, always with its scope and basis in the same sentence, never as a bare figure; no founder photo (the owner's name appears once, in About, and as `founder` in the schema); no client logos as a strip and no testimonials unless real, evidenced and permitted (CAP 3.47 to 3.50); real client work only, each client named, shown or linked only with their written permission recorded in `docs/claims-register.md` before publication, every capture of a client's site dated in its caption and linked to the site, and no logo shown outside the capture it belongs to; no stock photographs of generic people; say "AI" once and honestly in how it works, never in the headline.
- Voice: plain, specific, second person, sentences under 20 words, no marketese, British English ("colours", "organisation").
- Copy that is final lives in `app/_components/*.ts` and `lib/site.ts`; the persuasion arc is `docs/adr/0033` (the twelve-band arc in `docs/home-page-content-plan.md` section 2 is superseded).

## Evidence on Hand

- The live sketch on `/start` (`app/start/_components/brief-sketch.tsx`): the studio's most distinctive demonstrable mechanism, available now.
- The five-question flow itself, working end to end up to submission.
- The owner can supply real photographs (of real UK small businesses or the studio at work; details to follow), confirmed 3 September 2026.
- Six real clients, each of whom, per the owner (5 September 2026), came to the studio through this site and had their site designed by hand by the studio: VetPres, Mvmnt, Urunn, Trvlwell, WithU and Go Wild (Go Wild Dog Walking). Each may be named, shown as a dated first-screen capture and linked only with that client's permission; the owner confirmed on 5 September 2026 that all six have given it and holds the record (`docs/claims-register.md`), and labelled as what it is: a taster render of their brief is "the five-minute version, not their site"; their site is "the site we designed for them" or "designed and built by us". VetPres and Go Wild carry the studio's credit in their footers (observed 5 September 2026); the other four are brands of the 10XU group, whose digital rebrand the owner led from January 2025, and the page says so in one line.
- Absent, and never to be fabricated: testimonials, client logos as a strip, benchmarks, prices, any invented business. Outcome figures appear only where the studio measured them for a named client (the work band), each with its record in `docs/claims-register.md`. Real testimonials only if the owner decides so later, with documentary evidence and permission (CAP 3.47 to 3.50). Kestrel is Aurora's design-review content only and never appears on the page.

## Product Principles

1. Show before you ask: every section removes one reason not to type the first sentence.
2. Honest above the fold: the designs are a first look, the call is optional, nobody rings you.
3. The mechanism is the proof: demonstrate the sketch and the process rather than claim quality.
4. One question at a time, on the page and in the product: never overwhelm.
5. Perform perfectly: the studio sells websites, so its own site must be fast, accessible and flawless on a mid-range phone on 4G.

## Accessibility & Inclusion

WCAG 2.2 AA throughout. Every text-carrying fill passes 4.5:1. `prefers-reduced-motion` disables non-essential motion. Every interactive demo is reachable by keyboard and has a text equivalent. No autoplaying sound. The page must be fully readable with JavaScript off.
