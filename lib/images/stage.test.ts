import { rankPhotos } from '@/lib/ai/rank'
import { readUpload } from '@/lib/blob/read-upload'
import type { SubmissionAnswers } from '@/lib/brief/submission'
import { fallbackBrief } from '@/lib/copy-slots/brief'
import { download } from '@/lib/download'
import type { Candidate } from '@/lib/images/candidates'
import { PexelsQuotaError, searchPhotos } from '@/lib/images/pexels'
import { rehostImage } from '@/lib/images/rehost'
import { type ImageContract, imageryFor } from '@/lib/images/stage'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/ai/rank', () => ({ rankPhotos: vi.fn() }))
vi.mock('@/lib/blob/read-upload', () => ({ readUpload: vi.fn() }))
vi.mock('@/lib/download', () => ({ download: vi.fn() }))
vi.mock('@/lib/images/pexels', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/images/pexels')>()),
  searchPhotos: vi.fn(),
}))
vi.mock('@/lib/images/rehost', () => ({ rehostImage: vi.fn() }))

const BLOB = 'https://x.public.blob.vercel-storage.com'
const SHA = 'b'.repeat(64)

const ANSWERS: SubmissionAnswers = {
  description: 'Physiotherapy clinic in Sheffield. Sports injuries and post-op rehab.',
  company: 'Ashgrove Physio',
  logo: { kind: 'wordmark' },
  imagery: { style: 'warm', photos: [] },
  colours: { kind: 'palette', paletteId: 'forest' },
}
const BRIEF = {
  ...fallbackBrief(ANSWERS.company, ANSWERS.description),
  imageQueries: { hero: ['treatment room'], detail: ['exercise band'] },
}

function contract(id: string, imageSlots: readonly string[]): ImageContract {
  return {
    meta: { id, name: id, description: '', ready: true, polarity: 'either', tones: [] },
    imageSlots,
  }
}

function candidate(id: number): Candidate {
  return {
    id,
    width: 1600,
    height: 900,
    alt: `photo ${String(id)}`,
    photographer: 'A Photographer',
    photographerUrl: 'https://www.pexels.com/@a',
    thumbnail: `https://images.pexels.com/photos/${String(id)}/m.jpg`,
    source: `https://images.pexels.com/photos/${String(id)}/l.jpg`,
  }
}

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  // Two searches, told apart by the words the brief gave each: the hero's and the detail's.
  vi.mocked(searchPhotos)
    .mockReset()
    .mockImplementation((query) =>
      Promise.resolve(
        query.startsWith('treatment room')
          ? [candidate(1), candidate(2)]
          : [candidate(3), candidate(4)],
      ),
    )
  vi.mocked(rankPhotos)
    .mockReset()
    .mockResolvedValue([
      { id: 1, score: 9, reject: null },
      { id: 2, score: 7, reject: null },
      { id: 3, score: 9, reject: null },
      { id: 4, score: 7, reject: null },
    ])
  vi.mocked(download).mockReset().mockResolvedValue(Buffer.from('jpeg'))
  vi.mocked(readUpload)
    .mockReset()
    .mockResolvedValue({ bytes: Buffer.from('own'), sha: SHA })
  vi.mocked(rehostImage)
    .mockReset()
    .mockImplementation(({ key, alt, credit }) =>
      Promise.resolve({ src: `${BLOB}/images/${key}.webp`, alt, width: 1600, height: 900, credit }),
    )
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('imageryFor', () => {
  it('searches and judges once for every template, and gives each its own picture', async () => {
    const contracts = [contract('t01', ['hero', 'statement']), contract('t02', ['hero', 'detail'])]
    const { imagery } = await imageryFor(contracts, ANSWERS, BRIEF, 'slug')

    expect(searchPhotos).toHaveBeenCalledTimes(2)
    expect(rankPhotos).toHaveBeenCalledTimes(2)
    expect(imagery.t01?.hero?.src).toBe(`${BLOB}/images/pexels-1.webp`)
    expect(imagery.t02?.hero?.src).toBe(`${BLOB}/images/pexels-2.webp`)
    expect(imagery.t01?.statement?.src).toBe(`${BLOB}/images/pexels-3.webp`)
    expect(imagery.t02?.detail?.src).toBe(`${BLOB}/images/pexels-4.webp`)
    expect(imagery.t02?.detail?.credit).toEqual({
      photographer: 'A Photographer',
      url: 'https://www.pexels.com/@a',
    })
  })

  it('shares a picture across designs only once the ranked candidates run out, re-hosted once', async () => {
    const contracts = [
      contract('t01', ['hero']),
      contract('t02', ['hero']),
      contract('t03', ['hero']),
    ]
    const { imagery } = await imageryFor(contracts, ANSWERS, BRIEF, 'slug')

    expect(imagery.t01?.hero?.src).toBe(`${BLOB}/images/pexels-1.webp`)
    expect(imagery.t02?.hero?.src).toBe(`${BLOB}/images/pexels-2.webp`)
    expect(imagery.t03?.hero?.src).toBe(`${BLOB}/images/pexels-1.webp`)
    expect(download).toHaveBeenCalledTimes(2)
    expect(rehostImage).toHaveBeenCalledTimes(2)
  })

  it('never shows a picture twice on one page, even with nothing else to show', async () => {
    vi.mocked(searchPhotos).mockResolvedValue([candidate(1)])
    const brief = { ...BRIEF, imageQueries: { hero: ['clinic'], detail: ['clinic'] } }
    const { imagery } = await imageryFor(
      [contract('t01', ['hero', 'statement'])],
      ANSWERS,
      brief,
      'slug',
    )

    expect(imagery.t01?.hero?.src).toBe(`${BLOB}/images/pexels-1.webp`)
    expect(imagery.t01?.statement).toBeNull()
  })

  it('judges the same search again for a different purpose, and never repeats a picture on a page', async () => {
    const brief = { ...BRIEF, imageQueries: { hero: ['clinic'], detail: ['clinic'] } }
    const { imagery } = await imageryFor(
      [contract('t01', ['hero', 'statement'])],
      ANSWERS,
      brief,
      'slug',
    )

    expect(searchPhotos).toHaveBeenCalledTimes(1)
    expect(rankPhotos).toHaveBeenCalledTimes(2)
    expect(imagery.t01?.hero?.src).toBe(`${BLOB}/images/pexels-3.webp`)
    expect(imagery.t01?.statement?.src).toBe(`${BLOB}/images/pexels-4.webp`)
  })

  it('reads a visitor photograph once, checked against its hash, for every template', async () => {
    const answers: SubmissionAnswers = {
      ...ANSWERS,
      imagery: { style: 'warm', photos: [{ fileName: 'a.jpg', url: `${BLOB}/photos/${SHA}.jpg` }] },
    }
    const contracts = [contract('t01', ['hero', 'statement']), contract('t02', ['hero'])]
    const { imagery } = await imageryFor(contracts, answers, BRIEF, 'slug')

    expect(readUpload).toHaveBeenCalledTimes(1)
    expect(readUpload).toHaveBeenCalledWith(`${BLOB}/photos/${SHA}.jpg`)
    expect(searchPhotos).not.toHaveBeenCalled()
    expect(imagery.t01?.hero?.src).toBe(`${BLOB}/images/own-${SHA}.webp`)
    expect(imagery.t02?.hero?.src).toBe(`${BLOB}/images/own-${SHA}.webp`)
    expect(imagery.t01?.statement).toBeNull()
  })

  it('leaves a slot empty in every template when its search fails, without asking again', async () => {
    vi.mocked(searchPhotos).mockImplementation((query) =>
      query.startsWith('treatment room')
        ? Promise.reject(new Error('Pexels returned 429'))
        : Promise.resolve([candidate(3)]),
    )
    const contracts = [contract('t01', ['hero', 'statement']), contract('t02', ['hero'])]
    const { imagery } = await imageryFor(contracts, ANSWERS, BRIEF, 'slug')

    expect(searchPhotos).toHaveBeenCalledTimes(2)
    expect(imagery.t01?.hero).toBeNull()
    expect(imagery.t02?.hero).toBeNull()
    expect(imagery.t01?.statement?.src).toBe(`${BLOB}/images/pexels-3.webp`)
  })

  it('tries the next query when the first finds nothing', async () => {
    vi.mocked(searchPhotos).mockImplementation((query) =>
      Promise.resolve(query.startsWith('treatment room') ? [candidate(1)] : []),
    )
    const brief = { ...BRIEF, imageQueries: { hero: ['empty room', 'treatment room'], detail: [] } }
    const { imagery } = await imageryFor([contract('t01', ['hero'])], ANSWERS, brief, 'slug')

    expect(vi.mocked(searchPhotos).mock.calls.map(([query]) => query)).toEqual([
      'empty room natural light',
      'treatment room natural light',
    ])
    expect(imagery.t01?.hero?.src).toBe(`${BLOB}/images/pexels-1.webp`)
  })

  it('settles a slot when the search quota is spent, and reports the rest for another attempt', async () => {
    vi.mocked(searchPhotos).mockImplementation((query) =>
      Promise.reject(
        query.startsWith('treatment room')
          ? new PexelsQuotaError()
          : new Error('Pexels returned 500'),
      ),
    )
    const outcome = await imageryFor(
      [contract('t01', ['hero', 'statement'])],
      ANSWERS,
      BRIEF,
      'slug',
    )

    expect(outcome.imagery.t01).toEqual({ hero: null, statement: null })
    expect(outcome.exhausted).toBe(true)
    expect(outcome.unfilled).toEqual(['t01.statement'])
  })

  it('reports every slot a failed search left empty, so the stage is tried again', async () => {
    vi.mocked(searchPhotos).mockRejectedValue(new Error('Pexels returned 500'))
    const contracts = [contract('t01', ['hero', 'statement']), contract('t02', ['hero'])]
    const outcome = await imageryFor(contracts, ANSWERS, BRIEF, 'slug')

    expect([...outcome.unfilled].sort()).toEqual(['t01.hero', 't01.statement', 't02.hero'])
    expect(outcome.exhausted).toBe(false)
  })

  it('keeps the search order when the judging fails', async () => {
    vi.mocked(rankPhotos).mockRejectedValue(new Error('no verdict'))
    const { imagery } = await imageryFor([contract('t01', ['hero'])], ANSWERS, BRIEF, 'slug')
    expect(imagery.t01?.hero?.src).toBe(`${BLOB}/images/pexels-1.webp`)
  })
})
