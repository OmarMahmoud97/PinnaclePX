import type { Route } from 'next'
import { CONFIG } from '@/lib/config'
import { SITE } from '@/lib/site'

export type NavLink = Readonly<{ label: string; href: Route }>

// One list feeds the desktop nav and the mobile panel.
export const NAV_LINKS: readonly NavLink[] = [
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'About', href: '/#about' },
  { label: 'FAQ', href: '/#faq' },
]

// Primary action: the five questions on their own page.
export const CTA: NavLink = { label: 'Show me my three designs', href: '/start' }

// Secondary action, always the same one.
export const BOOK_CALL: NavLink = {
  label: `Book a ${String(CONFIG.call.minutes)}-minute call`,
  href: SITE.bookingUrl,
}
