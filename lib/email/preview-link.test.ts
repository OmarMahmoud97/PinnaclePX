import { escapeHtml } from '@/lib/email/message'
import { previewLinkEmail } from '@/lib/email/preview-link'
import { PRICE, SITE } from '@/lib/site'

const INPUT = {
  name: 'sam jones',
  company: 'Ashgrove <Physio>',
  previewUrl: 'https://pinnaclepx.example/preview/abcdefghjkmn',
  bookingUrl: 'https://cal.com/pinnaclepx/quick-chat',
  conceptCount: 3,
  partial: false,
}

// The link as the email carries it, so a visit from the email can be told from any other.
const TRACKED =
  'https://pinnaclepx.example/preview/abcdefghjkmn?utm_source=email&utm_medium=preview-link&utm_campaign=designs'

describe('previewLinkEmail', () => {
  const email = previewLinkEmail(INPUT)

  it('greets by first name and says the designs are ready', () => {
    expect(email.subject).toBe('Sam, your homepage designs are ready')
    expect(email.text).toContain('Hello Sam,')
    expect(email.text).toContain(
      'Three homepage designs for Ashgrove <Physio>, built from your five answers.',
    )
  })

  it('carries the tracked link, how long it lasts and the call', () => {
    expect(email.text).toContain(`Open them here: ${TRACKED}`)
    expect(email.text).toContain('Each stays live for 30 days.')
    expect(email.text).toContain(`Like one? Book a 20-minute call: ${INPUT.bookingUrl}`)
    expect(email.html).toContain(`<a href="${escapeHtml(TRACKED)}">`)
  })

  // The price the page prints, above the call, so nobody books surprised; the promise that the
  // call is no pitch follows it.
  it('carries the rate card above the call and the call promise after it', () => {
    expect(email.text).toContain(PRICE.scope)
    expect(email.text.indexOf(PRICE.scope)).toBeLessThan(email.text.indexOf(INPUT.bookingUrl))
    expect(email.text.indexOf(SITE.callPromise)).toBeGreaterThan(
      email.text.indexOf(INPUT.bookingUrl),
    )
    expect(email.html).toContain(escapeHtml(PRICE.scope))
    expect(email.html).toContain(escapeHtml(SITE.callPromise))
  })

  it('escapes the company name in the HTML', () => {
    expect(email.html).toContain('Ashgrove &#60;Physio&#62;')
    expect(email.html).not.toContain('<Physio>')
  })

  it('counts the designs the build made, and speaks of one in the singular', () => {
    const two = previewLinkEmail({ ...INPUT, conceptCount: 2 })
    expect(two.text).toContain('Two homepage designs for')
    const one = previewLinkEmail({ ...INPUT, conceptCount: 1 })
    expect(one.subject).toBe('Sam, your homepage design is ready')
    expect(one.text).toContain('One homepage design for')
    expect(one.text).toContain('Open it here:')
    expect(one.text).toContain('It stays live for 30 days.')
    expect(one.text).toContain('Like it? Book a 20-minute call:')
  })

  it('greets plainly without a name', () => {
    const nameless = previewLinkEmail({ ...INPUT, name: '' })
    expect(nameless.subject).toBe('Your homepage designs are ready')
    expect(nameless.text).toContain('Hello,')
  })

  // A build the sweeper finished with a fallback is still sent (ADR 0015 D5, as amended by the
  // plan's OD9a), and says so, in the words the done page uses.
  it('says when a few parts were set simply to finish on time', () => {
    expect(email.text).not.toContain(SITE.partialNote)
    const partial = previewLinkEmail({ ...INPUT, partial: true })
    expect(partial.text).toContain(SITE.partialNote)
    expect(partial.html).toContain(escapeHtml(SITE.partialNote))
  })
})
