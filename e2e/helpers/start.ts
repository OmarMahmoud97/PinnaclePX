import type { Page } from '@playwright/test'
import type { SendRefusal } from '@/app/start/_components/actions'
import type { Submitted } from '@/app/start/_components/brief-reducer'
import { DRAFT_KEY, DRAFT_ORDER } from '@/lib/brief/draft'
import type { Answers } from '@/lib/brief/schema'
import type { StatusView, SubmissionStatus } from '@/lib/brief/status'
import { CONFIG } from '@/lib/config'
import type { Result } from '@/lib/errors'
import { EDGE_COMPANIES, exampleView, type Stages } from '@/lib/preview/example'

// What every /start spec needs to reach a question or the done state without ever sending a
// brief or storing a file (docs/start-page-journey-plan.md, sections 10 and 11.5): the refusal
// of anything that writes, uploads that land without a server, a draft written before the page's
// scripts run, the status poll answered from fixtures, and names at the edges the page must hold.

// The route that issues upload tokens and looks up stored files. It counts every call, a lookup
// included, in the production database's rate-limit table.
const UPLOAD_ROUTE = '/api/upload'
// Where the Blob SDK puts a file with that token: its default API, since the project sets no
// VERCEL_BLOB_API_URL to move it.
const BLOB_API = new URL('https://vercel.com/api/blob')

function isBlobApi(url: URL): boolean {
  return url.origin === BLOB_API.origin && url.pathname.startsWith(BLOB_API.pathname)
}

// Either leg of an upload: the token or the lookup from our route, or the put to Blob.
function isUpload(url: URL): boolean {
  return url.pathname === UPLOAD_ROUTE || isBlobApi(url)
}

// Nothing a spec triggers may write to Neon or Blob. Sending a brief runs the paid pipeline,
// writes a lead to the production database and emails the owner, and the Server Action travels
// as a POST to /start, so every request to /start other than a GET is refused before it leaves
// the browser. Picking a file asks the upload route for a token and then puts the file on the
// production store, so both are refused for every method. Every spec the redesign adds calls
// this first, in its beforeEach; the older /start specs carry their own copy of the /start
// refusal, and none of them picks a file.
export async function refuseSends(page: Page): Promise<void> {
  await page.route(
    (url) => url.pathname === '/start',
    (route) => (route.request().method() === 'GET' ? route.fallback() : route.abort()),
  )
  await page.route(isUpload, (route) => route.abort())
}

// Answers the send in the browser with `result`, as the Server Action replies (a React Flight row
// holding the action's result), so its request never reaches the server: the day's limit, or a
// submission, for a spec that has to see what follows one. Register it after refuseSends, whose
// refusal it overrides for that spec, because Playwright tries the newest route first.
export async function answerSend(
  page: Page,
  result: Result<Submitted, SendRefusal>,
): Promise<void> {
  await page.route(
    (url) => url.pathname === '/start',
    (route) =>
      route.request().method() === 'GET'
        ? route.fallback()
        : route.fulfill({
            contentType: 'text/x-component',
            body: `0:${JSON.stringify({ a: result, f: '' })}
`,
          }),
  )
}

// A client token in the shape the Blob SDK reads a store id from (vercel_blob_client_{store}_…).
// No store would take it, and none is asked to: the put it authorises is answered here too.
const STUB_STORE = 'e2e'
const STUB_TOKEN = `vercel_blob_client_${STUB_STORE}_stub`

// Where a stubbed upload says its file landed, in the shape of a public Blob URL.
export const STUB_BLOB_ORIGIN = `https://${STUB_STORE}.public.blob.vercel-storage.com`

// Lets uploads succeed, for a spec that needs one to, without a request reaching our server or
// Blob: the token route answers with the stub token, and the put answers as Blob does, with the
// file's URL. Register it after refuseSends, whose refusal it overrides because Playwright tries
// the newest route first; registered before, uploads fail, which is the safe way round. A lookup
// (GET /api/upload) is never needed, since no stubbed put is refused, so it stays refused.
export async function stubUploads(page: Page): Promise<void> {
  await page.route(isUpload, async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    if (request.method() === 'POST' && url.pathname === UPLOAD_ROUTE) {
      await route.fulfill({
        json: { type: 'blob.generate-client-token', clientToken: STUB_TOKEN },
      })
      return
    }
    if (request.method() === 'PUT' && isBlobApi(url)) {
      const pathname = url.searchParams.get('pathname') ?? ''
      const stored = `${STUB_BLOB_ORIGIN}/${pathname}`
      // The put is cross-origin: Playwright answers its preflight, and this answer has to let
      // the page read it.
      await route.fulfill({
        json: { url: stored, downloadUrl: `${stored}?download=1`, pathname },
        headers: { 'access-control-allow-origin': '*' },
      })
      return
    }
    await route.fallback()
  })
}

// A one-pixel PNG, enough for the browser to draw a thumbnail.
export const PIXEL_PNG = {
  name: 'pixel.png',
  mimeType: 'image/png',
  buffer: Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64',
  ),
} as const

// A brief that answers every question.
export const ANSWERED: Answers = {
  description:
    'Physiotherapy clinic in Sheffield. Sports injuries, post-op rehab and same-week appointments.',
  name: 'Sam',
  company: 'Ashgrove Physio',
  email: 'sam@ashgrove.example',
  logo: { kind: 'wordmark' },
  imagery: { style: 'minimal', photos: [] },
  colours: { kind: 'palette', paletteId: 'forest' },
}

// A draft is the answers plus `reached`, the highest question shown, 0-based like the flow's
// question index (plan D3), stamped with the order it counts in as the page stamps it. The flow
// resumes at the lower of `reached` and the first question that does not validate; a draft
// without it resumes at the first that does not validate.
type Draft = Partial<Answers> & { reached?: number }

// Marks the tab as written, in the test's own namespace, so the page never reads it.
const SEEDED_KEY = 'e2e.draft-seeded'

// Writes ANSWERED, with `draft` over it, into this tab's session storage before the page's own
// scripts run. Only the tab's first document gets it: a reload then reads what the page itself
// saved, which is what a restore test has to see.
export async function withDraft(page: Page, draft: Draft = {}): Promise<void> {
  await page.addInitScript(
    ({ key, seeded, value }) => {
      if (sessionStorage.getItem(seeded) !== null) return
      sessionStorage.setItem(key, value)
      sessionStorage.setItem(seeded, 'yes')
    },
    {
      key: DRAFT_KEY,
      seeded: SEEDED_KEY,
      value: JSON.stringify({ ...ANSWERED, ...draft, order: DRAFT_ORDER }),
    },
  )
}

type StatusOptions = Readonly<{
  conceptCount?: 1 | 2 | 3
  // How far from now the build's deadline is; negative once it has passed.
  deadlineInMs?: number
  // Stages that stand otherwise than the status's own, for a build caught between two states.
  stages?: Partial<Stages>
}>

// The picture a fixture's design shows once its imagery stage has settled: an address on the
// stubbed store, which stubPhotos answers.
function stubPhoto(templateId: string) {
  return {
    src: `${STUB_BLOB_ORIGIN}/photos/${templateId}.jpg`,
    alt: '',
    width: 1920,
    height: 1280,
    credit: { photographer: 'Ana Ruiz', url: 'https://www.pexels.com/@ana-ruiz' },
  }
}

// A poll's answer, derived from a row by lib/preview/status.ts exactly as the server derives a
// real one, so a fixture can never take a shape the server would not send. The row is the example
// build in that state (lib/preview/example.ts): its times, colour, headlines and pictures follow
// its stages as the pipeline writes them, from ANSWERED's business and sentence.
export function statusFor(
  slug: string,
  status: SubmissionStatus['status'],
  { conceptCount = 3, deadlineInMs = CONFIG.deadline.totalMs, stages }: StatusOptions = {},
): StatusView {
  if (status === 'missing') return { status }
  const derived = exampleView(status, {
    slug,
    conceptCount,
    deadlineAt: new Date(Date.now() + deadlineInMs),
    brief: { company: ANSWERED.company, description: ANSWERED.description },
    photo: stubPhoto,
    stages,
  })
  if (derived.status !== status) {
    throw new Error(`the ${status} fixture derives as ${derived.status}; update the example`)
  }
  return derived
}

type StatusStub = Readonly<{
  // How many polls the stub has answered.
  polls: () => number
}>

// Answers GET /api/status/{slug} from `answers`, one per poll, the last repeated, so a spec can
// walk a build from building to ready. Nothing reaches the server or the database.
export async function interceptStatus(
  page: Page,
  slug: string,
  answers: readonly [SubmissionStatus, ...SubmissionStatus[]],
): Promise<StatusStub> {
  let polls = 0
  await page.route(
    (url) => url.pathname === `/api/status/${slug}`,
    async (route) => {
      if (route.request().method() !== 'GET') {
        await route.abort()
        return
      }
      const answer = answers[Math.min(polls, answers.length - 1)] ?? answers[0]
      polls += 1
      await route.fulfill({ json: answer, headers: { 'cache-control': 'no-store' } })
    },
  )
  return { polls: () => polls }
}

// Answers the image optimiser's requests for the fixtures' pictures with a pixel, so a poster
// draws without a request reaching the stubbed store, which does not exist.
export async function stubPhotos(page: Page): Promise<void> {
  await page.route(
    (url) =>
      url.pathname === '/_next/image' &&
      (url.searchParams.get('url') ?? '').startsWith(STUB_BLOB_ORIGIN),
    (route) => route.fulfill({ body: PIXEL_PNG.buffer, contentType: PIXEL_PNG.mimeType }),
  )
}

// Opens done for a slug the way a refresh or a pasted link does (/start?q=done&s={slug}), with
// the status poll answered by interceptStatus from the first request.
export async function openDone(
  page: Page,
  slug: string,
  answers: readonly [SubmissionStatus, ...SubmissionStatus[]],
): Promise<StatusStub> {
  const stub = await interceptStatus(page, slug, answers)
  await page.goto(`/start?q=done&s=${slug}`)
  return stub
}

// Names at the edges the page must hold (plan 7.7 and D25). Their shapes are checked by
// brief-harness.spec.ts.
export const EDGE_NAMES = {
  // The unbroken and the longest business names, which the designs page's example also draws.
  unbrokenCompany: EDGE_COMPANIES.unbroken,
  longestCompany: EDGE_COMPANIES.longest,
  // A 64-character address.
  longEmail: 'samantha.ashgrove-bookings.and-appointment@ashgrove-physio.co.uk',
  // Possessives: a name already ending in 's or ’s keeps it; a capital S takes only the
  // apostrophe.
  apostrophe: "Sam's",
  curlyApostrophe: 'Sam’s',
  capitals: 'GIBBS',
  // 24 graphemes, the most the whisper shows, written with combining accents so that its length
  // in code units (28) is not its length on screen.
  whisperLongest: 'Cre\u0300me Bru\u0302le\u0301e Cafe\u0301 Bakery',
} as const
