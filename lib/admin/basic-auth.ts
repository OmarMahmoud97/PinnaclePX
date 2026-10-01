import { createHash, timingSafeEqual } from 'node:crypto'

export type Credentials = Readonly<{ name: string; password: string }>

// The name and the password in an HTTP Basic Authorization header, or null when the header is
// missing, is not Basic, or carries no name:password pair. The name is whatever comes before the
// first colon, so a password may hold colons of its own.
export function credentialsIn(authorization: string | null): Credentials | null {
  if (authorization === null) return null
  const parts = authorization.trim().split(/\s+/)
  const [scheme, encoded] = parts
  if (parts.length !== 2 || scheme?.toLowerCase() !== 'basic' || encoded === undefined) return null
  const decoded = Buffer.from(encoded, 'base64').toString('utf8')
  const colon = decoded.indexOf(':')
  if (colon === -1) return null
  return { name: decoded.slice(0, colon), password: decoded.slice(colon + 1) }
}

const digest = (text: string) => createHash('sha256').update(text).digest()

// Whether two strings are the same, in the same time whatever they are: compared as digests of
// one length, so neither a wrong value nor a wrong length is told from a near miss by the clock.
const same = (given: string, expected: string) => timingSafeEqual(digest(given), digest(expected))

// The name is an email address, so its case and the space around it do not count.
const normalised = (email: string) => email.trim().toLowerCase()

// Whether a header carries the owner's credentials: their email as the name and the password
// exactly. Both are always compared, so a wrong name costs the same time as a wrong password.
export function basicAuthPasses(authorization: string | null, expected: Credentials): boolean {
  const given = credentialsIn(authorization)
  if (given === null) return false
  const name = same(normalised(given.name), normalised(expected.name))
  const password = same(given.password, expected.password)
  return name && password
}
