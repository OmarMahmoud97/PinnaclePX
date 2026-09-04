# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

UK owners of small businesses and early-stage founders who need a new website and are wary of agencies. Many have been burned before: a quote, a deposit, a six-week wait, then a first draft they did not like. They arrive doubting everything, mostly on a phone, and will not give an email or a phone number until they have seen something. Reading level target is about 7th grade. Secondary readers: a partner or colleague the owner forwards a preview link to.

## Product Purpose

PinnaclePX is a one-person UK web design studio. Its home page has one job: get the visitor to open `/start` and answer five questions (a sentence about the business; name, company and email; a logo or skip; a visual style with optional photos; a brand colour). Within about five minutes they receive three homepage designs in their own logo, colours and copy, free, with a shareable link that stays live for 30 days (`CONFIG.retention.days`). If they like one they book a 20-minute call, get a fixed quote, and the studio builds the real site. Success is measured by how many visitors start question one, how many reach a preview, and how many book a call. The three designs are a taster of how the studio works, not the product.

## Positioning

A web design studio that lets you see three homepage designs in your own brand, free, in five minutes, before you decide to work with anyone. Alternatives the visitor weighs: doing nothing, a DIY builder (Wix, Squarespace, Durable, Mixo), a freelancer marketplace, or a traditional agency with a quote and a long wait. PinnaclePX is not an AI website builder and must not be mistaken for one; a person designs every layout, AI drafts copy from the visitor's own sentence and helps find photos, and the page says so once, honestly.

## Operating Context

The visitor reads the home page, opens `/start`, answers one question at a time beside a live sketch (a wireframe browser and phone frame that fill in with their company name, sentence, logo, style and colour as they type), submits, and watches a five-minute countdown while three design links appear. The link is emailed. Nobody rings them unless they book. The studio owner reviews designs with the visitor on a Cal.com call.

## Capabilities and Constraints

- Built and working: the home page, the `/start` questionnaire with URL-per-question, session persistence, per-question validation, the live sketch, logo and photo uploads from the browser straight to Blob at content-addressed paths (a refresh keeps them), the done screen with countdown and design slots, analytics events, structured data, Open Graph image, the colour engine (`deriveTokens`, ADR 0010) and the template contract (ADR 0009).
- Built: the pipeline (ADRs 0009 to 0013). Submitting stores the lead and the submission, chooses the templates the visitor has not seen, derives the colour tokens, reads the logo, writes the brief and the copy with Sonnet 5 judged by code (falling back to the visitor's own words), fills the picture slots with the visitor's photographs or credited Pexels pictures ranked by Haiku 4.5, renders each design at `/preview/[slug]/[templateId]` within seconds, shows the address on the done page, emails the link once, and serves a card image for the shared link.
- Built: rate limits per address and per email, a honeypot and a three-second floor, the privacy notice at `/privacy`, a nightly retention sweep and erasure by email through an admin event (ADR 0014).
- Not built yet: nine of the ten templates (placeholders; `t01-aurora` is built and viewable at `/examples/aurora`, ADR 0008), the examples gallery, the Cal.com webhook that would mark a call as booked. Before traffic: a verified Resend sending domain (`RESEND_FROM`), the Anthropic key's workspace id (`ANTHROPIC_WORKSPACE_ID`) or a workspace-scoped key, the studio's contact email in `lib/site.ts`, and the Vercel project's environment variables.
- Stack: Next.js 16 App Router, React 19, Tailwind CSS 4, TypeScript strict, Vercel. Standards in `docs/standards.md`: semantic CSS-variable tokens only, server components by default with small client leaves, every tunable number in `lib/config.ts`, no new dependency without a reason.
- Terminology: "the five questions", "three designs", "the live sketch", "the taster", "preview", "brief". Never "AI website builder", "generate", "instantly".
- Undecided: the studio town and contact email, the real Cal.com link, the privacy notice, the follow-up policy for abandoned forms, fourth-visit behaviour once nine templates have been seen.

## Brand Commitments

- Name: PinnaclePX (legal name Pinnacle PX). The incumbent identity (light surface, hairline grid column, corner ticks, radial glow, Geist Sans, brand blue ramp, burst mark) is to be kept and elevated, not replaced: the owner asked for the home page to be improved and taken to the next level, not redesigned (confirmed 3 September 2026). Individual elements may be refined where a designer finds a gap; a wholesale new visual world is out of scope.
- Owner rules: no price anywhere on the home page; no founder photo; no fake client logos or invented testimonials; no stock photographs of generic people; say "AI" once and honestly in how it works, never in the headline.
- Voice: plain, specific, second person, sentences under 20 words, no marketese, British English ("colours", "organisation").
- Copy that is final lives in `app/_components/*.ts` and `lib/site.ts`; the persuasion arc is `docs/home-page-plan.md` section 2.

## Evidence on Hand

- The live sketch on `/start` (`app/start/_components/brief-sketch.tsx`): the studio's most distinctive demonstrable mechanism, available now.
- The five-question flow itself, working end to end up to submission.
- The owner can supply real photographs (of real UK small businesses or the studio at work; details to follow), confirmed 3 September 2026.
- Absent, and never to be fabricated: client work, testimonials, client logos, case studies, benchmarks, prices. Example businesses (Mvmnt, VetPres, Go Wild Dog Walking) may be built and shown only when labelled as example briefs, not clients.

## Product Principles

1. Show before you ask: every section removes one reason not to type the first sentence.
2. Honest above the fold: the designs are a first look, the call is optional, nobody rings you.
3. The mechanism is the proof: demonstrate the sketch and the process rather than claim quality.
4. One question at a time, on the page and in the product: never overwhelm.
5. Perform perfectly: the studio sells websites, so its own site must be fast, accessible and flawless on a mid-range phone on 4G.

## Accessibility & Inclusion

WCAG 2.2 AA throughout. Every text-carrying fill passes 4.5:1. `prefers-reduced-motion` disables non-essential motion. Every interactive demo is reachable by keyboard and has a text equivalent. No autoplaying sound. The page must be fully readable with JavaScript off.
