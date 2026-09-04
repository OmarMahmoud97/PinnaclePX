import 'server-only'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { anthropic } from '@/lib/ai/client'
import { copyPrompt, retryPrompt, SYSTEM_PROMPT } from '@/lib/ai/prompts'
import { CONFIG } from '@/lib/config'
import type { BrandBrief } from '@/lib/copy-slots/brief'
import type { TemplateContract } from '@/lib/copy-slots/contract'
import { type CopyViolation, fromSlotViolation, ruleViolationsIn } from '@/lib/copy-slots/rules'
import { err, ok, type Result } from '@/lib/errors'
import { log } from '@/lib/log'

type Input = Readonly<{
  brief: BrandBrief
  contract: TemplateContract
  // The owner's own sentence: what the copy may quote numbers and claims from.
  ownersWords: string
  slug: string
}>

// The copy stage's model call for one template: every text slot in the template's own schema.
// The model does not honour lengths, so the answer is judged by the template's own limits and
// the copy rules; a miss is sent back once with what went wrong. A second miss is returned as
// the violations, and the caller falls back. A network or API failure throws.
export async function writeCopy({
  brief,
  contract,
  ownersWords,
  slug,
}: Input): Promise<Result<unknown, readonly CopyViolation[]>> {
  const messages: MessageParam[] = [
    { role: 'user', content: copyPrompt(brief, contract.meta.name, contract.guide) },
  ]
  let violations: CopyViolation[] = []
  for (let attempt = 0; attempt <= CONFIG.copy.retries; attempt += 1) {
    const response = await anthropic.messages.parse(
      {
        model: CONFIG.ai.models.copy,
        max_tokens: CONFIG.ai.maxTokens.copy,
        system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
        messages,
        thinking: { type: 'disabled' },
        output_config: { format: zodOutputFormat(contract.copySchema) },
      },
      { timeout: CONFIG.stageBudgetMs.copy },
    )
    log.info('ai.call', {
      slug,
      stage: 'copy',
      template: contract.meta.id,
      attempt,
      model: response.model,
      stop: response.stop_reason ?? 'none',
      input: response.usage.input_tokens,
      cached: response.usage.cache_read_input_tokens ?? 0,
      output: response.usage.output_tokens,
    })
    const copy: unknown = response.parsed_output
    if (copy === null) {
      return err([
        { path: '', reason: `the call ended with ${response.stop_reason ?? 'no output'}` },
      ])
    }
    violations = [
      ...contract.copyViolations(copy).map(fromSlotViolation),
      ...ruleViolationsIn(copy, ownersWords),
    ]
    if (violations.length === 0) return ok(copy)
    log.warn('copy.violations', {
      slug,
      template: contract.meta.id,
      attempt,
      count: violations.length,
    })
    messages.push(
      { role: 'assistant', content: JSON.stringify(copy) },
      { role: 'user', content: retryPrompt(violations) },
    )
  }
  return err(violations)
}
