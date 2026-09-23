'use client'

import { Plus } from 'lucide-react'
import Link from 'next/link'
import type { FaqLink } from '@/app/_components/faq-items'
import { revealDelay } from '@/app/_components/reveal'
import { cardBody, cardHeading } from '@/app/_components/section-styles'
import { textLinkStyles } from '@/components/ui/text-link'
import { trackEvent } from '@/lib/analytics/events'

type Props = { index: number; question: string; answer: string; link?: FaqLink | undefined }

// Native disclosure: no JavaScript needed to open it. The only script records which one opened.
// The `faq` class lets globals.css animate the height where the browser can; elsewhere it snaps.
// An answer's link sits inside its one paragraph, after the text, so the entry stays one `p`.
//
// The entry is a card (ADR 0034): the wash on white while it is closed, white on the card shadow
// once it is open, with the corner glow that app/_styles/faq.css shows only on the open state.
// It takes the well's 16 px radius rather than cardWash's 24 px: on a row this short the card
// radius meets itself and the closed entry reads as a pill, not a card. The question sits at the
// other cards' h3 size. `--i` from revealDelay places that glow and paces the list reveal.
//
// All of the padding is on the summary and the answer, none on the details, so the whole closed
// card is the tap target (about 60 px tall on a phone) and not only the question's line box. The
// plus sits in a small disc that swaps grounds with the card, white on the wash and wash on
// white, so the two states read as a figure/ground flip and not only a colour change; open, the
// plus turns to a cross.
export function FaqEntry({ index, question, answer, link }: Props) {
  return (
    <details
      style={revealDelay(index)}
      className="faq glow-corner group rounded-2xl bg-surface-wash transition-[background-color,box-shadow] duration-(--motion-enter) ease-standard open:bg-surface open:shadow-card"
      onToggle={(e) => {
        if (e.currentTarget.open) {
          trackEvent('faq_open', { index })
        }
      }}
    >
      <summary
        className={`flex cursor-pointer list-none items-start justify-between gap-4 rounded-2xl px-5 py-5 transition-colors duration-(--motion-enter) ease-standard outline-none group-open:text-brand-ink focus-visible:ring-2 focus-visible:ring-brand-ink focus-visible:ring-inset md:px-6 md:py-6 [&::-webkit-details-marker]:hidden ${cardHeading}`}
      >
        {question}
        {/* -my-1 keeps the disc inside the question's line box, so the row stays the text's height. */}
        <span
          aria-hidden="true"
          className="-my-1 grid size-8 shrink-0 place-items-center rounded-full bg-surface transition-colors duration-(--motion-enter) ease-standard group-open:bg-surface-wash"
        >
          {/* rotate-45 writes the `rotate` property, not `transform`, so that is what transitions. */}
          <Plus className="size-5 shrink-0 text-on-surface-muted transition-[rotate,color] duration-(--motion-enter) ease-standard group-open:rotate-45 group-open:text-brand-ink" />
        </span>
      </summary>
      <p
        className={`px-5 pb-5 opacity-0 transition-opacity duration-(--motion-enter) ease-standard group-open:opacity-100 md:px-6 md:pb-6 ${cardBody}`}
      >
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
