import { ClosingCta } from '@/app/_components/closing-cta'
import { DemoTabs } from '@/app/_components/demo-tabs'
import { Faq } from '@/app/_components/faq'
import { Hero } from '@/app/_components/hero'
import { LogoCloud } from '@/app/_components/logo-cloud'
import { Pricing } from '@/app/_components/pricing'
import { SiteFooter } from '@/app/_components/site-footer'
import { SiteHeader } from '@/app/_components/site-header'
import { Workflow } from '@/app/_components/workflow'

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl border-x border-border">
      <SiteHeader />
      <main className="flex flex-col divide-y divide-border pt-16">
        <Hero />
        <DemoTabs />
        <LogoCloud />
        <Workflow />
        <Pricing />
        <Faq />
        <ClosingCta />
      </main>
      <SiteFooter />
    </div>
  )
}
