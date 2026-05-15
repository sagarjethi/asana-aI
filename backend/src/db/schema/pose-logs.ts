import { pgTable, uuid, text, timestamp, integer, numeric } from 'drizzle-orm/pg-core'
import { users } from './users.js'

export const poseLogs = pgTable('pose_logs', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    poseId: text('pose_id').notNull(),
    accuracy: numeric('accuracy'),
    durationMs: integer('duration_ms').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true })
        .defaultNow()
        .notNull(),
})

export type PoseLog = typeof poseLogs.$inferSelect
export type NewPoseLog = typeof poseLogs.$inferInsert
