import type { SubmissionAnswers } from '@/lib/brief/submission'
import { fallbackBrief } from '@/lib/copy-slots/brief'
import { orderByVerdict, planImagery } from '@/lib/images/plan'

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
    })
    // A blank query is dropped; the rest keep the brief's order.
    expect(plan.statement).toMatchObject({
      kind: 'search',
      queries: ['exercise band natural light'],
    })
    if (plan.hero?.kind === 'search') expect(plan.hero.purpose).toContain('Ashgrove Physio')
  })

  it("uses the visitor's own photographs in order and searches for nothing", () => {
    const photos = [
      { fileName: 'a.jpg', url: `${BLOB}/a.jpg` },
      { fileName: 'b.jpg', url: `${BLOB}/b.jpg` },
    ]
    const plan = planImagery(
      ['hero', 'statement', 'third'],
      { ...ANSWERS, imagery: { style: 'warm', photos } },
      BRIEF,
    )
    expect(plan.hero).toEqual({
      kind: 'own',
      url: `${BLOB}/a.jpg`,
      alt: 'Ashgrove Physio, photograph',
    })
    expect(plan.statement).toMatchObject({ kind: 'own', url: `${BLOB}/b.jpg` })
    expect(plan.third).toEqual({ kind: 'none' })
  })

  it('leaves a slot empty when the brief has no query for it', () => {
    const brief = { ...BRIEF, imageQueries: { hero: [' '], detail: [] } }
    expect(planImagery(['hero'], ANSWERS, brief).hero).toEqual({ kind: 'none' })
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

  it('keeps the search order without a ranking, and keeps unjudged candidates', () => {
    expect(orderByVerdict(candidates, null).map((c) => c.id)).toEqual([1, 2, 3, 4])
    expect(
      orderByVerdict(candidates, [{ id: 2, score: 9, reject: null }]).map((c) => c.id),
    ).toEqual([2, 1, 3, 4])
  })
})
