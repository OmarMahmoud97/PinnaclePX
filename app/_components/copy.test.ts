import { describe, expect, it } from 'vitest'
import { COPY } from '@/app/_components/copy-corpus'
import { OUTCOME_ITEMS } from '@/app/_components/outcome-items'
import { SECOND_VISIT, straightAnswerItems } from '@/app/_components/straight-answer-items'
import { CALL_AGENDA } from '@/lib/site'

const MAX_WORDS = 20

// The voice rule the plan sets: a sentence a burned buyer can read on a phone.
function longSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.split(/\s+/).length > MAX_WORDS)
}

// Words the page never uses: marketese, statutory rights dressed as an offer, a claim about the
// designs the pipeline cannot keep, a competitor's name, a figure, an exclamation.
const BANNED =
  /\b(guarantee[ds]?|risk-free|unlimited|24\/7|instantly|generated?|AI website builder|per cent|Wix|Squarespace|Durable|Mixo)\b|[%!]/i

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

  it('never uses a banned word, a figure in per cent or an exclamation mark', () => {
    expect(COPY.filter((text) => BANNED.test(text))).toEqual([])
  })

  // Outcomes sets up "before they book" and the call agenda pays it off, so the phrase is held
  // identical in both, and the Taster renders the agenda.
  it('shares the booking phrase between the outcomes and the call agenda', () => {
    const phrase = 'before they book'
    expect(OUTCOME_ITEMS.some((item) => item.body.includes(phrase))).toBe(true)
    expect(CALL_AGENDA.some((item) => item.what.includes(phrase))).toBe(true)
  })

  // The second-visit answer promises unseen templates only once enough are ready.
  it('promises a second visit only from six ready templates, and nine only from nine', () => {
    const answerAt = (ready: number) =>
      straightAnswerItems(ready).find((item) => item.question.startsWith('What if I'))?.answer
    expect(answerAt(1)).toBe(SECOND_VISIT.untilSix)
    expect(answerAt(5)).toBe(SECOND_VISIT.untilSix)
    expect(answerAt(6)).toBe(SECOND_VISIT.fromSix)
    expect(answerAt(8)).toBe(SECOND_VISIT.fromSix)
    expect(answerAt(9)).toBe(SECOND_VISIT.fromNine)
    expect(SECOND_VISIT.untilSix).not.toContain('nine')
    expect(SECOND_VISIT.fromSix).not.toContain('nine')
  })
})
