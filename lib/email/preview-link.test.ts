import { previewLinkEmail } from '@/lib/email/preview-link'

const INPUT = {
  name: 'sam jones',
  company: 'Ashgrove <Physio>',
  previewUrl: 'https://pinnaclepx.example/preview/abcdefghjkmn',
  bookingUrl: 'https://cal.com/pinnaclepx/quick-chat',
  conceptCount: 1,
}

describe('previewLinkEmail', () => {
  const email = previewLinkEmail(INPUT)

  it('greets by first name and carries the link, the retention and the call', () => {
    expect(email.subject).toBe('Your homepage design for Ashgrove <Physio>')
    expect(email.text).toContain('Hello Sam,')
    expect(email.text).toContain(INPUT.previewUrl)
    expect(email.text).toContain('stays live for 30 days')
    expect(email.text).toContain(INPUT.bookingUrl)
  })

  it('escapes the company name in the HTML and links the URLs', () => {
    expect(email.html).toContain('Ashgrove &#60;Physio&#62;')
    expect(email.html).not.toContain('<Physio>')
    expect(email.html).toContain(`<a href="${INPUT.previewUrl}">`)
  })

  it('speaks in the plural for several designs and greets plainly without a name', () => {
    const several = previewLinkEmail({ ...INPUT, name: '', conceptCount: 3 })
    expect(several.subject).toBe('Your homepage designs for Ashgrove <Physio>')
    expect(several.text).toContain('Hello,')
    expect(several.text).toContain('designs for Ashgrove <Physio> are ready')
  })
})
