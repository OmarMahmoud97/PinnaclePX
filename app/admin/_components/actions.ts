'use server'

import { refresh } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import * as z from 'zod'
import { basicAuthPasses } from '@/lib/admin/basic-auth'
import { adminCredentials } from '@/lib/admin/credentials'
import { fromLondonLocal } from '@/lib/brief/time'
import { CONFIG } from '@/lib/config'
import {
  deleteUnmatchedCall,
  identityOfSlug,
  saveNote,
  setNoShow,
  setOwnerBooking,
  setStage,
  unbook,
  unopen,
} from '@/lib/db/enquiries'
import { err, ok, type Result } from '@/lib/errors'
import { slugSchema } from '@/lib/identity/slug'
import { log } from '@/lib/log'

// Why a mark did not land (ADR 0047): the header no longer carries the owner, the brief has been
// swept, the form was not what the page sends, or a write failed. The form prints each one.
type AdminRefusal = 'forbidden' | 'gone' | 'rejected' | 'retry'

export type StandingResult = Result<null, AdminRefusal>

// Every button on the standing panel, as the value of the one submit name. Each records what the
// visitor did or undoes a mark; none reaches out to anyone.
const INTENTS = ['quoted', 'won', 'lost', 'note', 'book', 'unbook', 'no_show', 'unopen'] as const

type Intent = (typeof INTENTS)[number]

// Whole pounds or nothing; the field is prefilled with the printed price and may be emptied.
const pounds = z
  .string()
  .trim()
  .default('')
  .transform((value, context) => {
    if (value === '') return null
    const amount = Number(value)
    if (!Number.isInteger(amount) || amount < 0 || amount > CONFIG.admin.quoteMaxPounds) {
      context.addIssue({ code: 'custom', message: 'Not a quote in whole pounds' })
      return z.NEVER
    }
    return amount
  })

// A datetime-local value in London time, or nothing. Malformed is refused rather than guessed.
const londonMoment = z
  .string()
  .trim()
  .default('')
  .transform((value, context) => {
    if (value === '') return null
    const moment = fromLondonLocal(value)
    if (moment === null) {
      context.addIssue({ code: 'custom', message: 'Not a London time' })
      return z.NEVER
    }
    return moment
  })

const formSchema = z.object({
  slug: slugSchema,
  intent: z.enum(INTENTS),
  quotePounds: pounds,
  startsAt: londonMoment,
  note: z
    .string()
    .max(CONFIG.admin.noteMaxChars)
    .default('')
    .transform((value) => value.replace(/\r\n/g, '\n').trim()),
})

type Marks = z.infer<typeof formSchema>

// The one write a button asks for, after the note. Each is a single statement in lib/db.
async function apply(marks: Marks, identity: string): Promise<void> {
  const { intent, slug } = marks
  switch (intent) {
    case 'quoted':
    case 'won':
    case 'lost':
      return setStage(identity, intent, marks.quotePounds)
    case 'note':
      return
    case 'book':
      await setOwnerBooking(identity, marks.startsAt, CONFIG.call.minutes)
      if (marks.startsAt !== null) await deleteUnmatchedCall(marks.startsAt)
      return
    case 'unbook':
      return unbook(identity)
    case 'no_show':
      return setNoShow(identity)
    case 'unopen':
      await unopen(slug)
      return
  }
}

// The standing panel's one action (ADR 0047): the whole form arrives with every button, so a
// typed note is never lost by tapping Won. The door is checked here as well as in the proxy, since
// a Server Function must verify for itself. Then: the form parsed as what the page sends, the
// person behind the slug (gone once the sweep has run), the note saved first when it differs,
// the intent's one statement, and the route refreshed so the page shows what is now stored.
// "Mark as new" instead sends the owner back to the inbox: the brief page stamps itself opened
// on every render, so refreshing it would undo the tap at once. Never throws to the client; a
// failed write is a word on the page and a line in the log, with the intent and nothing about
// the person. Takes the previous state first, as useActionState calls it.
export async function setStanding(_previous: unknown, input: unknown): Promise<StandingResult> {
  const owner = adminCredentials()
  const authorization = (await headers()).get('authorization')
  if (owner === null || !basicAuthPasses(authorization, owner)) {
    log.warn('admin.refused', { action: 'setStanding' })
    return err('forbidden')
  }
  if (!(input instanceof FormData)) return err('rejected')
  const parsed = formSchema.safeParse(Object.fromEntries(input))
  if (!parsed.success) {
    log.warn('admin.rejected', { issues: parsed.error.issues.length })
    return err('rejected')
  }
  const marks = parsed.data
  let intent: Intent = marks.intent
  try {
    const identity = await identityOfSlug(marks.slug)
    if (identity === null) return err('gone')
    await saveNote(identity, marks.note)
    intent = marks.intent
    await apply(marks, identity)
  } catch (error) {
    log.error('admin.failed', { intent, reason: error instanceof Error ? error.name : 'unknown' })
    return err('retry')
  }
  // Outside the try: a redirect is thrown, and must not be read as a failed write.
  if (intent === 'unopen') redirect('/admin')
  refresh()
  return ok(null)
}
