import Image from 'next/image'
import type { AtlasContent } from '../copy-slots'
import { Mdi } from './mdi'

type Props = Pick<AtlasContent, 'why'>

// The source's Industry-leading security: the picture at the left, and at the right a heading
// over three ticked titles, each with a line of small text under it. The picture slides in
// from the left and the words from the right.
export function AtlasWhy({ why }: Props) {
  return (
    <section id="why" className="my-24 w-full">
      <div className="relative mx-auto grid max-w-(--breakpoint-xl) grid-cols-12 gap-x-6 px-8">
        <div data-fade="right" className="col-span-12 lg:col-span-6">
          <div className="w-full">
            {why.image !== null && (
              <Image
                src={why.image.src}
                alt={why.image.alt}
                width={why.image.width}
                height={why.image.height}
                sizes="(min-width: 1024px) 620px, 100vw"
                className="w-full"
              />
            )}
          </div>
        </div>
        <div
          data-fade="left"
          className="col-span-12 mt-8 lg:col-span-5 xl:px-8 [&>*+*]:mt-8 sm:[&>*+*]:mt-6"
        >
          <h2 className="text-4xl font-semibold">{why.heading}</h2>
          <ul className="[&>*+*]:mt-8 sm:[&>*+*]:mt-4">
            {why.items.map((item) => (
              <li key={item.title} className="[&>*+*]:mt-2">
                <div className="flex items-center [&>*+*]:ml-2">
                  <Mdi name="checkCircle" size={20} className="text-brand-deeper" />
                  <span>{item.title}</span>
                </div>
                <p className="text-sm leading-relaxed text-on-surface-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
