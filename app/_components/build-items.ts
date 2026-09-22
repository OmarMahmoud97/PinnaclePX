// The paid step as a process the buyer can picture, from the call to the launch. It absorbs the
// old Taster band (docs/adr/0033): its two best lines are the lead here, and the call it asked
// for is step one. Every line is true by the page's existing promises (a fixed quote and a
// timeline on the call, wording from the conversation, a site designed from scratch). A step
// whose facts the owner has not confirmed is absent, not softened: ownership, the check before
// launch, the change round, the page list and the care plan join once each decision is recorded
// (docs/home-page-content-plan.md, section 3.8), and the counter renumbers itself.
type BuildStep = Readonly<{ title: string; body: string }>

export const REAL_BUILD = {
  // Not "If you like one": read in the headings-only layer the pronoun has no antecedent, since
  // the page's other headings never count the designs, and it echoed the walkthrough's bridge
  // sentence one hairline above it.
  heading: 'If a design fits, here is what happens next.',
  lead: 'Open it on your phone, sleep on it, come back to it. Nobody chases you. Then we spend our hours, not yours, building the real thing properly.',
} as const

export const BUILD_STEPS: readonly BuildStep[] = [
  {
    // The call's length is on the button beside these steps, rendered from CONFIG, so the title
    // says what the call produces rather than typing the number again.
    title: 'One call, one quote',
    body: 'You talk to the person who runs the studio. We agree a timeline on the call.',
  },
  {
    title: 'You send your photos and prices',
    body: 'Your logo file, your photos if you have them, and your prices or services. Nothing technical.',
  },
  {
    title: 'Words that sound like you',
    body: "A professional writes every page: your hours, your prices, what you actually do, in your customers' words.",
  },
  {
    title: 'Designed from scratch',
    body: 'Built around what you liked, for a phone first and the bigger screens after.',
  },
  {
    // Replacing the old site is the FAQ's promise, said again where the launch happens.
    title: 'Live for your customers',
    body: 'It goes live at your web address, in place of your old site if you have one.',
  },
]
