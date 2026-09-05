import type { CONFIG } from '@/lib/config'

// What every hired build comes with, said once and where it sells: after the six sites, before
// the process. Each line is the owner's commitment or an existing register row
// (docs/claims-register.md, 5 September 2026), in the visitor's words; the terms a founder
// searches by (SEO, AEO, GEO, CMS, WCAG) appear once, in the caption. No load time is promised:
// the six live sites measured 27 to 64 on Lighthouse mobile
// (docs/research/home-page-content/client-site-speed.md), so the Fast cell states the process.
type IncludedItem = Readonly<{ title: string; body: string }>

export const INCLUDED = {
  heading: 'Everything your real site needs, built in.',
  lead: 'The three designs show the look. The real site is made by hand, with motion where it helps, and all of this comes as standard.',
  caption: 'If you know the terms: a custom CMS, SEO, AEO, GEO and WCAG.',
  ask: 'It starts with your three designs.',
  or: 'or',
} as const

// Hosting the studio watches is a monitoring promise, so it is sayable only once the care plan is
// recorded (content plan decision 10, CONFIG.care). Until then the eighth cell is the wording,
// which register row 26 already backs, and the grid stays eight either way.
export const STAYS_UP: IncludedItem = {
  title: 'Stays up',
  body: 'Hosted where we can watch it, so if it ever goes down we know before you do.',
}

const WRITTEN_FOR_YOU: IncludedItem = {
  title: 'Written for you',
  body: 'Every page written by a professional, from what you tell us on the call.',
}

export function includedItems(care: typeof CONFIG.care): readonly IncludedItem[] {
  return [
    {
      title: 'Yours to edit',
      body: 'Your own content system. Change words, prices and photos yourself, whenever you like.',
    },
    {
      title: 'SEO and AI visibility',
      body: 'Built so Google can show every page, and so the chat assistants people now ask can quote it.',
    },
    {
      title: 'Responsive design',
      body: 'Most of your customers will arrive on a phone. Every page is designed there first.',
    },
    {
      title: 'Works for everyone',
      body: 'Big text, a screen reader, an old phone: it works, to the WCAG accessibility standard.',
    },
    {
      title: 'Fast',
      body: 'Tested on a phone before launch. Anything slow is fixed before you see it.',
    },
    {
      title: 'Connected',
      body: 'Your bookings, payments, forms and the tools you already use, wired in and working.',
    },
    {
      title: 'Made for you',
      body: 'Designed by hand for your business, never from a template. It moves where motion helps.',
    },
    care === null ? WRITTEN_FOR_YOU : STAYS_UP,
  ]
}
