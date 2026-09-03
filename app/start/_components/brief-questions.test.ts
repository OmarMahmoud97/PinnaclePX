import { describe, expect, it } from 'vitest'
import { QUESTIONS } from '@/app/start/_components/brief-questions'
import { BLANK_ANSWERS } from '@/lib/brief/answers'

describe('QUESTIONS', () => {
  it('uses the company name once it is known', () => {
    const answers = { ...BLANK_ANSWERS, company: ' Ashgrove Physio ' }
    expect(QUESTIONS.logo.title(answers)).toBe("Add Ashgrove Physio's logo, or skip it.")
    expect(QUESTIONS.imagery.title(answers)).toBe('How should Ashgrove Physio look?')
    expect(QUESTIONS.colours.title(answers)).toBe("Pick Ashgrove Physio's colours.")
  })

  it('falls back to "your" before a company name exists', () => {
    expect(QUESTIONS.logo.title(BLANK_ANSWERS)).toBe('Add your logo, or skip it.')
    expect(QUESTIONS.colours.title(BLANK_ANSWERS)).toBe('Pick your colours.')
  })
})
