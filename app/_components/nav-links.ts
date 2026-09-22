import type { Route } from 'next'
import { CONFIG } from '@/lib/config'
import { SITE } from '@/lib/site'

export type NavLink = Readonly<{ label: string; href: Route }>

// One list feeds the desktop nav and the mobile panel. Every label names a part of the finished
// site or what it costs, in the page's own order, so the nav reads as the page does; About moved
// to the footer to keep the row to four and the CTA dominant.
export const NAV_LINKS: readonly NavLink[] = [
  { label: 'Work', href: '/#work' },
  { label: 'What you get', href: '/#included' },
  { label: 'The build', href: '/#real-build' },
  { label: 'FAQ', href: '/#faq' },
]

// Primary action: the five questions on their own page.
export const CTA: NavLink = { label: 'Show me my three designs', href: '/start' }

// Secondary action, always the same one.
export const BOOK_CALL: NavLink = {
  label: `Book a ${String(CONFIG.call.minutes)}-minute call`,
  href: SITE.bookingUrl,
}
