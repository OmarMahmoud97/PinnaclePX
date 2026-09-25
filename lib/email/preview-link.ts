import { firstNameFrom } from '@/lib/brief/names'
import { CONFIG } from '@/lib/config'
import { type EmailMessage, escapeHtml } from '@/lib/email/message'
import { capitalise, numberWord, PRICE, SITE } from '@/lib/site'

type Input = Readonly<{
  name: string
  company: string
  // The absolute address of the visitor's page, and of the booking page.
  previewUrl: string
  bookingUrl: string
  conceptCount: number
  // The deadline sweeper finished a stage with its fallback. The email still goes, and says so
  // (ADR 0015 D5, amended by docs/start-page-journey-plan.md, OD9a).
  partial: boolean
}>

// A visit from this email is told from any other by these, and by nothing about the visitor.
const UTM = { utm_source: 'email', utm_medium: 'preview-link', utm_campaign: 'designs' }

function tracked(url: string): string {
  const link = new URL(url)
  for (const [key, value] of Object.entries(UTM)) link.searchParams.set(key, value)
  return link.toString()
}

// The one email the product sends a visitor: that the designs are ready, the link, how long it
// lasts, the price of the real site, and the call with its promise (plan 8.3). Plain words, no
// images, no tracking beyond the link's campaign tags, a text part for every client. Nothing in
// it the visitor did not give us; every count follows the designs the build made, and the price
// is the same sentence the page prints.
export function previewLinkEmail(input: Input): EmailMessage {
  const first = firstNameFrom(input.name)
  const one = input.conceptCount === 1
  const noun = one ? 'design' : 'designs'
  const link = tracked(input.previewUrl)
  const minutes = String(CONFIG.call.minutes)

  const subject = `${first === '' ? 'Your' : `${first}, your`} homepage ${noun} ${one ? 'is' : 'are'} ready`
  const greeting = first === '' ? 'Hello,' : `Hello ${first},`
  const made = `${capitalise(numberWord(input.conceptCount))} homepage ${noun} for ${input.company}, built from your five answers.`
  const open = `Open ${one ? 'it' : 'them'} here:`
  const stay = `${one ? 'It stays' : 'Each stays'} live for ${String(CONFIG.retention.days)} days. Forward the link to anyone you like.`
  const call = `Like ${one ? 'it' : 'one'}? Book a ${minutes}-minute call:`
  const partial = input.partial ? [SITE.partialNote] : []

  const text = [
    greeting,
    '',
    made,
    `${open} ${link}`,
    '',
    stay,
    ...partial,
    '',
    `${PRICE.taster} ${PRICE.build}`,
    `${PRICE.scope} ${PRICE.basis}`,
    '',
    `${call} ${input.bookingUrl}`,
    SITE.callPromise,
    '',
    SITE.name,
  ].join('\n')

  const html = [
    `<p>${escapeHtml(greeting)}</p>`,
    `<p>${escapeHtml(made)}<br>${escapeHtml(open)} <a href="${escapeHtml(link)}">${escapeHtml(input.previewUrl)}</a></p>`,
    `<p>${[stay, ...partial].map(escapeHtml).join('<br>')}</p>`,
    `<p>${escapeHtml(PRICE.taster)} ${escapeHtml(PRICE.build)}<br>${escapeHtml(PRICE.scope)} ${escapeHtml(PRICE.basis)}</p>`,
    `<p>${escapeHtml(call)} <a href="${escapeHtml(input.bookingUrl)}">${escapeHtml(input.bookingUrl)}</a><br>${escapeHtml(SITE.callPromise)}</p>`,
    `<p>${escapeHtml(SITE.name)}</p>`,
  ].join('\n')
  return { subject, text, html }
}
