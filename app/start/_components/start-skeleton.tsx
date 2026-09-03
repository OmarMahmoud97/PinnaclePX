import { StartChrome } from '@/app/start/_components/start-chrome'
import { QUESTION_IDS } from '@/lib/brief/question-ids'

// What the page looks like before the browser has read the URL and any saved answers. Also what
// a visitor without JavaScript sees, so it says where to go instead.
export function StartSkeleton() {
  return (
    <div className="flex min-h-dvh flex-col">
      <StartChrome current={1} total={QUESTION_IDS.length} />
      <div className="grid flex-1 lg:grid-cols-[46fr_54fr]">
        <div className="order-first h-44 border-b border-border bg-surface-muted lg:order-last lg:h-auto lg:border-b-0 lg:border-l" />
        <main className="flex flex-col items-center px-4 py-8 sm:px-8 lg:items-start lg:justify-center lg:px-16 lg:py-16">
          <div aria-hidden="true" className="flex w-full max-w-lg flex-col gap-6">
            <span className="h-10 w-3/4 rounded-lg bg-surface-muted" />
            <span className="h-4 w-2/3 rounded-full bg-surface-muted" />
            <span className="h-28 w-full rounded-lg bg-surface-muted" />
          </div>
          <noscript>
            <p className="mt-6 max-w-lg text-on-surface-muted">
              The five questions need JavaScript. Turn it on, or email us and we will send them to
              you.
            </p>
          </noscript>
        </main>
      </div>
    </div>
  )
}
