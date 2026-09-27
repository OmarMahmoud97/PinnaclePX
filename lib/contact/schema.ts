import * as z from 'zod'
import { CONFIG } from '@/lib/config'
import { CONTACT_ERRORS } from '@/lib/contact/messages'

const { minChars, maxChars } = CONFIG.contact.message

// A message from /contact as the Server Action takes it (ADR 0040). The page checks the same
// fields first (lib/contact/checks.ts), with the same limits on the same trimmed values and in
// the same words, so an honest visitor never meets this refusal; this is the check that counts,
// because a browser is not a trust boundary. Every value is trimmed before it is measured, and
// any other key is dropped. The address is measured before its pattern, as the page does.
export const contactSchema = z.object({
  message: z
    .string()
    .trim()
    .min(minChars, CONTACT_ERRORS.messageEmpty)
    .max(maxChars, CONTACT_ERRORS.messageLong),
  name: z
    .string()
    .trim()
    .min(1, CONTACT_ERRORS.name)
    .max(CONFIG.start.names.personMax, CONTACT_ERRORS.nameLong),
  email: z
    .string()
    .trim()
    .max(CONFIG.contact.emailMaxChars, CONTACT_ERRORS.email)
    .pipe(z.email({ error: CONTACT_ERRORS.email })),
})
