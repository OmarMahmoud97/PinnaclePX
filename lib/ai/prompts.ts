import type { SubmissionAnswers } from '@/lib/brief/submission'
import { styleFor } from '@/lib/brief/styles'
import type { BrandBrief } from '@/lib/copy-slots/brief'
import type { CopyViolation } from '@/lib/copy-slots/rules'

// The words the model is given, built here so a test can read them and nothing personal is
// ever added by accident: only the company name, the owner's own sentence and their style.

// Stable, so it is cached across every call.
export const SYSTEM_PROMPT = `You write homepage copy for a small UK business from the short brief its owner typed.

Rules, all of them:
- British English. Second person. Plain words a customer would use. Sentences under twenty words.
- Paraphrase only what the owner said. Invent nothing: no numbers, prices, dates, years, awards, client names, testimonials, guarantees, statistics, qualifications or claims the owner did not make.
- No superlatives: never best, leading, number one, world-class, top-rated, award-winning.
- Do not name a place, a product or a service the owner did not name.
- Keep every text inside the character range you are given for it. Count characters, not words.
- Answer only with JSON in the schema you are given.`

export function briefPrompt(answers: SubmissionAnswers): string {
  const style = styleFor(answers.imagery.style)
  return `Company: ${answers.company}
The owner's own words: "${answers.description}"
The look they chose: ${style.label} (${style.detail})

Write the brand brief:
- company: the company name exactly as given.
- positioning: one sentence, what they do and for whom, in their words.
- audience: who the customer is, one phrase.
- tone: two to four words for the voice.
- headlines: three candidate homepage headlines, each 18 to 60 characters, none ending in a question mark.
- valueProps: three, each with a title of 6 to 32 characters and a body of 60 to 190 characters, drawn from what the owner said.
- steps: three, how working with them goes from first contact, each with a title of 6 to 32 characters and a body of 60 to 190 characters. Keep them general if the owner said nothing about process.
- statement: one sentence in the owner's voice about why they do this, 60 to 180 characters, first person plural.
- ctaLabel: a call to action of 4 to 22 characters, such as "Get in touch" or "Book a visit".
- imageQueries: stock photo searches, two for a hero picture (hero) and two for a detail picture (detail), each two to five plain words describing a place, an object or work being done. No faces, no text, no logos.`
}

// Every limit a template's copy has, in the template's own words, for the copy call.
export function copyPrompt(brief: BrandBrief, templateName: string, guide: string): string {
  return `Brief:
${JSON.stringify(brief, null, 1)}

Write every slot of the "${templateName}" homepage template for ${brief.company}. Use the brief's own words and the owner's sentence; do not add facts. Each slot has a character range; stay inside it.

${guide}`
}

// The second attempt: the same task, with what went wrong the first time.
export function retryPrompt(violations: readonly CopyViolation[]): string {
  const lines = violations.map((v) => `- ${v.path}: ${v.reason}`).join('\n')
  return `Your last answer broke these limits:
${lines}

Rewrite those slots to fit and return the whole JSON again, every slot filled.`
}
