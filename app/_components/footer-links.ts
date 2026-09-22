import { BOOK_CALL, type NavLink } from '@/app/_components/nav-links'

type FooterGroup = Readonly<{ heading: string; links: readonly NavLink[] }>

// Only destinations that exist. The groups are named for what the reader came for, the site and
// the studio behind it; no group is named after the free designs, which are one step on the way
// rather than the thing being sold.
export const FOOTER_GROUPS: readonly FooterGroup[] = [
  {
    heading: 'The site you get',
    links: [
      { label: 'What you get', href: '/#included' },
      { label: 'Our work', href: '/#work' },
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'The build', href: '/#real-build' },
      { label: 'Doing it yourself', href: '/#your-options' },
    ],
  },
  {
    heading: 'Studio',
    links: [
      { label: 'About', href: '/#about' },
      { label: 'Straight answers', href: '/#straight-answers' },
      { label: 'FAQ', href: '/#faq' },
      { label: 'Privacy', href: '/privacy' },
      BOOK_CALL,
    ],
  },
]
