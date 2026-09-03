import type { MetadataRoute } from 'next'
import { env } from '@/lib/env'

// Only the home page is indexable. Previews are per visitor and stay out of the sitemap.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: env.NEXT_PUBLIC_APP_URL, changeFrequency: 'monthly', priority: 1 }]
}
