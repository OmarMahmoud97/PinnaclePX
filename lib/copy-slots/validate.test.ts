import { slotViolation } from '@/lib/copy-slots/validate'

describe('slotViolation', () => {
  const limits = { min: 5, max: 10 }

  it('accepts text inside the limits, measured after trimming', () => {
    expect(slotViolation('headline', '  hello  ', limits)).toBeNull()
    expect(slotViolation('headline', 'ten chars!', limits)).toBeNull()
  })

  it('reports text under the minimum', () => {
    expect(slotViolation('headline', 'hi', limits)).toEqual({
      slot: 'headline',
      length: 2,
      min: 5,
      max: 10,
    })
  })

  it('reports text over the maximum', () => {
    expect(slotViolation('headline', 'eleven char', limits)).toEqual({
      slot: 'headline',
      length: 11,
      min: 5,
      max: 10,
    })
  })
})
