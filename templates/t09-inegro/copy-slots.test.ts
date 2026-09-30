import { TOKEN_NAMES } from '@/lib/tokens/types'
import { INEGRO_CONTRAST_PAIRS, inegroViolations } from './copy-slots'
import { KESTREL_INEGRO } from './example/content'

describe('inegro copy slots', () => {
  it('accepts the example content, optional pieces included', () => {
    expect(inegroViolations(KESTREL_INEGRO)).toEqual([])
  })

  it('accepts the content with the optional pieces left out', () => {
    const bare = {
      ...KESTREL_INEGRO,
      intro: { ...KESTREL_INEGRO.intro, image: null },
      services: {
        ...KESTREL_INEGRO.services,
        items: KESTREL_INEGRO.services.items.map((item) => ({ ...item, image: null })),
      },
      newsletter: { ...KESTREL_INEGRO.newsletter, email: null },
      closing: { ...KESTREL_INEGRO.closing, social: null },
      footer: { links: [] },
    }
    expect(inegroViolations(bare)).toEqual([])
  })

  it('names the slot and the path of a text outside its limits', () => {
    const long = {
      ...KESTREL_INEGRO,
      hero: { ...KESTREL_INEGRO.hero, subhead: 'x'.repeat(111) },
    }
    expect(inegroViolations(long)).toEqual([
      { slot: 'hero.subhead', length: 111, min: 50, max: 110 },
    ])
  })

  it('reports a list the layout has no room for', () => {
    const service = KESTREL_INEGRO.services.items[0]
    if (service === undefined) throw new Error('The example has services')
    const tall = {
      ...KESTREL_INEGRO,
      services: { ...KESTREL_INEGRO.services, items: Array.from({ length: 7 }, () => service) },
    }
    expect(inegroViolations(tall)).toEqual([{ slot: 'services.items', length: 7, min: 3, max: 6 }])
  })

  it('declares each contrast pair once, over known tokens', () => {
    const keys = INEGRO_CONTRAST_PAIRS.map((pair) => `${pair.text}/${pair.background}`)
    expect(new Set(keys).size).toBe(keys.length)
    for (const pair of INEGRO_CONTRAST_PAIRS) {
      expect(TOKEN_NAMES).toContain(pair.text)
      expect(TOKEN_NAMES).toContain(pair.background)
    }
  })
})
