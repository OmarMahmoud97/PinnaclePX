import { BOOK_CALL, type NavLink } from '@/app/_components/nav-links'

type FooterGroup = Readonly<{ heading: string; links: readonly NavLink[] }>

// Only destinations that exist. "Builder or studio?" names the comparison's job, which a label
// like "Your options" would not.
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
      { label: 'The real build', href: '/#real-build' },
      { label: 'Builder or studio?', href: '/#your-options' },
      { label: 'Privacy', href: '/privacy' },
      BOOK_CALL,
    ],
  },
]
