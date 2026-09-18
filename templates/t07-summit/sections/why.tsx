import { Ambulance, HeartPulse, Hospital, Stethoscope } from 'lucide-react'
import Image from 'next/image'
import type { SummitContent } from '../copy-slots'
import { anchored, delay, eyebrow, pad, title } from '../styles'

type Props = Pick<SummitContent, 'why'>

// The source's four icons, in its order.
const ICONS = [Stethoscope, HeartPulse, Hospital, Ambulance] as const

// The source's Why choose us: an eyebrow and heading, then from lg three columns, two quiet
// cards, a picture, two more cards; below lg the cards and the picture stack. Each card is an
// icon in a white square over a title and a line, and takes a shade more under the pointer.
// The eyebrow, the heading and the grid rise as they arrive. Without a picture the middle
// column is a block of the quieter surface.
export function SummitWhy({ why }: Props) {
  const { image } = why
  const card = (index: number) => {
    const item = why.cards[index]
    const Icon = ICONS[index]
    if (item === undefined || Icon === undefined) return null
    return (
      <div
        key={item.title}
        className="flex min-h-56 flex-1 flex-col rounded-xl bg-surface-muted p-6 hover:bg-border/50"
      >
        <div className="flex size-11 items-center justify-center rounded bg-surface text-on-surface-muted">
          <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
        </div>
        <div className="mt-auto">
          <h3 className="text-lg font-medium text-on-surface/75">{item.title}</h3>
          <p className="mt-3 text-sm text-on-surface/55">{item.body}</p>
        </div>
      </div>
    )
  }
  return (
    <section id="why-choose-us" className={`${pad} ${anchored} mt-40`}>
      <div className="mx-auto flex max-w-7xl flex-col items-center">
        <p data-fade style={delay(0.2)} className={eyebrow}>
          {why.eyebrow}
        </p>
        <h2 data-fade data-spring="soft" className={`${title} mt-6 max-w-xl text-center text-5xl`}>
          {why.heading}
        </h2>
        <div
          data-fade
          data-spring="soft"
          style={delay(0.2)}
          className="mt-16 grid w-full max-w-md grid-cols-1 gap-3.5 md:max-w-2xl lg:max-w-6xl lg:grid-cols-3"
        >
          <div className="flex flex-col gap-3.5">
            {card(0)}
            {card(1)}
          </div>
          <div
            className={`relative h-80 min-h-80 w-full overflow-hidden rounded-xl sm:h-96 lg:h-full ${image === null ? 'bg-surface-muted' : ''}`}
          >
            {image !== null && (
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover object-center"
              />
            )}
          </div>
          <div className="flex flex-col gap-3.5">
            {card(2)}
            {card(3)}
          </div>
        </div>
      </div>
    </section>
  )
}
