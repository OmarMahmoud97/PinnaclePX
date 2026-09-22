import { FaqEntry } from '@/app/_components/faq-entry'
import { FAQ_ITEMS } from '@/app/_components/faq-items'
import { FAQ } from '@/app/_components/section-copy'
import { headingColumn, sectionGrid, titleHeading } from '@/app/_components/section-styles'

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-16">
      <div className={sectionGrid}>
        <div className={headingColumn}>
          <h2 className={titleHeading}>{FAQ.heading}</h2>
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
