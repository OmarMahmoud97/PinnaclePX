import { ArrowDown } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { HeroInk } from '@/app/_components/hero-ink'
import { HeroPrompt } from '@/app/_components/hero-prompt'
import { LogoMarquee } from '@/app/_components/logo-marquee'
import { BOOK_CALL } from '@/app/_components/nav-links'
import { HERO } from '@/app/_components/section-copy'
import { TrackedLink } from '@/components/ui/tracked-link'
import { SITE } from '@/lib/site'

// The tagline with one word set apart, the way the reference sets its headline: the promise
// is in that word. The sentence stays whole in SITE.tagline for the title and the copy tests.
function emphasised(text: string, word: string): ReactNode {
  const at = text.indexOf(word)
  if (at < 0) return text
  return (
    <>
      {text.slice(0, at)}
      <em>{word}</em>
      {text.slice(at + word.length)}
    </>
  )
}

// The hero (ADR 0031): one screen, edge to edge, whose ground runs from the page's white at the
// top through the studio's blue to near-black at the foot, with the ink canvas multiplied onto
// it and the content anchored to the bottom, so the headline always lands on the light part and
// the caption, and the clients' logos under it, on the dark part whatever the viewport's height.
// The headline is server-rendered and is the largest contentful paint. Nothing between it and
// the section may create a stacking context (a transform, an opacity, a filter, a z-index), or
// its colour flip over the ink (app/globals.css, .hero-heading) switches off. The prompt box is
// the first question.
export function Hero() {
  return (
    <section
      id="hero"
      className="hero-ground relative isolate flex min-h-svh flex-col justify-end overflow-hidden px-6 pt-36 pb-[clamp(3rem,12.5vh,7.75rem)]"
    >
      <HeroInk />
      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-8 md:gap-12">
        <h1 className="hero-heading text-hero font-semibold text-balance">
          {emphasised(SITE.tagline, HERO.emphasis)}
        </h1>
        <HeroPrompt />
        <div className="flex flex-col gap-6 text-surface sm:flex-row sm:items-end sm:justify-between">
          <div className="flex max-w-xl flex-col gap-3">
            <p className="text-lead text-pretty">{SITE.subhead}</p>
            <p className="text-small text-surface/75">
              {HERO.talkFirst}{' '}
              <TrackedLink
                href={BOOK_CALL.href}
                event="call_click"
                location="hero"
                className="font-medium text-surface underline underline-offset-4 transition-opacity duration-(--motion-tap) hover:opacity-70"
              >
                {BOOK_CALL.label}
              </TrackedLink>
            </p>
          </div>
          <Link
            href="/#what-you-get"
            aria-label={HERO.scrollLabel}
            className="inline-flex size-12 shrink-0 items-center justify-center rounded-full text-surface/80 transition-opacity duration-(--motion-tap) hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface"
          >
            <ArrowDown aria-hidden="true" className="size-8" strokeWidth={1.25} />
          </Link>
        </div>
        {/* The clients' marks, in the hero's white so they read on the dark foot of the ground. */}
        <LogoMarquee className="text-surface" />
      </div>
    </section>
  )
}
