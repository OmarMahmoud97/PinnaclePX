import { TOKEN_NAMES } from '@/lib/tokens/types'
import { MERIDIAN_CONTRAST_PAIRS, meridianViolations } from './copy-slots'
import { KESTREL_MERIDIAN } from './example/content'

describe('meridian copy slots', () => {
  it('accepts the example content, optional sections included', () => {
    expect(meridianViolations(KESTREL_MERIDIAN)).toEqual([])
  })

  it('accepts the content with the optional sections left out', () => {
    const bare = { ...KESTREL_MERIDIAN, testimonials: null, team: null, pricing: null }
    expect(meridianViolations(bare)).toEqual([])
  })

  it('names the slot and the path of a text outside its limits', () => {
    const long = {
      ...KESTREL_MERIDIAN,
      hero: { ...KESTREL_MERIDIAN.hero, headline: { text: 'x'.repeat(61), emphasis: '' } },
    }
    expect(meridianViolations(long)).toEqual([
      { slot: 'hero.headline.text', length: 61, min: 18, max: 60 },
    ])
  })

  it('reports a list the layout has no room for', () => {
    const item = { title: 'Another', body: 'x'.repeat(60) }
    const crowded = {
      ...KESTREL_MERIDIAN,
      features: {
        ...KESTREL_MERIDIAN.features,
        items: [...KESTREL_MERIDIAN.features.items, item],
      },
    }
    expect(meridianViolations(crowded)).toEqual([
      { slot: 'features.items', length: 7, min: 3, max: 6 },
    ])
  })

  it('declares each contrast pair once, over known tokens', () => {
    const keys = MERIDIAN_CONTRAST_PAIRS.map((pair) => `${pair.text}/${pair.background}`)
    expect(new Set(keys).size).toBe(keys.length)
    for (const pair of MERIDIAN_CONTRAST_PAIRS) {
      expect(TOKEN_NAMES).toContain(pair.text)
      expect(TOKEN_NAMES).toContain(pair.background)
    }
  })
})
