import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata } from 'next'
import { Instrument_Serif, Mona_Sans } from 'next/font/google'
import type { ReactNode } from 'react'
import { SmoothScroll } from '@/app/_components/smooth-scroll'
import { env } from '@/lib/env'
import { SITE } from '@/lib/site'
import './globals.css'

// The studio's face (ADR 0034): one variable weight file, no width axis, roman only. The width
// axis would more than double the file for a device the page does not use.
const siteSans = Mona_Sans({
  subsets: ['latin'],
  weight: 'variable',
  style: 'normal',
  variable: '--font-site-sans',
  display: 'swap',
})

// The voice: one italic file for the three emphasis phrases; the roman is never loaded.
const siteSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: 'italic',
  variable: '--font-site-serif',
  display: 'swap',
})

const TITLE = `${SITE.name}: ${SITE.tagline}`

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: { default: TITLE, template: `%s | ${SITE.name}` },
  description: SITE.description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    title: TITLE,
    description: SITE.description,
    locale: 'en_GB',
    url: '/',
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: SITE.description },
}

type Props = Readonly<{ children: ReactNode }>

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en-GB" className={`${siteSans.variable} ${siteSerif.variable}`}>
      <body className="bg-surface text-on-surface antialiased">
        <a
          href="#main"
          data-lenis-ignore
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-100 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:ring-2 focus:ring-brand-ink"
        >
          Skip to content
        </a>
        {children}
        <SmoothScroll />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
