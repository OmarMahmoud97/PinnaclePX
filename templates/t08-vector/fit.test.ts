import { fitHeadline, fitName, linesEms, longestWord, textEms } from './fit'

// The tables the headline and the name are sized by (fit.ts): a text's width in ems, never less
// than the widest of the looks' faces sets it.
describe('the Vector fit', () => {
  it('takes a text at its widest face, less the tracking, the widest for a character it lacks', () => {
    // Sora's i, n, d, e, p and t, the dark look's display face, less 0.025em a character.
    expect(textEms('independent', 'display')).toBeCloseTo(6.59 - 0.275)
    expect(textEms('independent', 'display')).toBeGreaterThan(textEms('independent', 'body'))
    expect(textEms('é')).toBeCloseTo(textEms('e'))
    expect(textEms('😀')).toBeCloseTo(1.1 - 0.025)
  })

  it('finds the headline’s longest word, its last line in the display faces', () => {
    expect(longestWord(['Scheduling made', 'simple for', 'independent pharmacies'])).toBeCloseTo(
      textEms('independent', 'display'),
    )
    expect(longestWord(['Physiotherapy for', 'all of', 'us'])).toBeCloseTo(textEms('Physiotherapy'))
    expect(longestWord([])).toBe(1)
  })

  it('splits a name between its words so its longest line is shortest', () => {
    expect(linesEms('Northgate People', 2)).toBeCloseTo(textEms('Northgate'))
    expect(linesEms('Northgate People', 3)).toBeCloseTo(textEms('Northgate'))
    expect(linesEms('oakfield dental practice', 2)).toBeCloseTo(textEms('oakfield dental'))
    expect(linesEms('oakfield dental practice', 3)).toBeCloseTo(
      Math.max(textEms('oakfield'), textEms('dental'), textEms('practice')),
    )
    expect(linesEms('Hollin Oak', 2)).toBeLessThan(textEms('Hollin Oak'))
  })

  it('keeps every word of a name of several words whole, however long', () => {
    // "physiotherapy" is past the width a name of one word is kept whole to (62px at 11px).
    expect(textEms('physiotherapy')).toBeGreaterThan(62 / 11)
    expect(linesEms('ashgrove physiotherapy', 2)).toBeCloseTo(textEms('physiotherapy'))
    expect(linesEms('ashgrove physiotherapy', 3)).toBeCloseTo(textEms('physiotherapy'))
  })

  it('keeps a short name of one word whole and shares a long one between its lines', () => {
    expect(linesEms('Benchrota', 2)).toBeCloseTo(textEms('Benchrota'))
    expect(linesEms('Benchrota', 3)).toBeCloseTo(textEms('Benchrota'))
    const name = 'AshgrovePhysiotherapyAnd'
    expect(linesEms(name, 2)).toBeCloseTo(textEms(name) / 2 + 1.1)
    expect(linesEms(name, 3)).toBeCloseTo(textEms(name) / 3 + 1.1)
  })

  it('hands the widths to the page as variables', () => {
    expect(fitHeadline(['Bright Blooms', 'Delivered'])).toEqual({
      '--vector-word': textEms('Delivered', 'display').toFixed(2),
    })
    expect(fitName('Northgate People')).toEqual({
      '--vector-two': textEms('Northgate').toFixed(2),
      '--vector-three': textEms('Northgate').toFixed(2),
    })
  })
})
