import type { SubmissionAnswers } from '@/lib/brief/submission'
import { CONFIG } from '@/lib/config'
import type { BrandBrief } from '@/lib/copy-slots/brief'

// What to put in one image slot: the visitor's own photograph, or a search to run. The first
// slot of a template is its hero and takes the brief's hero queries; the rest take the detail
// queries. Own photographs go to the slots in the order the visitor added them.
export type SlotPlan =
  | Readonly<{ kind: 'own'; url: string; alt: string }>
  | Readonly<{ kind: 'search'; query: string; purpose: string }>
  | Readonly<{ kind: 'none' }>

// The photographs a template needs, by slot name. Pure, so a test can say what a brief gets.
export function planImagery(
  slots: readonly string[],
  answers: SubmissionAnswers,
  brief: BrandBrief,
): Readonly<Record<string, SlotPlan>> {
  const own = answers.imagery.photos
  const modifier = CONFIG.images.styleQuery[answers.imagery.style]
  return Object.fromEntries(
    slots.map((slot, index): [string, SlotPlan] => {
      const photo = own[index]
      if (photo !== undefined) {
        return [slot, { kind: 'own', url: photo.url, alt: `${answers.company}, photograph` }]
      }
      if (own.length > 0) return [slot, { kind: 'none' }]
      const queries = index === 0 ? brief.imageQueries.hero : brief.imageQueries.detail
      const query = queries.find((q) => q.trim() !== '')
      if (query === undefined) return [slot, { kind: 'none' }]
      return [
        slot,
        {
          kind: 'search',
          query: `${query.trim()} ${modifier}`.trim(),
          purpose:
            index === 0
              ? `the main picture on the homepage of ${answers.company}: ${brief.positioning}`
              : `a supporting picture further down the homepage of ${answers.company}: ${brief.positioning}`,
        },
      ]
    }),
  )
}

// The order to try candidates in after ranking: the rejected dropped, the rest by score, and
// the search's own order breaking ties. Without a ranking the search's order stands.
export function orderByVerdict<T extends { id: number }>(
  candidates: readonly T[],
  verdicts: readonly { id: number; score: number; reject: string | null }[] | null,
): T[] {
  if (verdicts === null) return [...candidates]
  const byId = new Map(verdicts.map((v) => [v.id, v]))
  return candidates
    .map((candidate, index) => ({ candidate, index, verdict: byId.get(candidate.id) }))
    .filter(({ verdict }) => verdict?.reject === null || verdict === undefined)
    .sort((a, b) => (b.verdict?.score ?? 0) - (a.verdict?.score ?? 0) || a.index - b.index)
    .map(({ candidate }) => candidate)
}
