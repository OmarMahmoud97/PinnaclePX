import { ArrowUpRight } from 'lucide-react'
import type { Metadata, Route } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BOOK_CALL } from '@/app/_components/nav-links'
import { displayHeading } from '@/app/_components/section-styles'
import { Logo } from '@/components/brand/logo'
import { buttonStyles } from '@/components/ui/button'
import { TrackedLink } from '@/components/ui/tracked-link'
import { submissionAnswersSchema } from '@/lib/brief/submission'
import { slugSchema } from '@/lib/identity/slug'
import { readSubmission } from '@/lib/db/submissions'
import { statusOf } from '@/lib/preview/status'
import { SITE } from '@/lib/site'

type Params = Promise<{ slug: string }>

export const metadata: Metadata = { robots: { index: false, follow: false } }

// The shareable address: every design a submission built, and the call. A design that is not
// ready yet says so; an exhausted or failed submission says that instead of pretending.
export default async function PreviewPage({ params }: { params: Params }) {
  const { slug } = await params
  if (!slugSchema.safeParse(slug).success) notFound()
  const row = await readSubmission(slug)
  if (row === null) notFound()
  const answers = submissionAnswersSchema.parse(row.answers)
  const status = statusOf(row)
  const concepts = status.status === 'building' || status.status === 'ready' ? status.concepts : []

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-16 items-center justify-between border-b border-border px-4 sm:px-6">
        <Link href="/" aria-label={`${SITE.name} home`}>
          <Logo />
        </Link>
        <TrackedLink
          href={BOOK_CALL.href}
          event="call_click"
          location="preview-hub"
          className={buttonStyles({ variant: 'primary', size: 'sm' })}
        >
          {BOOK_CALL.label}
        </TrackedLink>
      </header>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-3">
          <h1 className={displayHeading}>
            {status.status === 'exhausted'
              ? 'Every design we have has been shown to this address.'
              : status.status === 'failed'
                ? 'We could not finish these designs.'
                : `${answers.company}, your ${concepts.length === 1 ? 'design' : 'designs'}.`}
          </h1>
          <p className="text-on-surface-muted">
            {status.status === 'exhausted' || status.status === 'failed'
              ? 'The next step is a call: we go through what you have seen together.'
              : `Built from your five answers. ${SITE.callPromise}`}
          </p>
        </div>
        {concepts.length > 0 && (
          <ol aria-label="Your designs" className="flex flex-col gap-2">
            {concepts.map((concept, index) => (
              <li
                key={concept.templateId ?? index}
                className="flex items-center gap-4 rounded-xl border border-border bg-surface px-4 py-3 shadow-badge"
              >
                <span className="font-mono text-xs text-on-surface-muted tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {concept.href === null ? (
                  <span className="flex-1 text-sm text-on-surface-muted">
                    {concept.name ?? 'Design'} is still being built.
                  </span>
                ) : (
                  <Link
                    href={concept.href as Route}
                    className="flex flex-1 items-center justify-between gap-3 text-sm font-medium hover:underline"
                  >
                    {concept.name}
                    <ArrowUpRight aria-hidden="true" className="size-4 text-on-surface-muted" />
                  </Link>
                )}
              </li>
            ))}
          </ol>
        )}
      </main>
    </div>
  )
}
