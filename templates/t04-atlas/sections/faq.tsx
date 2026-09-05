import Image from 'next/image'
import type { AtlasContent } from '../copy-slots'
import { eyebrow, section } from '../styles'
import { Mdi } from './mdi'

type Props = Pick<AtlasContent, 'faq'>

// The source's FAQ: the picture at the left, and at the right an eyebrow in the gradient, a
// heading and an accordion of questions under a thick rule, each with a chevron that turns as
// its answer slides open. Native disclosure elements in place of the source's toggled state, so
// no script is needed and the answers are in the page for search. Both halves slide in from
// their sides with a delay.
export function AtlasFaq({ faq }: Props) {
  return (
    <section id="faq" className="my-24 w-full">
      <div className={section}>
        <div data-fade="right" data-delay="1" className="col-span-12 lg:col-span-6">
          <div className="w-full">
            {faq.image !== null && (
              <Image
                src={faq.image.src}
                alt={faq.image.alt}
                width={faq.image.width}
                height={faq.image.height}
                sizes="(min-width: 1024px) 620px, 100vw"
                className="w-full"
              />
            )}
          </div>
        </div>
        <div
          data-fade="left"
          data-delay="1"
          className="col-span-12 mt-8 px-4 sm:px-6 lg:col-span-6"
        >
          <span className={`${eyebrow} mb-4 sm:mb-2`}>{faq.eyebrow}</span>
          <h2 className="mb-10 text-3xl font-semibold sm:mb-6 sm:text-4xl">{faq.heading}</h2>

          <ul>
            {faq.items.map((item) => (
              <li key={item.question} className="relative border-b-2 border-border">
                <details name="atlas-faq" className="group">
                  <summary className="w-full cursor-pointer list-none py-4 text-left [&::-webkit-details-marker]:hidden">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.question}</span>
                      <span className="group-open:hidden">
                        <Mdi name="chevronDown" size={20} />
                      </span>
                      <span className="hidden group-open:inline">
                        <Mdi name="chevronUp" size={20} />
                      </span>
                    </div>
                  </summary>
                  <div>
                    <div>
                      <div className="py-2">
                        <p className="text-sm leading-relaxed tracking-wide text-on-surface-muted">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
