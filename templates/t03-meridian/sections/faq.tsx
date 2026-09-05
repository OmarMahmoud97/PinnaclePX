import { Plus } from 'lucide-react'
import type { MeridianContent } from '../copy-slots'
import { container, eyebrow } from '../styles'

type Props = Pick<MeridianContent, 'faq'>

// The source's FAQSection: centred words over an accordion held to 700px whose items are
// rounded cards on the card surface, each with a plus that turns to a cross as its answer
// slides open, one at a time. Native disclosure elements in place of Radix, so no script is
// needed and the answers are in the page for search.
export function MeridianFaq({ faq }: Props) {
  return (
    <section id="faq" className={`${container} py-24 sm:py-32 md:w-[700px]`}>
      <div className="mb-8 text-center">
        <h2 className={`${eyebrow} text-center`}>{faq.eyebrow}</h2>

        <h2 className="text-center text-3xl font-bold md:text-4xl">{faq.heading}</h2>
      </div>

      <div>
        {faq.items.map((item) => (
          <details
            key={item.question}
            name="meridian-faq"
            className="group my-4 rounded-lg border border-surface-muted bg-accent px-4"
          >
            <summary className="flex flex-1 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-medium transition-all hover:underline [&::-webkit-details-marker]:hidden">
              {item.question}
              <Plus className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-[135deg]" />
            </summary>
            <div>
              <div>
                <div className="pt-0 pb-4 text-[16px] text-on-surface-muted">{item.answer}</div>
              </div>
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}
