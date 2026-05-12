import { Router } from 'express'
import { z } from 'zod'
import { and, eq, sql } from 'drizzle-orm'
import { db, schema } from '../db/client.js'
import { requireAuth } from '../auth/middleware.js'

export const poses = Router()

const logSchema = z.object({
    poseId: z.string().min(1),
    accuracy: z.number().min(0).max(1),
    durationMs: z.number().int().nonnegative(),
})

function currentWeekStartISO() {
    const d = new Date()
    d.setUTCDate(d.getUTCDate() - d.getUTCDay())
    return d.toISOString().slice(0, 10)
}

poses.post('/log', requireAuth, async (req, res) => {
    const parsed = logSchema.safeParse(req.body)
    if (!parsed.success)
        return res
            .status(400)
            .json({ error: 'invalid_body', issues: parsed.error.issues })
    const { poseId, accuracy, durationMs } = parsed.data
    const userId = req.user!.sub
    await db.insert(schema.poseLogs).values({
        userId,
        poseId,
        accuracy: accuracy.toString(),
        durationMs,
    })

    const weekStart = currentWeekStartISO()
    const seconds = Math.floor(durationMs / 1000)
    // Upsert pose_performance
    const existing = await db
        .select()
        .from(schema.posePerformance)
        .where(
            and(
                eq(schema.posePerformance.userId, userId),
                eq(schema.posePerformance.weekStart, weekStart),
                eq(schema.posePerformance.poseId, poseId)
            )
        )
    if (existing.length === 0) {
        await db.insert(schema.posePerformance).values({
            userId,
            weekStart,
            poseId,
            totalSeconds: seconds,
            avgAccuracy: accuracy.toString(),
        })
    } else {
        const cur = existing[0]
        const newTotal = (cur.totalSeconds ?? 0) + seconds
        const prev = Number(cur.avgAccuracy ?? '0')
        const blended = newTotal > 0
            ? (prev * (cur.totalSeconds ?? 0) + accuracy * seconds) / newTotal
            : accuracy
        await db
            .update(schema.posePerformance)
            .set({
                totalSeconds: newTotal,
                avgAccuracy: blended.toString(),
            })
            .where(eq(schema.posePerformance.id, cur.id))
    }
    res.status(201).json({ ok: true })
})

poses.get('/catalog', (_req, res) => {
    res.json({
        poses: [
            { id: 'tadasana', name: 'Tadasana', difficulty: 'beginner' },
            { id: 'vrikshasana', name: 'Vrikshasana', difficulty: 'beginner' },
            {
                id: 'adhomukha',
                name: 'Adho Mukha Svanasana',
                difficulty: 'intermediate',
            },
        ],
    })
})

void sql // keep import
