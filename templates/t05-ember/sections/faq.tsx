import { Plus, X } from 'lucide-react'
import type { EmberContent } from '../copy-slots'
import { anchored, delay, eyebrow, heading, pad } from '../styles'

type Props = Pick<EmberContent, 'faq'>

// The source's FAQ: an eyebrow and heading over a stack of bordered disclosure rows, each a
// question beside a small disc holding a plus that becomes a cross when open, and the answer
// under it. Native disclosure elements in the source too, so the answers are in the page for
// search; the rows rise in turn from further down as they arrive.
export function EmberFaq({ faq }: Props) {
  return (
    <section id="faq" className={`${pad} ${anchored} mt-44`}>
      <div className="mx-auto max-w-3xl">
        <div className="mb-14 text-center">
          <div data-fade style={delay(0.2)}>
            <p className={`${eyebrow} mb-4`}>{faq.eyebrow}</p>
          </div>
          <div data-fade style={delay(0.2)}>
            <h2 className={`${heading} mx-auto max-w-lg text-balance`}>{faq.heading}</h2>
          </div>
        </div>
        <div className="space-y-3">
          {faq.items.map((item, index) => (
            <div key={item.question} data-fade="up-lg" style={delay(0.15 * index)}>
              <details className="group rounded-lg border border-border text-on-surface/55">
                <summary className="flex cursor-pointer list-none items-center justify-between p-4 transition-colors hover:bg-surface-muted/50 [&::-webkit-details-marker]:hidden">
                  <span className="pr-4 text-on-surface/75">{item.question}</span>
                  <span className="grid size-7 shrink-0 place-content-center rounded-full bg-on-surface/5">
                    <Plus aria-hidden="true" className="group-open:hidden" />
                    <X aria-hidden="true" className="hidden group-open:block" />
                  </span>
                </summary>
                <p className="px-5 pb-4 leading-relaxed">{item.answer}</p>
              </details>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
