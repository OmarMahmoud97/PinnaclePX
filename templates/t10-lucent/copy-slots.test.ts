import { TOKEN_NAMES } from '@/lib/tokens/types'
import {
  LUCENT_CONTRAST_PAIRS,
  type LucentContent,
  type LucentFeature,
  lucentViolations,
} from './copy-slots'
import { SUBSCRR_LUCENT } from './example/content'
import { wordsOf } from './sections/showcase'

describe('lucent copy slots', () => {
  it('accepts the example content, optional pieces included', () => {
    expect(lucentViolations(SUBSCRR_LUCENT)).toEqual([])
  })

  it('accepts the content with the optional pieces left out', () => {
    const plain = (item: LucentFeature): LucentFeature => ({ ...item, badge: null, image: null })
    const [a, b, c, d] = SUBSCRR_LUCENT.features.items
    const bare: LucentContent = {
      ...SUBSCRR_LUCENT,
      hero: { ...SUBSCRR_LUCENT.hero, image: null },
      features: { items: [plain(a), plain(b), plain(c), plain(d)] },
      pricing: null,
      journal: {
        ...SUBSCRR_LUCENT.journal,
        form: { ...SUBSCRR_LUCENT.journal.form, email: null },
      },
      footer: { ...SUBSCRR_LUCENT.footer, links: [], contact: null, social: null },
    }
    expect(lucentViolations(bare)).toEqual([])
  })

  it('names the slot and the path of a text outside its limits', () => {
    const long = {
      ...SUBSCRR_LUCENT,
      hero: { ...SUBSCRR_LUCENT.hero, lead: 'x'.repeat(151) },
    }
    expect(lucentViolations(long)).toEqual([{ slot: 'hero.lead', length: 151, min: 60, max: 150 }])
  })

  it('names the line of a heading outside its limits', () => {
    const long = {
      ...SUBSCRR_LUCENT,
      breakdown: {
        ...SUBSCRR_LUCENT.breakdown,
        heading: ['Per year.', 'Per month and per year.', 'Per day.'] as const,
      },
    }
    expect(lucentViolations(long)).toEqual([
      { slot: 'breakdown.heading[1]', length: 23, min: 4, max: 15 },
    ])
  })

  it('reports a list the layout has no room for', () => {
    const question = SUBSCRR_LUCENT.faq.items[0]
    if (question === undefined) throw new Error('The example has questions')
    const tall = {
      ...SUBSCRR_LUCENT,
      faq: { ...SUBSCRR_LUCENT.faq, items: Array.from({ length: 6 }, () => question) },
    }
    expect(lucentViolations(tall)).toEqual([{ slot: 'faq.items', length: 6, min: 3, max: 5 }])
  })

  it('declares each contrast pair once, over known tokens', () => {
    const keys = LUCENT_CONTRAST_PAIRS.map((pair) => `${pair.text}/${pair.background}`)
    expect(new Set(keys).size).toBe(keys.length)
    for (const pair of LUCENT_CONTRAST_PAIRS) {
      expect(TOKEN_NAMES).toContain(pair.text)
      expect(TOKEN_NAMES).toContain(pair.background)
    }
  })
})

describe('the statement words', () => {
  it('marks the words inside each phrase, where it first appears as written', () => {
    const words = wordsOf(SUBSCRR_LUCENT.manifesto.text, SUBSCRR_LUCENT.manifesto.emphasis)
    expect(words.filter((word) => word.em).map((word) => word.text)).toEqual([
      'Roughly',
      'one',
      'honest',
      'number',
    ])
    // The lower-case "roughly" earlier in the statement is not the phrase as written.
    expect(words.find((word) => word.text === 'roughly')?.em).toBe(false)
  })

  it('colours nothing for a phrase that is not there, or none at all', () => {
    expect(wordsOf('Plain words only.', ['missing', '']).some((word) => word.em)).toBe(false)
  })
})
