import type { Credentials } from '@/lib/admin/basic-auth'
import { env } from '@/lib/env'

// The owner's credentials for /admin, or null while either is unset, when the route does not
// exist. Read here by the proxy and by the page, so the two can never disagree on what counts.
export function adminCredentials(): Credentials | null {
  const { ADMIN_USERNAME: name, ADMIN_PASSWORD: password } = env
  return name === undefined || password === undefined ? null : { name, password }
}
