import { describe, expect, it } from 'vitest'
import { loadFamily } from '@/app/start/_components/draft/load-faces'

// Loading a look's display face (load-faces.ts, docs/start-page-journey-plan.md 5.8): the face is
// asked for by its own name, never with the local fallback next/font lists after it, which a
// device without that local font cannot load.

// next/font's family list for Fraunces, as the build writes it.
const FRAUNCES = "'Fraunces', 'Fraunces Fallback'"

const FACE = {} as FontFace

// A device whose fonts include no Times New Roman: as Chromium does, a load that names the
// fallback drawn from it fails, although the face named first has arrived.
const withoutLocalFallback = {
  load: (font: string) =>
    font.includes('Fallback')
      ? Promise.reject(new DOMException('A network error occurred.', 'NetworkError'))
      : Promise.resolve([FACE]),
}

describe('loadFamily', () => {
  it('loads the face on a device without its local fallback, and gives the whole list', async () => {
    await expect(loadFamily(FRAUNCES, withoutLocalFallback)).resolves.toBe(FRAUNCES)
  })

  it('gives nothing when no file answers for the face', async () => {
    await expect(loadFamily(FRAUNCES, { load: () => Promise.resolve([]) })).resolves.toBeNull()
  })
})
