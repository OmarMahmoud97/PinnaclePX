# /start, the lit draft: the journey plan

**For:** the senior web developer who builds it. **From:** the design lead, for the design team, 24 September 2026. **Branch at writing:** `feat/questionnaire-ink-and-phone-pass`. **Status:** Release 1 (S0, P2, P1, R1) built 24 September 2026, Release 2 (S0b, P3, P4, R2) built 24 and 25 September 2026 and Release 3 (S0c, P5 to P8, R3) built 25 September 2026, all on `feat/menu-pace-and-lan-origins`, uncommitted pending the owner's check, and recorded in ADR 0037, which accepts their decisions (Release 2's and Release 3's in its amendments of 25 September 2026). Release 3's `/start` byte lines have not moved: its measure passes both OD11 ceilings, so they wait on the owner (ADR 0037). A visual QA of Release 3 on 25 September 2026 led to a polish of the question side the same day, fitted to every screen, re-shot at 24 viewports and gated on a clean copy that afternoon (ADR 0037's third and fourth amendments); the polish adds to both `/start` lines, which still wait on the owner. A second QA of the send and done side the same afternoon (23 items) led to a polish of that side, re-shot at eleven viewports with the designs page's example at five and the colour question at 1024 by 768, and gated on a clean copy the same evening (ADR 0037's fifth amendment); the `/start` lines still wait on the owner. Every owner decision of section 13.1 took its recommendation. On 25 September 2026 the owner decided everything the build had left open (the byte ceilings, the colour target for the dark states, `/examples/hub`, the poster silhouettes, the phone's done order, three visual calls, five judgements by eye and two sentences), and a follow-up package carried the decisions that change the page: one poster layout per template, the 120rem cap, the ring before the page card below `lg`, the address without its scheme, the mood art in its look's own colours and the dark window's halo; it was gated on a clean copy the same night, and the `/start` lines moved once, by the rule, to 254,000 and 25,000 B (ADR 0037's sixth amendment). The owner committed all of it as e5436be on `feat/start-lit-draft` late on 25 September 2026, then asked, from a phone screenshot of the window cutting the draft off, that the phone show the desk's drawing whole and smaller: below `lg` the region now shows the browser frame zoomed to the screen's width, capped on short screens, and D8's window, its crops and offsets are gone (ADR 0037's seventh amendment, uncommitted). Nothing is submitted.

**Inputs.** The design director's brief, six specialist audits, five directions (A to E), four judges' scores, the director's spec ("Lit Draft"), four adversarial reviews (accessibility, developer feasibility, conversion, completeness) and ten mockup frames. They live in the session scratchpad under `start-audit/`; the owner can ask for any of them, and for the mockup PNGs named in section 4. Every blocker and major finding of the reviews is resolved below; section 14 says where.

**Companion records.** ADR 0035 and `docs/start-page-redesign-plan.md` (this morning's rebuild, which this plan amends), ADR 0034 (the home page this page must match), ADR 0004 (the questionnaire's flow), ADR 0014 (privacy), ADR 0015 (the email), ADR 0025 and 0036 (the walkthrough). New record: ADR 0037, written by the R packages (section 12).

**Conventions.** `q1` to `q5` mean the new order (section 3). Line numbers quoted from the audits were read on 24 September 2026: re-read them before editing. `imgstats.py` and `pool.mjs` are the scratchpad's `start-audit/` tools, which S0 copies into `scripts/`. Never submit a brief on any server: a submission runs the paid pipeline, writes Neon and emails the owner.

---

## 0. Summary for the owner

1. **What is wrong.** The home page has colour, light, a second voice (the serif italic) and weighty motion. /start switched all four off. It looks like a form in a grey room, and the picture beside the questions is a grey outline that barely changes.
2. **The idea.** The visitor steps out of the hero into the hero's own light. Beside the questions, their homepage sets itself as a real-looking draft, and every answer visibly finishes a part of it.
3. **What a visitor notices.** A bright page like the hero, with big headings and one italic word each. Their name, look and colour landing in the draft as they answer. The email asked last, not second.
4. **Then.** Ink blooms from the button when they send. The draft splits into three posters that fill with the real colours and headlines as the designs are built. When they are ready, the lights come back up.
5. **Also fixed.** Enter in the colour box no longer sends the brief. A refresh no longer loses the designs. Every email promise on screen is true. Pictures that are never sent are deleted.
6. **What it costs.** At most about 2 KB more script on /start after savings, a /start stylesheet of its own, one small database change, no new libraries, no WebGL. The home page's byte lines do not move.
7. **How it ships.** Three releases: fixes first, then the new order and words, then the new look. Releases one and two are measured, so we know the reorder helps.
8. **Decisions needed.** Thirteen, in section 13. Each has a recommendation and a fallback, so the build never waits.
9. **The five that matter most:** keep the new order (OD3); lift ADR 0035's fences on the italic and motion (OD1); the visitor's colour on the dark band (OD5); stage times from the pipeline on screen (OD8b); email partial builds too (OD9a).
10. **The mockups** (desk and phone, ten frames) show the look. Ask for them by name from section 4.

---

## 1. The brief

**The owner, 24 September 2026, verbatim:** "very boring and has no personality compared to the home page."

The page was rebuilt this morning (ADR 0035), so a quieter version of the same idea is not an answer. The owner's taste on record: "basic and boring" is the worst verdict for a creative agency; no hairlines; more colour; senior motion that is never overwhelming, weightier and slower (the menu's bloom at 0.9 s); Kraft as inspiration, not a copy; Mona Sans with Instrument Serif italic; every line moves the visitor to the form or the call; no pinned panel over copy on a phone; the bouncy liquid ink-pool spring was liked.

**The diagnosis** (measured 24 September on the 11:49 build, GET only; details in the brief and audits)

| #   | Root cause                       | Measured now                                                                                                                                                 | Target                                                                                                                                              |
| --- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | No colour, no light              | q1 desk 0.4% saturated pixels (home hero 17.2%); three flat colours cover 63%; the pool peaks at about 1.06:1 on the ink; 51% of the sketch pane is bare ink | q1 desk ≥ 8% (B's ramp mock alone: 8.9%); colour, send, done ≥ 15%; top three flat colours ≤ 40%                                                    |
| 2   | The sketch is a grey wireframe   | q3 changes 0.0% of the frame, q5 1.9%; Next from q1 to q2 changes 0.1% of the pane; phone sketch 101 by 213 px, text about 5.6 px                            | Repaint ≤ 300 ms; each question changes ≥ 10% of the frame; each Next ≥ 5% of the pane; nothing an answer changes shown only below 12 px on a phone |
| 3   | Answering earns nothing          | Entrance 200 ms over 8 px, no exit, at rest by 80 ms                                                                                                         | 600 to 900 ms with an exit, input never blocked, numbers in `CONFIG.start`                                                                          |
| 4   | No second voice                  | No italic (the font is already preloaded, 0 B to use); H1 a flat 60 px against the hero's 73.28 px                                                           | One italic and one home device on every screen                                                                                                      |
| 5   | Same half-empty scene five times | Fixed 46/54 split; 55% of q1's question pane bare wash                                                                                                       | 5-second sibling test (n ≥ 8) links /start to the home page; q1 bare wash under 20%                                                                 |
| 6   | Defensive copy                   | Reassurance five times; the reward never restated; "Next" the only call to action that names no outcome                                                      | Copy tests pass; per-step drop-off no worse than the Release 1 baseline                                                                             |
| 7   | The payoff gets darker           | Done 67.8% near-black; call first; designs as rows of code names                                                                                             | Done ≥ 15% saturated; something real before any click; refresh never blank; every email promise true                                                |
| +   | The hero lands on the email ask  | Email field (top 781) under the sticky ask (top 731) at 390 by 844                                                                                           | h1 in view at 390 by 844; no field under the ask on arrival; region ≤ 320 px                                                                        |

---

## 2. Decisions

### 2.1 Directions and scores

| Direction              | Brand   | Journey | Engineering | Owner fit | Mean    |
| ---------------------- | ------- | ------- | ----------- | --------- | ------- |
| **A Live Draft**       | **8.5** | **8.5** | **8.0**     | 6.6       | **7.9** |
| B Step Inside the Hero | 8.0     | 5.5     | 4.0         | **7.4**   | 6.2     |
| C Chapters             | 7.0     | 7.0     | 6.0         | 6.9       | 6.7     |
| D Thumb First          | 5.5     | 8.0     | 5.5         | 6.0       | 6.3     |
| E Yours First          | 7.5     | 7.5     | 7.0         | 7.2       | 7.3     |

**Spine: A.** Three judges ranked it first; it ships inside the CSS fence and is the only direction that carries one image from the first frame to the three designs. Its weak point was owner fit: a pale left pane, a 60 px heading, no spring. The brand judge (A plus B's world) and the owner judge (B's world plus A's draft) reached the same hybrid from opposite ends. That hybrid is this plan.

### 2.2 Grafts taken

| Graft                                                                                                                                                                                                                                             | From | Package            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ------------------ |
| The static 15-stop hero ramp under both panes; the white card from `sm`; the hero-scale H1; the dark band re-hued on a colour choice (OD5); email last; the logo polarity check; "Change it"; the bloom holding at 38%; mock and measure first    | B    | P5, P6, P3, P8     |
| Lamp hues walking the job colours; tab titles; the receipt's clause cut; the meter in `aria-describedby`; an always-true done lead; the send reassurance without "No sign-up"; Cal.com prefill (while the name is in memory)                      | C    | P6, P3, P8, P7     |
| The tap bloom; filled colour tiles; name and logo as a choice; the `enterKeyHint` chain; the reward under the ask; the done state machine; keys 1 to 5; the `linear()` spring token; 48 px Back; two moving groups at most; telemetry first       | D    | P3, P5, P1, P8, S0 |
| Real-output posters; "Usually done by" and the stage ring; stage lines with static stamps; ready rising to light; the intermission; the call after an open; `{slug, deadlineAt}` storage; the opacity-only form; the lazy guard; the orphan check | E    | P8, P1, P2, S0     |

### 2.3 Named but not taken

- **B:** pointer WebGL (a 2.2:1 dip under the H1 and a GPU loop, OD4); the difference blend (nothing behind it); per-step reach of 3% (will not read); whole-page re-hue on hover (a strobe); the skeleton as the q1 card (wrong question on refresh); the example as a placeholder.
- **C:** the italic reply in the H1 (wallpaper, typos at 73 px); "Got it." (a persona); the DOM-clone exit; the thread; the seam numeral (there is no seam at desk); specimen subsets.
- **D:** the ask outside the form (breaks `ringOf` and the `.start-ask` hooks); the overlay (close to the pinned panel the owner rejected); a bar in the ask (a fourth progress device); the outline numeral and bouncy checks (a toy register); Share while the hub is stale.
- **E:** the tab bar (the island has segments); curtain-call ink (over labels); the 450 ms poster step (a cap exception; posters fill during the wait instead); the phone ledger (kept as the fallback if the window fails 12 px).
- **A:** a pour on every hover (busy); the iframe finale (later, OD8d); a blue CTA before q4 (it anchors blue); four notes; the seam sheet and the 60 px H1.
- **Journey judge:** the ask outside the form (above).

### 2.4 The director's decisions

**D1. A, with B's world.** The draft is A's; the ramp, the white card and the hero H1 are B's; grafts as 2.2.

**D2. The order is sentence, name, look, colour, send (OD3).** Ids: `describe`, `brand` (business name and logo), `imagery` (look and photos), `colours`, `details` (email and your name). `brand` because `name` is the person's field. The hero's valid sentence still lands on `?q=2`, which is now the name.

**D3. The draft and the guard follow `reached`, never validity.** The draft stores `reached`, the highest question shown, 0-based like `firstInvalidIndex` (q2 is 1). Look and colour have valid defaults, so validity alone would skip them. A visitor resumes at `min(reached, firstInvalidIndex)`; a stored draft without `reached` takes `firstInvalidIndex`, as today. The draft's stages, receipts and the rule "nothing blue before q4" read `reached`.

**D4. The hero writes only `pinnaclepx.carried`.** It never reads the draft, so `/` never loads zod. /start merges the carried sentence into its draft on arrival through the validated `readDraft`.

**D5. The desk ground is the hero's ramp.** B's 15 stops, 118deg, across both panes, following `--split` (section 5.3). Text rules in section 5.4.

**D6. Type.** A `startHeading` recipe at `--text-hero`, capped at 4.58rem; one fixed italic payoff word per heading; the receipt under the H1, in DOM order and on screen, wherever it shows: at every question on desks 47.5rem tall or more; below `lg` and on shorter desks only the hero hand-off, expired and pending receipts.

**D7. Controls.** The white card from `sm` (below it the card is flat and fields are white wells on the wash); fields as wash wells with a soft inset edge; q2's mark, q3's look and q4's colour as radio groups; "My own colour" the fifth radio, revealing its field without moving focus.

**D8. The phone window is the phone frame.** _(Superseded on 25 September 2026 by ADR 0037's seventh amendment, at the owner's call: below `lg` the region shows the desk's browser frame whole, zoomed to the screen's width and capped on short screens, and the phone frame waits for 80rem.)_ Below `lg`, in a region under 36rem wide, the draft's phone frame is restyled as a 1:1 window, 358 by 212: one element, `data-frame="phone"`. From 36rem to `lg` the region shows a 300 px crop of the desk layout. Under 47.5rem tall either crop is 150 px; under 30rem tall the window and curve hide, so the h1 is in the first screen.

**D9. Motion is CSS with one small spring.** A scoped pace of 1.5 (900 ms); a 200 ms exit that keeps focus; the lead rises 2rem, controls 0.5rem; the phone curve springs under the pool's recorded exemption; no GSAP; nothing loops.

**D10. The lamp is the only ambient light.** It walks the job hues, brighter per answer, and sits at or under 0.2 alpha behind any text box.

**D11. The colour engine is CSS.** Relative colour mirrors `CONFIG.colour` with a unit test; a grey branch; retint only on a complete hex.

**D12. Faces load late and never block.** A plain `import()` (in `load-faces.ts`) of a /start-only module of four display faces, raced against a timeout.

**D13. The draft follows `schemeFor(style, polarity)` exactly.** The polarity reader is one pure module shared with the server.

**D14. Uploads never block Next.** The send waits for pending files. Pictures never sent are deleted after 24 hours (D30).

**D15. Names are bounded and isolated.** Business name ≤ 80, your name ≤ 60; `wrap-anywhere` and `<bdi>` wherever a name is shown.

**D16. The send is a held breath.** The fields go inert, the ask keeps focus as "Sending", the ink holds at 38% until the server answers, the client waits out the 3 s floor, and a 20 s timeout drains it. The outcomes are in section 4.8.

**D17. Done survives a refresh.** The slug rides in the URL (`&s=`) and a local key; entry rules in section 7.4; done renders from the poll alone, without personal words, when the tab has lost them.

**D18. Design links are real links.** An `<ol aria-label="Your designs">` outside any `aria-hidden` subtree: posters in the region at desk (a sibling of the draft), rows in `main` below `lg`. Exactly one list is displayed at a width.

**D19. Partial is ready with a note.** Every concept of a partial build can be opened, so none is silhouetted.

**D20. The wait tells the truth.** Stage times come from the server (OD8b) or no clock is shown; stamps are static; one live region speaks.

**D21. Ready rises to light in 600 ms.** The primary and the design links never fade and work from the first ready poll.

**D22. The poll is a GET route.** Shared by done and the hub, so specs intercept it by URL. The hub lands before done's Share.

**D23. Promises ship only when true.** The Vercel production build fails without `RESEND_FROM` (Release 1). "Your page link works now" and Share appear once the hub polls.

**D24. Telemetry by question id, never a slug.** Releases are staged so the reorder is measured (OD13).

**D25. Copy lives in three modules** registered in the copy corpus, which renders each template twice: with one-word samples ("Gibbs", "Sam") for the word limit, banned words and the "AI" count; then with shape cases (an 80-character, 14-word name, "Sam's", "GIBBS", a 64-character email) for possessives and no empty or `undefined` slot. Strings outside the modules (`SITE.reassuranceSend`, noscript, descriptors, Release 1's done copy) are registered by the package that writes them; the hub and studio bar read `done-copy.ts`.

**D26. /start styles live in /start sheets.** Route-imported sheets; `/`'s stylesheet line may not move; a /start component uses a utility only if the shared sheet already has it.

**D27. Bytes.** Gross +6 to +9 KB, offset by the lazy done chunk, the retired sketch set and (if hydration holds) lazy steps; ceilings per OD11; each line moves once, in a release's R package.

**D28. Tests first, with a recorded exception.** At the start of each release, S0 marks each existing assertion the release supersedes `test.fixme`, naming its replacement; build packages write replacements in new prefix-named specs; R deletes the marked assertions. This amends constraints §4.3 on the record.

**D29. The home walkthrough follows the order** (P4), with its own step list decoupled from `QUESTION_IDS`.

**D30. Privacy before the reorder.** /privacy gains lines on device storage, Cal.com and unsent pictures in Release 1 (P2); "How we use your pictures" ships beside the logo and photo tiles with the reorder (P3).

**D31. No `interactiveWidget`.** Enter key hints carry the flow while a keyboard is open.

**D32. Back is history.** In-app Back steps back through history; one press of Back from done leaves /start.

---

## 3. The journey, step by step

### 3.1 Entry points

| Entry                                                  | Lands on                                                                                                   | First thing that moves                                                                                                                                                                        | Event                             |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Hero, valid sentence (≥ 30 chars)                      | `?q=2` (name)                                                                                              | The sentence types into the draft's headline (16 ms a character, first 120 characters, jumps to the end on the first keystroke); tag 01 ticks; receipt "Your sentence is in" with "Change it" | `sentence_carried {valid: true}`  |
| Hero, short sentence                                   | `?q=1`, prefilled                                                                                          | Receipt "Nearly there…"; the meter shows how many characters to go; no error until Next                                                                                                       | `sentence_carried {valid: false}` |
| Header ask, closing CTA or direct link (bare `/start`) | A draft in this tab: where it left off (D3). Else a live submission (section 7.4): done. Else q1           | The blank draft in studio light                                                                                                                                                               | `brief_view`                      |
| Same-tab refresh                                       | The same question or done                                                                                  | Nothing replays                                                                                                                                                                               | none                              |
| Returning in a new tab                                 | Only under OD9d's alternative: `min(reached, firstInvalidIndex)` with "Welcome back" and a catch-up replay | Parts land in order, ≤ 2,600 ms, jumping to the end on input                                                                                                                                  | `draft_resumed`                   |
| `?q=done&s={slug}` (refresh, pasted link)              | Done for that slug, from the poll                                                                          | Posters rebuild from the latest poll                                                                                                                                                          | `done_view {state}`               |

### 3.2 Steps

1. **Hero.** A sentence in the white card; the arrow stores it as `pinnaclepx.carried` and opens `/start?q=2`.
2. **q1, sentence** (header ask, or a short sentence). Typing sets the draft's headline live; at 30 characters the meter fills and tag 01 closes.
3. **q2, name.** The first character lands in five places. "Use my name" is the default; "Use my logo" reveals "Choose a file"; light artwork turns the draft dark, as the designs will.
4. **q3, look.** A hover, focus or choice re-sets the face and mood art; photos replace the mood art.
5. **q4, colour, the peak.** Hover retints the draft and lamp; a choice pours through nine parts and (OD5) re-hues the dark band.
6. **q5, send.** Email, then your name; the first name signs the finished draft "_Draft for Sam_".
7. **The press.** Ink blooms from the ask and holds at 38% until the server answers; "_Off it goes._"
8. **Building** (about 1.5 to 3 minutes). Ink; the draft splits into three posters that fill with real colours, headlines and photos; the log names real stages; the intermission offers the call at the first headline or 60 s.
9. **Ready.** The lights come back up in 600 ms; an early finish is said; every design opens in a new tab. Partial, time-up, failed and exhausted are in section 4.9.
10. **A design.** The studio bar says "Back to your designs"; `design_open` fires.
11. **The call.** After an open it becomes the filled primary; Cal.com opens in a new tab.

### 3.3 Emotional curve

P is a plumber on a phone arriving from the hero; C is a café owner on a laptop using the header ask. Scores 1 to 10.

|        | Hero | q1  | Name    | Look | Colour  | Send | Press   | Wait < 1 min | 1 to 3 min | Ready   | Design |
| ------ | ---- | --- | ------- | ---- | ------- | ---- | ------- | ------------ | ---------- | ------- | ------ |
| Now    | 7/7  | -/6 | 3/5     | 5/6  | 6/6     | 6/6  | 7/7     | 6/6          | 4/4        | 5/5     | 9/9    |
| Target | 7/7  | -/7 | **8**/7 | 8/8  | **9/9** | 7/7  | **8/8** | 7/7          | 7/7        | **9/9** | 9/9    |

The curve is the design's intent, not a measure. What is measured (section 8.5): starts (q1 view or `sentence_carried`) to `brief_complete`, per-question drop-off by id, then `done_view` to `design_open` to `call_click`.

### 3.4 If ADR 0004's order stays (OD3 fallback)

Order `describe`, `details`, `logo`, `imagery`, `colours`.

- q2 is "Where should we _send_ them?" with Business name, Email, then Your name, so the first keystroke still lands the name.
- q3 is "Add your _logo_, or skip it." with the q2 tiles and strings of sections 4.6 and 4.7.
- q5 (colour) carries "Show me my three designs". Enter in the hex field shows its result and keeps focus; it never sends.
- The hero still lands on `?q=2`, with the receipt. P3 and P4 shrink to copy and controls; the walkthrough keeps its order.

---

## 4. Screen by screen

### 4.1 The mockup frames

Ten frames, each an HTML file and a PNG at its viewport, built from the real Mona Sans and Instrument Serif files (scratchpad `start-audit/mockups/`; the owner can ask for any of them). They were drawn in the old numbering, so the file names differ from `q1` to `q5` here. Every visible string in the frames yields to 4.6.

| File                | Frame                         | Corrections beyond the words                                                                                                                                                                                  |
| ------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `desk-q1.png`       | q1, desk, from the header ask | The receipt moves under the H1 and folds into the helper on a fresh arrival                                                                                                                                   |
| `desk-q4.png`       | q3 (look), Warm hovered       | The receipt moves under the H1                                                                                                                                                                                |
| `desk-q5.png`       | q4 (colour), mid-pour         | The receipt moves under the H1; tiles sit in a 540 px column; "My own colour" is a white tile with a swatch                                                                                                   |
| `desk-send.png`     | The press                     | None                                                                                                                                                                                                          |
| `desk-wait.png`     | Building                      | Lead becomes the always-true lead; "Usually done by"; no ticking clock; posters 196 by 260; the page link and Share leave the region for `main` (9.1) and stay, because the hub polls before this ships (D22) |
| `desk-ready.png`    | Ready                         | Posters 196 by 260; "Ahead of the five minutes." follows the lead                                                                                                                                             |
| `phone-q1.png`      | q1, 390 by 844                | None                                                                                                                                                                                                          |
| `phone-q4.png`      | q3 (look)                     | The photo line under the ask on arrival is accepted; checked at 390 by 664                                                                                                                                    |
| `phone-details.png` | q5 (send)                     | None                                                                                                                                                                                                          |
| `phone-wait.png`    | Building                      | Rows are the design list; posters in the region are decorative; "Usually done by"; no clock on the running line                                                                                               |

Poster headlines, photos and descriptors in the mockups are illustrative. In the build, headlines come only from `row.copy` through `contractFor(id).headlineOf`, photos only from the pipeline's chosen set, and descriptors from the approved map (OD12).

### 4.2 Composition by viewport

| Viewport                                                                        | Layout                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1920 by 1080, 2560 by 1440**                                                  | As 1440; H1 capped at 4.58rem (73.28 px); column 540 px; the draft's zoom grows up to 1.25 by container query; the ground re-sampled here                                                                                                                                                                                                               |
| **1440 by 900**                                                                 | `--split: 46%`; ramp per 5.3. Column 540 px from `xl`, 512 below. H1 top `clamp(6rem, 16vh, 9.5rem)` (144 px), receipt under it, card 32 px below. Draft authored at 640 px, the phone frame over its corner, caption under it, the whisper at the foot. Document exactly 900                                                                           |
| **1366 by 657** (any desk under 47.5rem tall)                                   | H1 top 5.5rem; receipts per D6; no whisper; one-line helper; draft zoom 0.78; the action row sticks at the card's foot                                                                                                                                                                                                                                  |
| **1024 by 768**                                                                 | H1 58 px; column 407 px; draft zoom 0.62                                                                                                                                                                                                                                                                                                                |
| **768 by 1024**                                                                 | Stacked; the region shows the desk's frame whole at its own size, 640 by 532, in 628 px plus the curve (seventh amendment); card `max-w-xl`; H1 48 px                                                                                                                                                                                                   |
| **Split views** (507, 678 wide); **700 by 500**                                 | Stacked. 507: the frame whole at the width's zoom, 475 wide, centred. 678: 614 wide. 700 by 500: the band's cap, 256 by 216; h1 in the first screen at every question (seventh amendment)                                                                                                                                                               |
| **390 by 844**                                                                  | Region 396 px: island clearance, the desk's frame whole at the width's zoom (358 by 300, seventh amendment), the curve. H1 36 px at y 475; the description's box 17 px above the ask on arrival (its well 33), the email field 23. Below `sm` the card is flat (controls and white wells on the wash). Sticky ask; from q2 a 48 px round Back beside it |
| **390 by 664** (under 47.5rem tall)                                             | Frame capped at 0.3 (192 by 163), region 239, H1 at y 306 (seventh amendment; 0.4 under 52rem); short hint; look tiles as 64 px rows. Gaps from the first control to the ask: q1 26 (its box 42), q2 73, q3 99, q4 99, q5 32 (≥ 24 required)                                                                                                            |
| **320 by 640**                                                                  | Frame capped at 0.3, 192 wide, the description's whole box in the first screen (seventh amendment); look tiles one column; `scrollWidth` 320; below 22.5rem wide Back sits under a full-width ask; done posters 84 by 115                                                                                                                               |
| **Any width under 30rem tall** (844 by 390, 932 by 430, 667 by 375, 320 by 256) | Frame and curve hidden; the region keeps only the island's clearance and the screen-reader sentence; the ask is static; h1 and first control in the first screen                                                                                                                                                                                        |

### 4.3 Desk height budget, 1440 by 900

Estimates from the measured title widths (Mona Sans 600 at 73.28 px: q1 646, q2 631, q3 349, q4 525, q5 942 px). P5 measures; the document must stay 900 at every question, with "My own colour" open included.

| Question | H1 lines   | Receipt                                         | Card holds                                                                        | Card foot (est.)                  | Room     |
| -------- | ---------- | ----------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------- | -------- |
| q1       | 2 (148 px) | none on a fresh arrival; 32 px on a short carry | helper (2 lines), label, hint, well (3 rows), meter, action row, reassurance      | 842                               | 58       |
| q2       | 2          | 32                                              | helper, label, field, two mark tiles, status line, action row, reward line        | 840                               | 60       |
| q3       | 1 (73 px)  | 32                                              | helper, four look tiles (2 by 2), photos button, caption, action row, reward line | 830                               | 70       |
| q4       | 1          | 32                                              | helper, four colour tiles, "My own colour", promise, action row, reward line      | 817 (about 967 with the hex open) | 83 (-67) |
| q5       | 2          | 32                                              | helper, email with hint, your name, action row, reassurance                       | 848                               | 52       |

**Cut order** if a measure passes 900: helper to one line; hint to its short form; receipt folded into the helper; desk H1 capped at 4.25rem. With the hex open, in order: the promise into the hex hint; the helper to one line; the picker beside the field on one row; the hint to its short form; P5 measures this state first.

### 4.4 Desk wireframes

```
q1 ARRIVAL  (desk-q1.png)   ground: white -> #c6dcee at the split -> ink
+------------------------------------------------------------------------------+
|           ( PX  Question 1 of 5  o----   Back to site )           .::#######|
| Start with a                (73px)                     .::#+----------------+|
| *sentence.*                                           .::##| o [your-busin] ||
| +--------------------------------------------+       .::###|[01 Sentence]...||
| | Five answers, three designs, about five    |      .::####|: *your        :||
| | minutes. Watch your sentence set in the... |     .::#####|:  sentence,*  :||
| | What does your business do?                |    .::######| [=ink pill=]   ||
| | For example: Physiotherapy clinic in ...   |   .::#######| [o-] [o-] +---+||
| | [ wash well, 20px, 3 rows                ] |  .::########+-----------| ph|||
| | ====------  12 more to go.                 | .::#########  A live dr +---+|
| | Enter to go on        ( Next: your name -> )|.::#########  lamp: cyan .45   |
| | Free. No sign-up. Nobody calls you unle... |::##########                   |
| +--------------------------------------------+###########                   |
+------------------------------------------------------------------------------+

q2 NAME, from the hero                  q5 SEND
| Put your *name* on it.               | | Where should we *send* them?       |
| Your sentence is in: "Plumber in     | | Forest it is. Your draft is        |
|   Leeds, 24-hour..."  Change it      | |   finished.                        |
| +----------------------------------+ | | +--------------------------------+ |
| | It goes at the top of all three..| | | | Gibbs Plumbing's three designs | |
| | Business name [ Gibbs Plumbing ] | | | | Email     [ sam@...          ] | |
| | (o) Use my name  ( ) Use my logo | | | | We email your links here, or...| |
| | <- Back    ( Next: pick a look ->)| | | | Your name [ Sam Gibbs        ] | |
| | Three designs, about five min... | | | | <- Back (Show me my three  -> )| |
| draft: [02 Name], lamp indigo .60    | | draft whole, *Draft for Sam*        |

q3 LOOK (desk-q4.png)                   q4 COLOUR (desk-q5.png)
| Pick a *look*.                       | | Choose a *colour*.                 |
| Gibbs Plumbing is on the page.       | | Warm and natural it is.            |
| [art Aa Warm  v] [art Aa Clean ]     | | [Forest v] [ Ink  ]  filled tiles  |
| [art Aa Bold   ] [art Aa Dark  ]     | | [ Clay   ] [ Plum ]                |
| [ + Add your own photos ]            | | [ swatch  My own colour ]          |
| draft: Fraunces, warm mood art       | | draft pours; lamp and band: Forest |

SEND (desk-send.png)
|####### ink disc from the ask, holds at 38% until the server answers ########|
|#######      *Off it goes.*            | draft sealed: one sheen, signed   ||
|#######( Sending )                     +----------------------------------+|

BUILDING (desk-wait.png)                READY (desk-ready.png)
| Sam, your designs are              | | Sam, your designs are *ready.*     |
| *on their way.*                    | | Built in 1:52. Each opens in a new |
| We are building three homepage     | | tab and stays live for 30 days.    |
| designs from your draft. Your page | | Ahead of the five minutes.         |
| link works now... We also email    | | ( Open design one -> )             |
| them to sam@... when they are done.| | Your page: .../preview/gibbs-...   |
| (ring) Usually done by 14:32.      | |   Share this page                  |
| v 0:06 Three layouts chosen for... | | Pick a time for after you've looked|
| v 0:07 Your Forest set in 14 ...   | | region: three lit posters 196x260, |
| o      Writing three headlines     | |  backlit, each a link; whisper     |
| region: posters 196x260, filling   | |                                    |
```

### 4.5 Phone wireframes

```
q1 ARRIVAL (phone-q1.png)          q2 NAME, from the hero
+--------------------------------+ +--------------------------------+
|( PX   Question 1 of 5      (x) | |( PX   Question 2 of 5      (x) |
|+------------------------------+| |+------------------------------+|
|| Live draft     your-business || || Live draft    gibbs-plumbing ||
|| *your sentence,* 22px        || || Gibbs Plumbing  22px         ||
|| [=ink pill=]  [ cyan art ]   || || Plumber in Leeds, 24-h...    ||
|+------------------------------+| |+------------------------------+|
| \________ curve, 308 ________/ | | \______ curve springs _______/ |
| Start with a *sentence.*  y387 | | Put your *name* on it.         |
| Five answers, three designs... | | Your sentence is in. Change it |
| What does your business do?    | | Business name [Gibbs Plumbing] |
| [ white well, 16px          ]  | | (o) Use my name ( ) Use my logo|
| [ ===---- 12 more to go.    ]  | | (<-) [ Next: pick a look -> ]  |
| [     Next: your name  ->    ] | | Three designs, about five mi...|
+--------------------------------+ +--------------------------------+

q3 LOOK (phone-q4.png)   q4 COLOUR              q5 SEND (phone-details.png)
| window crossfades   | | window: headline,  | | *Draft for Sam*        |
|  to the image       | |  CTA, art pour     | | Where should we *send* |
| Pick a *look*.      | | Choose a *colour*. | | them?                  |
| [Warm v] [Clean ]   | | [Forest v] [Ink ]  | | Email [ sam@...      ] |
| [Bold  ] [Dark  ]   | | [Clay   ] [Plum ]  | | Your name [ Sam G... ] |
| [+ Add your photos] | | [swatch My own ]   | | (<-)[Show me my three] |
| (<-)[Next: choose..]| | (<-)[Next: one...] | | Free. Nobody calls...  |

BUILDING (phone-wait.png)            READY
| [p1][p2][p3] 110x150, aria-hidden| | lit posters                   |
| Sam, your designs are            | | Sam, your designs are *ready.*|
| *on their way.*                  | | Built in 1:52. Each opens...  |
| (ring) Usually done by 14:32.    | | [thumb] Design one, Photo-led |
| v Three layouts chosen...        | | [thumb] Design two ...  Open  |
| o Writing three headlines        | | Pick a time for after you've..|
| [thumb] Design one  Being built  | | ( Open design one ) sticky    |
```

### 4.6 Copy, every string

Every string passes the copy rules: at most 20 words a sentence; no em dash, `%` or `!`; never "copy", "generated", "instantly", "guarantee" or "AI". **[PIN]** marks a string a test pins that changes; **[KEEP]** a pinned string that stays. Possessives use `possessive()`; names sit in `<bdi>`; receipts show per D6. On done and in the email every "three" follows the poll's `conceptCount` ("two", "one design"), as `brief-done.tsx` does today; before the send "three" stays, which LAUNCH_GATE guarantees in production. With no first name, a {First} string takes its restored form and the draft goes unsigned.

**Shared**

- Island: "Question n of 5" [KEEP]; "Brief received" at done [KEEP]; "Back to site" [KEEP].
- Region name "Your brief so far" [KEEP]; its screen-reader sentence keeps today's form, reading "Look" and "Colour" until reached; "Your brief so far is empty." [KEEP, exactly one].
- Under the ask: q1 `SITE.reassurance` "Free. No sign-up. Nobody calls you unless you book." [KEEP, q1 only]; q2 to q4 "Three designs, about five minutes after the last question."; q5 `SITE.reassuranceSend` "Free. Nobody calls you unless you book."
- Back: "Back" [KEEP]: from `lg` the text button with its arrow; below `lg` a 48 px round icon button with that name.
- Noscript, with `SITE.contactEmail` set (OD12): "The five questions need JavaScript. Turn it on, or email us at {contactEmail}." then "You can also book a 20-minute call." (link). Without an address: "The five questions need JavaScript. Turn it on to see your three designs."

**q1, sentence**

- Tab "1 of 5: Start with a sentence | PinnaclePX".
- H1 "Start with a _sentence_." [PIN, was "First, your business."]
- Receipts (under the H1): fresh arrival none; short carry "Nearly there. Add a little more about what you do."; expired "Those designs have expired, or the link is incomplete. Start a new brief here."; OD9d alternative only: "Welcome back. Your answers are where you left them." with "Start afresh".
- Helper "Five answers, three designs, about five minutes. Watch your sentence set in the draft as you type."
- Label "What does your business do?" [KEEP]. Hint kept; under 760 px tall "For example: Physio clinic in Sheffield."
- Meter: empty "Aim for a sentence or two."; under 30 "{n} more to go." (1: "1 more to go."); from 30 "That is plenty to start from."; last 40 "{n} characters left." (1: "1 character left.")
- Enter hint, fine pointers only: visible "Enter to go on"; in `aria-describedby` "Enter to go on, Shift and Enter for a new line."
- Errors "Tell us a little more, a sentence or two is plenty." [KEEP]; "Keep it under 400 characters."
- Ask "Next: your name" [PIN: `Next` exact becomes `/^Next/`].

**q2, name**

- Tab "2 of 5: Put your name on it | PinnaclePX". H1 "Put your _name_ on it."
- Receipt: desk (every arrival from 47.5rem tall, else the hand-off only): "Your sentence is in: “{clause}”" and the link "Change it". Phone, hero hand-off only, in place of the helper: "Your sentence is in." and "Change it". The clause is the first sentence, cut at a word boundary to 42 characters plus "…".
- Helper "It goes at the top of all three designs. Add your logo, or let your name stand in."
- Label "Business name" [PIN, was "Company"]. Error "Tell us your business name." [PIN].
- Group "Your mark": "Use my name" / "We set it as your mark"; "Use my logo" [PIN, was "Choose your logo"] / "PNG, JPEG, SVG or WebP, up to 6 MB". Then "Choose a file"; "Remove logo" [PIN, was "Remove this logo"]; "How we use your pictures".
- Status (polite): chosen "We check whether it is light or dark artwork and set your designs on a background that suits it."; "Uploading your logo."; "That logo did not upload. Try again, or remove it." with "Try again"; unreadable "We could not read that file, so your name stands in."
- Ask "Next: pick a look".

**q3, look**

- Tab "3 of 5: Pick a look | PinnaclePX". H1 "Pick a _look_." [PIN]
- Receipt "{Company} is on the page." or "{Company} and your logo are on the page."
- Helper "{Company's} type and photos follow it. Try each one."
- Style labels and details kept; "Aa" specimens are `aria-hidden`.
- "Add your own photos" / "Add more photos"; caption "Up to 6. Without any, we find photos to match your look and credit each photographer."; "How we use your pictures"; per photo "Uploading." / "Did not upload." with "Try again" and "Remove". The line "and your own photos, if you have them" goes.
- Ask "Next: choose a colour".

**q4, colour**

- Tab "4 of 5: Choose a colour | PinnaclePX". H1 "Choose a _colour_." [PIN] Receipt "{Style label} it is."
- Helper "It runs through the buttons and accents on all three designs."
- Tiles "Forest", "Ink", "Clay", "Plum"; "My own colour" / "Have a hex code?"; under OD12 "Your logo's colour" / "Found in your logo".
- Hex: label "Hex code" [PIN, was "Brand colour"], hint "Paste it, or pick one by eye.", placeholder "#", picker "Pick a colour", result "Colour set."; `SITE.colourPromise` [KEEP]; error "Use a hex code such as #2F6F4E."
- Ask "Next: one last step".

**q5, send**

- Tab "5 of 5: Where should we send them | PinnaclePX". H1 "Where should we _send_ them?" [PIN]
- Receipt "{Palette} it is. Your draft is finished." (custom: "Your colour is in. Your draft is finished."); after a reload during the send: "If you pressed send just now, it may be on its way. Sending again will not start a second build."
- Helper "{Company's} three designs are about five minutes away."
- "Email", hint "We email your links here, or they open on this page. Nothing else." and "How we use your details"; "Your name"; today's errors [KEEP].
- Ask "Show me my three designs" [KEEP]; busy "Sending"; waiting on files "Finishing your uploads". Screen reader, once: "Sending your answers." On the ink, `aria-hidden`: "_Off it goes._"

**The draft** (`aria-hidden`, `draft-copy.ts`)

- Notes "_your sentence, set large_", "_your name_", "_photos to match your look_", "_photos for a {style} look_" ({style}: the label in lower case), "_set in {Face} in your designs_", "_Draft for {First}_". Tags "01 Sentence", "02 Name", "03 Look", "04 Colour", "05 Send". Window bar "Live draft". Blank tab "your-business". Foot "© 2026".
- Caption (visible, on the ink): "A live draft. Each design gets its own layout and words." At done: "Five answers made these. Imagine what a 20-minute call does."

**Building** (`done-copy.ts`)

- Tab "Building your designs | PinnaclePX".
- H1 "{First}, your designs are _on their way._"; restored without a name: "Your designs are _on their way._"
- Lead "We are building three homepage designs from your draft." Once the hub polls: "Your page link works now and stays live for 30 days." Email line, OD9a yes: "We also email them to {email} when they are done." OD9a no: "They open on this page. We email them to {email} when all three finish in full." Restored: "the address you gave" in place of {email}.
- Time "Usually done by 14:32." At time-up: "Taking a little longer than usual. Keep this page open, or save its link."
- Page link "Your page:" with the link; "Share this page"; fallback, said by the status line: "Link ready to paste." The ring's centre, `aria-hidden`: "{n} of 5".
- Log, one line per stage, a stamp shown once the line completes: "Brief received for {Company}."; "Three layouts chosen for {Company}."; "Your {Palette} set in 14 tones, every text colour checked for easy reading." (custom: "Your colour set in 14 tones…"); "Your brief written from your sentence."; running "Writing three headlines", then "Three headlines written." or "Headlines set from your sentence, to finish on time."; running "Finding photos for a {style} look" or "Placing your photo" or "Placing your {n} photos", then "Photos placed, each photographer credited.", "Your photos placed." or "Some photo spaces left plain, to finish on time."; with stage times "All three built in 1:52." Restored lines drop {Company}.
- Designs: "Design one" to "Design three", each with its descriptor (OD12); "Being built"; link name "Open design one: {descriptor} (opens in a new tab)".
- Intermission: "Like where this is going? The 20-minute call is where a real site starts." Link "Pick a time for after you've looked".

**Ready and after**

- Tab "Ready: your three designs | PinnaclePX". H1 "{First}, your designs are _ready._" (restored: "Your designs are _ready._").
- Lead "Built in 1:52. Each opens in a new tab and stays live for 30 days." Without stage times the first sentence goes. Under 4:00: "Ahead of the five minutes."
- Ask "Open design one". After an open: "Seen one you like? Book the 20-minute call." with `SITE.callPromise`.
- Partial notes: "Headlines are set from your sentence, to finish on time." and/or "Some photo spaces are left plain, to finish on time."; OD9a no adds "Save this page's link, because this build sends no email."
- Failed and exhausted: today's copy [KEEP]. "Start a new brief"; at three sends in the window (`pinnaclepx.sends`): "You can send three briefs a day."
- Status line (screen reader, each once): "Three layouts chosen.", "Your colours are set.", "Headlines written.", "Photos placed.", "Link ready to paste." and the six existing lines [KEEP].
- Studio bar: "Back to your designs".

### 4.7 Controls and the answer moment

| Question | Controls                                                                                                                                                                                                                       | The answer moment in the draft                                                                                                      | Keys                                                                                                                                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| q1       | Textarea in a wash well, `rows=3`; meter in `aria-describedby`                                                                                                                                                                 | Each keystroke replaces the headline note within one frame; at 30 characters the meter fills and tag 01 closes                      | Fine pointer: Enter is Next when valid, else the error; Shift+Enter a new line; ignored while composing. Coarse pointer: Enter is a new line, no hint                                                             |
| q2       | Business name (`autocomplete="organization"`, `enterKeyHint="next"`); radio group "Your mark" (Use my name, Use my logo); choosing the logo reveals "Choose a file", the file input's label, which never opens on an arrow key | The first character lands in five places (tab slug, wordmark, headline, footer, phone); a logo drops into the mark at template size | Enter in the name field is Next; arrows move the mark choice                                                                                                                                                      |
| q3       | Radio group of four look tiles, 56 px mood art and "Aa" in the face once loaded; the photo picker                                                                                                                              | Hover, focus or choice re-sets the face and mood art; photos replace the mood art in order                                          | One Tab stop; arrows choose; fine pointers 1 to 4 while focus is in the group, never inside a text field; Enter is Next                                                                                           |
| q4       | Radio group: four filled palette tiles, "My own colour" fifth (a white tile with a swatch chip), optional logo colour sixth; the hex field appears after the group when "My own colour" is chosen, focus unmoved               | Hover or focus previews (300 ms); a choice pours through nine parts; arrival previews the checked tile                              | Arrows choose and pour; digits by tile order; hex: Enter checks and keeps focus, result in its `aria-describedby`, never sends; `enterKeyHint="done"`; a retint waits for a complete hex (6 digits, or 3 on blur) |
| q5       | Email (`inputmode="email"`, `autocomplete="email"`, `enterKeyHint="next"`), Your name (`autocomplete="name"`, `enterKeyHint="send"`)                                                                                           | The draft is selected whole; the first name signs it                                                                                | Enter in email moves focus to Your name; the send runs only from Your name or the ask                                                                                                                             |

### 4.8 Errors and send outcomes

Errors keep ADR 0035's pattern: red icon and red ring, never red text; focus to the first invalid control; the message scrolled clear of the ask; q4's error `role="alert"`. New: one brand-ink flash (450 ms) on the draft part the field feeds. No shake.

| Outcome                                                | Trigger                          | Screen                                                                                                                                                                                                                       | Focus                                        |
| ------------------------------------------------------ | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Sending                                                | Press                            | Bloom to 38% and hold; fields inert; the ask keeps focus with `aria-disabled` and reads "Sending"; the status says "Sending your answers." once; the client waits until `CONFIG.form.minMs` has passed since the page opened | Stays on the ask                             |
| Success                                                | Slug returned                    | `router.replace('/start?q=done&s={slug}')`; bloom completes; storage per 7.3                                                                                                                                                 | The done h1                                  |
| RETRY or timeout (`CONFIG.start.send.timeoutMs`, 20 s) | Server error, network, no answer | Ink drains 450 ms; inert removed; today's RETRY copy                                                                                                                                                                         | The ask, the error in its `aria-describedby` |
| TOO_MANY                                               | Limit                            | As RETRY with today's copy and a "Book a 20-minute call" link                                                                                                                                                                | The ask                                      |
| REJECTED                                               | Honeypot or floor                | Today's copy; the floor hold makes it unreachable for a person                                                                                                                                                               | The ask                                      |
| Validation                                             | A field fails                    | Drain; the field pattern above                                                                                                                                                                                               | First invalid control                        |

A `pinnaclepx.pending` marker is written before the request and cleared on any outcome, so a reload during the hold returns to q5 with the pending receipt.

### 4.9 Done states

| State             | Data                                      | Screen                                                                                                                   |
| ----------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Building          | Poll `building`                           | Ink; posters fill as stages land; log; ring (aria-hidden); "Usually done by"; intermission at the first headline or 60 s |
| Ready             | Poll `ready`                              | 600 ms flip to light (section 6); posters lit and linked from the first ready poll; early finish said                    |
| Partial           | Poll `partial`                            | As ready, with the partial note; every design opens                                                                      |
| Time-up           | Past the deadline, still building         | The delay line replaces the time                                                                                         |
| Failed, exhausted | Poll                                      | Today's copy; the lamp dims; the call leads                                                                              |
| Missing           | Poll `missing` (swept after 30 days)      | Keys cleared; `router.replace('/start?q=1')` with the expired receipt                                                    |
| Restored          | `?q=done&s=` without this tab's done data | The same states with the restored copy; Cal.com unprefilled                                                              |
| Chunk failed      | The done chunk will not load              | An error boundary shows the h1 and a link to `/preview/{slug}`, with "Try again"                                         |
| Loading           | The chunk is on its way                   | The done skeleton: h1 and the page link                                                                                  |

---

## 5. The visual system

### 5.1 Type

| Role                   | Setting                                                                                                                                                                                                                                                                                                        |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H1                     | A new `startHeading` recipe in `start-layout.ts` (the shared `displayHeading` is untouched): `--text-hero` capped at 4.58rem, weight 600, line height 1, -0.025em, `text-wrap: balance`, `wrap-anywhere`. 36, 48, 58, 70.5, 73.28 px at 390, 768, 1024, 1366, 1440 and above. Never blended, never transformed |
| Payoff                 | The existing `.emphasis em` (Instrument Serif italic, 1.06em) through `emphasised()` and an `emphasis` field per question                                                                                                                                                                                      |
| Receipt                | Under the H1: 14 px, 500, muted; the echoed answer 600 and upright                                                                                                                                                                                                                                             |
| Helper, labels, fields | `--text-lead` muted in the card; labels 14 px, 500; field text 20 px from `sm`, 16 px on phones                                                                                                                                                                                                                |
| Draft                  | Headline 34 px desk, 22 px phone (Mona Sans 750 until the look, then the display face); notes in the serif italic, 14 to 34 px, never under 12 px on phones and never larger than the H1's italic; tags Mona Sans 800 tabular, 11 or 12 px, white on `--brand-deeper`                                          |
| Whisper                | The business name in the display face, 800, `clamp(3rem, 100cqi / (var(--chars) * .56), 9rem)`, `--wordmark` at 1.44:1, `aria-hidden`; shown only when the rendered fit is at least 3rem; hidden above 24 graphemes or for a non-Latin script                                                                  |

### 5.2 The italic

**Upright is theirs, italic is ours.** Allowed: one fixed payoff word per /start H1 (_sentence_, _name_, _look_, _colour_, _send_); the done phrases (_on their way._, _ready._); _Off it goes._; at most two notes visible inside the `aria-hidden` draft. Never on their words, labels, buttons, helpers, the log or tiles. ADR 0034 D3 becomes: three phrases on the home page; on /start one display italic visible at a time, plus at most two notes in the draft.

### 5.3 Grounds

**The ramp** (B's measured mock). It is assembled on the ground layers in `start.css`, never on `:root`: a custom property resolves `var()` where it is declared, the trap ADR 0035 D4 records, so a `:root` ramp would never see `--ramp-shift`. Stops reuse `--surface-wash`, `--surface-wash-deep` and `--ink-foot` where the values match; `--ramp-shift` is registered in `app/globals.css` as a `<percentage>`, initial `0%`.

```css
/* app/_styles/start.css, from lg */
.start-ground-main,
.start-ground-region {
  --start-ramp: linear-gradient(
    118deg,
    #fff 0,
    #fefeff 20%,
    #f8fbfd 30%,
    #e2eef7 calc(38% + var(--ramp-shift)),
    #c6dcee calc(41% + var(--ramp-shift)),
    #9abfdd calc(44% + var(--ramp-shift)),
    #75a5cc calc(46.5% + var(--ramp-shift)),
    #4581ad calc(49% + var(--ramp-shift)),
    #175883 calc(52.5% + var(--ramp-shift)),
    #044368 calc(56% + var(--ramp-shift)),
    #003555 calc(58.5% + var(--ramp-shift)),
    #002943 calc(61% + var(--ramp-shift)),
    #021b2c calc(64% + var(--ramp-shift)),
    #02101d calc(67% + var(--ramp-shift)),
    #020a12 calc(70% + var(--ramp-shift))
  );
}
.start-flow {
  container-type: inline-size;
}
.start-ground-main {
  background: var(--start-ramp) left top / 100cqw 100%;
}
.start-ground-region {
  background: var(--start-ramp) right top / 100cqw 100%;
}
```

Both panes paint one gradient sized to the whole flow, so it runs continuously across the split. At 118deg the isolines lean 28deg: a stop drifts about 478 px across 900 px of height, so the dark band crosses the 46% split at about y 649 at 1440 by 900 (y 528 at 1024 by 768, y 512 at 1366 by 657). Only the white card sits there. The text rules are in 5.4.

**The band's re-hue (OD5).** From `#175883` darker, P5 writes each stop as `oklch(from <stop> l min(c, .12) var(--start-hue))` on both layers, so the ramp stays continuous, keeps its lightness, and the caption's contrast holds. `--start-hue` is a registered `<number>` that starts at the studio hue and moves on a q4 choice.

| Step     | Main (desk)                                                                                                                                        | Region                                     | Lamp (`--start-pool`)                        | Draft                                                  |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------- | ------------------------------------------------------ |
| q1       | Ramp, light stops                                                                                                                                  | Dark band, studio blue                     | `--job-found` cyan, 0.45                     | Neutral surfaces; studio cyan and indigo only as light |
| q2       | Same                                                                                                                                               | Same                                       | `--job-trusted` indigo, 0.60                 | + name, logo                                           |
| q3       | Same                                                                                                                                               | Same                                       | Cyan and indigo, 0.75                        | + face, mood art, scheme                               |
| q4       | Same                                                                                                                                               | The band takes their hue on a choice (OD5) | Their glow and glow-2, 0.90, following hover | + their colour                                         |
| q5       | Same                                                                                                                                               | Theirs                                     | Theirs, 1.0                                  | Finished, signed                                       |
| Building | Ink (dark scope on the ground layers)                                                                                                              | Ink                                        | Theirs, 0.75                                 | Posters                                                |
| Ready    | Ramp with `--ramp-shift: 8%`, so the `#c6dcee` isoline clears every text box in main (P8 tunes the shift until `brief-done-ground.spec.ts` passes) | Their band                                 | Per-poster backlight, glow 32%               | Posters lit                                            |

**Below `lg`:** main is the wash plus a text-free `--glow-corner`; the region is ink whose curve belly carries a short ramp (`#020a12` to `#06344f`, their hue from q4). `main` is never dark while questions are answered; the ground layer still computes `rgb(2,10,18)`. **Body colour** (Safari's rubber band): at `lg` white while asking, ink while building, the light stop at ready; below `lg` ink.

### 5.4 Text on the grounds

- Body text (on-surface, muted) may sit on `#c6dcee` or lighter; muted's weakest is 5.37:1.
- Brand-ink text, links and anything focusable sit only on `#e2eef7` or lighter, or inside the white card.
- No text outside the white card below the `#c6dcee` isoline.
- On the ink, every text box (caption, done h1, lead, time, log, intermission) sits where the lamp is at or under 0.2 alpha at its weakest frame, the swell's peak included. On phones the done lamp is spent at least 12 px above main's first line.
- Never text on `#9abfdd` over `#175883` (3.94:1), brand-ink on the deep wash (4.20:1), or inside a glow corner (4.75:1): checks sit in the opposite corner.
- The ground-sampling spec samples behind every text and link box outside the card, in each question and at ready, at 1024 by 768, 1280 by 800, 1366 by 657, 1440 by 900, 1920 by 1080 and 2560 by 1440. Ratios are in section 9.3.

### 5.5 Light, seam and imagery

The lamp is the only ambient light: no loop, one swell per commit (an alpha multiplier on `--start-pool`, never a scale), `--shadow-panel` on the frame, a text-free `glow-corner` on tile hover, no WebGL (OD4). Desk has no seam: the ramp's diagonal is the seam and follows `--split`. Phones keep the pooled curve. Imagery before the send is CSS mood art per style (warm: soft blobs and a horizon; minimal: one pale plane; bold: two hard fields and a circle; dark: one bloom; a 300 B grain), replaced by their uploads. Real photos appear only on posters after the send (`next/image`, lazy, credited, never the LCP element).

### 5.6 Island and progress

The island is unchanged, plus the home's 6 px dot (420 ms) sliding along its segments, added in `StartChrome`, not the shared `ProgressSteps`, without changing the pill's width. The draft's tags and selection box are the visible progress. The visible chips retire; `SketchChips` keeps the screen-reader sentence, so "Your brief so far is empty." matches once.

### 5.7 Controls

- **Card:** `rounded-3xl`, white, `p-7`, `shadow-card` from `sm`; never transformed.
- **Fields:** wash wells (white below `sm`, where the card is flat), `rounded-2xl` as the ring box, with a soft inset edge (`inset 0 1px 2px rgb(2 6 23 / .08)`), no hairline. The 1.18:1 edge judgement is re-signed by hand from shots of each well at rest, at 1440 and 390.
- **Tiles**, at least 64 px: mark tiles on the wash with ring and check; look tiles with 56 px mood art; palette tiles filled with white labels (5.99 to 10.36:1); "My own colour" and the logo colour are white tiles with a filled swatch chip (an inset ring above L 0.9).
- **Feedback:** `:active` scale 0.97, a tap bloom, a drawn check.
- **Ask:** a `--brand-deeper` pill with the hero's arrow, 48 px. **Back:** from `lg` the text button; below `lg` a 48 px round icon button beside the ask, under it below 22.5rem.
- **Focus:** a 2 px brand-ink outline. Keycaps show for fine pointers only. Spinners run only under `motion-safe`.

### 5.8 The live draft

**Files.** A /start fork in `app/start/_components/draft/`: `draft-page.tsx`, `draft-parts.tsx`, `draft-model.ts` (with a unit test), `draft-faces.ts`, `load-faces.ts`; rules in `app/_styles/start-draft.css`. It reuses `BrowserFrame` and `PhoneFrame`; `Bar` moves into `phone-frame.tsx`. `brief-sketch.tsx` is deleted (its only importer is /start); `PhoneSketch` and `sketch-parts` stay for the home. Headline, paragraph and wordmark are `STACK` cells with fixed clamps, so no swap moves layout. The skeleton draws the blank draft at identical geometry; frame chrome stays white. The draft's root is `aria-hidden`. At 1440 exactly two `blob:` marks exist (browser frame and phone frame); the q2 thumbnail is an `<img>`.

| Stage (by `reached`) | Renders                                                                                                                                                                                                                                                                                                  | Tag         |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| Blank                | Tab `your-business`; a studio glow point and hue bar as the wordmark; the note "_your sentence, set large_"; neutral paragraph bars; an ink CTA pill with a bar; studio-light mood art with "_photos to match your look_"; three cards; foot "© 2026"                                                    | 01 Sentence |
| q1                   | The sentence replaces the note next frame (34, 26 or 20 px by length, 3 lines, then an ellipsis); the wordmark gains "_your name_"                                                                                                                                                                       | 01          |
| q2                   | The business name in the tab slug, wordmark (name and glow point, no initials), headline, footer and phone; the sentence steps to the paragraph at 0.72; a logo takes the mark at template size (22 or 16 px tall, max width 40%); the scheme follows `schemeFor(style, polarity)`; the whisper fades up | 02 Name     |
| q3                   | The display face on headline, wordmark and whisper; mood art in the style's tones; dark uses the engine's L 0.16 hue-tinted surface; bold its own gradient; photos fill the hero, then the cards, in both frames                                                                                         | 03 Look     |
| q4                   | Hover retints at once; a choice pours through nine parts (tab dot, nav CTA, glow point, headline ink, eyebrow, CTA fill, mood art, card glyphs, footer)                                                                                                                                                  | 04 Colour   |
| q5                   | The last neutral bars take their tones; the whole frame selected; "_Draft for {First}_" bottom right (phone: the window's corner)                                                                                                                                                                        | 05 Send     |
| Sent                 | Selection fades, one sheen, the signature stays; at done it splits into the posters                                                                                                                                                                                                                      | none        |

**Truth.** One draft layout for every style. The CTA is a pill with a bar, never words. The headline shows their sentence, then their name, until a real headline arrives at done. No stock photos, no guessed domain. Nothing is blue before q4 except light. The caption keeps "not one of your designs" in positive words. The CSS colour approximates; done repaints with `row.tokens`. Labelled slots only: CTA label, paragraph beyond the sentence, found photos, card contents.

**Colour engine**, mirroring `CONFIG.colour` with a unit test that compares both:

```css
.draft {
  --d-surface: oklch(from var(--draft-hex) 0.985 min(calc(c * 0.1), 0.006) h);
  --d-ink: oklch(from var(--draft-hex) 0.2 min(calc(c * 0.1), 0.03) h);
  --d-muted: oklch(from var(--draft-hex) 0.45 min(calc(c * 0.1), 0.04) h);
  --d-brand: oklch(from var(--draft-hex) clamp(0.45, l, 0.85) c h); /* decoration */
  --d-fill: oklch(from var(--draft-hex) clamp(0.32, l, 0.5) c h); /* carries white */
  --d-glow: oklch(from var(--draft-hex) 0.8 max(c, 0.12) h);
  --d-glow-2: oklch(from var(--draft-hex) 0.72 max(c, 0.14) calc(h - 130));
}
/* [data-house] and [data-grey]: neutral surfaces, ink and fill; glows pinned to --glow and
   --glow-secondary, the lamp and band stay studio. [data-grey] is set in JS when OKLCH chroma
   is under CONFIG.colour.greyChroma, by the helper the unit test shares.
   [data-scheme='dark']: surface .16, ink .96, fill .7 to .85. */
```

The sweep (unit test, axe and `pool.mjs`): the four palettes, `#ffff00`, `#ff5a1f`, `#339906`, `#e91e63`, `#4e8a15`, `#000000`, `#ffffff`, `#808080`, `#fafaf0`, `oklch(.6 .12 250)`.

**Faces (OD7).** `load-faces.ts` runs a plain `import()` of `draft-faces.ts`, a /start-only module declaring the four display faces (Fraunces, Manrope, Bricolage Grotesque, Sora) through `next/font` with `preload: false` and the same options as `app/preview/_components/fonts.ts`, so the files are shared and /preview opens warm. Never from the skeleton, never `next/dynamic`. Idle at q2; the chosen face on arrival at q3; the others on first hover or focus; each through `document.fonts.load()` raced against `CONFIG.start.fonts.timeoutMs`. The draft swaps only once a load resolves. On a timeout, a failure or `saveData`, it keeps Mona Sans with "_set in {Face} in your designs_". Never Google `text=` subsetting.

**Logo polarity (D13).** `analyseLogo`'s pixel maths moves to a pure `lib/logo/polarity.ts`, used by the server and by a lazy client sampler, and tested on `analyse.test`'s fixtures. SVG is drawn through an `<img>` sized from its `viewBox`. An unreadable file re-selects "Use my name" with its status line. The q2 thumbnail sits on ink when the artwork is light.

---

## 6. Motion

### 6.1 Tokens and numbers

In `app/globals.css`, mirrored in `CONFIG.start` and kept equal by a unit test; never `tokens.css`, never the shared `--motion-*`:

- `--start-pace: 1.5`, scoped on `.start-flow`: times `--motion-reveal` (600 ms) gives 900 ms. Under reduce it is 0.5 (300 ms). The `--menu-pace` precedent.
- `--start-exit: 200ms`; `--draft-each: 450ms`, `--draft-step: 70ms`, `--draft-glow: 900ms` (from `walkthrough.beats.colour`).
- `--ease-spring`: a `linear()` string sampled from `CONFIG.start.spring` (about 9% overshoot), regenerated and compared by a unit test.
- Registered `--start-pool`, `--lamp-hue`, `--start-hue`, `--done-ground`, `--ramp-shift`, opted back in under reduce like `--start-pool` today.

```ts
start: {
  pace: 1.5, reducedPace: 0.5, exitMs: 200,
  rise: { leadRem: 2, controlsRem: 0.5, scaleFrom: 0.96, staggerMs: 80, items: 3 },
  spring: { frequencyHz: 1.6, dampingRatio: 0.6, durationMs: 900 },
  curve: { frequencyHz: 1, dampingRatio: 0.2, kick: 0.25, stretchCap: 0.3, sleepMs: 2_500 },
  lamp: { lit: [0.45, 0.6, 0.75, 0.9, 1], swell: 1.3, doneLit: 0.75, textMaxAlpha: 0.2 },
  typing: { capChars: 120 }, fonts: { timeoutMs: 3_000 },
  window: { cropPx: 212, shortCropPx: 150, crossfadeMs: 450, offsetsPx: [0, 0, 96, 48, 0] },
  send: { holdShare: 0.38, timeoutMs: 20_000 },
  wait: { intermissionMs: 60_000, earlyFinishMs: 240_000, hiddenPollMs: 15_000 },
  ready: { flipMs: 600, textFadeMs: 150, veilMs: 450 },
  done: { restoreHours: 24 },
  names: { companyMax: 80, personMax: 60, whisperMaxGraphemes: 24, slugMax: 28, clauseMax: 42 },
  uploads: { logoMaxPx: 1_024 },
}
```

`CONFIG.start` exists from Release 1 (P2: `names`, `done`, `wait.hiddenPollMs`); P3 adds `uploads`, P5 the rest.

### 6.2 The motion table

| Element                                    | Trigger                           | Properties                                                                                                                                                                                            | Duration, easing                                       | Delay, stagger         | How                                                                                                         | Reduced motion                                |
| ------------------------------------------ | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `<form>`                                   | Every mount                       | opacity                                                                                                                                                                                               | 300 ms, standard                                       | 0                      | CSS `question-in`, now opacity only                                                                         | Same (≥ 9 form entrances)                     |
| Lead: receipt, helper (`data-rise="lead"`) | Mount                             | translate 2rem to 0, scale 0.96, opacity; after Back from -1.5rem                                                                                                                                     | 900 ms, `--ease-enter`                                 | 80 ms, 3 items at most | CSS                                                                                                         | Opacity 300 ms                                |
| Controls (`data-rise="controls"`)          | Mount                             | translate 0.5rem, opacity                                                                                                                                                                             | 900 ms, enter                                          | in the same stagger    | CSS                                                                                                         | Opacity 300 ms                                |
| Exit                                       | A valid in-app Next or Back       | the rise groups' opacity and -1rem (Back +1rem); groups not holding focus go inert; the pressed control keeps focus with `aria-disabled`; the push follows                                            | 200 ms, `--ease-drain`                                 | 0                      | CSS `data-leaving`                                                                                          | Opacity 200 ms                                |
| Draft beat                                 | Commit, at 0 ms                   | tag scale 0.94 to 1 and opacity; the next box by `clip-path: inset()`                                                                                                                                 | 300 ms spring, then 450 ms enter                       | 150 ms                 | CSS                                                                                                         | Opacity                                       |
| Name lands                                 | First character                   | opacity and 0.375rem, five parts; the sentence crossfades to 0.72                                                                                                                                     | 450 ms each, spring                                    | 70 ms                  | CSS `--i`                                                                                                   | Fade together                                 |
| Logo drops                                 | Upload shown                      | scale 0.94 to 1, opacity; one glow pulse (alpha)                                                                                                                                                      | 500 ms; 700 ms                                         | 0                      | CSS                                                                                                         | Opacity                                       |
| Face re-set; mood art                      | Face loaded; style change         | per-word opacity and 6 px (≤ 12 words); layer opacity                                                                                                                                                 | 450 ms enter; 450 or 600 ms                            | 40 ms; 0               | CSS `Words`                                                                                                 | Fades                                         |
| Colour preview                             | Hover, focus                      | draft tokens, lamp hue                                                                                                                                                                                | 300 ms, standard                                       | 0                      | CSS                                                                                                         | Same                                          |
| Colour pour                                | A choice (click, tap, arrow, key) | colour, background, border on nine parts                                                                                                                                                              | 450 ms each                                            | 70 ms                  | CSS `transition-delay`                                                                                      | Together                                      |
| Lamp; ramp band                            | Commit; a q4 choice (OD5)         | `--lamp-hue`, lit; swell as an alpha multiplier 1 to 1.3 to 1; `--start-hue`                                                                                                                          | 900 ms; swell 300 + 600 ms                             | 0                      | CSS `@property`                                                                                             | Kept (colour)                                 |
| Island dot                                 | Question change                   | `--dot-x`                                                                                                                                                                                             | 420 ms, enter                                          | 0                      | CSS                                                                                                         | Jump                                          |
| Phone curve                                | A valid Next or Back              | `scaleY` kick 0.25, spring 1 Hz, damping 0.2, capped at 0.3                                                                                                                                           | rings about 2 s, sleeps at 2,500 ms                    | 0                      | rAF, `lib/motion/start-curve.ts`, about 40 lines; checks `matchMedia` on every kick and listens for changes | Never kicks                                   |
| Meter                                      | Typing                            | fill `scaleX`; tick drawn                                                                                                                                                                             | 300 ms, enter                                          | 0                      | CSS                                                                                                         | Jumps (the allowlist drops the transform)     |
| Tile press, bloom, check                   | `:active`, a choice               | scale 0.97; `clip-path: circle()` from `--tap-x/y`; `stroke-dashoffset`                                                                                                                               | 120 ms; 450 + 450 ms; 300 ms                           | 0                      | CSS, a pointerdown sets `--tap-x/y`                                                                         | A colour and opacity flash; the check appears |
| Failed Next                                | Validation                        | the fed draft part to brand-ink and back                                                                                                                                                              | 450 ms                                                 | 0                      | CSS                                                                                                         | Same                                          |
| Typing                                     | Hero arrival                      | characters                                                                                                                                                                                            | 16 ms each, ≤ 120, jumps to the end on the first input | 200 ms lead            | `lib/brief/typing.ts`                                                                                       | One fade, no timer                            |
| Catch-up (OD9d alternative only)           | Restore from localStorage         | parts in order                                                                                                                                                                                        | ≤ 2,600 ms, jumps on the first input                   | 0                      | Same                                                                                                        | Instant                                       |
| Send bloom                                 | The final ask                     | `clip-path: circle(1.25rem → 142% at var(--press-at))`: 38% of the path, a hold until the answer, then the rest                                                                                       | 900 ms in all; drain 450 ms                            | 0                      | CSS, the menu's rule, outside the keyed pane                                                                | Opacity 300 ms, same hold                     |
| "_Off it goes._"; seal sheen               | Press                             | opacity; `background-position` once                                                                                                                                                                   | 450 ms; 900 ms                                         | 300 ms                 | CSS                                                                                                         | Opacity; none                                 |
| Split to posters                           | Done mounts                       | translate ≤ 2.5rem, rotate ±1deg, opacity                                                                                                                                                             | 900 ms, enter                                          | 80 ms                  | CSS                                                                                                         | Opacity                                       |
| Log line; stage arc                        | Stage change                      | opacity and 0.75rem; `stroke-dashoffset`                                                                                                                                                              | 450 ms; 900 ms                                         | 0                      | CSS                                                                                                         | Opacity; instant                              |
| Poster data                                | Tokens, headline, photo land      | colours in pour order; headline typing; photo opacity                                                                                                                                                 | 450 ms each; 16 ms a character; 900 ms                 | 70 ms                  | CSS and typing                                                                                              | Together; whole; opacity                      |
| Ready flip                                 | All ready                         | the lead and time line fade out and in; the h1 never changes opacity: its colour follows `--done-ground` and its payoff phrase swaps in place; posters' veils lift (opacity, scale 0.96); check drawn | 150 + 300 + 150 ms; 450 ms; 900 ms                     | 80 ms on veils         | CSS                                                                                                         | Same sequence by opacity; check appears       |
| Call promotion                             | Return after an open              | background; label crossfade                                                                                                                                                                           | 300 ms                                                 | 0                      | CSS                                                                                                         | Same                                          |

### 6.3 Caps

Every tween ≤ 900 ms, stagger ≤ 80 ms, translate ≤ 2.5rem (2rem plus a 9% overshoot is 2.18rem), scale from 0.94 or more. **No cap moves.** The one exception is on the record already: the phone curve rings under the pool's exemption (`lib/config.ts:333-336`), bounded by `stretchCap`, and sleeps. The h1, `.over-ink` wrappers, the card surface and any sticky row's ancestor move by opacity only, which fixes today's transform on the h1's ancestor (`question-pane.tsx:161`). Width, padding, filter and box-shadow never animate. Nothing loops; spinners run only under `motion-safe`. No GSAP. At most two groups translate per Next: on desk the draft beat and the rise; on a phone the curve and the rise.

---

## 7. Interaction and edge cases

### 7.1 Keyboard and previews

- **Tab order** while answering: skip link, island exit, h1 (focused on mount, `tabIndex -1`), the receipt's link, controls, Back, ask. The region holds nothing focusable. Per-question keys are in 4.7.
- **Exit focus.** The pressed control keeps focus through the 200 ms exit; only the rise groups that do not hold focus go inert; the new h1 takes focus after the push. A second press in the exit does nothing.
- **Previews.** Hover and focus preview look and colour (ADR 0035 D19, extended); leaving the group restores the choice; on touch a tap chooses; a face previews only once loaded.

### 7.2 Uploads

- The logo and photos show from their object URLs at once. Next is never disabled by an upload; each file shows its own progress, and a failure offers "Try again" and "Remove".
- The lazy sampler chunk (about 1 KB, `logo-sampler.ts`) reads polarity and downscales rasters before upload: the logo to 1,024 px, photos to `CONFIG.images.maxWidth`. SVG is uploaded as is.
- At q5 the send waits for pending files ("Finishing your uploads").
- **Orphans.** A nightly Inngest function lists the upload prefixes with `@vercel/blob` `list()` and deletes paths older than 24 hours that no submission's blob references name. /privacy says so; "How we use your pictures" sits beside the logo and photo tiles (D30).

### 7.3 Storage

| Key                    | Store                        | Holds                                                                        | Expires                    | Cleared by                                |
| ---------------------- | ---------------------------- | ---------------------------------------------------------------------------- | -------------------------- | ----------------------------------------- |
| `pinnaclepx.brief`     | session                      | answers, `reached`, upload references                                        | with the tab               | a successful send                         |
| `pinnaclepx.carried`   | session                      | the hero's sentence                                                          | read once on arrival       | the read                                  |
| `pinnaclepx.pending`   | session                      | the time the send started                                                    | 2 minutes                  | any outcome                               |
| `pinnaclepx.done`      | session                      | `{slug, first, company, email, paletteLabel, styleLabel}`                    | with the tab               | "Start a new brief"                       |
| `pinnaclepx.submitted` | local                        | `{v, slug, deadlineAt, conceptCount, savedAt, expiresAt}`; nothing personal  | `deadlineAt` plus 24 hours | `missing`, expiry, "Start a new brief"    |
| `pinnaclepx.sends`     | local                        | `{v, window, count}`; `window` is the server's `windowKey` for 86,400 s      | when the window passes     | never by "Start a new brief" or `missing` |
| `pinnaclepx.draft`     | local, OD9d alternative only | sentence, look, colour; never the business name, your name, email or uploads | 7 days                     | a send, "Start afresh"                    |

Every read is in `try`/`catch` and drops a stale or unreadable value. The slug never goes to analytics.

### 7.4 Entry rules

1. The hero hand-off merges the carried sentence into this tab's draft (D4), keeping the other answers, and never shows a stored done state: at `?q=2` with `reached` at least 1 (q2), or at `?q=1` when the sentence is short.
2. `?q=n` shows the lowest of question n, `reached` and the first invalid question.
3. `?q=done&s={slug}` shows done for that slug, with this tab's done data if the slug matches, else the restored copy.
4. Bare `/start` (the header ask, "Show me my three designs"): a draft in this tab resumes; else a live `submitted` key shows its done state, with "Start a new brief" first among the secondary actions; else q1.
5. A `missing` poll clears both done keys and lands on q1 with the expired receipt.

### 7.5 Back, forward, restore

- In-app Back calls `router.back()` when the previous history entry is the question before (the index kept in `history.state`), else `router.replace`. It plays the exit and enters from above; the browser's own Back and Forward skip the exit.
- The entry depth at /start is kept in `history.state`; from done, one press of Back leaves /start (`history.go(-depth)`). Tested for Back and Forward.
- "Change it" opens `?q=1` with a return target; its Next returns to q2.
- Under OD9d's alternative, arrival merges both stores and lands on `min(reached, firstInvalidIndex)` with "Welcome back" and the catch-up. A same-tab refresh never replays.

### 7.6 Leaving during the wait

Polling continues while the tab is hidden (every 15 s); the title flips at ready; a refresh restores done; `wait_leave` fires once on hide while building.

### 7.7 Long names

| Rule                                                                                                                                                                                                                                                                                     | Where                                                                        |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Business name ≤ 80 characters, your name ≤ 60                                                                                                                                                                                                                                            | Schema, so `submitBrief` too (P2); input `maxLength` (P3)                    |
| Tab slug: NFKD, marks stripped, `\p{L}\p{N}` kept, ellipsis at 28                                                                                                                                                                                                                        | `lib/brief/sketch.ts`                                                        |
| Wordmark and headline: two lines, then an ellipsis                                                                                                                                                                                                                                       | `draft-parts.tsx`                                                            |
| Whisper hidden above 24 graphemes (`Intl.Segmenter`), for a non-Latin script, or when its fit is under 3rem                                                                                                                                                                              | `draft-page.tsx`; a 24-grapheme name at 1024 by 768 in `brief-draft.spec.ts` |
| `<bdi>` around every interpolated name; `wrap-anywhere` on every element that shows visitor text, `min-w-0` on its flex parents                                                                                                                                                          | Receipts, helpers, log, done                                                 |
| `possessive()` leaves a name ending in 's or ’s as it is ("Sam's type"), adds only an apostrophe after any other final s or S ("Gibbs'", "GIBBS'"), else adds 's; tested with "Sam's", "Sam’s", "GIBBS" and "Gibbs Plumbing". `firstNameFrom` skips titles (Dr, Mr, Mrs, Ms, Miss, Prof) | `lib/brief/names.ts`                                                         |
| Proof: at 320 by 640 with a 60-character unbroken business name and a 64-character email, at q2 to q5, building and ready, every visible text element in `main` has `scrollWidth ≤ clientWidth + 1`                                                                                      | `mobile-names.spec.ts`                                                       |

### 7.8 White logos, slow networks, no JavaScript

- **White logos:** light artwork flips the draft per `schemeFor`; the thumbnail sits on ink; the nav mark is at most 40% of the bar's width.
- **Slow networks:** faces time out to Mona Sans with a note; the send times out at 20 s; uploads show progress; the done chunk is requested when q5 mounts, shows a loading view with the page link, and a failed chunk falls back through an error boundary (4.9).
- **No JavaScript:** one `#main`, the skip link, the region with its browser frame, the noscript sentence (4.6), one hidden `[data-skeleton-bars]`.
- **Keyboards on phones:** no `interactiveWidget` (D31); on iOS and Android the return key follows the `enterKeyHint` chain; the ask stays in flow under the keyboard. Checked on the LAN iPhone.
- **Titles and the URL:** `document.title` is set in an effect in the flow; `s` is read only by `useSearchParams` inside the flow, so /start stays prerendered (the budget script checks `start.html` exists).
- **Refresh at done:** an inline script in the skeleton sets `data-state="done"` on the stage from `location.search` before paint, so a refresh never flashes q1. If the project's content security policy forbids it, the flash is accepted and recorded.

---

## 8. Outside /start

### 8.1 The hero and the home page

- **Hero (`hero-prompt.tsx`, P1):** writes only `pinnaclepx.carried` and goes to `?q=2`; fires `sentence_carried`. A `/` guard in the budget script bars zod.
- **Home copy (`section-copy.ts`, P2):** "your initials stand in" becomes "your name stands in"; "ours stand in if you don't" becomes "we find photos to match if you don't". `lib/brief/sketch.ts` draws the name and a glow point, never initials.
- **Walkthrough (P4):** its own `WALKTHROUGH_STEPS`, decoupled from `QUESTION_IDS`, re-staged to the new order: 1 "Start with a sentence."; 2 "Put your name on it." (the name, then the logo beat); 3 "Pick a look."; 4 "Choose a colour."; 5 "Where should we send them?" (the build beat). Bodies: 1 kept; 2 "Your business name becomes the headline and the wordmark. Add a logo, or your name stands in."; 3 "Warm, clean, bold or dark. Your photos go in if you have them; we find photos to match if you don't."; 4 "Your colour runs through the buttons and accents, and the sketch is finished."; 5 "Your email is only where the link goes. No phone number, no budget question. About five minutes later, three designs are on screen, yours to judge." `SketchChips` takes an explicit label map. ADR 0025 and 0036 are amended.

### 8.2 The status poll (P7, OD8b)

- **Migration** (`db/`): nullable `stage_select_at`, `stage_tokens_at`, `stage_brief_at`, `stage_copy_at`, `stage_imagery_at` and `settled_at`, written by `markStage` and the settle path in `lib/db/submissions.ts`.
- **Route:** `GET app/api/status/[slug]/route.ts`, JSON, `Cache-Control: no-store`, shared by done and the hub. Specs intercept it by URL. `getSubmissionStatus` and `app/preview/actions.ts` go in P1, when `use-submission-status.ts` polls the GET route; `concept-pending.tsx` follows through the hook.
- **Body** (about 1.5 KB): status, `deadlineAt`, `conceptCount`; `stages` as `{state, atS}` with `fallback` as a state and `atS` in seconds from creation; `palette` (label and hex from `row.tokens`); per concept `descriptorKey`, `href` once openable, `headline` once the copy stage is done, `photo {src, credit}` once imagery is done. Only the jsonb paths needed are selected.
- **Privacy:** no more than the public preview shows, to whoever holds the same link, only earlier.
- **Without OD8b:** no times anywhere ("Built in" and the early finish go); the log shows received, layouts and ready; posters stay silhouettes until ready.

### 8.3 Email (P2, P7)

Descriptors, never code names; UTM `utm_source=email&utm_medium=preview-link&utm_campaign=designs`; a verified sender. The Vercel production build fails when `RESEND_FROM` is unset: `lib/env.ts` refines it on `VERCEL_ENV`, as `ALLOW_REPEAT_TEMPLATES` does, so local builds, the 11.6 gate and previews still build.

| Status             | Subject                                                                                                                 | Body                                                                                                                                                                                                                                                                                                              |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ready              | "{First}, your homepage designs are ready" (no first name: "Your homepage designs are ready"; one concept: "design is") | "Hello {First}," (no first name: "Hello,") / "Three homepage designs for {Company}, built from your five answers." (the count from `conceptCount`) / "Open them here: {link}" / "Each stays live for 30 days." / the rate card (`PRICE`) / "Like one? Book a 20-minute call: {booking link}" / `SITE.callPromise` |
| Partial (OD9a yes) | As ready                                                                                                                | As ready, plus "A few parts were set simply, to finish on time."                                                                                                                                                                                                                                                  |
| Failed, exhausted  | none to the visitor                                                                                                     | The owner is notified as today                                                                                                                                                                                                                                                                                    |

### 8.4 The hub and the studio bar (P7)

- **Hub (`app/preview/[slug]/page.tsx`):** ink, no hairlines, the three posters as links, polling the GET route (3 s visible, 15 s hidden), "Share this page". Building: posters fill, "Usually done by". Ready and partial: posters linked. Failed and exhausted: today's copy and the call. Missing: 404 as today.
- **Studio bar:** no hairline; "Back to your designs" (to `/start?q=done&s={slug}`); the plain booking link, since a new tab has no name in memory; `design_open` and `call_click` fire.
- Done's Cal.com link is prefilled only while the name and email are in this tab's memory. Cal.com is added to /privacy's processors before it ships.

### 8.5 Analytics (S0 adds the names; each package wires its own)

At most two properties an event; no slug; `beforeSend` strips `s` from URLs (`app/layout.tsx`). Question ids replace numeric steps; the deploy date of each release is recorded.

| Event                       | Trigger                | Properties                                      | Once per               |
| --------------------------- | ---------------------- | ----------------------------------------------- | ---------------------- |
| `brief_view` (new)          | A question shows       | `question`, `entry` (hero, ask, direct, resume) | question per page load |
| `brief_step`                | A valid Next           | `question` (was `step`)                         | press                  |
| `brief_error`               | A failed Next          | `question`                                      | press                  |
| `sentence_carried` (new)    | Hero hand-off lands    | `valid`                                         | arrival                |
| `draft_resumed` (new)       | A restore from storage | `question`                                      | arrival                |
| `upload_failed` (new)       | An upload fails        | `kind` (logo, photo)                            | file                   |
| `send_outcome` (new)        | A send fails           | `outcome`                                       | press                  |
| `brief_complete`            | A send succeeds        | today's properties                              | send                   |
| `done_view` (new)           | Done mounts            | `state`                                         | slug per tab           |
| `wait_leave` (new)          | Hidden while building  | `stage`                                         | page                   |
| `design_open` (new)         | A design link          | `template`, `from` (done, hub, email)           | click                  |
| `call_click`, `share_click` | As today               | `location`, plus `template` where known         | click                  |
| `new_brief` (new)           | "Start a new brief"    | none                                            | click                  |

### 8.6 The bug list

| Bug                                                                  | File                                                                        | Package                 |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------- |
| Enter in the hex field sends the paid brief                          | `steps/colours-step.tsx:84`                                                 | P1                      |
| Noscript line names a null email                                     | `lib/site.ts:30`; the skeleton                                              | P2, P1                  |
| Hero overwrites a returning draft                                    | `hero-prompt.tsx:47`                                                        | P1                      |
| Returning visitors land on q1; defaults skip look and colour         | `brief-flow.tsx:50-54, 101`; `brief-reducer.ts:100-105`                     | P1                      |
| Refresh in the wait gives a blank q1; Back from done shows a live q5 | `brief-flow.tsx:83-85, 99-101, 121-125, 156`                                | P1                      |
| Polling stops when hidden; static title                              | `use-submission-status.ts:25-28`; `app/start/page.tsx:6`                    | P1                      |
| Email promised for partial builds and time-up; `RESEND_FROM` missing | `brief-done.tsx`; `send-preview-link.ts:43-46`; `lib/email/send.ts:15`      | P2                      |
| The call leaves done in the same tab                                 | `brief-done.tsx:177-187`                                                    | P2                      |
| Code names ("Harbor"); untracked opens                               | `design-slots.tsx:27-35, 52`                                                | P2                      |
| Unsent uploads never deleted                                         | `retention-sweep.ts:22-29`                                                  | P2                      |
| Names unbounded; possessive misses a capital S                       | `lib/brief/schema.ts:20-21`; `names.ts`                                     | P2                      |
| Chips show defaults and tick late                                    | `sketch-chips.tsx:20-36`; `brief-flow.tsx:169-170`                          | P6 (chips retire)       |
| Bold slate, dark vanishing, orange red                               | `sketch-parts.tsx:17`; `sketch-model.ts:20-27`; `lib/brief/sketch.ts:57-58` | P6 (the draft's engine) |
| Initials no template draws; three names for the fallback             | `lib/brief/sketch.ts:11`; `section-copy.ts:34-55`                           | P2                      |
| 30-character minimum invisible                                       | `config.ts:116`; the "0 / 400" counter                                      | P3                      |
| "An hour" against the 20-minute call                                 | `sketch-pane.tsx:58-62`                                                     | P2                      |
| Transform on the h1's and the sticky ask's ancestor                  | `question-pane.tsx:161`; `globals.css:500-505`                              | P5                      |
| Invisible choice hover (1.05:1); "your own photos" three times       | `choice-card.tsx`; `brief-questions.ts:37`; `imagery-step.tsx:87`           | P3                      |
| Spinner loops under reduce                                           | `question-pane.tsx:250-251`                                                 | P3                      |
| Hub hairlines, no polling; no UTM                                    | `app/preview/[slug]/page.tsx:42, 76-101`; `preview-link.ts`                 | P7, P2                  |
| ADR 0035 D23's `lib/motion` claim                                    | `use-focus-on-mount.ts:4`                                                   | R1                      |

---

## 9. Accessibility and performance

### 9.1 Focus

- **Asking:** as 7.1. The receipt sits under the h1 in the DOM and on screen, so the tab order matches the visual order.
- **Sending:** the fields and Back are inert; the ask keeps focus with `aria-disabled`. On failure, inert lifts, the ink drains, then focus goes to the first invalid control or the ask, with the error in its `aria-describedby`. A `role="alert"` node is never focused. The same under reduce.
- **Done:** the h1 takes focus on mount. DOM order: h1, lead, the primary (at ready), the time and log (not focusable), the page link and Share, the design rows (below `lg`), the intermission and call; the time and log come before the page link so the ring is in the first screen of a 664 px phone (the owner's decision of 25 September 2026, ADR 0037's sixth amendment), which moves nothing in the tab order. At `lg` the design posters sit in the region, after `main` in the DOM (ADR 0035 D5), so they follow the call, and the page link and Share follow the posters, since the card is drawn in the region there (ADR 0037's fifth amendment).
- **Design links:** one `<ol aria-label="Your designs">` is displayed at a width: rows in `main` below `lg`, posters in the region from `lg`, as a sibling of the draft's `aria-hidden` root. The other is `display: none`. Poster art inside each link is `aria-hidden`. While answering, the region holds nothing focusable.
- **The done sticky primary** on phones takes the ask's rules: scroll padding, a Canvas fallback, sticky only from 30rem tall. Design rows reached by Tab stay clear of it at 390 by 664.

### 9.2 Live regions at done

1. The existing screen-reader `role="status"` is the only live region; it speaks each stage once.
2. The visible log is a plain list, not live; its stamps are `aria-hidden`.
3. Stamps never tick: a line shows its server stamp once it completes; the running line shows no clock.
4. The ring is `aria-hidden`.
5. Share's fallback speaks through the same status.
6. The ready flip keeps the h1 and the links as the same nodes, never moves focus, and never fades the element that has focus. The h1's programmatic focus shows no ring.
7. The send's "Sending your answers." is said once by a polite status in the question pane, which unmounts at done.

### 9.3 Contrast

| Pair                                                | Ratio                   | Rule                                               |
| --------------------------------------------------- | ----------------------- | -------------------------------------------------- |
| H1 (`--on-surface`) on `#c6dcee` or lighter         | ≥ 11                    | Allowed                                            |
| Muted on `#c6dcee`                                  | 5.37                    | The weakest body text allowed outside the card     |
| Muted on the wash `#e2eef7`                         | 6.43                    | Allowed                                            |
| Brand-ink on `#e2eef7`                              | 5.03                    | Links and focusable text only here or lighter      |
| Brand-ink on `#c6dcee`                              | 4.20                    | Never                                              |
| Card text on white: on-surface, muted, brand-ink    | 17.8, 7.58, 5.93        | Allowed                                            |
| `#9abfdd` over `#175883`                            | 3.94                    | Never text                                         |
| Brand-ink in a glow corner                          | 4.75                    | Never text; checks sit in the opposite corner      |
| On-ink over ink plus 75% of an L 0.8 glow (hue 190) | 2.49                    | Hence the lamp at or under 0.2 alpha behind text   |
| Muted over a 45% cyan lamp                          | 3.40                    | Never                                              |
| White on Forest, Ink, Clay, Plum tiles              | 5.99, 10.36, 6.86, 9.76 | Allowed                                            |
| White on a custom hex such as `#339906`             | 3.68                    | Never: the custom tile is white with a swatch chip |
| Island words on the wash, on the ink                | 11.6, 16.88             | Kept                                               |
| Danger on the wash                                  | 3.17                    | A mark, never text                                 |
| Field well edge on white                            | 1.18                    | A hand judgement, re-signed with the inset edge    |

### 9.4 Forced colours

| Part                                   | Rule                                                                                                                 |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Focus                                  | 2 px outline (kept)                                                                                                  |
| Choice tiles                           | A 1 px ButtonText border; selected: a 2 px Highlight border keyed on `aria-checked`, and the check in `currentColor` |
| Colour tiles and swatches              | A swatch span with `forced-color-adjust: none`                                                                       |
| Meter                                  | A bordered track, the fill in Highlight                                                                              |
| Stage ring                             | Track GrayText, arc Highlight, strokes `currentColor`                                                                |
| Back (icon only), posters, design rows | A ButtonText border                                                                                                  |
| Ask, desk row, done sticky primary     | The Canvas fallback (kept)                                                                                           |
| Send bloom                             | Hidden; "Sending" carries the state                                                                                  |

The a11y specs run an emulated forced-colours pass at q4 with a tile chosen and at done.

### 9.5 Reflow, spacing, targets, motion

- `scrollWidth` equals 320 and 390 at every question and at done; element-level overflow per 7.7.
- WCAG 1.4.12 text spacing at 320 and 390 for the ask, receipts, tags and island; a two-line ask counts in the gap budget.
- Targets: ask 48 px; Back 48 px; exit 40 px; tiles ≥ 64 px; colour picker 48 px.
- Reduced motion: only colour and opacity move; ≥ 9 form entrances; every finished state is the server's markup; the curve never kicks; no typing timer runs; no GSAP or fluid chunk. The face chunk still loads by q3 and the headline's font family changes: the same information by opacity.
- At 320 by 256 the h1 is in view on arrival.

### 9.6 Performance budgets

Measured with `pnpm build && pnpm budget` on a clean copy; a line moves once per release, in its R package: the measure plus 70 B, rounded up to the next 500, written into ADR 0037 and the script's comment.

| Line                                    | Now                                             | Change                                                                                                                                                                                                                                                                                                                                                               | Expected                                                                            |
| --------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| /start scripts (gz)                     | 246,212 of 246,500                              | Gross +6 to +9 KB (draft, receipts, meter, titles, keys, bloom, exits, typing, storage, face loader, curve, three times the copy). Offsets: the done set by plain `import()` about -2.9 KB; the old sketch set leaves /start about -4.2 KB (`Bar` moved into `phone-frame.tsx`); q2 to q5 steps lazy, preloaded one question ahead, about -2.5 KB if hydration holds | Net about -1 to +2 KB (-3.6 to -0.6 if the lazy steps hold); ceiling 252,000 (OD11) |
| / scripts                               | 217,037 of 218,000                              | The hero stops reading the draft; zod barred                                                                                                                                                                                                                                                                                                                         | Holds                                                                               |
| Shared stylesheet (`/`)                 | 17,851 of 19,000                                | `start.css` leaves for a route import (-0.9 KB); new /start rules never reach it                                                                                                                                                                                                                                                                                     | About 17,000; the line may not move                                                 |
| /start stylesheets (every linked sheet) | 17,851 of 19,000                                | Shared -0.9 KB; three route sheets +4 to +6 KB                                                                                                                                                                                                                                                                                                                       | 21,000 to 23,000; ceiling 23,500 (OD11)                                             |
| /start HTML                             | 5,966 of 25,000                                 | Skeleton draws the draft and ramp, plus the pre-paint script                                                                                                                                                                                                                                                                                                         | 8,500 to 10,000                                                                     |
| Lazy, never initial                     | none                                            | Done chunk 5 to 7 KB; faces module about 0.4 KB JS and 0.9 KB CSS, files 25 to 41 KB each; sampler about 1 KB                                                                                                                                                                                                                                                        | Guarded                                                                             |
| Desk document at 1440 by 900            | 900                                             | Table 4.3                                                                                                                                                                                                                                                                                                                                                            | 900 at every question                                                               |
| Phone region at 390 by 844              | 309 of 320                                      | Window 212; then the desk's frame whole at the width's zoom, 300 px (seventh amendment, the line to 400)                                                                                                                                                                                                                                                             | 308; then 396 of 400                                                                |
| First control to the ask at 390 by 664  | q1 48, q3 46, q4 83, q5 83                      | Shorter hints; hand-off receipts only (D6); then the frame capped at 0.3 (seventh amendment)                                                                                                                                                                                                                                                                         | ≥ 24 required, about 36 expected; then q1 26, q2 73, q3 99, q4 99, q5 32            |
| Lighthouse /start                       | perf 0.95 to 0.96; LCP 2,795 to 2,941 ms; CLS 0 | No images, WebGL or GSAP on first view                                                                                                                                                                                                                                                                                                                               | perf ≥ 0.95; LCP ≤ 2,941 ms; CLS ≤ 0.02; TBT ≤ 150 ms                               |

Between a release's first package and its R, packages run `BUDGET_PHASE=build pnpm budget`, which checks /start against the OD11 ceilings instead of the line (S0 adds the mode; R removes it at the end of Release 3).

---

## 10. The fence

| Rule                                                                                                                                                                                                                                       | Enforced by                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0 axe violations at every question, error state, style, palette and done state, at three widths                                                                                                                                            | `a11y-start*.spec.ts`, `a11y-done.spec.ts`, `a11y-hub.spec.ts`                                                                                                                                                                                                                                    |
| Text on grounds per 5.4 at six viewports                                                                                                                                                                                                   | `brief-ground.spec.ts` (questions), `brief-done-ground.spec.ts` (ready), `pool.mjs` by P5 and P6                                                                                                                                                                                                  |
| Colour engine equals `CONFIG.colour`; the sweep                                                                                                                                                                                            | `draft-model.test.ts`                                                                                                                                                                                                                                                                             |
| Tokens equal `CONFIG.start`; the spring's `linear()` string                                                                                                                                                                                | `start-tokens.test.ts`                                                                                                                                                                                                                                                                            |
| Reduced motion: colour and opacity only; ≥ 9 entrances; curve at rest; no typing timer; faces still load                                                                                                                                   | `reduced-motion-start-order.spec.ts` (P3), `reduced-motion-*-lit/draft/done.spec.ts`                                                                                                                                                                                                              |
| Hydration within 1.5 px; no Suspense; /start prerendered                                                                                                                                                                                   | `brief-shell.spec.ts`; `bundle-budget.mjs` (`start.html` exists)                                                                                                                                                                                                                                  |
| `main` before the region; one region; one "…is empty."                                                                                                                                                                                     | `brief-shell.spec.ts`, `brief-order.spec.ts`                                                                                                                                                                                                                                                      |
| `main` never dark while asking                                                                                                                                                                                                             | `brief-order.spec.ts` (the island test at q3)                                                                                                                                                                                                                                                     |
| Region ≤ 320 at 390 by 844; h1 in view; gaps ≥ 24 at 390 by 664; h1 in view at 320 by 256                                                                                                                                                  | `mobile-questions-lit.spec.ts`, `mobile-start-ask.spec.ts` (q1), `mobile-order.spec.ts` (q2 to q5, from Release 2)                                                                                                                                                                                |
| Document 900 at 1440 by 900, hex open included                                                                                                                                                                                             | `brief-ground.spec.ts`                                                                                                                                                                                                                                                                            |
| `scrollWidth` 320 and 390; element overflow with long names                                                                                                                                                                                | `mobile-order.spec.ts` (the walk, from Release 2), `mobile-names.spec.ts`                                                                                                                                                                                                                         |
| Exactly two `blob:` marks at 1440; the business name in ≥ 3 places and the slug                                                                                                                                                            | `brief-draft.spec.ts`                                                                                                                                                                                                                                                                             |
| Design links outside `aria-hidden`; one list displayed                                                                                                                                                                                     | `a11y-done.spec.ts`, `brief-done.spec.ts`, `mobile-done.spec.ts`                                                                                                                                                                                                                                  |
| The send hold leaves only the ask on the ink; captions whole and one height; the card under the posters; the lamp through an arrival and over a stopped build; the log's columns; the strip's air under the island; the tab order at ready | `brief-done-polish.spec.ts`, `mobile-done-polish.spec.ts`, `a11y-done.spec.ts` (the order test)                                                                                                                                                                                                   |
| Resume at `min(reached, firstInvalidIndex)`: sentence and business name only lands on q3                                                                                                                                                   | `brief-reducer.test.ts`                                                                                                                                                                                                                                                                           |
| Copy rules, with D25's two passes                                                                                                                                                                                                          | `copy.test.ts`, `reading-level.test.ts` over `start-copy.ts`, `draft-copy.ts`, `done-copy.ts`                                                                                                                                                                                                     |
| Budgets; lazy guards on /start (gsap, lenis, fluid, "Fraunces", the done chunk) and zod on `/`                                                                                                                                             | `bundle-budget.mjs`, CI `budget`                                                                                                                                                                                                                                                                  |
| gsap and lenis only in `lib/motion`                                                                                                                                                                                                        | ESLint (`eslint.config.mjs:29-31`)                                                                                                                                                                                                                                                                |
| Numbers in `CONFIG`; tokens in `globals.css`; page rules in /start sheets; no utility new to the shared sheet                                                                                                                              | Review; each package's stylesheet delta                                                                                                                                                                                                                                                           |
| Never submit a brief                                                                                                                                                                                                                       | Every spec's `beforeEach` aborts non-GET requests to /start; done reached through `?q=done&s=` with the GET route intercepted; a spec that holds the send installs `page.clock` before `goto`, runs it past `CONFIG.form.minMs` so the held POST is issued inside the test, and never unroutes it |
| Every ready template has a poster layout, all distinct; a poster carries its layout from the select stage and never a word or a picture before its stage; no poster overflows                                                              | `descriptors.test.ts`, `brief-done-layouts.spec.ts`, `mobile-done-polish.spec.ts` (the strip)                                                                                                                                                                                                     |
| From 120rem the grid is 120rem wide and centred, each margin on the ramp's own end, nothing scrolls sideways; at 1920 the grid is the full width                                                                                           | `brief-wide.spec.ts`                                                                                                                                                                                                                                                                              |
| Below `lg` the ring is in the first screen of a 664 px phone, the progress block before the page card                                                                                                                                      | `mobile-done-polish.spec.ts`                                                                                                                                                                                                                                                                      |
| No hairlines; italic cap; truth rules                                                                                                                                                                                                      | Review against sections 5.2 and 5.8; shot matrix                                                                                                                                                                                                                                                  |
| `RESEND_FROM` set in production                                                                                                                                                                                                            | The Vercel production build (`lib/env.ts`, keyed on `VERCEL_ENV`)                                                                                                                                                                                                                                 |
| Unsent uploads deleted after 24 hours                                                                                                                                                                                                      | `orphan-upload-sweep.test.ts`                                                                                                                                                                                                                                                                     |

---

## 11. Build order

### 11.1 Releases

| Release                    | Packages                | What a visitor sees                                                                                                       | Ships when                                                                           |
| -------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 1. Truth and safety        | S0, P2, P1, R1          | Today's page, fixed: no send from the hex field, done survives a refresh, true promises, new-tab call, human design names | Green                                                                                |
| 2. The order and the words | S0b, P3, P4, R2         | Name before email, the walkthrough titles, outcome asks, receipts, the meter, radio groups                                | Release 1 has run 14 days and 100 starts, whichever is later (OD13)                  |
| 3. The lit draft           | S0c, P5, P6, P7, P8, R3 | The ramp, the hero H1 and italic, the draft, the motion, the send, the wait and ready, the hub                            | Release 2 has run the same window, or with Release 2 if the owner picks speed (OD13) |

Within a release, packages own disjoint files, with one recorded exception: P5 creates `start-draft.css` and `start-done.css` empty; from P5's end P6 owns the first and P8 the second. A file may pass to a later package across a release boundary. P9 (the hero-to-q2 morph, and WebGL if OD4 says yes) is left for a later pass.

### 11.2 Packages

| Id  | Title                                  | Owns (and only these)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | After                                       | Acceptance                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S0  | Harness and guards                     | `scripts/bundle-budget.mjs` (the /start lazy guard: gsap, lenis, fluid, "Fraunces", the done chunk, `pending` until P1; the `/` zod guard; `start.html` exists; the `BUDGET_PHASE=build` ceilings); `scripts/imgstats.py`, `scripts/pool.mjs` (copied); `e2e/helpers/start.ts` (new: draft writer with `reached`, GET status interceptor, done opener, long-name fixtures, non-GET refusal); the `test.fixme` marks listed as R1 in 11.4; `lib/analytics/events.ts` (the new names); `app/layout.tsx` (`beforeSend` strips `s`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | none                                        | `pnpm budget` passes on today's build, every guard `ok` but the done chunk's `pending`; the phase mode works                                                                                                                                                                                                                                                                                                                                                               |
| P2  | Truth, privacy, mail, the status route | `app/api/status/[slug]/route.ts` (new, today's status shape) and its test; `lib/env.ts`; `lib/inngest/functions/orphan-upload-sweep.ts` (new) and test; `app/api/inngest/route.ts`; `lib/email/preview-link.ts` and test; `lib/inngest/functions/send-preview-link.ts`; `lib/preview/descriptors.ts` (new); `app/privacy/page.tsx`; `lib/site.ts`; `lib/config.ts` (`CONFIG.start.names`, `.done`, `.wait.hiddenPollMs`; the sweep's age); `lib/brief/schema.ts` (max lengths only); `lib/brief/names.ts` and test; `lib/brief/sketch.ts` and test; `components/sketch/sketch-model.ts` and test, `sketch-parts.tsx`, `app/_components/walkthrough-frame.tsx` (initials out; the `mark-initials` wire stays, as `walkthrough-timeline.ts` throws without it); `brief-done.tsx`; `design-slots.tsx`; `sketch-pane.tsx` ("an hour"); `app/_components/section-copy.ts` (the two home lines); `app/_components/copy-corpus.ts`; new `e2e/brief-truth.spec.ts`                                                        | S0                                          | The route answers by slug with `no-store`; with `VERCEL_ENV=production` and no `RESEND_FROM` the env check fails, without `VERCEL_ENV` it passes; the sweep deletes only unreferenced paths older than 24 h (unit); partial and time-up copy promises no email that will not come; the call and designs open in new tabs; no code name on screen                                                                                                                           |
| P1  | Flow, storage and the done lifeline    | `brief-flow.tsx`; `brief-reducer.ts` and test; `done-storage.ts` (new) and test; `done-boundary.tsx` (new); `start-skeleton.tsx` (pre-paint done state, noscript line); `lib/brief/draft.ts`; `lib/brief/read-draft.ts`; `app/preview/_components/use-submission-status.ts` (GET, hidden polling); `app/preview/actions.ts` (deleted); `app/_components/hero-prompt.tsx`; `steps/colours-step.tsx` (Enter only); new `e2e/brief-restore.spec.ts`, `mobile-restore.spec.ts`, `home-hero-carry.spec.ts`, `no-script-start-line.spec.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | S0, P2                                      | Enter in the hex field never sends; a draft with `reached` 2 lands on q3 although later answers validate; `?q=done&s=` restores after a refresh with the poll intercepted; one Back from done leaves /start; polling continues hidden; the hero never reads the draft; the done chunk is lazy and its boundary shows the page link                                                                                                                                         |
| R1  | Records, Release 1                     | Section 12; deletes the R1 marks of 11.4; moves the lines Release 1 changed (9.6)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | P1, P2                                      | Gate 11.6 on a clean worktree                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| S0b | Harness, Release 2                     | The `test.fixme` marks and loosenings listed as R2 in 11.4; `app/start/page.tsx` imports `start.css`, which leaves `app/globals.css`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | R1                                          | Existing suites green with the marks                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| P3  | Order, copy and controls               | `lib/brief/question-ids.ts`; `brief-reducer.ts` and test (ids, order, the section 10 resume case); `components/sketch/sketch-chips.tsx` (the new ids; a label map prop, today's labels by default); `app/_styles/start.css` (Release 2 rules); `lib/brief/schema.ts` (groups, messages); `lib/brief/answers.ts`; `brief-questions.ts` and test; `start-copy.ts` (new); `app/_components/copy-corpus.ts`; `brief-flow.tsx`; `question-pane.tsx`; `step-props.ts`; `steps/*` (`brand-step.tsx` new, `logo-step.tsx` deleted); `components/ui/field.tsx`, `choice-card.tsx`, `file-picker.tsx`; `use-picture-uploads.ts`; `lib/brief/upload-client.ts`; `lib/logo/polarity.ts` (new); `lib/logo/analyse.ts`; `logo-sampler.ts` (new); `lib/config.ts` (uploads); `lib/site.ts` (`reassuranceSend`); new `e2e/brief-order.spec.ts`, `mobile-order.spec.ts`, `a11y-start-order.spec.ts`, `mobile-names.spec.ts`, `reduced-motion-start-order.spec.ts` (the walk in the new order; no running animation on the spinner) | S0b                                         | The new order end to end with the GET poll intercepted; every string in 4.6 for q1 to q5 passes D25's two passes; uploads never disable Next; polarity matches the server's fixtures; axe clean at three widths; `/`'s stylesheet delta ≤ 0                                                                                                                                                                                                                                |
| P4  | The home follows the order             | `app/_components/section-copy.ts`; `how-it-works-track.tsx`; `walkthrough-timeline.ts`; `walkthrough-steps.ts` (new); `lib/brief/example-brief.ts` and test; `walkthrough-brand.test.ts`; new `e2e/home-walkthrough-order.spec.ts`, `mobile-walkthrough-order.spec.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | S0b, P3 (the ids; `SketchChips`' label map) | The walkthrough's five titles equal /start's H1s; "Question n of 5" stays one element; the dock and the phone line (`mobile.spec.ts`) unchanged                                                                                                                                                                                                                                                                                                                            |
| R2  | Records, Release 2                     | Section 12; deletes the R2 marks of 11.4; moves the lines Release 2 changed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | P3, P4                                      | Gate 11.6                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| S0c | Harness, Release 3                     | The `test.fixme` marks listed as R3 in 11.4                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | R2                                          | Existing suites green with the marks                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| P5  | The question side                      | `app/globals.css` (tokens, registered properties, `question-in` opacity only); `app/start/page.tsx` (adds `start-draft.css` and `start-done.css`); `app/_styles/start.css`; `start-draft.css` and `start-done.css` (created empty with a head comment, then handed on, 11.1); `lib/config.ts` (`CONFIG.start`); `start-tokens.test.ts` (new); `question-pane.tsx`; `start-layout.ts`; `start-chrome.tsx`; `steps/*`; `components/ui/field.tsx`, `choice-card.tsx`, `file-picker.tsx`; `draft-copy.ts` and `done-copy.ts` (new); `app/_components/copy-corpus.ts`; new `e2e/brief-ground.spec.ts`, `brief-questions-lit.spec.ts`, `mobile-questions-lit.spec.ts`, `a11y-start-lit.spec.ts`, `reduced-motion-start-lit.spec.ts`                                                                                                                                                                                                                                                                                     | S0c                                         | Mock and measure first: `imgstats.py` on the q1 shot ≥ 8%; ground sampling per 5.4 at six viewports in each question; 900 at every question with the hex open; gaps ≥ 24 (36 expected); while busy, the form inert and the ask `aria-disabled` "Sending" (4.8); `/`'s stylesheet delta ≤ 0                                                                                                                                                                                 |
| P6  | The draft                              | `app/start/_components/draft/*` (new); `sketch-pane.tsx`; `start-skeleton.tsx`; `components/sketch/brief-sketch.tsx` (deleted); `phone-frame.tsx` (`Bar` moved in); `sketch-parts.tsx`; `lib/motion/start-curve.ts` (new) and test; `app/_styles/start-draft.css`; new `e2e/brief-draft.spec.ts`, `mobile-draft.spec.ts`, `a11y-draft.spec.ts`, `reduced-motion-draft.spec.ts` (`[data-curve]`'s inline transform sampled 1 s after each Next at 390; the face chunk requested by q3)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | P5                                          | With `brief-flow.tsx` untouched: each question changes ≥ 10% of the frame; region 308 at 390 by 844; each Next ≥ 5% of the pane; repaint ≤ 300 ms; two `blob:` marks; the sweep; the curve at rest under reduce; faces load by q3 and time out to the note; hydration within 1.5 px                                                                                                                                                                                        |
| P7  | Status, hub, studio bar, email         | `lib/db/schema.ts`; the migration in `db/`; `lib/db/submissions.ts` (with a payload-hash lookup for P8); `lib/brief/status.ts`; `lib/preview/status.ts` and tests; `app/api/status/[slug]/route.ts`; `app/preview/[slug]/page.tsx`; `app/preview/_components/studio-bar.tsx`, `concept-pending.tsx`, `use-submission-status.ts`; `lib/email/preview-link.ts`; new `e2e/brief-hub.spec.ts`, `mobile-hub.spec.ts`, `a11y-hub.spec.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | P5 (the hub's words in `done-copy.ts`)      | The migration applies on a Neon branch, never production first; the body under 2 KB and jsonb paths only; headline and photo only after their stage; the hub polls, has no hairline, shares                                                                                                                                                                                                                                                                                |
| P8  | Send and done                          | `brief-flow.tsx`; `brief-done.tsx`; `design-list.tsx` (new, replacing `design-slots.tsx`); `stage-ring.tsx`, `done-log.tsx`, `send-bloom.tsx` (new); `use-countdown.ts`; `done-storage.ts`; `done-boundary.tsx`; `app/start/_components/actions.ts` (a resend returns its slug before `hitLimit`); `app/_styles/start-done.css`; new `e2e/brief-done.spec.ts`, `brief-done-ground.spec.ts`, `mobile-done.spec.ts`, `a11y-done.spec.ts`, `reduced-motion-done.spec.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | P6, P7                                      | Every row of 4.9 reached through `?q=done&s=` with intercepted polls; ground sampling at ready per 5.4 at the six viewports; a poll with `conceptCount` 2 says "two" everywhere; a second identical send in the window does not raise the count (unit); 4.8's outcomes through reducer unit tests and an aborted POST (the RETRY path), never a submit; design links outside `aria-hidden`; one live region; the first poster in view at 1366 by 657; done ≥ 15% saturated |
| R3  | Records and lines, Release 3           | Section 12; deletes the R3 marks of 11.4; removes the phase mode; moves the lines                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | P5 to P8                                    | Gate 11.6; the shot matrix; the iPhone check                                                                                                                                                                                                                                                                                                                                                                                                                               |

### 11.3 Contracts between packages

| Hook                                                                                                                                                                       | Set by                                                            | Read by                                                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `GET /api/status/[slug]`, typed by `SubmissionStatus` in `lib/brief/status.ts`, extended as `StatusView`                                                                   | P2 (today's type), P7 (`StatusView`)                              | P1, P8, the hub, every done spec                                                            |
| The done keys (`pinnaclepx.done`, `.submitted`, `.pending`, `.sends`), only through `done-storage.ts`                                                                      | P1 (P8 extends)                                                   | P3, P8                                                                                      |
| `reached` in the draft; `resumeIndex(draft)`                                                                                                                               | P1                                                                | P3, P6                                                                                      |
| `QUESTION_IDS` and the ids                                                                                                                                                 | P3                                                                | P5, P6, P8; the walkthrough only through `walkthrough-steps.ts`                             |
| Copy modules `start-copy.ts`; `draft-copy.ts`, `done-copy.ts`                                                                                                              | P3; P5                                                            | P6, P7, P8 (no package after them writes a visitor sentence)                                |
| `CONFIG.start`; `--start-pace`, `--start-exit`, `--draft-*`, `--ease-spring`; registered properties                                                                        | P5 (P2 and P3 start `CONFIG.start`, 6.1)                          | P6, P8                                                                                      |
| `start-layout.ts`: `.start-flow`, the ground layers, `startHeading`; `data-step` and `data-state` on `.start-flow`                                                         | P5 (classes), P1 (`data-state="done"` pre-paint), P8 (attributes) | All three /start sheets                                                                     |
| `[data-rise="lead"]`, `[data-rise="controls"]`, `data-leaving`, `data-dir="back"`                                                                                          | P5                                                                | `start.css`                                                                                 |
| `.start-ask`, `.start-actions`, `label:has(input[type=file])`, `main#main form .rounded-2xl:focus-within`                                                                  | P3 and P5 keep them                                               | Existing specs                                                                              |
| `.mood-art[data-style]`                                                                                                                                                    | P5 (`start.css`)                                                  | P5's look tiles, P6's draft                                                                 |
| `draftModelFrom(answers, reached, extras)`; `SketchPane` keeps today's props (`model` made optional), gains optional `reached` and `doneSlot`, and builds the draft inside | P6                                                                | P8, which drops `sketchModelFrom` from `brief-flow.tsx` and passes `reached` and `doneSlot` |
| `data-frame="browser"` and `"phone"`; the browser frame first on screen below `lg`, the phone frame from 80rem (seventh amendment)                                         | P6                                                                | `brief-shell.spec.ts`                                                                       |
| `[data-curve]`, kicked by `sketch-pane.tsx` on a question change                                                                                                           | P6                                                                | Reduced-motion specs                                                                        |
| `DesignList({ variant })`, `<ol aria-label="Your designs">`                                                                                                                | P8                                                                | `SketchPane`'s `doneSlot`                                                                   |
| `.start-done-ask`                                                                                                                                                          | P8                                                                | `mobile-done.spec.ts`                                                                       |

### 11.4 Existing assertions that move

| Spec (lines)                                                         | Pins                                                                                                                                                        | Marked | Replaced in                                                                                                              |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------ |
| `brief.spec.ts` test 117 (`canSubmit` only)                          | `q=done$` (128); "Aurora" (141)                                                                                                                             | R1     | `brief-truth.spec.ts`, then `brief-done.spec.ts`                                                                         |
| `brief.spec.ts` tests 61, 81, 92, 102, 146, 164                      | The old order through `answerFirstTwo` and `nextTo`; "Company"; old headings; "Choose your logo"; the name ≥ 3 times, "Book with us" re-tint, the chip text | R2     | `brief-order.spec.ts`; the sketch pins in `brief-draft.spec.ts` (R3: the CTA pill's re-tint, the screen-reader sentence) |
| `brief-shell.spec.ts` test 115                                       | Dark scope at the old q4 heading                                                                                                                            | R2     | `brief-order.spec.ts`, then `brief-ground.spec.ts`                                                                       |
| `brief-shell.spec.ts` 139-147                                        | Heights                                                                                                                                                     | R3     | `brief-ground.spec.ts`                                                                                                   |
| `brief-chrome.spec.ts` 94-137, 162-178                               | The island at q5, 390 by 664                                                                                                                                | R2     | `brief-order.spec.ts` (at q3)                                                                                            |
| `mobile-start-ask.spec.ts` 85-90, 136-145, 155-167, 175-183, 195-205 | First controls; Tab counts; "Brand colour"                                                                                                                  | R2     | `mobile-order.spec.ts`                                                                                                   |
| `mobile-start.spec.ts` tests 103, 125-170, 172, 200                  | The walk ("Company"); headings and reassurance at q4 and q5                                                                                                 | R2     | `mobile-order.spec.ts`                                                                                                   |
| `a11y-start.spec.ts` 69-108                                          | Question positions                                                                                                                                          | R2     | `a11y-start-order.spec.ts`                                                                                               |
| `reduced-motion-start.spec.ts` 78-125                                | The old walk and entrance                                                                                                                                   | R2     | `reduced-motion-start-order.spec.ts`; the entrance in `reduced-motion-start-lit.spec.ts` (R3)                            |
| `home.spec.ts` 28-56, 81-91                                          | The walkthrough's order; the hand-off                                                                                                                       | R2     | `home-walkthrough-order.spec.ts`; `brief-order.spec.ts`                                                                  |

S0b loosens, rather than marks, pins that hold before and after: `name: 'Next', exact: true` becomes `name: /^Next/` (`brief.spec.ts` 56, `brief-ask.spec.ts` 61-64, `a11y-start.spec.ts` 120, `mobile-start.spec.ts` 116), and the q1 heading pins become `page.locator('main#main h1')` (`brief.spec.ts` 41, 78; `brief-shell.spec.ts` 85, 172; `a11y-start.spec.ts` 65; `mobile-start.spec.ts` 114; `mobile-start-ask.spec.ts` 122).

Kept green throughout, loosened pins included: `brief.spec.ts` tests 28, 39, 46, 53, 75, 181; `brief-shell.spec.ts` 71-76, tests 82 and 154, 189-191 (the window is the first phone frame; R3 restates the comment); `brief-ask.spec.ts` 54; `a11y-start.spec.ts` tests 63, 113; `mobile-start.spec.ts` test 107; `mobile-start-ask.spec.ts` test 119; `no-script-start.spec.ts`; `reduced-motion.spec.ts` 28 (P4 checks it).

### 11.5 Rules for every package

- Read the relevant guide in `node_modules/next/dist/docs/` before touching a route, layout or CSS import (AGENTS.md).
- Semantic tokens only in TSX; recipe strings are plain template strings, never `cn()`.
- Numbers in `lib/config.ts`; durations as tokens in `app/globals.css`; page rules in the /start sheets; no utility the shared sheet does not already have.
- Delete before adding. Report both stylesheet deltas (`/` and /start; lightningcss, gzip 9) and `BUDGET_PHASE=build pnpm budget`.
- Tests first: write the package's new specs before its code; they are green at its end.
- Run `pnpm prettier --write` on the package's files, then `pnpm typecheck`, `pnpm lint`, `pnpm knip`, `pnpm test`, the package's specs, `brief.spec.ts` and the fence specs of section 10.
- Shots at 390, 768 and 1440 into the scratchpad's `shots/<id>-after/`.
- Never submit a brief; reach done through the reducer's restore path (`?q=done&s=`) with the GET route intercepted. No `git add`, commit, stash or checkout; other sessions edit the tree, so re-check `git status` before reporting.

### 11.6 The final gate (each R)

On a clean worktree:

```
pnpm typecheck && pnpm lint && pnpm format:check && pnpm knip && pnpm test
pnpm e2e                     # all five projects
pnpm build && pnpm budget    # every guard ok; lines per 9.6
```

Then, at Release 3:

- **Shots** at 320 by 640, 390 by 664, 390 by 844, 844 by 390, 700 by 500, 768 by 1024, 1024 by 768, 1366 by 657, 1440 by 900, 1920 by 1080 and 2560 by 1440. Each question empty and filled; q3 per style; q4 per palette, `#339906` and `#808080`; q2 with a white logo; the errors; the send hold; building, ready, partial, failed and expired.
- **Measures:** `imgstats.py` on the light grounds only (q1 ≥ 8%; ready and partial ≥ 15%; top three flat ≤ 40%), since it counts chroma and the dark states are lit by one lamp on the ink by design (the owner's decision of 25 September 2026, ADR 0037's sixth amendment); the wait, the send and the colour question at a desk are held by `pool.mjs` (the lamp lit and spent above the text) and by eye against the mockups instead.
- **By hand:** the field-edge judgement; the LAN iPhone (rubber band, sticky ask, keyboard, return key).
- **By the owner:** the 5-second sibling test with at least 8 people.

---

## 12. Records

**ADR 0037, "The questionnaire is a lit draft".** R1 creates it with Release 1's decisions accepted and the rest proposed; R2 and R3 accept theirs in dated amendments with their measures.

- **Supersedes:** ADR 0035 D9 (chips), D19 (the pool at the colour question only), D20 (the static curve), D21 (ink done, the call above the countdown), D23 (200 ms motion, and its claim that /start imports nothing from `lib/motion`: `use-focus-on-mount.ts:4` does), D24 (no italic), D25 (the dark style on the scrim); ADR 0004's question order; the copy freeze in `docs/start-page-redesign-plan.md` §22.
- **Amends:** ADR 0035 D1 (the window, fixed titles, the band per OD5), D2 (the window replaces the 0.7 phone), D11 (the field judgement re-signed), D13 (radio groups), D15 (Back a 48 px round button below `lg`), D16 (Back beside the ask; the done sticky primary), D17 (the `enterKeyHint` chain; Enter on q1 for fine pointers); ADR 0034 D3 (the italic rule, 5.2); ADR 0004 (the order, `&s=`, D5 gated on `reached`, studio light is not an answer); ADR 0026 D1 (OD5); ADR 0015 D5 (OD9a); ADR 0014 (uploads before the email, the orphan sweep, picture links beside the tiles, device storage, Cal.com); ADR 0025 and 0036 (the walkthrough's order); the caps note (the pool's exemption now covers the /start curve); constraints §4.3 (D28's marks).
- **Keeps:** ADR 0035 D3 to D8, D10, D12, D14, D18, D22 and no Suspense; ADR 0004's URL grammar, sessionStorage draft and decorative sketch; ADR 0014's honeypot, floor and `noindex`.
- **Owner assumptions of `docs/start-page-redesign-plan.md` §24:** reverse 4, 7, 8 (numerals as tags only), 9, 11 and 13; amend 1 (their colour in the region's band, never a room) and 3 (ink for the wait, light at ready); keep 12.
- **Consequences:** the byte lines with their measures; the heights, region and gaps; the contrast rows new to the fence table (brand-ink on the deep wash 4.20, muted over the lamp 3.40, `#9abfdd` on `#175883` 3.94, on-ink over the lamp 2.49, white on `#339906` 3.68); the field-edge judgement; `imgstats.py` results; the PECR reasoning for the local keys.

**Other lines:** `docs/start-page-plan.md` §7 (amended); `docs/start-page-redesign-plan.md` (status line); ADR 0035's status ("amended by ADR 0037"); `scripts/bundle-budget.mjs`'s comments; the comments of `brief-shell.spec.ts` (the window is the phone frame) and `brief.spec.ts` (the region); this plan's status line.

---

## 13. Owner decisions and assumptions

### 13.1 Decisions

1. **Fences** (ADR 0035 D20, D23, D24; assumptions 7, 8, 13). **Recommend:** the italic payoff, numerals only as tags, no thread, the spring token and the curve's spring, the 900 ms pace, no GSAP. **Fallback:** landings on `--ease-enter`, the curve at rest, payoff words in Mona Sans 700 brand-ink. **Plan changes:** P5 drops `--ease-spring` and the `em`; P6 drops `start-curve.ts`; D20 and D24 of ADR 0035 stay.
2. **What the italic carries.** **Recommend:** a fixed payoff word; their words upright. **Fallback:** the receipt's clause in italic at 20 px, never in the H1. **Changes:** P3's copy module and P5's receipt style.
3. **Order.** **Recommend:** sentence, name, look, colour, send; the hero lands on the name. **Fallback:** section 3.4. **Changes:** P3 and P4 shrink to copy and controls; D2 and D29 fall away.
4. **WebGL ink.** **Recommend:** not this pass. **If yes:** P9, one splat per Next on the ramp's light half, masked out of the H1 and card, gated on `navigator.userActivation`, asleep after 1.5 s, disposed at done, never under reduce; the hero's `fluid.ts` untouched; a /start guard; the script line moves.
5. **Their colour on the ground.** **Recommend:** on a choice at q4, the region's dark band only, plus the lamp. **Fallback:** the lamp and the draft only. **Changes:** P5 drops `--start-hue`; ADR 0026 D1 is untouched.
6. **Stand-in imagery.** **Recommend:** mood art plus their uploads; the home's line fixed. **Fallback:** labelled licensed photos per style, ≤ 40 KB each, lazy. **Changes:** P6 adds images and a truth review.
7. **Display faces.** **Recommend:** lazy from q2. **Fallback:** Mona Sans 750 with the face note. **Changes:** P6 drops `draft-faces.ts`.
8. **Done.** (a) The call secondary until a design is opened, with the intermission: **yes**; fallback, the filled call under the lead. (b) Stage times, tokens, headlines and photos in the poll, with the migration: **yes**; fallback per 8.2 (no times, silhouettes until ready). (c) Silhouettes, never t08 thumbnails. (d) An iframe of design one: later.
9. **Honesty.** (a) Email partial builds too: **yes** (ADR 0015 D5 amended); fallback, no email, the partial note says so, the q5 hint stays true either way. (b) Set `RESEND_FROM` and verify the domain on Vercel before Release 1; the build enforces it. (c) The slug in the URL and a local key expiring 24 hours after the deadline: **yes**; fallback, the URL only (bare /start shows q1). (d) Answers in localStorage: **not this pass**, the draft stays per tab; the alternative, a legal question for the owner: sentence, look and colour for 7 days, with an "On your device" paragraph on /privacy, "Start afresh" and "Welcome back" (P1 grows; ADR 0037 records the PECR reading).
10. **Copy.** **Recommend:** lift the freeze; the walkthrough's titles; the reassurance at q1 plus a send variant; asks that name the next step; a 20-minute call (`CONFIG.call.minutes`). **Fallback:** if "Next" stays, the arrow and the reward line carry the outcome.
11. **Budgets.** **Recommend:** ceilings of 252,000 B for /start scripts and 23,500 B for /start stylesheets, each line set by R's measure; `/`'s lines do not move. **Fallback:** hold scripts at 248,000: the lazy steps become required and the tap bloom goes.
12. **Small calls.** The logo's colour tile, only with real chroma: yes. No TLD in the tab. No border on the dark style. Descriptors: Aurora "Glowing centre", Monolith "Card-led", Meridian "Colour pool", Atlas "Split layout", Ember "Photo-led", Harbor "Type-led", Summit "Quiet and airy", Vector "Bold and editorial". Fallback, and for any template without one: the ordinal alone ("Design two"). An address for `SITE.contactEmail` (fallback: the noscript line without one). The morph ships only if its check passes.
13. **Measurement.** **Recommend:** confirm the Vercel plan stores custom events (Pro or above) before Release 1; stage the releases per 11.1; revert Release 2 if start-to-complete falls more than 5 points below the baseline at equal sample. **Fallback:** ship Releases 2 and 3 together and accept that the reorder's effect cannot be told apart.

### 13.2 Assumptions (each reversible in one line)

1. The split stays 46% with B's stops. _Reverse:_ change `--split`.
2. The bloom holds at 38%. _Reverse:_ `CONFIG.start.send.holdShare`.
3. Questions move at pace 1.5 (900 ms). _Reverse:_ `CONFIG.start.pace`.
4. The receipt sits under the H1; below `lg` and on short desks only the hand-off, expired and pending receipts show (D6). _Reverse:_ one condition.
5. A fresh q1 has no receipt; the reward is the helper's first sentence. _Reverse:_ one string.
6. The desk column is 540 px from `xl`. _Reverse:_ one class.
7. The H1 stops growing at 73.28 px. _Reverse:_ the cap in `startHeading`.
8. Desk posters are 196 by 260. _Reverse:_ two numbers in `start-done.css`.
9. The phone frame stays over the draft's corner at desk. _Reverse:_ `display: none` from `lg`.
10. Back is a 48 px round icon beside the ask on phones, under it below 22.5rem. _Reverse:_ one class.
11. The ramp's diagonal is the only seam at desk. _Reverse:_ add the shaped seam later.
12. The lamp walks cyan, indigo, then theirs. _Reverse:_ `CONFIG.start.lamp`.
13. The phone curve rings about 2 s (damping 0.2), less bouncy than the home's 0.1. _Reverse:_ `CONFIG.start.curve.dampingRatio`.
14. Ready flips in 600 ms. _Reverse:_ `CONFIG.start.ready`.
15. "Usually done by 14:32." _Reverse:_ one string.
16. The header ask shows a live done state, with "Start a new brief". _Reverse:_ rule 4 of 7.4.
17. The home walkthrough re-stages to /start's order. _Reverse:_ `walkthrough-steps.ts`.
18. Business name ≤ 80, your name ≤ 60. _Reverse:_ `CONFIG.start.names`.
19. Unsent pictures are deleted after 24 hours. _Reverse:_ the sweep's age.
20. Uploads are downscaled in the browser. _Reverse:_ skip the resize in `logo-sampler.ts`.
21. Three releases with measurement windows. _Reverse:_ OD13's fallback.
22. Under 30rem tall the draft hides. _Reverse:_ a 120 px crop instead.
23. The q2 receipt shows on every arrival on desks 47.5rem tall or more, elsewhere only after the hero (D6). _Reverse:_ one condition.
24. Enter advances q1 only for fine pointers. _Reverse:_ one media query.
25. A done restore lasts until 24 hours after the deadline. _Reverse:_ `CONFIG.start.done.restoreHours`.

---

## 14. Review resolutions and what waits

### 14.1 Blockers and majors

AX is the accessibility review, DV the developer's, CV conversion, CP completeness. "Folded" means the fix is in the plan where named; "In part" means a stated reason overrules one piece.

| Id     | Finding                                               | Resolution                                                                                                                                                                                                                                 |
| ------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AX-B1  | Design links inside the `aria-hidden` draft           | Folded: D18, 9.1; axe at building, ready and partial at three widths (`a11y-done.spec.ts`). In part: two lists, one displayed per width, because `main` and the region are separate grid cells; only one is ever in the accessibility tree |
| AX-M1  | Custom tile label fails 4.5:1                         | Folded: a white tile with a swatch chip (5.7, 9.3); `#339906`, `#e91e63`, `#4e8a15` in the sweep (5.8)                                                                                                                                     |
| AX-M2  | Brand-ink allowed on `#c6dcee`                        | Folded: the split fence (5.4, 9.3); sampling behind every text box at six viewports, questions and ready                                                                                                                                   |
| AX-M3  | The lamp behind done text                             | Folded: every on-ink text box at ≤ 0.2 alpha, swell included; the phone lamp spent 12 px above `main` (5.4); `pool.mjs` on the wait (11.6)                                                                                                 |
| AX-M4  | The window's 96 px translate                          | Folded: a 450 ms crossfade, the offset jumps unseen (6.2)                                                                                                                                                                                  |
| AX-M5  | The rAF spring under reduce; wrong numbers; the swell | Folded: `matchMedia` on every kick, P6's inline-transform sampling, damping 0.2 ringing about 2 s under the pool exemption, the swell an alpha multiplier (5.5, 6.2, 6.3)                                                                  |
| AX-M6  | Reduce would bar the faces                            | Folded: faces load under reduce, asserted by P6's `reduced-motion-draft.spec.ts` (9.5)                                                                                                                                                     |
| AX-M7  | Done's live regions and timers                        | Folded: 9.2's seven rules                                                                                                                                                                                                                  |
| AX-M8  | Fields focusable under the held ink                   | Folded: fields inert, the ask keeps focus, the status speaks once (4.8, 9.1)                                                                                                                                                               |
| AX-M9  | Long names clipped                                    | Folded: 7.7 and `mobile-names.spec.ts`                                                                                                                                                                                                     |
| DV-B1  | The build order fails its own gates                   | Folded: releases, S0 marks, replacement specs, the phase ceilings (D28, 9.6, 11). In part: a line still moves once per release, in R, after the measure of the finished tree, as the budget rule requires                                  |
| DV-M1  | Script estimate too low                               | Folded: gross +6 to +9 KB, named offsets, OD11's ceiling (9.6)                                                                                                                                                                             |
| DV-M2  | `QUESTION_IDS` shared with the walkthrough            | Folded: P4, D29, 8.1                                                                                                                                                                                                                       |
| DV-M3  | The hero's merge pulls zod into `/`                   | Folded: D4, 8.1, S0's guard                                                                                                                                                                                                                |
| DV-M4  | `firstInvalidIndex` skips look and colour             | Folded: D3; returning means a localStorage restore only (7.5)                                                                                                                                                                              |
| DV-M5  | Done has no data after a refresh                      | Folded: 7.3 keys, the restored copy (4.6), the pre-paint state (7.8)                                                                                                                                                                       |
| DV-M6  | The poll needs a migration and a GET route            | Folded: 8.2. In part: headline and photo are released when their stage completes, not at openable, because the same link holder sees them minutes later on the hub                                                                         |
| DV-M7  | Storage and telemetry privacy                         | Folded: OD9d now keeps the draft per tab; no slug in events; `s` stripped; /privacy gains Cal.com and device storage (7.3, 8.5, D30)                                                                                                       |
| DV-M8  | The orphan sweep is new work                          | Folded: 7.2, P2                                                                                                                                                                                                                            |
| DV-M9  | `next/dynamic` fonts trap                             | Folded: a plain `import()` in `load-faces.ts`, four faces, a guard (5.8)                                                                                                                                                                   |
| DV-M10 | What the phone window is                              | Folded: the phone frame restyled, one element (D8, 11.3)                                                                                                                                                                                   |
| DV-M11 | Two-line titles break the desk height                 | Folded: 4.3 (540 px column, cap, cut order, hex-open check)                                                                                                                                                                                |
| DV-M12 | Posters do not fit the region                         | Folded: 196 by 260 with the zoom; first poster in view at 1366 by 657 (4.2, P8)                                                                                                                                                            |
| DV-M13 | Utilities land in the shared sheet                    | Folded: D26, 9.6, 11.5                                                                                                                                                                                                                     |
| DV-M14 | `interactiveWidget` re-evaluates height queries       | Folded: D31, the default kept                                                                                                                                                                                                              |
| DV-M15 | Nine specs break, not four                            | Folded: 11.4; the receipt under the h1; the q1 error kept apart from the meter                                                                                                                                                             |
| CV-B1  | Partial misread                                       | Folded: D19, 4.6, 4.9, OD9a                                                                                                                                                                                                                |
| CV-B2  | Resume skips look and colour                          | Folded: D3; the reducer test (section 10)                                                                                                                                                                                                  |
| CV-B3  | Uploads before the privacy notice; orphans            | Folded: D30, 7.2; P2 ships in Release 1, before the reorder                                                                                                                                                                                |
| CV-M1  | No stage times; three false log lines                 | Folded: 8.2 (migration, OD8b); the log rewritten (4.6)                                                                                                                                                                                     |
| CV-M2  | Restored done has no name or email                    | Folded: the restored copy (4.6); Cal.com prefilled only in memory (8.4)                                                                                                                                                                    |
| CV-M3  | Leaving and returning underspecified                  | Folded: 7.3, 7.4. In part: bare /start (the header ask) shows a live done, because its label promises the designs; "Start a new brief" leads, and a hero sentence (merged into the draft) or `?q=n` goes to the questions                  |
| CV-M4  | The reorder cannot be measured                        | Folded: 8.5, 11.1, OD13; the curve kept as intent (3.3)                                                                                                                                                                                    |
| CV-M5  | Promises before the sender and the hub                | Folded: D23; P7 before P8                                                                                                                                                                                                                  |
| CV-M6  | Strings that are not true                             | Folded: 4.6 (q1 helper makes no claim, q4 "buttons and accents", the log's tones)                                                                                                                                                          |
| CP-B1  | Done has no state machine                             | Folded: 4.8, 4.9, 7.3 to 7.5, 7.8. In part: `&s=` without storage renders done from the poll rather than redirecting to the hub, because done carries the log and the call                                                                 |
| CP-B2  | The package plan misses constraints §4                | Folded: D1 to D32, sections 10, 11, 13.2 and 14. In part: the file keeps its commissioned name, and section 1 quotes the owner verbatim with the diagnosis; the full brief stays in the scratchpad                                         |
| CP-M1  | Partial copy against the status model                 | Folded as CV-B1; counts come from the poll                                                                                                                                                                                                 |
| CP-M2  | Grey hexes, label contrast, retint flashes            | Folded: `data-grey`, the swatch tile, complete-hex retint, the sweep (4.7, 5.7, 5.8)                                                                                                                                                       |
| CP-M3  | Names without limits                                  | Folded: 7.7                                                                                                                                                                                                                                |
| CP-M4  | The client sampler and the server disagree            | Folded: `lib/logo/polarity.ts`, SVG by `<img>`, the unreadable path, the thumbnail on ink (5.8, 4.6)                                                                                                                                       |
| CP-M5  | Uploads block Next                                    | Folded: D14, 7.2                                                                                                                                                                                                                           |
| CP-M6  | Send outcomes unspecified                             | Folded: 4.8; the day's sends in the local key (7.3)                                                                                                                                                                                        |
| CP-M7  | Viewports missing                                     | Folded: 4.2's new rows; the shot matrix (11.6)                                                                                                                                                                                             |
| CP-M8  | The ramp undefined                                    | Folded: 5.3                                                                                                                                                                                                                                |
| CP-M9  | Forced colours                                        | Folded: 9.4                                                                                                                                                                                                                                |
| CP-M10 | Analytics tier and events                             | Folded: 8.5, OD13                                                                                                                                                                                                                          |
| CP-M11 | OD9d privacy                                          | Folded: OD9d, 7.3's expiries, D30                                                                                                                                                                                                          |

**Minors folded:** AX: exit focus (7.1), the hex keeps focus (4.7), the q1 Enter hint (4.6, 4.7), 320 by 256 (4.2), receipt order (D6), control semantics (4.7), forced colours (9.4), the done sticky primary (9.1), the well's edge (5.7), the spinner (6.3), noscript (4.6, OD12). DV: the history trap (7.5), deleting `BriefSketch` (5.8), titles and `s` (7.8), achromatic hexes (5.8), two untrue lines (4.6), the chunk boundary (4.9). CV: the rise (controls 0.5rem), the ready flip (D21), "Usually done by", the copy corpus (D25), q1's word count, Enter in the email field (4.7), the 3 s floor (4.8). CP: in-app Back and "Change it" (7.5), digit keys in fields (4.7), static stamps (9.2), Back at 320 and text spacing (4.2, 9.5), overscroll and iOS (5.3, 7.8), a failed face load and the curve guard (5.8, P6), descriptors, email and hub states (OD12, 8.3, 8.4).

**Minors overruled:** CV's polarity note: `lib/tokens/scheme.ts:8-11` lets the logo decide the surface when the style is not dark, so the draft follows `schemeFor` exactly (D13). CV's exit note, in part: the 200 ms exit stays because the brief asks for one and the draft answers the press at 0 ms; focus is never lost and the next question takes input the moment it mounts.

### 14.2 Left for a later pass

1. The hero-to-q2 morph (a React `<ViewTransition>`, 600 ms), only if the first client render is the question, its travel recorded as an exception (P9).
2. WebGL ink on the ramp (OD4).
3. An iframe of design one at ready (OD8d).
4. Lifting the ask above an Android keyboard with the VisualViewport API.
5. The "What a hired build looks like" card in the intermission, once VetPres's consent is on record.
6. A draft kept across tabs (OD9d's alternative).
7. An A/B test of "No sign-up" in the reassurance.
8. A compact draft for landscape phones instead of none.
9. Standing items: Lighthouse in CI; `--danger-ink`; /privacy's own island bar.
