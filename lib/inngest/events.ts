import { eventType } from 'inngest'
import * as z from 'zod'

// The one event the form sends: a submission exists and the pipeline should build it. Every
// stage reads what it needs from the row, so the event carries only the slug.
export const submissionCreated = eventType('pipeline/submission.created', {
  schema: z.object({ slug: z.string().min(1) }),
})

// Sent by the owner, from the Inngest dashboard or the dev server's UI, to erase one address.
export const identityErase = eventType('admin/identity.erase', {
  schema: z.object({ email: z.email() }),
})

// Every stage has settled, by the pipeline or by the sweeper: the link can go out.
export const submissionReady = eventType('pipeline/submission.ready', {
  schema: z.object({ slug: z.string().min(1) }),
})
