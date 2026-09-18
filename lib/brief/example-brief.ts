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

export const FINAL_STAGE = 5

// The answers as the demo has revealed them so far: the sentence cut to `chars` characters, the
// company only from stage 2. The sketch model gates the style and the colour by stage itself.
export function answersAt(stage: number, chars: number): Answers {
  return {
    ...EXAMPLE_ANSWERS,
    description: EXAMPLE_ANSWERS.description.slice(0, chars),
    company: stage >= 2 ? EXAMPLE_ANSWERS.company : '',
  }
}

// How many answers the chips should show as given at a stage: none while the sentence is still
// typing, then every answer up to that stage.
export function answeredAt(stage: number): number {
  return stage <= 1 ? 0 : stage
}
