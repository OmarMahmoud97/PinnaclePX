import 'server-only'
import { rankPhotos } from '@/lib/ai/rank'
import type { SubmissionAnswers } from '@/lib/brief/submission'
import { uploadShaOf } from '@/lib/brief/uploads'
import type { SlotImage } from '@/lib/copy-slots/assets'
import type { BrandBrief } from '@/lib/copy-slots/brief'
import type { TemplateContract } from '@/lib/copy-slots/contract'
import type { Candidate } from '@/lib/images/candidates'
import { searchPhotos } from '@/lib/images/pexels'
import { orderByVerdict, planImagery, type SlotPlan } from '@/lib/images/plan'
import { rehostImage } from '@/lib/images/rehost'
import { log } from '@/lib/log'

export type TemplateImagery = Readonly<Record<string, SlotImage | null>>

// The imagery stage for one template: the plan for its slots, then each slot filled. A search
// runs once per query, its candidates judged by the ranking model, or left in Pexels' order if
// the judging fails; the first that re-hosts is the slot's picture. A slot that fails ends null,
// and the template draws without it. Nothing here throws to the stage: a picture is never the
// reason a page does not appear.
export async function imageryFor(
  contract: TemplateContract,
  answers: SubmissionAnswers,
  brief: BrandBrief,
  slug: string,
): Promise<TemplateImagery> {
  const plan = planImagery(contract.imageSlots, answers, brief)
  const searches = new Map<string, Promise<Candidate[]>>()
  const used = new Set<number>()
  const entries = await Promise.all(
    Object.entries(plan).map(async ([slot, step]): Promise<[string, SlotImage | null]> => {
      try {
        return [slot, await fill(step, searches, used, slug)]
      } catch (error) {
        log.warn('imagery.slot_empty', {
          slug,
          template: contract.meta.id,
          slot,
          reason: error instanceof Error ? error.message : 'unknown',
        })
        return [slot, null]
      }
    }),
  )
  return Object.fromEntries(entries)
}

async function fill(
  step: SlotPlan,
  searches: Map<string, Promise<Candidate[]>>,
  used: Set<number>,
  slug: string,
): Promise<SlotImage | null> {
  if (step.kind === 'none') return null
  if (step.kind === 'own') {
    return rehostImage({
      sourceUrl: step.url,
      key: `own-${uploadShaOf(step.url) ?? slug}`,
      alt: step.alt,
      credit: null,
    })
  }
  let search = searches.get(step.query)
  if (search === undefined) {
    search = searchPhotos(step.query)
    searches.set(step.query, search)
  }
  const candidates = await search
  if (candidates.length === 0) return null
  let verdicts: Awaited<ReturnType<typeof rankPhotos>> | null = null
  try {
    verdicts = await rankPhotos(candidates, step.purpose, slug)
  } catch (error) {
    log.warn('rank.fallback', { slug, reason: error instanceof Error ? error.message : 'unknown' })
  }
  for (const candidate of orderByVerdict(candidates, verdicts)) {
    if (used.has(candidate.id)) continue
    used.add(candidate.id)
    return rehostImage({
      sourceUrl: candidate.source,
      key: `pexels-${String(candidate.id)}`,
      alt: candidate.alt,
      credit: { photographer: candidate.photographer, url: candidate.photographerUrl },
    })
  }
  return null
}
