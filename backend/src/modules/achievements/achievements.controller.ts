import type { Request, Response } from 'express'
import { unlockSchema } from './achievements.schema.js'
import { listForUser, unlock } from './achievements.service.js'

export async function getMine(req: Request, res: Response) {
    const achievements = await listForUser(req.user!.sub)
    res.json({ achievements })
}

export async function postUnlock(req: Request, res: Response) {
    const { code } = unlockSchema.parse(req.body)
    const result = await unlock(req.user!.sub, code)
    res.json(result)
}
