type Link = Readonly<{ label: string; slug: string }>

export type Segment = Readonly<{ text: string }> | Readonly<{ link: Link }>

// A strip sentence cut around the companies it names, so each name can be drawn as the link to
// that person's newest brief and never printed twice. Each label is found once, in order, in the
// text after the last one; a label the text does not carry is appended after it.
export function segments(text: string, links: readonly Link[]): readonly Segment[] {
  const parts: Segment[] = []
  let rest = text
  const trailing: Link[] = []
  for (const link of links) {
    const at = rest.indexOf(link.label)
    if (at < 0) {
      trailing.push(link)
      continue
    }
    if (at > 0) parts.push({ text: rest.slice(0, at) })
    parts.push({ link })
    rest = rest.slice(at + link.label.length)
  }
  if (rest !== '') parts.push({ text: rest })
  for (const link of trailing) parts.push({ text: ' ' }, { link })
  return parts
}
