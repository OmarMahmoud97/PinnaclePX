import Image from 'next/image'
import type { MonolithContent } from '../copy-slots'
import { fitWord } from '../fit'
import { container, heading } from '../styles'
import { Emphasis } from './emphasis'

type Props = Pick<MonolithContent, 'about'>

// The source's About: a muted, bordered panel with the picture at the left, the heading with
// its lit word and the paragraph at the right, and its Statistics beneath them, a large figure
// over a label in four columns.
//
// Here the four are phrases of up to sixteen characters, not figures, and in the source's fixed
// columns a long one ran into the next or past its cell. So the columns follow the room the
// words have, not the screen: one, then two once the column beside the picture is 30rem wide,
// then four at 60rem. The phrases share one size, the smaller of 30px and the size at which the
// longest word fills its cell (fit.ts), so a word is never broken or cut.
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
          <div className="@container flex min-w-0 flex-col justify-between md:flex-1">
            <div className="pb-6">
              <h2 className={heading} style={fitWord([about.heading.text])}>
                <Emphasis heading={about.heading} />
              </h2>
              <p className="mt-4 text-xl text-on-surface-muted">{about.body}</p>
            </div>

            <div id="statistics">
              <div
                className="grid grid-cols-1 gap-8 @min-[30rem]:grid-cols-2 @min-[60rem]:grid-cols-4"
                style={fitWord(about.highlights.map((item) => item.value))}
              >
                {about.highlights.map((item) => (
                  <div key={item.label} className="@container text-center [&>*+*]:mt-2">
                    <p className="text-[length:min(1.875rem,97cqi/var(--monolith-word,1))] leading-[1.2] font-bold">
                      {item.value}
                    </p>
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
