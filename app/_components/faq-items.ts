import { CONFIG } from '@/lib/config'

export type FaqItem = Readonly<{ question: string; answer: string }>

// The remaining reasons not to type, in the sceptic's order. Item 3 is the only place the five
// topics are named, collapsed for the visitor who wants them. The privacy notice link joins
// item 6 once the notice exists.
export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: 'Is it really free?',
    answer:
      'Yes. The three designs and the link are free. You pay only if you ask us to build the site.',
  },
  {
    question: 'Will someone call me?',
    answer: 'No. You book a call if you want one.',
  },
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
      'No. Without a logo we set your company name as a wordmark. Without colours you pick a palette you like.',
  },
  {
    question: 'What happens to my details?',
    answer: `We store your name, email, company and what you upload. That is what we need to build your preview and send your link. We delete them after ${String(CONFIG.retention.days)} days unless you have booked a call.`,
  },
  {
    question: 'Can I use the preview as my website?',
    answer:
      'Not directly. It is a preview of the direction. If you like one, we build the full site from it.',
  },
  {
    question: 'What does the full site cost?',
    answer: 'We give a fixed quote on the call, once we know what the site needs.',
  },
  {
    question: 'What if the copy is wrong?',
    answer:
      'Tell us on the call. The first draft is a starting point written from your one-sentence description.',
  },
]
