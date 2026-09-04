import 'server-only'
import Anthropic from '@anthropic-ai/sdk'
import { env } from '@/lib/env'

// The one Anthropic client. Every call sets its own timeout from CONFIG.stageBudgetMs, because a
// stage has a budget and the sweeper, not the model, decides what happens when it runs out. An
// identity-linked key must say which workspace each request acts in.
export const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
  ...(env.ANTHROPIC_WORKSPACE_ID === undefined
    ? {}
    : { defaultHeaders: { 'anthropic-workspace-id': env.ANTHROPIC_WORKSPACE_ID } }),
})
