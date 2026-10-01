import { SQL } from 'drizzle-orm'
import { PgDialect } from 'drizzle-orm/pg-core'
import {
  deleteUnmatchedCall,
  identityOfSlug,
  listUnmatchedCalls,
  markOpened,
  saveNote,
  setNoShow,
  setOwnerBooking,
  setStage,
  unbook,
  unopen,
} from '@/lib/db/enquiries'
import { enquiry, submission, unmatchedCall } from '@/lib/db/schema'

vi.mock('server-only', () => ({}))

// One statement the module built: the table, what it wrote, the guard it carried, and for an
// upsert the clause that decides what a second write does.
type Conflict = { target: unknown; set: Record<string, unknown> }
type Statement = {
  kind: 'insert' | 'update' | 'delete' | 'select'
  table?: unknown
  fields?: unknown
  values?: Record<string, unknown>
  set?: Record<string, unknown>
  where?: unknown
  conflict?: Conflict
  returning?: unknown
  orderBy?: unknown
}

// A stand-in for the database: every statement is recorded as it is built, and each answers
// with `rows`, whether awaited directly or through `returning`.
const database = vi.hoisted(() => ({
  statements: [] as Statement[],
  rows: [] as unknown[],
}))

vi.mock('@/lib/db/client', () => {
  type Chain = Promise<unknown[]> & {
    from: (table: unknown) => Chain
    values: (values: Record<string, unknown>) => Chain
    set: (set: Record<string, unknown>) => Chain
    where: (where: unknown) => Chain
    onConflictDoUpdate: (conflict: Conflict) => Chain
    returning: (returning: unknown) => Chain
    orderBy: (orderBy: unknown) => Chain
  }
  const statement = (record: Statement): Chain => {
    database.statements.push(record)
    const chain: Chain = Object.assign(Promise.resolve(database.rows), {
      from: (table: unknown) => {
        record.table = table
        return chain
      },
      values: (values: Record<string, unknown>) => {
        record.values = values
        return chain
      },
      set: (set: Record<string, unknown>) => {
        record.set = set
        return chain
      },
      where: (where: unknown) => {
        record.where = where
        return chain
      },
      onConflictDoUpdate: (conflict: Conflict) => {
        record.conflict = conflict
        return chain
      },
      returning: (returning: unknown) => {
        record.returning = returning
        return chain
      },
      orderBy: (orderBy: unknown) => {
        record.orderBy = orderBy
        return chain
      },
    })
    return chain
  }
  return {
    db: {
      insert: (table: unknown) => statement({ kind: 'insert', table }),
      update: (table: unknown) => statement({ kind: 'update', table }),
      delete: (table: unknown) => statement({ kind: 'delete', table }),
      select: (fields: unknown) => statement({ kind: 'select', fields }),
    },
  }
})

const SLUG = 'k7m2p9x4w3hd'
const HASH = 'a3f9c1e7b2d4a3f9c1e7b2d4a3f9c1e7b2d4a3f9c1e7b2d4a3f9c1e7b2d4a3f9'
const START = new Date('2026-10-05T14:00:00Z')

beforeEach(() => {
  database.statements = []
  database.rows = [{ slug: SLUG }]
})

// An expression the module built, as the SQL Postgres receives and the values bound to it.
function render(value: unknown): { sql: string; params: unknown[] } {
  if (!(value instanceof SQL)) throw new Error('not an SQL expression')
  const query = new PgDialect().sqlToQuery(value)
  return { sql: query.sql, params: query.params }
}

// The one statement a call built: every function in the module is a single statement, since
// neon-http has no transactions to make two of them one.
function theStatement(): Statement {
  expect(database.statements).toHaveLength(1)
  const [statement] = database.statements
  if (statement === undefined) throw new Error('no statement was built')
  return statement
}

function upsertOf(statement: Statement): Conflict {
  if (statement.conflict === undefined) throw new Error('no on conflict clause')
  return statement.conflict
}

const BY_SLUG = { sql: '"submission"."slug" = $1', params: [SLUG] }
const BOOKED_CALL_OF_PERSON = {
  sql: '("enquiry"."identity_hash" = $1 and "enquiry"."call_state" = $2)',
  params: [HASH, 'booked'],
}

describe('markOpened', () => {
  it('stamps the brief with the database clock and answers true when the slug named a row', async () => {
    expect(await markOpened(SLUG)).toBe(true)
    const statement = theStatement()
    expect(statement.kind).toBe('update')
    expect(statement.table).toBe(submission)
    expect(Object.keys(statement.set ?? {})).toEqual(['ownerOpenedAt'])
    expect(render(statement.set?.ownerOpenedAt).sql).toBe('now()')
    expect(render(statement.where)).toEqual(BY_SLUG)
    expect(statement.returning).toEqual({ slug: submission.slug })
  })

  it('answers false when the slug names nothing', async () => {
    database.rows = []
    expect(await markOpened(SLUG)).toBe(false)
  })
})

describe('unopen', () => {
  it('clears the opened time, so the brief reads as new again', async () => {
    expect(await unopen(SLUG)).toBe(true)
    const statement = theStatement()
    expect(statement.kind).toBe('update')
    expect(statement.table).toBe(submission)
    expect(statement.set).toEqual({ ownerOpenedAt: null })
    expect(render(statement.where)).toEqual(BY_SLUG)
    expect(statement.returning).toEqual({ slug: submission.slug })
  })

  it('answers false when the slug names nothing', async () => {
    database.rows = []
    expect(await unopen(SLUG)).toBe(false)
  })
})

describe('identityOfSlug', () => {
  it('reads the identity hash of the submission, or null when the slug is gone', async () => {
    database.rows = [{ identityHash: HASH }]
    expect(await identityOfSlug(SLUG)).toBe(HASH)
    const statement = theStatement()
    expect(statement.kind).toBe('select')
    expect(statement.fields).toEqual({ identityHash: submission.identityHash })
    expect(statement.table).toBe(submission)
    expect(render(statement.where)).toEqual(BY_SLUG)
    database.rows = []
    expect(await identityOfSlug(SLUG)).toBeNull()
  })
})

describe('setStage', () => {
  it('inserts the stage, its quote and the database clock for a person with no row yet', async () => {
    await setStage(HASH, 'quoted', 4_750)
    const statement = theStatement()
    expect(statement.kind).toBe('insert')
    expect(statement.table).toBe(enquiry)
    expect(statement.values).toMatchObject({ identityHash: HASH, stage: 'quoted', quotePounds: 4_750 })
    expect(render(statement.values?.stageAt).sql).toBe('now()')
    expect(upsertOf(statement).target).toBe(enquiry.identityHash)
  })

  // Two tabs tapping Won in turn must end at open, not won, whatever each tab showed.
  it('toggles against the stored stage: the same stage goes back to open, another replaces it', async () => {
    await setStage(HASH, 'won', 4_750)
    const { set } = upsertOf(theStatement())
    expect(render(set.stage)).toEqual({
      sql: `case when "enquiry"."stage" = $1 then 'open' else $2 end`,
      params: ['won', 'won'],
    })
    expect(render(set.stageAt).sql).toBe('now()')
    expect(render(set.updatedAt).sql).toBe('now()')
    expect(Object.keys(set).sort()).toEqual(['quotePounds', 'stage', 'stageAt', 'updatedAt'])
  })

  it('writes the quote with Quoted and Won, clears it on the way back to open', async () => {
    await setStage(HASH, 'won', 4_750)
    const { set } = upsertOf(theStatement())
    expect(render(set.quotePounds)).toEqual({
      sql: `case when "enquiry"."stage" = $1 then null when $2 in ('quoted', 'won') then $3 else "enquiry"."quote_pounds" end`,
      params: ['won', 'won', 4_750],
    })
  })

  it('never writes a quote with Lost, so the one saved stays', async () => {
    await setStage(HASH, 'lost', 4_750)
    const statement = theStatement()
    expect(statement.values).toMatchObject({ stage: 'lost', quotePounds: null })
    expect(render(upsertOf(statement).set.quotePounds).params).toEqual(['lost', 'lost', null])
  })

  it('takes a stage with no figure', async () => {
    await setStage(HASH, 'quoted', null)
    const statement = theStatement()
    expect(statement.values).toMatchObject({ stage: 'quoted', quotePounds: null })
    expect(render(upsertOf(statement).set.quotePounds).params).toEqual(['quoted', 'quoted', null])
  })
})

describe('setOwnerBooking', () => {
  const BOOKING = {
    callState: 'booked',
    callSource: 'owner',
    callUidHash: null,
    callStartsAt: START,
    callEndsAt: new Date('2026-10-05T14:20:00Z'),
  }

  it('books the call by the owner, with its end from the length given, for a new row or an old one', async () => {
    await setOwnerBooking(HASH, START, 20)
    const statement = theStatement()
    expect(statement.kind).toBe('insert')
    expect(statement.table).toBe(enquiry)
    expect(statement.values).toMatchObject({ identityHash: HASH, ...BOOKING })
    expect(render(statement.values?.callAt).sql).toBe('now()')
    const { target, set } = upsertOf(statement)
    expect(target).toBe(enquiry.identityHash)
    const { callAt, updatedAt, ...columns } = set
    expect(columns).toEqual(BOOKING)
    expect(render(callAt).sql).toBe('now()')
    expect(render(updatedAt).sql).toBe('now()')
  })

  // The stage and the note are the owner's other marks; a booking must not touch them, and the
  // uid digest of a Cal.com booking it replaces must go.
  it('leaves the stage, the quote and the note alone', async () => {
    await setOwnerBooking(HASH, START, 20)
    const { set } = upsertOf(theStatement())
    expect(Object.keys(set).sort()).toEqual([
      'callAt',
      'callEndsAt',
      'callSource',
      'callStartsAt',
      'callState',
      'callUidHash',
      'updatedAt',
    ])
    expect(set.callUidHash).toBeNull()
  })

  it('books a call with no time yet, with no end either', async () => {
    await setOwnerBooking(HASH, null, 20)
    const statement = theStatement()
    expect(statement.values).toMatchObject({ callStartsAt: null, callEndsAt: null })
    expect(upsertOf(statement).set).toMatchObject({ callStartsAt: null, callEndsAt: null })
  })
})

describe('unbook', () => {
  it('cancels only a booked call, by the owner, and keeps the uid digest for a later Cal.com cancellation', async () => {
    await unbook(HASH)
    const statement = theStatement()
    expect(statement.kind).toBe('update')
    expect(statement.table).toBe(enquiry)
    const { callAt, updatedAt, ...columns } = statement.set ?? {}
    expect(columns).toEqual({ callState: 'cancelled', callSource: 'owner' })
    expect(render(callAt).sql).toBe('now()')
    expect(render(updatedAt).sql).toBe('now()')
    expect(render(statement.where)).toEqual(BOOKED_CALL_OF_PERSON)
  })
})

describe('setNoShow', () => {
  it('marks only a booked call missed, and leaves its source as it was', async () => {
    await setNoShow(HASH)
    const statement = theStatement()
    expect(statement.kind).toBe('update')
    expect(statement.table).toBe(enquiry)
    const { callAt, updatedAt, ...columns } = statement.set ?? {}
    expect(columns).toEqual({ callState: 'no_show' })
    expect(render(callAt).sql).toBe('now()')
    expect(render(updatedAt).sql).toBe('now()')
    expect(render(statement.where)).toEqual(BOOKED_CALL_OF_PERSON)
  })
})

describe('saveNote', () => {
  it('writes the note whole, and moves its time only when the words changed', async () => {
    await saveNote(HASH, 'Wants the site before the spring fair.')
    const statement = theStatement()
    expect(statement.kind).toBe('insert')
    expect(statement.table).toBe(enquiry)
    expect(statement.values).toMatchObject({
      identityHash: HASH,
      note: 'Wants the site before the spring fair.',
    })
    expect(render(statement.values?.noteAt).sql).toBe('now()')
    const { target, set } = upsertOf(statement)
    expect(target).toBe(enquiry.identityHash)
    expect(render(set.note).sql).toBe('excluded.note')
    expect(render(set.noteAt).sql).toBe(
      'case when "enquiry"."note" is distinct from excluded.note then now() else "enquiry"."note_at" end',
    )
    expect(render(set.updatedAt).sql).toBe('now()')
    expect(Object.keys(set).sort()).toEqual(['note', 'noteAt', 'updatedAt'])
  })
})

describe('deleteUnmatchedCall', () => {
  it('removes the unmatched booking with that start', async () => {
    await deleteUnmatchedCall(START)
    const statement = theStatement()
    expect(statement.kind).toBe('delete')
    expect(statement.table).toBe(unmatchedCall)
    expect(render(statement.where)).toEqual({
      sql: '"unmatched_call"."starts_at" = $1',
      params: [START.toISOString()],
    })
  })
})

describe('listUnmatchedCalls', () => {
  it('reads the starts after the moment given, soonest first', async () => {
    const later = new Date('2026-10-06T09:00:00Z')
    database.rows = [{ startsAt: START }, { startsAt: later }]
    expect(await listUnmatchedCalls(new Date('2026-10-05T13:59:00Z'))).toEqual([START, later])
    const statement = theStatement()
    expect(statement.kind).toBe('select')
    expect(statement.fields).toEqual({ startsAt: unmatchedCall.startsAt })
    expect(statement.table).toBe(unmatchedCall)
    expect(render(statement.where)).toEqual({
      sql: '"unmatched_call"."starts_at" > $1',
      params: ['2026-10-05T13:59:00.000Z'],
    })
    expect(render(statement.orderBy).sql).toBe('"unmatched_call"."starts_at" asc')
  })
})
