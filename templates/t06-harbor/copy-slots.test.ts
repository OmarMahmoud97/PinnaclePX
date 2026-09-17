import { TOKEN_NAMES } from '@/lib/tokens/types'
import { HARBOR_CONTRAST_PAIRS, harborViolations } from './copy-slots'
import { KESTREL_HARBOR } from './example/content'

describe('harbor copy slots', () => {
  it('accepts the example content, optional pieces included', () => {
    expect(harborViolations(KESTREL_HARBOR)).toEqual([])
  })

  it('accepts the content with the optional pieces left out', () => {
    const bare = {
      ...KESTREL_HARBOR,
      hero: { ...KESTREL_HARBOR.hero, image: null },
      about: { ...KESTREL_HARBOR.about, image: null, badge: null, quotes: null },
      gallery: null,
      pricing: null,
      testimonials: null,
      partners: null,
      blog: null,
      cta: { ...KESTREL_HARBOR.cta, image: null },
      footer: { ...KESTREL_HARBOR.footer, socials: null },
    }
    expect(harborViolations(bare)).toEqual([])
  })

  it('names the slot and the path of a text outside its limits', () => {
    const long = {
      ...KESTREL_HARBOR,
      hero: { ...KESTREL_HARBOR.hero, subhead: 'x'.repeat(141) },
    }
    expect(harborViolations(long)).toEqual([
      { slot: 'hero.subhead', length: 141, min: 40, max: 140 },
    ])
  })

  it('reports a list the layout has no room for', () => {
    const link = { label: 'More', href: '#' }
    const crowded = {
      ...KESTREL_HARBOR,
      nav: { ...KESTREL_HARBOR.nav, links: [link, link, link, link, link, link] },
    }
    expect(harborViolations(crowded)).toEqual([{ slot: 'nav.links', length: 6, min: 2, max: 5 }])
  })

  it('declares each contrast pair once, over known tokens', () => {
    const keys = HARBOR_CONTRAST_PAIRS.map((pair) => `${pair.text}/${pair.background}`)
    expect(new Set(keys).size).toBe(keys.length)
    for (const pair of HARBOR_CONTRAST_PAIRS) {
      expect(TOKEN_NAMES).toContain(pair.text)
      expect(TOKEN_NAMES).toContain(pair.background)
    }
  })
})
