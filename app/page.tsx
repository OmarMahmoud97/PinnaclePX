import { About } from '@/app/_components/about'
import { ClosingCta } from '@/app/_components/closing-cta'
import { Faq } from '@/app/_components/faq'
import { Hero } from '@/app/_components/hero'
import { HowItWorks } from '@/app/_components/how-it-works'
import { Included } from '@/app/_components/included'
import { JsonLd } from '@/app/_components/json-ld'
import { PageChoreography } from '@/app/_components/page-choreography'
import { PageMotion } from '@/app/_components/page-motion'
import { RealBuild } from '@/app/_components/real-build'
import { SiteFooter } from '@/app/_components/site-footer'
import { SiteHeader } from '@/app/_components/site-header'
import { StraightAnswers } from '@/app/_components/straight-answers'
import { Work } from '@/app/_components/work'
import { YourOptions } from '@/app/_components/your-options'
import { CONFIG } from '@/lib/config'
import { env } from '@/lib/env'
import { readyForTraffic } from '@/lib/select/select'
import { READY_TEMPLATES } from '@/templates/registry'

if (env.LAUNCH_GATE === '1' && !readyForTraffic(READY_TEMPLATES.length)) {
  throw new Error(
    `LAUNCH_GATE: ${String(READY_TEMPLATES.length)} of the ${String(CONFIG.templates.conceptsShown)} templates the page promises are ready`,
  )
}
export default function HomePage() {
  return (
    <>
      <JsonLd />
      <SiteHeader />
      <main id="main" className="flex flex-col">
        <Hero />
        <div data-theme="dark" className="ink-stretch flex flex-col">
          <Work />
          <Included />
          <svg
            data-theme="dark"
            className="ink-pool"
            viewBox="0 0 1000 140"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M0 -2H1000V0A962.857 962.857 0 0 1 0 0Z" />
          </svg>
        </div>
        <HowItWorks />
        <RealBuild />
        <YourOptions />
        <StraightAnswers />
        <About />
        <Faq />
        <ClosingCta />
      </main>
      <SiteFooter />
      <PageMotion />
      <PageChoreography />
    </>
  )
}
