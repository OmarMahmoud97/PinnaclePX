import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import type { HarborContent } from '../copy-slots'
import { container, eyebrow, motion } from '../styles'
import { HeadingLines } from './lines'

type Props = Pick<HarborContent, 'cta'>

// The source's closing band: a photograph dimmed to a fifth under a dark wash and a breath of
// the accent from the top left, then the eyebrow, a two-line heading, a paragraph and two
// round buttons, all centred, rising in turn as they arrive.
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
      </div>
      <div className={`${container} relative z-10 text-center`}>
        <div data-fade data-margin="-80px">
          <span className={`${eyebrow} mb-6`}>{cta.eyebrow}</span>
        </div>
        <div data-fade data-margin="-80px" style={motion(0.1)}>
          <h2 className="mx-auto mb-8 max-w-4xl font-display text-6xl font-black text-on-surface uppercase">
            <HeadingLines heading={cta.heading} />
          </h2>
        </div>
        <div data-fade data-margin="-80px" style={motion(0.2)}>
          <p className="mx-auto mb-10 max-w-md text-base text-on-surface/50">{cta.body}</p>
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
