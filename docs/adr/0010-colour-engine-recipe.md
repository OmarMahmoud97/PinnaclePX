# The colour engine: a fixed recipe, hue locked, text moved to AA

- Status: accepted
- Date: 4 September 2026
- Plan: `docs/pipeline-plan.md`, section 11

## Context

The build guide's step 5 asks for a token pipeline proven safe on an adversarial corpus before a template consumes it: parse the brand hex, work in OKLCH, lock the hue, build a lightness ramp, clamp chroma into sRGB, tint the surfaces, and solve every declared contrast pair to WCAG AA by moving lightness, throwing when a pair cannot be solved. The fourteen tokens and their meanings were fixed by ADR 0008.

## Decision

1. **A recipe per scheme, in `CONFIG.colour`.** Surfaces, inks, border, accent and scrim have fixed lightness and take the brand hue at a tenth of the brand's chroma, capped per token. `brand` is the visitor's colour with its lightness clamped into a band; `brand-deeper` (the fill and the coloured text) is clamped into a narrower band; `brand-deepest` sits a fixed step further from the surface. `on-brand` starts white on a light scheme and near-black on a dark one. Every recipe number lives in `lib/config.ts`.
2. **Only text tokens move, and only in lightness.** `solvePairs` walks every declared pair, moves the text token away from its background in 0.02 steps until the pair meets 4.5:1, flips to the other side if the near side cannot get there, and repeats over all pairs until a pass moves nothing. Backgrounds never move, so a template's surfaces stay what the recipe made them, and a token that is text in one pair and background in another settles in order. Chroma is clamped into the gamut at every step; hue is never touched. The engine throws `AppError` if the passes run out.
3. **The second glow is a designed complement.** `glow` is the brand hue at high lightness and chroma; `glow-secondary` is the hue rotated by `CONFIG.colour.glowHueShift` (−130°), so amber gets violet, green gets orange and blue gets green. Glows are never behind text (ADR 0008), so this is the one place a hue other than the brand's appears. A grey brand stays grey throughout: no colour is added to it anywhere.
4. **The scheme is decided before the engine runs.** `schemeFor(style, polarity)`: the dark style gives a dark surface; otherwise light artwork gives a dark surface and everything else a light one.

## Consequences

- `deriveTokens` passes the corpus (`lib/tokens/derive.test.ts`): pure primaries, greys, black, white, near-black, near-white, the four palettes and the example brands, in both schemes, against every pair Aurora and an accent panel could declare. No corpus entry throws; the throw is a guard, since black or white text always reaches 4.5:1 on any background.
- A saturated brand on a light scheme can end far darker than the visitor's colour where it carries white text (amber `#f59e4a` becomes `#915100` as the fill). That is the promise the site makes about colour, kept: the hue is theirs, the lightness moves for the reading.
- `/examples/aurora` renders from the engine and takes `?scheme=light`, so both polarities can be reviewed. Verified on 4 September 2026 at 1440 and 390 px in both schemes: no horizontal overflow, no console errors, axe clean for WCAG 2.2 AA.
- `culori@4.0.2` and `@types/culori@4.0.1` are the engine's only dependency.
