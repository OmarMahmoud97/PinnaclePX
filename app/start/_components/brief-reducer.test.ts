import { describe, expect, it } from 'vitest'
import type { BriefState } from '@/app/start/_components/brief-reducer'
import {
  briefReducer,
  firstInvalidIndex,
  INITIAL_STATE,
  isLastQuestion,
  questionAt,
  validateQuestion,
} from '@/app/start/_components/brief-reducer'
import { BLANK_ANSWERS } from '@/lib/brief/answers'
import { QUESTION_IDS } from '@/lib/brief/question-ids'
import type { Answers } from '@/lib/brief/schema'

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
})

describe('firstInvalidIndex', () => {
  it('is the first question for a blank brief', () => {
    expect(firstInvalidIndex(BLANK_ANSWERS)).toBe(0)
  })

  it('stops at the first question that is not yet valid', () => {
    expect(firstInvalidIndex({ ...BLANK_ANSWERS, description: SENTENCE })).toBe(1)
    expect(firstInvalidIndex({ ...COMPLETE, email: 'nope' })).toBe(1)
  })

  it('is one past the end when every question is answered', () => {
    expect(firstInvalidIndex(COMPLETE)).toBe(QUESTION_IDS.length)
  })

  it('does not let a broken custom colour pass', () => {
    expect(firstInvalidIndex({ ...COMPLETE, colours: { kind: 'custom', hex: '#12' } })).toBe(4)
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
      { type: 'submit-failed', message: 'Try again.' },
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
    const next = briefReducer(INITIAL_STATE, { type: 'hydrate', answers: stored })
    expect(next.answers.company).toBe('Ashgrove Physio')
    expect(next.answers.logo).toEqual({ kind: 'wordmark' })
    expect(next.answers.imagery).toEqual({ style: 'dark', photos: [uploaded] })
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

  it('does not let a picture still uploading count as an answer', () => {
    const pending: Answers = {
      ...COMPLETE,
      logo: { kind: 'file', id: 'l1', fileName: 'logo.svg', url: null },
    }
    expect(validateQuestion('logo', pending).logo).toMatch(/not finished uploading/)
    expect(firstInvalidIndex(pending)).toBe(2)
  })

  it('keeps the visitor on the form when submitting fails', () => {
    const sending = briefReducer(answered, { type: 'submitting' })
    expect(sending.status).toEqual({ kind: 'submitting' })
    const failed = briefReducer(sending, { type: 'submit-failed', message: 'Try again.' })
    expect(failed.status).toEqual({ kind: 'editing' })
    expect(failed.submitError).toBe('Try again.')
    expect(failed.answers).toEqual(COMPLETE)
  })

  it('carries the submission once submitted', () => {
    const submitted = {
      slug: 'abcdefghjkmn',
      deadlineAt: '2026-09-04T12:05:00.000Z',
      conceptCount: 1,
    }
    const done = briefReducer(answered, { type: 'submitted', submitted })
    expect(done.status).toEqual({ kind: 'done', ...submitted })
  })
})
