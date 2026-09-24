import { X } from 'lucide-react'
import Link from 'next/link'
import { HeaderChrome } from '@/app/_components/header-chrome'
import { headerLink } from '@/app/_components/header-link'
import { Logo } from '@/components/brand/logo'
import { ProgressSteps } from '@/components/ui/progress-steps'
import { SITE } from '@/lib/site'

type Props = { current: number; total: number; done?: boolean }

// The way out, one link at every width, so its name never changes: below md an X in a 40px ring,
// the phone menu button's own ring, and from md the words in the header's link style. A plain
// string rather than cn(): nothing here conflicts for it to resolve (the ring's classes all sit
// behind max-md, the link's sizes and padding behind no variant or lg), and tailwind-merge has
// dropped a class it misread before (the caption's size, progress-steps.tsx). It never shrinks:
// the island's width is measured once, and a pill a pixel short should squeeze the progress,
// which clips nothing, rather than wrap the words or squash the ring.
const EXIT = `${headerLink} shrink-0 max-md:size-10 max-md:justify-center max-md:rounded-full max-md:border max-md:border-current/30 max-md:px-0`

// Checkout mode: the site's own island (app/_components/header-chrome.tsx), holding the mark,
// the progress and one quiet way out, with no navigation, no ask and no menu. It is the island
// from the server's first paint, solid and never blended, because the page has no white top for
// the difference blend to read; and dark, because the sketch's ink is under it at the top of every
// width. Over a phone's wash, once the ink has scrolled away, it fades to the light set, and at
// the done state the whole page is the ink and so is the island. The island then says "Brief
// received" over five lit segments, since no question is left, and the polite region says it once
// as the done pane arrives; the pane carries no eyebrow of its own, so it is said only here. From lg it sits centred, across the seam
// between the question and the sketch, the one object on both grounds. The progress is live at
// every width; below sm the island drops the segments and keeps the words.
export function StartChrome({ current, total, done = false }: Props) {
  return (
    <HeaderChrome island overDark>
      <div className="header-row mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" aria-label={`${SITE.name} home`} className="shrink-0">
          <Logo nameClassName="hidden md:inline" />
        </Link>
        <div aria-live="polite" className="min-w-0">
          <ProgressSteps
            current={current}
            total={total}
            segmentsClassName="hidden sm:flex"
            label={done ? 'Brief received' : undefined}
          />
        </div>
        <Link href="/" className={EXIT}>
          <X aria-hidden="true" className="size-5 md:hidden" />
          <span className="max-md:sr-only">Back to site</span>
        </Link>
      </div>
    </HeaderChrome>
  )
}
