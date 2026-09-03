import { Bot, type LucideIcon, Mail, RefreshCw, Unlock } from 'lucide-react'

export type StraightAnswerItem = Readonly<{ question: string; answer: string; Icon: LucideIcon }>

// The fears a burned buyer has, in the order she has them. "Will it look like everyone else's?"
// joins this list once the ten templates render.
export const STRAIGHT_ANSWER_ITEMS: readonly StraightAnswerItem[] = [
  {
    question: 'Is this AI?',
    answer:
      "Partly, and we'll tell you where. AI drafts your copy from your own sentence and helps find photos. A person designs every layout. AI never picks the layout, your colours or your logo.",
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
      "Come back with the same email and we show you designs you haven't seen yet, up to nine in all. Or book the call and tell us what's wrong.",
    Icon: RefreshCw,
  },
  {
    question: 'Am I locked in?',
    answer: 'No. The preview is free and there is nothing to cancel.',
    Icon: Unlock,
  },
]
