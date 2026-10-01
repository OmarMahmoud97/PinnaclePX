import { SQL } from 'drizzle-orm'
import { PgDialect } from 'drizzle-orm/pg-core'
import { expiredSlugs } from '@/lib/db/retention'

vi.mock('server-only', () => ({}))

// A stand-in for the database that keeps the condition each select was given.
const database = vi.hoisted(() => ({ wheres: [] as unknown[], selected: [] as unknown[] }))

vi.mock('@/lib/db/client', () => ({
  db: {
    select: () => ({
      from: () => ({
        where: (condition: unknown) => {
          database.wheres.push(condition)
          return Promise.resolve(database.selected)
        },
      }),
    }),
  },
}))

function rendered(value: unknown): string {
  if (!(value instanceof SQL)) throw new Error('not an SQL expression')
  return new PgDialect().sqlToQuery(value).sql
}

beforeEach(() => {
  database.wheres = []
  database.selected = [{ slug: 'k7m2p9x4w3hd' }]
})

describe('expiredSlugs', () => {
  it('takes briefs older than the window unless the person stands at won or booked, recently', async () => {
    const before = new Date('2026-09-02T03:00:00Z')
    const keptAfter = new Date('2026-04-05T03:00:00Z')
    expect(await expiredSlugs(before, keptAfter)).toEqual(['k7m2p9x4w3hd'])
    const where = rendered(database.wheres[0])
    expect(where).toContain('"submission"."created_at" <')
    expect(where).toContain('not exists (')
    expect(where).toContain('"enquiry"."identity_hash" = "submission"."identity_hash"')
    expect(where).toContain('"enquiry"."stage" = ')
    expect(where).toContain('"enquiry"."stage_at" >')
    expect(where).toContain('"enquiry"."call_state" = ')
    expect(where).toContain('"enquiry"."call_at" >')
  })
})
