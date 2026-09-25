import { SketchPane } from '@/app/start/_components/sketch-pane'
import { StartChrome } from '@/app/start/_components/start-chrome'
import {
  startGrid,
  startMain,
  startMainAsking,
  startMainDone,
} from '@/app/start/_components/start-layout'
import { textLinkStyles } from '@/components/ui/text-link'
import { BLANK_ANSWERS } from '@/lib/brief/answers'
import { QUESTION_IDS } from '@/lib/brief/question-ids'
import { NO_SCRIPT_CALL, noScriptLine, SITE } from '@/lib/site'

// A refresh of the done view, or a done link opened afresh, must not show the first question's
// wash and bars until the flow mounts (docs/start-page-journey-plan.md, 7.8). This runs as the
// browser reads the page, after the region and before its first paint: on a done address with
// its slug it gives main the done state's ink and hides the bars, from the class strings the flow
// itself uses, so no rule is added anywhere, and marks the region restored, as the flow will
// (sketch-pane.tsx), so the blank draft is never painted where the designs go. A done link cut
// short opens a question, so it keeps the wash. The flow then replaces the whole skeleton.
const PRE_PAINT = `(()=>{try{const p=new URLSearchParams(location.search);if(p.get('q')!=='done'||!p.get('s'))return;const m=document.getElementById('main');if(m===null)return;m.dataset.theme='dark';m.className=${JSON.stringify(`${startMain} ${startMainDone}`)};const b=m.querySelector('[data-skeleton-bars]');if(b!==null)b.hidden=true;const r=document.querySelector('.start-region');if(r!==null)r.dataset.restored=''}catch{}})()`

// What the page looks like before the browser has read the URL and any saved answers. Also what
// a visitor without JavaScript sees, so it says where to go instead. The shell, the island and
// the draft, blank as the flow draws it at the first question, are the flow's own, so the skip
// link has its target before hydration and hydration moves nothing; the draft is painted still,
// since the flow draws it again straight after (sketch-pane.tsx). Only the question waits, as
// bars in the wash's deeper stop, a tint of the ground rather than the white that marks a control
// (D11), because the bars do not line up with the heading, the helper and the field that replace
// them. Without JavaScript the question never comes, so the bars are hidden and the sentence
// stands alone. main and the bars take the pre-paint's changes without a hydration warning, since
// the flow swaps them out straight after.
export function StartSkeleton() {
  return (
    <>
      <StartChrome current={1} total={QUESTION_IDS.length} />
      <div className={startGrid}>
        <main id="main" suppressHydrationWarning className={`${startMain} ${startMainAsking}`}>
          <div
            aria-hidden="true"
            data-skeleton-bars=""
            suppressHydrationWarning
            className="flex w-full max-w-lg flex-col gap-6 noscript:hidden"
          >
            <span className="h-10 w-3/4 rounded-2xl bg-surface-wash-deep" />
            <span className="h-4 w-2/3 rounded-full bg-surface-wash-deep" />
            <span className="h-28 w-full rounded-2xl bg-surface-wash-deep" />
          </div>
          {/* An inbox and a call are offered only once the studio has an address to give. */}
          <noscript>
            <p className="mt-6 max-w-lg text-on-surface-muted">
              {noScriptLine()}
              {SITE.contactEmail !== null && (
                <>
                  {' '}
                  <a href={SITE.bookingUrl} className={textLinkStyles}>
                    {NO_SCRIPT_CALL}
                  </a>
                </>
              )}
            </p>
          </noscript>
        </main>
        <SketchPane answers={BLANK_ANSWERS} answered={0} done={false} still />
        <script dangerouslySetInnerHTML={{ __html: PRE_PAINT }} />
      </div>
    </>
  )
}
