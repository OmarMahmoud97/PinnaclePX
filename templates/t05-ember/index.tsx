import '../tailwind.css'
import './ember.css'
import type { EmberContent } from './copy-slots'
import { EmberAbout } from './sections/about'
import { EmberBooking } from './sections/booking'
import { EmberCta } from './sections/cta'
import { EmberDishes } from './sections/dishes'
import { EmberFaq } from './sections/faq'
import { EmberFeatures } from './sections/features'
import { EmberFooter } from './sections/footer'
import { EmberHero } from './sections/hero'
import { EmberNav } from './sections/nav'
import { EmberReveal } from './sections/reveal'
import { EmberStats } from './sections/stats'
import { EmberTestimonials } from './sections/testimonials'
import { EmberTiming } from './sections/timing'

type Props = { content: EmberContent }

// Ember, after PrebuiltUI's Restro (MIT): its twelve blocks in its order, one content object,
// tokens only. The source set its body to the small text size; so is the root here. The root
// is isolated so the footer's watermark, at a negative z-index, sits above the root's own
// background as it does above the source's body. The reveal at the end is the observer that
// plays each block's entrance once it comes into view.
export function Ember({ content }: Props) {
  const { brand, nav, hero, about, stats, dishes, features, booking, timing, faq, cta, footer } =
    content
  const { testimonials } = content
  const credits = [
    hero.background,
    about.image,
    about.location?.image ?? null,
    features.image,
    timing.image,
    booking.testimonial?.image ?? null,
    ...(hero.proof?.avatars.map((avatar) => avatar) ?? []),
    ...dishes.items.map((item) => item.image),
    ...(testimonials?.items.map((item) => item.image) ?? []),
  ]
    .flatMap((image) => (image?.credit ? [image.credit] : []))
    .filter((credit, index, all) => all.findIndex((c) => c.url === credit.url) === index)
  return (
    <div
      id="top"
      className="ember relative isolate bg-surface font-body text-sm text-on-surface antialiased"
    >
      <EmberNav brand={brand} nav={nav} />
      <main id="main">
        <EmberHero hero={hero} />
        <EmberAbout about={about} />
        <EmberStats stats={stats} />
        <EmberDishes dishes={dishes} />
        <EmberFeatures features={features} />
        <EmberBooking booking={booking} />
        <EmberTiming timing={timing} />
        {testimonials !== null && <EmberTestimonials testimonials={testimonials} />}
        <EmberFaq faq={faq} />
        <EmberCta cta={cta} pictures={dishes.items.slice(0, 4).map((item) => item.image)} />
      </main>
      <EmberFooter brand={brand} footer={footer} credits={credits} />
      <EmberReveal />
    </div>
  )
}
