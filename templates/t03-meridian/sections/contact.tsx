import { ChevronDown } from 'lucide-react'
import type { MeridianContent } from '../copy-slots'
import { fitWord } from '../fit'
import { button, card, container, eyebrow, input, label, textarea } from '../styles'

type Props = Pick<MeridianContent, 'contact'>

// The source's ContactSection: the words at the left with rows of a mark, a bold label and
// lines, and at the right a card on the card surface holding the form: first and last name side
// by side, email, a subject to choose, a message and a button, the name and email fields
// carrying their autofill tokens (decision 15). The source built a mail link from
// the fields; here the form posts to the owner's email as a mail message when it is known, and
// otherwise leads to the page's ask. The source's rows were an address, a phone number, an email
// and opening hours, each beside its icon; here they are the three steps after a first contact,
// so a building, a phone and an envelope read as details that are not there. Each step is
// numbered instead, in the icon's 24px place at the row's own size, the number hidden from
// screen readers (decision 1).
export function MeridianContact({ contact }: Props) {
  const { email } = contact.form
  return (
    <section id="contact" className={`${container} py-24 sm:py-32`}>
      <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <div className="mb-4">
            <p className={eyebrow}>{contact.eyebrow}</p>

            <h2 className="@container text-3xl font-bold md:text-4xl">
              <span className="meridian-fit" style={fitWord(contact.heading)}>
                {contact.heading}
              </span>
            </h2>
          </div>
          <p className="mb-8 text-on-surface-muted lg:w-5/6">{contact.lead}</p>

          <div className="flex flex-col gap-4">
            {contact.rows.map((row, index) => (
              <div key={row.title}>
                <div className={`flex gap-2 ${index === contact.rows.length - 1 ? '' : 'mb-1'}`}>
                  <span aria-hidden="true" className="w-6 shrink-0 font-bold text-brand-deeper">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="font-bold">{row.title}</div>
                </div>

                <div>
                  {row.lines.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`${card} bg-accent`}>
          {/* The source's card kept an empty header and footer, whose padding set the form 3rem
              in from the card's top and bottom edges; the padding alone does that here. */}
          <div className="px-6 py-12">
            <form
              className="grid w-full gap-4"
              action={
                email === null
                  ? '#community'
                  : `mailto:${email}?subject=${encodeURIComponent(contact.form.button)}`
              }
              method={email === null ? 'get' : 'post'}
              encType={email === null ? undefined : 'text/plain'}
            >
              <div className="flex flex-col gap-8 md:flex-row!">
                <div className="w-full [&>*+*]:mt-2">
                  <label htmlFor="meridian-first-name" className={label}>
                    First Name
                  </label>
                  <input
                    id="meridian-first-name"
                    name="firstName"
                    autoComplete="given-name"
                    className={input}
                  />
                </div>
                <div className="w-full [&>*+*]:mt-2">
                  <label htmlFor="meridian-last-name" className={label}>
                    Last Name
                  </label>
                  <input
                    id="meridian-last-name"
                    name="lastName"
                    autoComplete="family-name"
                    className={input}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="[&>*+*]:mt-2">
                  <label htmlFor="meridian-email" className={label}>
                    Email
                  </label>
                  <input
                    id="meridian-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className={input}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="[&>*+*]:mt-2">
                  <label htmlFor="meridian-subject" className={label}>
                    Subject
                  </label>
                  <div className="relative">
                    <select
                      id="meridian-subject"
                      name="subject"
                      autoComplete="off"
                      defaultValue={contact.form.subjects[0]}
                      className={`${input} appearance-none pr-8 [&>span]:line-clamp-1`}
                    >
                      {contact.form.subjects.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 opacity-50"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="[&>*+*]:mt-2">
                  <label htmlFor="meridian-message" className={label}>
                    Message
                  </label>
                  <textarea
                    id="meridian-message"
                    name="message"
                    autoComplete="off"
                    rows={5}
                    placeholder="Your message..."
                    className={`${textarea} resize-none`}
                  />
                </div>
              </div>

              <button type="submit" className={`${button.default} mt-4`}>
                {contact.form.button}
              </button>
            </form>
          </div>
        </div>
      </section>
    </section>
  )
}
