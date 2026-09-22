import { optionRows, YOUR_OPTIONS } from '@/app/_components/option-items'
import { revealDelay } from '@/app/_components/reveal'
import {
  cardBody,
  cardHeading,
  commercialBand,
  headingColumn,
  sectionGrid,
  sectionLead,
  titleHeading,
  trailingNote,
} from '@/app/_components/section-styles'
import { captionStyles } from '@/components/ui/caption'
import { READY_TEMPLATES } from '@/templates/registry'

// The rows are definition lists, not a table: a table cannot restack on a phone without display
// changes on its rows that break the accessibility tree, and each row here is one question with
// two answers. From md the two column heads sit once above the rows and every row's own labels
// go screen-reader-only; on a phone each row shows its labels, so it reads alone.
const ROW_GRID = 'md:grid-cols-[1fr_2.4fr] md:gap-x-6'
const PAIR_GRID = 'md:grid-cols-2 md:gap-x-6'

export function YourOptions() {
  const rows = optionRows(READY_TEMPLATES.length)
  return (
    <section id="your-options" className={`scroll-mt-16 ${commercialBand}`}>
      <div className={sectionGrid}>
        <div className={headingColumn}>
          <h2 className={titleHeading}>{YOUR_OPTIONS.heading}</h2>
          <p className={sectionLead}>{YOUR_OPTIONS.lead}</p>
          <p className={`pt-3 ${cardBody}`}>{YOUR_OPTIONS.agency}</p>
        </div>

        <div className="md:col-span-4">
          {/* The visual header duplicates the labels each row carries for assistive technology. */}
          <div aria-hidden="true" className={`hidden px-cell pt-cell pb-3 md:grid ${ROW_GRID}`}>
            <span />
            <div className={`grid ${PAIR_GRID}`}>
              <span className="text-small font-semibold">{YOUR_OPTIONS.builderHead}</span>
              <span className="text-small font-semibold">{YOUR_OPTIONS.studioHead}</span>
            </div>
          </div>

          <div data-reveal className="divide-y divide-border border-y border-border">
            {rows.map(({ question, builder, studio }, index) => (
              <div
                key={question}
                style={revealDelay(index)}
                className={`grid gap-3 p-5 md:p-cell ${ROW_GRID}`}
              >
                <h3 className={cardHeading}>{question}</h3>
                <dl className={`grid gap-3 ${PAIR_GRID}`}>
                  <div className="flex flex-col gap-1">
                    <dt className={`${captionStyles} md:sr-only`}>{YOUR_OPTIONS.builderLabel}</dt>
                    <dd className={cardBody}>{builder}</dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className={`${captionStyles} md:sr-only`}>{YOUR_OPTIONS.studioLabel}</dt>
                    <dd className="text-body text-pretty">{studio}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>

          <div className={trailingNote}>
            <p>{YOUR_OPTIONS.signpost}</p>
            <p>{YOUR_OPTIONS.generous}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
