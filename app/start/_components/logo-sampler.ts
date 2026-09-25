import 'client-only'
import { CONFIG } from '@/lib/config'
import { accentOf } from '@/lib/logo/accent'
import { type Pixels, readPolarity } from '@/lib/logo/polarity'
import type { LogoPolarity } from '@/lib/logo/types'

// The pictures a visitor picks, read in their browser before they are uploaded
// (docs/start-page-journey-plan.md, 5.8 and 7.2). A logo is drawn small and read for whether it
// is light or dark artwork, by the same maths as the server's logo stage (lib/logo/polarity.ts),
// and for its own colour; a large logo or photo is sent downscaled, so an upload over a phone's
// connection takes seconds, not minutes. An SVG is sent as it is. A chunk of its own, fetched the
// first time a picture is picked (use-picture-uploads.ts).

// A picture the browser can draw, its size, and how to let it go.
type Drawable = Readonly<{
  source: CanvasImageSource
  width: number
  height: number
  release: () => void
}>

const SVG = 'image/svg+xml'
const VIEW_BOX = /viewBox\s*=\s*["']\s*[-\d.e]+[\s,]+[-\d.e]+[\s,]+([\d.e]+)[\s,]+([\d.e]+)/i

// An SVG is drawn through an <img> sized from its viewBox, since a file with no width of its own
// is otherwise drawn at whatever size the browser guesses.
async function svgOf(file: File): Promise<Drawable | null> {
  const box = VIEW_BOX.exec(await file.text())
  const url = URL.createObjectURL(file)
  const image = new Image()
  if (box?.[1] !== undefined && box[2] !== undefined) {
    image.width = Number(box[1])
    image.height = Number(box[2])
  }
  image.src = url
  try {
    await image.decode()
  } catch {
    URL.revokeObjectURL(url)
    return null
  }
  return {
    source: image,
    width: image.width,
    height: image.height,
    release: () => {
      URL.revokeObjectURL(url)
    },
  }
}

async function drawableOf(file: File): Promise<Drawable | null> {
  if (file.type === SVG) return svgOf(file)
  try {
    const bitmap = await createImageBitmap(file)
    return {
      source: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      release: () => {
        bitmap.close()
      },
    }
  } catch {
    return null
  }
}

// The picture drawn at `scale` of its size, on a canvas of its own that `read` takes what it needs
// from. The canvas is then emptied rather than left for the collector: a phone's browser caps the
// memory its canvases may hold together, and a full-size photo's is tens of megabytes.
async function onCanvas<T>(
  { source, width, height }: Drawable,
  scale: number,
  read: (canvas: HTMLCanvasElement) => T | Promise<T>,
): Promise<T> {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width * scale))
  canvas.height = Math.max(1, Math.round(height * scale))
  try {
    canvas.getContext('2d')?.drawImage(source, 0, 0, canvas.width, canvas.height)
    return await read(canvas)
  } finally {
    canvas.width = 0
    canvas.height = 0
  }
}

// The pixels the server's logo stage reads: the file drawn to fit CONFIG.logo.samplePx.
function sampleOf(drawable: Drawable): Promise<Pixels | null> {
  const scale = CONFIG.logo.samplePx / Math.max(drawable.width, drawable.height)
  return onCanvas(drawable, scale, (canvas) => {
    const context = canvas.getContext('2d')
    if (context === null) return null
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height)
    return { data, width: canvas.width, height: canvas.height }
  })
}

// The file at `scale` of its size, in its own format, or the file as it is when it is already
// small enough, is an SVG, or the browser cannot write its format back.
async function downscaled(file: File, drawable: Drawable, scale: number): Promise<File> {
  if (file.type === SVG || scale >= 1) return file
  const blob = await onCanvas(
    drawable,
    scale,
    (canvas) =>
      new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, file.type, CONFIG.images.quality / 100)
      }),
  )
  return blob?.type === file.type ? new File([blob], file.name, { type: file.type }) : file
}

export type SampledLogo = Readonly<{
  // What to upload: the logo at most CONFIG.start.uploads.logoMaxPx on its longer side.
  file: File
  polarity: LogoPolarity
  // The logo's own colour, when it has one (lib/logo/accent.ts).
  accent: string | null
}>

// Reads a logo, or null when it cannot be drawn or shows nothing, and the name stands in.
export async function sampleLogo(file: File): Promise<SampledLogo | null> {
  const drawable = await drawableOf(file)
  if (drawable === null) return null
  try {
    const pixels = await sampleOf(drawable)
    if (pixels === null) return null
    const reading = readPolarity(pixels)
    if (reading === null) return null
    const scale = CONFIG.start.uploads.logoMaxPx / Math.max(drawable.width, drawable.height)
    return {
      file: await downscaled(file, drawable, scale),
      polarity: reading.polarity,
      accent: accentOf(pixels),
    }
  } finally {
    drawable.release()
  }
}

// A photo at most CONFIG.images.maxWidth wide, the one size the pipeline stores. One the browser
// cannot draw goes as it is, and the pipeline decides.
export async function fitPhoto(file: File): Promise<File> {
  const drawable = await drawableOf(file)
  if (drawable === null) return file
  try {
    return await downscaled(file, drawable, CONFIG.images.maxWidth / drawable.width)
  } finally {
    drawable.release()
  }
}
