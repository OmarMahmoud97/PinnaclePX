import { PALETTES } from '@/lib/brief/palettes'
import { STYLES } from '@/lib/brief/styles'
import { formatLondon } from '@/lib/brief/time'
import type { BriefOverviewRow } from '@/lib/db/briefs'
import { TEMPLATES } from '@/templates/registry'

type Link = Readonly<{ label: string; url: string }>

// The designs a brief built: each named by its template, in the build's order, and the page that
// holds them all. `note` says why the list is empty when it is.
type Designs = Readonly<{ links: readonly Link[]; hub: string | null; note: string | null }>

// One brief as the page shows it (ADR 0045): every answer in words, every address absolute, so the
// component only lays them out.
export type BriefView = Readonly<{
  slug: string
  submitted: string
  name: string
  email: string
  company: string
  description: string
  // The uploaded file, linked, or the words for a wordmark.
  logo: Readonly<{ label: string; url: string | null }>
  look: string
  photos: readonly Link[]
  // The palette's name and its colour, or a colour of their own by its hex.
  colour: Readonly<{ label: string; hex: string | null }>
  designs: Designs
  outcome: string
}>

export const WORDMARK = 'None uploaded; the name is set as a wordmark'
export const OWN_COLOUR = 'Their own colour'
export const NO_DESIGNS = {
  pending: 'Not chosen yet',
  exhausted: 'None: this address had already seen every design',
} as const

function logoOf(row: BriefOverviewRow): BriefView['logo'] {
  return row.logoFile === null
    ? { label: WORDMARK, url: null }
    : { label: row.logoFile, url: row.logoUrl }
}

function colourOf(colour: string): BriefView['colour'] {
  if (colour.startsWith('#')) return { label: OWN_COLOUR, hex: colour }
  const palette = PALETTES.find((candidate) => candidate.id === colour)
  return palette === undefined
    ? { label: colour, hex: null }
    : { label: palette.label, hex: palette.hex }
}

function designsOf(row: BriefOverviewRow, appUrl: string): Designs {
  const ids = row.templateIds ?? []
  const links = (row.designPaths ?? []).map((path, index) => {
    const id = ids[index]
    const name = TEMPLATES.find((template) => template.id === id)?.name
    return { label: name ?? id ?? path, url: `${appUrl}${path}` }
  })
  if (links.length > 0) return { links, hub: `${appUrl}/preview/${row.slug}`, note: null }
  return {
    links,
    hub: null,
    note: row.templateIds === null ? NO_DESIGNS.pending : NO_DESIGNS.exhausted,
  }
}

// How the brief stands, from the two stamps alone, so it is never wrong: the link went, the build
// finished with nothing to send (every template seen, a stage failed, or the email is moments
// away), or neither has happened.
export function outcomeOf(row: Pick<BriefOverviewRow, 'emailSentAt' | 'settledAt'>): string {
  if (row.emailSentAt !== null) return `Link sent ${formatLondon(row.emailSentAt)}`
  return row.settledAt === null ? 'No link sent yet' : 'Finished, no link sent'
}

export function briefView(row: BriefOverviewRow, appUrl: string): BriefView {
  return {
    slug: row.slug,
    submitted: formatLondon(row.createdAt),
    name: row.name,
    email: row.email,
    company: row.company,
    description: row.description,
    logo: logoOf(row),
    look: STYLES.find((style) => style.id === row.look)?.label ?? row.look,
    photos: row.photoUrls.map((url, index) => ({ label: `Photo ${String(index + 1)}`, url })),
    colour: colourOf(row.colour),
    designs: designsOf(row, appUrl),
    outcome: outcomeOf(row),
  }
}

// The line under the heading: how many briefs the page holds, and why no older one is on it.
export function countLine(count: number, limit: number, days: number): string {
  const stay = `A brief stays here for ${String(days)} days after it is sent, then the nightly sweep removes it, unless its person booked a call or hired the studio: those stay while that stands, and for six months after.`
  if (count === 0) return `No briefs yet. ${stay}`
  const shown =
    count >= limit
      ? `The newest ${String(count)} briefs`
      : `${String(count)} ${count === 1 ? 'brief' : 'briefs'}`
  return `${shown}, newest first. ${stay}`
}
