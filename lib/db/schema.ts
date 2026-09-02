import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

// Starting point only. Extend as the brief and pipeline shape settle.
export const briefs = pgTable('briefs', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
