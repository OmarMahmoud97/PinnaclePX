import { briefPrompt } from '@/lib/ai/prompts'
import type { SubmissionAnswers } from '@/lib/brief/submission'
import { CONFIG } from '@/lib/config'
import { fallbackBrief } from '@/lib/copy-slots/brief'
import type { TemplateContract } from '@/lib/copy-slots/contract'
import { planImagery, stockFreeSlots } from '@/lib/images/plan'
import { contractFor, READY_TEMPLATES, TEMPLATES } from '@/templates/registry'

// The imagery stage sees only a template's slot names (lib/images/stage.ts), so the slots it
// fills apart from the rest are listed in CONFIG.images by template (decision 7a). Both lists are
// held here to the contracts: optionalSlots to each copy's minimum item counts, stockFreeSlots to
// the slots each template has.

const OPTIONAL: Readonly<Record<string, readonly string[]>> = CONFIG.images.optionalSlots
const STOCK_FREE: Readonly<Record<string, readonly string[]>> = CONFIG.images.stockFreeSlots

// Every numbered family of image slots, and the list in the copy whose items it pictures: each
// contract's assemble function gives item i the slot `${family}-${i + 1}`. Null for a family no
// copy list feeds (Lucent's two tall pictures). A template that gains a numbered family must be
// added here, so a family whose count varies cannot be missed.
const FAMILIES: Readonly<Record<string, Readonly<Record<string, string | null>>>> = {
  't02-monolith': { feature: 'features.items' },
  't05-ember': { dish: 'dishes.items' },
  't07-summit': { service: 'services.items', facility: 'facilities.items' },
  't08-vector': { project: 'projects.items' },
  't09-inegro': { service: 'services.items' },
  't10-lucent': { feature: 'features.items', pair: null },
}

const BRIEF = fallbackBrief('Kestrel', 'Job scheduling for trades businesses.')

// The template's fallback copy with the list at a dotted path cut or repeated to n items.
function withItems(copy: unknown, path: string, n: number): unknown {
  const clone: unknown = structuredClone(copy)
  const keys = path.split('.')
  const last = keys.pop() ?? ''
  const parent = keys.reduce<unknown>(
    (node, key) => (node as Record<string, unknown>)[key],
    clone,
  ) as Record<string, unknown[]>
  const items = parent[last] ?? []
  parent[last] = Array.from({ length: n }, (_, index) => items[index % items.length])
  return clone
}

// The item counts the copy may have at a path, from 0 to `upTo`: a count the schema refuses or
// the limits flag at that path is out.
function countsAllowed(contract: TemplateContract, path: string, upTo: number): number[] {
  const copy = contract.fallbackCopy(BRIEF)
  return Array.from({ length: upTo + 1 }, (_, n) => n).filter((n) => {
    try {
      return !contract.copyViolations(withItems(copy, path, n)).some((v) => v.slot === path)
    } catch {
      return false
    }
  })
}

// The numbered slots of a template, by family, in order.
function familiesOf(slots: readonly string[]): Map<string, string[]> {
  const families = new Map<string, string[]>()
  for (const slot of slots) {
    const family = /^(.+)-\d+$/.exec(slot)?.[1]
    if (family !== undefined) families.set(family, [...(families.get(family) ?? []), slot])
  }
  return families
}

describe('the image slots the stage fills apart from the rest', () => {
  it('name only registered templates', () => {
    const ids = TEMPLATES.map((t) => t.id as string)
    for (const id of [...Object.keys(OPTIONAL), ...Object.keys(STOCK_FREE)]) {
      expect(ids).toContain(id)
    }
  })

  it.each(TEMPLATES.map((t) => t.id))(
    "%s: optional slots are exactly the pictures of items past the copy's minimum",
    (id) => {
      const contract = contractFor(id)
      const expected: string[] = []
      for (const [family, slots] of familiesOf(contract.imageSlots)) {
        const path = FAMILIES[id]?.[family]
        expect(path, `${id} has an unlisted family ${family}-n`).not.toBeUndefined()
        if (path === null || path === undefined) continue
        const allowed = countsAllowed(contract, path, slots.length + 1)
        expect(allowed.length, `${id} ${path} takes some count`).toBeGreaterThan(0)
        const min = Math.min(...allowed)
        // Every item the copy may hold has a slot of its own, numbered in order.
        expect(Math.max(...allowed)).toBe(slots.length)
        expect(slots).toEqual(slots.map((_, index) => `${family}-${String(index + 1)}`))
        expected.push(...slots.slice(min))
      }
      expect(OPTIONAL[id] ?? []).toEqual(expected)
    },
  )

  it.each(Object.keys(STOCK_FREE))(
    '%s: stock-free slots are its own, and never optional or its first',
    (id) => {
      const { imageSlots } = contractFor(id)
      for (const slot of STOCK_FREE[id] ?? []) {
        expect(imageSlots).toContain(slot)
        expect(imageSlots[0]).not.toBe(slot)
        expect(OPTIONAL[id] ?? []).not.toContain(slot)
      }
    },
  )
})

describe('the plan for a visitor who adds their own photographs', () => {
  const BLOB = 'https://x.public.blob.vercel-storage.com/photos'
  const urlOf = (index: number) => `${BLOB}/${String(index + 1)}.jpg`
  const answers = (photos: number): SubmissionAnswers => ({
    description: 'Job scheduling for trades businesses.',
    company: 'Kestrel',
    logo: { kind: 'wordmark' },
    imagery: {
      style: 'warm',
      photos: Array.from({ length: photos }, (_, index) => ({
        fileName: `${String(index + 1)}.jpg`,
        url: urlOf(index),
      })),
    },
    colours: { kind: 'palette', paletteId: 'forest' },
  })
  const brief = {
    ...BRIEF,
    imageQueries: {
      hero: ['van on a driveway', 'tidy workshop'],
      detail: ['toolbox', 'kitchen fitting'],
    },
  }
  const searchesOf = (plan: ReturnType<typeof planImagery>) =>
    new Set(
      Object.values(plan).flatMap((step) =>
        step.kind === 'search' ? [`${step.queries.join('|')} ${step.purpose}`] : [],
      ),
    )

  it.each(READY_TEMPLATES.flatMap(({ id }) => [0, 1, 3, 6].map((photos) => [id, photos] as const)))(
    '%s with %i: their photographs first, in order, then the plan a visitor without any gets',
    (id, photos) => {
      const { imageSlots } = contractFor(id)
      const stockFree = stockFreeSlots(id)
      const plan = planImagery(imageSlots, answers(photos), brief, stockFree)
      const without = planImagery(imageSlots, answers(0), brief, stockFree)
      imageSlots.forEach((slot, index) => {
        expect(plan[slot]).toEqual(
          index < photos
            ? { kind: 'own', url: urlOf(index), alt: 'Kestrel, photograph' }
            : without[slot],
        )
      })
      // So it searches and ranks nothing a visitor without photographs would not.
      for (const search of searchesOf(plan)) expect(searchesOf(without)).toContain(search)
      if (photos > 0) {
        expect(Object.values(plan).some((s) => s.kind === 'search' && !s.union)).toBe(false)
      }
    },
  )

  it('rests on a brief that asks for its picture searches whether or not they gave photographs', () => {
    expect(briefPrompt(answers(3))).toBe(briefPrompt(answers(0)))
    expect(briefPrompt(answers(0))).toContain('imageQueries: stock photo searches')
  })
})
