'use client'

import Image from 'next/image'
import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import type { VectorContent } from '../copy-slots'
import { container, pad } from '../styles'
import { VectorRipple } from './ripple'

type Props = Pick<VectorContent, 'projects'>
type Project = VectorContent['projects']['items'][number]

// A spring as the source's motion library ran it, stepped each frame.
class Spring {
  value = 0
  velocity = 0
  target = 0
  constructor(
    private readonly stiffness: number,
    private readonly damping: number,
    private readonly mass: number,
  ) {}
  // Stepped in slices of at most four milliseconds, so a long frame cannot throw it.
  step(dt: number) {
    let left = dt
    while (left > 0) {
      const slice = Math.min(left, 0.004)
      const force = this.stiffness * (this.target - this.value) - this.damping * this.velocity
      this.velocity += (force / this.mass) * slice
      this.value += this.velocity * slice
      left -= slice
    }
  }
}

// A value read off a broken line through the given stops.
const between = (x: number, stops: readonly number[], values: readonly number[]) => {
  for (let i = 1; i < stops.length; i += 1) {
    const a = stops[i - 1] ?? 0
    const b = stops[i] ?? 0
    if (x <= b) {
      const t = b === a ? 0 : (x - a) / (b - a)
      const va = values[i - 1] ?? 0
      const vb = values[i] ?? 0
      return va + (vb - va) * Math.max(0, Math.min(1, t))
    }
  }
  return values[values.length - 1] ?? 0
}

// The distance from the page's top to an element's top, from layout alone.
function pageTop(el: HTMLElement): number {
  let top = 0
  let node: HTMLElement | null = el
  while (node !== null) {
    top += node.offsetTop
    node = node.offsetParent instanceof HTMLElement ? node.offsetParent : null
  }
  return top
}

// The source played a card's title over 1s and its line over 0.8s from 0.4s, on one timeline
// that reversed as a whole: the line falls first over its 0.8s, and the title from 0.2s over
// its 1s, each on its own curve mirrored.
const TITLE_REVERSE = { '--hide-delay': '0.2' } as CSSProperties
const PROSE_DELAY = {
  '--from-y': '40px',
  '--dur': '0.8s',
  '--ease': 'var(--vector-power2)',
  '--hide-ease': 'var(--vector-power2-in)',
  '--delay': '0.4',
} as CSSProperties

// The source's cursor: an "Open" disc that follows the pointer on a spring (stiffness 400,
// damping 30, mass 0.2) while a project is under it, stretching along its direction of
// travel with speed (to 1.6 across and 0.65 tall by 2000px a second) while its word stays
// upright, growing in and shrinking away over 0.3s, its scale on the source's back curve and
// its opacity easing out, both ways.
function Cursor({ visible }: { visible: boolean }) {
  const outer = useRef<HTMLDivElement>(null)
  const turn = useRef<HTMLDivElement>(null)
  const disc = useRef<HTMLDivElement>(null)
  const word = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const x = new Spring(400, 30, 0.2)
    const y = new Spring(400, 30, 0.2)
    let frame = 0
    let last = performance.now()
    // The source handed the pointer's place to its springs on the next frame, not at once.
    let pending = 0
    let pointerX = 0
    let pointerY = 0
    const onMove = (event: globalThis.MouseEvent) => {
      pointerX = event.clientX
      pointerY = event.clientY
      if (pending === 0) {
        pending = requestAnimationFrame(() => {
          pending = 0
          x.target = pointerX
          y.target = pointerY
        })
      }
    }
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      x.step(dt)
      y.step(dt)
      const speed = Math.hypot(x.velocity, y.velocity)
      const sx = between(speed, [0, 800, 2000], [1, 1.3, 1.6])
      const sy = between(speed, [0, 800, 2000], [1, 0.8, 0.65])
      const angle = (Math.atan2(y.velocity, x.velocity) * 180) / Math.PI
      if (outer.current) {
        outer.current.style.left = `${String(x.value)}px`
        outer.current.style.top = `${String(y.value)}px`
      }
      if (turn.current) turn.current.style.rotate = `${String(angle)}deg`
      if (disc.current) disc.current.style.scale = `${String(sx)} ${String(sy)}`
      if (word.current) {
        word.current.style.rotate = `${String(-angle)}deg`
        word.current.style.scale = `${String(1 / sx)} ${String(1 / sy)}`
      }
      frame = requestAnimationFrame(tick)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    frame = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(frame)
      cancelAnimationFrame(pending)
    }
  }, [])
  return (
    <div
      ref={outer}
      aria-hidden="true"
      data-visible={visible ? '' : undefined}
      className="vector-cursor pointer-events-none fixed top-0 left-0 z-50 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
    >
      <div ref={turn}>
        <div
          ref={disc}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-on-surface"
        >
          <span ref={word} className="text-sm font-medium tracking-wide text-surface uppercase">
            Open
          </span>
        </div>
      </div>
    </div>
  )
}

// The source's marquee: the words repeated six times in a row that slides at 80px a second,
// to the right at rest, faster by the scroll's speed and the other way while the page scrolls
// up, wrapping on the width of one copy; the scroll's speed is smoothed on a spring
// (stiffness 400, damping 50) as the source's library smoothed it.
function Marquee({ children }: { children: ReactNode }) {
  const row = useRef<HTMLDivElement>(null)
  const first = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let x = 0
    let direction = 1
    let frame = 0
    let last = performance.now()
    let lastY = window.scrollY
    let lastT = last
    let rawVelocity = 0
    const smoothed = new Spring(400, 50, 1)
    const onScroll = () => {
      const now = performance.now()
      const dt = Math.max(now - lastT, 1) / 1000
      rawVelocity = (window.scrollY - lastY) / dt
      lastY = window.scrollY
      lastT = now
    }
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      if (now - lastT > 100) rawVelocity = 0
      smoothed.target = rawVelocity
      smoothed.step(dt)
      const factor = smoothed.value / 200
      if (factor < 0) direction = -1
      else if (factor > 0) direction = 1
      let move = direction * 80 * dt
      move += direction * move * factor
      x += move
      const width = first.current?.offsetWidth ?? 0
      if (width > 0 && row.current) {
        const wrapped = ((((x + width) % width) + width) % width) - width
        row.current.style.transform = `translateX(${String(wrapped)}px)`
      }
      frame = requestAnimationFrame(tick)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    frame = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])
  return (
    <div className="relative w-full overflow-hidden">
      <div ref={row} className="flex whitespace-nowrap">
        {Array.from({ length: 6 }, (_, index) => (
          <span
            key={index}
            ref={index === 0 ? first : null}
            className="shrink-0 px-8 text-[clamp(4rem,12vw,14rem)] font-medium tracking-tight text-on-surface uppercase italic"
          >
            {children}
          </span>
        ))}
      </div>
    </div>
  )
}

const EXIT_MS = 600

// The source's project overlay: the picture full screen, easing in from a tenth larger over
// 0.6s and out to a twentieth larger, a dark wash, the title at the top left sliding in from
// 30px left after a beat and out to 20px, a frosted close disc at the top right growing in
// from four fifths and shrinking out, the whole fading over 0.3s each way; Escape closes it,
// the page behind it stops scrolling while it is open, and the bar returns as it goes.
function Overlay({ project, onClosed }: { project: Project; onClosed: () => void }) {
  const [closing, setClosing] = useState(false)
  useEffect(() => {
    if (closing) {
      document.body.style.overflow = ''
      const timer = window.setTimeout(onClosed, EXIT_MS)
      return () => {
        window.clearTimeout(timer)
      }
    }
    document.body.style.overflow = 'hidden'
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setClosing(true)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [closing, onClosed])
  return (
    <div
      data-overlay={closing ? undefined : ''}
      role="dialog"
      aria-modal="true"
      aria-label={`${project.titleUp} ${project.titleDown}`}
      className={`fixed inset-0 z-100 transition-opacity duration-300 starting:opacity-0 ${closing ? 'opacity-0' : ''}`}
    >
      <div
        className={`absolute inset-0 transition-transform duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] starting:scale-110 ${closing ? 'scale-105' : ''}`}
      >
        {project.image !== null && (
          <Image
            src={project.image.src}
            alt={project.image.alt}
            fill
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-scrim/40" />
      </div>
      <div
        className={`absolute top-4 left-4 z-10 transition-[opacity,translate] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] sm:top-6 sm:left-6 md:top-12 md:left-12 lg:top-16 lg:left-16 starting:-translate-x-7.5 starting:opacity-0 ${closing ? '-translate-x-5 opacity-0' : 'delay-150'}`}
      >
        <h2 className="text-[clamp(2rem,8vw,6rem)] leading-[0.95] font-medium tracking-tight text-on-scrim">
          <span className="block">{project.titleUp}</span>
          <span className="block font-display italic">{project.titleDown}</span>
        </h2>
      </div>
      <div
        className={`absolute top-4 right-4 z-20 transition-[opacity,scale] duration-300 sm:top-6 sm:right-6 md:top-12 md:right-12 lg:top-16 lg:right-16 starting:scale-80 starting:opacity-0 ${closing ? 'scale-80 opacity-0' : 'delay-100'}`}
      >
        <button
          type="button"
          onClick={() => {
            setClosing(true)
          }}
          autoFocus
          className="flex h-12 w-12 items-center justify-center rounded-full bg-on-scrim/20 text-on-scrim backdrop-blur-sm transition-all hover:scale-110 hover:bg-on-scrim/30 active:scale-95 md:h-14 md:w-14"
          aria-label="Close overlay"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// A project card: a pill-shaped picture, its inside a little larger than its frame, shown
// through a circle that opens from nothing to 1200px as the card's top passes from four
// fifths of the viewport to a fifth above it (the source read the raw scroll for this, with
// no lag), leaning up to 15px towards the pointer over 0.8s and swelling to 1.22 under it
// over 0.6s; beside it the number, the two-part title and the line, which rise when the card
// reaches the middle of the screen and fall back, the line first, when it leaves upward
// (reveal.tsx). The picture itself is the source's shader (ripple.tsx).
function Card({
  project,
  index,
  onHover,
  onOpen,
}: {
  project: Project
  index: number
  onHover: (over: boolean) => void
  onOpen: () => void
}) {
  const card = useRef<HTMLDivElement>(null)
  const maskRadius = useRef(0)
  const [lean, setLean] = useState({ x: 0, y: 0, scale: 1.15 })
  const even = index % 2 === 0
  useEffect(() => {
    const el = card.current
    if (el === null) return
    let top = 0
    const refresh = () => {
      top = pageTop(el)
      measure()
    }
    const measure = () => {
      const vh = window.innerHeight
      const progress = Math.min(1, Math.max(0, (window.scrollY - (top - 0.8 * vh)) / vh))
      maskRadius.current = 1200 * progress
    }
    refresh()
    const later = window.setTimeout(refresh, 600)
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', refresh)
    window.addEventListener('load', refresh)
    return () => {
      window.clearTimeout(later)
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', refresh)
      window.removeEventListener('load', refresh)
    }
  }, [])
  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    const dx = (event.clientX - box.left) / box.width - 0.5
    const dy = (event.clientY - box.top) / box.height - 0.5
    setLean((state) => ({ ...state, x: -30 * dx, y: -30 * dy }))
  }
  return (
    <div
      ref={card}
      data-trigger
      className="vector-card group cursor-pointer py-16 md:py-24"
      onClick={onOpen}
      onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen()
        }
      }}
      onMouseEnter={() => {
        onHover(true)
      }}
      onMouseLeave={() => {
        onHover(false)
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open ${project.titleUp} ${project.titleDown}`}
    >
      <div className={`${container} ${pad}`}>
        <div
          className={`flex flex-col gap-8 ${even ? 'md:flex-row' : 'md:flex-row-reverse'} md:items-center md:gap-16`}
        >
          <div
            className="relative aspect-4/3 w-full overflow-hidden rounded-full md:w-3/5"
            onPointerMove={onMove}
            onPointerEnter={() => {
              setLean((state) => ({ ...state, scale: 1.22 }))
            }}
            onPointerLeave={() => {
              setLean({ x: 0, y: 0, scale: 1.15 })
            }}
          >
            <div
              className="vector-lean absolute inset-0 h-full w-full will-change-transform"
              style={{
                translate: `${String(lean.x)}px ${String(lean.y)}px`,
                scale: String(lean.scale),
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
              }}
            >
              {project.image !== null ? (
                <VectorRipple image={project.image} maskRadius={maskRadius} />
              ) : (
                <div className="vector-mask absolute inset-0 h-full w-full bg-surface-muted" />
              )}
            </div>
          </div>
          <div className={`flex flex-col md:w-2/5 ${even ? '' : 'md:text-right'}`}>
            <span className="mb-6 text-base font-medium tracking-widest text-on-surface-muted uppercase">
              0{index + 1}
            </span>
            <h3
              data-fade
              style={TITLE_REVERSE}
              className="mb-8 text-[clamp(2.5rem,6vw,6rem)] leading-[1.05] tracking-tight text-on-surface"
            >
              <span className="font-medium">{project.titleUp}</span>
              <br />
              <span className="font-display italic">{project.titleDown}</span>
            </h3>
            <p
              data-fade
              style={PROSE_DELAY}
              className={`text-xl leading-relaxed text-on-surface-muted ${even ? 'max-w-lg' : 'max-w-lg md:ml-auto'}`}
            >
              {project.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// The source's Projects: the cursor, the overlay, the marquee, then the cards.
export function VectorProjects({ projects }: Props) {
  const [hovering, setHovering] = useState(false)
  const [open, setOpen] = useState<Project | null>(null)
  return (
    <section id="projects" className="projects relative scroll-mt-25 bg-surface py-24">
      <Cursor visible={hovering && open === null} />
      {open !== null && (
        <Overlay
          project={open}
          onClosed={() => {
            setOpen(null)
          }}
        />
      )}
      <div className="pb-16">
        <Marquee>
          {projects.marquee.text}{' '}
          <span className="font-display font-thin">{projects.marquee.accent}</span>{' '}
        </Marquee>
      </div>
      <div className="flex flex-col">
        {projects.items.map((project, index) => (
          <Card
            key={project.titleUp + project.titleDown}
            project={project}
            index={index}
            onHover={setHovering}
            onOpen={() => {
              setHovering(false)
              setOpen(project)
            }}
          />
        ))}
      </div>
    </section>
  )
}
