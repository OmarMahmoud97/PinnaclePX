import { describe, expect, it } from 'vitest'
import { WALKTHROUGH_ANSWERS, WALKTHROUGH_COPY } from '@/app/_components/walkthrough-brand'
import { briefSchema } from '@/lib/brief/schema'
import { typingOffsets } from '@/lib/brief/typing'
import { CONFIG } from '@/lib/config'

describe('WALKTHROUGH_ANSWERS', () => {
  it('would pass every question the real form asks, apart from the name and email it never shows', () => {
    // The pictures are never uploaded: the frame draws them from walkthrough-photos.ts. Given the
    // URLs an upload would have, the rest must pass as a visitor's answers would.
    const shown = briefSchema.omit({ name: true, email: true })
    const { logo, imagery } = WALKTHROUGH_ANSWERS
    const uploaded = {
      ...WALKTHROUGH_ANSWERS,
      logo: logo.kind === 'file' ? { ...logo, url: 'https://blob.example/mark.svg' } : logo,
      imagery: {
        ...imagery,
        photos: imagery.photos.map((photo) => ({ ...photo, url: 'https://blob.example/p.webp' })),
      },
    }
    expect(shown.safeParse(uploaded).success).toBe(true)
  })

  it('answers every question with something the sketch can paint', () => {
    expect(WALKTHROUGH_ANSWERS.logo.kind).toBe('file')
    expect(WALKTHROUGH_ANSWERS.imagery.photos.length).toBeGreaterThanOrEqual(
      1 + WALKTHROUGH_COPY.features.length,
    )
    expect(WALKTHROUGH_ANSWERS.colours.kind).toBe('palette')
  })

  it('keeps the sentence inside the limits and short enough to type in a few seconds', () => {
    const { length } = WALKTHROUGH_ANSWERS.description
    expect(length).toBeGreaterThanOrEqual(CONFIG.form.minChars)
    expect(length).toBeLessThanOrEqual(CONFIG.form.maxChars)
    const typed = typingOffsets(WALKTHROUGH_ANSWERS.description, CONFIG.demo.typing).at(-1) ?? 0
    expect(typed).toBeGreaterThan(0)
    expect(typed).toBeLessThanOrEqual(3_500)
  })
})
