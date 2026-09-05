'use client'

import { useState, useSyncExternalStore } from 'react'
import { SHARE } from '@/app/_components/share-copy'
import { captionStyles } from '@/components/ui/caption'
import { textLinkStyles } from '@/components/ui/text-link'
import { trackEvent } from '@/lib/analytics/events'

type Props = { url: string; location: 'closing' | 'examples' }

type Method = 'share' | 'copy' | 'mailto'

function subscribeNothing(): () => void {
  return () => undefined
}

function mailtoFor(url: string): string {
  const subject = encodeURIComponent(SHARE.subject)
  const body = encodeURIComponent(`${SHARE.body} ${url}`)
  return `mailto:?subject=${subject}&body=${body}`
}

// The system share sheet where it exists; 'cancelled' when the visitor closed it, so nothing else
// happens; 'unavailable' when the browser has no sheet or refused it, so the next method is tried.
async function tryShare(url: string): Promise<'shared' | 'cancelled' | 'unavailable'> {
  const data = { title: SHARE.subject, url }
  // The DOM types declare both methods on every Navigator; desktop Firefox has neither.
  if (!('share' in navigator)) return 'unavailable'
  if ('canShare' in navigator && !navigator.canShare(data)) return 'unavailable'
  try {
    await navigator.share(data)
    return 'shared'
  } catch (error) {
    return error instanceof DOMException && error.name === 'AbortError'
      ? 'cancelled'
      : 'unavailable'
  }
}

async function tryCopy(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url)
    return true
  } catch {
    // No clipboard permission in this context: the mail app is the fallback.
    return false
  }
}

// A text-styled control that sends the page on. The server renders a mailto: link with the page
// address and no recipient, which is what a browser without JavaScript gets; once hydrated and
// mounted it becomes a button that tries the share sheet, then the clipboard, then the same
// mailto:. It never collects an address. The swap happens after mount, not during render, because
// navigator differs per browser and would otherwise mismatch the server's markup.
export function SendPage({ url, location }: Props) {
  const mounted = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  )
  const [copied, setCopied] = useState(false)
  const mailto = mailtoFor(url)

  if (!mounted) {
    return (
      <a href={mailto} className={textLinkStyles}>
        {SHARE.action}
      </a>
    )
  }

  async function send() {
    const shared = await tryShare(url)
    if (shared === 'cancelled') return
    let method: Method = 'share'
    if (shared === 'unavailable') {
      if (await tryCopy(url)) {
        method = 'copy'
        setCopied(true)
      } else {
        method = 'mailto'
        window.location.href = mailto
      }
    }
    trackEvent('share_click', { location, method })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          void send()
        }}
        className={`${textLinkStyles} cursor-pointer rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-deeper focus-visible:ring-offset-2 focus-visible:ring-offset-surface`}
      >
        {SHARE.action}
      </button>
      <span
        role="status"
        aria-live="polite"
        className={copied ? `${captionStyles} ml-2` : 'sr-only'}
      >
        {copied ? SHARE.copied : ''}
      </span>
    </>
  )
}
