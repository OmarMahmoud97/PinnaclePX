import 'server-only'
import { del } from '@vercel/blob'
import { env } from '@/lib/env'

// Removes files from Blob. Nothing to do for an empty list; a URL that is already gone is not
// an error to the store, so a retried sweep is safe.
export async function deleteBlobs(urls: readonly string[]): Promise<void> {
  if (urls.length === 0) return
  await del([...urls], { token: env.BLOB_READ_WRITE_TOKEN })
}
