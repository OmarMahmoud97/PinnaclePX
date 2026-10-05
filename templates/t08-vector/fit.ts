import type { CSSProperties } from 'react'

// The source set its headline at 3rem and up and its name in a pill that leaves a narrow phone
// about 64px for it, so a long word ran past its line: the headline's last word was cut off by its
// clipped row ("independent pharmacies" in the dark look's face at 320) and a word of the name was
// broken mid-word ("Northgate People", "Coldharbour Photography" at 320), a long name cut off
// after two lines. Here both are sized at render by their words (decisions 15 and 19,
// docs/template-fit-decisions.md), the widths in ems added up from the tables below:
//
// - the headline by its longest word, set as --vector-word, at the smaller of its own size and
//   97% of its line over that width (hero.tsx);
// - the name by the narrowest two lines and three lines it can be set in, broken between its
//   words where that makes the longest line shortest, set as --vector-two and --vector-three, at
//   the larger of the sizes that fit them to the pill's room (vector.css, .vector-name).
//
// So a word always fits its line whole, a name whose words fit wraps only between them, and
// words with room keep the source's sizes. Nothing is measured in the browser, so nothing moves
// once the page has drawn.

// Each character's advance in hundredths of an em in each face a page can be set in: the looks'
// body faces at medium, which the headline's lines (regular) and the name (medium) are set in, and
// their display faces, which the headline's last line is set in (regular, slanted, which keeps
// its advances). A word's width is its widest in any of them, so it is never narrower than a
// page sets it; the tables are kept face by face because the faces differ, and the widest letter
// of each in one table would make most words wider than any face sets them. A character not
// listed counts as the widest of all, the capital W.
const CHARACTERS = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 &'’-.,!?/:;()"“”`
const BODY = [
  // Instrument Sans
  [
    74, 64, 75, 76, 64, 60, 77, 74, 26, 45, 71, 59, 91, 74, 79, 67, 80, 66, 63, 66, 71, 74, 109, 70,
    69, 63, 55, 62, 55, 62, 57, 37, 62, 61, 25, 25, 55, 25, 94, 61, 60, 62, 62, 39, 49, 40, 60, 53,
    72, 57, 53, 51, 68, 39, 56, 58, 61, 58, 61, 55, 59, 62, 20, 77, 25, 27, 50, 27, 27, 29, 58, 45,
    27, 27, 43, 43, 42, 44, 44,
  ],
  // Inter
  [
    71, 66, 74, 73, 61, 59, 75, 75, 28, 58, 69, 57, 92, 76, 77, 65, 77, 65, 65, 66, 75, 71, 101, 71,
    70, 65, 57, 62, 58, 62, 59, 38, 62, 61, 26, 26, 56, 26, 89, 61, 61, 62, 62, 39, 54, 35, 61, 58,
    83, 56, 58, 56, 65, 42, 62, 63, 66, 61, 63, 58, 63, 63, 27, 66, 32, 28, 47, 31, 31, 31, 53, 37,
    31, 32, 37, 37, 50, 48, 48,
  ],
  // DM Sans
  [
    68, 62, 73, 70, 58, 55, 77, 70, 25, 52, 61, 54, 86, 71, 78, 60, 78, 61, 59, 58, 67, 69, 99, 63,
    60, 56, 56, 64, 59, 64, 58, 35, 57, 59, 26, 26, 53, 24, 91, 59, 60, 64, 64, 39, 52, 41, 59, 54,
    79, 52, 58, 47, 69, 33, 58, 60, 63, 62, 63, 54, 62, 63, 26, 75, 18, 23, 56, 22, 21, 27, 53, 41,
    22, 25, 39, 39, 32, 40, 40,
  ],
]
const DISPLAY = [
  // Fraunces
  [
    72, 68, 70, 79, 65, 60, 76, 83, 39, 47, 76, 62, 90, 78, 80, 67, 80, 72, 59, 68, 75, 71, 104, 73,
    69, 64, 55, 60, 51, 61, 53, 37, 56, 63, 31, 31, 60, 31, 94, 63, 59, 61, 60, 46, 47, 37, 61, 55,
    81, 53, 56, 48, 65, 45, 60, 54, 60, 57, 60, 51, 59, 60, 23, 75, 16, 21, 42, 25, 26, 31, 50, 50,
    25, 26, 35, 35, 34, 42, 44,
  ],
  // Manrope
  [
    64, 62, 72, 68, 57, 51, 71, 69, 24, 47, 60, 52, 85, 69, 73, 61, 73, 64, 62, 60, 71, 61, 94, 61,
    56, 62, 56, 60, 56, 60, 59, 34, 60, 60, 24, 26, 50, 24, 85, 60, 60, 60, 60, 37, 53, 38, 60, 51,
    77, 53, 53, 53, 61, 39, 57, 56, 59, 58, 63, 51, 59, 63, 20, 66, 22, 23, 27, 26, 27, 32, 53, 39,
    30, 31, 43, 43, 40, 38, 38,
  ],
  // Bricolage Grotesque
  [
    66, 66, 67, 69, 59, 57, 70, 71, 27, 35, 66, 51, 90, 74, 72, 63, 72, 65, 64, 55, 72, 65, 95, 63,
    58, 56, 56, 61, 55, 61, 57, 37, 59, 60, 25, 26, 55, 25, 90, 60, 61, 61, 61, 40, 53, 38, 59, 54,
    81, 52, 59, 49, 66, 31, 58, 59, 58, 60, 65, 49, 64, 64, 26, 76, 15, 17, 34, 18, 15, 26, 41, 35,
    19, 18, 30, 28, 30, 32, 32,
  ],
  // Sora
  [
    76, 68, 80, 80, 60, 56, 84, 81, 32, 64, 68, 55, 92, 85, 87, 64, 87, 70, 69, 60, 79, 71, 105, 70,
    66, 66, 58, 69, 61, 69, 62, 37, 68, 64, 31, 32, 58, 29, 97, 64, 68, 69, 69, 41, 54, 43, 63, 56,
    85, 56, 55, 49, 75, 42, 62, 62, 65, 63, 66, 58, 64, 66, 23, 69, 27, 25, 51, 27, 27, 30, 56, 35,
    27, 27, 38, 38, 43, 44, 44,
  ],
]
const WIDEST = 110
// The headline and the name are set 0.025em tighter a character (tracking-tight).
const TRACKING = 0.025

const tables = (faces: readonly (readonly number[])[]) =>
  faces.map(
    (face) =>
      new Map(Array.from(CHARACTERS, (character, index) => [character, face[index] ?? WIDEST])),
  )
const FACES = { body: tables(BODY), display: tables(DISPLAY) }

type Role = keyof typeof FACES

// A text's width in ems at its widest in the role's faces; an accent adds nothing to its letter.
export function textEms(text: string, role: Role = 'body'): number {
  const letters = Array.from(text.normalize('NFD').replace(/\p{M}/gu, ''))
  const widths = FACES[role].map(
    (face) => letters.reduce((sum, character) => sum + (face.get(character) ?? WIDEST), 0) / 100,
  )
  return Math.max(0, ...widths) - TRACKING * letters.length
}

const wordsOf = (text: string) => text.trim().split(/\s+/)

// The width in ems of the headline's longest word: its lines in the body face, its last in the
// display face. Lines break only at spaces here, though a browser may also break after a hyphen,
// so a hyphenated word counts whole.
export function longestWord(lines: readonly string[]): number {
  const last = lines.length - 1
  return Math.max(
    1,
    ...lines.flatMap((line, index) =>
      wordsOf(line).map((word) => textEms(word, index === last ? 'display' : 'body')),
    ),
  )
}

// A name of one word is kept whole up to this width, at which the narrowest phone's pill (62px of
// room at 320, header.tsx) still sets it at 11px; a longer one breaks anywhere (plan 7.7). A name
// of several words has no such floor: its words stay whole, so a long one sets the whole name
// smaller ("ashgrove physiotherapy" at 9.4px at 320, and at 11px or more from 332). Held to
// 11px, it would break "physiotherapy" in every look at 320, and "Photography" in two.
const WHOLE = 62 / 11

// The width in ems of the longest line when a name is set in at most this many lines, broken
// between its words where that makes the longest line shortest. A name of one word too long to
// keep whole shares its width between its lines, each falling at most a widest character short.
export function linesEms(name: string, lines: number): number {
  const words = wordsOf(name)
  if (words.length === 1) {
    const whole = textEms(name.trim())
    return Math.max(1, whole <= WHOLE ? whole : whole / lines + WIDEST / 100)
  }
  const shortest = (from: number, left: number): number => {
    let best = textEms(words.slice(from).join(' '))
    if (left === 1) return best
    for (let to = from + 1; to < words.length; to += 1) {
      const first = textEms(words.slice(from, to).join(' '))
      best = Math.min(best, Math.max(first, shortest(to, left - 1)))
    }
    return best
  }
  return Math.max(1, shortest(0, lines))
}

// The headline's longest word, as the variable its size divides its line's width by.
export function fitHeadline(lines: readonly string[]): CSSProperties {
  return { '--vector-word': longestWord(lines).toFixed(2) } as CSSProperties
}

// The name's widths in two lines and in three, as the variables its size divides the pill's
// room by.
export function fitName(name: string): CSSProperties {
  return {
    '--vector-two': linesEms(name, 2).toFixed(2),
    '--vector-three': linesEms(name, 3).toFixed(2),
  } as CSSProperties
}
