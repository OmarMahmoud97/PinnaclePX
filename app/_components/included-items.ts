import type { CONFIG } from '@/lib/config'

// The band the page is about: the site a client pays for, in four jobs a website has to do, each
// with the two things built in that do it. It absorbs the old Outcomes rows (the four labels and
// their scenes) and the old Included cells, so one band answers "what would I actually get?"
// instead of two saying it twice (docs/adr/0033). Each line is the owner's commitment or an
// existing register row (docs/claims-register.md) in the visitor's words; the terms a founder
// searches by stay out of the cells apart from "SEO and AI visibility" (the caption that listed
// CMS, SEO, AEO, GEO and WCAG went at the owner's request, 23 September 2026). No load time is
// promised:
// the six live sites measured 27 to 64 on Lighthouse mobile
// (docs/research/home-page-content/client-site-speed.md), so the Fast cell states the process.
// The Answered scene carries "before they book" for copy.test.ts, which holds it identical to the
// call agenda's second line, so the band sets up what the call pays off.
type IncludedItem = Readonly<{ title: string; body: string }>

// The job's key, which the band maps to its glyph and its hue (app/_components/included.tsx).
// A key rather than the label, so the copy can change without the picture following it.
export type IncludedJob = 'found' | 'trusted' | 'answered' | 'reachable'

export type IncludedGroup = Readonly<{
  job: IncludedJob
  label: string
  scene: string
  cells: readonly [IncludedItem, IncludedItem]
}>

export const INCLUDED = {
  heading: 'Everything your site needs, built in.',
  lead: "Your site has four jobs. Here's what we put in to do them, on every site we build.",
} as const

// Hosting the studio watches is a monitoring promise, so it is sayable only once the care plan is
// recorded (content plan decision 10, CONFIG.care). Until then the cell is the wording one, which
// register row 26 already backs, and the grid stays eight either way. When care is recorded, check
// which group the hosting cell belongs under before it ships: it answers "Trusted" better than
// "Answered", and swapping it in here only keeps today's count.
export const STAYS_UP: IncludedItem = {
  title: 'Stays up',
  body: 'Hosted where we can watch it, so if it ever goes down we know before you do.',
}

const WRITTEN_FOR_YOU: IncludedItem = {
  title: 'Written for you',
  body: 'A professional writes every page about your work. You send prices and photos; the writing is ours.',
}

export function includedGroups(care: typeof CONFIG.care): readonly IncludedGroup[] {
  return [
    {
      job: 'found',
      label: 'Found',
      scene: 'Being easy to find starts with being easy to read.',
      cells: [
        {
          // The owner's own title (PR #23): the visitor is buying search and answer-engine
          // readiness, so the terms are named rather than hinted at. It carries the third and
          // last "AI" the copy test allows.
          title: 'SEO and AI visibility',
          body: 'Built so Google and the chat assistants people now ask can read every page.',
        },
        {
          title: 'Fast',
          body: 'Tested on a phone before launch. Anything slow is fixed before you see it.',
        },
      ],
    },
    {
      job: 'trusted',
      label: 'Trusted',
      scene: 'People decide whether you look real before they read a word.',
      cells: [
        {
          title: 'Made for you',
          body: 'Designed by hand for your business, never from a template. It moves where motion helps.',
        },
        {
          title: 'Works for everyone',
          body: 'Big text, a screen reader, an old phone: it works, to the WCAG accessibility standard.',
        },
      ],
    },
    {
      job: 'answered',
      label: 'Answered',
      scene: 'Customers see your prices, your hours and how long a job takes, before they book.',
      cells: [
        care === null ? WRITTEN_FOR_YOU : STAYS_UP,
        {
          title: 'Yours to edit',
          body: 'Your own content system. Change words, prices and photos yourself, whenever you like.',
        },
      ],
    },
    {
      job: 'reachable',
      label: 'Reachable',
      scene: 'Someone ready to book can do it with one thumb.',
      cells: [
        {
          title: 'Connected',
          body: 'Bookings, payments and forms connected to the tools you already run, not a new set to learn.',
        },
        {
          title: 'Responsive design',
          body: 'Most of your customers will arrive on a phone. Every page is designed there first.',
        },
      ],
    },
  ]
}
