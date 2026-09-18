import {
  CLIENT_LOGOS,
  type ClientLogo,
  LOGO_ROW_HEIGHT,
  LOGOS,
  sizeFor,
} from '@/app/_components/client-logos'
import { cn } from '@/lib/cn'

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
// twice; the track slides the width of a row and starts again, so the seam never arrives. The
// second row is hidden from the accessibility tree because it says nothing the first has not.
// The ink is the strip's text colour, muted by default; the hero, which shows the strip on the
// dark foot of its ground, passes its own white.
//
// Reduced motion stops the slide: the keyframes exist only under `prefers-reduced-motion:
// no-preference` (app/globals.css), and here the copy, the fades and the clipping go with them,
// so the row wraps and sits still. Pointing at the strip pauses it too (WCAG 2.2.2). With
// JavaScript off nothing changes: this is CSS and markup only.
export function LogoMarquee({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative w-full min-w-0 overflow-hidden mask-[linear-gradient(to_right,transparent,black_var(--logo-fade),black_calc(100%_-_var(--logo-fade)),transparent)] text-on-surface-muted [--logo-fade:3rem] [--logo-gap:4rem] motion-reduce:overflow-visible motion-reduce:mask-none',
        className,
      )}
      style={{ minHeight: LOGO_ROW_HEIGHT }}
    >
      <div className="flex w-max animate-logo-marquee gap-(--logo-gap) hover:[animation-play-state:paused] motion-reduce:w-full motion-reduce:animate-none">
        <ul
          aria-label={LOGOS.label}
          className="flex shrink-0 items-center gap-(--logo-gap) motion-reduce:w-full motion-reduce:shrink motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-y-4"
        >
          {CLIENT_LOGOS.map((logo) => (
            <Logo key={logo.slug} logo={logo} />
          ))}
        </ul>
        <ul
          aria-hidden="true"
          className="flex shrink-0 items-center gap-(--logo-gap) motion-reduce:hidden"
        >
          {CLIENT_LOGOS.map((logo) => (
            <Logo key={logo.slug} logo={logo} />
          ))}
        </ul>
      </div>
    </div>
  )
}
