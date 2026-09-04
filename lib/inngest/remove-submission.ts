import 'server-only'
import { deleteBlobs } from '@/lib/blob/delete'
import { blobUrlsIn } from '@/lib/blob/urls'
import { deleteSubmission, urlReferencedElsewhere } from '@/lib/db/retention'
import { readSubmission } from '@/lib/db/submissions'

// Removes one submission and the files on Blob that only it points at. Null when the row is
// already gone, which a retried step may find; otherwise how many files went with it.
export async function removeSubmission(slug: string): Promise<number | null> {
  const row = await readSubmission(slug)
  if (row === null) return null
  const urls: string[] = []
  for (const url of blobUrlsIn(row)) {
    if (!(await urlReferencedElsewhere(url, slug))) urls.push(url)
  }
  await deleteBlobs(urls)
  await deleteSubmission(slug)
  return urls.length
}
