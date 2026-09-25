# Ask the five questions on a page of their own, beside a live sketch

- Status: accepted
- Date: 2026-09-03
- Supersedes: 0003 (the dialog)
- Superseded in part by: ADR 0035 (the page's look and layout; the flow, URL, draft and
  accessibility decisions stand)
- Amended by: ADR 0037 (decisions 2, 4 and 5, 24 September 2026; the question order and decision
  5's stages, 25 September 2026; decision 5 on the furthest question reached, Release 3, 25
  September 2026)

## Context

The dialog from ADR 0003 worked but had nowhere to put anything except the question, and the
owner found it flat. The plan in `docs/start-page-plan.md` moves the questionnaire to `/start`
and gives the other half of the screen to a schematic homepage that fills in from the visitor's
answers as they give them.

## Decision

1. **A route, `/start`, with the question in the URL** (`?q=1` to `?q=5`, `?q=done`). The
   browser's Back button is the Back button, a refresh keeps the place, and Vercel Analytics
   shows drop-off per question as page views. The page is `robots: noindex` and absent from the
   sitemap.
2. **The URL is the only source of truth for which question shows.** The reducer holds answers,
   errors and status; it no longer has an index. A `?q` beyond the first unanswered question is
   corrected with `router.replace`, computed by `firstInvalidIndex`. Amended 24 September 2026
   (ADR 0037, decisions 5 to 7): the done address carries its submission (`?q=done&s={slug}`),
   so a refresh or a pasted link reopens it; the guard is the lower of the furthest question
   shown (`reached`) and `firstInvalidIndex`; and the flow moves by `pushState` and
   `replaceState`, keeping its depth in each history entry, so one Back from done leaves `/start`.
3. **Hydration through `useSyncExternalStore`, not an effect.** The server and the hydration
   render show a skeleton; the real flow mounts once, initialised from `sessionStorage`. No
   `setState` in an effect, no flash of the wrong question.
4. **Answers persist in `sessionStorage` for the tab**, validated on the way back in by a lenient
   `draftSchema` (shape only, no length or format rules, because a draft may be half-typed). A
   restored logo file falls back to the wordmark: the bytes were never kept. Cleared on submit,
   never read by the server. Amended 24 September 2026 (ADR 0037, decision 6): the draft also
   keeps `reached`, and the home page's sentence arrives in a key of its own that `/start` merges
   in, so it never overwrites a draft.
5. **The sketch computes only from the answers.** The description is the hero's paragraph, clamped
   by CSS to three lines, never its headline: a headline slot cannot hold a paragraph of any
   length, and truncating one there looked wrong. The company name is the headline, the wordmark
   and the tab label. Pure helpers in `lib/brief/sketch.ts` derive the initials and tab label,
   and turn the chosen hex into three tints with `oklch(from …)`, which keeps the hue and moves only
   lightness and chroma, the rule the real colour engine will follow. The style paints in from
   question 4 and the colour from question 5, so a default answer never shows before its
   question. Hovering a style or palette previews it; selecting makes it stick. Amended 24
   September 2026 (ADR 0037, decision 13): no template draws initials, so the sketch no longer
   derives them; a plain point stands in for the mark. Amended 25 September 2026 (ADR 0037,
   decision 18): the questions run sentence, name, look, colour, send, so the style paints in
   from question 3 and the colour from question 4, each read from the order in
   `lib/brief/question-ids.ts` rather than written as a number. Amended 25 September 2026 (ADR
   0037, Release 3): on `/start` the live draft (`app/start/_components/draft/`) paints from the
   furthest question reached, so going back never takes a part away, and until the colour
   question it stands in the studio's light, which is not an answer. The sentence is the draft's
   headline until the business name arrives and then steps down to the paragraph, and its colours
   come from a CSS engine that mirrors `CONFIG.colour`.
6. **The sketch is decorative.** It is `aria-hidden`; a visually hidden sentence under it lists
   the answers given so far. The question heading is an `h1` that takes focus on every question.
7. **Checkout mode.** No site navigation and no footer on `/start`: the logo, the progress, and
   one "Back to site" link.
8. **Two frames, one model.** `sketchModelFrom` in `sketch-model.ts` derives everything the
   sketch draws; a browser frame and a phone frame over its corner both render it from the
   shared parts in `sketch-parts.tsx`, each part holding its two sizes. Dashed slots
   labelled `your company`, `your words` and `your photos` stand for answers not yet given, and
   grey bars for copy we will write, so a visitor can tell what is theirs to fill from what is
   ours to write.
9. **Style and photos are independent.** The imagery answer is `{ style, fileNames }`: a style is
   always chosen and up to six photos may sit beside it. In the sketch the style is applied to the
   photos as a filter, and the dark style swaps the sketch's own surface tokens so the page goes
   dark. Photos are held as object URLs in the flow's state, like the logo preview, and dropped on
   restore because the bytes were never kept.

## Consequences

- `submitBrief` still validates and logs and stores nothing, and now returns a brief id. The done
  page counts down the five-minute budget and polls `getDesigns` for the links, which the
  pipeline will answer; until then every brief is "building" and the page says so when the clock
  runs out. **The primary call to action must not be pointed at real traffic until the pipeline
  exists.**
- `useSearchParams` requires the Suspense boundary in `app/start/page.tsx`; the fallback is the
  same skeleton the hydration render shows, plus a `noscript` message.
  Amended 24 September 2026 (ADR 0035): the boundary is gone. `BriefFlow`'s server render is the
  skeleton, because it reads the URL only after hydration, so nothing on the page suspends or
  bails out to the client, and the build would fail if that changed. The boundary also cost
  bytes: React streams a finished boundary larger than 12,800 B a second time, as a hidden copy
  that a script swaps in, and the skeleton, which now draws the real sketch and the header's
  island, is larger than that, so the page's HTML carried it twice.
- The `?q` guard means a deep link into the middle of the questionnaire lands on the first
  unanswered question, never on an empty later one.
- The typed route for `/start` is generated by `next typegen`; run it (or `next build`) after
  adding a route before `tsc` will accept the link.
