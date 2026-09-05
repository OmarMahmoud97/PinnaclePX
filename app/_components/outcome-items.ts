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
    body: 'Most people will look you up on a phone. Your site has to work there first.',
  },
  {
    label: 'Trusted',
    body: 'People decide whether you look real before they read a word.',
  },
  {
    label: 'Answers',
    body: 'It answers the questions people ask before they book.',
  },
  {
    label: 'Easy to reach',
    body: 'Getting in touch should be one tap, not a hunt for a phone number.',
  },
]
