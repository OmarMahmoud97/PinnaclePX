import { DEADLINE_WORDS } from '@/app/preview/_components/deadline-words'
import { DoneBy } from '@/app/preview/_components/done-by'
import { FollowBuild } from '@/app/preview/_components/follow-build'
import type { FoundStatus } from '@/lib/brief/status'
import { designName } from '@/lib/preview/descriptors'

type Props = { slug: string; initial: FoundStatus; index: number }

// A design opened before it is ready, named by its place among the visitor's designs and never by
// its template's code name (OD12). It says when the designs are usually done, or that they are
// taking longer, and FollowBuild has the server draw the page again the moment the poll says the
// design can be shown. No clock counts down: the build's stages decide when it is ready
// (docs/start-page-journey-plan.md, D20).
export function ConceptPending({ slug, initial, index }: Props) {
  return (
    <main
      id="main"
      className="mx-auto flex min-h-[70svh] w-full max-w-lg flex-col items-center justify-center gap-6 px-4 text-center"
    >
      <FollowBuild slug={slug} initial={initial} />
      <h1 className="text-title font-medium text-balance">
        {designName(index)} is still being built.
      </h1>
      <p className="text-on-surface-muted">
        This page will show it the moment it is ready.{' '}
        <DoneBy deadlineAt={initial.deadlineAt} words={DEADLINE_WORDS} />
      </p>
    </main>
  )
}
