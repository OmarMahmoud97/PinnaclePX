import { TOKEN_NAMES } from '@/lib/tokens/types'
import { EMBER_CONTRAST_PAIRS, emberViolations } from './copy-slots'
import { KESTREL_EMBER } from './example/content'

describe('ember copy slots', () => {
  it('accepts the example content, optional pieces included', () => {
    expect(emberViolations(KESTREL_EMBER)).toEqual([])
  })

  it('accepts the content with the optional pieces left out', () => {
    const bare = {
      ...KESTREL_EMBER,
      hero: { ...KESTREL_EMBER.hero, background: null, proof: null },
      about: { ...KESTREL_EMBER.about, image: null, location: null },
      booking: { ...KESTREL_EMBER.booking, testimonial: null },
      timing: { ...KESTREL_EMBER.timing, image: null, rows: null },
      testimonials: null,
      footer: {
        ...KESTREL_EMBER.footer,
        socials: null,
        contact: { heading: 'Get in touch', email: null, phone: null },
      },
    }
    expect(emberViolations(bare)).toEqual([])
  })

  it('names the slot and the path of a text outside its limits', () => {
    const long = {
      ...KESTREL_EMBER,
      hero: { ...KESTREL_EMBER.hero, headline: 'x'.repeat(61) },
    }
    expect(emberViolations(long)).toEqual([{ slot: 'hero.headline', length: 61, min: 18, max: 60 }])
  })

  it('reports a list the layout has no room for', () => {
    const link = { label: 'More', href: '#' }
    const crowded = {
      ...KESTREL_EMBER,
      nav: { ...KESTREL_EMBER.nav, links: [link, link, link, link, link] },
    }
    expect(emberViolations(crowded)).toEqual([{ slot: 'nav.links', length: 5, min: 2, max: 4 }])
  })

  it('declares each contrast pair once, over known tokens', () => {
    const keys = EMBER_CONTRAST_PAIRS.map((pair) => `${pair.text}/${pair.background}`)
    expect(new Set(keys).size).toBe(keys.length)
    for (const pair of EMBER_CONTRAST_PAIRS) {
      expect(TOKEN_NAMES).toContain(pair.text)
      expect(TOKEN_NAMES).toContain(pair.background)
    }
  })
})
