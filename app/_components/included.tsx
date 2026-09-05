import { INCLUDED, includedItems } from '@/app/_components/included-items'
import { BOOK_CALL, CTA } from '@/app/_components/nav-links'
import { revealDelay } from '@/app/_components/reveal'
import { cardHeading, titleHeading } from '@/app/_components/section-styles'
import { captionStyles } from '@/components/ui/caption'
import { textLinkStyles } from '@/components/ui/text-link'
import { TrackedLink } from '@/components/ui/tracked-link'
import { CONFIG } from '@/lib/config'

// What the real site comes with, on the What you get cell recipe, so the two bands read as one
// system: the free five minutes there, the paid build here. Eight cells, two across on a phone
// and four from lg, then the terms for those who know them and the two asks.
export function Included() {
  const items = includedItems(CONFIG.care)
  return (
    <section id="included" className="scroll-mt-16">
      <div className="flex flex-col gap-3 p-column max-md:pb-3 md:max-w-3xl">
        <h2 className={titleHeading}>{INCLUDED.heading}</h2>
        <p className="text-lead text-pretty text-on-surface-muted">{INCLUDED.lead}</p>
      </div>

      {/* gap-px over a border-coloured background draws the hairlines between cells. */}
      <ul
        data-reveal
        className="grid grid-cols-2 gap-px border-y border-border bg-border lg:grid-cols-4"
      >
        {items.map(({ title, body }, index) => (
          <li
            key={title}
            style={revealDelay(index)}
            className="flex flex-col gap-3 bg-surface p-4 sm:p-cell"
          >
            <span className={`${captionStyles} text-brand-deeper tabular-nums`}>
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className={cardHeading}>{title}</h3>
            <p className="text-body text-pretty text-on-surface-muted">{body}</p>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3 p-column pt-5 md:pt-6">
        <p className={captionStyles}>{INCLUDED.caption}</p>
        <p className="text-small text-on-surface-muted">
          {INCLUDED.ask}{' '}
          <TrackedLink
            href={CTA.href}
            event="cta_click"
            location="included"
            className={`${textLinkStyles} inline-block py-1`}
          >
            {CTA.label}
          </TrackedLink>{' '}
          {INCLUDED.or}{' '}
          <TrackedLink
            href={BOOK_CALL.href}
            event="call_click"
            location="included"
            className={`${textLinkStyles} inline-block py-1`}
          >
            {BOOK_CALL.label.toLowerCase()}
          </TrackedLink>
        </p>
      </div>
    </section>
  )
}
