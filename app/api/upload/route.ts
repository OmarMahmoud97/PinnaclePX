import { type HandleUploadBody, handleUpload } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import { contentTypesFor, uploadKindOf } from '@/lib/brief/uploads'
import { CONFIG } from '@/lib/config'
import { hitLimit } from '@/lib/db/rate-limit'
import { env } from '@/lib/env'
import { AppError } from '@/lib/errors'
import { log } from '@/lib/log'
import { callerAddress } from '@/lib/rate-limit/request'

// Issues the short-lived token a browser needs to put one picture straight onto Blob. A token
// is issued only for the content-addressed paths lib/brief/uploads.ts makes, for the media types
// that kind takes, up to the form's size limit. The path carries the file's own hash, so the
// same file always overwrites itself and a repeated upload changes nothing.
//
// The body is the Blob SDK's own protocol and handleUpload validates it; nothing here reads it.
// onUploadCompleted is not used: Blob cannot call localhost, and the browser already knows the
// URL when its upload finishes.
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody
  const within = await hitLimit({
    scope: 'upload-ip',
    subject: await callerAddress(),
    ...CONFIG.rateLimit.uploadsPerIp,
  })
  if (!within) {
    log.warn('upload.rate_limited')
    return NextResponse.json({ error: 'Too many uploads. Try again later.' }, { status: 429 })
  }
  try {
    const response = await handleUpload({
      body,
      request,
      token: env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: (pathname) => {
        const kind = uploadKindOf(pathname)
        if (kind === null) throw new AppError('Not a path this route issues tokens for')
        return Promise.resolve({
          allowedContentTypes: [...contentTypesFor(kind)],
          maximumSizeInBytes: CONFIG.form.maxUploadBytes,
          addRandomSuffix: false,
          allowOverwrite: true,
        })
      },
    })
    return NextResponse.json(response)
  } catch (error) {
    log.warn('upload.refused', { reason: error instanceof Error ? error.message : 'unknown' })
    return NextResponse.json({ error: 'Upload refused' }, { status: 400 })
  }
}
