import 'server-only'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import type { ContentBlockParam } from '@anthropic-ai/sdk/resources/messages'
import { z } from 'zod/v4'
import { anthropic } from '@/lib/ai/client'
import { CONFIG } from '@/lib/config'
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

const SYSTEM = `You judge stock photographs for a small business's homepage. For each photograph, give a score from 0 to 10 for how well it would serve the stated purpose, and a reason to reject it if it has any of these: a watermark, visible text or a logo, a busy composition with no clear subject, a single identifiable person's face as the subject, or nothing to do with the purpose. Otherwise reject is null. Prefer real places and work being done, natural light, and room for words. Answer only with JSON in the schema.`

type Candidate = Readonly<{ id: number; thumbnail: string }>

// Haiku 4.5 looks at the thumbnails and scores them. The caller sorts and drops the rejected.
// Throws on anything short of a parsed answer, and the caller keeps the search's own order.
export async function rankPhotos(
  candidates: readonly Candidate[],
  purpose: string,
  slug: string,
): Promise<Judged[]> {
  const content: ContentBlockParam[] = [
    { type: 'text', text: `Purpose: ${purpose}\nThe photographs, each preceded by its id:` },
    ...candidates.flatMap((candidate): ContentBlockParam[] => [
      { type: 'text', text: `id ${String(candidate.id)}` },
      { type: 'image', source: { type: 'url', url: candidate.thumbnail } },
    ]),
  ]
  const response = await anthropic.messages.parse(
    {
      model: CONFIG.ai.models.rank,
      max_tokens: CONFIG.ai.maxTokens.rank,
      system: SYSTEM,
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
  if (response.parsed_output === null) throw new Error('The ranking call returned no verdict')
  return response.parsed_output.photos
}
