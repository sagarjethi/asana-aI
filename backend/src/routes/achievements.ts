import { Router } from 'express'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db, schema } from '../db/client.js'
import { requireAuth } from '../auth/middleware.js'

export const achievements = Router()

achievements.get('/me', requireAuth, async (req, res) => {
    const rows = await db
        .select()
        .from(schema.achievements)
        .where(eq(schema.achievements.userId, req.user!.sub))
    res.json({ achievements: rows })
})

achievements.post('/unlock', requireAuth, async (req, res) => {
    const parsed = z.object({ code: z.string() }).safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'invalid_body' })
    try {
        const [row] = await db
            .insert(schema.achievements)
            .values({ userId: req.user!.sub, code: parsed.data.code })
            .onConflictDoNothing()
            .returning()
        res.json({ achievement: row ?? null, alreadyUnlocked: !row })
    } catch (e) {
        res.status(500).json({ error: 'unlock_failed' })
    }
})
