import aftercare from '@/app/_images/fernbrook-aftercare.webp'
import design from '@/app/_images/fernbrook-design.webp'
import garden from '@/app/_images/fernbrook-garden.webp'
import planting from '@/app/_images/fernbrook-planting.webp'
import type { SketchFiles } from '@/components/sketch/sketch-model'

// The example brand's four photographs, all stock, none showing a person, each from Pexels under
// its licence (https://www.pexels.com/license/, commercial use, no attribution required) and
// cropped by us on 6 September 2026: the hero image to 4:3 at 640 px wide, twice the largest
// size the frame draws it, and the three card squares to 120 px.
//
// - fernbrook-garden: a brick pergola in an English garden. Pexels 37062707, Neville Hawkins.
// - fernbrook-design: a plan on paper with a pencil and a tape. Pexels 4792480, Anete Lusina.
// - fernbrook-planting: seedlings in pots in a wooden box. Pexels 36689261, Vera Rishkevich.
// - fernbrook-aftercare: clay pots and tools. Pexels 9057700, Ylanite Koppens.
//
// Any of them is replaced by dropping a file of the same name over it.
export const WALKTHROUGH_FILES: SketchFiles = {
  logo: null,
  photos: [garden.src, design.src, planting.src, aftercare.src],
}
