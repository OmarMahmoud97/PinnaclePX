import clinic from '@/app/_images/vetpres-clinic.webp'
import type { SketchFiles } from '@/components/sketch/sketch-model'

// The client's brief's one photograph, a stock picture standing in for the client's own: a
// Pomeranian on the examination table with a vet's gloved hands, no face. Pexels photo 6235243
// by Tima Miroshnichenko, licensed for commercial use without attribution
// (https://www.pexels.com/license/), cropped to 4:3 at 640 px wide, twice the largest size the
// sketch ever shows it. VetPres's own image replaces it by changing the import above, if they
// supply one with their consent; stock licensed to them is never lifted from their site.
export const EXAMPLE_FILES: SketchFiles = { logo: null, photos: [clinic.src] }
