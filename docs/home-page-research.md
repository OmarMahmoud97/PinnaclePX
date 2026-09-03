# PinnaclePX home page research

Prepared 2 September 2026. The evidence behind `docs/home-page-plan.md`. Corrections made on the same day after an adversarial re-read of every source are marked **Correction**.

## 1. The diagnosis in one paragraph

The page is well built and badly aimed. The craft is good (the design detector returns zero findings, the hairline grid and glow are distinctive, the components are tokenised). But the page sells a SaaS product that does not exist: three pricing tiers, watermarks, API access, "Contact sales", a "Trusted by" wall of OpenAI, Stripe and Linear, terminal logs and JSON diffs as product screenshots, and a demo section whose four tabs all show the same Unsplash photo of a staircase. The build guide describes something else entirely: a one-person agency whose free five-minute tool shows a small business owner three homepage designs in their own brand, so that they book a call. Nothing on the page says who it is for, who is behind it, what happens after the preview, or what the agency actually sells. The fix is not polish. It is repositioning the page as an agency home page whose hero action is the free preview.

## 2. What the research says

Every claim below was read from the source on 2 September 2026. Evidence and practitioner opinion are marked.

### Attention and the fold (evidence)

- NN/g, Scrolling and Attention (2018): 57% of viewing time is above the fold, 74% in the first two screenfuls, 81% in the first three. "The closer a piece of information is to the top of the page, the higher the chance that it will be read." Put key goals and the main CTA above the fold. https://www.nngroup.com/articles/scrolling-and-attention/
- NN/g, The Fold Manifesto: "Users scroll when there is reason to." Avoid the "illusion of completeness" (a false floor that hides that more content exists). An 84% average difference in how users treat above-fold versus below-fold content. https://www.nngroup.com/articles/page-fold-manifesto/
- Contentsquare Digital Experience Benchmark 2026: scroll rate is 50.5% on desktop and 45.2% on mobile; time per session is 4:46 on desktop and 2:20 on mobile. **Correction:** these figures are on the engagement page, not the report index. https://contentsquare.com/guides/digital-experience-benchmark/engagement/

### Copy and reading level (evidence)

- Unbounce Conversion Benchmark Report 2024: overall median landing page conversion 6.6%. Pages written at a 5th to 7th grade reading level convert at 11.1%, 8th to 9th grade at 7.1%, professional-level copy at 5.3%. Difficult words correlate at −24.3% with conversion. 83% of visits are mobile. https://unbounce.com/conversion-benchmark-report/
- NN/g, How Users Read on the Web: 79% scan, 16% read word by word. Concise text improved measured usability by 58%, scannable layout by 47%, objective language by 27%, all three combined by 124%. Users "detested marketese"; promotional language "imposes a cognitive burden" and undermines credibility. https://www.nngroup.com/articles/how-users-read-on-the-web/
- Unbounce, How to write a call to action that converts: three case studies where value and relevance in the button copy lifted conversion ("Order" to "Get" +38%; a location-specific gym CTA +68%). **Correction:** the widely quoted Aagaard my/your test (+90%) is not on this page and no primary source for it was read, so first-person button copy is treated as practitioner opinion in the plan. https://unbounce.com/conversion-rate-optimization/how-to-write-a-call-to-action-that-converts-with-case-sudies/
- Copyhackers (Joanna Wiebe): a "click trigger" is a risk-reducing line under the button that answers "what happens when I click". Her example is "No sales agent will call you." https://copyhackers.com/optimize-your-business-online-training/calls-to-action/

### Structure (practitioner guides, widely used)

- Julian Shapiro, Landing Page Guide: order is navbar, hero, social proof, CTA, features and objections, repeat CTA, footer. The headline test: "If the visitor reads only this text on your page, will they know exactly what you sell?" Features sections should have 3 to 6 items, each a value header, a paragraph handling the objection, and an image. The closing CTA continues the story the headline started. https://www.julian.com/guide/growth/landing-pages
- Harry Dry, Marketing Examples Landing Page Guide: above the fold is title (explain value), subtitle (explain how), visual ("Show me your product. Or even better, your product in action"), social proof, CTA. Below the fold: features and objections, inspirational social proof, FAQ, second CTA, founder's note. The test for every element: "Would this help me sell if I met the customer in person? If not, remove it." https://marketingexamples.com/conversion/landing-page-guide

### Trust when you have no customers (evidence)

- Stanford Web Credibility Guidelines (4,500 participants): show there is a real organisation behind the site (address, contact), highlight expertise, show honest people with real bios, make it easy to contact you, use restraint with promotion, and "avoid errors of all types, no matter how small". Fake logos fail guidelines 1, 9 and 10 at once. https://credibility.stanford.edu/guidelines/index.html
- NN/g, Photos as Web Content: users "pay close attention to photos that contain relevant information but ignore fluffy pictures". A test user spent 10% more time on real staff portraits than on the bios, which took 316% more space. "Users ignore stock photos of generic people." The product output is information-carrying imagery; the staircase photo is filler. https://www.nngroup.com/articles/photos-as-web-content/

### Showing the product (evidence)

- Navattic, State of the Interactive Product Demo 2026: 80% of top-performing demos have a CTA above the fold or in the navbar. Ungated demos outperform gated ones on engagement (58% vs 52%) and completion (49% vs 42%); 66% of top performers are ungated. Interactive demos convert 12% higher than product videos. https://www.navattic.com/report/state-of-the-interactive-product-demo-2026
- NN/g, Video Usability: users "don't appreciate being surprised by video" that autoplays; "any movement on the page can be a distraction"; there is no standard behaviour, so essential information must exist as text. https://www.nngroup.com/articles/video-usability/
- NN/g, Tabs, Used Right: tabs suit related, similar, concisely labelled content of unequal importance. They tax memory when users need to see all the panels. **Correction:** the article does not discuss sequential content; that a step-by-step process is unsuited to tabs is our inference. https://www.nngroup.com/articles/tabs-used-right/

### Speed (evidence)

- web.dev, Why Speed Matters: BBC lost 10% of users per extra second of load; Vodafone's 31% LCP improvement raised sales 8%; Economic Times cut bounce 43% after passing Core Web Vitals. https://web.dev/articles/why-speed-matters
- Next.js 16 docs (local, `node_modules/next/dist/docs`): the `priority` prop on `next/image` is deprecated in favour of `preload`; the current demo uses `priority`. JSON-LD goes in a `<script type="application/ld+json">` in the page. `opengraph-image.tsx`, `sitemap.ts`, `robots.ts` and `title.template` are file and metadata conventions.

### SEO (evidence)

- Google, August 2023: FAQ rich results are shown only for "well-known, authoritative government and health websites". https://developers.google.com/search/blog/2023/08/howto-faq-changes **Correction:** the full removal is reported by Search Engine Journal (rich results stopped appearing 7 May 2026; reporting and API support withdrawn June to August 2026), not by the 2023 Google post. https://www.searchenginejournal.com/google-drops-faq-rich-results-from-search/574429/ Do not add FAQPage schema. Use Organization and WebSite instead.

### What the closest competitors do (observed 2 September 2026)

| Site    | Headline                                           | Primary CTA                                        | Hero visual                                      | Shows output how                                            | Pricing on home       |
| ------- | -------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------- | --------------------- |
| Durable | "The complete AI business builder"                 | "Start for free" + "Get online in 30 seconds"      | Industry carousel, photo beside template preview | Template gallery by industry                                | Yes (self-serve SaaS) |
| Mixo    | "Build a professional website with AI in minutes." | "Get Started for Free" + "No credit card required" | Avatars and Trustpilot rating                    | "Built with Mixo": 7 real example sites, desktop and mobile | No                    |
| Relume  | "Build a marketing site you'd actually publish"    | "Generate Website"                                 | A live brief input with file upload              | Demo projects with clone links, team bios                   | No                    |
| 10Web   | "Agentic Website Builder..."                       | "Get Started for Free"                             | Live prompt input in the hero                    | Template gallery, use-case cards                            | No                    |

Three of four keep pricing off the home page. All four show real generated sites. Two put the input itself in the hero. None is an agency; all are self-serve builders, which is exactly the category PinnaclePX must not be mistaken for.

## 3. Positioning

Written in the Dunford order: alternatives, unique attributes, value, audience, category.

- Alternatives the visitor is weighing: doing nothing; a DIY builder (Wix, Squarespace, Durable, Mixo); a freelancer marketplace; a traditional agency with a quote and a six-week wait.
- What only PinnaclePX does: shows the visitor their own logo, colours and copy on three hand-built homepage designs before they pay, sign up, or speak to anyone. Five minutes. Then a human builds the real thing.
- The value: it removes the risk of hiring a web designer blind. "See it before you commit."
- Audience: UK owners of small businesses and early-stage founders who need a new site and are wary of agencies, quotes and long projects. Reading level target: 7th grade.
- Category: a web design studio with a free preview. Not an AI website builder. Say "AI" once, honestly, in how it works, never in the headline.

One-line positioning statement for internal use: PinnaclePX is a web design studio that lets you see three homepage designs in your own brand, free, in five minutes, before you decide to work with us.

## 4. Sources read

- https://www.nngroup.com/articles/scrolling-and-attention/
- https://www.nngroup.com/articles/page-fold-manifesto/
- https://www.nngroup.com/articles/how-users-read-on-the-web/
- https://www.nngroup.com/articles/photos-as-web-content/
- https://www.nngroup.com/articles/tabs-used-right/
- https://www.nngroup.com/articles/video-usability/
- https://unbounce.com/conversion-benchmark-report/
- https://unbounce.com/conversion-rate-optimization/how-to-write-a-call-to-action-that-converts-with-case-sudies/ (no my/your test on this page; see correction above)
- https://copyhackers.com/optimize-your-business-online-training/calls-to-action/
- https://www.julian.com/guide/growth/landing-pages
- https://marketingexamples.com/conversion/landing-page-guide
- https://credibility.stanford.edu/guidelines/index.html
- https://www.navattic.com/report/state-of-the-interactive-product-demo-2026
- https://web.dev/articles/why-speed-matters
- https://developers.google.com/search/blog/2023/08/howto-faq-changes
- https://www.searchenginejournal.com/google-drops-faq-rich-results-from-search/574429/
- https://contentsquare.com/guides/digital-experience-benchmark/engagement/
- https://vercel.com/docs/analytics/custom-events
- https://durable.com/, https://www.mixo.io/, https://www.relume.ai/, https://10web.io/
- Next.js 16.3 docs in `node_modules/next/dist/docs` (image, metadata, opengraph-image, sitemap, robots, JSON-LD)

Not found or not fetched: CXL's value proposition article returned 403; April Dunford's positioning post returned 404 (the Dunford framework in section 3 is from her book, not a fetched page); the sticky CTA figures come from vendor case studies, not independent research.
