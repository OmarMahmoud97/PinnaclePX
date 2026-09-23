import { ArrowDown } from 'lucide-react'
import Link from 'next/link'
import { HeroPrompt } from '@/app/_components/hero-prompt'
import { Ink } from '@/app/_components/ink'
import { LOGOS } from '@/app/_components/client-logos'
import { LogoMarquee } from '@/app/_components/logo-marquee'
import { HERO } from '@/app/_components/section-copy'
import { emphasised } from '@/app/_components/words'
import { SITE } from '@/lib/site'

// The hero (ADR 0031): one screen, edge to edge, whose ground runs from the page's white at the
// top through the studio's blue to near-black at the foot, with the ink canvas multiplied onto
// it and the content anchored to the bottom, so the headline always lands on the light part and
// the caption, and the clients' logos under it, on the dark part whatever the viewport's height.
// The ground is a layer of its own, first in the section, because it rises as the hero scrolls
// out (app/globals.css, .hero-ground), and the ink and the content stay put over it.
// The headline is server-rendered and is the largest contentful paint. Nothing between it and
// the section may create a stacking context (a transform, an opacity, a filter, a z-index), or
// its colour flip over the ink (app/globals.css, .hero-heading) switches off. The prompt box is
// the first question.
export function Hero() {
  return (
    <section
      id="hero"
      className="hero relative isolate flex min-h-svh flex-col justify-end overflow-hidden px-6 pt-32 pb-[clamp(2.5rem,8vh,5rem)]"
    >
      <div aria-hidden="true" className="hero-ground" />
      <Ink />
      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-6 md:gap-8">
        <h1 className="hero-heading text-center text-hero font-semibold text-balance">
          {emphasised(SITE.tagline, HERO.emphasis)}
        </h1>
        <HeroPrompt />
        <div className="flex flex-col items-center gap-4 text-center text-surface">
          <div className="max-w-3xl">
            <p className="text-body text-pretty">{SITE.subhead}</p>
          </div>
          <Link
            href="/#work"
            aria-label={HERO.scrollLabel}
            className="inline-flex size-12 shrink-0 items-center justify-center rounded-full text-surface/80 transition-opacity duration-(--motion-tap) hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface"
          >
            <ArrowDown aria-hidden="true" className="size-8" strokeWidth={1.25} />
          </Link>
        </div>
        {/* The clients' marks, in the hero's white so they read on the dark foot of the ground,
            and under them what they are: the disclosure sits with the logos, not sections away. */}
        <div className="flex flex-col gap-4">
          <LogoMarquee className="text-surface" />
          <p className="text-center text-small text-surface/60">{LOGOS.caption}</p>
        </div>
      </div>
    </section>
  )
}
