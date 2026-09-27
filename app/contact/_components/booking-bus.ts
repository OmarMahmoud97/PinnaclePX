// How the booking controls on /contact reach the one booking sheet (ADR 0040), and how the sheet
// tells the call card a call was booked. The controls sit in two cards, the sheet at the end of
// main, and none is the others' parent, so they meet here rather than through a context that
// would make a client component of everything between them.
//
// A request carries where the ink should bloom from, in the viewport's pixels, and the control
// that asked, which takes the focus back when the sheet closes. With no sheet listening, a
// request is refused, and the control opens the booking page instead.
export type BookingRequest = Readonly<{ at: string; trigger: HTMLElement }>

const sheets = new Set<(request: BookingRequest) => void>()
const bookings = new Set<() => void>()

export function requestBooking(request: BookingRequest): boolean {
  if (sheets.size === 0) return false
  for (const listener of sheets) listener(request)
  return true
}

export function onBookingRequest(listener: (request: BookingRequest) => void): () => void {
  sheets.add(listener)
  return () => {
    sheets.delete(listener)
  }
}

export function announceBooked(): void {
  for (const listener of bookings) listener()
}

export function onBooked(listener: () => void): () => void {
  bookings.add(listener)
  return () => {
    bookings.delete(listener)
  }
}
