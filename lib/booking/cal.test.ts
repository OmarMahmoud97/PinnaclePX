// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CONFIG } from '@/lib/config'

// window.Cal as Cal.com's loader reads it (embed.js 1.6.0): the page's queue, a queue for each
// namespace, and the instance the loader sets once it has run.
type Queued = unknown[][]
type CalGlobal = { q: Queued; ns: Record<string, { q: Queued } | undefined>; instance?: unknown }
const calGlobal = () => (window as Window & { Cal?: CalGlobal }).Cal

const HANDLERS = { ready: () => undefined, failed: () => undefined, booked: () => undefined }
const { namespace, origin, layout, script } = CONFIG.contact.booking

// A fresh module each time: the loader's promise and the count of tries are kept at module level.
async function cal() {
  vi.resetModules()
  return import('@/lib/booking/cal')
}

const tags = () => [...document.head.querySelectorAll('script')]

beforeEach(() => {
  delete (window as Window & { Cal?: CalGlobal }).Cal
  document.head.replaceChildren()
  document.body.replaceChildren()
})

describe('mountCal', () => {
  it('queues one calendar in the shape the loader plays', async () => {
    const { mountCal } = await cal()
    const frame = document.createElement('div')
    mountCal(frame, HANDLERS)
    const global = calGlobal()
    expect(global?.q).toEqual([['initNamespace', namespace]])
    const queued = global?.ns[namespace]?.q ?? []
    expect(queued.map(([verb]) => verb)).toEqual(['init', 'inline', 'ui', 'on', 'on', 'on'])
    expect(queued[0]).toEqual(['init', namespace, { origin }])
    expect(queued[1]).toEqual([
      'inline',
      {
        elementOrSelector: frame,
        calLink: 'pinnaclepx/quick-chat',
        config: { layout, theme: 'light' },
      },
    ])
    expect(queued[2]?.[1]).toMatchObject({ theme: 'light', layout, hideEventTypeDetails: true })
    expect(queued.slice(3).map(([, on]) => on)).toEqual([
      { action: 'linkReady', callback: HANDLERS.ready },
      { action: 'linkFailed', callback: HANDLERS.failed },
      { action: 'bookingSuccessfulV2', callback: HANDLERS.booked },
    ])
  })

  it('appends no loader of its own', async () => {
    const { mountCal } = await cal()
    mountCal(document.createElement('div'), HANDLERS)
    expect(tags()).toHaveLength(0)
  })

  it('mounts a later try under a namespace of its own, forgetting a try the loader never played', async () => {
    const { mountCal } = await cal()
    const frame = document.createElement('div')
    mountCal(frame, HANDLERS)
    mountCal(frame, HANDLERS)
    const global = calGlobal()
    expect(global?.q).toEqual([['initNamespace', `${namespace}-2`]])
    expect(Object.keys(global?.ns ?? {})).toEqual([`${namespace}-2`])
  })

  it('keeps the tries the loader has already played', async () => {
    const { mountCal } = await cal()
    const frame = document.createElement('div')
    mountCal(frame, HANDLERS)
    const global = calGlobal()
    if (global !== undefined) global.instance = {}
    mountCal(frame, HANDLERS)
    expect(Object.keys(global?.ns ?? {})).toEqual([namespace, `${namespace}-2`])
  })

  // A sheet mounted again, after a client-side return to the page, starts its own first try; its
  // listeners must not join the first sheet's, which stay on the window.
  it('counts the tries for the document, not for the sheet that made them', async () => {
    const { mountCal } = await cal()
    mountCal(document.createElement('div'), HANDLERS)
    const global = calGlobal()
    if (global !== undefined) global.instance = {}
    mountCal(document.createElement('div'), HANDLERS)
    mountCal(document.createElement('div'), HANDLERS)
    expect(Object.keys(global?.ns ?? {})).toEqual([namespace, `${namespace}-2`, `${namespace}-3`])
  })
})

describe('loadCal', () => {
  it('fetches the loader once, however often the sheet asks', async () => {
    const { loadCal } = await cal()
    const first = loadCal()
    expect(loadCal()).toBe(first)
    expect(tags().map((tag) => tag.src)).toEqual([script])
    tags()[0]?.dispatchEvent(new Event('load'))
    await expect(first).resolves.toBeUndefined()
  })

  it('forgets a load that failed, so the next try fetches it afresh', async () => {
    const { loadCal } = await cal()
    const first = loadCal()
    tags()[0]?.dispatchEvent(new Event('error'))
    await expect(first).rejects.toThrow('did not load')
    expect(tags()).toHaveLength(0)
    const second = loadCal()
    expect(second).not.toBe(first)
    expect(tags()).toHaveLength(1)
  })
})
