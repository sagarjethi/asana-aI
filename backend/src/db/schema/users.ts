import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'

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

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
