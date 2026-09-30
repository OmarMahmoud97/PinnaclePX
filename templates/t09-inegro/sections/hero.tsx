import type { CSSProperties } from 'react'
import type { Emphasised, InegroContent } from '../copy-slots'

type Props = { hero: InegroContent['hero'] }

// The headline with its phrase in the brand, as the source set its first word. The phrase is
// found in the text; absent, the text is set plain.
function Emphasis({ heading }: { heading: Emphasised }) {
  const { text, emphasis } = heading
  const start = emphasis === '' ? -1 : text.indexOf(emphasis)
  if (start === -1) return <>{text}</>
  const end = start + emphasis.length
  return (
    <>
      {text.slice(0, start)}
      <mark className="inegro-mark">{emphasis}</mark>
      {text.slice(end)}
    </>
  )
}

// The source's five ribbons, drawn in its own coordinates: four leave one point and fan out to
// the right, the purple one comes down from the left through a rise and a fall to meet them.
// Each has its colour from the palette (inegro.css), a time to draw and a wait before it, and a
// light that runs along it twice, over its own time after its own wait.
const RIBBONS = [
  {
    key: 'blue',
    d: 'M2143.97,461.11h-23.42c3.52,0,7.04-.01,10.56-.04,285.81-2.13,562.77-99.48,788.93-274.25l226.39-174.95',
    gradient: { x1: 2116.11, y1: 238.05, x2: 3155.61, y2: 238.05 },
    mix: [84, 54, 31, 14, 4],
    draw: 2.8,
    wait: 2.9,
    pulse: { dur: 3.1, begin: 3 },
  },
  {
    key: 'peach',
    d: 'M2143.97,461.11h-23.42c135.9,0,270.61-19.58,400.08-57.75,202.18-59.61,429.69-127.15,636.99-112.42h0',
    gradient: { x1: 2120.55, y1: 375, x2: 3158.69, y2: 375 },
    mix: [100, 65, 37, 17, 5],
    draw: 2.1,
    wait: 3.3,
    pulse: { dur: 3.3, begin: 3 },
  },
  {
    key: 'green',
    d: 'M2143.97,461.62h-23.42c135.9,0,270.61-19.58,400.08-57.75,202.18-59.61,186.02,71.41,623.42,71.41',
    gradient: { x1: 2120.55, y1: 431.8, x2: 3144.06, y2: 431.8 },
    mix: [89, 62, 40, 23, 11, 3],
    draw: 2.9,
    wait: 2.8,
    pulse: { dur: 2.8, begin: 3 },
  },
  {
    key: 'yellow',
    d: 'M2143.97,461.11h-23.42c225.29,0,447.33,53.81,647.63,156.94l375.87,193.53',
    gradient: {
      x1: 2120.55,
      y1: -3716.52,
      x2: 3150.92,
      y2: -3716.52,
      transform: 'translate(0 -3081.01) scale(1 -1)',
    },
    mix: [97, 68, 44, 25, 11, 3],
    draw: 2.3,
    wait: 3.1,
    pulse: { dur: 3, begin: 3, transform: 'translate(0 -3081.01) scale(1 -1)' },
  },
  {
    key: 'purple',
    d: 'M0,1127.12h617.3c204.92,0,392.3-115.64,484.17-298.81l299.97-598.01c37.9-75.55,115.18-123.25,199.71-123.25h0c69.4,0,134.87,32.25,177.16,87.29l101.95,132.67c65.01,84.61,165.66,134.19,272.36,134.19h340.77c75.48,0,150.32,13.99,220.7,41.26l255.94,99.16c60.02,23.25,123.33,36.87,187.6,40.36h0',
    gradient: {
      x1: 0,
      y1: -3677.85,
      x2: 3160.1,
      y2: -3677.85,
      transform: 'translate(0 -3081.01) scale(1 -1)',
    },
    mix: [87, 50, 23, 6],
    draw: 5,
    wait: 0,
    pulse: { dur: 2.7, begin: 2.7, transform: 'translate(0 -3081.01) scale(1 -1)' },
  },
] as const

// Where each colour stop sits: the source's stops, from its dark start through the colour to
// white, each tint the colour mixed into the light by the share given in `mix`.
const OFFSETS: Readonly<Record<string, readonly number[]>> = {
  blue: [0.64, 0.74, 0.82, 0.89, 0.96],
  peach: [0.6, 0.7, 0.8, 0.88, 0.95],
  green: [0.63, 0.71, 0.78, 0.85, 0.91, 0.96],
  yellow: [0.61, 0.69, 0.77, 0.84, 0.91, 0.96],
  purple: [0.55, 0.71, 0.85, 0.94],
}

function stop(offset: number, colour: string) {
  return <stop key={offset} offset={offset} style={{ stopColor: colour }} />
}

// The light that runs along a ribbon: white, strongest in its middle.
const PULSE: readonly [offset: string, alpha: number][] = [
  ['0%', 0],
  ['20%', 25],
  ['40%', 65],
  ['45%', 100],
  ['50%', 100],
  ['55%', 100],
  ['60%', 65],
  ['80%', 25],
  ['100%', 0],
]

// GSAP's sine.inOut, as a spline for SMIL.
const SINE = '0.445 0.05 0.55 0.95'

function Lines() {
  return (
    <div className="inegro-lines" aria-hidden="true">
      <div className="inegro-lines-strip">
        <svg viewBox="0 0 3160.1 1150.83" focusable="false">
          <defs>
            {RIBBONS.map((ribbon) => {
              const colour = `var(--inegro-${ribbon.key})`
              const offsets = OFFSETS[ribbon.key] ?? []
              const first = ribbon.key === 'purple' ? 0.5 : 0.6
              const { x1, y1, x2, y2 } = ribbon.gradient
              const transform =
                'transform' in ribbon.gradient ? ribbon.gradient.transform : undefined
              return (
                <linearGradient
                  key={ribbon.key}
                  id={`inegro-ribbon-${ribbon.key}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  gradientTransform={transform}
                  gradientUnits="userSpaceOnUse"
                >
                  {stop(0, 'var(--inegro-dark)')}
                  {stop(first, colour)}
                  {offsets.map((offset, index) =>
                    stop(
                      offset,
                      `color-mix(in srgb, ${colour} ${String(ribbon.mix[index] ?? 0)}%, var(--inegro-light))`,
                    ),
                  )}
                  {stop(1, 'var(--inegro-light)')}
                </linearGradient>
              )
            })}
            {RIBBONS.map((ribbon) => {
              const { dur, begin } = ribbon.pulse
              const transform = 'transform' in ribbon.pulse ? ribbon.pulse.transform : undefined
              const timing = {
                dur: `${String(dur)}s`,
                begin: `${String(begin)}s`,
                repeatCount: '2',
                calcMode: 'spline',
                keyTimes: '0;1',
                keySplines: SINE,
                fill: 'freeze',
              } as const
              return (
                <linearGradient
                  key={ribbon.key}
                  id={`inegro-pulse-${ribbon.key}`}
                  gradientUnits="userSpaceOnUse"
                  gradientTransform={transform}
                  x1="-10%"
                  x2="0"
                  y1="0%"
                  y2="0%"
                >
                  {PULSE.map(([offset, alpha]) => (
                    <stop
                      key={offset}
                      offset={offset}
                      style={{
                        stopColor: `color-mix(in srgb, var(--inegro-light) ${String(alpha)}%, transparent)`,
                      }}
                    />
                  ))}
                  <animate attributeName="x1" values="-10%;100%" {...timing} />
                  <animate attributeName="x2" values="0%;103%" {...timing} />
                </linearGradient>
              )
            })}
          </defs>
          {RIBBONS.map((ribbon) => (
            <g key={ribbon.key}>
              <path
                className="inegro-ribbon"
                d={ribbon.d}
                pathLength={1}
                stroke={`url(#inegro-ribbon-${ribbon.key})`}
                style={
                  {
                    '--draw': `${String(ribbon.draw)}s`,
                    '--wait': `${String(ribbon.wait)}s`,
                  } as CSSProperties
                }
              />
              <path
                className="inegro-pulse"
                d={ribbon.d}
                stroke={`url(#inegro-pulse-${ribbon.key})`}
              />
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}

// The source's first screen, block for block: its columns with the headline, the line and the
// small line over the row of pills, over the ribbons.
export function InegroHero({ hero }: Props) {
  return (
    <section id="hero" className="inegro-hero">
      <div className="inegro-inner">
        <div className="inegro-hero-row">
          <div className="inegro-col inegro-hero-col">
            <h1 className="inegro-h1">
              <Emphasis heading={hero.headline} />
            </h1>
            <p className="inegro-hero-sub">{hero.subhead}</p>
            <div className="inegro-hero-links">
              <p>{hero.linksLabel}</p>
              <ul>
                {hero.links.map((link) => (
                  <li key={`${link.label}${link.href}`}>
                    <a className="inegro-btn inegro-btn-faint" href={link.href}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Lines />
    </section>
  )
}
