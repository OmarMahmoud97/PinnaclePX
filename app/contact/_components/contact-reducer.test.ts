import { describe, expect, it } from 'vitest'
import {
  type ContactAction,
  contactReducer,
  type ContactState,
  INITIAL,
} from '@/app/contact/_components/contact-reducer'
import type { SendFailure } from '@/app/contact/_components/send-contact'
import { CONTACT_ERRORS } from '@/lib/contact/messages'
import { err, ok } from '@/lib/errors'

const FILLED: ContactState = {
  ...INITIAL,
  fields: { message: 'Do you do Shopify?', name: 'Sam Patel', email: 'sam@example.com' },
}

const run = (state: ContactState, ...actions: ContactAction[]) =>
  actions.reduce(contactReducer, state)

// A send pressed, with its answer and the end of its hold arriving in either order.
const sending = run(FILLED, { type: 'send' })

describe('editing', () => {
  it('checks a field on the way out only when it has words in it', () => {
    expect(run(INITIAL, { type: 'blur', field: 'email' }).errors).toEqual({})
    const typed = run(
      INITIAL,
      { type: 'edit', field: 'email', value: 'sam@' },
      { type: 'blur', field: 'email' },
    )
    expect(typed.errors).toEqual({ email: CONTACT_ERRORS.email })
  })

  it('re-checks while typing only a field that shows an error, and clears it once it passes', () => {
    const quiet = run(INITIAL, { type: 'edit', field: 'email', value: 'sam@' })
    expect(quiet.errors).toEqual({})
    const flagged = run(quiet, { type: 'blur', field: 'email' })
    const still = run(flagged, { type: 'edit', field: 'email', value: 'sam@example' })
    expect(still.errors).toEqual({ email: CONTACT_ERRORS.email })
    const fixed = run(still, { type: 'edit', field: 'email', value: 'sam@example.com' })
    expect(fixed.errors).toEqual({})
  })

  it('keeps the other fields’ errors, in the page’s order, when one clears', () => {
    const errors = { message: CONTACT_ERRORS.messageEmpty, name: CONTACT_ERRORS.name }
    const state = run(
      INITIAL,
      { type: 'invalid', errors },
      { type: 'edit', field: 'message', value: 'Hi' },
    )
    expect(state.errors).toEqual({ name: CONTACT_ERRORS.name })
  })

  it('restores only the words typed before the page woke up', () => {
    const state = run(FILLED, {
      type: 'restore',
      fields: { message: 'Typed early', name: '', email: '' },
    })
    expect(state.fields).toEqual({ ...FILLED.fields, message: 'Typed early' })
  })
})

describe('sending', () => {
  it('holds the ink and clears the errors and the last failure', () => {
    const failed = { ...FILLED, errors: { name: CONTACT_ERRORS.name }, failure: 'retry' as const }
    const state = run(failed, { type: 'send' })
    expect(state).toMatchObject({ status: 'sending', bloom: 'hold', errors: {}, failure: null })
  })

  it('waits for both the answer and the hold, whichever comes last', () => {
    const answered = run(sending, { type: 'answer', result: ok(null) })
    expect(answered.bloom).toBe('hold')
    expect(run(answered, { type: 'held' }).bloom).toBe('complete')
    const held = run(sending, { type: 'held' })
    expect(held.bloom).toBe('hold')
    expect(run(held, { type: 'answer', result: ok(null) }).bloom).toBe('complete')
  })

  it('shows the sent card once the ink has covered the form', () => {
    const covered = run(sending, { type: 'answer', result: ok(null) }, { type: 'held' })
    expect(covered.status).toBe('sending')
    const sent = run(covered, { type: 'bloomEnd' })
    expect(sent).toMatchObject({ status: 'sent', bloom: 'complete', failures: 0 })
  })

  it('drains back to the form with every word kept and the reason', () => {
    const refused = run(sending, { type: 'held' }, { type: 'answer', result: err('too_many') })
    expect(refused).toMatchObject({ status: 'editing', bloom: 'drain', failure: 'too_many' })
    expect(refused.fields).toEqual(FILLED.fields)
    expect(run(refused, { type: 'bloomEnd' }).bloom).toBeNull()
  })

  it('counts in a row only the failures a second try may clear', () => {
    const fail = (state: ContactState, reason: SendFailure) =>
      run(
        state,
        { type: 'send' },
        { type: 'held' },
        { type: 'answer', result: err(reason) },
        { type: 'bloomEnd' },
      )
    expect(fail(fail(FILLED, 'retry'), 'network').failures).toBe(2)
    expect(fail(FILLED, 'timeout').failures).toBe(1)
    expect(fail(fail(FILLED, 'retry'), 'too_many').failures).toBe(1)
    expect(fail(FILLED, 'rejected').failures).toBe(0)
    const went = run(
      fail(FILLED, 'retry'),
      { type: 'send' },
      { type: 'held' },
      { type: 'answer', result: ok(null) },
    )
    expect(went.failures).toBe(0)
  })

  it('ignores a second press, a late answer and an animation’s end with no ink', () => {
    expect(run(sending, { type: 'send' })).toBe(sending)
    expect(run(sending, { type: 'edit', field: 'message', value: 'x' })).toBe(sending)
    expect(run(FILLED, { type: 'answer', result: ok(null) })).toBe(FILLED)
    expect(run(FILLED, { type: 'held' })).toBe(FILLED)
    expect(run(FILLED, { type: 'bloomEnd' })).toBe(FILLED)
    expect(run(sending, { type: 'bloomEnd' })).toBe(sending)
    expect(run(FILLED, { type: 'again' })).toBe(FILLED)
    expect(run(FILLED, { type: 'fix' })).toBe(FILLED)
  })
})

describe('after the message has gone', () => {
  const sent = run(
    sending,
    { type: 'held' },
    { type: 'answer', result: ok(null) },
    { type: 'bloomEnd' },
  )

  it('writes again with the name and the address kept and the message cleared', () => {
    const again = run(sent, { type: 'again' })
    expect(again).toMatchObject({ status: 'editing', bloom: null, failure: null, failures: 0 })
    expect(again.fields).toEqual({ ...FILLED.fields, message: '' })
  })

  it('goes back to fix the address with every word kept', () => {
    const fix = run(sent, { type: 'fix' })
    expect(fix).toMatchObject({ status: 'editing', bloom: null })
    expect(fix.fields).toEqual(FILLED.fields)
  })

  it('ignores a late answer and a stray edit', () => {
    expect(run(sent, { type: 'answer', result: err('retry') })).toBe(sent)
    expect(run(sent, { type: 'edit', field: 'name', value: 'x' })).toBe(sent)
    expect(run(sent, { type: 'blur', field: 'email' })).toBe(sent)
  })
})
