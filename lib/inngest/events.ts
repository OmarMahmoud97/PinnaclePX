import { eventType } from 'inngest'
import { z } from 'zod'

// The one event the form sends: a submission exists and the pipeline should build it. Every
// stage reads what it needs from the row, so the event carries only the slug.
export const submissionCreated = eventType('pipeline/submission.created', {
  schema: z.object({ slug: z.string().min(1) }),
})

// Every stage has settled, by the pipeline or by the sweeper: the link can go out.
export const submissionReady = eventType('pipeline/submission.ready', {
  schema: z.object({ slug: z.string().min(1) }),
})
