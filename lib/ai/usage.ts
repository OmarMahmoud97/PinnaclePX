import 'server-only'
import type { Message } from '@anthropic-ai/sdk/resources/messages'
import { recordModelCall } from '@/lib/db/model-calls'
import { log } from '@/lib/log'

type Call = Readonly<{
  slug: string
  stage: 'brief' | 'copy' | 'rank'
  template?: string
  attempt?: number
}>

// What every model call does once it has an answer: the log line, and a row with the tokens
// it cost, so the owner's notice can say what the submission spent. The tokens were spent
// whatever happens next, so this runs before the answer is judged. A row that cannot be
// written is logged and let go: failing the stage here would spend the call again.
export async function noteModelCall(
  response: Pick<Message, 'model' | 'usage' | 'stop_reason'>,
  call: Call,
): Promise<void> {
  const { usage } = response
  log.info('ai.call', {
    slug: call.slug,
    stage: call.stage,
    ...(call.template === undefined ? {} : { template: call.template }),
    ...(call.attempt === undefined ? {} : { attempt: call.attempt }),
    model: response.model,
    stop: response.stop_reason ?? 'none',
    input: usage.input_tokens,
    output: usage.output_tokens,
  })
  try {
    await recordModelCall({
      slug: call.slug,
      stage: call.stage,
      templateId: call.template ?? null,
      model: response.model,
      inputTokens: usage.input_tokens,
      outputTokens: usage.output_tokens,
      cacheReadTokens: usage.cache_read_input_tokens ?? 0,
      cacheWriteTokens: usage.cache_creation_input_tokens ?? 0,
    })
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'unknown'
    log.error('ai.call.unrecorded', { slug: call.slug, stage: call.stage, reason })
  }
}
