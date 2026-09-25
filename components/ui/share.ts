import { useState } from 'react'

// The two ways a page is handed on before the mail app: the system share sheet and the clipboard.
// Each answers how it went, so handOn, below, can try the next way and say what happened.

// 'cancelled' when the visitor closed the sheet, so nothing else happens; 'unavailable' when the
// browser has no sheet or refused it, so the next way is tried.
async function tryShare(data: ShareData): Promise<'shared' | 'cancelled' | 'unavailable'> {
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

async function tryCopy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // No clipboard in this context, such as a page served over plain http: the mail app is next.
    return false
  }
}

// How a link was handed on, for share_click: the share sheet, the clipboard or a new mail.
export type HandedOn = 'share' | 'copy' | 'mailto'

// Hands a link on by the first way that works: the share sheet, else the clipboard, else a new
// mail with the link in it. It asks for no address and sends nothing itself. Null when the visitor
// closed the sheet, so nothing else happens; 'copy' is for the caller to say.
export async function handOn(url: string): Promise<HandedOn | null> {
  const shared = await tryShare({ url })
  if (shared === 'cancelled') return null
  if (shared === 'shared') return 'share'
  if (await tryCopy(url)) return 'copy'
  window.location.href = `mailto:?body=${encodeURIComponent(url)}`
  return 'mailto'
}

// The clipboard's turn on a page's one status line (plan 9.2): once the link is copied, the line
// says so for as long as `said`, the page's own news, is what it was at the copy. Newer news, such
// as the designs turning ready, takes the line back.
export function useCopiedNews(said: string): Readonly<{ copied: boolean; onCopied: () => void }> {
  const [copiedOver, setCopiedOver] = useState<string | null>(null)
  return {
    copied: copiedOver === said,
    onCopied: () => {
      setCopiedOver(said)
    },
  }
}
