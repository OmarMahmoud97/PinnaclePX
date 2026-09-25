'use client'

import { useEffect } from 'react'
import { addressNow } from '@/app/start/_components/start-address'

// Whose title this is: a question's, or the done view's.
type TitleOf = 'question' | 'done'

// The tab's title follows the flow, a question's words or the build's progress, so a visitor with
// several tabs sees where each is (docs/start-page-journey-plan.md, 4.6 and 7.6). After a refresh
// the head is still hydrating when this runs, and its hydration puts the route's own title back,
// even as a new element, so the title is held against every change to the head while the address
// still shows what it names. Once the tab has moved on, by a link or by Back, the next page's
// title is its own: it is neither held against nor handed /start's. Null leaves the route's own.
export function useDocumentTitle(title: string | null, of: TitleOf): void {
  useEffect(() => {
    if (title === null) return
    const before = document.title
    const showing = () => {
      const address = addressNow()
      return address !== null && (address.kind === 'done') === (of === 'done')
    }
    const hold = () => {
      if (showing() && document.title !== title) document.title = title
    }
    hold()
    const head = new MutationObserver(hold)
    head.observe(document.head, { childList: true, subtree: true, characterData: true })
    return () => {
      head.disconnect()
      if (addressNow() !== null && document.title === title) document.title = before
    }
  }, [title, of])
}
