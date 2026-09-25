import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { CONFIG } from '@/lib/config'
import { analyseLogo } from '@/lib/logo/analyse'
import { type Pixels, readPolarity } from '@/lib/logo/polarity'

type Rgb = Readonly<{ r: number; g: number; b: number }>

// analyse.test.ts's fixtures, drawn on the spot: a mark of one colour on a transparent ground,
// with or without an opaque box behind it.
async function mark(colour: Rgb, box: Rgb | null): Promise<Buffer> {
  const ground = box === null ? { ...colour, alpha: 0 } : { ...box, alpha: 1 }
  const inner = await sharp({
    create: { width: 120, height: 60, channels: 4, background: { ...colour, alpha: 1 } },
  })
    .png()
    .toBuffer()
  return sharp({ create: { width: 200, height: 200, channels: 4, background: ground } })
    .composite([{ input: inner, left: 40, top: 70 }])
    .png()
    .toBuffer()
}

type Kernel = 'lanczos3' | 'nearest' | 'linear' | 'cubic'

// The file drawn to fit CONFIG.logo.samplePx, by sharp's own filter as the logo stage draws it or
// by the plainer ones a canvas uses.
async function sampled(bytes: Buffer, kernel: Kernel = 'lanczos3'): Promise<Pixels> {
  const { samplePx } = CONFIG.logo
  const { data, info } = await sharp(bytes)
    .resize(samplePx, samplePx, { fit: 'inside', kernel })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  return { data, width: info.width, height: info.height }
}

// A canvas holds its pixels multiplied by their alpha and divides it back out for getImageData,
// so a faint pixel's colour comes back rounded.
function throughCanvas({ data, width, height }: Pixels): Pixels {
  const out = Uint8ClampedArray.from(data)
  for (let offset = 0; offset < out.length; offset += 4) {
    const alpha = out[offset + 3] ?? 0
    for (let channel = offset; channel < offset + 3; channel += 1) {
      const stored = Math.round(((out[channel] ?? 0) * alpha) / 255)
      out[channel] = alpha === 0 ? 0 : Math.round((stored * 255) / alpha)
    }
  }
  return { data: out, width, height }
}

const BLACK = { r: 10, g: 10, b: 10 }
const WHITE = { r: 250, g: 250, b: 250 }
const MID = { r: 128, g: 128, b: 128 }

const FIXTURES = [
  { name: 'dark artwork on a transparent ground', colour: BLACK, box: null, is: 'dark-artwork' },
  { name: 'light artwork on a transparent ground', colour: WHITE, box: null, is: 'light-artwork' },
  { name: 'mid-grey artwork', colour: MID, box: null, is: 'mixed' },
  // The box is what meets the page: a white box wants a light surface, as dark artwork does.
  { name: 'a dark mark in a white box', colour: BLACK, box: WHITE, is: 'dark-artwork' },
  { name: 'a light mark on a black tile', colour: WHITE, box: BLACK, is: 'light-artwork' },
] as const

describe('readPolarity', () => {
  it.each(FIXTURES)('reads $name', async ({ colour, box, is }) => {
    expect(readPolarity(await sampled(await mark(colour, box)))?.polarity).toBe(is)
  })

  // The server and the browser must never disagree about the same file (plan D13), though a
  // browser draws the sample with its own filter and through a canvas's rounding. The canvas
  // itself is read in a real browser by e2e/brief-order.spec.ts, with a light logo and a dark one.
  const DRAWN = FIXTURES.flatMap((fixture) =>
    (['nearest', 'linear', 'cubic'] as const).map((kernel) => ({ ...fixture, kernel })),
  )
  it.each(DRAWN)('agrees with the logo stage on $name drawn by $kernel', async (drawn) => {
    const bytes = await mark(drawn.colour, drawn.box)
    const browser = readPolarity(throughCanvas(await sampled(bytes, drawn.kernel)))
    const server = await analyseLogo(bytes)
    expect(browser?.polarity).toBe(drawn.is)
    expect(browser?.polarity).toBe(server?.polarity)
    expect(browser?.opaqueBackdrop).toBe(server?.opaqueBackdrop)
  })

  it('reports the box behind a mark', async () => {
    expect(readPolarity(await sampled(await mark(BLACK, WHITE)))?.opaqueBackdrop).toBe(true)
    expect(readPolarity(await sampled(await mark(BLACK, null)))?.opaqueBackdrop).toBe(false)
  })

  it('reads nothing from a file with nothing visible', () => {
    expect(readPolarity({ data: new Uint8ClampedArray(4 * 4 * 4), width: 4, height: 4 })).toBeNull()
  })
})
