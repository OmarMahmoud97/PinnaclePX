import { BOOK_CALL, type NavLink } from '@/app/_components/nav-links'

export type FooterGroup = Readonly<{ heading: string; links: readonly NavLink[] }>

// Only destinations that exist. The privacy notice joins the Studio group once it is written.
export const FOOTER_GROUPS: readonly FooterGroup[] = [
  {
    heading: 'The five questions',
    links: [
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'Straight answers', href: '/#straight-answers' },
      { label: 'FAQ', href: '/#faq' },
    ],
  },
  {
    heading: 'Studio',
    links: [
      { label: 'About', href: '/#about' },
      { label: 'What an hour does', href: '/#taster' },
      BOOK_CALL,
    ],
  },
]
