import sharp from 'sharp'
import { CONFIG } from '@/lib/config'
import type { LogoPolarity } from '@/lib/logo/types'

export type LogoReading = Readonly<{
  polarity: LogoPolarity
  lightness: number
  opaqueBackdrop: boolean
}>

export type LogoRaster = Readonly<{ png: Buffer; width: number; height: number }>

// sRGB channel to linear light.
function linear(channel: number): number {
  const c = channel / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

// Perceptual lightness (CIE L*, scaled 0 to 1) of an sRGB pixel, so a mid grey reads as mid.
function lightnessOf(r: number, g: number, b: number): number {
  const y = 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
  return y <= 0.008856 ? 9.033 * y : 1.16 * Math.cbrt(y) - 0.16
}

function polarityOf(lightness: number): LogoPolarity {
  if (lightness < CONFIG.logo.darkBelow) return 'dark-artwork'
  if (lightness > CONFIG.logo.lightAbove) return 'light-artwork'
  return 'mixed'
}

// The box meets the page, so the surface is chosen to hide its edge: a light box wants a light
// surface, which is what dark artwork wants, and the reverse.
function polarityBehind(boxLightness: number): LogoPolarity {
  const box = polarityOf(boxLightness)
  return box === 'light-artwork'
    ? 'dark-artwork'
    : box === 'dark-artwork'
      ? 'light-artwork'
      : 'mixed'
}

// An SVG is rasterised at the density that fills the limit; anything else at its own size.
async function densityFor(bytes: Buffer): Promise<number | undefined> {
  const meta = await sharp(bytes).metadata()
  if (meta.format !== 'svg') return undefined
  const longest = Math.max(meta.width, meta.height)
  return (72 * CONFIG.logo.maxPx) / longest
}

// Reads the artwork: the alpha-weighted mean lightness of the visible pixels decides whether it
// is dark or light artwork. A border ring that is almost entirely opaque means a box behind the
// mark (a white card, a black tile); then the box decides, because it is what meets the surface.
export async function analyseLogo(bytes: Buffer): Promise<LogoReading | null> {
  const { samplePx, alphaFloor, borderRingPx, backdropShare } = CONFIG.logo
  let data: Buffer
  let width: number
  let height: number
  try {
    const result = await sharp(bytes, { density: await densityFor(bytes) })
      .resize(samplePx, samplePx, { fit: 'inside' })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
    data = result.data
    width = result.info.width
    height = result.info.height
  } catch {
    return null
  }

  let weighted = 0
  let weight = 0
  let ringPixels = 0
  let ringOpaque = 0
  let ringLightness = 0
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4
      const alpha = data[offset + 3] ?? 0
      const lum = lightnessOf(data[offset] ?? 0, data[offset + 1] ?? 0, data[offset + 2] ?? 0)
      const onRing =
        x < borderRingPx ||
        y < borderRingPx ||
        x >= width - borderRingPx ||
        y >= height - borderRingPx
      if (onRing) {
        ringPixels += 1
        if (alpha >= 250) {
          ringOpaque += 1
          ringLightness += lum
        }
      }
      if (alpha < alphaFloor) continue
      weighted += lum * alpha
      weight += alpha
    }
  }
  if (weight === 0) return null
  const lightness = weighted / weight
  const opaqueBackdrop = ringPixels > 0 && ringOpaque / ringPixels >= backdropShare
  const polarity = opaqueBackdrop
    ? polarityBehind(ringLightness / ringOpaque)
    : polarityOf(lightness)
  return { polarity, lightness, opaqueBackdrop }
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
