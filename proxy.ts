import { type NextRequest, NextResponse } from 'next/server'
import { basicAuthPasses } from '@/lib/admin/basic-auth'
import { env } from '@/lib/env'
import { log } from '@/lib/log'

// The door to /admin (ADR 0045): HTTP Basic authentication, OWNER_EMAIL as the name and
// ADMIN_PASSWORD as the password, which the browser asks for once and sends with every request
// after. With no password set the route does not exist, so a deployment that never chose one shows
// nothing. Only /admin and what is under it are matched; no other route passes through here.
// Neither the name nor the password reaches the log: a request that carried credentials and was
// still refused is counted, and the browser's first request, which carries none and earns the
// prompt, is not. The page checks the same header again before it reads a row, so a matcher that
// drifted would still show nothing.
export function proxy(request: NextRequest): NextResponse {
  const password = env.ADMIN_PASSWORD
  if (password === undefined) return new NextResponse(null, { status: 404 })
  const authorization = request.headers.get('authorization')
  if (basicAuthPasses(authorization, { name: env.OWNER_EMAIL, password })) {
    return NextResponse.next()
  }
  if (authorization !== null) log.warn('admin.refused', { path: request.nextUrl.pathname })
  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="PinnaclePX admin", charset="UTF-8"' },
  })
}

export const config = { matcher: '/admin/:path*' }
