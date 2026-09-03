import { describe, expect, it } from 'vitest'
import {
  briefSchema,
  coloursSchema,
  describeSchema,
  detailsSchema,
  draftSchema,
  imagerySchema,
  logoSchema,
} from '@/lib/brief/schema'
import { CONFIG } from '@/lib/config'

const SENTENCE = 'Physiotherapy clinic in Sheffield. Sports injuries and post-op rehabilitation.'

const VALID_BRIEF = {
  description: SENTENCE,
  name: 'Sam',
  company: 'Ashgrove Physio',
  email: 'sam@ashgrove.example',
  logo: { kind: 'wordmark' },
  imagery: { style: 'minimal', fileNames: [] },
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
  it('accepts a name, company and email', () => {
    const parsed = detailsSchema.parse({
      name: ' Sam ',
      company: 'Ashgrove Physio',
      email: 'sam@ashgrove.example',
    })
    expect(parsed.name).toBe('Sam')
  })

  it.each(['sam', 'sam@', '@ashgrove.example', ''])('rejects the address %j', (email) => {
    expect(detailsSchema.safeParse({ name: 'Sam', company: 'Ashgrove', email }).success).toBe(false)
  })

  it('rejects a blank name even when it contains spaces', () => {
    const result = detailsSchema.safeParse({
      name: '   ',
      company: 'Ashgrove',
      email: 'sam@ashgrove.example',
    })
    expect(result.success).toBe(false)
  })
})

describe('logoSchema', () => {
  it('accepts the wordmark fallback', () => {
    expect(logoSchema.safeParse({ kind: 'wordmark' }).success).toBe(true)
  })

  it('accepts an uploaded file name', () => {
    expect(logoSchema.safeParse({ kind: 'file', fileName: 'logo.svg' }).success).toBe(true)
  })

  it('rejects a file choice with no file', () => {
    expect(logoSchema.safeParse({ kind: 'file', fileName: '' }).success).toBe(false)
  })
})

describe('imagerySchema', () => {
  it('accepts a style with no photos', () => {
    expect(imagerySchema.safeParse({ style: 'warm', fileNames: [] }).success).toBe(true)
  })

  it('accepts a style with photos alongside it', () => {
    expect(imagerySchema.safeParse({ style: 'dark', fileNames: ['shop.jpg'] }).success).toBe(true)
  })

  it('rejects a style we do not offer', () => {
    expect(imagerySchema.safeParse({ style: 'neon', fileNames: [] }).success).toBe(false)
  })

  it('rejects more photos than the limit', () => {
    const fileNames = Array.from(
      { length: CONFIG.form.maxPhotos + 1 },
      (_, i) => `photo-${String(i)}.jpg`,
    )
    expect(imagerySchema.safeParse({ style: 'warm', fileNames }).success).toBe(false)
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
})

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
})
