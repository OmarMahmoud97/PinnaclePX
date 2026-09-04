import { TOKEN_NAMES } from '@/lib/tokens/types'
import { AURORA_CONTRAST_PAIRS, auroraViolations } from './copy-slots'
import { KESTREL } from './example/content'

describe('aurora copy slots', () => {
  it('accepts the example content', () => {
    expect(auroraViolations(KESTREL)).toEqual([])
  })

  it('names the slot and the path of a text outside its limits', () => {
    const long = { ...KESTREL, hero: { ...KESTREL.hero, headline: 'x'.repeat(61) } }
    expect(auroraViolations(long)).toEqual([
      { slot: 'hero.headline', length: 61, min: 18, max: 60 },
    ])
  })

  it('reports a list the layout has no room for', () => {
    const link = { label: 'More', href: '#' }
    const crowded = { ...KESTREL, nav: { ...KESTREL.nav, links: [link, link, link, link, link] } }
    expect(auroraViolations(crowded)).toEqual([{ slot: 'nav.links', length: 5, min: 2, max: 4 }])
  })

  it('declares each contrast pair once, over known tokens', () => {
    const keys = AURORA_CONTRAST_PAIRS.map((pair) => `${pair.text}/${pair.background}`)
    expect(new Set(keys).size).toBe(keys.length)
    for (const pair of AURORA_CONTRAST_PAIRS) {
      expect(TOKEN_NAMES).toContain(pair.text)
      expect(TOKEN_NAMES).toContain(pair.background)
    }
  })
})
