import {
    pgTable,
    uuid,
    text,
    timestamp,
    integer,
    numeric,
    date,
    uniqueIndex,
} from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    name: text('name'),
    avatarUrl: text('avatar_url'),
    githubUrl: text('github_url'),
    country: text('country'),
    profileType: text('profile_type').default('public'),
    userPublicId: text('user_public_id'),
    createdAt: timestamp('created_at', { withTimezone: true })
        .defaultNow()
        .notNull(),
})

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
