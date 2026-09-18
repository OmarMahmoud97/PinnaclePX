import { TOKEN_NAMES } from '@/lib/tokens/types'
import { SUMMIT_CONTRAST_PAIRS, summitViolations } from './copy-slots'
import { KESTREL_SUMMIT } from './example/content'

describe('summit copy slots', () => {
  it('accepts the example content, optional pieces included', () => {
    expect(summitViolations(KESTREL_SUMMIT)).toEqual([])
  })

  it('accepts the content with the optional pieces left out', () => {
    const bare = {
      ...KESTREL_SUMMIT,
      hero: { ...KESTREL_SUMMIT.hero, proof: null, background: null },
      why: { ...KESTREL_SUMMIT.why, image: null },
      articles: null,
      booking: {
        ...KESTREL_SUMMIT.booking,
        form: {
          ...KESTREL_SUMMIT.booking.form,
          doctor: { ...KESTREL_SUMMIT.booking.form.doctor, options: null },
          sendTo: null,
        },
      },
      cta: { ...KESTREL_SUMMIT.cta, image: null },
      footer: {
        ...KESTREL_SUMMIT.footer,
        contact: { heading: 'Get in touch', email: null, phone: null, address: null },
        smallLinks: [],
      },
    }
    expect(summitViolations(bare)).toEqual([])
  })

  it('names the slot and the path of a text outside its limits', () => {
    const long = {
      ...KESTREL_SUMMIT,
      hero: { ...KESTREL_SUMMIT.hero, subhead: 'x'.repeat(161) },
    }
    expect(summitViolations(long)).toEqual([
      { slot: 'hero.subhead', length: 161, min: 60, max: 160 },
    ])
  })

  it('reports a list the layout has no room for', () => {
    const link = { label: 'More', href: '#' }
    const crowded = {
      ...KESTREL_SUMMIT,
      nav: { ...KESTREL_SUMMIT.nav, links: [link, link, link, link, link] },
    }
    expect(summitViolations(crowded)).toEqual([{ slot: 'nav.links', length: 5, min: 2, max: 4 }])
  })

  it('declares each contrast pair once, over known tokens', () => {
    const keys = SUMMIT_CONTRAST_PAIRS.map((pair) => `${pair.text}/${pair.background}`)
    expect(new Set(keys).size).toBe(keys.length)
    for (const pair of SUMMIT_CONTRAST_PAIRS) {
      expect(TOKEN_NAMES).toContain(pair.text)
      expect(TOKEN_NAMES).toContain(pair.background)
    }
  })
})
