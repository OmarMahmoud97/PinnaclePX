import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import type { ReactNode } from 'react'
import { SmoothScroll } from '@/app/_components/smooth-scroll'
import { env } from '@/lib/env'
import { SITE } from '@/lib/site'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans', display: 'swap' })

// The instrument register: captions, labels and measurements. Same designer as Geist.
const geistMono = Geist_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-geist-mono',
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
    <html lang="en-GB" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="bg-surface text-on-surface antialiased">
        <a
          href="#main"
          data-lenis-ignore
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-100 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:ring-2 focus:ring-brand-deeper"
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
