import type { ContactRefusal } from '@/app/contact/_components/actions'
import { FAILED, REFUSED } from '@/app/contact/_components/contact-copy'
import { err, type Result } from '@/lib/errors'

// How a message can fail to go (ADR 0040): as the server refused it, with no answer in time, or
// with no connection at all.
export type SendFailure = ContactRefusal | 'timeout' | 'network'

type Send = Readonly<{
  // The request itself, made only once the wait is over, so the time it reports the form open for
  // is the time it actually was.
  submit: () => Promise<Result<null, ContactRefusal>>
  // How long to wait before asking: what is left of the floor a person's pace clears
  // (CONFIG.form.minMs), so the server never takes the message for a bot's.
  waitMs: number
  // How long an answer may take before the send gives up (CONFIG.contact.send.timeoutMs). The
  // request may still land, and a second try then emails the studio twice, which is harmless.
  timeoutMs: number
}>

// The message on its way: the floor waited out, then the server's answer, or its refusal, or a
// timeout, or a dropped connection. It never throws. /start's send, with a message's result.
export async function sendMessage({
  submit,
  waitMs,
  timeoutMs,
}: Send): Promise<Result<null, SendFailure>> {
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

// A failure a second try may clear: the server's own, a timeout, a dropped connection. The alert
// says the words are kept after one, and a run of them offers the call.
export function passing(failure: SendFailure): boolean {
  return failure === 'retry' || failure === 'timeout' || failure === 'network'
}

type FailureWords = Readonly<{ message: string; call: boolean; kept: boolean }>

// The alert's words for each failure. The server's refusals and a timeout have the words the
// deck gives, a dropped connection is told so, and a day's sends spent offer the call with them.
export function failureOf(failure: SendFailure): FailureWords {
  const kept = passing(failure)
  switch (failure) {
    case 'network':
      return { message: FAILED, call: false, kept }
    case 'timeout':
      return { message: REFUSED.retry, call: false, kept }
    default:
      return { message: REFUSED[failure], call: failure === 'too_many', kept }
  }
}

// The failure as contact_submit counts it: a dropped connection is a retry like any other.
export function outcomeOf(failure: SendFailure): Exclude<SendFailure, 'network'> {
  return failure === 'network' ? 'retry' : failure
}
