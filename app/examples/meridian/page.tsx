import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import type { CSSProperties } from 'react'
import { tokenStyle } from '@/lib/tokens/css'
import type { Scheme, TokenSet } from '@/lib/tokens/types'
import { Meridian } from '@/templates/t03-meridian'
import { KESTREL_MERIDIAN } from '@/templates/t03-meridian/example/content'

// The source's own theme (its globals.css, the "Orange theme" block) as token sets, so the
// example renders in the source's colours: hsl(20 14.3% 4.1%) behind, hsl(24 9.8% 8%) cards,
// hsl(20.5 90.2% 48.2%) primary, and so on, converted to hex. The first glow is the magenta of
// the source's headline gradient. The tokens stage derives a set like this from a brand's own
// colour; this one is written by hand from the source.
const DARK: TokenSet = {
  surface: '#0c0a09',
  'surface-muted': '#292524',
  'on-surface': '#fafaf9',
  'on-surface-muted': '#a8a29e',
  border: '#292524',
  accent: '#161412',
  brand: '#ea580c',
  'brand-deeper': '#ea580c',
  'brand-deepest': '#c2410c',
  'on-brand': '#fafaf9',
  glow: '#d247bf',
  'glow-secondary': '#ea580c',
  scrim: '#000000',
  'on-scrim': '#ffffff',
}

const LIGHT: TokenSet = {
  surface: '#ffffff',
  'surface-muted': '#f5f5f4',
  'on-surface': '#0c0a09',
  'on-surface-muted': '#78716c',
  border: '#e7e5e4',
  accent: '#ffffff',
  brand: '#f97316',
  'brand-deeper': '#f97316',
  'brand-deepest': '#ea580c',
  'on-brand': '#fafaf9',
  glow: '#d247bf',
  'glow-secondary': '#f97316',
  scrim: '#000000',
  'on-scrim': '#ffffff',
}

// The source sets Inter on the body through next/font.
const inter = Inter({ subsets: ['latin'], display: 'swap', preload: false })

function tokensFor(scheme: Scheme): CSSProperties {
  return {
    ...tokenStyle(scheme === 'light' ? LIGHT : DARK),
    '--template-font-display': inter.style.fontFamily,
    '--template-font-body': inter.style.fontFamily,
  } as CSSProperties
}

export const metadata: Metadata = {
  title: 'Meridian template, example',
  robots: { index: false, follow: false },
}

// The Meridian template with example content, for design review against its source. Not
// linked and not indexed. Dark, as the source's screenshots are; ?scheme=light for its light
// theme.
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function MeridianExamplePage({ searchParams }: Props) {
  const { scheme } = await searchParams
  return (
    <div style={tokensFor(scheme === 'light' ? 'light' : 'dark')}>
      <Meridian content={KESTREL_MERIDIAN} />
    </div>
  )
}
