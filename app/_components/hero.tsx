import { HeroStage } from '@/app/_components/hero-stage'
import { displayHeading } from '@/app/_components/section-styles'
import { SITE } from '@/lib/site'

// The headline and the subhead are server-rendered and handed to the stage as children, so the
// two candidates for the LCP element never wait for JavaScript. The stage draws the rest.
export function Hero() {
  return (
    <HeroStage>
      <h1 className={displayHeading}>{SITE.tagline}</h1>
      <p className="max-w-2xl text-lead text-pretty text-on-surface-muted">
        Answer a few short questions and about five minutes later, you&apos;ll see three homepage
        designs in your logo and colours. A free taste of how we work. Then decide whether to talk
        to us.
      </p>
    </HeroStage>
  )
}
