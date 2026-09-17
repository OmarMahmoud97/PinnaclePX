import type { Metadata } from 'next'
import { Urbanist } from 'next/font/google'
import type { CSSProperties } from 'react'
import { tokenStyle } from '@/lib/tokens/css'
import { deriveTokens } from '@/lib/tokens/derive'
import type { Scheme, TokenSet } from '@/lib/tokens/types'
import { Summit } from '@/templates/t07-summit'
import { SUMMIT_CONTRAST_PAIRS } from '@/templates/t07-summit/copy-slots'
import { KESTREL_SUMMIT } from '@/templates/t07-summit/example/content'

// The source's own colours as a token set: white behind, slate-50 for its cards and bands,
// black for its buttons (which are its one fill) and zinc-800 for their hover, white on them,
// black as the base of its greys (its headings are that black at 85 percent), zinc-600 for
// its paragraphs, slate-200 for its rules, purple-100 for the tint of every other service
// card, its orange (#fe6e00, its own value for Tailwind's orange-500) for the stars and its
// green (#00a544, its own green-600) for the dot before a reading time, and black under a
// facility's caption with white on it. The source has no dark theme, so ?scheme=dark derives
// one from the purple it tints with, the way the tokens stage would.
const LIGHT: TokenSet = {
  surface: '#ffffff',
  'surface-muted': '#f8fafc',
  'on-surface': '#000000',
  'on-surface-muted': '#52525c',
  border: '#e2e8f0',
  accent: '#f3e8ff',
  brand: '#000000',
  'brand-deeper': '#000000',
  'brand-deepest': '#27272a',
  'on-brand': '#ffffff',
  glow: '#fe6e00',
  'glow-secondary': '#00a544',
  scrim: '#000000',
  'on-scrim': '#ffffff',
}

// The source sets Geist on the page and, by a rule in its stylesheet, Urbanist on every h1:
// the hero's headline, each block's heading and the titles of the service cards. Geist is the
// site's own face, already on the root; Urbanist is loaded here, not preloaded, as the other
// examples load theirs.
const urbanist = Urbanist({ subsets: ['latin'], display: 'swap', preload: false })

function tokensFor(scheme: Scheme): CSSProperties {
  return {
    ...tokenStyle(
      scheme === 'dark' ? deriveTokens('#a855f7', 'dark', SUMMIT_CONTRAST_PAIRS) : LIGHT,
    ),
    '--template-font-display': urbanist.style.fontFamily,
    '--template-font-body': 'var(--font-geist-sans)',
  } as CSSProperties
}

export const metadata: Metadata = {
  title: 'Summit template, example',
  robots: { index: false, follow: false },
}

// The Summit template with example content, for design review against its source. Not linked
// and not indexed. Light, as the source is; ?scheme=dark for a derived dark set.
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function SummitExamplePage({ searchParams }: Props) {
  const { scheme } = await searchParams
  return (
    <div style={tokensFor(scheme === 'dark' ? 'dark' : 'light')}>
      <Summit content={KESTREL_SUMMIT} />
    </div>
  )
}
