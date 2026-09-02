import type { NavLink } from '@/app/_components/nav-links'

export type FooterGroup = Readonly<{ heading: string; links: readonly NavLink[] }>

// Only destinations that exist. Add groups as pages land.
export const FOOTER_GROUPS: readonly FooterGroup[] = [
  {
    heading: 'Product',
    links: [
      { label: 'Demo', href: '/#demo' },
      { label: 'How it works', href: '/#workflow' },
      { label: 'Pricing', href: '/#pricing' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'FAQ', href: '/#faq' },
      { label: 'Customers', href: '/#customers' },
      { label: 'GitHub', href: 'https://github.com/OmarMahmoud97/PinnaclePX' },
    ],
  },
]
