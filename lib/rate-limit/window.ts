// A fixed window: the count of hits under one key in the window that contains `now`. Fixed,
// not sliding, because one atomic upsert per hit is all a serverless function should spend on
// it, and the limits are generous enough that the window's edge does not matter.

// The window a moment falls in, as text for the key: the window's start in seconds.
export function windowKey(now: Date, windowSeconds: number): string {
  const seconds = Math.floor(now.getTime() / 1000)
  return String(seconds - (seconds % windowSeconds))
}

// The key for a limit: what is limited, and who.
export function limitKey(scope: string, subject: string): string {
  return `${scope}:${subject}`
}
