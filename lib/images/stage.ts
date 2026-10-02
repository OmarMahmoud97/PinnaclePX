import 'server-only'
import { rankPhotos } from '@/lib/ai/rank'
import { readUpload } from '@/lib/blob/read-upload'
import type { SubmissionAnswers } from '@/lib/brief/submission'
import { CONFIG } from '@/lib/config'
import type { SlotImage } from '@/lib/copy-slots/assets'
import type { BrandBrief } from '@/lib/copy-slots/brief'
import type { TemplateContract } from '@/lib/copy-slots/contract'
import { download } from '@/lib/download'
import { givenWords, stockAlt } from '@/lib/images/alt'
import type { SizedCandidate } from '@/lib/images/candidates'
import { PexelsQuotaError, searchPhotos } from '@/lib/images/pexels'
import {
  optionalSlots,
  orderByVerdict,
  planImagery,
  type SlotPlan,
  stockFreeSlots,
} from '@/lib/images/plan'
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

type ImageryOutcome = Readonly<{ imagery: SubmissionImagery }> & Empties

type SearchStep = Extract<SlotPlan, { kind: 'search' }>

// One template's plan, by slot name.
type TemplatePlan = Readonly<{ templateId: string; plan: Readonly<Record<string, SlotPlan>> }>

// What a search slot was given: its stock picture, null when the page has shown every candidate,
// or the failure its searches ended in.
type Choice = PromiseSettledResult<SizedCandidate | null>

// The calls the templates of one submission share. Every template takes the same queries from
// the brief, so a search, its ranking and a re-host each run once per distinct key and every
// other template waits on the same promise; otherwise each template repeats the others' calls,
// against the model's bill and the search quota.
type Shared = Readonly<{
  // By query.
  searches: Map<string, Promise<SizedCandidate[]>>
  // By query and purpose: the same candidates are judged again for a different purpose.
  rankings: Map<string, Promise<SizedCandidate[]>>
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

// The imagery stage: the plan for every template's slots, the stock picture for each of them,
// chosen together, then each slot filled. A slot that fails ends null, and the template draws
// without it. Nothing here throws to the stage: a picture is never the reason a page does not
// appear.
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
  const plans = contracts.map(({ meta, imageSlots }) => ({
    templateId: meta.id,
    plan: planImagery(imageSlots, answers, brief, stockFreeSlots(meta.id)),
  }))
  const choices = await chooseInOrder(plans, slug, shared)
  const given = givenWords(answers, brief)
  const results = await Promise.all(
    plans.map((plan) => templateImagery(plan, choices, given, slug, shared)),
  )
  return {
    imagery: Object.fromEntries(
      plans.map(({ templateId }, index) => [templateId, results[index]?.imagery ?? {}]),
    ),
    unfilled: results.flatMap((result) => result.unfilled),
    exhausted: results.some((result) => result.exhausted),
  }
}

// One template's slots.
async function templateImagery(
  { templateId, plan }: TemplatePlan,
  choices: ReadonlyMap<string, Choice>,
  given: ReadonlySet<string>,
  slug: string,
  shared: Shared,
): Promise<Readonly<{ imagery: TemplateImagery }> & Empties> {
  const unfilled: string[] = []
  let exhausted = false
  const entries = await Promise.all(
    Object.entries(plan).map(async ([slot, step]): Promise<[string, SlotImage | null]> => {
      try {
        return [slot, await fill(step, choices.get(`${templateId}.${slot}`), given, shared)]
      } catch (error) {
        if (error instanceof PexelsQuotaError) exhausted = true
        else unfilled.push(`${templateId}.${slot}`)
        log.warn('imagery.slot_empty', {
          slug,
          template: templateId,
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
// any, or every query's pictures together for a detail pool (lib/images/plan.ts), judged by
// the ranking model, or left in Pexels' order if the judging fails. A search that fails lets
// the next query try; when none found anything, the last failure is the slot's.
function orderedCandidates(
  step: SearchStep,
  slug: string,
  shared: Shared,
): Promise<SizedCandidate[]> {
  return once(shared.rankings, `${step.queries.join('\n')}\n${step.purpose}`, async () => {
    let candidates: SizedCandidate[] = []
    let failure: unknown
    for (const query of step.queries) {
      let found: SizedCandidate[]
      try {
        found = await once(shared.searches, query, () => searchPhotos(query))
      } catch (error) {
        failure = error
        continue
      }
      if (step.union) {
        const seen = new Set(candidates.map((c) => c.id))
        candidates = [...candidates, ...found.filter((c) => !seen.has(c.id))]
        continue
      }
      candidates = found
      if (candidates.length > 0) break
    }
    if (candidates.length === 0) {
      if (failure !== undefined) {
        throw failure instanceof Error ? failure : new Error('The search failed')
      }
      return []
    }
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

// The stock picture for every search slot of the submission, by template.slot. Every search and
// ranking starts at once and is shared by the designs as before; the choices wait until all have
// answered, so they are made in one order: first every slot each design is sure to draw, design
// by design and slot by slot, then the pictures of the items past the copy's minimum count
// (optionalSlots). The imagery runs beside the copy and cannot know how many items a design will
// draw, so this way no picture goes to an item a design may leave out while a slot it does draw
// goes without, or repeats another design's (decision 7a).
async function chooseInOrder(
  plans: readonly TemplatePlan[],
  slug: string,
  shared: Shared,
): Promise<ReadonlyMap<string, Choice>> {
  const searches = plans.flatMap(({ templateId, plan }) =>
    Object.entries(plan).flatMap(([slot, step]) =>
      step.kind === 'search'
        ? [{ templateId, slot, step, optional: optionalSlots(templateId).includes(slot) }]
        : [],
    ),
  )
  const order = [...searches.filter((s) => !s.optional), ...searches.filter((s) => s.optional)]
  const ranked = await Promise.allSettled(
    order.map(({ step }) => orderedCandidates(step, slug, shared)),
  )
  const choices = new Map<string, Choice>()
  ranked.forEach((result, index) => {
    const search = order[index]
    if (search === undefined) return
    choices.set(
      `${search.templateId}.${search.slot}`,
      result.status === 'rejected'
        ? result
        : { status: 'fulfilled', value: choose(result.value, search.templateId, shared) },
    )
  })
  return choices
}

// The picture for a slot: the best-ranked candidate no design has taken, so the designs differ
// where the search allows; when every candidate is taken, the best one this page has not
// shown, so a picture is shared across designs before it is ever repeated on one page. Null
// when this page has shown them all.
function choose(
  ordered: readonly SizedCandidate[],
  templateId: string,
  shared: Shared,
): SizedCandidate | null {
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

// The picture for one slot, re-hosted: the visitor's own photograph with its alt, or the chosen
// stock picture with Pexels' alt where the alt rule keeps it (lib/images/alt.ts).
async function fill(
  step: SlotPlan,
  choice: Choice | undefined,
  given: ReadonlySet<string>,
  shared: Shared,
): Promise<SlotImage | null> {
  if (step.kind === 'none') return null
  if (step.kind === 'own') {
    return once(shared.hosted, step.url, async () => {
      const { bytes, sha } = await readUpload(step.url)
      return rehostImage({ bytes, key: `own-${sha}`, alt: step.alt, credit: null })
    })
  }
  if (choice?.status === 'rejected') {
    throw choice.reason instanceof Error ? choice.reason : new Error('The search failed')
  }
  const candidate = choice?.value ?? null
  if (candidate === null) return null
  const key = `pexels-${String(candidate.id)}`
  return once(shared.hosted, key, async () =>
    rehostImage({
      bytes: await download(candidate.source, CONFIG.timeoutMs.download),
      key,
      alt: stockAlt(candidate.alt, given),
      credit: { photographer: candidate.photographer, url: candidate.photographerUrl },
    }),
  )
}
