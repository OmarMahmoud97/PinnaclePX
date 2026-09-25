// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { latestStatus, watchStatus } from '@/app/preview/_components/use-submission-status'
import type { SubmissionStatus } from '@/lib/brief/status'
import { CONFIG } from '@/lib/config'

const { statusMs } = CONFIG.polling
const { hiddenPollMs } = CONFIG.start.wait

function status(slug: string, kind: 'building' | 'ready'): SubmissionStatus {
  return {
    status: kind,
    slug,
    deadlineAt: '2026-09-24T10:05:00.000Z',
    conceptCount: 3,
    concepts: [],
  }
}

// Answers each request in turn, the last repeated, and counts them.
function answering(...answers: readonly SubmissionStatus[]) {
  const fetch = vi.fn((_input: string, _init?: RequestInit) => {
    const answer = answers[Math.min(fetch.mock.calls.length - 1, answers.length - 1)]
    return Promise.resolve(Response.json(answer))
  })
  vi.stubGlobal('fetch', fetch)
  return fetch
}

let hidden = false

function setHidden(value: boolean) {
  hidden = value
  document.dispatchEvent(new Event('visibilitychange'))
}

beforeEach(() => {
  vi.useFakeTimers()
  hidden = false
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => (hidden ? 'hidden' : 'visible'),
  })
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

// Lets a request and its answer land.
const settle = () => vi.advanceTimersByTimeAsync(0)

describe('watchStatus', () => {
  it('asks the GET route at once, then again on the visible clock while the designs build', async () => {
    const fetch = answering(status('a1', 'building'))
    const stop = watchStatus('a1', vi.fn())
    await settle()
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch.mock.calls[0]?.[0]).toBe('/api/status/a1')
    expect(latestStatus('a1')?.status).toBe('building')
    await vi.advanceTimersByTimeAsync(statusMs)
    expect(fetch).toHaveBeenCalledTimes(2)
    stop()
  })

  it('keeps asking while the tab is hidden, on the slower clock', async () => {
    const fetch = answering(status('a2', 'building'))
    const stop = watchStatus('a2', vi.fn())
    await settle()
    setHidden(true)
    await vi.advanceTimersByTimeAsync(statusMs)
    const asked = fetch.mock.calls.length
    await vi.advanceTimersByTimeAsync(hiddenPollMs - 1)
    expect(fetch).toHaveBeenCalledTimes(asked)
    await vi.advanceTimersByTimeAsync(1)
    expect(fetch).toHaveBeenCalledTimes(asked + 1)
    stop()
  })

  it('asks at once when a hidden tab is shown again', async () => {
    const fetch = answering(status('a3', 'building'))
    const stop = watchStatus('a3', vi.fn())
    await settle()
    setHidden(true)
    await vi.advanceTimersByTimeAsync(statusMs)
    const asked = fetch.mock.calls.length
    setHidden(false)
    await settle()
    expect(fetch).toHaveBeenCalledTimes(asked + 1)
    stop()
  })

  it('stops asking once the designs are ready, and tells every watcher', async () => {
    const fetch = answering(status('a4', 'building'), status('a4', 'ready'))
    const first = vi.fn()
    const second = vi.fn()
    const stopFirst = watchStatus('a4', first)
    const stopSecond = watchStatus('a4', second)
    await settle()
    await vi.advanceTimersByTimeAsync(statusMs)
    expect(latestStatus('a4')?.status).toBe('ready')
    await vi.advanceTimersByTimeAsync(statusMs * 5)
    // One request per answer, however many watch.
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(first).toHaveBeenCalledTimes(2)
    expect(second).toHaveBeenCalledTimes(2)
    stopFirst()
    stopSecond()
  })

  it('keeps an answer that lands after the last watcher has gone, and asks no more', async () => {
    const fetch = answering(status('a5', 'building'))
    const listener = vi.fn()
    const stop = watchStatus('a5', listener)
    stop()
    await settle()
    expect(listener).not.toHaveBeenCalled()
    expect(latestStatus('a5')?.status).toBe('building')
    await vi.advanceTimersByTimeAsync(statusMs * 3)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('lets a watcher that comes straight back share the request already out', async () => {
    const fetch = answering(status('a8', 'building'))
    watchStatus('a8', vi.fn())()
    const listener = vi.fn()
    const stop = watchStatus('a8', listener)
    await settle()
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(statusMs)
    expect(fetch).toHaveBeenCalledTimes(2)
    stop()
  })

  // A seed is what the caller knew, not an answer: the latest answer stays empty until the route
  // has been asked, and each caller reads its own seed until then.
  it('starts from what the caller knows and asks only when the interval is up', async () => {
    const fetch = answering(status('a6', 'ready'))
    const stop = watchStatus('a6', vi.fn(), status('a6', 'building'))
    await settle()
    expect(fetch).not.toHaveBeenCalled()
    expect(latestStatus('a6')).toBeUndefined()
    await vi.advanceTimersByTimeAsync(statusMs)
    expect(latestStatus('a6')?.status).toBe('ready')
    stop()
  })

  it('asks nothing when what the caller knows is already settled', async () => {
    const fetch = answering(status('a9', 'building'))
    const stop = watchStatus('a9', vi.fn(), status('a9', 'ready'))
    await vi.advanceTimersByTimeAsync(statusMs * 3)
    expect(fetch).not.toHaveBeenCalled()
    stop()
  })

  it('asks again after a failed request', async () => {
    const fetch = vi.fn(() => Promise.resolve(new Response('', { status: 500 })))
    vi.stubGlobal('fetch', fetch)
    const stop = watchStatus('a7', vi.fn())
    await settle()
    expect(latestStatus('a7')).toBeUndefined()
    await vi.advanceTimersByTimeAsync(statusMs)
    expect(fetch).toHaveBeenCalledTimes(2)
    stop()
  })
})
