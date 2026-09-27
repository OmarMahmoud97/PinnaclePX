import { describe, expect, it } from 'vitest'
import { BUILD_STEPS } from '@/app/_components/build-items'
import { FAQ_ITEMS } from '@/app/_components/faq-items'
import { straightAnswerItems } from '@/app/_components/straight-answer-items'
import type { ContactRefusal } from '@/app/contact/_components/actions'
import {
  ANSWERS,
  CALL,
  emailNote,
  meterLine,
  REFUSED,
  SENDING,
  sentHeading,
  SHEET,
  WRITE,
} from '@/app/contact/_components/contact-copy'
import {
  DETAILS,
  SEND_REFUSED,
  SENDING as START_SENDING,
  TRY_AGAIN,
} from '@/app/start/_components/start-copy'
import { CONFIG } from '@/lib/config'
import { SITE } from '@/lib/site'

// The deck copies what the page may not import (contact-copy.ts), so each copy is held to its
// source here: a change on /start or the home page fails this test until /contact follows.
const sentences = (text: string) => text.split(/(?<=[.!?])\s+/)
const first = (text: string) => sentences(text)[0] ?? ''
const last = (text: string) => sentences(text).at(-1) ?? ''

describe('the phrases /contact shares with the rest of the site', () => {
  it('names the fields and the privacy link as the questionnaire does', () => {
    expect(WRITE.name).toBe(DETAILS.name)
    expect(WRITE.email).toBe(DETAILS.email)
    expect(WRITE.detailsLink).toBe(DETAILS.detailsLink)
  })

  it('sends in /start’s words, and retries in them', () => {
    expect(SENDING.ask).toBe(START_SENDING.ask)
    expect(SENDING.ink).toBe(START_SENDING.ink)
    expect(REFUSED.retry).toBe(SEND_REFUSED.retry)
    expect(SHEET.retry).toBe(TRY_AGAIN)
  })

  it('describes the call in the build’s and the pricing answer’s own sentences', () => {
    expect(CALL.heading).toBe(first(BUILD_STEPS[0]?.body ?? ''))
    const pricing = FAQ_ITEMS.map((item) => item.answer).find((answer) =>
      answer.includes(first(CALL.free)),
    )
    expect(pricing === undefined ? '' : last(pricing)).toBe(first(CALL.free))
  })

  it('promises what the Straight answers band and the site already promise', () => {
    const email = straightAnswerItems(0).find((item) => item.question.includes('email'))?.answer
    expect(sentences(email ?? '')).toEqual(
      expect.arrayContaining([
        'No newsletter, no chasing.',
        ...sentences(ANSWERS.items[1].answer).slice(1),
      ]),
    )
    expect(ANSWERS.items[2].answer).toBe('No newsletter, no chasing.')
    expect(first(WRITE.reassurance)).toBe(ANSWERS.items[2].answer)
    expect(last(WRITE.reassurance)).toBe(last(SITE.reassurance))
  })
})

describe('the meter', () => {
  const { maxChars, countdownChars } = CONFIG.contact.message
  const written = (length: number) => 'x'.repeat(length)

  it('stays empty until the last stretch', () => {
    expect(meterLine('')).toBe('')
    expect(meterLine(written(maxChars - countdownChars - 1))).toBe('')
    expect(meterLine(written(maxChars - countdownChars))).toBe(
      `${String(countdownChars)} characters left.`,
    )
  })

  it('counts under ten in words, and keeps its singulars', () => {
    expect(meterLine(written(maxChars - 10))).toBe('10 characters left.')
    expect(meterLine(written(maxChars - 9))).toBe('Nine characters left.')
    expect(meterLine(written(maxChars - 1))).toBe('One character left.')
    expect(meterLine(written(maxChars))).toBe('No characters left.')
    expect(meterLine(written(maxChars + 1))).toBe('One character over.')
    expect(meterLine(written(maxChars + 12))).toBe('12 characters over.')
  })

  it('counts what the check counts, without the space around the words', () => {
    expect(meterLine(`  ${written(maxChars - 1)}\n\n`)).toBe('One character left.')
  })
})

describe('the words that depend on the visitor or the owner', () => {
  it('greets the visitor by first name, and without one', () => {
    expect(sentHeading('dr sam patel')).toBe('Sam, your message is with the studio.')
    expect(sentHeading('  ')).toBe('Your message is with the studio.')
  })

  it('words every refusal the Server Action gives', () => {
    const refusals: readonly ContactRefusal[] = ['retry', 'too_many', 'rejected']
    expect(Object.keys(REFUSED).sort()).toEqual([...refusals].sort())
  })

  it('promises no reply until the owner confirms one', () => {
    expect(emailNote()).toBe(SITE.contactReplies ? WRITE.emailNoteReplies : WRITE.emailNote)
  })
})
