import { describe, expect, it } from 'vitest'
import { detailsSchema } from '@/lib/brief/schema'
import { CONFIG } from '@/lib/config'
import { checkContact, type ContactFields } from '@/lib/contact/checks'
import { contactSchema } from '@/lib/contact/schema'

const { maxChars } = CONFIG.contact.message
const { personMax } = CONFIG.start.names
const { emailMaxChars } = CONFIG.contact

const GOOD = { message: 'Do you do Shopify?', name: 'Sam Patel', email: 'sam@ashgrove.example' }

// An address of exactly this many characters that the pattern passes.
const DOMAIN = '@ashgrove.example'
const addressOf = (length: number) => `${'s'.repeat(length - DOMAIN.length)}${DOMAIN}`

type Issues = readonly Readonly<{ path: readonly PropertyKey[]; message: string }>[]

// A refusal as the page would show it: each failing field and its words.
const wordsOf = (issues: Issues = []) =>
  Object.fromEntries(issues.map((issue) => [String(issue.path[0]), issue.message]))

// Inputs on both sides of every limit, each laid over a message that passes.
const CASES: readonly (readonly [string, Partial<ContactFields>])[] = [
  ['every field passes', {}],
  ['a one-character message', { message: '?' }],
  ['an empty message', { message: '' }],
  ['a message of only space and line breaks', { message: ' \n\t ' }],
  ['a message at its limit once trimmed', { message: `  ${'x'.repeat(maxChars)}\n` }],
  ['a message one over its limit', { message: 'x'.repeat(maxChars + 1) }],
  ['an empty name', { name: '' }],
  ['a name of only space', { name: '   ' }],
  ['a name at its limit once trimmed', { name: ` ${'n'.repeat(personMax)} ` }],
  ['a name one over its limit', { name: 'n'.repeat(personMax + 1) }],
  ['an address with space around it', { email: '  sam@ashgrove.example  ' }],
  ['an address with an apostrophe and a plus', { email: "o'brien+contact@ashgrove.co.uk" }],
  ['an empty address', { email: '' }],
  ['an address with no at sign', { email: 'sam' }],
  ['an address with no domain', { email: 'sam@' }],
  ['an address with no name', { email: '@ashgrove.example' }],
  ['an address with no top-level domain', { email: 'sam@ashgrove' }],
  ['an address with a space inside', { email: 'sam patel@ashgrove.example' }],
  ['an address with two dots together', { email: 'sam..patel@ashgrove.example' }],
  ['an address at the longest a mail server takes', { email: addressOf(emailMaxChars) }],
  ['an address one over that', { email: addressOf(emailMaxChars + 1) }],
  ['every field empty', { message: '', name: '', email: '' }],
  [
    'every field over its limit',
    {
      message: 'x'.repeat(maxChars + 1),
      name: 'n'.repeat(personMax + 1),
      email: addressOf(emailMaxChars + 1),
    },
  ],
]

describe('contactSchema', () => {
  it('takes a message, a name and an address, each trimmed', () => {
    const parsed = contactSchema.safeParse({
      message: '  Do you do Shopify?\n',
      name: ' Sam Patel ',
      email: ' sam@ashgrove.example ',
    })
    expect(parsed.data).toStrictEqual(GOOD)
  })

  it('keeps the line breaks inside a message', () => {
    const message = 'Two things.\n\nFirst, a new site.\r\nSecond, bookings.'
    expect(contactSchema.safeParse({ ...GOOD, message }).data?.message).toBe(message)
  })

  it('drops any key it does not know', () => {
    const parsed = contactSchema.safeParse({ ...GOOD, company: 'Ashgrove', website: 'x' })
    expect(parsed.data).toStrictEqual(GOOD)
  })

  it.each([
    ['nothing', undefined],
    ['null', null],
    ['a string', GOOD.message],
    ['a number', 42],
    ['an array', [GOOD.message, GOOD.name, GOOD.email]],
    ['a field that is not a string', { ...GOOD, name: 7 }],
    ['a missing field', { message: GOOD.message, name: GOOD.name }],
  ])('refuses %s', (_label, input) => {
    expect(contactSchema.safeParse(input).success).toBe(false)
  })

  // The page's quick checks and this schema must refuse the same fields in the same words, or an
  // honest visitor could pass the page and still be refused by the Server Action.
  it.each(CASES)('agrees with the page on %s', (_label, over) => {
    const fields = { ...GOOD, ...over }
    const expected = checkContact(fields)
    const issues = contactSchema.safeParse(fields).error?.issues
    expect(wordsOf(issues)).toEqual(expected)
    expect(issues?.length ?? 0).toBe(Object.keys(expected).length)
  })

  it('words a blank name, a long name and a bad address as the questionnaire does', () => {
    for (const details of [
      { name: ' ', email: 'sam@' },
      { name: 'n'.repeat(personMax + 1), email: 'sam patel@ashgrove.example' },
    ]) {
      const ours = contactSchema.safeParse({ ...GOOD, ...details }).error?.issues
      const theirs = detailsSchema.safeParse(details).error?.issues
      expect(wordsOf(ours)).toEqual(wordsOf(theirs))
      expect(Object.keys(wordsOf(ours))).toEqual(['name', 'email'])
    }
  })
})
