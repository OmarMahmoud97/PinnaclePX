import { Fragment } from 'react'
import type { LucentContent } from '../copy-slots'
import { Eyebrow, Lines, MaskHeading, Picture } from './ui'

// The blocks after the rail: the wide picture, around which a tint warms the whole page as it
// passes (sections/scroll.ts), the pair of tall pictures, and the statement whose words rise one
// after another.

export function LucentWidgets({ widgets }: Pick<LucentContent, 'widgets'>) {
  return (
    <section className="lc-widgets" data-widgets="">
      <Eyebrow>{widgets.label}</Eyebrow>
      <MaskHeading>
        <Lines lines={widgets.heading} />
      </MaskHeading>
      <p data-reveal="">{widgets.body}</p>
      <figure className="lc-widgets__media" data-reveal="">
        <Picture
          image={widgets.image}
          className="lc-widgets__video"
          sizes="(max-width: 900px) min(460px, 90vw), 860px"
        />
      </figure>
    </section>
  )
}

export function LucentPair({ pair }: Pick<LucentContent, 'pair'>) {
  return (
    <section className="lc-watch">
      <Eyebrow>{pair.label}</Eyebrow>
      <MaskHeading>
        <Lines lines={pair.heading} />
      </MaskHeading>
      <p data-reveal="">{pair.body}</p>
      <div className="lc-watch__pair">
        {pair.images.map((image, index) => (
          <figure key={`pair-${String(index)}`} className="lc-watch__shot" data-reveal="">
            <Picture
              image={image}
              className="lc-watch__img"
              sizes="(max-width: 960px) 45vw, 440px"
            />
          </figure>
        ))}
      </div>
    </section>
  )
}

type Word = Readonly<{ text: string; em: boolean }>

// The statement's words, each marked when it falls inside one of the phrases set in the brand's
// colour. A phrase is found where it first appears, as written; one not found colours nothing.
export function wordsOf(text: string, emphasis: readonly string[]): Word[] {
  const ranges = emphasis.flatMap((phrase) => {
    const trimmed = phrase.trim()
    if (trimmed === '') return []
    const start = text.indexOf(trimmed)
    return start === -1 ? [] : [[start, start + trimmed.length] as const]
  })
  return [...text.matchAll(/\S+/g)].map((match) => {
    const start = match.index
    const end = start + match[0].length
    return { text: match[0], em: ranges.some(([from, to]) => start < to && end > from) }
  })
}

// The source split its statement into words in the browser, each in its own clip, and raised
// them one after another; here the words are split on the server, so the page reads the same
// without scripts, and only their rise is scripted (sections/scroll.ts).
export function LucentManifesto({ manifesto }: Pick<LucentContent, 'manifesto'>) {
  const words = wordsOf(manifesto.text, manifesto.emphasis)
  return (
    <section className="lc-manifesto">
      <p className="lc-manifesto__text" data-words="">
        {words.map((word, index) => (
          <Fragment key={`${String(index)}${word.text}`}>
            <span className="lc-word">
              {word.em ? <em>{word.text}</em> : <span>{word.text}</span>}
            </span>{' '}
          </Fragment>
        ))}
      </p>
    </section>
  )
}
