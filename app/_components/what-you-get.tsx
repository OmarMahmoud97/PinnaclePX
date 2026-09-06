import { revealDelay } from '@/app/_components/reveal'
import { cardBody, cardHeading, cellGrid, hairlineCell } from '@/app/_components/section-styles'
import { WhatYouGetGlyph } from '@/app/_components/what-you-get-glyphs'
import { WHAT_YOU_GET_ITEMS } from '@/app/_components/what-you-get-items'

// The four deliverables. Two columns from the smallest screen so they read as a set, not a list.
export function WhatYouGet() {
  return (
    <section id="what-you-get">
      <h2 className="sr-only">What you get</h2>
      <ul data-reveal className={`${cellGrid} lg:grid-cols-4`}>
        {WHAT_YOU_GET_ITEMS.map(({ title, detail, glyph }, index) => (
          <li key={title} style={revealDelay(index)} className={hairlineCell}>
            <WhatYouGetGlyph name={glyph} />
            <h3 className={cardHeading}>{title}</h3>
            <p className={cardBody}>{detail}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
