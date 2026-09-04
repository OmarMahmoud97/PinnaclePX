import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ConceptPending } from '@/app/preview/_components/concept-pending'
import { typeStyle } from '@/app/preview/_components/fonts'
import { StudioBar } from '@/app/preview/_components/studio-bar'
import type { TemplateAssets } from '@/lib/copy-slots/assets'
import { AppError } from '@/lib/errors'
import { type PreviewRow, readPreview } from '@/lib/preview/read'
import { statusOf } from '@/lib/preview/status'
import { tokenStyle } from '@/lib/tokens/css'
import { TEMPLATES } from '@/templates/registry'
import { renderConcept } from '@/templates/render'

type Params = Promise<{ slug: string; templateId: string }>

type Loaded = PreviewRow & Readonly<{ index: number }>

// The row this page renders from, or nothing. A slug that is not one of ours, a submission that
// does not exist, or a template this submission did not choose are all the same: not found.
async function load(params: Params): Promise<Loaded | null> {
  const { slug, templateId } = await params
  const found = await readPreview(slug)
  if (found === null) return null
  const index = found.row.templateIds?.indexOf(templateId) ?? -1
  if (found.row.templateIds !== null && index === -1) return null
  return { ...found, index: Math.max(index, 0) }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const found = await load(params)
  if (found === null) return { robots: { index: false, follow: false } }
  const { answers } = found
  const count = found.row.conceptCount
  return {
    title:
      count > 1
        ? `${answers.company}, design ${String(found.index + 1)} of ${String(count)}`
        : `${answers.company}, your design`,
    robots: { index: false, follow: false },
  }
}

// One design, full page, under a slim strip of studio chrome. Everything on it comes from the
// submission row: the tokens on the root, the type from the style, the copy through the
// template's contract, the logo and pictures from the stages that made them.
export default async function ConceptPage({ params }: { params: Params }) {
  const found = await load(params)
  if (found === null) notFound()
  const { row, answers, index } = found
  const status = statusOf(row)
  const templateId = row.templateIds?.[index] ?? null
  const concept =
    status.status === 'ready' || status.status === 'partial' ? status.concepts[index] : undefined
  const name = TEMPLATES.find((t) => t.id === templateId)?.name ?? 'Your design'

  return (
    <div className="flex min-h-dvh flex-col">
      <StudioBar slug={row.slug} index={index} count={row.conceptCount} company={answers.company} />
      {concept?.ready !== true || templateId === null ? (
        <ConceptPending slug={row.slug} initial={status} name={name} />
      ) : (
        <ConceptBody row={row} answers={answers} templateId={templateId} />
      )}
    </div>
  )
}

function ConceptBody({ row, answers, templateId }: PreviewRow & { templateId: string }) {
  if (row.tokens === null) throw new AppError(`Submission ${row.slug} is ready without tokens`)
  const assets: TemplateAssets = {
    logo:
      row.logo?.image === undefined || row.logo.image === null
        ? { kind: 'wordmark' }
        : { kind: 'image', alt: answers.company, ...row.logo.image },
    images: row.imagery[templateId] ?? {},
  }
  return (
    <div style={{ ...tokenStyle(row.tokens), ...typeStyle(answers.imagery.style) }}>
      {renderConcept(templateId, row.copy[templateId], assets)}
    </div>
  )
}
