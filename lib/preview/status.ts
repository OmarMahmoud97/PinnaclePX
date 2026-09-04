import type { SubmissionStatus } from '@/lib/brief/status'
import type { StageState } from '@/lib/db/schema'
import { TEMPLATES } from '@/templates/registry'

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

const settled = (state: StageState) => state === 'done' || state === 'fallback'

// The stages the visitor's page is made of. The brief feeds only the copy.
const PATH = ['stageSelect', 'stageTokens', 'stageCopy', 'stageImagery'] as const

function previewHref(slug: string, templateId: string): string {
  return `/preview/${slug}/${templateId}`
}

// The status a row is in. A concept can be opened once select, tokens, copy and imagery have
// settled; it is ready when they all finished, and partial when the sweeper finished any of
// them with the fallback.
export function statusOf(row: StageRow): SubmissionStatus {
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
