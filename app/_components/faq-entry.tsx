'use client'

import { ChevronDown } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/events'

type Props = { index: number; question: string; answer: string }

// Native disclosure: no JavaScript needed to open it. The only script records which one opened.
export function FaqEntry({ index, question, answer }: Props) {
  return (
    <details
      className="group py-4 first:pt-0 last:pb-0"
      onToggle={(e) => {
        if (e.currentTarget.open) {
          trackEvent('faq_open', { index })
        }
      }}
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-md font-medium outline-none focus-visible:ring-2 focus-visible:ring-brand-deeper focus-visible:ring-offset-2 focus-visible:ring-offset-surface [&::-webkit-details-marker]:hidden">
        {question}
        <ChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 translate-y-0.5 text-on-surface-muted transition-transform group-open:rotate-180"
        />
      </summary>
      <p className="pt-3 text-sm leading-relaxed text-on-surface-muted">{answer}</p>
    </details>
  )
}
