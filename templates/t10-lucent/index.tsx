import '../tailwind.css'
import './lucent.css'
import type { LucentContent, LucentImage } from './copy-slots'
import { LucentFaq, LucentJournal, LucentPromise } from './sections/closing'
import { LucentFeatures } from './sections/features'
import { LucentFooter, LucentToTop } from './sections/footer'
import { LucentHero } from './sections/hero'
import { LucentLoader } from './sections/loader'
import { LucentMotion } from './sections/motion'
import { LucentNav } from './sections/nav'
import { LucentPricingSection } from './sections/pricing'
import { LucentManifesto, LucentPair, LucentWidgets } from './sections/showcase'
import {
  LucentBreakdown,
  LucentOverview,
  LucentPromo,
  LucentReminder,
  LucentSteps,
} from './sections/story'

type Props = { content: LucentContent }

// Lucent, after the owner's own home page for their iPhone app (ADR 0043): its blocks in its
// order, one content object, tokens only. Under everything sit the tint that warms the page
// around the wide picture and the grain; over everything, until the page is ready, the splash.
// The root asks the site's smooth scroll to stand down, because the source scrolled natively (its
// own script turned its Lenis off), and every scroll-tied piece of motion here is timed against
// the browser's own scrolling, as the source's was. The motion component starts the scripted
// motion once the page is on the screen.
export function Lucent({ content }: Props) {
  const { brand, nav, hero, promo, overview, breakdown, reminder, steps, features } = content
  const { widgets, pair, manifesto, pricing, faq, promise, journal, footer } = content
  const images: readonly (LucentImage | null)[] = [
    hero.image,
    promo.image,
    overview.image,
    breakdown.image,
    reminder.image,
    steps.image,
    ...features.items.map((item) => item.image),
    widgets.image,
    ...pair.images,
    journal.image,
  ]
  const credits = images
    .flatMap((image) => (image?.credit ? [image.credit] : []))
    .filter((credit, index, all) => all.findIndex((c) => c.url === credit.url) === index)
  return (
    <div id="top" className="lucent" data-scroll-native="">
      <div className="lc-tint" aria-hidden="true" />
      <div className="lc-grain" aria-hidden="true" />
      <LucentLoader name={brand.name} />
      <LucentNav brand={brand} nav={nav} />
      <main id="main">
        <LucentHero hero={hero} />
        <LucentPromo promo={promo} />
        <LucentOverview overview={overview} />
        <LucentBreakdown breakdown={breakdown} />
        <LucentReminder reminder={reminder} brand={brand} />
        <LucentSteps steps={steps} />
        <LucentFeatures features={features} />
        <LucentWidgets widgets={widgets} />
        <LucentPair pair={pair} />
        <LucentManifesto manifesto={manifesto} />
        {pricing !== null && <LucentPricingSection pricing={pricing} />}
        <LucentFaq faq={faq} />
        <LucentPromise promise={promise} />
        <LucentJournal journal={journal} />
      </main>
      <LucentFooter brand={brand} footer={footer} credits={credits} />
      <LucentToTop />
      <LucentMotion />
    </div>
  )
}
