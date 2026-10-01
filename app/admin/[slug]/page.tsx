import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { titleHeading } from '@/app/_components/section-styles'
import { AdminChrome } from '@/app/admin/_components/admin-chrome'
import { BriefCard } from '@/app/admin/_components/brief-card'
import { briefView } from '@/app/admin/_components/brief-view'
import { StandingPanel } from '@/app/admin/_components/standing-panel'
import { captionStyles } from '@/components/ui/caption'
import { textLinkStyles } from '@/components/ui/text-link'
import { basicAuthPasses } from '@/lib/admin/basic-auth'
import { adminCredentials } from '@/lib/admin/credentials'
import { formatLondonRelative } from '@/lib/brief/time'
import { CONFIG } from '@/lib/config'
import { readBrief } from '@/lib/db/briefs'
import { listUnmatchedCalls, markOpened } from '@/lib/db/enquiries'
import { env } from '@/lib/env'
import { slugSchema } from '@/lib/identity/slug'

export const metadata: Metadata = {
  title: 'Brief',
  robots: { index: false, follow: false },
}

// One brief, for the owner (ADR 0047): the door checked again, the brief stamped as opened before
// anything is read (so the list it came from is already right when the owner goes back), then
// where it stands, the taps that move it, and the brief itself as the list card showed it. A slug
// that is not one of ours, or that the sweep has taken, is not found.
export default async function BriefPage({ params }: PageProps<'/admin/[slug]'>) {
  const owner = adminCredentials()
  const authorization = (await headers()).get('authorization')
  if (owner === null || !basicAuthPasses(authorization, owner)) notFound()
  const { slug } = await params
  if (!slugSchema.safeParse(slug).success) notFound()
  if (!(await markOpened(slug))) notFound()
  const found = await readBrief(slug)
  if (found === null) notFound()
  const now = new Date()
  const unmatched = await listUnmatchedCalls(new Date(now.getTime() - CONFIG.call.minutes * 60_000))
  const brief = briefView(found.row, env.NEXT_PUBLIC_APP_URL)
  return (
    <AdminChrome>
      <Link href="/admin" className={`${textLinkStyles} self-start`}>
        Briefs
      </Link>
      <div className="flex flex-col gap-2">
        <h1 className={titleHeading}>{brief.company}</h1>
        <p className={captionStyles}>
          Submitted {formatLondonRelative(found.row.createdAt, now)} · {brief.name} · {brief.email}
        </p>
      </div>
      <StandingPanel
        row={found.row}
        now={now}
        unmatched={unmatched}
        briefsOfPerson={found.briefsOfPerson}
      />
      <BriefCard brief={brief} />
    </AdminChrome>
  )
}
