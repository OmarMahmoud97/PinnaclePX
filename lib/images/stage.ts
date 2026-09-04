import 'server-only'
import { rankPhotos } from '@/lib/ai/rank'
import { readUpload } from '@/lib/blob/read-upload'
import type { SubmissionAnswers } from '@/lib/brief/submission'
import { CONFIG } from '@/lib/config'
import type { SlotImage } from '@/lib/copy-slots/assets'
import type { BrandBrief } from '@/lib/copy-slots/brief'
import type { TemplateContract } from '@/lib/copy-slots/contract'
import { download } from '@/lib/download'
import type { Candidate } from '@/lib/images/candidates'
import { PexelsQuotaError, searchPhotos } from '@/lib/images/pexels'
import { orderByVerdict, planImagery, type SlotPlan } from '@/lib/images/plan'
import { rehostImage } from '@/lib/images/rehost'
import { log } from '@/lib/log'

type TemplateImagery = Readonly<Record<string, SlotImage | null>>

// Per template id, what the imagery stage found for its slots.
type SubmissionImagery = Readonly<Record<string, TemplateImagery>>

type Empties = Readonly<{
  // Slots left empty by a failure worth another attempt, as template.slot.
  unfilled: readonly string[]
  // True when a slot was left empty because the search quota is spent: nothing will fill it
  // before the deadline, so the stage settles as fallback rather than wait for the sweeper.
  exhausted: boolean
}>

export type ImageryOutcome = Readonly<{ imagery: SubmissionImagery }> & Empties

type SearchStep = Extract<SlotPlan, { kind: 'search' }>

// The calls the templates of one submission share. Every template takes the same queries from
// the brief, so a search, its ranking and a re-host each run once per distinct key and every
// other template waits on the same promise; otherwise each template repeats the others' calls,
// against the model's bill and the search quota.
type Shared = Readonly<{
  // By query.
  searches: Map<string, Promise<Candidate[]>>
  // By query and purpose: the same candidates are judged again for a different purpose.
  rankings: Map<string, Promise<Candidate[]>>
  // By what names the picture: the upload's URL, or the Pexels id.
  hosted: Map<string, Promise<SlotImage>>
  // Which templates have taken each Pexels picture, so the designs differ where they can.
  taken: Map<number, Set<string>>
}>

function once<T>(cache: Map<string, Promise<T>>, key: string, work: () => Promise<T>): Promise<T> {
  const pending = cache.get(key)
  if (pending !== undefined) return pending
  const started = work()
  cache.set(key, started)
  return started
}

// What the stage needs of a template: which it is, and which slots it draws.
export type ImageContract = Pick<TemplateContract, 'meta' | 'imageSlots'>

// The imagery stage: for each template, the plan for its slots, then each slot filled. A slot
// that fails ends null, and the template draws without it. Nothing here throws to the stage: a
// picture is never the reason a page does not appear.
export async function imageryFor(
  contracts: readonly ImageContract[],
  answers: SubmissionAnswers,
  brief: BrandBrief,
  slug: string,
): Promise<ImageryOutcome> {
  const shared: Shared = {
    searches: new Map(),
    rankings: new Map(),
    hosted: new Map(),
    taken: new Map(),
  }
  const results = await Promise.all(
    contracts.map((contract) => templateImagery(contract, answers, brief, slug, shared)),
  )
  return {
    imagery: Object.fromEntries(
      contracts.map((contract, index) => [contract.meta.id, results[index]?.imagery ?? {}]),
    ),
    unfilled: results.flatMap((result) => result.unfilled),
    exhausted: results.some((result) => result.exhausted),
  }
}

// One template's slots.
async function templateImagery(
  contract: ImageContract,
  answers: SubmissionAnswers,
  brief: BrandBrief,
  slug: string,
  shared: Shared,
): Promise<Readonly<{ imagery: TemplateImagery }> & Empties> {
  const plan = planImagery(contract.imageSlots, answers, brief)
  const unfilled: string[] = []
  let exhausted = false
  const entries = await Promise.all(
    Object.entries(plan).map(async ([slot, step]): Promise<[string, SlotImage | null]> => {
      try {
        return [slot, await fill(step, contract.meta.id, slug, shared)]
      } catch (error) {
        if (error instanceof PexelsQuotaError) exhausted = true
        else unfilled.push(`${contract.meta.id}.${slot}`)
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
  return { imagery: Object.fromEntries(entries), unfilled, exhausted }
}

// The candidates for a slot, in the order to try them: the first of its queries that finds
// any, judged by the ranking model, or left in Pexels' order if the judging fails.
function orderedCandidates(step: SearchStep, slug: string, shared: Shared): Promise<Candidate[]> {
  return once(shared.rankings, `${step.queries.join('\n')}\n${step.purpose}`, async () => {
    let candidates: Candidate[] = []
    for (const query of step.queries) {
      candidates = await once(shared.searches, query, () => searchPhotos(query))
      if (candidates.length > 0) break
    }
    if (candidates.length === 0) return []
    let verdicts: Awaited<ReturnType<typeof rankPhotos>> | null = null
    try {
      verdicts = await rankPhotos(candidates, step.purpose, slug)
    } catch (error) {
      log.warn('rank.fallback', {
        slug,
        reason: error instanceof Error ? error.message : 'unknown',
      })
    }
    return orderByVerdict(candidates, verdicts)
  })
}

// The picture for a slot: the best-ranked candidate no design has taken, so the designs differ
// where the search allows; when every candidate is taken, the best one this page has not
// shown, so a picture is shared across designs before it is ever repeated on one page. Null
// when this page has shown them all.
function choose(
  ordered: readonly Candidate[],
  templateId: string,
  shared: Shared,
): Candidate | null {
  const candidate =
    ordered.find((c) => !shared.taken.has(c.id)) ??
    ordered.find((c) => shared.taken.get(c.id)?.has(templateId) !== true) ??
    null
  if (candidate === null) return null
  const takers = shared.taken.get(candidate.id) ?? new Set<string>()
  takers.add(templateId)
  shared.taken.set(candidate.id, takers)
  return candidate
}

async function fill(
  step: SlotPlan,
  templateId: string,
  slug: string,
  shared: Shared,
): Promise<SlotImage | null> {
  if (step.kind === 'none') return null
  if (step.kind === 'own') {
    return once(shared.hosted, step.url, async () => {
      const { bytes, sha } = await readUpload(step.url)
      return rehostImage({ bytes, key: `own-${sha}`, alt: step.alt, credit: null })
    })
  }
  const candidate = choose(await orderedCandidates(step, slug, shared), templateId, shared)
  if (candidate === null) return null
  const key = `pexels-${String(candidate.id)}`
  return once(shared.hosted, key, async () =>
    rehostImage({
      bytes: await download(candidate.source, CONFIG.timeoutMs.download),
      key,
      alt: candidate.alt,
      credit: { photographer: candidate.photographer, url: candidate.photographerUrl },
    }),
  )
}
