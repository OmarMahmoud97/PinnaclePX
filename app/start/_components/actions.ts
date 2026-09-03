'use server'

import { z } from 'zod'
import type { DesignsStatus } from '@/lib/brief/designs'
import { briefSchema } from '@/lib/brief/schema'
import { err, ok, type Result } from '@/lib/errors'
import { log } from '@/lib/log'

// The client validates each question so the visitor gets a quick answer; this validates the whole
// brief again, because a browser is not a trust boundary.
//
// SEAM: this is where the pipeline connects (docs/home-page-plan.md, section 8, phase B). Landing
// next: the HMAC identity from the email, the lead row, client-direct Blob uploads for the logo
// and photos, and the pipeline/brief.requested event. Until those exist nothing is stored, so the
// primary call to action must not be pointed at real traffic.
export async function submitBrief(input: unknown): Promise<Result<{ briefId: string }>> {
  const parsed = await briefSchema.safeParseAsync(input)
  if (!parsed.success) {
    log.warn('brief.rejected', { issues: parsed.error.issues.length })
    return err('Something in your answers did not look right. Go back and check them.')
  }

  const briefId = crypto.randomUUID()

  // Shapes and lengths only: never the visitor's name, email, company or their own words.
  log.info('brief.received', {
    briefId,
    descriptionChars: parsed.data.description.length,
    logo: parsed.data.logo.kind,
    style: parsed.data.imagery.style,
    photos: parsed.data.imagery.fileNames.length,
    colours: parsed.data.colours.kind,
  })

  return ok({ briefId })
}

const briefIdSchema = z.string().uuid()

// SEAM: the pipeline writes each finished design against its brief and this reads them back.
// Until it exists every brief is still building, and the done page says so when the clock runs
// out rather than pretending.
export async function getDesigns(briefId: string): Promise<DesignsStatus> {
  const id = await briefIdSchema.safeParseAsync(briefId)
  return id.success ? { status: 'building' } : { status: 'missing' }
}
