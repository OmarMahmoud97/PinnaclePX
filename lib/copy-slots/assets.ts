// The pictures a template receives alongside its copy. The pipeline produces them (the logo
// stage and the imagery stage), templates consume them, and both sides agree on this shape.

type ImageCredit = Readonly<{ photographer: string; url: string }>

// A re-hosted photograph with its size, so the layout never shifts, and its Pexels credit, which
// the footer prints. The credit is null for the visitor's own photographs.
export type SlotImage = Readonly<{
  src: string
  alt: string
  width: number
  height: number
  credit: ImageCredit | null
}>

// The wordmark is the brand's name set in the display face; an image logo is the visitor's own,
// normalised to a raster by the logo stage.
export type TemplateLogo =
  | Readonly<{ kind: 'wordmark' }>
  | Readonly<{ kind: 'image'; src: string; alt: string; width: number; height: number }>

// Everything a template needs besides copy: the logo and one image per named slot. A slot the
// imagery stage could not fill is null, and the template draws without it.
export type TemplateAssets = Readonly<{
  logo: TemplateLogo
  images: Readonly<Record<string, SlotImage | null>>
}>
