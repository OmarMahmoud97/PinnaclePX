import { describe, expect, it } from 'vitest'
import { firstNameFrom, possessive } from '@/lib/brief/names'

describe('firstNameFrom', () => {
  it('takes the first word and capitalises it', () => {
    expect(firstNameFrom('omar mahmoud')).toBe('Omar')
  })

  it('trims and keeps a name already capitalised', () => {
    expect(firstNameFrom('  Sam ')).toBe('Sam')
  })

  it('leaves the rest of the word as typed', () => {
    expect(firstNameFrom('élodie')).toBe('Élodie')
    expect(firstNameFrom('JO')).toBe('JO')
  })

  it('is empty for an empty name', () => {
    expect(firstNameFrom('   ')).toBe('')
  })

  it('skips a title, with or without its full stop', () => {
    expect(firstNameFrom('Dr Sam Gibbs')).toBe('Sam')
    expect(firstNameFrom('mrs. jo bloggs')).toBe('Jo')
    expect(firstNameFrom('Prof Ada Byron')).toBe('Ada')
  })

  it('is empty for a title alone, so nobody is greeted as "Miss"', () => {
    expect(firstNameFrom('Miss')).toBe('')
  })
})

describe('possessive', () => {
  it("adds 's to most names", () => {
    expect(possessive('Gibbs Plumbing')).toBe("Gibbs Plumbing's")
  })

  it('adds only an apostrophe after a final s, of either case', () => {
    expect(possessive('Gibbs')).toBe("Gibbs'")
    expect(possessive('GIBBS')).toBe("GIBBS'")
    expect(possessive("Sam's Bikes")).toBe("Sam's Bikes'")
  })

  it('leaves a name that is already possessive as it is', () => {
    expect(possessive("Sam's")).toBe("Sam's")
    expect(possessive('Sam’s')).toBe('Sam’s')
    expect(possessive("SAM'S")).toBe("SAM'S")
  })

  it('leaves a name that already ends in a bare apostrophe as it is', () => {
    expect(possessive("Gibbs'")).toBe("Gibbs'")
    expect(possessive('Farmers’')).toBe('Farmers’')
  })
})
