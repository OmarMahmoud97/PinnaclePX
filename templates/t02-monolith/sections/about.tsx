import Image from 'next/image'
import type { MonolithContent } from '../copy-slots'
import { container } from '../styles'
import { Emphasis } from './emphasis'

type Props = Pick<MonolithContent, 'about'>

// The source's About: a muted, bordered panel with the picture at the left, the heading with
// its lit word and the paragraph at the right, and its Statistics beneath them, a large figure
// over a label in four columns.
export function MonolithAbout({ about }: Props) {
  return (
    <section id="about" className={`${container} py-24 sm:py-32`}>
      <div className="rounded-lg border border-border bg-surface-muted/50 py-12">
        <div className="flex flex-col-reverse gap-8 px-6 md:flex-row md:gap-12">
          {about.image !== null && (
            <Image
              src={about.image.src}
              alt={about.image.alt}
              width={about.image.width}
              height={about.image.height}
              sizes="300px"
              className="w-[300px] rounded-lg object-contain"
            />
          )}
          <div className="flex flex-col justify-between">
            <div className="pb-6">
              <h2 className="text-3xl font-bold md:text-4xl">
                <Emphasis heading={about.heading} />
              </h2>
              <p className="mt-4 text-xl text-on-surface-muted">{about.body}</p>
            </div>

            <div id="statistics">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
                {about.highlights.map((item) => (
                  <div key={item.label} className="text-center [&>*+*]:mt-2">
                    <p className="text-3xl font-bold sm:text-4xl">{item.value}</p>
                    <p className="text-xl text-on-surface-muted">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
