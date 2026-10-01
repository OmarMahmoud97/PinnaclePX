import { rankPhotos } from '@/lib/ai/rank'
import type { Candidate } from '@/lib/images/candidates'

// The client's parse and the logger's warn, hoisted so the mock factories and the assertions
// share one function each.
const api = vi.hoisted(() => ({ parse: vi.fn(), warn: vi.fn() }))

vi.mock('server-only', () => ({}))
vi.mock('@/lib/ai/client', () => ({ anthropic: { messages: { parse: api.parse } } }))
vi.mock('@/lib/ai/usage', () => ({ noteModelCall: vi.fn() }))
vi.mock('@/lib/log', () => ({ log: { info: vi.fn(), warn: api.warn, error: vi.fn() } }))

function candidate(id: number): Candidate {
  return {
    id,
    alt: '',
    photographer: 'A Photographer',
    photographerUrl: 'https://www.pexels.com/@a',
    thumbnail: `https://images.pexels.com/photos/${String(id)}/m.jpg`,
    source: `https://images.pexels.com/photos/${String(id)}/l.jpg`,
  }
}

// What the API answers: the verdicts as messages.parse returns them.
const verdicts = (photos: unknown[] | null) => ({
  model: 'claude-haiku-4-5',
  stop_reason: 'end_turn',
  usage: { input_tokens: 1, output_tokens: 1 },
  content: [],
  parsed_output: photos === null ? null : { photos },
})

type Request = Readonly<{
  messages: readonly { content: readonly { type: string; text?: string }[] }[]
}>

beforeEach(() => {
  api.parse.mockReset()
  api.warn.mockReset()
})

describe('rankPhotos', () => {
  it('numbers the photographs from one and maps the verdicts back to their ids', async () => {
    api.parse.mockResolvedValueOnce(
      verdicts([
        { id: 2, score: 8, reject: null },
        { id: 1, score: 3, reject: 'a face as the subject' },
      ]),
    )
    const judged = await rankPhotos([candidate(20860622), candidate(31234567)], 'purpose', 's')
    expect(judged).toEqual([
      { id: 31234567, score: 8, reject: null },
      { id: 20860622, score: 3, reject: 'a face as the subject' },
    ])
    const sent = api.parse.mock.calls[0]?.[0] as Request
    const labels = sent.messages[0]?.content.flatMap((block) =>
      block.type === 'text' ? [block.text] : [],
    )
    expect(labels?.slice(1)).toEqual(['id 1', 'id 2'])
  })

  it('drops a verdict that names no photograph, and says so', async () => {
    api.parse.mockResolvedValueOnce(
      verdicts([
        { id: 1, score: 6, reject: null },
        { id: 9, score: 9, reject: null },
        { id: 1.5, score: 9, reject: null },
      ]),
    )
    const judged = await rankPhotos([candidate(1), candidate(2)], 'purpose', 's')
    expect(judged).toEqual([{ id: 1, score: 6, reject: null }])
    expect(api.warn).toHaveBeenCalledTimes(2)
    expect(api.warn).toHaveBeenCalledWith('rank.unmatched', { slug: 's', id: 9 })
  })

  it('throws when the call returned no verdict', async () => {
    api.parse.mockResolvedValueOnce(verdicts(null))
    await expect(rankPhotos([candidate(1)], 'purpose', 's')).rejects.toThrow('no verdict')
  })
})
