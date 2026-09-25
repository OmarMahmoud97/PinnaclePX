import type { SendRefusal } from '@/app/start/_components/actions'
import type { Submitted } from '@/app/start/_components/brief-reducer'
import {
  failureOf,
  outcomeOf,
  type SendFailure,
  sendBrief,
} from '@/app/start/_components/send-brief'
import { SEND_FAILED, SEND_REFUSED } from '@/app/start/_components/start-copy'
import { CONFIG } from '@/lib/config'
import { err, ok, type Result } from '@/lib/errors'

const SUBMITTED: Submitted = {
  slug: 'k7m2p9x4w3hd',
  deadlineAt: '2026-09-25T10:05:00.000Z',
  conceptCount: 3,
}

const { timeoutMs } = CONFIG.start.send

// A server that answers after `ms`.
function answering(result: Result<Submitted, SendRefusal>, ms = 500) {
  return vi.fn(
    () =>
      new Promise<Result<Submitted, SendRefusal>>((resolve) => {
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

describe('sendBrief', () => {
  it('waits out the floor before it asks, then carries the answer', async () => {
    const submit = answering(ok(SUBMITTED))
    const sent = sendBrief({ submit, waitMs: 1_200, timeoutMs })
    await vi.advanceTimersByTimeAsync(1_199)
    expect(submit).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    expect(submit).toHaveBeenCalledOnce()
    await vi.advanceTimersByTimeAsync(500)
    expect(await sent).toEqual(ok(SUBMITTED))
  })

  it('asks at once when the floor is already behind it', async () => {
    const submit = answering(ok(SUBMITTED), 0)
    const sent = sendBrief({ submit, waitMs: -400, timeoutMs })
    expect(submit).toHaveBeenCalledOnce()
    await vi.advanceTimersByTimeAsync(0)
    expect(await sent).toEqual(ok(SUBMITTED))
  })

  it('carries the server’s refusal', async () => {
    const sent = sendBrief({ submit: answering(err('too_many')), waitMs: 0, timeoutMs })
    await vi.advanceTimersByTimeAsync(500)
    expect(await sent).toEqual(err('too_many'))
  })

  it('gives up when no answer comes in time', async () => {
    const sent = sendBrief({
      submit: answering(ok(SUBMITTED), timeoutMs + 1),
      waitMs: 0,
      timeoutMs,
    })
    await vi.advanceTimersByTimeAsync(timeoutMs)
    expect(await sent).toEqual(err('timeout'))
  })

  it('says the connection dropped when the request never lands', async () => {
    const submit = vi.fn(() => Promise.reject(new TypeError('Failed to fetch')))
    expect(await sendBrief({ submit, waitMs: 0, timeoutMs })).toEqual(err('network'))
  })
})

describe('what a failed send says and counts', () => {
  it('words each failure as plan 4.8 does, with the call once the day is spent', () => {
    expect(failureOf('retry')).toEqual({ message: SEND_REFUSED.retry, call: false })
    expect(failureOf('timeout')).toEqual({ message: SEND_REFUSED.retry, call: false })
    expect(failureOf('too_many')).toEqual({ message: SEND_REFUSED.too_many, call: true })
    expect(failureOf('rejected')).toEqual({ message: SEND_REFUSED.rejected, call: false })
    expect(failureOf('network')).toEqual({ message: SEND_FAILED, call: false })
  })

  it('counts a dropped connection as a retry', () => {
    const failures: SendFailure[] = ['retry', 'timeout', 'too_many', 'rejected', 'network']
    expect(failures.map(outcomeOf)).toEqual(['retry', 'timeout', 'too_many', 'rejected', 'retry'])
  })
})
