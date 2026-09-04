# Imagery: the visitor's photographs first, else searched, judged and re-hosted

- Status: accepted
- Date: 4 September 2026
- Plan: `docs/pipeline-plan.md`, section 13

## Context

The build guide's imagery stage searches Pexels with the brief's queries, has Haiku 4.5 rank eight to twelve thumbnails per slot, re-hosts the winner with responsive variants, credits the photographer, and falls back to Pexels' own order when the ranking fails. The form lets the visitor add up to six photographs of their own, which the guide's step 4 treated as the alternative to a search.

## Decision

1. **A plan per template, pure.** `planImagery` maps a template's image slots to what fills each: the visitor's own photographs in the order they added them, a search when they added none, or nothing. A visitor with photographs gets no stock: their pictures or none. The first slot is the hero and takes the brief's hero queries; the rest take the detail queries. The look the visitor chose adds words to every search (`CONFIG.images.styleQuery`).
2. **One search per query, judged once.** Pexels returns twelve landscape candidates; Haiku 4.5 scores them for the slot's purpose and names a reason to reject (watermark, text, busy, a face as the subject, off topic). `orderByVerdict` drops the rejected and sorts by score with the search order breaking ties; when the judging fails the search order stands. The first candidate that re-hosts is the slot's picture, and no picture is used twice on one page.
3. **One stored size.** `rehostImage` fetches the source, makes one WebP no wider than 1920 px, and stores it under its key (`images/pexels-<id>.webp`, `images/own-<sha>.webp`), so a retry overwrites itself. `next/image` serves every viewport from that one file; the guide's hand-made responsive variants are not needed.
4. **A picture is never the reason a page does not appear.** A slot that fails at any step is null and logged; the template draws around it. The stage as a whole falls back to no pictures only if the plan itself cannot run.
5. **Credits are data.** A Pexels picture carries its photographer's name and profile URL; the template's footer prints them with the Pexels link the licence asks for. The visitor's own photographs carry no credit.

## Consequences

- `lib/images/pexels.ts`, `rehost.ts`, `plan.ts`, `stage.ts` and `lib/ai/rank.ts`. The Pexels response is validated with zod at the boundary; the rate limit remaining is logged on every search.
- The per-image scrim solver from the guide is still deferred: Aurora's statement scrim is a fixed gradient that is solid under the words, so `on-scrim` on `scrim` always passes.
- Verified on 4 September 2026 on a production build with the Inngest dev server: a submission without photographs got two Pexels pictures, re-hosted as WebP and credited by name in the footer, in under eight seconds; one with two uploaded photographs got those two, uncredited, in under seven. The ranking call could not run (the key lacked its workspace id), so the search order stood, which is the designed fallback.
