export type TemplateMeta = Readonly<{
  id: string
  name: string
  description: string
}>

// Exactly ten templates. The registry satisfies this tuple, so the count is checked at compile time.
export type TemplateTuple = readonly [
  TemplateMeta,
  TemplateMeta,
  TemplateMeta,
  TemplateMeta,
  TemplateMeta,
  TemplateMeta,
  TemplateMeta,
  TemplateMeta,
  TemplateMeta,
  TemplateMeta,
]
