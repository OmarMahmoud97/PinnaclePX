import type { Route } from 'next'
import { CONFIG } from '@/lib/config'

export type FaqLink = Readonly<{ label: string; href: Route }>

type FaqItem = Readonly<{ question: string; answer: string; link?: FaqLink }>

// The remaining reasons not to type, in the sceptic's order: before typing, the designs, the
// paid step, after launch. "Is it free?" and "Will someone call?" are answered under the buttons
// and in Straight answers, so they are not repeated here. Item 1 is the only place the five
// topics are named, collapsed for the visitor who wants them. Items that state a contract term
// (payment, ownership, a timeline in weeks, the care plan) are absent until the owner records the
// decision (docs/home-page-content-plan.md, section 3.12).
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
    // Nothing in the code keeps a booked caller's details past the sweep, so the page does not
    // say so (lib/inngest/functions/retention-sweep.ts).
    answer: `We store your name, email, company and what you upload. That is what we need to build your designs and send your link. We delete them after ${String(CONFIG.retention.days)} days.`,
    link: { label: 'Read the privacy notice', href: '/privacy' },
  },
  {
    question: 'Can I use one of the designs as my website?',
    answer:
      "No. It's a first look made in five minutes, to show you our design in your brand. If you like one, we design your real site from scratch, around what you liked.",
  },
  {
    question: 'What if the wording is wrong?',
    answer:
      "Tell us on the call. It's a first draft, written from one sentence about your business. The real site's wording comes from the conversation.",
  },
  {
    question: 'I already have a website. Can you replace it?',
    answer: 'Yes. Your three designs start from your sentence, not your old site.',
  },
  {
    question: 'Do I have to book a call?',
    answer:
      'No. Keep the link and do nothing, or send it to someone. The call is there if you want the real site.',
  },
  {
    question: 'What does the full site cost?',
    answer: 'We give a fixed quote on the call, once we know what the site needs.',
  },
  {
    question: 'How long does the real site take?',
    answer:
      'We agree a timeline on the call. We ask for your photos and prices early, so nothing waits on them.',
  },
  {
    question: 'Who looks after it after launch?',
    answer: 'We agree on the call who hosts it and who keeps it up to date.',
  },
  {
    question: 'Will people find it on Google?',
    answer:
      'We build every page so Google and the chat assistants people now ask can read it. Being found also takes work after launch, and we say what on the call.',
  },
]
