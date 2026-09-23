import { FaqEntry } from '@/app/_components/faq-entry'
import { FAQ_ITEMS } from '@/app/_components/faq-items'
import { FAQ } from '@/app/_components/section-copy'
import { headingColumn, sectionGrid, shell, titleHeading } from '@/app/_components/section-styles'

// The questions left, on white (ADR 0034, plan 7.8). Each entry is a tinted card in a stack with
// air between, not a ruled list: a closed card sits on the wash, the open one turns white, lifts
// on the card shadow and lights in one corner, so the visitor's own choice is the only thing the
// band marks. The entrance is the CSS reveal alone; the choreography leaves this section be.
export function Faq() {
  return (
    <section id="faq" className="scroll-mt-16 bg-surface py-band">
      <div className={shell}>
        <div className={sectionGrid}>
          <div className={headingColumn}>
            <h2 className={titleHeading}>{FAQ.heading}</h2>
          </div>
          <div data-reveal className="flex flex-col gap-3 md:col-span-4">
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
      </div>
    </section>
  )
}
