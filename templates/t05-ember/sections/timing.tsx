import type { CSSProperties } from 'react'
import type { EmberContent } from '../copy-slots'
import { anchored, delay, pad, pill } from '../styles'

type Props = Pick<EmberContent, 'timing'>

// The source's Timing: a tall rounded photograph, scaling up as it arrives, holding a card of
// the page surface at its left from md (centred below) with a title, a row per day of the week
// (the closed day quieter) rising in turn, and the round button. Without the rows the card
// carries a sentence; without the photograph the block is the quieter surface. The source's
// rows were a faded black that falls below WCAG AA on a light page, so they are the muted text
// colour, and the closed day is quieter by its weight rather than a fainter grey (decision 15).
export function EmberTiming({ timing }: Props) {
  const background: CSSProperties | undefined =
    timing.image === null ? undefined : { backgroundImage: `url(${timing.image.src})` }
  return (
    <section id="timing" className={`${pad} ${anchored} mt-44`}>
      <div
        data-fade="scale"
        className={`mx-auto flex h-162.5 w-full max-w-5xl items-center justify-center overflow-hidden rounded-3xl bg-cover bg-center px-6 md:justify-start md:px-14 ${timing.image === null ? 'bg-surface-muted' : ''}`}
        style={background}
      >
        <div className="w-full max-w-xs rounded-3xl bg-surface p-8">
          <div data-fade style={delay(0.2)}>
            <h3 className="mb-8 text-xl font-medium">{timing.title}</h3>
          </div>
          {timing.rows === null ? (
            <div data-fade>
              <p className="text-on-surface-muted">{timing.body}</p>
            </div>
          ) : (
            <div className="space-y-7">
              {timing.rows.map((row, index) => (
                <div
                  key={row.label}
                  data-fade
                  style={delay(0.15 * index)}
                  className="flex items-center justify-between"
                >
                  <span className="font-medium text-on-surface-muted">{row.label}</span>
                  <span
                    className={`text-on-surface-muted ${row.closed ? 'font-normal' : 'font-medium'}`}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div data-fade style={delay(0.2)} className="mt-12 flex justify-center">
            <a href={timing.cta.href} className={`${pill} font-medium`}>
              {timing.cta.label}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
