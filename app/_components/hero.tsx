import { Layers } from 'lucide-react'
import Link from 'next/link'
import { CTA } from '@/app/_components/nav-links'
import { Badge } from '@/components/ui/badge'
import { buttonStyles } from '@/components/ui/button'
import { CornerTicks } from '@/components/ui/corner-ticks'
import { GlowBackdrop } from '@/components/ui/glow-backdrop'

export function Hero() {
  return (
    <section id="hero" className="relative px-4 py-16 md:py-24">
      <CornerTicks />
      <GlowBackdrop />

      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
        <Badge Icon={Layers}>Introducing brief-to-page previews</Badge>
        <h1 className="text-4xl font-semibold tracking-tighter text-balance md:text-5xl lg:text-6xl">
          A branded landing page preview from a five-question brief
        </h1>
        <p className="max-w-2xl text-lg text-balance text-on-surface-muted">
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
