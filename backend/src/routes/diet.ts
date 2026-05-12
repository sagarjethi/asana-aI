import { Router } from 'express'
import { z } from 'zod'
import { and, desc, eq } from 'drizzle-orm'
import { db, schema } from '../db/client.js'
import { requireAuth } from '../auth/middleware.js'

export const diet = Router()

diet.get('/me', requireAuth, async (req, res) => {
    const rows = await db
        .select()
        .from(schema.dietEntries)
        .where(eq(schema.dietEntries.userId, req.user!.sub))
        .orderBy(desc(schema.dietEntries.takenAt))
    res.json({ entries: rows })
})

diet.post('/me', requireAuth, async (req, res) => {
    const parsed = z
        .object({
            mealId: z.string(),
            calories: z.number().int().optional(),
            notes: z.string().optional(),
        })
        .safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'invalid_body' })
    const [row] = await db
        .insert(schema.dietEntries)
        .values({ ...parsed.data, userId: req.user!.sub })
        .returning()
    res.status(201).json({ entry: row })
})

diet.delete('/me/:id', requireAuth, async (req, res) => {
    await db
        .delete(schema.dietEntries)
        .where(
            and(
                eq(schema.dietEntries.id, req.params.id),
                eq(schema.dietEntries.userId, req.user!.sub)
            )
        )
    res.json({ ok: true })
})
