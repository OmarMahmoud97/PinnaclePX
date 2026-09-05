import { CONFIG } from '@/lib/config'
import type { TemplateMeta } from '@/lib/copy-slots/template-meta'
import type { LogoPolarity } from '@/lib/logo/types'
import { mulberry32, seedFrom, shuffle } from '@/lib/select/prng'

// How many concepts a submission builds: the configured number, or fewer while fewer templates
// are ready. When ten are ready this is the configured number and the min is removed.
export function conceptCountFor(readyCount: number): number {
  return Math.min(CONFIG.templates.conceptsShown, readyCount)
}

// Whether the page may take traffic: it promises the configured number of designs in fourteen
// places, so every one of them is true only once that many templates are ready.
export function readyForTraffic(readyCount: number): boolean {
  return readyCount >= CONFIG.templates.conceptsShown
}

type Input = Readonly<{
  candidates: readonly TemplateMeta[]
  // Template ids this identity has already been shown.
  seen: ReadonlySet<string>
  polarity: LogoPolarity
  count: number
  // The payload hash: the same submission always gets the same order.
  seed: string
}>

// Whether a template's header can carry this logo. Mixed artwork sits on either surface.
function accepts(template: TemplateMeta, polarity: LogoPolarity): boolean {
  return template.polarity === 'either' || polarity === 'mixed' || template.polarity === polarity
}

// The templates for a submission, or an empty list when fewer than `count` are left for this
// identity, which is the book-a-call end state. Pure: ready, unseen, polarity-compatible
// templates are sorted by id, shuffled with a generator seeded from the hash, then taken one at
// a time preferring a template whose tones are all new, so three concepts feel different.
export function selectTemplates({ candidates, seen, polarity, count, seed }: Input): string[] {
  const eligible = candidates
    .filter((t) => t.ready && !seen.has(t.id) && accepts(t, polarity))
    .sort((a, b) => a.id.localeCompare(b.id))
  if (count === 0 || eligible.length < count) return []

  const order = shuffle(eligible, mulberry32(seedFrom(seed)))
  const chosen: TemplateMeta[] = []
  const tones = new Set<string>()
  while (chosen.length < count) {
    const remaining = order.filter((t) => !chosen.includes(t))
    const fresh = remaining.find((t) => t.tones.every((tone) => !tones.has(tone)))
    const next = fresh ?? remaining[0]
    if (next === undefined) break
    chosen.push(next)
    for (const tone of next.tones) tones.add(tone)
  }
  return chosen.map((t) => t.id)
}
