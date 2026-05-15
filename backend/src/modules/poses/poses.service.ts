import { and, eq } from 'drizzle-orm'
import { db, schema } from '../../db/client.js'
import { SECONDS_PER_MS } from '../../config/index.js'
import type { LogPoseInput } from './poses.schema.js'
import { POSE_CATALOG } from './poses.constants.js'

/** Sunday-based UTC week start as `YYYY-MM-DD`. */
export function currentWeekStartISO(now = new Date()): string {
    const d = new Date(now)
    d.setUTCDate(d.getUTCDate() - d.getUTCDay())
    return d.toISOString().slice(0, 10)
}

export async function logPose(userId: string, input: LogPoseInput) {
    const { poseId, accuracy, durationMs } = input
    const seconds = Math.floor(durationMs * SECONDS_PER_MS)
    const weekStart = currentWeekStartISO()

    // Raw log first — append-only history.
    await db.insert(schema.poseLogs).values({
        userId,
        poseId,
        accuracy: accuracy.toString(),
        durationMs,
    })

    // Upsert weekly aggregate with a duration-weighted accuracy.
    const [existing] = await db
        .select()
        .from(schema.posePerformance)
        .where(
            and(
                eq(schema.posePerformance.userId, userId),
                eq(schema.posePerformance.weekStart, weekStart),
                eq(schema.posePerformance.poseId, poseId)
            )
        )

    if (!existing) {
        await db.insert(schema.posePerformance).values({
            userId,
            weekStart,
            poseId,
            totalSeconds: seconds,
            avgAccuracy: accuracy.toString(),
        })
        return
    }

    const prevSeconds = existing.totalSeconds ?? 0
    const newTotal = prevSeconds + seconds
    const prevAcc = Number(existing.avgAccuracy ?? '0')
    const blended =
        newTotal > 0
            ? (prevAcc * prevSeconds + accuracy * seconds) / newTotal
            : accuracy

    await db
        .update(schema.posePerformance)
        .set({ totalSeconds: newTotal, avgAccuracy: blended.toString() })
        .where(eq(schema.posePerformance.id, existing.id))
}

export function getCatalog() {
    return { poses: POSE_CATALOG }
}
