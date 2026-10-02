import type { SubmissionAnswers } from '@/lib/brief/submission'
import { CONFIG } from '@/lib/config'
import type { BrandBrief } from '@/lib/copy-slots/brief'
import { collapse } from '@/lib/copy-slots/fit'

// The abbreviations whose dot ends no sentence: the titles before a name, the prefixes of saints',
// mountains' and forts' names, and a single letter's dot, as in an initial or "e.g.".
const ABBREVIATION = String.raw`(?:Dr|Mr|Mrs|Ms|Prof|Rev|St|Mt|Ft|(?:\p{L}\.)*\p{L})\.`

// Where one sentence ends and the next begins: a full stop, question mark or exclamation mark and
// a space, unless the dot ends an abbreviation. So the word after "St." in "St. Ives" or after
// "J." in "J. Smith" does not open a sentence, and is read as a name like any other.
const SENTENCE_BREAK = new RegExp(String.raw`(?<=[.!?])(?<!(?:^|\P{L})${ABBREVIATION})\s+`, 'u')

// The words of a text: runs of letters, with an apostrophe inside a word kept and a possessive
// ending dropped, so "Bridge's" is the word "Bridge".
function wordsOf(text: string): string[] {
  return (text.normalize('NFC').match(/\p{L}[\p{L}\p{M}'’]*/gu) ?? []).map((word) =>
    word.replace(/['’]s?$/u, ''),
  )
}

// Every string inside a value, however deep: each field, list and item of the brief.
function stringsIn(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(stringsIn)
  if (value !== null && typeof value === 'object') return Object.values(value).flatMap(stringsIn)
  return []
}

// The words the visitor gave, lower-cased: their sentence, their company name and the brief
// written from them. A name in a stock picture's alt text may stand only if it is one of these.
export function givenWords(answers: SubmissionAnswers, brief: BrandBrief): ReadonlySet<string> {
  const texts = [answers.description, answers.company, ...stringsIn(brief)]
  return new Set(texts.flatMap((text) => wordsOf(text).map((word) => word.toLowerCase())))
}

// The alt text a stock picture carries onto the visitor's page (decision 7a). Pexels' own words
// describe the photograph, not the business, and name wherever it was taken: "Charming lakeside
// restaurant interior in Trakai" was the alt for a café in Hebden Bridge, read aloud as if the
// page said so. They are kept only when they are short, hold no digit in any script, and name
// nothing the visitor did not give, a name being a capitalised word that does not open a sentence
// and is not "I" (or "I'm", "I've"). Anything else is empty, so a screen reader passes the
// picture by rather than describe the business wrongly. The check reads every capitalised word
// as a name, a dog's breed included, so it costs some alt text that was fine rather than let a
// wrong one through. A visitor's own photographs keep theirs (lib/images/plan.ts).
export function stockAlt(alt: string, given: ReadonlySet<string>): string {
  const text = collapse(alt)
  if (text.length > CONFIG.images.altMaxChars || /\p{Nd}/u.test(text)) return ''
  const names = text.split(SENTENCE_BREAK).flatMap((sentence) =>
    wordsOf(sentence)
      .slice(1)
      .filter((word) => /^\p{Lu}/u.test(word) && !/^I(['’]\p{L}+)?$/u.test(word)),
  )
  return names.every((name) => given.has(name.toLowerCase())) ? text : ''
}
