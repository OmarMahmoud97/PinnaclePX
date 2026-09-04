import type { AuroraContent } from '../copy-slots'
import { container, itemBody, itemTitle, sectionLead, sectionTitle } from '../styles'
import { AuroraField } from './aurora-field'

type Props = Pick<AuroraContent, 'features'>

// Three rows of a list, two done and one waiting: the shape of work getting done, in no
// language, so it belongs to any product. Drawn from tokens.
function RowsMotif() {
  const rows = [
    { width: 'w-3/5', done: true },
    { width: 'w-2/5', done: true },
    { width: 'w-1/2', done: false },
  ] as const
  return (
    <div aria-hidden="true" className="flex flex-col gap-2">
      {rows.map(({ width, done }) => (
        <div
          key={width}
          className="flex items-center gap-3 rounded-xl border border-on-surface/8 bg-surface/70 px-4 py-3"
        >
          <span
            className={`flex size-5 shrink-0 items-center justify-center rounded-full ${done ? 'bg-brand-deeper text-on-brand' : 'border border-on-surface/20'}`}
          >
            {done && (
              <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor">
                <path d="M2.5 6.5l2.5 2.5 4.5-5" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            )}
          </span>
          <span className={`h-2 ${width} rounded-full bg-on-surface/15`} />
          <span
            className={`ml-auto h-5 w-9 shrink-0 rounded-full p-0.5 ${done ? 'bg-brand-deeper' : 'bg-on-surface/15'}`}
          >
            <span
              className={`block size-4 rounded-full ${done ? 'translate-x-4 bg-on-brand' : 'bg-surface'}`}
            />
          </span>
        </div>
      ))}
    </div>
  )
}

// The first feature gets the panel, the light and the motif; the other two are quieter, each
// under its own rule, so the three read as one lead and two supporting points rather than three
// identical cards.
export function AuroraFeatures({ features }: Props) {
  const [lead, ...rest] = features.items
  return (
    <section id="features" className="border-t border-border py-section">
      <div className={container}>
        <h2 className={sectionTitle}>{features.title}</h2>
        <p className={sectionLead}>{features.lead}</p>

        <div className="mt-12 grid gap-8 md:grid-cols-5 md:gap-column">
          <article className="relative isolate overflow-hidden rounded-3xl border border-border bg-surface-muted p-6 md:col-span-3 md:p-10">
            <AuroraField variant="glow" />
            <RowsMotif />
            <h3 className={`mt-8 ${itemTitle}`}>{lead.title}</h3>
            <p className={itemBody}>{lead.body}</p>
          </article>

          <div className="flex flex-col justify-center gap-8 md:col-span-2 md:gap-column">
            {rest.map((item) => (
              <article key={item.title} className="border-t border-brand-deeper/50 pt-6">
                <h3 className={itemTitle}>{item.title}</h3>
                <p className={itemBody}>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
