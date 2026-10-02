import * as z from 'zod'
import { env } from '@/lib/env'
import { contractFor, TEMPLATES } from '@/templates/registry'

// A development-only reading of a template's contract for the checks in scripts/checks: its
// name and the guide the copy model reads (lib/ai/copy.ts), its image slots, and every key path
// of its copy schema. The leftovers check looks for the guide's examples and the keys' words in
// stored copy. Outside development the route does not exist.

type JsonSchema = Readonly<{
  properties?: Readonly<Record<string, JsonSchema>>
  items?: JsonSchema
  anyOf?: readonly JsonSchema[]
}>

// Each key path of a schema, written as the violations write them: hero.stats[].value.
function pathsOf(node: JsonSchema, prefix: string): string[] {
  const branch = node.anyOf?.find((b) => b.properties !== undefined || b.items !== undefined)
  if (branch !== undefined) return pathsOf(branch, prefix)
  if (node.items !== undefined) return pathsOf(node.items, `${prefix}[]`)
  return Object.entries(node.properties ?? {}).flatMap(([key, child]) => {
    const path = prefix === '' ? key : `${prefix}.${key}`
    return [path, ...pathsOf(child, path)]
  })
}

export async function GET(_request: Request, ctx: RouteContext<'/dev/contract/[templateId]'>) {
  if (env.NODE_ENV !== 'development') return new Response(null, { status: 404 })
  const { templateId } = await ctx.params
  if (!TEMPLATES.some((t) => t.id === templateId)) return new Response(null, { status: 404 })
  const contract = contractFor(templateId)
  return Response.json({
    id: templateId,
    name: contract.meta.name,
    guide: contract.guide,
    imageSlots: contract.imageSlots,
    keys: pathsOf(z.toJSONSchema(contract.copySchema) as JsonSchema, ''),
  })
}
