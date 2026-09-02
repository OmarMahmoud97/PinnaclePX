import { Layers } from 'lucide-react'
import Link from 'next/link'
import { CTA } from '@/app/_components/nav-links'
import { buttonStyles } from '@/components/ui/button'
import { CornerTicks } from '@/components/ui/corner-ticks'

export function Hero() {
  return (
    <section
      id="hero"
      className="relative flex flex-col items-center justify-center px-4 py-16 md:py-24"
    >
      <CornerTicks />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-1 bg-radial-[at_45%_85%] from-glow/40 via-glow-secondary/4 mask-[linear-gradient(to_bottom,transparent,black_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-1 bg-radial-[at_45%_68%] from-glow/68 via-glow-secondary/3 mask-[linear-gradient(to_bottom,transparent,black_100%)] blur-[50px]"
      />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
        <p className="flex max-w-full items-center gap-2 rounded-full bg-surface-raised px-4 py-1.5 shadow-badge max-[350px]:hidden">
          <Layers aria-hidden="true" className="size-4 shrink-0" />
          <span className="truncate text-sm font-medium">Introducing brief-to-page previews</span>
        </p>
        <h1 className="text-4xl font-semibold tracking-tighter text-balance md:text-5xl lg:text-6xl">
          A branded landing page preview from a five-question brief
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-balance text-on-surface-muted">
          Tell PinnaclePX about your business. It picks the right template, writes the copy, and
          hands you a shareable preview in minutes.
        </p>
        <Link href={CTA.href} className={buttonStyles({ variant: 'cta', size: 'lg' })}>
          {CTA.label}
        </Link>
      </div>
    </section>
  )
}
