// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  clearPending,
  DONE_KEY,
  doneDetailsFrom,
  firstDoneView,
  forgetSubmission,
  forgetSubmissions,
  keptFor,
  liveSubmission,
  markPending,
  PENDING_KEY,
  rememberSend,
  SENDS_KEY,
  sendPending,
  sendsToday,
  SUBMITTED_KEY,
  VIEWED_KEY,
} from '@/app/start/_components/done-storage'
import { BLANK_ANSWERS } from '@/lib/brief/answers'
import type { Answers } from '@/lib/brief/schema'
import { CONFIG } from '@/lib/config'

const NOW = Date.parse('2026-09-24T10:00:00.000Z')
const HOUR_MS = 3_600_000
const DAY_MS = 24 * HOUR_MS

const ANSWERS: Answers = {
  ...BLANK_ANSWERS,
  name: 'Dr Sam Gibbs',
  company: ' Gibbs Plumbing ',
  email: 'sam@gibbs.example',
  imagery: { style: 'warm', photos: [] },
  colours: { kind: 'palette', paletteId: 'plum' },
}

function submitted(slug: string) {
  return {
    slug,
    deadlineAt: new Date(NOW + CONFIG.deadline.totalMs).toISOString(),
    conceptCount: 3,
  }
}

function send(slug: string, now = NOW) {
  rememberSend(doneDetailsFrom(ANSWERS, slug), submitted(slug), now)
}

afterEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  vi.restoreAllMocks()
})

describe('doneDetailsFrom', () => {
  it('keeps the first name, the trimmed business name, the labels of the choices and the photo count', () => {
    expect(doneDetailsFrom(ANSWERS, 'abc')).toEqual({
      slug: 'abc',
      first: 'Sam',
      company: 'Gibbs Plumbing',
      email: 'sam@gibbs.example',
      paletteLabel: 'Plum',
      styleLabel: 'Warm and natural',
      photos: 0,
    })
  })

  it('reads a record kept before the photo count, as not knowing it', () => {
    const { photos: _count, ...older } = doneDetailsFrom(ANSWERS, 'abc')
    sessionStorage.setItem(DONE_KEY, JSON.stringify({ v: 1, ...older }))
    expect(keptFor('abc', NOW).details).toEqual(older)
  })

  it("has no palette name for a colour of the visitor's own", () => {
    const custom: Answers = { ...ANSWERS, colours: { kind: 'custom', hex: '#339906' } }
    expect(doneDetailsFrom(custom, 'abc').paletteLabel).toBeNull()
  })
})

describe('a remembered send', () => {
  it('brings back its words in this tab and its submission in this browser', () => {
    send('abc')
    expect(keptFor('abc', NOW).details?.first).toBe('Sam')
    expect(keptFor('abc', NOW).submitted).toEqual(submitted('abc'))
    expect(liveSubmission(NOW)).toEqual(submitted('abc'))
  })

  it('gives no words for another slug', () => {
    send('abc')
    expect(keptFor('xyz', NOW)).toEqual({ details: null, submitted: null })
  })

  it('lapses a day after the deadline, and is removed once it has', () => {
    send('abc')
    const deadline = NOW + CONFIG.deadline.totalMs
    const restoreMs = CONFIG.start.done.restoreHours * HOUR_MS
    expect(liveSubmission(deadline + restoreMs)).not.toBeNull()
    expect(liveSubmission(deadline + restoreMs + 1)).toBeNull()
    expect(localStorage.getItem(SUBMITTED_KEY)).toBeNull()
  })

  it('drops a value it cannot read', () => {
    localStorage.setItem(SUBMITTED_KEY, '{"v":1,"slug":')
    sessionStorage.setItem(DONE_KEY, JSON.stringify({ v: 2, slug: 'abc' }))
    expect(liveSubmission(NOW)).toBeNull()
    expect(keptFor('abc', NOW).details).toBeNull()
    expect(localStorage.getItem(SUBMITTED_KEY)).toBeNull()
    expect(sessionStorage.getItem(DONE_KEY)).toBeNull()
  })

  it('reads nothing and throws nothing when storage refuses', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied')
    })
    expect(() => {
      send('abc')
    }).not.toThrow()
    expect(liveSubmission(NOW)).toBeNull()
    expect(sendPending(NOW)).toBe(false)
  })
})

describe('forgetting', () => {
  it('forgets a missing submission only when it is the one kept', () => {
    send('abc')
    forgetSubmission('xyz')
    expect(liveSubmission(NOW)?.slug).toBe('abc')
    forgetSubmission('abc')
    expect(liveSubmission(NOW)).toBeNull()
    expect(keptFor('abc', NOW).details).toBeNull()
  })

  it('starts a new brief with the day count kept', () => {
    send('abc')
    markPending(NOW)
    forgetSubmissions()
    expect(localStorage.getItem(SUBMITTED_KEY)).toBeNull()
    expect(sessionStorage.getItem(DONE_KEY)).toBeNull()
    expect(sessionStorage.getItem(PENDING_KEY)).toBeNull()
    expect(sendsToday(NOW)).toBe(1)
  })
})

describe('the day count', () => {
  it('counts each slug once, so a resend of the same answers is not a second send', () => {
    send('abc')
    send('abc')
    send('def')
    expect(sendsToday(NOW)).toBe(2)
  })

  it('starts again in the next window of the server', () => {
    send('abc')
    expect(sendsToday(NOW + DAY_MS)).toBe(0)
    expect(localStorage.getItem(SENDS_KEY)).toBeNull()
  })
})

describe('a send in flight', () => {
  it('is pending until it is cleared or its time is up', () => {
    markPending(NOW)
    expect(sendPending(NOW + CONFIG.start.send.pendingMs)).toBe(true)
    clearPending()
    expect(sendPending(NOW)).toBe(false)

    markPending(NOW)
    expect(sendPending(NOW + CONFIG.start.send.pendingMs + 1)).toBe(false)
    expect(sessionStorage.getItem(PENDING_KEY)).toBeNull()
  })
})

describe('a done view seen', () => {
  it('is first once per slug in a tab, and a refresh is not a second sight', () => {
    expect(firstDoneView('seen-once')).toBe(true)
    expect(firstDoneView('seen-once')).toBe(false)
    expect(firstDoneView('seen-other')).toBe(true)
    expect(JSON.parse(sessionStorage.getItem(VIEWED_KEY) ?? 'null')).toEqual({
      v: 1,
      slugs: ['seen-once', 'seen-other'],
    })
  })

  it('reads a sight the tab kept from an earlier page load', () => {
    sessionStorage.setItem(VIEWED_KEY, JSON.stringify({ v: 1, slugs: ['seen-before'] }))
    expect(firstDoneView('seen-before')).toBe(false)
  })

  it('still counts once in a page load when storage refuses', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied')
    })
    expect(firstDoneView('seen-refused')).toBe(true)
    expect(firstDoneView('seen-refused')).toBe(false)
  })
})
