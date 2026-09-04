import type { z } from 'zod'
import type { BrandBrief } from '@/lib/copy-slots/brief'
import type { TemplateMeta } from '@/lib/copy-slots/template-meta'
import type { SlotViolation } from '@/lib/copy-slots/validate'
import type { ContrastPair } from '@/lib/tokens/types'

// What a template promises the pipeline, in the template's own types. The copy is every text
// slot and nothing else: no links, no pictures, no logo. Those are fixed by the template's link
// plan and by the assets the pipeline hands over.
export type TypedContract<TCopy> = Readonly<{
  meta: TemplateMeta
  contrastPairs: readonly ContrastPair[]
  // The image slots the imagery stage fills, in order of importance.
  imageSlots: readonly string[]
  copySchema: z.ZodType<TCopy>
  // Deterministic copy from a brief, guaranteed to pass copyViolations.
  fallbackCopy: (brief: BrandBrief) => TCopy
  // Every slot and count outside its limits. Empty means the copy fits.
  copyViolations: (copy: TCopy) => readonly SlotViolation[]
}>

// The same contract with the copy type erased, so the registry can hold every template in one
// list and the pipeline can treat them alike. The copy is validated with the schema on the way
// in, so a wrong shape fails fast instead of reaching a template.
export type TemplateContract = Readonly<{
  meta: TemplateMeta
  contrastPairs: readonly ContrastPair[]
  imageSlots: readonly string[]
  copySchema: z.ZodTypeAny
  fallbackCopy: (brief: BrandBrief) => unknown
  copyViolations: (copy: unknown) => readonly SlotViolation[]
}>

export function defineContract<TCopy>(contract: TypedContract<TCopy>): TemplateContract {
  return {
    meta: contract.meta,
    contrastPairs: contract.contrastPairs,
    imageSlots: contract.imageSlots,
    copySchema: contract.copySchema,
    fallbackCopy: contract.fallbackCopy,
    copyViolations: (copy) => contract.copyViolations(contract.copySchema.parse(copy)),
  }
}
