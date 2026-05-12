import { Router } from 'express'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db, schema } from '../db/client.js'
import { requireAuth } from '../auth/middleware.js'

export const users = Router()

users.get('/:id', async (req, res) => {
    const [u] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, req.params.id))
    if (!u) return res.status(404).json({ error: 'not_found' })
    res.json({
        id: u.id,
        name: u.name,
        avatarUrl: u.avatarUrl,
        country: u.country,
        userPublicId: u.userPublicId,
        profileType: u.profileType,
    })
})

const patchSchema = z.object({
    name: z.string().optional(),
    avatarUrl: z.string().optional(),
    country: z.string().nullable().optional(),
    profileType: z.enum(['public', 'private']).optional(),
})

users.patch('/me', requireAuth, async (req, res) => {
    const parsed = patchSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'invalid_body' })
    const [u] = await db
        .update(schema.users)
        .set(parsed.data)
        .where(eq(schema.users.id, req.user!.sub))
        .returning()
    res.json({ user: u })
})
