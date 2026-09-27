import { passing, type SendFailure } from '@/app/contact/_components/send-contact'
import {
  CONTACT_FIELDS,
  checkField,
  type ContactErrors,
  type ContactField,
  type ContactFields,
} from '@/lib/contact/checks'
import type { Result } from '@/lib/errors'

// Where the send's ink is (app/_styles/contact.css, .contact-bloom): held while the message is on
// its way, run on over the card once it has gone, or drained where it stands when it did not.
export type Bloom = 'hold' | 'complete' | 'drain'

export type ContactState = Readonly<{
  fields: ContactFields
  errors: ContactErrors
  status: 'editing' | 'sending' | 'sent'
  bloom: Bloom | null
  // The server's answer, kept until the ink's hold has ended, so a fast answer never cuts short
  // the words on the ink.
  answer: Result<null, SendFailure> | null
  // The hold has played and CONFIG.contact.send.minHoldMs has passed since the press.
  held: boolean
  failure: SendFailure | null
  // Failures in a row that a second try may clear (send-contact.ts, passing); enough of them
  // offer the call (CONFIG.contact.send.stuckAfter).
  failures: number
}>

export type ContactAction =
  | { type: 'edit'; field: ContactField; value: string }
  | { type: 'blur'; field: ContactField }
  | { type: 'restore'; fields: Partial<ContactFields> }
  | { type: 'invalid'; errors: ContactErrors }
  | { type: 'send' }
  | { type: 'answer'; result: Result<null, SendFailure> }
  | { type: 'held' }
  | { type: 'bloomEnd' }
  | { type: 'again' }
  | { type: 'fix' }

export const INITIAL: ContactState = {
  fields: { message: '', name: '', email: '' },
  errors: {},
  status: 'editing',
  bloom: null,
  answer: null,
  held: false,
  failure: null,
  failures: 0,
}

// The errors with one field's replaced, or taken away when it passes, still in the page's order.
function withError(
  errors: ContactErrors,
  field: ContactField,
  error: string | undefined,
): ContactErrors {
  const next: Partial<Record<ContactField, string>> = {}
  for (const each of CONTACT_FIELDS) {
    const value = each === field ? error : errors[each]
    if (value !== undefined) next[each] = value
  }
  return next
}

// The send settles once both the answer and the end of the hold are in, whichever comes last: a
// message that went runs the ink on over the card, and one that did not drains it and says why,
// with every word still in the fields.
function settle(state: ContactState): ContactState {
  const { answer } = state
  if (answer === null || !state.held) return state
  if (answer.ok) return { ...state, bloom: 'complete', failures: 0 }
  return {
    ...state,
    status: 'editing',
    bloom: 'drain',
    failure: answer.reason,
    failures: passing(answer.reason) ? state.failures + 1 : state.failures,
  }
}

// The form's state machine (ADR 0040). A field is checked when it is left with words in it or
// when the message is sent, and re-checked as it is typed in only while it shows an error, so an
// empty field never nags and a fixed one clears at once. Any action outside the status it belongs
// to leaves the state as it is: a second press while sending, a late answer after "Send another
// message", an animation's end with no ink to end.
export function contactReducer(state: ContactState, action: ContactAction): ContactState {
  switch (action.type) {
    case 'edit': {
      if (state.status !== 'editing') return state
      const fields = { ...state.fields, [action.field]: action.value }
      if (state.errors[action.field] === undefined) return { ...state, fields }
      const errors = withError(state.errors, action.field, checkField(action.field, action.value))
      return { ...state, fields, errors }
    }
    case 'blur': {
      const value = state.fields[action.field]
      if (state.status !== 'editing' || value.trim() === '') return state
      const errors = withError(state.errors, action.field, checkField(action.field, value))
      return { ...state, errors }
    }
    case 'restore': {
      if (state.status !== 'editing') return state
      const fields: Record<ContactField, string> = { ...state.fields }
      for (const field of CONTACT_FIELDS) {
        const typed = action.fields[field]
        if (typed !== undefined && typed !== '') fields[field] = typed
      }
      return { ...state, fields }
    }
    case 'invalid':
      return state.status === 'editing' ? { ...state, errors: action.errors } : state
    case 'send':
      if (state.status !== 'editing') return state
      return {
        ...state,
        status: 'sending',
        bloom: 'hold',
        errors: {},
        answer: null,
        held: false,
        failure: null,
      }
    case 'answer':
      if (state.status !== 'sending' || state.bloom !== 'hold') return state
      return settle({ ...state, answer: action.result })
    case 'held':
      if (state.status !== 'sending' || state.bloom !== 'hold') return state
      return settle({ ...state, held: true })
    case 'bloomEnd':
      if (state.status === 'sending' && state.bloom === 'complete') {
        return { ...state, status: 'sent' }
      }
      if (state.status === 'editing' && state.bloom === 'drain') return { ...state, bloom: null }
      return state
    case 'again':
      if (state.status !== 'sent') return state
      return {
        ...state,
        status: 'editing',
        fields: { ...state.fields, message: '' },
        bloom: null,
        answer: null,
        held: false,
        failure: null,
        failures: 0,
      }
    case 'fix':
      if (state.status !== 'sent') return state
      return { ...state, status: 'editing', bloom: null, answer: null, held: false, failure: null }
  }
}
