import { collapse, fitToSlot } from '@/lib/copy-slots/fit'

const FILLERS = ['Get in touch to find out more.', 'Everything starts with a conversation.']

describe('collapse', () => {
  it('trims and folds whitespace to single spaces', () => {
    expect(collapse('  Two   words\n here ')).toBe('Two words here')
  })
})

describe('fitToSlot', () => {
  it('returns text already in range unchanged', () => {
    expect(fitToSlot('Every job, every van, one calendar.', { min: 18, max: 60 }, FILLERS)).toBe(
      'Every job, every van, one calendar.',
    )
  })

  it('shortens at the last sentence end that still meets the minimum', () => {
    const text =
      'We fix boilers. We fit bathrooms. We also do a lot of other things around the house.'
    expect(fitToSlot(text, { min: 20, max: 40 }, FILLERS)).toBe('We fix boilers. We fit bathrooms.')
  })

  it('falls back to a word boundary and drops a trailing comma', () => {
    const text = 'Physiotherapy clinic in Sheffield, sports injuries, post-op rehab'
    expect(fitToSlot(text, { min: 10, max: 34 }, FILLERS)).toBe('Physiotherapy clinic in Sheffield')
  })

  it('hard cuts a single word longer than the slot', () => {
    expect(fitToSlot('Supercalifragilistic', { min: 1, max: 5 }, FILLERS)).toBe('Super')
  })

  it('appends fillers in order until the minimum is reached', () => {
    expect(fitToSlot('We fix boilers.', { min: 40, max: 120 }, FILLERS)).toBe(
      'We fix boilers. Get in touch to find out more.',
    )
    expect(fitToSlot('', { min: 60, max: 120 }, FILLERS)).toBe(
      'Get in touch to find out more. Everything starts with a conversation.',
    )
  })

  it('shortens again when a filler overshoots the maximum', () => {
    expect(fitToSlot('We fix boilers.', { min: 20, max: 30 }, FILLERS)).toBe(
      'We fix boilers. Get in touch',
    )
  })

  it('throws when the fillers cannot reach the minimum', () => {
    expect(() => fitToSlot('', { min: 200, max: 220 }, FILLERS)).toThrow(/Cannot fit/)
  })
})
