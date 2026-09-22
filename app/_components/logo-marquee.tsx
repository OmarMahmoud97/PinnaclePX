import {
  CLIENT_LOGOS,
  type ClientLogo,
  LOGO_ROW_HEIGHT,
  LOGOS,
  sizeFor,
} from '@/app/_components/client-logos'
import { cn } from '@/lib/cn'
import type { CSSProperties } from 'react'

function Logo({ logo }: { logo: ClientLogo }) {
  const { width, height } = sizeFor(logo)
  // The file is a mask, not a picture: the box is filled with the strip's text colour and the
  // mark's own alpha cuts it out, so every logo is the same ink whatever colour, or raster, it
  // was drawn in. A committed file at a known size: no optimiser, no client script, no layout
  // shift.
  const mask = `url(${logo.src})`
  return (
    <li className="flex shrink-0 items-center">
      <span
        role="img"
        aria-label={logo.name}
        style={{ width, height, maskImage: mask, WebkitMaskImage: mask }}
        className="block bg-current mask-contain mask-center mask-no-repeat opacity-70"
      />
    </li>
  )
}

// The clients' logos, sliding by for ever and fading out at both edges. One row is drawn
// several times; the track slides the width of a row and starts again, so the seam never
// arrives. Six marks make a row narrower than the strip, so two copies would leave a hole
// behind the second before the loop reset; four keep the track longer than the strip plus a
// row at any width the hero reaches. The copies after the first are hidden from the
// accessibility tree because they say nothing the first has not.
// The ink is the strip's text colour, muted by default; the hero, which shows the strip on the
// dark foot of its ground, passes its own white.
//
// Reduced motion stops the slide: the keyframes exist only under `prefers-reduced-motion:
// no-preference` (app/globals.css), and here the copy, the fades and the clipping go with them,
// so the row wraps and sits still. Pointing at the strip pauses it too (WCAG 2.2.2). With
// JavaScript off nothing changes: this is CSS and markup only.
// How many times the row is drawn; the keyframe in app/globals.css divides the slide by it.
const ROW_COPIES = 4

export function LogoMarquee({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative w-full min-w-0 overflow-hidden mask-[linear-gradient(to_right,transparent,black_var(--logo-fade),black_calc(100%_-_var(--logo-fade)),transparent)] text-on-surface-muted [--logo-fade:3rem] [--logo-gap:4rem] motion-reduce:overflow-visible motion-reduce:mask-none',
        className,
      )}
      style={{ minHeight: LOGO_ROW_HEIGHT }}
    >
      <div
        className="flex w-max animate-logo-marquee gap-(--logo-gap) hover:[animation-play-state:paused] motion-reduce:w-full motion-reduce:animate-none"
        style={{ '--logo-copies': ROW_COPIES } as CSSProperties}
      >
        <ul
          aria-label={LOGOS.label}
          className="flex shrink-0 items-center gap-(--logo-gap) motion-reduce:w-full motion-reduce:shrink motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-y-4"
        >
          {CLIENT_LOGOS.map((logo) => (
            <Logo key={logo.slug} logo={logo} />
          ))}
        </ul>
        {Array.from({ length: ROW_COPIES - 1 }, (_, copy) => (
          <ul
            key={copy}
            aria-hidden="true"
            className="flex shrink-0 items-center gap-(--logo-gap) motion-reduce:hidden"
          >
            {CLIENT_LOGOS.map((logo) => (
              <Logo key={logo.slug} logo={logo} />
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}
