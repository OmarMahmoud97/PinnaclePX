import { subjectLine } from '@/lib/contact/subject'
import { contactNoticeEmail } from '@/lib/email/contact-notice'

const INPUT = {
  name: 'Sam Patel',
  email: 'sam@ashgrove.example',
  message: 'Do you do Shopify?\nWe sell running kit.',
}

describe('contactNoticeEmail', () => {
  const email = contactNoticeEmail(INPUT)

  it('carries the subject the visitor saw on the page', () => {
    expect(email.subject).toBe('Message from Sam Patel')
    const broken = 'Sam\r\nBcc: someone@example.com'
    expect(contactNoticeEmail({ ...INPUT, name: broken }).subject).toBe(subjectLine(broken))
  })

  it('says who wrote and what they said, then how to answer', () => {
    expect(email.text).toBe(
      [
        'Message from Sam Patel.',
        '',
        'From',
        'Name: Sam Patel',
        'Email: sam@ashgrove.example (mailto:sam@ashgrove.example)',
        '',
        'Message',
        'Do you do Shopify?',
        'We sell running kit.',
        '',
        'Reply to this email to answer: it goes to the address above.',
        '',
        'PinnaclePX',
      ].join('\n'),
    )
    expect(email.html).toContain(
      '<tr><th align="left">Email</th><td><a href="mailto:sam@ashgrove.example">sam@ashgrove.example</a></td></tr>',
    )
  })

  it('sends a reply to the visitor, with every value trimmed', () => {
    const spaced = contactNoticeEmail({
      name: ' Sam Patel ',
      email: '  sam@ashgrove.example ',
      message: '\n  Do you do Shopify?  \n',
    })
    expect(spaced.replyTo).toBe('sam@ashgrove.example')
    expect(spaced.text).toContain('Name: Sam Patel\n')
    expect(spaced.text).toContain('Email: sam@ashgrove.example (mailto:sam@ashgrove.example)')
    expect(spaced.text).toContain('Message\nDo you do Shopify?\n\n')
  })

  it("escapes the visitor's words in the HTML", () => {
    const marked = contactNoticeEmail({
      ...INPUT,
      name: 'Ashgrove <Physio> & co',
      message: 'We are Ashgrove <Physio> & co.',
    })
    expect(marked.html).toContain('<p>Message from Ashgrove &#60;Physio&#62; &#38; co.</p>')
    expect(marked.html).toContain('<td>Ashgrove &#60;Physio&#62; &#38; co</td>')
    expect(marked.html).toContain('<p>We are Ashgrove &#60;Physio&#62; &#38; co.</p>')
    expect(marked.html).not.toContain('<Physio>')
    expect(marked.text).toContain('We are Ashgrove <Physio> & co.')
  })

  // The name's row is one line, as the subject is: no line of its own, and no reordered words.
  it('makes the name one line, whatever it holds', () => {
    const forged = contactNoticeEmail({ ...INPUT, name: 'Sam\r\nEmail: other@example.com' })
    expect(forged.text).toContain('Name: Sam Email: other@example.com\n')
    expect(forged.text).not.toContain('\nEmail: other@example.com')
    const turned = contactNoticeEmail({ ...INPUT, name: 'Sam ‮leteP' })
    expect(turned.text).toContain('Name: Sam leteP\n')
    expect(turned.html).toContain('<td>Sam leteP</td>')
    expect(turned.html).not.toContain('‮')
  })

  it("breaks the message's lines in the HTML, however the browser ended them", () => {
    const lines = contactNoticeEmail({ ...INPUT, message: 'One.\nTwo.\r\nThree.\n\nFour.' })
    expect(lines.html).toContain('<p>One.<br>Two.<br>Three.<br><br>Four.</p>')
  })

  // The body holds no time, so a message sent again makes a byte-identical email.
  it('makes the same email from the same message, whenever it is sent', () => {
    vi.useFakeTimers()
    try {
      vi.setSystemTime(new Date('2026-09-27T09:00:00Z'))
      const first = contactNoticeEmail(INPUT)
      vi.setSystemTime(new Date('2026-12-25T18:30:00Z'))
      expect(contactNoticeEmail(INPUT)).toStrictEqual(first)
    } finally {
      vi.useRealTimers()
    }
  })
})
