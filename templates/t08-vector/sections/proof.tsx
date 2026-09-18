import Image from 'next/image'
import type { CSSProperties } from 'react'
import type { VectorContent, VectorImage } from '../copy-slots'
import { anchored, container, pad, pill } from '../styles'

type Props = { proof: NonNullable<VectorContent['proof']> }

// The source's arrow in a disc, at the foot of a card.
function ArrowLink({ href }: { href: string }) {
  return (
    <a
      className="flex h-10 w-10 items-center justify-center rounded-full bg-on-surface/10 transition-colors hover:bg-on-surface hover:text-surface"
      href={href}
      aria-label="Open"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M7 17L17 7M17 7H7M17 7V17"
        />
      </svg>
    </a>
  )
}

function Picture({ image, round }: { image: VectorImage | null; round: boolean }) {
  return (
    <div
      className={`relative w-full flex-1 overflow-hidden ${round ? 'rounded-full' : 'rounded-2xl'} ${image === null ? 'bg-surface-muted' : ''}`}
    >
      {image !== null && (
        <Image src={image.src} alt={image.alt} fill sizes="100vw" className="object-cover" />
      )}
    </div>
  )
}

const card = (i: number): CSSProperties =>
  ({ '--i': String(i), '--from-y': '80px', '--from-scale': '0.95' }) as CSSProperties

// The source's Social proof: a heading beside a round button, rising as the block comes up
// (from its top at three quarters to at half), over a bento of four columns from lg: two
// pictures stacked, a quote card two columns wide with a name, a role, a company and an arrow,
// two figure cards, a rating card and a story card three columns wide. The cards rise from
// 80px and from 95 percent one after another, tied to the scroll (from the grid's top at four
// fifths to at two fifths).
export function VectorProof({ proof }: Props) {
  const { quote, stats, rating, story } = proof
  const [first, second] = proof.images
  return (
    <section id="social-proof" className={`vector-proof ${anchored} bg-surface py-24 lg:py-32`}>
      <div className={`${pad} ${container}`}>
        <div
          data-scrub="proof"
          data-trigger="section"
          data-start="75"
          data-end="50"
          style={{ '--from-y': '40px', '--start': '25vh', '--end': '50vh' } as CSSProperties}
          className="mb-12 flex items-center justify-between lg:mb-16"
        >
          <h2 className="text-3xl font-medium tracking-tight text-on-surface lg:text-4xl">
            {proof.heading}
          </h2>
          <a className={`${pill} hidden px-6 py-3 text-sm sm:inline-flex`} href={proof.cta.href}>
            {proof.cta.label}
          </a>
        </div>
        <div
          data-scrub-group
          data-start="80"
          data-end="40"
          data-stagger="0.1"
          data-dur="0.8"
          className="vector-proof-grid grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[minmax(220px,auto)_minmax(220px,auto)_minmax(180px,auto)]"
        >
          <div data-scrub="proof-card" style={card(0)} className="row-span-2 flex flex-col gap-4">
            <Picture image={first} round={false} />
            <Picture image={second} round />
          </div>
          <div
            data-scrub="proof-card"
            style={card(1)}
            className="row-span-2 flex flex-col rounded-2xl bg-surface-muted/50 p-8 lg:col-span-2"
          >
            <div>
              <svg
                className="mb-6 h-10 w-10 text-on-surface/20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
              </svg>
              <blockquote className="text-2xl leading-snug font-medium text-on-surface lg:text-3xl">
                {quote.text}
              </blockquote>
              <div className="mt-6">
                <p className="font-semibold text-on-surface">{quote.name}</p>
                <p className="text-sm text-on-surface/60">{quote.role}</p>
              </div>
            </div>
            <div className="mt-auto flex items-center justify-between pt-8">
              <span className="text-xl font-semibold text-on-surface">{quote.company}</span>
              <ArrowLink href="#projects" />
            </div>
          </div>
          {stats.map((stat, index) => (
            <div
              key={stat.company}
              data-scrub="proof-card"
              style={card(2 + index)}
              className="flex flex-col rounded-2xl bg-surface-muted/50 p-6"
            >
              <div className="flex-1">
                <p className="text-3xl font-semibold text-on-surface">{stat.value}</p>
                <p className="mt-1 text-sm text-on-surface/60">{stat.label}</p>
              </div>
              <div className="mt-auto flex items-center justify-between pt-4">
                <span className="text-sm font-medium text-on-surface">{stat.company}</span>
                <ArrowLink href="#projects" />
              </div>
            </div>
          ))}
          <div
            data-scrub="proof-card"
            style={card(4)}
            className="flex flex-col rounded-2xl bg-surface-muted/50 p-8"
          >
            <div className="flex-1">
              <p className="text-3xl font-semibold text-on-surface lg:text-4xl">{rating.value}</p>
              <p className="mt-2 text-on-surface/60">
                {rating.lines.map((line, index) => (
                  <span key={line}>
                    {index > 0 && <br />}
                    {line}
                  </span>
                ))}
              </p>
            </div>
            <div className="mt-auto pt-6">
              <p className="text-sm font-medium text-on-surface">{rating.note}</p>
            </div>
          </div>
          <div
            data-scrub="proof-card"
            style={card(5)}
            className="flex flex-col rounded-2xl bg-surface-muted/50 p-8 lg:col-span-3"
          >
            <p className="max-w-3xl flex-1 text-xl leading-relaxed font-medium text-on-surface lg:text-2xl">
              {story.text}
            </p>
            <div className="mt-auto flex items-center justify-between pt-6">
              <span className="text-xl font-semibold text-on-surface">{story.company}</span>
              <ArrowLink href="#projects" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
