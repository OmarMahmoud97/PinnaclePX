import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { titleHeading } from '@/app/_components/section-styles'
import { BriefCard } from '@/app/admin/_components/brief-card'
import { briefView, countLine } from '@/app/admin/_components/brief-view'
import { Logo } from '@/components/brand/logo'
import { captionStyles } from '@/components/ui/caption'
import { basicAuthPasses } from '@/lib/admin/basic-auth'
import { CONFIG } from '@/lib/config'
import { readBriefOverview } from '@/lib/db/briefs'
import { env } from '@/lib/env'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Briefs',
  robots: { index: false, follow: false },
}

// The owner's list of every brief the sweep still holds (ADR 0045): who sent it, their five
// answers, and the addresses of the designs built from them, newest first. The door is proxy.ts,
// which asks the browser for ADMIN_PASSWORD; the same header is checked here before a row is read,
// so the page shows nothing if the proxy's matcher ever drifts from this route. Reading the header
// also draws the page at request time, so a build never reaches the database.
export default async function AdminPage() {
  const password = env.ADMIN_PASSWORD
  const authorization = (await headers()).get('authorization')
  if (password === undefined || !basicAuthPasses(authorization, password)) notFound()

  const rows = await readBriefOverview(CONFIG.admin.briefs)
  const briefs = rows.map((row) => briefView(row, env.NEXT_PUBLIC_APP_URL))
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
        <div className="flex flex-col gap-2">
          <h1 className={titleHeading}>Briefs</h1>
          <p className="text-on-surface-muted">
            {countLine(briefs.length, CONFIG.admin.briefs, CONFIG.retention.days)}
          </p>
        </div>
        {briefs.length > 0 && (
          <ol className="flex flex-col gap-5">
            {briefs.map((brief) => (
              <li key={brief.slug}>
                <BriefCard brief={brief} />
              </li>
            ))}
          </ol>
        )}
      </main>
    </div>
  )
}
