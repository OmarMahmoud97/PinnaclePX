import type { FoundView } from '@/lib/brief/status'
import { CONFIG } from '@/lib/config'
import type { SlotImage } from '@/lib/copy-slots/assets'
import { fallbackBrief } from '@/lib/copy-slots/brief'
import type { StageState } from '@/lib/db/schema'
import { type StageRow, type ViewRow, viewOf } from '@/lib/preview/status'
import { contractFor } from '@/templates/registry'

// An example build, as the pipeline would have left it at any point: the designs page's example
// draws it for design review (app/examples/hub/page.tsx), and the specs answer the status poll
// with it (e2e/helpers/start.ts). Both go through viewOf, as the server does, so neither can show
// a part the server would not have sent yet.

// The slug the example page polls for. No submission can have it (lib/identity/slug.ts), so the
// status route answers it as missing without reading the database, and a spec answers it instead.
export const EXAMPLE_SLUG = 'example'

// Business names at the edges every page that shows one must hold (plan 7.7). The example page
// draws them by key (?name=unbroken), so no text from the address ever reaches it, and the specs
// share them (e2e/helpers/start.ts, EDGE_NAMES).
export const EDGE_COMPANIES = {
  // 60 characters and no break opportunity: every box that shows it must wrap anywhere.
  unbroken: 'AshgrovePhysiotherapyAndSportsInjuryClinicsSheffieldAndLeeds',
  // The longest business name the schema takes, 80 characters in 14 words.
  longest: 'Ashgrove Physio and Sport Clinic for all the Runners, Riders and Walkers of Hull',
} as const

type Reported = FoundView['status']

export type Stages = Pick<
  StageRow,
  'templateIds' | 'stageSelect' | 'stageTokens' | 'stageBrief' | 'stageCopy' | 'stageImagery'
>

// The templates an example build chose, first to last.
const CHOSEN = ['t01-aurora', 't02-monolith', 't03-meridian']

// How the stages stand in each state the poll reports. While building, the headlines and the
// pictures are still on their way; a partial build left its pictures to the fallback; a failed
// build never chose its templates, and an exhausted one chose none.
const STAGES_IN: Record<Reported, Stages> = {
  building: {
    templateIds: CHOSEN,
    stageSelect: 'done',
    stageTokens: 'done',
    stageBrief: 'done',
    stageCopy: 'running',
    stageImagery: 'running',
  },
  ready: {
    templateIds: CHOSEN,
    stageSelect: 'done',
    stageTokens: 'done',
    stageBrief: 'done',
    stageCopy: 'done',
    stageImagery: 'done',
  },
  partial: {
    templateIds: CHOSEN,
    stageSelect: 'done',
    stageTokens: 'done',
    stageBrief: 'done',
    stageCopy: 'done',
    stageImagery: 'fallback',
  },
  exhausted: {
    templateIds: [],
    stageSelect: 'done',
    stageTokens: 'pending',
    stageBrief: 'pending',
    stageCopy: 'pending',
    stageImagery: 'pending',
  },
  failed: {
    templateIds: null,
    stageSelect: 'failed',
    stageTokens: 'pending',
    stageBrief: 'pending',
    stageCopy: 'pending',
    stageImagery: 'pending',
  },
}

// When each stage of the example settles, in seconds from the brief's arrival: a build of just
// over a minute, spaced as the pipeline spaces its stages.
const SETTLES_AT_S = { select: 6, tokens: 7, brief: 21, copy: 58, imagery: 64 } as const

// The design a partial example leaves plain, so the page shows the plain slot its note describes
// (plan 4.6): the second, with the first still showing what a photo looks like.
const PLAIN_IN_PARTIAL = 't02-monolith'

// The Forest palette's fill as the tokens stage derives it for a light page.
const FILL = { paletteId: 'forest', hex: '#2f6f4e' } as const

type Options = Readonly<{
  slug: string
  conceptCount: number
  deadlineAt: Date
  // The business and its sentence: the copy stage's fallback writes the headlines from them.
  brief: Readonly<{ company: string; description: string }>
  // What a template's first image slot holds once the imagery stage has filled it.
  photo: (templateId: string) => SlotImage
  // Stages that stand otherwise than the state's own, for a build caught between two states.
  stages?: Partial<Stages> | undefined
}>

const closed = (state: StageState) => state !== 'pending' && state !== 'running'

// The poll's answer for an example build in this state. The row follows its stages as the
// pipeline writes it: a closed stage has its time, the fill comes with the tokens, the copy lands
// whole as its stage settles, and the pictures are on the row from the moment the imagery stage
// starts filling them, which viewOf holds back until that stage has settled; an imagery stage
// that fell back left one slot plain.
export function exampleView(status: Reported, options: Options): FoundView {
  const { slug, deadlineAt, brief, photo } = options
  const stages = { ...STAGES_IN[status], ...options.stages }
  const createdAt = new Date(deadlineAt.getTime() - CONFIG.deadline.totalMs)
  const at = (state: StageState, seconds: number) =>
    closed(state) ? new Date(createdAt.getTime() + seconds * 1000) : null
  const states = [
    stages.stageSelect,
    stages.stageTokens,
    stages.stageBrief,
    stages.stageCopy,
    stages.stageImagery,
  ]
  const ids = stages.templateIds?.slice(0, options.conceptCount) ?? null
  const written = fallbackBrief(brief.company, brief.description)
  const row: ViewRow = {
    ...stages,
    slug,
    createdAt,
    deadlineAt,
    conceptCount: options.conceptCount,
    templateIds: ids,
    stageSelectAt: at(stages.stageSelect, SETTLES_AT_S.select),
    stageTokensAt: at(stages.stageTokens, SETTLES_AT_S.tokens),
    stageBriefAt: at(stages.stageBrief, SETTLES_AT_S.brief),
    stageCopyAt: at(stages.stageCopy, SETTLES_AT_S.copy),
    stageImageryAt: at(stages.stageImagery, SETTLES_AT_S.imagery),
    settledAt: states.every(closed)
      ? new Date(createdAt.getTime() + Math.max(...Object.values(SETTLES_AT_S)) * 1000)
      : null,
    paletteId: FILL.paletteId,
    fill: stages.stageTokens === 'done' ? FILL.hex : null,
    copy: closed(stages.stageCopy)
      ? Object.fromEntries((ids ?? []).map((id) => [id, contractFor(id).fallbackCopy(written)]))
      : {},
    posterPhotos:
      stages.stageImagery === 'pending'
        ? {}
        : Object.fromEntries(
            (ids ?? []).map((id) => [
              id,
              stages.stageImagery === 'fallback' && id === PLAIN_IN_PARTIAL ? null : photo(id),
            ]),
          ),
  }
  return viewOf(row)
}
