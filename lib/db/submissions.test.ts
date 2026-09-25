import { SQL } from 'drizzle-orm'
import { PgDialect } from 'drizzle-orm/pg-core'
import { findSubmission, markStage } from '@/lib/db/submissions'

vi.mock('server-only', () => ({}))

// A stand-in for the database: each update's values are recorded, an update's returning answers
// with `updated`, and a select answers with `selected`.
const database = vi.hoisted(() => ({
  updates: [] as Record<string, unknown>[],
  updated: [] as { slug: string }[],
  selected: [] as unknown[],
}))

vi.mock('@/lib/db/client', () => ({
  db: {
    update: () => ({
      set: (values: Record<string, unknown>) => {
        database.updates.push(values)
        return {
          where: () =>
            Object.assign(Promise.resolve(), {
              returning: () => Promise.resolve(database.updated),
            }),
        }
      },
    }),
    select: () => ({ from: () => ({ where: () => Promise.resolve(database.selected) }) }),
  },
}))

const SLUG = 'k7m2p9x4w3hd'

beforeEach(() => {
  database.updates = []
  database.updated = [{ slug: SLUG }]
  database.selected = []
})

// A value markStage wrote, as the SQL Postgres receives.
function rendered(value: unknown): string {
  if (!(value instanceof SQL)) throw new Error('not an SQL expression')
  return new PgDialect().sqlToQuery(value).sql
}

describe('markStage', () => {
  it('stamps a stage with the database clock as it settles, and the build end in the same statement', async () => {
    const copy = { 't01-aurora': { hero: { headline: 'Physio in Sheffield' } } }
    expect(await markStage(SLUG, 'copy', 'done', { copy })).toBe(true)
    expect(database.updates).toHaveLength(1)
    const [stage] = database.updates
    expect(stage).toMatchObject({ stageCopy: 'done', copy })
    expect(rendered(stage?.stageCopyAt)).toBe('now()')
    expect(rendered(stage?.settledAt)).toMatch(/^case when .* then now\(\) else .* end$/)
  })

  // A retried step reads a committed stage as settled and skips its work, so no second statement
  // may fail after the first has committed.
  it('ends the build only when every other stage has settled and no end is recorded', async () => {
    await markStage(SLUG, 'imagery', 'fallback')
    const end = rendered(database.updates[0]?.settledAt)
    expect(end).toContain('"settled_at" is null')
    for (const other of ['stage_select', 'stage_tokens', 'stage_brief', 'stage_copy']) {
      expect(end).toContain(`"${other}" not in`)
    }
    expect(end).not.toContain('"stage_imagery"')
  })

  it('stamps a fallback or a failure as it settles too', async () => {
    await markStage(SLUG, 'select', 'failed')
    expect(database.updates).toHaveLength(1)
    expect(rendered(database.updates[0]?.stageSelectAt)).toBe('now()')
    expect(database.updates[0]?.settledAt).toBeInstanceOf(SQL)
  })

  it('stamps nothing while a stage runs', async () => {
    expect(await markStage(SLUG, 'imagery', 'running')).toBe(true)
    expect(database.updates).toEqual([{ stageImagery: 'running' }])
  })

  it('answers false when the stage had already settled', async () => {
    database.updated = []
    expect(await markStage(SLUG, 'brief', 'fallback')).toBe(false)
    expect(database.updates).toHaveLength(1)
  })
})

describe('findSubmission', () => {
  it('returns the submission these answers already made, or null', async () => {
    const existing = {
      slug: SLUG,
      deadlineAt: new Date('2026-09-24T12:05:00Z'),
      conceptCount: 3,
      eventSentAt: new Date('2026-09-24T12:00:01Z'),
    }
    database.selected = [existing]
    expect(await findSubmission('hash')).toEqual(existing)
    database.selected = []
    expect(await findSubmission('hash')).toBeNull()
  })
})
