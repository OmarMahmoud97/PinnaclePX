import 'server-only'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import type { ContentBlockParam } from '@anthropic-ai/sdk/resources/messages'
import * as z from 'zod'
import { anthropic } from '@/lib/ai/client'
import { RANK_SYSTEM_PROMPT, rankPrompt } from '@/lib/ai/prompts'
import { CONFIG } from '@/lib/config'
import { AppError } from '@/lib/errors'
import { log } from '@/lib/log'

export type Judged = Readonly<{ id: number; score: number; reject: string | null }>

const verdictSchema = z.object({
  photos: z.array(
    z.object({
      id: z.number(),
      // 0 to 10: how well the photograph would sit on the page for this purpose.
      score: z.number(),
      // Why it must not be used, or null.
      reject: z.string().nullable(),
    }),
  ),
})

type Candidate = Readonly<{ id: number; thumbnail: string }>

// Haiku 4.5 looks at the thumbnails and scores them. The caller sorts and drops the rejected.
// Throws on anything short of a parsed answer, and the caller keeps the search's own order.
export async function rankPhotos(
  candidates: readonly Candidate[],
  purpose: string,
  slug: string,
): Promise<Judged[]> {
  const content: ContentBlockParam[] = [
    { type: 'text', text: rankPrompt(purpose) },
    ...candidates.flatMap((candidate): ContentBlockParam[] => [
      { type: 'text', text: `id ${String(candidate.id)}` },
      { type: 'image', source: { type: 'url', url: candidate.thumbnail } },
    ]),
  ]
  const response = await anthropic.messages.parse(
    {
      model: CONFIG.ai.models.rank,
      max_tokens: CONFIG.ai.maxTokens.rank,
      system: RANK_SYSTEM_PROMPT,
      messages: [{ role: 'user', content }],
      output_config: { format: zodOutputFormat(verdictSchema) },
    },
    { timeout: CONFIG.stageBudgetMs.rank },
  )
  log.info('ai.call', {
    slug,
    stage: 'rank',
    model: response.model,
    stop: response.stop_reason ?? 'none',
    input: response.usage.input_tokens,
    output: response.usage.output_tokens,
  })
  if (response.parsed_output === null) throw new AppError('The ranking call returned no verdict')
  return response.parsed_output.photos
}
