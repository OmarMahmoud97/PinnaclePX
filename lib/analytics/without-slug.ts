// A slug is the key to someone's designs, and two kinds of address carry one: the done page's
// query (/start?q=done&s={slug}) and the preview pages' path (/preview/{slug}, and
// /preview/{slug}/{templateId} for a design). No address leaves for analytics with it
// (docs/start-page-journey-plan.md, sections 7.3 and 8.5): the query loses `s`, and the path's
// slug becomes the route's own placeholder, which is what Vercel already reports as the page's
// route, so the path still says which page was seen. Vercel Analytics and Speed Insights hand
// every event through this before they send it (app/_components/telemetry.tsx).
const SLUG_PARAM = 's'
const PREVIEW_SLUG = /^\/preview\/[^/]+/
const PREVIEW_ROUTE = '/preview/[slug]'

// A path without an origin is read against this one and written back as a path.
const PLACEHOLDER_ORIGIN = 'https://path.invalid'

export function withoutSlug<T extends { url: string }>(event: T): T | null {
  let url: URL
  try {
    url = new URL(event.url, PLACEHOLDER_ORIGIN)
  } catch {
    // An address that cannot be read cannot be cleaned, so the event is dropped.
    return null
  }
  const inQuery = url.searchParams.has(SLUG_PARAM)
  const inPath = PREVIEW_SLUG.test(url.pathname)
  if (!inQuery && !inPath) return event
  // Only touched when there is a slug to take, since rewriting the query re-encodes it.
  if (inQuery) url.searchParams.delete(SLUG_PARAM)
  if (inPath) url.pathname = url.pathname.replace(PREVIEW_SLUG, PREVIEW_ROUTE)
  const cleaned =
    url.origin === PLACEHOLDER_ORIGIN ? `${url.pathname}${url.search}${url.hash}` : url.href
  return { ...event, url: cleaned }
}
