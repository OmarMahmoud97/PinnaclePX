export type FaqItem = Readonly<{ question: string; answer: string }>

export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: 'What does PinnaclePX actually produce?',
    answer:
      'A complete landing page preview: a matched template, written copy for every section, imagery, and brand colours derived from your logo. You get a link you can share straight away.',
  },
  {
    question: 'How long does a brief take?',
    answer:
      'Answering the five questions takes a couple of minutes. Generation runs in the background and usually finishes in under five minutes.',
  },
  {
    question: 'Which template will I get?',
    answer:
      'Your answers are scored against ten templates and the best fit is chosen. You see three concepts before the final page is generated.',
  },
  {
    question: 'Can I use my own brand colours and logo?',
    answer:
      'Yes. Upload a logo and PinnaclePX extracts a palette, then checks every text and background pair for WCAG AA contrast before rendering.',
  },
  {
    question: 'Is there a free tier?',
    answer:
      'Yes. The free tier includes one brief a month with a PinnaclePX watermark on the preview. Paid tiers remove the watermark and add a custom domain.',
  },
  {
    question: 'Who owns the generated page?',
    answer:
      'You do. Export the HTML on any paid tier and host it wherever you like, with no attribution required.',
  },
]
