import type { Request, Response } from 'express'
import { passthroughSchema } from './db-passthrough.schema.js'
import { runPassthrough } from './db-passthrough.service.js'

export async function postPassthrough(req: Request, res: Response) {
    const input = passthroughSchema.parse(req.body)
    const result = await runPassthrough(input)
    res.json(result)
}
