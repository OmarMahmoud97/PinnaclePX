import type { MetadataRoute } from 'next'
import { env } from '@/lib/env'

export default function robots(): MetadataRoute.Robots {
  return {
    // /admin is the owner's alone and answers a crawler with 401 or 404 anyway (proxy.ts).
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/admin'] },
    sitemap: `${env.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
  }
}
