import type { Metadata } from 'next'
import { PageChoreography } from '@/app/_components/page-choreography'
import { PageMotion } from '@/app/_components/page-motion'
import { SiteFooter } from '@/app/_components/site-footer'
import { SiteHeader } from '@/app/_components/site-header'
import { BookingSheet } from '@/app/contact/_components/booking-sheet'
import { ContactAnswers } from '@/app/contact/_components/contact-answers'
import { ContactBand } from '@/app/contact/_components/contact-band'
import { CONTACT_META } from '@/app/contact/_components/contact-copy'
import { SITE } from '@/lib/site'
// The page's own rules, imported by its route rather than by app/globals.css, so they load here
// alone and the stylesheet every other page shares never carries them (the /start pattern,
// docs/start-page-journey-plan.md, D26).
import '../_styles/contact.css'

const TITLE = `${CONTACT_META.title} | ${SITE.name}`

// The page's own objects replace the layout's, so the social card's are restated here; the
// file-based card image still applies.
export const metadata: Metadata = {
  title: CONTACT_META.title,
  description: CONTACT_META.description,
  alternates: { canonical: '/contact' },
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    locale: 'en_GB',
    url: '/contact',
    title: TITLE,
    description: CONTACT_META.description,
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: CONTACT_META.description },
}

// The contact page (ADR 0040): the home page's closing, continued. The first band is the hero's
// ground with its ink, the H1 and the two routes, a message or a call; under it a white band
// answers what happens to a message, and the footer's sheet ends the page. The calendar's sheet
// waits, closed, at the end of main for a booking control to open it. It reads no request,
// so it is prerendered, and the header needs no props, since its first screen is white. The
// home page's choreography rides along for its liquid edges: the pooled curve under the first
// band and the footer sheet's lip spring with the scroll here as they do there, the footer's
// wordmark rises as it does there, and the home page's section modules find none of their
// sections and do nothing.
export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="contact flex flex-col">
        <ContactBand />
        <ContactAnswers />
        <BookingSheet />
      </main>
      <SiteFooter />
      <PageMotion />
      <PageChoreography />
    </>
  )
}
