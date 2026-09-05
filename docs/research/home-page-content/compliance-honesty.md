# Compliance and honesty: what the new home page sections may say

Prepared 5 September 2026 for the PinnaclePX home page plan. Scope: the six research questions in the brief (comparisons and "free", AI claims, training and data, ownership, care plans, guarantees) and recommended wording for five new pieces of copy. Labels follow the repo's convention: **evidence** (a study, dataset or official document), **practitioner opinion**, **observed** (a live page loaded today, with URL), **business reasoning**. Anything I could not verify is marked **Unverified**.

Fetches that failed today, so the sources are cited through secondary summaries or not at all: three ICO pages (HTTP 403: the AI transparency guidance, the right-to-be-informed page, the generative AI consultation response), the Lexology "free" round-up (403), the CMA207 PDF (returned as binary; the GOV.UK HTML version was fetched instead), the RPC summary of CAP's AI guidance (empty body), the TechRadar ownership article (sign-up wall), and the Squarespace template gallery (only the navigation shell came back).

## 0. Two framing facts that decide everything below

1. **The CAP Code applies to this page.** Since 1 March 2011 the ASA's remit covers "advertising on a company's own website or in other non-paid-for space online under their control", where the material is "directly connected with the supply or transfer of goods, services, opportunities and gifts" (evidence, CAP AdviceOnline "Remit: Own websites", updated 26 Feb 2026, https://www.asa.org.uk/advice-online/remit-own-websites.html). Every section of app/page.tsx sells a service, so every objective claim on it needs documentary evidence held **before** publication (CAP 3.7: "marketers must hold documentary evidence to prove claims that consumers are likely to regard as objective", https://www.asa.org.uk/type/capcode/code_rule/3.7.html).

2. **The visitor is usually a business buyer, but write to the consumer standard anyway.** A "consumer" is "an individual acting for purposes that are wholly or mainly outside that individual's trade, business, craft or profession" (evidence, Consumer Rights Act 2015 s.2(3), https://www.legislation.gov.uk/ukpga/2015/15/section/2). A small business owner buying a website for the business is a trader, so the Consumer Rights Act and the DMCC Act's consumer rules mostly do not bite. Three things still do: the CAP Code covers business-to-business marketing; the Business Protection from Misleading Marketing Regulations 2008 make misleading B2B advertising and non-compliant comparative advertising unlawful (evidence, reg 4, https://www.legislation.gov.uk/uksi/2008/1276/regulation/4); and the Supply of Goods and Services Act 1982 s.13 implies into every business service contract "a term that the supplier will carry out the service with reasonable care and skill" (evidence, https://www.legislation.gov.uk/ukpga/1982/29/section/13). Early-stage founders who have not yet started trading may be consumers, and "a trader claiming that an individual was not acting for purposes wholly or mainly outside the individual's trade, business, craft or profession must prove it" (CRA s.2(4)). Business reasoning: one copy standard for both audiences is cheaper than two, so hold every line to the consumer rules.

## 1. Comparisons and "free" (CAP Code section 3, rules 3.23 to 3.26 and 3.33 to 3.42)

### 1.1 The rules, verbatim

- 3.33: comparisons "must compare products meeting the same needs or intended for the same purpose". 3.34: they "must objectively compare one or more material, relevant, verifiable and representative feature of those products, which may include price". 3.35: they "must not create confusion between the marketer and its competitors" (evidence, CAP AdviceOnline "Comparisons: Identifiable competitors", updated 27 Aug 2026, https://www.asa.org.uk/advice-online/comparisons-identifiable-competitors.html; and the CAP Code, https://www.asa.org.uk/type/capcode/code_rule/3.34.html).
- Comparisons with **unidentifiable** competitors have fewer requirements: they "must not mislead the consumer, and the elements of the comparison must not be selected to give the marketer an unrepresentative advantage (rule 3.37)" (evidence, "Comparisons: General", updated 10 Nov 2025, https://www.asa.org.uk/advice-online/comparisons-general.html).
- Denigration, rule 3.41/3.42: comparisons "must not discredit or denigrate another product, marketer, trade mark, trade name or other distinguishing mark", and the rule applies even to accurate claims "if such claims are expressed in a manner that is insulting, derogatory or demeaning"; "claims that go beyond a robust and objective comparison of services may be considered denigratory" (evidence, "Denigration", updated 22 Apr 2025, https://www.asa.org.uk/advice-online/denigration.html).
- Verifiability: "the advertiser should set out the relevant information in the ad, or signpost how the information used to make that comparison can be checked by the target audience", for example "comparison can be verified on www…" (evidence, "Comparisons: Verifiability", updated 31 Jul 2026, https://www.asa.org.uk/advice-online/comparisons-verifiability.html).
- The same nine conditions sit in law for B2B advertising: not misleading; same needs; "objectively compares one or more material, relevant, verifiable and representative features"; no confusion; "does not discredit or denigrate"; no unfair advantage of a competitor's mark; no imitation (evidence, BPRs 2008 reg 4(a) to (i), URL above).

### 1.2 The finding that changes the plan: "names no competitor" does not escape the rules

"If it is possible for a consumer to name at least one competitor or competing product, rules 3.32 – 3.36 will apply" (evidence, CAP "Comparisons: Identifiable competitors", URL above). CAP's 4 May 2023 article puts it the same way: "If the audience is able to name at least one competitor or competing product when looking at a comparison, it will be considered a comparison with an identifiable competitor" (evidence, https://www.asa.org.uk/news/shall-i-compare-thee-making-comparisons-with-identifiable-competitors.html). A ruling of 6 May 2026 applied this to an unnamed "UK's leading body" claim: "the claim amounted to a comparison with identifiable competitors, even though none were named", and it failed because the ads "did not provide any information to ensure that consumers or competitors were able to check the comparative claim, nor did it include a signpost" (evidence, ASA ruling on The Professional Development Consortium Ltd, A25-1322754, https://www.asa.org.uk/rulings/the-professional-development-consortium-ltd-a25-1322754-the-professional-development-consortium-ltd.html).

A table headed "a website builder" is a comparison with identifiable competitors, because the visitor can name Wix or Squarespace. So the full set applies: same purpose (fine, both produce a business website), objective and verifiable features, no denigration, and a signpost to how the visitor can check.

### 1.3 What a comparison table may and may not say

May say (with evidence held):

- Facts about **how the work is split**: who picks the layout, who writes the words, who does the building. These are verifiable on any builder's own pages. Observed today: Wix's template gallery says "Simply pick a website template that matches your niche and goals, then customize it to fit your brand", "Easily drag and drop any element where you want it", and "choose the one you like best and then jump into the Editor to make it your own", and advertises "2000+" templates (observed, https://www.wix.com/website/templates). Squarespace's template page returned only its navigation shell to my fetch, which listed "Website Templates" and an "AI Website Builder" (observed, partial, https://www.squarespace.com/templates).
- Facts about **what the visitor sees before paying**: with a builder, a template gallery and their own work in progress; with the studio, three designs in their brand. Both verifiable.
- Facts about **the studio's own offer**: who designs, who writes, what is owned, what happens after launch. These need no comparison at all and carry the least risk.

May not say:

- Anything about quality of the other route: "cheap-looking", "cookie-cutter", "looks like everyone else's". These are the denigration pattern the ASA upheld against Fussy Ltd (19 June 2024, "unwanted gifts") and Tonic Nutrition (15 May 2024, "Dump the Junk") (evidence, CAP "Denigration", URL above). A quality claim is also an objective claim the studio cannot substantiate across thousands of builder sites.
- Anything about a competitor's terms, pricing or lock-in unless checked on the day and signposted: for example "you never own a builder site". Business reasoning: builder terms change, and the studio has no process to re-verify them, so leave them out.
- Claims about "agencies" as a class. The existing About copy, "Most agencies ask you to commit before you have seen anything", is an objective comparative claim about identifiable competitors (any UK agency) with no evidence held. Reword it as the visitor's own experience (section 7.1 gives the line).
- "Best", "leading", "no. 1" style superlatives, which "are likely to need different evidence to top parity claims" and imply a whole-market comparison (evidence, CAP article of 4 May 2023, URL above). Puffery that no one takes literally is allowed under rule 3.2, but a table is read literally (evidence, "Types of claims: Puffery", updated 12 Mar 2026, https://www.asa.org.uk/advice-online/types-of-claims-puffery-and-expressions-of-opinion.html).

Design consequence (business reasoning): build the section as **two columns, not three**. "You do it yourself" versus "We do it with you". Cover the agency route in a separate line addressed to the visitor's memory, not as a claim about agencies. Put a one-line signpost under the table telling the visitor where to check the builder column. Keep the tone generous about builders: the ASA reads balance as a sign the comparison is objective, and a reader who chose a builder last year should not feel insulted.

### 1.4 "Free" (3.23 to 3.26) and the email

- Rule 3.23: ads "must not describe a product as 'free' if the consumer has to pay anything other than the unavoidable cost of responding and collecting, or paying for delivery". Rule 3.24: ads "must make clear the extent of the commitment the consumer must make to take advantage of a 'free' offer". CAP's advice adds that where an item requires registration or personal details, that obligation must be transparent (evidence, "Use of 'free'", updated 11 Dec 2025, https://www.asa.org.uk/advice-online/use-of-free.html).
- The same ban is now statute for consumer marketing: DMCC Act 2024 Schedule 20 paragraph 23 bans "describing a product as 'gratis', 'free', 'without charge' or similar if the consumer has to pay anything other than the unavoidable cost" (evidence, https://www.legislation.gov.uk/ukpga/2024/13/schedule/20; CMA guidance CMA207, updated 18 Nov 2025, https://www.gov.uk/government/publications/unfair-commercial-practices-cma207/unfair-commercial-practices).
- Rulings 2024 to 2025: Samsung Electronics (UK) Ltd, 27 Nov 2024, "free" Persil that only part-covered the cost, breached 3.1, 3.23 and the promotions rules (evidence, https://www.asa.org.uk/rulings/samsung-electronics--uk--ltd-a24-1252670-samsung-electronics--uk--ltd.html). Webloyalty International, 23 Oct 2024: a "free" reward that needed an £18 monthly subscription, where the qualifying text sat "underneath the prominent 'Continue' button where consumers likely would not notice it before clicking" (evidence, https://www.asa.org.uk/rulings/webloyalty-international-ltd-g24-1229880-webloyalty-international-sarl-ltd.html).

Application to this page. The three designs are free in the 3.23 sense: nothing is paid, and an email is the unavoidable cost of delivery. The commitment (name, company, email; 30-day link) is stated in FAQ item 1, in "What happens to my details?" and in "A link you can share". Two cautions from Webloyalty: keep the email fact **before** the button too (the planned hero helper line "Next we'll ask where to send your link" does this; do not drop it), and never let the only statement of a condition sit under the button. "Nothing to cancel" and "no sign-up" are true and helpful. Do not write "free trial" (rule 3.26 territory) or "free website".

## 2. AI claims (ASA and CAP, 2025 to 2026)

- CAP, 7 Feb 2025: "some of the advertising-related issues which AI may present are already dealt with by the Codes", including misleading claims and images; there are no AI-specific rules (evidence, https://www.asa.org.uk/news/ai-advertising-and-the-policy-landscape-cap-proactive-monitoring.html).
- CAP, 29 May 2025: there is "no blanket legal requirement in the UK to disclose the use of AI in ads". Two questions: "Is the audience likely to be misled if the use of AI is not disclosed?" and "If there is a danger of the audience being misled, is the disclosure clarifying the ad's message or contradicting it?" And: "Disclosure alone is very unlikely to mitigate the harm caused by a fundamentally misleading message" (evidence, https://www.asa.org.uk/news/disclosure-of-ai-in-advertising-striking-the-balance-between-creativity-and-responsibility.html).
- ASA, 27 Aug 2026, on advertising AI products: "Hold evidence to back up any objective claims about what your product can do"; and on omissions, "If the ad did not make clear that the full service would only be provided after payment, the ASA would be likely to conclude that the ad was misleading for omitting material information" (evidence, https://www.asa.org.uk/news/regulating-the-illusion-of-intelligence-in-ads.html). The article's stance is that the ASA "regulates how AI products are presented in advertisements, not the products themselves".
- CMA (DMCC regime, in force 6 April 2025): material information is "information that the average consumer needs to take an informed transactional decision", and omitting it includes giving it in a way that is "unclear, untimely or such that the consumer is unlikely to see it" (evidence, CMA207, URL above).

How a service that uses AI for drafting should describe it (business reasoning applied to the above):

1. Say what the machine does and what the person does, in the same breath. The two questions above are both answered by one honest sentence pair. The current Straight answer already does this.
2. Make every clause true of the built system. Verified in the repo today: the prompt carries "only the company name, the owner's own sentence and their style" (lib/ai/prompts.ts, comment and `briefPrompt`); the logo is analysed locally (lib/inngest/functions/build-concepts.ts, `analyseSubmissionLogo`, no model call); the ranking model sees Pexels thumbnails only, and the visitor's own photographs are re-hosted without any model call (lib/images/stage.ts, `fill`, `kind === 'own'`). So "it never sees your logo, your colours or your photos" is true; "helps find photos" is true only of stock photos, so say "stock photos".
3. Never let "written for you" imply a person wrote the preview wording. "Wording written for you" is acceptable because the AI answer sits two sections below and the FAQ repeats it; do not add "by us" or "by hand".
4. Do not claim review of each preview by a person. Nobody reads the three previews before the visitor does (ADR 0011: the answers are judged by code). A claim of human review would be the misleading kind that disclosure cannot cure.
5. Keep "A person designs every layout" and gate any count. Today one template is built; "ten layouts" is false until ten render.
6. The AI statement is material information. Keep it in Straight answers (visible, not only in the collapsed FAQ) and link the FAQ training answer to /privacy.

## 3. Training, data and Anthropic's terms

### 3.1 What UK GDPR requires the page and notice to say

UK GDPR Article 13 requires, at collection, "the purposes of the processing for which the personal data are intended as well as the legal basis", "the recipients or categories of recipients of the personal data", and "the period for which the personal data will be stored" plus the individual's rights (evidence, https://www.legislation.gov.uk/eur/2016/679/article/13). The ICO's own pages were unreachable today (**Unverified** as primary text). Through Skadden's summary of the ICO's 13 December 2024 generative AI consultation response: the ICO expects transparency to be "meaningful rather than a token gesture", and purposes to be specific, since vague purposes such as "training AI models" are "unlikely to satisfy requirements" (evidence via secondary source, https://www.skadden.com/insights/publications/2025/01/ico-publishes-outcomes-of-genai-consultation). Osborne Clarke's summary adds the ICO's warning that without transparency "individuals cannot know the purposes for which their data is being processed, or even that it is being processed at all" (evidence via secondary source, https://www.osborneclarke.com/insights/ico-updates-its-views-using-personal-data-generative-ai-uk).

The existing /privacy page already names Anthropic as a processor ("writes the wording from your sentence, and judges stock photographs") and states retention. What it does not yet say, and should: that the model's maker does not train on the data, how long the maker keeps it, and that name, email, logo and photographs are never sent to it. A short home page answer can point there.

### 3.2 Anthropic's commercial terms (fetched today)

- Commercial Terms of Service, effective 17 June 2025: "Anthropic may not train models on Customer Content from Services." Outputs: "Anthropic hereby assigns to Customer its right, title and interest (if any) in and to Outputs." Customer Content is the customer's confidential information (evidence, https://www.anthropic.com/legal/commercial-terms).
- Privacy Center: "By default, we will not use your inputs or outputs from our commercial products (e.g. Claude for Work, Anthropic API, Claude Gov, etc.) to train our models", with an exception where the customer "explicitly report[s] feedback or bugs" (evidence, https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training).
- Retention, page updated 1 July 2026: "For Anthropic API users, we automatically delete inputs and outputs on our backend within 30 days of receipt or generation", with exceptions where content is flagged as a Usage Policy violation (kept up to 2 years) or under other agreements (evidence, https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data). A separate "Covered Models" regime requires 30-day retention of prompts and outputs for Claude Fable 5 and Claude Mythos 5 (evidence via search summary of https://privacy.claude.com/en/articles/15425996-data-retention-practices-for-covered-models; **Unverified** whether the list has changed). The pipeline uses `claude-sonnet-5` and `claude-haiku-4-5` (lib/config.ts line 97), so the default 30-day deletion applies.

So the page can truthfully say: the studio trains nothing; the sentence and company name go to the model's maker, whose terms say it is not used for training; it is normally deleted within 30 days; name, email, logo and photographs never go to it. Keep the exception ("normally") because of the flagged-content rule, and put the full detail in the notice.

## 4. Who owns the site: UK law and how honest studios phrase it

### 4.1 The default position

- Copyright: "The author of a work is the first owner of any copyright in it", except an employee's work in the course of employment (evidence, CDPA 1988 s.11, https://www.legislation.gov.uk/ukpga/1988/48/section/11). Paying for a website does not transfer copyright; a written assignment or licence does.
- Design right: "The designer is the first owner of any design right in a design which is not created… in the course of employment". The old rule giving commissioned design right to the commissioner was removed on 1 October 2014 by the Intellectual Property Act 2014 (evidence, CDPA s.215 as in force, https://www.legislation.gov.uk/ukpga/1988/48/section/215). A search-result snippet attributed to a DBA members' resource still said design right "will transfer automatically to the party who commissions the work"; that is out of date since 2014 and the page is members-only, so treat it as **Unverified** and do not rely on it.
- Pinsent Masons' guide (last updated 2008, marked unmaintained): "In the absence of agreement, the contractor will own the copyright in whatever he creates" and "You should agree in advance that the copyright in anything created by the contractor for you will be owned by you" (evidence, dated, https://www.pinsentmasons.com/out-law/guides/intellectual-property-in-websites-ownership-and-protection).
- Domain: the registrant is the legal holder. Nominet's Dispute Resolution Service transfers a .uk name only for an "abusive registration", so a designer who registered the client's domain in the designer's name is a real risk to the client (evidence, Nominet DRS, https://nominet.uk/uk-registry/domain-disputes/; practitioner opinion on registrant practice from several agency guides, e.g. https://gtstu.com/website-ownership-checklist-before-hiring-a-designer/).
- Stock photographs are licensed, not owned. Pexels: "All photos and videos on Pexels are free to use", commercial use and modification allowed, "Attribution is not required"; not allowed: selling unaltered copies, implying endorsement, use "as part of your trade-mark, design-mark, trade-name, business name or service mark" (evidence, https://www.pexels.com/license/). The ownership statement must not claim the client owns the photographs.

### 4.2 What fair contracts do

- The UK Copyright Service's web design note: "The copyright to the site content and design may passed to the client upon payment, along with licenses for more generic code or modules that the designer/developer may build or use" (evidence, practitioner body, https://copyrightservice.co.uk/protect/p11_web_design_copyright).
- Freelancer contract guides converge on assignment on final payment, with the freelancer's pre-existing tools and frameworks carved out: "All intellectual property rights transfer to the client upon receipt of final payment in full" and define "Pre-existing IP… frameworks, methodologies, code, design systems, templates" as staying with the freelancer (practitioner opinion, https://legalvision.co.uk/intellectual-property/freelancer-ip-ownership/, https://bracton.org/freelance/ip-ownership). The Freelancers Union standard contract itself did not surface in search; **Unverified**.
- The DBA Code of Conduct says nothing specific on assignment; its relevant lines are "Members may promote their services by all normal commercial means… providing this is legal, decent, honest and truthful" and members "shall not knowingly copy the work of another company" (evidence, https://www.dba.org.uk/resources/test-dba-code-of-conduct/).

### 4.3 How honest UK studios phrase it (observed today)

- Rubber Duckers (10 Apr 2026): "The contract should say that after full payment, you own or get a perpetual licence to all code, design assets, and content." "Your business name should appear as the domain owner." And the line worth borrowing in spirit: "If you can't hand your entire site to a different developer tomorrow without asking your current agency for anything, you don't really own it." (observed, https://rubberduckers.co.uk/do-you-own-your-website/)
- Masuyo Digital (18 Aug 2026): "If cancelling means losing the site because you never owned it, that is not a care plan, it is a lease." (observed, https://masuyodigital.com/guides/website-care-plans)

The honest structure for a template-based studio (business reasoning): the client owns the finished site as delivered, its wording and their own brand files; the studio grants a perpetual, irrevocable licence to the template code it reuses, or assigns it outright if the owner prefers never to reuse it; the domain is registered in the client's name from the start; hosting sits in an account the client can take over; stock photographs stay under their own licence. Whatever the page says must match the contract, because for consumers "anything said or written to the consumer by the trader about the trader or service" becomes a contract term if they relied on it (evidence, CRA 2015 s.50(1), https://www.legislation.gov.uk/ukpga/2015/15/section/50), and for business clients it is a representation that can be sued on.

## 5. Care plans: what UK studios include and how to say it without a price

Three UK sources loaded today agree on the core:

- Varsuite (1 Aug 2026): hosting with "automatic SSL certificates, malware scanning, and web application firewall rules"; daily off-site backups kept at least 14 days with one-click restore; uptime checks every minute; a staging environment; updates "reviewed by developers before deployment"; "priority support with same-day response times"; traps to avoid: "hidden per-change fees", unlimited changes with "2+ week" turnaround, "monitoring without remediation", and no SLA (observed, https://varsuite.co.uk/blog/what-web-hosting-and-a-care-plan-should-include-and-what-to-watch-for).
- EdTheDev (17 Mar 2026): basic plans cover "security updates and patches", "regular backups", "uptime monitoring", "SSL certificate renewal"; standard plans add "content updates (text, images, pricing)" with a monthly allowance; premium adds "priority support (same-day response)". Red flags: "Who owns the website if you leave?" and "long lock-in contracts (12+ months with exit fees)"; its own plan is "rolling monthly after a 3-month minimum" (observed, https://edthedev.co.uk/blog/website-maintenance-plans-uk/).
- Masuyo Digital (18 Aug 2026): six parts, quoted: hosting and domain "with SSL kept valid so browsers do not warn visitors away"; backups "taken automatically, stored somewhere other than the server itself, and tested"; updates "applied on a staging copy first"; monitoring "that alert someone when the site goes down, rather than relying on a customer"; "a defined allowance for changes each month"; "a short monthly note" (observed, URL above).

Stating it without a price (business reasoning, with the compliance hooks):

1. Name each inclusion as a fact, not a benefit: hosting, the certificate, backups, updates, monitoring, a monthly change allowance, a reply time, a monthly note.
2. Every number is a commitment. "Reply within one working day" and "a backup every day" are objective claims (CAP 3.7) and, for a consumer, contract terms (CRA s.50). Only state what a one-person studio keeps on holiday. Do not write "24/7", "unlimited" or "guaranteed uptime": uptime belongs to the host's SLA, not the studio.
3. State the exit. "Rolling monthly, cancel any time, keep everything" answers the lock-in fear and is the line the guides say buyers look for.
4. Say the cost is given on the call. That is not a price and keeps the owner's rule.
5. Keep the numbers in lib/config.ts (reply time, backup cadence, allowance) so the page and the contract cannot drift.

## 6. Guarantees and risk reversal

### 6.1 The rules

- CAP 3.55: ads "must not use the word 'guarantee' in a way that could cause confusion about a consumer's rights". 3.56: ads "must not mislead by omitting significant limitations to an advertised guarantee (of the type that has implications for a consumer's rights)". 3.57: "Marketers must promptly refund consumers who make valid claims under an advertised money-back guarantee" (evidence, CAP Code rules as printed today, https://www.asa.org.uk/type/capcode/code_rule/3.53.html; note the numbering is 3.55 to 3.57 in the current edition, not 3.53 to 3.55 as older summaries say).
- CAP's five tips (26 Jan 2023): "Make sure the meaning of the 'guarantee' claim is clear"; "Don't make an absolute performance claim you cannot prove"; "Tell people about any restrictions on your guarantee"; "Make sure you honour your guarantees" (evidence, https://www.asa.org.uk/news/referencing-guarantees-and-warranties-in-advertising.html).
- Rulings: Merlin Attractions, 29 Nov 2023 ("Rainy Day Guarantee" needed one hour of continuous rain, not made clear); Virgin Media, 13 Dec 2023 ("fastest WiFi Guarantee" misleading); Velora London, 9 Apr 2025 (no evidence refunds were paid under a "30-Day Money Back Guarantee") (evidence, CAP "Guarantees and warranties", updated 22 Apr 2025, https://www.asa.org.uk/advice-online/guarantees-and-warranties.html).
- DMCC Schedule 20 paragraph 11 bans "presenting rights given to consumers by law as a distinctive feature of the trader's offer" (evidence, URL in section 1.4). Do not dress "reasonable care and skill" or a statutory right to repeat performance as a studio promise.
- Consumer Rights Act 2015: services must be performed with reasonable care and skill (s.49); if not, the consumer may require repeat performance or a price reduction (ss.54 to 56) (evidence, Business Companion guidance, https://www.businesscompanion.info/sites/default/files/CRA-Services-Guidance-for-Business-Sep-2015.pdf). For business clients the equivalent is SGSA 1982 s.13 (section 0).

### 6.2 What this means for "nothing to pay until you approve the design"

That line is a **payment term**, not a guarantee, and it is stronger for being stated as one. Recommendation (business reasoning): do not use the word "guarantee" anywhere on the page. State the payment sequence as fact, name its one limitation (what "approve" means and what is billed after it), and make sure the contract says the same. Avoid "risk-free": it is an absolute claim (the visitor still spends time, and third-party costs such as a domain fall due). Avoid "money back": it triggers 3.57 and the refund record the Velora ruling asked for. If the owner later wants a satisfaction promise, its full terms must be available before the visitor commits (3.56), and every valid claim must be honoured (3.57).

## 7. Recommended wording

Every sentence below is under 20 words, British English, sentence case, no exclamation marks, no em dashes, "wording" never "copy". Blockquoted lines are the proposed copy. "AI" appears only in the Straight answer that already carries it, so `copy.test.ts` ("AI" twice) keeps passing if the new FAQ items join `COPY`. Gates say what must be true before a line ships.

### 7.1 Comparison section (no competitor named; two columns; a signpost)

Section id `compare`. H2 and lead:

> Doing it yourself, or asking us.
> Website builders suit many businesses. Here is how the work is split, so you can choose.

Table, two columns headed "You build it with a builder" and "We build it with you":

| Row                         | You build it with a builder                                  | We build it with you                                                 |
| --------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------- |
| Who designs the layout      | > You pick a template and change it yourself.                | > A person at the studio designed each layout.                       |
| Who writes the words        | > You write them, or fill in the blanks.                     | > We draft them from your sentence, then finish them with you.       |
| What you see before you pay | > A template gallery. Your own site appears as you build it. | > Three designs in your logo and colours, before you spend anything. |
| Who does the work           | > You do, in your own time.                                  | > We do, to a date we agree.                                         |
| Who owns the result         | > Your site lives on the builder's platform.                 | > You own the site and the domain. You can move it. [gate: contract] |
| Who looks after it          | > You keep it up to date yourself.                           | > Our care plan, if you want it. [gate: care plan exists]            |

Lines under the table:

> You can check the left column on any builder's template page and help pages.
> If you enjoy building things, a builder may suit you. Many good sites started that way.

Replacement for the About line "Most agencies ask you to commit before you have seen anything. A quote, a deposit, a six-week wait, then a first draft you might not like.":

> If you have hired before, you may know the pattern. A quote, a deposit, a wait, then a first draft.

Straight answer (gated on all ten templates rendering):

> Will it look like everyone else's?
> No two of your three designs share a layout. A person at the studio designed each one. Your logo, colours and words go on top. The real site is built from the one you pick, not copied from it.

Compliance notes: the left column states only how builders work, verifiable on their own pages (observed, Wix, section 1.3); the "lives on the builder's platform" cell is a plain fact about hosted builders and must stay neutral; there is no quality claim about either route; the signpost line satisfies the verifiability rule; the About rewrite removes the unsubstantiated "most agencies" claim.

### 7.2 AI and data statement

Replacement for the existing Straight answer (keeps "AI" to one mention after the question):

> Is this AI?
> Partly, and we'll say where. AI drafts your wording from your own sentence and helps choose stock photos. A person designed every layout, and a person builds your real site. It never sees your logo, your colours or your photos.

New FAQ item (no "AI"; it joins the FAQ list and `COPY`):

> Is my sentence or logo used to train anything?
> No. We train nothing. Your sentence and company name go to the writing model's maker to draft your wording. The maker's terms say it is not used for training, and it is normally deleted within 30 days. Your name, email, logo and photos never go to it. The rest is in our privacy notice.

Privacy notice additions (not home page copy, so the 20-word rule is a courtesy): under "Who works on it for us", after Anthropic: "Its terms say it does not train on what we send. It deletes it within 30 days unless flagged for misuse." Under "What we do with it": "Only your company name and your sentence go to the writing model. Your name, email, logo and photographs do not."

Gates: none for the Straight answer (true today, verified in code). The FAQ item depends on the model list staying outside Anthropic's "Covered Models" regime, which changes the retention wording, not the training clause; re-check the two Privacy Center pages at each model change.

### 7.3 Ownership statement (FAQ item, plus the taster's third step)

FAQ item:

> Do I own the design and the code?
> Yes, once the final invoice is paid. The site, its wording and your brand files are yours. The domain is registered in your name from day one. You can take the code anywhere and change it. Stock photographs come with their own free licence, which stays with them.

If the studio keeps the right to reuse its templates (recommended default, section 8), add one sentence:

> We keep the right to reuse our own building blocks on other sites.

Taster step 3 body (replaces "You get a fixed quote and a timeline on the call. Then we build it from the design you chose."):

> You get a fixed quote and a timeline on the call. We build it from the design you chose. When it is paid for, it is yours to keep and move.

Gates: the contract must say exactly this before either ships (design plan section 11 item 5). "Registered in your name from day one" requires the studio's onboarding to register or transfer the domain to the client as registrant before build starts. "Fixed quote on the call" stays only if a quote can be given inside every call (design plan item 4).

### 7.4 Care plan statement (new section "After launch")

Section id `after-launch`. H2 and lead:

> After launch.
> A website needs a home and someone to check on it. You can do that yourself, or ask us.

List (each number rendered from lib/config.ts):

> Hosting, with the padlock certificate kept renewed.
> A backup every day, stored away from the site and tested.
> Software kept up to date, tried on a test version of the site first.
> A check every five minutes that the site is up. We hear before you do.
> Small changes each month: a price, a photo, a new service.
> A reply within one working day.
> Rolling monthly. Cancel any time and keep everything.

Closing lines:

> No plan? You still own the site and can host it anywhere.
> We give the monthly cost on the call.

Gates: the plan must exist with these exact inclusions; the check interval, the reply time and the change allowance must be measured against what the studio actually runs (the monitoring tool's interval; the owner's working pattern). Replace "five minutes" and "one working day" with the real values. Never add "unlimited", "24/7" or "guaranteed uptime".

### 7.5 Risk-reversal line

Choose one; state it in the taster under the call button and again in FAQ item 8. Never use "guarantee", "risk-free" or "money back".

Variant A, nothing until approval (recommended if the owner can carry the design stage unpaid):

> You pay nothing until you have approved the homepage design. After that, we bill in two stages agreed on the call.

Variant B, staged payment:

> You pay in stages as the site takes shape. Nothing before you have seen your three designs and agreed a quote.

Variant C, fixed quote only:

> The quote is fixed. If you ask for more, we agree the extra before we start.

Gate: the chosen line must match the contract and every invoice. If any third-party cost (domain, hosting) is billed before approval, it is a "significant limitation" and must sit in the same sentence pair, for example: "Domain and hosting fees are paid to their providers as they fall due."

## 8. Owner decisions this research needs, with recommended defaults

| #   | Decision                                                         | Recommended default                                                                              | Why                                                                        |
| --- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| 1   | Two-column comparison (builder vs studio) or three (plus agency) | Two columns; agency route as the visitor's memory line                                           | Agency claims cannot be substantiated or verified (section 1.3)            |
| 2   | Reword "Most agencies ask you to commit…" in About               | Yes, to the 7.1 line                                                                             | Unsubstantiated comparative claim about identifiable competitors           |
| 3   | Assign template code or grant a perpetual licence                | Perpetual, irrevocable licence; assign the client's wording, design as delivered and brand files | Lets the studio reuse its ten templates; matches UK practice (section 4.2) |
| 4   | Domain registrant                                                | The client, from day one, with the studio as technical contact                                   | Nominet DRS only helps against abusive registrations (section 4.1)         |
| 5   | Care plan inclusions and numbers                                 | The seven lines in 7.4 with real values in lib/config.ts                                         | Every number is a commitment (section 5)                                   |
| 6   | Care plan term                                                   | Rolling monthly, cancel any time, keep everything                                                | The lock-in fear is the one buyers check first (section 5)                 |
| 7   | Risk-reversal variant                                            | A if affordable, else B                                                                          | A payment term stated as fact; no "guarantee" (section 6.2)                |
| 8   | "Fixed quote on the call"                                        | Keep only if true on every call; else "a quote in writing within one working day"                | Objective claim; CRA s.50 binds it for consumers                           |
| 9   | Privacy notice additions (7.2)                                   | Ship with the FAQ item                                                                           | UK GDPR Art 13 recipients, purposes, retention                             |
| 10  | A claims register                                                | Start `docs/claims-register.md`: every objective claim, its evidence, its check date             | CAP 3.7 requires evidence held before publication                          |

## 9. Implications for the repo

- `app/_components/copy.test.ts`: add the new FAQ items, the comparison rows and the after-launch lines to `COPY`. The "AI twice" assertion holds because 7.2 uses the word once in the answer and never in the FAQ item. Add a check that no visitor copy contains "guarantee", "risk-free", "unlimited" or "24/7".
- `app/_components/straight-answer-items.ts`: swap the AI answer for 7.2; the fifth item stays gated on ten templates.
- `app/_components/faq-items.ts`: add "Is my sentence or logo used to train anything?" and "Do I own the design and the code?"; move the risk-reversal line into item 8 once chosen.
- `app/_components/about.tsx`: replace the "Most agencies" sentences.
- `app/privacy/page.tsx`: the two additions in 7.2.
- `lib/config.ts`: `care: { checkMinutes, replyWorkingDays, backupsPerDay, changesPerMonth }` so the section and the contract read one source.
- `lib/analytics/events.ts`: no new event is required for compliance; if the comparison section ships, `section_view` already covers it. A `compare_check_click` for the signpost link is optional (business reasoning).
- `e2e/home.spec.ts`: assert the comparison section's H2 and the signpost line; assert the About text no longer contains "Most agencies".
- Terminology check, not compliance: "It stays live for 30 days" (what-you-get) uses "live" about the link. The owner's rule bans "live" about the designs; confirm the link is exempt or write "It works for 30 days".

## 10. Sources

Evidence (official or regulator): CAP AdviceOnline pages on identifiable competitors (27 Aug 2026), general comparisons (10 Nov 2025), verifiability (31 Jul 2026), denigration (22 Apr 2025), use of "free" (11 Dec 2025), guarantees (22 Apr 2025), puffery (12 Mar 2026), own-website remit (26 Feb 2026); CAP Code rules 3.7, 3.23 to 3.26, 3.34, 3.52 to 3.57; ASA rulings: Professional Development Consortium (6 May 2026), Samsung Electronics (27 Nov 2024), Webloyalty (23 Oct 2024), and those cited within the CAP pages; CAP and ASA articles of 4 May 2023, 26 Jan 2023, 7 Feb 2025, 29 May 2025, 27 Aug 2026; legislation.gov.uk: CRA 2015 ss.2, 50; SGSA 1982 s.13; BPRs 2008 reg 4; DMCC Act 2024 Sch 20; CDPA 1988 ss.11, 215; UK GDPR Art 13; CMA207 (18 Nov 2025); Business Companion CRA services guidance (Sep 2015); Anthropic Commercial Terms (17 Jun 2025) and Privacy Center pages (training; retention, 1 Jul 2026); Pexels licence; Nominet DRS; DBA Code of Conduct.

Secondary summaries used where the primary was unreachable: Skadden (Jan 2025) and Osborne Clarke on the ICO's generative AI response of 13 Dec 2024; the resultsense.com summary that located the ASA article of 27 Aug 2026 (the ASA page was then fetched directly).

Observed today: wix.com/website/templates; squarespace.com/templates (navigation only); rubberduckers.co.uk; masuyodigital.com; varsuite.co.uk; edthedev.co.uk.

Practitioner opinion: LegalVision, Bracton and other freelancer IP guides; UK Copyright Service P-11; Pinsent Masons (2008, unmaintained).

Repo evidence: lib/ai/prompts.ts, lib/ai/rank.ts, lib/images/stage.ts, lib/images/plan.ts, lib/inngest/functions/build-concepts.ts, lib/config.ts, app/privacy/page.tsx, app/_components/*.ts, docs/adr/0011, docs/home-page-design-plan.md sections 10 and 11.
