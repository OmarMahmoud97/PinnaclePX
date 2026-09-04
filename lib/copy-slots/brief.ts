import * as z from 'zod'
import { collapse } from '@/lib/copy-slots/fit'

// What the brief stage produces from the visitor's sentence: the raw material every template's
// copy is written from. The model paraphrases the sentence and proposes candidates; it invents
// no facts. The fallback below builds the same shape from the sentence alone. Written with zod
// v4, which the Anthropic SDK's structured output helper is typed against; the shape carries no
// length limits, because the API's schema subset has none and the code checks them after.
const item = z.object({ title: z.string(), body: z.string() })

export const briefSchema = z.object({
  company: z.string(),
  // One sentence: what the company does and for whom.
  positioning: z.string(),
  audience: z.string(),
  // Two to four words for the voice, such as "warm, direct".
  tone: z.array(z.string()),
  headlines: z.array(z.string()),
  valueProps: z.array(item),
  steps: z.array(item),
  // One sentence from the company about why it exists.
  statement: z.string(),
  ctaLabel: z.string(),
  // Stock photo searches, by the kind of picture a template asks for.
  imageQueries: z.object({ hero: z.array(z.string()), detail: z.array(z.string()) }),
})

export type BrandBrief = z.infer<typeof briefSchema>

// The sentences of a text, in order, each with its final punctuation.
export function sentencesOf(text: string): string[] {
  return collapse(text)
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => sentence.length > 0)
}

// Generic titles that claim nothing. The bodies under them are the visitor's own sentences.
const VALUE_TITLES = ['What we do', 'Who it is for', 'How to start'] as const
const STEPS = [
  { title: 'Tell us what you need', body: 'Say what you are after and when you need it by.' },
  {
    title: 'We agree the details',
    body: 'You get a clear picture of what happens and what it costs.',
  },
  { title: 'We get to work', body: 'You hear from us as things move, without having to ask.' },
] as const

// A brief from the company name and the visitor's sentence only. Every field is either their
// words or a plain phrase that makes no claim, so a prospect never reads an invented fact.
export function fallbackBrief(company: string, description: string): BrandBrief {
  const name = collapse(company)
  const sentences = sentencesOf(description)
  const [first = name, ...rest] = sentences
  return {
    company: name,
    positioning: first,
    audience: '',
    tone: ['plain', 'direct'],
    headlines: [first, `${name}. ${first}`],
    valueProps: VALUE_TITLES.map((title, index) => ({
      title,
      body: rest[index] ?? sentences[index % Math.max(sentences.length, 1)] ?? first,
    })),
    steps: [...STEPS],
    statement: sentences.join(' '),
    ctaLabel: 'Get in touch',
    imageQueries: { hero: [name], detail: [first] },
  }
}
