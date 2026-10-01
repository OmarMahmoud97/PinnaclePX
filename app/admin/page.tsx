import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { titleHeading } from '@/app/_components/section-styles'
import { AdminChrome } from '@/app/admin/_components/admin-chrome'
import { BriefRow } from '@/app/admin/_components/brief-row'
import { countLine } from '@/app/admin/_components/brief-view'
import { NeedsYou } from '@/app/admin/_components/needs-you'
import {
  lastOpened,
  needsYou,
  newestBriefOfPerson,
  standingOf,
} from '@/app/admin/_components/standing'
import { captionStyles } from '@/components/ui/caption'
import { textLinkStyles } from '@/components/ui/text-link'
import { basicAuthPasses } from '@/lib/admin/basic-auth'
import { adminCredentials } from '@/lib/admin/credentials'
import { CONFIG } from '@/lib/config'
import { readBriefOverview } from '@/lib/db/briefs'
import { listUnmatchedCalls } from '@/lib/db/enquiries'

export const metadata: Metadata = {
  title: 'Briefs',
  robots: { index: false, follow: false },
}

// The owner's inbox (ADR 0045, 0047): what needs them first, then every brief the sweep still
// holds, newest first, each a row that opens the brief. A dot marks a brief not yet opened; the
// caption says which one was opened last. The door is proxy.ts, which asks the browser for
// ADMIN_USERNAME and ADMIN_PASSWORD; the same header is checked here before a row is read, so the
// page shows nothing if the proxy's matcher ever drifts from this route. Reading the header also
// draws the page at request time, so a build never reaches the database.
export default async function AdminPage() {
  const owner = adminCredentials()
  const authorization = (await headers()).get('authorization')
  if (owner === null || !basicAuthPasses(authorization, owner)) notFound()

  const rows = await readBriefOverview(CONFIG.admin.briefs)
  const now = new Date()
  const unmatched = await listUnmatchedCalls(new Date(now.getTime() - CONFIG.call.minutes * 60_000))
  const last = lastOpened(rows, now)
  const newest = newestBriefOfPerson(rows)
  return (
    <AdminChrome>
      <div className="flex flex-col gap-2">
        <h1 className={titleHeading}>Briefs</h1>
        <p className={captionStyles}>
          {String(rows.length)} {rows.length === 1 ? 'brief' : 'briefs'}
          {last !== null && (
            <>
              {' · last opened '}
              <a href={`/admin/${last.slug}`} className={textLinkStyles}>
                {last.company}
              </a>
              {`, ${last.when}`}
            </>
          )}
        </p>
      </div>
      <NeedsYou items={needsYou(rows, unmatched, now)} />
      {rows.length > 0 && (
        <ol className="flex flex-col gap-3">
          {rows.map((row) => (
            <li key={row.slug}>
              <BriefRow
                row={row}
                standing={standingOf(row, now)}
                newest={newest.has(row.slug)}
                now={now}
              />
            </li>
          ))}
        </ol>
      )}
      <p className={captionStyles}>
        {countLine(rows.length, CONFIG.admin.briefs, CONFIG.retention.days)}
      </p>
    </AdminChrome>
  )
}
