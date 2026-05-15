import { pgTable, uuid, text, timestamp, integer } from 'drizzle-orm/pg-core'
import { users } from './users.js'

export const dietEntries = pgTable('diet_entries', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    mealId: text('meal_id').notNull(),
    calories: integer('calories'),
    takenAt: timestamp('taken_at', { withTimezone: true })
        .defaultNow()
        .notNull(),
    notes: text('notes'),
})

export type DietEntry = typeof dietEntries.$inferSelect
export type NewDietEntry = typeof dietEntries.$inferInsert
