import '../tailwind.css'
import './inegro.css'
import type { InegroContent } from './copy-slots'
import { InegroClosing } from './sections/closing'
import { InegroFooter } from './sections/footer'
import { InegroGlass } from './sections/glass'
import { InegroHeader } from './sections/header'
import { InegroHero } from './sections/hero'
import { InegroMotion } from './sections/motion'
import { InegroNewsletter } from './sections/newsletter'
import { InegroNotes } from './sections/notes'
import { InegroOffers } from './sections/offers'
import { InegroProcess } from './sections/process'
import { InegroServices } from './sections/services'

type Props = { content: InegroContent }

// Inegro, after the home page of a WordPress site the owner's friend built for a client (ADR
// 0041): its blocks in its order, one content object, tokens only. As in the source, the header
// and the page's blocks sit in a frame that clips the ribbons at the sides, and the band and the
// footer follow it. The root is isolated so the veil under the dropdowns and the glass cards
// stack only among themselves. The motion component starts the scripted motion once the page is
// on the screen.
export function Inegro({ content }: Props) {
  const { brand, nav, hero, intro, services, notes, process, approach, offers, mission } = content
  const { newsletter, closing, footer } = content
  const credits = [
    intro.image,
    ...services.items.map((item) => item.image),
    approach.image,
    mission.image,
  ]
    .flatMap((image) => (image?.credit ? [image.credit] : []))
    .filter((credit, index, all) => all.findIndex((c) => c.url === credit.url) === index)
  return (
    <div id="top" className="inegro">
      <div className="inegro-frame">
        <InegroHeader
          brand={brand}
          nav={nav}
          highlights={services.items}
          highlightCta={services.itemCta}
        />
        <main id="main" className="inegro-main">
          <InegroHero hero={hero} />
          <InegroGlass id="intro" card={intro} tone={1} />
          <InegroServices brand={brand} services={services} />
          <InegroNotes notes={notes} />
          <InegroProcess process={process} />
          <InegroGlass id="approach" card={approach} tone={2} />
          <InegroOffers offers={offers} />
          <InegroGlass id="mission" card={mission} tone={3} />
          <InegroNewsletter newsletter={newsletter} />
        </main>
      </div>
      <InegroClosing closing={closing} />
      <InegroFooter brand={brand} footer={footer} credits={credits} />
      <InegroMotion />
    </div>
  )
}
