import type { MetadataRoute } from 'next'
import { env } from '@/lib/env'

// The home page and the privacy notice. Previews are per visitor and stay out of the sitemap.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: env.NEXT_PUBLIC_APP_URL, changeFrequency: 'monthly', priority: 1 },
    { url: `${env.NEXT_PUBLIC_APP_URL}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
  ]
}
