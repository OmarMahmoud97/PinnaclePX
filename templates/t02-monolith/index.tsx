import './monolith.css'
import type { MonolithContent } from './copy-slots'
import { MonolithAbout } from './sections/about'
import { MonolithCta } from './sections/cta'
import { MonolithFaq } from './sections/faq'
import { MonolithFeatures } from './sections/features'
import { MonolithFooter } from './sections/footer'
import { MonolithHero } from './sections/hero'
import { MonolithHowItWorks } from './sections/how-it-works'
import { MonolithNav } from './sections/nav'
import { MonolithNewsletter } from './sections/newsletter'
import { MonolithPricing } from './sections/pricing'
import { ScrollToTop } from './sections/scroll-to-top'
import { MonolithServices } from './sections/services'
import { MonolithSponsors } from './sections/sponsors'
import { MonolithTeam } from './sections/team'
import { MonolithTestimonials } from './sections/testimonials'

type Props = { content: MonolithContent }

// Monolith, after Leo Miranda's shadcn-landing-page (MIT): its fourteen sections in its order,
// one content object, tokens only. The root is isolated so the hero's glow, at a negative
// z-index, sits above the root's own background as it does above the source's body.
export function Monolith({ content }: Props) {
  const { brand, nav, hero, sponsors, about, steps, features, services, cta, faq, footer } = content
  const { testimonials, team, pricing, newsletter } = content
  const credits = [
    hero.cards.quote.image,
    hero.cards.profile.image,
    about.image,
    services.image,
    ...features.items.map((item) => item.image),
    ...(testimonials?.items.map((item) => item.image) ?? []),
    ...(team?.members.map((member) => member.image) ?? []),
  ]
    .flatMap((image) => (image?.credit ? [image.credit] : []))
    .filter((credit, index, all) => all.findIndex((c) => c.url === credit.url) === index)
  return (
    <div
      id="top"
      className="monolith relative isolate bg-surface font-body text-on-surface antialiased"
    >
      <MonolithNav brand={brand} nav={nav} />
      <main id="main">
        <MonolithHero brand={brand} hero={hero} />
        <MonolithSponsors sponsors={sponsors} />
        <MonolithAbout about={about} />
        <MonolithHowItWorks steps={steps} />
        <MonolithFeatures features={features} />
        <MonolithServices services={services} />
        <MonolithCta cta={cta} />
        {testimonials !== null && <MonolithTestimonials testimonials={testimonials} />}
        {team !== null && <MonolithTeam team={team} />}
        {pricing !== null && <MonolithPricing pricing={pricing} />}
        {newsletter !== null && <MonolithNewsletter newsletter={newsletter} />}
        <MonolithFaq faq={faq} />
      </main>
      <MonolithFooter brand={brand} footer={footer} credits={credits} />
      <ScrollToTop />
    </div>
  )
}
