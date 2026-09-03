import { Bot, HelpCircle, type LucideIcon, Mail, RefreshCw } from 'lucide-react'

type StraightAnswerItem = Readonly<{ question: string; answer: string; Icon: LucideIcon }>

// The fears a burned buyer has, in the order they have them. "Will it look like everyone
// else's?" joins this list once the ten templates render. "AI" appears once, then "it".
export const STRAIGHT_ANSWER_ITEMS: readonly StraightAnswerItem[] = [
  {
    question: 'Is this AI?',
    answer:
      "Partly, and we'll say where. AI drafts your wording from your own sentence and helps find photos. A person designs every layout, and a person builds your real site. It never touches your logo or your colours.",
    Icon: Bot,
  },
  {
    question: 'What do you do with my email?',
    answer: "We send you your link. You book a call if you want one. We don't ring you.",
    Icon: Mail,
  },
  {
    question: "What if I don't like any of them?",
    answer:
      "Come back with the same email and we'll show you three you haven't seen. Up to nine in all. Or book the call and tell us what's wrong.",
    Icon: RefreshCw,
  },
  {
    question: "What's the catch?",
    answer:
      "There isn't one. Showing you first is how we win work. If you don't like any of them, you've lost five minutes and there's nothing to cancel.",
    Icon: HelpCircle,
  },
]
