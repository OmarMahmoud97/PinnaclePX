import type { SendRefusal } from '@/app/start/_components/actions'
import type { SubmitError, Submitted } from '@/app/start/_components/brief-reducer'
import { SEND_FAILED, SEND_REFUSED } from '@/app/start/_components/start-copy'
import { err, type Result } from '@/lib/errors'

// How a send can fail (docs/start-page-journey-plan.md, 4.8): as the server refused it, with no
// answer in time, or with no connection at all.
export type SendFailure = SendRefusal | 'timeout' | 'network'

type Send = Readonly<{
  // The request itself, made only once the wait is over, so the time it reports the form open for
  // is the time it actually was.
  submit: () => Promise<Result<Submitted, SendRefusal>>
  // How long to wait before asking: what is left of the floor a person's pace clears
  // (CONFIG.form.minMs), so the server never takes the brief for a bot's.
  waitMs: number
  // How long an answer may take before the send gives up (CONFIG.start.send.timeoutMs). The
  // request may still land; the same answers sent again return the same submission.
  timeoutMs: number
}>

// The brief on its way: the floor waited out, then the server's answer, or its refusal, or a
// timeout, or a dropped connection. It never throws.
export async function sendBrief({
  submit,
  waitMs,
  timeoutMs,
}: Send): Promise<Result<Submitted, SendFailure>> {
  if (waitMs > 0) {
    await new Promise((resolve) => {
      setTimeout(resolve, waitMs)
    })
  }
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<Result<never, SendFailure>>((resolve) => {
    timer = setTimeout(resolve, timeoutMs, err('timeout'))
  })
  try {
    return await Promise.race([submit(), timeout])
  } catch {
    return err('network')
  } finally {
    clearTimeout(timer)
  }
}

// The ask's error for each failure. The server's refusals and a timeout have the words the server
// gives, a dropped connection is told so, and a day's sends spent offer the call with the words.
export function failureOf(failure: SendFailure): SubmitError {
  switch (failure) {
    case 'network':
      return { message: SEND_FAILED, call: false }
    case 'timeout':
      return { message: SEND_REFUSED.retry, call: false }
    default:
      return { message: SEND_REFUSED[failure], call: failure === 'too_many' }
  }
}

// The failure as send_outcome counts it: a dropped connection is a retry like any other.
export function outcomeOf(failure: SendFailure): Exclude<SendFailure, 'network'> {
  return failure === 'network' ? 'retry' : failure
}
