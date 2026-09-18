import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import { tokenStyle } from '@/lib/tokens/css'
import type { Scheme, TokenSet } from '@/lib/tokens/types'
import { Vector } from '@/templates/t08-vector'
import { KESTREL_VECTOR } from '@/templates/t08-vector/example/content'

// The source's own two themes as token sets, each its six variables: its background, its
// foreground, its muted (the cards' fill) and muted-foreground, its border, and its buttons
// and footer, which are the foreground itself. The ring (#06f light, #3b82f6 dark) is unused
// on the page. Its floating pills are neutral-900 at 70 percent with white on them in both
// themes: the scrim and on-scrim. The three colours of its wave shader (#FF66B2, #994DE6,
// #4D80FF) are the glow, the second glow and the brand. Dark is its default.
const DARK: TokenSet = {
  surface: '#0a0a0a',
  'surface-muted': '#171717',
  'on-surface': '#fafafa',
  'on-surface-muted': '#a3a3a3',
  border: '#262626',
  accent: '#171717',
  brand: '#4d80ff',
  'brand-deeper': '#fafafa',
  'brand-deepest': '#e5e5e5',
  'on-brand': '#0a0a0a',
  glow: '#ff66b2',
  'glow-secondary': '#994de6',
  scrim: '#171717',
  'on-scrim': '#ffffff',
}

const LIGHT: TokenSet = {
  surface: '#ffffff',
  'surface-muted': '#f5f5f5',
  'on-surface': '#0a0a0a',
  'on-surface-muted': '#737373',
  border: '#e5e5e5',
  accent: '#f5f5f5',
  brand: '#4d80ff',
  'brand-deeper': '#0a0a0a',
  'brand-deepest': '#262626',
  'on-brand': '#ffffff',
  glow: '#ff66b2',
  'glow-secondary': '#994de6',
  scrim: '#171717',
  'on-scrim': '#ffffff',
}

// The source loads Geist and means to set it on the page, but its theme block defines its
// sans as itself (`--font-sans: var(--font-sans)`), which is invalid, so the page renders in
// the browser's own sans (ui-sans-serif, system-ui) and the Geist files load unused. The
// example matches what the demo shows, so the two sit side by side; a brand's own body face
// takes the same variable. The italic accents are the browser's serif (ui-serif, Georgia,
// Cambria, Times), as the source set them.
function tokensFor(scheme: Scheme): CSSProperties {
  return {
    ...tokenStyle(scheme === 'light' ? LIGHT : DARK),
    '--template-font-display': 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    '--template-font-body': 'ui-sans-serif, system-ui, sans-serif',
  } as CSSProperties
}

export const metadata: Metadata = {
  title: 'Vector template, example',
  robots: { index: false, follow: false },
}

// The Vector template with example content, for design review against its source. Not linked
// and not indexed. Dark, as the source is by default; ?scheme=light for its light theme.
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function VectorExamplePage({ searchParams }: Props) {
  const { scheme } = await searchParams
  return (
    <div style={tokensFor(scheme === 'light' ? 'light' : 'dark')}>
      <Vector content={KESTREL_VECTOR} />
    </div>
  )
}
