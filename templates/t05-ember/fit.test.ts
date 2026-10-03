import { fitWord, longestWord, textEms } from './fit'

describe('ember fit', () => {
  it('adds up a word from the widest face of each character', () => {
    expect(textEms('KNARESBOROUGH')).toBeCloseTo(10.15)
    expect(textEms('STRAIGHTFORWARD')).toBeCloseTo(11.25)
  })

  it('reads each character from its own place in the table', () => {
    // Spread over the table, so a width out of line with its character shows.
    expect(textEms('A')).toBeCloseTo(0.77)
    expect(textEms('W')).toBeCloseTo(1.06)
    expect(textEms('z')).toBeCloseTo(0.54)
    expect(textEms('9')).toBeCloseTo(0.67)
    expect(textEms(' ')).toBeCloseTo(0.25)
    expect(textEms('”')).toBeCloseTo(0.46)
  })

  it('counts an accented letter as its letter and anything unknown as the widest', () => {
    expect(textEms('CAFÉ')).toBeCloseTo(textEms('CAFE'))
    expect(textEms('Ω')).toBeCloseTo(textEms('W'))
  })

  it('finds the longest word in the line', () => {
    expect(longestWord('Physiotherapy that fits your week')).toBeCloseTo(textEms('Physiotherapy'))
    expect(longestWord('')).toBe(1)
  })

  it('hands the longest word to the page as a variable', () => {
    expect(fitWord('Boiler repairs')).toEqual({ '--ember-word': textEms('repairs').toFixed(2) })
  })
})
