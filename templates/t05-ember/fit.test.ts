import { fitWord, longestWord, textEms } from './fit'

// The tables Ember's long words are sized by (fit.ts): a word's width in ems, never less than the
// widest of the looks' faces sets it.
describe('the Ember fit', () => {
  it('adds up a word from its characters, the widest for any it does not list', () => {
    expect(textEms('Mm', 'body')).toBeCloseTo(0.91 + 0.93)
    expect(textEms('Mm', 'display')).toBeCloseTo(0.96 + 0.98)
    expect(textEms('é', 'body')).toBeCloseTo(textEms('e', 'body'))
    expect(textEms('😀', 'display')).toBeCloseTo(1.09)
  })

  it('finds the longest word as written', () => {
    expect(longestWord('Clear advice across Northumberland', 'body')).toBeCloseTo(
      textEms('Northumberland', 'body'),
    )
    expect(longestWord('', 'body')).toBe(1)
  })

  it('counts a hyphenated word whole', () => {
    expect(longestWord('A well-established firm', 'display')).toBeCloseTo(
      textEms('well-established', 'display'),
    )
  })

  it('hands the longest word to the page as a variable', () => {
    expect(fitWord('STRAIGHTFORWARD help', 'body')).toEqual({
      '--ember-word': textEms('STRAIGHTFORWARD', 'body').toFixed(2),
    })
  })
})
