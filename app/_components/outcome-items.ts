// What a good website does for the owner's week, in plain scenes. No figure appears on the page:
// the evidence behind each row is in docs/research/home-page-content/outcome-copy.md and the
// claims register. Row three repeats the call agenda's phrase "before they book", and
// copy.test.ts holds the two identical so the Taster pays off what this section sets up.
type OutcomeItem = Readonly<{ label: string; body: string }>

export const OUTCOMES = {
  heading: 'Four things your site has to do.',
  lead: 'Perhaps you were quoted more than made sense. Perhaps you started on a builder and stalled. Or you have a site you never show anyone. Or no site yet. A good website does four plain things.',
  bridge: 'Your three designs show the look. The real site does this job.',
} as const

export const OUTCOME_ITEMS: readonly OutcomeItem[] = [
  {
    label: 'Found',
    body: 'Built for local SEO from the start: proper page titles, structured data, a matching Google Business Profile. Pages target the searches people near you actually type. Fast loading too, since speed feeds into where you rank.',
  },
  {
    label: 'Trusted',
    body: 'Real photos, clear pricing, reviews and credentials placed where they land first. Consistent type, spacing and colour throughout, so nothing looks improvised.',
  },
  {
    label: 'Answered',
    body: 'Services, areas covered, prices, hours and turnaround times: the questions people ask before they book, answered on the page. Fewer dead-end enquiries, more people who arrive ready.',
  },
  {
    label: 'Reachable',
    body: 'One clear next step on every page: call, WhatsApp, or a booking form that works. Contact details stay within reach as people scroll, on a phone as well as a laptop.',
  },
]
