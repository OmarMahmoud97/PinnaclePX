import { fromSlotViolation, ruleViolationsIn } from '@/lib/copy-slots/rules'

const OWNER = 'Physiotherapy clinic in Sheffield since 2009. Same-week appointments.'

describe('ruleViolationsIn', () => {
  it('finds numbers, superlatives and claims anywhere in the copy, with their paths', () => {
    const copy = {
      hero: { headline: 'The best physio in town', subhead: 'Trusted by 400 patients.' },
      items: [{ body: 'Award-winning care.' }],
    }
    const paths = ruleViolationsIn(copy, OWNER).map((v) => `${v.path}: ${v.reason}`)
    expect(paths).toEqual([
      'hero.headline: contains a superlative: "best"',
      'hero.subhead: contains a number: "400"',
      'hero.subhead: contains a claim the owner did not make: "Trusted by"',
      'items[0].body: contains a superlative: "Award-winning"',
    ])
  })

  it('allows what the owner said themselves', () => {
    const copy = { statement: 'Helping Sheffield move since 2009.' }
    expect(ruleViolationsIn(copy, OWNER)).toEqual([])
    expect(ruleViolationsIn({ statement: 'Since 2010.' }, OWNER)).toHaveLength(1)
  })

  it('is empty for clean copy', () => {
    expect(ruleViolationsIn({ a: 'Same-week appointments.', b: ['Book a visit'] }, OWNER)).toEqual(
      [],
    )
  })
})

describe('fromSlotViolation', () => {
  it('says the length and the range', () => {
    expect(fromSlotViolation({ slot: 'hero.headline', length: 70, min: 18, max: 60 })).toEqual({
      path: 'hero.headline',
      reason: '70 characters; must be 18 to 60',
    })
  })
})
