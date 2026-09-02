import type { TemplateTuple } from '@/lib/copy-slots/template-meta'
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

// Single source of truth for the ten templates. lib/select imports only this file from templates/.
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

// Unique ids, checked at module load: fail fast.
const ids = new Set<string>(TEMPLATES.map((t) => t.id))
if (ids.size !== TEMPLATES.length) {
  throw new Error('Template ids must be unique')
}
