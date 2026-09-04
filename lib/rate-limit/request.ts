import 'server-only'
import { headers } from 'next/headers'

// The caller's address as the platform reports it. Vercel overwrites x-forwarded-for with the
// client's public address and does not forward external values, to prevent spoofing
// (vercel.com/docs/headers/request-headers), so the first hop is the caller's. Where there is
// none, locally, a run is one caller.
export async function callerAddress(): Promise<string> {
  const forwarded = (await headers()).get('x-forwarded-for')
  const first = forwarded?.split(',')[0]?.trim()
  return first === undefined || first === '' ? 'local' : first
}
