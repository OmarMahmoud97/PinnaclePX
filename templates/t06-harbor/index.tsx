import '../tailwind.css'
import './harbor.css'
import type { HarborContent } from './copy-slots'
import { HarborAbout } from './sections/about'
import { HarborBlog } from './sections/blog'
import { HarborContact } from './sections/contact'
import { HarborCta } from './sections/cta'
import { HarborFooter } from './sections/footer'
import { HarborGallery } from './sections/gallery'
import { HarborHero } from './sections/hero'
import { HarborMetrics } from './sections/metrics'
import { HarborNav } from './sections/nav'
import { HarborPartners } from './sections/partners'
import { HarborPricing } from './sections/pricing'
import { HarborReveal } from './sections/reveal'
import { HarborServices } from './sections/services'
import { HarborTestimonials } from './sections/testimonials'

type Props = { content: HarborContent }

// Harbor, after PrebuiltUI's Forged (MIT): its thirteen blocks in its order, one content
// object, tokens only. The source clipped horizontal overflow on its main element and set the
// body in Inter on near-black; the root does the same with the body face and the surface. The
// reveal at the end is the observer that plays each block's entrance once it comes into view.
export function Harbor({ content }: Props) {
  const { brand, nav, hero, about, services, metrics, contact, cta, footer } = content
  const { gallery, pricing, testimonials, partners, blog } = content
  const credits = [
    hero.image,
    about.image,
    cta.image,
    ...(gallery?.items.map((item) => item.image) ?? []),
    ...(testimonials?.items.map((item) => item.image) ?? []),
    ...(blog?.posts.map((post) => post.image) ?? []),
  ]
    .flatMap((image) => (image?.credit ? [image.credit] : []))
    .filter((credit, index, all) => all.findIndex((c) => c.url === credit.url) === index)
  return (
    <div
      id="top"
      className="harbor relative isolate overflow-x-hidden bg-surface font-body text-on-surface antialiased"
    >
      <HarborNav brand={brand} nav={nav} />
      <main id="main">
        <HarborHero hero={hero} />
        <HarborAbout about={about} />
        <HarborServices services={services} />
        <HarborMetrics metrics={metrics} />
        {gallery !== null && <HarborGallery gallery={gallery} />}
        {pricing !== null && <HarborPricing pricing={pricing} />}
        {testimonials !== null && <HarborTestimonials testimonials={testimonials} />}
        {partners !== null && <HarborPartners partners={partners} />}
        <HarborContact contact={contact} />
        <HarborCta cta={cta} />
        {blog !== null && <HarborBlog blog={blog} />}
      </main>
      <HarborFooter brand={brand} footer={footer} credits={credits} />
      <HarborReveal />
    </div>
  )
}
