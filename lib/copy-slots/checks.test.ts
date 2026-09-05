import { at, slotChecks } from '@/lib/copy-slots/checks'

const SLOTS = { title: { min: 3, max: 10 }, 'items[].label': { min: 2, max: 5 } } as const
const COUNTS = { items: { min: 1, max: 2 } } as const

describe('slotChecks', () => {
  it('reports nothing for content inside every range', () => {
    const checks = slotChecks(SLOTS, COUNTS)
    checks.text('title', 'title', 'Hello')
    checks.list('items', 'items', ['ab', 'cd'], (item, path) => {
      checks.text('items[].label', `${path}.label`, item)
    })
    expect(checks.violations()).toEqual([])
  })

  it('names the path of each text and count outside its range, in order', () => {
    const checks = slotChecks(SLOTS, COUNTS)
    checks.text('title', 'title', 'Hi')
    checks.list('items', 'items', ['a', 'bc', 'toolong'], (item, path) => {
      checks.text('items[].label', `${path}.label`, item)
    })
    expect(checks.violations()).toEqual([
      { slot: 'title', length: 2, min: 3, max: 10 },
      { slot: 'items', length: 3, min: 1, max: 2 },
      { slot: 'items[0].label', length: 1, min: 2, max: 5 },
      { slot: 'items[2].label', length: 7, min: 2, max: 5 },
    ])
  })

  it('writes a list item path the way the copy stage reads it', () => {
    expect(at('nav.links', 2, '.label')).toBe('nav.links[2].label')
    expect(at(at('footer.groups', 1, '.links'), 0)).toBe('footer.groups[1].links[0]')
  })
})
