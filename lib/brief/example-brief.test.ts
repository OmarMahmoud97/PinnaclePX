import { describe, expect, it } from 'vitest'
import { EXAMPLE_ANSWERS, FINAL_STAGE } from '@/lib/brief/example-brief'
import { QUESTION_IDS } from '@/lib/brief/question-ids'
import { briefSchema } from '@/lib/brief/schema'
import { typingOffsets } from '@/lib/brief/typing'
import { CONFIG } from '@/lib/config'

describe('EXAMPLE_ANSWERS', () => {
  it('would pass every question the real form asks, apart from the name and email it never shows', () => {
    // The example's photo is never uploaded: the sketch draws it from app/_components/photos.ts.
    // Given the URL an upload would have, the rest must pass as a visitor's answers would.
    const shown = briefSchema.omit({ name: true, email: true })
    const { imagery } = EXAMPLE_ANSWERS
    const uploaded = {
      ...EXAMPLE_ANSWERS,
      imagery: {
        ...imagery,
        photos: imagery.photos.map((photo) => ({ ...photo, url: 'https://blob.example/p.webp' })),
      },
    }
    expect(shown.safeParse(uploaded).success).toBe(true)
  })

  it('keeps the sentence inside the limits and short enough to type in a few seconds', () => {
    const { length } = EXAMPLE_ANSWERS.description
    expect(length).toBeGreaterThanOrEqual(CONFIG.form.minChars)
    expect(length).toBeLessThanOrEqual(CONFIG.form.maxChars)
    const typed = typingOffsets(EXAMPLE_ANSWERS.description, CONFIG.demo.typing).at(-1) ?? 0
    expect(typed).toBeGreaterThan(0)
    expect(typed).toBeLessThanOrEqual(4_500)
  })
})

describe('FINAL_STAGE', () => {
  it('is the sketch with every question answered', () => {
    expect(FINAL_STAGE).toBe(QUESTION_IDS.length)
  })
})
