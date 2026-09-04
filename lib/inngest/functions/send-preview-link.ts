import 'server-only'
import { NonRetriableError } from 'inngest'
import { submissionAnswersSchema } from '@/lib/brief/submission'
import { markEmailSent, readSubmissionWithLead } from '@/lib/db/submissions'
import { previewLinkEmail } from '@/lib/email/preview-link'
import { sendEmail } from '@/lib/email/send'
import { env } from '@/lib/env'
import { inngest } from '@/lib/inngest/client'
import { submissionReady } from '@/lib/inngest/events'
import { log } from '@/lib/log'
import { statusOf } from '@/lib/preview/status'
import { SITE } from '@/lib/site'

// The email with the link, once. The pipeline and the sweeper both say when a submission has
// settled; the function is idempotent on the slug and the row remembers the send, so a second
// signal changes nothing. Nothing is sent for an exhausted or failed submission: there is no
// page to link to, and the done page has already said so.
export const sendPreviewLink = inngest.createFunction(
  {
    id: 'send-preview-link',
    retries: 2,
    idempotency: 'event.data.slug',
    triggers: [submissionReady],
  },
  async ({ event, step }) => {
    const { slug } = event.data
    return step.run('send', async () => {
      const found = await readSubmissionWithLead(slug)
      if (found === null) throw new NonRetriableError(`No submission ${slug}`)
      const status = statusOf(found.submission)
      if (status.status !== 'ready') return { slug, sent: false, reason: status.status }
      if (found.submission.emailSentAt !== null) return { slug, sent: false, reason: 'already' }
      const answers = submissionAnswersSchema.parse(found.submission.answers)
      const email = previewLinkEmail({
        name: found.lead.name,
        company: answers.company,
        previewUrl: `${env.NEXT_PUBLIC_APP_URL}/preview/${slug}`,
        bookingUrl: SITE.bookingUrl,
        conceptCount: found.submission.conceptCount,
      })
      const id = await sendEmail(found.lead.email, email)
      await markEmailSent(slug)
      log.info('email.sent', { slug, id })
      return { slug, sent: true }
    })
  },
)
