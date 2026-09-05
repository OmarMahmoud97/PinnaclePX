import type { MonolithContent } from '../copy-slots'
import { button, container, input } from '../styles'
import { Emphasis } from './emphasis'

type Props = { newsletter: NonNullable<MonolithContent['newsletter']> }

// The source's Newsletter: a rule above and below, a large centred heading with its lit word, a
// lead, and one input beside a button. The source logged the submission; here the form opens a
// mail message to the owner when their email is known, and otherwise leads to the page's ask.
export function MonolithNewsletter({ newsletter }: Props) {
  const { email } = newsletter
  return (
    <section id="newsletter">
      <hr className="mx-auto w-11/12 border-border" />

      <div className={`${container} py-24 sm:py-32`}>
        <h3 className="text-center text-4xl font-bold md:text-5xl">
          <Emphasis heading={newsletter.heading} />
        </h3>
        <p className="mt-4 mb-8 text-center text-xl text-on-surface-muted">{newsletter.lead}</p>

        <form
          className="mx-auto flex w-full flex-col gap-4 md:w-6/12 md:flex-row md:gap-2 lg:w-4/12"
          action={
            email === null
              ? '#cta'
              : `mailto:${email}?subject=${encodeURIComponent(newsletter.button)}`
          }
          method={email === null ? 'get' : 'post'}
          encType={email === null ? undefined : 'text/plain'}
        >
          <input
            type="email"
            name="email"
            placeholder={newsletter.placeholder}
            className={`${input} bg-surface-muted/80`}
            aria-label="email"
          />
          <button type="submit" className={button.default}>
            {newsletter.button}
          </button>
        </form>
      </div>

      <hr className="mx-auto w-11/12 border-border" />
    </section>
  )
}
