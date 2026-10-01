import { createHash, timingSafeEqual } from 'node:crypto'

// The password in an HTTP Basic Authorization header, or null when the header is missing, is not
// Basic, or carries no name:password pair. The name is whatever comes before the first colon, so
// a password may hold colons of its own.
export function passwordIn(authorization: string | null): string | null {
  if (authorization === null) return null
  const parts = authorization.trim().split(/\s+/)
  const [scheme, encoded] = parts
  if (parts.length !== 2 || scheme?.toLowerCase() !== 'basic' || encoded === undefined) return null
  const decoded = Buffer.from(encoded, 'base64').toString('utf8')
  const colon = decoded.indexOf(':')
  return colon === -1 ? null : decoded.slice(colon + 1)
}

const digest = (text: string) => createHash('sha256').update(text).digest()

// Whether a header carries the password. Any name is accepted: the password is the secret. The
// two are compared as digests of one length in constant time, so neither a wrong password nor a
// wrong length can be told from a near miss by the clock.
export function basicAuthPasses(authorization: string | null, password: string): boolean {
  const given = passwordIn(authorization)
  return given !== null && timingSafeEqual(digest(given), digest(password))
}
