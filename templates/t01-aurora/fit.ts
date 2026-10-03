// Aurora showed its header links from md whatever their length, so at 768 they wrapped inside
// their pills beside a long name. Here the links show only from a width whose row holds them on
// one line beside the name and the button (sections/nav.tsx; decision 15,
// docs/template-fit-decisions.md). A text's width in ems is added up from the tables below.
// Nothing is measured in the browser, so nothing moves once the page has drawn.

// Each character's advance in hundredths of an em, measured with a canvas in each look's faces
// and taking the widest: the display faces at semibold (Fraunces, Manrope, Bricolage Grotesque
// and Sora), in which Aurora sets its name and headings, and the body faces at medium and
// semibold (Instrument Sans, Inter and DM Sans), in which it sets its links and buttons. Each is
// untracked, so a text is never wider than the sum of its characters here. A character not
// listed counts as the widest of its table.
const CHARACTERS = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 &'’-.,!?/:;()"“”%+£@#*`
const DISPLAY = [
  78, 71, 80, 80, 67, 62, 84, 86, 41, 65, 80, 64, 96, 87, 87, 70, 87, 76, 68, 70, 78, 73, 107, 74,
  70, 65, 59, 70, 61, 70, 62, 40, 69, 65, 33, 34, 62, 32, 98, 65, 68, 70, 70, 48, 55, 44, 64, 59,
  90, 59, 60, 54, 76, 47, 63, 63, 67, 64, 68, 60, 66, 68, 24, 77, 27, 27, 51, 29, 30, 35, 56, 50,
  33, 34, 45, 45, 48, 49, 49, 97, 60, 72, 113, 93, 63,
]
const BODY = [
  74, 66, 75, 76, 64, 60, 78, 75, 28, 58, 72, 59, 93, 76, 80, 67, 81, 67, 66, 67, 75, 74, 109, 72,
  72, 66, 58, 65, 60, 65, 60, 39, 63, 62, 27, 27, 57, 27, 95, 62, 61, 65, 65, 40, 55, 43, 62, 59,
  84, 59, 59, 57, 70, 43, 63, 64, 67, 62, 64, 58, 65, 64, 27, 77, 33, 30, 57, 32, 32, 33, 58, 45,
  32, 33, 44, 44, 53, 51, 51, 101, 68, 63, 104, 85, 54,
]

function tableOf(hundredths: readonly number[]): (text: string) => number {
  const widest = Math.max(...hundredths)
  const widths = new Map(
    Array.from(CHARACTERS, (character, index) => [character, hundredths[index] ?? widest]),
  )
  // A text's width in ems as written; an accent adds nothing to its letter.
  return (text) => {
    const letters = text.normalize('NFD').replace(/\p{M}/gu, '')
    let sum = 0
    for (const character of letters) sum += widths.get(character) ?? widest
    return sum / 100
  }
}

// A text's width in ems in the widest display face, and in the widest body face.
export const displayEms = tableOf(DISPLAY)
export const bodyEms = tableOf(BODY)
