import * as z from 'zod'
import { submissionAnswersSchema } from '@/lib/brief/submission'

// What /dev/eval reads of a stored eval record (tests/eval/types.ts has the whole shape).
export const evalRecordSchema = z.object({
  answers: submissionAnswersSchema,
  // The selector's pick.
  templates: z.array(z.string()),
  copy: z.record(z.string(), z.object({ final: z.unknown(), fallback: z.boolean() })),
  // The templates written outside the pick (EVAL_PAIRS), each with the trio its page is set with.
  extra: z.record(z.string(), z.object({ chosen: z.array(z.string()) })).optional(),
})

type Stored<T> = Readonly<{
  templates: readonly string[]
  copy: Readonly<Record<string, T>>
  extra?: Readonly<Record<string, Readonly<{ chosen: readonly string[] }>>> | undefined
}>

// A map's own entry, never one its prototype lends (an address may say "constructor").
const ownEntry = <V>(map: Readonly<Record<string, V>> | undefined, key: string): V | undefined =>
  map !== undefined && Object.hasOwn(map, key) ? map[key] : undefined

// One template's page of a record: its copy, and the templates its tokens and studio bar are set
// with, the pick for a template the selector chose and the stored trio for one outside it. Null,
// which the route answers with 404, for a template the record holds no copy for, or one neither
// chosen nor written as an extra.
export function evalPageOf<T>(
  record: Stored<T>,
  templateId: string,
): { written: T; chosen: readonly string[] } | null {
  const written = ownEntry(record.copy, templateId)
  if (written === undefined) return null
  if (record.templates.includes(templateId)) return { written, chosen: record.templates }
  const extra = ownEntry(record.extra, templateId)
  return extra === undefined ? null : { written, chosen: extra.chosen }
}
