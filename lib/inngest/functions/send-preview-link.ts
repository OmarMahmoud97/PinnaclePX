import 'server-only'
import { NonRetriableError } from 'inngest'
import { submissionAnswersSchema } from '@/lib/brief/submission'
import { readModelCalls } from '@/lib/db/model-calls'
import {
  markEmailSent,
  markOwnerNotified,
  readSubmissionWithLead,
  STAGES,
  type SubmissionRow,
} from '@/lib/db/submissions'
import { ownerNoticeEmail } from '@/lib/email/owner-notice'
import { previewLinkEmail } from '@/lib/email/preview-link'
import { sendEmail } from '@/lib/email/send'
import { env } from '@/lib/env'
import { inngest } from '@/lib/inngest/client'
import { submissionReady } from '@/lib/inngest/events'
import { log } from '@/lib/log'
import { statusOf } from '@/lib/preview/status'
import { SITE } from '@/lib/site'

type Outcome = Readonly<{ sent: boolean; reason?: string }>

const STAGE_COLUMN = {
  select: 'stageSelect',
  tokens: 'stageTokens',
  brief: 'stageBrief',
  copy: 'stageCopy',
  imagery: 'stageImagery',
} as const

async function load(slug: string) {
  const found = await readSubmissionWithLead(slug)
  if (found === null) throw new NonRetriableError(`No submission ${slug}`)
  return { ...found, status: statusOf(found.submission) }
}

// The visitor's email, once. Sent only when every stage finished: a page the sweeper had to
// settle with a fallback is opened from the screen but not announced, and the log says so.
// Nothing is sent for an exhausted or failed submission either: there is no page to link to.
async function sendToVisitor(slug: string): Promise<Outcome> {
  const { submission, lead, status } = await load(slug)
  if (status.status !== 'ready') {
    log.warn('email.withheld', { slug, status: status.status })
    return { sent: false, reason: status.status }
  }
  if (submission.emailSentAt !== null) return { sent: false, reason: 'already' }
  const answers = submissionAnswersSchema.parse(submission.answers)
  const email = previewLinkEmail({
    name: lead.name,
    company: answers.company,
    previewUrl: `${env.NEXT_PUBLIC_APP_URL}/preview/${slug}`,
    bookingUrl: SITE.bookingUrl,
    conceptCount: submission.conceptCount,
  })
  const id = await sendEmail(lead.email, email)
  await markEmailSent(slug)
  log.info('email.sent', { slug, id })
  return { sent: true }
}

const fallbackStagesOf = (row: SubmissionRow) =>
  STAGES.filter((stage) => row[STAGE_COLUMN[stage]] === 'fallback')

// The owner's notice, once: sent whenever there is a page, partial or not, because the owner
// wants to know of every build and what it cost. Nothing is sent when nothing was built.
async function notifyOwner(slug: string): Promise<Outcome> {
  const { submission, lead, status } = await load(slug)
  if (status.status !== 'ready' && status.status !== 'partial') {
    return { sent: false, reason: status.status }
  }
  if (submission.ownerNotifiedAt !== null) return { sent: false, reason: 'already' }
  const email = ownerNoticeEmail({
    lead: { name: lead.name, email: lead.email, company: lead.company },
    answers: submissionAnswersSchema.parse(submission.answers),
    slug,
    appUrl: env.NEXT_PUBLIC_APP_URL,
    status: status.status,
    fallbackStages: fallbackStagesOf(submission),
    concepts: status.concepts.flatMap((concept) =>
      concept.templateId === null
        ? []
        : [{ templateId: concept.templateId, name: concept.name ?? concept.templateId }],
    ),
    submittedAt: submission.createdAt,
    calls: await readModelCalls(slug),
  })
  const id = await sendEmail(env.OWNER_EMAIL, email)
  await markOwnerNotified(slug)
  log.info('owner.notified', { slug, id })
  return { sent: true }
}

// The two emails a settled submission earns, one step each. The pipeline and the sweeper both
// say when a submission has settled; the function is idempotent on the slug and the row
// remembers each send, so a second signal changes nothing. The visitor's email goes first, and
// a failure in either step retries that step alone, without sending the other again.
export const sendPreviewLink = inngest.createFunction(
  {
    id: 'send-preview-link',
    retries: 2,
    idempotency: 'event.data.slug',
    triggers: [submissionReady],
  },
  async ({ event, step }) => {
    const { slug } = event.data
    const visitor = await step.run('send', () => sendToVisitor(slug))
    const owner = await step.run('notify-owner', () => notifyOwner(slug))
    return { slug, visitor, owner }
  },
)
