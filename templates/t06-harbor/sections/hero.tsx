import { ArrowRight, Zap } from 'lucide-react'
import Image from 'next/image'
import type { HarborContent } from '../copy-slots'
import { container, motion } from '../styles'

type Props = Pick<HarborContent, 'hero'>

const LINE = 'block text-7xl leading-[0.9] font-black tracking-tight uppercase'

// The source's Hero: a full-screen block over a dimmed photograph fading in from the left, a
// pill with a bolt, the headline in three clipped rows (the second in the accent) rising one
// after another, a paragraph and two round buttons, a row of three figures over a hairline,
// and a scroll hint pinned at the bottom right. Everything arrives on a timer at load, at the
// source's travels, lengths and waits. The three rows are one heading here.
export function HarborHero({ hero }: Props) {
  const [first, second, third] = hero.headline
  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center overflow-hidden bg-surface"
    >
      <div className="absolute inset-0 z-0">
        {hero.image !== null && (
          <Image
            src={hero.image.src}
            alt={hero.image.alt}
            fill
            sizes="100vw"
            className="object-cover object-center opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-r from-surface to-transparent" />
      </div>
      <div className={`${container} relative z-10 w-full pt-24 pb-16`}>
        <div
          data-rise
          style={motion(0.2, '20px', 0.6, 'out')}
          className="mt-12 mb-8 inline-flex items-center gap-2 rounded-full border border-brand-deeper/30 bg-brand-deeper/5 px-4 py-2 backdrop-blur-sm"
        >
          <Zap size={14} aria-hidden="true" className="fill-brand-deeper text-brand-deeper" />
          <span className="text-xs font-medium tracking-widest text-brand-deeper uppercase">
            {hero.badge}
          </span>
        </div>
        <h1 className="font-display">
          <span className="mb-4 block overflow-hidden">
            <span
              data-rise="expo"
              style={motion(0.3, '120px', 0.8, 'expo')}
              className={`${LINE} text-on-surface`}
            >
              {first}
            </span>
          </span>
          <span className="mb-4 block overflow-hidden">
            <span
              data-rise="expo"
              style={motion(0.45, '120px', 0.8, 'expo')}
              className="flex flex-wrap items-baseline gap-4"
            >
              <span className={`${LINE} text-brand-deeper`}>{second}</span>
            </span>
          </span>
          <span className="mb-10 block overflow-hidden">
            <span
              data-rise="expo"
              style={motion(0.6, '120px', 0.8, 'expo')}
              className={`${LINE} text-on-surface`}
            >
              {third}
            </span>
          </span>
        </h1>
        <div
          data-rise
          style={motion(0.85, '30px', 0.7, 'out')}
          className="mt-4 flex flex-col gap-6"
        >
          <p className="max-w-md text-base leading-relaxed text-on-surface/60">{hero.subhead}</p>
          <div className="flex items-center gap-4">
            <a
              href={hero.primary.href}
              className="group harbor-glow-b flex items-center gap-2 rounded-full bg-brand-deeper px-6 py-3 font-display text-sm font-bold tracking-wider text-on-brand uppercase transition-[box-shadow,scale] duration-300 hover:scale-[1.04] active:scale-[0.96]"
            >
              {hero.primary.label}
              <ArrowRight
                size={16}
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1"
              />
            </a>
            <a
              href={hero.secondary.href}
              className="rounded-full border border-on-surface/20 px-6 py-3 font-display text-sm font-bold tracking-wider text-on-surface uppercase transition-[color,border-color,scale] duration-200 hover:scale-[1.04] hover:border-on-surface/50 active:scale-[0.96]"
            >
              {hero.secondary.label}
            </a>
          </div>
        </div>
        <div
          data-rise
          style={motion(1.05, '20px', 0.7, 'out')}
          className="mt-16 flex items-center gap-12 border-t border-on-surface/10 pt-8"
        >
          {hero.stats.map((stat) => (
            <div key={stat.label} className="flex flex-col">
              <span className="font-display text-3xl leading-none font-black text-brand-deeper">
                {stat.value}
              </span>
              <span className="mt-1 text-xs tracking-wide text-on-surface/50 uppercase">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div
        data-rise="fade"
        style={motion(1.4, undefined, 0.3)}
        className="absolute right-8 bottom-8 z-10 flex flex-col items-center gap-2 md:right-16"
      >
        <div className="h-16 w-px bg-linear-to-b from-transparent to-brand-deeper/60" />
        <span className="origin-center translate-x-4 rotate-90 text-[10px] tracking-widest text-on-surface/40 uppercase">
          Scroll
        </span>
      </div>
    </section>
  )
}
