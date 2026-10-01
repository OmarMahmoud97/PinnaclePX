import type { SubmissionAnswers } from '@/lib/brief/submission'
import { styleFor } from '@/lib/brief/styles'
import type { BrandBrief } from '@/lib/copy-slots/brief'
import type { CopyViolation } from '@/lib/copy-slots/rules'

// The words the model is given, built here so a test can read them and nothing personal is
// ever added by accident: only the company name, the owner's own sentence and their style.

// The same on every call, but too short for the prompt cache: Sonnet 5 caches nothing under
// 1,024 tokens, and this is about 180. Add a cache marker only if it grows past that.
export const SYSTEM_PROMPT = `You write homepage copy for a small UK business from the short brief its owner typed.

Rules, all of them:
- British English. Second person. Plain words a customer would use. Sentences under twenty words.
- Paraphrase only what the owner said. Invent nothing: no numbers, prices, dates, years, awards, client names, testimonials, guarantees, statistics, qualifications or claims the owner did not make. A number or a claim the owner wrote may be used in their words.
- No superlatives (best, leading, number one, world-class, top-rated, award-winning) unless the owner used the word; avoid the word best in every sense, even "what suits you best".
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

// Every limit a template's copy has, in the template's own words, for the copy call, with the
// owner's own sentence (the one source of any number or claim the copy may carry) and the
// shape the answer must take (lib/ai/json.ts), since the schema is not sent as a grammar.
export function copyPrompt(
  brief: BrandBrief,
  ownersWords: string,
  templateName: string,
  guide: string,
  skeleton: string,
): string {
  return `The owner's own words: "${ownersWords}"

Brief, written from those words:
${JSON.stringify(brief)}

Write every slot of the "${templateName}" homepage template for ${brief.company}. Use the owner's words and the brief; a number, a name or a claim may appear only if the owner wrote it. Each slot has a character range; stay inside it.

${guide}

Answer with JSON of exactly this shape, every string written and each list as long as its slot says:
${skeleton}`
}

// The second attempt: the same task, with what went wrong the first time.
export function retryPrompt(violations: readonly CopyViolation[]): string {
  const lines = violations.map((v) => `- ${v.path}: ${v.reason}`).join('\n')
  return `Your last answer broke these limits:
${lines}

Rewrite those slots to fit and return the whole JSON again, every slot filled.`
}

// The ranking call's rules: what a photograph on a small business's homepage must not be.
export const RANK_SYSTEM_PROMPT = `You judge stock photographs for a small business's homepage. For each photograph, give a score from 0 to 10 for how well it would serve the stated purpose, and a reason to reject it if it has any of these: a watermark, visible text or a logo, a busy composition with no clear subject, a single identifiable person's face as the subject, or nothing to do with the purpose. Otherwise reject is null. Prefer real places and work being done, natural light, and room for words. Answer only with JSON in the schema.`

// The ranking call's user turn: the purpose the pictures are judged for, which carries the
// company name and the brief's positioning, and nothing else.
export function rankPrompt(purpose: string): string {
  return `Purpose: ${purpose}\nThe photographs, each preceded by its id:`
}
