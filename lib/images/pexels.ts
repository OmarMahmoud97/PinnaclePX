import 'server-only'
import { CONFIG } from '@/lib/config'
import { env } from '@/lib/env'
import { AppError } from '@/lib/errors'
import { type Candidate, candidatesFrom } from '@/lib/images/candidates'
import { log } from '@/lib/log'

// Pexels has refused a search because the quota is spent. A 429 carries no reset time (the
// quota headers come only with a good answer), so nothing can say when a search will work
// again, and the stage settles the slot rather than ask every twenty seconds until the deadline.
export class PexelsQuotaError extends AppError {
  constructor() {
    super('Pexels quota exhausted')
    this.name = 'PexelsQuotaError'
  }
}

// One search, landscape, the configured page size. Throws on anything but a good answer, and
// logs what is left of the quota so a rising count of searches shows before it bites.
export async function searchPhotos(query: string): Promise<Candidate[]> {
  const url = new URL('https://api.pexels.com/v1/search')
  url.searchParams.set('query', query)
  url.searchParams.set('orientation', 'landscape')
  url.searchParams.set('per_page', String(CONFIG.images.perPage))
  const response = await fetch(url, {
    headers: { Authorization: env.PEXELS_API_KEY },
    signal: AbortSignal.timeout(CONFIG.timeoutMs.search),
  })
  log.info('pexels.search', {
    status: response.status,
    remaining: Number(response.headers.get('x-ratelimit-remaining') ?? -1),
  })
  if (response.status === 429) {
    // Every submission goes without stock photographs until the quota returns: an outage.
    log.error('pexels.exhausted')
    throw new PexelsQuotaError()
  }
  if (!response.ok) throw new AppError(`Pexels returned ${String(response.status)}`)
  return candidatesFrom(await response.json())
}
