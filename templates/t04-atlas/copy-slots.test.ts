import { TOKEN_NAMES } from '@/lib/tokens/types'
import { ATLAS_CONTRAST_PAIRS, atlasViolations } from './copy-slots'
import { KESTREL_ATLAS } from './example/content'

describe('atlas copy slots', () => {
  it('accepts the example content, optional parts included', () => {
    expect(atlasViolations(KESTREL_ATLAS)).toEqual([])
  })

  it('accepts the content with the optional parts left out', () => {
    const bare = {
      ...KESTREL_ATLAS,
      market: null,
      pitch: { ...KESTREL_ATLAS.pitch, exchange: null },
      partners: null,
      footer: { ...KESTREL_ATLAS.footer, newsletter: null },
    }
    expect(atlasViolations(bare)).toEqual([])
  })

  it('names the slot and the path of a text outside its limits', () => {
    const long = {
      ...KESTREL_ATLAS,
      hero: { ...KESTREL_ATLAS.hero, headline: { text: 'x'.repeat(61), emphasis: '' } },
    }
    expect(atlasViolations(long)).toEqual([
      { slot: 'hero.headline.text', length: 61, min: 18, max: 60 },
    ])
  })

  it('reports a list the layout has no room for', () => {
    const link = { label: 'More', href: '#' }
    const crowded = {
      ...KESTREL_ATLAS,
      footer: {
        ...KESTREL_ATLAS.footer,
        columns: [
          [link, link],
          [link, link],
          [link, link],
          [link, link],
        ],
      },
    }
    expect(atlasViolations(crowded)).toEqual([
      { slot: 'footer.columns', length: 4, min: 2, max: 3 },
    ])
  })

  it('declares each contrast pair once, over known tokens', () => {
    const keys = ATLAS_CONTRAST_PAIRS.map((pair) => `${pair.text}/${pair.background}`)
    expect(new Set(keys).size).toBe(keys.length)
    for (const pair of ATLAS_CONTRAST_PAIRS) {
      expect(TOKEN_NAMES).toContain(pair.text)
      expect(TOKEN_NAMES).toContain(pair.background)
    }
  })
})
