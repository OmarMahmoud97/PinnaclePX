import type { SubmissionAnswers } from '@/lib/brief/submission'
import { identityHashFrom } from '@/lib/identity/hmac'
import { payloadHashFrom } from '@/lib/identity/payload'
import { newSlug, SLUG_LENGTH, slugSchema } from '@/lib/identity/slug'

const SECRET = 'a-test-secret-that-is-at-least-32-characters-long'
const BLOB = 'https://x.public.blob.vercel-storage.com'
const SHA_A = 'a'.repeat(64)
const SHA_B = 'b'.repeat(64)

const ANSWERS: SubmissionAnswers = {
  description: 'Physiotherapy clinic in Sheffield. Sports injuries and post-op rehab.',
  company: 'Ashgrove Physio',
  logo: { kind: 'file', fileName: 'logo.svg', url: `${BLOB}/logos/${SHA_A}.svg` },
  imagery: {
    style: 'warm',
    photos: [
      { fileName: 'a.jpg', url: `${BLOB}/photos/${SHA_A}.jpg` },
      { fileName: 'b.jpg', url: `${BLOB}/photos/${SHA_B}.jpg` },
    ],
  },
  colours: { kind: 'custom', hex: '#2f6f4e' },
}

describe('identityHashFrom', () => {
  it('is the same for one address however it is typed', () => {
    const a = identityHashFrom('Sam@Ashgrove.example', SECRET)
    expect(identityHashFrom('  sam@ashgrove.example ', SECRET)).toBe(a)
    expect(a).toMatch(/^[a-f0-9]{64}$/)
  })

  it('differs by address and by secret', () => {
    const a = identityHashFrom('sam@ashgrove.example', SECRET)
    expect(identityHashFrom('sam+1@ashgrove.example', SECRET)).not.toBe(a)
    expect(identityHashFrom('sam@ashgrove.example', `${SECRET}x`)).not.toBe(a)
  })
})

describe('payloadHashFrom', () => {
  const base = payloadHashFrom('id', ANSWERS)

  it('is a sha256 hex string that depends on the identity', () => {
    expect(base).toMatch(/^[a-f0-9]{64}$/)
    expect(payloadHashFrom('other', ANSWERS)).not.toBe(base)
  })

  it('ignores whitespace in the words and the order of the photos', () => {
    const photos = [...ANSWERS.imagery.photos].reverse()
    const same: SubmissionAnswers = {
      ...ANSWERS,
      description: '  Physiotherapy   clinic in Sheffield.  Sports injuries and post-op rehab. ',
      company: 'Ashgrove  Physio',
      imagery: { ...ANSWERS.imagery, photos },
    }
    expect(payloadHashFrom('id', same)).toBe(base)
  })

  it('treats the same file at a different store URL as the same picture', () => {
    const moved: SubmissionAnswers = {
      ...ANSWERS,
      logo: { kind: 'file', fileName: 'again.svg', url: `https://y.example/logos/${SHA_A}.svg` },
    }
    expect(payloadHashFrom('id', moved)).toBe(base)
  })

  it('changes when any answer the pipeline reads changes', () => {
    const changes: SubmissionAnswers[] = [
      { ...ANSWERS, description: 'Something else entirely, about a bakery.' },
      { ...ANSWERS, company: 'Ashgrove Physiotherapy' },
      { ...ANSWERS, logo: { kind: 'wordmark' } },
      { ...ANSWERS, imagery: { ...ANSWERS.imagery, style: 'dark' } },
      { ...ANSWERS, imagery: { ...ANSWERS.imagery, photos: [] } },
      { ...ANSWERS, colours: { kind: 'palette', paletteId: 'ink' } },
      { ...ANSWERS, colours: { kind: 'custom', hex: '#2f6f4f' } },
    ]
    for (const changed of changes) expect(payloadHashFrom('id', changed)).not.toBe(base)
  })
})

describe('newSlug', () => {
  it('is twelve characters from the alphabet and never repeats', () => {
    const slugs = new Set(Array.from({ length: 1000 }, newSlug))
    expect(slugs.size).toBe(1000)
    for (const slug of slugs) expect(slugSchema.safeParse(slug).success).toBe(true)
    expect(slugs.size).toBe(1000)
  })

  it('has a schema that refuses anything else', () => {
    expect(slugSchema.safeParse('abcdefghjkm').success).toBe(false)
    expect(slugSchema.safeParse('abcdefghjkmnp').success).toBe(false)
    expect(slugSchema.safeParse('abcdefghjklm').success).toBe(false)
    expect(slugSchema.safeParse(String(SLUG_LENGTH)).success).toBe(false)
  })
})
