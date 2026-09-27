import { CONFIG } from '@/lib/config'
import { CONTACT_ERRORS } from '@/lib/contact/messages'

// The contact form's fields, and each one's error where it has one.
export type ContactField = 'message' | 'name' | 'email'
export type ContactFields = Readonly<Record<ContactField, string>>
export type ContactErrors = Readonly<Partial<Record<ContactField, string>>>

// In the order the page shows them, which is the order a failed send looks for the first to fix.
export const CONTACT_FIELDS: readonly ContactField[] = ['message', 'name', 'email']

// zod 4's own email pattern (z.regexes.email), copied byte for byte, so the page never passes an
// address the Server Action refuses and never carries zod to get it. checks.test.ts fails the
// day the two part.
export const EMAIL_PATTERN =
  /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/

const { minChars, maxChars } = CONFIG.contact.message
const { personMax } = CONFIG.start.names

// One field, as the visitor leaves it or sends: the words it fails with, or undefined when it
// passes. The page checks quickly so the visitor hears at once; the Server Action checks again,
// because a browser is not a trust boundary, with the same limits on the same trimmed values in
// the same order, so an honest visitor never meets its refusal.
export function checkField(field: ContactField, value: string): string | undefined {
  const trimmed = value.trim()
  switch (field) {
    case 'message':
      if (trimmed.length < minChars) return CONTACT_ERRORS.messageEmpty
      if (trimmed.length > maxChars) return CONTACT_ERRORS.messageLong
      return undefined
    case 'name':
      if (trimmed === '') return CONTACT_ERRORS.name
      if (trimmed.length > personMax) return CONTACT_ERRORS.nameLong
      return undefined
    case 'email':
      if (trimmed.length > CONFIG.contact.emailMaxChars) return CONTACT_ERRORS.email
      return EMAIL_PATTERN.test(trimmed) ? undefined : CONTACT_ERRORS.email
  }
}

// Every field at once, for a send: an error for each field that fails, and nothing for the rest.
export function checkContact(fields: ContactFields): ContactErrors {
  const errors: Partial<Record<ContactField, string>> = {}
  for (const field of CONTACT_FIELDS) {
    const error = checkField(field, fields[field])
    if (error !== undefined) errors[field] = error
  }
  return errors
}
