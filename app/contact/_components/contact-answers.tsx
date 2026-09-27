import { MailX, PhoneOff, UserRound } from 'lucide-react'
import { CTA } from '@/app/_components/nav-links'
import { revealDelay } from '@/app/_components/reveal'
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
import { ANSWERS } from '@/app/contact/_components/contact-copy'
import { textLinkStyles } from '@/components/ui/text-link'
import { TrackedLink } from '@/components/ui/tracked-link'
import { SITE } from '@/lib/site'

// One icon to each answer, in the deck's order.
const ICONS = [UserRound, PhoneOff, MailX] as const

// The white band under the ink (ADR 0040): what happens to a message, in the reader's own three
// questions, as the Straight answers band asks its own, wash cards on white lit from alternating
// corners. The band is not positioned, so the pooled curve above paints over its top as it does
// over the walkthrough's (`under-ink` pads for it), and the footer's sheet is laid over its foot
// (`before-sheet`). The heading column offers the five questions to a visitor not ready to write,
// as a link: by here the header's ask is the page's blue button. The third answer promises a
// reply only once the owner has confirmed one (SITE.contactReplies).
export function ContactAnswers() {
  return (
    <section
      id="answers"
      aria-labelledby="answers-heading"
      className="under-ink before-sheet scroll-mt-16 bg-surface"
    >
      <div className={shell}>
        <div className={sectionGrid}>
          <div data-reveal className={headingColumn}>
            <h2 id="answers-heading" className={titleHeading}>
              {ANSWERS.heading}
            </h2>
            <p className={sectionLead}>{ANSWERS.lead}</p>
            <p>
              <TrackedLink
                href={CTA.href}
                event="cta_click"
                location="contact-answers"
                className={textLinkStyles}
              >
                {CTA.label}
              </TrackedLink>
            </p>
          </div>

          <ul data-reveal className="grid gap-5 md:col-span-4">
            {ANSWERS.items.map(({ question, answer }, index) => {
              const Icon = ICONS[index] ?? UserRound
              const words =
                index === ANSWERS.items.length - 1 && SITE.contactReplies
                  ? ANSWERS.listReplies
                  : answer
              return (
                <li
                  key={question}
                  style={revealDelay(index)}
                  className={`glow-corner contact-answer overflow-clip ${cardWash} ${cardPad}`}
                >
                  <span aria-hidden="true" className={`${iconDisc} max-md:size-10`}>
                    <Icon className="size-6" />
                  </span>
                  {/* The same glyph drawn large in the card's lower corner, as Straight answers
                      draws it: a hairline in the ramp's ice, under the words, cut by the edge. */}
                  <Icon
                    aria-hidden="true"
                    strokeWidth={0.3}
                    className="pointer-events-none absolute -right-8 -bottom-10 -z-1 size-40 text-surface-wash-deep"
                  />
                  <h3 className={cardHeading}>{question}</h3>
                  <p className={cardBody}>{words}</p>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
