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

function previewHref(slug: string, templateId: string): string {
  return `/preview/${slug}/${templateId}`
}

// The status a row is in. The brief feeds only the copy, so the visitor's path is select,
// tokens, copy and imagery: a concept is ready when those four have settled.
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
  const ready = [row.stageSelect, row.stageTokens, row.stageCopy, row.stageImagery].every(settled)
  const ids = row.templateIds ?? []
  const concepts = Array.from({ length: row.conceptCount }, (_, index) => {
    const templateId = ids[index] ?? null
    return {
      templateId,
      name: TEMPLATES.find((t) => t.id === templateId)?.name ?? null,
      ready: ready && templateId !== null,
      href: ready && templateId !== null ? previewHref(row.slug, templateId) : null,
    }
  })
  return { ...base, status: ready ? 'ready' : 'building', concepts }
}
