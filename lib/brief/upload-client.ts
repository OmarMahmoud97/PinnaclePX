import 'client-only'
import { upload } from '@vercel/blob/client'
import { type UploadKind, uploadPathname } from '@/lib/brief/uploads'

// The SHA-256 of a file's bytes as lowercase hex, computed in the browser so the file can be
// stored under its own hash.
async function sha256Hex(file: File): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer())
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export type UploadOutcome =
  Readonly<{ ok: true; url: string }> | Readonly<{ ok: false; reason: 'unsupported' | 'failed' }>

// Sends a picture from the browser straight to Blob, at a content-addressed path, with a token
// from /api/upload. The bytes never pass through a function of ours. An unsupported type is
// refused before anything is sent; any other failure is reported, not thrown, because the
// visitor decides what to do about it.
export async function uploadPicture(kind: UploadKind, file: File): Promise<UploadOutcome> {
  const pathname = uploadPathname(kind, await sha256Hex(file), file.type)
  if (pathname === null) return { ok: false, reason: 'unsupported' }
  try {
    const result = await upload(pathname, file, {
      access: 'public',
      handleUploadUrl: '/api/upload',
      contentType: file.type,
    })
    return { ok: true, url: result.url }
  } catch {
    return { ok: false, reason: 'failed' }
  }
}
