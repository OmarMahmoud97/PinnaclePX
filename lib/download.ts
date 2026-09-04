import 'server-only'
import { AppError } from '@/lib/errors'

// Fetches a file's bytes, giving up after the time allowed. Throws on any answer but a good
// one, naming the host and not the path, because a path may carry a visitor's hash.
export async function download(url: string, timeoutMs: number): Promise<Buffer> {
  const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) })
  if (!response.ok) {
    throw new AppError(`${new URL(url).host} returned ${String(response.status)}`)
  }
  return Buffer.from(await response.arrayBuffer())
}
