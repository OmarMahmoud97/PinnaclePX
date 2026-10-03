import type { CSSProperties } from 'react'

// The source set its headline at text-5xl, and text-6xl from md, so a long word ran past a phone's
// edge (Accountancy in a stored answer at 320 px, the check standard's long words at 390). Here
// the headline is sized at render by its longest word, as Ember's and Harbor's are (decisions 15
// and 19, docs/template-fit-decisions.md): the word's width in ems is added up from the table below
// and set as --summit-word, and the headline is the smaller of its own size and 97% of its line's
// width (the hero's words, the nearest @container, cqi, and at most the headline's 40rem) over that
// width. So the longest word always fits its line whole, in any look's face, and shorter words keep
// the source's size. Nothing is measured in the browser, so nothing moves once the page has drawn.

// Each character's advance in hundredths of an em in the widest of every face Summit's headline
// can be set in (the four looks' display faces and the example's, at its medium weight, from 20 to
// 100 px, untracked, though the headline is set a little tighter), so a word is never wider than
// the sum of its characters here. The faces are Ember's, so the table is Ember's. A character not
// listed counts as the widest of all, the capital W.
const CHARACTERS = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 &'’-.,!?/:;()"“”`
const HUNDREDTHS = [
  77, 70, 80, 80, 66, 61, 84, 84, 40, 65, 78, 63, 94, 86, 87, 69, 87, 74, 69, 69, 79, 72, 106, 73,
  69, 66, 59, 70, 61, 70, 62, 39, 68, 65, 32, 33, 61, 32, 98, 65, 68, 70, 70, 47, 55, 43, 64, 58,
  88, 58, 60, 54, 75, 46, 63, 62, 66, 63, 67, 59, 65, 67, 25, 76, 27, 26, 51, 27, 28, 33, 56, 50,
  32, 32, 44, 44, 46, 46, 46,
]
const WIDEST = 106
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

// The width in ems of the longest word in a line. Lines break only at spaces here, though a
// browser may also break after a hyphen, so a hyphenated word counts whole.
export function longestWord(line: string): number {
  return Math.max(1, ...line.split(/\s+/).map((word) => textEms(word)))
}

// The longest word, as the variable a fitted size divides its line's width by.
export function fitWord(line: string): CSSProperties {
  return { '--summit-word': longestWord(line).toFixed(2) } as CSSProperties
}
