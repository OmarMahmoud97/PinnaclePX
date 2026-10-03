import { fitWord, longestWord, textEms } from './fit'

describe('monolith fit', () => {
  it('adds up a word from the widest face of each character', () => {
    expect(textEms('Knaresborough')).toBeCloseTo(7.77)
  })

  it('reads each character from its own place in the table', () => {
    // Spread over the table, so a width out of line with its character shows.
    expect(textEms('A')).toBeCloseTo(0.76)
    expect(textEms('W')).toBeCloseTo(1.08)
    expect(textEms('z')).toBeCloseTo(0.58)
    expect(textEms('9')).toBeCloseTo(0.65)
    expect(textEms(' ')).toBeCloseTo(0.28)
    expect(textEms('*')).toBeCloseTo(0.56)
  })

  it('counts an accented letter as its letter and anything unknown as the widest', () => {
    expect(textEms('café')).toBeCloseTo(textEms('cafe'))
    expect(textEms('Ω')).toBeCloseTo(textEms('W'))
  })

  it('hands the longest word across the texts to the page as a variable', () => {
    expect(fitWord(['Same week', 'Independent', 'Open to all'])).toEqual({
      '--monolith-word': textEms('Independent').toFixed(2),
    })
    expect(fitWord([''])).toEqual({ '--monolith-word': '1.00' })
  })

  it('counts a hyphenated word whole, or by its parts where the text may break after a hyphen', () => {
    expect(longestWord(['End-Of-Tenancy'])).toBeCloseTo(textEms('End-Of-Tenancy'))
    expect(longestWord(['End-Of-Tenancy'], true)).toBeCloseTo(textEms('Tenancy'))
    expect(longestWord(['Get in touch', 'Eco-friendly'], true)).toBeCloseTo(textEms('friendly'))
  })
})
