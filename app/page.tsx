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

// The page promises three designs and the pipeline builds one per ready template. This route is
// prerendered, so on the production deployment, where LAUNCH_GATE is set, the build fails here
// while fewer templates are ready than the page promises, and the promise never reaches a visitor
// untrue. Unset, as in development and preview, nothing happens.
if (env.LAUNCH_GATE === '1' && !readyForTraffic(READY_TEMPLATES.length)) {
  throw new Error(
    `LAUNCH_GATE: ${String(READY_TEMPLATES.length)} of the ${String(CONFIG.templates.conceptsShown)} templates the page promises are ready`,
  )
}

// The order is the arc in docs/adr/0033: proof the visitor can open on a phone, the site they
// would get, the free look at it, what happens if they like one, the other route compared
// fairly, the catch, the person, the questions left, the ask. Nine bands where there were
// twelve: the free designs are the first step in that story rather than its subject, so what the
// taster gives is now told once, by the walkthrough.
//
// Below the hero the page continues the hero's ink (ADR 0034). There is no frame and no hairline
// between bands: each section paints its own ground edge to edge and keeps its content in the
// shell, and the separation is a ground, a card, air or one of two shapes. The proof and the
// promise sit on the hero's own foot as one dark stretch, which ends in a pooled curve over the
// walkthrough's wash; the wash carries the two commercial bands and dissolves to white for the
// answers, the studio and the questions; the closing hands the ink back on white; and the footer,
// a dark sheet with rounded top corners laid over the closing's foot, ends the page on the foot
// again. The stretch and the footer are the page's two dark scopes (data-theme="dark"), which
// the header reads as it passes over them (app/_components/header-chrome.tsx). PageMotion runs the
// list reveals; PageChoreography, after it, loads the scroll choreography once the visitor scrolls.
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
