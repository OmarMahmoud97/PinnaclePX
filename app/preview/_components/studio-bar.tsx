import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import { headerLink } from '@/app/_components/header-link'
import { BOOK_CALL } from '@/app/_components/nav-links'
import { ChromeTop } from '@/app/preview/_components/chrome-top'
import { BACK_TO_DESIGNS } from '@/app/start/_components/done-copy'
import { Logo } from '@/components/brand/logo'
import { buttonStyles } from '@/components/ui/button'
import { TrackedLink } from '@/components/ui/tracked-link'
import { SITE } from '@/lib/site'

type Props = { slug: string; index: number; count: number; company: string }

// The style of the column that holds the bar and the design under it: the bar's whole height
// (h-14) as --chrome-top, so the first paint, at the top of the page, starts a fixed header below
// the bar before ChromeTop measures it.
export const UNDER_STUDIO_BAR = { '--chrome-top': '3.5rem' } as CSSProperties

// The one strip of PinnaclePX chrome on a design: whose it is, which of theirs, the way back to
// all of them, and the call (docs/start-page-journey-plan.md, 8.4). It sits on the studio's ink, a
// ground of its own above the template's, so it needs no rule to part from it; the template below
// sets its own tokens on its root, so the two never mix. The way back is the done page, which
// lists every design, and below md it is the arrow alone, named for the screen reader, as the
// questionnaire's own way out is. The call is the plain booking link: a design's tab has no name
// in memory to fill it in with. It scrolls away with the page, and ChromeTop tells the design how
// much of it is left, so a header fixed to the top waits below it (decision 22).
export function StudioBar({ slug, index, count, company }: Props) {
  return (
    <div
      data-theme="dark"
      className="flex h-14 items-center justify-between gap-4 bg-surface px-4 text-on-surface sm:px-6"
    >
      <ChromeTop />
      <div className="flex min-w-0 items-center gap-4">
        <Link href="/" aria-label={`${SITE.name} home`} className="shrink-0">
          <Logo nameClassName="hidden md:inline" />
        </Link>
        <p className="truncate text-sm text-on-surface-muted">
          <bdi className="font-medium text-on-surface">{company}</bdi>
          {count > 1 ? `, design ${String(index + 1)} of ${String(count)}` : ', your design'}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Link
          href={`/start?q=done&s=${slug}`}
          className={`${headerLink} shrink-0 gap-2 max-md:size-10 max-md:justify-center max-md:px-0`}
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          <span className="max-md:sr-only">{BACK_TO_DESIGNS}</span>
        </Link>
        <TrackedLink
          href={BOOK_CALL.href}
          event="call_click"
          location="preview"
          className={buttonStyles({ variant: 'primary', size: 'sm' })}
        >
          {BOOK_CALL.label}
        </TrackedLink>
      </div>
    </div>
  )
}
