import type { Route } from 'next'
import { CONFIG } from '@/lib/config'
import { PRICE } from '@/lib/site'

export type FaqLink = Readonly<{ label: string; href: Route }>

type FaqItem = Readonly<{ question: string; answer: string; link?: FaqLink }>

// The remaining reasons not to hire, in the order a buyer asks them: what it costs, who they
// deal with, whether an existing site can be replaced, being found, care after launch, what the
// three designs are, and what happens to their details. Questions the page now answers where
// they arise are gone (how long the five questions take, whether a logo is needed, whether a
// call is compulsory): a FAQ that repeats the page costs the reader twice. Items that state a
// contract term (payment terms, ownership, a timeline in weeks, the care plan's contents) are
// absent until the owner records the decision (docs/home-page-content-plan.md, section 3.12).
export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: 'How much does the site cost?',
    // The rate card (CONFIG.price, docs/copy-review.md section 11): the smallest build with its
    // price, what it buys, what each extra page adds, a worked total for a five-page site, and
    // the two qualifications the law wants in the same breath as the figure: the quote is fixed
    // before work starts, and growth is quoted in writing first (CRA 2015 s.50). What is bought
    // separately is named beside the figure rather than left to be discovered (CAP 3.17). The
    // last sentence keeps the free half of the offer free in the same breath as the paid half.
    answer: `${PRICE.scope} That includes the wording, a content system you edit yourself, and going live. ${PRICE.extras} ${PRICE.worked} You get one fixed quote before any work starts. ${PRICE.cra} ${PRICE.hosting} Registering your web address is a separate purchase. The three designs and the call cost nothing.`,
  },
  {
    // Register row 53: the studio promises continuity of the person who runs it, never that one
    // person does every task, so the contract designers are named in the same answer.
    question: 'Who will I actually work with?',
    answer:
      "You'll have one contact from the first call to launch: the person who runs the studio. Contract designers help on builds.",
  },
  {
    question: 'I already have a website. Can you replace it?',
    answer: 'Yes. A full redesign or a rebrand, with what you need brought across.',
  },
  {
    question: 'Will people find it on Google?',
    answer:
      'Every page is built so Google can read it, and so can the chat assistants people now ask. Being found also takes work after launch. We say what that involves on the call.',
  },
  {
    question: 'Who looks after the site once it is live?',
    // The care plan's terms are gated until the contract states them (register row 30), so the
    // answer promises the option and sends the detail to the call.
    answer:
      'We can, if you want us to. We say what looking after it covers, and what it costs, on the call.',
  },
  {
    // The one place on the page that says what the three designs are not. Saying it here, once,
    // keeps the bands above from defending themselves in front of a reader who never doubted it.
    question: 'Can I use one of the designs as my website?',
    answer:
      'No. Each is a first draft, written from one sentence about you, before we know your business. None of the three is your site. Yours is designed by hand around the one you liked.',
  },
  {
    question: 'What happens to my details?',
    // Nothing in the code keeps a booked caller's details past the sweep, so the page does not
    // say so (lib/inngest/functions/retention-sweep.ts).
    answer: `We store your name, email, company and what you upload. That is what we need to build your designs and send your link. We delete them after ${String(CONFIG.retention.days)} days. The link stays live until then.`,
    link: { label: 'Read the privacy notice', href: '/privacy' },
  },
]
