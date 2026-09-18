// Headings and leads that used to sit as JSX prose in their sections. They live here so
// copy.test.ts guards every visitor sentence, not only the list items. Rendering is unchanged.

// The hero's prompt box, the word its headline sets apart (the promise is in it), its second
// path, and the arrow to the next section. The label asks the first question in the visitor's
// words; it is the box's placeholder, and its label for a screen reader.
export const HERO = {
  fieldLabel: 'What does your business do?',
  emphasis: 'before',
  talkFirst: 'Rather talk first?',
  scrollLabel: 'Scroll to the next section',
} as const

// The section sells how little the form asks and how soon it pays off, nothing about the
// machinery: the pipeline starts on the fifth answer (app/start/_components/actions.ts), and a
// visitor deciding whether to type gains nothing from knowing when.
export const HOW_IT_WORKS = {
  heading: 'One question at a time.',
  lead: 'You see one question, answer it, and the next one appears. Nothing to prepare, and nothing to upload unless you want to.',
  // Five steps beside the phone frame, one per answer, each saying what that answer does to the
  // design. A step paints the stages it names as the visitor scrolls it past the frame, spread
  // evenly down its height (walkthrough-stops.ts); the last paints the colour, then the finished
  // page, so the build lands while the frame is still whole on screen. None is headed
  // "Question N": the frame's progress line already counts.
  steps: [
    {
      stages: [1],
      title: 'Start with a sentence.',
      body: 'Say what your business does. Your words go straight into the sketch, as the first line of your site.',
    },
    {
      stages: [2],
      title: 'Put your name on it.',
      body: 'Your company name becomes the headline and the wordmark, and tells us where to send your link. No phone number, no budget question.',
    },
    {
      stages: [3],
      title: 'Add your logo, or skip it.',
      body: 'Your mark takes its place beside the name. Without one, your initials stand in until you send it.',
    },
    {
      stages: [4],
      title: 'Pick a look.',
      body: "Warm, clean, bold or dark. Your photos go in if you have them; ours stand in if you don't.",
    },
    {
      stages: [5, 6],
      title: 'Choose your colour, then watch it build.',
      body: 'Your colour runs through every button and heading. Five answers, then about five minutes: three designs on screen, and the link in your inbox.',
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

// The last heading is stored in two parts because the ask at the end of it carries the page's
// only coloured display phrase. `displayHeading` appears exactly twice and the other one is the
// H1, which is the LCP element and may never be touched, so this is the one place a coloured
// display phrase can go — which makes it a signature rather than a tic. --brand-deepest is
// 7.56:1 on white and 5.33:1 over the closing wash; --brand-deeper would fail there. The two
// parts are joined for the copy corpus, so every voice test still reads one sentence.
export const CLOSING = {
  opening: 'Your three designs are',
  ask: 'five questions away.',
} as const

export const FOOTER = {
  blurb: 'A UK web design studio. See three homepage designs in your own brand before you decide.',
} as const
