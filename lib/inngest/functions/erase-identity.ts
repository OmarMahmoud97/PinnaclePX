import 'server-only'
import { deleteBlobs } from '@/lib/blob/delete'
import {
  blobUrlsOf,
  deleteIdentity,
  deleteSubmission,
  submissionsOf,
  urlReferencedElsewhere,
} from '@/lib/db/retention'
import { env } from '@/lib/env'
import { identityHashFrom } from '@/lib/identity/hmac'
import { inngest } from '@/lib/inngest/client'
import { identityErase } from '@/lib/inngest/events'
import { log } from '@/lib/log'

// Erasure and reset for one address: every submission and its pictures, the seen rows and the
// lead. Sent by the owner from the Inngest dashboard (or the dev server's UI) as
// admin/identity.erase with the email; the address itself never reaches the log.
export const eraseIdentity = inngest.createFunction(
  { id: 'erase-identity', retries: 1, triggers: [identityErase] },
  async ({ event, step }) => {
    const identityHash = identityHashFrom(event.data.email, env.HMAC_SECRET)
    const slugs = await step.run('find', async () =>
      (await submissionsOf(identityHash)).map((row) => row.slug),
    )
    for (const slug of slugs) {
      await step.run(`remove-${slug}`, async () => {
        const row = (await submissionsOf(identityHash)).find((r) => r.slug === slug)
        if (row === undefined) return
        const urls: string[] = []
        for (const url of blobUrlsOf(row)) {
          if (!(await urlReferencedElsewhere(url, slug))) urls.push(url)
        }
        await deleteBlobs(urls)
        await deleteSubmission(slug)
      })
    }
    await step.run('forget', () => deleteIdentity(identityHash))
    log.info('identity.erased', { submissions: slugs.length })
    return { submissions: slugs.length }
  },
)
