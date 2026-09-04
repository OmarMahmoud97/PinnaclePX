import { BlobNotFoundError, head } from '@vercel/blob'
import { type HandleUploadBody, handleUpload } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import { contentTypesFor, uploadKindOf } from '@/lib/brief/uploads'
import { CONFIG } from '@/lib/config'
import { hitLimit } from '@/lib/db/rate-limit'
import { env } from '@/lib/env'
import { AppError } from '@/lib/errors'
import { log } from '@/lib/log'
import { callerAddress } from '@/lib/rate-limit/request'

// One counter for every call a browser can make here, a token or a lookup.
async function overLimit(): Promise<boolean> {
  const within = await hitLimit({
    scope: 'upload-ip',
    subject: await callerAddress(),
    ...CONFIG.rateLimit.uploadsPerIp,
  })
  if (!within) log.warn('upload.rate_limited')
  return !within
}

const tooMany = () =>
  NextResponse.json({ error: 'Too many uploads. Try again later.' }, { status: 429 })

// Issues the short-lived token a browser needs to put one picture straight onto Blob. A token
// is issued only for the content-addressed paths lib/brief/uploads.ts makes, for the media types
// that kind takes, up to the form's size limit. The path carries the hash the browser computed,
// which nothing here checks, so a path that is taken is never overwritten: the file there is
// the one the pipeline verified, or will verify, against that hash (lib/blob/read-upload.ts).
// The same file uploaded again is refused by Blob, and the browser asks GET for its URL.
//
// The body is the Blob SDK's own protocol and handleUpload validates it; nothing here reads it,
// and a body that is not JSON is refused like any other. The hit is counted before the body is
// read, so the cheapest request to make is not the one the limit misses.
// onUploadCompleted is not used: Blob cannot call localhost, and the browser already knows the
// URL when its upload finishes.
export async function POST(request: Request): Promise<NextResponse> {
  if (await overLimit()) return tooMany()
  try {
    const response = await handleUpload({
      body: (await request.json()) as HandleUploadBody,
      request,
      token: env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: (pathname) => {
        const kind = uploadKindOf(pathname)
        if (kind === null) throw new AppError('Not a path this route issues tokens for')
        return Promise.resolve({
          allowedContentTypes: [...contentTypesFor(kind)],
          maximumSizeInBytes: CONFIG.form.maxUploadBytes,
          addRandomSuffix: false,
          allowOverwrite: false,
        })
      },
    })
    return NextResponse.json(response)
  } catch (error) {
    log.warn('upload.refused', { reason: error instanceof Error ? error.message : 'unknown' })
    return NextResponse.json({ error: 'Upload refused' }, { status: 400 })
  }
}

// The URL of the file already stored at an upload path: the same file, uploaded before, by this
// visitor or another. Only for the paths the token route issues, and counted like a token.
export async function GET(request: Request): Promise<NextResponse> {
  const pathname = new URL(request.url).searchParams.get('pathname') ?? ''
  if (uploadKindOf(pathname) === null) {
    return NextResponse.json({ error: 'Not an upload path' }, { status: 400 })
  }
  if (await overLimit()) return tooMany()
  try {
    const stored = await head(pathname, { token: env.BLOB_READ_WRITE_TOKEN })
    return NextResponse.json({ url: stored.url })
  } catch (error) {
    if (error instanceof BlobNotFoundError) {
      return NextResponse.json({ error: 'No such upload' }, { status: 404 })
    }
    throw error
  }
}
