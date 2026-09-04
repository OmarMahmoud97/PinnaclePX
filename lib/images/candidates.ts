import * as z from 'zod'

// A photograph Pexels offers for a query: enough to judge it, to fetch it, and to credit it.
export type Candidate = Readonly<{
  id: number
  width: number
  height: number
  alt: string
  photographer: string
  photographerUrl: string
  // A small copy for judging, and a large one for re-hosting.
  thumbnail: string
  source: string
}>

const photoSchema = z.object({
  id: z.number(),
  width: z.number(),
  height: z.number(),
  alt: z.string().nullable(),
  photographer: z.string(),
  photographer_url: z.url(),
  src: z.object({ medium: z.url(), large2x: z.url() }),
})

const responseSchema = z.object({ photos: z.array(photoSchema) })

// The candidates a Pexels response holds, validated at the boundary.
export function candidatesFrom(body: unknown): Candidate[] {
  return responseSchema.parse(body).photos.map((photo) => ({
    id: photo.id,
    width: photo.width,
    height: photo.height,
    alt: photo.alt ?? '',
    photographer: photo.photographer,
    photographerUrl: photo.photographer_url,
    thumbnail: photo.src.medium,
    source: photo.src.large2x,
  }))
}
