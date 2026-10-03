import type { CSSProperties } from 'react'

// The source set its headings at fixed sizes in a clipped section, so a long word ran past a
// narrow phone's edge or was cut off ("Northumberland" in the headline at 320 and 360). Here the
// hero's headline and the section headings are sized at render by their longest word (decision
// 15, docs/template-fit-decisions.md): the word's width in ems is added up from the table below
// and set as --atlas-word, and the heading's words are set at the smaller of the heading's own
// size and 97% of its width over that width (atlas.css, .atlas-fit, the heading being the
// @container). So the longest word always fits its line whole, in any look's faces, and shorter
// words keep the source's size. Nothing is measured in the browser, so nothing moves once the
// page has drawn.

// Each character's advance in hundredths of an em in the widest of the faces a visitor's Atlas
// page can be set in (the looks' body faces, Instrument Sans, Inter and DM Sans, semibold and
// bold), so a word is never wider than the sum of its characters here. A character not listed
// counts as the widest of all, the capital W.
const CHARACTERS = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 &'’-.,!?/:;()"“”`
const HUNDREDTHS = [
  75, 67, 75, 76, 63, 60, 78, 75, 29, 59, 73, 59, 94, 77, 80, 68, 82, 67, 66, 68, 74, 75, 109, 74,
  74, 67, 59, 66, 61, 66, 61, 40, 64, 63, 28, 28, 59, 28, 95, 63, 62, 66, 66, 41, 57, 44, 63, 60,
  86, 61, 61, 58, 71, 44, 63, 65, 68, 63, 65, 59, 66, 65, 26, 79, 34, 32, 58, 34, 34, 34, 59, 45,
  34, 35, 46, 46, 56, 55, 54,
]
const WIDEST = 109
const WIDTHS = new Map(
  Array.from(CHARACTERS, (character, index) => [character, HUNDREDTHS[index] ?? WIDEST]),
)

// A text's width in ems as written; an accent adds nothing to its letter.
export function textEms(text: string): number {
  const letters = text.normalize('NFD').replace(/\p{M}/gu, '')
  let hundredths = 0
  for (const character of letters) hundredths += WIDTHS.get(character) ?? WIDEST
  return hundredths / 100
}

// The width in ems of the longest word in a heading, each word with its first letter in
// capitals, as the hero's headline is set. Lines break only at spaces here, though a browser
// may also break after a hyphen, so a hyphenated word counts whole.
export function longestWord(text: string): number {
  const words = text.split(/\s+/).map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  return Math.max(1, ...words.map((word) => textEms(word)))
}

// The longest word, as the variable a fitted heading divides its width by.
export function fitWord(text: string): CSSProperties {
  return { '--atlas-word': longestWord(text).toFixed(2) } as CSSProperties
}
