# The home page sells the site, not the taster

- Status: accepted
- Date: 22 September 2026
- Supersedes: the twelve-band arc in `docs/home-page-content-plan.md` section 2; decisions D7
  (the Taster's heading), D11 (the Outcomes band), D12 (the closing's bookend), D14 (the
  walkthrough's lead)
- Keeps: every honesty rule in ADR 0022 and `docs/claims-register.md`; the hero (ADR 0031, 0032)

## Context

The owner's brief, 22 September 2026: the page is text heavy and repetitive; it is about
answering five questions to get three free designs when it should be about the website the
studio would build; the visitor should finish it believing the studio can build them the best
possible site. The hero is out of scope. The voice should be professional, and fun and cool
with it.

Measured before the change: 2,262 visible words below the hero in twelve bands, "three designs"
eighteen times, "real site" eleven, "on the call" twelve, "five minutes" eight. Four bands
(What you get, How it works, the Taster, the real build) covered one topic between them, and the
band about the site a client pays for sat seventh, under two process sections.

The research behind the rework is in the session's research folder, summarised from eight lenses
(page structure, end-product copy, twenty-five live studio pages, brand voice, buyer language,
text density, solo-studio credibility, and this repo's own prior research), a completeness
critic and four gap studies. The strongest findings that bear on the decision: proof the visitor
can check belongs early and the look is judged first (Stanford 2002, STRONG); word count and
difficult words correlate negatively with conversion (Unbounce 2024, MODERATE, observational);
concision alone was worth 58 in the one controlled study of cutting (NN/g 1997, STRONG for the
effect, reasoning for the transfer); a restated fact adds load before a reader can dismiss it
(Sweller's redundancy effect, STRONG for the mechanism); superlatives about a service imply a
whole-market comparison the studio cannot substantiate (CAP 3.2, 3.7, 3.11); "cool" is bounded
autonomy rather than humour, and humour lowers source credibility where money is at stake
(Warren and Campbell 2014; Eisend 2009, both MODERATE as transfers).

## Decision

1. **Nine bands, in the order proof, the site, the free look, the build, the alternative, the
   catch, the person, the questions, the ask.** Work moves to first after the hero. What you
   get, Outcomes and the Taster are deleted as bands; each line's job is named a home or cut
   (`docs/copy-review.md`, the 22 September pass).
2. **One band for the site (`#included`).** The four outcome labels become the frame: each job
   is a label, one scene sentence, and the two cells built in to do it. Eight cells, so the
   grid and its pins hold.
3. **One band for the paid step (`#real-build`).** The Taster's two best lines are its lead, the
   call it asked for is step one, and the call agenda renders as three plain lines without its
   minute bar. No page carries two process sections.
4. **The taster is sold once, as risk removal.** It is shown by the walkthrough, named in the
   options row, defended in the catch card, priced against in the cost answer, and asked for by
   the buttons. "Three designs" appears five times where it appeared eighteen.
5. **Three nouns never mix:** "the sketch" is what is on screen, "three designs" is what
   arrives, "your site" is what is hired and never appears inside a walkthrough step. The one
   sentence allowed to hold two of them is the bridge after the walkthrough's button.
6. **Belief is earned by facts, never asserted.** No superlative, no enquiry or ranking promise,
   no adjective standing in for craft. What carries it instead: six live sites one tap away,
   three measured results on their own cards, a named person who stays on the build, a
   professional who writes every page, a phone test before launch, and one fixed quote.
7. **The price keeps two homes,** the "How you pay" row and the cost answer, and gains a worked
   five-page total derived from `CONFIG.price` (`PRICE.worked`). Never "from £679": the scope
   sits in the same sentence as the figure (CAP 3.17; DMCC s.230), and a copy test now fails any
   "from £" in the corpus.
8. **The voice sets a dial per band** (none, low, medium) and a budget of seven dry turns for
   the page, each placed after the information, none at a price, a deletion date or a
   disappointment, and none a pun on web, site, page or pixel.
9. **The closing opens on the finished site** and closes on the free step ("A site that looks
   like your business." / "Looking is free."), replacing the hero's bookend.

## Consequences

- 1,189 visible words below the hero, down from 2,262; the served HTML falls from 38 KB to
  33.5 KB gzipped. The page is 10.1 desktop screens and 14.1 phone screens, down from about 13
  and 20.
- `#what-you-get`, `#outcomes` and `#taster` no longer exist. The hero's arrow, the nav, the
  footer and the analytics section list all re-point in this change, so no dead anchor ships.
- Pinned strings that changed with the wording: the nine H2s in `e2e/no-script.spec.ts`, the
  walkthrough heading, the build heading, the options row count, the About sentence. The copy
  test that tied an outcome row to a measured client is gone with the band; "before they book"
  is now held identical between the site band's Answered scene and the call agenda.
- `measuredClient` is deleted with the band that used it. The three measured results stay on
  their own cards, verbatim, and are still the only figures the page carries.
- The eighth cell still swaps for the hosting one when `CONFIG.care` is recorded; which job it
  belongs under should be checked then, because it answers "Trusted" better than "Answered".
- What this change does not do: nothing on the page says the finished design will be good, only
  that it is designed by hand, written for the client, tested on a phone and open to inspection
  in six live examples. Closing that gap needs a register row about how the six were designed,
  and one checkable line under the cards (owner decision, `docs/copy-review.md`).
