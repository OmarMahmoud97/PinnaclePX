'use server'

import { briefSchema } from '@/lib/brief/schema'
import { type SubmissionAnswers, submissionAnswersFrom } from '@/lib/brief/submission'
import { CONFIG } from '@/lib/config'
import { upsertLead } from '@/lib/db/leads'
import { hitLimit } from '@/lib/db/rate-limit'
import { createOrFindSubmission, findSubmission, markEventSent } from '@/lib/db/submissions'
import { env } from '@/lib/env'
import { err, ok, type Result } from '@/lib/errors'
import { identityHashFrom } from '@/lib/identity/hmac'
import { payloadHashFrom } from '@/lib/identity/payload'
import { newSlug } from '@/lib/identity/slug'
import { inngest } from '@/lib/inngest/client'
import { submissionCreated } from '@/lib/inngest/events'
import { log } from '@/lib/log'
import { callerAddress } from '@/lib/rate-limit/request'
import { conceptCountFor } from '@/lib/select/select'
import { READY_TEMPLATES } from '@/templates/registry'

type Submitted = Readonly<{ slug: string; deadlineAt: string; conceptCount: number }>

// What the form sends besides the answers: how long it has been open, and a field no person
// sees. A bot fills the field, or finishes in no time.
export type Submission = Readonly<{ answers: unknown; openedForMs: number; website: string }>

// Why a brief did not go (docs/start-page-journey-plan.md, 4.8): something failed on our side,
// the day's limit is reached, or the answers were refused, by the hidden field, the time the form
// was open or the schema. The page words each one (start-copy.ts, SEND_REFUSED), and counts it.
export type SendRefusal = 'retry' | 'too_many' | 'rejected'

// The client validates each question so the visitor gets a quick answer; this validates the whole
// brief again, because a browser is not a trust boundary. Then: the identity from the email, the
// submission these same answers already made, if any, or else the day's limits, the lead row and
// a new submission, and the one event that starts the pipeline. Validate, delegate, respond.
export async function submitBrief(input: Submission): Promise<Result<Submitted, SendRefusal>> {
  if (input.website !== '' || input.openedForMs < CONFIG.form.minMs) {
    log.warn('brief.honeypot', { openedForMs: input.openedForMs, filled: input.website !== '' })
    return err('rejected')
  }
  const parsed = await briefSchema.safeParseAsync(input.answers)
  if (!parsed.success) {
    log.warn('brief.rejected', { issues: parsed.error.issues.length })
    return err('rejected')
  }
  const brief = parsed.data
  try {
    const answers = submissionAnswersFrom(brief)
    const identityHash = identityHashFrom(brief.email, env.HMAC_SECRET)
    const payloadHash = payloadHashFrom(identityHash, answers)
    // The same answers from the same person again, after a reload or a second press, are the
    // submission they already made. It is answered before the day's limits count anything, so a
    // resend never uses up a send.
    const existing = await findSubmission(payloadHash)
    const found =
      existing === null
        ? await createWithinLimits(brief, answers, identityHash, payloadHash)
        : { ...existing, created: false }
    if (found === null) return err('too_many')
    // A resend is harmless: the function is idempotent on the slug for a day. Locally this is
    // where a missing Inngest dev server shows up, so the step is named in the log.
    if (found.eventSentAt === null) {
      try {
        await inngest.send(submissionCreated.create({ slug: found.slug }))
      } catch (error) {
        log.error('submission.failed', {
          step: 'send',
          slug: found.slug,
          reason: error instanceof Error ? error.message : 'unknown',
        })
        return err('retry')
      }
      await markEventSent(found.slug)
    }
    // Shapes and counts only: never the visitor's name, email, company or their own words.
    log.info('submission.received', {
      slug: found.slug,
      created: found.created,
      logo: answers.logo.kind,
      style: answers.imagery.style,
      photos: answers.imagery.photos.length,
      colours: answers.colours.kind,
    })
    return ok({
      slug: found.slug,
      deadlineAt: found.deadlineAt.toISOString(),
      conceptCount: found.conceptCount,
    })
  } catch (error) {
    log.error('submission.failed', {
      step: 'store',
      reason: error instanceof Error ? error.message : 'unknown',
    })
    return err('retry')
  }
}

// Who a lead is: what the lead row keeps of the brief.
type Lead = Readonly<{ email: string; name: string; company: string }>

// A new brief: counted against the day's limits, by address and by person, then kept with its
// lead. Null over either limit.
async function createWithinLimits(
  lead: Lead,
  answers: SubmissionAnswers,
  identityHash: string,
  payloadHash: string,
) {
  const [byIp, byIdentity] = await Promise.all([
    hitLimit({
      scope: 'submit-ip',
      subject: await callerAddress(),
      ...CONFIG.rateLimit.submissionsPerIp,
    }),
    hitLimit({
      scope: 'submit-identity',
      subject: identityHash,
      ...CONFIG.rateLimit.submissionsPerIdentity,
    }),
  ])
  if (!byIp || !byIdentity) {
    log.warn('brief.rate_limited', { byIp: !byIp, byIdentity: !byIdentity })
    return null
  }
  await upsertLead({ identityHash, email: lead.email, name: lead.name, company: lead.company })
  return createOrFindSubmission({
    slug: newSlug(),
    identityHash,
    payloadHash,
    answers,
    conceptCount: conceptCountFor(READY_TEMPLATES.length),
    deadlineAt: new Date(Date.now() + CONFIG.deadline.totalMs),
  })
}
