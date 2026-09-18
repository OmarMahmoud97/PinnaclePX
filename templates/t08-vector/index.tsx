import '../tailwind.css'
import './vector.css'
import type { VectorContent } from './copy-slots'
import { VectorAbout } from './sections/about'
import { VectorFaq } from './sections/faq'
import { VectorFooter } from './sections/footer'
import { VectorHeader } from './sections/header'
import { VectorHero } from './sections/hero'
import { VectorProjects } from './sections/projects'
import { VectorProof } from './sections/proof'
import { VectorReveal } from './sections/reveal'
import { VectorScrubs } from './sections/scrubs'
import { VectorServices } from './sections/services'

type Props = { content: VectorContent }

// Vector, after React Bits Pro's Agency template (THIRD_PARTY_NOTICES.md): its nine
// blocks in its order, one content object, tokens only. The source set the page in its sans
// on its background and let the footer sit under the page from lg, sticking to the window's
// foot while the page slides up off it; the main here sits above the footer the same way. The
// root is isolated so nothing outside it interleaves with the cursor and the overlay, and it
// clips nothing, since the pinned sentence relies on sticking to the viewport. The reveal at
// the end is the observer that plays and reverses the projects' titles.
export function Vector({ content }: Props) {
  const { brand, nav, hero, projects, services, about, proof, faq, footer } = content
  const credits = [
    about.image,
    ...projects.items.map((item) => item.image),
    ...(proof?.images ?? []),
  ]
    .flatMap((image) => (image?.credit ? [image.credit] : []))
    .filter((credit, index, all) => all.findIndex((c) => c.url === credit.url) === index)
  return (
    <div
      id="top"
      className="vector relative isolate min-h-screen bg-surface font-body text-on-surface antialiased"
    >
      <VectorHeader brand={brand} nav={nav} />
      <main id="main" className="flex-1 bg-surface lg:relative lg:z-10">
        <VectorHero hero={hero} />
        <VectorProjects projects={projects} />
        <VectorServices services={services} href="#contact" />
        <VectorAbout about={about} />
        {proof !== null && <VectorProof proof={proof} />}
        <VectorFaq faq={faq} />
      </main>
      <VectorFooter brand={brand} footer={footer} credits={credits} />
      <VectorReveal />
      <VectorScrubs />
    </div>
  )
}
