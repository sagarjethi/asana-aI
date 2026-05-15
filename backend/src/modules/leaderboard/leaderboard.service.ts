import { desc, eq, sql } from 'drizzle-orm'
import { db, schema } from '../../db/client.js'
import { LEADERBOARD } from '../../config/index.js'

export interface LeaderboardRow {
    userId: string
    totalSeconds: number
    avgAccuracy: number
    name: string | null
    avatarUrl: string | null
    country: string | null
    userPublicId: string | null
}

export async function getWeeklyBoard(): Promise<{
    config: { updatedAt: number; totalUsers: number }
    metrics: LeaderboardRow[]
}> {
    const rows = (await db
        .select({
            userId: schema.posePerformance.userId,
            totalSeconds: sql<number>`sum(${schema.posePerformance.totalSeconds})`,
            avgAccuracy: sql<number>`avg(${schema.posePerformance.avgAccuracy}::numeric)`,
            name: schema.users.name,
            avatarUrl: schema.users.avatarUrl,
            country: schema.users.country,
            userPublicId: schema.users.userPublicId,
        })
        .from(schema.posePerformance)
        .innerJoin(
            schema.users,
            eq(schema.users.id, schema.posePerformance.userId)
        )
        .groupBy(
            schema.posePerformance.userId,
            schema.users.name,
            schema.users.avatarUrl,
            schema.users.country,
            schema.users.userPublicId
        )
        .orderBy(desc(sql`sum(${schema.posePerformance.totalSeconds})`))
        .limit(LEADERBOARD.MAX_ROWS)) as LeaderboardRow[]

    return {
        config: { updatedAt: Date.now(), totalUsers: rows.length },
        metrics: rows,
    }
}
