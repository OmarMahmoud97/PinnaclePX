import { collapse, fitToSlot } from '@/lib/copy-slots/fit'

const FILLERS = ['Get in touch to find out more.', 'Everything starts with a conversation.']

describe('collapse', () => {
  it('trims and folds whitespace to single spaces', () => {
    expect(collapse('  Two   words\n here ')).toBe('Two words here')
  })
})

describe('fitToSlot', () => {
  it('returns text already in range unchanged', () => {
    expect(fitToSlot('Every job, every van, one calendar.', { min: 18, max: 60 }, FILLERS)).toBe(
      'Every job, every van, one calendar.',
    )
  })

  it('shortens at the last sentence end that still meets the minimum', () => {
    const text =
      'We fix boilers. We fit bathrooms. We also do a lot of other things around the house.'
    expect(fitToSlot(text, { min: 20, max: 40 }, FILLERS)).toBe('We fix boilers. We fit bathrooms.')
  })

  it('falls back to a word boundary and drops a trailing comma', () => {
    const text = 'Physiotherapy clinic in Sheffield, sports injuries, post-op rehab'
    expect(fitToSlot(text, { min: 10, max: 34 }, FILLERS)).toBe('Physiotherapy clinic in Sheffield')
  })

  it('hard cuts a single word longer than the slot', () => {
    expect(fitToSlot('Supercalifragilistic', { min: 1, max: 5 }, FILLERS)).toBe('Super')
  })

  it('appends fillers in order until the minimum is reached', () => {
    expect(fitToSlot('We fix boilers.', { min: 40, max: 120 }, FILLERS)).toBe(
      'We fix boilers. Get in touch to find out more.',
    )
    expect(fitToSlot('', { min: 60, max: 120 }, FILLERS)).toBe(
      'Get in touch to find out more. Everything starts with a conversation.',
    )
  })

  it('shortens again when a filler overshoots the maximum', () => {
    expect(fitToSlot('We fix boilers.', { min: 20, max: 30 }, FILLERS)).toBe(
      'We fix boilers. Get in touch',
    )
  })

  it('throws when the fillers cannot reach the minimum', () => {
    expect(() => fitToSlot('', { min: 200, max: 220 }, FILLERS)).toThrow(/Cannot fit/)
  })
})

// A cut text ends where a phrase ends, never on a joining word (docs/template-fit-decisions.md,
// decision 18). Six templates' hero headline slot is 18 to 60 characters.
describe('fitToSlot, where a cut ends', () => {
  const HEADLINE = { min: 18, max: 60 }

  it('ends the gardens fixture before its dangling "for"', () => {
    const first =
      'Garden design, planting plans and ongoing maintenance for homes in Harrogate and Knaresborough.'
    expect(fitToSlot(first, HEADLINE, FILLERS)).toBe(
      'Garden design, planting plans and ongoing maintenance',
    )
  })

  it('ends the dentist fixture at its comma, not on "the"', () => {
    const first =
      'Rated 4.9 on Google by over 300 patients, we have been the number one family dentist in Harrogate since 1998.'
    expect(fitToSlot(first, HEADLINE, FILLERS)).toBe('Rated 4.9 on Google by over 300 patients')
  })

  it('prefers a sentence end to a later colon', () => {
    const text = 'We fix boilers and radiators. Services: plumbing, heating and more besides.'
    expect(fitToSlot(text, { min: 18, max: 50 }, FILLERS)).toBe('We fix boilers and radiators.')
  })

  it('does not take the point in a number for a sentence end', () => {
    const text = 'Rated 4.9 on Google by over 300 patients'
    expect(fitToSlot(text, { min: 5, max: 8 }, FILLERS)).toBe('Rated')
  })

  it('ends just before a colon', () => {
    const text =
      'Domestic electrician covering York and Selby: rewires, consumer units, EV chargers and fault finding.'
    expect(fitToSlot(text, HEADLINE, FILLERS)).toBe('Domestic electrician covering York and Selby')
  })

  it('ends just before a semicolon', () => {
    const text = 'Wedding flowers and bouquets; weekly arrangements for offices across north Leeds.'
    expect(fitToSlot(text, { min: 18, max: 40 }, FILLERS)).toBe('Wedding flowers and bouquets')
  })

  it('takes a clause whose colon or comma falls just past the slot, since the mark goes', () => {
    // Each clause is exactly the slot's maximum: Meridian's badge (10 to 44) with the electrician
    // fixture, and a comma one character past a 26-character slot.
    const colon =
      'Domestic electrician covering York and Selby: rewires, consumer units, EV chargers and fault finding.'
    expect(fitToSlot(colon, { min: 10, max: 44 }, FILLERS)).toBe(
      'Domestic electrician covering York and Selby',
    )
    const comma = 'Garden design and planting, maintenance for homes in Leeds'
    expect(fitToSlot(comma, { min: 10, max: 26 }, FILLERS)).toBe('Garden design and planting')
  })

  it('passes over a clause that would leave brackets or a quotation open', () => {
    const brackets =
      'Domestic plumbing and heating (gas, oil and LPG boilers) for homes across Leeds'
    expect(fitToSlot(brackets, HEADLINE, FILLERS)).toBe(
      'Domestic plumbing and heating (gas, oil and LPG boilers)',
    )
    // The apostrophe in "We're" neither opens nor closes the quotation.
    const quote = "We're known for our 'fair price, no fuss' promise across Leeds and Bradford"
    expect(fitToSlot(quote, { min: 10, max: 50 }, FILLERS)).toBe(
      "We're known for our 'fair price, no fuss' promise",
    )
    const curly = 'Known for our “fair price, no fuss” promise across Leeds and Bradford'
    expect(fitToSlot(curly, { min: 10, max: 40 }, FILLERS)).toBe(
      'Known for our “fair price, no fuss”',
    )
  })

  it('ends at a comma, which goes, passing over one that follows a joining word', () => {
    const range = { min: 5, max: 40 }
    const text = 'Cakes, tarts and, on Sundays only, pies baked fresh every single morning'
    expect(fitToSlot(text, range, FILLERS)).toBe('Cakes, tarts and, on Sundays only')
    expect(fitToSlot('Cakes, tarts and, pies baked fresh every morning', range, FILLERS)).toBe(
      'Cakes',
    )
  })

  it('drops every joining word left at a word boundary', () => {
    const first =
      'Wedding and family photography across Northumberland in a relaxed documentary style with no forced poses.'
    expect(fitToSlot(first, HEADLINE, FILLERS)).toBe(
      'Wedding and family photography across Northumberland',
    )
  })

  it('counts an ending only while the minimum holds', () => {
    // The comma would leave "Boilers", under the minimum, so the cut falls at a word boundary.
    const text = 'Boilers, radiators and hot water cylinders for homes in Leeds'
    expect(fitToSlot(text, { min: 18, max: 40 }, FILLERS)).toBe('Boilers, radiators and hot water')
  })

  it('keeps the cut at the word boundary when no ending leaves the minimum', () => {
    // Without "to" the line would be 13 characters, under the slot's 16.
    const text = 'Ready to talk to AshgrovePhysiotherapyAndSportsInjuryClinicsSheffieldAndLeeds?'
    expect(fitToSlot(text, { min: 16, max: 50 }, FILLERS)).toBe('Ready to talk to')
  })
})

// The wordmark (2 to 24 characters) and the legal name (2 to 60) are cut from the company name
// by the same rule, at the lengths around the legal name's limit and the form's own.
describe('fitToSlot, a company name', () => {
  const NAME = { min: 2, max: 24 }
  const LEGAL = { min: 2, max: 60 }
  const LTD = ['Ltd']

  it.each([
    ['Muddy Paws', 'Muddy Paws', 'Muddy Paws'],
    [
      'Hollin Lane Joinery and Fitted Furniture of Leeds and Otley',
      'Hollin Lane Joinery',
      'Hollin Lane Joinery and Fitted Furniture of Leeds and Otley',
    ],
    [
      'Hollin Lane Joinery and Fitted Furniture for Leeds and Otley',
      'Hollin Lane Joinery',
      'Hollin Lane Joinery and Fitted Furniture for Leeds and Otley',
    ],
    [
      'Hollin Lane Joinery and Fitted Furniture for Leeds and Ilkley',
      'Hollin Lane Joinery',
      'Hollin Lane Joinery and Fitted Furniture for Leeds',
    ],
    // The longest name the schema takes (lib/preview/example.ts, EDGE_COMPANIES.longest).
    [
      'Ashgrove Physio and Sport Clinic for all the Runners, Riders and Walkers of Hull',
      'Ashgrove Physio',
      'Ashgrove Physio and Sport Clinic for all the Runners',
    ],
  ])('cuts "%s" to "%s" and "%s"', (company, name, legalName) => {
    expect([10, 59, 60, 61, 80]).toContain(company.length)
    expect(fitToSlot(company, NAME, LTD)).toBe(name)
    expect(fitToSlot(company, LEGAL, LTD)).toBe(legalName)
  })
})
