import { TOKEN_NAMES } from '@/lib/tokens/types'
import { MONOLITH_CONTRAST_PAIRS, monolithViolations } from './copy-slots'
import { KESTREL_MONOLITH } from './example/content'

describe('monolith copy slots', () => {
  it('accepts the example content, optional sections included', () => {
    expect(monolithViolations(KESTREL_MONOLITH)).toEqual([])
  })

  it('accepts the content with the optional sections left out', () => {
    const bare = {
      ...KESTREL_MONOLITH,
      testimonials: null,
      team: null,
      pricing: null,
      newsletter: null,
    }
    expect(monolithViolations(bare)).toEqual([])
  })

  it('names the slot and the path of a text outside its limits', () => {
    const long = {
      ...KESTREL_MONOLITH,
      hero: {
        ...KESTREL_MONOLITH.hero,
        headline: { text: 'x'.repeat(61), first: '', second: '' },
      },
    }
    expect(monolithViolations(long)).toEqual([
      { slot: 'hero.headline.text', length: 61, min: 18, max: 60 },
    ])
  })

  it('reports a list the layout has no room for', () => {
    const link = { label: 'More', href: '#' }
    const crowded = {
      ...KESTREL_MONOLITH,
      nav: { ...KESTREL_MONOLITH.nav, links: [link, link, link, link, link] },
    }
    expect(monolithViolations(crowded)).toEqual([{ slot: 'nav.links', length: 5, min: 2, max: 4 }])
  })

  it('declares each contrast pair once, over known tokens', () => {
    const keys = MONOLITH_CONTRAST_PAIRS.map((pair) => `${pair.text}/${pair.background}`)
    expect(new Set(keys).size).toBe(keys.length)
    for (const pair of MONOLITH_CONTRAST_PAIRS) {
      expect(TOKEN_NAMES).toContain(pair.text)
      expect(TOKEN_NAMES).toContain(pair.background)
    }
  })
})
