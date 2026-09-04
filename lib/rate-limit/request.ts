import 'server-only'
import { headers } from 'next/headers'

// The caller's address as the platform reports it: the first hop of x-forwarded-for on Vercel,
// or "local" where there is none, so a local run is one caller.
export async function callerAddress(): Promise<string> {
  const forwarded = (await headers()).get('x-forwarded-for')
  const first = forwarded?.split(',')[0]?.trim()
  return first === undefined || first === '' ? 'local' : first
}
