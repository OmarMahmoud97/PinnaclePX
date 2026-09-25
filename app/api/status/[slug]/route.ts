import type { StatusView } from '@/lib/brief/status'
import { readViewRow } from '@/lib/db/submissions'
import { slugSchema } from '@/lib/identity/slug'
import { POSTER_SLOTS, viewOf } from '@/lib/preview/status'

// How a submission is coming along, for the done page, the designs page and a design opened
// before it is ready (docs/start-page-journey-plan.md, D22 and 8.2). A GET, so the answer is one
// plain request that a spec intercepts by its URL and a hidden tab can keep making. Read straight
// from the row every time, and never stored by the browser or any cache between: the row is the
// only truth, and it changes every few seconds while the designs build.
//
// Every answer is a status, a 200 with the body the pollers type: a slug that is not one of ours,
// or that names no submission (never sent, or swept after its days), is `missing`. A failed read
// throws, so a poller sees a 500, never a status the row did not give.
export async function GET(
  _request: Request,
  { params }: RouteContext<'/api/status/[slug]'>,
): Promise<Response> {
  const { slug } = await params
  return Response.json(await statusFor(slug), { headers: { 'Cache-Control': 'no-store' } })
}

async function statusFor(slug: string): Promise<StatusView> {
  const valid = slugSchema.safeParse(slug)
  if (!valid.success) return { status: 'missing' }
  const row = await readViewRow(valid.data, POSTER_SLOTS)
  return row === null ? { status: 'missing' } : viewOf(row)
}
