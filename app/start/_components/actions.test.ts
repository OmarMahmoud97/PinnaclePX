import { submitBrief } from '@/app/start/_components/actions'
import { hitLimit } from '@/lib/db/rate-limit'
import { createOrFindSubmission, findSubmission } from '@/lib/db/submissions'
import { CONFIG } from '@/lib/config'

// A stand-in for the database the action writes: the submissions by payload hash, and every hit
// counted against a limit's key, as lib/db/rate-limit.ts counts them in one window.
const database = vi.hoisted(() => ({
  submissions: new Map<string, { slug: string; eventSentAt: Date | null }>(),
  hits: new Map<string, number>(),
}))

vi.mock('@/lib/db/rate-limit', () => ({
  hitLimit: vi.fn((limit: { scope: string; subject: string; max: number }) => {
    const key = `${limit.scope}:${limit.subject}`
    const count = (database.hits.get(key) ?? 0) + 1
    database.hits.set(key, count)
    return Promise.resolve(count <= limit.max)
  }),
}))

vi.mock('@/lib/db/leads', () => ({ upsertLead: vi.fn(() => Promise.resolve()) }))

const DEADLINE = new Date('2026-09-25T10:05:00Z')

vi.mock('@/lib/db/submissions', () => {
  const row = (slug: string, eventSentAt: Date | null) => ({
    slug,
    deadlineAt: DEADLINE,
    conceptCount: 3,
    eventSentAt,
  })
  return {
    findSubmission: vi.fn((payloadHash: string) => {
      const found = database.submissions.get(payloadHash)
      return Promise.resolve(found === undefined ? null : row(found.slug, found.eventSentAt))
    }),
    createOrFindSubmission: vi.fn((input: { slug: string; payloadHash: string }) => {
      database.submissions.set(input.payloadHash, { slug: input.slug, eventSentAt: null })
      return Promise.resolve({ ...row(input.slug, null), created: true })
    }),
    markEventSent: vi.fn((slug: string) => {
      for (const submission of database.submissions.values()) {
        if (submission.slug === slug) submission.eventSentAt = new Date()
      }
      return Promise.resolve(true)
    }),
  }
})

// The pipeline's event, sent through the Inngest client.
const pipeline = vi.hoisted(() => ({ send: vi.fn(() => Promise.resolve()) }))

vi.mock('@/lib/inngest/client', () => ({ inngest: pipeline }))
vi.mock('@/lib/rate-limit/request', () => ({ callerAddress: () => Promise.resolve('203.0.113.9') }))

const BRIEF = {
  description:
    'Physiotherapy clinic in Sheffield. Sports injuries, post-op rehab and same-week appointments.',
  name: 'Sam',
  company: 'Ashgrove Physio',
  email: 'sam@ashgrove.example',
  logo: { kind: 'wordmark' },
  imagery: { style: 'minimal', photos: [] },
  colours: { kind: 'palette', paletteId: 'forest' },
}

function send(answers: object = BRIEF, openedForMs: number = CONFIG.form.minMs, website = '') {
  return submitBrief({ answers, openedForMs, website })
}

beforeEach(() => {
  database.submissions.clear()
  database.hits.clear()
  vi.clearAllMocks()
})

describe('submitBrief', () => {
  it('counts a new brief against the limits, stores it and starts the pipeline once', async () => {
    const result = await send()
    expect(result).toMatchObject({ ok: true, value: { conceptCount: 3 } })
    expect(hitLimit).toHaveBeenCalledTimes(2)
    expect(createOrFindSubmission).toHaveBeenCalledTimes(1)
    expect(pipeline.send).toHaveBeenCalledTimes(1)
  })

  it('answers a second identical send with the first slug, before the limits count it', async () => {
    const first = await send()
    const second = await send()
    expect(second).toEqual(first)
    // Only the first send was counted, by address and by person, and only it was stored.
    expect(hitLimit).toHaveBeenCalledTimes(2)
    expect([...database.hits.values()]).toEqual([1, 1])
    expect(createOrFindSubmission).toHaveBeenCalledTimes(1)
    expect(pipeline.send).toHaveBeenCalledTimes(1)
  })

  it('counts a brief with other answers as a send of its own', async () => {
    await send()
    await send({ ...BRIEF, company: 'Ashgrove Sports Physio' })
    expect(hitLimit).toHaveBeenCalledTimes(4)
    expect(createOrFindSubmission).toHaveBeenCalledTimes(2)
  })

  it('sends again the event a first send failed to start, without counting it again', async () => {
    pipeline.send.mockRejectedValueOnce(new Error('no dev server'))
    expect(await send()).toEqual({ ok: false, reason: 'retry' })
    expect(await send()).toMatchObject({ ok: true })
    expect(hitLimit).toHaveBeenCalledTimes(2)
    expect(pipeline.send).toHaveBeenCalledTimes(2)
  })

  it('refuses a new brief past the day’s limit for one person', async () => {
    const { max } = CONFIG.rateLimit.submissionsPerIdentity
    for (let n = 0; n < max; n += 1) {
      expect(await send({ ...BRIEF, company: `Ashgrove ${String(n)}` })).toMatchObject({ ok: true })
    }
    expect(await send({ ...BRIEF, company: 'Ashgrove, once more' })).toEqual({
      ok: false,
      reason: 'too_many',
    })
    // The day's briefs themselves still come back.
    expect(await send({ ...BRIEF, company: 'Ashgrove 0' })).toMatchObject({ ok: true })
  })

  it('rejects the hidden field, a form sent too fast and answers that do not parse', async () => {
    expect(await send(BRIEF, CONFIG.form.minMs, 'https://spam.example')).toEqual({
      ok: false,
      reason: 'rejected',
    })
    expect(await send(BRIEF, CONFIG.form.minMs - 1)).toEqual({ ok: false, reason: 'rejected' })
    expect(await send({ ...BRIEF, email: 'not an address' })).toEqual({
      ok: false,
      reason: 'rejected',
    })
    expect(findSubmission).not.toHaveBeenCalled()
    expect(hitLimit).not.toHaveBeenCalled()
  })

  it('says to try again when the store fails', async () => {
    vi.mocked(findSubmission).mockRejectedValueOnce(new Error('connection reset'))
    expect(await send()).toEqual({ ok: false, reason: 'retry' })
  })
})
