import type { NextConfig } from 'next'

// Importing env here validates every variable at build time, so a missing value fails the build
// instead of surfacing at runtime.
import './lib/env'

const nextConfig: NextConfig = {
  typedRoutes: true,
  serverExternalPackages: ['sharp'],
  // The visitor's logo raster and the re-hosted photographs live on the project's Blob store.
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
  },
  // The work band's AVIF captures are served from public/work/ rather than imported (Turbopack
  // cannot decode AVIF), so they miss the hashed-asset cache header. Their address carries the
  // manifest's capture date as a version, so they can be cached as long as the hashed files are.
  headers() {
    return Promise.resolve([
      {
        source: '/work/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ])
  },
}

export default nextConfig
