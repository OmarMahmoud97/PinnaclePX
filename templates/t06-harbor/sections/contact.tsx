import { Minus, Plus, Send } from 'lucide-react'
import type { HarborContent } from '../copy-slots'
import { container, eyebrow, heading, motion, section } from '../styles'
import { HeadingLines } from './lines'

type Props = Pick<HarborContent, 'contact'>

const FIELD =
  'w-full rounded-xl border border-on-surface/10 bg-surface px-4 py-3 text-sm text-on-surface transition-colors placeholder:text-on-surface/40 focus:border-brand-deeper/50 focus:outline-none'
const LABEL = 'mb-2 block text-xs font-semibold tracking-wider text-on-surface/40 uppercase'

// The source's Contact: two columns from lg. At the left the eyebrow, the heading and the
// questions, each a row under a hairline with a small ringed plus that becomes a filled minus
// when open, the question turning to the accent and the answer sliding open; the source
// toggled each by state, these are native disclosure rows (harbor.css). At the right, sliding
// in from the right, a card with the eyebrow, a heading, a line and the form: name and email
// side by side from sm, a message, and a round accent button. The source posted the form to a
// form service under a placeholder id and showed a toast; here it posts to the owner's email
// as a mail message when it is known, and otherwise leads to the page's ask.
export function HarborContact({ contact }: Props) {
  const { form } = contact
  const { email } = form
  return (
    <section id="contact" className={`${section} bg-surface`}>
      <div className={container}>
        <div className="grid grid-cols-1 gap-20 lg:grid-cols-2">
          <div>
            <div data-fade data-margin="-80px">
              <span className={`${eyebrow} mb-4`}>{contact.eyebrow}</span>
            </div>
            <div data-fade data-margin="-80px" style={motion(0.1)}>
              <h2 className={`${heading} mb-10`}>
                <HeadingLines heading={contact.heading} />
              </h2>
            </div>
            <div>
              {contact.faq.map((item, index) => (
                <div
                  key={item.question}
                  data-fade
                  style={motion(0.06 * index, '20px', 0.4, 'out')}
                  className="border-b border-border"
                >
                  <details className="group">
                    <summary className="flex w-full cursor-pointer list-none items-start justify-between gap-4 py-6 text-left [&::-webkit-details-marker]:hidden">
                      <span className="harbor-faq-question text-base font-semibold text-on-surface transition-colors duration-200 group-open:text-brand-deeper">
                        {item.question}
                      </span>
                      <div className="harbor-faq-disc flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-on-surface/16 text-on-surface/50 transition-all duration-200 group-open:border-brand-deeper group-open:bg-brand-deeper group-open:text-on-brand">
                        <Plus size={12} aria-hidden="true" className="group-open:hidden" />
                        <Minus size={12} aria-hidden="true" className="hidden group-open:block" />
                      </div>
                    </summary>
                    <div>
                      <div>
                        <p className="pb-6 text-sm leading-relaxed text-on-surface/60">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </div>
          <div data-fade="right" data-margin="-80px" style={motion(0, undefined, 0.7)}>
            <div className="rounded-2xl border border-border bg-accent p-8 md:p-10">
              <span className={`${eyebrow} mb-4`}>{form.eyebrow}</span>
              <h3 className="mb-2 font-display text-3xl leading-tight font-black text-on-surface uppercase md:text-4xl">
                <HeadingLines heading={form.heading} />
              </h3>
              <p className="mb-8 text-sm text-on-surface/50">{form.lead}</p>
              <form
                className="space-y-5"
                action={
                  email === null
                    ? '#cta'
                    : `mailto:${email}?subject=${encodeURIComponent(form.button)}`
                }
                method={email === null ? 'get' : 'post'}
                encType={email === null ? undefined : 'text/plain'}
              >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="harbor-name" className={LABEL}>
                      {form.labels.name}
                    </label>
                    <input
                      id="harbor-name"
                      name="name"
                      type="text"
                      required
                      placeholder="John Doe"
                      className={FIELD}
                    />
                  </div>
                  <div>
                    <label htmlFor="harbor-email" className={LABEL}>
                      {form.labels.email}
                    </label>
                    <input
                      id="harbor-email"
                      name="email"
                      type="email"
                      required
                      placeholder="john@example.com"
                      className={FIELD}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="harbor-message" className={LABEL}>
                    {form.labels.message}
                  </label>
                  <textarea
                    id="harbor-message"
                    name="message"
                    required
                    rows={5}
                    placeholder={form.placeholder}
                    className={`${FIELD} resize-none`}
                  />
                </div>
                <button
                  type="submit"
                  className="harbor-glow-d flex w-full items-center justify-center gap-2 rounded-full bg-brand-deeper py-4 font-display text-sm font-black tracking-wider text-on-brand uppercase transition-all duration-200 hover:scale-[1.02] hover:bg-brand-deepest active:scale-[0.98]"
                >
                  {form.button} <Send size={14} aria-hidden="true" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
