// Headings and leads that used to sit as JSX prose in their sections. They live here so
// copy.test.ts guards every visitor sentence, not only the list items. Rendering is unchanged.

// The hero's field and its second path. The label asks the first question in the visitor's words.
export const HERO = {
  fieldLabel: 'What does your business do?',
  fieldHint: 'Your answer fills the sketch as you type.',
  talkFirst: 'Rather talk first?',
} as const

// The section sells how little the form asks and how soon it pays off, nothing about the
// machinery: the pipeline starts on the fifth answer (app/start/_components/actions.ts), and a
// visitor deciding whether to type gains nothing from knowing when.
export const HOW_IT_WORKS = {
  heading: 'One question at a time.',
  lead: 'You see one question, answer it, and the next one appears. Nothing to prepare, and nothing to upload unless you want to.',
  // Three beats of copy beside the phone frame. Each paints the stages it names as the visitor
  // scrolls it past the frame, spread evenly down its height (walkthrough-stops.ts): the sentence
  // and the name with the first, the logo with the one about skipping, the look and the colour
  // with the payoff. The finished page follows on the button (how-it-works.tsx).
  beats: [
    {
      stages: [1, 2],
      text: 'Five short questions. The first is a sentence or two about your business. The rest appear one at a time.',
    },
    { stages: [3], text: "No phone number. No budget question. Skip anything you don't have." },
    {
      stages: [4, 5],
      text: 'Five answers, then about five minutes. Your three designs appear on screen, and the link lands in your inbox.',
    },
  ],
} as const

export const STRAIGHT_ANSWERS = {
  heading: 'Straight answers.',
  lead: 'The things people ask before they type anything.',
} as const

export const FAQ = {
  heading: 'Frequently asked questions',
  lead: 'Anything else, ask on the call.',
} as const

export const CLOSING = {
  heading: 'Your three designs are five questions away.',
} as const

export const FOOTER = {
  blurb: 'A UK web design studio. See three homepage designs in your own brand before you decide.',
} as const
