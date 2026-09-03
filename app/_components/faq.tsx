import { FaqEntry } from '@/app/_components/faq-entry'
import { FAQ_ITEMS } from '@/app/_components/faq-items'

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-16">
      <div className="grid divide-border md:grid-cols-6 lg:divide-x">
        <div className="flex flex-col gap-4 p-8 md:sticky md:top-16 md:col-span-2 md:self-start md:p-12">
          <h2 className="text-3xl font-medium tracking-tighter text-balance md:text-4xl lg:text-5xl">
            Frequently asked questions
          </h2>
          <p className="font-medium text-balance text-on-surface-muted">
            Anything else, ask on the call.
          </p>
        </div>
        <div className="divide-y divide-border p-8 md:col-span-4 md:p-12">
          {FAQ_ITEMS.map(({ question, answer }, index) => (
            <FaqEntry key={question} index={index} question={question} answer={answer} />
          ))}
        </div>
      </div>
    </section>
  )
}
