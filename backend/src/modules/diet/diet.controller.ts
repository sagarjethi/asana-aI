import type { Request, Response } from 'express'
import { createDietEntrySchema } from './diet.schema.js'
import { createForUser, deleteForUser, listForUser } from './diet.service.js'

export async function getMine(req: Request, res: Response) {
    const entries = await listForUser(req.user!.sub)
    res.json({ entries })
}

export async function postMine(req: Request, res: Response) {
    const input = createDietEntrySchema.parse(req.body)
    const entry = await createForUser(req.user!.sub, input)
    res.status(201).json({ entry })
}

export async function deleteMine(req: Request, res: Response) {
    await deleteForUser(req.user!.sub, req.params.id)
    res.json({ ok: true })
}
