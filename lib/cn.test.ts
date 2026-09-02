import { cn } from '@/lib/cn'

describe('cn', () => {
  it('drops falsy inputs', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b')
  })

  it('lets the later conflicting utility win', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })
})
