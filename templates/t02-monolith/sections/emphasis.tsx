import type { Emphasised, Headline } from '../copy-slots'
import { gradientText } from '../styles'

// A heading with its emphasised phrase set in the brand gradient, as every section heading in
// the source sets a word or two. The phrase is found in the text; absent, the text is set plain.
export function Emphasis({ heading }: { heading: Emphasised }) {
  const { text, emphasis } = heading
  const start = emphasis === '' ? -1 : text.indexOf(emphasis)
  if (start === -1) return <>{text}</>
  const end = start + emphasis.length
  return (
    <>
      {text.slice(0, start)}
      <span className={gradientText}>{emphasis}</span>
      {text.slice(end)}
    </>
  )
}

const LIT = ['monolith-lit-a', 'monolith-lit-b'] as const

// The headline with its two phrases in the source's two gradients (monolith.css). Each phrase is
// found in the text in turn; one that is absent is skipped.
export function LitHeadline({ headline }: { headline: Headline }) {
  const { text } = headline
  const parts: React.ReactNode[] = []
  let cursor = 0
  ;[headline.first, headline.second].forEach((phrase, index) => {
    if (phrase === '') return
    const start = text.indexOf(phrase, cursor)
    if (start === -1) return
    parts.push(text.slice(cursor, start))
    parts.push(
      <span key={phrase} className={`inline bg-clip-text text-transparent ${LIT[index] ?? ''}`}>
        {phrase}
      </span>,
    )
    cursor = start + phrase.length
  })
  parts.push(text.slice(cursor))
  return <>{parts}</>
}
