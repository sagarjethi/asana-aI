import type { Request, Response } from 'express'
import { NotFoundError } from '../../common/errors/index.js'
import { updateMeSchema } from './users.schema.js'
import { findById, updateMe } from './users.service.js'

export async function getById(req: Request, res: Response) {
    const u = await findById(req.params.id)
    if (!u) throw new NotFoundError('user_not_found')
    res.json(u)
}

export async function patchMe(req: Request, res: Response) {
    const patch = updateMeSchema.parse(req.body)
    const u = await updateMe(req.user!.sub, patch)
    res.json({ user: u })
}
