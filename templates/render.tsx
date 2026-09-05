import type { ReactNode } from 'react'
import type { TemplateAssets } from '@/lib/copy-slots/assets'
import { Aurora } from './t01-aurora'
import { assembleAurora, auroraCopySchema } from './t01-aurora/contract'
import { Monolith } from './t02-monolith'
import { assembleMonolith, monolithCopySchema } from './t02-monolith/contract'
import { Meridian } from './t03-meridian'
import { assembleMeridian, meridianCopySchema } from './t03-meridian/contract'
import { Atlas } from './t04-atlas'
import { assembleAtlas, atlasCopySchema } from './t04-atlas/contract'

// A template id, its stored copy and its assets to the rendered page. The copy is validated
// against the template's own schema on the way in, so a row a template cannot render fails
// fast instead of painting something broken. Only the preview pages import this file; the
// pipeline reads templates/registry.ts, which holds no component.
export function renderConcept(
  templateId: string,
  copy: unknown,
  assets: TemplateAssets,
): ReactNode {
  switch (templateId) {
    case 't01-aurora':
      return <Aurora content={assembleAurora(auroraCopySchema.parse(copy), assets)} />
    case 't02-monolith':
      return <Monolith content={assembleMonolith(monolithCopySchema.parse(copy), assets)} />
    case 't03-meridian':
      return <Meridian content={assembleMeridian(meridianCopySchema.parse(copy), assets)} />
    case 't04-atlas':
      return <Atlas content={assembleAtlas(atlasCopySchema.parse(copy), assets)} />
    default:
      throw new Error(`No renderer for template ${templateId}`)
  }
}
