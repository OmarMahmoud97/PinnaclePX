'use client'

import { Plus, X } from 'lucide-react'
import { useState } from 'react'
import type { SummitContent } from '../copy-slots'
import { anchored, delay, eyebrow, gap, pad, title } from '../styles'

type Props = Pick<SummitContent, 'faq'>

// The source's FAQ: an eyebrow and heading over a stack of bordered rows, each a question
// beside a small disc holding a plus that becomes a cross when open, and under it the answer,
// which opens and closes over half a second as its height and opacity go; one row is open at a
// time, and the open one closes when pressed again. The source kept the open row in state, as
// this does. The rows rise in turn from further down as they arrive. A closed answer is inert,
// so it is out of the tab order and off a reader's list.
export function SummitFaq({ faq }: Props) {
  const [open, setOpen] = useState(-1)
  return (
    <section id="faq" className={`flex items-center justify-center ${pad} ${anchored} ${gap}`}>
      <div className="w-full max-w-3xl">
        <div className="mb-14 text-center">
          <span data-fade style={delay(0.2)} className={eyebrow}>
            {faq.eyebrow}
          </span>
          <h2
            data-fade
            style={delay(0.2)}
            className={`${title} mt-6 max-w-2xl text-center text-4xl md:text-5xl`}
          >
            {faq.heading}
          </h2>
        </div>
        <div className="space-y-3">
          {faq.items.map((item, index) => {
            const isOpen = open === index
            const panel = `summit-faq-${String(index)}`
            return (
              <div key={item.question} data-fade="150" style={delay(0.15 * index)}>
                <div className="overflow-hidden rounded-lg border border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(isOpen ? -1 : index)
                    }}
                    aria-expanded={isOpen}
                    aria-controls={panel}
                    className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-surface-muted/50"
                  >
                    <span className="pr-4 text-sm text-on-surface/75">{item.question}</span>
                    <span className="shrink-0">
                      <span className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-on-surface/4">
                        {isOpen ? (
                          <X size={14} aria-hidden="true" className="text-on-surface/55" />
                        ) : (
                          <Plus size={14} aria-hidden="true" className="text-on-surface/55" />
                        )}
                      </span>
                    </span>
                  </button>
                </div>
                <div
                  id={panel}
                  inert={!isOpen}
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="px-5 py-4">
                    <p className="text-sm/6 text-on-surface/55">{item.answer}</p>
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
