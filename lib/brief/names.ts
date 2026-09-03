// The first word of a name with its first letter capitalised, so "omar mahmoud" is greeted as
// "Omar". The rest of the word is left as typed.
export function firstNameFrom(name: string): string {
  const [first = ''] = name.trim().split(/\s+/)
  return first.charAt(0).toLocaleUpperCase('en-GB') + first.slice(1)
}

// "Ashgrove Physio's", or "Sam's Bikes'" when the name already ends in an s.
export function possessive(name: string): string {
  return name.endsWith('s') ? `${name}'` : `${name}'s`
}
