# The start page: five questions on a page of their own

Prepared 3 September 2026. Replaces the dialog from ADR 0003 with a full page at `/start`. The reducer, schemas, tests and copy from the dialog carry over; the shell around them changes.

## 1. Why a page, not a modal

- A modal is a box inside someone else's page. It has to stay small, so it cannot show anything but the question. A page can give half the screen to something that makes answering feel worthwhile.
- Every question gets its own URL (`/start?q=3`). The browser's Back button works, a refresh does not lose the place, and Vercel Analytics shows drop-off per question as ordinary page views without a single custom event.
- Checkout mode: no site navigation, no footer, one way forward and one quiet way out. Fewer exits than a modal over a busy home page.

## 2. The creative idea: a sketch that fills in as you answer

The product's promise is "see your homepage in your own brand". The start page keeps that promise early, in miniature. The right half of the screen is a schematic homepage drawn in grey. Each answer paints something into it, in real time, computed from what the visitor typed:

| After question | What appears in the sketch                                                                                                                                                                                                                                           |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 Sentence     | Their words fill the hero's paragraph as they type, clamped to three lines so a long answer still fits. The headline stays grey: a description is a paragraph, not a headline.                                                                                       |
| 2 Details      | The company name lands as the sketch's headline, as a wordmark in its nav and in the browser tab. The page starts greeting them by name.                                                                                                                             |
| 3 Logo         | The uploaded logo replaces the wordmark. Skipped, the wordmark stays and gains initials in a mark.                                                                                                                                                                   |
| 4 Photos       | The hero image block takes the chosen style: warm, minimal, bold, or dark, which turns the whole sketch dark. Own photos sit alongside the style: the first fills the hero image, the next three the feature cards, and the style is applied to them as a treatment. |
| 5 Colours      | The whole sketch re-tints to the brand colour: the button, the nav underline, the feature icons, the page glow. Hovering a palette previews it before it is chosen. This is the reward moment and the last click.                                                    |

Rules that keep it honest:

- It is grey blocks with their words on it. The caption says so on every step: "Live sketch. Not one of your designs, just your answers taking shape."
- It computes only from what they typed. No fake progress bars, no "generating" spinners, nothing that implies the pipeline is running.
- It never shows a layout the ten templates will use. It is a wireframe, so it cannot be mistaken for a design.

How it is drawn: a browser frame with an address pill, and on desktop a phone frame laid over its bottom-right corner, both from one model. Dashed slots are labelled with what will fill them (`your company`, `your words`, `your photos`) and turn into the answer; grey bars stand for copy we write later, so the two are never confused. The image block is hatched until a style is chosen. The pane behind sits on a faint dot grid, like a drafting board.

Why it works commercially: a visitor who can see their company name and colour on a page is looking at something that is already theirs. Leaving means abandoning it. Every answer makes the next one cheaper to give.

## 3. The screen

### Desktop (lg and up)

```
┌──────────────────────────────────────────────────────────────────────┐
│ ✳ PinnaclePX        ▬▬▬ ▬▬▬ ▬▬▬ ▭▭▭ ▭▭▭  Question 3 of 5   Back to site │  h-16, hairline below
├────────────────────────────────┬─────────────────────────────────────┤
│                                │                                     │
│  Add Ashgrove Physio's logo,   │   ┌───────────────────────────┐     │
│  or skip it.                   │   │ ● ● ●  ashgrove-physio    │     │
│                                │   ├───────────────────────────┤     │
│  Your logo goes on all three   │   │ Ashgrove Physio   ▭ ▭ ▭  │     │  right pane: bg-surface-muted,
│  designs. You can skip this    │   │                           │     │  glow that takes the brand hue
│  and add one later.            │   │  Physiotherapy clinic     │     │  at question 5
│                                │   │  in Sheffield.            │     │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐   │   │  Sports injuries, post-op │     │
│    ⬆ Choose your logo          │   │  rehab...        [button] │     │
│    PNG, JPEG, SVG, WebP        │   │  ┌─────────┐              │     │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘   │   │  │  image  │  ▭ ▭ ▭      │     │
│                                │   │  └─────────┘              │     │
│  No logo? We'll set Ashgrove   │   └───────────────────────────┘     │
│  Physio as a wordmark.         │   Live sketch. Not one of your      │
│                                │   designs, just your answers        │
│  ← Back            Next →      │   taking shape.                     │
│  Free. No account. Nobody      │                                     │
│  calls you unless you book.    │   Sentence ✓  Company ✓  Logo  Style│
└────────────────────────────────┴─────────────────────────────────────┘
```

- Left pane: 46% width, max content width 32rem, padding 4rem. Heading at `text-4xl lg:text-5xl`, tracking-tighter, like the site's H1. One question, its control, Back and Next, the click trigger.
- Right pane: 54%, full height, sticky. The sketch is a browser frame (rounded-xl, hairline, `shadow-dialog`) with corner ticks, sitting on `bg-surface-muted` with the site's glow behind it. Below it the caption and a row of chips showing which answers are in.
- No site nav, no footer. The logo links home. "Back to site" is a ghost link.

### Mobile (below lg)

Single column. The sketch becomes a strip at the top, 9:5 ratio, about 150px tall, scaled with `transform` so the same markup renders at both sizes. It sits above the question and is not sticky (a sticky strip would eat the keyboard's space). After each Next the page scrolls to the top, so the change is the first thing seen. The chips row moves under the strip; the caption becomes one line.

## 4. Question by question

Headings use the company name once it is known. The helper line stays under 20 words. Controls are the ones already built in `app/_components/brief/steps`.

| #   | Heading                                | Helper                                                                 | Control                                                                                                           | Sketch reward                                       |
| --- | -------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| 1   | First, your business.                  | A sentence or two is plenty. This becomes the brief for your copy.     | Textarea, example line, live count                                                                                | Paragraph fills in as they type                     |
| 2   | Where should we send your link?        | Your designs arrive at this address. Nobody rings you.                 | Name, company, email                                                                                              | Headline and wordmark appear; tab title changes     |
| 3   | Add {Company}'s logo, or skip it.      | Your logo goes on all three designs. You can skip this for now.        | Drop zone, preview, remove                                                                                        | Logo replaces the wordmark                          |
| 4   | How should {Company} look?             | Pick a style. Add your own photos too, if you have them.               | Four style cards, up to six own photos                                                                            | Hero image block takes the style; hover previews it |
| 5   | Pick {Company}'s colours.              | Your brand colour, or one of ours. This is the last question.          | Four palettes, hex field, picker                                                                                  | Whole sketch re-tints; hover previews; glow shifts  |
| End | {Name}, your designs are on their way. | The links appear here and land at {email}. They stay live for 30 days. | Five-minute countdown ring, three link slots that fill when the pipeline reports ready, Book a call, Back to site | Sketch settles with a slow tint-in                  |

The end screen carries the bridge in one line under the sketch: "This is a sketch from five answers. Imagine what an hour does."

## 5. Motion

- Question change: the outgoing pane fades and slides 8px left, the incoming one fades in from 8px right, 200ms. Done with a keyed wrapper and `@starting-style`, no library.
- Sketch elements: each newly painted element fades and rises 4px over 300ms. A tint change transitions `background-color` and `color` over 400ms so the re-tint at question 5 reads as one sweep.
- Hover preview: palette and style cards preview into the sketch on hover and focus, and revert on leave. Selection makes it stick.
- `prefers-reduced-motion`: the global rule already zeroes durations. Nothing depends on motion to be understood.

## 6. Marketing devices, each with its job

- **Personalisation.** Name and company in headings from question 3 on. Cheap, and it is the visitor's own data, not a trick.
- **Momentum.** The progress bar, the chips row, and the sketch all say "you are most of the way there". Question 5's helper says "This is the last question."
- **Anxiety reducers.** The click trigger under every Next. The email helper says what the email is for and what it is not.
- **Exit design.** One quiet "Back to site" link. Leaving keeps the answers for the session, so coming back resumes where they were.
- **The reward.** Question 5 is the most satisfying screen on purpose: the sketch becomes theirs in colour on the last click. It is placed last so the strongest moment is the one before submit.
- **The bridge.** The end screen is the only place the page sells the call, with one line and one button.

## 7. Technical design

### Route and URL

- `app/start/page.tsx` (server): metadata `title: 'Your five questions'`, `robots: { index: false }`; excluded from the sitemap. Renders the chrome and `<Suspense><BriefFlow /></Suspense>`.
- The question index lives in the URL: `/start`, `/start?q=2` … `?q=5`, `?q=done`. `BriefFlow` reads it with `useSearchParams`, writes it with `router.push` on Next and `router.back()` on Back, so the browser's Back button is the Back button.
- Guard: a `?q` ahead of the first unanswered question is redirected to that question with `router.replace`. `?q=done` without a submitted brief goes to `?q=1`.

### State

- The existing reducer, unchanged, plus one action: `{ type: 'goto'; index }` for URL-driven navigation, which validates every question before the target and stops at the first that fails.
- Answers persist in `sessionStorage` under one key, written on every change and read once on mount, so a refresh or an accidental Back to the home page does not lose them. This is a per-tab convenience, not a store: it is cleared on submit and never read by the server.
- Hover preview is local state in `BriefFlow`: `preview: { colours?: ColoursAnswer; imagery?: ImageryAnswer } | null`, merged over the answers only for the sketch.

### Components (all under `app/start/_components/`)

| File                 | Role                                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `brief-flow.tsx`     | Client. URL, reducer, session persistence, submit, layout of the two panes.                                      |
| `question-pane.tsx`  | Client. Heading, helper, the step control, Back and Next, the trigger.                                           |
| `brief-sketch.tsx`   | Server-safe presentational. Draws the homepage schematic from `Answers` plus an optional preview. `aria-hidden`. |
| `sketch-chips.tsx`   | The "what is in" row. Also the visually hidden text summary of the sketch for screen readers.                    |
| `start-chrome.tsx`   | Logo, progress, Back to site.                                                                                    |
| `brief-done.tsx`     | Moved from the dialog, enlarged.                                                                                 |
| `steps/*`            | Moved from `app/_components/brief/steps`, unchanged apart from the heading text moving to `brief-questions.ts`.  |
| `brief-reducer.ts`   | Moved, plus `goto`.                                                                                              |
| `brief-questions.ts` | Headings become functions of the answers: `title(answers)`.                                                      |
| `actions.ts`         | Moved. Same seam.                                                                                                |

Pure helpers in `lib/brief/sketch.ts`, unit tested: `initialsFrom(company)`, `tabLabelFrom(company)` (lowercase, hyphenated), `tintsFrom(hex)` (four `color-mix()` strings for button, soft fill, text and glow). `color-mix` in OKLCH keeps the hue, which is the same rule the real colour engine will follow.

### Removed

`app/_components/brief/brief-dialog.tsx`, `brief-provider.tsx`, `start-button.tsx`, the `.brief-dialog` CSS, and ADR 0003's dialog decision (superseded by ADR 0004). Every call to action becomes `TrackedLink` to `/start`. `CTA.href` becomes `/start`. The header's "Show me my three designs" and the mobile menu's link go to the same place.

### Analytics

Page views per `?q` give the funnel for free. Keep `cta_click {location}` on the home page links, `brief_step {step}` on each Next, `brief_error`, `brief_complete`. Add `sketch_hover {kind}` only if a test needs it later.

### Accessibility

- The question heading is an `h1` with `tabIndex={-1}` and receives focus on every question change, so a screen reader hears the question first and Tab lands on the control.
- The sketch is `aria-hidden`; the chips row carries a visually hidden sentence: "Your brief so far: Ashgrove Physio, physiotherapy clinic in Sheffield, wordmark, clean style, Forest palette."
- Colour on the sketch is decorative. Nothing on the left pane changes colour with the brand, so the form itself always passes AA.
- Everything else as the dialog: `noValidate`, zod messages in live regions, 16px inputs, focus rings from the tokens.

### Performance

No images. The sketch is DOM and CSS. The page is static; the client bundle is the flow, the steps and the sketch. LCP is the heading.

## 8. Tests

- Unit: `lib/brief/sketch.test.ts` for every helper; reducer tests gain `goto` cases (cannot skip ahead, can go back, clamps).
- e2e, replacing `brief.spec.ts`: the hero link lands on `/start`; question 1 shows and the sketch is grey; typing a sentence puts it in the sketch; `?q=4` with empty answers redirects to `?q=1`; browser Back returns to the previous question with answers intact; refresh keeps answers; choosing a palette changes a sketch element's colour; the mobile strip is visible at 390px and the Next button fits the first screen after the strip; the full run reaches `?q=done`.

## 9. Open decisions

1. **Own photos in the sketch.** Resolved: photos are shown from object URLs, as thumbnails in the step and in both frames of the sketch.
2. **Session persistence.** Default on. Say if you would rather a refresh starts over.
3. **The `/start` page for a visitor without JavaScript** renders the chrome and a short message with a link back to the home page. Anything better needs the route-per-step form and the backend, which is phase B.

## 10. Build order

1. `lib/brief/sketch.ts` and tests.
2. `brief-sketch.tsx` and `sketch-chips.tsx` rendered from fixed answers, checked at desktop and mobile.
3. `app/start/page.tsx`, chrome, `brief-flow.tsx` with URL and session state, the moved steps.
4. Home page links, delete the dialog, ADR 0004.
5. e2e, screenshots at every question on both sizes, final check.
