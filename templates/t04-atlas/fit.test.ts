import { fitWord, longestWord, textEms } from './fit'

// The table the headings are sized by (fit.ts): a word's width in ems, never less than the
// widest of the looks' faces sets it.
describe('the Atlas heading fit', () => {
  it('adds up a word from its characters, the widest for any it does not list', () => {
    expect(textEms('Mm')).toBeCloseTo(0.94 + 0.95)
    expect(textEms('é')).toBeCloseTo(textEms('e'))
    expect(textEms('😀')).toBeCloseTo(1.09)
  })

  it('finds the longest word, its first letter in capitals as the headline sets it', () => {
    expect(longestWord('Your day captured naturally across northumberland')).toBeCloseTo(
      textEms('Northumberland'),
    )
    expect(longestWord('')).toBe(1)
  })

  it('counts a hyphenated word whole', () => {
    expect(longestWord('A well-established firm')).toBeCloseTo(textEms('Well-established'))
  })

  it('hands the longest word to the page as a variable', () => {
    expect(fitWord('Straightforward help')).toEqual({
      '--atlas-word': textEms('Straightforward').toFixed(2),
    })
  })
})
