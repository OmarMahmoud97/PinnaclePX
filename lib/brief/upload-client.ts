import 'client-only'
import { upload } from '@vercel/blob/client'
import { z } from 'zod'
import { type UploadKind, uploadPathname } from '@/lib/brief/uploads'
import { AppError } from '@/lib/errors'

// The SHA-256 of a file's bytes as lowercase hex, computed in the browser so the file can be
// stored under its own hash.
async function sha256Hex(file: File): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer())
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

// Blob refuses a path that is taken, because overwrites are off (app/api/upload/route.ts). The
// SDK's browser entry has no class for that answer, only the message it documents at
// vercel.link/blob-allow-overwrite: "This blob already exists".
function alreadyStored(error: unknown): boolean {
  return error instanceof Error && error.message.includes('already exists')
}

const storedSchema = z.object({ url: z.string().url() })

// The URL of the file already at this path, from the route that issues tokens.
async function storedUrl(pathname: string): Promise<string> {
  const response = await fetch(`/api/upload?pathname=${encodeURIComponent(pathname)}`)
  if (!response.ok) throw new AppError(`Upload lookup returned ${String(response.status)}`)
  return storedSchema.parse(await response.json()).url
}

// Sends the file, or, when Blob says the path is taken, asks for the URL of what is there: the
// same bytes, because the path is their hash.
async function uploadOrFind(pathname: string, file: File): Promise<string> {
  try {
    const result = await upload(pathname, file, {
      access: 'public',
      handleUploadUrl: '/api/upload',
      contentType: file.type,
    })
    return result.url
  } catch (error) {
    if (!alreadyStored(error)) throw error
    return storedUrl(pathname)
  }
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
    return { ok: true, url: await uploadOrFind(pathname, file) }
  } catch {
    return { ok: false, reason: 'failed' }
  }
}
