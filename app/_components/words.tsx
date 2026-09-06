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
