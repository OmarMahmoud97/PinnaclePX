import type { TemplateContract } from '@/lib/copy-slots/contract'
import type { TemplateMeta, TemplateTuple } from '@/lib/copy-slots/template-meta'
import { auroraContract } from './t01-aurora/contract'
import { meta as t01 } from './t01-aurora/meta'
import { meta as t02 } from './t02-monolith/meta'
import { meta as t03 } from './t03-meridian/meta'
import { meta as t04 } from './t04-atlas/meta'
import { meta as t05 } from './t05-ember/meta'
import { meta as t06 } from './t06-harbor/meta'
import { meta as t07 } from './t07-summit/meta'
import { meta as t08 } from './t08-vector/meta'
import { meta as t09 } from './t09-linen/meta'
import { meta as t10 } from './t10-orbit/meta'

// Single source of truth for the ten templates, and the one file under templates/ that lib may
// import. Metadata and contracts only: components live in templates/render.tsx for the preview
// pages, so the pipeline never bundles a section.
// Compile-time: exactly ten entries (TemplateTuple is a ten-element tuple).
export const TEMPLATES = [
  t01,
  t02,
  t03,
  t04,
  t05,
  t06,
  t07,
  t08,
  t09,
  t10,
] as const satisfies TemplateTuple

// The templates the selector may choose from. While fewer than the configured concept count are
// ready, a submission builds fewer concepts (lib/select).
export const READY_TEMPLATES: readonly TemplateMeta[] = TEMPLATES.filter((t) => t.ready)

// One contract per ready template.
const CONTRACTS: ReadonlyMap<string, TemplateContract> = new Map([
  [auroraContract.meta.id, auroraContract],
])

// Checked at module load: fail fast.
const ids = new Set<string>(TEMPLATES.map((t) => t.id))
if (ids.size !== TEMPLATES.length) {
  throw new Error('Template ids must be unique')
}
for (const template of READY_TEMPLATES) {
  if (!CONTRACTS.has(template.id)) {
    throw new Error(`Template ${template.id} is ready but has no contract`)
  }
}

export function contractFor(id: string): TemplateContract {
  const contract = CONTRACTS.get(id)
  if (contract === undefined) throw new Error(`No contract for template ${id}`)
  return contract
}
