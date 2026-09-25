// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { BLANK_ANSWERS } from '@/lib/brief/answers'
import { DRAFT_KEY, DRAFT_ORDER, writeDraft } from '@/lib/brief/draft'
import { readDraft } from '@/lib/brief/read-draft'
import type { Answers } from '@/lib/brief/schema'

const ANSWERS: Answers = {
  ...BLANK_ANSWERS,
  description: 'Physiotherapy clinic in Sheffield, sports injuries and rehab.',
  company: 'Ashgrove Physio',
}

// A draft as some page wrote it, stamped or not.
function stored(draft: object): void {
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...ANSWERS, ...draft }))
}

afterEach(() => {
  sessionStorage.clear()
})

describe('the draft', () => {
  it('comes back with the question it reached, under the order it was saved in', () => {
    writeDraft(ANSWERS, 2)
    expect(readDraft()).toEqual({ answers: ANSWERS, reached: 2 })
  })

  it('stamps the order the questions are asked in', () => {
    writeDraft(ANSWERS, 1)
    expect(JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? '{}')).toMatchObject({
      reached: 1,
      order: 'describe brand imagery colours details',
    })
  })

  it('keeps the answers but not the question of a draft saved under another order', () => {
    // Release 1's order: at its index 3 was the look, where today's is the colour.
    stored({ reached: 3, order: 'describe details logo imagery colours' })
    expect(readDraft()).toEqual({ answers: ANSWERS, reached: undefined })
  })

  it('keeps the answers but not the question of a draft saved before the order was stamped', () => {
    stored({ reached: 3 })
    expect(readDraft()).toEqual({ answers: ANSWERS, reached: undefined })
  })

  it('drops a question out of range whatever its order', () => {
    stored({ reached: 9, order: DRAFT_ORDER })
    expect(readDraft()).toEqual({ answers: ANSWERS, reached: undefined })
  })

  it('reads nothing from a draft that is not one', () => {
    sessionStorage.setItem(DRAFT_KEY, '{"description": 4')
    expect(readDraft()).toBeNull()
  })
})
