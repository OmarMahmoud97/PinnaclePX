import { revealDelay } from '@/app/_components/reveal'
import { STRAIGHT_ANSWERS } from '@/app/_components/section-copy'
import { cardHeading, titleHeading } from '@/app/_components/section-styles'
import { straightAnswerItems } from '@/app/_components/straight-answer-items'
import { READY_TEMPLATES } from '@/templates/registry'

// The sceptic's questions in their words. The 2x2 hairline grid is the only Q&A grid on the page.
export function StraightAnswers() {
  const items = straightAnswerItems(READY_TEMPLATES.length)
  return (
    <section id="straight-answers" className="scroll-mt-16">
      <div className="grid md:grid-cols-6 md:divide-x md:divide-border">
        <div className="flex flex-col gap-3 p-column max-md:pb-3 md:col-span-2">
          <h2 className={titleHeading}>{STRAIGHT_ANSWERS.heading}</h2>
          <p className="text-lead text-pretty text-on-surface-muted">{STRAIGHT_ANSWERS.lead}</p>
        </div>

        {/* gap-px over a border-coloured background draws the hairlines between cells. */}
        <ul data-reveal className="grid gap-px bg-border md:col-span-4 md:grid-cols-2">
          {items.map(({ question, answer, Icon }, index) => (
            <li
              key={question}
              style={revealDelay(index)}
              className="flex flex-col gap-3 bg-surface p-5 md:p-cell"
            >
              <h3 className={`${cardHeading} flex items-center gap-2.5`}>
                <Icon aria-hidden="true" className="size-5 shrink-0 text-brand-deeper" />
                {question}
              </h3>
              <p className="text-body text-pretty text-on-surface-muted">{answer}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
