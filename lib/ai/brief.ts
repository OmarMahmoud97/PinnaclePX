import 'server-only'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { anthropic } from '@/lib/ai/client'
import { briefPrompt, SYSTEM_PROMPT } from '@/lib/ai/prompts'
import type { SubmissionAnswers } from '@/lib/brief/submission'
import { CONFIG } from '@/lib/config'
import { type BrandBrief, briefSchema } from '@/lib/copy-slots/brief'
import { AppError } from '@/lib/errors'
import { log } from '@/lib/log'

// The brief stage's model call: the owner's sentence into the raw material every template's
// copy is written from. Throws on anything short of a parsed brief, and the stage falls back.
export async function writeBrief(answers: SubmissionAnswers, slug: string): Promise<BrandBrief> {
  const response = await anthropic.messages.parse(
    {
      model: CONFIG.ai.models.brief,
      max_tokens: CONFIG.ai.maxTokens.brief,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: briefPrompt(answers) }],
      thinking: { type: 'disabled' },
      output_config: { format: zodOutputFormat(briefSchema) },
    },
    { timeout: CONFIG.stageBudgetMs.brief },
  )
  log.info('ai.call', {
    slug,
    stage: 'brief',
    model: response.model,
    stop: response.stop_reason ?? 'none',
    input: response.usage.input_tokens,
    cached: response.usage.cache_read_input_tokens ?? 0,
    output: response.usage.output_tokens,
  })
  if (response.parsed_output === null) {
    throw new AppError(`The brief call ended with ${response.stop_reason ?? 'no output'}`)
  }
  // The company name is the owner's, whatever the model echoed.
  return { ...response.parsed_output, company: answers.company }
}
