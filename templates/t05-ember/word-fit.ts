import type { CSSProperties } from 'react'

// The source set its type at fixed sizes, so a long word ran past a narrow phone's edge (the
// section headings at 320 and 360), pushed the points' row past a tablet's screen, and a name
// with no space pushed the header's menu button off a phone's. Here those texts are sized at
// render by their longest word (decision 15, docs/template-fit-decisions.md), as Atlas's
// headings are: the word's width in ems is added up from the tables below and set as
// --ember-word, and the text is set at the smaller of its own size and 97% of its room over that
// width (ember.css, .ember-fit). So the longest word always fits its line whole, in any look's
// faces, and shorter words keep the source's size. Nothing is measured in the browser, so
// nothing moves once the page has drawn.

// Each character's advance in hundredths of an em in the widest of the faces a visitor's Ember
// page can set it in: the looks' body faces (Instrument Sans, Inter and DM Sans) at the regular
// weight the headings use, and their display faces (Fraunces, Manrope, Bricolage Grotesque and
// Sora) at the medium and semibold weights of the closing heading and the wordmark. So a word is
// never wider than the sum of its characters here. A character not listed counts as the widest
// of all, the capital W.
export type Face = 'body' | 'display'

const CHARACTERS = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 &'’-.,!?/:;()"“”`
const HUNDREDTHS: Record<Face, number[]> = {
  body: [
    73, 66, 75, 76, 64, 61, 77, 75, 27, 58, 70, 59, 91, 76, 79, 66, 79, 66, 65, 65, 75, 73, 109, 69,
    68, 63, 57, 63, 58, 63, 59, 38, 62, 60, 25, 25, 55, 25, 93, 60, 60, 63, 63, 38, 53, 40, 60, 57,
    82, 56, 57, 56, 69, 41, 61, 62, 65, 61, 63, 57, 62, 63, 29, 76, 30, 27, 55, 29, 29, 29, 57, 45,
    29, 31, 41, 41, 47, 45, 45,
  ],
  display: [
    78, 71, 80, 80, 67, 62, 84, 86, 41, 65, 80, 64, 96, 87, 87, 70, 87, 76, 69, 70, 79, 73, 107, 74,
    70, 66, 59, 70, 61, 70, 62, 40, 69, 65, 33, 34, 62, 32, 98, 65, 68, 70, 70, 48, 55, 44, 64, 59,
    90, 59, 60, 54, 76, 47, 63, 63, 67, 64, 68, 60, 66, 68, 25, 77, 27, 27, 51, 29, 30, 35, 56, 50,
    33, 34, 45, 45, 48, 49, 49,
  ],
}
const WIDEST = 109

const widthsOf = (face: Face) =>
  new Map(
    Array.from(CHARACTERS, (character, index) => [character, HUNDREDTHS[face][index] ?? WIDEST]),
  )
const WIDTHS: Record<Face, Map<string, number>> = {
  body: widthsOf('body'),
  display: widthsOf('display'),
}

// A text's width in ems as written, in one of the two kinds of face; an accent adds nothing to
// its letter.
export function textEms(text: string, face: Face): number {
  const letters = text.normalize('NFD').replace(/\p{M}/gu, '')
  let hundredths = 0
  for (const character of letters) hundredths += WIDTHS[face].get(character) ?? WIDEST
  return hundredths / 100
}

// The width in ems of the longest word in a text. Lines break only at spaces here, though a
// browser may also break after a hyphen, so a hyphenated word counts whole.
export function longestWord(text: string, face: Face): number {
  const words = text.split(/\s+/)
  return Math.max(1, ...words.map((word) => textEms(word, face)))
}

// The longest word, as the variable a fitted text divides its room by.
export function fitWord(text: string, face: Face): CSSProperties {
  return { '--ember-word': longestWord(text, face).toFixed(2) } as CSSProperties
}
