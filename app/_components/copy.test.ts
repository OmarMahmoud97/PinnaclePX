import { describe, expect, it } from 'vitest'
import { COPY } from '@/app/_components/copy-corpus'
import { includedGroups } from '@/app/_components/included-items'
import { SECOND_VISIT, straightAnswerItems } from '@/app/_components/straight-answer-items'
import { MEASURED_RESULTS } from '@/app/_components/work-items'
import { CONFIG } from '@/lib/config'
import { CALL_AGENDA, PRICE, printedPrice } from '@/lib/site'

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

  it('says "AI" twice outside the question that asks about it', () => {
    const mentions = COPY.flatMap((text) => text.match(/\bAI\b/g) ?? [])
    expect(mentions).toHaveLength(3)
  })

  it('never calls the wording "copy" where a visitor reads it', () => {
    expect(COPY.filter((text) => /\bcopy\b/i.test(text))).toEqual([])
  })

  // The only figures on the page are the clients' measured results, each with the studio's
  // records behind it in docs/claims-register.md; the exemption is by exact string.
  it('never uses a banned word, a figure in per cent or an exclamation mark', () => {
    const allowed = new Set<string>(MEASURED_RESULTS)
    expect(COPY.filter((text) => !allowed.has(text) && BANNED.test(text))).toEqual([])
  })

  it('exempts only results that carry a figure', () => {
    for (const result of MEASURED_RESULTS) expect(result).toMatch(/\d|page one/)
    expect(MEASURED_RESULTS.some((result) => result.includes('!'))).toBe(false)
  })

  // The site band sets up "before they book" and the call agenda pays it off, so the phrase is
  // held identical in both, and the build section renders the agenda.
  it('shares the booking phrase between the site band and the call agenda', () => {
    const phrase = 'before they book'
    expect(includedGroups(null).some((group) => group.scene.includes(phrase))).toBe(true)
    expect(CALL_AGENDA.some((item) => item.what.includes(phrase))).toBe(true)
  })

  // The rate card prints through PRICE, never typed, and never as a bare "from" figure: a price
  // without its scope in the same sentence reads as the opening of a range (CAP 3.17). The
  // corpus's own VAT sample is a bare figure on purpose and renders nowhere, so it is exempt.
  it('prints every price through PRICE, with its scope and never as a "from" figure', () => {
    const vatSample = printedPrice(CONFIG.price.from, {
      vatRegistered: true,
      vatRate: CONFIG.price.vatRate,
    })
    const rendered = COPY.filter((text) => text.includes('£') && text !== vatSample)
    const priceLines = Object.values(PRICE)
    expect(rendered.filter((text) => !priceLines.some((line) => text.includes(line)))).toEqual([])
    expect(COPY.filter((text) => /from £/i.test(text))).toEqual([])
  })

  // The second-visit answer promises unseen templates only once enough are ready, and never a
  // third visit: two of three is the owner's cap (ADR 0038).
  it('promises a second visit only from six ready templates, and never a third', () => {
    const answerAt = (ready: number) =>
      straightAnswerItems(ready).find((item) => item.question.startsWith('What if I'))?.answer
    expect(answerAt(1)).toBe(SECOND_VISIT.untilSix)
    expect(answerAt(5)).toBe(SECOND_VISIT.untilSix)
    expect(answerAt(6)).toBe(SECOND_VISIT.fromSix)
    expect(answerAt(8)).toBe(SECOND_VISIT.fromSix)
    for (const answer of Object.values(SECOND_VISIT)) expect(answer).not.toMatch(/nine|in all/i)
  })
})
