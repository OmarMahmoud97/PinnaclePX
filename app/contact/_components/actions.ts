'use server'

import { CONFIG } from '@/lib/config'
import { contactSchema } from '@/lib/contact/schema'
import { hitLimit } from '@/lib/db/rate-limit'
import { contactNoticeEmail } from '@/lib/email/contact-notice'
import { sendEmail } from '@/lib/email/send'
import { env } from '@/lib/env'
import { err, ok, type Result } from '@/lib/errors'
import { identityHashFrom } from '@/lib/identity/hmac'
import { log } from '@/lib/log'
import { callerAddress } from '@/lib/rate-limit/request'

// Why a message did not go (ADR 0040): something failed on our side, the limits are reached, or
// the message was refused, by the hidden field, the time the form was open or the schema. The page
// words each one (contact-copy.ts, REFUSED), and counts it.
export type ContactRefusal = 'retry' | 'too_many' | 'rejected'

// The page checks each field so the visitor hears at once; this checks the whole message again,
// because a browser is not a trust boundary. Then the limits, by address and by person, and one
// email to the owner that a reply sends back to the visitor. Nothing is kept but the two counts,
// and nothing is sent to the visitor. The send is awaited, never left to after(), so a failure
// reaches the page, where the visitor's words are still waiting to go again. Validate, delegate,
// respond.
//
// What the form sends is its three fields, how long it has been open, and a field no person sees.
// The argument itself is unknown, not only its fields: a crafted request can send anything in its
// place, or nothing, and that is refused like a filled hidden field.
export async function submitContact(input: unknown): Promise<Result<null, ContactRefusal>> {
  const submission =
    typeof input === 'object' && input !== null ? (input as Record<string, unknown>) : {}
  const { fields, openedForMs, website } = submission
  const opened =
    typeof openedForMs === 'number' && Number.isFinite(openedForMs) ? openedForMs : null
  if (website !== '' || opened === null || opened < CONFIG.form.minMs) {
    log.warn('contact.honeypot', {
      openedForMs: opened === null ? null : Math.round(opened),
      filled: typeof website === 'string' && website !== '',
    })
    return err('rejected')
  }
  const parsed = contactSchema.safeParse(fields)
  if (!parsed.success) {
    log.warn('contact.rejected', { issues: parsed.error.issues.length })
    return err('rejected')
  }
  const { message, name, email } = parsed.data
  // Where a failure happened, for the log: counting the limits, or sending the email.
  let step: 'limit' | 'send' = 'limit'
  const deliver = async (): Promise<Result<null, ContactRefusal>> => {
    // Both limits count before the send, so a try after a failure counts again; the numbers
    // leave room for that (CONFIG.rateLimit).
    const [byIp, byIdentity] = await Promise.all([
      hitLimit({
        scope: 'contact-ip',
        subject: await callerAddress(),
        ...CONFIG.rateLimit.contactPerIp,
      }),
      hitLimit({
        scope: 'contact-identity',
        subject: identityHashFrom(email, env.HMAC_SECRET),
        ...CONFIG.rateLimit.contactPerIdentity,
      }),
    ])
    if (!byIp || !byIdentity) {
      log.warn('contact.rate_limited', { byIp: !byIp, byIdentity: !byIdentity })
      return err('too_many')
    }
    step = 'send'
    const id = await sendEmail(env.OWNER_EMAIL, contactNoticeEmail({ name, email, message }))
    // Shapes and counts only: never the visitor's name, email or their own words.
    log.info('contact.sent', { id, chars: message.length, lines: message.split('\n').length })
    return ok(null)
  }
  // The server's deadline, sooner than the page's (CONFIG.contact.send.serverMs): the page sends
  // its Server Actions one at a time, so an answer that never came would hold the visitor's next
  // try back behind this one. A count or an email still on its way may yet land.
  let timer: ReturnType<typeof setTimeout> | undefined
  const late = new Promise<'late'>((resolve) => {
    timer = setTimeout(resolve, CONFIG.contact.send.serverMs, 'late')
  })
  try {
    const outcome = await Promise.race([deliver(), late])
    if (outcome !== 'late') return outcome
    log.error('contact.failed', { step, reason: 'deadline' })
    return err('retry')
  } catch (error) {
    // The error's name alone, never its message, which can quote the visitor's address. A second
    // email to the owner, should a send outlive the page's wait, is harmless; a visitor who cannot
    // send again is not, so nothing here holds a try back (ADR 0040).
    log.error('contact.failed', { step, reason: error instanceof Error ? error.name : 'unknown' })
    return err('retry')
  } finally {
    clearTimeout(timer)
  }
}
