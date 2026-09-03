import { describe, expect, it } from 'vitest'
import { answeredAt, answersAt, EXAMPLE_ANSWERS, FINAL_STAGE } from '@/lib/brief/example-brief'
import { briefSchema } from '@/lib/brief/schema'
import { typingOffsets } from '@/lib/brief/typing'
import { CONFIG } from '@/lib/config'

describe('EXAMPLE_ANSWERS', () => {
  it('would pass every question the real form asks, apart from the name and email it never shows', () => {
    const shown = briefSchema.omit({ name: true, email: true })
    expect(shown.safeParse(EXAMPLE_ANSWERS).success).toBe(true)
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

describe('answersAt', () => {
  it('types the sentence a character at a time before anything else lands', () => {
    const early = answersAt(1, 12)
    expect(early.description).toBe(EXAMPLE_ANSWERS.description.slice(0, 12))
    expect(early.company).toBe('')
  })

  it('lands the company from stage 2 and keeps the rest of the brief intact', () => {
    const late = answersAt(FINAL_STAGE, EXAMPLE_ANSWERS.description.length)
    expect(late).toEqual(EXAMPLE_ANSWERS)
  })
})

describe('answeredAt', () => {
  it('shows no answer given while the sentence is typing, then every answer up to the stage', () => {
    expect(answeredAt(1)).toBe(0)
    expect(answeredAt(2)).toBe(2)
    expect(answeredAt(FINAL_STAGE)).toBe(5)
  })
})
