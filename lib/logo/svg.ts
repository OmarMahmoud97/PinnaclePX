// How much of an SVG is read for the check: a logo's markup is far smaller than this, and a
// file padded past it is not one we want to render anyway.
const SCAN_BYTES = 1_000_000

// What an SVG must not carry before it is handed to the rasteriser: a script, a reference to
// another document on the network or on disk, an entity declaration, or an include. sharp
// rasterises with librsvg, whose policy on external references is not documented for the
// bundled build, so anything that could reach outside the file is refused first.
const UNSAFE: readonly Readonly<{ pattern: RegExp; reason: string }>[] = [
  { pattern: /<script/i, reason: 'a script' },
  { pattern: /href\s*=\s*["']\s*(?:https?:|file:|\/\/)/i, reason: 'an external reference' },
  { pattern: /href\s*=\s*["']\s*javascript:/i, reason: 'a script' },
  { pattern: /<!ENTITY/i, reason: 'an entity declaration' },
  { pattern: /<!DOCTYPE[^>]*\b(?:SYSTEM|PUBLIC)\b/i, reason: 'an external document type' },
  { pattern: /<xi:include/i, reason: 'an include' },
]

// Whether the bytes are an SVG: text whose first tag is the XML prologue, a doctype, a comment
// or the svg element itself. Everything else is a raster and needs no check.
export function looksLikeSvg(bytes: Buffer): boolean {
  const head = bytes
    .subarray(0, 512)
    .toString('utf8')
    .replace(/^\uFEFF/, '')
    .trimStart()
  return /^<(?:\?xml\b|!DOCTYPE\b|!--|svg\b)/i.test(head)
}

// Why an SVG must not be rasterised, or null when it carries nothing of the kind.
export function unsafeSvgReason(bytes: Buffer): string | null {
  const text = bytes.subarray(0, SCAN_BYTES).toString('utf8')
  return UNSAFE.find(({ pattern }) => pattern.test(text))?.reason ?? null
}
