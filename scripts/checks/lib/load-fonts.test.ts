import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadFonts } from './in-page.mjs'

// Loading the look's faces before a check measures (in-page.mjs, loadFonts): each face is asked
// for by its own name, never with the local fallback next/font lists after it, which Linux (CI's
// runner) lacks; a face that does not load fails by name.

const DISPLAY = "'Fraunces', 'Fraunces Fallback'"
const BODY = "'Instrument Sans', 'Instrument Sans Fallback'"
const FACE = {} as FontFace

// A page whose root sets the two faces, on a device whose fonts.load answers as given.
function page(load: (font: string) => Promise<FontFace[]>) {
  const asked: string[] = []
  const root = {
    style: {
      getPropertyValue: (name: string) =>
        ({ '--template-font-display': DISPLAY, '--template-font-body': BODY })[name] ?? '',
    },
  }
  vi.stubGlobal('document', {
    querySelectorAll: () => [root],
    fonts: {
      load: (font: string) => {
        asked.push(font)
        return load(font)
      },
      ready: Promise.resolve(),
    },
  })
  return asked
}

// As Chromium on Linux does: a load that names a fallback drawn from a missing local font fails.
const withoutLocalFallback = (font: string) =>
  font.includes('Fallback')
    ? Promise.reject(new DOMException('A network error occurred.', 'NetworkError'))
    : Promise.resolve([FACE])

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('loadFonts', () => {
  it('loads each face by its own name on a device without the local fallback', async () => {
    const asked = page(withoutLocalFallback)
    await expect(loadFonts()).resolves.toBeUndefined()
    expect(asked).toEqual([
      "400 24px 'Fraunces'",
      "700 24px 'Fraunces'",
      "400 24px 'Instrument Sans'",
      "700 24px 'Instrument Sans'",
    ])
  })

  it('names a face whose file does not load', async () => {
    page((font) =>
      font.includes('Instrument Sans') && font.startsWith('700')
        ? Promise.reject(new DOMException('A network error occurred.', 'NetworkError'))
        : Promise.resolve([FACE]),
    )
    await expect(loadFonts()).rejects.toThrow(
      "fonts that did not load: 'Instrument Sans' 700 (NetworkError: A network error occurred.)",
    )
  })

  it('names a face no @font-face answers for', async () => {
    page(() => Promise.resolve([]))
    await expect(loadFonts()).rejects.toThrow("'Fraunces' 400 (no @font-face for it)")
  })
})
