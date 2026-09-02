import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import type { ReactNode } from 'react'
import { ThemeScript } from '@/app/_components/theme-script'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: 'PinnaclePX',
  description: 'Generate a branded landing page preview from a short brief.',
}

type Props = Readonly<{ children: ReactNode }>

export default function RootLayout({ children }: Props) {
  // suppressHydrationWarning: ThemeScript may add the dark class to <html> before React hydrates.
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="bg-surface text-on-surface antialiased">{children}</body>
    </html>
  )
}
