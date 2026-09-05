import './atlas.css'
import type { AtlasContent } from './copy-slots'
import { AtlasFaq } from './sections/faq'
import { AtlasFooter } from './sections/footer'
import { AtlasHero } from './sections/hero'
import { AtlasMarket } from './sections/market'
import { Mdi } from './sections/mdi'
import { AtlasNav } from './sections/nav'
import { AtlasOffer } from './sections/offer'
import { AtlasPartners } from './sections/partners'
import { AtlasPitch } from './sections/pitch'
import { AtlasSteps } from './sections/steps'
import { AtlasTools } from './sections/tools'
import { AtlasWhy } from './sections/why'

type Props = { content: AtlasContent }

// Atlas, after Rafli Surya Pratama's Nefa (MIT): its layout (the cover wash behind the top of
// the page, the header, the main, the footer) and its ten sections in its order, one content
// object, tokens only.
export function Atlas({ content }: Props) {
  const { brand, nav, hero, market, glance, pitch, partners, offer, tools, why, steps, faq } =
    content
  const { footer } = content
  const credits = [
    hero.image,
    pitch.image,
    offer.image,
    tools.image,
    why.image,
    faq.image,
    ...steps.items.map((step) => step.image),
  ]
    .flatMap((image) => (image?.credit ? [image.credit] : []))
    .filter((credit, index, all) => all.findIndex((c) => c.url === credit.url) === index)
  return (
    <div
      id="top"
      className="atlas relative min-h-screen bg-surface font-body text-on-surface antialiased"
    >
      <div className="relative">
        <div
          aria-hidden="true"
          className="atlas-cover absolute top-0 left-0 h-[125vh] w-full sm:h-[225vh] lg:h-[125vh]"
        />
        <AtlasNav brand={brand} nav={nav} />

        <main id="main" className="text-on-surface">
          <div className="w-full">
            <AtlasHero hero={hero} />
            <AtlasMarket market={market} glance={glance} />
            <AtlasPitch pitch={pitch} />
            {partners !== null && <AtlasPartners partners={partners} />}
            <AtlasOffer offer={offer} />
            <AtlasTools tools={tools} />
            <AtlasWhy why={why} />
            <AtlasSteps steps={steps} />
            <AtlasFaq faq={faq} />

            <div className="my-10 flex w-full justify-center">
              <a
                href="#top"
                data-fade="flip"
                data-delay="1"
                className="flex items-center rounded-md border border-border bg-surface-muted px-6 py-3 text-on-surface-muted hover:bg-accent hover:shadow-md [&>*+*]:ml-2"
              >
                <span>Back to top</span>
                <Mdi name="arrowUp" size={20} />
              </a>
            </div>
          </div>
        </main>

        <AtlasFooter brand={brand} footer={footer} credits={credits} />
      </div>
    </div>
  )
}
