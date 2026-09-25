import { describe, expect, it } from 'vitest'
import type { BriefState } from '@/app/start/_components/brief-reducer'
import {
  arrivalView,
  briefReducer,
  firstInvalidIndex,
  hasProgress,
  INITIAL_STATE,
  isLastQuestion,
  questionAt,
  restoredState,
  resumeIndex,
  validateQuestion,
  viewFor,
} from '@/app/start/_components/brief-reducer'
import { type DoneDetails, doneDetailsFrom } from '@/app/start/_components/done-storage'
import { failureOf, type SendFailure } from '@/app/start/_components/send-brief'
import { BLANK_ANSWERS } from '@/lib/brief/answers'
import { QUESTION_IDS } from '@/lib/brief/question-ids'
import type { Answers } from '@/lib/brief/schema'

// A failed send's error, as the flow words one.
const TRY_AGAIN = { message: 'Try again.', call: false }

const SENTENCE = 'Physiotherapy clinic in Sheffield. Sports injuries and post-op rehabilitation.'

const COMPLETE: Answers = {
  description: SENTENCE,
  name: 'Sam',
  company: 'Ashgrove Physio',
  email: 'sam@ashgrove.example',
  logo: { kind: 'wordmark' },
  imagery: { style: 'minimal', photos: [] },
  colours: { kind: 'palette', paletteId: 'forest' },
}

const answered: BriefState = { ...INITIAL_STATE, answers: COMPLETE }

describe('questionAt', () => {
  it('names every question in order', () => {
    expect(QUESTION_IDS.map((_, i) => questionAt(i))).toEqual([...QUESTION_IDS])
  })

  it('throws past the last question rather than returning undefined', () => {
    expect(() => questionAt(QUESTION_IDS.length)).toThrow()
  })
})

describe('isLastQuestion', () => {
  it('is true only for the final index', () => {
    expect(isLastQuestion(QUESTION_IDS.length - 1)).toBe(true)
    expect(isLastQuestion(0)).toBe(false)
  })
})

describe('validateQuestion', () => {
  it('passes a complete answer', () => {
    expect(validateQuestion('describe', COMPLETE)).toEqual({})
  })

  it('reports one message per failing field', () => {
    const errors = validateQuestion('details', { ...COMPLETE, name: '', email: 'nope' })
    expect(Object.keys(errors).sort()).toEqual(['email', 'name'])
  })

  it('asks for the business name with its mark, and the details without it', () => {
    expect(Object.keys(validateQuestion('brand', { ...COMPLETE, company: ' ' }))).toEqual([
      'company',
    ])
    expect(validateQuestion('details', { ...COMPLETE, company: '' })).toEqual({})
  })

  // An upload never holds up Next (plan D14); the send waits for it instead.
  it('lets a picture still uploading through its question', () => {
    const pending: Answers = {
      ...COMPLETE,
      logo: { kind: 'file', id: 'l1', fileName: 'logo.svg', url: null },
      imagery: { style: 'warm', photos: [{ id: 'p1', fileName: 'shop.jpg', url: null }] },
    }
    expect(validateQuestion('brand', pending)).toEqual({})
    expect(validateQuestion('imagery', pending)).toEqual({})
    expect(firstInvalidIndex(pending)).toBe(QUESTION_IDS.length)
  })
})

describe('firstInvalidIndex', () => {
  it('is the first question for a blank brief', () => {
    expect(firstInvalidIndex(BLANK_ANSWERS)).toBe(0)
  })

  it('stops at the first question that is not yet valid', () => {
    expect(firstInvalidIndex({ ...BLANK_ANSWERS, description: SENTENCE })).toBe(1)
    expect(firstInvalidIndex({ ...COMPLETE, email: 'nope' })).toBe(4)
  })

  // The look and the colour have answers that validate before anyone chooses them, which is why
  // the flow follows `reached` as well (plan D3).
  it('passes over the look and the colour, whose defaults validate', () => {
    expect(firstInvalidIndex({ ...BLANK_ANSWERS, description: SENTENCE, company: 'Gibbs' })).toBe(4)
  })

  it('is one past the end when every question is answered', () => {
    expect(firstInvalidIndex(COMPLETE)).toBe(QUESTION_IDS.length)
  })

  it('does not let a broken custom colour pass', () => {
    expect(firstInvalidIndex({ ...COMPLETE, colours: { kind: 'custom', hex: '#12' } })).toBe(3)
  })
})

describe('briefReducer', () => {
  it('records typed answers', () => {
    const next = briefReducer(INITIAL_STATE, {
      type: 'set-text',
      field: 'description',
      value: SENTENCE,
    })
    expect(next.answers.description).toBe(SENTENCE)
  })

  it('stores the messages for a question that fails its check', () => {
    const next = briefReducer(INITIAL_STATE, { type: 'check', question: 'describe' })
    expect(next.errors.description).toBeTypeOf('string')
  })

  it('stores nothing for a question that passes', () => {
    expect(briefReducer(answered, { type: 'check', question: 'describe' }).errors).toEqual({})
  })

  it('clears a field error as soon as that field changes', () => {
    const blocked = briefReducer(INITIAL_STATE, { type: 'check', question: 'describe' })
    const typing = briefReducer(blocked, { type: 'set-text', field: 'description', value: 'W' })
    expect(typing.errors.description).toBeUndefined()
  })

  it('keeps a rejected file message until that answer changes', () => {
    const rejected = briefReducer(INITIAL_STATE, {
      type: 'reject-file',
      field: 'logo',
      message: 'Too big.',
    })
    expect(rejected.errors.logo).toBe('Too big.')
    const replaced = briefReducer(rejected, {
      type: 'set-logo',
      value: { kind: 'file', id: 'l1', fileName: 'logo.svg', url: null },
    })
    expect(replaced.errors.logo).toBeUndefined()
  })

  it('clears every error and the submit error on navigation', () => {
    const failed = briefReducer(
      briefReducer(INITIAL_STATE, { type: 'check', question: 'describe' }),
      { type: 'submit-failed', error: TRY_AGAIN },
    )
    const cleared = briefReducer(failed, { type: 'clear-errors' })
    expect(cleared.errors).toEqual({})
    expect(cleared.submitError).toBeUndefined()
  })

  it('restores stored answers and the uploaded files, but not uploads that never finished', () => {
    const uploaded = { id: 'p1', fileName: 'shop.jpg', url: 'https://blob.example/photos/a.jpg' }
    const stored: Answers = {
      ...COMPLETE,
      logo: { kind: 'file', id: 'l1', fileName: 'logo.svg', url: null },
      imagery: { style: 'dark', photos: [uploaded, { id: 'p2', fileName: 'van.jpg', url: null }] },
    }
    const next = briefReducer(INITIAL_STATE, {
      type: 'hydrate',
      draft: { answers: stored, reached: 4 },
    })
    expect(next.answers.company).toBe('Ashgrove Physio')
    expect(next.answers.logo).toEqual({ kind: 'wordmark' })
    expect(next.answers.imagery).toEqual({ style: 'dark', photos: [uploaded] })
    expect(next.reached).toBe(4)
  })

  it('gives a draft saved before `reached` its first unanswered question', () => {
    const partial = { ...COMPLETE, company: '' }
    expect(restoredState({ answers: partial, reached: undefined }, null).reached).toBe(1)
    expect(restoredState({ answers: COMPLETE, reached: undefined }, null).reached).toBe(4)
  })

  it('records the furthest question shown, never further back and never past the last', () => {
    const at2 = briefReducer(INITIAL_STATE, { type: 'reach', index: 2 })
    expect(briefReducer(at2, { type: 'reach', index: 1 }).reached).toBe(2)
    expect(briefReducer(at2, { type: 'reach', index: 9 }).reached).toBe(4)
  })

  it('records a finished upload against its picture and ignores one that was removed', () => {
    const picked = briefReducer(INITIAL_STATE, {
      type: 'set-photos',
      photos: [{ id: 'p1', fileName: 'shop.jpg', url: null }],
    })
    const done = briefReducer(picked, { type: 'upload-done', id: 'p1', url: 'https://b/x.jpg' })
    expect(done.answers.imagery.photos[0]?.url).toBe('https://b/x.jpg')
    expect(briefReducer(picked, { type: 'upload-done', id: 'gone', url: 'https://b/y.jpg' })).toBe(
      picked,
    )
  })

  it('keeps what the browser read in the logo beside it, and ignores a reading for one that went', () => {
    const picked = briefReducer(INITIAL_STATE, {
      type: 'set-logo',
      value: { kind: 'file', id: 'l1', fileName: 'logo.svg', url: null },
    })
    const read = briefReducer(picked, {
      type: 'logo-read',
      id: 'l1',
      polarity: 'light-artwork',
      accent: '#2f6f4e',
    })
    expect(read.answers.logo).toEqual({
      kind: 'file',
      id: 'l1',
      fileName: 'logo.svg',
      url: null,
      polarity: 'light-artwork',
      accent: '#2f6f4e',
    })
    expect(
      briefReducer(picked, { type: 'logo-read', id: 'gone', polarity: 'mixed', accent: null }),
    ).toBe(picked)
    expect(
      briefReducer(INITIAL_STATE, { type: 'logo-read', id: 'l1', polarity: 'mixed', accent: null }),
    ).toBe(INITIAL_STATE)
  })

  it('holds a send for a picture still uploading, and lets it go if called off', () => {
    const waiting = briefReducer(answered, { type: 'wait', website: '' })
    expect(waiting.status).toEqual({ kind: 'waiting', website: '' })
    expect(briefReducer(waiting, { type: 'cancel-wait' }).status).toEqual({ kind: 'editing' })
    const sending = briefReducer(waiting, { type: 'submitting' })
    expect(briefReducer(sending, { type: 'cancel-wait' })).toBe(sending)
  })

  it('keeps the visitor on the form when submitting fails', () => {
    const sending = briefReducer(answered, { type: 'submitting' })
    expect(sending.status).toEqual({ kind: 'submitting' })
    const failed = briefReducer(sending, { type: 'submit-failed', error: TRY_AGAIN })
    expect(failed.status).toEqual({ kind: 'editing' })
    expect(failed.submitError).toBe(TRY_AGAIN)
    expect(failed.answers).toEqual(COMPLETE)
  })

  it('carries the submission and its words once submitted, and starts again on request', () => {
    const submitted = {
      slug: 'abcdefghjkmn',
      deadlineAt: '2026-09-04T12:05:00.000Z',
      conceptCount: 1,
    }
    const details: DoneDetails = {
      slug: submitted.slug,
      first: 'Sam',
      company: 'Ashgrove Physio',
      email: 'sam@ashgrove.example',
      paletteLabel: 'Forest',
      styleLabel: 'Clean and minimal',
    }
    const done = briefReducer(
      { ...answered, reached: 4 },
      { type: 'submitted', submitted, details },
    )
    expect(done.status).toEqual({ kind: 'done', submitted, details })
    // The answers stay as sent, for the finished sketch, until a new brief is started.
    expect(done.answers).toEqual(COMPLETE)
    expect(briefReducer(done, { type: 'restart' })).toBe(INITIAL_STATE)
  })
})

// Each way a send can end (docs/start-page-journey-plan.md, 4.8), as the flow dispatches it:
// every failure lands the visitor back on the last question, the answers and the question reached
// untouched and the ask's error worded for it; success carries the submission.
describe("the send's outcomes", () => {
  const sending = briefReducer({ ...answered, reached: 4 }, { type: 'submitting' })
  const failures: readonly SendFailure[] = ['retry', 'timeout', 'too_many', 'rejected', 'network']

  it.each(failures)('a %s leaves the form as it was, with its words for the ask', (failure) => {
    const failed = briefReducer(sending, { type: 'submit-failed', error: failureOf(failure) })
    expect(failed.status).toEqual({ kind: 'editing' })
    expect(failed.submitError).toEqual(failureOf(failure))
    expect(failed.answers).toEqual(COMPLETE)
    expect(failed.reached).toBe(4)
  })

  it('clears the last failure, and the call it offered, as the next send starts', () => {
    const failed = briefReducer(sending, { type: 'submit-failed', error: failureOf('too_many') })
    expect(failed.submitError?.call).toBe(true)
    expect(briefReducer(failed, { type: 'submitting' }).submitError).toBeUndefined()
  })

  it('carries the submission once the server answers', () => {
    const submitted = {
      slug: 'k7m2p9x4w3hd',
      deadlineAt: '2026-09-25T10:05:00.000Z',
      conceptCount: 2,
    }
    const details = doneDetailsFrom(COMPLETE, submitted.slug)
    const done = briefReducer(sending, { type: 'submitted', submitted, details })
    expect(done.status).toEqual({ kind: 'done', submitted, details })
    expect(done.submitError).toBeUndefined()
  })
})

describe('the hero hand-off', () => {
  const SHORT = 'Bike repair'

  it('merges the sentence over a returning draft and keeps every other answer', () => {
    const state = restoredState({ answers: COMPLETE, reached: 4 }, SENTENCE.toUpperCase())
    expect(state.answers).toEqual({ ...COMPLETE, description: SENTENCE.toUpperCase() })
    expect(state.reached).toBe(4)
  })

  it('reaches the name question with a sentence long enough, and not with a short one', () => {
    expect(restoredState(null, SENTENCE).reached).toBe(1)
    expect(restoredState(null, SHORT)).toMatchObject({
      reached: 0,
      answers: { description: SHORT },
    })
  })
})

describe('resuming (plan D3 and 7.4)', () => {
  const at = (answers: Answers, reached: number): BriefState => ({
    ...INITIAL_STATE,
    answers,
    reached,
  })

  it('resumes at the question reached although every later answer validates', () => {
    expect(resumeIndex(at(COMPLETE, 2))).toBe(2)
  })

  it('resumes at the first unanswered question when that comes first', () => {
    expect(resumeIndex(at({ ...COMPLETE, company: '' }, 4))).toBe(1)
  })

  // The reorder's own case (plan section 10): a sentence and a business name, and the question
  // after them reached, resume at the look, never passing over the look and the colour.
  it('resumes a sentence and a business name at the look', () => {
    const named: Answers = { ...BLANK_ANSWERS, description: SENTENCE, company: 'Gibbs' }
    expect(resumeIndex(at(named, 2))).toBe(QUESTION_IDS.indexOf('imagery'))
    expect(resumeIndex(at(named, 4))).toBe(QUESTION_IDS.indexOf('details'))
  })

  it('never resumes past the last question', () => {
    expect(resumeIndex(at(COMPLETE, 4))).toBe(4)
  })

  it('shows a question asked for only as far as the draft allows', () => {
    const arrival = { kind: 'question', index: 0 } as const
    const state = at(COMPLETE, 2)
    expect(viewFor({ kind: 'question', index: 4 }, state, arrival)).toEqual({
      kind: 'question',
      index: 2,
    })
    expect(viewFor({ kind: 'question', index: 1 }, state, arrival)).toEqual({
      kind: 'question',
      index: 1,
    })
    expect(viewFor({ kind: 'done', slug: 'abc' }, state, arrival)).toEqual({
      kind: 'done',
      slug: 'abc',
    })
    expect(viewFor({ kind: 'arrival', bare: true }, state, arrival)).toBe(arrival)
  })

  it('opens a live submission from bare /start only when this tab has no draft', () => {
    expect(arrivalView(INITIAL_STATE, 'abc')).toEqual({ kind: 'done', slug: 'abc' })
    expect(arrivalView(at(COMPLETE, 3), 'abc')).toEqual({ kind: 'question', index: 3 })
    expect(arrivalView(INITIAL_STATE, null)).toEqual({ kind: 'question', index: 0 })
  })

  it('keeps a draft only once something has been answered or reached', () => {
    expect(hasProgress(BLANK_ANSWERS, 0)).toBe(false)
    expect(hasProgress(BLANK_ANSWERS, 1)).toBe(true)
    expect(hasProgress({ ...BLANK_ANSWERS, name: 'S' }, 0)).toBe(true)
    expect(
      hasProgress({ ...BLANK_ANSWERS, colours: { kind: 'palette', paletteId: 'plum' } }, 0),
    ).toBe(true)
  })
})
