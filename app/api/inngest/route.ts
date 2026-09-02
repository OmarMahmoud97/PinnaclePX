import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest/client'

// Pipeline functions register here, one per file under lib/inngest/functions/.
export const { GET, POST, PUT } = serve({ client: inngest, functions: [] })
