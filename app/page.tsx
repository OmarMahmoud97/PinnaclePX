import { About } from '@/app/_components/about'
import { ClosingCta } from '@/app/_components/closing-cta'
import { Faq } from '@/app/_components/faq'
import { Hero } from '@/app/_components/hero'
import { HowItWorks } from '@/app/_components/how-it-works'
import { Included } from '@/app/_components/included'
import { JsonLd } from '@/app/_components/json-ld'
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

// The page promises three designs and the pipeline builds one per ready template. This route is
// prerendered, so on the production deployment, where LAUNCH_GATE is set, the build fails here
// while fewer templates are ready than the page promises, and the promise never reaches a visitor
// untrue. Unset, as in development and preview, nothing happens.
if (env.LAUNCH_GATE === '1' && !readyForTraffic(READY_TEMPLATES.length)) {
  throw new Error(
    `LAUNCH_GATE: ${String(READY_TEMPLATES.length)} of the ${String(CONFIG.templates.conceptsShown)} templates the page promises are ready`,
  )
}

// The hairline frame the page sits in: the column with its two rules, which the header's inner
// row and the footer share, so the rules run unbroken from the first section to the foot.
const frame = 'mx-auto w-full max-w-7xl border-x border-border'

// The order is the arc in docs/adr/0033: proof the visitor can open on a phone, the site they
// would get, the free look at it, what happens if they like one, the other route compared
// fairly, the catch, the person, the questions left, the ask. Nine bands where there were
// twelve: the free designs are the first step in that story rather than its subject, so what the
// taster gives is now told once, by the walkthrough. The hero fills the first screen edge to
// edge under the see-through header (ADR 0031); every section after it is a direct child of the
// frame so divide-y draws the hairline between them.
export default function HomePage() {
  return (
    <>
      <JsonLd />
      <SiteHeader />
      <main id="main" className="flex flex-col">
        <Hero />
        <div className={`${frame} flex flex-col divide-y divide-border`}>
          <Work />
          <Included />
          <HowItWorks />
          <RealBuild />
          <YourOptions />
          <StraightAnswers />
          <About />
          <Faq />
          <ClosingCta />
        </div>
      </main>
      <div className={frame}>
        <SiteFooter />
      </div>
      <PageMotion />
    </>
  )
}
