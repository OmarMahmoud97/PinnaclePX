import { Ink } from '@/app/_components/ink'
import { emphasised } from '@/app/_components/words'
import { CallCard } from '@/app/contact/_components/call-card'
import { CONTACT_HERO } from '@/app/contact/_components/contact-copy'
import { ContactForm } from '@/app/contact/_components/contact-form'

// The page's first band (ADR 0040): the home page's closing carried on. It opens on the hero's
// ground, white at the top, the studio's blue through the middle and near-black at the foot
// (app/_styles/contact.css, .contact-ground), with the same live ink multiplied onto it, and on
// it the H1 and the two routes as the brand's two materials: writing on a white card, talking on
// an ink card. The section paints its own white, so the canvas has an opaque ground to multiply
// onto, and it is isolated, so the H1's flip blends with the ground and the ink alone.
//
// Paint order is tree order, since every layer is positioned and none takes a z-index: the ramp,
// the header's dark mark, the canvas, then the content over them all. The H1 sits on the ramp's
// pure white at every width and flips by difference where ink passes behind it (.over-ink, app/
// globals.css), so nothing between it and the section may make a stacking context: no transform,
// opacity, filter or z-index, and it is never animated. Every other word on the band is on an
// opaque card, never on the ink. The em takes the serif italic through `emphasis`, a font rule.
//
// The band hands over to the white band of answers through the home page's pooled curve, hung
// from the wrapper, which is positioned so the curve can hang from its foot. From md up, with
// motion allowed, the home page's choreography springs it with the scroll, as it springs the
// home page's (app/_components/motion/ink-pool.ts); phones and reduced motion keep this arc.
export function ContactBand() {
  return (
    <div className="relative">
      <section
        id="contact"
        aria-labelledby="contact-heading"
        className="contact-band relative isolate overflow-hidden bg-surface px-6 md:px-10"
      >
        <div aria-hidden="true" className="contact-ground" />
        <span aria-hidden="true" data-theme="dark" className="contact-dark-foot" />
        <Ink />
        <div className="contact-stack relative">
          <h1
            id="contact-heading"
            className="contact-title emphasis over-ink text-hero font-semibold text-balance text-on-surface"
          >
            {emphasised(CONTACT_HERO.heading, CONTACT_HERO.emphasis)}
          </h1>
          <div className="contact-grid">
            <ContactForm />
            <CallCard />
          </div>
        </div>
      </section>
      <svg
        data-theme="dark"
        className="ink-pool"
        viewBox="0 0 1000 140"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M0 -2H1000V0A962.857 962.857 0 0 1 0 0Z" />
      </svg>
    </div>
  )
}
