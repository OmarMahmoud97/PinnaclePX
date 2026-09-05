import type { MonolithContent } from '../copy-slots'
import { button, container } from '../styles'
import { Emphasis } from './emphasis'

type Props = Pick<MonolithContent, 'cta'>

// The source's Cta: a full-width band on the muted surface, the heading and paragraph at the
// left and two buttons at the right.
export function MonolithCta({ cta }: Props) {
  return (
    <section id="cta" className="my-24 bg-surface-muted/50 py-16 sm:my-32">
      <div className={`${container} place-items-center lg:grid lg:grid-cols-2`}>
        <div className="lg:col-start-1">
          <h2 className="text-3xl font-bold md:text-4xl">
            <Emphasis heading={cta.heading} />
          </h2>
          <p className="mt-4 mb-8 text-xl text-on-surface-muted lg:mb-0">{cta.body}</p>
        </div>

        <div className="lg:col-start-2 [&>*+*]:mt-4">
          <a href={cta.primary.href} className={`w-full md:mr-4 md:w-auto ${button.default}`}>
            {cta.primary.label}
          </a>
          <a href={cta.secondary.href} className={`w-full md:w-auto ${button.outline}`}>
            {cta.secondary.label}
          </a>
        </div>
      </div>
    </section>
  )
}
