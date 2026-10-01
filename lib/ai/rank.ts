import 'server-only'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import type { ContentBlockParam } from '@anthropic-ai/sdk/resources/messages'
import * as z from 'zod'
import { anthropic } from '@/lib/ai/client'
import { RANK_SYSTEM_PROMPT, rankPrompt } from '@/lib/ai/prompts'
import { noteModelCall } from '@/lib/ai/usage'
import { CONFIG } from '@/lib/config'
import { AppError } from '@/lib/errors'
import { log } from '@/lib/log'

type Judged = Readonly<{ id: number; score: number; reject: string | null }>

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
// The photographs are numbered 1 to n in the prompt, not by their Pexels ids: a position is
// one token the model cannot misquote, and the verdicts are mapped back to the ids here. A
// verdict naming no position is logged and dropped, so an unjudged picture is never taken for
// an accepted one (lib/images/plan.ts puts it last).
export async function rankPhotos(
  candidates: readonly Candidate[],
  purpose: string,
  slug: string,
): Promise<Judged[]> {
  const content: ContentBlockParam[] = [
    { type: 'text', text: rankPrompt(purpose) },
    ...candidates.flatMap((candidate, index): ContentBlockParam[] => [
      { type: 'text', text: `id ${String(index + 1)}` },
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
  await noteModelCall(response, { slug, stage: 'rank' })
  if (response.parsed_output === null) throw new AppError('The ranking call returned no verdict')
  const judged: Judged[] = []
  for (const verdict of response.parsed_output.photos) {
    const candidate = Number.isInteger(verdict.id) ? candidates[verdict.id - 1] : undefined
    if (candidate === undefined) {
      log.warn('rank.unmatched', { slug, id: verdict.id })
      continue
    }
    judged.push({ id: candidate.id, score: verdict.score, reject: verdict.reject })
  }
  return judged
}
