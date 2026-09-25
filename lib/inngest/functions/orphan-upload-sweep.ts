import 'server-only'
import { list } from '@vercel/blob'
import { cron } from 'inngest'
import { deleteBlobs } from '@/lib/blob/delete'
import type { UploadKind } from '@/lib/brief/uploads'
import { CONFIG } from '@/lib/config'
import { urlReferencedElsewhere } from '@/lib/db/retention'
import { env } from '@/lib/env'
import { inngest } from '@/lib/inngest/client'
import { log } from '@/lib/log'

const HOUR_MS = 3_600_000

// The folders the browser uploads into, one per kind (lib/brief/uploads.ts). The pipeline's own
// files sit elsewhere and are recorded against their submission as they are written.
const FOLDERS: Readonly<Record<UploadKind, string>> = { logos: 'logos/', photos: 'photos/' }

// No submission has an empty slug (lib/identity/slug.ts), so a file referenced by a submission
// other than this one is referenced by any submission at all.
const NO_SUBMISSION = ''

type Stored = Readonly<{ url: string; uploadedAt: Date }>

// Every file in the upload folders, page by page.
async function storedUploads(): Promise<Stored[]> {
  const stored: Stored[] = []
  for (const prefix of Object.values(FOLDERS)) {
    let cursor: string | undefined
    do {
      const page = await list({
        prefix,
        token: env.BLOB_READ_WRITE_TOKEN,
        ...(cursor === undefined ? {} : { cursor }),
      })
      stored.push(...page.blobs.map(({ url, uploadedAt }) => ({ url, uploadedAt })))
      cursor = page.hasMore ? page.cursor : undefined
    } while (cursor !== undefined)
  }
  return stored
}

// Deletes the pictures nobody sent: uploads older than CONFIG.retention.unsentHours that no
// submission points at (blob_ref, written when a brief is stored). A picture is uploaded the
// moment it is chosen, long before the brief is sent, so without this a visitor who leaves
// half-way would leave their logo and photos on the store for good. How many went.
export async function sweepUnsentUploads(now: number): Promise<number> {
  const before = now - CONFIG.retention.unsentHours * HOUR_MS
  const stale = (await storedUploads()).filter((file) => file.uploadedAt.getTime() < before)
  const unsent: string[] = []
  for (const { url } of stale) {
    if (!(await urlReferencedElsewhere(url, NO_SUBMISSION))) unsent.push(url)
  }
  await deleteBlobs(unsent)
  return unsent.length
}

// The promise on /privacy: a picture that is never sent is gone within two days. Runs nightly
// with the retention sweep, in one step, which a retry repeats safely: a file already deleted is
// not listed again.
export const orphanUploadSweep = inngest.createFunction(
  { id: 'orphan-upload-sweep', retries: 1, triggers: [cron(CONFIG.retention.cron)] },
  async ({ step }) =>
    step.run('sweep', async () => {
      const deleted = await sweepUnsentUploads(Date.now())
      log.info('uploads.swept', { deleted })
      return { deleted }
    }),
)
