import type { ReactNode } from 'react'
import { Fragment } from 'react'

// Each word in its own box, so a build can raise them one after another (sketch-build.ts); the
// spaces between stay real text, so the line still wraps and balances as it would unsplit.
export function Words({ text }: { text: string }) {
  return text.split(' ').map((word, index) => (
    <Fragment key={`${String(index)}-${word}`}>
      {index > 0 ? ' ' : null}
      <span data-word="" className="inline-block">
        {word}
      </span>
    </Fragment>
  ))
}

// A sentence with one word set apart in an <em>, the way the reference sets its headline: the
// promise is in that word. The sentence stays whole in its copy module for the title and the
// copy tests, and the em takes the serif italic by CSS (app/globals.css, .emphasis em), so the
// text a test reads by name is unchanged. Used by the hero's H1 and the walkthrough's H2.
export function emphasised(text: string, word: string): ReactNode {
  const at = text.indexOf(word)
  if (at < 0) return text
  return (
    <>
      {text.slice(0, at)}
      <em>{word}</em>
      {text.slice(at + word.length)}
    </>
  )
}
