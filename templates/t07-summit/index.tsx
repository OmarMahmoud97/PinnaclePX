import '../tailwind.css'
import './summit.css'
import type { SummitContent } from './copy-slots'
import { SummitArticles } from './sections/articles'
import { SummitBooking } from './sections/booking'
import { SummitCta } from './sections/cta'
import { SummitFacilities } from './sections/facilities'
import { SummitFaq } from './sections/faq'
import { SummitFooter } from './sections/footer'
import { SummitHero } from './sections/hero'
import { SummitNav } from './sections/nav'
import { SummitReveal } from './sections/reveal'
import { SummitServices } from './sections/services'
import { SummitSteps } from './sections/steps'
import { SummitWhy } from './sections/why'

type Props = { content: SummitContent }

// Summit, after PrebuiltUI's MediCare (MIT): its eleven blocks in its order, one content
// object, tokens only. The source set one face on the whole page; so does the root, in the
// body face. The root is isolated so the footer's watermark sits above its own background as
// it does above the source's body, and it clips nothing, since the deck of services relies on
// sticking to the viewport. The reveal at the end is the observer that plays each block's
// entrance once it comes into view.
export function Summit({ content }: Props) {
  const { brand, nav, hero, why, services, steps, facilities, faq, booking, cta, footer } = content
  const { articles } = content
  const credits = [
    hero.background,
    why.image,
    cta.image,
    ...(hero.proof?.avatars ?? []),
    ...services.items.map((item) => item.image),
    ...facilities.items.map((item) => item.image),
    ...(articles?.posts.map((post) => post.image) ?? []),
  ]
    .flatMap((image) => (image?.credit ? [image.credit] : []))
    .filter((credit, index, all) => all.findIndex((c) => c.url === credit.url) === index)
  return (
    <div
      id="top"
      className="summit relative isolate bg-surface font-body text-on-surface antialiased"
    >
      <SummitNav brand={brand} nav={nav} />
      <main id="main">
        <SummitHero hero={hero} />
        <SummitWhy why={why} />
        <SummitServices services={services} />
        <SummitSteps steps={steps} />
        <SummitFacilities facilities={facilities} />
        <SummitFaq faq={faq} />
        {articles !== null && <SummitArticles articles={articles} />}
        <SummitBooking booking={booking} />
        <SummitCta cta={cta} />
      </main>
      <SummitFooter brand={brand} footer={footer} credits={credits} />
      <SummitReveal />
    </div>
  )
}
