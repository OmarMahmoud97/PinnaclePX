import { describe, expect, it } from 'vitest'
import {
  brandSchema,
  briefSchema,
  coloursSchema,
  describeSchema,
  detailsSchema,
  draftSchema,
  lookSchema,
} from '@/lib/brief/schema'
import { CONFIG } from '@/lib/config'

const SENTENCE = 'Physiotherapy clinic in Sheffield. Sports injuries and post-op rehabilitation.'

const VALID_BRIEF = {
  description: SENTENCE,
  name: 'Sam',
  company: 'Ashgrove Physio',
  email: 'sam@ashgrove.example',
  logo: { kind: 'wordmark' },
  imagery: { style: 'minimal', photos: [] },
  colours: { kind: 'palette', paletteId: 'forest' },
}

describe('describeSchema', () => {
  it('accepts a sentence about the business', () => {
    expect(describeSchema.parse({ description: SENTENCE }).description).toBe(SENTENCE)
  })

  it('trims surrounding whitespace', () => {
    expect(describeSchema.parse({ description: `  ${SENTENCE}  ` }).description).toBe(SENTENCE)
  })

  it('rejects an answer that is too short to brief from', () => {
    expect(describeSchema.safeParse({ description: 'We sell things' }).success).toBe(false)
  })

  it('rejects an answer past the maximum length', () => {
    const tooLong = 'a'.repeat(CONFIG.form.maxChars + 1)
    expect(describeSchema.safeParse({ description: tooLong }).success).toBe(false)
  })

  it('counts length after trimming', () => {
    const padded = `${' '.repeat(50)}We sell things${' '.repeat(50)}`
    expect(describeSchema.safeParse({ description: padded }).success).toBe(false)
  })
})

describe('detailsSchema', () => {
  it('accepts an email and a name', () => {
    const parsed = detailsSchema.parse({ email: 'sam@ashgrove.example', name: ' Sam ' })
    expect(parsed.name).toBe('Sam')
  })

  it.each(['sam', 'sam@', '@ashgrove.example', ''])('rejects the address %j', (email) => {
    expect(detailsSchema.safeParse({ email, name: 'Sam' }).success).toBe(false)
  })

  it('rejects a blank name even when it contains spaces', () => {
    expect(detailsSchema.safeParse({ email: 'sam@ashgrove.example', name: '   ' }).success).toBe(
      false,
    )
  })

  // Every place a name is shown is sized for these limits (plan 7.7), and the Server Action
  // parses the brief with these schemas, so a longer name never reaches the pipeline either.
  it('takes a name up to its limit, and no longer', () => {
    const { personMax } = CONFIG.start.names
    const details = (name: string) =>
      detailsSchema.safeParse({ email: 'sam@ashgrove.example', name }).success
    expect(details('b'.repeat(personMax))).toBe(true)
    expect(details('b'.repeat(personMax + 1))).toBe(false)
  })
})

describe('brandSchema', () => {
  it('takes a business name up to its limit, measured after trimming, and no longer', () => {
    const { companyMax } = CONFIG.start.names
    const brand = (company: string) =>
      brandSchema.safeParse({ company, logo: { kind: 'wordmark' } }).success
    expect(brand('a'.repeat(companyMax))).toBe(true)
    expect(brand(`  ${'a'.repeat(companyMax)}  `)).toBe(true)
    expect(brand('a'.repeat(companyMax + 1))).toBe(false)
  })

  it('asks for the business name by that name', () => {
    const result = brandSchema.safeParse({ company: ' ', logo: { kind: 'wordmark' } })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0]?.message).toBe('Tell us your business name.')
  })

  // An upload never holds up Next (plan D14): the send waits for it instead.
  it('takes a logo that is still uploading', () => {
    const logo = { kind: 'file', id: 'l1', fileName: 'logo.svg', url: null }
    expect(brandSchema.safeParse({ company: 'Ashgrove', logo }).success).toBe(true)
  })
})

describe('lookSchema', () => {
  it('takes photos that are still uploading, up to the limit', () => {
    const photo = { id: 'p1', fileName: 'shop.jpg', url: null }
    expect(lookSchema.safeParse({ style: 'warm', photos: [photo] }).success).toBe(true)
    const photos = Array.from({ length: CONFIG.form.maxPhotos + 1 }, (_, i) => ({
      ...photo,
      id: `p${String(i)}`,
    }))
    expect(lookSchema.safeParse({ style: 'warm', photos }).success).toBe(false)
  })
})

describe('coloursSchema', () => {
  it('accepts a preset palette', () => {
    expect(coloursSchema.safeParse({ kind: 'palette', paletteId: 'ink' }).success).toBe(true)
  })

  it.each(['#2F6F4E', '#2f6f4e', '#abc'])('accepts the hex code %s', (hex) => {
    expect(coloursSchema.safeParse({ kind: 'custom', hex }).success).toBe(true)
  })

  it.each(['2F6F4E', '#12345', '#GGGGGG', 'rebeccapurple', ''])('rejects %j', (hex) => {
    expect(coloursSchema.safeParse({ kind: 'custom', hex }).success).toBe(false)
  })

  it('rejects a palette we do not offer', () => {
    expect(coloursSchema.safeParse({ kind: 'palette', paletteId: 'chartreuse' }).success).toBe(
      false,
    )
  })
})

describe('draftSchema', () => {
  it('accepts a half-typed draft that the full schema would reject', () => {
    const draft = {
      ...VALID_BRIEF,
      description: 'Sho',
      email: '',
      colours: { kind: 'custom', hex: '#1' },
    }
    expect(draftSchema.safeParse(draft).success).toBe(true)
  })

  it('rejects a draft with the wrong shape', () => {
    expect(draftSchema.safeParse({ ...VALID_BRIEF, logo: { kind: 'sticker' } }).success).toBe(false)
  })

  it('keeps what the browser read in a logo, and drops a reading it cannot read', () => {
    const logo = { kind: 'file', id: 'l1', fileName: 'logo.svg', url: null }
    const read = { ...logo, polarity: 'light-artwork', accent: '#2f6f4e' }
    expect(draftSchema.safeParse({ ...VALID_BRIEF, logo: read }).data?.logo).toEqual(read)
    const odd = { ...logo, polarity: 'glossy', accent: 'green' }
    expect(draftSchema.safeParse({ ...VALID_BRIEF, logo: odd }).data?.logo).toEqual(logo)
  })
})

const UPLOADED = {
  kind: 'file',
  id: 'l1',
  fileName: 'logo.svg',
  url: 'https://x.public.blob.vercel-storage.com/logos/abc.svg',
}
const PHOTO = {
  id: 'p1',
  fileName: 'shop.jpg',
  url: 'https://x.public.blob.vercel-storage.com/photos/abc.jpg',
}

describe('briefSchema', () => {
  it('accepts a complete brief', () => {
    expect(briefSchema.safeParse(VALID_BRIEF).success).toBe(true)
  })

  it('rejects a brief with any question missing', () => {
    const { colours: _colours, ...incomplete } = VALID_BRIEF
    expect(briefSchema.safeParse(incomplete).success).toBe(false)
  })

  it('rejects a brief whose description failed the first question', () => {
    expect(briefSchema.safeParse({ ...VALID_BRIEF, description: 'Short' }).success).toBe(false)
  })

  it('takes the wordmark or an uploaded logo, and photos alongside the look', () => {
    const brief = { ...VALID_BRIEF, logo: UPLOADED, imagery: { style: 'dark', photos: [PHOTO] } }
    expect(briefSchema.safeParse(brief).success).toBe(true)
  })

  // The page never sends one (app/start/_components/picture-holds.ts); a brief that does was not
  // sent by the page.
  it('rejects a brief with a picture still uploading', () => {
    expect(
      briefSchema.safeParse({ ...VALID_BRIEF, logo: { ...UPLOADED, url: null } }).success,
    ).toBe(false)
    const photos = [{ ...PHOTO, url: null }]
    expect(
      briefSchema.safeParse({ ...VALID_BRIEF, imagery: { style: 'dark', photos } }).success,
    ).toBe(false)
  })

  it('rejects a file choice with no file, a look we do not offer, and too many photos', () => {
    expect(
      briefSchema.safeParse({ ...VALID_BRIEF, logo: { ...UPLOADED, fileName: '' } }).success,
    ).toBe(false)
    const look = (style: string, photos: readonly (typeof PHOTO)[]) =>
      briefSchema.safeParse({ ...VALID_BRIEF, imagery: { style, photos } }).success
    expect(look('neon', [])).toBe(false)
    const photos = Array.from({ length: CONFIG.form.maxPhotos + 1 }, (_, i) => ({
      ...PHOTO,
      id: `p${String(i)}`,
    }))
    expect(look('warm', photos)).toBe(false)
  })
})
