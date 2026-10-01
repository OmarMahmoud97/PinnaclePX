// "4:58": whole minutes, then seconds padded to two digits. Rounds up so the clock shows the
// full budget at the start and never goes below zero.
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${String(minutes)}:${String(seconds).padStart(2, '0')}`
}

// A moment as the studio reads it, "4 Sept 2026, 14:05", in London time: the owner's notice and
// the briefs page both stamp a brief with it.
const london = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Europe/London',
})

export function formatLondon(moment: Date): string {
  return london.format(moment)
}
