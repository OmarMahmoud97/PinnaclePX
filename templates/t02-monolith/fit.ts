import type { CSSProperties } from 'react'

// The source set Monolith's About phrases at fixed sizes in fixed columns, so a long word ran
// past its cell or broke mid-word, and its header showed every link from md whatever their
// length. Here the phrases are sized at render by their longest word, and the header shows its
// links only from a width that holds them (decision 15, docs/template-fit-decisions.md). A
// text's width in ems is added up from the table below. Nothing is measured in the browser, so
// nothing moves once the page has drawn.

// Each character's advance in hundredths of an em in the widest of every face a Monolith page
// can be set in (the four looks' body faces, in which Monolith sets everything, and the
// example's system face), bold and untracked, so a text is never wider than the sum of its
// characters here. A character not listed counts as the widest of all, the capital W.
const CHARACTERS = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 &'’-.,!?/:;()"“”%+£@#*`
const HUNDREDTHS = [
  76, 67, 75, 76, 63, 59, 78, 77, 32, 59, 73, 59, 96, 80, 81, 68, 82, 67, 66, 68, 74, 76, 108, 74,
  74, 67, 59, 66, 61, 66, 61, 39, 64, 63, 29, 30, 59, 29, 95, 63, 62, 66, 66, 42, 57, 44, 63, 60,
  86, 61, 61, 58, 71, 58, 63, 65, 68, 63, 65, 60, 66, 65, 28, 85, 34, 32, 58, 34, 34, 34, 59, 45,
  34, 35, 41, 41, 56, 55, 54, 102, 71, 64, 105, 86, 56,
]
const WIDEST = 108
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

// The width in ems of the longest word in some texts. Lines break only at spaces here, though a
// browser may also break after a hyphen, so a hyphenated word counts whole.
function longestWord(texts: readonly string[]): number {
  const words = texts.flatMap((text) => text.split(/\s+/))
  return Math.max(1, ...words.map(textEms))
}

// The longest word, as the variable a fitted size divides its cell's width by.
export function fitWord(texts: readonly string[]): CSSProperties {
  return { '--monolith-word': longestWord(texts).toFixed(2) } as CSSProperties
}
