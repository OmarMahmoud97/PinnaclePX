import { type ModelCallUsage, ownerNoticeEmail, summariseUsage } from '@/lib/email/owner-notice'

const call = (over: Partial<ModelCallUsage>): ModelCallUsage => ({
  stage: 'copy',
  model: 'claude-sonnet-5',
  inputTokens: 1000,
  outputTokens: 500,
  cacheReadTokens: 0,
  cacheWriteTokens: 0,
  ...over,
})

const CALLS = [
  call({ stage: 'brief', inputTokens: 1200, outputTokens: 800 }),
  call({ inputTokens: 2000, outputTokens: 1500 }),
  call({ inputTokens: 2500, outputTokens: 1000 }),
  call({ stage: 'rank', model: 'claude-haiku-4-5', inputTokens: 3000, outputTokens: 200 }),
]

const INPUT = {
  lead: { name: 'Sam Jones', email: 'sam@ashgrove.example', company: 'Ashgrove <Physio>' },
  answers: {
    description: 'A physio clinic in Leeds that gets people back to running & lifting.',
    company: 'Ashgrove <Physio>',
    logo: {
      kind: 'file' as const,
      fileName: 'ashgrove.svg',
      url: 'https://blob.example/logos/a.svg',
    },
    imagery: {
      style: 'warm' as const,
      photos: [{ fileName: 'clinic.jpg', url: 'https://blob.example/photos/c.jpg' }],
    },
    colours: { kind: 'custom' as const, hex: '#2f6f4e' },
  },
  slug: 'abcdefghjkmn',
  appUrl: 'https://pinnaclepx.example',
  status: 'ready' as const,
  fallbackStages: [],
  concepts: [{ templateId: 't01-aurora', name: 'Aurora' }],
  submittedAt: new Date('2026-09-04T13:05:00Z'),
  calls: CALLS,
}

describe('summariseUsage', () => {
  it('sums every kind of token and groups the calls by stage and model, in call order', () => {
    const usage = summariseUsage([
      ...CALLS,
      call({
        stage: 'rank',
        model: 'claude-haiku-4-5',
        cacheReadTokens: 400,
        cacheWriteTokens: 100,
      }),
    ])
    expect(usage.calls).toBe(5)
    expect(usage.input).toBe(9700)
    expect(usage.output).toBe(4000)
    expect(usage.cacheRead).toBe(400)
    expect(usage.cacheWrite).toBe(100)
    expect(usage.total).toBe(14200)
    expect(usage.byStage).toEqual([
      { stage: 'brief', model: 'claude-sonnet-5', calls: 1, input: 1200, output: 800 },
      { stage: 'copy', model: 'claude-sonnet-5', calls: 2, input: 4500, output: 2500 },
      { stage: 'rank', model: 'claude-haiku-4-5', calls: 2, input: 4500, output: 700 },
    ])
  })

  it('is empty for no calls', () => {
    expect(summariseUsage([])).toEqual({
      calls: 0,
      input: 0,
      cacheRead: 0,
      cacheWrite: 0,
      output: 0,
      total: 0,
      byStage: [],
    })
  })
})

describe('ownerNoticeEmail', () => {
  const email = ownerNoticeEmail(INPUT)

  it('names the company and carries the hub and every design link', () => {
    expect(email.subject).toBe('1 design built for Ashgrove <Physio>')
    expect(email.text).toContain('All designs: https://pinnaclepx.example/preview/abcdefghjkmn')
    expect(email.text).toContain(
      'Aurora: https://pinnaclepx.example/preview/abcdefghjkmn/t01-aurora',
    )
  })

  it('carries what the client filled in, with the uploads linked', () => {
    expect(email.text).toContain('Name: Sam Jones')
    expect(email.text).toContain('Email: sam@ashgrove.example')
    expect(email.text).toContain('About the business: A physio clinic in Leeds')
    expect(email.text).toContain('Logo: ashgrove.svg (https://blob.example/logos/a.svg)')
    expect(email.text).toContain('Colours: Their own colour, #2f6f4e')
    expect(email.text).toContain('Look: warm')
    expect(email.text).toContain('Photo 1: clinic.jpg (https://blob.example/photos/c.jpg)')
    expect(email.html).toContain('<a href="https://blob.example/logos/a.svg">ashgrove.svg</a>')
  })

  it('totals the tokens and breaks them down by stage, without cache lines when none was used', () => {
    expect(email.text).toContain('Total: 12,200 tokens over 4 calls')
    expect(email.text).toContain('Input: 8,700\n')
    expect(email.text).toContain('Output: 3,500')
    expect(email.text).toContain('brief (claude-sonnet-5): 1 call, 1,200 in, 800 out')
    expect(email.text).toContain('copy (claude-sonnet-5): 2 calls, 4,500 in, 2,500 out')
    expect(email.text).toContain('rank (claude-haiku-4-5): 1 call, 3,000 in, 200 out')
    expect(email.text).not.toContain('cache')
  })

  it('says how the build ended and when', () => {
    expect(email.text).toContain('Outcome: Ready: every stage finished.')
    expect(email.text).toContain('Submitted: 4 Sept 2026, 14:05 (London)')
  })

  it('escapes the client details in the HTML', () => {
    expect(email.html).toContain('Ashgrove &#60;Physio&#62;')
    expect(email.html).not.toContain('<Physio>')
    expect(email.html).toContain('running &#38; lifting')
  })

  it('marks a partial build, names the stages that fell back, and shows cache tokens when used', () => {
    const partial = ownerNoticeEmail({
      ...INPUT,
      status: 'partial',
      fallbackStages: ['brief', 'imagery'],
      concepts: [
        { templateId: 't01-aurora', name: 'Aurora' },
        { templateId: 't02-monolith', name: 'Monolith' },
      ],
      calls: [call({ cacheReadTokens: 400, cacheWriteTokens: 100 })],
      answers: {
        ...INPUT.answers,
        logo: { kind: 'wordmark' },
        colours: { kind: 'palette', paletteId: 'forest' },
        imagery: { style: 'minimal', photos: [] },
      },
    })
    expect(partial.subject).toBe('2 designs built for Ashgrove <Physio> (partial)')
    expect(partial.text).toContain('Partial: brief, imagery settled with the fallback.')
    expect(partial.text).toContain('Total: 2,000 tokens over 1 call')
    expect(partial.text).toContain(
      'Input: 1,500, of which 400 read from the cache and 100 written to it',
    )
    expect(partial.text).toContain('Logo: None uploaded; the name is set as a wordmark')
    expect(partial.text).toContain('Colours: The forest palette')
    expect(partial.text).toContain('Photos: None uploaded')
  })

  it('says so when no model call was recorded', () => {
    const none = ownerNoticeEmail({ ...INPUT, calls: [] })
    expect(none.text).toContain('Total: 0 tokens over 0 calls')
    expect(none.text).toContain('No model call was recorded')
  })
})
