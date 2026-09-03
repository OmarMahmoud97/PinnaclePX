import type { Answers } from '@/lib/brief/schema'

// The brief the home page's sketch paints for itself: VetPres, one of the three example
// businesses, chosen because a software company is the kind of business most visitors recognise.
// It is labelled an example wherever it appears. The description is VetPres's own, the colour is
// its teal typed as a custom hex, its one photo is the clinic picture in app/_components/photos.ts,
// and the name and email are never shown and never sent.
export const EXAMPLE_ANSWERS: Answers = {
  description:
    'VetPres is a platform designed to revolutionize prescription management in the veterinary industry. Our secure and efficient system ensures the appropriate use of pet prescriptions, reducing risks and improving patient care.',
  name: '',
  company: 'VetPres',
  email: '',
  logo: { kind: 'wordmark' },
  imagery: { style: 'minimal', fileNames: ['vetpres-clinic.webp'] },
  colours: { kind: 'custom', hex: '#2e8c9c' },
}

// The stages the demo paints, in order: the sentence types at 1, the company lands at 2, the
// style fills at 4 and the colour sweeps at 5. Stage 3 (the logo) is skipped because a wordmark
// has nothing new to paint.
export const DEMO_STAGES = [1, 2, 4, 5] as const

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
