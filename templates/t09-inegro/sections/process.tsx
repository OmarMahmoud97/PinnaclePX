import type { InegroContent } from '../copy-slots'
import { Letters } from './letters'

type Props = { process: InegroContent['process'] }

// The source's community block, as the block about working together: the label, a paragraph
// and a button beside the ring. The ring is the source's drawing in its own coordinates (1186 by
// 765): a gradient ring with a dark disc inside it, an outline circle, a ringed dot and two
// white dots, all of which drift on a loop (inegro.css), under a conic ring that turns, and in
// its middle three lines, each a step's number over its title, that light letter by letter in
// turn (motion-ring.ts).
export function InegroProcess({ process }: Props) {
  return (
    <section id="process" className="inegro-process" aria-labelledby="process-label">
      <div className="inegro-inner">
        <div className="inegro-process-row">
          <div className="inegro-col inegro-process-text">
            <h2 id="process-label" className="inegro-label">
              {process.label}
            </h2>
            <p className="inegro-p">{process.body}</p>
            <div>
              <a className="inegro-btn inegro-btn-brand" href={process.cta.href}>
                {process.cta.label}
              </a>
            </div>
          </div>
          <div className="inegro-ring" data-ring="">
            <svg
              className="inegro-ring-bg"
              viewBox="0 0 1186 765"
              fill="none"
              aria-hidden="true"
              focusable="false"
            >
              <defs>
                <linearGradient
                  id="inegro-ring-grad"
                  y1="0.815"
                  x2="0.993"
                  y2="0.913"
                  gradientUnits="objectBoundingBox"
                >
                  <stop offset="0" style={{ stopColor: 'var(--inegro-purple)' }} />
                  <stop
                    offset="0.478"
                    style={{
                      stopColor: 'color-mix(in srgb, var(--inegro-purple) 54%, var(--inegro-dark))',
                    }}
                  />
                  <stop
                    offset="1"
                    style={{
                      stopColor: 'color-mix(in srgb, var(--inegro-purple) 26%, var(--inegro-dark))',
                    }}
                  />
                </linearGradient>
              </defs>
              <path
                className="inegro-ring-outline"
                d="M141.5 254C214.159 254 273 312.684 273 385C273 457.316 214.159 516 141.5 516C68.8412 516 10 457.316 10 385C10 312.684 68.8412 254 141.5 254Z"
                strokeWidth="5"
                style={{ stroke: 'var(--on-surface)' }}
              />
              <circle
                className="inegro-ring-left"
                cx="192.5"
                cy="379.5"
                r="47.5"
                style={{ fill: 'var(--on-surface)' }}
              />
              <circle cx="650" cy="379.5" r="305" style={{ fill: 'var(--inegro-dark)' }} />
              <circle
                cx="20"
                cy="379.5"
                r="15"
                strokeWidth="2"
                style={{ fill: 'var(--inegro-dark)', stroke: 'var(--on-surface)' }}
              />
              <path
                d="M 300,0 a 300,300 0 1,0 600,0 a 300,300 0 1,0 -600,0"
                transform="translate(55 390)"
                strokeWidth="30"
                strokeMiterlimit="10"
                stroke="url(#inegro-ring-grad)"
                style={{ fill: 'var(--inegro-dark)' }}
              />
              <circle
                className="inegro-ring-right"
                cx="1070.5"
                cy="379.5"
                r="27.5"
                style={{ fill: 'var(--on-surface)' }}
              />
            </svg>
            <div className="inegro-ring-top" aria-hidden="true" />
            <ol className="inegro-ring-lines">
              {process.steps.map((step, index) => {
                const number = String(index + 1).padStart(2, '0')
                return (
                  <li key={step} className="inegro-ring-line" data-ring-line="">
                    <Letters text={number} />{' '}
                    <em>
                      <Letters text={step} />
                    </em>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
