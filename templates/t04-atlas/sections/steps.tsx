import Image from 'next/image'
import type { AtlasContent } from '../copy-slots'

type Props = Pick<AtlasContent, 'steps'>

// The source's arrow between steps, its arrow.png: a small ring, a dashed line and an
// arrowhead, in the brand colour. Drawn once and placed twice on wide screens.
function Arrow({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 152 24"
      className={`absolute top-32 hidden w-24 text-brand lg:inline-block xl:w-[9.5rem] ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="6" cy="12" r="4" />
      <path d="M14 12H136" strokeDasharray="6 6" />
      <path d="M136 6l10 6-10 6z" fill="currentColor" stroke="none" />
    </svg>
  )
}

// The source's Getting started: a rounded band on the faint haze with a centred heading that
// flips down, and three steps in a row, each a picture, a title and a line, joined by arrows
// from lg. Without a picture a step carries its number in a ring of the same size.
export function AtlasSteps({ steps }: Props) {
  return (
    <section
      id="how-it-works"
      className="atlas-band relative my-24 max-w-full overflow-hidden shadow sm:mx-4 sm:rounded-2xl xl:mx-10"
    >
      <div className="flex w-full flex-col items-center py-16">
        <h2 data-fade="flip" className="text-center text-3xl font-semibold sm:text-4xl">
          {steps.heading}
        </h2>
        <div
          data-fade="up"
          className="relative mt-16 flex w-full flex-col items-center justify-between px-4 sm:mt-8 lg:flex-row xl:px-10 [&>*+*]:mt-12 lg:[&>*+*]:mt-0"
        >
          {steps.items.map((step, index) => (
            <div
              key={step.title}
              className="max-w-[280px] text-center xl:max-w-[363px] [&>*+*]:mt-6 sm:[&>*+*]:mt-3"
            >
              {step.image === null ? (
                <span
                  aria-hidden="true"
                  className="atlas-blue-gradient mx-auto flex h-40 w-40 items-center justify-center rounded-full text-6xl font-bold text-on-brand"
                >
                  {index + 1}
                </span>
              ) : (
                <Image
                  src={step.image.src}
                  alt={step.image.alt}
                  width={step.image.width}
                  height={step.image.height}
                  sizes="245px"
                  className="mx-auto max-w-[245px]"
                />
              )}
              <h3 className="text-xl font-semibold text-on-surface">{step.title}</h3>
              <p className="text-sm leading-relaxed text-on-surface-muted">{step.body}</p>
            </div>
          ))}
          <Arrow className="left-64 xl:left-[22rem]" />
          <Arrow className="right-64 xl:right-[22rem]" />
        </div>
      </div>
    </section>
  )
}
