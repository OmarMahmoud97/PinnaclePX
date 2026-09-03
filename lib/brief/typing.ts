type TypingTimings = Readonly<{
  msPerChar: number
  pauseAfterCommaMs: number
  pauseAfterStopMs: number
  jitterMs: number
}>

// A fixed wobble per character from a multiplicative hash of its index: the same on every pass
// and in every test, and never more than jitterMs either way.
function jitterAt(index: number, jitterMs: number): number {
  if (jitterMs === 0) return 0
  const hash = Math.imul(index + 1, 2654435761) >>> 0
  return (hash % (2 * jitterMs + 1)) - jitterMs
}

// When each character of `text` appears, in ms from the start: a steady pace with a breath after
// a comma, a longer one after a full stop, and a small fixed wobble, so the typing reads as a
// hand rather than a metronome. offsets[i] is when character i becomes visible; the last entry
// is how long the whole sentence takes.
export function typingOffsets(text: string, timings: TypingTimings): number[] {
  const offsets: number[] = []
  let at = 0
  for (let index = 0; index < text.length; index += 1) {
    const previous = text[index - 1]
    const pause =
      previous === ',' ? timings.pauseAfterCommaMs : previous === '.' ? timings.pauseAfterStopMs : 0
    at += timings.msPerChar + jitterAt(index, timings.jitterMs) + pause
    offsets.push(at)
  }
  return offsets
}
