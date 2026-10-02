import { readFileSync } from 'node:fs'
import { join } from 'node:path'
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

  // Decision 15: words are set only in colours the contrast engine checks. Every stop of the two
  // text gradients (atlas.css) is a pair on the surface and on the muted surface.
  it('sets the text gradients only in colours it declares on both surfaces', () => {
    const keys = ATLAS_CONTRAST_PAIRS.map((pair) => `${pair.text}/${pair.background}`)
    const css = readFileSync(join(process.cwd(), 'templates/t04-atlas/atlas.css'), 'utf8')
    for (const rule of ['.atlas-text-gradient {', '.atlas-header-gradient {']) {
      const start = css.indexOf(rule)
      const stops = [...css.slice(start, css.indexOf('}', start)).matchAll(/var\(--([a-z-]+)\)/g)]
      expect(stops.length).toBeGreaterThan(1)
      for (const [, stop] of stops) {
        expect(keys).toContain(`${stop ?? ''}/surface`)
        expect(keys).toContain(`${stop ?? ''}/surface-muted`)
      }
    }
  })
})
