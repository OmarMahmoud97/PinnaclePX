import 'client-only'
import { calLinkFrom } from '@/lib/booking/cal-link'
import { calThemeFrom } from '@/lib/booking/cal-theme'
import { CONFIG } from '@/lib/config'
import { AppError } from '@/lib/errors'
import { SITE } from '@/lib/site'

// Cal.com's own embed (https://app.cal.com/embed/embed.js, 1.6.0 when this was written), which
// the booking sheet on /contact holds (app/contact/_components/booking-sheet.tsx, ADR 0040). The
// loader reads one global, window.Cal: a queue of the page's commands, and a queue for each
// namespace, which it plays in order when it arrives and afterwards runs at once. This is Cal.com's
// install snippet, typed, with one difference: the snippet appends the loader itself on its first
// call, and here loadCal does, so the sheet hears when it fails. Nothing here runs until a
// booking control is pressed.

// A command before the loader has run: every call is kept, in order, for the loader to play. The
// loader then swaps the queue's push for one that runs the command at once, which the call below
// reaches, since it reads push from the queue each time.
type Command = ((...args: unknown[]) => void) & { q: unknown[][] }
// The global: the page's queue, a queue per namespace, and the instance the loader sets on it
// once it has run. An intersection with Window rather than a declared global, since a global
// declaration needs an interface, which the house's type rules refuse.
type CalGlobal = Command & { ns: Record<string, Command>; instance?: unknown }
type CalWindow = Window & { Cal?: CalGlobal }

// What the sheet hears from the calendar: it is ready to use, it could not open, a call was
// booked in it.
type CalHandlers = Readonly<{ ready: () => void; failed: () => void; booked: () => void }>

function command(): Command {
  const q: unknown[][] = []
  return Object.assign(
    (...args: unknown[]) => {
      q.push(args)
    },
    { q },
  )
}

function calGlobal(): CalGlobal {
  const host = window as CalWindow
  const namespaces: Record<string, Command> = {}
  host.Cal ??= Object.assign(command(), { ns: namespaces })
  return host.Cal
}

let script: Promise<void> | undefined

// The loader, fetched once however often the sheet opens. A load that fails is forgotten, and
// its tag removed, so "Try again" fetches it afresh.
export function loadCal(): Promise<void> {
  script ??= new Promise<void>((resolve, reject) => {
    const tag = document.createElement('script')
    tag.src = CONFIG.contact.booking.script
    tag.async = true
    tag.onload = () => {
      resolve()
    }
    tag.onerror = () => {
      script = undefined
      tag.remove()
      reject(new AppError('The Cal.com embed did not load'))
    }
    document.head.append(tag)
  })
  return script
}

// The tries so far, counted for as long as window.Cal lasts, which is the document's life: a
// sheet mounted again after a client-side return to the page still finds the first sheet's
// listeners on the window, and Cal.com's loader never removes them.
let tries = 0

// One calendar in `frame`, in Cal.com's light theme with the site's colours (lib/booking/
// cal-theme.ts) and without the event's own details, which the sheet's heading already gives.
// Each try mounts under a namespace of its own (CONFIG.contact.booking), since the listeners of a
// second try on the first one's would stack on top of them, and a booking would be heard twice.
// A try before the loader has run first forgets whatever an earlier one queued, or the loader
// would play both and put two calendars in the frame.
export function mountCal(frame: HTMLElement, handlers: CalHandlers): void {
  const { namespace, origin, layout } = CONFIG.contact.booking
  tries += 1
  const name = tries === 1 ? namespace : `${namespace}-${String(tries)}`
  const cal = calGlobal()
  if (cal.instance === undefined) {
    cal.q.length = 0
    cal.ns = {}
  }
  const booker = command()
  cal.ns[name] = booker
  booker('init', name, { origin })
  cal('initNamespace', name)
  const root = getComputedStyle(document.documentElement)
  const theme = calThemeFrom((token) => root.getPropertyValue(token))
  booker('inline', {
    elementOrSelector: frame,
    calLink: calLinkFrom(SITE.bookingUrl),
    config: { layout, theme: 'light' },
  })
  booker('ui', {
    theme: 'light',
    layout,
    hideEventTypeDetails: true,
    cssVarsPerTheme: { light: theme },
  })
  booker('on', { action: 'linkReady', callback: handlers.ready })
  booker('on', { action: 'linkFailed', callback: handlers.failed })
  booker('on', { action: 'bookingSuccessfulV2', callback: handlers.booked })
}
