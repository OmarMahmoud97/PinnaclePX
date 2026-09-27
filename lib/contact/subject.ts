// The visitor's own text as one plain line for an email: every control character, a line break
// included, and every direction override or isolate (U+202A to U+202E, U+2066 to U+2069), which
// could reorder what the owner reads, becomes a space, and every run of space closes up to one.
export function oneLine(text: string): string {
  return text.replace(/[\p{Cc}\s‪-‮⁦-⁩]+/gu, ' ').trim()
}

// The subject of a message from /contact, "Message from Sam Patel" (ADR 0040). The page shows it
// as the visitor types and again in the receipt, and the owner's email carries it, so the words
// the visitor saw are the words that land. The name is the visitor's own text in an email header,
// so it is made one line first. A name left empty reads as "you".
export function subjectLine(name: string): string {
  const clean = oneLine(name)
  return `Message from ${clean === '' ? 'you' : clean}`
}
