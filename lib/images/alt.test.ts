import type { SubmissionAnswers } from '@/lib/brief/submission'
import { CONFIG } from '@/lib/config'
import { fallbackBrief } from '@/lib/copy-slots/brief'
import { givenWords, stockAlt } from '@/lib/images/alt'

const ANSWERS: SubmissionAnswers = {
  description:
    'Independent café on the canal in Hebden Bridge. Breakfasts, sourdough toasties and cakes baked here each morning.',
  company: 'Bramble and Bean',
  logo: { kind: 'wordmark' },
  imagery: { style: 'warm', photos: [] },
  colours: { kind: 'palette', paletteId: 'clay' },
}
const BRIEF = {
  ...fallbackBrief(ANSWERS.company, ANSWERS.description),
  audience: 'Walkers on the Calder Valley towpath',
  valueProps: [
    { title: 'Baked here', body: 'Every loaf comes out of our own oven in West Yorkshire.' },
  ],
}
const GIVEN = givenWords(ANSWERS, BRIEF)

describe('stockAlt', () => {
  it("keeps Pexels' words when they name nothing", () => {
    expect(stockAlt('A barista pouring milk into a flat white', GIVEN)).toBe(
      'A barista pouring milk into a flat white',
    )
  })

  it('drops an alt that names a place the visitor never gave', () => {
    expect(
      stockAlt('Charming lakeside restaurant interior in Trakai with warm lighting', GIVEN),
    ).toBe('')
    expect(stockAlt('Colorful flowers in vases at a Tokyo market', GIVEN)).toBe('')
  })

  it('keeps a name the sentence, the company name or the brief gave, in any case', () => {
    expect(stockAlt('Narrowboats moored in Hebden Bridge at dawn', GIVEN)).toBe(
      'Narrowboats moored in Hebden Bridge at dawn',
    )
    expect(stockAlt("A walk along Hebden Bridge's canal", GIVEN)).toBe(
      "A walk along Hebden Bridge's canal",
    )
    expect(stockAlt('Cake on a plate at Bramble and Bean', GIVEN)).toBe(
      'Cake on a plate at Bramble and Bean',
    )
    // Only the brief names the valley and the county.
    expect(stockAlt('A towpath in the Calder Valley, West Yorkshire', GIVEN)).toBe(
      'A towpath in the Calder Valley, West Yorkshire',
    )
    expect(stockAlt('Rain on a CAFÉ window', GIVEN)).toBe('Rain on a CAFÉ window')
  })

  it('lets the first word of each sentence and the word I be capitalised', () => {
    expect(stockAlt('Fresh loaves on a shelf. Steam rises from a cup.', GIVEN)).toBe(
      'Fresh loaves on a shelf. Steam rises from a cup.',
    )
    expect(stockAlt("Coffee the way I like it, and I'm not sharing", GIVEN)).toBe(
      "Coffee the way I like it, and I'm not sharing",
    )
    expect(stockAlt('Is it raining? Rain on a café window!', GIVEN)).toBe(
      'Is it raining? Rain on a café window!',
    )
  })

  it("reads the word after an abbreviation's dot as a name, not a sentence's first word", () => {
    expect(stockAlt('St. Ives harbour at dusk', GIVEN)).toBe('')
    expect(stockAlt('Mt. Fuji behind a tea house', GIVEN)).toBe('')
    expect(stockAlt('Dr. Smith in his surgery', GIVEN)).toBe('')
    expect(stockAlt('J. Smith at his desk', GIVEN)).toBe('')
    expect(stockAlt('Cakes on a stand, e.g. Victoria sponge', GIVEN)).toBe('')
  })

  it('keeps a name after an abbreviation when the visitor gave it', () => {
    const stIves = givenWords(
      { ...ANSWERS, description: 'Gift shop in St Ives, open all year.' },
      BRIEF,
    )
    expect(stockAlt('St. Ives harbour at dusk', stIves)).toBe('St. Ives harbour at dusk')
  })

  it('reads every other capitalised word as a name, so a breed or an acronym costs the alt', () => {
    expect(stockAlt('A Cocker Spaniel being groomed indoors', GIVEN)).toBe('')
    expect(stockAlt('A laptop showing a map of the UK', GIVEN)).toBe('')
  })

  it('drops an alt with a digit in it, in any script', () => {
    expect(stockAlt('Two cups of coffee on table 4', GIVEN)).toBe('')
    // An Arabic-Indic three.
    expect(stockAlt('Coffee at table ٣', GIVEN)).toBe('')
  })

  it('drops an alt longer than the limit, and keeps one at it', () => {
    const at = `A ${'very '.repeat(30)}long caption`.slice(0, CONFIG.images.altMaxChars)
    expect(at).toHaveLength(CONFIG.images.altMaxChars)
    expect(stockAlt(at, GIVEN)).toBe(at)
    expect(stockAlt(`${at}s`, GIVEN)).toBe('')
  })

  it('tidies the spacing and leaves an empty alt empty', () => {
    expect(stockAlt('  A  slice of\ncake ', GIVEN)).toBe('A slice of cake')
    expect(stockAlt('', GIVEN)).toBe('')
  })
})

describe('givenWords', () => {
  it("holds the sentence's, the company name's and every brief field's words, lower-cased", () => {
    for (const word of ['hebden', 'bridge', 'bramble', 'bean', 'calder', 'yorkshire', 'oven']) {
      expect(GIVEN.has(word)).toBe(true)
    }
    expect(GIVEN.has('Hebden')).toBe(false)
    expect(GIVEN.has('trakai')).toBe(false)
  })
})
