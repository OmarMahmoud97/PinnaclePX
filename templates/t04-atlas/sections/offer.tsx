import Image from 'next/image'
import type { AtlasContent } from '../copy-slots'
import { button, paragraph, section } from '../styles'
import { Emphasis } from './emphasis'
import { Mdi } from './mdi'

type Props = Pick<AtlasContent, 'offer'>

// The source's credit card: the picture at the left, seven columns wide, and at the right a
// heading with a lit phrase, a line, three ticked points and an outline button. The whole
// section drops in from above as it arrives.
export function AtlasOffer({ offer }: Props) {
  return (
    <section id="offer" className="my-36 w-full">
      <div data-fade="down" className={section}>
        <div className="col-span-12 lg:col-span-7">
          <div className="w-full">
            {offer.image !== null && (
              <Image
                src={offer.image.src}
                alt={offer.image.alt}
                width={offer.image.width}
                height={offer.image.height}
                sizes="(min-width: 1024px) 720px, 100vw"
                className="w-[95%]"
              />
            )}
          </div>
        </div>
        <div className="col-span-12 mt-20 px-4 sm:px-6 lg:col-span-5 [&>*+*]:mt-6">
          <h2 className="text-4xl font-semibold">
            <Emphasis heading={offer.heading} />
          </h2>
          <p className={paragraph}>{offer.body}</p>
          <ul className="[&>*+*]:mt-4 sm:[&>*+*]:mt-2">
            {offer.points.map((point) => (
              <li key={point} className="[&>*+*]:mt-2">
                <div className="flex items-center [&>*+*]:ml-2">
                  <Mdi name="checkCircle" size={20} className="text-brand-deeper" />
                  <span>{point}</span>
                </div>
              </li>
            ))}
          </ul>
          <a
            href={offer.action.href}
            className={`${button.outline} w-full px-10 py-4 text-base sm:max-w-[240px]`}
          >
            {offer.action.label}
          </a>
        </div>
      </div>
    </section>
  )
}
