import { possessive } from '@/lib/brief/names'
import type { QuestionId } from '@/lib/brief/question-ids'
import type { Answers } from '@/lib/brief/schema'

type Question = Readonly<{ title: (answers: Answers) => string; helper: string }>

function company(answers: Answers): string | null {
  const name = answers.company.trim()
  return name === '' ? null : name
}

// The heading and sub-line above each question. Once the company is known the headings use it,
// so the page is talking about their business rather than a business.
export const QUESTIONS: Readonly<Record<QuestionId, Question>> = {
  describe: {
    title: () => 'First, your business.',
    helper: 'A sentence or two is plenty. This becomes the brief your wording is written from.',
  },
  details: {
    title: () => 'Where should we send your link?',
    helper: 'Your designs arrive at this address. Nobody rings you.',
  },
  logo: {
    title: (answers) => {
      const name = company(answers)
      return name === null
        ? 'Add your logo, or skip it.'
        : `Add ${possessive(name)} logo, or skip it.`
    },
    helper: 'Your logo goes on all three designs. You can skip this for now.',
  },
  imagery: {
    title: (answers) => {
      const name = company(answers)
      return name === null ? 'How should your site look?' : `How should ${name} look?`
    },
    helper: 'Pick a style. Add your own photos too, if you have them.',
  },
  colours: {
    title: (answers) => {
      const name = company(answers)
      return name === null ? 'Pick your colours.' : `Pick ${possessive(name)} colours.`
    },
    helper: 'Your brand colour, or one of ours. This is the last question.',
  },
}
