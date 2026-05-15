import { schema } from '../../db/client.js'

/**
 * Allowlist mapping the Supabase-shaped table names the frontend shim
 * still emits into Drizzle tables + column aliases. Anything not in this
 * map is rejected by the route handler.
 */
export type ColumnMap = Record<string, any>

export interface TableSpec {
    table: any
    cols: ColumnMap
}

export const ALLOWED_TABLES: Record<string, TableSpec> = {
    'user-db': {
        table: schema.users,
        cols: {
            id: schema.users.id,
            userID: schema.users.id,
            email: schema.users.email,
            name: schema.users.name,
            profile_pic: schema.users.avatarUrl,
            avatar_url: schema.users.avatarUrl,
            country: schema.users.country,
            profile_type: schema.users.profileType,
            user_public_id: schema.users.userPublicId,
            created_at: schema.users.createdAt,
        },
    },
    'pose-performance-data': {
        table: schema.posePerformance,
        cols: {
            id: schema.posePerformance.id,
            userID: schema.posePerformance.userId,
            user_id: schema.posePerformance.userId,
            poseID: schema.posePerformance.poseId,
            pose_id: schema.posePerformance.poseId,
            week_start: schema.posePerformance.weekStart,
            totalSeconds: schema.posePerformance.totalSeconds,
            duration: schema.posePerformance.totalSeconds,
            accuracy: schema.posePerformance.avgAccuracy,
        },
    },
    'pose-logs': {
        table: schema.poseLogs,
        cols: {
            id: schema.poseLogs.id,
            userID: schema.poseLogs.userId,
            user_id: schema.poseLogs.userId,
            poseID: schema.poseLogs.poseId,
            pose_id: schema.poseLogs.poseId,
            accuracy: schema.poseLogs.accuracy,
            duration_ms: schema.poseLogs.durationMs,
            created_at: schema.poseLogs.createdAt,
        },
    },
    // No physical food table — the diet UI tolerates empty arrays.
    'food-data': {
        table: null,
        cols: {},
    },
}
