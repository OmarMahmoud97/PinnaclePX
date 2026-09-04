import 'server-only'
import { cron } from 'inngest'
import { CONFIG } from '@/lib/config'
import {
  deleteLeadsWithoutSubmissions,
  deleteRateLimitsBefore,
  slugsCreatedBefore,
} from '@/lib/db/retention'
import { inngest } from '@/lib/inngest/client'
import { removeSubmission } from '@/lib/inngest/remove-submission'
import { log } from '@/lib/log'

const DAY_MS = 86_400_000

// The promise on the page: a link stays live for the retention period, then the submission,
// its pictures and, once nothing of theirs is left, the lead are removed. `seen` stays, because
// the exclusivity promise outlives the preview. Runs nightly; each submission is its own step,
// so a failure removes what it can and the rest goes next night.
export const retentionSweep = inngest.createFunction(
  { id: 'retention-sweep', retries: 1, triggers: [cron(CONFIG.retention.cron)] },
  async ({ step }) => {
    const before = new Date(Date.now() - CONFIG.retention.days * DAY_MS)
    const expired = await step.run('find-expired', () => slugsCreatedBefore(before))
    for (const slug of expired) {
      await step.run(`remove-${slug}`, async () => {
        const blobs = await removeSubmission(slug)
        if (blobs !== null) log.info('retention.removed', { slug, blobs })
      })
    }
    return step.run('tidy', async () => {
      const leads = await deleteLeadsWithoutSubmissions()
      const windows = await deleteRateLimitsBefore(new Date(Date.now() - 2 * DAY_MS))
      log.info('retention.swept', { submissions: expired.length, leads, windows })
      return { submissions: expired.length, leads, windows }
    })
  },
)
