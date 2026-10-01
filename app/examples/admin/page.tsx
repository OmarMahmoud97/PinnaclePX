import type { Metadata } from 'next'
import { titleHeading } from '@/app/_components/section-styles'
import { AdminChrome } from '@/app/admin/_components/admin-chrome'
import { BriefRow } from '@/app/admin/_components/brief-row'
import { NeedsYou } from '@/app/admin/_components/needs-you'
import { needsYou, newestBriefOfPerson, standingOf } from '@/app/admin/_components/standing'
import { StandingPanel } from '@/app/admin/_components/standing-panel'
import { EXAMPLE_PANEL_SLUG, exampleRows, exampleUnmatched } from '@/app/examples/admin/fixture'
import { captionStyles } from '@/components/ui/caption'
import { AppError } from '@/lib/errors'

export const metadata: Metadata = {
  title: 'Admin, example',
  robots: { index: false, follow: false },
}

// The owner's pages drawn from invented briefs, outside the door and off the database, so the
// e2e suite can hold their layout and accessibility on a runner that has neither (ADR 0047). The
// panel's buttons do nothing here; the slugs can never name a real brief.
export default function ExampleAdminPage() {
  const now = new Date()
  const rows = exampleRows(now)
  const unmatched = exampleUnmatched(now)
  const newest = newestBriefOfPerson(rows)
  const panelRow = rows.find((row) => row.slug === EXAMPLE_PANEL_SLUG)
  if (panelRow === undefined) throw new AppError('The example panel names no fixture row')
  return (
    <AdminChrome>
      <div className="flex flex-col gap-2">
        <h1 className={titleHeading}>Briefs</h1>
        <p className={captionStyles}>Example page: invented briefs, nothing stored.</p>
      </div>
      <NeedsYou items={needsYou(rows, unmatched, now)} />
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
      <h2 className={titleHeading}>{panelRow.company}</h2>
      <StandingPanel row={panelRow} now={now} unmatched={unmatched} briefsOfPerson={1} example />
    </AdminChrome>
  )
}
