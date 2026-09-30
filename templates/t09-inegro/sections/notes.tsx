import type { CSSProperties } from 'react'
import type { InegroContent, InegroNote } from '../copy-slots'

type Props = { notes: InegroContent['notes'] }

// The source's two rising ribbons, in its own coordinates (1458.73 by 475.211): the yellow one
// that runs out to the right and the purple one that climbs to the top corner, with a light
// laid over the purple one that sweeps once along it.
const YELLOW =
  'M0,446.607H438.634a1362.28,1362.28,0,0,0,390.374-57.156c180.537-53.929,382.542-114.986,573.651-115.061q29.881,0,59.374,2.084l-1.012,14.463v-14.5h0v29h-.508l-.506-.036q-28.394-2.046-57.349-2.011c-185.132-.074-385.1,59.846-565.567,113.877a1390.457,1390.457,0,0,1-398.458,58.34H0Z'
const PURPLE =
  'M0,446.607H438.634q5.154,0,10.3-.038c278.579-2.108,548.6-98.361,769.125-271.223L1441.249.4l17.481,22.947-223.186,174.95C1010.153,374.97,734.1,473.409,449.15,475.568q-5.258.039-10.516.039H0Z'

// Where the last card rests: a fifth of the way along the purple ribbon (0.21 of its length),
// as a share of the ribbon's drawn width, so the stylesheet can place it with no script.
const REST = { x: 671.16 / 1458.73, y: 424.35 / 1458.73 }

function Note({ note, last }: { note: InegroNote; last: boolean }) {
  // The source's first three cards set their words in italics above the name; its last set
  // them upright, straight into the name.
  return (
    <div
      className="inegro-note"
      data-note=""
      data-rest={last ? '' : undefined}
      style={
        last ? ({ '--rest-x': REST.x, '--rest-y': REST.y } as unknown as CSSProperties) : undefined
      }
    >
      <p>
        {last ? note.text : <em>{note.text}</em>} <strong>{note.name}</strong> {note.role}
      </p>
    </div>
  )
}

// The band of quotes, as the band of notes: three principles and the company's statement, each
// on a frosted card that travels along a ribbon in turn (motion-notes.ts).
export function InegroNotes({ notes }: Props) {
  const cards = [...notes.items, notes.statement]
  return (
    <section id="notes" className="inegro-notes inegro-block">
      <div className="inegro-inner">
        <svg viewBox="0 0 1458.73 475.211" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient
              id="inegro-note-purple"
              y1="0.965"
              x2="1"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0" style={{ stopColor: 'var(--inegro-dark)' }} />
              <stop offset="0.627" style={{ stopColor: 'var(--inegro-purple)' }} />
              <stop offset="1" style={{ stopColor: 'var(--inegro-light)' }} />
            </linearGradient>
            <linearGradient
              id="inegro-note-yellow"
              x1="-0.006"
              y1="0.956"
              x2="0.985"
              y2="0.106"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0" style={{ stopColor: 'var(--inegro-dark)' }} />
              <stop offset="0.602" style={{ stopColor: 'var(--inegro-yellow)' }} />
              <stop offset="1" style={{ stopColor: 'var(--inegro-light)' }} />
            </linearGradient>
            <linearGradient
              id="inegro-note-pulse"
              gradientUnits="userSpaceOnUse"
              x1="-10%"
              x2="0%"
              y1="0%"
              y2="0%"
            >
              {(
                [
                  ['0%', 0],
                  ['20%', 10],
                  ['40%', 35],
                  ['50%', 60],
                  ['60%', 35],
                  ['80%', 10],
                  ['100%', 0],
                ] as const
              ).map(([offset, alpha]) => (
                <stop
                  key={offset}
                  offset={offset}
                  style={{
                    stopColor: `color-mix(in srgb, var(--inegro-light) ${String(alpha)}%, transparent)`,
                  }}
                />
              ))}
            </linearGradient>
          </defs>
          <path data-ribbon="yellow" d={YELLOW} fill="url(#inegro-note-yellow)" />
          <path
            data-ribbon="purple"
            d={PURPLE}
            transform="translate(0 -0.396)"
            fill="url(#inegro-note-purple)"
          />
          <path d={PURPLE} transform="translate(0 -0.396)" fill="url(#inegro-note-pulse)" />
        </svg>
        {cards.map((note, index) => (
          <Note key={index} note={note} last={index === cards.length - 1} />
        ))}
      </div>
    </section>
  )
}
