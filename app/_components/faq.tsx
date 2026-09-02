import { ChevronDown } from 'lucide-react'
import { FAQ_ITEMS } from '@/app/_components/faq-items'

// Native disclosure elements: no JavaScript, keyboard accessible by default.
export function Faq() {
  return (
    <section id="faq" className="w-full">
      <div className="grid divide-border md:grid-cols-6 lg:divide-x">
        <div className="flex flex-col gap-4 p-8 md:col-span-2 md:p-12">
          <h2 className="text-3xl font-medium tracking-tighter text-balance md:text-4xl lg:text-5xl">
            Frequently asked questions
          </h2>
          <p className="font-medium text-balance text-on-surface-muted">
            Answers to common questions about PinnaclePX. If yours is not here, get in touch.
          </p>
        </div>
        <div className="divide-y divide-border p-8 md:col-span-4 md:p-12">
          {FAQ_ITEMS.map(({ question, answer }) => (
            <details key={question} className="group py-4 first:pt-0 last:pb-0">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-md font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
                {question}
                <ChevronDown
                  aria-hidden="true"
                  className="size-4 shrink-0 translate-y-0.5 text-on-surface-muted transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <p className="pt-3 text-sm leading-relaxed text-on-surface-muted">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
