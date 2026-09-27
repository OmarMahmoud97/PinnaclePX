import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ContactRefusal } from '@/app/contact/_components/actions'
import { FAILED, REFUSED } from '@/app/contact/_components/contact-copy'
import {
  failureOf,
  outcomeOf,
  passing,
  type SendFailure,
  sendMessage,
} from '@/app/contact/_components/send-contact'
import { CONFIG } from '@/lib/config'
import { err, ok, type Result } from '@/lib/errors'

const { timeoutMs } = CONFIG.contact.send

// A server that answers after `ms`.
function answering(result: Result<null, ContactRefusal>, ms = 500) {
  return vi.fn(
    () =>
      new Promise<Result<null, ContactRefusal>>((resolve) => {
        setTimeout(resolve, ms, result)
      }),
  )
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('sendMessage', () => {
  it('waits out the floor before it asks, then carries the answer', async () => {
    const submit = answering(ok(null))
    const sent = sendMessage({ submit, waitMs: 1_200, timeoutMs })
    await vi.advanceTimersByTimeAsync(1_199)
    expect(submit).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    expect(submit).toHaveBeenCalledOnce()
    await vi.advanceTimersByTimeAsync(500)
    expect(await sent).toEqual(ok(null))
  })

  it('asks at once when the floor is already behind it', async () => {
    const submit = answering(ok(null), 0)
    const sent = sendMessage({ submit, waitMs: 0, timeoutMs })
    expect(submit).toHaveBeenCalledOnce()
    await vi.advanceTimersByTimeAsync(0)
    expect(await sent).toEqual(ok(null))
  })

  it('carries the server’s refusal', async () => {
    const sent = sendMessage({ submit: answering(err('too_many')), waitMs: 0, timeoutMs })
    await vi.advanceTimersByTimeAsync(500)
    expect(await sent).toEqual(err('too_many'))
  })

  it('gives up when no answer comes in time', async () => {
    const sent = sendMessage({ submit: answering(ok(null), timeoutMs + 1), waitMs: 0, timeoutMs })
    await vi.advanceTimersByTimeAsync(timeoutMs)
    expect(await sent).toEqual(err('timeout'))
  })

  it('says the connection dropped when the request never lands, and never throws', async () => {
    const submit = vi.fn(() => Promise.reject(new TypeError('Failed to fetch')))
    expect(await sendMessage({ submit, waitMs: 0, timeoutMs })).toEqual(err('network'))
  })
})

describe('what a failed send says and counts', () => {
  it('words each failure, keeps the words where a retry may pass, and offers the call once spent', () => {
    expect(failureOf('retry')).toEqual({ message: REFUSED.retry, call: false, kept: true })
    expect(failureOf('timeout')).toEqual({ message: REFUSED.retry, call: false, kept: true })
    expect(failureOf('network')).toEqual({ message: FAILED, call: false, kept: true })
    expect(failureOf('too_many')).toEqual({ message: REFUSED.too_many, call: true, kept: false })
    expect(failureOf('rejected')).toEqual({ message: REFUSED.rejected, call: false, kept: false })
  })

  it('counts a dropped connection as a retry, and only passing failures towards the call', () => {
    const failures: SendFailure[] = ['retry', 'timeout', 'too_many', 'rejected', 'network']
    expect(failures.map(outcomeOf)).toEqual(['retry', 'timeout', 'too_many', 'rejected', 'retry'])
    expect(failures.filter(passing)).toEqual(['retry', 'timeout', 'network'])
  })
})
