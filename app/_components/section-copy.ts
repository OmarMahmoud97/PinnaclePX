import { CONFIG } from '@/lib/config'

// Headings and leads that used to sit as JSX prose in their sections. They live here so
// copy.test.ts guards every visitor sentence, not only the list items. Rendering is unchanged.

// The hero's prompt box, the word its headline sets apart (the promise is in it), and the
// arrow to the next section. The label asks the first question in the visitor's
// words; it is the box's placeholder, and its label for a screen reader.
export const HERO = {
  fieldLabel: 'What does your business do?',
  emphasis: 'before',
  scrollLabel: 'Scroll to the next section',
} as const

// The free step, shown rather than described. The band is the only place on the page that says
// what answering costs the visitor, so the lead carries what they give and for how long, and
// each step says what its answer does to the sketch and what they see for it. Three nouns are
// kept apart throughout: "the sketch" is what is on screen, "three designs" is what arrives, and
// "your site" is the thing they would hire, which never appears inside a step. The bridge after
// the button is the one line that says what happens if they like one.
export const HOW_IT_WORKS = {
  heading: 'Five answers show you the look.',
  // The word the heading sets apart in the serif italic (app/_components/words.tsx, emphasised).
  // A constant like HERO.emphasis, not a visitor sentence: the heading string is unchanged.
  emphasis: 'look',
  lead: `Nothing to prepare. We'll ask for your email, and your link stays live for ${String(CONFIG.retention.days)} days.`,
  // Five steps beside the phone frame, one per question and in /start's order, each titled with
  // /start's own heading for it. A step paints the stages it names as the visitor scrolls it past
  // the frame, spread evenly down its height (walkthrough-stops.ts); the last, the send, holds the
  // finished sketch and then builds the page, so the build lands while the frame is still whole
  // on screen. None is headed "Question N": the frame's progress line already counts. The stages
  // are written out, not computed from walkthrough-steps.ts: the hero's client code imports HERO
  // from here, and a computed list kept these words in its chunk (about 500 B of script on `/`,
  // measured 25 September 2026). walkthrough-steps.test.ts holds the stages to the steps' own and
  // the titles to /start's.
  steps: [
    {
      stages: [1],
      title: 'Start with a sentence.',
      body: 'Say what your business does, in your own words. It becomes the opening line of the sketch beside you.',
    },
    {
      stages: [2],
      title: 'Put your name on it.',
      body: 'Your business name becomes the headline and the wordmark. Add a logo, or your name stands in.',
    },
    {
      stages: [3],
      title: 'Pick a look.',
      body: "Warm, clean, bold or dark. Your photos go in if you have them; we find photos to match if you don't.",
    },
    {
      stages: [4],
      title: 'Choose a colour.',
      body: 'Your colour runs through the buttons and accents, and the sketch is finished.',
    },
    {
      stages: [5, 6],
      title: 'Where should we send them?',
      body: 'Your email is only where the link goes. No phone number, no budget question. About five minutes later, three designs are on screen, yours to judge.',
    },
  ],
  // After the button: the only "what happens next" line in the band, and the only place the
  // sketch and the hired site are allowed in one sentence, because it is about the difference.
  bridge:
    'Like one? Your site is then designed from scratch around what you liked, by a person, page by page.',
} as const

export const STRAIGHT_ANSWERS = {
  heading: 'Straight answers.',
  lead: 'The things people ask before they type anything.',
} as const

export const FAQ = {
  heading: 'Frequently asked questions',
} as const

// The last heading is stored in two parts because the ask at the end of it is set apart, the way
// the hero sets one word of its headline apart: an italic at the regular weight. Until ADR 0032
// the ask was the page's only coloured display phrase, in --brand-deepest; now that the closing
// sits on the hero's ink and its letters flip colour by difference, a coloured phrase would flip
// to its complement over the ink, so the emphasis is by weight. The two parts are joined for the
// copy corpus, so every voice test still reads one sentence. The opening is the finished site in
// the buyer's own words; the ask is the free step, in three words, because the button under it
// already names what arrives.
export const CLOSING = {
  opening: 'A site that looks like your business.',
  ask: 'Looking is free.',
} as const

export const FOOTER = {
  blurb:
    'A UK web design studio. Custom websites for small businesses and the people starting them.',
} as const
