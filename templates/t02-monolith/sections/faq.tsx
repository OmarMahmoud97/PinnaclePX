import { ChevronDown } from 'lucide-react'
import type { MonolithContent } from '../copy-slots'
import { container } from '../styles'
import { Emphasis } from './emphasis'

type Props = Pick<MonolithContent, 'faq'>

// The source's FAQ: a heading with its lit word, an accordion of questions with a chevron that
// turns and an answer that slides open, one at a time, and a line beneath inviting a question.
// Native disclosure elements in place of Radix, so no script is needed and the answers are in
// the page for search.
export function MonolithFaq({ faq }: Props) {
  return (
    <section id="faq" className={`${container} py-24 sm:py-32`}>
      <h2 className="mb-4 text-3xl font-bold md:text-4xl">
        <Emphasis heading={faq.heading} />
      </h2>

      <div className="w-full">
        {faq.items.map((item) => (
          <details key={item.question} name="monolith-faq" className="group border-b border-border">
            <summary className="flex flex-1 cursor-pointer list-none items-center justify-between py-4 text-left font-medium transition-all hover:underline [&::-webkit-details-marker]:hidden">
              {item.question}
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div>
              <div>
                <div className="pt-0 pb-4 text-[16px] text-on-surface-muted">{item.answer}</div>
              </div>
            </div>
          </details>
        ))}
      </div>

      <h3 className="mt-4 font-medium">
        {faq.prompt}{' '}
        <a
          href={faq.link.href}
          className="border-brand-deeper text-brand-deeper transition-all hover:border-b-2"
        >
          {faq.link.label}
        </a>
      </h3>
    </section>
  )
}
