import 'server-only'
import { put } from '@vercel/blob'
import type { SubmissionAnswers } from '@/lib/brief/submission'
import { uploadShaOf } from '@/lib/brief/uploads'
import { env } from '@/lib/env'
import { analyseLogo, normaliseLogo } from '@/lib/logo/analyse'
import type { LogoAnalysis } from '@/lib/logo/types'
import { log } from '@/lib/log'

// The logo stage: fetches the visitor's file from Blob, reads its polarity, and stores the
// normalised raster the templates show, named by the original's hash so a retry overwrites
// itself. A wordmark has nothing to analyse. Any failure means the wordmark: a prospect never
// sees a broken logo, and the stage says why in the log.
export async function analyseSubmissionLogo(
  logo: SubmissionAnswers['logo'],
  slug: string,
): Promise<LogoAnalysis | null> {
  if (logo.kind === 'wordmark') return null
  try {
    const response = await fetch(logo.url)
    if (!response.ok) throw new Error(`Blob returned ${String(response.status)}`)
    const bytes = Buffer.from(await response.arrayBuffer())
    const [reading, raster] = await Promise.all([analyseLogo(bytes), normaliseLogo(bytes)])
    if (reading === null || raster === null) throw new Error('The logo could not be read')
    const sha = uploadShaOf(logo.url) ?? slug
    const stored = await put(`logo-rasters/${sha}.png`, raster.png, {
      access: 'public',
      token: env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'image/png',
    })
    return {
      polarity: reading.polarity,
      lightness: reading.lightness,
      opaqueBackdrop: reading.opaqueBackdrop,
      image: { src: stored.url, width: raster.width, height: raster.height },
    }
  } catch (error) {
    log.warn('logo.fallback', {
      slug,
      reason: error instanceof Error ? error.message : 'unknown',
    })
    return null
  }
}
