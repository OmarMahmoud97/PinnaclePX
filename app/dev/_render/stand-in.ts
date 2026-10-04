// The stand-in pictures and logos of the development routes: flat fills, drawn on request by
// app/dev/picture, so a check knows every pixel under the words. Pure white and pure black are
// the two ends decision 7's rule measures text over; grey is a picture to look at. The l-fills
// are the uniform marks of decision 23, by CIE lightness scaled 0 to 1: the logo stage calls
// artwork below 0.35 dark and above 0.65 light (lib/logo/polarity.ts), so l034 and l066 sit
// just inside each end, and l035, l050 and l065 span the mixed band between.
import { CONFIG } from '@/lib/config'
import type { LogoPolarity } from '@/lib/logo/types'

export const STAND_IN_FILLS = [
  'white',
  'black',
  'grey',
  'l034',
  'l035',
  'l050',
  'l065',
  'l066',
] as const

export type StandInFill = (typeof STAND_IN_FILLS)[number]

// CIE lightness, scaled 0 to 1, of each fill.
const LIGHTNESS: Readonly<Record<StandInFill, number>> = {
  white: 1,
  black: 0,
  grey: 0.5,
  l034: 0.34,
  l035: 0.35,
  l050: 0.5,
  l065: 0.65,
  l066: 0.66,
}

// The CIE lightness, scaled 0 to 1, of a neutral grey's 8-bit sRGB channel, as the logo stage
// reads it (lib/logo/polarity.ts).
function lightnessOf(channel: number): number {
  const c = channel / 255
  const y = c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  return y <= 0.008856 ? 9.033 * y : 1.16 * Math.cbrt(y) - 0.16
}

// Which side of the logo stage's bands a lightness falls (lib/config.ts, logo).
const bandOf = (lightness: number) =>
  lightness < CONFIG.logo.darkBelow ? -1 : lightness > CONFIG.logo.lightAbove ? 1 : 0

// The polarity the logo stage reads from a stand-in mark (stand-in.test.ts holds it to the
// stage's own reading), which the development routes pass with the logo as the preview page
// passes the stored one (decision 23).
export function polarityOf(fill: StandInFill): LogoPolarity {
  const band = bandOf(LIGHTNESS[fill])
  return band < 0 ? 'dark-artwork' : band > 0 ? 'light-artwork' : 'mixed'
}

// The 8-bit sRGB channel of a neutral grey of a CIE lightness: lightness to luminance (CIE
// 1976), then luminance to the sRGB transfer curve. Of the two channels either side, the nearer
// that stays in the lightness's own band: 0.35 rounds to 82, which the logo stage reads as
// 0.3488, dark artwork, so l035 is drawn at 83, and l065 at 157 rather than 158 (0.6511).
export function channelOf(fill: StandInFill): number {
  const l = LIGHTNESS[fill] * 100
  const y = l > 8 ? ((l + 16) / 116) ** 3 : l / 903.3
  const c = Math.min(1, Math.max(0, y <= 0.0031308 ? 12.92 * y : 1.055 * y ** (1 / 2.4) - 0.055))
  const exact = c * 255
  const band = bandOf(LIGHTNESS[fill])
  const [near, far] =
    exact - Math.floor(exact) < 0.5
      ? [Math.floor(exact), Math.ceil(exact)]
      : [Math.ceil(exact), Math.floor(exact)]
  return bandOf(lightnessOf(near)) === band ? near : far
}

// Where a stand-in is drawn. The name, a slot's or "logo", is only there so a check can tell
// which picture a request is for, and swap in a stored pick for it.
export function standInSrc(
  fill: StandInFill,
  size: Readonly<{ width: number; height: number }>,
  name: string,
): string {
  return `/dev/picture/${fill}/${String(size.width)}x${String(size.height)}-${name}.png`
}
