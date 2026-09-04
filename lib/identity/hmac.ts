import { createHmac } from 'node:crypto'

// Who a visitor is, for the exclusivity table and the lead row: an HMAC of the email, so the
// table never holds an address and two spellings of one address are one identity. The secret
// comes from lib/env at the call site, so this stays pure and testable.
export function identityHashFrom(email: string, secret: string): string {
  return createHmac('sha256', secret).update(email.trim().toLowerCase()).digest('hex')
}
