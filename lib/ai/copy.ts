import 'server-only'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'
import { anthropic } from '@/lib/ai/client'
import { parseJsonAnswer, skeletonOf } from '@/lib/ai/json'
import { copyPrompt, retryPrompt, SYSTEM_PROMPT } from '@/lib/ai/prompts'
import { noteModelCall } from '@/lib/ai/usage'
import { CONFIG } from '@/lib/config'
import type { BrandBrief } from '@/lib/copy-slots/brief'
import type { TemplateContract } from '@/lib/copy-slots/contract'
import { type CopyViolation, fromSlotViolation, ruleViolationsIn } from '@/lib/copy-slots/rules'
import { err, ok, type Result } from '@/lib/errors'
import { log } from '@/lib/log'

type Input = Readonly<{
  brief: BrandBrief
  contract: TemplateContract
  // The owner's own sentence: with the company name, what the copy may quote numbers and claims
  // from.
  ownersWords: string
  slug: string
}>

// The copy stage's model call for one template: every text slot in the template's own schema,
// asked for as JSON of the schema's skeleton and checked with the schema (lib/ai/json.ts; the
// API refuses the compiled grammar of the larger templates). The model does not honour lengths,
// so the answer is judged by the template's own limits and the copy rules; a miss, of shape or
// of limits, is sent back once with what went wrong. A second miss is returned as the
// violations, and the caller falls back. A network or API failure throws.
export async function writeCopy({
  brief,
  contract,
  ownersWords,
  slug,
}: Input): Promise<Result<unknown, readonly CopyViolation[]>> {
  const messages: MessageParam[] = [
    {
      role: 'user',
      content: copyPrompt(
        brief,
        contract.meta.name,
        contract.guide,
        skeletonOf(contract.copySchema),
      ),
    },
  ]
  // The owner's words are the allow-list (ADR 0011): the sentence, and the company name, which
  // every page carries, so a name like A1 Plumbing is not a number the model invented.
  const ownersText = `${brief.company}
${ownersWords}`
  let violations: readonly CopyViolation[] = []
  for (let attempt = 0; attempt <= CONFIG.copy.retries; attempt += 1) {
    const response = await anthropic.messages.create(
      {
        model: CONFIG.ai.models.copy,
        max_tokens: CONFIG.ai.maxTokens.copy,
        system: SYSTEM_PROMPT,
        messages,
        thinking: { type: 'disabled' },
      },
      { timeout: CONFIG.stageBudgetMs.copy },
    )
    await noteModelCall(response, { slug, stage: 'copy', template: contract.meta.id, attempt })
    const text = response.content.map((block) => (block.type === 'text' ? block.text : '')).join('')
    if (response.stop_reason !== 'end_turn' || text === '') {
      return err([
        { path: '', reason: `the call ended with ${response.stop_reason ?? 'no output'}` },
      ])
    }
    const parsed = parseJsonAnswer(text, contract.copySchema)
    violations = parsed.ok
      ? [
          ...contract.copyViolations(parsed.value).map(fromSlotViolation),
          ...ruleViolationsIn(parsed.value, ownersText),
        ]
      : parsed.reason
    if (parsed.ok && violations.length === 0) return ok(parsed.value)
    log.warn('copy.violations', {
      slug,
      template: contract.meta.id,
      attempt,
      count: violations.length,
    })
    messages.push(
      { role: 'assistant', content: text },
      { role: 'user', content: retryPrompt(violations) },
    )
  }
  return err(violations)
}
