import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import type { CSSProperties } from 'react'
import { tokenStyle } from '@/lib/tokens/css'
import { deriveTokens } from '@/lib/tokens/derive'
import type { Scheme, TokenSet } from '@/lib/tokens/types'
import { Harbor } from '@/templates/t06-harbor'
import { HARBOR_CONTRAST_PAIRS } from '@/templates/t06-harbor/copy-slots'
import { KESTREL_HARBOR } from '@/templates/t06-harbor/example/content'

// The source's own colours as a token set: its near-black page, its slightly lighter bands,
// its cards, its hairlines, white for its text (its #888 muted grey is unused on the page), its
// lime for the accent and the lime's hover, near-black on lime, and the lime and its dimmer
// twin (#b8e020, from its stylesheet) as the two glows. The source has no light theme, so
// ?scheme=light derives one from its lime the way the tokens stage would.
const DARK: TokenSet = {
  surface: '#0b0b0b',
  'surface-muted': '#0f0f0f',
  'on-surface': '#ffffff',
  'on-surface-muted': '#888888',
  border: '#1a1a1a',
  accent: '#111111',
  brand: '#d7ff2f',
  'brand-deeper': '#d7ff2f',
  'brand-deepest': '#c8f020',
  'on-brand': '#0b0b0b',
  glow: '#d7ff2f',
  'glow-secondary': '#b8e020',
  scrim: '#0b0b0b',
  'on-scrim': '#ffffff',
}

// The source sets Inter on the page and Space Grotesk on its headings and buttons, both from
// Google Fonts as variable faces. Loaded here, not preloaded, as the other examples load
// theirs.
const inter = Inter({ subsets: ['latin'], display: 'swap', preload: false })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], display: 'swap', preload: false })

function tokensFor(scheme: Scheme): CSSProperties {
  return {
    ...tokenStyle(
      scheme === 'light' ? deriveTokens('#d7ff2f', 'light', HARBOR_CONTRAST_PAIRS) : DARK,
    ),
    '--template-font-display': spaceGrotesk.style.fontFamily,
    '--template-font-body': inter.style.fontFamily,
  } as CSSProperties
}

export const metadata: Metadata = {
  title: 'Harbor template, example',
  robots: { index: false, follow: false },
}

// The Harbor template with example content, for design review against its source. Not linked
// and not indexed. Dark, as the source is; ?scheme=light for a derived light set.
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function HarborExamplePage({ searchParams }: Props) {
  const { scheme } = await searchParams
  return (
    <div style={tokensFor(scheme === 'light' ? 'light' : 'dark')}>
      <Harbor content={KESTREL_HARBOR} />
    </div>
  )
}
