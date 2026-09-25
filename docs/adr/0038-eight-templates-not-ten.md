# Eight templates, not ten

- Status: accepted
- Date: 26 September 2026
- Departs from: `docs/standards.md` (the registry's "exactly ten" check and `CONFIG.templates.count`), ADR 0002 decision 6

## Context

The registry was laid down on day one with ten placeholders (ADR 0002) so the compile-time count check was live before any template existed. Eight have since been built and are ready (`t01-aurora` to `t08-vector`, ADRs 0008, 0023 and 0027 to 0030). `t09-linen` and `t10-orbit` were still placeholders that rendered only their name and were never ready, so the selector never chose them. On 26 September 2026 the owner deleted both and decided that eight templates are enough.

## Decision

1. **The set is eight.** `templates/registry.ts` lists `t01` to `t08`, `TemplateTuple` in `lib/copy-slots/template-meta.ts` is an eight-element tuple, and `CONFIG.templates.count` is 8, so the compile-time and test checks hold the new number.
2. **Nothing else changes.** Three designs per submission (`conceptsShown`), the selector and the preview renderer stay as they are. The renderer never had a case for the two placeholders.
3. **Two visits, then a call.** The owner confirmed on 26 September 2026 that a returning address gets two visits of three designs, six in all, and no more before buying. Each design costs model calls, and six are enough to show what the studio can do. Every template accepts either logo polarity, so every address gets both visits in full. A third submission leaves two unseen, fewer than three, so the selector returns nothing and the pipeline ends before the brief, the copy and the image ranking (`lib/inngest/functions/build-concepts.ts`): the third visit costs no model calls and shows the book-a-call state.
4. **"Will it look like everyone else's?" is not asked.** The owner's reasoning: the designs are samples of what the studio can do, far from the final design. The hired site is designed from scratch around the client's brand, so the question does not apply to what the visitor is buying.

## Consequences

- The page does not change. Its copy is driven by the number of ready templates, which was already eight.
- The third straight answer loses its "Up to nine in all." variant (`SECOND_VISIT.fromNine`), which could no longer render and would contradict decision 3. The copy test now checks that no variant counts past the second visit.
- The cap is not a setting. It follows from eight templates at three a visit, so a ninth template would allow a third visit. Adding one needs an explicit cap on the number of visits first.
- The cap is per email address, the identity the `seen` table keys on. A visitor who uses a new address starts again, limited only by the rate limits (`CONFIG.rateLimit`: five submissions per IP an hour).
- `docs/standards.md` still says ten. This record is the deviation, as ADR 0002 asks. Earlier ADRs, plans and research notes that mention ten templates, `t09` and `t10`, or the "everyone else's" answer are records of their time and are left as they are.
