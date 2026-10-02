import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { env } from '@/lib/env'

// A development-only stand-in for a visitor's own photograph: the files the eval's
// own-photograph fixtures name (tests/fixtures/eval/fixtures.json, decision 11), served from
// tests/fixtures/photos so they never sit in public/. Outside development the route does not
// exist.

const FILE = /^own-\d+-(?:landscape|portrait)\.jpg$/

export async function GET(_request: Request, ctx: RouteContext<'/dev/photo/[file]'>) {
  if (env.NODE_ENV !== 'development') return new Response(null, { status: 404 })
  const { file } = await ctx.params
  const path = join(process.cwd(), 'tests', 'fixtures', 'photos', file)
  if (!FILE.test(file) || !existsSync(path)) return new Response(null, { status: 404 })
  return new Response(new Uint8Array(readFileSync(path)), {
    headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'no-store' },
  })
}
