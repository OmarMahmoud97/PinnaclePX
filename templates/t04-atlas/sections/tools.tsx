import Image from 'next/image'
import type { AtlasContent } from '../copy-slots'
import { button, paragraph } from '../styles'
import { Emphasis } from './emphasis'

type Props = Pick<AtlasContent, 'tools'>

// The source's Advanced trading tools: a rounded band on the faint haze with a shadow, the
// words at the left as a heading with a lit phrase over three titled points and two buttons,
// and the picture at the right (above the words on phones). The words slide in from the left
// and the picture from the right.
export function AtlasTools({ tools }: Props) {
  const picture =
    tools.image === null ? null : (
      <div className="w-full sm:mt-20 xl:mt-0">
        <Image
          src={tools.image.src}
          alt={tools.image.alt}
          width={tools.image.width}
          height={tools.image.height}
          sizes="(min-width: 1024px) 620px, 100vw"
          className="w-full"
        />
      </div>
    )
  return (
    <section
      id="tools"
      className="atlas-band relative my-20 max-w-full overflow-hidden rounded-2xl py-16 shadow sm:mx-4"
    >
      <div className="relative mx-auto grid max-w-(--breakpoint-xl) grid-cols-12 gap-x-6 px-4 sm:px-2">
        {picture !== null && <div className="col-span-12 sm:hidden lg:col-span-6">{picture}</div>}
        <div
          data-fade="right"
          className="col-span-12 mt-8 px-4 sm:px-6 lg:col-span-6 [&>*+*]:mt-8 sm:[&>*+*]:mt-6"
        >
          <h2 className="text-4xl font-semibold">
            <Emphasis heading={tools.heading} />
          </h2>
          {tools.items.map((item) => (
            <div key={item.title} className="[&>*+*]:mt-2">
              <h4 className="text-lg font-medium">{item.title}</h4>
              <p className={`${paragraph} text-sm xl:text-base`}>{item.body}</p>
            </div>
          ))}
          <div className="flex flex-col sm:flex-row">
            <a href={tools.primary.href} className={`${button.outlineBrand} px-10 py-4 text-base`}>
              {tools.primary.label}
            </a>
            <a href={tools.secondary.href} className={`${button.quiet} px-10 py-4`}>
              {tools.secondary.label}
            </a>
          </div>
        </div>
        {picture !== null && (
          <div data-fade="left" className="col-span-12 hidden sm:block lg:col-span-6">
            {picture}
          </div>
        )}
      </div>
    </section>
  )
}
