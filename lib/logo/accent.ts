import { CONFIG } from '@/lib/config'
import type { Pixels } from '@/lib/logo/polarity'

// The colour a logo is drawn in, offered at the colour question as "Your logo's colour"
// (docs/start-page-journey-plan.md, OD12), only when the artwork has real colour: a black, white
// or grey logo, or one whose colour is a sliver of anti-aliased edge, offers none. Pure, and
// written out rather than taken from a colour library, so the browser's sampler that runs it
// stays small.

type Lab = Readonly<{ l: number; a: number; b: number }>

// sRGB channel to linear light, and back.
function linear(channel: number): number {
  const c = channel / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function gamma(value: number): number {
  const c = Math.min(Math.max(value, 0), 1)
  return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055
}

// sRGB to OKLab and back (Björn Ottosson's matrices), where a mean of colours is a colour between
// them rather than a muddier one.
function labOf(red: number, green: number, blue: number): Lab {
  const r = linear(red)
  const g = linear(green)
  const b = linear(blue)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return {
    l: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  }
}

function hexOf({ l: lightness, a, b }: Lab): string {
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3
  const channels = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
  return `#${channels
    .map((channel) =>
      Math.round(gamma(channel) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`
}

const chromaOf = ({ a, b }: Lab) => Math.hypot(a, b)

// The logo's own colour as six-digit hex, or null when it has none. Every visible pixel with
// colour votes for its hue, weighted by how visible and how colourful it is; the winning band of
// hues must cover CONFIG.logo.accent.minShare of the visible artwork, and its mean, in OKLab, is
// the colour. Grey pixels vote for nothing.
export function accentOf({ data, width, height }: Pixels): string | null {
  const { hueBands, minShare } = CONFIG.logo.accent
  const bands = Array.from({ length: hueBands }, () => ({ votes: 0, weight: 0, l: 0, a: 0, b: 0 }))
  let visible = 0
  for (let offset = 0; offset < width * height * 4; offset += 4) {
    const alpha = data[offset + 3] ?? 0
    if (alpha < CONFIG.logo.alphaFloor) continue
    visible += alpha
    const lab = labOf(data[offset] ?? 0, data[offset + 1] ?? 0, data[offset + 2] ?? 0)
    const chroma = chromaOf(lab)
    if (chroma < CONFIG.colour.greyChroma) continue
    const turn = (Math.atan2(lab.b, lab.a) / (2 * Math.PI) + 1) % 1
    const band = bands[Math.min(Math.floor(turn * hueBands), hueBands - 1)]
    if (band === undefined) continue
    band.votes += alpha * chroma
    band.weight += alpha
    band.l += lab.l * alpha
    band.a += lab.a * alpha
    band.b += lab.b * alpha
  }
  const winner = bands.reduce((best, band) => (band.votes > best.votes ? band : best))
  if (visible === 0 || winner.weight / visible < minShare) return null
  const mean = {
    l: winner.l / winner.weight,
    a: winner.a / winner.weight,
    b: winner.b / winner.weight,
  }
  return chromaOf(mean) < CONFIG.colour.greyChroma ? null : hexOf(mean)
}
