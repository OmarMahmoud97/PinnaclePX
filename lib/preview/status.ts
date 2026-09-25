import { PALETTES } from '@/lib/brief/palettes'
import type { FoundStatus, FoundView } from '@/lib/brief/status'
import type { SlotImage } from '@/lib/copy-slots/assets'
import type { StageState } from '@/lib/db/schema'
import { contractFor, READY_TEMPLATES, TEMPLATES } from '@/templates/registry'

// The stage columns of a submission row, which is all the status needs besides the ids.
export type StageRow = Readonly<{
  slug: string
  deadlineAt: Date
  conceptCount: number
  templateIds: string[] | null
  stageSelect: StageState
  stageTokens: StageState
  stageBrief: StageState
  stageCopy: StageState
  stageImagery: StageState
}>

// The row as the status poll reads it (lib/db/submissions.ts, readViewRow): the stage columns,
// when each settled, and only the parts of the jsonb columns a view draws from.
export type ViewRow = StageRow &
  Readonly<{
    createdAt: Date
    stageSelectAt: Date | null
    stageTokensAt: Date | null
    stageBriefAt: Date | null
    stageCopyAt: Date | null
    stageImageryAt: Date | null
    settledAt: Date | null
    // The palette the visitor chose; null for a colour of their own.
    paletteId: string | null
    // The tokens' brand-deeper, the fill of every design's buttons; null until tokens has run.
    fill: string | null
    // Per template, its copy. The copy stage writes it whole as it settles, so until then it is
    // empty.
    copy: Readonly<Record<string, unknown>>
    // Per template, the picture its poster shows (POSTER_SLOTS), or null. The imagery stage keeps
    // what it has filled on the row while it tries again for the rest, so this can hold pictures
    // before the stage has settled.
    posterPhotos: Readonly<Record<string, SlotImage | null>>
  }>

export type PosterSlots = readonly (readonly [templateId: string, slot: string])[]

// The picture a design's poster shows: its template's first image slot, the one the imagery stage
// fills first. One pair per ready template that has an image slot at all.
export const POSTER_SLOTS: PosterSlots = READY_TEMPLATES.flatMap(({ id }) => {
  const slot = contractFor(id).imageSlots[0]
  return slot === undefined ? [] : [[id, slot] as const]
})

const settled = (state: StageState) => state === 'done' || state === 'fallback'

// The stages the visitor's page is made of. The brief feeds only the copy.
const PATH = ['stageSelect', 'stageTokens', 'stageCopy', 'stageImagery'] as const

function previewHref(slug: string, templateId: string): string {
  return `/preview/${slug}/${templateId}`
}

// The status a row is in. A concept can be opened once select, tokens, copy and imagery have
// settled; it is ready when they all finished, and partial when any of them settled with its
// fallback, the pipeline's own after its attempts or the sweeper's at the deadline.
export function statusOf(row: StageRow): FoundStatus {
  const base = {
    slug: row.slug,
    deadlineAt: row.deadlineAt.toISOString(),
    conceptCount: row.conceptCount,
  }
  if (row.stageSelect === 'failed' || row.stageTokens === 'failed') {
    return { ...base, status: 'failed', concepts: [] }
  }
  if (row.templateIds !== null && row.templateIds.length === 0) {
    return { ...base, status: 'exhausted', concepts: [] }
  }
  const states = PATH.map((column) => row[column])
  const openable = states.every(settled)
  const finished = states.every((state) => state === 'done')
  const ids = row.templateIds ?? []
  const concepts = Array.from({ length: row.conceptCount }, (_, index) => {
    const templateId = ids[index] ?? null
    return {
      templateId,
      name: TEMPLATES.find((t) => t.id === templateId)?.name ?? null,
      ready: openable && templateId !== null,
      href: openable && templateId !== null ? previewHref(row.slug, templateId) : null,
    }
  })
  return { ...base, status: !openable ? 'building' : finished ? 'ready' : 'partial', concepts }
}

// Whole seconds from the brief's arrival to a moment, rounded down as a stopwatch reads.
function secondsSince(start: Date, moment: Date | null): number | null {
  if (moment === null) return null
  return Math.max(0, Math.floor((moment.getTime() - start.getTime()) / 1000))
}

// A design's headline, read from its copy by its own template, as the shared card reads it. Null
// for copy its template no longer parses (its slots changed after the row was written): one
// headline must never fail the poll, and the design's own page says what is wrong.
function headlineIn(copy: ViewRow['copy'], templateId: string): string | null {
  const own = copy[templateId]
  if (own === undefined) return null
  try {
    return contractFor(templateId).headlineOf(own)
  } catch {
    return null
  }
}

function photoIn(photos: ViewRow['posterPhotos'], templateId: string) {
  const image = photos[templateId] ?? null
  return image === null ? null : { src: image.src, credit: image.credit }
}

// The poll's answer for a row (plan 8.2): its status, when each stage settled, the colour, and
// each design's headline and photo, the last two only once the stage that makes them has settled,
// because the imagery stage keeps pictures on the row before it has finished choosing.
export function viewOf(row: ViewRow): FoundView {
  const status = statusOf(row)
  const stage = (state: StageState, at: Date | null) => ({
    state,
    atS: secondsSince(row.createdAt, at),
  })
  const headlines = settled(row.stageCopy)
  const photos = settled(row.stageImagery)
  return {
    ...status,
    stages: {
      select: stage(row.stageSelect, row.stageSelectAt),
      tokens: stage(row.stageTokens, row.stageTokensAt),
      brief: stage(row.stageBrief, row.stageBriefAt),
      copy: stage(row.stageCopy, row.stageCopyAt),
      imagery: stage(row.stageImagery, row.stageImageryAt),
    },
    settledS: secondsSince(row.createdAt, row.settledAt),
    palette:
      row.fill === null
        ? null
        : {
            label: PALETTES.find((palette) => palette.id === row.paletteId)?.label ?? null,
            hex: row.fill,
          },
    concepts: status.concepts.map((concept) => {
      const { templateId } = concept
      return {
        ...concept,
        headline: headlines && templateId !== null ? headlineIn(row.copy, templateId) : null,
        photo: photos && templateId !== null ? photoIn(row.posterPhotos, templateId) : null,
      }
    }),
  }
}
