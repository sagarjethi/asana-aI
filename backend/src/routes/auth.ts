import { Router } from 'express'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db, schema } from '../db/client.js'
import {
    COOKIE_NAME,
    cookieOptions,
    hashPassword,
    issueToken,
    verifyPassword,
} from '../auth/service.js'
import { requireAuth, withUser } from '../auth/middleware.js'

export const auth = Router()

const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional(),
})

function userToSession(u: typeof schema.users.$inferSelect) {
    return {
        id: u.id,
        email: u.email,
        user_metadata: { name: u.name ?? '' },
        created_at: u.createdAt.toISOString(),
    }
}

auth.post('/signup', async (req, res) => {
    const parsed = signupSchema.safeParse(req.body)
    if (!parsed.success)
        return res
            .status(400)
            .json({ error: 'invalid_body', issues: parsed.error.issues })
    const { email, password, name } = parsed.data
    const existing = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email))
    if (existing.length > 0)
        return res.status(409).json({ error: 'email_taken' })
    const passwordHash = await hashPassword(password)
    const [u] = await db
        .insert(schema.users)
        .values({ email, passwordHash, name })
        .returning()
    const token = issueToken({ sub: u.id, email: u.email })
    res.cookie(COOKIE_NAME, token, cookieOptions())
    res.json({ token, user: userToSession(u) })
})

auth.post('/login', async (req, res) => {
    const parsed = z
        .object({ email: z.string().email(), password: z.string() })
        .safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'invalid_body' })
    const { email, password } = parsed.data
    const [u] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email))
    if (!u) return res.status(401).json({ error: 'invalid_credentials' })
    const ok = await verifyPassword(password, u.passwordHash)
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' })
    const token = issueToken({ sub: u.id, email: u.email })
    res.cookie(COOKIE_NAME, token, cookieOptions())
    res.json({ token, user: userToSession(u) })
})

auth.post('/logout', (_req, res) => {
    res.clearCookie(COOKIE_NAME, { path: '/' })
    res.json({ ok: true })
})

auth.get('/session', withUser, async (req, res) => {
    if (!req.user) return res.json({ session: null, user: null })
    const [u] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, req.user.sub))
    if (!u) return res.json({ session: null, user: null })
    const user = userToSession(u)
    res.json({ session: { user, expires_at: null }, user })
})

auth.get('/user', requireAuth, async (req, res) => {
    const [u] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, req.user!.sub))
    if (!u) return res.status(404).json({ error: 'not_found' })
    res.json({ user: userToSession(u) })
})

auth.post('/exchange', (_req, res) => {
    // OAuth code exchange is deprecated post-Supabase migration.
    res.status(410).json({
        error: 'gone',
        message: 'OAuth code exchange is no longer supported.',
    })
})
