import { Router } from 'express'
import { desc, eq, sql } from 'drizzle-orm'
import { db, schema } from '../db/client.js'

export const leaderboard = Router()

leaderboard.get('/', async (req, res) => {
    // Aggregate per-user totals for "week" range (currently the only range)
    const rows = await db
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
        .limit(100)

    res.json({
        config: {
            updatedAt: Date.now(),
            totalUsers: rows.length,
        },
        metrics: rows,
    })
})
