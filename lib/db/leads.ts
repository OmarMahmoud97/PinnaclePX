import 'server-only'
import { db } from '@/lib/db/client'
import { lead } from '@/lib/db/schema'

type LeadInput = Readonly<{ identityHash: string; email: string; name: string; company: string }>

// One row per identity. A returning visitor's latest name, company and spelling of the address
// replace the last.
export async function upsertLead(input: LeadInput): Promise<void> {
  await db
    .insert(lead)
    .values(input)
    .onConflictDoUpdate({
      target: lead.identityHash,
      set: { email: input.email, name: input.name, company: input.company, updatedAt: new Date() },
    })
}
