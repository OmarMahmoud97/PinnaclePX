import { writeCopy } from '@/lib/ai/copy'
import { noteModelCall } from '@/lib/ai/usage'
import type { SubmissionAnswers } from '@/lib/brief/submission'
import { fallbackBrief } from '@/lib/copy-slots/brief'
import { contractFor } from '@/templates/registry'
import { answerOf, copyAttemptOf, NOT_JSON, notebook, RAW_TEXT_LIMIT } from './notes'
import { summarise } from './summary'
import type { CallRecord, CopyAttempt, FixtureRecord } from './types'

// The eval's record of an answer that did not parse (decision 17, docs/template-fit-decisions.md):
// its text is kept, it is a "not JSON" violation, and the summary never counts it as a fit,
// in a new record or in one written before the violation existed.

// The client's create, hoisted so the mock factory and the assertions share one function.
const api = vi.hoisted(() => ({ create: vi.fn() }))

vi.mock('server-only', () => ({}))
vi.mock('@/lib/ai/client', () => ({ anthropic: { messages: { create: api.create } } }))
vi.mock('@/lib/ai/usage', () => ({ noteModelCall: vi.fn() }))
vi.mock('@/lib/log', () => ({ log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }))

const contract = contractFor('t01-aurora')
const SENTENCE = 'Boiler repairs, servicing and new installs across Bradford and Shipley.'
const brief = fallbackBrief('A1 Gas and Plumbing', SENTENCE)
const COPY = contract.fallbackCopy(brief)
// A complete answer with one defect, a trailing comma. The defect is made up: l6 kept none of its
// sixteen unreadable answers' text, so what broke them is unknown (review/evidence.md, EVI-2).
const BROKEN =
  '{"brand":{"name":"A1 Gas and Plumbing","legalName":"A1 Gas and Plumbing",},"hero":{}}'

// What the API answers: one text block, as messages.create returns it.
const answer = (text: string) => ({
  model: 'claude-sonnet-5',
  stop_reason: 'end_turn',
  usage: { input_tokens: 1000, output_tokens: 1700 },
  content: [{ type: 'text', text }],
})
// The same answer as noteModelCall's parameter, which types only the fields it reads.
const noted = (response: unknown) => response as Parameters<typeof answerOf>[0]

const USAGE: CallRecord = {
  slug: 's',
  stage: 'copy',
  template: 't01-aurora',
  attempt: 0,
  step: 0,
  model: 'claude-sonnet-5',
  stop: 'end_turn',
  input: 1000,
  output: 1700,
  cacheRead: 0,
  cacheWrite: 0,
  ms: null,
  at: '2026-10-02T00:00:00.000Z',
}

const ANSWERS: SubmissionAnswers = {
  description: SENTENCE,
  company: 'A1 Gas and Plumbing',
  logo: { kind: 'wordmark' },
  imagery: { style: 'warm', photos: [] },
  colours: { kind: 'palette', paletteId: 'forest' },
}

// A fixture record holding one template's attempts and nothing else.
function recordWith(attempts: readonly CopyAttempt[]): FixtureRecord {
  return {
    id: 'unreadable',
    notes: '',
    answers: ANSWERS,
    seed: '',
    templates: ['t01-aurora'],
    stagesRun: ['copy'],
    reusedFrom: null,
    brief: {
      source: 'model',
      attempts: 1,
      errors: [],
      brief,
      calls: [],
      ruleViolations: [],
      ms: 0,
    },
    copy: {
      't01-aurora': {
        final: COPY,
        fallback: false,
        fallbackReason: null,
        errors: [],
        attempts,
        ms: 0,
      },
    },
    imagery: { pools: [], assignment: {}, empty: 0, repeated: 0, ms: 0 },
    at: USAGE.at,
  }
}

type CopySummary = Readonly<{
  firstAnswerPassed: number
  inCallRetryPassed: number
  violationsByKind: Readonly<Record<string, number>>
  violationsBySlot: Readonly<Record<string, number>>
  unreadable: Readonly<Record<string, unknown>>
}>
const copyOf = (summary: { json: unknown }) => (summary.json as { copy: CopySummary }).copy

beforeEach(() => {
  api.create.mockReset()
})

describe('an answer that is not JSON', () => {
  it('reaches the record through noteModelCall with its text and the not-JSON violation', async () => {
    const book = notebook()
    vi.mocked(noteModelCall).mockImplementation(book.note)
    api.create
      .mockResolvedValueOnce(answer(BROKEN))
      .mockResolvedValueOnce(answer(JSON.stringify(COPY)))
    const written = await writeCopy({ brief, contract, ownersWords: SENTENCE, slug: 's' })
    // The pipeline read the first answer as unreadable too, and asked again.
    expect(written.ok).toBe(true)
    expect(api.create).toHaveBeenCalledTimes(2)

    const attempts = book
      .take('s', 'copy', 't01-aurora')
      .map((note) => copyAttemptOf(note, () => []))
    expect(attempts).toHaveLength(2)
    expect(attempts[0]).toMatchObject({
      call: 0,
      parsed: null,
      raw: BROKEN,
      violations: [NOT_JSON],
    })
    expect(attempts[1]).toMatchObject({ call: 1, violations: [] })
    expect(attempts[1]?.parsed).toEqual(COPY)
    expect(attempts[1]).not.toHaveProperty('raw')

    const copy = copyOf(summarise('test', [recordWith(attempts)]))
    expect(copy.firstAnswerPassed).toBe(0)
    expect(copy.inCallRetryPassed).toBe(1)
    expect(copy.violationsByKind.shape).toBe(1)
    expect(copy.violationsBySlot['t01-aurora (not JSON)']).toBe(1)
    expect(copy.unreadable).toMatchObject({
      calls: 1,
      firstAnswers: 1,
      inCallRetries: 0,
      withText: 1,
    })
  })

  it('keeps at most RAW_TEXT_LIMIT characters of the text', () => {
    const text = `${'x'.repeat(RAW_TEXT_LIMIT)}tail`
    const kept = answerOf(noted(answer(text)))
    expect(kept.parsed).toBeNull()
    expect(kept.raw).toHaveLength(RAW_TEXT_LIMIT)
  })

  it('keeps an answer as long as l6’s longest unreadable one whole, its end included', () => {
    // Meridian's 2,304-token answer at 3.95 characters a token, broken in its last characters.
    const text = `{"brand":{"name":"${'x'.repeat(9_050)}"},}`
    const kept = answerOf(noted(answer(text)))
    expect(kept.parsed).toBeNull()
    expect(kept.raw).toBe(text)
  })

  it('keeps no text for an answer that parsed, or for a structured call', () => {
    expect(answerOf(noted(answer('{"a":1}')))).toEqual({ parsed: { a: 1 }, raw: null })
    const structured = { ...answer(''), parsed_output: { a: 2 } }
    expect(answerOf(noted(structured))).toEqual({
      parsed: { a: 2 },
      raw: null,
    })
  })
})

describe('the summary', () => {
  const fits: CopyAttempt = { step: 0, call: 1, parsed: COPY, violations: [], usage: USAGE }

  it('counts an old record’s unreadable answer, which carries no violation, as not JSON', () => {
    const old: CopyAttempt = { step: 0, call: 0, parsed: null, violations: [], usage: USAGE }
    const summary = summarise('old', [recordWith([old, fits])])
    const copy = copyOf(summary)
    expect(copy.firstAnswerPassed).toBe(0)
    expect(copy.violationsByKind.shape).toBe(1)
    expect(copy.unreadable).toMatchObject({ calls: 1, withText: 0 })
    expect(summary.markdown).toContain('First answer fitted 0/1')
    expect(summary.markdown).toContain('Unreadable answers (not JSON')
    expect(summary.markdown).toContain(': 1 of 2 calls (50.0%): 1 first answers')
  })

  it('counts a new record’s not-JSON violation once', () => {
    const fresh: CopyAttempt = {
      step: 0,
      call: 0,
      parsed: null,
      raw: BROKEN,
      violations: [NOT_JSON],
      usage: USAGE,
    }
    const copy = copyOf(summarise('new', [recordWith([fresh, fits])]))
    expect(copy.violationsByKind.shape).toBe(1)
    expect(copy.unreadable).toMatchObject({ calls: 1, withText: 1 })
  })

  it('prices the call an unreadable answer caused', () => {
    const old: CopyAttempt = { step: 0, call: 0, parsed: null, violations: [], usage: USAGE }
    const retry: CopyAttempt = { ...fits, usage: { ...USAGE, attempt: 1, output: 2000 } }
    const copy = copyOf(summarise('cost', [recordWith([old, retry])]))
    // 1,000 input and 2,000 output tokens at $2 and $10 a million.
    expect(copy.unreadable.costAfter).toBeCloseTo(0.022, 6)
  })
})
