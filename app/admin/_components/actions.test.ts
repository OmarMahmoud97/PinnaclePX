import { setStanding } from '@/app/admin/_components/actions'

const SLUG = 'k7m2p9x4w3hd'
const IDENTITY = 'a'.repeat(64)
const NEWLINE = String.fromCharCode(10)
const NOTE_LINES = ['Agreed.', 'Starts soon.']
const CREDENTIALS = { name: 'omar', password: 'a-long-password-the-owner-chose' }

type State = {
  authorization: string | null
  identity: string | null
  calls: string[]
  fail: boolean
  logged: string[]
  refreshed: number
  redirected: string | null
}

const state = vi.hoisted((): State => ({
  authorization: null,
  identity: 'a'.repeat(64),
  calls: [],
  fail: false,
  logged: [],
  refreshed: 0,
  redirected: null,
}))

vi.mock('next/headers', () => ({
  headers: () =>
    Promise.resolve(
      new Headers(state.authorization === null ? {} : { authorization: state.authorization }),
    ),
}))
vi.mock('next/cache', () => ({
  refresh: () => {
    state.refreshed += 1
  },
}))
// Next's redirect throws and never returns; the mock does the same.
vi.mock('next/navigation', () => ({
  redirect: (to: string) => {
    state.redirected = to
    throw new Error('NEXT_REDIRECT')
  },
}))
vi.mock('@/lib/admin/credentials', () => ({ adminCredentials: () => CREDENTIALS }))
vi.mock('@/lib/log', () => ({
  log: {
    warn: (event: string, fields?: object) =>
      state.logged.push(`${event} ${JSON.stringify(fields ?? {})}`),
    error: (event: string, fields?: object) =>
      state.logged.push(`${event} ${JSON.stringify(fields ?? {})}`),
    info: vi.fn(),
  },
}))
vi.mock('@/lib/db/enquiries', () => {
  const record =
    (name: string) =>
    (...args: unknown[]) => {
      state.calls.push(
        `${name}(${args.map((a) => (a instanceof Date ? a.toISOString() : JSON.stringify(a))).join(', ')})`,
      )
      if (state.fail) return Promise.reject(new TypeError('socket closed'))
      return Promise.resolve()
    }
  return {
    identityOfSlug: () => Promise.resolve(state.identity),
    saveNote: record('saveNote'),
    setStage: record('setStage'),
    setOwnerBooking: record('setOwnerBooking'),
    deleteUnmatchedCall: record('deleteUnmatchedCall'),
    unbook: record('unbook'),
    setNoShow: record('setNoShow'),
    unopen: record('unopen'),
  }
})

const basic = `Basic ${Buffer.from(`${CREDENTIALS.name}:${CREDENTIALS.password}`).toString('base64')}`

function form(fields: Record<string, string>): FormData {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) data.set(key, value)
  return data
}

beforeEach(() => {
  state.authorization = basic
  state.identity = IDENTITY
  state.calls = []
  state.fail = false
  state.logged = []
  state.refreshed = 0
  state.redirected = null
})

describe('setStanding', () => {
  it('refuses without the owner header, and writes nothing', async () => {
    state.authorization = null
    expect(await setStanding(null, form({ slug: SLUG, intent: 'won' }))).toEqual({
      ok: false,
      reason: 'forbidden',
    })
    expect(state.calls).toEqual([])
    expect(state.logged).toEqual(['admin.refused {"action":"setStanding"}'])
  })

  it('refuses anything but the form the page sends', async () => {
    expect(await setStanding(null, { slug: SLUG, intent: 'won' })).toEqual({
      ok: false,
      reason: 'rejected',
    })
    expect(await setStanding(null, form({ slug: 'not-a-slug', intent: 'won' }))).toEqual({
      ok: false,
      reason: 'rejected',
    })
    expect(await setStanding(null, form({ slug: SLUG, intent: 'chase' }))).toEqual({
      ok: false,
      reason: 'rejected',
    })
    expect(
      await setStanding(null, form({ slug: SLUG, intent: 'won', quotePounds: '12.50' })),
    ).toEqual({ ok: false, reason: 'rejected' })
    expect(
      await setStanding(null, form({ slug: SLUG, intent: 'book', startsAt: 'yesterday' })),
    ).toEqual({ ok: false, reason: 'rejected' })
    expect(
      await setStanding(null, form({ slug: SLUG, intent: 'note', note: 'x'.repeat(501) })),
    ).toEqual({ ok: false, reason: 'rejected' })
    expect(state.calls).toEqual([])
  })

  it('answers gone for a brief the sweep has taken', async () => {
    state.identity = null
    expect(await setStanding(null, form({ slug: SLUG, intent: 'won' }))).toEqual({
      ok: false,
      reason: 'gone',
    })
    expect(state.calls).toEqual([])
  })

  it('saves the note first, then the stage with its quote, and refreshes', async () => {
    const result = await setStanding(
      null,
      form({ slug: SLUG, intent: 'quoted', quotePounds: '1429', note: 'Agreed.\r\nStarts soon.' }),
    )
    expect(result).toEqual({ ok: true, value: null })
    expect(state.calls).toEqual([
      `saveNote("${IDENTITY}", ${JSON.stringify(NOTE_LINES.join(NEWLINE))})`,
      `setStage("${IDENTITY}", "quoted", 1429)`,
    ])
    expect(state.refreshed).toBe(1)
  })

  it('takes an empty quote as none, and Lost without one', async () => {
    await setStanding(null, form({ slug: SLUG, intent: 'lost', quotePounds: '' }))
    expect(state.calls[1]).toBe(`setStage("${IDENTITY}", "lost", null)`)
  })

  it('marks a call booked at a London time, and lets go of the unmatched booking it came from', async () => {
    await setStanding(null, form({ slug: SLUG, intent: 'book', startsAt: '2026-10-08T15:00' }))
    expect(state.calls).toEqual([
      `saveNote("${IDENTITY}", "")`,
      `setOwnerBooking("${IDENTITY}", 2026-10-08T14:00:00.000Z, 20)`,
      `deleteUnmatchedCall(2026-10-08T14:00:00.000Z)`,
    ])
  })

  it('marks a call booked with no time', async () => {
    await setStanding(null, form({ slug: SLUG, intent: 'book', startsAt: '' }))
    expect(state.calls[1]).toBe(`setOwnerBooking("${IDENTITY}", null, 20)`)
    expect(state.calls).toHaveLength(2)
  })

  it('routes the other intents to their one write', async () => {
    for (const [intent, call] of [
      ['unbook', `unbook("${IDENTITY}")`],
      ['no_show', `setNoShow("${IDENTITY}")`],
      ['note', null],
    ] as const) {
      state.calls = []
      await setStanding(null, form({ slug: SLUG, intent }))
      expect(state.calls.slice(1)).toEqual(call === null ? [] : [call])
    }
  })

  it('answers retry when a write fails, and logs the intent without the person', async () => {
    state.fail = true
    expect(
      await setStanding(null, form({ slug: SLUG, intent: 'won', note: 'Sarah said yes' })),
    ).toEqual({ ok: false, reason: 'retry' })
    expect(state.logged).toEqual(['admin.failed {"intent":"won","reason":"TypeError"}'])
    expect(state.logged.join(' ')).not.toContain('Sarah')
    expect(state.refreshed).toBe(0)
  })
})

describe('Mark as new', () => {
  it('clears the stamp and sends the owner to the inbox rather than refreshing the brief', async () => {
    await expect(setStanding(null, form({ slug: SLUG, intent: 'unopen' }))).rejects.toThrow(
      'NEXT_REDIRECT',
    )
    expect(state.calls.slice(1)).toEqual([`unopen("${SLUG}")`])
    expect(state.redirected).toBe('/admin')
    expect(state.refreshed).toBe(0)
  })
})
