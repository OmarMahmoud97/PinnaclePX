import type { CSSProperties } from 'react'
import type { MeridianContent } from './copy-slots'

// The source set Meridian's headings at fixed sizes and showed its header's links from lg
// whatever their length, so a long word ran past a narrow phone's edge and, at 1024, "Why us"
// wrapped onto "Services" (decision 15, docs/template-fit-decisions.md; CRS-4). Here the
// headings are sized at render by their longest word, the header shows its links only from a
// width that holds them on one line, and the footer's columns stand one to a row on a phone
// when a word would not fit two. A text's width in ems is added up from the tables below.
// Nothing is measured in the browser, so nothing moves once the page has drawn.

// Each character's advance in hundredths of an em in the widest of the faces a visitor's
// Meridian page can be set in (the looks' body faces, Instrument Sans, Inter and DM Sans, in
// which Meridian sets everything), untracked: at regular and medium, and at semibold and bold.
// So a text is never wider than the sum of its characters here. A character not listed counts as
// the widest of all, the capital W.
const CHARACTERS = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 &'’-.,!?/:;()"“”%+£@#*`
const REGULAR = [
  74, 66, 75, 76, 64, 61, 77, 75, 28, 58, 71, 59, 92, 76, 79, 67, 80, 66, 65, 66, 75, 74, 109, 71,
  70, 65, 57, 64, 59, 64, 59, 38, 62, 61, 26, 26, 56, 26, 94, 61, 61, 64, 64, 39, 54, 41, 61, 58,
  83, 57, 58, 56, 69, 42, 62, 63, 66, 62, 63, 58, 63, 63, 29, 77, 32, 28, 56, 31, 31, 31, 58, 45,
  31, 32, 43, 43, 50, 48, 48, 100, 67, 63, 102, 82, 53,
]
const BOLD = [
  75, 67, 75, 76, 63, 60, 78, 75, 29, 59, 73, 59, 94, 77, 80, 68, 82, 67, 66, 68, 74, 75, 109, 74,
  74, 67, 59, 66, 61, 66, 61, 40, 64, 63, 28, 28, 59, 28, 95, 63, 62, 66, 66, 41, 57, 44, 63, 60,
  86, 61, 61, 58, 71, 44, 63, 65, 68, 63, 65, 59, 66, 65, 26, 79, 34, 32, 58, 34, 34, 34, 59, 45,
  34, 35, 46, 46, 56, 55, 54, 102, 68, 64, 105, 86, 56,
]
const WIDEST = 109
const tableOf = (hundredths: readonly number[]) =>
  new Map(Array.from(CHARACTERS, (character, index) => [character, hundredths[index] ?? WIDEST]))
const WIDTHS = { regular: tableOf(REGULAR), bold: tableOf(BOLD) } as const
type Weight = keyof typeof WIDTHS

// A text's width in ems as written; an accent adds nothing to its letter.
export function textEms(text: string, weight: Weight = 'bold'): number {
  const letters = text.normalize('NFD').replace(/\p{M}/gu, '')
  let hundredths = 0
  for (const character of letters) hundredths += WIDTHS[weight].get(character) ?? WIDEST
  return hundredths / 100
}

// Linux's Chromium sets text about 4% wider than Windows' (CI), so a width that must hold
// counts every character 0.05em wider than the table.
const SPREAD = 0.05

// The width in ems of the longest word in some texts, set bold and widened so. Lines break only
// at spaces here, though a browser may also break after a hyphen, so a hyphenated word counts
// whole.
export function longestWord(texts: readonly string[]): number {
  const words = texts.flatMap((text) => text.split(/\s+/)).filter((word) => word !== '')
  return Math.max(1, ...words.map((word) => textEms(word) + word.length * SPREAD))
}

// The longest word, as the variable a fitted heading divides its room by (meridian.css,
// .meridian-fit).
export function fitWord(...texts: string[]): CSSProperties {
  return { '--meridian-word': longestWord(texts).toFixed(2) } as CSSProperties
}

// The width of a text at a size in pixels, widened so.
const pixels = (text: string, size: number, weight: Weight) =>
  (textEms(text, weight) + text.length * SPREAD) * size

// The widths from which the header could show its links (Tailwind's lg, xl and 2xl), where the
// bar is three quarters of the screen (nav.tsx) less its border and padding, 18px.
const BREAKPOINTS = [
  ['lg', 1024],
  ['xl', 1280],
  ['2xl', 1536],
] as const
export type HeaderFrom = (typeof BREAKPOINTS)[number][0] | null

// The first breakpoint from which the header's bar holds the logo, the menu's label, the links
// and the button on one line, each at the source's size and padding; null when none does, and
// the menu button then serves at every width.
export function headerFrom({ brand, nav }: Pick<MeridianContent, 'brand' | 'nav'>): HeaderFrom {
  const { logo } = brand
  // The mark and its 8px margin beside the name at 18px, or the logo at its own shape, 36px high.
  const mark =
    logo.kind === 'image' ? (36 * logo.width) / logo.height : 44 + pixels(brand.name, 18, 'bold')
  // The menu's label at 16px with 16px of padding a side, then its 4px gap and 12px chevron.
  const menu = pixels(nav.menu.label, 16, 'regular') + 48
  // Each link at 16px with 8px of padding a side, the row 4px after the menu.
  const links = nav.links.reduce((sum, link) => sum + pixels(link.label, 16, 'regular') + 16, 4)
  // The button at 14px with 12px of padding a side.
  const button = pixels(nav.cta.label, 14, 'regular') + 24
  const need = mark + menu + links + button
  return BREAKPOINTS.find(([, screen]) => need <= screen * 0.75 - 18)?.[0] ?? null
}

// On a 320px phone the footer's two columns are 71px wide (footer.tsx: the page's 24px gutters,
// the panel's border and 40px padding, a 48px gap). A word may run on into the panel's padding,
// but no further.
const FOOTER_COLUMN = 71 + 40

// Whether the footer's link columns stand two to a row on a phone: every word of their
// headings (18px bold) and links (16px) fits a column.
export function footerPairs(footer: MeridianContent['footer']): boolean {
  const widest = (text: string, size: number, weight: Weight) =>
    Math.max(...text.split(/\s+/).map((word) => pixels(word, size, weight)))
  return footer.groups.every(
    (group) =>
      widest(group.heading, 18, 'bold') <= FOOTER_COLUMN &&
      group.links.every((link) => widest(link.label, 16, 'regular') <= FOOTER_COLUMN),
  )
}
