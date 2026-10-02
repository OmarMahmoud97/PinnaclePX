import type { SubmissionAnswers } from '@/lib/brief/submission'
import { fallbackBrief } from '@/lib/copy-slots/brief'
import { optionalSlots, orderByVerdict, planImagery, stockFreeSlots } from '@/lib/images/plan'

const BLOB = 'https://x.public.blob.vercel-storage.com/photos'
const ANSWERS: SubmissionAnswers = {
  description: 'Physiotherapy clinic in Sheffield. Sports injuries and post-op rehab.',
  company: 'Ashgrove Physio',
  logo: { kind: 'wordmark' },
  imagery: { style: 'warm', photos: [] },
  colours: { kind: 'palette', paletteId: 'forest' },
}
const BRIEF = {
  ...fallbackBrief(ANSWERS.company, ANSWERS.description),
  imageQueries: { hero: ['physiotherapy treatment room', 'clinic'], detail: ['', 'exercise band'] },
}

describe('planImagery', () => {
  it('searches for every slot when the visitor added no photographs', () => {
    const plan = planImagery(['hero', 'statement'], ANSWERS, BRIEF)
    expect(plan.hero).toMatchObject({
      kind: 'search',
      queries: ['physiotherapy treatment room natural light', 'clinic natural light'],
      union: false,
    })
    // A blank query is dropped; the rest keep the brief's order. A detail slot takes every
    // query's pictures.
    expect(plan.statement).toMatchObject({
      kind: 'search',
      queries: ['exercise band natural light'],
      union: true,
    })
    if (plan.hero?.kind === 'search') expect(plan.hero.purpose).toContain('Ashgrove Physio')
  })

  it("uses the visitor's own photographs in order, and plans the slots after them as without", () => {
    const photos = [
      { fileName: 'a.jpg', url: `${BLOB}/a.jpg` },
      { fileName: 'b.jpg', url: `${BLOB}/b.jpg` },
    ]
    const slots = ['hero', 'statement', 'third', 'fourth']
    const plan = planImagery(slots, { ...ANSWERS, imagery: { style: 'warm', photos } }, BRIEF)
    expect(plan.hero).toEqual({
      kind: 'own',
      url: `${BLOB}/a.jpg`,
      alt: 'Ashgrove Physio, photograph',
    })
    expect(plan.statement).toMatchObject({ kind: 'own', url: `${BLOB}/b.jpg` })
    // The same detail search, pool and purpose a visitor without photographs gets for them.
    const without = planImagery(slots, ANSWERS, BRIEF)
    expect(plan.third).toEqual(without.third)
    expect(plan.fourth).toEqual(without.fourth)
    expect(plan.third).toMatchObject({
      kind: 'search',
      queries: ['exercise band natural light'],
      union: true,
    })
  })

  it('leaves a slot empty when the brief has no query for it, with photographs or without', () => {
    const brief = { ...BRIEF, imageQueries: { hero: [' '], detail: [] } }
    expect(planImagery(['hero'], ANSWERS, brief).hero).toEqual({ kind: 'none' })
    const photos = [{ fileName: 'a.jpg', url: `${BLOB}/a.jpg` }]
    const plan = planImagery(
      ['hero', 'statement'],
      { ...ANSWERS, imagery: { style: 'warm', photos } },
      brief,
    )
    expect(plan.statement).toEqual({ kind: 'none' })
  })

  it('searches for no stock-free slot, but puts an own photograph there as before', () => {
    const slots = ['about', 'services', 'quote', 'profile']
    const plan = planImagery(slots, ANSWERS, BRIEF, ['quote', 'profile'])
    expect(plan.services).toMatchObject({ kind: 'search' })
    expect(plan.quote).toEqual({ kind: 'none' })
    expect(plan.profile).toEqual({ kind: 'none' })

    const photos = ['a', 'b', 'c'].map((name) => ({
      fileName: `${name}.jpg`,
      url: `${BLOB}/${name}.jpg`,
    }))
    const own = planImagery(slots, { ...ANSWERS, imagery: { style: 'warm', photos } }, BRIEF, [
      'quote',
      'profile',
    ])
    expect(own.quote).toEqual({
      kind: 'own',
      url: `${BLOB}/c.jpg`,
      alt: 'Ashgrove Physio, photograph',
    })
    expect(own.profile).toEqual({ kind: 'none' })
  })
})

describe('optionalSlots and stockFreeSlots', () => {
  it("read a template's lists, and give a template with none an empty list", () => {
    expect(optionalSlots('t08-vector')).toEqual(['project-3', 'project-4'])
    expect(stockFreeSlots('t02-monolith')).toEqual(['quote', 'profile'])
    expect(optionalSlots('t01-aurora')).toEqual([])
    expect(stockFreeSlots('t01-aurora')).toEqual([])
  })
})

describe('orderByVerdict', () => {
  const candidates = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]

  it('drops the rejected and sorts by score, keeping search order for ties', () => {
    const ordered = orderByVerdict(candidates, [
      { id: 1, score: 5, reject: null },
      { id: 2, score: 9, reject: 'watermark' },
      { id: 3, score: 8, reject: null },
      { id: 4, score: 8, reject: null },
    ])
    expect(ordered.map((c) => c.id)).toEqual([3, 4, 1])
  })

  it('keeps the search order without a ranking, and puts unjudged candidates last', () => {
    expect(orderByVerdict(candidates, null).map((c) => c.id)).toEqual([1, 2, 3, 4])
    expect(
      orderByVerdict(candidates, [{ id: 2, score: 9, reject: null }]).map((c) => c.id),
    ).toEqual([2, 1, 3, 4])
    // A judged candidate, however low its score, comes before one the judge never mentioned.
    expect(
      orderByVerdict(candidates, [{ id: 3, score: 0, reject: null }]).map((c) => c.id),
    ).toEqual([3, 1, 2, 4])
  })
})
