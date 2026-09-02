import { DemoTabs } from '@/app/_components/demo-tabs'
import { Hero } from '@/app/_components/hero'
import { LogoCloud } from '@/app/_components/logo-cloud'
import { SiteHeader } from '@/app/_components/site-header'

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl border-x border-border">
      <SiteHeader />
      <main className="flex flex-col divide-y divide-border pt-16">
        <Hero />
        <DemoTabs />
        <LogoCloud />
      </main>
    </div>
  )
}
