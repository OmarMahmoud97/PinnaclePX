import { displayEms, fitWord, longestWord } from './fit'

// The headings' side of the widths table (fit.ts): the longest word of a heading, as wide as the
// widest of the looks' display faces sets it.
describe('the Aurora heading fit', () => {
  it('finds the longest word as written', () => {
    expect(longestWord('Straightforward help, every week')).toBeCloseTo(
      displayEms('Straightforward'),
    )
    expect(longestWord('')).toBe(1)
  })

  it('counts a hyphenated word whole', () => {
    expect(longestWord('A well-established firm')).toBeCloseTo(displayEms('well-established'))
  })

  it('hands the longest word to the page as a variable', () => {
    expect(fitWord('Physiotherapy near you')).toEqual({
      '--aurora-word': displayEms('Physiotherapy').toFixed(2),
    })
  })
})
