import { TOKEN_NAMES } from '@/lib/tokens/types'
import { VECTOR_CONTRAST_PAIRS, vectorViolations } from './copy-slots'
import { KESTREL_VECTOR } from './example/content'

describe('vector copy slots', () => {
  it('accepts the example content, optional pieces included', () => {
    expect(vectorViolations(KESTREL_VECTOR)).toEqual([])
  })

  it('accepts the content with the optional pieces left out', () => {
    const bare = {
      ...KESTREL_VECTOR,
      projects: {
        ...KESTREL_VECTOR.projects,
        items: KESTREL_VECTOR.projects.items.map((item) => ({ ...item, image: null })),
      },
      about: { ...KESTREL_VECTOR.about, image: null },
      proof: null,
      footer: {
        ...KESTREL_VECTOR.footer,
        email: null,
        places: null,
        social: null,
        bottomLinks: [],
        credit: '',
      },
    }
    expect(vectorViolations(bare)).toEqual([])
  })

  it('names the slot and the path of a text outside its limits', () => {
    const long = {
      ...KESTREL_VECTOR,
      hero: { ...KESTREL_VECTOR.hero, subhead: 'x'.repeat(171) },
    }
    expect(vectorViolations(long)).toEqual([
      { slot: 'hero.subhead', length: 171, min: 60, max: 170 },
    ])
  })

  it('reports a list the layout has no room for', () => {
    const line = 'One more line'
    const tall = {
      ...KESTREL_VECTOR,
      hero: { ...KESTREL_VECTOR.hero, headline: [line, line, line, line] },
    }
    expect(vectorViolations(tall)).toEqual([{ slot: 'hero.headline', length: 4, min: 2, max: 3 }])
  })

  it('declares each contrast pair once, over known tokens', () => {
    const keys = VECTOR_CONTRAST_PAIRS.map((pair) => `${pair.text}/${pair.background}`)
    expect(new Set(keys).size).toBe(keys.length)
    for (const pair of VECTOR_CONTRAST_PAIRS) {
      expect(TOKEN_NAMES).toContain(pair.text)
      expect(TOKEN_NAMES).toContain(pair.background)
    }
  })
})
