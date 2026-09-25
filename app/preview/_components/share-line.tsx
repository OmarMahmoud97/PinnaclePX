'use client'

import type { ReactNode } from 'react'
import { handOn, useCopiedNews } from '@/components/ui/share'
import { trackEvent } from '@/lib/analytics/events'

type Props = Readonly<{
  // The page to share, from the site's root: the visitor's own origin completes it.
  path: string
  location: string
  // What the status line says once the link has gone to the clipboard instead of a share sheet.
  copied: string
  // What the status line says otherwise; a change is announced, what it says at first is not.
  said: string
  className: string
  // The control's label.
  children: ReactNode
}>

// "Share this page" and the page's one status line (docs/start-page-journey-plan.md, 8.4 and 9.2):
// the share sheet, else the clipboard, which the line then says and shows, else a new mail with
// the link in it (components/ui/share.ts, handOn). The newest news wins the line: the copy is said
// until the page has something new to say, such as the designs turning ready after it, which the
// line then says instead.
export function ShareLine({ path, location, copied, said, className, children }: Props) {
  const { copied: showsCopy, onCopied } = useCopiedNews(said)

  async function share() {
    const method = await handOn(new URL(path, window.location.origin).toString())
    if (method === null) return
    if (method === 'copy') onCopied()
    trackEvent('share_click', { location, method })
  }

  return (
    <div className="hub-share">
      <button
        type="button"
        onClick={() => {
          void share()
        }}
        className={className}
      >
        {children}
      </button>
      <p role="status" className={showsCopy ? 'hub-said' : 'sr-only'}>
        {showsCopy ? copied : said}
      </p>
    </div>
  )
}
