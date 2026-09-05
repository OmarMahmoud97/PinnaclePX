import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import manifest from '@/app/_images/work/manifest.json'
import { WORK_IMAGES } from '@/app/_components/work-images'
import { CLIENT_ITEMS } from '@/app/_components/work-items'

// The band, the pictures and the manifest describe the same six sites: a card never appears
// without a dated capture of the address it links to, and no capture is left without a card.
describe('the work band and its captures', () => {
  const slugs = CLIENT_ITEMS.map((client) => client.slug)

  it('has one manifest entry, one picture set and one card per client, in the same order', () => {
    expect(manifest.clients.map((client) => client.slug)).toEqual(slugs)
    expect(Object.keys(WORK_IMAGES).sort()).toEqual([...slugs].sort())
  })

  it('links each card to the address that was captured', () => {
    for (const client of CLIENT_ITEMS) {
      const entry = manifest.clients.find((c) => c.slug === client.slug)
      expect(entry?.url).toBe(client.url)
      expect(entry?.finalUrl.startsWith('https://')).toBe(true)
      expect(entry?.capturedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('keeps every committed picture in the manifest and under its byte line', () => {
    // WebP is imported from app/_images/work/; AVIF is served as it is from public/work/.
    const webps = readdirSync(join(process.cwd(), 'app', '_images', 'work')).filter((file) =>
      file.endsWith('.webp'),
    )
    const avifs = readdirSync(join(process.cwd(), 'public', 'work')).filter((file) =>
      file.endsWith('.avif'),
    )
    expect(webps).toHaveLength(slugs.length * 4)
    expect(avifs).toHaveLength(slugs.length * 4)
    // Every AVIF address the band writes names a file that exists, at the manifest's version.
    for (const image of Object.values(WORK_IMAGES)) {
      for (const picture of [image.phone, image.desktop]) {
        for (const url of picture.avif) {
          const [path, version] = url.split('?v=')
          expect(version).toBe(manifest.capturedAt)
          expect(avifs).toContain(path?.replace('/work/', ''))
        }
      }
    }
    for (const client of manifest.clients) {
      for (const file of client.files) {
        // A phone capture of a lit first screen: comfortably under a 60 KB line at 2x.
        if (file.view === 'phone' && file.width === 432) expect(file.webpBytes).toBeLessThan(60_000)
        if (file.view === 'desktop' && file.width === 448)
          expect(file.webpBytes).toBeLessThan(40_000)
      }
    }
  })

  // The phone frame is 9:19 and the browser frame 16:10; a picture of another shape would be
  // cropped or letterboxed inside it.
  it('captures every phone screen at 9:19 and every desktop screen at 16:10', async () => {
    const dir = join(process.cwd(), 'app', '_images', 'work')
    const shapes = [
      { view: 'phone', width: 432, ratio: 9 / 19 },
      { view: 'desktop', width: 448, ratio: 16 / 10 },
    ]
    for (const client of manifest.clients) {
      for (const shape of shapes) {
        const file = join(dir, `${client.slug}-${shape.view}-${String(shape.width)}.webp`)
        const { width, height } = await sharp(file).metadata()
        expect(width).toBe(shape.width)
        expect(width / height).toBeCloseTo(shape.ratio, 2)
      }
    }
  })

  it('describes each picture in under 125 characters', () => {
    for (const image of Object.values(WORK_IMAGES)) {
      expect(image.phone.alt.length).toBeLessThan(126)
      expect(image.desktop.alt.length).toBeLessThan(126)
    }
  })
})
