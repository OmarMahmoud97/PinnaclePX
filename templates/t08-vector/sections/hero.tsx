import type { VectorContent } from '../copy-slots'
import { fitHeadline } from '../fit'
import { container, delay, pad } from '../styles'
import { VectorWaves } from './waves'

type Props = Pick<VectorContent, 'hero'>

// A pool of the page surface behind the headline and the paragraph, from md, where the waves
// show at 85% twice over (the block below and the waves' own), against half of half on phones:
// blurred so it fades out with no edge, and reaching twice the blur past the words, so under
// them it keeps all but a few hundredths of its strength and the waves beyond them keep theirs.
// The bands drift, sweep and turn with the scroll, so any of their colours can pass under any
// word; at 60% every word meets WCAG AA with the waves painted pure white or pure black at full
// strength, in both schemes, at the top and scrolled (4.86:1 at the least, the paragraph on a
// dark page), as the phones' half of half already did (decision 7's first treatment, a local
// gradient behind the words only).
const pool = 'bg-surface/60 blur-[30px]'

// The source's Hero: a full screen over a shader of sweeping waves, holding at the left a
// headline whose lines rise out of clipped rows in three dimensions (from 120% below, tilted
// back a quarter turn and 200px deep, over 1.6s, a fifth of a second apart from 0.3s), the last
// line in the serif; a paragraph that rises at 1.2s; and a "Scroll" at the foot that fades in
// at two seconds. The waves stand in for the shader until the WebGL arrives (waves.tsx). The
// words are centred between two bands that clear the bar's pills, so they sit where the source
// set them wherever they fit; where they do not (a phone held sideways, a long headline), the
// screen grows to hold them below the pills and above the "Scroll", rather than running them
// under the pills or cutting them off at its foot. The headline is smaller where its longest
// word would not fit its line (fit.ts), so no word is cut off by its row.
export function VectorHero({ hero }: Props) {
  const last = hero.headline.length - 1
  return (
    <section id="hero" className="hero relative min-h-screen w-full overflow-hidden bg-surface">
      <div className="absolute inset-0 z-0">
        <div className="h-full w-full opacity-50 saturate-125 md:opacity-85">
          <VectorWaves />
        </div>
      </div>
      <div
        className={`@container relative z-10 ${container} flex min-h-screen flex-col justify-start pt-44 pb-24 ${pad} text-left sm:pt-48 md:justify-center md:py-36`}
      >
        <div className="relative w-fit max-w-full" style={{ perspective: '1200px' }}>
          <div
            aria-hidden="true"
            className={`${pool} pointer-events-none absolute -inset-15 -z-10 hidden rounded-[3rem] md:block`}
          />
          <h1
            className="text-[length:min(clamp(3rem,8vw,12rem),97cqi/var(--vector-word,1))] leading-[1.05] tracking-tight text-on-surface"
            style={fitHeadline(hero.headline)}
          >
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
