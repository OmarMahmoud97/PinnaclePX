import type { LucentContent } from '../copy-slots'
import { Arrow, Eyebrow, MaskHeading, Picture } from './ui'

// The blocks before the footer, in the source's order: the questions, the promise card and the
// picture card with its email form.

// The source's questions: <details> rows whose answers ease open and shut (sections/faq.ts), the
// plus turning into a minus.
export function LucentFaq({ faq }: Pick<LucentContent, 'faq'>) {
  return (
    <section className="lc-faq" id="faq">
      <div className="lc-faq__head">
        <Eyebrow>{faq.label}</Eyebrow>
        <MaskHeading>{faq.heading}</MaskHeading>
      </div>
      <div className="lc-faq__list">
        {faq.items.map((item) => (
          <details className="lc-qa" key={item.question}>
            <summary>
              {item.question}
              <i aria-hidden="true" />
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

// The source's privacy card: one line, its first words bold, and a row of pills under it that
// lift and tip under the pointer.
export function LucentPromise({ promise }: Pick<LucentContent, 'promise'>) {
  return (
    <section className="lc-privacy">
      <div className="lc-privacy__card" data-reveal="">
        <p className="lc-privacy__line">
          <strong>{promise.lead}</strong> {promise.text}
        </p>
        <ul className="lc-privacy__badges">
          {promise.badges.map((badge) => (
            <li key={badge}>{badge}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// The source's journal card: a wide picture, the whole of it a link, with a caption of three
// lines that rise out of a blur, a line under them and a round button, and on a desktop the email
// form lying on the picture (on a tablet the picture turns square and the form lies along its
// foot; on a phone the form drops under it). The source's form joined its newsletter; here it
// opens a mail message to the owner when their address is known, and otherwise leads to the
// footer's ask. The full-picture link is for the pointer only: the caption and the round button
// are the same link for a keyboard and a reader.
export function LucentJournal({ journal }: Pick<LucentContent, 'journal'>) {
  const { form, link } = journal
  const { email } = form
  return (
    <section className="lc-jrn">
      <div className="lc-jrn__wrap" data-reveal="">
        <div className="lc-jrn__card">
          <Picture
            image={journal.image}
            className="lc-jrn__shot"
            sizes="(max-width: 1320px) 90vw, 1152px"
            alt=""
          />
          <a className="lc-jrn__hit" href={link.href} tabIndex={-1} aria-hidden="true" />
          <div className="lc-jrn__lede">
            <a className="lc-jrn__cap" data-rise="lines" href={link.href}>
              {journal.lines.map((line, index) => (
                <span className="lc-jrn__line" key={`${String(index)}${line}`}>
                  <span className="lc-jrn__word">{line}</span>
                </span>
              ))}
            </a>
            <p className="lc-jrn__sub">{journal.sub}</p>
            <a className="lc-jrn__go" href={link.href} aria-label={link.label}>
              <Arrow />
            </a>
          </div>
        </div>

        <form
          className="lc-nl"
          id="contact-form"
          action={
            email === null
              ? '#contact'
              : `mailto:${email}?subject=${encodeURIComponent(form.heading)}`
          }
          method={email === null ? 'get' : 'post'}
          encType={email === null ? undefined : 'text/plain'}
        >
          <h3 className="lc-nl__note">{form.heading}</h3>
          <div className="lc-nl__row">
            <label className="sr-only" htmlFor="lc-nl-email">
              {form.placeholder}
            </label>
            <input
              className="lc-nl__input"
              id="lc-nl-email"
              type="email"
              name="email"
              placeholder={form.placeholder}
              autoComplete="email"
              required={email !== null}
            />
            <button className="lc-nl__btn" type="submit">
              {form.button}
            </button>
          </div>
          <p className="lc-nl__terms">{form.terms}</p>
          <p className="lc-nl__msg" aria-hidden="true" />
        </form>
      </div>
    </section>
  )
}
