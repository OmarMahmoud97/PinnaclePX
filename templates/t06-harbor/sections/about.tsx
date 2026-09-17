import { Quote } from 'lucide-react'
import Image from 'next/image'
import { Fragment } from 'react'
import type { HarborContent } from '../copy-slots'
import { container, eyebrow, motion, section } from '../styles'
import { HeadingLines } from './lines'

type Props = Pick<HarborContent, 'about'>

// The source's About: a tall rounded photograph at the left, sliding in from the left, with a
// dark wash over its foot and an accent badge scaling up over its corner; at the right the
// eyebrow, a three-line heading, two paragraphs, a row of pills and two small quote cards,
// each rising a little after the one before. Without a picture the card surface holds the
// place.
export function HarborAbout({ about }: Props) {
  const { image, badge, quotes } = about
  return (
    <section id="about" className={`${section} overflow-hidden bg-surface`}>
      <div className={container}>
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-12">
          <div
            data-fade="left"
            data-margin="-80px"
            style={motion(0, undefined, 0.7)}
            className="lg:col-span-5"
          >
            <div className="relative">
              <div className="relative h-[600px] overflow-hidden rounded-2xl lg:h-[700px]">
                {image === null ? (
                  <div className="absolute inset-0 bg-accent" />
                ) : (
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover object-center"
                  />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-surface/60 to-transparent" />
              </div>
              {badge !== null && (
                <div
                  data-fade="scale"
                  style={motion(0.4, undefined, 0.5, 'out')}
                  className="absolute -right-6 -bottom-6 rounded-xl bg-brand-deeper px-6 py-5"
                >
                  <p className="font-display text-4xl leading-none font-black text-on-brand">
                    {badge.value}
                  </p>
                  <p className="mt-1 text-xs font-semibold tracking-widest text-on-brand/70 uppercase">
                    {badge.lines.map((line, index) => (
                      <Fragment key={line}>
                        {index > 0 && <br />}
                        {line}
                      </Fragment>
                    ))}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-7 lg:pl-8">
            <div data-fade data-margin="-80px" style={motion(0.1)}>
              <span className={`${eyebrow} mb-4`}>{about.eyebrow}</span>
            </div>
            <div data-fade data-margin="-80px" style={motion(0.2)}>
              <h2 className="mb-6 font-display text-5xl leading-[0.95] font-black tracking-tight text-on-surface uppercase md:text-6xl">
                <HeadingLines heading={about.heading} />
              </h2>
            </div>
            <div data-fade data-margin="-80px" style={motion(0.3)}>
              {about.paragraphs.map((paragraph, index) => (
                <p
                  key={paragraph}
                  className={`max-w-lg text-base leading-relaxed text-on-surface/60 ${index === about.paragraphs.length - 1 ? 'mb-10' : 'mb-4'}`}
                >
                  {paragraph}
                </p>
              ))}
            </div>
            <div data-fade data-margin="-80px" style={motion(0.4)}>
              <div className="mb-10 flex flex-wrap gap-3">
                {about.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-brand-deeper/20 bg-brand-deeper/5 px-4 py-2 text-xs font-medium tracking-wide text-on-surface/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            {quotes !== null && (
              <div data-fade data-margin="-80px" style={motion(0.5)}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {quotes.map((item) => (
                    <div
                      key={item.name}
                      className="rounded-xl border border-on-surface/10 bg-accent p-5 transition-colors duration-300 hover:border-brand-deeper/20"
                    >
                      <Quote size={18} aria-hidden="true" className="mb-3 text-brand-deeper" />
                      <p className="mb-3 text-sm leading-relaxed text-on-surface/70">
                        &ldquo;{item.quote}&rdquo;
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-deeper/20">
                          <span className="text-xs font-bold text-brand-deeper">
                            {item.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-on-surface">{item.name}</p>
                          <p className="text-xs text-on-surface/40">{item.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
