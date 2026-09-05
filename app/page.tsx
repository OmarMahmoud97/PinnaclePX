import { About } from '@/app/_components/about'
import { ClosingCta } from '@/app/_components/closing-cta'
import { Faq } from '@/app/_components/faq'
import { Hero } from '@/app/_components/hero'
import { HowItWorks } from '@/app/_components/how-it-works'
import { JsonLd } from '@/app/_components/json-ld'
import { Outcomes } from '@/app/_components/outcomes'
import { PageMotion } from '@/app/_components/page-motion'
import { RealBuild } from '@/app/_components/real-build'
import { SiteFooter } from '@/app/_components/site-footer'
import { SiteHeader } from '@/app/_components/site-header'
import { StraightAnswers } from '@/app/_components/straight-answers'
import { Taster } from '@/app/_components/taster'
import { WhatYouGet } from '@/app/_components/what-you-get'
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

// The order is the persuasion arc in docs/home-page-content-plan.md section 2: mechanism, proof,
// value, the ask, the deal, the alternatives, the objections. Every section is a direct child of
// <main> so divide-y draws the hairline between them. The examples band slots in between
// HowItWorks and Outcomes once a real render exists.
export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl border-x border-border">
      <JsonLd />
      <SiteHeader />
      <main id="main" className="flex flex-col divide-y divide-border pt-16">
        <Hero />
        <WhatYouGet />
        <HowItWorks />
        <Outcomes />
        <Taster />
        <RealBuild />
        <YourOptions />
        <StraightAnswers />
        <About />
        <Faq />
        <ClosingCta />
      </main>
      <SiteFooter />
      <PageMotion />
    </div>
  )
}
