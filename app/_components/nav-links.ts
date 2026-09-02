import type { Route } from 'next'

export type NavLink = Readonly<{ label: string; href: Route }>

// One list feeds the desktop nav and the mobile panel.
export const NAV_LINKS: readonly NavLink[] = [
  { label: 'Product', href: '/#demo' },
  { label: 'Customers', href: '/#customers' },
]

// Points at the demo until the brief route exists.
export const CTA: NavLink = { label: 'Start your brief', href: '/#demo' }
