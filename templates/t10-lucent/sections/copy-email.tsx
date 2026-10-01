'use client'

import { useEffect, useRef, useState } from 'react'

type Props = { label: string; email: string }

// How long the copied line stays before the label returns, as the source held it.
const HOLD_MS = 2200

// The source's "Contact us": a mail link that, where the browser can write to the clipboard,
// copies the address instead and says so for a moment; where it cannot, the link opens the mail
// message as any mail link does.
export function CopyEmail({ label, email }: Props) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(
    () => () => {
      window.clearTimeout(timer.current)
    },
    [],
  )

  return (
    <a
      href={`mailto:${email}`}
      onClick={(event) => {
        if (!('clipboard' in navigator)) return
        event.preventDefault()
        navigator.clipboard
          .writeText(email)
          .then(() => {
            setCopied(true)
            window.clearTimeout(timer.current)
            timer.current = window.setTimeout(() => {
              setCopied(false)
            }, HOLD_MS)
          })
          .catch(() => {
            window.location.href = `mailto:${email}`
          })
      }}
    >
      {copied ? `✓ ${email} copied` : label}
    </a>
  )
}
