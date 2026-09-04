'use server'

import { briefSchema } from '@/lib/brief/schema'
import { submissionAnswersFrom } from '@/lib/brief/submission'
import { CONFIG } from '@/lib/config'
import { upsertLead } from '@/lib/db/leads'
import { createOrFindSubmission, markEventSent } from '@/lib/db/submissions'
import { env } from '@/lib/env'
import { err, ok, type Result } from '@/lib/errors'
import { identityHashFrom } from '@/lib/identity/hmac'
import { payloadHashFrom } from '@/lib/identity/payload'
import { newSlug } from '@/lib/identity/slug'
import { inngest } from '@/lib/inngest/client'
import { submissionCreated } from '@/lib/inngest/events'
import { log } from '@/lib/log'
import { conceptCountFor } from '@/lib/select/select'
import { READY_TEMPLATES } from '@/templates/registry'

type Submitted = Readonly<{ slug: string; deadlineAt: string; conceptCount: number }>

const RETRY = 'Something went wrong on our side. Give it a moment and try again.'

// The client validates each question so the visitor gets a quick answer; this validates the whole
// brief again, because a browser is not a trust boundary. Then: the identity from the email, the
// lead row, the submission row (or the one an identical submission already made), and the one
// event that starts the pipeline. Validate, delegate, respond.
export async function submitBrief(input: unknown): Promise<Result<Submitted>> {
  const parsed = await briefSchema.safeParseAsync(input)
  if (!parsed.success) {
    log.warn('brief.rejected', { issues: parsed.error.issues.length })
    return err('Something in your answers did not look right. Go back and check them.')
  }
  const brief = parsed.data
  try {
    const answers = submissionAnswersFrom(brief)
    const identityHash = identityHashFrom(brief.email, env.HMAC_SECRET)
    const payloadHash = payloadHashFrom(identityHash, answers)
    await upsertLead({ identityHash, email: brief.email, name: brief.name, company: brief.company })
    const found = await createOrFindSubmission({
      slug: newSlug(),
      identityHash,
      payloadHash,
      answers,
      conceptCount: conceptCountFor(READY_TEMPLATES.length),
      deadlineAt: new Date(Date.now() + CONFIG.deadline.totalMs),
    })
    // A resend is harmless: the function is idempotent on the slug for a day.
    if (found.eventSentAt === null) {
      await inngest.send(submissionCreated.create({ slug: found.slug }))
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
    log.error('submission.failed', { reason: error instanceof Error ? error.message : 'unknown' })
    return err(RETRY)
  }
}
