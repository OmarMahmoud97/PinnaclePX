import type { Answers } from '@/lib/brief/schema'

// The brief the home page's sketch paints for itself: VetPres, a client of the studio (owner,
// 5 September 2026), whose site the studio designed after they saw their designs. It is labelled a
// client's brief wherever it appears, and the client is named in a caption only once their written
// consent is recorded in docs/claims-register.md. The description is VetPres's own published
// sentence, quoted verbatim (so its spelling stands), the colour is its teal typed as a custom hex,
// its one photo is the stock picture in app/_components/photos.ts (named here for the chip, never
// uploaded), and the name and email are never shown and never sent.
export const EXAMPLE_ANSWERS: Answers = {
  description:
    'VetPres is a platform designed to revolutionize prescription management in the veterinary industry. Our secure and efficient system ensures the appropriate use of pet prescriptions, reducing risks and improving patient care.',
  name: '',
  company: 'VetPres',
  email: '',
  logo: { kind: 'wordmark' },
  imagery: {
    style: 'minimal',
    photos: [{ id: 'vetpres-clinic', fileName: 'vetpres-clinic.webp', url: null }],
  },
  colours: { kind: 'custom', hex: '#2e8c9c' },
}

// The sketch's stage with every question answered, which the finished sketches are drawn at
// (components/sketch/sketch-model.ts gates the look and the colour by stage).
export const FINAL_STAGE = 5
