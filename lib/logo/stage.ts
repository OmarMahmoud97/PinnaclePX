import 'server-only'
import { put } from '@vercel/blob'
import { readUpload } from '@/lib/blob/read-upload'
import type { SubmissionAnswers } from '@/lib/brief/submission'
import { CONFIG } from '@/lib/config'
import { env } from '@/lib/env'
import { analyseLogo, normaliseLogo } from '@/lib/logo/analyse'
import { looksLikeSvg, unsafeSvgReason } from '@/lib/logo/svg'
import type { LogoAnalysis } from '@/lib/logo/types'
import { log } from '@/lib/log'

// The logo stage: reads the visitor's file back from Blob, checked against its hash, reads its
// polarity, and stores the normalised raster the templates show, named by the original's hash
// so a retry overwrites itself. A wordmark has nothing to analyse. An SVG that could reach
// outside itself is refused before the rasteriser sees it. Any failure means the wordmark: a
// prospect never sees a broken logo, and the stage says why in the log.
export async function analyseSubmissionLogo(
  logo: SubmissionAnswers['logo'],
  slug: string,
): Promise<LogoAnalysis | null> {
  if (logo.kind === 'wordmark') return null
  try {
    const { bytes, sha } = await readUpload(logo.url)
    if (looksLikeSvg(bytes)) {
      const reason = unsafeSvgReason(bytes)
      if (reason !== null) throw new Error(`The SVG carries ${reason}`)
    }
    const [reading, raster] = await Promise.all([analyseLogo(bytes), normaliseLogo(bytes)])
    if (reading === null || raster === null) throw new Error('The logo could not be read')
    const stored = await put(`logo-rasters/${sha}.png`, raster.png, {
      access: 'public',
      token: env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'image/png',
      abortSignal: AbortSignal.timeout(CONFIG.timeoutMs.store),
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
