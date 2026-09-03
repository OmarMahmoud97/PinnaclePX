// Native colour inputs only accept #rrggbb, so a three-digit code has to be expanded first.
export function toSixDigitHex(value: string): string | null {
  const trimmed = value.trim().toLowerCase()
  if (/^#[0-9a-f]{6}$/.test(trimmed)) return trimmed
  if (/^#[0-9a-f]{3}$/.test(trimmed)) return trimmed.replace(/[0-9a-f]/g, (digit) => digit + digit)
  return null
}
