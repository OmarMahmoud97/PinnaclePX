import Link from 'next/link'
import { Logo } from '@/components/brand/logo'
import { buttonStyles } from '@/components/ui/button'
import { ProgressSteps } from '@/components/ui/progress-steps'
import { SITE } from '@/lib/site'

type Props = { current: number; total: number }

// Checkout mode: the logo, the progress, and one quiet way out. No site navigation.
export function StartChrome({ current, total }: Props) {
  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-border px-4 sm:px-6">
      <Link href="/" aria-label={`${SITE.name} home`} className="shrink-0">
        <Logo />
      </Link>
      <div aria-live="polite" className="hidden min-w-48 sm:block">
        <ProgressSteps current={current} total={total} />
      </div>
      <Link href="/" className={buttonStyles({ variant: 'ghost', size: 'sm' })}>
        Back to site
      </Link>
    </header>
  )
}
