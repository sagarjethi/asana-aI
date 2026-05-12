import { Router } from 'express'
import { z } from 'zod'

export const pose = Router()

const poseLogSchema = z.object({
    userId: z.string().min(1),
    poseId: z.string().min(1),
    accuracy: z.number().min(0).max(1),
    durationMs: z.number().int().nonnegative(),
})

pose.post('/log', (req, res) => {
    const parsed = poseLogSchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({ error: 'invalid_body', issues: parsed.error.issues })
    }
    // TODO: persist to your DB of choice (RDS, Dynamo, Supabase, etc.)
    return res.status(202).json({ ok: true })
})

pose.get('/catalog', (_req, res) => {
    res.json({
        poses: [
            { id: 'tadasana', name: 'Tadasana', difficulty: 'beginner' },
            { id: 'vrikshasana', name: 'Vrikshasana', difficulty: 'beginner' },
            { id: 'adhomukha', name: 'Adho Mukha Svanasana', difficulty: 'intermediate' },
        ],
    })
})
