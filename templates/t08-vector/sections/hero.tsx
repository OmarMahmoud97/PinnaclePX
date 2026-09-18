import type { VectorContent } from '../copy-slots'
import { container, delay, pad } from '../styles'
import { VectorWaves } from './waves'

type Props = Pick<VectorContent, 'hero'>

// The source's Hero: a full screen over a shader of sweeping waves, holding at the left a
// headline whose lines rise out of clipped rows in three dimensions (from 120% below, tilted
// back a quarter turn and 200px deep, over 1.6s, a fifth of a second apart from 0.3s), the last
// line in the serif; a paragraph that rises at 1.2s; and a "Scroll" at the foot that fades in
// at two seconds. The waves stand in for the shader until the WebGL arrives (waves.tsx).
export function VectorHero({ hero }: Props) {
  const last = hero.headline.length - 1
  return (
    <section id="hero" className="hero relative h-screen w-full overflow-hidden bg-surface">
      <div className="absolute inset-0 z-0">
        <div className="h-full w-full opacity-50 saturate-125 md:opacity-85">
          <VectorWaves />
        </div>
      </div>
      <div
        className={`relative z-10 ${container} flex h-full flex-col justify-start pt-44 ${pad} text-left sm:pt-48 md:justify-center md:pt-0`}
        style={{ perspective: '1200px' }}
      >
        <h1 className="text-[clamp(3rem,8vw,12rem)] leading-[1.05] tracking-tight text-on-surface">
          {hero.headline.map((line, index) => (
            <span key={line} className="block overflow-hidden pb-[0.1em]">
              <span
                data-rise="line"
                style={{
                  ...delay(0.3 + 0.2 * index),
                  transformOrigin: 'center bottom',
                  transformStyle: 'preserve-3d',
                }}
                className="block"
              >
                {index === last ? <em className="font-display">{line}</em> : line}
              </span>
            </span>
          ))}
        </h1>
        <p
          data-rise="up"
          style={delay(1.2)}
          className="mt-8 max-w-md text-[clamp(1.125rem,1.5vw,1.75rem)] leading-relaxed text-on-surface/80 lg:max-w-lg 2xl:max-w-xl"
        >
          {hero.subhead}
        </p>
      </div>
      <div
        data-rise="fade"
        style={delay(2)}
        className={`absolute bottom-8 left-1/2 z-10 w-full ${container} -translate-x-1/2 ${pad}`}
      >
        <span className="text-lg font-medium tracking-tight text-on-surface/80">
          {hero.scrollHint}
        </span>
      </div>
    </section>
  )
}
