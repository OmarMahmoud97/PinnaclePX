import { firstNameFrom } from '@/lib/brief/names'
import { CONFIG } from '@/lib/config'
import { type EmailMessage, escapeHtml } from '@/lib/email/message'
import { SITE } from '@/lib/site'

type Input = Readonly<{
  name: string
  company: string
  // The absolute address of the visitor's page, and of the booking page.
  previewUrl: string
  bookingUrl: string
  conceptCount: number
}>

// The one email the product sends: the link, how long it lasts, and the call. Plain words, no
// images, no tracking, a text part for every client. Nothing in it the visitor did not give us.
export function previewLinkEmail(input: Input): EmailMessage {
  const first = firstNameFrom(input.name)
  const greeting = first === '' ? 'Hello' : `Hello ${first}`
  const noun = input.conceptCount === 1 ? 'design' : 'designs'
  const subject = `Your homepage ${noun} for ${input.company}`
  const lines = [
    `${greeting},`,
    '',
    `Your homepage ${noun} for ${input.company} ${input.conceptCount === 1 ? 'is' : 'are'} ready:`,
    input.previewUrl,
    '',
    `The link stays live for ${String(CONFIG.retention.days)} days. Forward it to anyone you like.`,
    '',
    `If you would like to talk it through, book a ${String(CONFIG.call.minutes)}-minute call:`,
    input.bookingUrl,
    '',
    SITE.callPromise,
    '',
    SITE.name,
  ]
  const text = lines.join('\n')
  const html = [
    `<p>${escapeHtml(greeting)},</p>`,
    `<p>Your homepage ${noun} for ${escapeHtml(input.company)} ${input.conceptCount === 1 ? 'is' : 'are'} ready:<br><a href="${escapeHtml(input.previewUrl)}">${escapeHtml(input.previewUrl)}</a></p>`,
    `<p>The link stays live for ${String(CONFIG.retention.days)} days. Forward it to anyone you like.</p>`,
    `<p>If you would like to talk it through, <a href="${escapeHtml(input.bookingUrl)}">book a ${String(CONFIG.call.minutes)}-minute call</a>. ${escapeHtml(SITE.callPromise)}</p>`,
    `<p>${escapeHtml(SITE.name)}</p>`,
  ].join('\n')
  return { subject, text, html }
}
