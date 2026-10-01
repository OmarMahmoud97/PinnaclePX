import { SQL } from 'drizzle-orm'
import { PgDialect } from 'drizzle-orm/pg-core'
import {
  addUnmatchedCall,
  cancelCalBooking,
  deleteUnmatchedCallsBefore,
  leadExists,
  recordCalBooking,
} from '@/lib/db/calls'
import { enquiry, lead, unmatchedCall } from '@/lib/db/schema'

vi.mock('server-only', () => ({}))

// What onConflictDoUpdate is given.
type Upsert = { target: unknown; set: Record<string, unknown>; setWhere?: unknown }

type Statement = {
  kind: 'select' | 'insert' | 'update' | 'delete'
  table: unknown
  values?: Record<string, unknown>
  conflict?: Upsert | 'do nothing'
  set?: Record<string, unknown>
  where?: unknown
  returning?: unknown
  limit?: number
}

// A stand-in for the database: the parts of every statement are kept as the builder is given
// them, and each kind answers with the rows set for it.
const database = vi.hoisted(() => ({
  statements: [] as Statement[],
  selected: [] as unknown[],
  updated: [] as unknown[],
  deleted: [] as unknown[],
  inserted: [] as unknown[],
}))

vi.mock('@/lib/db/client', () => {
  const keep = (statement: Statement) => database.statements.push(statement)
  return {
    db: {
      select: () => ({
        from: (table: unknown) => ({
          where: (where: unknown) => ({
            limit: (limit: number) => {
              keep({ kind: 'select', table, where, limit })
              return Promise.resolve(database.selected)
            },
          }),
        }),
      }),
      insert: (table: unknown) => ({
        values: (values: Record<string, unknown>) => ({
          onConflictDoUpdate: (conflict: Upsert) => {
            const statement: Statement = { kind: 'insert', table, values, conflict }
            keep(statement)
            return Object.assign(Promise.resolve(), {
              returning: (returning: unknown) => {
                statement.returning = returning
                return Promise.resolve(database.inserted)
              },
            })
          },
          onConflictDoNothing: () => {
            keep({ kind: 'insert', table, values, conflict: 'do nothing' })
            return Promise.resolve()
          },
        }),
      }),
      update: (table: unknown) => ({
        set: (set: Record<string, unknown>) => ({
          where: (where: unknown) => ({
            returning: (returning: unknown) => {
              keep({ kind: 'update', table, set, where, returning })
              return Promise.resolve(database.updated)
            },
          }),
        }),
      }),
      delete: (table: unknown) => ({
        where: (where: unknown) => ({
          returning: (returning: unknown) => {
            keep({ kind: 'delete', table, where, returning })
            return Promise.resolve(database.deleted)
          },
        }),
      }),
    },
  }
})

const IDENTITY = 'f'.repeat(64)
const UID_HASH = 'a'.repeat(64)
const CREATED_AT = new Date('2026-10-02T09:15:30.123Z')
const BOOKING = {
  uidHash: UID_HASH,
  startsAt: new Date('2026-10-06T10:00:00Z'),
  endsAt: new Date('2026-10-06T10:20:00Z'),
  createdAt: CREATED_AT,
}

beforeEach(() => {
  database.statements = []
  database.selected = []
  database.updated = []
  database.deleted = []
  database.inserted = []
})

// An expression as Postgres receives it: its text and its bound values.
function query(value: unknown): { sql: string; params: unknown[] } {
  if (!(value instanceof SQL)) throw new Error('not an SQL expression')
  const { sql, params } = new PgDialect().sqlToQuery(value)
  return { sql, params }
}

// The one statement a call made.
function only(): Statement {
  expect(database.statements).toHaveLength(1)
  const [statement] = database.statements
  if (statement === undefined) throw new Error('no statement')
  return statement
}

function upsertOf(statement: Statement): Upsert {
  if (statement.conflict === undefined || statement.conflict === 'do nothing') {
    throw new Error('not an upsert')
  }
  return statement.conflict
}

describe('recordCalBooking', () => {
  it("inserts the booking as the person's enquiry row, or writes it over the call their row holds, in one statement", async () => {
    await recordCalBooking(IDENTITY, BOOKING)
    const statement = only()
    expect(statement.kind).toBe('insert')
    expect(statement.table).toBe(enquiry)
    expect(statement.values).toEqual({
      identityHash: IDENTITY,
      callState: 'booked',
      callSource: 'cal',
      callUidHash: UID_HASH,
      callStartsAt: BOOKING.startsAt,
      callEndsAt: BOOKING.endsAt,
      callAt: CREATED_AT,
    })
    const upsert = upsertOf(statement)
    expect(upsert.target).toBe(enquiry.identityHash)
    // The call columns and the stamp; the stage, the quote and the note are never touched.
    expect(Object.keys(upsert.set).sort()).toEqual([
      'callAt',
      'callEndsAt',
      'callSource',
      'callStartsAt',
      'callState',
      'callUidHash',
      'updatedAt',
    ])
    expect(upsert.set).toMatchObject({ callState: 'booked', callSource: 'cal' })
    expect(query(upsert.set.callUidHash).sql).toBe('excluded."call_uid_hash"')
    expect(query(upsert.set.callStartsAt).sql).toBe('excluded."call_starts_at"')
    expect(query(upsert.set.callEndsAt).sql).toBe('excluded."call_ends_at"')
    expect(query(upsert.set.callAt).sql).toBe('excluded."call_at"')
    expect(query(upsert.set.updatedAt).sql).toBe('now()')
  })

  // The guard lives in the statement, since neon-http has no transaction to put it in: a
  // replayed event, one older than the owner's own mark, and a created event arriving after its
  // own cancellation all change nothing. Null is read as "no booking yet" on both sides, so a
  // row the owner made with a stage alone takes the booking.
  it('updates only when the event is newer than what the row holds, and never a booking the row holds as cancelled', async () => {
    await recordCalBooking(IDENTITY, BOOKING)
    const { sql, params } = query(upsertOf(only()).setWhere)
    expect(sql).toBe(
      '("enquiry"."call_at" is null or "enquiry"."call_at" < excluded."call_at") and ("enquiry"."call_uid_hash" is distinct from excluded."call_uid_hash" or "enquiry"."call_state" is distinct from $1)',
    )
    expect(params).toEqual(['cancelled'])
  })
})

describe('cancelCalBooking', () => {
  it('records the cancellation by its uid as an upsert, changing a row only while it stands as booked', async () => {
    database.inserted = [{ identityHash: IDENTITY }]
    expect(await cancelCalBooking(IDENTITY, UID_HASH, CREATED_AT)).toBe(true)
    const statement = only()
    expect(statement.kind).toBe('insert')
    expect(statement.table).toBe(enquiry)
    expect(statement.values).toMatchObject({
      identityHash: IDENTITY,
      callState: 'cancelled',
      callSource: 'cal',
      callUidHash: UID_HASH,
      callAt: CREATED_AT,
    })
    const conflict = statement.conflict as Upsert
    expect(conflict.target).toBe(enquiry.identityHash)
    expect(Object.keys(conflict.set).sort()).toEqual(['callAt', 'callState', 'updatedAt'])
    expect(conflict.set).toMatchObject({ callState: 'cancelled', callAt: CREATED_AT })
    expect(query(conflict.set.updatedAt).sql).toBe('now()')
    expect(query(conflict.setWhere)).toEqual({
      sql: '("enquiry"."call_uid_hash" = $1 and "enquiry"."call_state" = $2)',
      params: [UID_HASH, 'booked'],
    })
    expect(statement.returning).toEqual({ identityHash: enquiry.identityHash })
  })

  it('answers false when no row was written, as for a cancellation of another uid', async () => {
    expect(await cancelCalBooking(IDENTITY, UID_HASH, CREATED_AT)).toBe(false)
    expect(database.statements).toHaveLength(1)
  })
})

describe('leadExists', () => {
  it('asks for one row of the lead with that identity, and answers whether there was one', async () => {
    database.selected = [{ identityHash: IDENTITY }]
    expect(await leadExists(IDENTITY)).toBe(true)
    const statement = only()
    expect(statement.kind).toBe('select')
    expect(statement.table).toBe(lead)
    expect(query(statement.where)).toEqual({ sql: '"lead"."identity_hash" = $1', params: [IDENTITY] })
    expect(statement.limit).toBe(1)
    database.selected = []
    expect(await leadExists(IDENTITY)).toBe(false)
  })
})

describe('addUnmatchedCall', () => {
  it('keeps the start alone, once', async () => {
    await addUnmatchedCall(BOOKING.startsAt)
    const statement = only()
    expect(statement.kind).toBe('insert')
    expect(statement.table).toBe(unmatchedCall)
    expect(statement.values).toEqual({ startsAt: BOOKING.startsAt })
    expect(statement.conflict).toBe('do nothing')
  })
})

describe('deleteUnmatchedCallsBefore', () => {
  it('removes the calls that started before the moment, and counts them', async () => {
    database.deleted = [{ id: 1 }, { id: 2 }]
    const moment = new Date('2026-10-02T09:00:00Z')
    expect(await deleteUnmatchedCallsBefore(moment)).toBe(2)
    const statement = only()
    expect(statement.kind).toBe('delete')
    expect(statement.table).toBe(unmatchedCall)
    expect(query(statement.where)).toEqual({
      sql: '"unmatched_call"."starts_at" < $1',
      params: [moment.toISOString()],
    })
    expect(statement.returning).toEqual({ id: unmatchedCall.id })
  })
})
