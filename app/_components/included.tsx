import { INCLUDED, includedItems } from '@/app/_components/included-items'
import { BOOK_CALL, CTA } from '@/app/_components/nav-links'
import { revealDelay } from '@/app/_components/reveal'
import {
  bandEdge,
  cardBody,
  cardHeading,
  cellGrid,
  commercialBand,
  hairlineCell,
  sectionLead,
  titleHeading,
} from '@/app/_components/section-styles'
import { captionStyles } from '@/components/ui/caption'
import { tapLinkStyles } from '@/components/ui/text-link'
import { TrackedLink } from '@/components/ui/tracked-link'
import { CONFIG } from '@/lib/config'

// What the real site comes with, on the What you get cell recipe, so the two bands read as one
// system: the free five minutes there, the paid build here. Eight cells, two across on a phone
// and four from lg, then the terms for those who know them and the two asks.
export function Included() {
  const items = includedItems(CONFIG.care)
  return (
    <section id="included" className={`scroll-mt-16 ${commercialBand}`}>
      {/* Opens the tinted stretch that runs to the end of Your options. */}
      <div aria-hidden="true" className={bandEdge} />
      <div className="flex flex-col gap-3 p-column max-md:pb-3 md:max-w-3xl">
        <h2 className={titleHeading}>{INCLUDED.heading}</h2>
        <p className={sectionLead}>{INCLUDED.lead}</p>
      </div>

      <ul data-reveal className={`${cellGrid} border-y border-border lg:grid-cols-4`}>
        {items.map(({ title, body }, index) => (
          <li key={title} style={revealDelay(index)} className={hairlineCell}>
            {/* Muted, not brand: see the note on stepNumber in section-styles.ts. */}
            <span className={`${captionStyles} tabular-nums`}>
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className={cardHeading}>{title}</h3>
            <p className={cardBody}>{body}</p>
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
            className={tapLinkStyles}
          >
            {CTA.label}
          </TrackedLink>{' '}
          {INCLUDED.or}{' '}
          <TrackedLink
            href={BOOK_CALL.href}
            event="call_click"
            location="included"
            className={tapLinkStyles}
          >
            {BOOK_CALL.label.toLowerCase()}
          </TrackedLink>
        </p>
      </div>
    </section>
  )
}
