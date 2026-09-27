import type { Page, Route } from '@playwright/test'
import type { ContactRefusal } from '@/app/contact/_components/actions'
import { CONFIG } from '@/lib/config'
import type { Result } from '@/lib/errors'

// What every /contact spec needs to reach a state of the form or the calendar without sending a
// message or loading Cal.com (ADR 0040): the refusal of anything that writes, the Server Action's
// answer given in the browser, a send held on its way, and a stand-in for Cal.com's loader.

type Answer = Result<null, ContactRefusal>

// A POST to either page is how its Server Action travels.
const sends = (url: URL) => url.pathname === '/contact' || url.pathname === '/start'

// The Server Action's reply as it travels: a React Flight row holding the action's result.
function flight(result: Answer) {
  return {
    contentType: 'text/x-component',
    body: `0:${JSON.stringify({ a: result, f: '' })}\n`,
  }
}

// Nothing a spec triggers may reach the studio. A message sent from /contact emails the owner and
// writes the production database's rate-limit table, and a brief sent from /start runs the paid
// pipeline, so every request to either page but a GET is refused before it leaves the browser.
// It is set on the context, so a page the spec opens later is covered too; the answers below are
// set on the page, and a page's routes are tried before its context's. Every contact spec calls
// this first, in its beforeEach.
export async function refuseContactSends(page: Page): Promise<void> {
  await page
    .context()
    .route(sends, (route) =>
      route.request().method() === 'GET' ? route.fallback() : route.abort(),
    )
}

// Answers the send in the browser with `result`, so its request never reaches the server: a
// message gone, or one of the refusals, for a spec that has to see what follows. A later answer
// wins over an earlier one, since Playwright tries the newest route first.
export async function answerContact(page: Page, result: Answer): Promise<void> {
  await page.route(sends, (route) =>
    route.request().method() === 'GET' ? route.fallback() : route.fulfill(flight(result)),
  )
}

// Drops the send's connection, as a network that has gone away does.
export async function dropContact(page: Page): Promise<void> {
  await page.route(sends, (route) =>
    route.request().method() === 'GET' ? route.fallback() : route.abort(),
  )
}

type HeldSend = Readonly<{
  // Resolves once the send has left the page, which is after the form's floor
  // (CONFIG.form.minMs) since it opened.
  arrived: Promise<void>
  // Answers the held send.
  release: (result: Answer) => void
}>

// Holds the send on its way until the spec answers it, for the sending state: the ink held, the
// quiet parts faded and the status line said. Server Actions go one at a time from a page, so a
// spec answers a held send before it sends again.
export async function holdContact(page: Page): Promise<HeldSend> {
  let release: (result: Answer) => void = () => undefined
  let reached: () => void = () => undefined
  const answer = new Promise<Answer>((resolve) => {
    release = resolve
  })
  const arrived = new Promise<void>((resolve) => {
    reached = resolve
  })
  await page.route(sends, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fallback()
      return
    }
    reached()
    await route.fulfill(flight(await answer))
  })
  return {
    arrived,
    release: (result) => {
      release(result)
    },
  }
}

// The longest a send takes to show its outcome once pressed: the form's floor since it opened,
// the ink's hold and its run over the card, with room for a slow machine.
export const SEND_SETTLES_MS = CONFIG.form.minMs + CONFIG.contact.send.minHoldMs + 4_000

// Cal.com's hosts. Nothing from any of them may load unless a spec stands it in.
const isCal = (url: URL) => url.hostname === 'cal.com' || url.hostname.endsWith('.cal.com')

// A stand-in for Cal.com's loader (lib/booking/cal.ts). It plays the queues the page has filled
// as the real one does: each namespace's inline command puts a frame in the element it names,
// and each `on` listens for the event the real loader fires on the page's window,
// CAL:{namespace}:{action}. A frame reports it is ready a moment after it is added. A namespace
// initialised after it has run is played at once, as the real loader does.
const EMBED_STUB = `(() => {
  const cal = window.Cal
  if (!cal) return
  const frame = '<!doctype html><html lang="en"><head><title>Calendar</title></head><body><p>A calendar.</p></body></html>'
  const play = (name, [verb, options]) => {
    if (verb === 'inline') {
      const host = options.elementOrSelector
      const booker = document.createElement('iframe')
      booker.title = 'Book a call'
      booker.srcdoc = frame
      host.append(booker)
      setTimeout(() => window.dispatchEvent(new CustomEvent('CAL:' + name + ':linkReady', { detail: {} })), 100)
    }
    if (verb === 'on') window.addEventListener('CAL:' + name + ':' + options.action, options.callback)
  }
  const attach = (name) => {
    const queue = cal.ns[name]
    if (!queue) return
    for (const command of queue.q) play(name, command)
    queue.q.push = (...commands) => { for (const command of commands) play(name, command); return 0 }
  }
  for (const name of Object.keys(cal.ns)) attach(name)
  cal.q.push = (...commands) => {
    for (const [verb, name] of commands) if (verb === 'initNamespace') attach(name)
    return 0
  }
  cal.instance = {}
})()`

// Stands the loader in for Cal.com's and refuses everything else from Cal.com, the booking page
// itself included. Set on the context, so a tab the page opens is covered as well; the refusal
// first and the stand-in after it, since the newest route is tried first.
export async function stubCal(page: Page): Promise<void> {
  const context = page.context()
  await context.route(isCal, (route) => route.abort())
  await context.route(CONFIG.contact.booking.script, (route: Route) =>
    route.fulfill({ contentType: 'text/javascript', body: EMBED_STUB }),
  )
}

// A running count of the requests the page has made to any Cal.com host, refused or not.
export function calRequests(page: Page): () => number {
  let seen = 0
  page.on('request', (request) => {
    if (isCal(new URL(request.url()))) seen += 1
  })
  return () => seen
}

// The page has hydrated: the call card's booking link has become the control that opens the
// calendar, and the form's handlers are attached (the whole page hydrates in one pass). A press
// on Send before this lands on a form that does nothing, by design.
export async function hydrated(page: Page): Promise<void> {
  await page.locator('#call button[aria-controls="booking"]').waitFor()
}

// A still page, for a scan or a measure: the answers band's lists shown, as the page's own
// fail-safe shows them, and every animation that ends, over, since axe reads colours as they are
// painted and a card is measured where it rests. The send's spinner turns until the answer comes
// and never ends, so it is not waited for (a11y.spec.ts).
export async function settled(page: Page): Promise<void> {
  await page.evaluate(() => {
    for (const list of document.querySelectorAll('[data-reveal]')) {
      list.setAttribute('data-inview', '')
    }
  })
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => {
      const { endTime } = animation.effect?.getComputedTiming() ?? {}
      return !Number.isFinite(endTime) || animation.playState !== 'running'
    }),
  )
}
