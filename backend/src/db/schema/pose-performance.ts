import {
    pgTable,
    uuid,
    text,
    integer,
    numeric,
    date,
    uniqueIndex,
} from 'drizzle-orm/pg-core'
import { users } from './users.js'

export const posePerformance = pgTable(
    'pose_performance',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        userId: uuid('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        weekStart: date('week_start').notNull(),
        poseId: text('pose_id').notNull(),
        totalSeconds: integer('total_seconds').notNull().default(0),
        avgAccuracy: numeric('avg_accuracy'),
    },
    (t) => ({
        uniqUserWeekPose: uniqueIndex('pose_perf_user_week_pose_idx').on(
            t.userId,
            t.weekStart,
            t.poseId
        ),
    })
)

export type PosePerformance = typeof posePerformance.$inferSelect
export type NewPosePerformance = typeof posePerformance.$inferInsert
