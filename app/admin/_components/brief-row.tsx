import { card } from '@/app/_components/section-styles'
import type { Standing } from '@/app/admin/_components/standing'
import { captionStyles } from '@/components/ui/caption'
import { formatLondonRelative } from '@/lib/brief/time'
import type { BriefOverviewRow } from '@/lib/db/briefs'

const MARKS = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
} as const

type Props = Readonly<{
  row: BriefOverviewRow
  standing: Standing
  // Whether this is the newest brief of its person, the one that shows their shared note.
  newest: boolean
  now: Date
}>

// One brief on the list (ADR 0047): a plain anchor to its page, never next/link, so a prefetch
// can never stamp a brief as opened. A dot and a heavier company name while it is new; the person;
// the standing with its mark; the note, clamped, on the person's newest brief alone. One column on
// a phone; company, person, standing and time in a row from md.
export function BriefRow({ row, standing, newest, now }: Props) {
  const isNew = row.ownerOpenedAt === null
  const mark = standing.mark === null ? null : MARKS[standing.mark]
  return (
    <a
      href={`/admin/${row.slug}`}
      className={`${card} flex min-h-14 flex-col gap-1 px-4 py-3 text-on-surface no-underline hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink md:grid md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.5fr)_max-content_max-content] md:items-center md:gap-x-4`}
    >
      <span className="flex items-center gap-2">
        {isNew && (
          <>
            <span aria-hidden className="size-2 shrink-0 rounded-full bg-brand-ink" />
            <span className="sr-only">New.</span>
          </>
        )}
        <span className={`truncate ${isNew ? 'font-semibold' : 'font-normal'}`}>{row.company}</span>
        <span className={`${captionStyles} ml-auto md:hidden`}>
          {formatLondonRelative(row.createdAt, now)}
        </span>
      </span>
      <span className={`${captionStyles} truncate`}>
        {row.name} · {row.email}
      </span>
      <span className="flex items-center gap-2 text-sm">
        {mark !== null && <span aria-hidden className={`size-2 shrink-0 rounded-full ${mark}`} />}
        {standing.word}
        {standing.earlier !== null && <span className={captionStyles}>{standing.earlier}</span>}
      </span>
      <span className={`${captionStyles} hidden md:block`}>
        {formatLondonRelative(row.createdAt, now)}
      </span>
      {newest && row.note !== '' && (
        <span className={`${captionStyles} line-clamp-1 md:col-span-4`}>{row.note}</span>
      )}
    </a>
  )
}
