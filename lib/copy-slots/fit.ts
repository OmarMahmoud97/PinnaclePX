import type { CopySlot } from '@/lib/copy-slots/validate'

// Whitespace as a slot counts it: single spaces, nothing at either end.
export function collapse(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

// Words a cut may not end on, because a phrase that stops on one reads as broken off: decision
// 18's list (docs/template-fit-decisions.md), the verbs and comparisons that leave a phrase
// hanging the same way, and the ampersand. "us" and "you" end a phrase whole, so they may stay.
const JOINING_WORD =
  /^(the|a|an|in|on|of|for|and|or|to|with|by|at|from|all|our|your|we|is|are|been|have|has|that|who|which|but|as|had|was|were|so|than|&)$/i

// Punctuation that joins, left at the end of a cut.
const TRAILING_JOINERS = /[\s,;:]+$/

// Marks that open and close an aside: brackets, and quotation marks by where they sit. A straight
// quote opens at the start of a word and closes at its end, so the apostrophe in "we're" does
// neither.
const ASIDES = [
  { open: /[([{]/g, close: /[)\]}]/g },
  { open: /“|(?<![^\s([{])"/g, close: /[”"](?![\p{L}\p{N}])/gu },
  { open: /‘|(?<![^\s([{])'/g, close: /[’'](?![\p{L}\p{N}])/gu },
] as const

function lastWord(text: string): string {
  return text.slice(text.lastIndexOf(' ') + 1)
}

function endsOnJoiningWord(text: string): boolean {
  return JOINING_WORD.test(lastWord(text))
}

// Whether a cut stops inside brackets or a quotation, leaving it open.
function leavesOpen(text: string): boolean {
  const count = (mark: RegExp) => text.match(mark)?.length ?? 0
  return ASIDES.some(({ open, close }) => count(open) > count(close))
}

// Where a mark falls before index `end` with a space or the text's end after it, so the point in
// "4.9" is not a sentence end. Latest first.
function breaksAt(text: string, end: number, mark: RegExp): number[] {
  const at: number[] = []
  for (const match of text.slice(0, end).matchAll(mark)) {
    const next = text.charAt(match.index + 1)
    if (next === '' || /\s/.test(next)) at.push(match.index)
  }
  return at.reverse()
}

// Cuts to at most `max` characters where a phrase ends (decision 18). In order of preference: the
// last sentence end; just before the last colon or semicolon; the last comma, which goes; the last
// word boundary, with the joining words left at its end dropped. A colon, semicolon or comma goes
// with the cut, so it may fall just past the `max` characters. Each counts only while `min`
// characters remain, and a clause only when it does not end on a joining word or inside brackets
// or a quotation. When none does, the cut stays at the last word boundary, or hard in a word
// longer than the slot, and the fillers complete it.
function shorten(text: string, min: number, max: number): string {
  if (text.length <= max) return text
  const before = (at: number) => text.slice(0, at).replace(TRAILING_JOINERS, '')
  const clause = [
    ...breaksAt(text, max, /[.!?]/g).map((at) => text.slice(0, at + 1)),
    ...breaksAt(text, max + 1, /[:;]/g).map(before),
    ...breaksAt(text, max + 1, /,/g).map(before),
  ].find((cut) => cut.length >= min && !endsOnJoiningWord(cut) && !leavesOpen(cut))
  if (clause !== undefined) return clause
  const head = text.slice(0, max)
  // The cut already falls between words when the next character is a space.
  const space = text.charAt(max) === ' ' ? max : head.lastIndexOf(' ')
  const cut = (space > 0 ? head.slice(0, space) : head).replace(TRAILING_JOINERS, '')
  let phrase = cut
  while (phrase !== '' && endsOnJoiningWord(phrase)) {
    phrase = phrase.slice(0, phrase.length - lastWord(phrase).length).replace(TRAILING_JOINERS, '')
  }
  return phrase.length >= min ? phrase : cut
}

// Fits text into a slot's range. Too long, it is shortened; too short, fillers are appended in
// order until it reaches the minimum. Throws when the fillers cannot get it there, because a
// template's fillers are chosen to fit its own slots and a miss is a programming error.
export function fitToSlot(text: string, slot: CopySlot, fillers: readonly string[]): string {
  let out = shorten(collapse(text), slot.min, slot.max)
  for (const filler of fillers) {
    if (out.length >= slot.min) break
    out = shorten(out === '' ? filler : `${out} ${filler}`, slot.min, slot.max)
  }
  if (out.length < slot.min || out.length > slot.max) {
    throw new Error(
      `Cannot fit text into ${String(slot.min)} to ${String(slot.max)} characters: "${out}"`,
    )
  }
  return out
}
