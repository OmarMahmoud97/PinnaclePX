import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest'
import { submitContact } from '@/app/contact/_components/actions'
import { CONFIG } from '@/lib/config'
import { hitLimit } from '@/lib/db/rate-limit'
import { sendEmail } from '@/lib/email/send'
import { env } from '@/lib/env'
import { AppError } from '@/lib/errors'

// A stand-in for the table the limits count in: every hit against a limit's key, as
// lib/db/rate-limit.ts counts them in one window.
const database = vi.hoisted(() => ({ hits: new Map<string, number>() }))

vi.mock('@/lib/db/rate-limit', () => ({
  hitLimit: vi.fn((limit: { scope: string; subject: string; max: number }) => {
    const key = `${limit.scope}:${limit.subject}`
    const count = (database.hits.get(key) ?? 0) + 1
    database.hits.set(key, count)
    return Promise.resolve(count <= limit.max)
  }),
}))

// Where the caller is, which a test moves to send as the same person from somewhere else.
const caller = vi.hoisted(() => ({ address: '203.0.113.9' }))

vi.mock('@/lib/rate-limit/request', () => ({
  callerAddress: () => Promise.resolve(caller.address),
}))
vi.mock('@/lib/email/send', () => ({ sendEmail: vi.fn(() => Promise.resolve('email-id')) }))

// A visitor's message, in words distinct enough to find in a log line if one ever leaked there.
const FIELDS = {
  message: 'Do you build Shopify shops for florists?\nWe have two branches.',
  name: 'Sam Patel',
  email: 'sam.patel@ashgrove.example',
}
const PERSONAL = ['sam', 'patel', 'ashgrove', 'shopify', 'florists', 'branches']

const SENT = { ok: true, value: null }
const REFUSED = (reason: string) => ({ ok: false, reason })

// What the form sends, as the action reads it: every part unknown.
type Submission = Readonly<{ fields: unknown; openedForMs: unknown; website: unknown }>

function send(over: Partial<Submission> = {}) {
  return submitContact({ fields: FIELDS, openedForMs: CONFIG.form.minMs, website: '', ...over })
}

// The console, where lib/log writes each event as one JSON line for Vercel to keep.
let consoles: MockInstance<Console['log']>[] = []
const logged = () =>
  consoles.flatMap((spy) => spy.mock.calls.map((call: readonly unknown[]) => call.join(' ')))
const events = () => logged().map((line) => JSON.parse(line) as Record<string, unknown>)

beforeEach(() => {
  database.hits.clear()
  caller.address = '203.0.113.9'
  vi.clearAllMocks()
  consoles = [
    vi.spyOn(console, 'log').mockImplementation(() => undefined),
    vi.spyOn(console, 'warn').mockImplementation(() => undefined),
    vi.spyOn(console, 'error').mockImplementation(() => undefined),
  ]
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('submitContact', () => {
  it('counts a message against both limits, then emails it to the owner once', async () => {
    expect(await send()).toEqual(SENT)
    expect(hitLimit).toHaveBeenCalledTimes(2)
    expect(sendEmail).toHaveBeenCalledExactlyOnceWith(
      env.OWNER_EMAIL,
      expect.objectContaining({ subject: 'Message from Sam Patel', replyTo: FIELDS.email }),
    )
    expect(events()).toEqual([
      { event: 'contact.sent', id: 'email-id', chars: FIELDS.message.length, lines: 2 },
    ])
  })

  // The per-person count is keyed by a hash of the address, so the table never holds it.
  it('counts by the caller and by a hash of the address, never the address itself', async () => {
    await send()
    const keys = [...database.hits.keys()]
    expect(keys).toEqual([
      'contact-ip:203.0.113.9',
      expect.stringMatching(/^contact-identity:[0-9a-f]{64}$/),
    ])
    expect(keys.join()).not.toContain('ashgrove')
  })

  it('sends the words trimmed, and the trimmed address for the reply', async () => {
    await send({
      fields: {
        message: '\n  Do you do Shopify?  ',
        name: ' Sam ',
        email: ' sam@ashgrove.example ',
      },
    })
    expect(sendEmail).toHaveBeenCalledExactlyOnceWith(
      env.OWNER_EMAIL,
      expect.objectContaining({
        subject: 'Message from Sam',
        replyTo: 'sam@ashgrove.example',
        text: expect.stringContaining('Message\nDo you do Shopify?\n\n') as string,
      }),
    )
  })

  it('refuses the hidden field filled, or a form sent too fast, before counting anything', async () => {
    expect(await send({ website: 'https://spam.example' })).toEqual(REFUSED('rejected'))
    expect(await send({ openedForMs: CONFIG.form.minMs - 1.2 })).toEqual(REFUSED('rejected'))
    expect(hitLimit).not.toHaveBeenCalled()
    expect(sendEmail).not.toHaveBeenCalled()
    // The time is logged to the millisecond, and nothing of what the hidden field held.
    expect(events()).toEqual([
      { event: 'contact.honeypot', openedForMs: CONFIG.form.minMs, filled: true },
      { event: 'contact.honeypot', openedForMs: CONFIG.form.minMs - 1, filled: false },
    ])
  })

  it.each([
    ['a time that is a string', { openedForMs: String(CONFIG.form.minMs) }],
    ['no time', { openedForMs: undefined }],
    ['a null time', { openedForMs: null }],
    ['a time that is not a number', { openedForMs: Number.NaN }],
    ['an endless time', { openedForMs: Number.POSITIVE_INFINITY }],
    ['a time before the page opened', { openedForMs: Number.NEGATIVE_INFINITY }],
    ['no hidden field', { website: undefined }],
    ['a null hidden field', { website: null }],
    ['a hidden field that is not a string', { website: 0 }],
  ])('refuses %s before counting anything', async (_label, over: Partial<Submission>) => {
    expect(await send(over)).toEqual(REFUSED('rejected'))
    expect(hitLimit).not.toHaveBeenCalled()
    expect(sendEmail).not.toHaveBeenCalled()
    expect(events()).toEqual([expect.objectContaining({ event: 'contact.honeypot' })])
  })

  // A crafted request decides the argument itself, so it can be anything, or left out.
  it.each([
    ['no argument', undefined],
    ['a null argument', null],
    ['an argument that is an array', []],
  ])('refuses %s before counting anything', async (_label, input) => {
    expect(await submitContact(input)).toEqual(REFUSED('rejected'))
    expect(hitLimit).not.toHaveBeenCalled()
    expect(sendEmail).not.toHaveBeenCalled()
    expect(events()).toEqual([{ event: 'contact.honeypot', openedForMs: null, filled: false }])
  })

  it.each([
    ['no fields', undefined],
    ['null fields', null],
    ['fields that are a string', FIELDS.message],
    ['fields that are an array', [FIELDS.message, FIELDS.name, FIELDS.email]],
    ['an empty message', { ...FIELDS, message: ' \n ' }],
    [
      'a message over its limit',
      { ...FIELDS, message: 'x'.repeat(CONFIG.contact.message.maxChars + 1) },
    ],
    ['a blank name', { ...FIELDS, name: '  ' }],
    ['an address that is not one', { ...FIELDS, email: 'sam.patel@ashgrove' }],
  ])('refuses %s before counting anything', async (_label, fields) => {
    expect(await send({ fields })).toEqual(REFUSED('rejected'))
    expect(hitLimit).not.toHaveBeenCalled()
    expect(sendEmail).not.toHaveBeenCalled()
    expect(events()).toEqual([{ event: 'contact.rejected', issues: expect.any(Number) as number }])
  })

  it('refuses a message past the hour’s limit for one caller, and sends nothing more', async () => {
    const { max } = CONFIG.rateLimit.contactPerIp
    for (let n = 0; n < max; n += 1) {
      const email = `visitor${String(n)}@example.com`
      expect(await send({ fields: { ...FIELDS, email } })).toEqual(SENT)
    }
    expect(await send({ fields: { ...FIELDS, email: 'another@example.com' } })).toEqual(
      REFUSED('too_many'),
    )
    expect(sendEmail).toHaveBeenCalledTimes(max)
    expect(events().at(-1)).toEqual({
      event: 'contact.rate_limited',
      byIp: true,
      byIdentity: false,
    })
  })

  // Two spellings of one address are one person, wherever they send from.
  it('refuses a message past the day’s limit for one person, from anywhere', async () => {
    const { max } = CONFIG.rateLimit.contactPerIdentity
    for (let n = 0; n < max; n += 1) {
      caller.address = `198.51.100.${String(n + 1)}`
      expect(await send()).toEqual(SENT)
    }
    caller.address = '192.0.2.1'
    expect(await send({ fields: { ...FIELDS, email: ' Sam.Patel@Ashgrove.example' } })).toEqual(
      REFUSED('too_many'),
    )
    expect(sendEmail).toHaveBeenCalledTimes(max)
    expect(events().at(-1)).toEqual({
      event: 'contact.rate_limited',
      byIp: false,
      byIdentity: true,
    })
  })

  it('counts a try after a failed send again, as the limits allow for', async () => {
    vi.mocked(sendEmail).mockRejectedValueOnce(new Error('socket hang up'))
    expect(await send()).toEqual(REFUSED('retry'))
    expect(await send()).toEqual(SENT)
    expect([...database.hits.values()]).toEqual([2, 2])
    expect(sendEmail).toHaveBeenCalledTimes(2)
  })

  it('says to try again when the limits cannot be counted, and sends nothing', async () => {
    vi.mocked(hitLimit).mockRejectedValueOnce(new Error('connection reset'))
    expect(await send()).toEqual(REFUSED('retry'))
    expect(sendEmail).not.toHaveBeenCalled()
    expect(events()).toEqual([{ event: 'contact.failed', step: 'limit', reason: 'Error' }])
  })

  // The page sends one Server Action at a time, so the server answers before the page gives up
  // on it, or the visitor's next try would wait behind a send that never came back.
  it('says to try again once its own deadline passes, before the page stops waiting', async () => {
    const { serverMs, timeoutMs } = CONFIG.contact.send
    expect(serverMs).toBeLessThan(timeoutMs)
    vi.useFakeTimers()
    vi.mocked(hitLimit).mockReturnValueOnce(new Promise<boolean>(() => undefined))
    const answer = send()
    await vi.advanceTimersByTimeAsync(serverMs - 1)
    expect(events()).toEqual([])
    await vi.advanceTimersByTimeAsync(1)
    expect(await answer).toEqual(REFUSED('retry'))
    expect(sendEmail).not.toHaveBeenCalled()
    expect(events()).toEqual([{ event: 'contact.failed', step: 'limit', reason: 'deadline' }])
  })

  it('says to try again when the email fails, naming the error and never its message', async () => {
    vi.mocked(sendEmail).mockRejectedValueOnce(
      new AppError(`Resend refused the email: ${FIELDS.email} is not allowed`),
    )
    expect(await send()).toEqual(REFUSED('retry'))
    vi.mocked(sendEmail).mockRejectedValueOnce('timed out')
    expect(await send()).toEqual(REFUSED('retry'))
    expect(events()).toEqual([
      { event: 'contact.failed', step: 'send', reason: 'AppError' },
      { event: 'contact.failed', step: 'send', reason: 'unknown' },
    ])
  })

  it('never logs the name, the address or the words, whatever happens', async () => {
    await send()
    await send({ website: FIELDS.email })
    await send({ fields: { ...FIELDS, email: `${FIELDS.name} <${FIELDS.email}>` } })
    vi.mocked(hitLimit).mockResolvedValueOnce(false)
    await send()
    vi.mocked(hitLimit).mockRejectedValueOnce(new Error(`no row for ${FIELDS.email}`))
    await send()
    vi.mocked(sendEmail).mockRejectedValueOnce(
      new AppError(`Resend refused the email: ${FIELDS.email}`, new Error(FIELDS.message)),
    )
    await send()
    // Every path spoke, so the check below searched real lines.
    expect(events().map((line) => line.event)).toEqual([
      'contact.sent',
      'contact.honeypot',
      'contact.rejected',
      'contact.rate_limited',
      'contact.failed',
      'contact.failed',
    ])
    const text = logged().join('\n').toLowerCase()
    for (const word of PERSONAL) expect(text).not.toContain(word)
  })
})
