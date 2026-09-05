import '../tailwind.css'
import './meridian.css'
import type { MeridianContent } from './copy-slots'
import { MeridianBenefits } from './sections/benefits'
import { MeridianCommunity } from './sections/community'
import { MeridianContact } from './sections/contact'
import { MeridianFaq } from './sections/faq'
import { MeridianFeatures } from './sections/features'
import { MeridianFooter } from './sections/footer'
import { MeridianHero } from './sections/hero'
import { MeridianNav } from './sections/nav'
import { MeridianPricing } from './sections/pricing'
import { MeridianServices } from './sections/services'
import { MeridianSponsors } from './sections/sponsors'
import { MeridianTeam } from './sections/team'
import { MeridianTestimonials } from './sections/testimonials'

type Props = { content: MeridianContent }

// Meridian, after Bruno Felipy's shadcn-landing-page (MIT): its thirteen sections in its
// order, one content object, tokens only.
export function Meridian({ content }: Props) {
  const { brand, nav, hero, sponsors, benefits, features, services, community } = content
  const { testimonials, team, pricing, contact, faq, footer } = content
  const credits = [
    hero.image,
    nav.menu.image,
    ...(testimonials?.items.map((item) => item.image) ?? []),
    ...(team?.members.map((member) => member.image) ?? []),
  ]
    .flatMap((image) => (image?.credit ? [image.credit] : []))
    .filter((credit, index, all) => all.findIndex((c) => c.url === credit.url) === index)
  return (
    <div
      id="top"
      className="meridian min-h-screen bg-surface font-body text-on-surface antialiased"
    >
      <MeridianNav brand={brand} nav={nav} />
      <main id="main">
        <MeridianHero hero={hero} />
        <MeridianSponsors sponsors={sponsors} />
        <MeridianBenefits benefits={benefits} />
        <MeridianFeatures features={features} />
        <MeridianServices services={services} />
        {testimonials !== null && <MeridianTestimonials testimonials={testimonials} />}
        {team !== null && <MeridianTeam team={team} />}
        <MeridianCommunity community={community} />
        {pricing !== null && <MeridianPricing pricing={pricing} />}
        <MeridianContact contact={contact} />
        <MeridianFaq faq={faq} />
      </main>
      <MeridianFooter brand={brand} footer={footer} credits={credits} />
    </div>
  )
}
