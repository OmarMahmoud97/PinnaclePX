import 'server-only'
import { createHash } from 'node:crypto'
import { uploadShaOf } from '@/lib/brief/uploads'
import { CONFIG } from '@/lib/config'
import { download } from '@/lib/download'
import { AppError } from '@/lib/errors'

export type VerifiedUpload = Readonly<{ bytes: Buffer; sha: string }>

// A visitor's upload read back from Blob and checked against the hash in its path. The browser
// named the file by its own SHA-256 and the token route took that name on trust, so the bytes
// are checked here, where they are used: a file that is not the one its path names is refused,
// and the stage falls back rather than re-host it. A URL that is not one of our uploads is
// refused before anything is fetched.
export async function readUpload(url: string): Promise<VerifiedUpload> {
  const sha = uploadShaOf(url)
  if (sha === null) throw new AppError('Not an upload of ours')
  const bytes = await download(url, CONFIG.timeoutMs.download)
  if (createHash('sha256').update(bytes).digest('hex') !== sha) {
    throw new AppError('Upload bytes do not match their path')
  }
  return { bytes, sha }
}
