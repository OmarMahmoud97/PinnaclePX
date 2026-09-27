import { AppError } from '@/lib/errors'

// The hosts Cal.com serves a booking page from: its own and its app's.
const CAL_HOSTS: ReadonlySet<string> = new Set(['cal.com', 'app.cal.com'])

// The calendar's link as Cal.com's embed takes it (lib/booking/cal.ts): the booking page's path,
// "https://cal.com/pinnaclepx/quick-chat" as "pinnaclepx/quick-chat". The page is SITE.bookingUrl,
// which every plain link on the site opens, so the calendar inside /contact is always the one
// those links show. Anything that is not a page on Cal.com is a mistake in lib/site.ts, and says
// so at once rather than mounting some other site's page in the sheet.
export function calLinkFrom(url: string): string {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch (error) {
    throw new AppError(`The booking page is not an address: ${url}`, error)
  }
  if (!CAL_HOSTS.has(parsed.hostname)) {
    throw new AppError(`The booking page is not on Cal.com: ${url}`)
  }
  const path = parsed.pathname.replace(/^\/+|\/+$/g, '')
  if (path === '') throw new AppError(`The booking page names no calendar: ${url}`)
  return path
}
