import clinic from '@/app/_images/vetpres-clinic.webp'
import type { SketchFiles } from '@/components/sketch/sketch-model'

// The example brief's one photograph, standing in for what a VetPres owner would upload: a
// Pomeranian on the examination table with a vet's gloved hands, no face. Pexels photo 6235243
// by Tima Miroshnichenko, licensed for commercial use without attribution
// (https://www.pexels.com/license/), cropped to 4:3 at 640 px wide, twice the largest size the
// sketch ever shows it. A supplied photograph replaces it by changing the import above.
export const EXAMPLE_FILES: SketchFiles = { logo: null, photos: [clinic.src] }
