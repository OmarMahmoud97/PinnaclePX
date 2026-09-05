'use client'

import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import type { FaqLink } from '@/app/_components/faq-items'
import { textLinkStyles } from '@/components/ui/text-link'
import { trackEvent } from '@/lib/analytics/events'

type Props = { index: number; question: string; answer: string; link?: FaqLink | undefined }

// Native disclosure: no JavaScript needed to open it. The only script records which one opened.
// The `faq` class lets globals.css animate the height where the browser can; elsewhere it snaps.
// An answer's link sits inside its one paragraph, after the text, so the entry stays one `p`.
export function FaqEntry({ index, question, answer, link }: Props) {
  return (
    <details
      className="faq group py-4 first:pt-0 last:pb-0"
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
          className="size-4 shrink-0 translate-y-0.5 text-on-surface-muted transition-transform duration-(--motion-enter) ease-standard group-open:rotate-180"
        />
      </summary>
      <p className="pt-3 text-body text-pretty text-on-surface-muted opacity-0 transition-opacity duration-(--motion-enter) ease-standard group-open:opacity-100">
        {answer}
        {link !== undefined && (
          <>
            {' '}
            <Link href={link.href} className={textLinkStyles}>
              {link.label}
            </Link>
          </>
        )}
      </p>
    </details>
  )
}
