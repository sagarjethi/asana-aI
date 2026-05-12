import { Router } from 'express'

export const health = Router()

health.get('/', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'asanaai-backend',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    })
})
