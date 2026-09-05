import { FaqEntry } from '@/app/_components/faq-entry'
import { FAQ_ITEMS } from '@/app/_components/faq-items'
import { FAQ } from '@/app/_components/section-copy'
import { stickyColumn, titleHeading } from '@/app/_components/section-styles'

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-16">
      <div className="grid md:grid-cols-6 md:divide-x md:divide-border">
        <div className={`flex flex-col gap-3 p-column max-md:pb-3 md:col-span-2 ${stickyColumn}`}>
          <h2 className={titleHeading}>{FAQ.heading}</h2>
          <p className="text-lead text-pretty text-on-surface-muted">{FAQ.lead}</p>
        </div>
        <div className="divide-y divide-border p-column max-md:pt-6 md:col-span-4">
          {FAQ_ITEMS.map(({ question, answer, link }, index) => (
            <FaqEntry
              key={question}
              index={index}
              question={question}
              answer={answer}
              link={link}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
