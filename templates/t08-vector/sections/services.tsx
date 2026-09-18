import type { CSSProperties } from 'react'
import type { VectorContent } from '../copy-slots'
import { pad } from '../styles'
import { VectorMenu } from './menu'

type Props = Pick<VectorContent, 'services'> & { href: string }

// The source's Services: a sentence that fills a screen and stays pinned while the page
// scrolls a screen and a half, each of its letters growing up from its foot a twentieth of a
// second after the last, tied to the scroll (the block is the two and a half screens tall, the
// sentence sticks inside it, and the letters run on the block's timeline, vector.css); then the
// flowing menu. Words are kept whole so a line never breaks inside one.
export function VectorServices({ services, href }: Props) {
  const words = services.heading.split(' ')
  const total = words.reduce(
    (sum, word, w) => sum + Array.from(word).length + (w < words.length - 1 ? 1 : 0),
    0,
  )
  let count = 0
  return (
    <section id="services" className="vector-services services relative bg-surface">
      <div className="vector-pin h-[250vh]">
        <div className={`sticky top-0 flex min-h-screen items-center justify-center ${pad}`}>
          <h2
            style={{ '--n': String(total) } as CSSProperties}
            className="max-w-350 text-center text-[clamp(2.5rem,7vw,7rem)] leading-[1.1] font-medium tracking-tight text-on-surface"
          >
            {words.map((word, w) => (
              <span key={`${word}-${String(w)}`} className="inline-block whitespace-nowrap">
                {[...Array.from(word), ...(w < words.length - 1 ? [' '] : [])].map((letter, l) => {
                  const i = count
                  count += 1
                  return (
                    <span
                      key={`${String(w)}-${String(l)}`}
                      className="vector-char char inline-block"
                      style={{ '--i': String(i) } as CSSProperties}
                    >
                      {letter === ' ' ? ' ' : letter}
                    </span>
                  )
                })}
              </span>
            ))}
          </h2>
        </div>
      </div>
      <VectorMenu items={services.items} href={href} />
    </section>
  )
}
