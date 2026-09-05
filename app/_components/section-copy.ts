// Headings and leads that used to sit as JSX prose in their sections. They live here so
// copy.test.ts guards every visitor sentence, not only the list items. Rendering is unchanged.
export const HOW_IT_WORKS = {
  heading: 'One question at a time.',
  lead: "You see one question, answer it, and the next one appears. While you answer, we're already working.",
  // Three beats of copy beside the phone frame; each paints one more answer into it.
  beats: [
    {
      stage: 2,
      text: 'Five short questions. The first is a sentence or two about your business. The rest appear one at a time.',
    },
    { stage: 3, text: "No phone number. No budget question. Skip anything you don't have." },
    {
      stage: 5,
      text: "By your fourth answer, we've already started on your wording. When your designs are ready, the link appears on screen and lands in your inbox.",
    },
  ],
  // What has already happened by the fourth answer. The ticks match when each stage of the build
  // starts; the third line stays a plain circle until the pipeline runs.
  legend: [
    { label: 'Your sentence', state: 'received', done: true },
    { label: 'Three designs', state: 'picked for you', done: true },
    { label: 'Your wording', state: 'started by your fourth answer', done: false },
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
