import type { CSSProperties } from 'react'

// The source set its big type at fixed sizes, black and mostly in capitals, so a long word ran
// off a phone or was cut off in its clipped row. Here the headline, the block headings, the
// phrases, the card titles and the wordmark are sized at render by their longest word (decision
// 15, docs/template-fit-decisions.md): the word's width in ems is added up from the table below
// and set as --harbor-word, and the type is the smaller of its own size and 97% of its line's
// width over that width, the line being the nearest @container (cqi). So the longest word always
// fits its line whole, in any look's faces, and shorter words keep the source's size. Nothing is
// measured in the browser, so nothing moves once the page has drawn.

// Each character's advance in hundredths of an em in the widest of every face a Harbor page can
// be set in (the four looks' display and body faces and the example's, black and untracked), so
// a word is never wider than the sum of its characters here. A character not listed counts as
// the widest of all, the capital W.
const CHARACTERS = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 &'’-.,!?/:;()"“”`
const HUNDREDTHS = [
  81, 78, 81, 84, 70, 65, 84, 90, 46, 65, 87, 67, 99, 89, 87, 77, 87, 83, 69, 75, 78, 81, 112, 79,
  78, 70, 60, 71, 62, 71, 63, 46, 69, 69, 35, 35, 67, 36, 101, 69, 69, 71, 71, 54, 59, 45, 68, 64,
  95, 62, 64, 59, 77, 51, 67, 67, 71, 66, 70, 62, 69, 70, 27, 81, 38, 36, 59, 38, 38, 39, 61, 51,
  38, 38, 47, 47, 63, 63, 61,
]
const WIDEST = 112
const WIDTHS = new Map(
  Array.from(CHARACTERS, (character, index) => [character, HUNDREDTHS[index] ?? WIDEST]),
)

// A text's width in ems, in capitals or as written; an accent adds nothing to its letter.
export function textEms(text: string, capitals = true): number {
  const letters = (capitals ? text.toUpperCase() : text).normalize('NFD').replace(/\p{M}/gu, '')
  let hundredths = 0
  for (const character of letters) hundredths += WIDTHS.get(character) ?? WIDEST
  return hundredths / 100
}

// The width in ems of the longest word in some lines. Lines break only at spaces here, though
// a browser may also break after a hyphen, so a hyphenated word counts whole.
export function longestWord(lines: readonly string[], capitals = true): number {
  const words = lines.flatMap((line) => line.split(/\s+/))
  return Math.max(1, ...words.map((word) => textEms(word, capitals)))
}

// The longest word, as the variable a fitted size divides its line's width by.
export function fitWord(lines: readonly string[], capitals = true): CSSProperties {
  return { '--harbor-word': longestWord(lines, capitals).toFixed(2) } as CSSProperties
}
