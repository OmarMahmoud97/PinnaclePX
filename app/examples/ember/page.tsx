import type { Metadata } from 'next'
import { Urbanist } from 'next/font/google'
import type { CSSProperties } from 'react'
import { tokenStyle } from '@/lib/tokens/css'
import { deriveTokens } from '@/lib/tokens/derive'
import type { Scheme, TokenSet } from '@/lib/tokens/types'
import { Ember } from '@/templates/t05-ember'
import { EMBER_CONTRAST_PAIRS } from '@/templates/t05-ember/copy-slots'
import { KESTREL_EMBER } from '@/templates/t05-ember/example/content'

// The source's own colours as a token set: white behind and on its cards, slate-50 for its
// hovers and rings, black for its headings, zinc-600 for its paragraphs, slate-200 for its
// rules, zinc-100 as the quiet accent, and its two oranges (#fe6e00, #f05100, its own values
// for Tailwind's orange-500 and orange-600) as the brand fill and its hover, which also stand
// in for the two glows since the page has no gradient. The source has no dark theme, so
// ?scheme=dark derives one from its orange the way the tokens stage would.
const LIGHT: TokenSet = {
  surface: '#ffffff',
  'surface-muted': '#f8fafc',
  'on-surface': '#000000',
  'on-surface-muted': '#52525c',
  border: '#e2e8f0',
  accent: '#f4f4f5',
  brand: '#fe6e00',
  'brand-deeper': '#fe6e00',
  'brand-deepest': '#f05100',
  'on-brand': '#ffffff',
  glow: '#fe6e00',
  'glow-secondary': '#f05100',
  scrim: '#000000',
  'on-scrim': '#ffffff',
}

// The source sets Geist on the page and Urbanist on its two big headlines and its watermark.
// Geist is the site's own face, already on the root; Urbanist is loaded here, not preloaded,
// as the other examples load theirs.
const urbanist = Urbanist({ subsets: ['latin'], display: 'swap', preload: false })

function tokensFor(scheme: Scheme): CSSProperties {
  return {
    ...tokenStyle(
      scheme === 'dark' ? deriveTokens('#fe6e00', 'dark', EMBER_CONTRAST_PAIRS) : LIGHT,
    ),
    '--template-font-display': urbanist.style.fontFamily,
    '--template-font-body': 'var(--font-site-sans)',
  } as CSSProperties
}

export const metadata: Metadata = {
  title: 'Ember template, example',
  robots: { index: false, follow: false },
}

// The Ember template with example content, for design review against its source. Not linked
// and not indexed. Light, as the source is; ?scheme=dark for a derived dark set.
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function EmberExamplePage({ searchParams }: Props) {
  const { scheme } = await searchParams
  return (
    <div style={tokensFor(scheme === 'dark' ? 'dark' : 'light')}>
      <Ember content={KESTREL_EMBER} />
    </div>
  )
}
