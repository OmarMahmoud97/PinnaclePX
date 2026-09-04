import type { Answers } from '@/lib/brief/schema'

// A brief before anyone has typed: the defaults every draft starts from.
export const BLANK_ANSWERS: Answers = {
  description: '',
  name: '',
  company: '',
  email: '',
  logo: { kind: 'wordmark' },
  imagery: { style: 'minimal', photos: [] },
  colours: { kind: 'palette', paletteId: 'forest' },
}
