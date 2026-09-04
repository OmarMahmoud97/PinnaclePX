// A slot's length limits, in characters after trimming. Templates declare one per text slot so
// the layout is designed for a known range and the copy stage can validate against it.
export type CopySlot = Readonly<{ min: number; max: number }>

export type SlotViolation = Readonly<{ slot: string; length: number; min: number; max: number }>

// The violation for one text against its slot, or null when it fits.
export function slotViolation(slot: string, text: string, limits: CopySlot): SlotViolation | null {
  const length = text.trim().length
  if (length >= limits.min && length <= limits.max) return null
  return { slot, length, min: limits.min, max: limits.max }
}
