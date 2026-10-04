import { fitWord, longestWord, textEms } from './fit'

describe('harbor fit', () => {
  it('adds up a word from the widest face of each character', () => {
    expect(textEms('KNARESBOROUGH')).toBeCloseTo(10.66)
  })

  it('reads each character from its own place in the table', () => {
    // Spread over the table, so a width out of line with its character shows.
    expect(textEms('A')).toBeCloseTo(0.81)
    expect(textEms('W')).toBeCloseTo(1.12)
    expect(textEms('z', false)).toBeCloseTo(0.59)
    expect(textEms('9')).toBeCloseTo(0.7)
    expect(textEms(' ')).toBeCloseTo(0.27)
    expect(textEms('”')).toBeCloseTo(0.61)
  })

  it('sets text in capitals unless told not to', () => {
    expect(textEms('photographer')).toBeCloseTo(textEms('PHOTOGRAPHER'))
    expect(textEms('photographer', false)).toBeLessThan(textEms('PHOTOGRAPHER'))
  })

  it('counts an accented letter as its letter and anything unknown as the widest', () => {
    expect(textEms('CAFÉ')).toBeCloseTo(textEms('CAFE'))
    expect(textEms('Ω')).toBeCloseTo(textEms('W'))
  })

  it('finds the longest word across the lines', () => {
    expect(longestWord(['CARING FOR', 'YOUR DOG', 'IN CHORLTON'])).toBeCloseTo(textEms('CHORLTON'))
    expect(longestWord([''])).toBe(1)
  })

  it('hands the longest word to the page as a variable', () => {
    expect(fitWord(['BOILER', 'REPAIRS'])).toEqual({
      '--harbor-word': textEms('REPAIRS').toFixed(2),
    })
  })
})
