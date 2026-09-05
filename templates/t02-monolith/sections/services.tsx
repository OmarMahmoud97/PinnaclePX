import Image from 'next/image'
import type { MonolithContent } from '../copy-slots'
import { card, cardDescriptionBase, cardHeaderTight, cardTitle, container } from '../styles'
import { Emphasis } from './emphasis'
import { ChartIcon, MagnifierIcon, WalletIcon } from './icons'

type Props = Pick<MonolithContent, 'services'>

const ICONS = [ChartIcon, WalletIcon, MagnifierIcon] as const

// The source's Services: heading and lead over a stack of three cards at the left, each with
// its illustration in a tinted rounded square beside a title and description, and a large
// picture at the right.
export function MonolithServices({ services }: Props) {
  return (
    <section id="services" className={`${container} py-24 sm:py-32`}>
      <div className="grid place-items-center gap-8 lg:grid-cols-[1fr_1fr]">
        <div>
          <h2 className="text-3xl font-bold md:text-4xl">
            <Emphasis heading={services.heading} />
          </h2>

          <p className="mt-4 mb-8 text-xl text-on-surface-muted">{services.lead}</p>

          <div className="flex flex-col gap-8">
            {services.items.map((item, index) => {
              const Icon = ICONS[index] ?? ChartIcon
              return (
                <div key={item.title} className={card}>
                  <div className={`${cardHeaderTight} items-start justify-start gap-4 md:flex-row`}>
                    <div className="mt-1 rounded-2xl bg-brand-deeper/20 p-1">
                      <Icon />
                    </div>
                    <div>
                      <h3 className={cardTitle}>{item.title}</h3>
                      <p className={`${cardDescriptionBase} mt-2`}>{item.body}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {services.image !== null && (
          <Image
            src={services.image.src}
            alt={services.image.alt}
            width={services.image.width}
            height={services.image.height}
            sizes="(min-width: 1024px) 600px, (min-width: 768px) 500px, 300px"
            className="w-[300px] object-contain md:w-[500px] lg:w-[600px]"
          />
        )}
      </div>
    </section>
  )
}
