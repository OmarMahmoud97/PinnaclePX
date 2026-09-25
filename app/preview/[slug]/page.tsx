import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Hub } from '@/app/preview/_components/hub'
import { readViewRow } from '@/lib/db/submissions'
import { readPreview } from '@/lib/preview/read'
import { POSTER_SLOTS, viewOf } from '@/lib/preview/status'
import { SITE } from '@/lib/site'
// The designs page's own rules and its posters', imported by its route so no other page downloads
// them (docs/start-page-journey-plan.md, D26).
import '../../_styles/design-poster.css'
import '../../_styles/preview.css'

type Params = Promise<{ slug: string }>

// The shared link's title and description; the card image is opengraph-image.tsx beside this.
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const found = await readPreview(slug)
  return {
    title: found === null ? 'Your designs' : `${found.answers.company}, your homepage designs`,
    description: `Homepage designs built from five answers by ${SITE.name}.`,
    robots: { index: false, follow: false },
  }
}

// The shareable address: every design a submission built (docs/start-page-journey-plan.md, 8.4).
// The server draws it from the row, as the status poll would describe it, and the page then asks
// the poll itself until the build settles. The email's link carries utm_source=email
// (lib/email/preview-link.ts), which is how a design opened from here is told apart from one
// opened by a visitor who came any other way.
export default async function PreviewPage({ params, searchParams }: PageProps<'/preview/[slug]'>) {
  const { slug } = await params
  const found = await readPreview(slug)
  if (found === null) notFound()
  const row = await readViewRow(found.row.slug, POSTER_SLOTS)
  if (row === null) notFound()
  const { utm_source: source } = await searchParams
  return (
    <Hub
      slug={found.row.slug}
      company={found.answers.company}
      view={viewOf(row)}
      from={source === 'email' ? 'email' : 'hub'}
    />
  )
}
