import sharp from 'sharp'
import { analyseLogo, normaliseLogo } from '@/lib/logo/analyse'

// Fixtures drawn on the spot, so the test needs no binary files: a mark of one colour on a
// transparent ground, with or without an opaque box behind it.
async function mark(
  colour: { r: number; g: number; b: number },
  box: { r: number; g: number; b: number } | null,
): Promise<Buffer> {
  const size = 200
  const ground = box === null ? { ...colour, alpha: 0 } : { ...box, alpha: 1 }
  const inner = await sharp({
    create: { width: 120, height: 60, channels: 4, background: { ...colour, alpha: 1 } },
  })
    .png()
    .toBuffer()
  return sharp({ create: { width: size, height: size, channels: 4, background: ground } })
    .composite([{ input: inner, left: 40, top: 70 }])
    .png()
    .toBuffer()
}

const BLACK = { r: 10, g: 10, b: 10 }
const WHITE = { r: 250, g: 250, b: 250 }
const MID = { r: 128, g: 128, b: 128 }

const SVG = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40"><rect width="120" height="40" fill="#111"/></svg>',
)

describe('analyseLogo', () => {
  it('reads dark artwork on a transparent ground', async () => {
    const reading = await analyseLogo(await mark(BLACK, null))
    expect(reading?.polarity).toBe('dark-artwork')
    expect(reading?.opaqueBackdrop).toBe(false)
  })

  it('reads light artwork on a transparent ground', async () => {
    const reading = await analyseLogo(await mark(WHITE, null))
    expect(reading?.polarity).toBe('light-artwork')
  })

  it('reads mid-grey artwork as mixed', async () => {
    expect((await analyseLogo(await mark(MID, null)))?.polarity).toBe('mixed')
  })

  it('lets a white box behind a dark mark decide for a light surface', async () => {
    const reading = await analyseLogo(await mark(BLACK, WHITE))
    expect(reading?.opaqueBackdrop).toBe(true)
    // The box is what meets the page, so it is treated as dark artwork: it wants a light surface.
    expect(reading?.polarity).toBe('dark-artwork')
  })

  it('lets a black tile behind a light mark decide for a dark surface', async () => {
    const reading = await analyseLogo(await mark(WHITE, BLACK))
    expect(reading?.opaqueBackdrop).toBe(true)
    expect(reading?.polarity).toBe('light-artwork')
  })

  it('rasterises an SVG', async () => {
    expect((await analyseLogo(SVG))?.polarity).toBe('dark-artwork')
  })

  it('returns null for a file it cannot read', async () => {
    expect(await analyseLogo(Buffer.from('not an image'))).toBeNull()
  })
})

describe('normaliseLogo', () => {
  it('makes a PNG no larger than the limit on its longer side', async () => {
    const wide = await sharp({
      create: { width: 2000, height: 500, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } },
    })
      .png()
      .toBuffer()
    const raster = await normaliseLogo(wide)
    expect(raster?.width).toBe(512)
    expect(raster?.height).toBe(128)
    expect((await sharp(raster?.png).metadata()).format).toBe('png')
  })

  it('does not enlarge a small logo and keeps an SVG crisp', async () => {
    const small = await normaliseLogo(await mark(BLACK, null))
    expect(small?.width).toBe(200)
    const svg = await normaliseLogo(SVG)
    expect(svg?.width).toBe(512)
  })

  it('returns null for a file it cannot read', async () => {
    expect(await normaliseLogo(Buffer.from('nope'))).toBeNull()
  })
})
