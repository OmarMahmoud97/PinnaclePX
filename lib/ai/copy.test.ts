import { writeCopy } from '@/lib/ai/copy'
import { fallbackBrief } from '@/lib/copy-slots/brief'
import { contractFor } from '@/templates/registry'

// The client's create, hoisted so the mock factory and the assertions share one function.
const api = vi.hoisted(() => ({ create: vi.fn() }))

vi.mock('server-only', () => ({}))
vi.mock('@/lib/ai/client', () => ({ anthropic: { messages: { create: api.create } } }))
vi.mock('@/lib/ai/usage', () => ({ noteModelCall: vi.fn() }))
vi.mock('@/lib/log', () => ({ log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }))

const contract = contractFor('t01-aurora')
const SENTENCE = 'Boiler repairs, servicing and new installs across Bradford and Shipley.'
const brief = fallbackBrief('A1 Gas and Plumbing', SENTENCE)
// The fallback copy is a valid answer in the template's own shape, so it stands in for the
// model's text. The contract erases the type; the test needs two of its keys.
type Copy = Record<string, unknown> & { hero: Record<string, unknown>; footer: unknown }
const COPY = contract.fallbackCopy(brief) as Copy

// What the API answers: one text block, as messages.create returns it.
const answer = (text: string, stop = 'end_turn') => ({
  model: 'claude-sonnet-5',
  stop_reason: stop,
  usage: { input_tokens: 1, output_tokens: 1 },
  content: [{ type: 'text', text }],
})

type Request = Readonly<{ messages: readonly { content: unknown }[]; output_config?: unknown }>
const request = (call: number): Request => api.create.mock.calls[call]?.[0] as Request

beforeEach(() => {
  api.create.mockReset()
})

describe('writeCopy', () => {
  it('accepts an answer in the shape, with the company name as the owner’s words', async () => {
    api.create.mockResolvedValueOnce(answer(JSON.stringify(COPY)))
    const written = await writeCopy({ brief, contract, ownersWords: SENTENCE, slug: 's' })
    // "A1" carries a digit the sentence does not; the name is the owner's, so it passes.
    expect(written.ok).toBe(true)
    expect(api.create).toHaveBeenCalledTimes(1)
    expect(request(0).messages[0]?.content).toContain('"brand":{"name":"","legalName":""')
    expect(request(0).messages[0]?.content).toContain(`The owner's own words: "${SENTENCE}"`)
    expect(request(0).output_config).toBeUndefined()
  })

  it('reads the JSON out of a code fence', async () => {
    api.create.mockResolvedValueOnce(answer(`\`\`\`json\n${JSON.stringify(COPY)}\n\`\`\``))
    const written = await writeCopy({ brief, contract, ownersWords: SENTENCE, slug: 's' })
    expect(written.ok).toBe(true)
  })

  it('asks again with the missing keys when the answer misses the shape, then accepts', async () => {
    const { footer: _footer, ...withoutFooter } = COPY
    api.create
      .mockResolvedValueOnce(answer(JSON.stringify(withoutFooter)))
      .mockResolvedValueOnce(answer(JSON.stringify(COPY)))
    const written = await writeCopy({ brief, contract, ownersWords: SENTENCE, slug: 's' })
    expect(written.ok).toBe(true)
    expect(api.create).toHaveBeenCalledTimes(2)
    const retry = request(1).messages
    expect(retry).toHaveLength(3)
    expect(retry[2]?.content).toContain('footer: the wrong shape')
  })

  it('returns the violations when the second answer still misses', async () => {
    const broken = { ...COPY, hero: { ...COPY.hero, headline: 'Too short' } }
    api.create
      .mockResolvedValueOnce(answer(JSON.stringify(broken)))
      .mockResolvedValueOnce(answer(JSON.stringify(broken)))
    const written = await writeCopy({ brief, contract, ownersWords: SENTENCE, slug: 's' })
    expect(written.ok).toBe(false)
    if (written.ok) return
    expect(written.reason[0]?.path).toBe('hero.headline')
    expect(api.create).toHaveBeenCalledTimes(2)
  })

  it('gives up at once when the call ends short of an answer', async () => {
    api.create.mockResolvedValueOnce(answer('{"brand":', 'max_tokens'))
    const written = await writeCopy({ brief, contract, ownersWords: SENTENCE, slug: 's' })
    expect(written.ok).toBe(false)
    if (written.ok) return
    expect(written.reason[0]?.reason).toContain('max_tokens')
    expect(api.create).toHaveBeenCalledTimes(1)
  })
})
