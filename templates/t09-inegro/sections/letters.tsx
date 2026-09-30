import type { CSSProperties } from 'react'

const SEGMENTER = new Intl.Segmenter(undefined, { granularity: 'grapheme' })

// A text's letters as a reader sees them, an accented letter or an emoji whole.
export function graphemes(text: string): string[] {
  return Array.from(SEGMENTER.segment(text), (part) => part.segment)
}

type Word = Readonly<{ space: boolean; letters: readonly Readonly<{ text: string; i: number }>[] }>

// The text's words and the spaces between them, each letter numbered from `start` across the
// whole text, spaces not counted.
function split(text: string, start: number): Word[] {
  const words: Word[] = []
  let index = start
  for (const part of text.split(/(\s+)/)) {
    if (part === '') continue
    if (/^\s+$/.test(part)) {
      words.push({ space: true, letters: [] })
      continue
    }
    const letters = graphemes(part).map((letter, offset) => ({ text: letter, i: index + offset }))
    index += letters.length
    words.push({ space: false, letters })
  }
  return words
}

// A text split into its words and letters, as the source's SplitText split its paragraphs:
// each word a box that does not break, each letter a span that knows its place, so a script can
// light them one after another by setting --lit on the paragraph (inegro.css). Spaces stay text
// between the words, so the lines wrap where they would unsplit. Screen readers get the text
// whole from the hidden copy; the letters are hidden from them.
export function Letters({ text, start = 0 }: { text: string; start?: number }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {split(text, start).map((word, w) =>
          word.space ? (
            ' '
          ) : (
            <span key={w} className="inegro-lit-word">
              {word.letters.map((letter) => (
                <span
                  key={letter.i}
                  className="inegro-lit-char"
                  style={{ '--i': String(letter.i) } as CSSProperties}
                >
                  {letter.text}
                </span>
              ))}
            </span>
          ),
        )}
      </span>
    </>
  )
}

// How many letters Letters numbers in a text: every character but the spaces.
export function letterCount(text: string): number {
  return graphemes(text.replace(/\s+/g, '')).length
}
