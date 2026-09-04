import { randomBytes } from 'node:crypto'
import { z } from 'zod'

// Lowercase letters and digits that are never confused for each other in a URL read aloud.
const ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789'
export const SLUG_LENGTH = 12

// What a slug looks like, for the routes that take one from the address bar.
export const slugSchema = z.string().regex(new RegExp(`^[${ALPHABET}]{${String(SLUG_LENGTH)}}$`))

// A preview's address: twelve characters from the alphabet above, drawn from 60 bits of
// randomness, so a slug cannot be guessed and two submissions never share one.
export function newSlug(): string {
  const bytes = randomBytes(SLUG_LENGTH)
  let slug = ''
  for (const byte of bytes) slug += ALPHABET.charAt(byte % ALPHABET.length)
  return slug
}
