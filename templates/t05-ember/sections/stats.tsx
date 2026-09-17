import type { EmberContent } from '../copy-slots'
import { delay, pad } from '../styles'

type Props = Pick<EmberContent, 'stats'>

// The source's three numbered points: a large ordinal over a title and a light paragraph,
// centred, in a row from md. Each rises as it arrives.
export function EmberStats({ stats }: Props) {
  return (
    <section id="stats" className={`${pad} mt-32`}>
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-12 md:flex-row md:gap-25">
        {stats.map((item, index) => (
          <div
            key={item.title}
            data-fade
            style={delay(0.2)}
            className="flex flex-col items-center text-center"
          >
            <span className="text-6xl">{String(index + 1).padStart(2, '0')}</span>
            <h3 className="mt-5.5 text-2xl">{item.title}</h3>
            <p className="mt-3.5 max-w-72 font-light text-on-surface-muted">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
