import { CONFIG } from '@/lib/config'

const { maxChars } = CONFIG.contact.message

// The words a field of the contact form fails with (ADR 0040). The page's quick checks
// (lib/contact/checks.ts) and the Server Action's schema both use them, so a mistake reads the
// same whichever side caught it. They live in lib because the schema may not import app, and
// stay free of zod so the page can carry them. The name and email lines are the questionnaire's
// own (lib/brief/schema.ts), copied rather than imported for the same reason; the tests keep them
// equal.
export const CONTACT_ERRORS = {
  messageEmpty: 'Tell us what you need. One line is enough.',
  messageLong: `Keep it under ${maxChars.toLocaleString('en-GB')} characters.`,
  name: 'Tell us your name.',
  nameLong: `Keep your name to ${String(CONFIG.start.names.personMax)} characters.`,
  email: 'That does not look like an email address.',
} as const
