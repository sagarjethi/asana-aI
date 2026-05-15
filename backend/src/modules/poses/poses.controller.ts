import type { Request, Response } from 'express'
import { logPoseSchema } from './poses.schema.js'
import { getCatalog, logPose } from './poses.service.js'

export async function postLog(req: Request, res: Response) {
    const input = logPoseSchema.parse(req.body)
    await logPose(req.user!.sub, input)
    res.status(201).json({ ok: true })
}

export function getCatalogHandler(_req: Request, res: Response) {
    res.json(getCatalog())
}
