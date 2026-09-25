import sharp from 'sharp'
import { CONFIG } from '@/lib/config'
import { type LogoReading, readPolarity } from '@/lib/logo/polarity'

export type LogoRaster = Readonly<{ png: Buffer; width: number; height: number }>

// An SVG is rasterised at the density that fills the limit; anything else at its own size.
async function densityFor(bytes: Buffer): Promise<number | undefined> {
  const meta = await sharp(bytes).metadata()
  if (meta.format !== 'svg') return undefined
  const longest = Math.max(meta.width, meta.height)
  return (72 * CONFIG.logo.maxPx) / longest
}

// Reads the artwork from a sample of its pixels, drawn at CONFIG.logo.samplePx as the browser's
// sampler draws it, so both read the same polarity (lib/logo/polarity.ts).
export async function analyseLogo(bytes: Buffer): Promise<LogoReading | null> {
  const { samplePx } = CONFIG.logo
  try {
    const { data, info } = await sharp(bytes, { density: await densityFor(bytes) })
      .resize(samplePx, samplePx, { fit: 'inside' })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
    return readPolarity({ data, width: info.width, height: info.height })
  } catch {
    return null
  }
}

// The raster a template shows: any accepted input, an SVG included, as a transparent PNG at
// most maxPx on its longer side. Null when the file cannot be read, and the wordmark is used.
export async function normaliseLogo(bytes: Buffer): Promise<LogoRaster | null> {
  try {
    const { data, info } = await sharp(bytes, { density: await densityFor(bytes) })
      .resize(CONFIG.logo.maxPx, CONFIG.logo.maxPx, { fit: 'inside', withoutEnlargement: true })
      .ensureAlpha()
      .png()
      .toBuffer({ resolveWithObject: true })
    return { png: data, width: info.width, height: info.height }
  } catch {
    return null
  }
}
