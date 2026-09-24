import { networkInterfaces } from 'node:os'
import type { NextConfig } from 'next'

// Importing env here validates every variable at build time, so a missing value fails the build
// instead of surfacing at runtime.
import './lib/env'

// This machine's own IPv4 addresses on the networks it has joined. A phone or tablet on the same
// Wi-Fi opens the dev server at one of them, and the dev server refuses its dev resources to any
// host but localhost unless it is listed: the HMR socket is turned away, the page renders from the
// server but never hydrates, and nothing on it answers a tap (the phone menu stayed shut on real
// devices, 24 September 2026). Only `next dev` reads the list. It holds this machine's addresses
// and no range, so no other device on the network is let in; a new network needs a restart.
const lanAddresses = Object.values(networkInterfaces())
  .flatMap((addresses) => addresses ?? [])
  .filter((address) => address.family === 'IPv4' && !address.internal)
  .map((address) => address.address)

const nextConfig: NextConfig = {
  typedRoutes: true,
  serverExternalPackages: ['sharp'],
  allowedDevOrigins: lanAddresses,
  // The visitor's logo raster and the re-hosted photographs live on the project's Blob store.
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
  },
  // The work band's AVIF captures are served from public/work/ rather than imported (Turbopack
  // cannot decode AVIF), so they miss the hashed-asset cache header. Their address carries the
  // manifest's capture date as a version, so they can be cached as long as the hashed files are.
  // The brand mark (public/brand/) is served the same way, with the export date as its version.
  headers() {
    const immutable = [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }]
    return Promise.resolve([
      { source: '/work/:path*', headers: immutable },
      { source: '/brand/:path*', headers: immutable },
    ])
  },
}

export default nextConfig
