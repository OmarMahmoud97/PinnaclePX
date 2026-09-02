import type { NextConfig } from 'next'

// Importing env here validates every variable at build time, so a missing value fails the build
// instead of surfacing at runtime.
import './lib/env'

const nextConfig: NextConfig = {
  typedRoutes: true,
  serverExternalPackages: ['sharp'],
  // Placeholder demo imagery only. Remove once real screenshots live in public/.
  images: { remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }] },
}

export default nextConfig
