import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import type { HarborContent } from '../copy-slots'
import { fitWord } from '../fit'
import { container, eyebrow, motion } from '../styles'
import { HeadingLines } from './lines'

type Props = Pick<HarborContent, 'cta'>

// The source's closing band: a photograph dimmed to a fifth under a dark wash and a breath of
// the accent from the top left, then the eyebrow, a two-line heading, a paragraph and two
// round buttons, all centred, rising in turn as they arrive. Below about 670px the heading
// follows the screen, as the block headings do (styles.ts), and it is smaller where its longest
// word would not fit its 56rem measure or the screen (fit.ts).
//
// Over a pure black picture, a light page's eyebrow in the accent came within a hair of AA on a
// phone, where the breath of the accent reaches it, so a faint glow of the page colour sits
// behind the words at the band's centre (decision 7's first treatment, a local gradient behind
// the words only). Every word here then meets AA on every pixel of its box over a pure white
// and a pure black picture, light and dark.
export function HarborCta({ cta }: Props) {
  return (
    <section id="cta" className="relative overflow-hidden py-32">
      <div className="absolute inset-0">
        {cta.image !== null && (
          <Image
            src={cta.image.src}
            alt={cta.image.alt}
            fill
            sizes="100vw"
            className="object-cover object-center opacity-20"
          />
        )}
        <div className="absolute inset-0 bg-surface/70" />
        <div className="absolute inset-0 bg-linear-to-br from-brand-deeper/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-radial-[closest-side] from-surface/30 to-transparent" />
      </div>
      <div className={`${container} relative z-10 text-center`}>
        <div data-fade data-margin="-80px">
          <span className={`${eyebrow} mb-6`}>{cta.eyebrow}</span>
        </div>
        <div data-fade data-margin="-80px" style={motion(0.1)} className="@container">
          <h2
            className="mx-auto mb-8 max-w-4xl font-display text-[length:min(clamp(1.75rem,9vw,3.75rem),min(97cqi,54rem)/var(--harbor-word,1))] leading-none font-black wrap-break-word text-on-surface uppercase"
            style={fitWord(cta.heading.lines)}
          >
            <HeadingLines heading={cta.heading} />
          </h2>
        </div>
        <div data-fade data-margin="-80px" style={motion(0.2)}>
          <p className="mx-auto mb-10 max-w-md text-base text-on-surface-muted">{cta.body}</p>
        </div>
        <div data-fade data-margin="-80px" style={motion(0.3)}>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={cta.primary.href}
              className="group harbor-glow-e inline-flex items-center gap-2 rounded-full bg-brand-deeper px-6 py-3 font-display text-base font-black tracking-wider text-on-brand uppercase transition-[box-shadow,scale] duration-300 hover:scale-[1.05] active:scale-[0.95]"
            >
              {cta.primary.label}
              <ArrowRight
                size={18}
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1"
              />
            </a>
            <a
              href={cta.secondary.href}
              className="inline-flex items-center gap-2 rounded-full border border-on-surface/20 px-6 py-3 font-display text-base font-bold tracking-wider text-on-surface uppercase transition-[color,border-color,scale] duration-200 hover:scale-[1.05] hover:border-on-surface/50 active:scale-[0.95]"
            >
              {cta.secondary.label}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
