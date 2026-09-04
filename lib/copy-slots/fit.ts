import type { CopySlot } from '@/lib/copy-slots/validate'

// Whitespace as a slot counts it: single spaces, nothing at either end.
export function collapse(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

// Cuts to at most `max` characters. Prefers the last sentence end that still leaves `min`
// characters, then the last word boundary, then a hard cut. Trailing joining punctuation left
// by a word cut is removed, so a sentence never ends in a comma.
function shorten(text: string, min: number, max: number): string {
  if (text.length <= max) return text
  const head = text.slice(0, max)
  let sentenceEnd = -1
  for (const match of head.matchAll(/[.!?](?=\s|$)/g)) sentenceEnd = match.index + 1
  if (sentenceEnd >= min) return head.slice(0, sentenceEnd)
  // The cut already falls between words when the next character is a space.
  const space = text.charAt(max) === ' ' ? max : head.lastIndexOf(' ')
  const cut = space > 0 ? head.slice(0, space) : head
  return cut.replace(/[\s,;:]+$/, '')
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
