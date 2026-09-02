import { Inngest } from 'inngest'
import { env } from '@/lib/env'

// The single Inngest client. Functions live one per file under lib/inngest/functions/.
// Keys are passed explicitly so nothing outside lib/env.ts reads process.env.
export const inngest = new Inngest({
  id: 'pinnaclepx',
  eventKey: env.INNGEST_EVENT_KEY,
  signingKey: env.INNGEST_SIGNING_KEY,
})
