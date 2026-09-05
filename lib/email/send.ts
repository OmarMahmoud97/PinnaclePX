import 'server-only'
import { Resend } from 'resend'
import { CONFIG } from '@/lib/config'
import type { EmailMessage } from '@/lib/email/message'
import { env } from '@/lib/env'
import { AppError } from '@/lib/errors'

const resend = new Resend(env.RESEND_API_KEY)

// Sends one email. Throws when Resend refuses, so the caller can say so; the message id is
// returned for the log. The sender is the verified domain's address once there is one, and
// Resend's own test sender until then, which reaches only the account owner's address.
export async function sendEmail(to: string, email: EmailMessage): Promise<string> {
  const { data, error } = await resend.emails.send({
    from: env.RESEND_FROM ?? CONFIG.email.testSender,
    to,
    subject: email.subject,
    text: email.text,
    html: email.html,
  })
  if (error !== null) throw new AppError(`Resend refused the email: ${error.message}`)
  return data.id
}
