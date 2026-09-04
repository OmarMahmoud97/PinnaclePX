import type { SlotViolation } from '@/lib/copy-slots/validate'

// One thing wrong with a piece of copy, in words the model can act on.
export type CopyViolation = Readonly<{ path: string; reason: string }>

// What copy must never contain unless the owner said it: numbers, superlatives and claims. A
// match is allowed when the same words appear in the owner's own sentence, because then it is
// theirs, not invented.
const RULES: readonly Readonly<{ rule: string; pattern: RegExp }>[] = [
  { rule: 'a number', pattern: /\d+/g },
  {
    rule: 'a superlative',
    pattern:
      /\b(best|leading|number one|no\.? ?1|world[- ]class|top[- ]rated|award[- ]winning|unrivalled|unbeatable|finest|premier)\b/gi,
  },
  {
    rule: 'a claim the owner did not make',
    pattern:
      /\b(awards?(?![- ]winning)|trusted by|clients include|guarantee[ds]?|certified|accredited|years of experience|customers? (love|trust)|five[- ]star|testimonials?)\b/gi,
  },
]

// Every string inside a JSON value, with its path.
function strings(value: unknown, path: string, out: [string, string][]): void {
  if (typeof value === 'string') out.push([path, value])
  else if (Array.isArray(value)) {
    value.forEach((item, index) => {
      strings(item, `${path}[${String(index)}]`, out)
    })
  } else if (value !== null && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      strings(item, path === '' ? key : `${path}.${key}`, out)
    }
  }
}

// Every rule broken anywhere in the copy, given the owner's own words.
export function ruleViolationsIn(copy: unknown, ownersWords: string): CopyViolation[] {
  const allowed = ownersWords.toLowerCase()
  const found: [string, string][] = []
  strings(copy, '', found)
  const violations: CopyViolation[] = []
  for (const [path, text] of found) {
    for (const { rule, pattern } of RULES) {
      for (const match of text.matchAll(pattern)) {
        if (allowed.includes(match[0].toLowerCase())) continue
        violations.push({ path, reason: `contains ${rule}: "${match[0]}"` })
      }
    }
  }
  return violations
}

// A slot violation in the same words.
export function fromSlotViolation(violation: SlotViolation): CopyViolation {
  return {
    path: violation.slot,
    reason: `${String(violation.length)} characters; must be ${String(violation.min)} to ${String(violation.max)}`,
  }
}
