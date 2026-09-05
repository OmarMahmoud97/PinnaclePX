import { type CopySlot, type SlotViolation, slotViolation } from '@/lib/copy-slots/validate'

// A template's violation report, built one slot at a time. A template declares its text slots
// and its list counts, then walks its content object naming each text and each list; the
// result is every one outside its range, in the order they were checked. The path of an item
// in a list is written the way the copy stage reports it back: nav.links[2].label.

export type SlotChecks<TSlot extends string, TCount extends string> = Readonly<{
  text: (slot: TSlot, path: string, text: string) => void
  count: (slot: TCount, path: string, length: number) => void
  // Checks a list's count, then hands each item and its path to `each`.
  list: <T>(
    slot: TCount,
    path: string,
    items: readonly T[],
    each: (item: T, path: string) => void,
  ) => void
  violations: () => SlotViolation[]
}>

// The path of one item in a list: nav.links[2], or nav.links[2].label with a field.
export function at(list: string, index: number, field = ''): string {
  return `${list}[${String(index)}]${field}`
}

export function slotChecks<TSlot extends string, TCount extends string>(
  slots: Readonly<Record<TSlot, CopySlot>>,
  counts: Readonly<Record<TCount, CopySlot>>,
): SlotChecks<TSlot, TCount> {
  const found: SlotViolation[] = []
  const text = (slot: TSlot, path: string, value: string) => {
    const violation = slotViolation(path, value, slots[slot])
    if (violation !== null) found.push(violation)
  }
  const count = (slot: TCount, path: string, length: number) => {
    const { min, max } = counts[slot]
    if (length < min || length > max) found.push({ slot: path, length, min, max })
  }
  return {
    text,
    count,
    list: (slot, path, items, each) => {
      count(slot, path, items.length)
      items.forEach((item, index) => {
        each(item, at(path, index))
      })
    },
    violations: () => [...found],
  }
}
