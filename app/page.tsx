import { About } from '@/app/_components/about'
import { ClosingCta } from '@/app/_components/closing-cta'
import { Faq } from '@/app/_components/faq'
import { Hero } from '@/app/_components/hero'
import { HowItWorks } from '@/app/_components/how-it-works'
import { JsonLd } from '@/app/_components/json-ld'
import { SectionViews } from '@/app/_components/section-views'
import { SiteFooter } from '@/app/_components/site-footer'
import { SiteHeader } from '@/app/_components/site-header'
import { StraightAnswers } from '@/app/_components/straight-answers'
import { Taster } from '@/app/_components/taster'
import { WhatYouGet } from '@/app/_components/what-you-get'

// The examples gallery slots in between HowItWorks and Taster once the templates render.
export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl border-x border-border">
      <JsonLd />
      <SiteHeader />
      <main id="main" className="flex flex-col divide-y divide-border pt-16">
        <Hero />
        <WhatYouGet />
        <HowItWorks />
        <Taster />
        <StraightAnswers />
        <About />
        <Faq />
        <ClosingCta />
      </main>
      <SiteFooter />
      <SectionViews />
    </div>
  )
}
