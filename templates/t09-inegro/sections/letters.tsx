const SEGMENTER = new Intl.Segmenter(undefined, { granularity: 'grapheme' })

// A text's letters as a reader sees them, an accented letter or an emoji whole.
export function graphemes(text: string): string[] {
  return Array.from(SEGMENTER.segment(text), (part) => part.segment)
}

type Word = Readonly<{ space: boolean; letters: readonly string[] }>

// The text's words and the spaces between them.
function split(text: string): Word[] {
  return text
    .split(/(\s+)/)
    .filter((part) => part !== '')
    .map((part) =>
      /^\s+$/.test(part)
        ? { space: true, letters: [] }
        : { space: false, letters: graphemes(part) },
    )
}

// A text split into its words and letters, as the source's SplitText split its paragraphs:
// each word a box that does not break, each letter a span, so a script can light them one after
// another in the order they read, marking each as it lights (inegro.css). Spaces stay text
// between the words, so the lines wrap where they would unsplit. Screen readers get the text
// whole from the hidden copy; the letters are hidden from them.
export function Letters({ text }: { text: string }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {split(text).map((word, w) =>
          word.space ? (
            ' '
          ) : (
            <span key={w} className="inegro-lit-word">
              {word.letters.map((letter, l) => (
                <span key={l} className="inegro-lit-char">
                  {letter}
                </span>
              ))}
            </span>
          ),
        )}
      </span>
    </>
  )
}
