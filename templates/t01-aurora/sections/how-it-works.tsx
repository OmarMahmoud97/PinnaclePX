import type { AuroraContent } from '../copy-slots'
import { container, itemBody, itemTitle, sectionLead, sectionTitle } from '../styles'

type Props = Pick<AuroraContent, 'steps'>

// Three steps in order, so they are numbered, with a line down their side that draws itself in
// brand colour as the list scrolls into view (aurora.css). The heading stays put beside them on
// wider screens.
export function AuroraHowItWorks({ steps }: Props) {
  return (
    <section id="how-it-works" className="border-t border-border py-section">
      <div className={`${container} grid gap-12 md:grid-cols-12 md:gap-column`}>
        <div className="md:sticky md:top-24 md:col-span-5 md:self-start">
          <h2 className={sectionTitle}>{steps.title}</h2>
          <p className={sectionLead}>{steps.lead}</p>
        </div>

        <ol className="relative md:col-span-7">
          <span aria-hidden="true" className="absolute top-4 bottom-4 left-4 w-px bg-border" />
          <span
            aria-hidden="true"
            data-draw
            className="absolute top-4 bottom-4 left-4 w-px bg-brand-deeper"
          />
          {steps.items.map((step, index) => (
            <li key={step.title} className="relative pb-12 pl-14 last:pb-0">
              <span
                aria-hidden="true"
                className="absolute top-0 left-0 flex size-8 items-center justify-center rounded-full border border-border bg-surface font-display text-small font-semibold text-brand-deeper tabular-nums"
              >
                {index + 1}
              </span>
              <h3 className={`pt-0.5 ${itemTitle}`}>{step.title}</h3>
              <p className={itemBody}>{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
