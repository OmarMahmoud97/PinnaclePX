import type { InegroContent } from '../copy-slots'

type Props = { newsletter: InegroContent['newsletter'] }

// The source's email form: a heading and one field beside its button, centred. The source sent
// the address to its mailing list; here the form opens a mail message to the owner when their
// address is known, and otherwise leads to the closing band, the page's ask.
export function InegroNewsletter({ newsletter }: Props) {
  const { email } = newsletter
  return (
    <section
      id="newsletter"
      className="inegro-block inegro-newsletter inegro-stack-row"
      data-stack="row"
      aria-labelledby="newsletter-label"
    >
      <div className="inegro-inner">
        <div className="inegro-form-max">
          <h2 id="newsletter-label">
            <span>{newsletter.heading}</span>
          </h2>
          <div className="inegro-form">
            <form
              action={
                email === null
                  ? '#contact'
                  : `mailto:${email}?subject=${encodeURIComponent(newsletter.button)}`
              }
              method={email === null ? 'get' : 'post'}
              encType={email === null ? undefined : 'text/plain'}
            >
              <div className="inegro-form-field">
                <label className="sr-only" htmlFor="newsletter-email">
                  {newsletter.placeholder}
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder={newsletter.placeholder}
                  required={email !== null}
                />
              </div>
              <div className="inegro-form-submit">
                <button type="submit" className="inegro-btn">
                  {newsletter.button}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
