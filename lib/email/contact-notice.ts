import { oneLine, subjectLine } from '@/lib/contact/subject'
import { type EmailMessage, escapeHtml } from '@/lib/email/message'
import { SITE } from '@/lib/site'

type Input = Readonly<{ name: string; email: string; message: string }>

type Line = Readonly<{ label: string; value: string; url?: string }>

const REPLY = 'Reply to this email to answer: it goes to the address above.'

// A message from /contact as the owner reads it (ADR 0040): the subject the visitor saw on the
// page, who wrote, then their words as sent, line breaks kept. Sent to the owner alone, so the
// visitor's details appear here in full; the log still never carries them. The name is made one
// line, as the subject's is, so it cannot add a line of its own to the email or reorder the row.
// A reply goes to the visitor, not to the sender. Nothing in it reads a clock: the email's own
// date says when it came, and the same message always makes the same email.
export function contactNoticeEmail(input: Input): EmailMessage {
  const subject = subjectLine(input.name)
  const email = input.email.trim()
  const message = input.message.trim()
  const from: readonly Line[] = [
    { label: 'Name', value: oneLine(input.name) },
    { label: 'Email', value: email, url: `mailto:${email}` },
  ]

  const text = [
    `${subject}.`,
    '',
    'From',
    ...from.map((line) =>
      line.url === undefined
        ? `${line.label}: ${line.value}`
        : `${line.label}: ${line.value} (${line.url})`,
    ),
    '',
    'Message',
    message,
    '',
    REPLY,
    '',
    SITE.name,
  ].join('\n')

  const cell = (line: Line) => {
    const value = escapeHtml(line.value)
    return line.url === undefined ? value : `<a href="${escapeHtml(line.url)}">${value}</a>`
  }
  const html = [
    `<p>${escapeHtml(subject)}.</p>`,
    `<h2>From</h2>\n<table>\n${from
      .map(
        (line) => `<tr><th align="left">${escapeHtml(line.label)}</th><td>${cell(line)}</td></tr>`,
      )
      .join('\n')}\n</table>`,
    `<h2>Message</h2>\n<p>${escapeHtml(message).replace(/\r\n?|\n/g, '<br>')}</p>`,
    `<p>${escapeHtml(REPLY)}</p>`,
    `<p>${escapeHtml(SITE.name)}</p>`,
  ].join('\n')

  return { subject, text, html, replyTo: email }
}
