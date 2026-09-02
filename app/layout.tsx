import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'PinnaclePX',
  description: 'Generate a branded landing page preview from a short brief.',
}

type Props = Readonly<{ children: ReactNode }>

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <body className="bg-surface text-on-surface antialiased">{children}</body>
    </html>
  )
}
