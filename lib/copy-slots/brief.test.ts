import { briefSchema, fallbackBrief, sentencesOf } from '@/lib/copy-slots/brief'

const SENTENCE =
  'Physiotherapy clinic in Sheffield. Sports injuries, post-op rehab and same-week appointments.'

describe('sentencesOf', () => {
  it('splits on sentence ends and keeps the punctuation', () => {
    expect(sentencesOf(SENTENCE)).toEqual([
      'Physiotherapy clinic in Sheffield.',
      'Sports injuries, post-op rehab and same-week appointments.',
    ])
  })

  it('treats a sentence without a full stop as one sentence', () => {
    expect(sentencesOf('  we sell   bikes ')).toEqual(['we sell bikes'])
  })
})

describe('fallbackBrief', () => {
  const brief = fallbackBrief(' Ashgrove  Physio ', SENTENCE)

  it('is a valid brief', () => {
    expect(briefSchema.safeParse(brief).success).toBe(true)
  })

  it("uses the visitor's own words and the company name", () => {
    expect(brief.company).toBe('Ashgrove Physio')
    expect(brief.positioning).toBe('Physiotherapy clinic in Sheffield.')
    expect(brief.headlines[0]).toBe('Physiotherapy clinic in Sheffield.')
    expect(brief.statement).toBe(SENTENCE)
    expect(brief.valueProps[0]?.body).toBe(
      'Sports injuries, post-op rehab and same-week appointments.',
    )
  })

  it('fills three value props and three steps even from one sentence', () => {
    const short = fallbackBrief('Kestrel', 'Job scheduling for trades businesses.')
    expect(short.valueProps).toHaveLength(3)
    expect(short.steps).toHaveLength(3)
    for (const prop of short.valueProps) expect(prop.body.length).toBeGreaterThan(0)
  })

  it('invents no numbers', () => {
    expect(JSON.stringify(brief)).not.toMatch(/\d/)
  })
})
