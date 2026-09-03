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
})

describe('possessive', () => {
  it("adds 's to most names", () => {
    expect(possessive('Ashgrove Physio')).toBe("Ashgrove Physio's")
  })

  it('adds only an apostrophe to a name that ends in s', () => {
    expect(possessive("Sam's Bikes")).toBe("Sam's Bikes'")
  })
})
