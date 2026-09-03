// "4:58": whole minutes, then seconds padded to two digits. Rounds up so the clock shows the
// full budget at the start and never goes below zero.
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${String(minutes)}:${String(seconds).padStart(2, '0')}`
}
