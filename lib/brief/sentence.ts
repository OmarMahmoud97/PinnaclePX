import { CONFIG } from '@/lib/config'

// Whether a sentence about the business is long enough to brief from and short enough to keep,
// the same limits describeSchema enforces, without loading the schema on the home page.
export function isSentenceComplete(text: string): boolean {
  const length = text.trim().length
  return length >= CONFIG.form.minChars && length <= CONFIG.form.maxChars
}
