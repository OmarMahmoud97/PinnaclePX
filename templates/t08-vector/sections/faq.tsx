'use client'

import { type CSSProperties, useState } from 'react'
import type { VectorContent } from '../copy-slots'
import { anchored, pad } from '../styles'

type Props = Pick<VectorContent, 'faq'>

// The source's FAQ: a two-line heading that rises from 60px as the block comes up (from its top
// at three quarters to at half), then bordered rounded rows, each rising from 40px as it comes
// up (from 90% to 70%), a question beside a plus that turns to a cross over 0.3s when its
// answer opens on a grid row over 0.3s. Any number can be open at once, as the source allowed.
export function VectorFaq({ faq }: Props) {
  const [open, setOpen] = useState<readonly boolean[]>(faq.items.map(() => false))
  return (
    <section id="faq" className={`vector-faq ${anchored} bg-surface py-24 lg:py-32`}>
      <div className={`${pad} mx-auto max-w-4xl`}>
        <h2
          data-scrub="faq"
          data-trigger="section"
          data-start="75"
          data-end="50"
          style={{ '--from-y': '60px', '--start': '25vh', '--end': '50vh' } as CSSProperties}
          className="mb-12 text-center text-4xl font-medium tracking-tight text-on-surface lg:mb-16 lg:text-5xl"
        >
          {faq.heading.map((line, index) => (
            <span key={line}>
              {index > 0 && <br />}
              {line}
            </span>
          ))}
        </h2>
        <div className="flex flex-col gap-4">
          {faq.items.map((item, index) => {
            const isOpen = open[index] === true
            const panel = `vector-faq-${String(index)}`
            return (
              <div
                key={item.question}
                data-scrub
                data-start="90"
                data-end="70"
                style={
                  {
                    '--from-y': '40px',
                    '--start': '10vh',
                    '--end': '30vh',
                    '--ease': 'var(--vector-power3)',
                  } as CSSProperties
                }
                className="overflow-hidden rounded-2xl border border-on-surface/10"
              >
                <button
                  type="button"
                  onClick={() => {
                    setOpen((state) => state.map((value, i) => (i === index ? !value : value)))
                  }}
                  aria-expanded={isOpen}
                  aria-controls={panel}
                  className="flex w-full cursor-pointer items-center justify-between p-6 text-left"
                >
                  <span className="pr-4 text-lg font-medium text-on-surface">{item.question}</span>
                  <span
                    aria-hidden="true"
                    className={`relative h-6 w-6 shrink-0 text-on-surface transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}
                  >
                    <span className="absolute top-1/2 left-1/2 h-[1.5px] w-4 -translate-x-1/2 -translate-y-1/2 bg-current" />
                    <span className="absolute top-1/2 left-1/2 h-4 w-[1.5px] -translate-x-1/2 -translate-y-1/2 bg-current" />
                  </span>
                </button>
                <div
                  id={panel}
                  inert={!isOpen}
                  className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-6 leading-relaxed text-on-surface/70">{item.answer}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
