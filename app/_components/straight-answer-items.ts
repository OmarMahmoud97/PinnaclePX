import { Bot, HelpCircle, type LucideIcon, Mail, RefreshCw } from 'lucide-react'
import { CONFIG } from '@/lib/config'

type StraightAnswerItem = Readonly<{ question: string; answer: string; Icon: LucideIcon }>

// What happens if the visitor likes none of the three. A second visit shows three unseen
// templates, so the offer is true only once six are ready, and "up to nine" only once nine are.
// Below six the cell promises nothing about a second visit. All three are exported so the copy
// test checks every branch, not only the one that renders today.
export const SECOND_VISIT = {
  untilSix: `Book the call and tell us what's wrong. Or book nothing. Your link works for ${String(CONFIG.retention.days)} days, and nobody follows up.`,
  fromSix:
    "Come back with the same email and we'll show you three you haven't seen. Or book the call and tell us what's wrong.",
  fromNine:
    "Come back with the same email and we'll show you three you haven't seen. Up to nine in all. Or book the call and tell us what's wrong.",
} as const

function secondVisitAnswer(readyCount: number): string {
  const { conceptsShown } = CONFIG.templates
  if (readyCount >= 3 * conceptsShown) return SECOND_VISIT.fromNine
  if (readyCount >= 2 * conceptsShown) return SECOND_VISIT.fromSix
  return SECOND_VISIT.untilSix
}

// The fears a burned buyer has, in the order they have them. "Will it look like everyone
// else's?" joins this list once the ten templates render. "AI" appears in the question and once
// in its answer, and nowhere else on the page; copy.test.ts pins the count. The answer states
// what the model calls actually carry (lib/ai/prompts.ts: the company name, the sentence and the
// chosen look; lib/images/stage.ts: only stock candidates are ranked, the visitor's own
// photographs are re-hosted with no model call; lib/logo: analysed locally).
export function straightAnswerItems(readyCount: number): readonly StraightAnswerItem[] {
  return [
    {
      question: 'Is this AI?',
      answer:
        "Partly, and we'll say where. AI drafts your wording from your own sentence and helps choose stock photos. A person designs every layout, and a person builds your real site. It never sees your logo, your colours or your photos.",
      Icon: Bot,
    },
    {
      question: 'What do you do with my email?',
      answer: "We send you your link. You book a call if you want one. We don't ring you.",
      Icon: Mail,
    },
    {
      question: "What if I don't like any of them?",
      answer: secondVisitAnswer(readyCount),
      Icon: RefreshCw,
    },
    {
      question: "What's the catch?",
      answer:
        "There isn't one. Showing you first is how we win work. If you don't like any of them, you've lost five minutes and there's nothing to cancel.",
      Icon: HelpCircle,
    },
  ]
}
