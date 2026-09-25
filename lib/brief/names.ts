// Titles a visitor may type before their name. "Hello Dr," greets nobody, so they are skipped.
const TITLES = new Set(['dr', 'mr', 'mrs', 'ms', 'mx', 'miss', 'prof'])

const isTitle = (word: string) => TITLES.has(word.toLowerCase().replace(/\.$/, ''))

// The first word of a name that is not a title, with its first letter capitalised, so
// "omar mahmoud" and "Dr Omar Mahmoud" are both greeted as "Omar". The rest of the word is left
// as typed. Empty when the name is empty or only a title.
export function firstNameFrom(name: string): string {
  const first =
    name
      .trim()
      .split(/\s+/)
      .find((word) => word !== '' && !isTitle(word)) ?? ''
  return first.charAt(0).toLocaleUpperCase('en-GB') + first.slice(1)
}

// "Gibbs Plumbing's"; "Gibbs'" or "GIBBS'" after a final s of either case; and a name that
// already ends in an apostrophe, "Sam's", "Sam’s" or "Farmers'", as it is, so it never gains a
// second one.
export function possessive(name: string): string {
  if (/['’]s?$/i.test(name)) return name
  return /s$/i.test(name) ? `${name}'` : `${name}'s`
}
