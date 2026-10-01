import Link from 'next/link'
import type { ReactNode } from 'react'
import { Logo } from '@/components/brand/logo'
import { captionStyles } from '@/components/ui/caption'
import { SITE } from '@/lib/site'

type Props = Readonly<{ children: ReactNode }>

// The owner's pages share one slim header and one column: the mark home, the word Admin, and the
// wash behind. No site navigation, no footer, no analytics beyond the layout's.
export function AdminChrome({ children }: Props) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface-wash">
      <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
        <Link href="/" aria-label={`${SITE.name} home`}>
          <Logo />
        </Link>
        <p className={captionStyles}>Admin</p>
      </header>
      <main
        id="main"
        className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6"
      >
        {children}
      </main>
    </div>
  )
}
