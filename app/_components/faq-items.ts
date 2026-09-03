import { CONFIG } from '@/lib/config'

type FaqItem = Readonly<{ question: string; answer: string }>

// The remaining reasons not to type, in the sceptic's order. "Is it free?" and "Will someone
// call?" are answered under the buttons and in Straight answers, so they are not repeated here.
// Item 1 is the only place the five topics are named, collapsed for the visitor who wants them.
// The privacy notice link joins item 4 once the notice exists.
export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: 'What will you ask me?',
    answer:
      'What your business does, then where to send your link: your name, company and email. Then your logo, your photos and your colours, one at a time. No phone number and no budget.',
  },
  {
    question: 'How long does it take, and do I have to wait?',
    answer:
      'Answering takes a couple of minutes. Your designs are ready within about five minutes of your last answer. Watch them appear, or close the tab and use the emailed link.',
  },
  {
    question: 'Do I need a logo or brand colours?',
    answer:
      'No. Without a logo we set your company name in a clean typeface. Without colours you pick one of ours.',
  },
  {
    question: 'What happens to my details?',
    answer: `We store your name, email, company and what you upload. That is what we need to build your designs and send your link. We delete them after ${String(CONFIG.retention.days)} days unless you have booked a call.`,
  },
  {
    question: 'Can I use one of the designs as my website?',
    answer:
      "Not as it is. It's a first look made in five minutes, not a finished site. If you like one, we build the real site from it, with the time it deserves.",
  },
  {
    question: 'I already have a website. Can you replace it?',
    answer: 'Yes. Your three designs start from your sentence, not your old site.',
  },
  {
    question: 'What does the full site cost?',
    answer: 'We give a fixed quote on the call, once we know what the site needs.',
  },
  {
    question: 'What if the wording is wrong?',
    answer:
      "Tell us on the call. It's a first draft, written from one sentence about your business. The real site's wording comes from the conversation.",
  },
]
