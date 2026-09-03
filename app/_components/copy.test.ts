import { describe, expect, it } from 'vitest'
import { FAQ_ITEMS } from '@/app/_components/faq-items'
import { STRAIGHT_ANSWER_ITEMS } from '@/app/_components/straight-answer-items'
import { WHAT_YOU_GET_ITEMS } from '@/app/_components/what-you-get-items'
import { SKETCH_CAPTION } from '@/components/sketch/captions'
import { CALL_AGENDA, SITE } from '@/lib/site'

const MAX_WORDS = 20

// The voice rule the plan sets: a sentence a burned buyer can read on a phone.
function longSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.split(/\s+/).length > MAX_WORDS)
}

const COPY: readonly string[] = [
  SITE.tagline,
  SITE.description,
  SITE.reassurance,
  SITE.callPromise,
  SITE.colourPromise,
  ...Object.values(SKETCH_CAPTION),
  ...CALL_AGENDA.map((item) => item.what),
  ...WHAT_YOU_GET_ITEMS.flatMap((item) => [item.title, item.detail]),
  ...STRAIGHT_ANSWER_ITEMS.flatMap((item) => [item.question, item.answer]),
  ...FAQ_ITEMS.flatMap((item) => [item.question, item.answer]),
]

describe('visitor-facing copy', () => {
  it('keeps every sentence under the word limit', () => {
    expect(COPY.flatMap(longSentences)).toEqual([])
  })

  it('never uses an em dash', () => {
    expect(COPY.filter((text) => text.includes('—'))).toEqual([])
  })

  it('says "AI" once outside the question that asks about it', () => {
    const mentions = COPY.flatMap((text) => text.match(/\bAI\b/g) ?? [])
    expect(mentions).toHaveLength(2)
  })

  it('never calls the wording "copy" where a visitor reads it', () => {
    expect(COPY.filter((text) => /\bcopy\b/i.test(text))).toEqual([])
  })
})
