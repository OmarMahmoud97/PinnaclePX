import Link from 'next/link'
import { BOOK_CALL } from '@/app/_components/nav-links'
import { Logo } from '@/components/brand/logo'
import { buttonStyles } from '@/components/ui/button'
import { TrackedLink } from '@/components/ui/tracked-link'
import { SITE } from '@/lib/site'

type Props = { slug: string; index: number; count: number; company: string }

// The one strip of PinnaclePX chrome on a preview: whose design this is, which of theirs it is,
// the way back to all of them, and the call. It sits on the site's own tokens; the template
// below sets its own on its root, so the two never mix.
export function StudioBar({ slug, index, count, company }: Props) {
  return (
    <div className="flex h-14 items-center justify-between gap-4 border-b border-border bg-surface px-4 text-on-surface sm:px-6">
      <div className="flex min-w-0 items-center gap-4">
        <Link href="/" aria-label={`${SITE.name} home`} className="shrink-0">
          <Logo />
        </Link>
        <p className="truncate text-sm text-on-surface-muted">
          <span className="font-medium text-on-surface">{company}</span>
          {count > 1 ? `, design ${String(index + 1)} of ${String(count)}` : ', your design'}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {count > 1 && (
          <Link
            href={`/preview/${slug}`}
            className={buttonStyles({ variant: 'ghost', size: 'sm' })}
          >
            All designs
          </Link>
        )}
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
