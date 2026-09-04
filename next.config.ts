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
}

export default nextConfig
