import { CONFIG } from '@/lib/config'
import type { LogoPolarity } from '@/lib/logo/types'

// Whether a logo is dark or light artwork, from its pixels alone (docs/start-page-journey-plan.md,
// 5.8 and D13). Pure, so the logo stage on the server (lib/logo/analyse.ts) and the browser's
// sampler (app/start/_components/logo-sampler.ts) read the same file the same way: the draft
// turns dark for light artwork exactly when the designs will.

export type LogoReading = Readonly<{
  polarity: LogoPolarity
  lightness: number
  opaqueBackdrop: boolean
}>

// Straight (not premultiplied) RGBA, four bytes a pixel, row by row: what sharp's raw output and a
// canvas's getImageData both give.
export type Pixels = Readonly<{ data: ArrayLike<number>; width: number; height: number }>

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

// The alpha-weighted mean lightness of the visible pixels decides whether the artwork is dark or
// light. A border ring that is almost entirely opaque means a box behind the mark (a white card, a
// black tile); then the box decides, because it is what meets the surface. Null when nothing in
// the file is visible.
export function readPolarity({ data, width, height }: Pixels): LogoReading | null {
  const { alphaFloor, borderRingPx, backdropShare } = CONFIG.logo
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
