import { SketchPane } from '@/app/start/_components/sketch-pane'
import { StartChrome } from '@/app/start/_components/start-chrome'
import { startGrid, startMain, startMainAsking } from '@/app/start/_components/start-layout'
import { sketchModelFrom } from '@/components/sketch/sketch-model'
import { BLANK_ANSWERS } from '@/lib/brief/answers'
import { QUESTION_IDS } from '@/lib/brief/question-ids'

// The blank brief at the first question: the picture the flow draws before anything is typed.
const BLANK_MODEL = sketchModelFrom(BLANK_ANSWERS, 1, { logo: null, photos: [] })

// What the page looks like before the browser has read the URL and any saved answers. Also what
// a visitor without JavaScript sees, so it says where to go instead. The shell, the island and
// the real sketch are the flow's own, so the skip link has its target before hydration and
// hydration moves nothing; only the question waits, as bars in the wash's deeper stop, a tint of
// the ground rather than the white that marks a control (D11), because the bars do not line up
// with the heading, the helper and the field that replace them. Without JavaScript the question
// never comes, so the bars are hidden and the sentence stands alone.
export function StartSkeleton() {
  return (
    <>
      <StartChrome current={1} total={QUESTION_IDS.length} />
      <div className={startGrid}>
        <main id="main" className={`${startMain} ${startMainAsking}`}>
          <div
            aria-hidden="true"
            data-skeleton-bars=""
            className="flex w-full max-w-lg flex-col gap-6 noscript:hidden"
          >
            <span className="h-10 w-3/4 rounded-2xl bg-surface-wash-deep" />
            <span className="h-4 w-2/3 rounded-full bg-surface-wash-deep" />
            <span className="h-28 w-full rounded-2xl bg-surface-wash-deep" />
          </div>
          <noscript>
            <p className="mt-6 max-w-lg text-on-surface-muted">
              The five questions need JavaScript. Turn it on, or email us and we will send them to
              you.
            </p>
          </noscript>
        </main>
        <SketchPane model={BLANK_MODEL} answers={BLANK_ANSWERS} answered={0} done={false} />
      </div>
    </>
  )
}
