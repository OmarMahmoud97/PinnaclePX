import { revealDelay } from '@/app/_components/reveal'
import { STRAIGHT_ANSWERS } from '@/app/_components/section-copy'
import {
  cardBody,
  cardHeading,
  cardPad,
  cardWash,
  headingColumn,
  iconDisc,
  sectionGrid,
  sectionLead,
  shell,
  titleHeading,
} from '@/app/_components/section-styles'
import { straightAnswerItems } from '@/app/_components/straight-answer-items'
import { READY_TEMPLATES } from '@/templates/registry'

// The sceptic's questions in their words, on the first white band after the wash (ADR 0034).
// Four wash cards on white, the right pair hung 2.5rem lower from lg so the 2x2 floats rather
// than grids, each lit from one corner by the list's --i so no two neighbours glow alike. The
// icon leaves the heading for a white disc above it, so the h3 text is the question alone.
export function StraightAnswers() {
  const items = straightAnswerItems(READY_TEMPLATES.length)
  return (
    <section id="straight-answers" className="scroll-mt-16 bg-surface py-band">
      <div className={shell}>
        <div className={sectionGrid}>
          <div data-reveal className={headingColumn}>
            <h2 className={titleHeading}>{STRAIGHT_ANSWERS.heading}</h2>
            <p className={sectionLead}>{STRAIGHT_ANSWERS.lead}</p>
          </div>

          {/* Owned by the choreography from md up (the tilt entrance); the CSS reveal below. */}
          <ul data-reveal data-choreo="answers" className="grid gap-5 md:col-span-4 lg:grid-cols-2">
            {items.map(({ question, answer, Icon }, index) => (
              <li
                key={question}
                style={revealDelay(index)}
                className={`glow-corner answer flex flex-col gap-4 overflow-clip ${cardWash} ${cardPad} lg:nth-[2n]:mt-10`}
              >
                <span aria-hidden="true" className={`${iconDisc} max-md:size-10`}>
                  <Icon className="size-6" />
                </span>
                {/* The same glyph drawn large in the card's lower corner: a hairline in the ramp's
                    ice, under the words, cut by the card's own edge. */}
                <Icon
                  aria-hidden="true"
                  strokeWidth={0.3}
                  className="pointer-events-none absolute -right-8 -bottom-10 -z-1 size-40 text-surface-wash-deep"
                />
                <h3 className={cardHeading}>{question}</h3>
                <p className={cardBody}>{answer}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
