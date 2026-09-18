import { CircleCheck } from 'lucide-react'
import Image from 'next/image'
import type { SummitContent } from '../copy-slots'
import { anchored, delay, eyebrow, gap, pad, title } from '../styles'

type Props = Pick<SummitContent, 'services'>

// The source's Our services: an eyebrow and heading, then the deck. Each card is sticky, the
// first at 96px from the top and each after it 40px lower, so as the page scrolls each card
// slides up over the one before and they stack, every other one tinted. A card holds a white
// pill, a title, a line and a checklist at the left and a tall picture at the right (below md
// the picture goes under the text). The deck rises from 100px as it arrives. Without a
// picture a block of the page surface holds its place.
export function SummitServices({ services }: Props) {
  return (
    <section id="our-services" className={`${pad} ${anchored} ${gap}`}>
      <div className="mx-auto flex max-w-6xl flex-col items-center">
        <p data-fade style={delay(0.2)} className={eyebrow}>
          {services.eyebrow}
        </p>
        <h2 data-fade data-spring="soft" className={`${title} mt-6 max-w-xl text-center text-5xl`}>
          {services.heading}
        </h2>
        <div
          data-fade="100"
          style={delay(0.2)}
          className="relative mt-16 flex w-full max-w-6xl flex-col gap-8 md:gap-12"
        >
          {services.items.map((item, index) => (
            <div
              key={item.tag}
              className={`sticky top-24 flex flex-col items-stretch justify-between gap-8 rounded-3xl p-4 pl-8 md:flex-row md:gap-12 lg:gap-16 ${index % 2 === 0 ? 'bg-surface-muted' : 'bg-accent'}`}
              style={{ top: index === 0 ? undefined : 40 * index + 96 }}
            >
              <div className="flex grow flex-col justify-center">
                <span className="w-fit rounded-lg bg-surface px-3.5 py-1 text-on-surface/85">
                  {item.tag}
                </span>
                <h3 className="mt-6 max-w-104 font-display text-3xl leading-tight font-medium tracking-tight text-on-surface/85 md:text-[40px]">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-94 text-sm text-on-surface/55">{item.body}</p>
                <div className="mt-8 flex flex-col gap-3.5">
                  {item.checklist.map((line) => (
                    <div key={line} className="flex items-center gap-3">
                      <CircleCheck
                        size={20}
                        strokeWidth={1.5}
                        aria-hidden="true"
                        className="text-on-surface/37"
                      />
                      <span className="text-sm text-on-surface/55">{line}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div
                className={`relative h-64 w-full shrink-0 overflow-hidden rounded-xl sm:h-80 md:h-112 md:w-[50%] xl:w-144.75 ${item.image === null ? 'bg-surface' : ''}`}
              >
                {item.image !== null && (
                  <Image
                    src={item.image.src}
                    alt={item.image.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
