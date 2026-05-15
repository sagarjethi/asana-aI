import { pgTable, uuid, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { users } from './users.js'

export const achievements = pgTable(
    'achievements',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        userId: uuid('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        code: text('code').notNull(),
        unlockedAt: timestamp('unlocked_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (t) => ({
        uniqUserCode: uniqueIndex('achievements_user_code_idx').on(
            t.userId,
            t.code
        ),
    })
)

export type Achievement = typeof achievements.$inferSelect
export type NewAchievement = typeof achievements.$inferInsert
