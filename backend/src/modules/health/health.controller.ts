import type { Request, Response } from 'express'
import { sql } from 'drizzle-orm'
import { db } from '../../db/client.js'
import { APP } from '../../config/index.js'

export function getLiveness(_req: Request, res: Response) {
    res.json({
        status: 'ok',
        service: APP.NAME,
        version: APP.VERSION,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    })
}

export async function getReadiness(_req: Request, res: Response) {
    try {
        await db.execute(sql`select 1`)
        res.json({ status: 'ready', db: 'up' })
    } catch (err: any) {
        res.status(503).json({
            status: 'not_ready',
            db: 'down',
            error: err?.message ?? 'unknown',
        })
    }
}
