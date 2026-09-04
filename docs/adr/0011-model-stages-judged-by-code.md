# The model stages: shapes from the model, limits and facts judged by code

- Status: accepted
- Date: 4 September 2026
- Plan: `docs/pipeline-plan.md`, section 12

## Context

The build guide's brief and copy stages ask Sonnet 5 for structured output, say the model does not honour length constraints, and require every AI stage to validate, retry once and fall back. The Anthropic structured output API accepts a JSON Schema subset with no `minLength`, `maxLength`, `maxItems` or `minItems` above one, and the SDK's zod helper is typed against `zod/v4`, which zod 3.25 ships beside the v3 API the rest of the code uses.

## Decision

1. **The model gets the shape, the code keeps the limits.** The brief schema and every template's copy schema are written with `zod/v4` and carry no length or count limits. After the model answers, the template's own `copyViolations` (its slot ranges and list counts) and the copy rules judge the answer. A miss is sent back once, as a list of paths and reasons, with the model's own answer as the previous turn; a second miss is the fallback. The brief is not judged for length: only the copy reaches a page.
2. **The owner's words are the allow-list.** `ruleViolationsIn` rejects numbers, superlatives and claims anywhere in the copy, unless the same words appear in the owner's own sentence. What they said about themselves is theirs to say; what they did not say is invented.
3. **Each template is one call.** The copy stage runs one structured call per chosen template, in parallel steps, each judged, retried and fallen back alone, then one write marks the stage `done`, or `fallback` if any template fell back (ADR 0009, decision 4).
4. **The prompt is two parts.** A stable system prompt with the rules, cached; and a user turn built from the company name, the owner's sentence and their chosen look for the brief, or the brief and the template's slot guide for the copy. The guide is built from the template's slot table, so a limit can never drift between the prompt and the check. Nothing personal beyond the company name and the sentence reaches the model.
5. **Effort is medium and thinking is left to the model's default.** The copy is judged afterwards, so the call need not deliberate; the budget is the stage's, enforced by the request timeout.
6. **An identity-linked key names its workspace.** `ANTHROPIC_WORKSPACE_ID` is an optional variable; when set, every request carries the `anthropic-workspace-id` header. A key created inside a workspace needs none.

## Consequences

- `lib/ai/client.ts`, `prompts.ts`, `brief.ts` and `copy.ts`; `lib/copy-slots/rules.ts`; the contract gains `guide`; `runStage` returns what it wrote so the copy stage can use the brief without reading the row again. Every model call logs its model, stop reason and token counts as `ai.call`, never its text.
- Aurora's copy schema lost its `.length(3)`, `.min()` and `.max()` calls; the counts moved into its violations, reported before the slot lengths, because a list of the wrong length cannot be assembled.
- Verified on 4 September 2026 with the model unreachable (the key in `.env.local` lacked its workspace id): the brief and copy stages fell back and the page completed as before. The first real model output is to be reviewed once the id is set.

## Amendments

- 4 September 2026 (PR #16): decision 5 is superseded. Thinking is disabled (`thinking: { type: 'disabled' }`) and no effort is set on the brief and copy calls, because the answers are shapes judged by code afterwards and thinking tokens, billed as output, were most of the copy call's bill. `lib/config.ts` carries the reason beside the model names.
- 4 September 2026 (audit, `docs/audit-plan.md` 4.1): the "cached" in decision 4 never applied. Sonnet 5 caches no prefix under 1,024 tokens (Anthropic SDK reference, June 2026) and the system prompt is about 180, so the `cache_control` marker and the `cached` field of the `ai.call` log were removed. The comment in `lib/ai/prompts.ts` says when to bring the marker back.
