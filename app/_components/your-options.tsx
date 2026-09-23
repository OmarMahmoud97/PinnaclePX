import { optionRows, YOUR_OPTIONS } from '@/app/_components/option-items'
import { revealDelay } from '@/app/_components/reveal'
import {
  card,
  cardBody,
  cardHeading,
  cardPad,
  headingColumn,
  sectionGrid,
  sectionLead,
  shell,
  titleHeading,
} from '@/app/_components/section-styles'
import { eyebrowStyles } from '@/components/ui/caption'
import { READY_TEMPLATES } from '@/templates/registry'

// The rows are definition lists, not a table: a table cannot restack on a phone without display
// changes on its rows that break the accessibility tree, and each row here is one question with
// two answers. From md the two lane heads sit once above the rows and every row's own labels go
// screen-reader-only; on a phone each row shows its labels as eyebrows, so it reads alone.
const ROW_GRID = 'md:grid-cols-[1fr_2.4fr] md:gap-x-6'
const PAIR_GRID = 'md:grid-cols-2 md:gap-x-6'

// Both lanes answer in the same ink at the same size (D10): a muted builder lane would weight the
// studio's, and the comparison must carry no weighting (CAP Code section 3).
const ANSWER = 'text-body text-pretty text-on-surface'

// The two lane heads are one recipe, so neither lane leads; the choreography clips them in and
// draws both on together from md up, and without it they are simply there. Both fill the same
// row and centre their words, so a head that wraps and one that does not stay the same shape.
// The answer columns under them are about 117 px at 768 and 175 px at 1024, where the longer
// head at the small size needs 200 px with its padding, so up to xl the heads take the caption
// size with tight padding and wrap evenly ("You build it / with a builder"); from xl the pills
// are 235 px and the small size fits on one line.
const LANE_HEAD =
  'lane-head inline-flex items-center justify-center rounded-full bg-surface px-2 py-2 text-center text-label font-semibold text-balance shadow-card xl:px-4 xl:text-small'

// The band the wash dissolves on: the tinted stretch that began at Real build fades to white
// under the notes (the extra half band of padding carries the fade), so the sceptic's answers
// open on white with no rule between.
export function YourOptions() {
  const rows = optionRows(READY_TEMPLATES.length)
  return (
    <section
      id="your-options"
      className="wash-dissolve scroll-mt-16 pt-band pb-[calc(var(--spacing-band)*1.5)]"
    >
      <div className={shell}>
        <div className={sectionGrid}>
          <div className={headingColumn}>
            <h2 className={titleHeading}>{YOUR_OPTIONS.heading}</h2>
            <p className={sectionLead}>{YOUR_OPTIONS.lead}</p>
            <p className={`pt-3 ${cardBody}`}>{YOUR_OPTIONS.agency}</p>
          </div>

          <div className="md:col-span-4">
            {/*
             * The visual header duplicates the labels each row carries for assistive technology.
             * It takes the cards' horizontal padding so the two pills sit over the two answer
             * columns below them.
             */}
            <div aria-hidden="true" className={`hidden md:grid md:px-7 ${ROW_GRID}`}>
              <span />
              <div className="grid grid-cols-2 gap-x-6">
                <span className={LANE_HEAD}>{YOUR_OPTIONS.builderHead}</span>
                <span className={LANE_HEAD}>{YOUR_OPTIONS.studioHead}</span>
              </div>
            </div>

            <div data-reveal data-choreo="rows" className="mt-4 flex flex-col gap-4">
              {rows.map(({ question, builder, studio }, index) => (
                <div
                  key={question}
                  style={revealDelay(index)}
                  className={`grid gap-4 ${card} ${cardPad} ${ROW_GRID}`}
                >
                  <h3 className={cardHeading}>{question}</h3>
                  <dl className={`grid gap-4 ${PAIR_GRID}`}>
                    <div className="flex flex-col gap-1">
                      <dt className={`${eyebrowStyles} md:sr-only`}>{YOUR_OPTIONS.builderLabel}</dt>
                      <dd className={ANSWER}>{builder}</dd>
                    </div>
                    <div className="flex flex-col gap-1">
                      <dt className={`${eyebrowStyles} md:sr-only`}>{YOUR_OPTIONS.studioLabel}</dt>
                      <dd className={ANSWER}>{studio}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-2 text-small text-on-surface-muted">
              <p>{YOUR_OPTIONS.signpost}</p>
              <p>{YOUR_OPTIONS.generous}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
