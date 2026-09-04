import { blobUrlsIn } from '@/lib/blob/urls'
import type { SubmissionAnswers } from '@/lib/brief/submission'

const BLOB = 'https://x.public.blob.vercel-storage.com'
const SHA = 'a'.repeat(64)

const answers: SubmissionAnswers = {
  description: 'A clinic.',
  company: 'Ashgrove Physio',
  logo: { kind: 'file', fileName: 'logo.svg', url: `${BLOB}/logos/${SHA}.svg` },
  imagery: {
    style: 'warm',
    photos: [
      { fileName: 'a.jpg', url: `${BLOB}/photos/${SHA}.jpg` },
      { fileName: 'a again.jpg', url: `${BLOB}/photos/${SHA}.jpg` },
    ],
  },
  colours: { kind: 'palette', paletteId: 'forest' },
}

const picture = (key: string) => ({
  src: `${BLOB}/images/${key}.webp`,
  alt: '',
  width: 1600,
  height: 900,
  credit: null,
})

describe('blobUrlsIn', () => {
  it('collects the uploads, the raster and the pictures, each once', () => {
    expect(
      blobUrlsIn({
        answers,
        logo: {
          polarity: 'mixed',
          lightness: 0.5,
          opaqueBackdrop: false,
          image: { src: `${BLOB}/logo-rasters/${SHA}.png`, width: 200, height: 100 },
        },
        imagery: {
          t01: { hero: picture('pexels-1'), statement: null },
          t02: { hero: picture('pexels-1'), detail: picture(`own-${SHA}`) },
        },
      }),
    ).toEqual([
      `${BLOB}/logos/${SHA}.svg`,
      `${BLOB}/photos/${SHA}.jpg`,
      `${BLOB}/logo-rasters/${SHA}.png`,
      `${BLOB}/images/pexels-1.webp`,
      `${BLOB}/images/own-${SHA}.webp`,
    ])
  })

  it('finds nothing in a wordmark, a missing raster and empty slots', () => {
    expect(
      blobUrlsIn({
        answers: { ...answers, logo: { kind: 'wordmark' }, imagery: { style: 'warm', photos: [] } },
        logo: null,
        imagery: { t01: { hero: null } },
      }),
    ).toEqual([])
    expect(blobUrlsIn({})).toEqual([])
  })
})
