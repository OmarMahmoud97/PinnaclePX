import 'client-only'

// The sentence a visitor types into the hero, kept for the length of the visit so the closing
// section can show their own words in its frame. Empty means "show the example brief".
let sentence = ''
const listeners = new Set<() => void>()

export function subscribeToSentence(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getSentence(): string {
  return sentence
}

export function setSentence(next: string): void {
  if (next === sentence) return
  sentence = next
  for (const listener of listeners) listener()
}
