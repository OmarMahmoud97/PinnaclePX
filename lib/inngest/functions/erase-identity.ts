import 'server-only'
import { deleteIdentity, slugsOf } from '@/lib/db/retention'
import { env } from '@/lib/env'
import { identityHashFrom } from '@/lib/identity/hmac'
import { inngest } from '@/lib/inngest/client'
import { identityErase } from '@/lib/inngest/events'
import { removeSubmission } from '@/lib/inngest/remove-submission'
import { log } from '@/lib/log'

// Erasure and reset for one address: every submission and its pictures, the seen rows and the
// lead. Sent by the owner from the Inngest dashboard (or the dev server's UI) as
// admin/identity.erase with the email; the address itself never reaches the log.
export const eraseIdentity = inngest.createFunction(
  { id: 'erase-identity', retries: 1, triggers: [identityErase] },
  async ({ event, step }) => {
    const identityHash = identityHashFrom(event.data.email, env.HMAC_SECRET)
    const slugs = await step.run('find', () => slugsOf(identityHash))
    for (const slug of slugs) {
      await step.run(`remove-${slug}`, () => removeSubmission(slug))
    }
    await step.run('forget', () => deleteIdentity(identityHash))
    log.info('identity.erased', { submissions: slugs.length })
    return { submissions: slugs.length }
  },
)
