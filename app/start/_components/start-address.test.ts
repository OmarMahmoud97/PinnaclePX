import { describe, expect, it } from 'vitest'
import {
  correctionFor,
  entryOf,
  hrefFor,
  requestedFrom,
  stepsOut,
} from '@/app/start/_components/start-address'

const params = (query: string) => new URLSearchParams(query)

describe('requestedFrom', () => {
  it('reads a question by its number, 0-based', () => {
    expect(requestedFrom(params('q=3'))).toEqual({ kind: 'question', index: 2 })
  })

  it('takes any other question number as the first', () => {
    for (const q of ['0', '6', 'two', '1.5']) {
      expect(requestedFrom(params(`q=${q}`))).toEqual({ kind: 'question', index: 0 })
    }
  })

  it('reads a done address with its slug', () => {
    expect(requestedFrom(params('q=done&s=abcdefghjkmn'))).toEqual({
      kind: 'done',
      slug: 'abcdefghjkmn',
    })
  })

  it('treats bare /start and a done address without its slug as an arrival', () => {
    expect(requestedFrom(params(''))).toEqual({ kind: 'arrival', bare: true })
    expect(requestedFrom(params('q=done'))).toEqual({ kind: 'arrival', bare: false })
    expect(requestedFrom(params('q=done&s='))).toEqual({ kind: 'arrival', bare: false })
  })
})

describe('hrefFor', () => {
  it('writes the address each view is read back from', () => {
    for (const view of [
      { kind: 'question', index: 4 },
      { kind: 'done', slug: 'abcdefghjkmn' },
    ] as const) {
      const query = hrefFor(view).split('?')[1] ?? ''
      expect(requestedFrom(params(query))).toEqual(view)
    }
  })
})

describe('correctionFor', () => {
  it('leaves an address that shows what it asks for', () => {
    const view = { kind: 'question', index: 2 } as const
    expect(correctionFor(view, view)).toBeNull()
  })

  it('brings a question past what the answers allow back to the one allowed', () => {
    expect(correctionFor({ kind: 'question', index: 4 }, { kind: 'question', index: 2 })).toBe(
      '/start?q=3',
    )
  })

  it('keeps bare /start at the first question, and names any other arrival', () => {
    const arrival = { kind: 'arrival', bare: true } as const
    expect(correctionFor(arrival, { kind: 'question', index: 0 })).toBeNull()
    expect(correctionFor(arrival, { kind: 'question', index: 3 })).toBe('/start?q=4')
    expect(correctionFor(arrival, { kind: 'done', slug: 'abc' })).toBe('/start?q=done&s=abc')
  })

  it('never keeps a done link cut short, even at the first question', () => {
    const cut = { kind: 'arrival', bare: false } as const
    expect(correctionFor(cut, { kind: 'question', index: 0 })).toBe('/start?q=1')
  })
})

describe('entryOf', () => {
  it('reads the flow state beside Next state', () => {
    expect(entryOf({ __NA: true, startDepth: 3, startFrom: 1, startBefore: true })).toEqual({
      depth: 3,
      from: 1,
      before: true,
    })
  })

  it('reads an arrival, which came from no question', () => {
    expect(entryOf({ startDepth: 1, startBefore: false })).toEqual({
      depth: 1,
      from: undefined,
      before: false,
    })
  })

  it('knows no entry that the flow did not mark', () => {
    expect(entryOf(null)).toBeNull()
    expect(entryOf({ __NA: true })).toBeNull()
    expect(entryOf({ startDepth: '2' })).toBeNull()
  })
})

describe('stepsOut', () => {
  it('goes past every /start entry to the page before it', () => {
    expect(stepsOut({ depth: 3, from: 1, before: true })).toBe(3)
  })

  it('stops at the first /start entry when nothing came before it', () => {
    expect(stepsOut({ depth: 3, from: 1, before: false })).toBe(2)
    expect(stepsOut({ depth: 1, from: undefined, before: false })).toBe(0)
  })
})
