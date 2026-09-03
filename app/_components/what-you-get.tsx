import { revealDelay } from '@/app/_components/reveal'
import { cardHeading } from '@/app/_components/section-styles'
import { WhatYouGetGlyph } from '@/app/_components/what-you-get-glyphs'
import { WHAT_YOU_GET_ITEMS } from '@/app/_components/what-you-get-items'

// The four deliverables. Two columns from the smallest screen so they read as a set, not a list.
export function WhatYouGet() {
  return (
    <section id="what-you-get">
      <h2 className="sr-only">What you get</h2>
      {/* gap-px over a border-coloured background draws the hairlines between cells. */}
      <ul data-reveal className="grid grid-cols-2 gap-px bg-border lg:grid-cols-4">
        {WHAT_YOU_GET_ITEMS.map(({ title, detail, glyph }, index) => (
          <li
            key={title}
            style={revealDelay(index)}
            className="flex flex-col gap-3 bg-surface p-4 sm:p-cell"
          >
            <WhatYouGetGlyph name={glyph} />
            <h3 className={cardHeading}>{title}</h3>
            <p className="text-body text-pretty text-on-surface-muted">{detail}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
