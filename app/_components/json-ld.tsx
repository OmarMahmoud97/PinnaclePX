import { env } from '@/lib/env'
import { SITE } from '@/lib/site'

// Organization and WebSite only. FAQPage no longer earns rich results for sites like this one.
export function JsonLd() {
  const url = env.NEXT_PUBLIC_APP_URL
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${url}/#organization`,
        name: SITE.name,
        legalName: SITE.legalName,
        url,
        // The 1200x630 social image: /icon is 32px, below the 112px minimum for a logo.
        logo: `${url}/opengraph-image`,
        areaServed: 'GB',
      },
      {
        '@type': 'WebSite',
        '@id': `${url}/#website`,
        name: SITE.name,
        url,
        description: SITE.description,
        publisher: { '@id': `${url}/#organization` },
      },
    ],
  }

  // Escape "<" so the payload cannot close the script tag (Next.js JSON-LD guide).
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replaceAll('<', '\\u003c') }}
    />
  )
}
