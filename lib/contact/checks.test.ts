import { describe, expect, it } from 'vitest'
import * as z from 'zod'
import { detailsSchema, NAME_TOO_LONG } from '@/lib/brief/schema'
import { CONFIG } from '@/lib/config'
import { checkContact, checkField, CONTACT_FIELDS, EMAIL_PATTERN } from '@/lib/contact/checks'
import { CONTACT_ERRORS } from '@/lib/contact/messages'

const { maxChars } = CONFIG.contact.message
const { personMax } = CONFIG.start.names
const { emailMaxChars } = CONFIG.contact

const GOOD = { message: 'Do you do Shopify?', name: 'Sam Patel', email: 'sam@ashgrove.example' }

// An address of exactly this many characters that the pattern passes.
const DOMAIN = '@ashgrove.example'
const addressOf = (length: number) => `${'s'.repeat(length - DOMAIN.length)}${DOMAIN}`

describe('checkField', () => {
  it('passes a one-line message, a name and an address', () => {
    for (const field of CONTACT_FIELDS) expect(checkField(field, GOOD[field])).toBeUndefined()
  })

  it('asks for a message that is empty or only space', () => {
    expect(checkField('message', '')).toBe(CONTACT_ERRORS.messageEmpty)
    expect(checkField('message', ' \n\t ')).toBe(CONTACT_ERRORS.messageEmpty)
  })

  it('takes a message at its limit once trimmed, and refuses one over it', () => {
    expect(checkField('message', `  ${'x'.repeat(maxChars)}\n`)).toBeUndefined()
    expect(checkField('message', 'x'.repeat(maxChars + 1))).toBe(CONTACT_ERRORS.messageLong)
  })

  it('asks for a name that is empty or only space', () => {
    expect(checkField('name', '')).toBe(CONTACT_ERRORS.name)
    expect(checkField('name', '   ')).toBe(CONTACT_ERRORS.name)
  })

  it('takes a name at its limit once trimmed, and refuses one over it', () => {
    expect(checkField('name', ` ${'n'.repeat(personMax)} `)).toBeUndefined()
    expect(checkField('name', 'n'.repeat(personMax + 1))).toBe(CONTACT_ERRORS.nameLong)
  })

  it.each([
    'sam@ashgrove.example',
    'sam.patel+contact@ashgrove.co.uk',
    "o'brien@ashgrove.example",
    '  sam@ashgrove.example  ',
  ])('passes the address %j', (email) => {
    expect(checkField('email', email)).toBeUndefined()
  })

  it.each([
    '',
    '   ',
    'sam',
    'sam@',
    '@ashgrove.example',
    'sam@ashgrove',
    'sam@ashgrove.e',
    'sam patel@ashgrove.example',
    'sam@@ashgrove.example',
    'sam..patel@ashgrove.example',
  ])('refuses the address %j', (email) => {
    expect(checkField('email', email)).toBe(CONTACT_ERRORS.email)
  })

  it('refuses an address longer than a mail server takes, though the pattern passes it', () => {
    expect(checkField('email', addressOf(emailMaxChars))).toBeUndefined()
    expect(EMAIL_PATTERN.test(addressOf(emailMaxChars + 1))).toBe(true)
    expect(checkField('email', addressOf(emailMaxChars + 1))).toBe(CONTACT_ERRORS.email)
  })
})

describe('checkContact', () => {
  it('finds nothing when every field passes', () => {
    expect(checkContact(GOOD)).toEqual({})
  })

  it('gives an error for each field that fails, and none for the rest', () => {
    expect(checkContact({ ...GOOD, message: ' ', email: 'sam@' })).toEqual({
      message: CONTACT_ERRORS.messageEmpty,
      email: CONTACT_ERRORS.email,
    })
  })

  it('lists the errors in the order the page shows the fields', () => {
    expect(Object.keys(checkContact({ message: '', name: '', email: '' }))).toEqual([
      'message',
      'name',
      'email',
    ])
  })
})

describe('EMAIL_PATTERN', () => {
  it("is zod's own, so the page and the Server Action agree on every address", () => {
    expect(EMAIL_PATTERN.source).toBe(z.regexes.email.source)
    expect(EMAIL_PATTERN.flags).toBe(z.regexes.email.flags)
  })
})

describe('CONTACT_ERRORS', () => {
  it('words the name and the address as the questionnaire does', () => {
    const parsed = detailsSchema.safeParse({ email: 'sam@', name: ' ' })
    const words = Object.fromEntries(
      (parsed.error?.issues ?? []).map((issue) => [String(issue.path[0]), issue.message]),
    )
    expect(words).toEqual({ email: CONTACT_ERRORS.email, name: CONTACT_ERRORS.name })
    expect(CONTACT_ERRORS.nameLong).toBe(NAME_TOO_LONG.name)
  })

  it('prints the message limit with a thousands comma, as the site writes numbers', () => {
    expect(CONTACT_ERRORS.messageLong).toBe('Keep it under 2,000 characters.')
  })
})
