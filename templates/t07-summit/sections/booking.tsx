import { ArrowRight, ChevronDown } from 'lucide-react'
import type { SummitContent } from '../copy-slots'
import { anchored, delay, eyebrow, field, gap, label, pad, title } from '../styles'

type Props = Pick<SummitContent, 'booking'>

const SELECT =
  'w-full cursor-pointer appearance-none border border-on-surface/11 bg-transparent px-3 py-3 pr-10 text-xs text-on-surface/37 transition focus:border-on-surface/37 focus:outline-none'
const OPTION = 'text-sm text-on-surface/75'
const CHEVRON = 'pointer-events-none absolute right-3.5 text-on-surface/37'

// The source's Book an appointment: two halves from lg. At the left the eyebrow and the
// heading; at the right the form, rising after a longer wait: a grid of two columns from sm
// holding the name, the email, the phone, the person to see, the department and the date,
// each a small capital label over a bordered field (the two lists with a chevron at their
// right, their chosen line in the quieter grey), then a full-width dark button with an arrow.
// The source's form posted nowhere; here it posts to the owner's email as a mail message when
// it is known, and otherwise leads to the closing band. Where no people are listed the fourth
// field takes a typed name.
export function SummitBooking({ booking }: Props) {
  const { form } = booking
  const { sendTo } = form
  return (
    <section id="book-appointment" className={`${pad} ${anchored} ${gap}`}>
      <div className="mx-auto flex w-full max-w-275 flex-col items-start justify-between gap-16 lg:flex-row">
        <div className="flex flex-col items-start lg:w-1/2">
          <span data-fade style={delay(0.2)} className={eyebrow}>
            {booking.eyebrow}
          </span>
          <h2
            data-fade
            data-spring="soft"
            className={`${title} mt-6 max-w-md text-left text-4xl md:text-5xl`}
          >
            {booking.heading}
          </h2>
        </div>
        <div className="w-full lg:w-1/2">
          <form
            data-fade
            style={delay(0.4)}
            className="flex flex-col gap-6"
            action={
              sendTo === null
                ? '#cta'
                : `mailto:${sendTo}?subject=${encodeURIComponent(form.button)}`
            }
            method={sendTo === null ? 'get' : 'post'}
            encType={sendTo === null ? undefined : 'text/plain'}
          >
            <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="summit-name" className={label}>
                  {form.name.label}
                </label>
                <input
                  id="summit-name"
                  name="name"
                  type="text"
                  placeholder={form.name.placeholder}
                  className={field}
                />
              </div>
              <div>
                <label htmlFor="summit-email" className={label}>
                  {form.email.label}
                </label>
                <input
                  id="summit-email"
                  name="email"
                  type="email"
                  placeholder={form.email.placeholder}
                  className={field}
                />
              </div>
              <div>
                <label htmlFor="summit-phone" className={label}>
                  {form.phone.label}
                </label>
                <input
                  id="summit-phone"
                  name="phone"
                  type="tel"
                  placeholder={form.phone.placeholder}
                  className={field}
                />
              </div>
              <div className="relative">
                <label htmlFor="summit-doctor" className={label}>
                  {form.doctor.label}
                </label>
                {form.doctor.options === null ? (
                  <input
                    id="summit-doctor"
                    name="doctor"
                    type="text"
                    placeholder={form.doctor.placeholder}
                    className={field}
                  />
                ) : (
                  <div className="relative flex items-center">
                    <select
                      id="summit-doctor"
                      name="doctor"
                      defaultValue=""
                      className={`${SELECT} rounded-sm`}
                    >
                      <option value="" disabled className="text-xs text-on-surface/37">
                        {form.doctor.placeholder}
                      </option>
                      {form.doctor.options.map((option) => (
                        <option key={option} value={option} className={OPTION}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={18} aria-hidden="true" className={CHEVRON} />
                  </div>
                )}
              </div>
              <div className="relative">
                <label htmlFor="summit-department" className={label}>
                  {form.department.label}
                </label>
                <div className="relative flex items-center">
                  <select
                    id="summit-department"
                    name="department"
                    defaultValue=""
                    className={`${SELECT} rounded-md`}
                  >
                    <option value="" disabled className="text-xs text-on-surface/37">
                      {form.department.placeholder}
                    </option>
                    {form.department.options.map((option) => (
                      <option key={option} value={option} className={OPTION}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={18} aria-hidden="true" className={CHEVRON} />
                </div>
              </div>
              <div className="relative">
                <label htmlFor="summit-date" className={label}>
                  {form.date.label}
                </label>
                <input
                  id="summit-date"
                  name="date"
                  type="date"
                  className="w-full cursor-pointer rounded-md border border-on-surface/11 bg-transparent px-3 py-3 text-xs text-on-surface/37 transition focus:border-on-surface/37 focus:outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              className="group mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-brand-deeper py-4 text-sm font-medium text-on-brand transition hover:bg-brand-deepest"
            >
              {form.button}
              <ArrowRight
                size={20}
                strokeWidth={1.5}
                aria-hidden="true"
                className="transition group-hover:translate-x-1"
              />
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
