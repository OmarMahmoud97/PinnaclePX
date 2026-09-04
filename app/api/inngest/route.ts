import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest/client'
import { buildConcepts } from '@/lib/inngest/functions/build-concepts'
import { eraseIdentity } from '@/lib/inngest/functions/erase-identity'
import { retentionSweep } from '@/lib/inngest/functions/retention-sweep'
import { sendPreviewLink } from '@/lib/inngest/functions/send-preview-link'
import { sweepDeadline } from '@/lib/inngest/functions/sweep-deadline'

// Steps run as separate invocations of this route, so the limit applies to one step at a time;
// the imagery stage, the longest, stays well inside it. Streaming keeps a long step alive.
export const maxDuration = 300

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [buildConcepts, sweepDeadline, sendPreviewLink, retentionSweep, eraseIdentity],
  streaming: true,
})
